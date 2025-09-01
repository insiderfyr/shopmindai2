package main

import (
	"context"
	"fmt"
	"net"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gin-gonic/gin"
	"github.com/grpc-ecosystem/grpc-gateway/v2/runtime"
	"github.com/librechat/ai-gateway-service/config"
	"github.com/librechat/ai-gateway-service/internal/handlers"
	"github.com/librechat/ai-gateway-service/internal/middleware"
	"github.com/librechat/ai-gateway-service/internal/services"
	"github.com/librechat/ai-gateway-service/internal/storage"
	"github.com/librechat/microservices/shared/contracts/aigateway"
	"github.com/sirupsen/logrus"
	"github.com/spf13/viper"
	"go.uber.org/ratelimit"
	"google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"
	"google.golang.org/grpc/reflection"
)

var (
	log = logrus.New()
)

func main() {
	// Load configuration
	if err := config.Load(); err != nil {
		log.Fatalf("Failed to load configuration: %v", err)
	}

	// Configure logging
	configureLogging()

	// Create context for graceful shutdown
	ctx, cancel := context.WithCancel(context.Background())
	defer cancel()

	// Initialize services
	redisClient := storage.NewRedisClient()
	defer redisClient.Close()

	db := storage.NewDatabase()
	sqlDB, err := db.DB()
	if err != nil {
		log.Fatalf("Failed to get database instance: %v", err)
	}
	defer sqlDB.Close()

	// Initialize rate limiter
	rateLimiter := ratelimit.New(viper.GetInt("rate_limit.requests_per_second"))

	// Initialize AI providers
	aiProviders := services.NewAIProviders(redisClient)

	// Initialize gRPC server
	grpcServer := grpc.NewServer(
		grpc.UnaryInterceptor(middleware.GRPCUnaryInterceptor(rateLimiter)),
		grpc.StreamInterceptor(middleware.GRPCStreamInterceptor(rateLimiter)),
	)

	// Register gRPC services
	aiGatewayService := services.NewAIGatewayService(aiProviders, redisClient, db)
	aigateway.RegisterAIGatewayServiceServer(grpcServer, aiGatewayService)

	// Enable reflection for development
	reflection.Register(grpcServer)

	// Start gRPC server
	grpcPort := viper.GetString("grpc.port")
	grpcListener, err := net.Listen("tcp", ":"+grpcPort)
	if err != nil {
		log.Fatalf("Failed to listen on gRPC port %s: %v", grpcPort, err)
	}

	go func() {
		log.Infof("Starting gRPC server on port %s", grpcPort)
		if err := grpcServer.Serve(grpcListener); err != nil {
			log.Errorf("Failed to serve gRPC: %v", err)
		}
	}()

	// Start HTTP server with gRPC-Gateway
	httpPort := viper.GetString("http.port")
	
	// Create gRPC-Gateway mux
	gwmux := runtime.NewServeMux(
		runtime.WithErrorHandler(middleware.CustomErrorHandler),
		runtime.WithForwardResponseOption(middleware.AddResponseHeaders),
	)

	// Register gRPC-Gateway handlers
	opts := []grpc.DialOption{grpc.WithTransportCredentials(insecure.NewCredentials())}
	if err := aigateway.RegisterAIGatewayServiceHandlerFromEndpoint(
		ctx, gwmux, "localhost:"+grpcPort, opts,
	); err != nil {
		log.Fatalf("Failed to register gRPC-Gateway handler: %v", err)
	}

	// Create Gin router for additional HTTP endpoints
	router := gin.New()
	router.Use(
		gin.Recovery(),
		middleware.RequestID(),
		middleware.Logger(log),
		middleware.CORS(),
		middleware.RateLimit(rateLimiter),
	)

	// Health check endpoint
	router.GET("/health", handlers.HealthCheck)
	router.GET("/metrics", handlers.Metrics)

	// API routes
	api := router.Group("/api/v1")
	{
		// AI endpoints
		ai := api.Group("/ai")
		{
			ai.POST("/chat/completions", handlers.ChatCompletions)
			ai.POST("/chat/completions/stream", handlers.ChatCompletionsStream)
			ai.POST("/completions", handlers.TextCompletions)
			ai.POST("/completions/stream", handlers.TextCompletionsStream)
			ai.POST("/images/generations", handlers.CreateImage)
			ai.POST("/images/edits", handlers.CreateImageEdit)
			ai.POST("/images/variations", handlers.CreateImageVariation)
			ai.POST("/embeddings", handlers.CreateEmbedding)
		}

		// Model management
		models := api.Group("/models")
		{
			models.GET("", handlers.ListModels)
			models.GET("/:id", handlers.GetModel)
		}

		// Usage and analytics
		usage := api.Group("/usage")
		{
			usage.GET("", handlers.GetUsage)
			usage.GET("/metrics", handlers.GetModelMetrics)
		}

		// Status endpoints
		status := api.Group("/status")
		{
			status.GET("", handlers.GetStatus)
			status.GET("/endpoints", handlers.GetEndpointStatus)
		}
	}

	// Mount gRPC-Gateway mux
	router.Any("/grpc/*any", gin.WrapH(gwmux))

	// Create HTTP server
	httpServer := &http.Server{
		Addr:         ":" + httpPort,
		Handler:      router,
		ReadTimeout:  30 * time.Second,
		WriteTimeout: 30 * time.Second,
		IdleTimeout:  120 * time.Second,
	}

	// Start HTTP server
	go func() {
		log.Infof("Starting HTTP server on port %s", httpPort)
		if err := httpServer.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Errorf("Failed to serve HTTP: %v", err)
		}
	}()

	// Wait for interrupt signal
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Info("Shutting down servers...")

	// Graceful shutdown
	shutdownCtx, shutdownCancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer shutdownCancel()

	// Shutdown gRPC server
	grpcServer.GracefulStop()

	// Shutdown HTTP server
	if err := httpServer.Shutdown(shutdownCtx); err != nil {
		log.Errorf("HTTP server shutdown error: %v", err)
	}

	log.Info("Servers stopped gracefully")
}

func configureLogging() {
	// Set log level
	level, err := logrus.ParseLevel(viper.GetString("logging.level"))
	if err != nil {
		level = logrus.InfoLevel
	}
	log.SetLevel(level)

	// Set log format
	if viper.GetString("logging.format") == "json" {
		log.SetFormatter(&logrus.JSONFormatter{})
	} else {
		log.SetFormatter(&logrus.TextFormatter{
			FullTimestamp: true,
			ForceColors:   true,
		})
	}

	// Set output
	if viper.GetString("logging.output") == "file" {
		file, err := os.OpenFile(viper.GetString("logging.file_path"), os.O_CREATE|os.O_WRONLY|os.O_APPEND, 0666)
		if err == nil {
			log.SetOutput(file)
		} else {
			log.Warnf("Failed to open log file: %v", using default output", err)
		}
	}
}