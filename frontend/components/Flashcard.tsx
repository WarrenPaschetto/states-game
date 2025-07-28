'use client';


import Image from "next/image";
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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

type Props = {
    startCards: boolean;
    disabled: boolean;
    timeLeft: number;
    score: number;
    setScore: React.Dispatch<React.SetStateAction<number>>;
    onGameOver: (score: number, time: number) => void;
};

function shuffleArray<T>(array: T[]): T[] {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

export default function Flashcard({ startCards = false, disabled = false, timeLeft = 0, score, setScore, onGameOver }: Props) {


    const [shuffledStates] = useState(() => shuffleArray(states));
    const [index, setIndex] = useState(0);
    const [showAnswer, setShowAnswer] = useState(false);
    const [lastSpoken, setLastSpoken] = useState('');
    const [gameOver, setGameOver] = useState(false);
    const currentStateRef = useRef(shuffledStates[0]);

    //const [currentState, setCurrentState] = useState(shuffledStates[0]);

    const currentState = shuffledStates[index];

    const nextCard = () => {
        console.log("📦 nextCard called at index", index);
        if (index + 1 < shuffledStates.length) {
            console.log("➡️ Advancing to next card");
            setIndex(prev => prev + 1);
            setLastSpoken('');
        } else {
            console.log("🏁 No more cards — game over");
            setGameOver(true);
            console.log("🎯 Final Score (ref):", score);
            onGameOver(score, 240 - timeLeft);
        }
    };


    const handleResult = (spoken: string) => {
        console.log("🗣️ handleResult:", spoken);

        setLastSpoken(spoken);


        const cleanSpoken = spoken.trim().toLowerCase().replace(/[^\w\s]/g, '');
        const cleanState = currentStateRef.current.trim().toLowerCase();
        const isCorrect = cleanSpoken === cleanState;

        console.log("✅ Cleaned:", cleanSpoken, "vs", cleanState);
        console.log("✅ Correct?", isCorrect);



        if (isCorrect) {
            setScore(prev => {
                const newScore = prev + 1;
                console.log("🧮 Score updated:", newScore);
                return newScore;
            });
        }

        setShowAnswer(true);

        setTimeout(() => {
            setShowAnswer(false);
            nextCard();
        }, 1000);
    };

    useEffect(() => {
        currentStateRef.current = shuffledStates[index];
        console.log("🧭 index changed:", index, "→", currentStateRef.current);
    }, [index, shuffledStates]);

    useEffect(() => {
        if (timeLeft <= 0 && !gameOver) {
            setGameOver(true);
            onGameOver(score, 240); // entire 240 seconds used
        }
    }, [timeLeft, gameOver]);


    if (!startCards || disabled) return null;

    return (
        <div className="max-w-xl mx-auto text-center p-6">
            {/* Voice recognition is always mounted but disabled conditionally */}
            <VoiceRecognition
                onResult={handleResult}
                disabled={!startCards || disabled || gameOver}
            />
            {!gameOver && (
                <>
                    <p className="text-lg mb-2">Say the name of the selected state!</p>
                    <div className="border-2 border-gray-400 rounded-lg p-6 my-4">
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
                        <></>
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
