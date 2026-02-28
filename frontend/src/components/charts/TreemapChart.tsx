import { useMemo } from 'react';
import { Treemap, ResponsiveContainer, Tooltip } from 'recharts';
import { DataRow } from '@/context/DataContext';

interface Props {
  data: DataRow[];
  column: string;
}

const COLORS = ['#4CAF50', '#2196F3', '#FF9800', '#E91E63', '#9C27B0', '#00BCD4', '#FF5722', '#607D8B'];

interface CustomContentProps {
  x?: number;
  y?: number;
  width?: number;
  height?: number;
  name?: string;
  fill?: string;
  index?: number;
}

function CustomContent(props: CustomContentProps) {
  const { x = 0, y = 0, width = 0, height = 0, name = '', index = 0 } = props;
  const fill = COLORS[index % COLORS.length];
  return (
    <g>
      <rect x={x} y={y} width={width} height={height} fill={fill} stroke="oklch(0.15 0 0)" strokeWidth={2} rx={4} />
      {width > 40 && height > 20 && (
        <text
          x={x + width / 2}
          y={y + height / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#fff"
          fontSize={Math.min(12, width / 6)}
        >
          {name}
        </text>
      )}
    </g>
  );
}

export default function TreemapChart({ data, column }: Props) {
  const chartData = useMemo(() => {
    const vals = data.map(r => Number(r[column])).filter(v => !isNaN(v) && v > 0);
    if (vals.length === 0) return [];
    const min = Math.min(...vals);
    const max = Math.max(...vals);
    const binCount = Math.min(8, Math.ceil(Math.sqrt(vals.length)));
    const binSize = (max - min) / binCount || 1;
    const bins: Record<string, number> = {};
    for (const v of vals) {
      const idx = Math.min(Math.floor((v - min) / binSize), binCount - 1);
      const label = `${(min + idx * binSize).toFixed(1)}`;
      bins[label] = (bins[label] || 0) + 1;
    }
    return Object.entries(bins).map(([name, size]) => ({ name, size }));
  }, [data, column]);

  if (chartData.length === 0) {
    return (
      <p className="text-muted-foreground text-center py-8">
        No data available (values must be positive).
      </p>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={320}>
      <Treemap
        data={chartData}
        dataKey="size"
        aspectRatio={4 / 3}
        content={<CustomContent />}
      >
        <Tooltip
          contentStyle={{
            background: 'oklch(0.2 0 0)',
            border: '1px solid oklch(0.3 0 0)',
            borderRadius: 8,
          }}
          itemStyle={{ color: '#4CAF50' }}
        />
      </Treemap>
    </ResponsiveContainer>
  );
}
