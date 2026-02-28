import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { useData } from '@/context/DataContext';
import { useMemo } from 'react';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { numericColumns, data, selectedFilterColumn, filterRange, setFilterColumn, setFilterRange } = useData();

  const colMinMax = useMemo(() => {
    if (!selectedFilterColumn || data.length === 0) return { min: 0, max: 100 };
    const vals = data.map(r => Number(r[selectedFilterColumn])).filter(v => !isNaN(v));
    if (vals.length === 0) return { min: 0, max: 100 };
    return { min: Math.min(...vals), max: Math.max(...vals) };
  }, [selectedFilterColumn, data]);

  const hasData = data.length > 0;

  return (
    <aside
      className={`
        fixed md:static inset-y-0 left-0 z-30
        w-72 bg-card border-r border-border
        flex flex-col
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        md:flex
      `}
    >
      <div className="flex items-center justify-between p-4 border-b border-border md:hidden">
        <span className="font-semibold text-foreground">Filters</span>
        <Button variant="ghost" size="icon" onClick={onClose}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        <div>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-primary mb-4">
            Filter Data
          </h2>

          {!hasData ? (
            <p className="text-sm text-muted-foreground">Upload a CSV file to enable filters.</p>
          ) : (
            <div className="space-y-5">
              <div className="space-y-2">
                <Label className="text-sm text-foreground">Numeric Column</Label>
                <Select
                  value={selectedFilterColumn}
                  onValueChange={setFilterColumn}
                >
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select column" />
                  </SelectTrigger>
                  <SelectContent>
                    {numericColumns.map(col => (
                      <SelectItem key={col} value={col}>{col}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {selectedFilterColumn && (
                <div className="space-y-3">
                  <Label className="text-sm text-foreground">Value Range</Label>
                  <Slider
                    min={colMinMax.min}
                    max={colMinMax.max}
                    step={(colMinMax.max - colMinMax.min) / 100 || 1}
                    value={[filterRange[0], filterRange[1]]}
                    onValueChange={(vals) => setFilterRange([vals[0], vals[1]])}
                    className="w-full"
                  />
                  <div className="flex justify-between text-xs text-muted-foreground font-mono">
                    <span>{filterRange[0].toFixed(2)}</span>
                    <span>{filterRange[1].toFixed(2)}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="border-t border-border pt-4">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-primary mb-3">
            Quick Tips
          </h2>
          <ul className="text-xs text-muted-foreground space-y-2">
            <li>• Upload any CSV file to begin analysis</li>
            <li>• Use the range slider to filter rows</li>
            <li>• Try the chatbot for data questions</li>
            <li>• Switch themes with the sun/moon icon</li>
          </ul>
        </div>
      </div>
    </aside>
  );
}
