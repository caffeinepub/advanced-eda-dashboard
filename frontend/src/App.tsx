import { useState, useCallback } from 'react';
import { ThemeProvider } from 'next-themes';
import { Toaster } from '@/components/ui/sonner';
import { DataProvider } from '@/context/DataContext';
import Header from '@/components/Header';
import Sidebar from '@/components/Sidebar';
import MainContent from '@/components/MainContent';
import Chatbot from '@/components/Chatbot';

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = useCallback(() => setSidebarOpen(prev => !prev), []);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <DataProvider>
        <div className="min-h-screen bg-background text-foreground flex flex-col">
          <Header onMenuClick={toggleSidebar} />
          <div className="flex flex-1 overflow-hidden">
            <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
            {/* Overlay for mobile */}
            {sidebarOpen && (
              <div
                className="fixed inset-0 z-20 bg-black/50 md:hidden"
                onClick={closeSidebar}
              />
            )}
            <main className="flex-1 overflow-y-auto p-4 md:p-6">
              <MainContent />
            </main>
          </div>
          <footer className="border-t border-border py-4 px-6 text-center text-sm text-muted-foreground">
            <span>
              © {new Date().getFullYear()} Advanced EDA Dashboard &mdash; Built with{' '}
              <span className="text-primary">♥</span> using{' '}
              <a
                href={`https://caffeine.ai/?utm_source=Caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== 'undefined' ? window.location.hostname : 'eda-dashboard')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:underline font-medium"
              >
                caffeine.ai
              </a>
            </span>
          </footer>
          <Chatbot />
          <Toaster richColors position="top-right" />
        </div>
      </DataProvider>
    </ThemeProvider>
  );
}
