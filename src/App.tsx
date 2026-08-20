import { useState, useEffect } from 'react';
import { useP2PPoker } from './hooks/useP2PPoker';
import { TableView } from './components/TableView';
import { ActionControls } from './components/ActionControls';
import { HostPanel } from './components/HostPanel';
import { GameLog } from './components/GameLog';
import { PotCalculatorModal } from './components/PotCalculatorModal';
import { formatChips } from './utils/pokerRules';
import {
  Coins,
  Copy,
  Check,
  Calculator,
  Users,
  Wifi,
  Sparkles,
  LogOut,
  Play
} from 'lucide-react';

export function App() {
  const {
    isHost,
    isConnected,
    isConnecting,
    connectionError,
    tableState,
    localPlayerId,
    hostRoom,
    joinRoom,
    startSoloTable,
    sendToHost,
  } = useP2PPoker();

  const [playerName, setPlayerName] = useState<string>('');
  const [roomIdInput, setRoomIdInput] = useState<string>('');
  const [customHostId, setCustomHostId] = useState<string>('');
  const [initialBuyIn, setInitialBuyIn] = useState<number>(1000);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [showCalculator, setShowCalculator] = useState<boolean>(false);

  useEffect(() => {
    if (!playerName) {
      const names = ['Maverick', 'Ace', 'Joker', 'BluffKing', 'Viper', 'Diamond', 'Shark'];
      setPlayerName(names[Math.floor(Math.random() * names.length)]);
    }
  }, [playerName]);

  const localPlayer = tableState.players[localPlayerId];
  const isMyTurn =
    tableState.isHandInProgress &&
    localPlayer &&
    tableState.currentTurnSeat === localPlayer.seatIndex;

  const handleCopyRoomId = () => {
    if (tableState.roomId) {
      navigator.clipboard.writeText(tableState.roomId);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  if (!isConnected) {
    return (
      <div className="min-h-screen bg-[#060911] text-slate-100 flex flex-col items-center justify-center p-4 relative overflow-hidden">
        {/* Ambient Casino Lighting */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-amber-500/10 blur-[140px] rounded-full pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-96 h-96 bg-emerald-500/10 blur-[130px] rounded-full pointer-events-none" />
        <div className="absolute top-10 right-10 w-80 h-80 bg-cyan-500/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="max-w-md w-full z-10 space-y-5">
          {/* Logo & Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center justify-center p-4 bg-gradient-to-tr from-amber-500 via-amber-400 to-yellow-300 rounded-3xl shadow-[0_10px_30px_rgba(245,158,11,0.3)] border border-amber-300/60 animate-turn">
              <Coins className="w-10 h-10 text-slate-950 stroke-[2.5]" />
            </div>
            <h1 className="text-3xl font-serif-poker font-black tracking-wide text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-yellow-300 to-amber-400 flex items-center justify-center gap-2 drop-shadow-md">
              POKER CHIP HUB <Sparkles className="w-5 h-5 text-amber-400 fill-amber-400" />
            </h1>
            <p className="text-xs text-slate-400 max-w-sm mx-auto">
              Real-time Peer-to-Peer Chip Counter & Side-Pot Calculator for live home games. No accounts required.
            </p>
          </div>

          {connectionError && (
            <div className="bg-rose-950/90 border border-rose-500/60 p-3.5 rounded-2xl text-xs text-rose-200 shadow-lg shadow-rose-950/50">
              <strong>Error:</strong> {connectionError}
            </div>
          )}

          {/* Nickname Input Card */}
          <div className="bg-slate-900/90 border border-slate-800/90 p-4 rounded-2xl shadow-xl backdrop-blur-xl space-y-1.5">
            <label className="text-[11px] font-extrabold text-amber-400/90 uppercase tracking-widest block">
              Player Nickname
            </label>
            <input
              type="text"
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              placeholder="e.g. Maverick"
              className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-4 py-2.5 text-sm text-white font-bold focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50 transition-all shadow-inner"
            />
          </div>

          <div className="grid grid-cols-1 gap-4">
            {/* Host Section */}
            <div className="bg-slate-900/90 border border-amber-500/30 p-5 rounded-2xl shadow-xl backdrop-blur-xl space-y-3.5 ring-1 ring-amber-500/10">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-amber-400 uppercase tracking-widest flex items-center gap-2">
                  <Wifi className="w-4 h-4" /> Host New Table
                </span>
                <span className="text-[10px] font-mono font-bold bg-amber-500/10 text-amber-300 px-2.5 py-0.5 rounded-full border border-amber-500/30">
                  Dealer Table
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1 font-semibold">Buy-In Chips</label>
                  <input
                    type="number"
                    value={initialBuyIn}
                    onChange={(e) => setInitialBuyIn(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-mono font-bold text-amber-300 shadow-inner"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-400 block mb-1 font-semibold">Room Code (optional)</label>
                  <input
                    type="text"
                    value={customHostId}
                    onChange={(e) => setCustomHostId(e.target.value)}
                    placeholder="e.g. poker-night"
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white shadow-inner"
                  />
                </div>
              </div>

              <button
                disabled={isConnecting}
                onClick={() =>
                  hostRoom(playerName, customHostId || undefined, { initialBuyIn })
                }
                className="w-full py-3.5 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 active:scale-98 text-slate-950 font-black rounded-xl text-xs sm:text-sm shadow-[0_4px_20px_rgba(245,158,11,0.35)] transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer border border-amber-300/50"
              >
                {isConnecting ? 'Creating Room...' : 'Create P2P Table & Share Code'}
              </button>
            </div>

            {/* Join Section */}
            <div className="bg-slate-900/90 border border-slate-800/90 p-5 rounded-2xl shadow-xl backdrop-blur-xl space-y-3.5">
              <span className="text-xs font-black text-cyan-400 uppercase tracking-widest flex items-center gap-2">
                <Users className="w-4 h-4" /> Join Existing Table
              </span>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={roomIdInput}
                  onChange={(e) => setRoomIdInput(e.target.value)}
                  placeholder="Enter Host Room Code..."
                  className="flex-1 bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-xs text-white font-mono focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/40 shadow-inner"
                />
                <button
                  disabled={isConnecting || !roomIdInput.trim()}
                  onClick={() => joinRoom(roomIdInput, playerName)}
                  className="px-6 py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 active:scale-95 text-white font-black rounded-xl text-xs shadow-lg shadow-cyan-900/40 transition-all disabled:opacity-40 cursor-pointer border border-cyan-400/30"
                >
                  Join
                </button>
              </div>
            </div>

            {/* Offline Practice / Single Device Mode */}
            <button
              onClick={() => startSoloTable(playerName || 'Host')}
              className="w-full py-3 bg-slate-900/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border border-slate-800 transition-all cursor-pointer shadow-sm"
            >
              <Play className="w-3.5 h-3.5 text-emerald-400" />
              Practice Table (Single Device Mode)
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#060911] text-slate-100 flex flex-col justify-between p-2 sm:p-4 max-w-7xl mx-auto select-none">
      {/* Top Navbar */}
      <header className="flex items-center justify-between gap-2 bg-slate-900/90 border border-slate-800 px-3 sm:px-4 py-2 sm:py-2.5 rounded-2xl backdrop-blur-xl mb-2 shadow-xl ring-1 ring-white/5">
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex items-center gap-1.5 shrink-0">
            <div className="p-1.5 bg-amber-500/10 rounded-xl border border-amber-500/30">
              <Coins className="w-4 h-4 sm:w-5 sm:h-5 text-amber-400" />
            </div>
            <span className="font-serif-poker font-black text-xs sm:text-sm tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-amber-200 to-amber-400 hidden sm:block">
              POKER CHIP HUB
            </span>
          </div>

          <div className="flex items-center gap-1 bg-slate-950 border border-slate-800 px-2 sm:px-3 py-1 rounded-xl shadow-inner min-w-0">
            <span className="text-[9px] sm:text-[10px] font-bold text-slate-500 uppercase tracking-wider shrink-0">#</span>
            <span className="text-xs font-mono font-black text-amber-300 truncate max-w-[80px] sm:max-w-none">
              {tableState.roomId}
            </span>
            <button
              onClick={handleCopyRoomId}
              className="text-slate-400 hover:text-amber-300 ml-0.5 p-0.5 rounded hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
              title="Copy Room ID"
            >
              {copiedCode ? <Check className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-emerald-400" /> : <Copy className="w-3 h-3 sm:w-3.5 sm:h-3.5" />}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          <button
            onClick={() => setShowCalculator(true)}
            className="flex items-center gap-1 sm:gap-1.5 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 sm:px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer shadow-sm active:scale-95"
          >
            <Calculator className="w-3.5 h-3.5" />
            <span className="hidden sm:block">Pot Math</span>
            <span className="font-mono text-amber-200 text-[10px]">({formatChips(tableState.pot + tableState.communityBets)})</span>
          </button>

          <div className="text-xs text-slate-300 font-bold flex items-center gap-1 bg-slate-950 px-2 sm:px-3 py-1.5 rounded-xl border border-slate-800 shadow-inner">
            <Users className="w-3.5 h-3.5 text-cyan-400" />
            <span className="font-mono">{Object.values(tableState.players).length}</span>
          </div>

          <button
            onClick={() => window.location.reload()}
            className="text-slate-400 hover:text-rose-400 p-1.5 sm:p-2 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
            title="Leave Table"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Main Table Felt Area */}
      <main className="flex-1 flex items-center justify-center my-1">
        <TableView
          tableState={tableState}
          localPlayerId={localPlayerId}
          onSeatClick={(seatIdx) => {
            sendToHost({
              type: 'REQUEST_SEAT',
              playerId: localPlayerId,
              seatIndex: seatIdx,
              name: playerName,
            });
          }}
        />
      </main>

      {/* Bottom Controls Area */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-2 sm:gap-3 mt-1 sm:mt-2">
        {/* Action Controls — most important on mobile, show first */}
        <div className="lg:col-span-5 order-1 flex flex-col justify-end">
          {localPlayer ? (
            <ActionControls
              player={localPlayer}
              tableState={tableState}
              isMyTurn={isMyTurn}
              onAction={(action, amount) => {
                sendToHost({
                  type: 'PLAYER_ACTION',
                  action,
                  amount,
                });
              }}
            />
          ) : (
            <div className="bg-slate-900/80 border border-slate-800 p-3 sm:p-4 rounded-2xl text-center text-xs text-slate-400">
              You are spectating. Click an empty seat to sit.
            </div>
          )}
        </div>

        {/* Host / Dealer Operations */}
        <div className="lg:col-span-4 order-2 flex flex-col justify-end z-50">
          {isHost ? (
            <HostPanel
              tableState={tableState}
              onStartHand={() => sendToHost({ type: 'HOST_START_HAND' })}
              onNextStreet={() => sendToHost({ type: 'HOST_NEXT_STREET' })}
              onAwardPot={(winners, amt) =>
                sendToHost({
                  type: 'HOST_AWARD_POT',
                  winnerSeatIndexes: winners,
                  customAmount: amt,
                })
              }
              onRebuy={(pId, amt) =>
                sendToHost({
                  type: 'HOST_REBUY',
                  playerId: pId,
                  amount: amt,
                })
              }
              onUpdateSettings={(sett) =>
                sendToHost({
                  type: 'HOST_UPDATE_SETTINGS',
                  settings: sett,
                })
              }
            />
          ) : (
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-3 sm:p-4 flex flex-col justify-center text-center text-xs text-slate-400">
              <div className="font-bold text-slate-300 mb-0.5">Peer Connected</div>
              <div>Host is managing dealer operations.</div>
            </div>
          )}
        </div>

        {/* Game Log — collapsed height on mobile */}
        <div className="lg:col-span-3 order-3">
          <GameLog logs={tableState.logs} />
        </div>
      </div>

      {/* Side Pot & Calculations Detail Modal */}
      {showCalculator && (
        <PotCalculatorModal
          tableState={tableState}
          onClose={() => setShowCalculator(false)}
        />
      )}
    </div>
  );
}

export default App;
