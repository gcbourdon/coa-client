import { create } from 'zustand'
import type { GameState, PlayerIndex, CombatResultPayload, ActionRejectedPayload } from '../types/game'

export interface Position {
  col: number
  row: number
}

export type InteractionMode =
  | { type: 'idle' }
  | { type: 'card_selected'; cardInstanceId: string }
  | { type: 'card_targeted'; cardInstanceId: string; targetCol: number; targetRow: number }
  | { type: 'conqueror_selected'; conquerorInstanceId: string }
  | { type: 'declaring_attackers'; attackers: { conquerorId: string; targetCol: number; targetRow: number }[] }
  | { type: 'assigning_defenders'; attackers: { conquerorId: string; targetCol: number; targetRow: number }[]; assignments: Record<string, string> }

export interface LogEntry {
  id: number
  text: string
  timestamp: number
}

interface GameStore {
  // Connection / identity
  gameId: string | null
  myPlayerId: string | null
  myPlayerIndex: PlayerIndex | null  // 1 or 2 once joined

  // Server-mirrored state
  gameState: GameState | null

  // Interaction state
  mode: InteractionMode
  validTargets: Position[]

  // UI log
  log: LogEntry[]

  // Latest combat result for animation
  lastCombatResult: CombatResultPayload | null

  // Latest rejection for toast
  lastRejection: ActionRejectedPayload | null

  // --- Setters ---
  setIdentity: (gameId: string, playerId: string) => void
  setGameState: (state: GameState) => void
  resolvePlayerIndex: (playerId: string, state: GameState) => void
  setMode: (mode: InteractionMode) => void
  // Transition to card_targeted without clearing validTargets (so other valid cells stay highlighted).
  setCardTargeted: (cardInstanceId: string, targetCol: number, targetRow: number) => void
  setValidTargets: (targets: Position[]) => void
  addLog: (text: string) => void
  setLastCombatResult: (result: CombatResultPayload | null) => void
  setLastRejection: (rejection: ActionRejectedPayload | null) => void
  reset: () => void
}

let logCounter = 0

export const useGameStore = create<GameStore>((set, get) => ({
  gameId: null,
  myPlayerId: null,
  myPlayerIndex: null,
  gameState: null,
  mode: { type: 'idle' },
  validTargets: [],
  log: [],
  lastCombatResult: null,
  lastRejection: null,

  setIdentity: (gameId, playerId) => set({ gameId, myPlayerId: playerId }),

  setGameState: (state) => {
    const { myPlayerId } = get()
    let myPlayerIndex = get().myPlayerIndex
    if (myPlayerId && !myPlayerIndex) {
      if (state.players[0].id === myPlayerId) myPlayerIndex = 1
      else if (state.players[1].id === myPlayerId) myPlayerIndex = 2
    }
    set({ gameState: state, myPlayerIndex })
  },

  resolvePlayerIndex: (playerId, state) => {
    if (state.players[0].id === playerId) set({ myPlayerIndex: 1 })
    else if (state.players[1].id === playerId) set({ myPlayerIndex: 2 })
  },

  setMode: (mode) => set({ mode, validTargets: [] }),

  setCardTargeted: (cardInstanceId, targetCol, targetRow) =>
    set((s) => ({ mode: { type: 'card_targeted', cardInstanceId, targetCol, targetRow }, validTargets: s.validTargets })),

  setValidTargets: (targets) => set({ validTargets: targets }),

  addLog: (text) =>
    set((s) => ({
      log: [
        { id: ++logCounter, text, timestamp: Date.now() },
        ...s.log.slice(0, 49),
      ],
    })),

  setLastCombatResult: (result) => set({ lastCombatResult: result }),

  setLastRejection: (rejection) => set({ lastRejection: rejection }),

  reset: () =>
    set({
      gameId: null,
      myPlayerId: null,
      myPlayerIndex: null,
      gameState: null,
      mode: { type: 'idle' },
      validTargets: [],
      log: [],
      lastCombatResult: null,
      lastRejection: null,
    }),
}))
