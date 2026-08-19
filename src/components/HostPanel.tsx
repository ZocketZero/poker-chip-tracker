import React, { useState } from 'react';
import type { TableState } from '../types/poker';
import { formatChips } from '../utils/pokerRules';
import { Play, FastForward, Award, PlusCircle, Settings, ShieldCheck, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface HostPanelProps {
  tableState: TableState;
  onStartHand: () => void;
  onNextStreet: () => void;
  onAwardPot: (winnerSeatIndexes: number[], customAmount?: number) => void;
  onRebuy: (playerId: string, amount: number) => void;
  onUpdateSettings: (settings: Partial<TableState['settings']>) => void;
}

export const HostPanel: React.FC<HostPanelProps> = ({
  tableState,
  onStartHand,
  onNextStreet,
  onAwardPot,
  onRebuy,
  onUpdateSettings,
}) => {
  const [showAwardModal, setShowAwardModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showRebuyModal, setShowRebuyModal] = useState(false);

  const [selectedWinners, setSelectedWinners] = useState<number[]>([]);
  const [customPotAmount, setCustomPotAmount] = useState<number>(0);

  const [selectedRebuyPlayer, setSelectedRebuyPlayer] = useState<string>('');
  const [rebuyAmount, setRebuyAmount] = useState<number>(500);

  const [sb, setSb] = useState(tableState.settings.smallBlind);
  const [bb, setBb] = useState(tableState.settings.bigBlind);
  const [ante, setAnte] = useState(tableState.settings.ante);

  const activePlayers = Object.values(tableState.players).filter((p) => p.isActive);
  const totalPot = tableState.pot + tableState.communityBets;

  const handleOpenAwardModal = () => {
    const candidates = Object.values(tableState.players).filter((p) => !p.hasFolded);
    setSelectedWinners(candidates.map((p) => p.seatIndex));
    setCustomPotAmount(totalPot);
    setShowAwardModal(true);
  };

  const handleConfirmAward = () => {
    if (selectedWinners.length === 0) return;
    try {
      confetti({
        particleCount: 100,
        spread: 80,
        origin: { y: 0.6 },
      });
    } catch (e) {}

    onAwardPot(selectedWinners, customPotAmount || totalPot);
    setShowAwardModal(false);
  };

  return (
    <div className="bg-slate-900/95 border border-amber-500/40 rounded-2xl p-4 shadow-2xl backdrop-blur-xl ring-1 ring-amber-500/20">
      <div className="flex items-center justify-between mb-3 border-b border-slate-800/80 pb-2.5">
        <div className="flex items-center gap-2">
          <span className="bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-300 text-xs font-black px-2.5 py-0.5 rounded-lg border border-amber-500/40 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            DEALER / HOST
          </span>
          <span className="text-xs font-mono text-slate-400">Hand #{tableState.handNumber}</span>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowRebuyModal(true)}
            className="text-xs font-bold flex items-center gap-1.5 bg-slate-800/80 hover:bg-slate-700 text-emerald-300 border border-emerald-500/30 px-2.5 py-1 rounded-lg transition-all cursor-pointer shadow-sm"
          >
            <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />
            Chips
          </button>
          <button
            onClick={() => setShowSettingsModal(true)}
            className="text-xs font-bold flex items-center gap-1.5 bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 px-2.5 py-1 rounded-lg transition-all cursor-pointer shadow-sm"
          >
            <Settings className="w-3.5 h-3.5 text-amber-400" />
            Blinds
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2">
        {!tableState.isHandInProgress ? (
          <button
            onClick={onStartHand}
            disabled={activePlayers.length < 2}
            className="col-span-3 py-3 px-4 bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 hover:from-emerald-400 hover:to-teal-500 active:scale-98 text-slate-950 font-black rounded-xl shadow-[0_4px_20px_rgba(16,185,129,0.35)] flex items-center justify-center gap-2 text-sm disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer border border-emerald-400/50"
          >
            <Play className="w-4 h-4 fill-slate-950" />
            DEAL NEW HAND ({tableState.settings.smallBlind}/{tableState.settings.bigBlind})
          </button>
        ) : (
          <>
            <button
              onClick={onNextStreet}
              disabled={tableState.street === 'showdown'}
              className="py-2.5 px-3 bg-slate-800/90 hover:bg-slate-700 text-slate-100 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 border border-slate-700 transition-all cursor-pointer shadow-sm disabled:opacity-40"
            >
              <FastForward className="w-3.5 h-3.5 text-cyan-400" />
              Next Street
            </button>

            <button
              onClick={handleOpenAwardModal}
              className="col-span-2 py-2.5 px-3 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-[0_4px_15px_rgba(245,158,11,0.35)] border border-amber-300/60 transition-all cursor-pointer"
            >
              <Award className="w-4 h-4 text-slate-950" />
              Award Pot ({formatChips(totalPot)})
            </button>
          </>
        )}
      </div>

      {showAwardModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-400/50 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div>
              <h3 className="text-lg font-black text-amber-300 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                Select Winner(s) & Award Pot
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Distribute the pot of{' '}
                <strong className="text-amber-400 font-mono font-black">{formatChips(totalPot)}</strong> chips among the hand winner(s).
              </p>
            </div>

            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {Object.values(tableState.players).map((p) => {
                const isSelected = selectedWinners.includes(p.seatIndex);
                return (
                  <button
                    key={p.id}
                    onClick={() => {
                      if (isSelected) {
                        setSelectedWinners(selectedWinners.filter((s) => s !== p.seatIndex));
                      } else {
                        setSelectedWinners([...selectedWinners, p.seatIndex]);
                      }
                    }}
                    className={`w-full flex items-center justify-between p-3 rounded-xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-amber-500/20 border-amber-400 text-amber-200 font-bold shadow-md'
                        : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="font-bold text-sm">{p.name} {p.hasFolded && <span className="text-rose-400 text-xs font-normal">(Folded)</span>}</div>
                      <div className="text-xs text-slate-400 font-mono">Seat {p.seatIndex + 1} • Stack: {formatChips(p.stack)}</div>
                    </div>
                    <div className="text-xs font-mono font-black">
                      {isSelected ? '✓ Selected' : 'Click to Pick'}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowAwardModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmAward}
                disabled={selectedWinners.length === 0}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 disabled:opacity-40 cursor-pointer"
              >
                Confirm Payout
              </button>
            </div>
          </div>
        </div>
      )}

      {showRebuyModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-emerald-400" />
                Add Chips (Rebuy / Top-Up)
              </h3>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Target Player</label>
                <select
                  value={selectedRebuyPlayer}
                  onChange={(e) => setSelectedRebuyPlayer(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-400"
                >
                  <option value="">Select player to top-up</option>
                  {Object.values(tableState.players).map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} (Seat {p.seatIndex + 1} - {formatChips(p.stack)} chips)
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">Amount to Add</label>
                <div className="grid grid-cols-4 gap-1.5 mb-2">
                  {[100, 500, 1000, 2000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setRebuyAmount(amt)}
                      className={`py-1.5 text-xs font-mono font-bold rounded-lg border transition-all cursor-pointer ${
                        rebuyAmount === amt
                          ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      +{amt}
                    </button>
                  ))}
                </div>
                <input
                  type="number"
                  value={rebuyAmount}
                  onChange={(e) => setRebuyAmount(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm font-mono font-bold text-amber-300 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowRebuyModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                disabled={!selectedRebuyPlayer || rebuyAmount <= 0}
                onClick={() => {
                  onRebuy(selectedRebuyPlayer, rebuyAmount);
                  setShowRebuyModal(false);
                }}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow disabled:opacity-40 cursor-pointer"
              >
                Apply Rebuy
              </button>
            </div>
          </div>
        </div>
      )}

      {showSettingsModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4">
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Settings className="w-4 h-4 text-amber-400" />
                Table Blinds & Stakes
              </h3>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">Small Blind</label>
                <input
                  type="number"
                  value={sb}
                  onChange={(e) => setSb(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm font-mono font-bold text-slate-100"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Big Blind</label>
                <input
                  type="number"
                  value={bb}
                  onChange={(e) => setBb(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm font-mono font-bold text-slate-100"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">Ante (per player)</label>
                <input
                  type="number"
                  value={ante}
                  onChange={(e) => setAnte(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm font-mono font-bold text-slate-100"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setShowSettingsModal(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onUpdateSettings({ smallBlind: sb, bigBlind: bb, ante });
                  setShowSettingsModal(false);
                }}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow cursor-pointer"
              >
                Save Settings
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
