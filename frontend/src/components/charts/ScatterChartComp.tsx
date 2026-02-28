import { useMemo } from 'react';
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { DataRow } from '@/context/DataContext';

interface Props {
  data: DataRow[];
  xCol: string;
  yCol: string;
}

export default function ScatterChartComp({ data, xCol, yCol }: Props) {
  const chartData = useMemo(() =>
    data
      .map(r => ({ x: Number(r[xCol]), y: Number(r[yCol]) }))
      .filter(p => !isNaN(p.x) && !isNaN(p.y))
      .slice(0, 500),
    [data, xCol, yCol]
  );

  if (chartData.length === 0) return <p className="text-muted-foreground text-center py-8">No data available.</p>;

  return (
    <ResponsiveContainer width="100%" height={320}>
      <ScatterChart margin={{ top: 10, right: 20, left: 0, bottom: 10 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="oklch(0.3 0 0 / 0.3)" />
        <XAxis dataKey="x" name={xCol} tick={{ fontSize: 11, fill: 'oklch(0.6 0 0)' }} label={{ value: xCol, position: 'insideBottom', offset: -5, fill: 'oklch(0.6 0 0)', fontSize: 11 }} />
        <YAxis dataKey="y" name={yCol} tick={{ fontSize: 11, fill: 'oklch(0.6 0 0)' }} label={{ value: yCol, angle: -90, position: 'insideLeft', fill: 'oklch(0.6 0 0)', fontSize: 11 }} />
        <Tooltip
          cursor={{ strokeDasharray: '3 3' }}
          contentStyle={{ background: 'oklch(0.2 0 0)', border: '1px solid oklch(0.3 0 0)', borderRadius: 8 }}
          labelStyle={{ color: 'oklch(0.9 0 0)' }}
          itemStyle={{ color: '#4CAF50' }}
        />
        <Scatter data={chartData} fill="#4CAF50" opacity={0.7} />
      </ScatterChart>
    </ResponsiveContainer>
  );
}
