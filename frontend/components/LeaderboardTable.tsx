'use client'

type LeaderboardEntry = {
    ID: string
    UserName: string
    Score: number
    Timer: number
    CreatedAt: string
}

type Props = {
    data: LeaderboardEntry[]
}

export default function LeaderboardTable({ data }: Props) {
    if (!data || data.length === 0) {
        return (
            <div className="text-center text-gray-800 mt-4">
                No leaderboard data available.
            </div>
        )
    }

    return (
        <div className="overflow-x-auto mt-6 shadow-lg rounded-lg border border-gray-200">
            <table className="min-w-full bg-white text-md">
                <thead className="bg-gray-100 text-left text-gray-600 uppercase tracking-wider">
                    <tr>
                        <th className="px-4 py-3">Rank</th>
                        <th className="px-4 py-3">Name</th>
                        <th className="px-4 py-3">Score</th>
                        <th className="px-4 py-3">Time (s)</th>
                    </tr>
                </thead>
                <tbody>
                    {data.map((entry, index) => (
                        <tr key={entry.ID} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                            <td className="px-4 py-2 font-medium text-gray-700">{index + 1}</td>
                            <td className="px-4 py-2">{entry.UserName}</td>
                            <td className="px-4 py-2">{entry.Score}</td>
                            <td className="px-4 py-2">{entry.Timer} seconds</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    )
}