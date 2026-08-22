import React from 'react';
import { useLanguage } from '../i18n/LanguageContext';

interface LanguageToggleProps {
  variant?: 'compact' | 'full';
  className?: string;
}

export const LanguageToggle: React.FC<LanguageToggleProps> = ({ variant = 'compact', className = '' }) => {
  const { language, setLanguage } = useLanguage();

  if (variant === 'full') {
    return (
      <div className={`inline-flex items-center p-1 bg-slate-950/80 border border-slate-700/80 rounded-xl shadow-inner ${className}`}>
        <button
          onClick={() => setLanguage('th')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            language === 'th'
              ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span className="text-sm leading-none">🇹🇭</span>
          <span>ไทย</span>
        </button>
        <button
          onClick={() => setLanguage('en')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
            language === 'en'
              ? 'bg-amber-500 text-slate-950 shadow-md font-extrabold'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <span className="text-sm leading-none">🇬🇧</span>
          <span>EN</span>
        </button>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center p-0.5 bg-slate-950 border border-slate-800 rounded-xl shadow-inner ${className}`}>
      <button
        onClick={() => setLanguage('th')}
        className={`px-2 py-1 rounded-lg text-[11px] font-mono font-bold transition-all cursor-pointer flex items-center gap-1 ${
          language === 'th'
            ? 'bg-amber-500/20 border border-amber-400/50 text-amber-300 shadow-sm'
            : 'text-slate-400 hover:text-slate-200 border border-transparent'
        }`}
        title="ภาษาไทย"
      >
        <span className="text-xs">🇹🇭</span>
        <span>TH</span>
      </button>
      <button
        onClick={() => setLanguage('en')}
        className={`px-2 py-1 rounded-lg text-[11px] font-mono font-bold transition-all cursor-pointer flex items-center gap-1 ${
          language === 'en'
            ? 'bg-amber-500/20 border border-amber-400/50 text-amber-300 shadow-sm'
            : 'text-slate-400 hover:text-slate-200 border border-transparent'
        }`}
        title="English"
      >
        <span className="text-xs">🇬🇧</span>
        <span>EN</span>
      </button>
    </div>
  );
};
