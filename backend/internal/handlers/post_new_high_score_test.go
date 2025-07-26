package handlers

import (
	"bytes"
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

type mockCommand struct {
	InsertNewScoreFn       func(ctx context.Context, arg db.InsertNewScoreParams) error
	DeleteScoresAfterTenFn func(ctx context.Context) error
	OrganizeTopTenListFn   func(ctx context.Context) ([]db.Leaderboard, error)
}

func (m *mockCommand) InsertNewScore(ctx context.Context, arg db.InsertNewScoreParams) error {
	return m.InsertNewScoreFn(ctx, arg)
}
func (m *mockCommand) DeleteScoresAfterTen(ctx context.Context) error {
	return m.DeleteScoresAfterTenFn(ctx)
}
func (m *mockCommand) OrganizeTopTenList(ctx context.Context) ([]db.Leaderboard, error) {
	return m.OrganizeTopTenListFn(ctx)
}

func TestPostNewHighScore(t *testing.T) {
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
	thirdLeader := db.Leaderboard{
		ID:        uuid.New(),
		UserName:  "Mary",
		Score:     30,
		Timer:     50,
		CreatedAt: now,
	}
	fourthLeader := db.Leaderboard{
		ID:        uuid.New(),
		UserName:  "Loyd",
		Score:     25,
		Timer:     50,
		CreatedAt: now,
	}
	fifthLeader := db.Leaderboard{
		ID:        uuid.New(),
		UserName:  "Wayne",
		Score:     22,
		Timer:     60,
		CreatedAt: now,
	}
	sixth := db.Leaderboard{
		ID:        uuid.New(),
		UserName:  "Newt",
		Score:     21,
		Timer:     60,
		CreatedAt: now,
	}
	seventhLeader := db.Leaderboard{
		ID:        uuid.New(),
		UserName:  "Mickey",
		Score:     19,
		Timer:     40,
		CreatedAt: now,
	}
	eigthLeader := db.Leaderboard{
		ID:        uuid.New(),
		UserName:  "Stan",
		Score:     18,
		Timer:     60,
		CreatedAt: now,
	}
	ninthLeader := db.Leaderboard{
		ID:        uuid.New(),
		UserName:  "Skip",
		Score:     15,
		Timer:     45,
		CreatedAt: now,
	}
	tenthLeader := db.Leaderboard{
		ID:        uuid.New(),
		UserName:  "Lisa",
		Score:     10,
		Timer:     60,
		CreatedAt: now,
	}

	fakeList := []db.Leaderboard{firstLeader, secondLeader, thirdLeader, fourthLeader,
		fifthLeader, sixth, seventhLeader, eigthLeader, ninthLeader, tenthLeader}

	tests := []struct {
		name           string
		body           PostScoreRequest
		mockCommand    *mockCommand
		expectStatus   int
		expectResponse []db.Leaderboard
	}{
		{
			name: "Success",
			body: PostScoreRequest{
				UserName: "Test",
				Score:    100,
				Timer:    30,
			},
			mockCommand: &mockCommand{
				InsertNewScoreFn: func(ctx context.Context, arg db.InsertNewScoreParams) error {
					return nil
				},
				DeleteScoresAfterTenFn: func(ctx context.Context) error {
					return nil
				},
				OrganizeTopTenListFn: func(ctx context.Context) ([]db.Leaderboard, error) {
					return fakeList, nil
				},
			},
			expectStatus:   http.StatusCreated,
			expectResponse: fakeList,
		},
		{
			name: "Insert fails",
			body: PostScoreRequest{
				UserName: "Test",
				Score:    100,
				Timer:    30,
			},
			mockCommand: &mockCommand{
				InsertNewScoreFn: func(ctx context.Context, arg db.InsertNewScoreParams) error {
					return errors.New("insert failed")
				},
				DeleteScoresAfterTenFn: func(ctx context.Context) error {
					return nil
				},
				OrganizeTopTenListFn: func(ctx context.Context) ([]db.Leaderboard, error) {
					return fakeList, nil
				},
			},
			expectStatus: http.StatusInternalServerError,
		},
		{
			name: "Delete fails",
			body: PostScoreRequest{
				UserName: "Test",
				Score:    100,
				Timer:    30,
			},
			mockCommand: &mockCommand{
				InsertNewScoreFn: func(ctx context.Context, arg db.InsertNewScoreParams) error {
					return nil
				},
				DeleteScoresAfterTenFn: func(ctx context.Context) error {
					return errors.New("deletion failed")
				},
				OrganizeTopTenListFn: func(ctx context.Context) ([]db.Leaderboard, error) {
					return fakeList, nil
				},
			},
			expectStatus: http.StatusInternalServerError,
		},
		{
			name: "Reorganize fails",
			body: PostScoreRequest{
				UserName: "Test",
				Score:    100,
				Timer:    30,
			},
			mockCommand: &mockCommand{
				InsertNewScoreFn: func(ctx context.Context, arg db.InsertNewScoreParams) error {
					return nil
				},
				DeleteScoresAfterTenFn: func(ctx context.Context) error {
					return nil
				},
				OrganizeTopTenListFn: func(ctx context.Context) ([]db.Leaderboard, error) {
					return nil, errors.New("organize failed")
				},
			},
			expectStatus: http.StatusInternalServerError,
		},
		{
			name: "Invalid input",
			body: PostScoreRequest{
				UserName: "",
				Score:    100,
				Timer:    30,
			},
			mockCommand:  &mockCommand{},
			expectStatus: http.StatusBadRequest,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			bodyBytes, _ := json.Marshal(tt.body)
			req := httptest.NewRequest(http.MethodPost, "/score", bytes.NewReader(bodyBytes))
			rr := httptest.NewRecorder()

			handler := PostNewHighScore(tt.mockCommand)
			handler.ServeHTTP(rr, req)

			if rr.Code != tt.expectStatus {
				t.Fatalf("%s: expected %d, got %d", tt.name, tt.expectStatus, rr.Code)
			}

			if tt.expectStatus == http.StatusCreated {
				var got []db.Leaderboard
				if err := json.NewDecoder(rr.Body).Decode(&got); err != nil {
					t.Fatalf("failed to decode JSON: %v", err)
				}
				if len(got) != len(tt.expectResponse) {
					t.Fatalf("expected %d entries, got %d instead", len(tt.expectResponse), len(got))
				}
			}
		})
	}
}
