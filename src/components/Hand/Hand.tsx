import type { CardInstance, PlayerIndex } from '../../types/game'
import { HandCard } from './HandCard'
import { useGameStore } from '../../store/gameStore'
import { baseRow } from '../../utils/boardUtils'
import { useCardDefs } from '../../hooks/useCardDefs'

interface Props {
  cards: CardInstance[]
  myPlayerIndex: PlayerIndex
  isMyTurn: boolean
}

export function Hand({ cards, myPlayerIndex, isMyTurn }: Props) {
  const mode = useGameStore((s) => s.mode)
  const setMode = useGameStore((s) => s.setMode)
  const setValidTargets = useGameStore((s) => s.setValidTargets)
  const cardIds = cards.map((c) => c.cardId)
  const defs = useCardDefs(cardIds)

  function handleCardClick(card: CardInstance) {
    if (!isMyTurn) return
    if (mode.type === 'card_selected' && mode.cardInstanceId === card.instanceId) {
      setMode({ type: 'idle' })
      return
    }
    // Highlight deploy row cells
    const row = baseRow(myPlayerIndex)
    const targets = [0, 1, 2].map((col) => ({ col, row }))
    setMode({ type: 'card_selected', cardInstanceId: card.instanceId })
    setValidTargets(targets)
  }

  if (cards.length === 0) {
    return (
      <div className="text-gray-500 text-sm text-center py-2">Hand is empty</div>
    )
  }

  return (
    <div className="flex gap-2 flex-wrap justify-center">
      {cards.map((card) => (
        <HandCard
          key={card.instanceId}
          card={card}
          def={defs.get(card.cardId)}
          isSelected={mode.type === 'card_selected' && mode.cardInstanceId === card.instanceId}
          onClick={() => handleCardClick(card)}
        />
      ))}
    </div>
  )
}
