package handlers

import (
	"auth-service/internal/config"
	"auth-service/internal/models"
	"auth-service/internal/services"
	"auth-service/pkg/logger"
	"net/http"

	"github.com/gin-gonic/gin"
)

// AuthHandler handles authentication requests
type AuthHandler struct {
	keycloakService *services.KeycloakService
	logger          *logger.Logger
}

// NewAuthHandler creates a new auth handler
func NewAuthHandler(cfg *config.Config, logger *logger.Logger) *AuthHandler {
	return &AuthHandler{
		keycloakService: services.NewKeycloakService(cfg.Keycloak, logger),
		logger:          logger,
	}
}

// Login handles user login
func (h *AuthHandler) Login(c *gin.Context) {
	var req models.LoginRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.logger.WithError(err).Error("Invalid login request")
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "validation_error",
			Message: err.Error(),
			Code:    http.StatusBadRequest,
		})
		return
	}

	// Authenticate with Keycloak
	authResponse, err := h.keycloakService.Login(req.Username, req.Password)
	if err != nil {
		h.logger.WithError(err).WithField("username", req.Username).Error("Login failed")
		c.JSON(http.StatusUnauthorized, models.ErrorResponse{
			Error:   "authentication_failed",
			Message: "Invalid username or password",
			Code:    http.StatusUnauthorized,
		})
		return
	}

	h.logger.WithField("username", req.Username).Info("User logged in successfully")
	c.JSON(http.StatusOK, models.SuccessResponse{
		Message: "Login successful",
		Data:    authResponse,
	})
}

// Register handles user registration
func (h *AuthHandler) Register(c *gin.Context) {
	var req models.RegisterRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.logger.WithError(err).Error("Invalid registration request")
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "validation_error",
			Message: err.Error(),
			Code:    http.StatusBadRequest,
		})
		return
	}

	// Register user in Keycloak
	err := h.keycloakService.Register(&req)
	if err != nil {
		h.logger.WithError(err).WithField("username", req.Username).Error("Registration failed")
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "registration_failed",
			Message: "Failed to create user account",
			Code:    http.StatusBadRequest,
		})
		return
	}

	h.logger.WithField("username", req.Username).Info("User registered successfully")
	c.JSON(http.StatusCreated, models.SuccessResponse{
		Message: "Registration successful",
	})
}

// Refresh handles token refresh
func (h *AuthHandler) Refresh(c *gin.Context) {
	var req models.RefreshRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.logger.WithError(err).Error("Invalid refresh request")
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "validation_error",
			Message: err.Error(),
			Code:    http.StatusBadRequest,
		})
		return
	}

	// Refresh token with Keycloak
	authResponse, err := h.keycloakService.RefreshToken(req.RefreshToken)
	if err != nil {
		h.logger.WithError(err).Error("Token refresh failed")
		c.JSON(http.StatusUnauthorized, models.ErrorResponse{
			Error:   "refresh_failed",
			Message: "Invalid refresh token",
			Code:    http.StatusUnauthorized,
		})
		return
	}

	h.logger.Info("Token refreshed successfully")
	c.JSON(http.StatusOK, models.SuccessResponse{
		Message: "Token refreshed successfully",
		Data:    authResponse,
	})
}

// Logout handles user logout
func (h *AuthHandler) Logout(c *gin.Context) {
	var req models.RefreshRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		h.logger.WithError(err).Error("Invalid logout request")
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "validation_error",
			Message: err.Error(),
			Code:    http.StatusBadRequest,
		})
		return
	}

	// Logout from Keycloak
	err := h.keycloakService.Logout(req.RefreshToken)
	if err != nil {
		h.logger.WithError(err).Error("Logout failed")
		c.JSON(http.StatusBadRequest, models.ErrorResponse{
			Error:   "logout_failed",
			Message: "Failed to logout",
			Code:    http.StatusBadRequest,
		})
		return
	}

	h.logger.Info("User logged out successfully")
	c.JSON(http.StatusOK, models.SuccessResponse{
		Message: "Logout successful",
	})
}
