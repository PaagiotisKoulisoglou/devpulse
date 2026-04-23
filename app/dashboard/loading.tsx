function Skeleton({ className }: { className?: string }) {
  return (
    <div className={`animate-pulse rounded-lg bg-gray-800 ${className}`} />
  )
}

export default function DashboardLoading() {
  return (
    <main className="min-h-screen bg-gray-950">
      <div className="mx-auto max-w-6xl px-6 py-8">

        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Skeleton className="w-12 h-12 rounded-full" />
            <div className="flex flex-col gap-2">
              <Skeleton className="w-32 h-4" />
              <Skeleton className="w-48 h-3" />
            </div>
          </div>
          <Skeleton className="w-24 h-9 rounded-lg" />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="rounded-xl border border-gray-800 bg-gray-900 p-6">
              <Skeleton className="w-24 h-3 mb-3" />
              <Skeleton className="w-16 h-8" />
            </div>
          ))}
        </div>

        {/* Heatmap */}
        <Skeleton className="w-full h-28 rounded-xl mb-6" />

        {/* Chart */}
        <Skeleton className="w-full h-52 rounded-xl mb-6" />

        {/* Two columns */}
        <div className="grid grid-cols-2 gap-6 mb-6">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>

        {/* AI Summary */}
        <Skeleton className="w-full h-36 rounded-xl mb-6" />

        {/* Goals + Chat */}
        <div className="grid grid-cols-2 gap-6">
          <Skeleton className="h-52 rounded-xl" />
          <Skeleton className="h-52 rounded-xl" />
        </div>

      </div>
    </main>
  )
}