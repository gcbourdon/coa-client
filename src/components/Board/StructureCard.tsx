import { useRef, useState } from 'react'
import type { Structure, CardDef } from '../../types/game'
import { CardFrame } from './CardFrame'
import { CardTooltip } from '../Hand/CardTooltip'

interface Props {
  structure: Structure
  def?: CardDef
  isEnemy: boolean
}

export function StructureCard({ structure, def, isEnemy }: Props) {
  const [tooltipRect, setTooltipRect] = useState<DOMRect | null>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)

  function handleMouseEnter() {
    if (wrapperRef.current) setTooltipRect(wrapperRef.current.getBoundingClientRect())
  }
  function handleMouseLeave() {
    setTooltipRect(null)
  }

  if (structure.isDestroyed) {
    return (
      <div className="w-full h-full rounded-md border-2 border-gray-700 bg-gray-900/60 flex items-center justify-center opacity-40 select-none">
        <span className="text-[9px] text-gray-500 uppercase tracking-widest">Destroyed</span>
      </div>
    )
  }

  // Build a tooltip def using current HP so the popup reflects damage taken.
  const tooltipDef: CardDef | undefined = def
    ? { ...def, base_hp: structure.hpCurrent }
    : undefined

  return (
    <>
      <div
        ref={wrapperRef}
        className="w-full h-full"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <CardFrame
          name={def?.name ?? structure.cardId}
          cardType="structure"
          hp={structure.hpCurrent}
          maxHp={structure.hpMax}
          isEnemy={isEnemy}
          showHpBar
          rulesText={def?.rules_text}
        />
      </div>

      {tooltipRect && tooltipDef && (
        <CardTooltip def={tooltipDef} anchorRect={tooltipRect} />
      )}
    </>
  )
}
