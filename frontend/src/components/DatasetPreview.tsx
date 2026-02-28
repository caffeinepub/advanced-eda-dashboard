import { useData } from '@/context/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';

export default function DatasetPreview() {
  const { data, columns } = useData();
  const preview = data.slice(0, 5);

  return (
    <section>
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
            <span className="text-primary">▶</span> Dataset Preview
            <span className="text-xs font-normal text-muted-foreground ml-2">(first 5 rows)</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="w-full">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="border-border hover:bg-transparent">
                    {columns.map(col => (
                      <TableHead
                        key={col.name}
                        className="text-xs font-semibold text-primary uppercase tracking-wide whitespace-nowrap px-4 py-3 bg-muted/30"
                      >
                        {col.name}
                        <span className="ml-1 text-muted-foreground font-normal normal-case">
                          {col.isNumeric ? '(num)' : '(str)'}
                        </span>
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {preview.map((row, i) => (
                    <TableRow key={i} className="border-border hover:bg-muted/20">
                      {columns.map(col => (
                        <TableCell
                          key={col.name}
                          className="text-sm font-mono whitespace-nowrap px-4 py-2"
                        >
                          {row[col.name] === null ? (
                            <span className="text-amber-400 italic">null</span>
                          ) : (
                            String(row[col.name])
                          )}
                        </TableCell>
                      ))}
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
