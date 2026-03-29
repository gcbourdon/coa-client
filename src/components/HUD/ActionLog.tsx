import { useGameStore } from '../../store/gameStore'

export function ActionLog() {
  const log = useGameStore((s) => s.log)

  return (
    <div className="flex flex-col gap-0.5 overflow-y-auto max-h-48 text-xs text-gray-400 font-mono">
      {log.length === 0 ? (
        <span className="text-gray-600">No events yet.</span>
      ) : (
        log.map((entry) => (
          <div key={entry.id} className="truncate">{entry.text}</div>
        ))
      )}
    </div>
  )
}
