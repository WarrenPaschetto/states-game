-- +goose Up
CREATE TABLE leaderboard (
    id UUID PRIMARY KEY NOT NULL,
    user_name TEXT NOT NULL,
    score INT,
    created_at TIMESTAMP NOT NULL DEFAULT now()
);

-- +goose Down
DROP TABLE leaderboard;
