package services

import (
	"encoding/json"
	"time"

	"github.com/miyatakazuya/Analytics-SPA/backend/internal/database"
)

func GetOverviewMetrics() (map[string]interface{}, error) {
	cacheKey := "analytics:overview:30days"

	if database.RedisClient != nil {
		cachedData, err := database.RedisClient.Get(database.Ctx, cacheKey).Result()
		if err == nil {
			var result map[string]interface{}
			if json.Unmarshal([]byte(cachedData), &result) == nil {
				return result, nil
			}
		}
	}

	// Calculate from DB
	var visitors int64
	database.DB.Table("sessions").Where("created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)").Count(&visitors)

	var views int64
	database.DB.Table("pageviews").Where("created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY)").Count(&views)

	result := map[string]interface{}{
		"visitors": visitors,
		"views":    views,
		// Simplified for mockup
		"bounceRate":    45.2,
		"visitDuration": 120,
	}

	if database.RedisClient != nil {
		jsonData, _ := json.Marshal(result)
		database.RedisClient.Set(database.Ctx, cacheKey, jsonData, 15*time.Minute)
	}

	return result, nil
}
