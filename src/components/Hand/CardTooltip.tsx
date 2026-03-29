import { createPortal } from 'react-dom'
import type { CardDef, Keyword } from '../../types/game'
import { keywordLabel, keywordColor } from '../../utils/cardUtils'

interface Props {
  def: CardDef
  anchorRect: DOMRect
}

const RARITY_COLOR: Record<string, string> = {
  common:     'text-gray-400',
  uncommon:   'text-green-400',
  rare:       'text-blue-400',
  ultra_rare: 'text-purple-400',
}

const RARITY_LABEL: Record<string, string> = {
  common:     'Common',
  uncommon:   'Uncommon',
  rare:       'Rare',
  ultra_rare: 'Ultra Rare',
}

const KEYWORD_DESCRIPTIONS: Partial<Record<Keyword, string>> = {
  rush:       'Does not enter Weary when deployed.',
  rend:       'ATK bypasses DEF — damage is applied directly to HP.',
  taunt:      'Adjacent enemy conquerors must include this conqueror in any attack if able.',
  intercept:  'Spend 1 AP during the opponent\'s combat step to move 1 position and join an adjacent defense.',
  steadfast:  'The first time this conqueror would be destroyed each turn, it survives with 1 HP instead.',
  fury:       'May attack a second time this turn by spending 1 AP. Becomes Weary after the second attack.',
  overwhelm:  'Excess damage beyond defenders\' HP is dealt to the attacked structure.',
}

export function CardTooltip({ def, anchorRect }: Props) {
  const TOOLTIP_WIDTH = 216
  const VIEWPORT_PAD = 12

  // Position to the right of the card; flip left if it would overflow the viewport.
  const spaceRight = window.innerWidth - anchorRect.right - VIEWPORT_PAD
  const left = spaceRight >= TOOLTIP_WIDTH
    ? anchorRect.right + 8
    : anchorRect.left - TOOLTIP_WIDTH - 8

  // Vertically align with the card top, clamped within viewport.
  const top = Math.min(
    anchorRect.top,
    window.innerHeight - VIEWPORT_PAD - 400, // max tooltip height estimate
  )

  const isConqueror = def.type === 'conqueror'

  return createPortal(
    <div
      className="fixed z-[9999] pointer-events-none"
      style={{ left, top, width: TOOLTIP_WIDTH }}
    >
      <div className="rounded-lg border border-gray-600 bg-gray-900 shadow-2xl shadow-black/80 flex flex-col overflow-hidden">

        {/* ── Header ── */}
        <div className="bg-gray-800 px-3 py-2 flex items-start justify-between gap-2">
          <div className="flex flex-col gap-0.5">
            <span className="text-white font-bold text-sm leading-tight">{def.name}</span>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] text-gray-400 capitalize">{def.type}</span>
              <span className="text-gray-600 text-[10px]">•</span>
              <span className={`text-[10px] ${RARITY_COLOR[def.rarity] ?? 'text-gray-400'}`}>
                {RARITY_LABEL[def.rarity] ?? def.rarity}
              </span>
            </div>
          </div>
          {def.ap_cost > 0 && (
            <div className="shrink-0 w-8 h-8 rounded-full bg-yellow-900/60 border border-yellow-600 flex flex-col items-center justify-center">
              <span className="text-yellow-300 font-bold text-sm leading-none">{def.ap_cost}</span>
              <span className="text-yellow-600 text-[7px] leading-none">AP</span>
            </div>
          )}
        </div>

        {/* ── Stats (conquerors only) ── */}
        {isConqueror && (
          <div className="bg-gray-800/50 border-t border-gray-700 px-3 py-2 grid grid-cols-5 gap-1">
            {(
              [
                { label: 'ATK', value: def.base_atk, color: 'text-red-300' },
                { label: 'DEF', value: def.base_def, color: 'text-blue-300' },
                { label: 'HP',  value: def.base_hp,  color: 'text-green-300' },
                { label: 'SPD', value: def.base_spd, color: 'text-yellow-300' },
                { label: 'RNG', value: def.base_rng, color: 'text-cyan-300' },
              ] as { label: string; value: number | undefined; color: string }[]
            ).map(({ label, value, color }) => (
              <div key={label} className="flex flex-col items-center">
                <span className={`text-sm font-bold leading-none ${color}`}>{value ?? '—'}</span>
                <span className="text-[9px] text-gray-500 leading-none mt-0.5">{label}</span>
              </div>
            ))}
          </div>
        )}

        {/* ── Keywords ── */}
        {def.keywords && def.keywords.length > 0 && (
          <div className="border-t border-gray-700 px-3 py-2 flex flex-col gap-1.5">
            {(def.keywords as Keyword[]).map((kw) => (
              <div key={kw} className="flex flex-col gap-0.5">
                <span className={`text-[10px] font-bold text-white px-1.5 py-0.5 rounded self-start ${keywordColor(kw)}`}>
                  {keywordLabel(kw)}
                </span>
                {KEYWORD_DESCRIPTIONS[kw] && (
                  <p className="text-[10px] text-gray-400 leading-snug pl-1">
                    {KEYWORD_DESCRIPTIONS[kw]}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── Rules text ── */}
        {def.rules_text && (
          <div className="border-t border-gray-700 px-3 py-2">
            <p className="text-[11px] text-gray-200 leading-snug">{def.rules_text}</p>
          </div>
        )}

        {/* ── Flavor text ── */}
        {def.flavor_text && (
          <div className="border-t border-gray-700/50 px-3 py-2 bg-gray-900/60">
            <p className="text-[10px] text-gray-500 italic leading-snug">{def.flavor_text}</p>
          </div>
        )}
      </div>
    </div>,
    document.body,
  )
}
