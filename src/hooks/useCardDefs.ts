import { useEffect, useState } from 'react'
import type { CardDef } from '../types/game'

// Module-level cache so repeated renders don't re-fetch the same IDs.
const cache = new Map<string, CardDef>()

export function useCardDefs(cardIds: string[]): Map<string, CardDef> {
  const [defs, setDefs] = useState<Map<string, CardDef>>(new Map(cache))

  useEffect(() => {
    const missing = [...new Set(cardIds)].filter((id) => !cache.has(id))
    if (missing.length === 0) {
      // All IDs already in cache — sync local state in case another component populated the cache
      // after this component mounted (e.g. hand fetched defs before a conqueror was deployed).
      setDefs(new Map(cache))
      return
    }

    const params = new URLSearchParams({ cardIDs: missing.join(',') })
    fetch(`/api/v1/cards?${params}`)
      .then((res) => {
        if (!res.ok) throw new Error(`card fetch failed: ${res.status}`)
        return res.json() as Promise<{ cards: CardDef[] }>
      })
      .then(({ cards }) => {
        cards.forEach((c) => cache.set(c.id, c))
        setDefs(new Map(cache))
      })
      .catch((err) => console.error('[useCardDefs]', err))
  // Only re-run when the set of IDs changes.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cardIds.join(',')])

  return defs
}
