'use client'

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'

interface Commit {
  committed_at: string
}

interface CommitChartProps {
  commits: Commit[]
}

export default function CommitChart({ commits }: CommitChartProps) {
  const data = Array.from({ length: 30 }, (_, i) => {
    const date = new Date()
    date.setDate(date.getDate() - (29 - i))
    const dateStr = date.toISOString().split('T')[0]
    const label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    const count = commits.filter(
      (c) => new Date(c.committed_at).toISOString().split('T')[0] === dateStr
    ).length
    return { date: label, commits: count }
  })

  return (
    <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
      <h2 className="text-white font-semibold mb-6">Commits — last 30 days</h2>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data} barSize={8}>
          <XAxis
            dataKey="date"
            tick={{ fill: '#6b7280', fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            interval={6}
          />
          <YAxis
            tick={{ fill: '#6b7280', fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={24}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: '#111827',
              border: '1px solid #1f2937',
              borderRadius: '8px',
              color: '#f9fafb',
              fontSize: '12px',
            }}
            cursor={{ fill: 'rgba(99,102,241,0.1)' }}
          />
          <Bar dataKey="commits" fill="#6366f1" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}