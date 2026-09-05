import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import type { TableState } from '../types/poker';
import { formatChips } from '../utils/pokerRules';
import { useLanguage } from '../i18n/LanguageContext';
import { Play, FastForward, Award, PlusCircle, Settings, ShieldCheck, Sparkles, Check, UserX, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';

interface HostPanelProps {
  tableState: TableState;
  onStartHand: () => void;
  onNextStreet: () => void;
  onAwardPot: (winnerSeatIndexes: number[], customAmount?: number) => void;
  onRebuy: (playerId: string, amount: number) => void;
  onUpdateSettings: (settings: Partial<TableState['settings']>) => void;
  onKickPlayer?: (playerId: string) => void;
  onToggleDealerOnly?: (isDealerOnly: boolean) => void;
}

export const HostPanel: React.FC<HostPanelProps> = ({
  tableState,
  onStartHand,
  onNextStreet,
  onAwardPot,
  onRebuy,
  onUpdateSettings,
  onKickPlayer,
  onToggleDealerOnly,
}) => {
  const { t } = useLanguage();
  const [showAwardModal, setShowAwardModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [showRebuyModal, setShowRebuyModal] = useState(false);
  const [showKickModal, setShowKickModal] = useState(false);
  const [playerToKick, setPlayerToKick] = useState<{ id: string; name: string } | null>(null);
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);

  const hostPlayer = tableState.players[tableState.hostId];

  const [selectedWinners, setSelectedWinners] = useState<number[]>([]);
  const [customPotAmount, setCustomPotAmount] = useState<number>(0);

  const [selectedRebuyPlayer, setSelectedRebuyPlayer] = useState<string>('');
  const [rebuyAmount, setRebuyAmount] = useState<number>(500);

  const [sb, setSb] = useState(tableState.settings.smallBlind);
  const [bb, setBb] = useState(tableState.settings.bigBlind);
  const [ante, setAnte] = useState(tableState.settings.ante);
  const [tableSize, setTableSize] = useState(tableState.settings.tableSize || 8);
  const [autoProgressTurn, setAutoProgressTurn] = useState(tableState.settings.autoProgressTurn ?? false);
  const [showStreetAnnouncements, setShowStreetAnnouncements] = useState(tableState.settings.showStreetAnnouncements ?? true);
  const [isDealerOnly, setIsDealerOnly] = useState<boolean>(hostPlayer?.isDealerOnly ?? false);

  React.useEffect(() => {
    setSb(tableState.settings.smallBlind);
    setBb(tableState.settings.bigBlind);
    setAnte(tableState.settings.ante);
    setTableSize(tableState.settings.tableSize || 8);
    setAutoProgressTurn(tableState.settings.autoProgressTurn ?? false);
    setShowStreetAnnouncements(tableState.settings.showStreetAnnouncements ?? true);
    setIsDealerOnly(hostPlayer?.isDealerOnly ?? false);
  }, [tableState.settings, hostPlayer?.isDealerOnly]);

  const activePlayers = Object.values(tableState.players).filter((p) => p.isActive);
  const totalPot = tableState.pot + tableState.communityBets;
  const isAwaitingConfirm =
    tableState.isHandInProgress &&
    tableState.currentTurnSeat === null &&
    tableState.street !== 'showdown';

  const getNextStreetLabel = (street: string) => {
    switch (street) {
      case 'preflop': return t('streetFlop');
      case 'flop': return t('streetTurn');
      case 'turn': return t('streetRiver');
      case 'river': return t('streetShowdown');
      default: return t('nextStreet');
    }
  };

  const handleOpenAwardModal = () => {
    const candidates = Object.values(tableState.players).filter((p) => !p.hasFolded);
    setSelectedWinners(candidates.map((p) => p.seatIndex));
    setCustomPotAmount(totalPot);
    setShowAwardModal(true);
  };

  const handleConfirmAward = () => {
    if (selectedWinners.length === 0) return;
    onAwardPot(selectedWinners, customPotAmount || totalPot);
    setShowAwardModal(false);
  };

  return (
    <>
      {isCollapsed ? (
        <div className="bg-slate-900/95 border border-amber-500/40 rounded-2xl p-2.5 px-3.5 shadow-2xl backdrop-blur-xl flex items-center justify-between gap-2.5 transition-all">
          <div className="flex items-center gap-2 min-w-0">
            <span className="bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-300 text-xs font-black px-2 py-0.5 rounded-lg border border-amber-500/40 flex items-center gap-1 shrink-0">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span className="hidden sm:inline">{t('dealerHostTitle')}</span>
            </span>
            <span className="text-xs font-mono text-slate-400 truncate">
              {t('handNumber', { number: tableState.handNumber })}
            </span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {!tableState.isHandInProgress ? (
              <button
                onClick={onStartHand}
                disabled={activePlayers.length < 2}
                className="px-3 py-1 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-black rounded-lg text-xs flex items-center gap-1 transition-all cursor-pointer shadow-sm active:scale-95 disabled:opacity-40"
              >
                <Play className="w-3.5 h-3.5 fill-slate-950" />
                <span>{t('dealNewHand', { sb: tableState.settings.smallBlind, bb: tableState.settings.bigBlind })}</span>
              </button>
            ) : tableState.street === 'showdown' ? (
              <button
                onClick={handleOpenAwardModal}
                className="px-3 py-1 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 font-black rounded-lg text-xs flex items-center gap-1.5 shadow-[0_2px_12px_rgba(245,158,11,0.5)] border border-amber-300/80 transition-all cursor-pointer active:scale-95 animate-pulse"
              >
                <Award className="w-3.5 h-3.5 text-slate-950" />
                <span>{t('awardPotBtn', { amount: formatChips(totalPot) })}</span>
              </button>
            ) : isAwaitingConfirm ? (
              <button
                onClick={onNextStreet}
                className="px-3 py-1 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-lg text-xs flex items-center gap-1 transition-all cursor-pointer shadow-sm active:scale-95 animate-pulse"
              >
                <Check className="w-3.5 h-3.5 stroke-[3]" />
                <span>{t('confirmNextStreet', { street: getNextStreetLabel(tableState.street) })}</span>
              </button>
            ) : (
              <button
                onClick={onNextStreet}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-100 font-bold rounded-lg text-xs flex items-center gap-1 transition-all cursor-pointer shadow-sm disabled:opacity-40"
              >
                <FastForward className="w-3.5 h-3.5 text-cyan-400" />
                <span>{t('nextStreet')}</span>
              </button>
            )}

            <button
              onClick={() => setIsCollapsed(false)}
              className="flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-amber-300 hover:text-amber-200 px-2 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer border border-slate-700 active:scale-95"
              title="Expand Host Menu"
            >
              <ChevronUp className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-[11px] hidden sm:inline">ขยาย</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="bg-slate-900/95 border border-amber-500/40 rounded-2xl p-3 sm:p-3.5 shadow-2xl backdrop-blur-xl ring-1 ring-amber-500/20">
      <div className="flex items-center justify-between mb-2.5 border-b border-slate-800/80 pb-2">
        <div className="flex items-center gap-2">
          <span className="bg-gradient-to-r from-amber-500/20 to-yellow-500/20 text-amber-300 text-xs font-black px-2.5 py-0.5 rounded-lg border border-amber-500/40 flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            {t('dealerHostTitle')}
          </span>
          <span className="text-xs font-mono text-slate-400">{t('handNumber', { number: tableState.handNumber })}</span>
        </div>

        <div className="flex items-center gap-1.5 sm:gap-2">
          <button
            onClick={() => setShowKickModal(true)}
            className="text-xs font-bold flex items-center gap-1 bg-slate-800/80 hover:bg-rose-950/80 text-rose-300 border border-rose-500/30 px-2 sm:px-2.5 py-1 rounded-lg transition-all cursor-pointer shadow-sm"
          >
            <UserX className="w-3.5 h-3.5 text-rose-400" />
            <span>{t('kickPlayerBtn')}</span>
          </button>
          <button
            onClick={() => setShowRebuyModal(true)}
            className="text-xs font-bold flex items-center gap-1 bg-slate-800/80 hover:bg-slate-700 text-emerald-300 border border-emerald-500/30 px-2 sm:px-2.5 py-1 rounded-lg transition-all cursor-pointer shadow-sm"
          >
            <PlusCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>{t('chipsBtn')}</span>
          </button>
          <button
            onClick={() => setShowSettingsModal(true)}
            className="text-xs font-bold flex items-center gap-1 bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 px-2 sm:px-2.5 py-1 rounded-lg transition-all cursor-pointer shadow-sm"
          >
            <Settings className="w-3.5 h-3.5 text-amber-400" />
            <span>{t('blindsBtn')}</span>
          </button>
          <button
            onClick={() => setIsCollapsed(true)}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-amber-300 transition-colors cursor-pointer flex items-center gap-0.5 text-[10px] ml-1"
            title="Minimize Host Menu"
          >
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-1.5 sm:gap-2">
        {!tableState.isHandInProgress ? (
          <button
            onClick={onStartHand}
            disabled={activePlayers.length < 2}
            className="col-span-3 py-2 sm:py-2.5 px-3 bg-gradient-to-r from-emerald-500 via-emerald-600 to-teal-600 hover:from-emerald-400 hover:to-teal-500 active:scale-98 text-slate-950 font-black rounded-xl shadow-[0_4px_20px_rgba(16,185,129,0.35)] flex items-center justify-center gap-2 text-xs sm:text-sm disabled:opacity-40 disabled:pointer-events-none transition-all cursor-pointer border border-emerald-400/50"
          >
            <Play className="w-4 h-4 fill-slate-950" />
            {t('dealNewHand', { sb: tableState.settings.smallBlind, bb: tableState.settings.bigBlind })}
          </button>
        ) : isAwaitingConfirm ? (
          <>
            <button
              onClick={onNextStreet}
              className="col-span-3 py-2 sm:py-2.5 px-3 bg-gradient-to-r from-emerald-400 via-emerald-500 to-teal-500 hover:from-emerald-300 hover:to-teal-400 active:scale-98 text-slate-950 font-black rounded-xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-[0_0_25px_rgba(16,185,129,0.6)] border-2 border-emerald-300 transition-all cursor-pointer ring-2 ring-emerald-400/50 animate-pulse"
            >
              <Check className="w-4 h-4 stroke-[3]" />
              <span>{t('confirmNextStreet', { street: getNextStreetLabel(tableState.street) })}</span>
            </button>

            <button
              onClick={handleOpenAwardModal}
              className="col-span-3 py-1.5 px-2.5 bg-gradient-to-r from-amber-500/80 to-amber-600/80 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 border border-amber-400/40 transition-all cursor-pointer"
            >
              <Award className="w-3.5 h-3.5 text-slate-950" />
              {t('awardPotBtn', { amount: formatChips(totalPot) })}
            </button>
          </>
        ) : (
          <>
            <button
              onClick={onNextStreet}
              disabled={tableState.street === 'showdown'}
              className="py-2 px-2.5 bg-slate-800/90 hover:bg-slate-700 text-slate-100 font-bold rounded-xl text-xs flex items-center justify-center gap-1.5 border border-slate-700 transition-all cursor-pointer shadow-sm disabled:opacity-40"
            >
              <FastForward className="w-3.5 h-3.5 text-cyan-400" />
              {t('nextStreet')}
            </button>

            <button
              onClick={handleOpenAwardModal}
              className="col-span-2 py-2 px-2.5 bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-[0_4px_15px_rgba(245,158,11,0.35)] border border-amber-300/60 transition-all cursor-pointer"
            >
              <Award className="w-3.5 h-3.5 text-slate-950" />
              {t('awardPotBtn', { amount: formatChips(totalPot) })}
            </button>
          </>
        )}
      </div>
      </div>
      )}

      {showAwardModal && createPortal(
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-amber-400/50 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div>
              <h3 className="text-lg font-black text-amber-300 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                {t('awardModalTitle')}
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                {t('awardModalDesc', { amount: formatChips(totalPot) })}
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
                      <div className="font-bold text-sm">{p.name} {p.hasFolded && <span className="text-rose-400 text-xs font-normal">{t('foldedTag')}</span>}</div>
                      <div className="text-xs text-slate-400 font-mono">{t('seatNumber', { number: p.seatIndex + 1 })} • {t('stackLabel')}: {formatChips(p.stack)}</div>
                    </div>
                    <div className="text-xs font-mono font-black">
                      {isSelected ? t('selectedWinner') : t('clickToPickWinner')}
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
                {t('cancel')}
              </button>
              <button
                onClick={handleConfirmAward}
                disabled={selectedWinners.length === 0}
                className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black text-xs shadow-lg shadow-amber-500/20 disabled:opacity-40 cursor-pointer"
              >
                {t('confirmPayout')}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {showRebuyModal && createPortal(
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-emerald-400" />
                {t('rebuyModalTitle')}
              </h3>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">{t('targetPlayer')}</label>
                <select
                  value={selectedRebuyPlayer}
                  onChange={(e) => setSelectedRebuyPlayer(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-amber-400"
                >
                  <option value="">{t('selectPlayerPlaceholder')}</option>
                  {Object.values(tableState.players).map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name} ({t('seatNumber', { number: p.seatIndex + 1 })} - {formatChips(p.stack)} {t('chipsUnit')})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-400 block mb-1">{t('amountToAdd')}</label>
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
                {t('cancel')}
              </button>
              <button
                disabled={!selectedRebuyPlayer || rebuyAmount <= 0}
                onClick={() => {
                  onRebuy(selectedRebuyPlayer, rebuyAmount);
                  setShowRebuyModal(false);
                }}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow disabled:opacity-40 cursor-pointer"
              >
                {t('applyRebuy')}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {showSettingsModal && createPortal(
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 max-w-sm w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div>
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Settings className="w-4 h-4 text-amber-400" />
                {t('tableSettingsTitle')}
              </h3>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs text-slate-400 block mb-1">{t('maxPlayersSetting')}</label>
                <div className="grid grid-cols-5 gap-1.5 mb-2">
                  {[2, 4, 6, 8, 10].map((num) => (
                    <button
                      key={num}
                      type="button"
                      onClick={() => setTableSize(num)}
                      className={`py-1.5 text-xs font-mono font-bold rounded-lg border transition-all cursor-pointer ${
                        tableSize === num
                          ? 'bg-amber-500/20 border-amber-400 text-amber-300'
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                      }`}
                    >
                      {t('seatsCount', { count: num })}
                    </button>
                  ))}
                </div>
                <select
                  value={tableSize}
                  onChange={(e) => setTableSize(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm font-mono font-bold text-slate-100 focus:outline-none focus:border-amber-400"
                >
                  {Array.from({ length: 9 }, (_, i) => i + 2).map((num) => (
                    <option key={num} value={num}>
                      {t('maxPlayersOption', { count: num })}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">{t('smallBlindLabel')}</label>
                <input
                  type="number"
                  value={sb}
                  onChange={(e) => setSb(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm font-mono font-bold text-slate-100"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">{t('bigBlindLabel')}</label>
                <input
                  type="number"
                  value={bb}
                  onChange={(e) => setBb(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm font-mono font-bold text-slate-100"
                />
              </div>
              <div>
                <label className="text-xs text-slate-400 block mb-1">{t('anteLabel')}</label>
                <input
                  type="number"
                  value={ante}
                  onChange={(e) => setAnte(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-sm font-mono font-bold text-slate-100"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-950 border border-slate-800 rounded-xl mt-2">
                <div>
                  <label className="text-xs font-bold text-slate-200 block">{t('autoProgressLabel')}</label>
                  <span className="text-[10px] text-slate-400 block leading-tight">{t('autoProgressDesc')}</span>
                </div>
                <input
                  type="checkbox"
                  checked={autoProgressTurn}
                  onChange={(e) => setAutoProgressTurn(e.target.checked)}
                  className="w-4 h-4 accent-amber-400 cursor-pointer shrink-0 ml-2"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-950 border border-slate-800 rounded-xl mt-2">
                <div>
                  <label className="text-xs font-bold text-slate-200 block">{t('showAnnouncementsLabel')}</label>
                  <span className="text-[10px] text-slate-400 block leading-tight">{t('showAnnouncementsDesc')}</span>
                </div>
                <input
                  type="checkbox"
                  checked={showStreetAnnouncements}
                  onChange={(e) => setShowStreetAnnouncements(e.target.checked)}
                  className="w-4 h-4 accent-amber-400 cursor-pointer shrink-0 ml-2"
                />
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-950 border border-amber-500/30 rounded-xl mt-2">
                <div>
                  <label className="text-xs font-bold text-amber-300 block">{t('dealerOnlyOption')}</label>
                  <span className="text-[10px] text-slate-400 block leading-tight">{t('dealerOnlyDesc')}</span>
                </div>
                <input
                  type="checkbox"
                  checked={isDealerOnly}
                  onChange={(e) => setIsDealerOnly(e.target.checked)}
                  className="w-4 h-4 accent-amber-400 cursor-pointer shrink-0 ml-2"
                />
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  setIsDealerOnly(hostPlayer?.isDealerOnly ?? false);
                  setShowSettingsModal(false);
                }}
                className="flex-1 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer"
              >
                {t('cancel')}
              </button>
              <button
                onClick={() => {
                  if (isDealerOnly !== (hostPlayer?.isDealerOnly ?? false)) {
                    onToggleDealerOnly?.(isDealerOnly);
                  }
                  onUpdateSettings({ smallBlind: sb, bigBlind: bb, ante, tableSize, autoProgressTurn, showStreetAnnouncements });
                  setShowSettingsModal(false);
                }}
                className="flex-1 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs shadow cursor-pointer"
              >
                {t('saveSettings')}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}

      {showKickModal && createPortal(
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-[100] flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-rose-500/50 rounded-2xl p-6 max-w-md w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div>
              <h3 className="text-base font-bold text-rose-300 flex items-center gap-2">
                <UserX className="w-5 h-5 text-rose-400" />
                {t('kickPlayerTitle')}
              </h3>
            </div>

            {playerToKick ? (
              <div className="space-y-3 bg-rose-950/40 border border-rose-500/30 p-4 rounded-xl">
                <div className="flex items-center gap-2 text-rose-200 text-xs font-semibold">
                  <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
                  <span>{t('kickPlayerConfirm', { name: playerToKick.name })}</span>
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => setPlayerToKick(null)}
                    className="flex-1 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer"
                  >
                    {t('cancel')}
                  </button>
                  <button
                    onClick={() => {
                      onKickPlayer?.(playerToKick.id);
                      setPlayerToKick(null);
                    }}
                    className="flex-1 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs shadow cursor-pointer"
                  >
                    {t('kickPlayerBtn')}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {Object.values(tableState.players)
                  .filter((p) => p.id !== tableState.hostId)
                  .map((p) => (
                    <div
                      key={p.id}
                      className="w-full flex items-center justify-between p-3 rounded-xl border bg-slate-950/80 border-slate-800 text-slate-200"
                    >
                      <div>
                        <div className="font-bold text-sm">{p.name}</div>
                        <div className="text-xs text-slate-400 font-mono">
                          {t('seatNumber', { number: p.seatIndex + 1 })} • {formatChips(p.stack)} {t('chipsUnit')}
                        </div>
                      </div>
                      <button
                        onClick={() => setPlayerToKick({ id: p.id, name: p.name })}
                        className="px-3 py-1.5 rounded-lg bg-rose-600/20 hover:bg-rose-600 text-rose-300 hover:text-white border border-rose-500/40 text-xs font-bold transition-all cursor-pointer flex items-center gap-1"
                      >
                        <UserX className="w-3.5 h-3.5" />
                        {t('kickPlayerBtn')}
                      </button>
                    </div>
                  ))}
                {Object.values(tableState.players).filter((p) => p.id !== tableState.hostId).length === 0 && (
                  <div className="text-center py-6 text-xs text-slate-500">
                    No other players connected to table.
                  </div>
                )}
              </div>
            )}

            <div className="flex justify-end pt-2 border-t border-slate-800">
              <button
                onClick={() => {
                  setShowKickModal(false);
                  setPlayerToKick(null);
                }}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs cursor-pointer"
              >
                {t('cancel')}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
};
