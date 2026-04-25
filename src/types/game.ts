// Mirrors coa-server Go structs. Keep in sync with game/state.go and shared/messages.go.

// --- Card catalog (from /api/v1/cards) ---

export type CardType = 'conqueror' | 'spell' | 'constant' | 'item' | 'structure'

export interface CardDef {
  id: string
  name: string
  type: CardType
  rarity: string
  ap_cost: number
  base_atk?: number
  base_def?: number
  base_hp?: number
  base_spd?: number
  base_rng?: number
  keywords?: string[]
  immediate?: boolean
  rules_text?: string
  flavor_text?: string
}

export type PlayerIndex = 0 | 1 | 2 // 0 = no winner / in progress, 1 = Player1, 2 = Player2
export type GameStatus = 'waiting' | 'in_progress' | 'finished'
export type Phase = 'ready' | 'main' | 'combat' | 'end'
export type Keyword = 'rush' | 'rend' | 'taunt' | 'intercept' | 'steadfast' | 'fury' | 'overwhelm'

export interface CardInstance {
  instanceId: string
  cardId: string
}

export interface PermanentInstance {
  instanceId: string
  cardId: string
  owner: PlayerIndex
  effectId: string
}

export interface Structure {
  cardId: string
  owner: PlayerIndex
  col: number
  hpMax: number
  hpCurrent: number
  isDestroyed: boolean
  effectId?: string
}

// Grid[col][row], null = empty cell. col 0–2, row 0–3.
// row 0 = Player2 structure row, row 3 = Player1 structure row
export type BoardGrid = ([ConquerorInstance | null][][])

export interface ConquerorInstance {
  instanceId: string
  cardId: string
  owner: PlayerIndex
  col: number
  row: number
  isWeary: boolean
  movesUsed: number
  currentAtk: number
  currentDef: number
  currentHp: number
  currentSpd: number
  currentRng: number
  keywords: Keyword[]
  effectId?: string
  steadfastUsed: boolean
}

export interface Board {
  // [col][row] — null means empty
  grid: (ConquerorInstance | null)[][]
}

export interface Player {
  id: string
  ap: number
  hand: CardInstance[]
  deck: CardInstance[]
  discard: CardInstance[]
  structures: Structure[] // length 3, index = col
  permanents: PermanentInstance[]
}

export type SequenceItemType = 'PLAY_CARD'

export interface SequenceItem {
  id: string
  owner: PlayerIndex
  cardId: string
  instanceId: string
  itemType: SequenceItemType
  targetCol: number
  targetRow: number
}

export interface GameState {
  gameId: string
  status: GameStatus
  players: Player[]  // index 0 = Player1, index 1 = Player2
  board: Board
  currentTurn: PlayerIndex
  firstPlayer: PlayerIndex  // who won the coin flip (set once at game start)
  turnNumber: number
  phase: Phase
  winner: PlayerIndex // 0 = in progress
  sequence: SequenceItem[]
  priorityPlayer: PlayerIndex // 0 = nobody (between turns)
  passCount: number
}

// --- WebSocket message types ---

export interface WsMessage<T = unknown> {
  type: string
  payload: T
}

// Client → Server
export interface JoinGamePayload {
  gameId: string
  playerId: string
}

export interface PlayCardPayload {
  cardId: string
  targetCol: number
  targetRow: number
}

export interface MoveConquerorPayload {
  conquerorId: string
  toCol: number
  toRow: number
}

export interface AttackDeclaration {
  conquerorId: string
  targetCol: number
  targetRow: number
}

export interface InitiateCombatPayload {
  attackers: AttackDeclaration[]
}

export interface DefenderAssignment {
  conquerorId: string
  defendsAgainst: string
}

export interface AssignDefendersPayload {
  defenders: DefenderAssignment[]
}

export interface UseAbilityPayload {
  conquerorId: string
  abilityId: string
  targetId: string | null
}

export interface PlaySpellPayload {
  cardId: string
  targets: string[]
}

// Server → Client
export interface ActionRejectedPayload {
  reason: string
  message: string
}

export interface OverflowResult {
  damage: number
  assignedTo: string
}

export interface CombatResultPayload {
  attackerId: string
  defenders: string[]
  outgoingDamage: number
  returnDamage: number
  destroyed: string[]
  overflow?: OverflowResult
}

export interface GameOverPayload {
  winner: number
  reason: string
}

export interface WaitingForDefendersPayload {
  attackers: AttackDeclaration[]
  timeoutMs: number
}

// --- Deck types (from /api/v1/decks) ---

export interface DeckSummary {
  id: string
  name: string
  archetype: string
  description: string
}

export interface DeckCardEntry {
  cardId: string
  qty: number
}

export interface DeckDef extends DeckSummary {
  structures: [string, string, string]
  cards: DeckCardEntry[]
}

// Create game REST
export interface CreateGameRequest {
  player1Id?: string
  player2Id?: string
  deckP1: string[]
  deckP2: string[]
  structuresP1: [string, string, string]
  structuresP2: [string, string, string]
}

export interface CreateGameResponse {
  gameId: string
  player1Id: string
  player2Id: string
}
