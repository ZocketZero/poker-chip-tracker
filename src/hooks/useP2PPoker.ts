import { useEffect, useRef, useState, useCallback } from 'react';
import Peer, { type DataConnection } from 'peerjs';
import type { PeerMessage, TableState, Player } from '../types/poker';
import { calculateSidePots, getNextActiveSeat } from '../utils/pokerRules';

export const INITIAL_TABLE_STATE: TableState = {
  roomId: '',
  hostId: '',
  players: {},
  dealerSeat: 0,
  sbSeat: 1,
  bbSeat: 2,
  currentTurnSeat: null,
  street: 'preflop',
  currentHighBet: 0,
  minRaise: 20,
  pot: 0,
  communityBets: 0,
  sidePots: [],
  handNumber: 0,
  isHandInProgress: false,
  settings: {
    smallBlind: 10,
    bigBlind: 20,
    ante: 0,
    initialBuyIn: 1000,
    autoProgressTurn: true,
    tableSize: 8,
  },
  logs: [],
};

export function useP2PPoker() {
  const [peerId, setPeerId] = useState<string>('');
  const [isHost, setIsHost] = useState<boolean>(false);
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [tableState, setTableState] = useState<TableState>(INITIAL_TABLE_STATE);
  const [localPlayerId, setLocalPlayerId] = useState<string>('');
  const [isConnecting, setIsConnecting] = useState<boolean>(false);

  const peerRef = useRef<Peer | null>(null);
  const connectionsRef = useRef<Record<string, DataConnection>>({});
  const hostConnRef = useRef<DataConnection | null>(null);
  const broadcastChannelRef = useRef<BroadcastChannel | null>(null);
  const peerToPlayerMapRef = useRef<Record<string, string>>({});
  const isHostRef = useRef<boolean>(false);
  const tableStateRef = useRef<TableState>(INITIAL_TABLE_STATE);
  const localPlayerIdRef = useRef<string>('');

  useEffect(() => {
    tableStateRef.current = tableState;
  }, [tableState]);

  useEffect(() => {
    isHostRef.current = isHost;
  }, [isHost]);

  useEffect(() => {
    localPlayerIdRef.current = localPlayerId;
  }, [localPlayerId]);

  // Broadcast state to all connected peers & local BroadcastChannel
  const broadcastState = useCallback((newState: TableState) => {
    tableStateRef.current = newState;
    setTableState(newState);

    if (isHostRef.current) {
      const msg: PeerMessage = { type: 'SYNC_STATE', state: newState };
      
      // 1. BroadcastChannel (for same browser tabs/windows)
      if (broadcastChannelRef.current) {
        try {
          broadcastChannelRef.current.postMessage({
            senderId: localPlayerIdRef.current,
            msg,
          });
        } catch (e) {
          console.warn('BroadcastChannel error', e);
        }
      }

      // 2. WebRTC DataConnections (for cross-device peers)
      Object.values(connectionsRef.current).forEach((conn) => {
        if (conn && conn.open) {
          try {
            conn.send(msg);
          } catch (e) {
            console.error('Failed to send state to peer:', conn.peer, e);
          }
        }
      });
    }
  }, []);

  // Helper to progress betting streets
  const progressToNextStreet = useCallback((current: TableState) => {
    current.pot += Object.values(current.players).reduce((s, p) => s + p.currentBet, 0);

    Object.keys(current.players).forEach((id) => {
      current.players[id] = {
        ...current.players[id],
        currentBet: 0,
        hasActedThisStreet: false,
      };
    });

    current.communityBets = 0;
    current.currentHighBet = 0;
    current.minRaise = current.settings.bigBlind;
    current.sidePots = calculateSidePots(Object.values(current.players));

    const streetSequence: Record<string, 'flop' | 'turn' | 'river' | 'showdown'> = {
      preflop: 'flop',
      flop: 'turn',
      turn: 'river',
      river: 'showdown',
    };

    const nextStreet = streetSequence[current.street] || 'showdown';
    current.street = nextStreet;

    const logItem = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: Date.now(),
      text: `--- Street advanced to: ${nextStreet.toUpperCase()} (Total Pot: ${current.pot}) ---`,
      type: 'street' as const,
    };
    current.logs = [logItem, ...current.logs.slice(0, 49)];

    if (nextStreet === 'showdown') {
      current.currentTurnSeat = null;
    } else {
      current.currentTurnSeat = getNextActiveSeat(current, current.dealerSeat, false);
    }

    broadcastState(current);
  }, [broadcastState]);

  // Host processes incoming messages & updates authoritative game state
  const handleMessageAsHost = useCallback(
    (senderId: string, msg: PeerMessage) => {
      const current = { ...tableStateRef.current };
      
      // Resolve actual player (if senderId is 'local' or match directly)
      const effectivePlayerId = senderId === 'local' ? localPlayerIdRef.current : senderId;
      const senderPlayer = current.players[effectivePlayerId];

      switch (msg.type) {
        case 'JOIN_REQUEST': {
          const playerId = effectivePlayerId;
          const { name, requestedSeat, buyIn } = msg;

          // If player already exists, update connection & seat if free
          if (current.players[playerId]) {
            current.players[playerId].connected = true;
            if (name) current.players[playerId].name = name;
            if (requestedSeat !== undefined) {
              const isOccupied = Object.values(current.players).some(
                (p) => p.id !== playerId && p.seatIndex === requestedSeat
              );
              if (!isOccupied && requestedSeat >= 0 && requestedSeat < current.settings.tableSize) {
                current.players[playerId].seatIndex = requestedSeat;
              }
            }
            broadcastState(current);
            break;
          }

          const isRequestedSeatOccupied =
            requestedSeat !== undefined &&
            Object.values(current.players).some((p) => p.seatIndex === requestedSeat);

          const seat =
            requestedSeat !== undefined &&
            !isRequestedSeatOccupied &&
            requestedSeat >= 0 &&
            requestedSeat < current.settings.tableSize
              ? requestedSeat
              : findFirstAvailableSeat(current);

          const newPlayer: Player = {
            id: playerId,
            name: name || `Player ${seat + 1}`,
            stack: buyIn || current.settings.initialBuyIn,
            currentBet: 0,
            totalInvestedThisHand: 0,
            isActive: true,
            hasFolded: false,
            isAllIn: false,
            hasActedThisStreet: false,
            seatIndex: seat,
            isHost: playerId === current.hostId,
            connected: true,
          };

          const updatedPlayers = {
            ...current.players,
            [playerId]: newPlayer,
          };

          const logItem = {
            id: Math.random().toString(36).substring(2, 9),
            timestamp: Date.now(),
            text: `${newPlayer.name} joined table at Seat ${seat + 1} with ${newPlayer.stack} chips.`,
            type: 'system' as const,
          };

          broadcastState({
            ...current,
            players: updatedPlayers,
            logs: [logItem, ...current.logs.slice(0, 49)],
          });
          break;
        }

        case 'PLAYER_ACTION': {
          if (!current.isHandInProgress || current.currentTurnSeat === null) return;
          if (!senderPlayer || senderPlayer.seatIndex !== current.currentTurnSeat) return;

          const action = msg.action;
          const player = { ...senderPlayer };
          let actionLog = '';
          const currentHigh = current.currentHighBet;
          const toCall = currentHigh - player.currentBet;

          if (action === 'fold') {
            player.hasFolded = true;
            player.hasActedThisStreet = true;
            actionLog = `${player.name} folded.`;
          } else if (action === 'check') {
            if (toCall > 0) return;
            player.hasActedThisStreet = true;
            actionLog = `${player.name} checked.`;
          } else if (action === 'call') {
            const callAmount = Math.min(toCall, player.stack);
            player.stack -= callAmount;
            player.currentBet += callAmount;
            player.totalInvestedThisHand += callAmount;
            player.hasActedThisStreet = true;
            if (player.stack === 0) player.isAllIn = true;
            actionLog = `${player.name} called ${callAmount} chips.`;
          } else if (action === 'raise' || action === 'all-in') {
            let totalBetTarget = msg.amount || (currentHigh + current.minRaise);
            if (action === 'all-in') {
              totalBetTarget = player.currentBet + player.stack;
            }

            const additional = totalBetTarget - player.currentBet;
            const actualAdd = Math.min(additional, player.stack);
            const raiseDiff = (player.currentBet + actualAdd) - currentHigh;

            if (raiseDiff > current.minRaise) {
              current.minRaise = raiseDiff;
            }

            player.stack -= actualAdd;
            player.currentBet += actualAdd;
            player.totalInvestedThisHand += actualAdd;
            player.hasActedThisStreet = true;
            if (player.stack === 0) player.isAllIn = true;

            current.currentHighBet = player.currentBet;

            Object.keys(current.players).forEach((id) => {
              if (id !== player.id && !current.players[id].hasFolded && !current.players[id].isAllIn) {
                current.players[id] = { ...current.players[id], hasActedThisStreet: false };
              }
            });

            actionLog = action === 'all-in'
              ? `🔥 ${player.name} went ALL-IN with ${player.currentBet} chips!`
              : `${player.name} raised to ${player.currentBet} chips.`;
          }

          current.players[player.id] = player;
          current.communityBets = Object.values(current.players).reduce(
            (sum, p) => sum + p.currentBet,
            0
          );
          current.sidePots = calculateSidePots(Object.values(current.players));

          const activeUnfolded = Object.values(current.players).filter(
            (p) => p.isActive && !p.hasFolded
          );

          const logItem = {
            id: Math.random().toString(36).substring(2, 9),
            timestamp: Date.now(),
            text: actionLog,
            type: 'action' as const,
          };
          current.logs = [logItem, ...current.logs.slice(0, 49)];

          if (activeUnfolded.length === 1) {
            const winner = activeUnfolded[0];
            const totalPotCollected = current.pot + current.communityBets;
            winner.stack += totalPotCollected;

            const winLog = {
              id: Math.random().toString(36).substring(2, 9),
              timestamp: Date.now(),
              text: `🏆 Everyone folded! ${winner.name} wins the pot of ${totalPotCollected} chips!`,
              type: 'winner' as const,
            };

            Object.keys(current.players).forEach((id) => {
              current.players[id] = {
                ...current.players[id],
                currentBet: 0,
                totalInvestedThisHand: 0,
                hasFolded: false,
                isAllIn: false,
                hasActedThisStreet: false,
              };
            });

            current.pot = 0;
            current.communityBets = 0;
            current.sidePots = [];
            current.isHandInProgress = false;
            current.currentTurnSeat = null;
            current.logs = [winLog, ...current.logs.slice(0, 49)];

            broadcastState(current);
            return;
          }

          const nonAllIn = activeUnfolded.filter((p) => !p.isAllIn && p.stack > 0);
          const roundFinished =
            nonAllIn.length === 0 ||
            nonAllIn.every((p) => p.hasActedThisStreet && p.currentBet === current.currentHighBet);

          if (roundFinished) {
            progressToNextStreet(current);
          } else {
            const nextSeat = getNextActiveSeat(current, player.seatIndex, false);
            current.currentTurnSeat = nextSeat;
            broadcastState(current);
          }
          break;
        }

        case 'HOST_START_HAND': {
          startNewHand(current);
          break;
        }

        case 'HOST_NEXT_STREET': {
          progressToNextStreet(current);
          break;
        }

        case 'HOST_AWARD_POT': {
          const { winnerSeatIndexes, customAmount } = msg;
          const winners = Object.values(current.players).filter((p) =>
            winnerSeatIndexes.includes(p.seatIndex)
          );

          if (winners.length === 0) return;

          const totalPot = customAmount !== undefined ? customAmount : (current.pot + current.communityBets);
          const share = Math.floor(totalPot / winners.length);
          let rem = totalPot % winners.length;

          winners.forEach((w) => {
            current.players[w.id].stack += share;
          });

          if (rem > 0) {
            current.players[winners[0].id].stack += rem;
          }

          const winnerNames = winners.map((w) => w.name).join(', ');
          const winLog = {
            id: Math.random().toString(36).substring(2, 9),
            timestamp: Date.now(),
            text: `🏆 Hand #${current.handNumber} finished: ${winnerNames} awarded ${totalPot} chips!`,
            type: 'winner' as const,
          };

          Object.keys(current.players).forEach((id) => {
            current.players[id] = {
              ...current.players[id],
              currentBet: 0,
              totalInvestedThisHand: 0,
              hasFolded: false,
              isAllIn: false,
              hasActedThisStreet: false,
            };
          });

          current.pot = 0;
          current.communityBets = 0;
          current.sidePots = [];
          current.isHandInProgress = false;
          current.currentTurnSeat = null;
          current.logs = [winLog, ...current.logs.slice(0, 49)];

          broadcastState(current);
          break;
        }

        case 'HOST_REBUY': {
          const { playerId, amount } = msg;
          if (current.players[playerId]) {
            current.players[playerId].stack += amount;
            const logItem = {
              id: Math.random().toString(36).substring(2, 9),
              timestamp: Date.now(),
              text: `💵 ${current.players[playerId].name} added ${amount} chips (New stack: ${current.players[playerId].stack}).`,
              type: 'system' as const,
            };
            current.logs = [logItem, ...current.logs.slice(0, 49)];
            broadcastState(current);
          }
          break;
        }

        case 'HOST_FORCE_SEAT': {
          const { playerId, seatIndex } = msg;
          if (current.players[playerId]) {
            const isOccupied = Object.values(current.players).some(
              (p) => p.id !== playerId && p.seatIndex === seatIndex
            );
            if (!isOccupied && seatIndex >= 0 && seatIndex < current.settings.tableSize) {
              current.players[playerId].seatIndex = seatIndex;
              broadcastState(current);
            }
          }
          break;
        }

        case 'REQUEST_SEAT': {
          const { playerId, seatIndex, name } = msg;
          const targetPlayerId = playerId || effectivePlayerId;
          const isOccupied = Object.values(current.players).some(
            (p) => p.id !== targetPlayerId && p.seatIndex === seatIndex
          );

          if (seatIndex >= 0 && seatIndex < current.settings.tableSize && !isOccupied) {
            if (current.players[targetPlayerId]) {
              const oldSeat = current.players[targetPlayerId].seatIndex;
              current.players[targetPlayerId].seatIndex = seatIndex;
              if (name) current.players[targetPlayerId].name = name;
              const logItem = {
                id: Math.random().toString(36).substring(2, 9),
                timestamp: Date.now(),
                text: `${current.players[targetPlayerId].name} moved from Seat ${oldSeat + 1} to Seat ${seatIndex + 1}.`,
                type: 'system' as const,
              };
              broadcastState({
                ...current,
                logs: [logItem, ...current.logs.slice(0, 49)],
              });
            } else {
              const newPlayer: Player = {
                id: targetPlayerId,
                name: name || `Player ${seatIndex + 1}`,
                stack: current.settings.initialBuyIn,
                currentBet: 0,
                totalInvestedThisHand: 0,
                isActive: true,
                hasFolded: false,
                isAllIn: false,
                hasActedThisStreet: false,
                seatIndex: seatIndex,
                isHost: targetPlayerId === current.hostId,
                connected: true,
              };
              current.players[targetPlayerId] = newPlayer;
              const logItem = {
                id: Math.random().toString(36).substring(2, 9),
                timestamp: Date.now(),
                text: `${newPlayer.name} sat at Seat ${seatIndex + 1} with ${newPlayer.stack} chips.`,
                type: 'system' as const,
              };
              broadcastState({
                ...current,
                players: { ...current.players, [targetPlayerId]: newPlayer },
                logs: [logItem, ...current.logs.slice(0, 49)],
              });
            }
          }
          break;
        }

        case 'HOST_UPDATE_SETTINGS': {
          current.settings = { ...current.settings, ...msg.settings };
          broadcastState(current);
          break;
        }

        case 'SIT_OUT_TOGGLE': {
          const { playerId } = msg;
          if (current.players[playerId]) {
            current.players[playerId].isActive = !current.players[playerId].isActive;
            const status = current.players[playerId].isActive ? 'is back' : 'is sitting out';
            const logItem = {
              id: Math.random().toString(36).substring(2, 9),
              timestamp: Date.now(),
              text: `${current.players[playerId].name} ${status}.`,
              type: 'system' as const,
            };
            current.logs = [logItem, ...current.logs.slice(0, 49)];
            broadcastState(current);
          }
          break;
        }
      }
    },
    [broadcastState, progressToNextStreet]
  );

  // Send message to host
  const sendToHost = useCallback(
    (msg: PeerMessage) => {
      if (isHostRef.current) {
        handleMessageAsHost(localPlayerIdRef.current, msg);
        return;
      }

      const envelope = {
        senderId: localPlayerIdRef.current,
        msg,
      };

      // 1. BroadcastChannel dispatch (for local/browser tabs)
      if (broadcastChannelRef.current) {
        try {
          broadcastChannelRef.current.postMessage(envelope);
        } catch (e) {
          console.warn('BroadcastChannel send error', e);
        }
      }

      // 2. WebRTC data connection (for remote peers)
      if (hostConnRef.current && hostConnRef.current.open) {
        try {
          hostConnRef.current.send(envelope);
        } catch (e) {
          console.warn('WebRTC send error', e);
        }
      }
    },
    [handleMessageAsHost]
  );

  const startNewHand = (current: TableState) => {
    const activePlayers = Object.values(current.players).filter(
      (p) => p.isActive && p.stack > 0
    );

    if (activePlayers.length < 2) {
      alert('Need at least 2 active players with chips to start a hand!');
      return;
    }

    // Determine next dealer seat among seated active players
    const activeSeatIndexes = activePlayers.map((p) => p.seatIndex).sort((a, b) => a - b);
    let nextDealer = current.dealerSeat;

    const higherSeat = activeSeatIndexes.find((s) => s > current.dealerSeat);
    if (higherSeat !== undefined) {
      nextDealer = higherSeat;
    } else {
      nextDealer = activeSeatIndexes[0];
    }

    current.dealerSeat = nextDealer;

    Object.keys(current.players).forEach((id) => {
      current.players[id] = {
        ...current.players[id],
        currentBet: 0,
        totalInvestedThisHand: 0,
        hasFolded: false,
        isAllIn: false,
        hasActedThisStreet: false,
      };
    });

    let sbSeat: number;
    let bbSeat: number;

    if (activePlayers.length === 2) {
      // In Heads-up: Dealer is SB, other player is BB
      sbSeat = nextDealer;
      bbSeat = activeSeatIndexes.find((s) => s !== sbSeat) ?? sbSeat;
    } else {
      sbSeat = getNextActiveSeat(current, nextDealer, true) ?? nextDealer;
      bbSeat = getNextActiveSeat(current, sbSeat, true) ?? sbSeat;
    }

    current.sbSeat = sbSeat;
    current.bbSeat = bbSeat;

    const sbPlayer = Object.values(current.players).find((p) => p.seatIndex === sbSeat);
    const bbPlayer = Object.values(current.players).find((p) => p.seatIndex === bbSeat);

    if (sbPlayer) {
      const sbAmount = Math.min(current.settings.smallBlind, sbPlayer.stack);
      sbPlayer.stack -= sbAmount;
      sbPlayer.currentBet = sbAmount;
      sbPlayer.totalInvestedThisHand = sbAmount;
      if (sbPlayer.stack === 0) sbPlayer.isAllIn = true;
    }

    if (bbPlayer) {
      const bbAmount = Math.min(current.settings.bigBlind, bbPlayer.stack);
      bbPlayer.stack -= bbAmount;
      bbPlayer.currentBet = bbAmount;
      bbPlayer.totalInvestedThisHand = bbAmount;
      if (bbPlayer.stack === 0) bbPlayer.isAllIn = true;
    }

    if (current.settings.ante > 0) {
      Object.values(current.players).forEach((p) => {
        if (p.isActive && p.stack > 0) {
          const anteAmount = Math.min(current.settings.ante, p.stack);
          p.stack -= anteAmount;
          p.totalInvestedThisHand += anteAmount;
          if (p.stack === 0) p.isAllIn = true;
        }
      });
    }

    current.currentHighBet = current.settings.bigBlind;
    current.minRaise = current.settings.bigBlind;
    current.pot = 0;
    current.communityBets = Object.values(current.players).reduce((s, p) => s + p.currentBet, 0);
    current.sidePots = calculateSidePots(Object.values(current.players));
    current.street = 'preflop';
    current.handNumber += 1;
    current.isHandInProgress = true;

    // Preflop first action:
    // In Heads-up: Dealer / SB acts first preflop!
    // In 3+ players: Player after BB (UTG) acts first!
    if (activePlayers.length === 2) {
      current.currentTurnSeat = sbSeat;
    } else {
      const utgSeat = getNextActiveSeat(current, bbSeat, false) ?? getNextActiveSeat(current, bbSeat, true);
      current.currentTurnSeat = utgSeat;
    }

    const logItem = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: Date.now(),
      text: `🃏 Hand #${current.handNumber} started. Blinds: ${current.settings.smallBlind}/${current.settings.bigBlind}.`,
      type: 'street' as const,
    };
    current.logs = [logItem, ...current.logs.slice(0, 49)];

    broadcastState(current);
  };

  function findFirstAvailableSeat(table: TableState): number {
    const occupied = new Set(Object.values(table.players).map((p) => p.seatIndex));
    for (let i = 0; i < table.settings.tableSize; i++) {
      if (!occupied.has(i)) return i;
    }
    return 0;
  }

  // Initialize a Host Room
  const hostRoom = useCallback(
    (hostName: string, customRoomId?: string, initialSettings?: Partial<typeof INITIAL_TABLE_STATE.settings>) => {
      setIsConnecting(true);
      setConnectionError(null);

      const cleanRoomId = customRoomId?.trim() || `poker-${Math.random().toString(36).substring(2, 7)}`;
      const hostUniqueId = `host-${Math.random().toString(36).substring(2, 8)}`;

      setPeerId(cleanRoomId);
      setIsHost(true);
      setIsConnected(true);
      setIsConnecting(false);
      setLocalPlayerId(hostUniqueId);
      localPlayerIdRef.current = hostUniqueId;

      // 1. Setup Local BroadcastChannel
      try {
        const bc = new BroadcastChannel(`poker-room-${cleanRoomId}`);
        bc.onmessage = (event) => {
          const { senderId, msg } = event.data || {};
          if (senderId && msg && senderId !== localPlayerIdRef.current) {
            handleMessageAsHost(senderId, msg);
          }
        };
        broadcastChannelRef.current = bc;
      } catch (e) {
        console.warn('BroadcastChannel not supported', e);
      }

      // Initial table state
      const hostPlayer: Player = {
        id: hostUniqueId,
        name: hostName || 'Host Dealer',
        stack: initialSettings?.initialBuyIn || 1000,
        currentBet: 0,
        totalInvestedThisHand: 0,
        isActive: true,
        hasFolded: false,
        isAllIn: false,
        hasActedThisStreet: false,
        seatIndex: 0,
        isHost: true,
        connected: true,
      };

      const initial: TableState = {
        ...INITIAL_TABLE_STATE,
        roomId: cleanRoomId,
        hostId: hostUniqueId,
        players: { [hostUniqueId]: hostPlayer },
        settings: { ...INITIAL_TABLE_STATE.settings, ...initialSettings },
        logs: [
          {
            id: Math.random().toString(36).substring(2, 9),
            timestamp: Date.now(),
            text: `Table created by ${hostPlayer.name}. Room Code: ${cleanRoomId}`,
            type: 'system',
          },
        ],
      };

      broadcastState(initial);

      // 2. Setup WebRTC Peer for remote clients
      try {
        const peer = new Peer(cleanRoomId);

        peer.on('connection', (conn) => {
          conn.on('open', () => {
            connectionsRef.current[conn.peer] = conn;
            conn.send({ type: 'SYNC_STATE', state: tableStateRef.current });
          });

          conn.on('data', (data: any) => {
            if (data && data.senderId && data.msg) {
              peerToPlayerMapRef.current[conn.peer] = data.senderId;
              handleMessageAsHost(data.senderId, data.msg);
            } else if (data && data.type) {
              handleMessageAsHost(conn.peer, data);
            }
          });

          conn.on('close', () => {
            delete connectionsRef.current[conn.peer];
            const targetPlayerId = peerToPlayerMapRef.current[conn.peer] || conn.peer;
            const current = { ...tableStateRef.current };
            if (current.players[targetPlayerId]) {
              current.players[targetPlayerId].connected = false;
              broadcastState(current);
            }
          });
        });

        peerRef.current = peer;
      } catch (err: any) {
        console.warn('PeerJS init failed:', err);
      }
    },
    [broadcastState, handleMessageAsHost]
  );

  // Join Room
  const joinRoom = useCallback(
    (targetRoomId: string, playerName: string, requestedSeat?: number, buyIn?: number) => {
      setIsConnecting(true);
      setConnectionError(null);

      const cleanTargetId = targetRoomId.trim();
      const myPlayerId = `player-${Math.random().toString(36).substring(2, 8)}`;
      setLocalPlayerId(myPlayerId);
      localPlayerIdRef.current = myPlayerId;
      setIsHost(false);

      let joinedSuccessfully = false;

      // 1. Setup Local BroadcastChannel (instant connection for tabs/windows on the same computer)
      try {
        const bc = new BroadcastChannel(`poker-room-${cleanTargetId}`);
        bc.onmessage = (event) => {
          const { msg } = event.data || {};
          const actualMsg = (msg || event.data) as PeerMessage;
          if (actualMsg && actualMsg.type === 'SYNC_STATE') {
            setTableState(actualMsg.state);
            tableStateRef.current = actualMsg.state;
            if (!joinedSuccessfully) {
              joinedSuccessfully = true;
              setIsConnected(true);
              setIsConnecting(false);
            }
          }
        };
        broadcastChannelRef.current = bc;

        // Send Join Request via BroadcastChannel
        bc.postMessage({
          senderId: myPlayerId,
          msg: {
            type: 'JOIN_REQUEST',
            name: playerName,
            requestedSeat,
            buyIn,
          },
        });
      } catch (e) {
        console.warn('BroadcastChannel error', e);
      }

      // 2. Also attempt WebRTC connection for cross-device players
      try {
        const peer = new Peer();

        peer.on('open', (myPeerId) => {
          setPeerId(myPeerId);

          const conn = peer.connect(cleanTargetId, {
            reliable: true,
          });

          conn.on('open', () => {
            hostConnRef.current = conn;
            joinedSuccessfully = true;
            setIsConnected(true);
            setIsConnecting(false);

            conn.send({
              senderId: myPlayerId,
              msg: {
                type: 'JOIN_REQUEST',
                name: playerName,
                requestedSeat,
                buyIn,
              },
            });
          });

          conn.on('data', (data: any) => {
            const msg = (data?.msg || data) as PeerMessage;
            if (msg && msg.type === 'SYNC_STATE') {
              setTableState(msg.state);
              tableStateRef.current = msg.state;
              if (!joinedSuccessfully) {
                joinedSuccessfully = true;
                setIsConnected(true);
                setIsConnecting(false);
              }
            }
          });

          conn.on('close', () => {
            if (!broadcastChannelRef.current) {
              setIsConnected(false);
              setConnectionError('Lost connection to host.');
            }
          });
        });

        peerRef.current = peer;
      } catch (err: any) {
        console.warn('Peer connect error:', err);
      }

      // Fallback timeout verification
      setTimeout(() => {
        if (!joinedSuccessfully && !isConnected) {
          if (tableStateRef.current.roomId === cleanTargetId) {
            setIsConnected(true);
            setIsConnecting(false);
          } else {
            setConnectionError(
              `Room "${cleanTargetId}" not found. Make sure the Host tab/device has created the table.`
            );
            setIsConnecting(false);
          }
        }
      }, 3500);
    },
    [isConnected]
  );

  const startSoloTable = useCallback((hostName: string = 'Dealer & Player 1') => {
    setIsHost(true);
    setIsConnected(true);
    const mockId = 'local-player-1';
    setLocalPlayerId(mockId);
    localPlayerIdRef.current = mockId;
    setPeerId('offline-mode');

    const bot1: Player = {
      id: mockId,
      name: hostName,
      stack: 1000,
      currentBet: 0,
      totalInvestedThisHand: 0,
      isActive: true,
      hasFolded: false,
      isAllIn: false,
      hasActedThisStreet: false,
      seatIndex: 0,
      isHost: true,
      connected: true,
    };

    const bot2: Player = {
      id: 'local-bot-2',
      name: 'Alice (Seat 2)',
      stack: 1000,
      currentBet: 0,
      totalInvestedThisHand: 0,
      isActive: true,
      hasFolded: false,
      isAllIn: false,
      hasActedThisStreet: false,
      seatIndex: 1,
      isHost: false,
      connected: true,
    };

    const bot3: Player = {
      id: 'local-bot-3',
      name: 'Bob (Seat 3)',
      stack: 1000,
      currentBet: 0,
      totalInvestedThisHand: 0,
      isActive: true,
      hasFolded: false,
      isAllIn: false,
      hasActedThisStreet: false,
      seatIndex: 2,
      isHost: false,
      connected: true,
    };

    const initial: TableState = {
      ...INITIAL_TABLE_STATE,
      roomId: 'OFFLINE-TABLE',
      hostId: mockId,
      players: { [mockId]: bot1, 'local-bot-2': bot2, 'local-bot-3': bot3 },
      logs: [
        {
          id: '1',
          timestamp: Date.now(),
          text: 'Practice Table started with 3 seated players (Single Device / Offline Mode).',
          type: 'system',
        },
      ],
    };

    broadcastState(initial);
  }, [broadcastState]);

  useEffect(() => {
    return () => {
      if (broadcastChannelRef.current) {
        broadcastChannelRef.current.close();
      }
      if (peerRef.current) {
        peerRef.current.destroy();
      }
    };
  }, []);

  return {
    peerId,
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
  };
}
