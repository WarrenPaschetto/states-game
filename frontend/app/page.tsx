'use client'
import Image from "next/image";
import { useEffect, useState } from "react";
import LeaderboardTable from "@/components/LeaderboardTable";
import Timer from "@/components/Timer";
import Flashcard from "@/components/Flashcard";
import MicPermissionPrompt from "@/components/MicPermissionPrompt";

type LeaderboardEntry = {
  ID: string
  UserName: string
  Score: number
  Timer: number
  CreatedAt: string
}

export default function Home() {
  const [data, setData] = useState<LeaderboardEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [start, setStart] = useState(false)
  const [stop, setStop] = useState(false)
  const [finalScore, setFinalScore] = useState(0)
  const [finalTime, setFinalTime] = useState(0)
  const [timeLeft, setTimeLeft] = useState(240)
  const [playerName, setPlayerName] = useState('')
  const [showNameInput, setShowNameInput] = useState(false)

  const handleTimeUp = () => {
    alert("Time is up!")
  }

  const handleStartTime = () => {
    setStart(true)
  }

  const handleStopTime = () => {
    setStop(true)
  }

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/leaderboard`)
      .then((res) => res.json())
      .then(setData)
      .catch((err) => console.error('Error loading leaderboard:', err))
      .finally(() => setLoading(false))
  }, [])

  const isTopTen = (score: number, time: number) => {
    if (data.length < 10) return true;
    const worstScore = data[9]
    return score > worstScore.Score || (score === worstScore.Score && time < worstScore.Timer)
  }

  return (
    <main className="max-w-3xl mx-auto p-6">
      <MicPermissionPrompt />
      <h1 className="text-3xl font-bold text-center mb-6">US States Game</h1>
      <Image
        src="/us-flag.gif"
        alt="eagle with flag"
        width={900}
        height={500}
        unoptimized
      />
      <p className="text-center text-gray-600 mb-8">
        Test how well you know the United States. Enter as many state names as you can in 4 minutes!
      </p>
      <div className="overflow-x-auto m-6 flex justify-center">
        <Timer
          onTimeUp={handleTimeUp}
          startTime={start}
          stopTime={stop}
          timeLeft={timeLeft}
          setTimeLeft={setTimeLeft}
        />
      </div >
      <div className="overflow-x-auto m-6 flex justify-center">
        <button
          className={`mr-10 text-xl text-center shadow-lg rounded-lg w-30 h-1/2 ${start ? `bg-green-900 text-gray-700` : `bg-green-600 text-white`}`}
          onClick={handleStartTime}
          disabled={start}
        >Start</button>
        <button
          className={`ml-10 text-xl text-center shadow-lg rounded-lg w-30 h-1/2 ${stop ? `bg-red-900 text-gray-700` : `bg-red-600 text-white`}`}
          onClick={handleStopTime}
          disabled={stop}
        >End</button>
      </div>
      <div className="overflow-x-auto m-6 flex justify-center">
        <Flashcard
          startCards={start}
          disabled={stop}
          timeLeft={timeLeft}
          onGameOver={(score, time) => {
            setFinalScore(score)
            setFinalTime(time)

            if (isTopTen(score, time)) {
              setShowNameInput(true)
            }
          }}
        />
      </div>

      {showNameInput && (
        <div className="text-center mb-4">
          <label className="block text-lg font-medium mb-2">Enter Your Name:</label>
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            className="px-4 py-2 border border-gray-400 rounded-md w-1/2 text-center"
            disabled={start}
            placeholder="Your name"
            required
          />
          <button
            className="ml-4 px-4 py-2 bg-blue-600 text-white rounded-lg"
            onClick={() => {
              if (!playerName.trim()) {
                alert("Please enter your name before submitting.");
                return;
              }
              fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/highscore`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/JSON' },
                body: JSON.stringify({
                  userName: playerName,
                  score: finalScore,
                  timer: finalTime,
                }),
              }).then(() => {
                setShowNameInput(false) // hide the input again
                setPlayerName('')
              })
                .catch((err) => {
                  console.error("Failed to submit score:", err)
                  alert("Error submitting score. Try again.")
                })
            }}
          >
            Submit
          </button>
        </div>
      )}

      <h2 className="text-center text-xl font-semibold mb-4">🏆 Top 10 Scores</h2>

      {loading ? (
        <p className="text-center text-gray-500">Loading leaderboard...</p>
      ) : (
        <LeaderboardTable data={data} />
      )}
    </main>

  );
}
