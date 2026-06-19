package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/miyatakazuya/Analytics-SPA/backend/internal/database"
	"github.com/miyatakazuya/Analytics-SPA/backend/internal/models"
)

func GetReports(c *gin.Context) {
	var reports []models.Report
	if err := database.DB.Order("created_at desc").Find(&reports).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to fetch reports"})
		return
	}
	c.JSON(http.StatusOK, reports)
}

func CreateReport(c *gin.Context) {
	var req models.Report
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid request"})
		return
	}

	if err := database.DB.Create(&req).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create report"})
		return
	}

	c.JSON(http.StatusCreated, req)
}
