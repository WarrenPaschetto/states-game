'use client'

import React from 'react'
import { useMicPermission } from '@/hooks/useMicPermission'

export default function MicPermissionPrompt() {
    const micAllowed = useMicPermission()

    if (micAllowed === null) {
        return <p className="text-center text-yellow-600">Requesting microphone access...</p>
    }

    if (micAllowed === false) {
        return (
            <div className="text-center text-red-600">
                <p>Microphone access denied.</p>
                <p>Please allow access in your browser settings and reload the page.</p>
            </div>
        )
    }

    return null // permission granted
}