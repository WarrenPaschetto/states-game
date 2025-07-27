/* eslint-disable @typescript-eslint/no-explicit-any */

'use client'

import { useEffect } from 'react'

declare global {
    interface Window {
        webkitSpeechRecognition: any
        SpeechRecognition: any
    }
}

type Props = {
    onResult: (transcript: string) => void
    onError?: (error: string) => void
    disabled?: boolean
}

type SpeechRecognitionEvent = Event & {
    readonly results: SpeechRecognitionResultList
}

type SpeechRecognitionErrorEvent = Event & {
    error: string
}

export default function VoiceRecognition({ onResult, onError, disabled = false }: Props) {
    useEffect(() => {
        if (disabled) return

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

        if (!SpeechRecognition) {
            onError?.('SpeechRecognition not supported.')
            return
        }

        const recognition = new SpeechRecognition()
        recognition.lang = 'en-US'
        recognition.interimResults = false
        recognition.maxAlternatives = 1

        recognition.onresult = (event: SpeechRecognitionEvent) => {
            const transcript = event.results[0][0].transcript.trim().toLowerCase()
            onResult(transcript)
        }

        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
            onError?.(event.error)
        }


        recognition.onend = () => {
            console.log('Recognition ended -- restarting')
        }

        try {
            recognition.start()
        } catch (e) {
            console.warn('Recognition start failed:', e)
        }

        return () => {
            recognition.abort()
        }
    }, [disabled, onResult, onError])

    return null
}