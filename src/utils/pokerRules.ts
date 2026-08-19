import type { Player, SidePot, TableState } from '../types/poker';

/**
 * Calculate main and side pots accurately based on each player's total chips invested during the hand.
 */
export function calculateSidePots(players: Player[]): SidePot[] {
  const investedPlayers = players.filter((p) => p.totalInvestedThisHand > 0);

  if (investedPlayers.length === 0) {
    return [{ amount: 0, eligiblePlayerIds: [] }];
  }

  const investmentLevels = Array.from(
    new Set(investedPlayers.map((p) => p.totalInvestedThisHand))
  ).sort((a, b) => a - b);

  const pots: SidePot[] = [];
  let previousLevel = 0;

  for (const level of investmentLevels) {
    const contributionPerPlayer = level - previousLevel;
    let potAmount = 0;
    const eligiblePlayerIds: string[] = [];

    for (const p of investedPlayers) {
      if (p.totalInvestedThisHand >= level) {
        potAmount += contributionPerPlayer;
        if (!p.hasFolded) {
          eligiblePlayerIds.push(p.id);
        }
      }
    }

    if (potAmount > 0) {
      pots.push({
        amount: potAmount,
        eligiblePlayerIds,
      });
    }

    previousLevel = level;
  }

  const mergedPots: SidePot[] = [];
  for (const pot of pots) {
    if (mergedPots.length === 0) {
      mergedPots.push({ ...pot });
    } else {
      const last = mergedPots[mergedPots.length - 1];
      const samePlayers =
        last.eligiblePlayerIds.length === pot.eligiblePlayerIds.length &&
        last.eligiblePlayerIds.every((id) => pot.eligiblePlayerIds.includes(id));

      if (samePlayers) {
        last.amount += pot.amount;
      } else {
        mergedPots.push({ ...pot });
      }
    }
  }

  return mergedPots;
}

export function awardPot(
  pots: SidePot[],
  winnerIds: string[],
  players: Record<string, Player>,
  dealerSeat: number
): { payouts: Record<string, number>; remainingPot: number; messages: string[] } {
  const payouts: Record<string, number> = {};
  const messages: string[] = [];

  for (const pId of Object.keys(players)) {
    payouts[pId] = 0;
  }

  let remaining = 0;

  pots.forEach((pot, index) => {
    const eligibleWinners = winnerIds.filter((wId) =>
      pot.eligiblePlayerIds.includes(wId)
    );

    const winningPool = eligibleWinners.length > 0 ? eligibleWinners : pot.eligiblePlayerIds;

    if (winningPool.length === 0) {
      remaining += pot.amount;
      return;
    }

    const share = Math.floor(pot.amount / winningPool.length);
    let remainder = pot.amount % winningPool.length;

    winningPool.forEach((wId) => {
      payouts[wId] = (payouts[wId] || 0) + share;
    });

    if (remainder > 0) {
      const sortedBySeat = [...winningPool].sort((a, b) => {
        const seatA = (players[a]?.seatIndex - dealerSeat + 10) % 10;
        const seatB = (players[b]?.seatIndex - dealerSeat + 10) % 10;
        return seatA - seatB;
      });

      for (let i = 0; i < remainder; i++) {
        const luckyWinnerId = sortedBySeat[i % sortedBySeat.length];
        payouts[luckyWinnerId] = (payouts[luckyWinnerId] || 0) + 1;
      }
    }

    const names = winningPool.map((id) => players[id]?.name || 'Player').join(', ');
    const potLabel = index === 0 ? 'Main Pot' : `Side Pot #${index}`;
    messages.push(`${potLabel} (${pot.amount}) awarded to ${names}`);
  });

  return { payouts, remainingPot: remaining, messages };
}

export function getNextActiveSeat(
  tableState: TableState,
  fromSeat: number,
  includeAllIn: boolean = false
): number | null {
  const playerList = Object.values(tableState.players);
  if (playerList.length < 2) return null;

  const totalSeats = tableState.settings.tableSize;

  for (let offset = 1; offset < totalSeats; offset++) {
    const nextSeat = (fromSeat + offset) % totalSeats;
    const player = playerList.find((p) => p.seatIndex === nextSeat);

    if (
      player &&
      player.isActive &&
      !player.hasFolded &&
      (includeAllIn || (!player.isAllIn && player.stack > 0))
    ) {
      return nextSeat;
    }
  }

  return null;
}

export function isStreetComplete(tableState: TableState): boolean {
  const activeUnfolded = Object.values(tableState.players).filter(
    (p) => p.isActive && !p.hasFolded
  );

  if (activeUnfolded.length <= 1) return true;

  const playersCanAct = activeUnfolded.filter((p) => !p.isAllIn && p.stack > 0);

  if (playersCanAct.length === 0) return true;

  const allActedAndMatched = playersCanAct.every(
    (p) => p.hasActedThisStreet && p.currentBet === tableState.currentHighBet
  );

  return allActedAndMatched;
}

export function formatChips(amount: number): string {
  if (amount === undefined || amount === null) return '0';
  return amount.toLocaleString();
}

export interface ChipDenom {
  value: number;
  color: string;
  borderColor: string;
  count: number;
}

export const STANDARD_CHIP_VALUES = [
  { value: 1000, color: '#eab308', borderColor: '#ca8a04', label: '1k' },
  { value: 500, color: '#a855f7', borderColor: '#9333ea', label: '500' },
  { value: 100, color: '#0f172a', borderColor: '#334155', label: '100' },
  { value: 25, color: '#22c55e', borderColor: '#16a34a', label: '25' },
  { value: 5, color: '#ef4444', borderColor: '#dc2626', label: '5' },
  { value: 1, color: '#f8fafc', borderColor: '#cbd5e1', label: '1' },
];

export function getChipBreakdown(amount: number) {
  let rem = amount;
  return STANDARD_CHIP_VALUES.map((denom) => {
    const count = Math.floor(rem / denom.value);
    rem = rem % denom.value;
    return { ...denom, count };
  }).filter((d) => d.count > 0);
}
