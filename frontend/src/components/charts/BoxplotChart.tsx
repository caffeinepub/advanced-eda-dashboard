import { useMemo } from 'react';
import { DataRow } from '@/context/DataContext';

interface Props {
  data: DataRow[];
  column: string;
}

export default function BoxplotChart({ data, column }: Props) {
  const stats = useMemo(() => {
    const vals = data.map(r => Number(r[column])).filter(v => !isNaN(v)).sort((a, b) => a - b);
    if (vals.length === 0) return null;
    const n = vals.length;
    const q1 = vals[Math.floor(n * 0.25)];
    const median = n % 2 === 0 ? (vals[n / 2 - 1] + vals[n / 2]) / 2 : vals[Math.floor(n / 2)];
    const q3 = vals[Math.floor(n * 0.75)];
    const iqr = q3 - q1;
    const whiskerLow = Math.max(vals[0], q1 - 1.5 * iqr);
    const whiskerHigh = Math.min(vals[n - 1], q3 + 1.5 * iqr);
    const outliers = vals.filter(v => v < whiskerLow || v > whiskerHigh);
    return { min: vals[0], max: vals[n - 1], q1, median, q3, whiskerLow, whiskerHigh, outliers };
  }, [data, column]);

  if (!stats) return <p className="text-muted-foreground text-center py-8">No data available.</p>;

  const { min, max, q1, median, q3, whiskerLow, whiskerHigh, outliers } = stats;
  const range = max - min || 1;
  const toX = (v: number) => ((v - min) / range) * 80 + 10;

  const fmt = (n: number) => n.toFixed(3);

  return (
    <div className="flex flex-col items-center gap-6 py-4">
      <svg viewBox="0 0 100 40" className="w-full max-w-2xl" style={{ height: 120 }}>
        {/* Whisker lines */}
        <line x1={toX(whiskerLow)} y1={20} x2={toX(q1)} y2={20} stroke="#4CAF50" strokeWidth={0.8} />
        <line x1={toX(q3)} y1={20} x2={toX(whiskerHigh)} y2={20} stroke="#4CAF50" strokeWidth={0.8} />
        {/* Whisker caps */}
        <line x1={toX(whiskerLow)} y1={15} x2={toX(whiskerLow)} y2={25} stroke="#4CAF50" strokeWidth={0.8} />
        <line x1={toX(whiskerHigh)} y1={15} x2={toX(whiskerHigh)} y2={25} stroke="#4CAF50" strokeWidth={0.8} />
        {/* Box */}
        <rect
          x={toX(q1)} y={12}
          width={toX(q3) - toX(q1)} height={16}
          fill="#4CAF5033" stroke="#4CAF50" strokeWidth={0.8}
          rx={1}
        />
        {/* Median line */}
        <line x1={toX(median)} y1={12} x2={toX(median)} y2={28} stroke="#fff" strokeWidth={1.2} />
        {/* Outliers */}
        {outliers.slice(0, 30).map((v, i) => (
          <circle key={i} cx={toX(v)} cy={20} r={0.8} fill="#f59e0b" opacity={0.8} />
        ))}
      </svg>
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-3 text-center w-full max-w-2xl">
        {[
          { label: 'Min', value: fmt(min) },
          { label: 'Q1', value: fmt(q1) },
          { label: 'Median', value: fmt(median) },
          { label: 'Q3', value: fmt(q3) },
          { label: 'Max', value: fmt(max) },
          { label: 'Outliers', value: outliers.length },
        ].map(({ label, value }) => (
          <div key={label} className="bg-muted/30 rounded-lg p-2">
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-sm font-mono font-semibold text-primary">{value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
