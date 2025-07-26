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
	InsertNewScore(ctx context.Context, arg db.InsertNewScoreParams) (db.Leaderboard, error)
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

		result, err := q.InsertNewScore(r.Context(), arg)
		if err != nil {
			log.Printf("Error inserting new high score: %v", err)
			http.Error(w, "Failed to save new high score", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		if err := json.NewEncoder(w).Encode(result); err != nil {
			http.Error(w, "Failed to encode JSON", http.StatusInternalServerError)
		}
	}
}
