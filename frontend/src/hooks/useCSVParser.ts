import { useCallback } from 'react';
import { DataRow, ColumnMeta } from '@/context/DataContext';

function parseCSVText(text: string): { headers: string[]; rows: string[][] } {
  const lines = text.split(/\r?\n/).filter(l => l.trim() !== '');
  if (lines.length === 0) return { headers: [], rows: [] };

  const parseRow = (line: string): string[] => {
    const result: string[] = [];
    let current = '';
    let inQuotes = false;
    for (let i = 0; i < line.length; i++) {
      const ch = line[i];
      if (ch === '"') {
        if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
        else inQuotes = !inQuotes;
      } else if (ch === ',' && !inQuotes) {
        result.push(current.trim());
        current = '';
      } else {
        current += ch;
      }
    }
    result.push(current.trim());
    return result;
  };

  const headers = parseRow(lines[0]);
  const rows = lines.slice(1).map(parseRow);
  return { headers, rows };
}

function detectNumeric(values: string[]): boolean {
  const nonEmpty = values.filter(v => v !== '' && v !== null && v !== undefined);
  if (nonEmpty.length === 0) return false;
  const numericCount = nonEmpty.filter(v => !isNaN(Number(v)) && v !== '').length;
  return numericCount / nonEmpty.length > 0.8;
}

export function useCSVParser() {
  const parseFile = useCallback((file: File): Promise<{ data: DataRow[]; columns: ColumnMeta[] }> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const { headers, rows } = parseCSVText(text);

          if (headers.length === 0) {
            reject(new Error('Empty CSV file'));
            return;
          }

          // Detect column types
          const columnSamples: Record<string, string[]> = {};
          for (const h of headers) columnSamples[h] = [];
          for (const row of rows.slice(0, 100)) {
            headers.forEach((h, i) => {
              if (row[i] !== undefined) columnSamples[h].push(row[i]);
            });
          }

          const columns: ColumnMeta[] = headers.map(h => ({
            name: h,
            isNumeric: detectNumeric(columnSamples[h]),
          }));

          const data: DataRow[] = rows.map(row => {
            const obj: DataRow = {};
            headers.forEach((h, i) => {
              const val = row[i] ?? '';
              const col = columns.find(c => c.name === h);
              if (col?.isNumeric) {
                obj[h] = val === '' ? null : isNaN(Number(val)) ? null : Number(val);
              } else {
                obj[h] = val === '' ? null : val;
              }
            });
            return obj;
          });

          resolve({ data, columns });
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }, []);

  return { parseFile };
}
