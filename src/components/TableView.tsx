import React from 'react';
import type { TableState, Player } from '../types/poker';
import { ChipStack } from './ChipStack';
import { formatChips } from '../utils/pokerRules';
import { User, WifiOff, Crown, Plus } from 'lucide-react';

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
  const totalSeats = tableState.settings.tableSize || 8;
  const playersBySeat: Record<number, Player> = {};

  Object.values(tableState.players).forEach((p) => {
    playersBySeat[p.seatIndex] = p;
  });

  const getSeatCoordinates = (seatIndex: number, total: number) => {
    const angle = ((seatIndex / total) * 2 * Math.PI) + (Math.PI / 2);
    const cx = 50;
    const cy = 50;
    const rx = 42;
    const ry = 37;
    const x = cx + rx * Math.cos(angle);
    const y = cy + ry * Math.sin(angle);
    return { left: `${x}%`, top: `${y}%` };
  };

  const getBetCoordinates = (seatIndex: number, total: number) => {
    const angle = ((seatIndex / total) * 2 * Math.PI) + (Math.PI / 2);
    const cx = 50;
    const cy = 50;
    const rx = 25;
    const ry = 22;
    const x = cx + rx * Math.cos(angle);
    const y = cy + ry * Math.sin(angle);
    return { left: `${x}%`, top: `${y}%` };
  };

  const totalPot = tableState.pot + tableState.communityBets;

  return (
    <div className="relative w-full aspect-[16/10] max-h-[560px] select-none flex items-center justify-center p-1 sm:p-3">
      {/* Outer Wooden / Leather Rail */}
      <div className="w-full h-full rounded-[80px] sm:rounded-[140px] bg-gradient-to-b from-[#3a1a0c] via-[#241006] to-[#120702] p-2 sm:p-4 shadow-[0_25px_60px_rgba(0,0,0,0.95),inset_0_3px_6px_rgba(255,255,255,0.12),inset_0_-4px_8px_rgba(0,0,0,0.8)] border-4 border-[#4a220f]/80 relative flex items-center justify-center">

        {/* Leather Stitching / Trim line */}
        <div className="absolute inset-1 sm:inset-2 rounded-[74px] sm:rounded-[134px] border border-dashed border-amber-900/40 pointer-events-none" />

        {/* Table Felt */}
        <div className="w-full h-full rounded-[68px] sm:rounded-[126px] bg-gradient-to-b from-[#094129] via-[#062b1b] to-[#041a10] shadow-[inset_0_0_90px_rgba(0,0,0,0.85)] border-2 border-emerald-400/20 relative overflow-visible flex items-center justify-center">

          {/* Spotlight */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.18)_0%,transparent_70%)] pointer-events-none" />

          {/* Golden Racetrack Ring */}
          <div className="absolute inset-4 sm:inset-8 rounded-[56px] sm:rounded-[108px] border border-amber-400/20 pointer-events-none" />

          {/* Center: Pot & Street */}
          <div className="absolute flex flex-col items-center justify-center text-center pointer-events-none z-10 px-2">
            <div className="text-[8px] sm:text-[10px] uppercase font-extrabold tracking-widest text-emerald-300 bg-emerald-950/80 px-2 sm:px-3 py-0.5 rounded-full border border-emerald-500/40 mb-1 sm:mb-1.5 backdrop-blur-md shadow-lg shadow-black/40 whitespace-nowrap">
              {tableState.isHandInProgress ? tableState.street : 'Ready'}
            </div>

            {totalPot > 0 && (
              <div className="flex flex-col items-center animate-turn bg-slate-950/70 border border-amber-400/50 px-2 sm:px-4 py-1 sm:py-2 rounded-xl sm:rounded-2xl backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.8)]">
                <div className="text-[7px] sm:text-[9px] text-amber-200/90 font-bold uppercase tracking-widest">Pot</div>
                <div className="text-sm sm:text-2xl font-black text-amber-300 font-mono tracking-tight drop-shadow-[0_2px_12px_rgba(245,158,11,0.6)] leading-none">
                  {formatChips(totalPot)}
                </div>
                <div className="mt-0.5 sm:mt-1 hidden sm:block">
                  <ChipStack amount={totalPot} size="sm" showLabel={false} />
                </div>
              </div>
            )}

            {tableState.sidePots.length > 1 && (
              <div className="flex gap-1 mt-1 flex-wrap justify-center max-w-[100px] sm:max-w-none">
                {tableState.sidePots.map((sp, idx) => (
                  <span key={idx} className="bg-slate-950/90 text-[7px] sm:text-[9px] font-mono font-bold text-amber-300 px-1 sm:px-2 py-0.5 rounded-lg border border-amber-500/40 shadow-sm">
                    {idx === 0 ? 'M' : `S${idx}`}: {formatChips(sp.amount)}
                  </span>
                ))}
              </div>
            )}

            {totalPot === 0 && !tableState.isHandInProgress && (
              <div className="text-emerald-400/25 text-[8px] sm:text-xs font-serif-poker tracking-widest uppercase font-bold">
                ♠ Poker ♥
              </div>
            )}
          </div>

          {/* Bet chips around table */}
          {Array.from({ length: totalSeats }).map((_, seatIdx) => {
            const player = playersBySeat[seatIdx];
            if (!player || player.currentBet <= 0) return null;
            const betPos = getBetCoordinates(seatIdx, totalSeats);
            return (
              <div
                key={`bet-${seatIdx}`}
                style={betPos}
                className="absolute -translate-x-1/2 -translate-y-1/2 z-20 transition-all duration-300"
              >
                <div className="scale-[0.55] sm:scale-[0.75] md:scale-90 lg:scale-100 origin-center">
                  <ChipStack amount={player.currentBet} size="sm" showLabel={false} maxChipsShown={3} />
                </div>
              </div>
            );
          })}

          {/* Player Seats */}
          {Array.from({ length: totalSeats }).map((_, seatIdx) => {
            const player = playersBySeat[seatIdx];
            const seatPos = getSeatCoordinates(seatIdx, totalSeats);
            const isLocal = player?.id === localPlayerId;
            const isTurn = tableState.currentTurnSeat === seatIdx;
            const isDealer = tableState.dealerSeat === seatIdx;
            const isSB = tableState.sbSeat === seatIdx;
            const isBB = tableState.bbSeat === seatIdx;

            return (
              <div
                key={`seat-${seatIdx}`}
                style={seatPos}
                className="absolute -translate-x-1/2 -translate-y-1/2 z-30 transition-all duration-300"
              >
                {player ? (
                  <div
                    onClick={() => onPlayerClick?.(player)}
                    className={`relative flex flex-col items-center px-1 py-0.5 sm:px-2 sm:py-1.5 rounded-xl sm:rounded-2xl cursor-pointer transition-all duration-200 backdrop-blur-md ${
                      isTurn
                        ? 'bg-slate-900/95 border-2 border-amber-400 shadow-[0_0_18px_rgba(245,158,11,0.8)] scale-110 animate-turn'
                        : player.hasFolded
                        ? 'bg-slate-950/70 border border-slate-800/80 opacity-35 grayscale'
                        : isLocal
                        ? 'bg-slate-900/90 border-2 border-cyan-400 shadow-[0_0_12px_rgba(6,182,212,0.4)]'
                        : 'bg-slate-900/85 border border-slate-700/60 hover:border-amber-400/60 shadow-md shadow-black/50'
                    }`}
                  >
                    {/* Position Badges */}
                    <div className="absolute -top-1.5 -right-1.5 sm:-top-2.5 sm:-right-2 flex gap-0.5 z-40">
                      {isDealer && (
                        <span className="w-3.5 h-3.5 sm:w-5 sm:h-5 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-200 text-slate-950 font-black text-[6px] sm:text-[10px] flex items-center justify-center border border-amber-600 shadow-md font-mono">
                          D
                        </span>
                      )}
                      {isSB && (
                        <span className="w-3.5 h-3.5 sm:w-5 sm:h-5 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-400 text-white font-black text-[5px] sm:text-[9px] flex items-center justify-center border border-blue-300 shadow-md">
                          SB
                        </span>
                      )}
                      {isBB && (
                        <span className="w-3.5 h-3.5 sm:w-5 sm:h-5 rounded-full bg-gradient-to-tr from-purple-600 to-fuchsia-400 text-white font-black text-[5px] sm:text-[9px] flex items-center justify-center border border-purple-300 shadow-md">
                          BB
                        </span>
                      )}
                    </div>

                    {/* Avatar */}
                    <div className="relative">
                      <div className={`w-6 h-6 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-white font-bold border shadow-inner ${
                        isLocal
                          ? 'bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 border-cyan-300'
                          : 'bg-gradient-to-tr from-slate-700 to-slate-800 border-slate-500'
                      }`}>
                        {player.isHost && (
                          <Crown className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 absolute -top-1 -left-0.5 text-amber-300 fill-amber-300 drop-shadow" />
                        )}
                        <User className="w-3 h-3 sm:w-4 sm:h-4" />
                      </div>
                      {!player.connected && (
                        <div className="absolute -bottom-0.5 -right-0.5 bg-rose-600 text-white p-0.5 rounded-full shadow">
                          <WifiOff className="w-2 h-2 sm:w-2.5 sm:h-2.5" />
                        </div>
                      )}
                      {player.isAllIn && (
                        <div className="absolute -bottom-1.5 -right-2 bg-gradient-to-r from-amber-500 to-rose-500 text-slate-950 px-0.5 sm:px-1 rounded-full font-black text-[6px] sm:text-[8px] tracking-tighter shadow-md animate-bounce whitespace-nowrap">
                          ALL-IN
                        </div>
                      )}
                    </div>

                    {/* Name */}
                    <div className="text-[7px] sm:text-[10px] font-bold text-slate-100 mt-0.5 max-w-[44px] sm:max-w-[72px] truncate text-center leading-none">
                      {player.name}
                      {isLocal && <span className="text-cyan-400"> ★</span>}
                    </div>

                    {/* Stack */}
                    <div className="text-[8px] sm:text-[11px] font-extrabold font-mono text-amber-300 leading-none">
                      {formatChips(player.stack)}
                    </div>

                    {/* Current bet badge */}
                    {tableState.isHandInProgress && player.currentBet > 0 && (
                      <div className="text-[6px] sm:text-[8px] font-bold font-mono text-emerald-300 bg-emerald-950/90 px-0.5 sm:px-1 py-0.5 rounded-full border border-emerald-500/40 mt-0.5 shadow-sm whitespace-nowrap">
                        {formatChips(player.currentBet)}
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => onSeatClick?.(seatIdx)}
                    className="w-7 h-7 sm:w-10 sm:h-10 rounded-full border-2 border-dashed border-emerald-400/30 hover:border-amber-400 bg-emerald-950/40 hover:bg-amber-950/50 hover:shadow-[0_0_12px_rgba(245,158,11,0.4)] flex flex-col items-center justify-center text-emerald-400/50 hover:text-amber-300 transition-all group backdrop-blur-sm cursor-pointer"
                  >
                    <Plus className="w-2.5 h-2.5 sm:w-3.5 sm:h-3.5 group-hover:scale-125 transition-transform" />
                    <span className="text-[6px] sm:text-[8px] font-bold">{seatIdx + 1}</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

