package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/miyatakazuya/Analytics-SPA/backend/internal/services"
)

func GetAnalytics(c *gin.Context) {
	category := c.Query("category")

	switch category {
	case "overview":
		data, err := services.GetOverviewMetrics()
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to get overview metrics"})
			return
		}
		c.JSON(http.StatusOK, data)
	default:
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid or unsupported category"})
	}
}
