package main

import (
	"log"
	"os"

	"shopmindai-backend/internal/llm-proxy-service/app"
)

func main() {
	app := app.NewApp()
	if err := app.Run(); err != nil {
		log.Fatalf("Failed to start LLM proxy service: %v", err)
		os.Exit(1)
	}
}
