import React from 'react';
import type { GameHistoryItem } from '../types/poker';
import { useLanguage } from '../i18n/LanguageContext';
import { History, Award, PlayCircle, ArrowRightCircle, Info } from 'lucide-react';

interface GameLogProps {
  logs: GameHistoryItem[];
}

export const GameLog: React.FC<GameLogProps> = ({ logs }) => {
  const { t } = useLanguage();
  const getIcon = (type: GameHistoryItem['type']) => {
    switch (type) {
      case 'winner':
        return <Award className="w-3.5 h-3.5 text-amber-400 shrink-0 mt-0.5" />;
      case 'street':
        return <PlayCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />;
      case 'action':
        return <ArrowRightCircle className="w-3.5 h-3.5 text-cyan-400 shrink-0 mt-0.5" />;
      default:
        return <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />;
    }
  };

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 sm:p-3.5 h-32 sm:h-48 flex flex-col backdrop-blur-xl shadow-xl">
      <div className="flex items-center justify-between text-xs font-extrabold text-slate-300 pb-2 border-b border-slate-800/80 shrink-0">
        <div className="flex items-center gap-1.5">
          <History className="w-3.5 h-3.5 text-amber-400" />
          <span>{t('handHistoryTitle')}</span>
        </div>
        <span className="text-[10px] font-mono text-slate-500 bg-slate-950 px-2 py-0.5 rounded-full border border-slate-800">
          {t('eventsCount', { count: logs.length })}
        </span>
      </div>

      <div className="overflow-y-auto space-y-1.5 pr-1 mt-2 text-[11px] select-text flex-1">
        {logs.length === 0 ? (
          <div className="text-slate-500 italic text-center py-8">{t('noActivityRecorded')}</div>
        ) : (
          logs.map((log) => (
            <div
              key={log.id}
              className={`flex items-start gap-2 p-1.5 rounded-lg transition-all ${
                log.type === 'winner'
                  ? 'bg-amber-500/10 text-amber-200 font-bold border-l-2 border-amber-400 shadow-sm'
                  : log.type === 'street'
                  ? 'bg-emerald-950/40 text-emerald-300 font-semibold border-l-2 border-emerald-500'
                  : log.type === 'action'
                  ? 'bg-slate-950/60 text-slate-200 hover:bg-slate-800/50'
                  : 'text-slate-400 hover:bg-slate-950/40'
              }`}
            >
              {getIcon(log.type)}
              <span className="leading-relaxed flex-1">{log.text}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
};


