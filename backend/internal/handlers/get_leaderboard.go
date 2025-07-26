package handlers

import (
	"context"
	"encoding/json"
	"log"
	"net/http"

	"github.com/WarrenPaschetto/states-game/internal/db"
)

type Query interface {
	OrganizeTopTenList(ctx context.Context) ([]db.Leaderboard, error)
}

func GetLeaderboard(q Query) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		ctx := r.Context()

		topScores, err := q.OrganizeTopTenList(ctx)
		if err != nil {
			log.Printf("Error fetching leaderboard: %v", err)
			http.Error(w, "Failed to fetch leaderboard", http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		if err := json.NewEncoder(w).Encode(topScores); err != nil {
			http.Error(w, "Failed to encode JSON", http.StatusInternalServerError)
		}
	}
}
