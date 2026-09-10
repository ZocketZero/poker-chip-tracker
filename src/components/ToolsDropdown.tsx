import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { type Language } from '../i18n/translations';
import { useTheme, THEMES } from '../i18n/ThemeContext';
import {
  ChevronDown,
  Check,
  Globe,
  Trophy,
  Calculator,
  Settings2,
  Palette,
} from 'lucide-react';
import { formatChips } from '../utils/pokerRules';

interface ToolsDropdownProps {
  pot: number;
  onOpenRankings: () => void;
  onOpenCalculator: () => void;
}

const LANGUAGES: { code: Language; label: string; flag: string; short: string }[] = [
  { code: 'th', label: 'ไทย', flag: '🇹🇭', short: 'TH' },
  { code: 'en', label: 'English', flag: '🇬🇧', short: 'EN' },
  { code: 'ja', label: '日本語', flag: '🇯🇵', short: 'JA' },
];

export const ToolsDropdown: React.FC<ToolsDropdownProps> = React.memo(
  ({ pot, onOpenRankings, onOpenCalculator }) => {
    const { language, setLanguage, t } = useLanguage();
    const { theme, setTheme } = useTheme();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const currentLang = LANGUAGES.find((l) => l.code === language) || LANGUAGES[0];

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      };
      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
      }
      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
      };
    }, [isOpen]);

    const handleSelectLanguage = (code: Language) => {
      setLanguage(code);
      setIsOpen(false);
    };

    const handleSelectTheme = (id: typeof theme) => {
      setTheme(id);
      setIsOpen(false);
    };

    const handleOpenRankings = () => {
      setIsOpen(false);
      onOpenRankings();
    };

    const handleOpenCalculator = () => {
      setIsOpen(false);
      onOpenCalculator();
    };

    return (
      <div className="relative inline-block text-left" ref={dropdownRef}>
        {/* Trigger button */}
        <button
          type="button"
          onClick={() => setIsOpen((prev) => !prev)}
          className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700/80 px-2 sm:px-2.5 py-1.5 rounded-xl transition-all cursor-pointer shadow-sm focus:outline-none focus:ring-1 focus:ring-amber-400/50 active:scale-95"
          aria-haspopup="true"
          aria-expanded={isOpen}
          title="Tools & Settings"
        >
          <Settings2 className="w-3.5 h-3.5 text-slate-300" />
          <span className="text-sm leading-none">{currentLang.flag}</span>
          <ChevronDown
            className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${
              isOpen ? 'rotate-180 text-amber-400' : ''
            }`}
          />
        </button>

        {/* Dropdown panel */}
        {isOpen && (
          <div className="absolute right-0 mt-1.5 w-56 bg-slate-900 border border-slate-700/90 rounded-xl shadow-2xl z-50 py-1 overflow-hidden ring-1 ring-white/10">

            {/* Tools section header */}
            <div className="px-2.5 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 border-b border-slate-800">
              Tools
            </div>

            {/* Hand Rankings */}
            <button
              onClick={handleOpenRankings}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-xs hover:bg-slate-800/80 transition-colors cursor-pointer text-left"
              style={{ color: 'var(--accent)' }}
            >
              <Trophy className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--accent)' }} />
              <span>{t('handRankingsBtn')}</span>
            </button>

            {/* Pot Calculator */}
            <button
              onClick={handleOpenCalculator}
              className="w-full flex items-center justify-between gap-2.5 px-3 py-2 text-xs hover:bg-slate-800/80 transition-colors cursor-pointer text-left"
              style={{ color: 'var(--accent)' }}
            >
              <span className="flex items-center gap-2.5">
                <Calculator className="w-3.5 h-3.5 shrink-0" style={{ color: 'var(--accent)' }} />
                <span>{t('potMath')}</span>
              </span>
              <span
                className="font-mono text-[10px] px-1.5 py-0.5 rounded-md border"
                style={{
                  color: 'var(--accent-bright)',
                  background: 'var(--accent-bg)',
                  borderColor: 'var(--accent-border)',
                }}
              >
                {formatChips(pot)}
              </span>
            </button>

            {/* Theme section header */}
            <div className="px-2.5 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1 border-t border-slate-800 mt-1">
              <Palette className="w-3 h-3" style={{ color: 'var(--accent)' }} />
              <span>Theme</span>
            </div>

            {THEMES.map((item) => {
              const isSelected = item.id === theme;
              return (
                <button
                  key={item.id}
                  onClick={() => handleSelectTheme(item.id)}
                  className="w-full flex items-center justify-between px-3 py-1.5 text-xs transition-colors cursor-pointer text-left hover:bg-slate-800/80"
                  style={
                    isSelected
                      ? {
                          background: 'var(--accent-bg)',
                          color: 'var(--accent)',
                          fontWeight: 700,
                        }
                      : { color: 'var(--color-slate-300, #cbd5e1)' }
                  }
                  role="option"
                  aria-selected={isSelected}
                >
                  <span className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ background: 'var(--accent)' }}
                    />
                    <span className="text-sm leading-none">{item.emoji}</span>
                    <span>{item.label}</span>
                  </span>
                  {isSelected && <Check className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} />}
                </button>
              );
            })}

            {/* Language section header */}
            <div className="px-2.5 py-1.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1 border-t border-slate-800 mt-1">
              <Globe className="w-3 h-3" style={{ color: 'var(--accent)' }} />
              <span>Language</span>
            </div>

            {LANGUAGES.map((item) => {
              const isSelected = item.code === language;
              return (
                <button
                  key={item.code}
                  onClick={() => handleSelectLanguage(item.code)}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs transition-colors cursor-pointer text-left hover:bg-slate-800/80"
                  style={
                    isSelected
                      ? {
                          background: 'var(--accent-bg)',
                          color: 'var(--accent)',
                          fontWeight: 700,
                        }
                      : { color: 'var(--color-slate-300, #cbd5e1)' }
                  }
                  role="option"
                  aria-selected={isSelected}
                >
                  <span className="flex items-center gap-2">
                    <span className="text-sm leading-none">{item.flag}</span>
                    <span>{item.label}</span>
                  </span>
                  {isSelected && <Check className="w-3.5 h-3.5" style={{ color: 'var(--accent)' }} />}
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  }
);
