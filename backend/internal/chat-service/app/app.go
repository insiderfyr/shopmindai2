package app

import (
	"context"
	"fmt"
	"log"
	"net"
	"net/http"
	"os"
	"os/signal"
	"syscall"
	"time"

	"github.com/gin-gonic/gin"
	"google.golang.org/grpc"
)

type App struct {
	httpServer *http.Server
	grpcServer *grpc.Server
	router     *gin.Engine
}

func NewApp() *App {
	// Set Gin mode
	gin.SetMode(gin.ReleaseMode)
	
	router := gin.New()
	router.Use(gin.Logger())
	router.Use(gin.Recovery())

	// Health check endpoint
	router.GET("/healthz", func(c *gin.Context) {
		c.JSON(http.StatusOK, gin.H{
			"status": "ok",
			"service": "chat-service",
			"timestamp": time.Now().Unix(),
		})
	})

	// API routes
	api := router.Group("/api/v1")
	{
		api.GET("/status", func(c *gin.Context) {
			c.JSON(http.StatusOK, gin.H{
				"message": "Chat Service is running",
				"version": "1.0.0",
			})
		})
	}

	httpServer := &http.Server{
		Addr:    ":7001",
		Handler: router,
	}

	grpcServer := grpc.NewServer()

	return &App{
		httpServer: httpServer,
		grpcServer: grpcServer,
		router:     router,
	}
}

func (a *App) Run() error {
	// Start HTTP server in a goroutine
	go func() {
		log.Printf("Chat Service HTTP starting on :7001")
		if err := a.httpServer.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("Failed to start HTTP server: %v", err)
		}
	}()

	// Start gRPC server in a goroutine
	go func() {
		lis, err := net.Listen("tcp", ":7001")
		if err != nil {
			log.Fatalf("Failed to listen: %v", err)
		}
		log.Printf("Chat Service gRPC starting on :7001")
		if err := a.grpcServer.Serve(lis); err != nil {
			log.Fatalf("Failed to serve gRPC: %v", err)
		}
	}()

	// Wait for interrupt signal to gracefully shutdown the servers
	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit
	log.Println("Shutting down Chat Service...")

	// Graceful shutdown
	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	// Shutdown HTTP server
	if err := a.httpServer.Shutdown(ctx); err != nil {
		return fmt.Errorf("HTTP server forced to shutdown: %v", err)
	}

	// Shutdown gRPC server
	a.grpcServer.GracefulStop()

	log.Println("Chat Service exited")
	return nil
}
