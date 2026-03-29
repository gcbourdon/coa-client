import type { GameState, ConquerorInstance, PlayerIndex } from '../../types/game'
import { Cell } from './Cell'
import { useGameStore } from '../../store/gameStore'
import { validMoveTargets, baseRow, structureRow } from '../../utils/boardUtils'
import { useCardDefs } from '../../hooks/useCardDefs'

const COLS = [0, 1, 2]
// Rendered top-to-bottom: P2 base (3) → P2 structs (2) → P1 structs (1) → P1 base (0)
const ROWS = [3, 2, 1, 0]

interface Props {
  gameState: GameState
  myPlayerIndex: PlayerIndex
  onPlayCard: (cardInstanceId: string, col: number, row: number) => void
  onMoveConqueror: (conquerorId: string, toCol: number, toRow: number) => void
  onDeclareAttack: (conquerorId: string, targetCol: number, targetRow: number) => void
}

export function Board({ gameState, myPlayerIndex, onPlayCard, onMoveConqueror, onDeclareAttack }: Props) {
  const mode = useGameStore((s) => s.mode)
  const setMode = useGameStore((s) => s.setMode)
  const setValidTargets = useGameStore((s) => s.setValidTargets)
  const isMyTurn = gameState.currentTurn === myPlayerIndex && gameState.phase === 'main'

  // Collect all unique card IDs visible on the board for bulk def lookup.
  const boardCardIds = (() => {
    const ids = new Set<string>()
    for (let col = 0; col < 3; col++) {
      for (let row = 0; row < 4; row++) {
        const conqueror = gameState.board.grid[col]?.[row]
        if (conqueror) ids.add(conqueror.cardId)
      }
    }
    for (const player of gameState.players) {
      for (const s of player.structures) ids.add(s.cardId)
    }
    return [...ids]
  })()
  const defMap = useCardDefs(boardCardIds)

  function handleConquerorClick(conqueror: ConquerorInstance) {
    if (!isMyTurn) return

    if (mode.type === 'card_selected') return // placing a card, ignore conqueror clicks

    if (conqueror.owner === myPlayerIndex) {
      if (mode.type === 'conqueror_selected' && mode.conquerorInstanceId === conqueror.instanceId) {
        // Deselect
        setMode({ type: 'idle' })
        return
      }
      // Select this conqueror — show move targets
      const targets = validMoveTargets(conqueror, gameState.board.grid, myPlayerIndex)
      setMode({ type: 'conqueror_selected', conquerorInstanceId: conqueror.instanceId })
      setValidTargets(targets)
    }
    // Clicking an enemy conqueror: if we have one selected, treat as attack target
    else if (mode.type === 'conqueror_selected') {
      onDeclareAttack(mode.conquerorInstanceId, conqueror.col, conqueror.row)
      setMode({ type: 'idle' })
    }
  }

  function handleCellClick(col: number, row: number) {
    if (!isMyTurn) return

    if (mode.type === 'card_selected') {
      // Place the card if valid deploy row
      const myBase = baseRow(myPlayerIndex)
      if (row === myBase && gameState.board.grid[col]?.[row] == null) {
        onPlayCard(mode.cardInstanceId, col, row)
        setMode({ type: 'idle' })
      }
      return
    }

    if (mode.type === 'conqueror_selected') {
      const targets = useGameStore.getState().validTargets
      const isTarget = targets.some((t) => t.col === col && t.row === row)
      if (isTarget) {
        onMoveConqueror(mode.conquerorInstanceId, col, row)
        setMode({ type: 'idle' })
        return
      }
      // Clicking an empty structure cell while having a conqueror selected — attack structure
      const enemyStructRow = structureRow(myPlayerIndex === 1 ? 2 : 1)
      if (row === enemyStructRow) {
        onDeclareAttack(mode.conquerorInstanceId, col, row)
        setMode({ type: 'idle' })
        return
      }
      setMode({ type: 'idle' })
    }
  }

  return (
    <div
      className="grid gap-1"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gridTemplateRows: 'repeat(4, 1fr)',
        width: '100%',
        aspectRatio: '3 / 4',
      }}
    >
      {ROWS.map((row) =>
        COLS.map((col) => {
          const conqueror = gameState.board.grid[col]?.[row] ?? null

          // Row 1 = Player1 structures, Row 2 = Player2 structures
          let structure = null
          if (row === 1) {
            structure = gameState.players[0].structures[col] ?? null
          } else if (row === 2) {
            structure = gameState.players[1].structures[col] ?? null
          }

          return (
            <Cell
              key={`${col}-${row}`}
              col={col}
              row={row}
              conqueror={conqueror}
              structure={structure}
              myPlayerIndex={myPlayerIndex}
              defMap={defMap}
              onCellClick={handleCellClick}
              onConquerorClick={handleConquerorClick}
            />
          )
        })
      )}
    </div>
  )
}
