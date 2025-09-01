package main

import (
	"context"
	"encoding/json"
	"fmt"
	"log"
	"net"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/EventStore/EventStore-Client-Go/esdb"
	"github.com/confluentinc/confluent-kafka-go/kafka"
	"github.com/librechat/event-store-service/internal/handlers"
	"github.com/librechat/event-store-service/internal/projections"
	"github.com/librechat/event-store-service/internal/snapshots"
	eventspb "github.com/librechat/microservices/shared/contracts/events"
	"github.com/redis/go-redis/v9"
	"github.com/sirupsen/logrus"
	"google.golang.org/grpc"
	"google.golang.org/grpc/reflection"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

const (
	maxConcurrentStreams = 10000
	maxConnectionIdle    = 300 * time.Second
	maxConnectionAge     = 600 * time.Second
	keepAliveTime        = 30 * time.Second
	keepAliveTimeout     = 5 * time.Second
)

type EventStoreServer struct {
	eventspb.UnimplementedEventStoreServiceServer
	eventStore    *esdb.Client
	db           *gorm.DB
	redis        *redis.Client
	kafka        *kafka.Producer
	projections  *projections.Manager
	snapshots    *snapshots.Manager
	logger       *logrus.Logger
}

func main() {
	logger := logrus.New()
	logger.SetFormatter(&logrus.JSONFormatter{})
	logger.SetLevel(logrus.InfoLevel)

	// Initialize EventStore DB connection
	eventStore, err := initializeEventStore()
	if err != nil {
		logger.Fatalf("Failed to initialize EventStore: %v", err)
	}
	defer eventStore.Close()

	// Initialize PostgreSQL for read models
	db, err := initializeDatabase()
	if err != nil {
		logger.Fatalf("Failed to initialize database: %v", err)
	}

	// Initialize Redis for caching
	redisClient := initializeRedis()
	defer redisClient.Close()

	// Initialize Kafka for event publishing
	kafkaProducer, err := initializeKafka()
	if err != nil {
		logger.Fatalf("Failed to initialize Kafka: %v", err)
	}
	defer kafkaProducer.Close()

	// Initialize projection manager
	projectionManager := projections.NewManager(eventStore, db, redisClient, logger)
	
	// Initialize snapshot manager
	snapshotManager := snapshots.NewManager(eventStore, redisClient, logger)

	// Create gRPC server
	server := &EventStoreServer{
		eventStore:  eventStore,
		db:         db,
		redis:      redisClient,
		kafka:      kafkaProducer,
		projections: projectionManager,
		snapshots:   snapshotManager,
		logger:     logger,
	}

	// Setup gRPC server with advanced options
	opts := []grpc.ServerOption{
		grpc.MaxConcurrentStreams(maxConcurrentStreams),
		grpc.ConnectionTimeout(30 * time.Second),
		grpc.KeepaliveParams(keepalive.ServerParameters{
			MaxConnectionIdle:     maxConnectionIdle,
			MaxConnectionAge:      maxConnectionAge,
			MaxConnectionAgeGrace: 5 * time.Second,
			Time:                  keepAliveTime,
			Timeout:               keepAliveTimeout,
		}),
		grpc.KeepaliveEnforcementPolicy(keepalive.EnforcementPolicy{
			MinTime:             5 * time.Second,
			PermitWithoutStream: true,
		}),
		grpc.UnaryInterceptor(server.unaryInterceptor),
		grpc.StreamInterceptor(server.streamInterceptor),
	}

	grpcServer := grpc.NewServer(opts...)
	eventspb.RegisterEventStoreServiceServer(grpcServer, server)
	reflection.Register(grpcServer)

	// Start projection manager
	go projectionManager.Start(context.Background())

	// Start snapshot manager
	go snapshotManager.Start(context.Background())

	// Start gRPC server
	listener, err := net.Listen("tcp", ":9090")
	if err != nil {
		logger.Fatalf("Failed to listen: %v", err)
	}

	go func() {
		logger.Info("Starting Event Store Service on :9090")
		if err := grpcServer.Serve(listener); err != nil {
			logger.Errorf("Failed to serve: %v", err)
		}
	}()

	// Graceful shutdown
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	logger.Info("Shutting down Event Store Service...")
	grpcServer.GracefulStop()
	projectionManager.Stop()
	snapshotManager.Stop()
	logger.Info("Event Store Service stopped gracefully")
}

func (s *EventStoreServer) SaveEvent(ctx context.Context, req *eventspb.SaveEventRequest) (*eventspb.SaveEventResponse, error) {
	s.logger.WithFields(logrus.Fields{
		"stream_id":        req.StreamId,
		"event_count":      len(req.Events),
		"expected_version": req.ExpectedVersion,
	}).Info("Saving events to stream")

	// Convert protobuf events to EventStore events
	events := make([]esdb.EventData, len(req.Events))
	eventIds := make([]string, len(req.Events))

	for i, event := range req.Events {
		data, err := json.Marshal(event.Data)
		if err != nil {
			return nil, fmt.Errorf("failed to marshal event data: %w", err)
		}

		metadata, err := json.Marshal(event.Metadata)
		if err != nil {
			return nil, fmt.Errorf("failed to marshal event metadata: %w", err)
		}

		events[i] = esdb.EventData{
			EventID:     esdb.UUIDFromString(event.EventId),
			EventType:   event.EventType,
			ContentType: esdb.ContentTypeJson,
			Data:        data,
			Metadata:    metadata,
		}
		eventIds[i] = event.EventId
	}

	// Save events to EventStore
	writeResult, err := s.eventStore.AppendToStream(
		ctx,
		req.StreamId,
		esdb.AppendToStreamOptions{
			ExpectedRevision: esdb.Revision(req.ExpectedVersion),
		},
		events...,
	)
	if err != nil {
		s.logger.WithError(err).Error("Failed to save events to EventStore")
		return nil, fmt.Errorf("failed to save events: %w", err)
	}

	// Publish events to Kafka for projections and external consumers
	go s.publishEventsToKafka(req.Events)

	return &eventspb.SaveEventResponse{
		NextExpectedVersion: int64(writeResult.NextExpectedVersion),
		EventIds:           eventIds,
	}, nil
}

func (s *EventStoreServer) LoadEvents(ctx context.Context, req *eventspb.LoadEventsRequest) (*eventspb.LoadEventsResponse, error) {
	s.logger.WithFields(logrus.Fields{
		"stream_id":    req.StreamId,
		"from_version": req.FromVersion,
		"to_version":   req.ToVersion,
		"max_count":    req.MaxCount,
	}).Info("Loading events from stream")

	// Check cache first
	cacheKey := fmt.Sprintf("events:%s:%d:%d", req.StreamId, req.FromVersion, req.ToVersion)
	cached, err := s.redis.Get(ctx, cacheKey).Result()
	if err == nil {
		var cachedEvents []*eventspb.Event
		if json.Unmarshal([]byte(cached), &cachedEvents) == nil {
			return &eventspb.LoadEventsResponse{
				Events: cachedEvents,
			}, nil
		}
	}

	// Load from EventStore
	stream, err := s.eventStore.ReadStream(
		ctx,
		req.StreamId,
		esdb.ReadStreamOptions{
			From:      esdb.Revision(req.FromVersion),
			Direction: esdb.Forwards,
		},
		uint64(req.MaxCount),
	)
	if err != nil {
		return nil, fmt.Errorf("failed to read stream: %w", err)
	}
	defer stream.Close()

	var events []*eventspb.Event
	for {
		event, err := stream.Recv()
		if err != nil {
			break
		}

		// Convert EventStore event to protobuf event
		pbEvent := &eventspb.Event{
			EventId:       event.Event.EventID.String(),
			EventType:     event.Event.EventType,
			StreamId:      req.StreamId,
			Version:       int64(event.Event.EventNumber),
			Timestamp:     timestamppb.New(event.Event.CreatedDate),
		}

		// Unmarshal data and metadata
		if err := json.Unmarshal(event.Event.Data, &pbEvent.Data); err == nil {
			events = append(events, pbEvent)
		}
	}

	// Cache the results
	if len(events) > 0 {
		cachedData, _ := json.Marshal(events)
		s.redis.Set(ctx, cacheKey, cachedData, 5*time.Minute)
	}

	return &eventspb.LoadEventsResponse{
		Events:        events,
		NextVersion:   int64(len(events)) + req.FromVersion,
		IsEndOfStream: len(events) < int(req.MaxCount),
	}, nil
}

func (s *EventStoreServer) publishEventsToKafka(events []*eventspb.Event) {
	for _, event := range events {
		// Determine Kafka topic based on event type
		topic := s.getKafkaTopicForEventType(event.EventType)
		
		// Serialize event
		eventData, err := json.Marshal(event)
		if err != nil {
			s.logger.WithError(err).Error("Failed to serialize event for Kafka")
			continue
		}

		// Publish to Kafka
		message := &kafka.Message{
			TopicPartition: kafka.TopicPartition{
				Topic:     &topic,
				Partition: kafka.PartitionAny,
			},
			Key:   []byte(event.AggregateId),
			Value: eventData,
			Headers: []kafka.Header{
				{Key: "event-type", Value: []byte(event.EventType)},
				{Key: "correlation-id", Value: []byte(event.CorrelationId)},
				{Key: "user-id", Value: []byte(event.UserId)},
			},
		}

		if err := s.kafka.Produce(message, nil); err != nil {
			s.logger.WithError(err).Error("Failed to publish event to Kafka")
		}
	}
}

func (s *EventStoreServer) getKafkaTopicForEventType(eventType string) string {
	switch {
	case contains(eventType, "User"):
		return "user-events"
	case contains(eventType, "Conversation"):
		return "conversation-events"
	case contains(eventType, "Message"):
		return "message-events"
	case contains(eventType, "AI"):
		return "ai-events"
	default:
		return "system-events"
	}
}

func initializeEventStore() (*esdb.Client, error) {
	config, err := esdb.ParseConnectionString(os.Getenv("EVENTSTORE_CONNECTION_STRING"))
	if err != nil {
		return nil, err
	}
	
	return esdb.NewClient(config)
}

func initializeDatabase() (*gorm.DB, error) {
	dsn := os.Getenv("DATABASE_URL")
	return gorm.Open(postgres.Open(dsn), &gorm.Config{
		PrepareStmt:              true,
		DisableForeignKeyConstraintWhenMigrating: true,
	})
}

func initializeRedis() *redis.Client {
	return redis.NewClient(&redis.Options{
		Addr:         os.Getenv("REDIS_ADDR"),
		Password:     os.Getenv("REDIS_PASSWORD"),
		DB:           0,
		PoolSize:     100,
		MinIdleConns: 10,
		MaxRetries:   3,
		DialTimeout:  5 * time.Second,
		ReadTimeout:  3 * time.Second,
		WriteTimeout: 3 * time.Second,
	})
}

func initializeKafka() (*kafka.Producer, error) {
	return kafka.NewProducer(&kafka.ConfigMap{
		"bootstrap.servers":   os.Getenv("KAFKA_BROKERS"),
		"security.protocol":   "SASL_SSL",
		"sasl.mechanisms":     "PLAIN",
		"sasl.username":       os.Getenv("KAFKA_USERNAME"),
		"sasl.password":       os.Getenv("KAFKA_PASSWORD"),
		"acks":               "all",
		"retries":            3,
		"batch.size":         16384,
		"linger.ms":          5,
		"compression.type":   "snappy",
		"max.in.flight.requests.per.connection": 1,
	})
}

func (s *EventStoreServer) unaryInterceptor(ctx context.Context, req interface{}, info *grpc.UnaryServerInfo, handler grpc.UnaryHandler) (interface{}, error) {
	start := time.Now()
	
	// Add request ID to context
	ctx = context.WithValue(ctx, "request_id", generateRequestID())
	
	resp, err := handler(ctx, req)
	
	// Log request
	s.logger.WithFields(logrus.Fields{
		"method":     info.FullMethod,
		"duration":   time.Since(start),
		"request_id": ctx.Value("request_id"),
		"error":      err != nil,
	}).Info("gRPC request processed")
	
	return resp, err
}

func (s *EventStoreServer) streamInterceptor(srv interface{}, ss grpc.ServerStream, info *grpc.StreamServerInfo, handler grpc.StreamHandler) error {
	start := time.Now()
	
	err := handler(srv, ss)
	
	s.logger.WithFields(logrus.Fields{
		"method":   info.FullMethod,
		"duration": time.Since(start),
		"error":    err != nil,
	}).Info("gRPC stream processed")
	
	return err
}

func generateRequestID() string {
	return fmt.Sprintf("%d-%d", time.Now().UnixNano(), os.Getpid())
}

func contains(s, substr string) bool {
	return len(s) >= len(substr) && s[:len(substr)] == substr
}