import React, { useEffect, useState } from 'react';
import type { TableState } from '../types/poker';
import { formatChips } from '../utils/pokerRules';
import { useLanguage } from '../i18n/LanguageContext';
import { Trophy, Sparkles, X, Coins } from 'lucide-react';

interface WinnerCelebrationProps {
  tableState: TableState;
}

export const WinnerCelebration: React.FC<WinnerCelebrationProps> = ({ tableState }) => {
  const { t } = useLanguage();
  const lastWinner = tableState.lastWinner;
  const [visible, setVisible] = useState(false);
  const [lastHandSeen, setLastHandSeen] = useState<number | null>(null);

  useEffect(() => {
    if (lastWinner && lastWinner.timestamp && lastWinner.handNumber !== lastHandSeen) {
      setLastHandSeen(lastWinner.handNumber);
      setVisible(true);

      const timer = setTimeout(() => {
        setVisible(false);
      }, 7000);

      return () => clearTimeout(timer);
    }
  }, [lastWinner, lastHandSeen]);

  if (!visible || !lastWinner) return null;

  return (
    <div className="fixed top-14 sm:top-16 left-1/2 -translate-x-1/2 z-50 pointer-events-auto max-w-lg w-[92%] sm:w-full animate-pop-in">
      <div className="relative overflow-hidden bg-gradient-to-r from-slate-950/95 via-amber-950/90 to-slate-950/95 border-2 border-amber-400/90 rounded-2xl p-3.5 sm:p-4 shadow-[0_0_50px_rgba(245,158,11,0.6)] backdrop-blur-2xl ring-2 ring-amber-400/30">
        {/* Shimmer light sweep */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer pointer-events-none" />

        <div className="flex items-center justify-between gap-3 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-300 flex items-center justify-center text-slate-950 shadow-lg shadow-amber-500/40 shrink-0 animate-victory">
              <Trophy className="w-6 h-6 sm:w-7 sm:h-7 stroke-[2.5]" />
            </div>

            <div>
              <div className="flex items-center gap-1.5 text-[10px] sm:text-xs font-black uppercase tracking-widest text-amber-300">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                <span>{t('handWinnerTitle', { number: lastWinner.handNumber })}</span>
              </div>
              <div className="text-base sm:text-lg font-black text-white truncate max-w-[200px] sm:max-w-[260px] drop-shadow">
                {lastWinner.winnerNames.join(' & ')}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-right">
              <span className="text-[9px] uppercase tracking-wider text-amber-200/80 font-bold block">
                {t('awardedLabel')}
              </span>
              <span className="text-sm sm:text-lg font-mono font-black text-amber-300 flex items-center gap-1 bg-amber-950/80 px-2 sm:px-2.5 py-0.5 rounded-lg border border-amber-500/50 shadow-inner">
                <Coins className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-amber-400" />
                +{formatChips(lastWinner.amount)}
              </span>
            </div>

            <button
              onClick={() => setVisible(false)}
              className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer shrink-0 ml-1"
              title={t('dismiss')}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
