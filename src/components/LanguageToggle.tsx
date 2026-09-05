import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../i18n/LanguageContext';
import { type Language } from '../i18n/translations';
import { ChevronDown, Check, Globe } from 'lucide-react';

interface LanguageToggleProps {
  variant?: 'compact' | 'full';
  className?: string;
}

const LANGUAGES: { code: Language; label: string; flag: string; short: string }[] = [
  { code: 'th', label: 'ไทย', flag: '🇹🇭', short: 'TH' },
  { code: 'en', label: 'English', flag: '🇬🇧', short: 'EN' },
  { code: 'ja', label: '日本語', flag: '🇯🇵', short: 'JA' },
];

export const LanguageToggle: React.FC<LanguageToggleProps> = React.memo(({ variant = 'compact', className = '' }) => {
  const { language, setLanguage } = useLanguage();
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

  const handleSelect = (code: Language) => {
    setLanguage(code);
    setIsOpen(false);
  };

  return (
    <div className={`relative inline-block text-left ${className}`} ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className={`flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-slate-200 border border-slate-700/80 rounded-xl transition-all cursor-pointer shadow-md focus:outline-none focus:ring-1 focus:ring-amber-400/50 active:scale-95 ${
          variant === 'full' ? 'px-3 py-2 text-xs font-bold' : 'px-2.5 py-1.5 text-xs font-mono font-bold'
        }`}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span className="text-sm leading-none">{currentLang.flag}</span>
        <span className="text-slate-200">{variant === 'full' ? currentLang.label : currentLang.short}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180 text-amber-400' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-1.5 w-36 bg-slate-900 border border-slate-700/90 rounded-xl shadow-2xl z-50 py-1 overflow-hidden animate-in fade-in zoom-in-95 duration-100 ring-1 ring-white/10">
          <div className="px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wider text-slate-400 flex items-center gap-1 border-b border-slate-800">
            <Globe className="w-3 h-3 text-amber-400" />
            <span>Language</span>
          </div>
          {LANGUAGES.map((item) => {
            const isSelected = item.code === language;
            return (
              <button
                key={item.code}
                onClick={() => handleSelect(item.code)}
                className={`w-full flex items-center justify-between px-3 py-2 text-xs transition-colors cursor-pointer text-left ${
                  isSelected
                    ? 'bg-amber-500/15 text-amber-300 font-bold'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
                role="option"
                aria-selected={isSelected}
              >
                <span className="flex items-center gap-2">
                  <span className="text-sm leading-none">{item.flag}</span>
                  <span>{item.label}</span>
                </span>
                {isSelected && <Check className="w-3.5 h-3.5 text-amber-400" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
});

