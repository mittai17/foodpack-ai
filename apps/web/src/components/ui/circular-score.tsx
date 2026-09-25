export function CircularScore({ value, label }: { value: number; label: string }) {
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const clamped = Math.max(0, Math.min(100, value));
  const offset = circumference - (clamped / 100) * circumference;
  const tier = clamped >= 70 ? 'Good' : clamped >= 40 ? 'Moderate' : 'Needs improvement';
  const color = clamped >= 70 ? '#15803d' : clamped >= 40 ? '#d97706' : '#dc2626';

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative h-24 w-24">
        <svg viewBox="0 0 100 100" className="h-24 w-24 -rotate-90">
          <circle cx="50" cy="50" r={radius} fill="none" stroke="currentColor" strokeWidth="10" className="text-muted" />
          <circle
            cx="50"
            cy="50"
            r={radius}
            fill="none"
            stroke={color}
            strokeWidth="10"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 0.4s ease' }}
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-semibold tracking-tight">{Math.round(clamped)}</span>
          <span className="text-[10px] text-muted-foreground">/ 100</span>
        </div>
      </div>
      <p className="text-xs font-medium">{label}</p>
      <p className="text-[11px] text-muted-foreground">{tier}</p>
    </div>
  );
}
