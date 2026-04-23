interface StatCardProps {
    label: string
    value: string | number
    sub?: string         
  }
  
  export default function StatCard({ label, value, sub }: StatCardProps) {
    return (
      <div className="rounded-xl border border-border bg-background p-6">
        <p className="text-sm text-muted">{label}</p>
        <p className="mt-2 text-3xl font-bold text-foreground">{value}</p>
        {sub && (
          <p className="mt-1 text-xs text-muted">{sub}</p>
        )}
      </div>
    )
  }