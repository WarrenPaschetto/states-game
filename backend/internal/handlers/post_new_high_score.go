package handlers

import (
	"context"
	"encoding/json"
	"log"
	"net/http"

	"github.com/WarrenPaschetto/states-game/internal/db"
)

type PostScoreRequest struct {
	UserName string `json:"userName"`
	Score    int32  `json:"score"`
	Timer    int32  `json:"timer"`
}

type Command interface {
	InsertNewScore(ctx context.Context, arg db.InsertNewScoreParams) error
	DeleteScoresAfterTen(ctx context.Context) error
	OrganizeTopTenList(ctx context.Context) ([]db.Leaderboard, error)
}

func PostNewHighScore(q Command) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		var req PostScoreRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			http.Error(w, "Invalid request payload", http.StatusBadRequest)
			return
		}

		if req.UserName == "" || req.Score < 0 || req.Timer < 0 {
			http.Error(w, "Missing or invalid fields", http.StatusBadRequest)
			return
		}

		arg := db.InsertNewScoreParams{
			UserName: req.UserName,
			Score:    req.Score,
			Timer:    req.Timer,
		}

		// Add new high score to top ten list

		if err := q.InsertNewScore(r.Context(), arg); err != nil {
			log.Printf("Error inserting new high score: %v", err)
			http.Error(w, "Failed to save new high score", http.StatusInternalServerError)
			return
		}

		// Delete extra scores and keep only 10
		if err := q.DeleteScoresAfterTen(r.Context()); err != nil {
			log.Printf("Failed to delete extra scores: %v", err)
			http.Error(w, "Failed to trim leaderboard", http.StatusInternalServerError)
			return
		}

		// Get updated leaderboard
		updatedTopTen, err := q.OrganizeTopTenList(r.Context())
		if err != nil {
			log.Printf("Failed to update Top Ten list: %v", err)
			http.Error(w, "Failed to update leaderboard", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.WriteHeader(http.StatusCreated)
		if err := json.NewEncoder(w).Encode(updatedTopTen); err != nil {
			log.Printf("Failed to encode JSON: %v", err)
			http.Error(w, "Failed to encode JSON", http.StatusInternalServerError)
			return
		}
	}
}
