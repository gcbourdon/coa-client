const MAX_AP = 6

interface Props {
  ap: number
  isMyTurn: boolean
}

export function APBar({ ap, isMyTurn }: Props) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-xs text-gray-400 w-6">AP</span>
      <div className="flex gap-1">
        {Array.from({ length: MAX_AP }).map((_, i) => (
          <div
            key={i}
            className={`w-5 h-5 rounded border transition-all ${
              i < ap
                ? isMyTurn
                  ? 'bg-yellow-400 border-yellow-300'
                  : 'bg-yellow-700 border-yellow-600'
                : 'bg-gray-700 border-gray-600'
            }`}
          />
        ))}
      </div>
      <span className="text-xs text-gray-300">{ap}/6</span>
    </div>
  )
}
