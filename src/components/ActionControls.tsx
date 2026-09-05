import React, { useState, useEffect } from 'react';
import type { Player, TableState, PlayerActionType } from '../types/poker';
import { formatChips } from '../utils/pokerRules';
import { useLanguage } from '../i18n/LanguageContext';
import { Flame, ArrowUpRight, Check, X, ShieldAlert, ChevronDown, ChevronUp } from 'lucide-react';

interface ActionControlsProps {
  player: Player;
  tableState: TableState;
  onAction: (action: PlayerActionType, amount?: number) => void;
  isMyTurn: boolean;
}

export const ActionControls: React.FC<ActionControlsProps> = React.memo(({
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
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  useEffect(() => {
    setRaiseAmount(minRaiseTarget);
  }, [minRaiseTarget, currentHigh]);


  if (player.isDealerOnly || player.seatIndex < 0) {
    return (
      <div className="bg-slate-900 border border-amber-500/40 rounded-2xl p-4 text-center text-slate-300 space-y-1.5 shadow-2xl">
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
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-center text-slate-400 font-medium flex items-center justify-center gap-2 shadow-2xl">
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
      <div className="bg-slate-950 border border-amber-500/40 rounded-2xl p-4 text-center text-amber-300 font-bold flex items-center justify-center gap-2 shadow-2xl">
        <Flame className="w-5 h-5 text-amber-400" />
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

  // COLLAPSED / MINIMIZED VIEW
  if (isCollapsed) {
    return (
      <div className="bg-slate-900 border border-amber-500/40 rounded-2xl p-2.5 px-3.5 shadow-2xl flex items-center justify-between gap-2.5 transition-all">
        <div className="flex items-center gap-2 min-w-0">
          {isMyTurn ? (
            <div className="flex items-center gap-1.5 text-amber-300 font-extrabold text-xs">
              <span className="relative flex h-2.5 w-2.5 shrink-0">
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
              </span>
              <span className="uppercase tracking-wider">{t('yourTurn')}</span>
              <span className="font-mono text-amber-200">({formatChips(Math.min(toCall, player.stack))})</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-slate-400 font-semibold text-xs truncate">
              <span className="w-2 h-2 rounded-full bg-slate-600 shrink-0" />
              <span className="truncate">{isAwaitingHost ? t('waitingHostConfirm') : t('waitingForTurn')}</span>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0">
          {isMyTurn && (
            <div className="flex items-center gap-1">
              <button
                onClick={() => onAction('fold')}
                className="px-2.5 py-1 bg-rose-600 hover:bg-rose-500 text-white font-black rounded-lg text-xs transition-all cursor-pointer shadow-sm active:scale-95"
              >
                {t('actionFold')}
              </button>
              <button
                onClick={() => onAction(canCheck ? 'check' : 'call')}
                className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-lg text-xs transition-all cursor-pointer shadow-sm active:scale-95"
              >
                {canCheck ? t('actionCheck') : `${t('actionCall')} ${formatChips(Math.min(toCall, player.stack))}`}
              </button>
            </div>
          )}

          <button
            onClick={() => setIsCollapsed(false)}
            className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-amber-300 hover:text-amber-200 px-2 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer border border-slate-700 active:scale-95"
            title="Expand action controls"
          >
            <ChevronUp className="w-3.5 h-3.5 text-amber-400" />
            <span className="text-[11px] hidden sm:inline">ขยาย</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`rounded-2xl p-3.5 sm:p-4 transition-all duration-200 border shadow-2xl ${
        isMyTurn
          ? 'bg-slate-900 border-amber-400/80 ring-1 ring-amber-400/30'
          : isAwaitingHost
          ? 'bg-slate-900 border-amber-500/40'
          : 'bg-slate-950 border-slate-800/80'
      }`}
    >
      {!isMyTurn && (
        <div className="text-xs font-semibold text-slate-400 mb-2 flex items-center justify-between">
          <span className="flex items-center gap-2">
            <span
              className={`w-2 h-2 rounded-full ${
                isAwaitingHost ? 'bg-amber-400' : 'bg-slate-600'
              }`}
            />
            <span className={isAwaitingHost ? 'text-amber-300 font-bold' : ''}>
              {isAwaitingHost ? t('waitingHostConfirm') : t('waitingForTurn')}
            </span>
          </span>
          <div className="flex items-center gap-2">
            <span className="text-slate-400 font-mono text-xs">
              {t('stackLabel')}: <strong className="text-amber-300 font-bold">{formatChips(player.stack)}</strong>
            </span>
            <button
              onClick={() => setIsCollapsed(true)}
              className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-amber-300 transition-colors cursor-pointer flex items-center gap-0.5 text-[10px]"
              title="Minimize Controls"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {isMyTurn && (
        <div className="flex items-center justify-between mb-2.5 border-b border-amber-500/20 pb-2">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
            </span>
            <span className="text-xs sm:text-sm font-extrabold text-amber-300 uppercase tracking-widest flex items-center gap-1">
              {t('yourTurn')}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-xs text-slate-300">
              {t('toCall')} <strong className="text-amber-400 font-mono font-bold text-sm">{formatChips(Math.min(toCall, player.stack))}</strong>
            </div>
            <button
              onClick={() => setIsCollapsed(true)}
              className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-amber-300 transition-colors cursor-pointer flex items-center gap-0.5 text-[10px]"
              title="Minimize Controls"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-1.5 sm:gap-2 mb-1.5 sm:mb-2">
        {/* FOLD Button */}
        <button
          disabled={!isMyTurn}
          onClick={() => onAction('fold')}
          className="relative group overflow-hidden flex flex-col items-center justify-center py-2 sm:py-2.5 px-2 rounded-xl font-black bg-gradient-to-b from-rose-600 via-rose-700 to-rose-900 hover:from-rose-500 hover:to-rose-800 active:scale-95 text-white shadow-md border border-rose-500/40 transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer min-h-[48px] sm:min-h-0"
        >
          <div className="flex items-center gap-1">
            <X className="w-4 h-4 group-hover:rotate-90 transition-transform duration-200" />
            <span className="text-xs sm:text-sm tracking-wider">{t('actionFold')}</span>
          </div>
          <span className="text-[9px] text-rose-200 font-medium opacity-80 hidden sm:block">{t('actionSurrender')}</span>
        </button>

        {/* CHECK or CALL Button */}
        {canCheck ? (
          <button
            disabled={!isMyTurn}
            onClick={() => onAction('check')}
            className="relative group overflow-hidden flex flex-col items-center justify-center py-2 sm:py-2.5 px-2 rounded-xl font-black bg-gradient-to-b from-emerald-600 via-emerald-700 to-emerald-900 hover:from-emerald-500 hover:to-emerald-800 active:scale-95 text-white shadow-md border border-emerald-500/40 transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer min-h-[48px] sm:min-h-0"
          >
            <div className="flex items-center gap-1">
              <Check className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span className="text-xs sm:text-sm tracking-wider">{t('actionCheck')}</span>
            </div>
            <span className="text-[9px] text-emerald-200 font-medium opacity-80 hidden sm:block">{t('actionCheckSub')}</span>
          </button>
        ) : (
          <button
            disabled={!isMyTurn}
            onClick={() => onAction('call')}
            className="relative group overflow-hidden flex flex-col items-center justify-center py-2 sm:py-2.5 px-2 rounded-xl font-black bg-gradient-to-b from-blue-600 via-blue-700 to-blue-900 hover:from-blue-500 hover:to-blue-800 active:scale-95 text-white shadow-md border border-blue-500/40 transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer min-h-[48px] sm:min-h-0"
          >
            <div className="flex items-center gap-1">
              <Check className="w-4 h-4" />
              <span className="text-xs sm:text-sm tracking-wider font-mono">{t('actionCall')}</span>
            </div>
            <span className="text-xs sm:text-sm font-mono font-bold text-blue-100">{formatChips(Math.min(toCall, player.stack))}</span>
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
          className="relative group overflow-hidden flex flex-col items-center justify-center py-2 sm:py-2.5 px-2 rounded-xl font-black bg-gradient-to-b from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 active:scale-95 text-slate-950 shadow-md border border-amber-300/60 transition-all disabled:opacity-30 disabled:pointer-events-none cursor-pointer min-h-[48px] sm:min-h-0"
        >
          <div className="flex items-center gap-1">
            <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            <span className="text-xs tracking-wider font-mono font-black">
              {raiseAmount >= maxRaiseTarget ? t('actionAllInBtn') : t('actionRaise')}
            </span>
          </div>
          <span className="text-xs sm:text-sm font-mono font-black text-slate-900 leading-none">
            {raiseAmount >= maxRaiseTarget ? formatChips(maxRaiseTarget) : formatChips(raiseAmount)}
          </span>
        </button>
      </div>

      {isMyTurn && player.stack > toCall && (
        <div className="bg-slate-950 p-2.5 sm:p-3 rounded-xl border border-slate-800 space-y-2 sm:space-y-2.5 shadow-inner">
          <div className="grid grid-cols-3 sm:flex sm:flex-wrap items-center gap-1.5 justify-between">
            <button
              onClick={() => setPresetRaise(2.5, 'bb')}
              className="py-2 sm:py-1 px-1 sm:px-2.5 text-xs font-mono font-bold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all cursor-pointer"
            >
              2.5 BB
            </button>
            <button
              onClick={() => setPresetRaise(3, 'bb')}
              className="py-2 sm:py-1 px-1 sm:px-2.5 text-xs font-mono font-bold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-all cursor-pointer"
            >
              3 BB
            </button>
            <button
              onClick={() => setPresetRaise(0.5, 'pot')}
              className="py-2 sm:py-1 px-1 sm:px-2.5 text-xs font-bold rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 hover:text-amber-200 border border-slate-700 transition-all cursor-pointer"
            >
              {t('halfPot')}
            </button>
            <button
              onClick={() => setPresetRaise(0.75, 'pot')}
              className="py-2 sm:py-1 px-1 sm:px-2.5 text-xs font-bold rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 hover:text-amber-200 border border-slate-700 transition-all cursor-pointer"
            >
              {t('threeQuarterPot')}
            </button>
            <button
              onClick={() => setPresetRaise(1.0, 'pot')}
              className="py-2 sm:py-1 px-1 sm:px-2.5 text-xs font-bold rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-300 hover:text-amber-200 border border-slate-700 transition-all cursor-pointer"
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
});

