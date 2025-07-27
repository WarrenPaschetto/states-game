'use client'

import { useEffect, useState } from 'react'

interface TimerProps {
    onTimeUp: () => void
    startTime: boolean
    stopTime: boolean
}

const Timer = ({ onTimeUp, startTime, stopTime }: TimerProps) => {
    const [timeLeft, setTimeLeft] = useState(240)

    useEffect(() => {
        if (timeLeft === 0 || stopTime === true) {
            onTimeUp()
            return
        }

        if (startTime === true) {
            const timerId = setInterval(() => {
                setTimeLeft(prev => prev - 1)
            }, 1000)

            return () => clearInterval(timerId)
        }
    }, [timeLeft, onTimeUp, startTime, stopTime])

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`
    }

    return (
        <div className="font-mono text-4xl text-center text-blue-900 bg-white p-4 shadow-lg rounded-lg border border-gray-200 w-40">
            {formatTime(timeLeft)}
        </div>
    )
}

export default Timer