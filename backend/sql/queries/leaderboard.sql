-- name: InsertNewScore :exec
INSERT INTO leaderboard (user_name, score, timer)
VALUES ($1, $2, $3);

-- name: OrganizeTopTenList :many
SELECT id, user_name, score, timer, created_at
FROM leaderboard
ORDER BY score DESC, timer ASC, created_at ASC
LIMIT 10;

-- name: DeleteScoresAfterTen :exec
DELETE FROM leaderboard
WHERE id NOT IN (
    SELECT id FROM leaderboard
    ORDER BY score DESC, timer ASC, created_at ASC
    LIMIT 10
);