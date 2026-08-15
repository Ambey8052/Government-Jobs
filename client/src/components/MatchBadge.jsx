function tone(score, eligible) {
  if (!eligible) return { ring: '#94a3b8', text: 'text-slate-500', bg: 'bg-slate-100' };
  if (score >= 75) return { ring: '#16a34a', text: 'text-emerald-700', bg: 'bg-emerald-50' };
  if (score >= 50) return { ring: '#d97706', text: 'text-amber-700', bg: 'bg-amber-50' };
  return { ring: '#dc2626', text: 'text-rose-700', bg: 'bg-rose-50' };
}

export default function MatchBadge({ match, size = 56 }) {
  if (!match) return null;
  const { score, eligible } = match;
  const { ring, text, bg } = tone(score, eligible);
  const radius = (size - 6) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.max(0, Math.min(100, score)) / 100) * circumference;

  return (
    <div className={`flex flex-col items-center justify-center rounded-full ${bg}`} style={{ width: size, height: size }}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="-rotate-90">
          <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="#e2e8f0" strokeWidth="4" />
          <circle
            cx={size / 2} cy={size / 2} r={radius} fill="none" stroke={ring} strokeWidth="4"
            strokeDasharray={circumference} strokeDashoffset={offset} strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className={`text-xs font-bold leading-none ${text}`}>{score}%</span>
        </div>
      </div>
    </div>
  );
}

export function MatchLabel({ match }) {
  if (!match) return null;
  if (!match.eligible) {
    return <span className="badge bg-slate-100 text-slate-600">Not Eligible</span>;
  }
  if (match.score >= 75) return <span className="badge bg-emerald-50 text-emerald-700">Strong Match</span>;
  if (match.score >= 50) return <span className="badge bg-amber-50 text-amber-700">Good Match</span>;
  return <span className="badge bg-rose-50 text-rose-700">Weak Match</span>;
}
