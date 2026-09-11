import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, User as UserIcon, Palette, MessageSquare, LogOut, Check,
} from 'lucide-react';
import { updateProfile } from 'firebase/auth';
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth } from '../services/firebase';
import { db } from '../services/firebase';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { usePreferences } from '../context/PreferencesContext';
import { Button } from '../components/ui/Button';
import { Logo } from '../components/ui/Logo';
import type { Theme } from '../types';

export function SettingsPage() {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const { prefs, update } = usePreferences();

  const [name, setName] = useState(user?.displayName || '');
  const [savingName, setSavingName] = useState(false);
  const [nameSavedAt, setNameSavedAt] = useState<number | null>(null);

  useEffect(() => {
    setName(user?.displayName || '');
  }, [user]);

  async function saveName(e: FormEvent) {
    e.preventDefault();
    if (!user || !auth.currentUser) return;
    const trimmed = name.trim();
    if (!trimmed || trimmed === user.displayName) return;

    setSavingName(true);
    try {
      await updateProfile(auth.currentUser, { displayName: trimmed });
      await updateDoc(doc(db, 'users', user.uid), {
        name: trimmed,
        updatedAt: serverTimestamp(),
      });
      setNameSavedAt(Date.now());
      setTimeout(() => setNameSavedAt(null), 2000);
    } catch (err) {
      console.error('update name failed', err);
    } finally {
      setSavingName(false);
    }
  }

  return (
    <div className="min-h-full bg-canvas grain">
      <header className="h-14 flex items-center gap-2 px-3 sm:px-5 border-b border-edge bg-canvas/80 backdrop-blur-md sticky top-0 z-10">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate('/')}
          aria-label="Back to chat"
        >
          <ArrowLeft size={17} />
        </Button>
        <div className="flex items-center gap-2 text-ink">
          <Logo size={18} className="text-accent" />
          <span className="font-semibold tracking-tight text-[15px]">
            VEYRA<span className="text-muted font-normal"> AI</span>
          </span>
        </div>
        <span className="text-xs text-muted ml-1">/ Settings</span>
      </header>

      <div className="max-w-2xl mx-auto px-4 sm:px-6 py-10 space-y-8 animate-fade-up">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
          <p className="text-sm text-muted mt-1">
            Manage your profile, appearance, and chat preferences.
          </p>
        </div>

        {/* Profile */}
        <Section icon={UserIcon} title="Profile" description="Your account information.">
          <form onSubmit={saveName} className="space-y-4">
            <Field label="Name">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
                className="w-full h-10 px-3 rounded-lg border border-edge bg-canvas text-sm focus:outline-none focus:border-accent/60 transition-colors"
              />
            </Field>
            <Field label="Email">
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full h-10 px-3 rounded-lg border border-edge bg-canvas/60 text-sm text-muted cursor-not-allowed"
              />
            </Field>
            <div className="flex items-center gap-3">
              <Button
                type="submit"
                size="sm"
                disabled={
                  savingName ||
                  !name.trim() ||
                  name.trim() === (user?.displayName || '')
                }
              >
                {savingName ? 'Saving…' : 'Save changes'}
              </Button>
              {nameSavedAt && (
                <span className="flex items-center gap-1 text-xs text-emerald-500 animate-fade-in">
                  <Check size={12} /> Saved
                </span>
              )}
            </div>
          </form>
        </Section>

        {/* Appearance */}
        <Section icon={Palette} title="Appearance" description="Choose how VEYRA looks.">
          <div className="grid grid-cols-3 gap-2.5">
            {(['light', 'dark', 'system'] as Theme[]).map((t) => (
              <ThemeOption
                key={t}
                theme={t}
                active={theme === t}
                onSelect={() => setTheme(t)}
              />
            ))}
          </div>
        </Section>

        {/* Chat */}
        <Section icon={MessageSquare} title="Chat" description="How messages behave.">
          <div className="space-y-1">
            <Toggle
              label="Press Enter to send"
              description="When off, use Shift+Enter to send."
              value={prefs.enterToSend}
              onChange={(v) => update({ enterToSend: v })}
            />
            <Toggle
              label="Show timestamps"
              description="Display the time each message was sent."
              value={prefs.showTimestamps}
              onChange={(v) => update({ showTimestamps: v })}
            />
          </div>
        </Section>

        {/* Account */}
        <Section icon={LogOut} title="Account" description="Sign out of VEYRA on this device.">
          <Button
            variant="outline"
            size="md"
            className="text-red-500 border-red-500/30 hover:bg-red-500/10 hover:border-red-500/50"
            onClick={() => {
              logout();
              navigate('/login');
            }}
          >
            <LogOut size={14} />
            Sign out
          </Button>
        </Section>
      </div>
    </div>
  );
}

function Section({
  icon: Icon,
  title,
  description,
  children,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-edge bg-surface p-5">
      <div className="flex items-start gap-3 mb-4">
        <div className="shrink-0 w-8 h-8 rounded-lg bg-accent-soft flex items-center justify-center text-accent">
          <Icon size={15} />
        </div>
        <div>
          <h2 className="text-sm font-semibold tracking-tight">{title}</h2>
          <p className="text-xs text-muted mt-0.5">{description}</p>
        </div>
      </div>
      {children}
    </section>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs font-medium text-muted mb-1.5">{label}</span>
      {children}
    </label>
  );
}

function ThemeOption({
  theme,
  active,
  onSelect,
}: {
  theme: Theme;
  active: boolean;
  onSelect: () => void;
}) {
  const labels: Record<Theme, string> = {
    light: 'Light',
    dark: 'Dark',
    system: 'System',
  };

  return (
    <button
      type="button"
      onClick={onSelect}
      className={`relative flex flex-col items-stretch rounded-xl border-2 transition-all duration-200 p-3 text-left ${
        active
          ? 'border-accent bg-accent-soft/40'
          : 'border-edge hover:border-accent/40'
      }`}
    >
      <div
        className={`h-12 rounded-md mb-2 border border-edge overflow-hidden ${
          theme === 'light'
            ? 'bg-[#faf9f6]'
            : theme === 'dark'
            ? 'bg-[#0c0c0d]'
            : 'bg-gradient-to-br from-[#faf9f6] to-[#0c0c0d]'
        }`}
      >
        <div className="h-2 w-full bg-black/10" />
        <div className="p-2 space-y-1">
          <div className="h-1 w-3/4 rounded-full bg-black/10" />
          <div className="h-1 w-1/2 rounded-full bg-black/10" />
        </div>
      </div>
      <span className="text-xs font-medium text-center">{labels[theme]}</span>
      {active && (
        <span className="absolute top-2 right-2 w-4 h-4 rounded-full bg-accent text-white flex items-center justify-center">
          <Check size={10} strokeWidth={3} />
        </span>
      )}
    </button>
  );
}

function Toggle({
  label,
  description,
  value,
  onChange,
}: {
  label: string;
  description: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4 py-2">
      <div className="min-w-0">
        <div className="text-sm text-ink">{label}</div>
        <div className="text-xs text-muted mt-0.5">{description}</div>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={value}
        onClick={() => onChange(!value)}
        className={`relative shrink-0 w-10 h-6 rounded-full transition-colors duration-200 ${
          value ? 'bg-accent' : 'bg-edge'
        }`}
      >
        <span
          className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
            value ? 'translate-x-4' : 'translate-x-0'
          }`}
        />
      </button>
    </div>
  );
}