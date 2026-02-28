import { BarChart2, Menu, Sun, Moon } from 'lucide-react';
import { useTheme } from 'next-themes';
import { Button } from '@/components/ui/button';

interface HeaderProps {
  onMenuClick: () => void;
}

export default function Header({ onMenuClick }: HeaderProps) {
  const { theme, setTheme } = useTheme();

  return (
    <header className="sticky top-0 z-30 border-b border-border bg-card/95 backdrop-blur-sm">
      <div className="flex items-center justify-between px-4 py-3 md:px-6">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={onMenuClick}
            aria-label="Toggle sidebar"
          >
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex items-center gap-2">
            <img src="/assets/generated/eda-logo-icon.dim_64x64.png" alt="EDA Logo" className="h-8 w-8" />
            <div>
              <h1 className="text-lg font-bold text-primary leading-tight tracking-tight">
                Advanced EDA Dashboard
              </h1>
              <p className="text-xs text-muted-foreground hidden sm:block">
                Exploratory Data Analysis
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            aria-label="Toggle theme"
            className="rounded-full"
          >
            {theme === 'dark' ? <Sun className="h-5 w-5 text-yellow-400" /> : <Moon className="h-5 w-5" />}
          </Button>
          <div className="hidden md:flex items-center gap-1 text-xs text-muted-foreground">
            <BarChart2 className="h-4 w-4 text-primary" />
            <span>Data Science Toolkit</span>
          </div>
        </div>
      </div>
    </header>
  );
}
