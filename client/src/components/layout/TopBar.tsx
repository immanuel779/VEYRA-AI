import { Menu, Moon, Sun, LogOut, Settings as SettingsIcon } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';
import { Button } from '../ui/Button';
import { Logo } from '../ui/Logo';

interface Props {
  onMenuClick?: () => void;
}

export function TopBar({ onMenuClick }: Props) {
  const { resolved, setTheme } = useTheme();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') setMenuOpen(false);
    }
    if (menuOpen) {
      document.addEventListener('mousedown', onClick);
      document.addEventListener('keydown', onKey);
    }
    return () => {
      document.removeEventListener('mousedown', onClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [menuOpen]);

  const initial =
    user?.displayName?.[0]?.toUpperCase() ||
    user?.email?.[0]?.toUpperCase() ||
    '?';

  return (
    <header className="h-14 flex items-center justify-between px-3 sm:px-4 border-b border-edge bg-canvas/80 backdrop-blur-md sticky top-0 z-20 animate-fade-in">
      <div className="flex items-center gap-2.5">
        <Button
          variant="ghost"
          size="sm"
          className="md:hidden"
          onClick={onMenuClick}
          aria-label="Open menu"
        >
          <Menu size={18} />
        </Button>
        <div className="flex items-center gap-2 text-ink">
          <Logo size={20} className="text-accent" />
          <span className="font-semibold tracking-tight text-[15px]">
            VEYRA<span className="text-muted font-normal"> AI</span>
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          aria-label="Toggle theme"
          onClick={() => setTheme(resolved === 'dark' ? 'light' : 'dark')}
        >
          <span className="transition-transform duration-300 inline-flex">
            {resolved === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
          </span>
        </Button>

        <div className="relative" ref={menuRef}>
          <button
            onClick={() => setMenuOpen((o) => !o)}
            className="w-8 h-8 rounded-full bg-accent text-white text-xs font-semibold flex items-center justify-center hover:opacity-90 transition-opacity focus:outline-none focus-visible:ring-2 focus-visible:ring-accent/40"
            aria-label="Account menu"
            aria-expanded={menuOpen}
          >
            {initial}
          </button>

          {menuOpen && (
            <div className="absolute right-0 top-10 w-56 rounded-xl border border-edge bg-surface shadow-lg p-1.5 animate-scale-in origin-top-right">
              <div className="px-3 py-2 border-b border-edge mb-1">
                <p className="text-sm font-medium text-ink truncate">
                  {user?.displayName || 'User'}
                </p>
                <p className="text-xs text-muted truncate">{user?.email}</p>
              </div>

              <Link
                to="/settings"
                onClick={() => setMenuOpen(false)}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-edge/60 text-left transition-colors"
              >
                <SettingsIcon size={14} />
                Settings
              </Link>

              <button
                onClick={() => {
                  setMenuOpen(false);
                  logout();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm rounded-lg hover:bg-red-500/10 hover:text-red-500 transition-colors text-left"
              >
                <LogOut size={14} />
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}