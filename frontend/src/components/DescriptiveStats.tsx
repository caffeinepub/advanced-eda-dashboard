import { useData } from '@/context/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';

const fmt = (n: number) => isNaN(n) ? '—' : n.toFixed(4);

export default function DescriptiveStats() {
  const { stats } = useData();

  if (stats.length === 0) return null;

  return (
    <section>
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
            <span className="text-primary">▶</span> Descriptive Statistics
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="w-full">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    {['Column', 'Count', 'Mean', 'Std', 'Min', 'Q1', 'Median', 'Q3', 'Max'].map(h => (
                      <TableHead
                        key={h}
                        className="text-xs font-semibold text-primary uppercase tracking-wide whitespace-nowrap px-4 py-3 bg-muted/30"
                      >
                        {h}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {stats.map(s => (
                    <TableRow key={s.column} className="border-border hover:bg-muted/20">
                      <TableCell className="font-semibold text-foreground whitespace-nowrap px-4 py-2">{s.column}</TableCell>
                      <TableCell className="font-mono text-sm px-4 py-2">{s.count}</TableCell>
                      <TableCell className="font-mono text-sm px-4 py-2">{fmt(s.mean)}</TableCell>
                      <TableCell className="font-mono text-sm px-4 py-2">{fmt(s.std)}</TableCell>
                      <TableCell className="font-mono text-sm px-4 py-2">{fmt(s.min)}</TableCell>
                      <TableCell className="font-mono text-sm px-4 py-2">{fmt(s.q1)}</TableCell>
                      <TableCell className="font-mono text-sm px-4 py-2">{fmt(s.median)}</TableCell>
                      <TableCell className="font-mono text-sm px-4 py-2">{fmt(s.q3)}</TableCell>
                      <TableCell className="font-mono text-sm px-4 py-2">{fmt(s.max)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </section>
  );
}
