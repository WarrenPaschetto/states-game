package handlers

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestGetShuffledStates(t *testing.T) {
	req, err := http.NewRequest("GET", "/shuffled-states", nil)
	if err != nil {
		t.Fatal(err)
	}

	rr := httptest.NewRecorder()
	handler := http.HandlerFunc(GetShuffledStates)
	handler.ServeHTTP(rr, req)

	if rr.Code != http.StatusOK {
		t.Errorf("expected status 200, but got %v", rr.Code)
	}

	contentType := rr.Header().Get("Content-Type")
	if contentType != "application/json" {
		t.Errorf("expected Content-Type 'application/json', but got '%s'", contentType)
	}

	var shuffled []string
	if err := json.NewDecoder(rr.Body).Decode(&shuffled); err != nil {
		t.Fatalf("response body is not valid JSON: %v", err)
	}

	if len(shuffled) != 50 {
		t.Errorf("expected 50 states, but got %d", len(shuffled))
	}

	// Check if it differs from the original list (likely shuffled)
	sameOrder := true
	for i, s := range shuffled {
		if s != states[i] {
			sameOrder = false
			break
		}
	}
	if sameOrder {
		t.Error("expected shuffled list, but received original order")
	}
}
