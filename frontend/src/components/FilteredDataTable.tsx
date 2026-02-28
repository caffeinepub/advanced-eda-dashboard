import { useData } from '@/context/DataContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';

export default function FilteredDataTable() {
  const { filteredData, data, columns, selectedFilterColumn, filterRange } = useData();
  const displayRows = filteredData.slice(0, 50);

  return (
    <section>
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2 flex-wrap">
            <span className="text-primary">▶</span> Filtered Data
            <Badge variant="secondary" className="font-mono text-xs">
              {filteredData.length} / {data.length} rows
            </Badge>
            {selectedFilterColumn && (
              <span className="text-xs text-muted-foreground font-normal">
                {selectedFilterColumn}: [{filterRange[0].toFixed(2)}, {filterRange[1].toFixed(2)}]
              </span>
            )}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <ScrollArea className="w-full max-h-72">
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
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {displayRows.map((row, i) => (
                    <TableRow key={i} className="border-border hover:bg-muted/20">
                      {columns.map(col => (
                        <TableCell key={col.name} className="text-sm font-mono whitespace-nowrap px-4 py-2">
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
          {filteredData.length > 50 && (
            <p className="text-xs text-muted-foreground text-center py-2">
              Showing first 50 of {filteredData.length} rows
            </p>
          )}
        </CardContent>
      </Card>
    </section>
  );
}
