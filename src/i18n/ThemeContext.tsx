/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from 'react';

export type Theme = 'dark' | 'light' | 'soft' | 'neon' | 'royal';

export interface ThemeInfo {
  id: Theme;
  label: string;
  emoji: string;
  description: string;
}

export const THEMES: ThemeInfo[] = [
  { id: 'dark',   label: 'Dark',   emoji: '🌑', description: 'Classic dark casino' },
  { id: 'light',  label: 'Light',  emoji: '☀️', description: 'Clean & bright' },
  { id: 'soft',   label: 'Soft',   emoji: '🌸', description: 'Warm & easy on eyes' },
  { id: 'neon',   label: 'Neon',   emoji: '🕹️', description: 'Cyber neon glow' },
  { id: 'royal',  label: 'Royal',  emoji: '👑', description: 'Deep blue royalty' },
];

interface ThemeContextType {
  theme: Theme;
  setTheme: (t: Theme) => void;
  themeInfo: ThemeInfo;
}

const ThemeContext = createContext<ThemeContextType | null>(null);

const STORAGE_KEY = 'poker_chip_theme';

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [theme, setThemeState] = useState<Theme>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY) as Theme | null;
      if (saved && THEMES.find((t) => t.id === saved)) return saved;
    } catch { /* ignore */ }
    return 'dark';
  });

  const setTheme = (t: Theme) => {
    setThemeState(t);
    try { localStorage.setItem(STORAGE_KEY, t); } catch { /* ignore */ }
  };

  useEffect(() => {
    const root = document.documentElement;
    // Remove all theme classes then add current
    THEMES.forEach((t) => root.classList.remove(`theme-${t.id}`));
    root.classList.add(`theme-${theme}`);
  }, [theme]);

  const themeInfo = THEMES.find((t) => t.id === theme)!;

  return (
    <ThemeContext.Provider value={{ theme, setTheme, themeInfo }}>
      {children}
    </ThemeContext.Provider>
  );
};

export function useTheme(): ThemeContextType {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
}
