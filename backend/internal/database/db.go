package database

import (
	"log"

	"gorm.io/driver/mysql"
	"gorm.io/gorm"
	"github.com/miyatakazuya/Analytics-SPA/backend/internal/models"
)

var DB *gorm.DB

func ConnectDB(dsn string) {
	db, err := gorm.Open(mysql.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	DB = db

	// Auto-migrate the models
	err = DB.AutoMigrate(
		&models.User{},
		&models.Report{},
		&models.Session{},
		&models.Pageview{},
		&models.Activity{},
		&models.ErrorLog{},
	)
	if err != nil {
		log.Fatalf("Failed to auto-migrate database: %v", err)
	}

	log.Println("Database connected and migrated successfully.")
}
