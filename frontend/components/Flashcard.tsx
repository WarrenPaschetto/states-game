'use client';

import { useEffect, useState } from 'react';
import VoiceRecognition from '@/components/VoiceRecognition';

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

export default function Flashcard() {
    const [shuffledStates] = useState(() => shuffleArray(states));
    const [index, setIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [showAnswer, setShowAnswer] = useState(false);
    const [lastSpoken, setLastSpoken] = useState('');
    const [gameOver, setGameOver] = useState(false);

    const currentState = shuffledStates[index];

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

    return (
        <div className="max-w-xl mx-auto text-center p-6">
            <h1 className="text-3xl font-bold mb-4">🗣 Flashcard States Game</h1>

            {!gameOver && (
                <>
                    <p className="text-lg mb-2">Say the name of the selected state!</p>
                    <div className="border-2 border-gray-400 rounded-lg p-6 text-2xl font-bold my-4">
                        {currentState}
                    </div>

                    {showAnswer ? (
                        <p className="text-lg">
                            You said: <strong>{lastSpoken}</strong> — {lastSpoken.toLowerCase().includes(currentState.toLowerCase()) ? '✅ Correct!' : '❌ Incorrect'}
                        </p>
                    ) : (
                        <VoiceRecognition onResult={handleResult} />
                    )}

                    <p className="mt-6 text-lg">Score: <strong>{score}</strong></p>
                </>
            )}

            {gameOver && (
                <div className="text-xl mt-6">
                    🎉 Game Over! Final Score: <strong>{score}</strong>
                </div>
            )}
        </div>
    );
}
