export type BettingStreet = 'preflop' | 'flop' | 'turn' | 'river' | 'showdown';

export type PlayerActionType = 'fold' | 'check' | 'call' | 'raise' | 'all-in';

export interface Player {
  id: string;             // Unique peer ID or local ID
  name: string;           // Screen name
  avatar?: string;        // Avatar icon/color
  stack: number;          // Current chip stack behind
  currentBet: number;     // Chips committed in current street
  totalInvestedThisHand: number; // Total chips committed across all streets in current hand
  isActive: boolean;      // True if seated and not sitting out
  hasFolded: boolean;     // True if folded in current hand
  isAllIn: boolean;       // True if went all-in
  hasActedThisStreet: boolean; // Tracking betting turn completion
  seatIndex: number;      // Position around table (0 - 9) or -1 if spectating/dealer-only
  isHost: boolean;
  isDealerOnly?: boolean; // True if host is dealer only (does not play/bet)
  connected: boolean;
  lastAction?: PlayerActionType | null;
}

export interface SidePot {
  amount: number;
  eligiblePlayerIds: string[];
}

export interface GameSettings {
  smallBlind: number;
  bigBlind: number;
  ante: number;
  initialBuyIn: number;
  autoProgressTurn: boolean;
  showStreetAnnouncements: boolean;
  tableSize: number; // Max seats (e.g. 6 or 9)
}

export interface GameHistoryItem {
  id: string;
  timestamp: number;
  text: string;
  type: 'action' | 'street' | 'winner' | 'system';
}

export interface WinnerInfo {
  winnerNames: string[];
  winnerSeatIndexes: number[];
  amount: number;
  handNumber: number;
  timestamp: number;
  reason?: 'fold' | 'showdown';
}

export interface TableState {
  roomId: string;
  hostId: string;
  players: Record<string, Player>;
  dealerSeat: number;
  sbSeat: number;
  bbSeat: number;
  currentTurnSeat: number | null;
  street: BettingStreet;
  currentHighBet: number;
  minRaise: number;
  pot: number; // Main pot + collected pot from previous rounds
  communityBets: number; // Sum of current active bets on table
  sidePots: SidePot[];
  handNumber: number;
  isHandInProgress: boolean;
  settings: GameSettings;
  logs: GameHistoryItem[];
  lastWinner?: WinnerInfo | null;
}

export type PeerMessage =
  | { type: 'SYNC_STATE'; state: TableState }
  | { type: 'JOIN_REQUEST'; name: string; requestedSeat?: number; buyIn?: number }
  | { type: 'PLAYER_ACTION'; action: PlayerActionType; amount?: number }
  | { type: 'HOST_START_HAND' }
  | { type: 'HOST_NEXT_STREET' }
  | { type: 'HOST_AWARD_POT'; winnerSeatIndexes: number[]; customAmount?: number }
  | { type: 'HOST_REBUY'; playerId: string; amount: number }
  | { type: 'HOST_UPDATE_SETTINGS'; settings: Partial<GameSettings> }
  | { type: 'HOST_FORCE_SEAT'; playerId: string; seatIndex: number }
  | { type: 'HOST_KICK_PLAYER'; playerId: string }
  | { type: 'HOST_TOGGLE_DEALER_ONLY'; isDealerOnly: boolean }
  | { type: 'REQUEST_SEAT'; playerId: string; seatIndex: number; name?: string }
  | { type: 'SIT_OUT_TOGGLE'; playerId: string }
  | { type: 'KICKED' }
  | { type: 'PING' }
  | { type: 'PONG' };
