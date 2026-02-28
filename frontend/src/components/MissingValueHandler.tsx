import { useState } from 'react';
import { Wrench } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useData } from '@/context/DataContext';
import { toast } from 'sonner';

type Strategy = 'drop' | 'mean' | 'median';

export default function MissingValueHandler() {
  const { missingCount, applyMissingValueStrategy } = useData();
  const [strategy, setStrategy] = useState<Strategy>('drop');
  const [isApplying, setIsApplying] = useState(false);

  if (missingCount === 0) return null;

  const handleApply = async () => {
    setIsApplying(true);
    try {
      applyMissingValueStrategy(strategy);
      const labels: Record<Strategy, string> = {
        drop: 'Dropped rows with missing values',
        mean: 'Filled missing values with column mean',
        median: 'Filled missing values with column median',
      };
      toast.success(`✅ ${labels[strategy]} successfully!`);
    } catch {
      toast.error('Failed to apply missing value strategy');
    } finally {
      setIsApplying(false);
    }
  };

  return (
    <section>
      <Card className="border-amber-500/30 bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
            <Wrench className="h-4 w-4 text-amber-400" />
            Missing Value Handler
            <span className="ml-2 text-xs font-normal text-amber-400 bg-amber-400/10 px-2 py-0.5 rounded-full">
              {missingCount} missing
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
            <Select value={strategy} onValueChange={(v) => setStrategy(v as Strategy)}>
              <SelectTrigger className="w-full sm:w-56">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="drop">Drop rows with missing values</SelectItem>
                <SelectItem value="mean">Fill with column mean</SelectItem>
                <SelectItem value="median">Fill with column median</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={handleApply}
              disabled={isApplying}
              className="bg-primary text-primary-foreground hover:bg-primary/90 min-h-[44px]"
            >
              {isApplying ? 'Applying...' : 'Apply'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
