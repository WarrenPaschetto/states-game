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

export default function VoiceRecognition({ onResult, onError, disabled = false }: Props) {
    const recognitionRef = useRef<any>(null);
    const isListening = useRef(false);
    const isMounted = useRef(true);

    const restartRecognition = () => {
        try {
            if (recognitionRef.current) {
                recognitionRef.current.abort(); // Stop if running
                recognitionRef.current.start(); // Restart cleanly
                isListening.current = true;
                console.log("🔁 Recognition restarted safely");
            }
        } catch (err) {
            console.warn("⚠️ Safe restart failed:", err);
        }
    };

    useEffect(() => {
        console.log('VoiceRecognition mounted');
        isMounted.current = true;

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            onError?.('SpeechRecognition not supported.');
            return;
        }

        const initRecognition = async () => {
            try {
                await navigator.mediaDevices.getUserMedia({ audio: true });
                console.log("✅ Mic permission granted");

                if (!recognitionRef.current) {
                    const recognition = new SpeechRecognition();
                    recognition.lang = 'en-US';
                    recognition.interimResults = false;
                    recognition.maxAlternatives = 1;

                    recognition.onresult = (event: any) => {
                        if (disabled) return;
                        const transcript = event.results[0][0].transcript.trim().toLowerCase();
                        console.log("👂 Heard:", transcript);
                        onResult(transcript);
                    };

                    recognition.onerror = (event: any) => {
                        console.warn("Recognition error:", event.error);
                        isListening.current = false;
                        onError?.(event.error);
                    };

                    recognition.onend = () => {
                        console.log("🎤 Recognition ended");
                        isListening.current = false;
                        if (!disabled && isMounted.current) {
                            restartRecognition();
                        } else {
                            console.log("🛑 Recognition ended and not restarting");
                        }
                    };

                    recognitionRef.current = recognition;
                }

                if (!disabled && !isListening.current) {
                    restartRecognition();
                }

            } catch (err) {
                console.error("❌ Mic access error:", err);
                onError?.("Mic access error");
            }
        };

        initRecognition();

        return () => {
            isMounted.current = false;
            if (recognitionRef.current) {
                recognitionRef.current.onend = null;
                recognitionRef.current.abort();
                isListening.current = false;
                console.log("🛑 Recognition aborted on unmount");
            }
        };
    }, []);

    useEffect(() => {
        if (!recognitionRef.current) return;

        if (disabled && isListening.current) {
            recognitionRef.current.abort();
            isListening.current = false;
            console.log("🚫 Recognition paused");
        } else if (!disabled && !isListening.current) {
            restartRecognition();
        }
    }, [disabled]);

    return null;
}
