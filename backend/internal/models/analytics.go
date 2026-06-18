package models

import (
	"time"
)

type Session struct {
	ID          uint      `gorm:"primaryKey" json:"id"`
	SessionID   string    `gorm:"uniqueIndex;not null" json:"session_id"`
	UserAgent   string    `json:"user_agent"`
	Browser     string    `json:"browser"`
	NetworkType string    `json:"network_type"`
	CreatedAt   time.Time `json:"created_at"`
}

type Pageview struct {
	ID        uint       `gorm:"primaryKey" json:"id"`
	SessionID string     `gorm:"index;not null" json:"session_id"`
	URL       string     `gorm:"not null" json:"url"`
	EnterTime time.Time  `json:"enter_time"`
	LeaveTime *time.Time `json:"leave_time"`
	CreatedAt time.Time  `json:"created_at"`
}

type Activity struct {
	ID           uint      `gorm:"primaryKey" json:"id"`
	SessionID    string    `gorm:"index;not null" json:"session_id"`
	ActivityType string    `gorm:"not null" json:"activity_type"`
	ElementTag   string    `json:"element_tag"`
	XCoord       int       `json:"x_coord"`
	YCoord       int       `json:"y_coord"`
	Timestamp    time.Time `json:"timestamp"`
}

type ErrorLog struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	ErrorType string    `json:"error_type"`
	Message   string    `json:"message"`
	CreatedAt time.Time `json:"created_at"`
}
