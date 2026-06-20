package main

import (
	"log"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/miyatakazuya/Analytics-SPA/backend/internal/config"
	"github.com/miyatakazuya/Analytics-SPA/backend/internal/database"
	"github.com/miyatakazuya/Analytics-SPA/backend/internal/handlers"
)

func main() {
	cfg := config.LoadConfig()

	// Initialize Database
	database.ConnectDB(cfg.DSN)

	// Initialize Redis
	database.ConnectRedis(cfg.RedisAddr, cfg.RedisPass)

	r := gin.Default()

	// CORS configuration
	r.Use(cors.New(cors.Config{
		AllowAllOrigins:  true,
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Authorization"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
	}))

	// Routes
	api := r.Group("/api")
	{
		api.POST("/login", handlers.Login(cfg.JWTSecret))
		api.POST("/logout", handlers.Logout)

		api.GET("/data", handlers.GetAnalytics)

		reports := api.Group("/reports")
		{
			reports.GET("", handlers.GetReports)
			reports.POST("", handlers.CreateReport)
		}

		api.POST("/ai/query", handlers.HandleAIQuery)
	}

	log.Printf("Starting server on port %s", cfg.Port)
	if err := r.Run(":" + cfg.Port); err != nil {
		log.Fatalf("Server failed to start: %v", err)
	}
}
