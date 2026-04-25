import { useState, useEffect } from 'react'
import { useGameStore } from './store/gameStore'
import { useGameSocket } from './hooks/useGameSocket'
import { useGameActions } from './hooks/useGameActions'
import { useCardDefs } from './hooks/useCardDefs'
import { Board } from './components/Board/Board'
import { Hand } from './components/Hand/Hand'
import { APBar } from './components/HUD/APBar'
import { PhaseIndicator } from './components/HUD/PhaseIndicator'
import { ActionLog } from './components/HUD/ActionLog'
import { CombatOverlay } from './components/Combat/CombatOverlay'
import { CoinFlipOverlay } from './components/HUD/CoinFlipOverlay'
import { DeckPile } from './components/HUD/DeckPile'
import { SequenceView } from './components/HUD/SequenceView'
import type { CreateGameRequest, CreateGameResponse, DeckSummary, DeckDef, PlayerIndex } from './types/game'
import { baseRow } from './utils/boardUtils'

const ARCHETYPE_COLORS: Record<string, string> = {
  aggro:    'border-red-600 hover:border-red-400',
  tempo:    'border-yellow-600 hover:border-yellow-400',
  midrange: 'border-green-600 hover:border-green-400',
  control:  'border-blue-600 hover:border-blue-400',
}

const ARCHETYPE_SELECTED: Record<string, string> = {
  aggro:    'border-red-400 bg-red-950/40',
  tempo:    'border-yellow-400 bg-yellow-950/40',
  midrange: 'border-green-400 bg-green-950/40',
  control:  'border-blue-400 bg-blue-950/40',
}

export default function App() {
  const gameId = useGameStore((s) => s.gameId)
  const myPlayerId = useGameStore((s) => s.myPlayerId)
  const setIdentity = useGameStore((s) => s.setIdentity)

  if (!gameId || !myPlayerId) {
    return <LobbyScreen onJoin={setIdentity} />
  }

  return <GameScreen gameId={gameId} playerId={myPlayerId} />
}

// --- Lobby ---

interface LobbyProps {
  onJoin: (gameId: string, playerId: string) => void
}

function LobbyScreen({ onJoin }: LobbyProps) {
  const [decks, setDecks] = useState<DeckSummary[]>([])
  const [decksLoading, setDecksLoading] = useState(true)
  const [selectedDeckId, setSelectedDeckId] = useState<string | null>(null)
  const [selectedDeck, setSelectedDeck] = useState<DeckDef | null>(null)
  const [deckLoading, setDeckLoading] = useState(false)
  // placement[col] = index into selectedDeck.structures (0,1,2), or null
  const [placement, setPlacement] = useState<[number | null, number | null, number | null]>([null, null, null])
  const [joinGameId, setJoinGameId] = useState('')
  const [joinPlayerId, setJoinPlayerId] = useState('')
  const [creating, setCreating] = useState(false)
  const [createdGame, setCreatedGame] = useState<CreateGameResponse | null>(null)
  const [error, setError] = useState<string | null>(null)

  // Pre-fill join form from URL params (?gameId=xxx&playerId=yyy)
  useEffect(() => {
    const p = new URLSearchParams(window.location.search)
    const gid = p.get('gameId')
    const pid = p.get('playerId')
    if (gid) setJoinGameId(gid)
    if (pid) setJoinPlayerId(pid)
  }, [])

  // Load deck list on mount
  useEffect(() => {
    fetch('/api/v1/decks/')
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load decks: ${res.status}`)
        return res.json() as Promise<{ decks: DeckSummary[] }>
      })
      .then(({ decks }) => {
        setDecks(decks)
        if (decks.length > 0) setSelectedDeckId(decks[0].id)
      })
      .catch((e) => setError(String(e)))
      .finally(() => setDecksLoading(false))
  }, [])

  // Load full deck when selection changes
  useEffect(() => {
    if (!selectedDeckId) return
    setDeckLoading(true)
    setSelectedDeck(null)
    setPlacement([null, null, null])
    fetch(`/api/v1/decks/${selectedDeckId}`)
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load deck: ${res.status}`)
        return res.json() as Promise<DeckDef>
      })
      .then((deck) => {
        setSelectedDeck(deck)
        // Default placement: structure 0→col0, 1→col1, 2→col2
        setPlacement([0, 1, 2])
      })
      .catch((e) => setError(String(e)))
      .finally(() => setDeckLoading(false))
  }, [selectedDeckId])

  const placementComplete =
    selectedDeck !== null &&
    placement[0] !== null &&
    placement[1] !== null &&
    placement[2] !== null &&
    new Set(placement).size === 3

  function buildStructureOrder(): [string, string, string] {
    const s = selectedDeck!.structures
    return [s[placement[0]!], s[placement[1]!], s[placement[2]!]]
  }

  function expandDeck(deck: DeckDef): string[] {
    const ids: string[] = []
    for (const entry of deck.cards) {
      for (let i = 0; i < entry.qty; i++) ids.push(entry.cardId)
    }
    return ids
  }

  async function handleCreateGame() {
    if (!selectedDeck || !placementComplete) return
    setCreating(true)
    setError(null)
    try {
      const structures = buildStructureOrder()
      const req: CreateGameRequest = {
        deckP1: expandDeck(selectedDeck),
        deckP2: expandDeck(selectedDeck),
        structuresP1: structures,
        structuresP2: structures,
      }
      const res = await fetch('/api/v1/games', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(req),
      })
      if (!res.ok) {
        const text = await res.text()
        setError(`Server error: ${text}`)
        return
      }
      const data: CreateGameResponse = await res.json()
      setCreatedGame(data)
    } catch (e) {
      setError(String(e))
    } finally {
      setCreating(false)
    }
  }

  function handleJoin() {
    if (joinGameId.trim() && joinPlayerId.trim()) {
      onJoin(joinGameId.trim(), joinPlayerId.trim())
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="w-full max-w-lg flex flex-col gap-6">
        <h1 className="text-3xl font-bold text-center text-white">Conquerors of Aether</h1>

        {error && (
          <div className="bg-red-900/50 border border-red-600 rounded p-3 text-red-300 text-sm">
            {error}
          </div>
        )}

        {/* Create game */}
        <div className="bg-gray-800 rounded-lg p-4 flex flex-col gap-4">
          <h2 className="text-lg font-semibold text-white">Create New Game</h2>

          {/* Deck selector */}
          <div className="flex flex-col gap-2">
            <span className="text-xs text-gray-400 uppercase tracking-wide">Choose your starter deck</span>
            {decksLoading ? (
              <div className="text-sm text-gray-500">Loading decks…</div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                {decks.map((deck) => {
                  const isSelected = deck.id === selectedDeckId
                  return (
                    <button
                      key={deck.id}
                      onClick={() => setSelectedDeckId(deck.id)}
                      className={`rounded border-2 p-3 text-left transition-colors ${
                        isSelected
                          ? (ARCHETYPE_SELECTED[deck.archetype] ?? 'border-white bg-gray-700')
                          : `border-gray-600 bg-gray-700/40 ${ARCHETYPE_COLORS[deck.archetype] ?? ''}`
                      }`}
                    >
                      <div className="text-sm font-semibold text-white">{deck.name}</div>
                      <div className="text-xs text-gray-400 capitalize">{deck.archetype}</div>
                    </button>
                  )
                })}
              </div>
            )}
            {selectedDeck && (
              <p className="text-xs text-gray-500">{selectedDeck.description}</p>
            )}
          </div>

          {/* Structure placement */}
          {deckLoading && (
            <div className="text-xs text-gray-500">Loading deck details…</div>
          )}
          {selectedDeck && !deckLoading && (
            <StructurePlacementPicker
              structureIds={selectedDeck.structures}
              placement={placement}
              onChange={setPlacement}
            />
          )}

          <button
            onClick={handleCreateGame}
            disabled={creating || !placementComplete}
            className="bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 text-white font-semibold rounded px-4 py-2 transition-colors"
          >
            {creating ? 'Creating…' : 'Create Game'}
          </button>
        </div>

        {/* Game created — show IDs to share */}
        {createdGame && (
          <GameCreatedPanel
            game={createdGame}
            onJoinAsP1={() => onJoin(createdGame.gameId, createdGame.player1Id)}
          />
        )}

        {/* Join existing game */}
        <div className="bg-gray-800 rounded-lg p-4 flex flex-col gap-3">
          <h2 className="text-lg font-semibold text-white">Join Existing Game</h2>
          <input
            className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-blue-400"
            placeholder="Game ID"
            value={joinGameId}
            onChange={(e) => setJoinGameId(e.target.value)}
          />
          <input
            className="bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm placeholder-gray-500 focus:outline-none focus:border-blue-400"
            placeholder="Player ID"
            value={joinPlayerId}
            onChange={(e) => setJoinPlayerId(e.target.value)}
          />
          <button
            onClick={handleJoin}
            disabled={!joinGameId.trim() || !joinPlayerId.trim()}
            className="bg-green-600 hover:bg-green-500 disabled:bg-gray-600 text-white font-semibold rounded px-4 py-2 transition-colors"
          >
            Join Game
          </button>
        </div>
      </div>
    </div>
  )
}

// --- Game Created Panel ---

interface GameCreatedPanelProps {
  game: CreateGameResponse
  onJoinAsP1: () => void
}

function GameCreatedPanel({ game, onJoinAsP1 }: GameCreatedPanelProps) {
  const [copied, setCopied] = useState<string | null>(null)

  function copy(label: string, value: string) {
    navigator.clipboard.writeText(value).catch(() => {/* ignore */})
    setCopied(label)
    setTimeout(() => setCopied(null), 1500)
  }

  const p2Url = `${window.location.origin}${window.location.pathname}?gameId=${game.gameId}&playerId=${game.player2Id}`

  return (
    <div className="bg-green-950/40 border border-green-700 rounded-lg p-4 flex flex-col gap-3">
      <h2 className="text-base font-semibold text-green-300">Game Created</h2>

      <IdRow label="Game ID" value={game.gameId} copied={copied} onCopy={copy} />
      <IdRow label="Player 1 ID" value={game.player1Id} copied={copied} onCopy={copy} />
      <IdRow label="Player 2 ID" value={game.player2Id} copied={copied} onCopy={copy} />

      <div className="flex gap-2 pt-1">
        <button
          onClick={onJoinAsP1}
          className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-semibold rounded px-3 py-2 transition-colors"
        >
          Join as Player 1
        </button>
        <button
          onClick={() => copy('P2 Link', p2Url)}
          className="flex-1 bg-gray-700 hover:bg-gray-600 text-white text-sm font-semibold rounded px-3 py-2 transition-colors"
        >
          {copied === 'P2 Link' ? 'Copied!' : 'Copy P2 Join Link'}
        </button>
      </div>
      <p className="text-xs text-gray-500">Open the P2 join link in another browser tab to play as both players.</p>
    </div>
  )
}

interface IdRowProps {
  label: string
  value: string
  copied: string | null
  onCopy: (label: string, value: string) => void
}

function IdRow({ label, value, copied, onCopy }: IdRowProps) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-400 w-24 shrink-0">{label}</span>
      <code className="flex-1 bg-gray-900 rounded px-2 py-1 text-xs text-gray-200 truncate">{value}</code>
      <button
        onClick={() => onCopy(label, value)}
        className="text-xs text-gray-400 hover:text-white bg-gray-700 hover:bg-gray-600 rounded px-2 py-1 shrink-0 transition-colors"
      >
        {copied === label ? 'Copied!' : 'Copy'}
      </button>
    </div>
  )
}

// --- Structure Placement Picker ---

interface StructurePlacementPickerProps {
  structureIds: [string, string, string]
  placement: [number | null, number | null, number | null]
  onChange: (p: [number | null, number | null, number | null]) => void
}

function StructurePlacementPicker({ structureIds, placement, onChange }: StructurePlacementPickerProps) {
  const cardDefs = useCardDefs(structureIds)

  function assign(col: 0 | 1 | 2, structureIdx: number) {
    const next: [number | null, number | null, number | null] = [...placement] as [number | null, number | null, number | null]
    // Clear any column that already holds this structure
    for (let c = 0; c < 3; c++) {
      if (next[c] === structureIdx) next[c] = null
    }
    next[col] = structureIdx
    onChange(next)
  }

  const COLS = ['Left', 'Center', 'Right'] as const

  return (
    <div className="flex flex-col gap-2">
      <span className="text-xs text-gray-400 uppercase tracking-wide">Place your structures</span>

      {/* Structure cards */}
      <div className="grid grid-cols-3 gap-2">
        {structureIds.map((id, idx) => {
          const def = cardDefs.get(id)
          const assignedCol = placement.indexOf(idx)
          return (
            <div
              key={id}
              className={`rounded border p-2 text-xs text-center ${
                assignedCol !== -1 ? 'border-indigo-400 bg-indigo-950/40' : 'border-gray-600 bg-gray-700/40'
              }`}
            >
              <div className="font-semibold text-white truncate">{def?.name ?? id}</div>
              {def?.base_hp !== undefined && (
                <div className="text-gray-400">{def.base_hp} HP</div>
              )}
              {assignedCol !== -1 && (
                <div className="text-indigo-300 mt-1">{COLS[assignedCol]}</div>
              )}
            </div>
          )
        })}
      </div>

      {/* Column assignment buttons */}
      <div className="grid grid-cols-3 gap-2">
        {([0, 1, 2] as const).map((col) => (
          <div key={col} className="flex flex-col gap-1">
            <span className="text-xs text-gray-500 text-center">{COLS[col]}</span>
            {structureIds.map((id, idx) => {
              const def = cardDefs.get(id)
              const isSelected = placement[col] === idx
              return (
                <button
                  key={id}
                  onClick={() => assign(col, idx)}
                  className={`rounded border px-2 py-1 text-xs transition-colors text-left truncate ${
                    isSelected
                      ? 'border-indigo-400 bg-indigo-700/60 text-white'
                      : 'border-gray-600 bg-gray-700/40 text-gray-300 hover:border-gray-400'
                  }`}
                >
                  {def?.name ?? id}
                </button>
              )
            })}
          </div>
        ))}
      </div>
    </div>
  )
}

// --- Play confirmation bar ---

function PlayConfirmBar({ cardId, targetCol, onConfirm, onBack, onCancel }: {
  cardId: string | undefined
  targetCol: number
  onConfirm: () => void
  onBack: () => void
  onCancel: () => void
}) {
  const colLabel = (['Left', 'Center', 'Right'])[targetCol] ?? `Col ${targetCol}`
  const defs = useCardDefs(cardId ? [cardId] : [])
  const name = cardId ? (defs.get(cardId)?.name ?? cardId) : '—'

  return (
    <div className="flex items-center gap-3 bg-amber-950/50 border border-amber-700 rounded-lg px-3 py-2">
      <span className="text-xs text-amber-300 font-semibold truncate flex-1">
        Deploy <span className="text-white">{name}</span> → {colLabel} column
      </span>
      <button
        onClick={onCancel}
        className="text-xs text-gray-400 hover:text-white bg-gray-700 hover:bg-gray-600 rounded px-2 py-1 transition-colors shrink-0"
      >
        Cancel
      </button>
      <button
        onClick={onBack}
        className="text-xs text-gray-300 hover:text-white bg-gray-700 hover:bg-gray-600 rounded px-2 py-1 transition-colors shrink-0"
      >
        Change Target
      </button>
      <button
        onClick={onConfirm}
        className="text-xs text-white font-semibold bg-green-700 hover:bg-green-600 rounded px-3 py-1 transition-colors shrink-0"
      >
        Play
      </button>
    </div>
  )
}

// --- Rejection toast ---

function RejectionToast({ message, onDismiss }: { message: string; onDismiss: () => void }) {
  useEffect(() => {
    const id = setTimeout(onDismiss, 2000)
    return () => clearTimeout(id)
  }, [message, onDismiss])

  return (
    <div
      key={message}
      className="fixed top-4 left-1/2 -translate-x-1/2 bg-red-900/90 border border-red-600 rounded-lg px-4 py-2 text-red-200 text-sm z-50 cursor-pointer shadow-xl animate-[fadeOut_2s_ease-in_forwards]"
      onClick={onDismiss}
    >
      {message}
    </div>
  )
}

// --- Game screen ---

interface GameScreenProps {
  gameId: string
  playerId: string
}

function GameScreen({ gameId, playerId }: GameScreenProps) {
  const gameState = useGameStore((s) => s.gameState)
  const myPlayerIndex = useGameStore((s) => s.myPlayerIndex)
  const lastRejection = useGameStore((s) => s.lastRejection)
  const setLastRejection = useGameStore((s) => s.setLastRejection)
  const mode = useGameStore((s) => s.mode)
  const setMode = useGameStore((s) => s.setMode)
  const setValidTargets = useGameStore((s) => s.setValidTargets)
  const [coinFlipDone, setCoinFlipDone] = useState(false)

  const { sendAction } = useGameSocket(gameId, playerId)
  const actions = useGameActions(sendAction)

  if (!gameState || !myPlayerIndex) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        Connecting…
      </div>
    )
  }

  if (gameState.status === 'waiting') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-gray-400">
          <div className="text-lg">Waiting for opponent to connect…</div>
          <div className="text-xs text-gray-600">Game ID: {gameState.gameId}</div>
        </div>
      </div>
    )
  }

  const showCoinFlip = !coinFlipDone && gameState.firstPlayer !== 0

  const isMyTurn = gameState.currentTurn === myPlayerIndex && gameState.phase === 'main'
  const myPlayer = gameState.players[myPlayerIndex - 1]
  const opponentIndex = myPlayerIndex === 1 ? 2 : 1
  const opponentPlayer = gameState.players[opponentIndex - 1]

  function handlePlayCard(cardInstanceId: string, col: number, row: number) {
    actions.playCard({ cardId: cardInstanceId, targetCol: col, targetRow: row })
  }

  function handleMoveConqueror(conquerorId: string, toCol: number, toRow: number) {
    actions.moveConqueror({ conquerorId, toCol, toRow })
  }

  function handleDeclareAttack(conquerorId: string, targetCol: number, targetRow: number) {
    actions.initiateCombat({ attackers: [{ conquerorId, targetCol, targetRow }] })
    setMode({ type: 'idle' })
  }

  if (gameState.winner !== 0) {
    const iWon = gameState.winner === myPlayerIndex
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className={`text-4xl font-bold ${iWon ? 'text-yellow-400' : 'text-red-400'}`}>
          {iWon ? 'Victory!' : 'Defeat'}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col p-3 gap-3 max-w-3xl mx-auto">
      {showCoinFlip && (
        <CoinFlipOverlay
          firstPlayer={gameState.firstPlayer}
          myPlayerIndex={myPlayerIndex}
          onDone={() => setCoinFlipDone(true)}
        />
      )}

      {lastRejection && (
        <RejectionToast
          message={lastRejection.message}
          onDismiss={() => setLastRejection(null)}
        />
      )}

      {/* Opponent */}
      <div className="flex items-center justify-between bg-gray-800/60 rounded-lg px-3 py-2">
        <span className="text-sm text-gray-400">Opponent (P{opponentIndex})</span>
        <APBar ap={opponentPlayer.ap} isMyTurn={!isMyTurn} />
        <span className="text-xs text-gray-500">{opponentPlayer.hand.length} cards in hand</span>
      </div>

      {/* Board + Sequence sidebar — sidebar always reserves space to prevent layout shift */}
      <div className="flex gap-3 items-center">
        <div className="flex-1 min-w-0">
          <Board
            gameState={gameState}
            myPlayerIndex={myPlayerIndex}
            onPlayCard={handlePlayCard}
            onMoveConqueror={handleMoveConqueror}
            onDeclareAttack={handleDeclareAttack}
          />
        </div>
        <div className="w-44 shrink-0 self-center">
          <SequenceView
            sequence={gameState.sequence ?? []}
            priorityPlayer={gameState.priorityPlayer}
            myPlayerIndex={myPlayerIndex}
            stagedPlay={null}
            onPassPriority={actions.passPriority}
          />
        </div>
      </div>

      {/* My controls */}
      <div className="flex flex-wrap items-center gap-3 bg-gray-800/60 rounded-lg px-3 py-2">
        <span className="text-sm text-gray-400">You (P{myPlayerIndex})</span>
        <APBar ap={myPlayer.ap} isMyTurn={isMyTurn} />
        <PhaseIndicator
          phase={gameState.phase}
          currentTurn={gameState.currentTurn}
          myPlayerIndex={myPlayerIndex}
          turnNumber={gameState.turnNumber}
        />
        <div className="ml-auto flex items-center gap-3">
          <DeckPile count={myPlayer.deck.length} />
          <button
            onClick={actions.endTurn}
            disabled={!isMyTurn}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-gray-700 disabled:text-gray-500 text-white text-sm font-semibold rounded px-3 py-1 transition-colors"
          >
            End Turn
          </button>
        </div>
      </div>

      {/* Play confirmation bar — shown when a deploy target has been staged */}
      {mode.type === 'card_targeted' && (
        <PlayConfirmBar
          cardId={myPlayer.hand.find((c) => c.instanceId === mode.cardInstanceId)?.cardId}
          targetCol={mode.targetCol}
          onConfirm={() => {
            // Active player retains priority after playing — they must explicitly pass
            // via the sequence view to give the opponent a chance to respond.
            handlePlayCard(mode.cardInstanceId, mode.targetCol, mode.targetRow)
            setMode({ type: 'idle' })
          }}
          onBack={() => {
            const row = baseRow(myPlayerIndex)
            const targets = [0, 1, 2]
              .filter((col) => gameState.board.grid[col]?.[row] == null)
              .map((col) => ({ col, row }))
            setMode({ type: 'card_selected', cardInstanceId: mode.cardInstanceId })
            setValidTargets(targets)
          }}
          onCancel={() => setMode({ type: 'idle' })}
        />
      )}

      {/* Hand */}
      <div className="bg-gray-800/40 rounded-lg p-3">
        <Hand cards={myPlayer.hand} myPlayerIndex={myPlayerIndex} myAP={myPlayer.ap} isMyTurn={isMyTurn} boardGrid={gameState.board.grid} />
      </div>

      {/* Log */}
      <div className="bg-gray-900/60 rounded-lg p-3">
        <div className="text-xs text-gray-500 mb-1 font-semibold uppercase tracking-wide">Log</div>
        <ActionLog />
      </div>

      <CombatOverlay />
    </div>
  )
}
