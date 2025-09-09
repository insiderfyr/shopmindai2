package middleware

import (
	"auth-service/internal/config"
	"auth-service/internal/models"
	"auth-service/pkg/logger"
	"net/http"
	"strings"

	"github.com/Nerzal/gocloak/v13"
	"github.com/gin-gonic/gin"
)

// AuthMiddleware validates JWT tokens from Keycloak
func AuthMiddleware(cfg *config.Config, logger *logger.Logger) gin.HandlerFunc {
	return func(c *gin.Context) {
		// Get token from Authorization header
		authHeader := c.GetHeader("Authorization")
		if authHeader == "" {
			c.JSON(http.StatusUnauthorized, models.ErrorResponse{
				Error:   "unauthorized",
				Message: "Authorization header is required",
				Code:    http.StatusUnauthorized,
			})
			c.Abort()
			return
		}

		// Check if token starts with "Bearer "
		tokenParts := strings.Split(authHeader, " ")
		if len(tokenParts) != 2 || tokenParts[0] != "Bearer" {
			c.JSON(http.StatusUnauthorized, models.ErrorResponse{
				Error:   "unauthorized",
				Message: "Invalid authorization header format",
				Code:    http.StatusUnauthorized,
			})
			c.Abort()
			return
		}

		token := tokenParts[1]

		// Validate token with Keycloak
		client := gocloak.NewClient(cfg.Keycloak.URL)
		result, err := client.RetrospectToken(c.Request.Context(), token, cfg.Keycloak.ClientID, cfg.Keycloak.ClientSecret, cfg.Keycloak.Realm)
		if err != nil {
			logger.WithError(err).Error("Failed to validate token")
			c.JSON(http.StatusUnauthorized, models.ErrorResponse{
				Error:   "unauthorized",
				Message: "Invalid token",
				Code:    http.StatusUnauthorized,
			})
			c.Abort()
			return
		}

		// Check if token is active
		if !*result.Active {
			c.JSON(http.StatusUnauthorized, models.ErrorResponse{
				Error:   "unauthorized",
				Message: "Token is not active",
				Code:    http.StatusUnauthorized,
			})
			c.Abort()
			return
		}

		// Get user info and add to context
		userInfo, err := client.GetUserInfo(c.Request.Context(), token, cfg.Keycloak.Realm)
		if err != nil {
			logger.WithError(err).Error("Failed to get user info")
			c.JSON(http.StatusUnauthorized, models.ErrorResponse{
				Error:   "unauthorized",
				Message: "Failed to get user info",
				Code:    http.StatusUnauthorized,
			})
			c.Abort()
			return
		}

		// Add user info to context
		c.Set("user_id", *userInfo.Sub)
		c.Set("username", *userInfo.PreferredUsername)
		c.Set("email", *userInfo.Email)
		c.Set("access_token", token)

		c.Next()
	}
}

// LoggerMiddleware logs HTTP requests
func LoggerMiddleware(logger *logger.Logger) gin.HandlerFunc {
	return gin.LoggerWithFormatter(func(param gin.LogFormatterParams) string {
		logger.WithFields(map[string]interface{}{
			"status":     param.StatusCode,
			"method":     param.Method,
			"path":       param.Path,
			"ip":         param.ClientIP,
			"user_agent": param.Request.UserAgent(),
			"latency":    param.Latency,
		}).Info("HTTP Request")
		return ""
	})
}

// CORSMiddleware handles CORS
func CORSMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", "*")
		c.Header("Access-Control-Allow-Credentials", "true")
		c.Header("Access-Control-Allow-Headers", "Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization, accept, origin, Cache-Control, X-Requested-With")
		c.Header("Access-Control-Allow-Methods", "POST, OPTIONS, GET, PUT, DELETE")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	}
}

// RateLimitMiddleware implements basic rate limiting
func RateLimitMiddleware() gin.HandlerFunc {
	// This is a simple implementation - in production, use Redis or similar
	return func(c *gin.Context) {
		// Add rate limiting logic here
		c.Next()
	}
}
