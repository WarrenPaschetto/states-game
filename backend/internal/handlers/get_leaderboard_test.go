package handlers

import (
	"context"
	"encoding/json"
	"errors"
	"net/http"
	"net/http/httptest"
	"testing"
	"time"

	"github.com/WarrenPaschetto/states-game/internal/db"
	"github.com/google/uuid"
)

type mockQuery struct {
	OrganizeTopTenListFn func(ctx context.Context) ([]db.Leaderboard, error)
}

func (m *mockQuery) OrganizeTopTenList(ctx context.Context) ([]db.Leaderboard, error) {
	return m.OrganizeTopTenListFn(ctx)
}

func TestGetLeaderboard(t *testing.T) {
	now := time.Now()
	firstLeader := db.Leaderboard{
		ID:        uuid.New(),
		UserName:  "Frank",
		Score:     50,
		Timer:     10,
		CreatedAt: now,
	}
	secondLeader := db.Leaderboard{
		ID:        uuid.New(),
		UserName:  "Missy",
		Score:     35,
		Timer:     60,
		CreatedAt: now,
	}
	fakeList := []db.Leaderboard{firstLeader, secondLeader}

	tests := []struct {
		name           string
		mockFn         func(ctx context.Context) ([]db.Leaderboard, error)
		expectStatus   int
		expectResponse []db.Leaderboard
	}{
		{
			name: "Success",
			mockFn: func(ctx context.Context) ([]db.Leaderboard, error) {
				return fakeList, nil
			},
			expectStatus:   http.StatusOK,
			expectResponse: fakeList,
		},
		{
			name: "DB failure",
			mockFn: func(ctx context.Context) ([]db.Leaderboard, error) {
				return nil, errors.New("db failure")
			},
			expectStatus:   http.StatusInternalServerError,
			expectResponse: nil,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			mockQ := &mockQuery{
				OrganizeTopTenListFn: tt.mockFn,
			}
			handler := GetLeaderboard(mockQ)

			req := httptest.NewRequest(http.MethodGet, "/leaderboard", nil)
			rr := httptest.NewRecorder()

			handler.ServeHTTP(rr, req)

			if rr.Code != tt.expectStatus {
				t.Fatalf("expected status %d but got %d; body = %q", tt.expectStatus, rr.Code, rr.Body.String())
			}

			if tt.expectStatus == http.StatusOK {
				var got []db.Leaderboard
				if err := json.NewDecoder(rr.Body).Decode(&got); err != nil {
					t.Fatalf("failed to decode JSON: %v", err)
				}
				if len(got) != len(tt.expectResponse) {
					t.Fatalf("expected %d entries, got %d instead", len(tt.expectResponse), len(got))
				}
				for i, want := range tt.expectResponse {
					if got[i].ID != want.ID {
						t.Fatalf("entry[%d].ID = %v, but want %v", i, got[i].ID, want.ID)
					}
				}
			} else {
				var errResp map[string]interface{}
				if err := json.NewDecoder(rr.Body).Decode(&errResp); err == nil {
					if _, ok := errResp["error"]; !ok {
						t.Errorf("expected 'error' key in error response, but got %v", errResp)
					}
				}
			}

		})
	}
}
