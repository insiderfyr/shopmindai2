package main

import (
	"log"
	"os"

	"shopmindai-backend/internal/chat-service/app"
)

func main() {
	app := app.NewApp()
	if err := app.Run(); err != nil {
		log.Fatalf("Failed to start chat service: %v", err)
		os.Exit(1)
	}
}
