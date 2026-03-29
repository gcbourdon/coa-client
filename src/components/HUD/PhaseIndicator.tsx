import type { Phase, PlayerIndex } from '../../types/game'

interface Props {
  phase: Phase
  currentTurn: PlayerIndex
  myPlayerIndex: PlayerIndex
  turnNumber: number
}

const PHASE_LABELS: Record<Phase, string> = {
  ready: 'Ready',
  main: 'Main',
  end: 'End',
}

export function PhaseIndicator({ phase, currentTurn, myPlayerIndex, turnNumber }: Props) {
  const isMyTurn = currentTurn === myPlayerIndex

  return (
    <div className="flex items-center gap-3 text-sm">
      <span className="text-gray-400">Turn {turnNumber}</span>
      <span
        className={`px-2 py-0.5 rounded font-semibold text-xs ${
          isMyTurn ? 'bg-green-700 text-green-100' : 'bg-gray-700 text-gray-300'
        }`}
      >
        {isMyTurn ? 'Your Turn' : `P${currentTurn}'s Turn`}
      </span>
      <span className="text-gray-400 text-xs">{PHASE_LABELS[phase]}</span>
    </div>
  )
}
