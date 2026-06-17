package models

import (
	"time"

	"gorm.io/gorm"
)

type Report struct {
	ID           uint           `gorm:"primaryKey" `
	Title        string         `gorm:"not null" `
	Category     string         `gorm:"not null" `
	AuthorEmail  string         `gorm:"not null" `
	DataSnapshot string         `gorm:"type:json" `
	Comments     string         `gorm:"type:text" `
	CreatedAt    time.Time      ``
	UpdatedAt    time.Time      ``
	DeletedAt    gorm.DeletedAt `gorm:"index" `
}

