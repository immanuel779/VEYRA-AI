import type { ReactNode } from 'react';
import { useEffect } from 'react';

interface Props {
  sidebar: ReactNode;
  children: ReactNode;
  mobileSidebarOpen?: boolean;
  onCloseMobileSidebar?: () => void;
}

export function AppLayout({
  sidebar,
  children,
  mobileSidebarOpen = false,
  onCloseMobileSidebar,
}: Props) {
  // Close drawer on Escape
  useEffect(() => {
    if (!mobileSidebarOpen) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onCloseMobileSidebar?.();
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [mobileSidebarOpen, onCloseMobileSidebar]);

  // Lock body scroll while drawer is open
  useEffect(() => {
    if (mobileSidebarOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => {
        document.body.style.overflow = prev;
      };
    }
  }, [mobileSidebarOpen]);

  return (
    <div className="h-full flex bg-canvas grain">
      {/* Desktop sidebar */}
      <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-edge bg-surface/50">
        {sidebar}
      </aside>

      {/* Mobile drawer */}
      <div
        className={`md:hidden fixed inset-0 z-50 transition-opacity duration-200 ${
          mobileSidebarOpen
            ? 'opacity-100 pointer-events-auto'
            : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden={!mobileSidebarOpen}
      >
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/50 backdrop-blur-sm"
          onClick={onCloseMobileSidebar}
        />

        {/* Slide-in panel */}
        <div
          className={`absolute top-0 left-0 h-full w-72 max-w-[85vw] bg-surface border-r border-edge shadow-2xl transition-transform duration-300 ease-out ${
            mobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
        >
          {sidebar}
        </div>
      </div>

      <main className="flex-1 flex flex-col min-w-0 relative">{children}</main>
    </div>
  );
}