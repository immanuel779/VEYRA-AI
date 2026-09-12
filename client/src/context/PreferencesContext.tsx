import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from 'react';
import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from './AuthContext';

export interface Preferences {
  enterToSend: boolean;
  showTimestamps: boolean;
  webSearch: boolean;
}

const DEFAULTS: Preferences = {
  enterToSend: true,
  showTimestamps: false,
  webSearch: true,
};

interface Ctx {
  prefs: Preferences;
  loading: boolean;
  update: (patch: Partial<Preferences>) => Promise<void>;
}

const PreferencesContext = createContext<Ctx | undefined>(undefined);

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const { user } = useAuth();
  const [prefs, setPrefs] = useState<Preferences>(DEFAULTS);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setPrefs(DEFAULTS);
      setLoading(false);
      return;
    }
    setLoading(true);
    const ref = doc(db, 'users', user.uid);
    getDoc(ref)
      .then((snap) => {
        const data = snap.data();
        const p = (data?.preferences as Partial<Preferences>) || {};
        setPrefs({ ...DEFAULTS, ...p });
      })
      .catch((e) => console.error('load preferences failed', e))
      .finally(() => setLoading(false));
  }, [user]);

  async function update(patch: Partial<Preferences>) {
    if (!user) return;
    const next = { ...prefs, ...patch };
    setPrefs(next);
    try {
      await setDoc(
        doc(db, 'users', user.uid),
        { preferences: next, updatedAt: serverTimestamp() },
        { merge: true }
      );
    } catch (e) {
      console.error('save preferences failed', e);
    }
  }

  return (
    <PreferencesContext.Provider value={{ prefs, loading, update }}>
      {children}
    </PreferencesContext.Provider>
  );
}

export function usePreferences() {
  const c = useContext(PreferencesContext);
  if (!c) throw new Error('usePreferences must be used within PreferencesProvider');
  return c;
}
