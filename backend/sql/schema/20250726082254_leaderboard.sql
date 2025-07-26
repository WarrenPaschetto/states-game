-- +goose Up
CREATE TABLE leaderboard (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_name TEXT NOT NULL,
    score INTEGER NOT NULL CHECK (score >= 0 AND score <= 50),
    timer INTEGER NOT NULL CHECK (timer >= 0 AND timer <= 60),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- +goose Down
DROP TABLE IF EXISTS leaderboard;
