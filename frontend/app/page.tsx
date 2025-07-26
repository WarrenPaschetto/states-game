'use client'
import Image from "next/image";
import { useEffect, useState } from "react";
import LeaderboardTable from "@/components/LeaderboardTable";

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
      <p className="text-center text-gray-600 mb-8">
        Test how well you know the United States. Enter as many state names as you can in 60 seconds!
      </p>

      <h2 className="text-center text-xl font-semibold mb-4">🏆 Top 10 Scores</h2>

      {loading ? (
        <p className="text-center text-gray-500">Loading leaderboard...</p>
      ) : (
        <LeaderboardTable data={data} />
      )}
    </main>

  );
}
