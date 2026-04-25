import { AnimatePresence } from 'framer-motion'
import type { ConquerorInstance, Structure, PlayerIndex, CardDef, SequenceItem } from '../../types/game'
import { ConquerorCard } from './ConquerorCard'
import { StructureCard } from './StructureCard'
import { useGameStore } from '../../store/gameStore'

interface Props {
  col: number
  row: number
  conqueror: ConquerorInstance | null
  structure: Structure | null
  myPlayerIndex: PlayerIndex
  defMap: Map<string, CardDef>
  isChosenTarget: boolean
  sequenceTarget: SequenceItem | null
  onCellClick: (col: number, row: number) => void
  onConquerorClick: (conqueror: ConquerorInstance) => void
}

export function Cell({ col, row, conqueror, structure, myPlayerIndex, defMap, isChosenTarget, sequenceTarget, onCellClick, onConquerorClick }: Props) {
  const mode = useGameStore((s) => s.mode)
  const validTargets = useGameStore((s) => s.validTargets)

  const isValidTarget = validTargets.some((t) => t.col === col && t.row === row)
  const isSelectedConqueror =
    (mode.type === 'conqueror_selected' && conqueror?.instanceId === mode.conquerorInstanceId) ||
    (mode.type === 'declaring_attackers' && mode.attackers.some((a) => a.conquerorId === conqueror?.instanceId))

  const rowBg =
    row === 0 ? 'bg-red-950/30' :
    row === 3 ? 'bg-blue-950/30' :
    'bg-gray-900/40'

  const targetHighlight = isChosenTarget
    ? 'ring-2 ring-amber-400 ring-inset'
    : isValidTarget
      ? 'ring-2 ring-green-400 ring-inset'
      : ''

  // A cell can hold a structure and/or a conqueror simultaneously (structure rows).
  // Cards are displayed side-by-side when both are present.
  const cardCount = (structure && !structure.isDestroyed ? 1 : 0) + (conqueror ? 1 : 0)
  // Each card occupies a 5:7 ratio box. Height is 68% of cell; if two cards, 58%.
  const cardHeightPct = cardCount > 1 ? 58 : 68

  const isSequenceTargetMine = sequenceTarget?.owner === myPlayerIndex

  return (
    <div
      className={`relative flex items-center justify-center gap-1 p-1 rounded border border-gray-700/60 ${rowBg} ${targetHighlight} cursor-pointer overflow-hidden`}
      onClick={() => onCellClick(col, row)}
    >
      {/* Destroyed structure: subtle background indicator only */}
      {structure?.isDestroyed && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <span className="text-[9px] text-gray-700 uppercase tracking-widest rotate-[-30deg]">Destroyed</span>
        </div>
      )}

      {/* Live structure card */}
      {structure && !structure.isDestroyed && (
        <div
          style={{ height: `${cardHeightPct}%`, aspectRatio: '5/7' }}
          className="shrink-0"
        >
          <StructureCard
            structure={structure}
            def={defMap.get(structure.cardId)}
            isEnemy={structure.owner !== myPlayerIndex}
          />
        </div>
      )}

      {/* Conqueror card — stopPropagation prevents the cell click from also firing */}
      <AnimatePresence>
        {conqueror && (
          <div
            style={{ height: `${cardHeightPct}%`, aspectRatio: '5/7' }}
            className="shrink-0"
            onClick={(e) => { e.stopPropagation(); onConquerorClick(conqueror) }}
          >
            <ConquerorCard
              conqueror={conqueror}
              def={defMap.get(conqueror.cardId)}
              isSelected={isSelectedConqueror}
              isValidTarget={isValidTarget}
              isMyUnit={conqueror.owner === myPlayerIndex}
              onClick={() => {}}
            />
          </div>
        )}
      </AnimatePresence>

      {/* Sequence deploy target — pulsing arrow overlay showing a committed play */}
      {sequenceTarget && (
        <div className={`absolute inset-0 flex flex-col items-center justify-center pointer-events-none rounded ${
          isSequenceTargetMine
            ? 'bg-blue-500/15 ring-2 ring-blue-400/70 ring-inset'
            : 'bg-orange-500/15 ring-2 ring-orange-400/70 ring-inset'
        } animate-pulse`}>
          <span className={`text-lg leading-none ${isSequenceTargetMine ? 'text-blue-300' : 'text-orange-300'}`}>↓</span>
          <span className={`text-[8px] uppercase tracking-widest font-semibold ${isSequenceTargetMine ? 'text-blue-400' : 'text-orange-400'}`}>
            {isSequenceTargetMine ? 'Yours' : "Opp's"}
          </span>
        </div>
      )}
    </div>
  )
}
