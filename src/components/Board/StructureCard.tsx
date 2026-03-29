import type { Structure, CardDef } from '../../types/game'
import { CardFrame } from './CardFrame'

interface Props {
  structure: Structure
  def?: CardDef
  isEnemy: boolean
}

export function StructureCard({ structure, def, isEnemy }: Props) {
  if (structure.isDestroyed) {
    return (
      <div className="w-full h-full rounded-md border-2 border-gray-700 bg-gray-900/60 flex items-center justify-center opacity-40 select-none">
        <span className="text-[9px] text-gray-500 uppercase tracking-widest">Destroyed</span>
      </div>
    )
  }

  return (
    <CardFrame
      name={def?.name ?? structure.cardId}
      cardType="structure"
      hp={structure.hpCurrent}
      maxHp={structure.hpMax}
      isEnemy={isEnemy}
      showHpBar
      rulesText={def?.rules_text}
    />
  )
}
