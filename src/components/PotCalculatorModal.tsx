import React from 'react';
import type { TableState } from '../types/poker';
import { formatChips } from '../utils/pokerRules';
import { Calculator, X, Coins, ShieldCheck } from 'lucide-react';

interface PotCalculatorModalProps {
  tableState: TableState;
  onClose: () => void;
}

export const PotCalculatorModal: React.FC<PotCalculatorModalProps> = ({
  tableState,
  onClose,
}) => {
  const totalPot = tableState.pot + tableState.communityBets;

  return (
    <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-amber-400/50 rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-500/10 rounded-xl border border-amber-500/20">
              <Calculator className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-amber-200">
                Live Pot & Side-Pot Calculations
              </h3>
              <p className="text-xs text-slate-400">Accurate side-pot splits for all-in scenarios</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-amber-500/30 shadow-inner">
            <div className="text-xs text-amber-200/80 font-bold uppercase tracking-wider flex items-center gap-1.5 mb-1">
              <Coins className="w-3.5 h-3.5 text-amber-400" /> Total Pot
            </div>
            <div className="text-2xl font-black text-amber-300 font-mono tracking-tight">
              {formatChips(totalPot)}
            </div>
          </div>
          <div className="bg-slate-950/80 p-3.5 rounded-xl border border-slate-800 shadow-inner">
            <div className="text-xs text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1.5 mb-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" /> Current Bet
            </div>
            <div className="text-2xl font-black text-emerald-400 font-mono tracking-tight">
              {formatChips(tableState.currentHighBet)}
            </div>
          </div>
        </div>

        <div>
          <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center justify-between">
            <span>Pot Breakdown</span>
            <span className="text-amber-400 font-mono">({tableState.sidePots.length || 1} Pot)</span>
          </h4>

          {tableState.sidePots.length === 0 ? (
            <div className="text-xs text-slate-500 italic p-3.5 bg-slate-950/80 rounded-xl border border-slate-800 text-center">
              No chips in the pot yet.
            </div>
          ) : (
            <div className="space-y-2 max-h-44 overflow-y-auto pr-1">
              {tableState.sidePots.map((pot, idx) => {
                const eligibleNames = pot.eligiblePlayerIds
                  .map((id) => tableState.players[id]?.name || 'Player')
                  .join(', ');

                return (
                  <div
                    key={idx}
                    className="p-3 bg-slate-950 rounded-xl border border-slate-800/90 flex flex-col gap-1 shadow-sm"
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-extrabold text-amber-300">
                        {idx === 0 ? '🏆 Main Pot' : `🎯 Side Pot #${idx}`}
                      </span>
                      <span className="font-mono font-black text-amber-400 text-sm">
                        {formatChips(pot.amount)} chips
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400">
                      <strong className="text-slate-300">Eligible:</strong> {eligibleNames || 'None (all folded)'}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div>
          <h4 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">
            Player Contributions
          </h4>
          <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
            {Object.values(tableState.players).map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between text-xs p-2.5 bg-slate-950/60 border border-slate-800/60 rounded-xl"
              >
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-200">{p.name}</span>
                  {p.hasFolded && (
                    <span className="text-[10px] bg-rose-950/80 border border-rose-800/50 text-rose-300 px-1.5 py-0.2 rounded font-semibold">
                      Folded
                    </span>
                  )}
                  {p.isAllIn && (
                    <span className="text-[10px] bg-amber-950/80 border border-amber-600/50 text-amber-300 px-1.5 py-0.2 rounded font-black">
                      ALL-IN
                    </span>
                  )}
                </div>
                <div className="text-right font-mono">
                  <span className="text-amber-300 font-black">
                    {formatChips(p.totalInvestedThisHand)}
                  </span>
                  <span className="text-[10px] text-slate-500 ml-1">chips</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <button
          onClick={onClose}
          className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs transition-colors cursor-pointer"
        >
          Close Calculator
        </button>
      </div>
    </div>
  );
};
