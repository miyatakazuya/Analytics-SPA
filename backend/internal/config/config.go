package config

import (
	"os"
)

type Config struct {
	DSN         string
	RedisAddr   string
	RedisPass   string
	JWTSecret   string
	Port        string
	OpenAIKey   string
}

func LoadConfig() Config {
	dsn := os.Getenv("DB_DSN")
	if dsn == "" {
		dsn = "collector:C0ll3ct0r_!2026_Secure@tcp(localhost:3306)/webanalytics?charset=utf8mb4&parseTime=True&loc=Local"
	}

	redisAddr := os.Getenv("REDIS_ADDR")
	if redisAddr == "" {
		redisAddr = "localhost:6379"
	}

	jwtSecret := os.Getenv("JWT_SECRET")
	if jwtSecret == "" {
		jwtSecret = "super-secret-key"
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	openAIKey := os.Getenv("OPENAI_API_KEY")

	return Config{
		DSN:       dsn,
		RedisAddr: redisAddr,
		RedisPass: os.Getenv("REDIS_PASS"),
		JWTSecret: jwtSecret,
		Port:      port,
		OpenAIKey: openAIKey,
	}
}
