package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"time"
)

type Config struct {
	Version string `json:"version"`
	AppName string `json:"appName"`
}

type Banner struct {
	Message string `json:"message"`
	Type    string `json:"type"`
}

func main() {
	// CORS middleware
	corsMiddleware := func(next http.HandlerFunc) http.HandlerFunc {
		return func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Access-Control-Allow-Origin", "*")
			w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
			w.Header().Set("Access-Control-Allow-Headers", "Content-Type, Authorization")
			
			if r.Method == "OPTIONS" {
				w.WriteHeader(http.StatusOK)
				return
			}
			
			next(w, r)
		}
	}

	// API Routes
	http.HandleFunc("/api/config", corsMiddleware(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		// Return startup config for login form
		startupConfig := map[string]interface{}{
			"appTitle":            "ShopMindAI",
			"emailLoginEnabled":    true,
			"registrationEnabled":  true,
			"openidLoginEnabled":  false,
			"openidAutoRedirect":  false,
			"openidImageUrl":      "",
			"openidLabel":         "",
			"serverDomain":        "",
			"interface": map[string]interface{}{
				"termsOfService": map[string]interface{}{
					"modalAcceptance": false,
				},
			},
		}
		json.NewEncoder(w).Encode(startupConfig)
	}))

	// Startup Config endpoint - needed for login form
	http.HandleFunc("/api/config/startup", corsMiddleware(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		startupConfig := map[string]interface{}{
			"appTitle":            "ShopMindAI",
			"emailLoginEnabled":   true,
			"registrationEnabled": true,
			"openidLoginEnabled":  false,
			"openidAutoRedirect":  false,
			"openidLabel":         "",
			"openidImageUrl":      "",
			"serverDomain":        "",
			"interface": map[string]interface{}{
				"termsOfService": map[string]interface{}{
					"modalAcceptance": false,
				},
			},
		}
		json.NewEncoder(w).Encode(startupConfig)
	}))

	http.HandleFunc("/api/banner", corsMiddleware(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		// Return empty banner to hide it
		banner := Banner{
			Message: "",
			Type:    "",
		}
		json.NewEncoder(w).Encode(banner)
	}))

	http.HandleFunc("/api/auth/refresh", corsMiddleware(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		response := map[string]interface{}{
			"message": "Auth refresh endpoint",
			"status":  "ok",
		}
		json.NewEncoder(w).Encode(response)
	}))

	// Health check
	http.HandleFunc("/health", corsMiddleware(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		response := map[string]interface{}{
			"status":    "healthy",
			"timestamp": time.Now().Unix(),
		}
		json.NewEncoder(w).Encode(response)
	}))

	fmt.Println("🚀 ShopMindAI Backend Server starting...")
	fmt.Println("📡 Server running on: http://localhost:3080")
	fmt.Println("🔗 API endpoints:")
	fmt.Println("   - GET  /api/config")
	fmt.Println("   - GET  /api/config/startup")
	fmt.Println("   - GET  /api/banner") 
	fmt.Println("   - POST /api/auth/refresh")
	fmt.Println("   - GET  /health")
	fmt.Println("")
	fmt.Println("🌐 Frontend should be running on: http://localhost:3090")
	fmt.Println("")

	log.Fatal(http.ListenAndServe(":3080", nil))
}