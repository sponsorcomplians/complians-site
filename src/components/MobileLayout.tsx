import React, { useEffect, useState } from 'react';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Users, 
  Upload, 
  FileText, 
  MessageSquare, 
  Menu,
  X
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileLayoutProps {
  children: React.ReactNode;
}

export const MobileLayout: React.FC<MobileLayoutProps> = ({ children }) => {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showMenu, setShowMenu] = useState(false);

  // Register service worker
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          console.log('Service Worker registered:', registration);
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error);
        });
    }
  }, []);

  // Add touch gestures
  useEffect(() => {
    if (!isMobile) return;

    let touchStartX = 0;
    let touchEndX = 0;

    const handleTouchStart = (e: TouchEvent) => {
      touchStartX = e.changedTouches[0].screenX;
    };

    const handleTouchEnd = (e: TouchEvent) => {
      touchEndX = e.changedTouches[0].screenX;
      handleSwipe();
    };

    const handleSwipe = () => {
      const swipeThreshold = 100;
      const diff = touchStartX - touchEndX;

      if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0) {
          // Swipe left - next tab
          navigateTab('next');
        } else {
          // Swipe right - previous tab
          navigateTab('prev');
        }
      }
    };

    document.addEventListener('touchstart', handleTouchStart);
    document.addEventListener('touchend', handleTouchEnd);

    return () => {
      document.removeEventListener('touchstart', handleTouchStart);
      document.removeEventListener('touchend', handleTouchEnd);
    };
  }, [isMobile, activeTab]);

  const navigateTab = (direction: 'next' | 'prev') => {
    const tabs = ['dashboard', 'workers', 'upload', 'assessments', 'chat'];
    const currentIndex = tabs.indexOf(activeTab);
    
    if (direction === 'next' && currentIndex < tabs.length - 1) {
      setActiveTab(tabs[currentIndex + 1]);
    } else if (direction === 'prev' && currentIndex > 0) {
      setActiveTab(tabs[currentIndex - 1]);
    }
  };

  if (!isMobile) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile Header */}
      <header className="bg-white shadow-sm fixed top-0 left-0 right-0 z-50">
        <div className="flex items-center justify-between p-4">
          <h1 className="text-lg font-semibold">Compliance AI</h1>
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-2"
          >
            {showMenu ? <X /> : <Menu />}
          </button>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {showMenu && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 mt-16"
          onClick={() => setShowMenu(false)}
        >
          <div className="bg-white w-64 h-full p-4">
            <nav className="space-y-4">
              <a href="#" className="block py-2 px-4 rounded hover:bg-gray-100">
                Settings
              </a>
              <a href="#" className="block py-2 px-4 rounded hover:bg-gray-100">
                Help
              </a>
              <a href="#" className="block py-2 px-4 rounded hover:bg-gray-100">
                Logout
              </a>
            </nav>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main className="pt-16 pb-20 px-4">
        <div className="mobile-optimized-content">
          {children}
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t z-50">
        <div className="flex items-center justify-around">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={cn(
              "flex flex-col items-center py-2 px-4 flex-1",
              activeTab === 'dashboard' && "text-blue-600"
            )}
          >
            <FileText className="h-5 w-5" />
            <span className="text-xs mt-1">Dashboard</span>
          </button>
          
          <button
            onClick={() => setActiveTab('workers')}
            className={cn(
              "flex flex-col items-center py-2 px-4 flex-1",
              activeTab === 'workers' && "text-blue-600"
            )}
          >
            <Users className="h-5 w-5" />
            <span className="text-xs mt-1">Workers</span>
          </button>
          
          <button
            onClick={() => setActiveTab('upload')}
            className={cn(
              "flex flex-col items-center py-2 px-4 flex-1",
              activeTab === 'upload' && "text-blue-600"
            )}
          >
            <Upload className="h-5 w-5" />
            <span className="text-xs mt-1">Upload</span>
          </button>
          
          <button
            onClick={() => setActiveTab('chat')}
            className={cn(
              "flex flex-col items-center py-2 px-4 flex-1",
              activeTab === 'chat' && "text-blue-600"
            )}
          >
            <MessageSquare className="h-5 w-5" />
            <span className="text-xs mt-1">Chat</span>
          </button>
        </div>
      </nav>
    </div>
  );
}; 