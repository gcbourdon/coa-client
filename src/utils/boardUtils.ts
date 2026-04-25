import type { ConquerorInstance, PlayerIndex } from '../types/game'

// Row layout (0 = bottom of board, 3 = top of board):
//   row 0 = Player1 base (deploy zone, bottom)
//   row 1 = Player1 structure row
//   row 2 = Player2 structure row
//   row 3 = Player2 base (deploy zone, top)

export function structureRow(player: PlayerIndex): number {
  return player === 1 ? 1 : 2
}

export function baseRow(player: PlayerIndex): number {
  return player === 1 ? 0 : 3
}

export function isStructureRow(row: number): boolean {
  return row === 1 || row === 2
}

export function getConquerorsOnBoard(
  grid: (ConquerorInstance | null)[][],
  owner?: PlayerIndex
): ConquerorInstance[] {
  const conquerors: ConquerorInstance[] = []
  for (let col = 0; col < 3; col++) {
    for (let row = 0; row < 4; row++) {
      const conqueror = grid[col]?.[row]
      if (conqueror && (owner === undefined || conqueror.owner === owner)) {
        conquerors.push(conqueror)
      }
    }
  }
  return conquerors
}

export function getUnitAt(
  grid: (ConquerorInstance | null)[][],
  col: number,
  row: number
): ConquerorInstance | null {
  return grid[col]?.[row] ?? null
}

// Returns the valid move destinations for a conqueror, given the current board state.
// Does not validate AP — just reachable empty cells within SPD range.
export function validMoveTargets(
  conqueror: ConquerorInstance,
  grid: (ConquerorInstance | null)[][],
  myPlayerIndex: PlayerIndex
): { col: number; row: number }[] {
  const remaining = conqueror.currentSpd - conqueror.movesUsed
  if (remaining <= 0) return []

  const targets: { col: number; row: number }[] = []
  const opponentBase = baseRow(myPlayerIndex === 1 ? 2 : 1)

  for (let dc = -remaining; dc <= remaining; dc++) {
    for (let dr = -remaining; dr <= remaining; dr++) {
      if (dc === 0 && dr === 0) continue
      if (Math.abs(dc) + Math.abs(dr) > remaining) continue
      const nc = conqueror.col + dc
      const nr = conqueror.row + dr
      if (nc < 0 || nc > 2 || nr < 0 || nr > 3) continue
      // Cannot move into opponent's base row
      if (nr === opponentBase) continue
      // Cannot move into a cell already occupied
      if (grid[nc]?.[nr] != null) continue
      targets.push({ col: nc, row: nr })
    }
  }
  return targets
}
