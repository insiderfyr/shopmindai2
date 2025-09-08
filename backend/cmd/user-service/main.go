package main

import (
	"log"
	"os"

	"shopmindai-backend/internal/user-service/app"
)

func main() {
	app := app.NewApp()
	if err := app.Run(); err != nil {
		log.Fatalf("Failed to start user service: %v", err)
		os.Exit(1)
	}
}