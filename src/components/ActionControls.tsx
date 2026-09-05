import React, { useState, useEffect } from 'react';
import type { Player, TableState, PlayerActionType } from '../types/poker';
import { formatChips } from '../utils/pokerRules';
import { useLanguage } from '../i18n/LanguageContext';
import { Flame, ArrowUpRight, Check, X, ShieldAlert } from 'lucide-react';

interface ActionControlsProps {
  player: Player;
  tableState: TableState;
  onAction: (action: PlayerActionType, amount?: number) => void;
  isMyTurn: boolean;
}

export const ActionControls: React.FC<ActionControlsProps> = ({
  player,
  tableState,
  onAction,
  isMyTurn,
}) => {
  const { t } = useLanguage();
  const currentHigh = tableState.currentHighBet;
  const toCall = currentHigh - player.currentBet;
  const canCheck = toCall === 0;

  const minRaiseTarget = Math.min(
    player.currentBet + player.stack,
    Math.max(currentHigh + tableState.minRaise, currentHigh * 2 || tableState.settings.bigBlind)
  );

  const maxRaiseTarget = player.currentBet + player.stack;

  const [raiseAmount, setRaiseAmount] = useState<number>(minRaiseTarget);

  useEffect(() => {
    setRaiseAmount(minRaiseTarget);
  }, [minRaiseTarget, currentHigh]);

  if (player.isDealerOnly || player.seatIndex < 0) {
    return (
      <div className="bg-slate-900/90 backdrop-blur-md border border-amber-500/40 rounded-2xl p-4 text-center text-slate-300 space-y-1.5 shadow-xl">
        <div className="flex items-center justify-center gap-2 text-amber-300 font-black text-sm">
          <ShieldAlert className="w-4 h-4 text-amber-400" />
          <span>{t('dealerOnlyNotice')}</span>
        </div>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          {t('dealerOnlyDesc')}
        </p>
      </div>
    );
  }

  if (player.hasFolded || (!tableState.isHandInProgress && player.stack === 0)) {
    return (
      <div className="bg-slate-950/80 backdrop-blur-md border border-slate-800 rounded-2xl p-4 text-center text-slate-400 font-medium flex items-center justify-center gap-2 shadow-lg">
        <ShieldAlert className="w-4 h-4 text-slate-500" />
        <span>
          {player.stack === 0
            ? t('zeroChipsMessage')
            : t('foldedMessage')}
        </span>
      </div>
    );
  }

  if (player.isAllIn || player.stack === 0) {
    return (
      <div className="bg-gradient-to-r from-amber-950/50 via-slate-950/80 to-rose-950/50 backdrop-blur-md border border-amber-500/40 rounded-2xl p-4 text-center text-amber-300 font-bold flex items-center justify-center gap-2 shadow-xl">
        <Flame className="w-5 h-5 text-amber-400 animate-bounce" />
        <span>
          {player.totalInvestedThisHand > 0 ? (
            t('allInCommitted', { chips: formatChips(player.totalInvestedThisHand) })
          ) : (
            t('zeroChipsRebuy')
          )}
        </span>
      </div>
    );
  }

  const currentTotalPot = tableState.pot + tableState.communityBets;

  const setPresetRaise = (multiplier: number, type: 'pot' | 'bb') => {
    let target = 0;
    if (type === 'pot') {
      target = currentHigh + Math.round(currentTotalPot * multiplier);
    } else {
      target = Math.round(tableState.settings.bigBlind * multiplier);
    }
    const clamped = Math.max(minRaiseTarget, Math.min(maxRaiseTarget, target));
    setRaiseAmount(clamped);
  };

  const isAwaitingHost =
    tableState.isHandInProgress &&
    tableState.currentTurnSeat === null &&
    tableState.street !== 'showdown';

  return (
    <div
      className={`rounded-2xl p-4 transition-all duration-300 border backdrop-blur-xl ${
        isMyTurn
          ? 'bg-slate-900/95 border-amber-400/80 shadow-[0_0_30px_rgba(245,158,11,0.25)] ring-1 ring-amber-400/30'
          : isAwaitingHost
          ? 'bg-amber-950/20 border-amber-500/40'
          : 'bg-slate-950/80 border-slate-800/80 opacity-90'
      }`}
    >
      {!isMyTurn && (
        <div className="text-xs font-semibold text-slate-400 mb-2 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                isAwaitingHost ? 'bg-amber-400 animate-ping' : 'bg-slate-600 animate-pulse'
              }`}
            />
            <span className={isAwaitingHost ? 'text-amber-300 font-bold' : ''}>
              {isAwaitingHost ? t('waitingHostConfirm') : t('waitingForTurn')}
            </span>
          </span>
          <span className="text-slate-400 font-mono text-xs">
            {t('stackLabel')}: <strong className="text-amber-300 font-bold">{formatChips(player.stack)}</strong>
          </span>
        </div>
      )}

      {isMyTurn && (
        <div className="flex items-center justify-between mb-3 border-b border-amber-500/20 pb-2.5">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
            </span>
            <span className="text-xs sm:text-sm font-extrabold text-amber-300 uppercase tracking-widest flex items-center gap-1">
              {t('yourTurn')}
            </span>
          </div>
          <div className="text-xs text-slate-300">
            {t('toCall')} <strong className="text-amber-400 font-mono font-bold text-sm">{formatChips(Math.min(toCall, player.stack))}</strong>
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-1.5 sm:gap-2 mb-2 sm:mb-3">
        {/* FOLD Button */}
        <button
          disabled={!isMyTurn}
          onClick={() => onAction('fold')}
          className="relative group overflow-hidden flex flex-col items-center justify-center py-3.5 sm:p-3 rounded-xl font-black bg-gradient-to-b from-rose-600 via-rose-700 to-rose-900 hover:from-rose-500 hover:to-rose-800 active:scale-95 text-white shadow-[0_4px_15px_rgba(225,29,72,0.35)] border border-rose-500/40 transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer min-h-[64px] sm:min-h-0"
        >
          <div className="absolute inset-x-0 top-0 h-1/2 bg-white/10 pointer-events-none rounded-t-xl" />
          <X className="w-5 h-5 sm:w-5 sm:h-5 mb-0.5 group-hover:rotate-90 transition-transform duration-200" />
          <span className="text-sm sm:text-sm tracking-wider">{t('actionFold')}</span>
          <span className="text-[9px] text-rose-200 font-medium opacity-80 hidden sm:block">{t('actionSurrender')}</span>
        </button>

        {/* CHECK or CALL Button */}
        {canCheck ? (
          <button
            disabled={!isMyTurn}
            onClick={() => onAction('check')}
            className="relative group overflow-hidden flex flex-col items-center justify-center py-3.5 sm:p-3 rounded-xl font-black bg-gradient-to-b from-emerald-600 via-emerald-700 to-emerald-900 hover:from-emerald-500 hover:to-emerald-800 active:scale-95 text-white shadow-[0_4px_15px_rgba(16,185,129,0.35)] border border-emerald-500/40 transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer min-h-[64px] sm:min-h-0"
          >
            <div className="absolute inset-x-0 top-0 h-1/2 bg-white/10 pointer-events-none rounded-t-xl" />
            <Check className="w-5 h-5 mb-0.5 group-hover:scale-110 transition-transform" />
            <span className="text-sm tracking-wider">{t('actionCheck')}</span>
            <span className="text-[9px] text-emerald-200 font-medium opacity-80 hidden sm:block">{t('actionCheckSub')}</span>
          </button>
        ) : (
          <button
            disabled={!isMyTurn}
            onClick={() => onAction('call')}
            className="relative group overflow-hidden flex flex-col items-center justify-center py-3.5 sm:p-3 rounded-xl font-black bg-gradient-to-b from-blue-600 via-blue-700 to-blue-900 hover:from-blue-500 hover:to-blue-800 active:scale-95 text-white shadow-[0_4px_15px_rgba(37,99,235,0.35)] border border-blue-500/40 transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer min-h-[64px] sm:min-h-0"
          >
            <div className="absolute inset-x-0 top-0 h-1/2 bg-white/10 pointer-events-none rounded-t-xl" />
            <Check className="w-5 h-5 mb-0.5" />
            <span className="text-xs sm:text-sm tracking-wider font-mono">{t('actionCall')}</span>
            <span className="text-[20px] font-mono font-bold text-blue-100">{formatChips(Math.min(toCall, player.stack))}</span>
          </button>
        )}

        {/* RAISE or ALL-IN Button */}
        <button
          disabled={!isMyTurn || player.stack <= toCall}
          onClick={() => {
            if (raiseAmount >= maxRaiseTarget) {
              onAction('all-in');
            } else {
              onAction('raise', raiseAmount);
            }
          }}
          className="relative group overflow-hidden flex flex-col items-center justify-center py-3.5 sm:p-3 rounded-xl font-black bg-gradient-to-b from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 active:scale-95 text-slate-950 shadow-[0_4px_20px_rgba(245,158,11,0.4)] border border-amber-300/60 transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer min-h-[64px] sm:min-h-0"
        >
          <div className="absolute inset-x-0 top-0 h-1/2 bg-white/20 pointer-events-none rounded-t-xl" />
          <ArrowUpRight className="w-5 h-5 mb-0.5 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
          <span className="text-xs tracking-wider font-mono font-black">
            {raiseAmount >= maxRaiseTarget ? t('actionAllInBtn') : t('actionRaise')}
          </span>
          <span className="text-[20px] font-mono font-black text-slate-800 leading-none">
            {raiseAmount >= maxRaiseTarget ? formatChips(maxRaiseTarget) : formatChips(raiseAmount)}
          </span>
        </button>
      </div>

      {isMyTurn && player.stack > toCall && (
        <div className="bg-slate-950/80 p-2.5 sm:p-3 rounded-xl border border-slate-800 space-y-2 sm:space-y-2.5 shadow-inner">
          <div className="grid grid-cols-3 sm:flex sm:flex-wrap items-center gap-1.5 justify-between">
            <button
              onClick={() => setPresetRaise(2.5, 'bb')}
              className="py-2 sm:py-1 px-1 sm:px-2.5 text-xs font-mono font-bold rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all cursor-pointer"
            >
              2.5 BB
            </button>
            <button
              onClick={() => setPresetRaise(3, 'bb')}
              className="py-2 sm:py-1 px-1 sm:px-2.5 text-xs font-mono font-bold rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all cursor-pointer"
            >
              3 BB
            </button>
            <button
              onClick={() => setPresetRaise(0.5, 'pot')}
              className="py-2 sm:py-1 px-1 sm:px-2.5 text-xs font-bold rounded-lg bg-slate-800/80 hover:bg-slate-700 text-amber-300 hover:text-amber-200 border border-slate-700 transition-all cursor-pointer"
            >
              {t('halfPot')}
            </button>
            <button
              onClick={() => setPresetRaise(0.75, 'pot')}
              className="py-2 sm:py-1 px-1 sm:px-2.5 text-xs font-bold rounded-lg bg-slate-800/80 hover:bg-slate-700 text-amber-300 hover:text-amber-200 border border-slate-700 transition-all cursor-pointer"
            >
              {t('threeQuarterPot')}
            </button>
            <button
              onClick={() => setPresetRaise(1.0, 'pot')}
              className="py-2 sm:py-1 px-1 sm:px-2.5 text-xs font-bold rounded-lg bg-slate-800/80 hover:bg-slate-700 text-amber-300 hover:text-amber-200 border border-slate-700 transition-all cursor-pointer"
            >
              {t('fullPot')}
            </button>
            <button
              onClick={() => setRaiseAmount(maxRaiseTarget)}
              className="py-2 sm:py-1 px-1 sm:px-2.5 text-xs font-black rounded-lg bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white shadow-sm transition-all cursor-pointer"
            >
              {t('allInBadge')}
            </button>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 pt-0.5">
            <input
              type="range"
              min={minRaiseTarget}
              max={maxRaiseTarget}
              step={tableState.settings.smallBlind || 1}
              value={raiseAmount}
              onChange={(e) => setRaiseAmount(Number(e.target.value))}
              className="w-full accent-amber-400 cursor-pointer h-3 sm:h-2 bg-slate-800 rounded-lg appearance-none"
            />
            <div className="w-24 sm:w-28 shrink-0">
              <input
                type="number"
                min={minRaiseTarget}
                max={maxRaiseTarget}
                value={raiseAmount}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setRaiseAmount(Math.max(minRaiseTarget, Math.min(maxRaiseTarget, val)));
                }}
                className="w-full bg-slate-900 border border-amber-500/50 rounded-lg px-2 sm:px-2.5 py-1.5 sm:py-1 text-right text-xs font-mono font-extrabold text-amber-300 focus:outline-none focus:border-amber-400 shadow-inner"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
