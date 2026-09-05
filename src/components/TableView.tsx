import React, { useState } from 'react';
import type { TableState, Player } from '../types/poker';
import { ChipStack } from './ChipStack';
import { formatChips } from '../utils/pokerRules';
import { useLanguage } from '../i18n/LanguageContext';
import {
  User,
  WifiOff,
  Crown,
  Plus,
  Coins,
  Check,
  X,
  Flame,
  ArrowUpRight,
  Trophy,
  LayoutGrid,
  List,
} from 'lucide-react';

interface TableViewProps {
  tableState: TableState;
  localPlayerId: string;
  onSeatClick?: (seatIndex: number) => void;
  onPlayerClick?: (player: Player) => void;
}

export const TableView: React.FC<TableViewProps> = ({
  tableState,
  localPlayerId,
  onSeatClick,
  onPlayerClick,
}) => {
  const { t } = useLanguage();
  const [viewMode, setViewMode] = useState<'grid' | 'list'>(() => {
    const saved = localStorage.getItem('poker_view_mode');
    return saved === 'list' ? 'list' : 'grid';
  });

  const handleSetViewMode = (mode: 'grid' | 'list') => {
    setViewMode(mode);
    localStorage.setItem('poker_view_mode', mode);
  };

  const totalSeats = tableState.settings.tableSize || 8;
  const playersBySeat: Record<number, Player> = {};

  Object.values(tableState.players).forEach((p) => {
    playersBySeat[p.seatIndex] = p;
  });

  const totalPot = tableState.pot + tableState.communityBets;

  const getStreetLabel = (street: string) => {
    switch (street) {
      case 'preflop': return t('streetPreflop');
      case 'flop': return t('streetFlop');
      case 'turn': return t('streetTurn');
      case 'river': return t('streetRiver');
      case 'showdown': return t('streetShowdown');
      default: return t('streetReady');
    }
  };

  return (
    <div className="w-full select-none flex flex-col gap-2.5 sm:gap-3.5 p-1 sm:p-2">
      {/* Central Pot & Street Info Header Card */}
      <div className="bg-gradient-to-r from-slate-900 via-emerald-950/60 to-slate-900 border border-emerald-500/30 rounded-2xl p-3 sm:p-4 shadow-xl backdrop-blur-xl flex flex-wrap items-center justify-between gap-2.5 sm:gap-4 relative overflow-hidden">
        {/* Ambient background glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(16,185,129,0.12)_0%,transparent_70%)] pointer-events-none" />

        {/* Left: Street Badge & Round Info */}
        <div className="flex items-center gap-2 sm:gap-3 z-10">
          <div className="flex flex-col">
            <span className="text-[10px] sm:text-xs font-black uppercase tracking-wider text-slate-400">
              {t('roundStage')}
            </span>
            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
              <span className="text-xs sm:text-sm font-extrabold uppercase tracking-widest text-emerald-300 bg-emerald-950/90 px-2.5 py-1 rounded-lg border border-emerald-500/40 shadow-sm">
                {tableState.isHandInProgress ? getStreetLabel(tableState.street) : t('streetReady')}
              </span>
              <span className="text-[11px] font-mono text-slate-400 bg-slate-950/80 px-2 py-1 rounded-lg border border-slate-800">
                {t('handNumber', { number: tableState.handNumber })}
              </span>
              {tableState.players[tableState.hostId]?.isDealerOnly && (
                <span className="text-[10px] sm:text-xs font-bold text-amber-300 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/30 flex items-center gap-1">
                  <Crown className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                  <span>{tableState.players[tableState.hostId]?.name}: {t('dealerOnlyBadge')}</span>
                </span>
              )}
              {tableState.isHandInProgress && tableState.currentTurnSeat === null && tableState.street !== 'showdown' && (
                <span className="text-[10px] sm:text-xs font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-lg border border-amber-400/60 shadow-sm animate-pulse">
                  ⏳ {t('roundCompleteBadge')}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Center/Right: Layout View Mode Toggle & Total Pot Highlight */}
        <div className="flex items-center gap-2 sm:gap-3.5 z-10 ml-auto flex-wrap justify-end">
          {/* View Mode Switcher (Grid vs List) */}
          <div className="flex items-center bg-slate-950/80 border border-slate-800 rounded-xl p-1 gap-1 shadow-inner">
            <button
              onClick={() => handleSetViewMode('grid')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
              title={t('viewModeGrid')}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">{t('viewModeGrid')}</span>
            </button>
            <button
              onClick={() => handleSetViewMode('list')}
              className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
              title={t('viewModeList')}
            >
              <List className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">{t('viewModeList')}</span>
            </button>
          </div>

          {totalPot > 0 && (
            <div className="hidden md:block">
              <ChipStack amount={totalPot} size="sm" showLabel={false} />
            </div>
          )}

          <div className="flex items-center gap-2 sm:gap-3 bg-slate-950/85 border border-amber-400/50 px-3.5 sm:px-5 py-1.5 sm:py-2 rounded-2xl backdrop-blur-md shadow-[0_4px_20px_rgba(245,158,11,0.25)]">
            <div className="p-1.5 bg-amber-500/10 rounded-xl border border-amber-500/30">
              <Coins className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
            </div>
            <div>
              <div className="text-[9px] sm:text-[10px] text-amber-200/90 font-bold uppercase tracking-widest leading-none">
                {t('totalPot')}
              </div>
              <div className="text-lg sm:text-2xl font-black text-amber-300 font-mono tracking-tight leading-tight drop-shadow-[0_2px_10px_rgba(245,158,11,0.5)]">
                {formatChips(totalPot)}
              </div>
            </div>
          </div>
        </div>

        {/* Side Pots display if any */}
        {tableState.sidePots.length > 1 && (
          <div className="w-full flex gap-1.5 flex-wrap pt-1 border-t border-slate-800/80 z-10">
            <span className="text-[10px] font-bold text-slate-400 self-center mr-1">{t('sidePots')}</span>
            {tableState.sidePots.map((sp, idx) => (
              <span
                key={idx}
                className="bg-slate-950/90 text-[10px] sm:text-xs font-mono font-bold text-amber-300 px-2 py-0.5 rounded-lg border border-amber-500/40 shadow-sm"
              >
                {idx === 0 ? t('mainPot') : t('sidePotN', { index: idx })}: {formatChips(sp.amount)}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Grid or List View of Players / Seats */}
      <div className={viewMode === 'grid' ? "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2 sm:gap-3" : "flex flex-col gap-2"}>
        {Array.from({ length: totalSeats }).map((_, seatIdx) => {
          const player = playersBySeat[seatIdx];
          const isLocal = player?.id === localPlayerId;
          const isTurn =
            tableState.isHandInProgress &&
            tableState.currentTurnSeat === seatIdx &&
            !!player &&
            !player.hasFolded &&
            !player.isAllIn &&
            player.stack > 0;
          const isDealer = tableState.dealerSeat === seatIdx;
          const isSB = tableState.sbSeat === seatIdx;
          const isBB = tableState.bbSeat === seatIdx;
          const isWinner = !!(tableState.lastWinner && tableState.lastWinner.winnerSeatIndexes.includes(seatIdx));
          const shareWon = isWinner && tableState.lastWinner
            ? Math.floor(tableState.lastWinner.amount / tableState.lastWinner.winnerSeatIndexes.length)
            : 0;

          const isLocalDealerOnly = tableState.players[localPlayerId]?.isDealerOnly;

          // EMPTY SEAT
          if (!player) {
            if (viewMode === 'list') {
              return (
                <button
                  key={`seat-${seatIdx}`}
                  disabled={isLocalDealerOnly}
                  onClick={() => {
                    if (isLocalDealerOnly) return;
                    onSeatClick?.(seatIdx);
                  }}
                  className={`w-full flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border border-dashed transition-all group backdrop-blur-sm shadow-sm ${
                    isLocalDealerOnly
                      ? 'border-slate-800/40 bg-slate-950/20 opacity-40 cursor-not-allowed'
                      : 'border-slate-800 hover:border-amber-400/80 bg-slate-950/40 hover:bg-slate-900/80 cursor-pointer hover:shadow-[0_0_15px_rgba(245,158,11,0.15)]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-950/80 px-2 py-0.5 rounded-md border border-slate-800">
                      {t('seatNumber', { number: seatIdx + 1 })}
                    </span>
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full border border-dashed border-slate-700 group-hover:border-amber-400/80 flex items-center justify-center text-slate-500 group-hover:text-amber-300 transition-colors">
                      <Plus className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                    </div>
                    <span className="text-xs sm:text-sm font-bold text-slate-400 group-hover:text-amber-300 transition-colors">
                      {t('emptySeat', { number: seatIdx + 1 })}
                    </span>
                  </div>

                  <span className="text-[11px] text-slate-600 group-hover:text-slate-400 font-medium">
                    {isLocalDealerOnly ? t('dealerOnlyBadge') : t('clickToSit')}
                  </span>
                </button>
              );
            }

            return (
              <button
                key={`seat-${seatIdx}`}
                disabled={isLocalDealerOnly}
                onClick={() => {
                  if (isLocalDealerOnly) return;
                  onSeatClick?.(seatIdx);
                }}
                className={`flex flex-col items-center justify-center p-4 sm:p-5 rounded-2xl border-2 border-dashed transition-all group backdrop-blur-sm min-h-[110px] sm:min-h-[125px] shadow-sm ${
                  isLocalDealerOnly
                    ? 'border-slate-800/40 bg-slate-950/20 opacity-40 cursor-not-allowed'
                    : 'border-slate-800 hover:border-amber-400/80 bg-slate-950/40 hover:bg-slate-900/80 cursor-pointer hover:shadow-[0_0_15px_rgba(245,158,11,0.2)]'
                }`}
              >
                <div className="w-8 h-8 rounded-full border border-dashed border-slate-700 group-hover:border-amber-400/80 flex items-center justify-center text-slate-500 group-hover:text-amber-300 transition-colors mb-1.5">
                  <Plus className="w-4 h-4 group-hover:scale-110 transition-transform" />
                </div>
                <span className="text-xs font-bold text-slate-400 group-hover:text-amber-300 transition-colors">
                  {t('seatNumber', { number: seatIdx + 1 })}
                </span>
                <span className="text-[10px] text-slate-600 group-hover:text-slate-400 font-medium">
                  {isLocalDealerOnly ? t('dealerOnlyBadge') : t('clickToSit')}
                </span>
              </button>
            );
          }

          // OCCUPIED PLAYER SEAT - LIST MODE
          if (viewMode === 'list') {
            return (
              <div
                key={`seat-${seatIdx}`}
                onClick={() => onPlayerClick?.(player)}
                className={`relative flex items-center justify-between px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl cursor-pointer transition-all duration-200 backdrop-blur-xl border gap-2 sm:gap-4 ${
                  isWinner
                    ? 'bg-gradient-to-r from-amber-950/90 via-slate-900 to-amber-950/90 border-amber-300 shadow-[0_0_35px_rgba(245,158,11,0.6)] ring-2 ring-amber-400 animate-winner z-20 scale-[1.01]'
                    : isTurn
                    ? 'bg-slate-900/95 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.4)] ring-1 ring-amber-400 animate-turn scale-[1.005]'
                    : player.hasFolded
                    ? 'bg-slate-950/60 border-slate-800/80 opacity-40 grayscale'
                    : isLocal
                    ? 'bg-slate-900/90 border-cyan-400/80 shadow-[0_0_14px_rgba(6,182,212,0.25)] ring-1 ring-cyan-400/30'
                    : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-800/80 shadow-md'
                }`}
              >
                {/* Left section: Seat # & Badges & Avatar & Player Info */}
                <div className="flex items-center gap-2.5 sm:gap-3 min-w-0 flex-1">
                  <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-950/80 px-2 py-0.5 rounded-md border border-slate-800 shrink-0">
                    {t('seatNumber', { number: seatIdx + 1 })}
                  </span>

                  <div className="relative shrink-0">
                    <div
                      className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-white font-bold text-xs sm:text-sm border shadow-inner ${
                        isWinner
                          ? 'bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-300 border-yellow-200 text-slate-950'
                          : isLocal
                          ? 'bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 border-cyan-300'
                          : 'bg-gradient-to-tr from-slate-700 to-slate-800 border-slate-500'
                      }`}
                    >
                      {isWinner ? (
                        <Trophy className="w-4 h-4 text-slate-950 stroke-[2.5] animate-victory" />
                      ) : player.isHost ? (
                        <Crown className="w-3 h-3 absolute -top-1 -left-1 text-amber-300 fill-amber-300 drop-shadow" />
                      ) : null}
                      {!isWinner && <User className="w-3.5 h-3.5 sm:w-4 sm:h-4" />}
                    </div>

                    {!player.connected && (
                      <div className="absolute -bottom-0.5 -right-0.5 bg-rose-600 text-white p-0.5 rounded-full shadow" title="Disconnected">
                        <WifiOff className="w-2 h-2" />
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="text-xs sm:text-sm font-bold text-slate-100 truncate">
                        {player.name}
                      </span>
                      {isLocal && (
                        <span className="text-[9px] font-extrabold text-cyan-400 shrink-0">{t('youBadge')}</span>
                      )}
                      {/* Dealer / SB / BB badges */}
                      {isDealer && (
                        <span className="w-4 h-4 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-200 text-slate-950 font-black text-[9px] flex items-center justify-center border border-amber-600 shadow font-mono shrink-0">
                          D
                        </span>
                      )}
                      {isSB && (
                        <span className="w-4 h-4 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-400 text-white font-black text-[8px] flex items-center justify-center border border-blue-300 shadow shrink-0">
                          SB
                        </span>
                      )}
                      {isBB && (
                        <span className="w-4 h-4 rounded-full bg-gradient-to-tr from-purple-600 to-fuchsia-400 text-white font-black text-[8px] flex items-center justify-center border border-purple-300 shadow shrink-0">
                          BB
                        </span>
                      )}
                    </div>

                    {/* Status badge */}
                    <div className="mt-0.5">
                      {isWinner ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-black text-amber-300 bg-amber-500/20 px-1.5 py-0.5 rounded border border-amber-400/80 shadow-md animate-pulse">
                          <Trophy className="w-2.5 h-2.5 text-amber-400 shrink-0" />
                          {t('winnerBadge', { amount: formatChips(shareWon) })}
                        </span>
                      ) : player.hasFolded ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-400 bg-rose-950/80 px-1.5 py-0.5 rounded border border-rose-500/40 shadow-sm">
                          <X className="w-2.5 h-2.5" />
                          {t('foldedBadge')}
                        </span>
                      ) : player.isAllIn ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-black text-amber-300 bg-amber-950/80 px-1.5 py-0.5 rounded border border-amber-600/50 animate-pulse shadow-sm">
                          <Flame className="w-2.5 h-2.5 text-amber-400" />
                          {t('allInBadge')}
                        </span>
                      ) : isTurn ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-black text-amber-300 bg-amber-950/80 px-1.5 py-0.5 rounded border border-amber-500/50 shadow-sm">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping inline-block" />
                          {t('actingBadge')}
                        </span>
                      ) : player.lastAction === 'check' ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-300 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-500/40 shadow-sm">
                          <Check className="w-2.5 h-2.5 text-emerald-400" />
                          {t('checkedBadge')}
                        </span>
                      ) : player.lastAction === 'call' ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-300 bg-blue-950/80 px-1.5 py-0.5 rounded border border-blue-500/40 shadow-sm">
                          <Check className="w-2.5 h-2.5 text-blue-400" />
                          {t('calledBadge')}
                        </span>
                      ) : player.lastAction === 'raise' ? (
                        <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-300 bg-amber-950/80 px-1.5 py-0.5 rounded border border-amber-500/40 shadow-sm">
                          <ArrowUpRight className="w-2.5 h-2.5 text-amber-400" />
                          {t('raisedBadge')}
                        </span>
                      ) : (
                        <span className="text-[10px] text-slate-400 font-medium">{t('inHandBadge')}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right section: Stack & Bet */}
                <div className="flex items-center gap-3 shrink-0 text-right">
                  {tableState.isHandInProgress && player.currentBet > 0 && (
                    <div>
                      <span className="text-[9px] uppercase font-bold text-emerald-400 block leading-none">{t('betLabel')}</span>
                      <span className="font-mono font-black text-emerald-300 text-xs sm:text-sm bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-500/40 inline-block mt-0.5">
                        {formatChips(player.currentBet)}
                      </span>
                    </div>
                  )}

                  <div>
                    <span className="text-[9px] uppercase font-bold text-slate-500 block leading-none">{t('stackLabel')}</span>
                    <span className="font-mono font-black text-amber-300 text-xs sm:text-sm leading-tight block mt-0.5">
                      {formatChips(player.stack)}
                    </span>
                  </div>
                </div>
              </div>
            );
          }

          // OCCUPIED PLAYER SEAT - GRID MODE
          return (
            <div
              key={`seat-${seatIdx}`}
              onClick={() => onPlayerClick?.(player)}
              className={`relative flex flex-col justify-between p-2.5 sm:p-3.5 rounded-2xl cursor-pointer transition-all duration-200 backdrop-blur-xl border ${
                isWinner
                  ? 'bg-gradient-to-b from-amber-950/90 via-slate-900 to-amber-950/90 border-amber-300 shadow-[0_0_35px_rgba(245,158,11,0.6)] ring-2 ring-amber-400 animate-winner z-20 scale-[1.03]'
                  : isTurn
                  ? 'bg-slate-900/95 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.4)] ring-1 ring-amber-400 animate-turn scale-[1.02]'
                  : player.hasFolded
                  ? 'bg-slate-950/60 border-slate-800/80 opacity-40 grayscale'
                  : isLocal
                  ? 'bg-slate-900/90 border-cyan-400/80 shadow-[0_0_14px_rgba(6,182,212,0.25)] ring-1 ring-cyan-400/30'
                  : 'bg-slate-900/80 border-slate-800 hover:border-slate-700 hover:bg-slate-800/80 shadow-md'
              }`}
            >
              {/* Header inside Card: Seat # & Badges */}
              <div className="flex items-center justify-between gap-1 mb-2">
                <span className="text-[10px] font-mono font-bold text-slate-400 bg-slate-950/80 px-2 py-0.5 rounded-md border border-slate-800">
                  {t('seatNumber', { number: seatIdx + 1 })}
                </span>

                <div className="flex items-center gap-1">
                  {isDealer && (
                    <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-200 text-slate-950 font-black text-[9px] sm:text-[10px] flex items-center justify-center border border-amber-600 shadow font-mono">
                      D
                    </span>
                  )}
                  {isSB && (
                    <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-400 text-white font-black text-[8px] sm:text-[9px] flex items-center justify-center border border-blue-300 shadow">
                      SB
                    </span>
                  )}
                  {isBB && (
                    <span className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-gradient-to-tr from-purple-600 to-fuchsia-400 text-white font-black text-[8px] sm:text-[9px] flex items-center justify-center border border-purple-300 shadow">
                      BB
                    </span>
                  )}
                </div>
              </div>

              {/* Player Body: Avatar & Name */}
              <div className="flex items-center gap-2.5 my-1">
                <div className="relative shrink-0">
                  <div
                    className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center text-white font-bold text-sm border shadow-inner ${
                      isWinner
                        ? 'bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-300 border-yellow-200 text-slate-950'
                        : isLocal
                        ? 'bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 border-cyan-300'
                        : 'bg-gradient-to-tr from-slate-700 to-slate-800 border-slate-500'
                    }`}
                  >
                    {isWinner ? (
                      <Trophy className="w-4 h-4 sm:w-5 sm:h-5 text-slate-950 stroke-[2.5] animate-victory" />
                    ) : player.isHost ? (
                      <Crown className="w-3.5 h-3.5 absolute -top-1.5 -left-1 text-amber-300 fill-amber-300 drop-shadow" />
                    ) : null}
                    {!isWinner && <User className="w-4 h-4 sm:w-5 sm:h-5" />}
                  </div>

                  {!player.connected && (
                    <div className="absolute -bottom-0.5 -right-0.5 bg-rose-600 text-white p-0.5 rounded-full shadow" title="Disconnected">
                      <WifiOff className="w-2.5 h-2.5" />
                    </div>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1">
                    <span className="text-xs sm:text-sm font-bold text-slate-100 truncate block">
                      {player.name}
                    </span>
                    {isLocal && (
                      <span className="text-[9px] font-extrabold text-cyan-400 shrink-0">{t('youBadge')}</span>
                    )}
                  </div>

                  {isWinner ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-black text-amber-300 bg-amber-500/20 px-1.5 py-0.5 rounded border border-amber-400/80 shadow-md animate-pulse">
                      <Trophy className="w-2.5 h-2.5 text-amber-400 shrink-0" />
                      {t('winnerBadge', { amount: formatChips(shareWon) })}
                    </span>
                  ) : player.hasFolded ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-rose-400 bg-rose-950/80 px-1.5 py-0.5 rounded border border-rose-500/40 shadow-sm">
                      <X className="w-2.5 h-2.5" />
                      {t('foldedBadge')}
                    </span>
                  ) : player.isAllIn ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-black text-amber-300 bg-amber-950/80 px-1.5 py-0.5 rounded border border-amber-600/50 animate-pulse shadow-sm">
                      <Flame className="w-2.5 h-2.5 text-amber-400" />
                      {t('allInBadge')}
                    </span>
                  ) : isTurn ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-black text-amber-300 bg-amber-950/80 px-1.5 py-0.5 rounded border border-amber-500/50 shadow-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping inline-block" />
                      {t('actingBadge')}
                    </span>
                  ) : player.lastAction === 'check' ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-300 bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-500/40 shadow-sm">
                      <Check className="w-2.5 h-2.5 text-emerald-400" />
                      {t('checkedBadge')}
                    </span>
                  ) : player.lastAction === 'call' ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-blue-300 bg-blue-950/80 px-1.5 py-0.5 rounded border border-blue-500/40 shadow-sm">
                      <Check className="w-2.5 h-2.5 text-blue-400" />
                      {t('calledBadge')}
                    </span>
                  ) : player.lastAction === 'raise' ? (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-300 bg-amber-950/80 px-1.5 py-0.5 rounded border border-amber-500/40 shadow-sm">
                      <ArrowUpRight className="w-2.5 h-2.5 text-amber-400" />
                      {t('raisedBadge')}
                    </span>
                  ) : (
                    <span className="text-[10px] text-slate-400 font-medium">{t('inHandBadge')}</span>
                  )}
                </div>
              </div>

              {/* Player Chips & Current Bet Footer */}
              <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between gap-1 text-xs">
                <div>
                  <span className="text-[9px] uppercase font-bold text-slate-500 block leading-none">{t('stackLabel')}</span>
                  <span className="font-mono font-black text-amber-300 text-xs sm:text-sm">
                    {formatChips(player.stack)}
                  </span>
                </div>

                {tableState.isHandInProgress && player.currentBet > 0 && (
                  <div className="text-right">
                    <span className="text-[9px] uppercase font-bold text-emerald-400 block leading-none">{t('betLabel')}</span>
                    <span className="font-mono font-black text-emerald-300 text-xs sm:text-sm bg-emerald-950/80 px-1.5 py-0.5 rounded border border-emerald-500/40 inline-block">
                      {formatChips(player.currentBet)}
                    </span>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
