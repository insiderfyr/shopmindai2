package main

import (
	"log"
	"os"

	"shopmindai-backend/internal/auth-service/app"
)

func main() {
	app := app.NewApp()
	if err := app.Run(); err != nil {
		log.Fatalf("Failed to start auth service: %v", err)
		os.Exit(1)
	}
}