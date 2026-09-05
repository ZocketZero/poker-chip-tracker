import React, { useEffect, useState, useRef } from 'react';
import type { TableState } from '../types/poker';
import { formatChips } from '../utils/pokerRules';
import { useLanguage } from '../i18n/LanguageContext';
import { Sparkles, FastForward, Clock, X, Play } from 'lucide-react';

interface StreetAnnouncementProps {
  tableState: TableState;
}

export const StreetAnnouncement: React.FC<StreetAnnouncementProps> = ({ tableState }) => {
  const { t } = useLanguage();
  const [announcement, setAnnouncement] = useState<{
    id: string;
    title: string;
    subtitle: string;
    badge: string;
    color: 'emerald' | 'cyan' | 'amber' | 'purple';
    icon: 'play' | 'street' | 'waiting' | 'showdown';
  } | null>(null);

  const [visible, setVisible] = useState(false);
  const prevStreetRef = useRef<string>('');
  const prevHandRef = useRef<number>(0);
  const prevTurnRef = useRef<number | null>(null);

  const getStreetName = (street: string) => {
    switch (street) {
      case 'preflop': return t('streetPreflop');
      case 'flop': return t('streetFlop');
      case 'turn': return t('streetTurn');
      case 'river': return t('streetRiver');
      case 'showdown': return t('streetShowdown');
      default: return street.toUpperCase();
    }
  };

  const getNextStreetName = (street: string) => {
    switch (street) {
      case 'preflop': return t('streetFlop');
      case 'flop': return t('streetTurn');
      case 'turn': return t('streetRiver');
      case 'river': return t('streetShowdown');
      default: return t('nextStreet');
    }
  };

  const getStepNumber = (street: string) => {
    switch (street) {
      case 'preflop': return '1/4';
      case 'flop': return '2/4';
      case 'turn': return '3/4';
      case 'river': return '4/4';
      case 'showdown': return 'FINAL';
      default: return '';
    }
  };

  const isEnabled = tableState.settings.showStreetAnnouncements ?? true;

  useEffect(() => {
    if (!isEnabled || !tableState.isHandInProgress) {
      prevStreetRef.current = '';
      prevHandRef.current = 0;
      prevTurnRef.current = null;
      setVisible(false);
      return;
    }

    const handChanged = tableState.handNumber !== prevHandRef.current && prevHandRef.current !== 0;
    const streetChanged = tableState.street !== prevStreetRef.current && prevStreetRef.current !== '';
    const isFirstHand = prevHandRef.current === 0 && tableState.isHandInProgress;
    const isNowAwaitingHost =
      tableState.currentTurnSeat === null &&
      prevTurnRef.current !== null &&
      tableState.street !== 'showdown';

    prevHandRef.current = tableState.handNumber;
    prevStreetRef.current = tableState.street;
    prevTurnRef.current = tableState.currentTurnSeat;

    if (handChanged || isFirstHand) {
      setAnnouncement({
        id: `hand-${tableState.handNumber}`,
        title: t('handStartedTitle', { number: tableState.handNumber }),
        subtitle: t('handStartedSub', {
          sb: tableState.settings.smallBlind,
          bb: tableState.settings.bigBlind,
        }),
        badge: 'PREFLOP (1/4)',
        color: 'emerald',
        icon: 'play',
      });
      setVisible(true);
    } else if (streetChanged) {
      const stageName = getStreetName(tableState.street);
      const totalPot = tableState.pot + tableState.communityBets;
      const step = getStepNumber(tableState.street);

      setAnnouncement({
        id: `street-${tableState.street}-${tableState.handNumber}`,
        title: t('enteredStageTitle', { stage: stageName }),
        subtitle: t('enteredStageSub', { pot: formatChips(totalPot) }),
        badge: `${stageName} (${step})`,
        color: tableState.street === 'showdown' ? 'purple' : 'cyan',
        icon: tableState.street === 'showdown' ? 'showdown' : 'street',
      });
      setVisible(true);
    } else if (isNowAwaitingHost) {
      const nextStage = getNextStreetName(tableState.street);
      setAnnouncement({
        id: `awaiting-${tableState.street}-${tableState.handNumber}`,
        title: t('roundCompleteNotice'),
        subtitle: t('waitingHostConfirmSub', { nextStage }),
        badge: t('roundCompleteBadge'),
        color: 'amber',
        icon: 'waiting',
      });
      setVisible(true);
    }
  }, [tableState.handNumber, tableState.street, tableState.isHandInProgress, tableState.currentTurnSeat]);

  useEffect(() => {
    if (visible) {
      const timer = setTimeout(() => {
        setVisible(false);
      }, 4500);
      return () => clearTimeout(timer);
    }
  }, [visible, announcement?.id]);

  if (!visible || !announcement) return null;

  const colorStyles = {
    emerald: {
      border: 'border-emerald-400/90',
      glow: 'shadow-[0_0_45px_rgba(16,185,129,0.5)]',
      gradient: 'from-slate-950/95 via-emerald-950/90 to-slate-950/95',
      badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/60',
      iconBg: 'bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950',
    },
    cyan: {
      border: 'border-cyan-400/90',
      glow: 'shadow-[0_0_45px_rgba(6,182,212,0.5)]',
      gradient: 'from-slate-950/95 via-cyan-950/90 to-slate-950/95',
      badgeBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-400/60',
      iconBg: 'bg-gradient-to-tr from-cyan-500 to-blue-400 text-slate-950',
    },
    amber: {
      border: 'border-amber-400/90',
      glow: 'shadow-[0_0_45px_rgba(245,158,11,0.5)]',
      gradient: 'from-slate-950/95 via-amber-950/90 to-slate-950/95',
      badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-400/60',
      iconBg: 'bg-gradient-to-tr from-amber-500 to-yellow-400 text-slate-950',
    },
    purple: {
      border: 'border-purple-400/90',
      glow: 'shadow-[0_0_45px_rgba(168,85,247,0.5)]',
      gradient: 'from-slate-950/95 via-purple-950/90 to-slate-950/95',
      badgeBg: 'bg-purple-500/20 text-purple-300 border-purple-400/60',
      iconBg: 'bg-gradient-to-tr from-purple-500 to-fuchsia-400 text-slate-950',
    },
  }[announcement.color];

  return (
    <div className="fixed top-3 sm:top-4 left-1/2 -translate-x-1/2 z-50 pointer-events-auto max-w-md w-[94%] sm:w-full animate-pop-in">
      <div
        className={`relative overflow-hidden bg-gradient-to-r ${colorStyles.gradient} border-2 ${colorStyles.border} rounded-2xl p-3.5 sm:p-4 ${colorStyles.glow} backdrop-blur-2xl ring-1 ring-white/10`}
      >
        {/* Ambient sweep highlight */}
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-shimmer pointer-events-none" />

        <div className="flex items-center justify-between gap-3 relative z-10">
          <div className="flex items-center gap-3">
            <div
              className={`w-10 h-10 sm:w-11 sm:h-11 rounded-2xl ${colorStyles.iconBg} flex items-center justify-center font-black shadow-lg shrink-0`}
            >
              {announcement.icon === 'play' && <Play className="w-5 h-5 fill-slate-950" />}
              {announcement.icon === 'street' && <FastForward className="w-5 h-5" />}
              {announcement.icon === 'waiting' && <Clock className="w-5 h-5 animate-pulse" />}
              {announcement.icon === 'showdown' && <Sparkles className="w-5 h-5" />}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span
                  className={`text-[9px] sm:text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-md border ${colorStyles.badgeBg}`}
                >
                  {announcement.badge}
                </span>
              </div>
              <div className="text-sm sm:text-base font-black text-white tracking-wide mt-0.5 drop-shadow">
                {announcement.title}
              </div>
              <div className="text-xs text-slate-300 font-medium">{announcement.subtitle}</div>
            </div>
          </div>

          <button
            onClick={() => setVisible(false)}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
