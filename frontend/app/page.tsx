'use client'

import Image from "next/image";
import { useEffect, useState } from "react";
import LeaderboardTable from "@/components/LeaderboardTable";
import Timer from "@/components/Timer";
import VoiceRecognition from "@/components/VoiceRecognition";

const states = [
  'Alabama', 'Alaska', 'Arizona', 'Arkansas', 'California', 'Colorado', 'Connecticut',
  'Delaware', 'Florida', 'Georgia', 'Hawaii', 'Idaho', 'Illinois', 'Indiana', 'Iowa',
  'Kansas', 'Kentucky', 'Louisiana', 'Maine', 'Maryland', 'Massachusetts', 'Michigan',
  'Minnesota', 'Mississippi', 'Missouri', 'Montana', 'Nebraska', 'Nevada',
  'New Hampshire', 'New Jersey', 'New Mexico', 'New York', 'North Carolina',
  'North Dakota', 'Ohio', 'Oklahoma', 'Oregon', 'Pennsylvania', 'Rhode Island',
  'South Carolina', 'South Dakota', 'Tennessee', 'Texas', 'Utah', 'Vermont',
  'Virginia', 'Washington', 'West Virginia', 'Wisconsin', 'Wyoming'
];

function shuffleArray<T>(array: T[]): T[] {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

type LeaderboardEntry = {
  ID: string;
  UserName: string;
  Score: number;
  Timer: number;
  CreatedAt: string;
};

export default function Home() {
  const [data, setData] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [start, setStart] = useState(false);
  const [stop, setStop] = useState(false);
  const [shuffledStates] = useState(() => shuffleArray(states));
  const [index, setIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [showAnswer, setShowAnswer] = useState(false);
  const [lastSpoken, setLastSpoken] = useState('');
  const [gameOver, setGameOver] = useState(false);

  const currentState = shuffledStates[index];

  const handleTimeUp = () => {
    setStop(true);
    alert("Time is up!");
    setGameOver(true);
  };

  const handleStartTime = () => {
    setStart(true);
  };

  const handleStopTime = () => {
    setStop(true);
    setGameOver(true);
  };

  const handleResult = (spoken: string) => {
    setLastSpoken(spoken);
    const isCorrect = spoken.toLowerCase().includes(currentState.toLowerCase());
    if (isCorrect) {
      setScore((prev) => prev + 1);
    }
    setShowAnswer(true);
    setTimeout(() => {
      if (index + 1 < shuffledStates.length) {
        setIndex(index + 1);
        setShowAnswer(false);
      } else {
        setGameOver(true);
      }
    }, 2000);
  };

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/leaderboard`)
      .then((res) => res.json())
      .then(setData)
      .catch((err) => console.error('Error loading leaderboard:', err))
      .finally(() => setLoading(false));
  }, []);

  return (
    <main className="max-w-3xl mx-auto p-6">
      <h1 className="text-3xl font-bold text-center mb-6">US States Game</h1>
      <p className="text-center text-gray-600 mb-8">
        Say the name of the displayed state out loud. Can you get them all in time?
      </p>

      <div className="overflow-x-auto m-6 flex justify-center">
        <Timer onTimeUp={handleTimeUp} startTime={start} stopTime={stop} />
      </div>

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

      {!gameOver && (
        <div className="text-center p-6">
          <div className="border-2 border-gray-400 rounded-lg p-6 my-4">
            <h2 className="text-2xl font-bold mb-4">{currentState}</h2>
            <Image
              src={`/states/${currentState.toLowerCase().replace(/\s+/g, '')}.png`}
              alt={currentState}
              width={300}
              height={200}
              className="mx-auto rounded-md max-h-20 max-w-20"
            />
          </div>

          {showAnswer ? (
            <p className="text-lg">
              You said: <strong>{lastSpoken}</strong> — {lastSpoken.toLowerCase().includes(currentState.toLowerCase()) ? '✅ Correct!' : '❌ Incorrect'}
            </p>
          ) : (
            <VoiceRecognition onResult={handleResult} disabled={stop} />
          )}

          <p className="mt-6 text-lg">Score: <strong>{score}</strong></p>
        </div>
      )}

      {gameOver && (
        <div className="text-xl text-center mt-6">
          🎉 Game Over! Final Score: <strong>{score}</strong>
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
