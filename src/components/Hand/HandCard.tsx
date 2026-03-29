import { useState, useRef } from 'react'
import type { CardInstance, CardDef, Keyword } from '../../types/game'
import { CardFrame } from '../Board/CardFrame'
import { CardTooltip } from './CardTooltip'

interface Props {
  card: CardInstance
  def: CardDef | undefined
  isSelected: boolean
  onClick: () => void
}

export function HandCard({ card, def, isSelected, onClick }: Props) {
  const [tooltipRect, setTooltipRect] = useState<DOMRect | null>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)

  function handleMouseEnter() {
    if (wrapperRef.current) {
      setTooltipRect(wrapperRef.current.getBoundingClientRect())
    }
  }

  function handleMouseLeave() {
    setTooltipRect(null)
  }

  return (
    <>
      <div
        ref={wrapperRef}
        className={`transition-transform duration-150 select-none ${
          isSelected ? '-translate-y-3' : 'hover:-translate-y-1'
        }`}
        style={{ width: 72, height: 100 }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <CardFrame
          name={def?.name ?? card.cardId}
          cardType={def?.type}
          apCost={def?.ap_cost}
          atk={def?.base_atk}
          def={def?.base_def}
          hp={def?.base_hp}
          maxHp={def?.base_hp}
          spd={def?.base_spd}
          rng={def?.base_rng}
          keywords={def?.keywords as Keyword[] | undefined}
          rulesText={def?.rules_text}
          isEnemy={false}
          isSelected={isSelected}
          showApCost
          onClick={onClick}
        />
      </div>

      {tooltipRect && def && (
        <CardTooltip def={def} anchorRect={tooltipRect} />
      )}
    </>
  )
}
