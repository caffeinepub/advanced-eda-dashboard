import { useState, useCallback } from 'react';
import { useData } from '@/context/DataContext';

export interface ChatMessage {
  id: string;
  role: 'user' | 'bot';
  text: string;
  timestamp: Date;
}

function parseIntent(question: string): { intent: string; entity?: string } {
  const q = question.toLowerCase().trim();

  if (/how many rows|number of rows|row count|total rows/.test(q)) return { intent: 'row_count' };
  if (/how many columns|number of columns|column count|total columns/.test(q)) return { intent: 'col_count' };
  if (/column names|list columns|what columns|show columns|all columns/.test(q)) return { intent: 'col_names' };
  if (/missing values?|null values?|nan values?|empty values?/.test(q)) {
    // Check if asking about a specific column
    const colMatch = q.match(/missing.*?(?:in|for|of)\s+["']?([a-z0-9_\s]+)["']?/i);
    if (colMatch) return { intent: 'missing_per_col', entity: colMatch[1].trim() };
    return { intent: 'missing_total' };
  }
  if (/mean|average/.test(q)) {
    const colMatch = q.match(/(?:mean|average)\s+(?:of\s+)?["']?([a-z0-9_\s]+)["']?/i);
    return { intent: 'mean', entity: colMatch?.[1]?.trim() };
  }
  if (/\bmax(?:imum)?\b/.test(q)) {
    const colMatch = q.match(/max(?:imum)?\s+(?:of\s+)?["']?([a-z0-9_\s]+)["']?/i);
    return { intent: 'max', entity: colMatch?.[1]?.trim() };
  }
  if (/\bmin(?:imum)?\b/.test(q)) {
    const colMatch = q.match(/min(?:imum)?\s+(?:of\s+)?["']?([a-z0-9_\s]+)["']?/i);
    return { intent: 'min', entity: colMatch?.[1]?.trim() };
  }
  if (/std|standard deviation/.test(q)) {
    const colMatch = q.match(/(?:std|standard deviation)\s+(?:of\s+)?["']?([a-z0-9_\s]+)["']?/i);
    return { intent: 'std', entity: colMatch?.[1]?.trim() };
  }
  if (/median/.test(q)) {
    const colMatch = q.match(/median\s+(?:of\s+)?["']?([a-z0-9_\s]+)["']?/i);
    return { intent: 'median', entity: colMatch?.[1]?.trim() };
  }
  if (/data type|dtype|type of/.test(q)) {
    const colMatch = q.match(/(?:type of|dtype of?)\s+["']?([a-z0-9_\s]+)["']?/i);
    return { intent: 'dtype', entity: colMatch?.[1]?.trim() };
  }
  if (/numeric columns|numerical columns/.test(q)) return { intent: 'numeric_cols' };
  if (/describe|summary|statistics|stats/.test(q)) return { intent: 'describe' };
  if (/file name|filename|dataset name/.test(q)) return { intent: 'filename' };

  return { intent: 'unknown' };
}

function findColumn(entity: string | undefined, columns: string[]): string | undefined {
  if (!entity) return undefined;
  const lower = entity.toLowerCase();
  return columns.find(c => c.toLowerCase() === lower) ||
    columns.find(c => c.toLowerCase().includes(lower)) ||
    columns.find(c => lower.includes(c.toLowerCase()));
}

export function useChatbot() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '0',
      role: 'bot',
      text: '👋 Hi! I\'m your EDA assistant. Upload a CSV file and ask me questions like:\n• "How many rows are there?"\n• "What are the column names?"\n• "What is the mean of column_name?"\n• "How many missing values are there?"',
      timestamp: new Date(),
    }
  ]);

  const { data, columns, numericColumns, stats, missingCount, fileName, getMissingPerColumn } = useData();

  const processQuestion = useCallback((question: string): string => {
    if (data.length === 0) {
      return '📂 Please upload a CSV file first so I can answer questions about your data!';
    }

    const { intent, entity } = parseIntent(question);

    switch (intent) {
      case 'row_count':
        return `📊 Your dataset has **${data.length.toLocaleString()} rows**.`;

      case 'col_count':
        return `📋 Your dataset has **${columns.length} columns**.`;

      case 'col_names':
        return `📋 The columns are:\n${columns.map(c => `• ${c.name} (${c.isNumeric ? 'numeric' : 'text'})`).join('\n')}`;

      case 'numeric_cols':
        return numericColumns.length > 0
          ? `🔢 Numeric columns:\n${numericColumns.map(c => `• ${c}`).join('\n')}`
          : '❌ No numeric columns found.';

      case 'missing_total':
        return missingCount === 0
          ? '✅ Great news! There are **no missing values** in your dataset.'
          : `⚠️ There are **${missingCount} missing values** across the entire dataset.`;

      case 'missing_per_col': {
        const perCol = getMissingPerColumn();
        const col = findColumn(entity, columns.map(c => c.name));
        if (col) {
          const count = perCol[col] ?? 0;
          return count === 0
            ? `✅ Column **${col}** has no missing values.`
            : `⚠️ Column **${col}** has **${count} missing values**.`;
        }
        // Show all columns with missing values
        const missing = Object.entries(perCol).filter(([, v]) => v > 0);
        if (missing.length === 0) return '✅ No missing values in any column!';
        return `⚠️ Missing values per column:\n${missing.map(([c, v]) => `• ${c}: ${v}`).join('\n')}`;
      }

      case 'mean': {
        const col = findColumn(entity, numericColumns);
        if (!col) return `❓ I couldn't find a numeric column matching "${entity}". Available: ${numericColumns.join(', ')}`;
        const s = stats.find(s => s.column === col);
        return s ? `📈 Mean of **${col}**: **${s.mean.toFixed(4)}**` : '❌ Could not compute mean.';
      }

      case 'max': {
        const col = findColumn(entity, numericColumns);
        if (!col) return `❓ I couldn't find a numeric column matching "${entity}". Available: ${numericColumns.join(', ')}`;
        const s = stats.find(s => s.column === col);
        return s ? `📈 Maximum of **${col}**: **${s.max.toFixed(4)}**` : '❌ Could not compute max.';
      }

      case 'min': {
        const col = findColumn(entity, numericColumns);
        if (!col) return `❓ I couldn't find a numeric column matching "${entity}". Available: ${numericColumns.join(', ')}`;
        const s = stats.find(s => s.column === col);
        return s ? `📉 Minimum of **${col}**: **${s.min.toFixed(4)}**` : '❌ Could not compute min.';
      }

      case 'std': {
        const col = findColumn(entity, numericColumns);
        if (!col) return `❓ I couldn't find a numeric column matching "${entity}". Available: ${numericColumns.join(', ')}`;
        const s = stats.find(s => s.column === col);
        return s ? `📊 Std deviation of **${col}**: **${s.std.toFixed(4)}**` : '❌ Could not compute std.';
      }

      case 'median': {
        const col = findColumn(entity, numericColumns);
        if (!col) return `❓ I couldn't find a numeric column matching "${entity}". Available: ${numericColumns.join(', ')}`;
        const s = stats.find(s => s.column === col);
        return s ? `📊 Median of **${col}**: **${s.median.toFixed(4)}**` : '❌ Could not compute median.';
      }

      case 'dtype': {
        const col = findColumn(entity, columns.map(c => c.name));
        if (!col) return `❓ Column "${entity}" not found. Available: ${columns.map(c => c.name).join(', ')}`;
        const colMeta = columns.find(c => c.name === col);
        return `🔍 Column **${col}** is **${colMeta?.isNumeric ? 'numeric (float/int)' : 'text/categorical'}**.`;
      }

      case 'describe': {
        if (stats.length === 0) return '❌ No numeric columns to describe.';
        const top3 = stats.slice(0, 3);
        return `📊 Quick stats for first ${top3.length} numeric column(s):\n${top3.map(s =>
          `**${s.column}**: mean=${s.mean.toFixed(2)}, min=${s.min.toFixed(2)}, max=${s.max.toFixed(2)}`
        ).join('\n')}`;
      }

      case 'filename':
        return fileName ? `📁 The loaded file is: **${fileName}**` : '❓ No file loaded yet.';

      default:
        return `🤔 I'm not sure how to answer that. Try asking:\n• "How many rows?"\n• "What are the column names?"\n• "Mean of [column]"\n• "Missing values in [column]"\n• "Max of [column]"`;
    }
  }, [data, columns, numericColumns, stats, missingCount, fileName, getMissingPerColumn]);

  const sendMessage = useCallback((text: string) => {
    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text,
      timestamp: new Date(),
    };
    const botResponse = processQuestion(text);
    const botMsg: ChatMessage = {
      id: (Date.now() + 1).toString(),
      role: 'bot',
      text: botResponse,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, userMsg, botMsg]);
  }, [processQuestion]);

  return { messages, sendMessage };
}
