export default function Loader({ full = false, label = 'Loading...' }) {
  const spinner = (
    <div className="flex items-center gap-2 text-slate-500">
      <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-navy-600" />
      <span className="text-sm">{label}</span>
    </div>
  );

  if (!full) return spinner;

  return <div className="flex min-h-[40vh] items-center justify-center">{spinner}</div>;
}
