import { useRef, useState } from 'react'
import { motion } from 'framer-motion'
import type { ConquerorInstance, CardDef, Keyword } from '../../types/game'
import { CardFrame } from './CardFrame'
import { CardTooltip } from '../Hand/CardTooltip'

interface Props {
  conqueror: ConquerorInstance
  def?: CardDef
  isSelected: boolean
  isValidTarget: boolean
  isMyUnit: boolean
  onClick: () => void
}

export function ConquerorCard({ conqueror, def, isSelected, isValidTarget, isMyUnit, onClick }: Props) {
  const [tooltipRect, setTooltipRect] = useState<DOMRect | null>(null)
  const wrapperRef = useRef<HTMLDivElement>(null)

  function handleMouseEnter() {
    if (wrapperRef.current) setTooltipRect(wrapperRef.current.getBoundingClientRect())
  }
  function handleMouseLeave() {
    setTooltipRect(null)
  }

  // Build a tooltip def that reflects current in-play stats rather than base values.
  const tooltipDef: CardDef | undefined = def
    ? {
        ...def,
        base_atk: conqueror.currentAtk,
        base_def: conqueror.currentDef,
        base_hp:  conqueror.currentHp,
        base_spd: conqueror.currentSpd,
        base_rng: conqueror.currentRng,
        keywords: conqueror.keywords as string[],
      }
    : undefined

  return (
    <>
      <motion.div
        ref={wrapperRef}
        layoutId={conqueror.instanceId}
        className="w-full h-full"
        initial={{ scale: 0, opacity: 0 }}
        animate={{
          scale: 1,
          opacity: 1,
          rotate: conqueror.isWeary ? 90 : 0,
        }}
        exit={{ scale: 0, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 25 }}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        <CardFrame
          name={def?.name ?? conqueror.cardId}
          cardType="conqueror"
          atk={conqueror.currentAtk}
          def={conqueror.currentDef}
          hp={conqueror.currentHp}
          maxHp={def?.base_hp ?? conqueror.currentHp}
          spd={conqueror.currentSpd}
          rng={conqueror.currentRng}
          keywords={conqueror.keywords as Keyword[]}
          isEnemy={!isMyUnit}
          isSelected={isSelected}
          isValidTarget={isValidTarget}
          isWeary={conqueror.isWeary}
          showHpBar
          onClick={onClick}
        />
      </motion.div>

      {tooltipRect && tooltipDef && (
        <CardTooltip def={tooltipDef} anchorRect={tooltipRect} />
      )}
    </>
  )
}
