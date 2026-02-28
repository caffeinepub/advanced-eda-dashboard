import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DataRow } from '@/context/DataContext';

interface Props {
  data: DataRow[];
  xCol: string;
  yCol: string;
}

export default function LineChartComp({ data, xCol, yCol }: Props) {
  const chartData = useMemo(() =>
    data
      .map((r, i) => ({ x: Number(r[xCol]) || i, y: Number(r[yCol]) }))
      .filter(p => !isNaN(p.y))
      .slice(0, 300),
    [data, xCol, yCol]
  );

  if (chartData.length === 0) return <p className="text-muted-foreground text-center py-8">No data available.</p>;

  return (
    <ResponsiveContainer width="100%" height={320}>
      <LineChart data={chartData} margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.3 0 0 / 0.3)" />
        <XAxis dataKey="x" tick={{ fontSize: 11, fill: 'oklch(0.6 0 0)' }} label={{ value: xCol, position: 'insideBottom', offset: -5, fill: 'oklch(0.6 0 0)', fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11, fill: 'oklch(0.6 0 0)' }} label={{ value: yCol, angle: -90, position: 'insideLeft', fill: 'oklch(0.6 0 0)', fontSize: 11 }} />
        <Tooltip
          contentStyle={{ background: 'oklch(0.2 0 0)', border: '1px solid oklch(0.3 0 0)', borderRadius: 8 }}
          labelStyle={{ color: 'oklch(0.9 0 0)' }}
          itemStyle={{ color: '#4CAF50' }}
        />
        <Line type="monotone" dataKey="y" stroke="#4CAF50" dot={false} strokeWidth={2} />
      </LineChart>
    </ResponsiveContainer>
  );
}
