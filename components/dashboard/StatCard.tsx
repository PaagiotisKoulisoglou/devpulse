interface StatCardProps {
    label: string
    value: string | number
    sub?: string         
  }
  
  export default function StatCard({ label, value, sub }: StatCardProps) {
    return (
      <div className="rounded-xl border border-gray-800 bg-gray-900 p-6">
        <p className="text-sm text-gray-400">{label}</p>
        <p className="mt-2 text-3xl font-bold text-white">{value}</p>
        {sub && (
          <p className="mt-1 text-xs text-gray-500">{sub}</p>
        )}
      </div>
    )
  }