import { Database, Columns, AlertTriangle } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { useData } from '@/context/DataContext';

export default function SummaryCards() {
  const { data, columns, missingCount } = useData();

  const cards = [
    {
      label: 'Total Rows',
      value: data.length.toLocaleString(),
      icon: Database,
      color: 'text-primary',
      bg: 'bg-primary/10',
    },
    {
      label: 'Total Columns',
      value: columns.length.toLocaleString(),
      icon: Columns,
      color: 'text-blue-400',
      bg: 'bg-blue-400/10',
    },
    {
      label: 'Missing Values',
      value: missingCount.toLocaleString(),
      icon: AlertTriangle,
      color: missingCount > 0 ? 'text-amber-400' : 'text-primary',
      bg: missingCount > 0 ? 'bg-amber-400/10' : 'bg-primary/10',
    },
  ];

  return (
    <section>
      <h2 className="text-sm font-semibold uppercase tracking-widest text-primary mb-3">
        Dataset Summary
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {cards.map(({ label, value, icon: Icon, color, bg }) => (
          <Card key={label} className="border-border bg-card">
            <CardContent className="p-5">
              <div className="flex items-center gap-4">
                <div className={`p-3 rounded-lg ${bg}`}>
                  <Icon className={`h-5 w-5 ${color}`} />
                </div>
                <div>
                  <p className="text-xs text-muted-foreground uppercase tracking-wide">{label}</p>
                  <p className={`text-2xl font-bold font-mono ${color}`}>{value}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </section>
  );
}
