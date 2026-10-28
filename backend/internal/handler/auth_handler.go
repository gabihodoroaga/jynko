package handler

import (
	"net/http"

	"github.com/gin-gonic/gin"

	"jynko/internal/middleware"
)

// AuthHandler handles authentication identity inspection endpoints.
type AuthHandler struct{}

// NewAuthHandler creates a new AuthHandler.
func NewAuthHandler() *AuthHandler {
	return &AuthHandler{}
}

// GetMe returns the current IAP-authenticated user identity (/api/v1/auth/me).
func (h *AuthHandler) GetMe(c *gin.Context) {
	userCtx, ok := middleware.GetUserContext(c)
	if !ok {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "unauthorized"})
		return
	}
	c.JSON(http.StatusOK, userCtx)
}
