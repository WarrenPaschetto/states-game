import { useEffect, useState } from 'react'

export function useMicPermission() {
    const [micAllowed, setMicAllowed] = useState<boolean | null>(null)

    useEffect(() => {
        navigator.mediaDevices.getUserMedia({ audio: true })
            .then((stream) => {
                setMicAllowed(true)
                stream.getTracks().forEach(track => track.stop()) // release mic
            })
            .catch((err) => {
                console.error('🚫 Microphone permission denied:', err)
                setMicAllowed(false)
            })
    }, [])

    return micAllowed
}