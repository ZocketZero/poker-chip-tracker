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
    const rx = 41;
    const ry = 36;

    const x = cx + rx * Math.cos(angle);
    const y = cy + ry * Math.sin(angle);
    return { left: `${x}%`, top: `${y}%` };
  };

  const getBetCoordinates = (seatIndex: number, total: number) => {
    const angle = ((seatIndex / total) * 2 * Math.PI) + (Math.PI / 2);
    const cx = 50;
    const cy = 50;
    const rx = 24;
    const ry = 21;

    const x = cx + rx * Math.cos(angle);
    const y = cy + ry * Math.sin(angle);
    return { left: `${x}%`, top: `${y}%` };
  };

  const totalPot = tableState.pot + tableState.communityBets;

  return (
    <div className="relative w-full aspect-[16/10] max-h-[560px] select-none flex items-center justify-center p-2 sm:p-4">
      {/* Outer Wooden / Leather Rail */}
      <div className="w-full h-full rounded-[100px] sm:rounded-[150px] bg-gradient-to-b from-[#3a1a0c] via-[#241006] to-[#120702] p-3 sm:p-5 shadow-[0_25px_60px_rgba(0,0,0,0.95),inset_0_3px_6px_rgba(255,255,255,0.12),inset_0_-4px_8px_rgba(0,0,0,0.8)] border-4 border-[#4a220f]/80 relative flex items-center justify-center">
        
        {/* Leather Stitching / Trim line */}
        <div className="absolute inset-1.5 sm:inset-2.5 rounded-[92px] sm:rounded-[142px] border border-dashed border-amber-900/40 pointer-events-none" />

        {/* Table Felt (Deep Emerald Casino Green) */}
        <div className="w-full h-full rounded-[82px] sm:rounded-[132px] bg-gradient-to-b from-[#094129] via-[#062b1b] to-[#041a10] shadow-[inset_0_0_90px_rgba(0,0,0,0.85)] border-2 border-emerald-400/20 relative overflow-visible flex items-center justify-center">
          
          {/* Subtle Spotlight on Center Felt */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.18)_0%,transparent_70%)] pointer-events-none" />

          {/* Golden Racetrack Ring on Felt */}
          <div className="absolute inset-5 sm:inset-9 rounded-[68px] sm:rounded-[115px] border border-amber-400/20 shadow-[0_0_15px_rgba(245,158,11,0.05),inset_0_0_15px_rgba(245,158,11,0.05)] pointer-events-none" />

          {/* Table Center / Pot & Community Area */}
          <div className="absolute flex flex-col items-center justify-center text-center pointer-events-none z-10">
            {/* Street Badge */}
            <div className="text-[10px] uppercase font-extrabold tracking-widest text-emerald-300 bg-emerald-950/80 px-3 py-0.5 rounded-full border border-emerald-500/40 mb-1.5 backdrop-blur-md shadow-lg shadow-black/40">
              {tableState.isHandInProgress ? tableState.street : 'Ready for Hand'}
            </div>

            {/* Total Pot Display */}
            {totalPot > 0 && (
              <div className="flex flex-col items-center animate-turn bg-slate-950/70 border border-amber-400/50 px-5 py-2 rounded-2xl backdrop-blur-md shadow-[0_10px_30px_rgba(0,0,0,0.8)]">
                <div className="text-[10px] text-amber-200/90 font-bold uppercase tracking-widest">
                  Total Pot
                </div>
                <div className="text-xl sm:text-3xl font-black text-amber-300 font-mono tracking-tight drop-shadow-[0_2px_12px_rgba(245,158,11,0.6)]">
                  {formatChips(totalPot)}
                </div>
                <div className="mt-1">
                  <ChipStack amount={totalPot} size="sm" showLabel={false} />
                </div>
              </div>
            )}

            {/* Side Pots Breakdowns */}
            {tableState.sidePots.length > 1 && (
              <div className="flex gap-1.5 mt-2">
                {tableState.sidePots.map((sp, idx) => (
                  <span
                    key={idx}
                    className="bg-slate-950/90 text-[9px] sm:text-[10px] font-mono font-bold text-amber-300 px-2 py-0.5 rounded-lg border border-amber-500/40 shadow-sm"
                  >
                    {idx === 0 ? 'Main' : `Side ${idx}`}: {formatChips(sp.amount)}
                  </span>
                ))}
              </div>
            )}

            {totalPot === 0 && !tableState.isHandInProgress && (
              <div className="text-emerald-400/30 text-xs sm:text-sm font-serif-poker tracking-widest uppercase font-bold drop-shadow">
                ♠ Poker Chip Counter ♥
              </div>
            )}
          </div>

          {/* Render Active Community Bets Placed in Front of Players */}
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
              <div className="scale-75 sm:scale-90 md:scale-100 origin-center">
                <ChipStack amount={player.currentBet} size="sm" showLabel={false} maxChipsShown={3} />
              </div>
              </div>
            );
          })}

          {/* Render Player Seats */}
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
                    className={`relative flex flex-col items-center p-2 rounded-2xl cursor-pointer transition-all duration-200 backdrop-blur-md ${
                      isTurn
                        ? 'bg-slate-900/95 border-2 border-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.8)] scale-105 animate-turn'
                        : player.hasFolded
                        ? 'bg-slate-950/70 border border-slate-800/80 opacity-40 grayscale'
                        : isLocal
                        ? 'bg-slate-900/90 border-2 border-cyan-400 shadow-[0_0_15px_rgba(6,182,212,0.35)]'
                        : 'bg-slate-900/85 border border-slate-700/60 hover:border-amber-400/60 shadow-lg shadow-black/50'
                    }`}
                  >
                    {/* Position Badges (D / SB / BB) */}
                    <div className="absolute -top-2.5 -right-2 flex gap-1 z-40">
                      {isDealer && (
                        <span className="w-5 h-5 rounded-full bg-gradient-to-tr from-amber-400 to-yellow-200 text-slate-950 font-black text-[10px] flex items-center justify-center border border-amber-600 shadow-md font-mono">
                          D
                        </span>
                      )}
                      {isSB && (
                        <span className="w-5 h-5 rounded-full bg-gradient-to-tr from-blue-600 to-cyan-400 text-white font-black text-[9px] flex items-center justify-center border border-blue-300 shadow-md">
                          SB
                        </span>
                      )}
                      {isBB && (
                        <span className="w-5 h-5 rounded-full bg-gradient-to-tr from-purple-600 to-fuchsia-400 text-white font-black text-[9px] flex items-center justify-center border border-purple-300 shadow-md">
                          BB
                        </span>
                      )}
                    </div>

                    {/* Avatar Icon */}
                    <div className="relative">
                      <div
                        className={`w-9 h-9 sm:w-11 sm:h-11 rounded-full flex items-center justify-center text-white font-bold text-sm sm:text-base border shadow-inner ${
                          isLocal
                            ? 'bg-gradient-to-tr from-cyan-600 via-blue-600 to-indigo-600 border-cyan-300'
                            : 'bg-gradient-to-tr from-slate-700 to-slate-800 border-slate-500'
                        }`}
                      >
                        {player.isHost && (
                          <Crown className="w-3.5 h-3.5 absolute -top-1.5 -left-1 text-amber-300 fill-amber-300 drop-shadow" />
                        )}
                        <User className="w-5 h-5" />
                      </div>

                      {!player.connected && (
                        <div className="absolute -bottom-1 -right-1 bg-rose-600 text-white p-0.5 rounded-full shadow" title="Disconnected">
                          <WifiOff className="w-3 h-3" />
                        </div>
                      )}
                      {player.isAllIn && (
                        <div className="absolute -bottom-1.5 -right-2 bg-gradient-to-r from-amber-500 to-rose-500 text-slate-950 px-1 py-0.2 rounded-full font-black text-[8px] tracking-tighter shadow-md animate-bounce">
                          ALL-IN
                        </div>
                      )}
                    </div>

                    <div className="text-[10px] sm:text-xs font-bold text-slate-200 mt-1 max-w-[70px] sm:max-w-[90px] truncate text-center flex items-center justify-center gap-1">
                      {player.name}
                      {isLocal && (
                        <span className="text-[9px] text-cyan-400 font-extrabold">(You)</span>
                      )}
                    </div>

                    <div className="text-[11px] sm:text-xs font-extrabold font-mono text-amber-300 mt-0.5">
                      {formatChips(player.stack)}
                    </div>

                    {tableState.isHandInProgress && (player.currentBet > 0 || player.totalInvestedThisHand > 0) && (
                      <div className="text-[9px] sm:text-[10px] font-bold font-mono text-emerald-400 bg-emerald-950/80 px-1.5 py-0.5 rounded-full border border-emerald-500/30 mt-1 shadow-sm whitespace-nowrap">
                        Bet: {formatChips(player.currentBet || player.totalInvestedThisHand)}
                      </div>
                    )}
                  </div>
                ) : (
                  <button
                    onClick={() => onSeatClick?.(seatIdx)}
                    className="w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 border-dashed border-emerald-400/30 hover:border-amber-400 bg-emerald-950/40 hover:bg-amber-950/50 hover:shadow-[0_0_15px_rgba(245,158,11,0.4)] flex flex-col items-center justify-center text-emerald-400/60 hover:text-amber-300 transition-all group backdrop-blur-sm cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 group-hover:scale-125 transition-transform" />
                    <span className="text-[9px] font-bold">
                      Seat {seatIdx + 1}
                    </span>
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

