/* eslint-disable @typescript-eslint/no-explicit-any */

'use client'
import { useEffect, useRef } from 'react'

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
    const recognitionRef = useRef<any>(null)
    const isListening = useRef(false)

    useEffect(() => {
        console.log('VoiceRecognition mounted')

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition
        if (!SpeechRecognition) {
            onError?.('SpeechRecognition not supported.')
            return
        }

        const initRecognition = async () => {
            try {
                await navigator.mediaDevices.getUserMedia({ audio: true })
                console.log("✅ Mic permission granted")

                if (!recognitionRef.current) {
                    const recognition = new SpeechRecognition()
                    recognition.lang = 'en-US'
                    recognition.interimResults = false
                    recognition.maxAlternatives = 1

                    recognition.onresult = (event: any) => {
                        const transcript = event.results[0][0].transcript.trim().toLowerCase()
                        console.log("👂 Heard:", transcript)
                        onResult(transcript)
                    }

                    recognition.onerror = (event: any) => {
                        console.warn("Recognition error:", event.error)
                        onError?.(event.error)
                    }

                    recognition.onend = () => {
                        console.log("🎤 Recognition ended")
                        if (!disabled) {
                            try {
                                recognition.start()
                                console.log("🔁 Restarted recognition")
                            } catch (e) {
                                console.warn("⚠️ Restart error:", e)
                            }
                        }
                    }

                    recognitionRef.current = recognition
                }

                if (!disabled && !isListening.current) {
                    try {
                        recognitionRef.current.start()
                        isListening.current = true
                        console.log("🎙️ Recognition started")
                    } catch (e) {
                        console.warn("⚠️ Start failed:", e)
                    }
                }

            } catch (err) {
                console.error("❌ Mic access error:", err)
                onError?.("Mic access error")
            }
        }

        initRecognition()

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.abort()
                isListening.current = false
                console.log("🛑 Recognition aborted on unmount")
            }
        }
    }, []) // empty dependency ensures one-time setup only

    useEffect(() => {
        if (recognitionRef.current) {
            if (disabled && isListening.current) {
                recognitionRef.current.abort()
                isListening.current = false
                console.log("🚫 Recognition paused")
            } else if (!disabled && !isListening.current) {
                try {
                    recognitionRef.current.start()
                    isListening.current = true
                    console.log("▶️ Recognition resumed")
                } catch (e) {
                    console.warn("⚠️ Resume failed:", e)
                }
            }
        }
    }, [disabled])

    return null
}