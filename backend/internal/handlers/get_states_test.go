package handlers

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"
)

func TestGetStates(t *testing.T) {
	req, err := http.NewRequest("GET", "/states", nil)
	if err != nil {
		t.Fatal(err)
	}

	rr := httptest.NewRecorder()
	handler := http.HandlerFunc(GetStates)
	handler.ServeHTTP(rr, req)

	if rr.Code != http.StatusOK {
		t.Errorf("expected status 200, but got %v", rr.Code)
	}

	contentType := rr.Header().Get("Content-Type")
	if contentType != "application/json" {
		t.Errorf("expected Content-Type 'application/json', but got '%s'", contentType)
	}

	var states []string
	if err := json.NewDecoder(rr.Body).Decode(&states); err != nil {
		t.Fatalf("response body is not valid JSON: %v", err)
	}

	if len(states) != 50 {
		t.Errorf("expected 50 states, but got %d", len(states))
	}

	if states[0] != "Alabama" || states[len(states)-1] != "Wyoming" {
		t.Errorf("unexpected state values: first = %s, last = %s", states[0], states[len(states)-1])
	}
}
