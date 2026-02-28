import { useMemo } from 'react';
import { DataRow } from '@/context/DataContext';

interface Props {
  data: DataRow[];
  column: string;
}

export default function ViolinPlot({ data, column }: Props) {
  const { kde, min, max, q1, median, q3 } = useMemo(() => {
    const vals = data.map(r => Number(r[column])).filter(v => !isNaN(v)).sort((a, b) => a - b);
    if (vals.length === 0) return { kde: [], min: 0, max: 1, q1: 0, median: 0, q3: 0 };

    const n = vals.length;
    const min = vals[0];
    const max = vals[n - 1];
    const q1 = vals[Math.floor(n * 0.25)];
    const median = n % 2 === 0 ? (vals[n / 2 - 1] + vals[n / 2]) / 2 : vals[Math.floor(n / 2)];
    const q3 = vals[Math.floor(n * 0.75)];

    // Kernel density estimation
    const bandwidth = 1.06 * (vals.reduce((a, b) => a + (b - vals.reduce((x, y) => x + y, 0) / n) ** 2, 0) / n) ** 0.5 * n ** (-0.2) || 1;
    const points = 40;
    const step = (max - min) / points || 1;
    const kde = Array.from({ length: points + 1 }, (_, i) => {
      const x = min + i * step;
      const density = vals.reduce((sum, v) => sum + Math.exp(-0.5 * ((x - v) / bandwidth) ** 2), 0) / (n * bandwidth * Math.sqrt(2 * Math.PI));
      return { x, density };
    });

    return { kde, min, max, q1, median, q3 };
  }, [data, column]);

  if (kde.length === 0) return <p className="text-muted-foreground text-center py-8">No data available.</p>;

  const maxDensity = Math.max(...kde.map(p => p.density)) || 1;
  const svgW = 100;
  const svgH = 200;
  const toY = (x: number) => svgH - ((x - min) / (max - min || 1)) * (svgH - 20) - 10;
  const toX = (d: number) => (d / maxDensity) * 35;

  const rightPath = kde.map((p, i) => `${i === 0 ? 'M' : 'L'} ${50 + toX(p.density)} ${toY(p.x)}`).join(' ');
  const leftPath = [...kde].reverse().map((p, i) => `${i === 0 ? 'L' : 'L'} ${50 - toX(p.density)} ${toY(p.x)}`).join(' ');
  const fullPath = `${rightPath} ${leftPath} Z`;

  return (
    <div className="flex flex-col items-center gap-4 py-4">
      <svg viewBox={`0 0 ${svgW} ${svgH}`} className="w-full max-w-xs" style={{ height: 280 }}>
        <path d={fullPath} fill="#4CAF5040" stroke="#4CAF50" strokeWidth={0.8} />
        {/* IQR box */}
        <rect x={44} y={toY(q3)} width={12} height={toY(q1) - toY(q3)} fill="#4CAF5060" stroke="#4CAF50" strokeWidth={0.6} />
        {/* Median line */}
        <line x1={44} y1={toY(median)} x2={56} y2={toY(median)} stroke="#fff" strokeWidth={1.2} />
        {/* Labels */}
        <text x={58} y={toY(max) + 1} fontSize={4} fill="oklch(0.6 0 0)">{max.toFixed(1)}</text>
        <text x={58} y={toY(min) + 1} fontSize={4} fill="oklch(0.6 0 0)">{min.toFixed(1)}</text>
        <text x={58} y={toY(median) + 1} fontSize={4} fill="#fff">{median.toFixed(1)}</text>
      </svg>
      <div className="grid grid-cols-3 gap-3 text-center w-full max-w-sm">
        {[
          { label: 'Q1', value: q1.toFixed(3) },
          { label: 'Median', value: median.toFixed(3) },
          { label: 'Q3', value: q3.toFixed(3) },
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
