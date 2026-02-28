import { createContext, useContext, useState, useCallback, useMemo, ReactNode } from 'react';

export type DataRow = Record<string, string | number | null>;

export interface ColumnMeta {
  name: string;
  isNumeric: boolean;
}

export interface ColumnStats {
  column: string;
  count: number;
  mean: number;
  std: number;
  min: number;
  q1: number;
  median: number;
  q3: number;
  max: number;
}

export interface DataContextType {
  rawData: DataRow[];
  data: DataRow[];
  filteredData: DataRow[];
  columns: ColumnMeta[];
  numericColumns: string[];
  stats: ColumnStats[];
  missingCount: number;
  fileName: string;
  selectedFilterColumn: string;
  filterRange: [number, number];
  setRawData: (data: DataRow[], cols: ColumnMeta[], fileName: string) => void;
  applyMissingValueStrategy: (strategy: 'drop' | 'mean' | 'median') => void;
  setFilterColumn: (col: string) => void;
  setFilterRange: (range: [number, number]) => void;
  getColumnStats: (col: string) => ColumnStats | undefined;
  getRowCount: () => number;
  getColumnCount: () => number;
  getColumnNames: () => string[];
  getMissingValueCount: () => number;
  getMissingPerColumn: () => Record<string, number>;
}

const DataContext = createContext<DataContextType | undefined>(undefined);

function computeStats(data: DataRow[], numericCols: string[]): ColumnStats[] {
  return numericCols.map(col => {
    const vals = data
      .map(r => r[col])
      .filter(v => v !== null && v !== '' && !isNaN(Number(v)))
      .map(Number)
      .sort((a, b) => a - b);

    if (vals.length === 0) {
      return { column: col, count: 0, mean: 0, std: 0, min: 0, q1: 0, median: 0, q3: 0, max: 0 };
    }

    const count = vals.length;
    const mean = vals.reduce((a, b) => a + b, 0) / count;
    const variance = vals.reduce((a, b) => a + (b - mean) ** 2, 0) / count;
    const std = Math.sqrt(variance);
    const min = vals[0];
    const max = vals[count - 1];
    const q1 = vals[Math.floor(count * 0.25)];
    const median = count % 2 === 0
      ? (vals[count / 2 - 1] + vals[count / 2]) / 2
      : vals[Math.floor(count / 2)];
    const q3 = vals[Math.floor(count * 0.75)];

    return { column: col, count, mean, std, min, q1, median, q3, max };
  });
}

function countMissing(data: DataRow[]): number {
  let count = 0;
  for (const row of data) {
    for (const val of Object.values(row)) {
      if (val === null || val === '' || (typeof val === 'number' && isNaN(val))) count++;
    }
  }
  return count;
}

function applyFilter(data: DataRow[], col: string, range: [number, number]): DataRow[] {
  if (!col) return data;
  return data.filter(row => {
    const val = Number(row[col]);
    return !isNaN(val) && val >= range[0] && val <= range[1];
  });
}

export function DataProvider({ children }: { children: ReactNode }) {
  const [rawData, setRawDataState] = useState<DataRow[]>([]);
  const [data, setData] = useState<DataRow[]>([]);
  const [columns, setColumns] = useState<ColumnMeta[]>([]);
  const [fileName, setFileName] = useState('');
  const [selectedFilterColumn, setSelectedFilterColumn] = useState('');
  const [filterRange, setFilterRangeState] = useState<[number, number]>([0, 0]);

  const numericColumns = useMemo(() => columns.filter(c => c.isNumeric).map(c => c.name), [columns]);
  const stats = useMemo(() => computeStats(data, numericColumns), [data, numericColumns]);
  const missingCount = useMemo(() => countMissing(data), [data]);

  const filteredData = useMemo(
    () => applyFilter(data, selectedFilterColumn, filterRange),
    [data, selectedFilterColumn, filterRange]
  );

  const setRawData = useCallback((newData: DataRow[], cols: ColumnMeta[], name: string) => {
    setRawDataState(newData);
    setData(newData);
    setColumns(cols);
    setFileName(name);
    const numCols = cols.filter(c => c.isNumeric).map(c => c.name);
    if (numCols.length > 0) {
      const firstCol = numCols[0];
      const vals = newData.map(r => Number(r[firstCol])).filter(v => !isNaN(v));
      const min = Math.min(...vals);
      const max = Math.max(...vals);
      setSelectedFilterColumn(firstCol);
      setFilterRangeState([min, max]);
    }
  }, []);

  const applyMissingValueStrategy = useCallback((strategy: 'drop' | 'mean' | 'median') => {
    setData(prev => {
      const numCols = columns.filter(c => c.isNumeric).map(c => c.name);
      if (strategy === 'drop') {
        return prev.filter(row =>
          Object.values(row).every(v => v !== null && v !== '' && !(typeof v === 'number' && isNaN(v)))
        );
      }
      // Compute column means/medians
      const colAggregates: Record<string, number> = {};
      for (const col of numCols) {
        const vals = prev
          .map(r => r[col])
          .filter(v => v !== null && v !== '' && !isNaN(Number(v)))
          .map(Number)
          .sort((a, b) => a - b);
        if (vals.length === 0) { colAggregates[col] = 0; continue; }
        if (strategy === 'mean') {
          colAggregates[col] = vals.reduce((a, b) => a + b, 0) / vals.length;
        } else {
          const mid = Math.floor(vals.length / 2);
          colAggregates[col] = vals.length % 2 === 0 ? (vals[mid - 1] + vals[mid]) / 2 : vals[mid];
        }
      }
      return prev.map(row => {
        const newRow = { ...row };
        for (const col of numCols) {
          if (newRow[col] === null || newRow[col] === '' || (typeof newRow[col] === 'number' && isNaN(newRow[col] as number))) {
            newRow[col] = colAggregates[col];
          }
        }
        return newRow;
      });
    });
  }, [columns]);

  const setFilterColumn = useCallback((col: string) => {
    setSelectedFilterColumn(col);
    setData(prev => {
      const vals = prev.map(r => Number(r[col])).filter(v => !isNaN(v));
      if (vals.length > 0) {
        setFilterRangeState([Math.min(...vals), Math.max(...vals)]);
      }
      return prev;
    });
  }, []);

  const setFilterRange = useCallback((range: [number, number]) => {
    setFilterRangeState(range);
  }, []);

  const getColumnStats = useCallback((col: string) => stats.find(s => s.column === col), [stats]);
  const getRowCount = useCallback(() => data.length, [data]);
  const getColumnCount = useCallback(() => columns.length, [columns]);
  const getColumnNames = useCallback(() => columns.map(c => c.name), [columns]);
  const getMissingValueCount = useCallback(() => missingCount, [missingCount]);
  const getMissingPerColumn = useCallback(() => {
    const result: Record<string, number> = {};
    for (const col of columns) {
      result[col.name] = data.filter(r => r[col.name] === null || r[col.name] === '' || (typeof r[col.name] === 'number' && isNaN(r[col.name] as number))).length;
    }
    return result;
  }, [data, columns]);

  const value: DataContextType = {
    rawData, data, filteredData, columns, numericColumns, stats, missingCount, fileName,
    selectedFilterColumn, filterRange,
    setRawData, applyMissingValueStrategy, setFilterColumn, setFilterRange,
    getColumnStats, getRowCount, getColumnCount, getColumnNames, getMissingValueCount, getMissingPerColumn,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error('useData must be used within DataProvider');
  return ctx;
}
