import { useRef, useState, DragEvent } from 'react';
import { Upload, FileText, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCSVParser } from '@/hooks/useCSVParser';
import { useData } from '@/context/DataContext';
import { toast } from 'sonner';

export default function FileUpload() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { parseFile } = useCSVParser();
  const { setRawData, fileName } = useData();

  const handleFile = async (file: File) => {
    if (!file.name.endsWith('.csv')) {
      toast.error('Please upload a CSV file');
      return;
    }
    setIsLoading(true);
    try {
      const { data, columns } = await parseFile(file);
      setRawData(data, columns, file.name);
      toast.success(`✅ Loaded "${file.name}" — ${data.length} rows, ${columns.length} columns`);
    } catch (err) {
      toast.error('Failed to parse CSV file. Please check the file format.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = '';
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <section>
      <div
        className={`
          relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-200 cursor-pointer
          ${isDragging ? 'border-primary bg-primary/10' : 'border-border hover:border-primary/60 hover:bg-primary/5'}
        `}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          className="hidden"
          onChange={handleInputChange}
        />
        {isLoading ? (
          <div className="flex flex-col items-center gap-3">
            <Loader2 className="h-10 w-10 text-primary animate-spin" />
            <p className="text-sm text-muted-foreground">Parsing CSV file...</p>
          </div>
        ) : fileName ? (
          <div className="flex flex-col items-center gap-3">
            <FileText className="h-10 w-10 text-primary" />
            <div>
              <p className="font-medium text-foreground">{fileName}</p>
              <p className="text-sm text-muted-foreground mt-1">Click or drag to replace</p>
            </div>
            <Button variant="outline" size="sm" className="mt-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground">
              Replace File
            </Button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3">
            <Upload className="h-10 w-10 text-primary" />
            <div>
              <p className="font-semibold text-foreground text-lg">Upload CSV File</p>
              <p className="text-sm text-muted-foreground mt-1">Drag & drop or click to browse</p>
            </div>
            <Button variant="outline" size="sm" className="mt-2 border-primary text-primary hover:bg-primary hover:text-primary-foreground">
              Choose File
            </Button>
          </div>
        )}
      </div>
    </section>
  );
}
