import { useState } from 'react';
import { BarChart2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useData } from '@/context/DataContext';
import HistogramChart from '@/components/charts/HistogramChart';
import BoxplotChart from '@/components/charts/BoxplotChart';
import ScatterChartComp from '@/components/charts/ScatterChartComp';
import LineChartComp from '@/components/charts/LineChartComp';
import BarChartComp from '@/components/charts/BarChartComp';
import ViolinPlot from '@/components/charts/ViolinPlot';
import HeatmapChart from '@/components/charts/HeatmapChart';
import PieChartComp from '@/components/charts/PieChartComp';
import TreemapChart from '@/components/charts/TreemapChart';
import Scatter3D from '@/components/charts/Scatter3D';

type ChartType = 'histogram' | 'boxplot' | 'scatter' | 'line' | 'bar' | 'violin' | 'heatmap' | 'pie' | 'treemap' | '3d';

const CHART_OPTIONS: { value: ChartType; label: string }[] = [
  { value: 'histogram', label: '📊 Histogram' },
  { value: 'boxplot', label: '📦 Boxplot' },
  { value: 'scatter', label: '🔵 Scatter Plot' },
  { value: 'line', label: '📈 Line Chart' },
  { value: 'bar', label: '📊 Bar Chart' },
  { value: 'violin', label: '🎻 Violin Plot' },
  { value: 'heatmap', label: '🌡️ Correlation Heatmap' },
  { value: 'pie', label: '🥧 Pie Chart' },
  { value: 'treemap', label: '🗺️ Treemap' },
  { value: '3d', label: '🧊 3D Scatter' },
];

export default function VisualizationHub() {
  const { numericColumns, filteredData } = useData();
  const [chartType, setChartType] = useState<ChartType>('histogram');
  const [xCol, setXCol] = useState(numericColumns[0] || '');
  const [yCol, setYCol] = useState(numericColumns[1] || numericColumns[0] || '');
  const [zCol, setZCol] = useState(numericColumns[2] || numericColumns[0] || '');

  const needsY = ['scatter', 'line', 'bar'].includes(chartType);
  const needsZ = chartType === '3d';

  const renderChart = () => {
    if (!xCol) return <p className="text-muted-foreground text-center py-8">No numeric columns available.</p>;
    switch (chartType) {
      case 'histogram': return <HistogramChart data={filteredData} column={xCol} />;
      case 'boxplot': return <BoxplotChart data={filteredData} column={xCol} />;
      case 'scatter': return <ScatterChartComp data={filteredData} xCol={xCol} yCol={yCol || xCol} />;
      case 'line': return <LineChartComp data={filteredData} xCol={xCol} yCol={yCol || xCol} />;
      case 'bar': return <BarChartComp data={filteredData} xCol={xCol} yCol={yCol || xCol} />;
      case 'violin': return <ViolinPlot data={filteredData} column={xCol} />;
      case 'heatmap': return <HeatmapChart data={filteredData} />;
      case 'pie': return <PieChartComp data={filteredData} column={xCol} />;
      case 'treemap': return <TreemapChart data={filteredData} column={xCol} />;
      case '3d': return <Scatter3D data={filteredData} xCol={xCol} yCol={yCol || xCol} zCol={zCol || xCol} />;
      default: return null;
    }
  };

  return (
    <section>
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold text-foreground flex items-center gap-2">
            <BarChart2 className="h-4 w-4 text-primary" />
            Visualization Hub
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-4 items-end">
            <div className="space-y-1.5 min-w-[180px]">
              <Label className="text-xs text-muted-foreground">Chart Type</Label>
              <Select value={chartType} onValueChange={(v) => setChartType(v as ChartType)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CHART_OPTIONS.map(opt => (
                    <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {chartType !== 'heatmap' && (
              <div className="space-y-1.5 min-w-[150px]">
                <Label className="text-xs text-muted-foreground">
                  {needsY || needsZ ? 'X Column' : 'Column'}
                </Label>
                <Select value={xCol} onValueChange={setXCol}>
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
            )}

            {(needsY || needsZ) && (
              <div className="space-y-1.5 min-w-[150px]">
                <Label className="text-xs text-muted-foreground">Y Column</Label>
                <Select value={yCol} onValueChange={setYCol}>
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
            )}

            {needsZ && (
              <div className="space-y-1.5 min-w-[150px]">
                <Label className="text-xs text-muted-foreground">Z Column</Label>
                <Select value={zCol} onValueChange={setZCol}>
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
            )}
          </div>

          <div className="min-h-[350px]">
            {renderChart()}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
