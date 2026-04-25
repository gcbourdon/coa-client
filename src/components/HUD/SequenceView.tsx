import type { SequenceItem, PlayerIndex, CardDef, Keyword } from '../../types/game'
import { useCardDefs } from '../../hooks/useCardDefs'
import { keywordLabel, keywordColor } from '../../utils/cardUtils'

export interface StagedPlay {
  cardId: string
  targetCol: number
  onConfirm: () => void
  onChangeTarget: () => void
  onCancel: () => void
}

interface Props {
  sequence: SequenceItem[]
  priorityPlayer: PlayerIndex
  myPlayerIndex: PlayerIndex
  stagedPlay: StagedPlay | null
  onPassPriority: () => void
}

const STAT_COLS = [
  { label: 'ATK', key: 'base_atk' as const, color: 'text-red-300' },
  { label: 'DEF', key: 'base_def' as const, color: 'text-blue-300' },
  { label: 'HP',  key: 'base_hp'  as const, color: 'text-green-300' },
  { label: 'SPD', key: 'base_spd' as const, color: 'text-yellow-300' },
  { label: 'RNG', key: 'base_rng' as const, color: 'text-cyan-300' },
]

function CardPreview({
  def,
  cardId,
  targetCol,
  ownerLabel,
  isOwn,
}: {
  def: CardDef | undefined
  cardId: string
  targetCol: number
  ownerLabel: string
  isOwn: boolean
}) {
  const borderColor = isOwn ? 'border-blue-700' : 'border-orange-700'
  const headerBg = isOwn ? 'bg-blue-950/60' : 'bg-orange-950/60'

  return (
    <div className={`rounded border ${borderColor} flex flex-col overflow-hidden text-[10px]`}>
      <div className={`${headerBg} px-2 py-1.5 flex items-start justify-between gap-1`}>
        <div className="flex flex-col gap-0.5 min-w-0">
          <span className="text-white font-bold leading-tight truncate">{def?.name ?? cardId}</span>
          <div className="flex items-center gap-1">
            <span className="text-gray-400 capitalize">{def?.type ?? 'card'}</span>
            <span className="text-gray-600">•</span>
            <span className="text-gray-500">{ownerLabel}</span>
          </div>
        </div>
        {def && def.ap_cost > 0 && (
          <div className="shrink-0 w-6 h-6 rounded-full bg-yellow-900/60 border border-yellow-700 flex flex-col items-center justify-center">
            <span className="text-yellow-300 font-bold text-[9px] leading-none">{def.ap_cost}</span>
          </div>
        )}
      </div>

      {def?.type === 'conqueror' && (
        <div className="bg-gray-800/50 border-t border-gray-700 px-2 py-1.5 grid grid-cols-5 gap-0.5">
          {STAT_COLS.map(({ label, key, color }) => (
            <div key={label} className="flex flex-col items-center">
              <span className={`font-bold leading-none ${color}`}>{def[key] ?? '—'}</span>
              <span className="text-[8px] text-gray-600 leading-none mt-0.5">{label}</span>
            </div>
          ))}
        </div>
      )}

      {def?.keywords && def.keywords.length > 0 && (
        <div className="border-t border-gray-700 px-2 py-1 flex flex-wrap gap-1">
          {(def.keywords as Keyword[]).map((kw) => (
            <span key={kw} className={`text-[9px] font-bold text-white px-1 py-0.5 rounded ${keywordColor(kw)}`}>
              {keywordLabel(kw)}
            </span>
          ))}
        </div>
      )}

      {def?.rules_text && (
        <div className="border-t border-gray-700 px-2 py-1.5">
          <p className="text-gray-300 leading-snug">{def.rules_text}</p>
        </div>
      )}

      <div className="border-t border-gray-700 px-2 py-1 flex items-center gap-1">
        <span className="text-gray-500">Target:</span>
        <span className="text-gray-300 font-semibold">
          {(['Left', 'Center', 'Right'])[targetCol] ?? `Col ${targetCol}`} col
        </span>
      </div>
    </div>
  )
}

export function SequenceView({ sequence, priorityPlayer, myPlayerIndex, stagedPlay, onPassPriority }: Props) {
  const sequenceCardIds = sequence.map((item) => item.cardId)
  const stagedIds = stagedPlay ? [stagedPlay.cardId] : []
  const defs = useCardDefs([...sequenceCardIds, ...stagedIds])

  const isMyPriority = priorityPlayer === myPlayerIndex
  const displayed = [...sequence].reverse()
  const iOwnTopItem = displayed[0]?.owner === myPlayerIndex

  // Staged (pre-commit) state — card targeted but not yet on the sequence.
  if (stagedPlay) {
    const def = defs.get(stagedPlay.cardId)
    return (
      <div className="bg-gray-900/80 border border-amber-800 rounded-lg p-3 flex flex-col gap-2">
        <span className="text-xs text-amber-400 uppercase tracking-wide font-semibold">Ready to Play</span>

        <CardPreview
          def={def}
          cardId={stagedPlay.cardId}
          targetCol={stagedPlay.targetCol}
          ownerLabel="You"
          isOwn
        />

        <button
          onClick={stagedPlay.onConfirm}
          className="w-full bg-green-700 hover:bg-green-600 text-white text-xs font-semibold rounded px-3 py-1.5 transition-colors"
        >
          Play
        </button>
        <div className="flex gap-1">
          <button
            onClick={stagedPlay.onChangeTarget}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs rounded px-2 py-1 transition-colors"
          >
            Change Target
          </button>
          <button
            onClick={stagedPlay.onCancel}
            className="flex-1 bg-gray-700 hover:bg-gray-600 text-gray-300 text-xs rounded px-2 py-1 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    )
  }

  // Empty state.
  if (sequence.length === 0) {
    return (
      <div className="bg-gray-900/40 border border-gray-800 rounded-lg p-3 flex flex-col gap-1">
        <span className="text-xs text-gray-600 uppercase tracking-wide font-semibold">Sequence</span>
        <span className="text-xs text-gray-700 text-center py-4">Empty</span>
      </div>
    )
  }

  // Committed sequence state.
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

      <CardPreview
        def={defs.get(displayed[0].cardId)}
        cardId={displayed[0].cardId}
        targetCol={displayed[0].targetCol}
        ownerLabel={iOwnTopItem ? 'You' : 'Opponent'}
        isOwn={iOwnTopItem}
      />

      {displayed.length > 1 && (
        <div className="flex flex-col gap-1">
          {displayed.slice(1).map((item) => {
            const def = defs.get(item.cardId)
            const isOwner = item.owner === myPlayerIndex
            return (
              <div
                key={item.id}
                className="flex items-center justify-between rounded px-2 py-1 text-xs bg-gray-800/60 border border-gray-700/50 opacity-70"
              >
                <span className={isOwner ? 'text-blue-300' : 'text-red-300'}>
                  {def?.name ?? item.cardId}
                </span>
                <span className="text-gray-500">{isOwner ? 'You' : 'Opp'}</span>
              </div>
            )
          })}
        </div>
      )}

      <button
        onClick={onPassPriority}
        disabled={!isMyPriority}
        className="w-full bg-amber-700 hover:bg-amber-600 disabled:bg-gray-700 disabled:text-gray-500 text-white text-xs font-semibold rounded px-3 py-1.5 transition-colors"
      >
        {iOwnTopItem ? 'Pass' : 'Resolve'}
      </button>
    </div>
  )
}
