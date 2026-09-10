import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import type { TableState, Player, PotWinnerSelection } from '../types/poker';
import { formatChips } from '../utils/pokerRules';
import { useLanguage } from '../i18n/LanguageContext';
import {
  Trophy,
  Sparkles,
  Users,
  Layers,
  Sliders,
  Check,
  Coins,
  X,
  AlertCircle,
  Crown,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

interface WinnerSelectionModalProps {
  tableState: TableState;
  isOpen: boolean;
  onClose: () => void;
  onConfirmAward: (
    winnerSeatIndexes: number[],
    customAmount?: number,
    potWinners?: PotWinnerSelection[],
    customPayouts?: Record<string, number>
  ) => void;
  initialSelectedSeat?: number | null;
}

type Mode = 'solo' | 'split' | 'sidepots' | 'custom';

export const WinnerSelectionModal: React.FC<WinnerSelectionModalProps> = ({
  tableState,
  isOpen,
  onClose,
  onConfirmAward,
  initialSelectedSeat,
}) => {
  const { t } = useLanguage();
  const totalPot = tableState.pot + tableState.communityBets;
  const hasSidePots = (tableState.sidePots?.length || 0) > 1;

  // Active contenders (players who have not folded and are seated)
  const contenders = useMemo(() => {
    return Object.values(tableState.players)
      .filter((p) => p.isActive && !p.hasFolded && !p.isDealerOnly && p.seatIndex >= 0)
      .sort((a, b) => a.seatIndex - b.seatIndex);
  }, [tableState.players]);

  // Folded players
  const foldedPlayers = useMemo(() => {
    return Object.values(tableState.players)
      .filter((p) => p.isActive && p.hasFolded && !p.isDealerOnly && p.seatIndex >= 0)
      .sort((a, b) => a.seatIndex - b.seatIndex);
  }, [tableState.players]);

  const [mode, setMode] = useState<Mode>('solo');
  const [selectedSoloSeat, setSelectedSoloSeat] = useState<number | null>(null);
  const [selectedSplitSeats, setSelectedSplitSeats] = useState<number[]>([]);
  
  // Side pots winner map: potIndex -> array of winning seatIndexes
  const [sidePotWinners, setSidePotWinners] = useState<Record<number, number[]>>({});

  // Custom payouts: playerId -> chip amount
  const [customAmounts, setCustomAmounts] = useState<Record<string, number>>({});
  const [showFolded, setShowFolded] = useState(false);

  // Initialize or reset selections when modal opens
  useEffect(() => {
    if (!isOpen) return;

    if (initialSelectedSeat !== undefined && initialSelectedSeat !== null) {
      setSelectedSoloSeat(initialSelectedSeat);
      setSelectedSplitSeats([initialSelectedSeat]);
    } else if (contenders.length === 1) {
      // Only 1 contender remaining
      setSelectedSoloSeat(contenders[0].seatIndex);
      setSelectedSplitSeats([contenders[0].seatIndex]);
    } else {
      // Do NOT preselect all candidates (prevents accidental chop bug)
      setSelectedSoloSeat(null);
      setSelectedSplitSeats([]);
    }

    // Initialize side pots defaults (empty per pot)
    const initialSidePots: Record<number, number[]> = {};
    (tableState.sidePots || []).forEach((_, idx) => {
      initialSidePots[idx] = [];
    });
    setSidePotWinners(initialSidePots);

    // Initialize custom amounts
    const initialCustom: Record<string, number> = {};
    contenders.forEach((p) => {
      initialCustom[p.id] = 0;
    });
    setCustomAmounts(initialCustom);
    setMode('solo');
  }, [isOpen, initialSelectedSeat, contenders, tableState.sidePots]);

  // Calculate split pot details
  const splitCalculations = useMemo(() => {
    if (selectedSplitSeats.length === 0) return null;
    const count = selectedSplitSeats.length;
    const share = Math.floor(totalPot / count);
    const remainder = totalPot % count;

    let luckyPlayer: Player | null = null;
    if (remainder > 0) {
      const tableSize = tableState.settings.tableSize || 8;
      const sorted = contenders
        .filter((c) => selectedSplitSeats.includes(c.seatIndex))
        .sort((a, b) => {
          const distA = (a.seatIndex - tableState.dealerSeat + tableSize) % tableSize;
          const distB = (b.seatIndex - tableState.dealerSeat + tableSize) % tableSize;
          return distA - distB;
        });
      luckyPlayer = sorted[0] || null;
    }

    return { count, share, remainder, luckyPlayer };
  }, [selectedSplitSeats, totalPot, contenders, tableState.dealerSeat, tableState.settings.tableSize]);

  // Calculate side pot preview
  const sidePotSummary = useMemo(() => {
    if (!hasSidePots || !tableState.sidePots) return null;
    const playerPayouts: Record<string, number> = {};
    contenders.forEach((p) => {
      playerPayouts[p.id] = 0;
    });

    const tableSize = tableState.settings.tableSize || 8;

    tableState.sidePots.forEach((pot, potIdx) => {
      const winnerSeats = sidePotWinners[potIdx] || [];
      const potWinners = contenders.filter(
        (c) => winnerSeats.includes(c.seatIndex) && pot.eligiblePlayerIds.includes(c.id)
      );

      if (potWinners.length > 0) {
        const share = Math.floor(pot.amount / potWinners.length);
        const rem = pot.amount % potWinners.length;
        potWinners.forEach((pw) => {
          playerPayouts[pw.id] = (playerPayouts[pw.id] || 0) + share;
        });

        if (rem > 0) {
          const sorted = [...potWinners].sort((a, b) => {
            const distA = (a.seatIndex - tableState.dealerSeat + tableSize) % tableSize;
            const distB = (b.seatIndex - tableState.dealerSeat + tableSize) % tableSize;
            return distA - distB;
          });
          const lucky = sorted[0];
          if (lucky) {
            playerPayouts[lucky.id] = (playerPayouts[lucky.id] || 0) + rem;
          }
        }
      }
    });

    const totalAllocated = Object.values(playerPayouts).reduce((a, b) => a + b, 0);
    return { playerPayouts, totalAllocated };
  }, [hasSidePots, tableState.sidePots, sidePotWinners, contenders, tableState.dealerSeat, tableState.settings.tableSize]);

  // Handle confirming payout
  const handleConfirm = () => {
    if (mode === 'solo') {
      if (selectedSoloSeat === null) return;
      onConfirmAward([selectedSoloSeat], totalPot);
    } else if (mode === 'split') {
      if (selectedSplitSeats.length === 0) return;
      onConfirmAward(selectedSplitSeats, totalPot);
    } else if (mode === 'sidepots') {
      if (!sidePotSummary || sidePotSummary.totalAllocated === 0) return;
      const potWinnersList: PotWinnerSelection[] = Object.entries(sidePotWinners).map(
        ([potIdx, seats]) => ({
          potIndex: Number(potIdx),
          winnerSeatIndexes: seats,
        })
      );
      const allWinners = Array.from(new Set(Object.values(sidePotWinners).flat()));
      onConfirmAward(allWinners, totalPot, potWinnersList, sidePotSummary.playerPayouts);
    } else if (mode === 'custom') {
      const activePayouts: Record<string, number> = {};
      const winningSeats: number[] = [];
      let sum = 0;
      for (const [pId, amt] of Object.entries(customAmounts)) {
        if (amt > 0) {
          activePayouts[pId] = amt;
          sum += amt;
          const p = tableState.players[pId];
          if (p) winningSeats.push(p.seatIndex);
        }
      }
      if (winningSeats.length === 0) return;
      onConfirmAward(winningSeats, sum, undefined, activePayouts);
    }
    onClose();
  };

  // Instant 1-click solo award
  const handleQuickAwardSolo = (seatIndex: number) => {
    onConfirmAward([seatIndex], totalPot);
    onClose();
  };

  if (!isOpen) return null;

  return createPortal(
    <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-[100] flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      <div className="bg-slate-900 border-2 border-amber-500/50 rounded-2xl max-w-xl w-full shadow-2xl space-y-4 my-auto overflow-hidden ring-1 ring-amber-400/20">
        
        {/* Modal Top Header */}
        <div className="bg-gradient-to-r from-amber-950/80 via-slate-900 to-amber-950/80 p-4 border-b border-amber-500/30 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-slate-950 shadow-md shrink-0">
              <Trophy className="w-5 h-5 stroke-[2.5]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-amber-200">
                  {t('awardModalTitle')}
                </h3>
                <span className="text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-md">
                  {t('handNumber', { number: tableState.handNumber })}
                </span>
              </div>
              <p className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                <span>{t('showdownTitle')}</span>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-amber-300/80 block">
                {t('totalPot')}
              </span>
              <span className="text-base sm:text-lg font-mono font-black text-amber-300 bg-slate-950/80 px-2.5 py-0.5 rounded-lg border border-amber-500/40 flex items-center gap-1">
                <Coins className="w-3.5 h-3.5 text-amber-400" />
                {formatChips(totalPot)}
              </span>
            </div>
            <button
              onClick={onClose}
              className="text-slate-400 hover:text-white p-1.5 rounded-xl hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="p-4 sm:p-5 space-y-4 max-h-[80vh] overflow-y-auto">
          
          {/* Mode Tabs */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 bg-slate-950/90 p-1.5 rounded-xl border border-slate-800 shadow-inner">
            <button
              type="button"
              onClick={() => setMode('solo')}
              className={`py-2 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                mode === 'solo'
                  ? 'bg-amber-500/20 border border-amber-400/80 text-amber-300 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Crown className="w-3.5 h-3.5" />
              <span>{t('tabSoloWinner')}</span>
            </button>

            <button
              type="button"
              onClick={() => setMode('split')}
              className={`py-2 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                mode === 'split'
                  ? 'bg-amber-500/20 border border-amber-400/80 text-amber-300 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Users className="w-3.5 h-3.5" />
              <span>{t('tabSplitPot')}</span>
            </button>

            <button
              type="button"
              onClick={() => setMode('sidepots')}
              className={`py-2 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                mode === 'sidepots'
                  ? 'bg-amber-500/20 border border-amber-400/80 text-amber-300 shadow-sm'
                  : hasSidePots
                  ? 'text-cyan-400 hover:text-cyan-200 hover:bg-cyan-950/30'
                  : 'text-slate-500 hover:text-slate-400'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span className="truncate">{t('tabSidePots')}</span>
              {hasSidePots && (
                <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              )}
            </button>

            <button
              type="button"
              onClick={() => setMode('custom')}
              className={`py-2 px-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                mode === 'custom'
                  ? 'bg-amber-500/20 border border-amber-400/80 text-amber-300 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>{t('tabCustomAmount')}</span>
            </button>
          </div>

          {/* TAB 1: SOLO WINNER (DEFAULT) */}
          {mode === 'solo' && (
            <div className="space-y-3">
              <div className="text-xs text-slate-400 flex items-center justify-between">
                <span>{t('awardModalDesc', { amount: formatChips(totalPot) })}</span>
                <span className="text-amber-400 font-bold text-[11px]">
                  {contenders.length} {t('contenderBadge')}
                </span>
              </div>

              {hasSidePots && (
                <div className="bg-cyan-950/40 border border-cyan-500/40 p-2.5 rounded-xl text-xs text-cyan-200 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <div>
                    <strong>{t('sidePotsNotice')}</strong>
                    <p className="text-[11px] text-cyan-300/80 mt-0.5">
                      หากผู้ชนะคนนี้ชนะทุกกอง สามารถกดยืนยันได้ทันที หรือเลือกแท็บ &quot;{t('tabSidePots')}&quot; เพื่อแยกผู้ชนะแต่ละกอง
                    </p>
                  </div>
                </div>
              )}

              <div className="space-y-2">
                {contenders.map((p) => {
                  const isSelected = selectedSoloSeat === p.seatIndex;
                  return (
                    <div
                      key={p.id}
                      onClick={() => setSelectedSoloSeat(p.seatIndex)}
                      className={`p-3 sm:p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 ${
                        isSelected
                          ? 'bg-gradient-to-r from-amber-500/20 via-slate-900 to-amber-500/20 border-amber-400 text-amber-200 ring-2 ring-amber-400/40 shadow-lg'
                          : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-900/60'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm border shadow-inner ${
                            isSelected
                              ? 'bg-amber-400 text-slate-950 border-amber-300'
                              : 'bg-slate-800 text-slate-300 border-slate-700'
                          }`}
                        >
                          {isSelected ? <Trophy className="w-4 h-4 stroke-[2.5]" /> : p.seatIndex + 1}
                        </div>
                        <div>
                          <div className="font-extrabold text-sm text-slate-100 flex items-center gap-1.5">
                            <span>{p.name}</span>
                            <span className="text-[10px] font-mono font-normal text-slate-400 bg-slate-900 px-1.5 py-0.2 rounded border border-slate-800">
                              {t('seatNumber', { number: p.seatIndex + 1 })}
                            </span>
                          </div>
                          <div className="text-xs text-slate-400 font-mono mt-0.5">
                            {t('stackLabel')}: {formatChips(p.stack)} • ลงเดิมพัน: {formatChips(p.totalInvestedThisHand)}
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleQuickAwardSolo(p.seatIndex);
                          }}
                          className="px-3 py-1.5 bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-slate-950 font-black rounded-lg text-xs shadow-md active:scale-95 transition-all flex items-center gap-1 cursor-pointer"
                          title="มอบกองกลางทั้งหมดให้ผู้เล่นนี้ทันที"
                        >
                          <Trophy className="w-3.5 h-3.5 text-slate-950" />
                          <span>{t('awardFullPotBtn', { amount: formatChips(totalPot) })}</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 2: SPLIT POT (CHOP) */}
          {mode === 'split' && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>เลือกผู้เล่นที่เสมอกันเพื่อแบ่งกองกลางเท่าๆ กัน</span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedSplitSeats(contenders.map((c) => c.seatIndex))}
                    className="text-[11px] text-amber-400 hover:underline font-bold cursor-pointer"
                  >
                    เลือกทุกคน
                  </button>
                  <button
                    type="button"
                    onClick={() => setSelectedSplitSeats([])}
                    className="text-[11px] text-slate-400 hover:underline cursor-pointer"
                  >
                    ล้าง
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                {contenders.map((p) => {
                  const isChecked = selectedSplitSeats.includes(p.seatIndex);
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        if (isChecked) {
                          setSelectedSplitSeats(selectedSplitSeats.filter((s) => s !== p.seatIndex));
                        } else {
                          setSelectedSplitSeats([...selectedSplitSeats, p.seatIndex]);
                        }
                      }}
                      className={`w-full p-3 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between ${
                        isChecked
                          ? 'bg-amber-500/20 border-amber-400 text-amber-200 ring-1 ring-amber-400/50'
                          : 'bg-slate-950/70 border-slate-800 text-slate-300 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                            isChecked
                              ? 'bg-amber-400 border-amber-300 text-slate-950'
                              : 'border-slate-700 bg-slate-900'
                          }`}
                        >
                          {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                        <div>
                          <div className="font-bold text-sm text-slate-100">{p.name}</div>
                          <div className="text-xs text-slate-400 font-mono">
                            {t('seatNumber', { number: p.seatIndex + 1 })} • {t('stackLabel')}: {formatChips(p.stack)}
                          </div>
                        </div>
                      </div>

                      <div className="text-xs font-mono font-bold">
                        {isChecked && splitCalculations ? (
                          <span className="text-amber-300 font-black">
                            +{formatChips(splitCalculations.share)} ชิป
                          </span>
                        ) : (
                          <span className="text-slate-500">{t('clickToPickWinner')}</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>

              {splitCalculations && splitCalculations.count > 0 && (
                <div className="bg-slate-950 p-3 rounded-xl border border-amber-500/40 text-xs space-y-1">
                  <div className="font-extrabold text-amber-300">
                    {t('splitCountSummary', {
                      count: splitCalculations.count,
                      amount: formatChips(totalPot),
                      share: formatChips(splitCalculations.share),
                    })}
                  </div>
                  {splitCalculations.remainder > 0 && splitCalculations.luckyPlayer && (
                    <div className="text-[11px] text-amber-200/80">
                      {t('oddChipNotice', {
                        remainder: splitCalculations.remainder,
                        name: splitCalculations.luckyPlayer.name,
                        seat: splitCalculations.luckyPlayer.seatIndex + 1,
                      })}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SIDE POTS */}
          {mode === 'sidepots' && (
            <div className="space-y-3">
              {!hasSidePots ? (
                <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800 text-center text-xs text-slate-400">
                  {t('noChipsInPot')} (รอบนี้ไม่มี Side Pot เกิดขึ้น ทุกคนเล่นในกองกลางหลักเดียวกัน)
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="text-xs text-slate-400">
                    เลือกผู้ชนะแยกตามแต่ละกองกลาง (ระบบคำนวณตามสิทธิ์ All-in อย่างแม่นยำ)
                  </div>

                  {tableState.sidePots.map((pot, idx) => {
                    const eligibleContenders = contenders.filter((c) =>
                      pot.eligiblePlayerIds.includes(c.id)
                    );
                    const currentWinners = sidePotWinners[idx] || [];

                    return (
                      <div
                        key={idx}
                        className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2.5 shadow-sm"
                      >
                        <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
                          <span className="font-black text-amber-300 text-sm flex items-center gap-1.5">
                            <Layers className="w-4 h-4 text-cyan-400" />
                            {idx === 0 ? t('mainPotTitle') : t('sidePotTitle', { index: idx })}
                          </span>
                          <span className="font-mono font-black text-amber-400 text-sm bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                            {formatChips(pot.amount)} {t('chipsUnit')}
                          </span>
                        </div>

                        <div>
                          <label className="text-[11px] text-slate-400 block mb-1.5">
                            {t('selectPotWinnerPrompt')}
                          </label>
                          <div className="grid grid-cols-2 gap-1.5">
                            {eligibleContenders.map((c) => {
                              const isWinner = currentWinners.includes(c.seatIndex);
                              return (
                                <button
                                  key={c.id}
                                  type="button"
                                  onClick={() => {
                                    if (isWinner) {
                                      setSidePotWinners({
                                        ...sidePotWinners,
                                        [idx]: currentWinners.filter((s) => s !== c.seatIndex),
                                      });
                                    } else {
                                      setSidePotWinners({
                                        ...sidePotWinners,
                                        [idx]: [...currentWinners, c.seatIndex],
                                      });
                                    }
                                  }}
                                  className={`p-2 rounded-lg text-xs font-bold border flex items-center justify-between transition-all cursor-pointer ${
                                    isWinner
                                      ? 'bg-amber-500/20 border-amber-400 text-amber-200 ring-1 ring-amber-400/40 shadow-sm'
                                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                                  }`}
                                >
                                  <span className="truncate">{c.name}</span>
                                  {isWinner && <Check className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })}

                  {sidePotSummary && sidePotSummary.totalAllocated > 0 && (
                    <div className="bg-slate-950 p-3 rounded-xl border border-cyan-500/40 text-xs space-y-2">
                      <div className="font-extrabold text-cyan-300 flex items-center justify-between">
                        <span>{t('payoutSummaryTitle')}</span>
                        <span className="font-mono text-amber-300">
                          {formatChips(sidePotSummary.totalAllocated)} / {formatChips(totalPot)} ชิป
                        </span>
                      </div>
                      <div className="grid grid-cols-2 gap-1 font-mono text-[11px]">
                        {contenders.map((c) => {
                          const amt = sidePotSummary.playerPayouts[c.id] || 0;
                          if (amt === 0) return null;
                          return (
                            <div key={c.id} className="text-slate-300 flex justify-between bg-slate-900/80 px-2 py-1 rounded">
                              <span>{c.name}:</span>
                              <strong className="text-emerald-400">+{formatChips(amt)}</strong>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 4: CUSTOM ADJUST */}
          {mode === 'custom' && (
            <div className="space-y-3">
              <div className="text-xs text-slate-400 flex items-center justify-between">
                <span>ระบุจำนวนชิปที่ต้องการจ่ายให้ผู้เล่นแต่ละคนเอง</span>
                <span className="font-mono text-amber-400">กองกลาง: {formatChips(totalPot)}</span>
              </div>

              <div className="space-y-2">
                {contenders.map((p) => {
                  const currentAmt = customAmounts[p.id] || 0;
                  return (
                    <div
                      key={p.id}
                      className="p-3 bg-slate-950/80 rounded-xl border border-slate-800 flex items-center justify-between gap-3"
                    >
                      <div>
                        <div className="font-bold text-sm text-slate-100">{p.name}</div>
                        <div className="text-xs text-slate-400 font-mono">
                          {t('seatNumber', { number: p.seatIndex + 1 })} • เดิมพัน: {formatChips(p.totalInvestedThisHand)}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {[50, 100, 500].map((step) => (
                          <button
                            key={step}
                            type="button"
                            onClick={() =>
                              setCustomAmounts({
                                ...customAmounts,
                                [p.id]: (customAmounts[p.id] || 0) + step,
                              })
                            }
                            className="px-2 py-1 text-[10px] font-mono font-bold bg-slate-900 hover:bg-slate-800 border border-slate-700 text-slate-300 rounded cursor-pointer"
                          >
                            +{step}
                          </button>
                        ))}
                        <input
                          type="number"
                          value={currentAmt || ''}
                          placeholder="0"
                          onChange={(e) =>
                            setCustomAmounts({
                              ...customAmounts,
                              [p.id]: Math.max(0, Number(e.target.value)),
                            })
                          }
                          className="w-24 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs font-mono font-bold text-amber-300 text-right focus:outline-none focus:border-amber-400"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Folded Players Collapsible Section */}
          {foldedPlayers.length > 0 && (
            <div className="border border-slate-800/80 rounded-xl overflow-hidden bg-slate-950/40">
              <button
                type="button"
                onClick={() => setShowFolded(!showFolded)}
                className="w-full px-3.5 py-2 flex items-center justify-between text-xs text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
              >
                <span>{t('foldedPlayersGroup', { count: foldedPlayers.length })}</span>
                {showFolded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
              </button>

              {showFolded && (
                <div className="p-3 pt-0 space-y-1.5">
                  {foldedPlayers.map((fp) => (
                    <div
                      key={fp.id}
                      className="flex items-center justify-between text-xs text-slate-500 px-2 py-1 bg-slate-900/40 rounded opacity-60"
                    >
                      <span>
                        {fp.name} ({t('seatNumber', { number: fp.seatIndex + 1 })})
                      </span>
                      <span className="font-mono text-rose-400/80">{t('foldedTag')}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs transition-all cursor-pointer"
          >
            {t('cancel')}
          </button>

          <button
            type="button"
            onClick={handleConfirm}
            disabled={
              (mode === 'solo' && selectedSoloSeat === null) ||
              (mode === 'split' && selectedSplitSeats.length === 0) ||
              (mode === 'sidepots' && (!sidePotSummary || sidePotSummary.totalAllocated === 0)) ||
              (mode === 'custom' &&
                Object.values(customAmounts).reduce((a, b) => a + b, 0) === 0)
            }
            className="flex-1 py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-slate-950 font-black text-xs shadow-lg transition-all active:scale-98 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex items-center justify-center gap-1.5"
          >
            <Trophy className="w-4 h-4 text-slate-950" />
            <span>{t('confirmPayout')}</span>
          </button>
        </div>

      </div>
    </div>,
    document.body
  );
};
