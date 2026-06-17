package models

import (
	"time"

	"gorm.io/gorm"
)

type User struct {
	ID           uint           `gorm:"primaryKey" `
	Email        string         `gorm:"uniqueIndex;not null" `
	PasswordHash string         `gorm:"not null" `
	DisplayName  string         ``
	Role         string         `gorm:"default:'viewer'" ` // 'viewer', 'analyst', 'super_admin'
	Permissions  string         ``
	CreatedAt    time.Time      ``
	UpdatedAt    time.Time      ``
	DeletedAt    gorm.DeletedAt `gorm:"index" `
}

