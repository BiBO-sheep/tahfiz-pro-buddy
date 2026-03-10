import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Santri, Ustadz, SetoranEntry, PesantrenSettings } from '@/types';
import { dummySantri, dummyUstadz, dummySetoran } from '@/data/dummy';

interface AppContextType {
  santriList: Santri[];
  setSantriList: React.Dispatch<React.SetStateAction<Santri[]>>;
  ustadzList: Ustadz[];
  setUstadzList: React.Dispatch<React.SetStateAction<Ustadz[]>>;
  setoranList: SetoranEntry[];
  setSetoranList: React.Dispatch<React.SetStateAction<SetoranEntry[]>>;
  settings: PesantrenSettings;
  setSettings: React.Dispatch<React.SetStateAction<PesantrenSettings>>;
}

const AppContext = createContext<AppContextType | null>(null);

export function AppProvider({ children }: { children: ReactNode }) {
  const [santriList, setSantriList] = useState<Santri[]>(dummySantri);
  const [ustadzList, setUstadzList] = useState<Ustadz[]>(dummyUstadz);
  const [setoranList, setSetoranList] = useState<SetoranEntry[]>(dummySetoran);
  const [settings, setSettings] = useState<PesantrenSettings>(() => {
    const saved = localStorage.getItem('pesantren-settings');
    return saved ? JSON.parse(saved) : {
      nama: 'Pesantren Darul Ilmi',
      logo: '',
      theme: '',
    };
  });

  useEffect(() => {
    localStorage.setItem('pesantren-settings', JSON.stringify(settings));
    // Apply theme
    const root = document.documentElement;
    root.className = settings.theme || '';
  }, [settings]);

  return (
    <AppContext.Provider value={{
      santriList, setSantriList,
      ustadzList, setUstadzList,
      setoranList, setSetoranList,
      settings, setSettings,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useAppContext must be used within AppProvider');
  return ctx;
}
