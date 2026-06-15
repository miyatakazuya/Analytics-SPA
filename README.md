# Analytics-SPA

Analytics-SPA is a modern, highly scalable Single Page Application (SPA) designed to provide real-time web analytics and insights. Built with a robust Go backend and a responsive React frontend, it offers a seamless experience for tracking and analyzing web traffic.

## Features

- **Real-time Tracking**: Monitor active users, page views, and sessions instantly.
- **In-Depth Demographics**: Understand your audience with detailed browser and network analytics.
- **AI-Powered Insights**: Query your analytics data using natural language prompts (e.g., "Summarize my traffic trends from last week").
- **High Performance**: Optimized with Redis caching for rapid data retrieval and reduced database load.
- **Modern UI**: A premium, responsive dashboard built with React, TypeScript, and Vite.
- **Containerized**: Easy deployment and scaling with Docker and Docker Compose.

## Architecture

The platform is designed with a modern monorepo structure:
- **Backend**: Go API utilizing GORM for database interactions and `go-redis` for caching.
- **Frontend**: React SPA with Vite, styled with custom CSS for a unique, premium feel.
- **Database**: MySQL for persistent data storage.
- **Cache**: Redis for high-speed in-memory data caching.

## Getting Started

### Prerequisites

- Docker and Docker Compose
- Git

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/miyatakazuya/Analytics-SPA.git
   cd Analytics-SPA
   ```

2. Start the application using Docker Compose:
   ```bash
   docker-compose up --build
   ```

3. Access the application:
   - Dashboard: http://localhost:3000
   - API: http://localhost:8080
