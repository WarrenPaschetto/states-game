'use client'
import Image from "next/image";
import { useEffect, useState } from "react";
import LeaderboardTable from "@/components/LeaderboardTable";
import Timer from "@/components/Timer";
import Flashcard from "@/components/Flashcard";

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

  return (
    <main className="max-w-3xl mx-auto p-6">
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
        <Timer onTimeUp={handleTimeUp} startTime={start} stopTime={stop} />
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
        <Flashcard startCards={start} disabled={stop} />
      </div>

      <h2 className="text-center text-xl font-semibold mb-4">🏆 Top 10 Scores</h2>

      {loading ? (
        <p className="text-center text-gray-500">Loading leaderboard...</p>
      ) : (
        <LeaderboardTable data={data} />
      )}
    </main>

  );
}
