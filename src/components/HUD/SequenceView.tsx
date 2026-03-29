import type { SequenceItem, PlayerIndex } from '../../types/game'
import { useCardDefs } from '../../hooks/useCardDefs'

interface Props {
  sequence: SequenceItem[]
  priorityPlayer: PlayerIndex
  myPlayerIndex: PlayerIndex
  onPassPriority: () => void
}

export function SequenceView({ sequence, priorityPlayer, myPlayerIndex, onPassPriority }: Props) {
  const cardIds = sequence.map((item) => item.cardId)
  const defs = useCardDefs(cardIds)

  const isMyPriority = priorityPlayer === myPlayerIndex

  if (sequence.length === 0) return null

  // Sequence is FILO — display with top-of-stack (last item) first.
  const displayed = [...sequence].reverse()

  // The player who put the top item on the sequence confirms it with "Play".
  // The responding player passes with "Resolve" (letting it resolve without a response).
  const iOwnTopItem = displayed[0]?.owner === myPlayerIndex
  const passLabel = iOwnTopItem ? 'Play' : 'Resolve'

  return (
    <div className="bg-gray-900/80 border border-gray-700 rounded-lg p-3 flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <span className="text-xs text-gray-400 uppercase tracking-wide font-semibold">
          Sequence ({sequence.length})
        </span>
        <span className={`text-xs font-semibold ${isMyPriority ? 'text-yellow-400' : 'text-gray-500'}`}>
          {isMyPriority ? 'Your priority' : "Opponent's priority"}
        </span>
      </div>

      <div className="flex flex-col gap-1">
        {displayed.map((item, i) => {
          const def = defs.get(item.cardId)
          const isTop = i === 0
          const isOwner = item.owner === myPlayerIndex
          return (
            <div
              key={item.id}
              className={`flex items-center justify-between rounded px-2 py-1 text-xs ${
                isTop
                  ? 'bg-gray-700 border border-gray-500'
                  : 'bg-gray-800/60 border border-gray-700/50 opacity-70'
              }`}
            >
              <span className={isOwner ? 'text-blue-300' : 'text-red-300'}>
                {def?.name ?? item.cardId}
              </span>
              <span className="text-gray-500">{isOwner ? 'You' : 'Opponent'}</span>
            </div>
          )
        })}
      </div>

      <button
        onClick={onPassPriority}
        disabled={!isMyPriority}
        className="mt-1 w-full bg-amber-700 hover:bg-amber-600 disabled:bg-gray-700 disabled:text-gray-500 text-white text-xs font-semibold rounded px-3 py-1.5 transition-colors"
      >
        {passLabel}
      </button>
    </div>
  )
}
