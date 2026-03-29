import type { CardType, Keyword } from '../../types/game'
import { keywordLabel, keywordColor } from '../../utils/cardUtils'

export interface CardFrameProps {
  name: string
  cardType?: CardType
  apCost?: number
  // Conqueror stats
  atk?: number
  def?: number
  hp?: number
  maxHp?: number
  spd?: number
  rng?: number
  keywords?: Keyword[]
  rulesText?: string
  // State
  isEnemy?: boolean
  isSelected?: boolean
  isValidTarget?: boolean
  isWeary?: boolean
  // Mode
  showHpBar?: boolean   // true on board
  showApCost?: boolean  // true in hand
  onClick?: () => void
}

interface ColorScheme {
  border: string
  headerBg: string
  artBg: string
  statsBg: string
  nameText: string
}

function colorScheme(cardType: CardType | undefined, isEnemy?: boolean): ColorScheme {
  if (cardType === 'conqueror') {
    return isEnemy
      ? { border: 'border-red-500',    headerBg: 'bg-red-950',     artBg: 'bg-gradient-to-br from-red-900 to-red-950',     statsBg: 'bg-red-950/80',    nameText: 'text-red-100'   }
      : { border: 'border-blue-500',   headerBg: 'bg-blue-950',    artBg: 'bg-gradient-to-br from-blue-900 to-blue-950',   statsBg: 'bg-blue-950/80',   nameText: 'text-blue-100'  }
  }
  if (cardType === 'spell')    return { border: 'border-emerald-600', headerBg: 'bg-emerald-950', artBg: 'bg-gradient-to-br from-emerald-900 to-emerald-950', statsBg: 'bg-emerald-950/80', nameText: 'text-emerald-100' }
  if (cardType === 'constant') return { border: 'border-purple-600',  headerBg: 'bg-purple-950',  artBg: 'bg-gradient-to-br from-purple-900 to-purple-950',  statsBg: 'bg-purple-950/80',  nameText: 'text-purple-100'  }
  if (cardType === 'item')     return { border: 'border-amber-600',   headerBg: 'bg-amber-950',   artBg: 'bg-gradient-to-br from-amber-900 to-amber-950',   statsBg: 'bg-amber-950/80',   nameText: 'text-amber-100'   }
  if (cardType === 'structure') {
    return isEnemy
      ? { border: 'border-red-700',  headerBg: 'bg-red-950',   artBg: 'bg-gradient-to-br from-red-900/50 to-gray-950',   statsBg: 'bg-red-950/70',  nameText: 'text-red-200'  }
      : { border: 'border-blue-700', headerBg: 'bg-blue-950',  artBg: 'bg-gradient-to-br from-blue-900/50 to-gray-950',  statsBg: 'bg-blue-950/70', nameText: 'text-blue-200' }
  }
  return { border: 'border-gray-600', headerBg: 'bg-gray-800', artBg: 'bg-gradient-to-br from-gray-700 to-gray-900', statsBg: 'bg-gray-800/80', nameText: 'text-gray-100' }
}

const TYPE_LABEL: Partial<Record<CardType, string>> = {
  conqueror: 'Conqueror',
  spell:     'Spell',
  constant:  'Const',
  item:      'Item',
  structure: 'Struct',
}

export function CardFrame({
  name, cardType, apCost, atk, def, hp, maxHp, spd, rng, keywords, rulesText,
  isEnemy, isSelected, isValidTarget, isWeary,
  showHpBar, showApCost,
  onClick,
}: CardFrameProps) {
  const c = colorScheme(cardType, isEnemy)
  const isConqueror = cardType === 'conqueror'
  const hpPct = (hp != null && maxHp != null && maxHp > 0) ? hp / maxHp : 1

  const selectionRing = isSelected
    ? 'ring-2 ring-yellow-400 ring-offset-1 ring-offset-black shadow-yellow-400/50 shadow-lg'
    : isValidTarget
      ? 'ring-2 ring-green-400 ring-offset-1 ring-offset-black shadow-green-400/40 shadow-md'
      : ''

  return (
    <div
      className={`relative w-full h-full rounded-md border-2 ${c.border} ${selectionRing} flex flex-col overflow-hidden cursor-pointer select-none`}
      style={{ backgroundColor: '#0a0f1a' }}
      onClick={onClick}
    >
      {/* Header: type + cost */}
      <div className={`${c.headerBg} flex items-center justify-between px-1 py-[2px] shrink-0`}>
        <span className="text-[8px] text-gray-400 uppercase tracking-wider leading-none">
          {TYPE_LABEL[cardType ?? 'conqueror'] ?? cardType ?? ''}
        </span>
        {showApCost && apCost !== undefined && (
          <span className="text-[9px] font-bold text-yellow-400 leading-none">{apCost}AP</span>
        )}
        {isWeary && (
          <span className="text-[8px] font-semibold text-orange-400 leading-none">ZZZ</span>
        )}
      </div>

      {/* Card name */}
      <div className={`${c.headerBg} px-1 pb-[2px] shrink-0`}>
        <div className={`text-[9px] font-bold leading-tight ${c.nameText} truncate`}>{name}</div>
      </div>

      {/* Art area — fills remaining space */}
      <div className={`${c.artBg} flex-1 min-h-0 flex items-center justify-center`}>
        {isConqueror && atk !== undefined && (
          <div className="flex gap-1.5 px-1">
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-bold text-red-300 leading-none">{atk}</span>
              <span className="text-[7px] text-red-500 leading-none">ATK</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-bold text-blue-300 leading-none">{def}</span>
              <span className="text-[7px] text-blue-500 leading-none">DEF</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-bold text-green-300 leading-none">{hp}</span>
              <span className="text-[7px] text-green-500 leading-none">HP</span>
            </div>
            {spd !== undefined && spd > 1 && (
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-bold text-yellow-300 leading-none">{spd}</span>
                <span className="text-[7px] text-yellow-500 leading-none">SPD</span>
              </div>
            )}
          </div>
        )}
        {!isConqueror && rulesText && (
          <p className="text-[8px] text-gray-300 px-1 text-center leading-tight line-clamp-3">
            {rulesText}
          </p>
        )}
      </div>

      {/* Footer: keywords + HP bar */}
      <div className={`${c.statsBg} px-1 pt-[2px] pb-[3px] shrink-0 flex flex-col gap-[2px]`}>
        {keywords && keywords.length > 0 && (
          <div className="flex flex-wrap gap-[2px]">
            {keywords.map((kw) => (
              <span
                key={kw}
                title={keywordLabel(kw)}
                className={`text-[7px] text-white px-[3px] rounded-sm leading-tight ${keywordColor(kw)}`}
              >
                {keywordLabel(kw).slice(0, 3).toUpperCase()}
              </span>
            ))}
          </div>
        )}

        {showHpBar && hp != null && maxHp != null && (
          <div className="flex items-center gap-1">
            <div className="flex-1 bg-gray-700/60 rounded-full h-[4px]">
              <div
                className={`h-[4px] rounded-full transition-all ${
                  hpPct > 0.5 ? 'bg-green-500' : hpPct > 0.25 ? 'bg-yellow-500' : 'bg-red-500'
                }`}
                style={{ width: `${hpPct * 100}%` }}
              />
            </div>
            <span className="text-[7px] text-gray-400 leading-none tabular-nums">{hp}</span>
          </div>
        )}

        {/* SPD/RNG small indicators for hand view */}
        {!showHpBar && isConqueror && (spd !== undefined || rng !== undefined) && (
          <div className="flex gap-1">
            {spd !== undefined && <span className="text-[7px] text-yellow-500">S{spd}</span>}
            {rng !== undefined && <span className="text-[7px] text-cyan-500">R{rng}</span>}
          </div>
        )}
      </div>
    </div>
  )
}
