package main

import (
	"log"
	"os"

	"shopmindai-backend/internal/gateway-service/app"
)

func main() {
	app := app.NewApp()
	if err := app.Run(); err != nil {
		log.Fatalf("Failed to start gateway service: %v", err)
		os.Exit(1)
	}
}
