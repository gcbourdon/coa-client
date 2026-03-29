import { useEffect } from 'react'
import { useGameStore } from '../../store/gameStore'

export function CombatOverlay() {
  const lastResult = useGameStore((s) => s.lastCombatResult)
  const setLastCombatResult = useGameStore((s) => s.setLastCombatResult)

  useEffect(() => {
    if (!lastResult) return
    const timer = setTimeout(() => setLastCombatResult(null), 2500)
    return () => clearTimeout(timer)
  }, [lastResult, setLastCombatResult])

  if (!lastResult) return null

  return (
    <div className="fixed bottom-4 right-4 bg-gray-800 border border-gray-600 rounded-lg p-3 text-sm z-40 shadow-xl">
      <div className="font-semibold text-white mb-1">Combat Result</div>
      <div className="text-red-400">Outgoing: {lastResult.outgoingDamage}</div>
      <div className="text-orange-400">Return: {lastResult.returnDamage}</div>
      {lastResult.destroyed.length > 0 && (
        <div className="text-gray-300">{lastResult.destroyed.length} conqueror(s) destroyed</div>
      )}
      {lastResult.overflow && (
        <div className="text-purple-400">Overflow: {lastResult.overflow.damage}</div>
      )}
    </div>
  )
}
