import type { CardInstance, PlayerIndex, ConquerorInstance } from '../../types/game'
import { HandCard } from './HandCard'
import { useGameStore } from '../../store/gameStore'
import { baseRow } from '../../utils/boardUtils'
import { useCardDefs } from '../../hooks/useCardDefs'

interface Props {
  cards: CardInstance[]
  myPlayerIndex: PlayerIndex
  myAP: number
  isMyTurn: boolean
  boardGrid: (ConquerorInstance | null)[][]
}

export function Hand({ cards, myPlayerIndex, myAP, isMyTurn, boardGrid }: Props) {
  const mode = useGameStore((s) => s.mode)
  const setMode = useGameStore((s) => s.setMode)
  const setValidTargets = useGameStore((s) => s.setValidTargets)
  const setLastRejection = useGameStore((s) => s.setLastRejection)
  const cardIds = cards.map((c) => c.cardId)
  const defs = useCardDefs(cardIds)

  function openCardSelection(cardInstanceId: string) {
    const row = baseRow(myPlayerIndex)
    const targets = [0, 1, 2]
      .filter((col) => boardGrid[col]?.[row] == null)
      .map((col) => ({ col, row }))
    setMode({ type: 'card_selected', cardInstanceId })
    setValidTargets(targets)
  }

  function handleCardClick(card: CardInstance) {
    if (!isMyTurn) return

    // Clicking the staged card while a deploy target is chosen → back to step 1.
    if (mode.type === 'card_targeted' && mode.cardInstanceId === card.instanceId) {
      openCardSelection(card.instanceId)
      return
    }

    if (mode.type === 'card_selected' && mode.cardInstanceId === card.instanceId) {
      setMode({ type: 'idle' })
      return
    }

    const def = defs.get(card.cardId)
    if (def !== undefined && def.ap_cost > myAP) {
      setLastRejection({ reason: 'INSUFFICIENT_AP', message: `Not enough AP to play this card (costs ${def.ap_cost}, have ${myAP}).` })
      return
    }
    openCardSelection(card.instanceId)
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
          isSelected={
            (mode.type === 'card_selected' || mode.type === 'card_targeted') &&
            mode.cardInstanceId === card.instanceId
          }
          onClick={() => handleCardClick(card)}
        />
      ))}
    </div>
  )
}
