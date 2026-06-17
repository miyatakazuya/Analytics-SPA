package models

import (
	"time"

	"gorm.io/gorm"
)

type Report struct {
	ID           uint           `gorm:"primaryKey" json:"id"`
	Title        string         `gorm:"not null" json:"title"`
	Category     string         `gorm:"not null" json:"category"`
	AuthorEmail  string         `gorm:"not null" json:"author_email"`
	DataSnapshot string         `gorm:"type:json" json:"data_snapshot"`
	Comments     string         `gorm:"type:text" json:"comments"`
	CreatedAt    time.Time      `json:"created_at"`
	UpdatedAt    time.Time      `json:"updated_at"`
	DeletedAt    gorm.DeletedAt `gorm:"index" json:"-"`
}
