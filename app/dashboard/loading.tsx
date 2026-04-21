export default function DashboardLoading() {
    return (
      <main className="min-h-screen bg-gray-950">
        <div className="mx-auto max-w-6xl px-6 py-8">
  
          {/* Header skeleton */}
          <div className="flex items-center gap-4 mb-8">
            <div className="w-12 h-12 rounded-full bg-gray-800 animate-pulse" />
            <div className="flex flex-col gap-2">
              <div className="w-32 h-4 rounded bg-gray-800 animate-pulse" />
              <div className="w-48 h-3 rounded bg-gray-800 animate-pulse" />
            </div>
          </div>
  
          {/* Stats skeleton */}
          <div className="grid grid-cols-4 gap-4 mb-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="rounded-xl border border-gray-800 bg-gray-900 p-6">
                <div className="w-24 h-3 rounded bg-gray-800 animate-pulse mb-3" />
                <div className="w-16 h-8 rounded bg-gray-800 animate-pulse" />
              </div>
            ))}
          </div>
  
          {/* Heatmap skeleton */}
          <div className="rounded-xl border border-gray-800 bg-gray-900 p-6 mb-6 h-32 animate-pulse" />
  
          {/* Chart skeleton -->
          <div className="rounded-xl border border-gray-800 bg-gray-900 p-6 mb-6 h-48 animate-pulse" />
  
          {/* Bottom row skeleton */}
          <div className="grid grid-cols-2 gap-6">
            <div className="rounded-xl border border-gray-800 bg-gray-900 p-6 h-64 animate-pulse" />
            <div className="rounded-xl border border-gray-800 bg-gray-900 p-6 h-64 animate-pulse" />
          </div>
        </div>
      </main>
    )
  }