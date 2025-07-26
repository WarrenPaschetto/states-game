package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/WarrenPaschetto/states-game/internal/db"
	"github.com/WarrenPaschetto/states-game/internal/handlers"
	"github.com/WarrenPaschetto/states-game/internal/middleware"
	"github.com/gorilla/mux"
	"github.com/joho/godotenv"
)

func main() {
	// Get necessary environment variables for database connection
	if err := godotenv.Load(); err != nil {
		log.Println("Warning: .env file not found")
	}

	// Connect to database for high scores
	dbConn, err := db.ConnectDB(context.Background())
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}
	defer dbConn.Close()

	leaderboard := db.New(dbConn)

	// Handlers
	r := mux.NewRouter()

	r.HandleFunc("/api/states", handlers.GetStates).Methods("GET")
	r.HandleFunc("/api/leaderboard", handlers.GetLeaderboard(leaderboard)).Methods("GET")
	r.HandleFunc("/api/leaderboard", handlers.PostNewHighScore(leaderboard)).Methods("POST")

	// Wrap router in CORS AFTER all routes
	handlerWithCORS := middleware.CORS(
		func(origin string) bool {
			if origin == "http://localhost:3000" {
				return true
			}
			// Allow any vercel preview URL
			return strings.HasSuffix(origin, ".vercel.app")
		},
	)(r)

	// Serve
	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	srv := &http.Server{
		Addr:         ":" + port,
		Handler:      handlerWithCORS,
		ReadTimeout:  15 * time.Second,
		WriteTimeout: 15 * time.Second,
	}

	log.Printf("Listening on port %s…\n", port)
	log.Fatal(srv.ListenAndServe())
}
