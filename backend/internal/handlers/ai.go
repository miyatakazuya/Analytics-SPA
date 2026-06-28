package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/miyatakazuya/Analytics-SPA/backend/internal/services"
)

type AIQueryRequest struct {
	Prompt string `json:"prompt" binding:"required"`
}

func HandleAIQuery(c *gin.Context) {
	var req AIQueryRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Prompt is required"})
		return
	}

	response, err := services.QueryAI(req.Prompt)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to query AI"})
		return
	}

	c.JSON(http.StatusOK, response)
}
