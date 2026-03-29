import type { Keyword } from '../types/game'

const KEYWORD_LABELS: Record<Keyword, string> = {
  rush: 'Rush',
  rend: 'Rend',
  taunt: 'Taunt',
  intercept: 'Intercept',
  steadfast: 'Steadfast',
  fury: 'Fury',
  overwhelm: 'Overwhelm',
}

export function keywordLabel(kw: Keyword): string {
  return KEYWORD_LABELS[kw] ?? kw
}

// Returns a color class for a keyword badge.
export function keywordColor(kw: Keyword): string {
  const colors: Record<Keyword, string> = {
    rush: 'bg-yellow-600',
    rend: 'bg-red-700',
    taunt: 'bg-blue-700',
    intercept: 'bg-cyan-700',
    steadfast: 'bg-green-700',
    fury: 'bg-orange-600',
    overwhelm: 'bg-purple-700',
  }
  return colors[kw] ?? 'bg-gray-600'
}

// Derives a display name from a cardId like "OGN_1" — used as fallback when no card catalogue.
export function cardIdToDisplayName(cardId: string): string {
  return cardId
}
