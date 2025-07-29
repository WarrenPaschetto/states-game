![alt dynamic badge for workflow tests](https://github.com/WarrenPaschetto/states-game/actions/workflows/backend.yml/badge.svg?branch=main)

![alt dynamic badge for workflow tests](https://github.com/WarrenPaschetto/states-game/actions/workflows/frontend.yml/badge.svg?branch=main)

# 🗽 US States Game 🎙️

My project for the Boot.Dev 2025 Hackathon.
A voice-controlled web game that tests your knowledge of all 50 U.S. states in a fast-paced flashcard-style challenge. You have 4 minutes to name as many states as you can — using only your voice!


![Game Banner](public/us-flag.gif)

---

## 🖼 Live Demo


👉 [**Click here to view the live demo**](https://states-game.vercel.app/))

[![states-game](https://github.com/user-attachments/assets/378fabe2-f946-4989-a282-5081cb28e47d)](https://states-game.vercel.app/)

---
## 🧠 How It Works

1. Press **Start** to begin a 4-minute timer.
2. A random U.S. state outline appears on screen.
3. Say the name of the state out loud — the app uses your mic to check your answer.
4. Score points for each correct match.
5. When the game ends, if you're in the top 10, enter your name to submit your score to the leaderboard!

---

## ✨ Features

- 🎤 **Real-time voice recognition** (Web Speech API)
- 🧩 **Randomized flashcards** from all 50 states
- ⏱️ **Countdown timer** with 240 seconds
- 🏆 **Leaderboard** that stores top scores
- 📱 **Responsive UI** built with Tailwind CSS
- 🔐 **Mic permission prompts** for user safety
- 🔁 Automatic retries for speech recognition
- 🖼️ Images of U.S. states and a patriotic design

---

## 🛠️ Tech Stack

| Tech           | Purpose                             |
|----------------|-------------------------------------|
| **Next.js**    | Frontend React framework            |
| **TypeScript** | Static typing                       |
| **Tailwind CSS** | Styling & layout                  |
| **Web Speech API** | Voice recognition               |
| **Supabase** and **Go API** | Backend leaderboard |

---

## 🚀 Getting Started

### 1. Set Up Supabase
1. Log in to Supabase and create a new project.
2. In the dashboard, go to Settings → Database → Connection string.
3. Copy the Connection string (libpq) URL, for example:
   ```
   postgresql://postgres:<PASSWORD>@db.<project>.supabase.co:5432/postgres?sslmode=require
   ```

### 2. Clone the Repository

```bash
git clone https://github.com/<yourusername>/states-game.git
cd states-game
```

### 3. Install Dependencies

```bash
cd frontend
npm install
# or
yarn install
```

### 4. Create Environment File
Create a .env.local file in /frontend with:
```bash
NEXT_PUBLIC_BACKEND_URL=http://localhost:8080
```

### 5. Set Up Backend
1. Create `.env` in `/backend`:
   ```env
   DATABASE_URL=postgresql://...    # Your Supabase connection string
   PORT=8080
   ```
2. Install the Goose CLI for managing migrations:

   ```
   # via Go modules
   go install github.com/pressly/goose/v3/cmd/goose@latest

   # or on macOS using Homebrew
   brew install goose
   ```
   Verify installation:
   ```
   goose --version
   ```
3. Run migrations:
   Go into the backend directory:
   ```
   cd backend
   ```
   
   In your shell, export your DATABASE_URL:
   ```
   export DATABASE_URL=postgresql://postgres:<PASSWORD>@db.<project>.supabase.co:5432/postgres?sslmode=require
   ```
   
   Apply migrations:
   ```
   goose -dir sql/schema postgres "$DATABASE_URL" up
   ```

   Verify the created tables:
   ```
   psql "&DATABASE_URL" -c '/dt'
   ```

### 6. Run the Backend Server from /backend

```bash
cd backend
go mod tidy
go run ./cmd/main.go
```

### 7. Run the Dev Server from /frontend

```bash
cd frontend
npm run dev
```
Visit http://localhost:3000 to start playing!

## ⚠ Known Issues
- Mic recognition may behave inconsistently on mobile Safari.
- Some browser extensions may cause hydration mismatches.
- Image hydration mismatch may occur due to shuffled state order (fixed via client-only render).
