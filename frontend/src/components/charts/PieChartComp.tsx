import { useMemo } from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { DataRow } from '@/context/DataContext';

interface Props {
  data: DataRow[];
  column: string;
}

const COLORS = ['#4CAF50', '#2196F3', '#FF9800', '#E91E63', '#9C27B0', '#00BCD4', '#FF5722', '#607D8B'];

export default function PieChartComp({ data, column }: Props) {
  const chartData = useMemo(() => {
    const vals = data.map(r => Number(r[column])).filter(v => !isNaN(v));
    if (vals.length === 0) return [];
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    const binCount = Math.min(8, Math.ceil(Math.sqrt(vals.length)));
    const binSize = (max - min) / binCount || 1;
    const bins: Record<string, number> = {};
    for (const v of vals) {
      const idx = Math.min(Math.floor((v - min) / binSize), binCount - 1);
      const label = `${(min + idx * binSize).toFixed(1)}–${(min + (idx + 1) * binSize).toFixed(1)}`;
      bins[label] = (bins[label] || 0) + 1;
    }
    return Object.entries(bins).map(([name, value]) => ({ name, value }));
  }, [data, column]);

  if (chartData.length === 0) return <p className="text-muted-foreground text-center py-8">No data available.</p>;

  return (
    <ResponsiveContainer width="100%" height={320}>
      <PieChart>
        <Pie
          data={chartData}
          cx="50%"
          cy="50%"
          outerRadius={110}
          dataKey="value"
          label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
          labelLine={false}
        >
          {chartData.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          contentStyle={{ background: 'oklch(0.2 0 0)', border: '1px solid oklch(0.3 0 0)', borderRadius: 8 }}
          itemStyle={{ color: '#4CAF50' }}
        />
        <Legend wrapperStyle={{ fontSize: 11, color: 'oklch(0.6 0 0)' }} />
      </PieChart>
    </ResponsiveContainer>
  );
}
