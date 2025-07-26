package main

import (
	"context"
	"log"

	"github.com/WarrenPaschetto/states-game/internal/db"
	"github.com/WarrenPaschetto/states-game/internal/handlers"
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

	r := mux.NewRouter()

	r.HandleFunc("/states", handlers.GetStates).Methods("GET")
	r.HandleFunc("/leaderboard", handlers.GetLeaderboard(leaderboard)).Methods("GET")

}
