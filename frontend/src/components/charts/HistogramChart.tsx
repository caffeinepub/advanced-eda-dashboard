import { useMemo } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DataRow } from '@/context/DataContext';

interface Props {
  data: DataRow[];
  column: string;
}

export default function HistogramChart({ data, column }: Props) {
  const histData = useMemo(() => {
    const vals = data.map(r => Number(r[column])).filter(v => !isNaN(v));
    if (vals.length === 0) return [];
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    const binCount = Math.min(20, Math.ceil(Math.sqrt(vals.length)));
    const binSize = (max - min) / binCount || 1;
    const bins = Array.from({ length: binCount }, (_, i) => ({
      range: `${(min + i * binSize).toFixed(1)}`,
      count: 0,
    }));
    for (const v of vals) {
      const idx = Math.min(Math.floor((v - min) / binSize), binCount - 1);
      bins[idx].count++;
    }
    return bins;
  }, [data, column]);

  if (histData.length === 0) return <p className="text-muted-foreground text-center py-8">No data available.</p>;

  return (
    <ResponsiveContainer width="100%" height={320}>
      <BarChart data={histData} margin={{ top: 10, right: 20, left: 0, bottom: 40 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.3 0 0 / 0.3)" />
        <XAxis dataKey="range" angle={-45} textAnchor="end" tick={{ fontSize: 11, fill: 'oklch(0.6 0 0)' }} />
        <YAxis tick={{ fontSize: 11, fill: 'oklch(0.6 0 0)' }} />
        <Tooltip
          contentStyle={{ background: 'oklch(0.2 0 0)', border: '1px solid oklch(0.3 0 0)', borderRadius: 8 }}
          labelStyle={{ color: 'oklch(0.9 0 0)' }}
          itemStyle={{ color: '#4CAF50' }}
        />
        <Bar dataKey="count" fill="#4CAF50" radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
