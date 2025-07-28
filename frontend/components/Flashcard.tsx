'use client';


import Image from "next/image";
import { useEffect, useRef, useState } from 'react';
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
    startCards: boolean
    disabled: boolean
    timeLeft: number
    onGameOver: (score: number, time: number) => void
}

function shuffleArray<T>(array: T[]): T[] {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

export default function Flashcard({ startCards = false, disabled = false, timeLeft = 0, onGameOver }: Props) {

    const [shuffledStates] = useState(() => shuffleArray(states));
    const [index, setIndex] = useState(0);
    const [score, setScore] = useState(0);
    const [showAnswer, setShowAnswer] = useState(false);
    const [lastSpoken, setLastSpoken] = useState('');
    const [gameOver, setGameOver] = useState(false);

    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const currentState = shuffledStates[index];

    const nextCard = () => {

        if (index + 1 < shuffledStates.length) {
            setIndex(index + 1);
            setShowAnswer(false);
            setLastSpoken('');
        } else {
            setGameOver(true);
            onGameOver(score, 240 - timeLeft); // use timeLeft passed from Home
        }
    };

    const handleResult = (spoken: string) => {
        if (timeoutRef.current) clearTimeout(timeoutRef.current);

        setLastSpoken(spoken);
        const isCorrect = spoken.toLowerCase().includes(currentState.toLowerCase());

        // If answer is correct increase the score by 1
        if (isCorrect) {
            setScore((prev) => prev + 1);
        }

        setShowAnswer(true);

        setTimeout(nextCard, 1000);
    };

    useEffect(() => {
        // Set a 5-second timer for no response
        if (!showAnswer && !gameOver && startCards && !disabled) {
            timeoutRef.current = setTimeout(() => {
                setShowAnswer(true);
                setTimeout(nextCard, 2000); // show "Incorrect" for 2 seconds before next
            }, 5000);
        }

        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, [index, showAnswer, gameOver, startCards, disabled]);

    useEffect(() => {
        if (timeLeft <= 0 && !gameOver) {
            setGameOver(true);
            onGameOver(score, 240); // entire 240 seconds used
        }
    }, [timeLeft, gameOver]);


    //if (!startCards || disabled) return null;

    return (
        <div className="max-w-xl mx-auto text-center p-6">
            {/* Voice recognition is always mounted but disabled conditionally */}
            <VoiceRecognition
                onResult={handleResult}
                disabled={!startCards || disabled || showAnswer || gameOver}
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
