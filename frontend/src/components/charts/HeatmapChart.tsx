import { useMemo } from 'react';
import { DataRow } from '@/context/DataContext';
import { useData } from '@/context/DataContext';
import { ScrollArea } from '@/components/ui/scroll-area';

interface Props {
  data: DataRow[];
}

function pearson(xs: number[], ys: number[]): number {
  const n = xs.length;
  if (n === 0) return 0;
  const mx = xs.reduce((a, b) => a + b, 0) / n;
  const my = ys.reduce((a, b) => a + b, 0) / n;
  const num = xs.reduce((s, x, i) => s + (x - mx) * (ys[i] - my), 0);
  const dx = Math.sqrt(xs.reduce((s, x) => s + (x - mx) ** 2, 0));
  const dy = Math.sqrt(ys.reduce((s, y) => s + (y - my) ** 2, 0));
  return dx && dy ? num / (dx * dy) : 0;
}

function corrColor(r: number): string {
  // -1 = blue, 0 = neutral, 1 = green
  if (r > 0) {
    const g = Math.round(79 + r * 176);
    const b = Math.round(80 - r * 80);
    return `rgb(30, ${g}, ${b})`;
  } else {
    const b = Math.round(80 + Math.abs(r) * 175);
    const g = Math.round(79 - Math.abs(r) * 50);
    return `rgb(30, ${g}, ${b})`;
  }
}

export default function HeatmapChart({ data }: Props) {
  const { numericColumns } = useData();

  const matrix = useMemo(() => {
    const cols = numericColumns.slice(0, 12); // limit for readability
    const colData = cols.map(col =>
      data.map(r => Number(r[col])).filter(v => !isNaN(v))
    );
    return cols.map((_, i) =>
      cols.map((_, j) => {
        const xs = data.map(r => Number(r[cols[i]]));
        const ys = data.map(r => Number(r[cols[j]]));
        const pairs = xs.map((x, k) => [x, ys[k]]).filter(([a, b]) => !isNaN(a) && !isNaN(b));
        return pearson(pairs.map(p => p[0]), pairs.map(p => p[1]));
      })
    );
  }, [data, numericColumns]);

  const cols = numericColumns.slice(0, 12);

  if (cols.length < 2) {
    return <p className="text-muted-foreground text-center py-8">Need at least 2 numeric columns for a heatmap.</p>;
  }

  const cellSize = Math.max(40, Math.min(70, Math.floor(500 / cols.length)));

  return (
    <div className="space-y-3">
      <ScrollArea className="w-full">
        <div className="overflow-x-auto pb-2">
          <div style={{ display: 'grid', gridTemplateColumns: `80px repeat(${cols.length}, ${cellSize}px)`, gap: 2 }}>
            {/* Header row */}
            <div />
            {cols.map(col => (
              <div
                key={col}
                className="text-center text-xs font-mono text-muted-foreground truncate"
                style={{ width: cellSize, fontSize: 10, padding: '2px 0' }}
                title={col}
              >
                {col.length > 8 ? col.slice(0, 7) + '…' : col}
              </div>
            ))}
            {/* Data rows */}
            {cols.map((rowCol, i) => (
              <>
                <div
                  key={`row-${rowCol}`}
                  className="text-right text-xs font-mono text-muted-foreground truncate pr-2 flex items-center justify-end"
                  style={{ fontSize: 10 }}
                  title={rowCol}
                >
                  {rowCol.length > 10 ? rowCol.slice(0, 9) + '…' : rowCol}
                </div>
                {cols.map((_, j) => {
                  const r = matrix[i]?.[j] ?? 0;
                  return (
                    <div
                      key={`${i}-${j}`}
                      style={{
                        width: cellSize,
                        height: cellSize,
                        background: corrColor(r),
                        borderRadius: 4,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: Math.max(8, cellSize / 5),
                        fontFamily: 'monospace',
                        color: Math.abs(r) > 0.5 ? '#fff' : 'oklch(0.7 0 0)',
                        fontWeight: 600,
                      }}
                      title={`${cols[i]} vs ${cols[j]}: ${r.toFixed(3)}`}
                    >
                      {r.toFixed(2)}
                    </div>
                  );
                })}
              </>
            ))}
          </div>
        </div>
      </ScrollArea>
      {/* Legend */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span>-1</span>
        <div className="flex-1 h-3 rounded" style={{ background: 'linear-gradient(to right, rgb(30,29,255), rgb(30,79,80), rgb(30,255,0))' }} />
        <span>+1</span>
        <span className="ml-2">Pearson correlation</span>
      </div>
    </div>
  );
}
