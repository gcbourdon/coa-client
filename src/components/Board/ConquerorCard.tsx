import { motion } from 'framer-motion'
import type { ConquerorInstance, CardDef, Keyword } from '../../types/game'
import { CardFrame } from './CardFrame'

interface Props {
  conqueror: ConquerorInstance
  def?: CardDef
  isSelected: boolean
  isValidTarget: boolean
  isMyUnit: boolean
  onClick: () => void
}

export function ConquerorCard({ conqueror, def, isSelected, isValidTarget, isMyUnit, onClick }: Props) {
  return (
    <motion.div
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
  )
}
