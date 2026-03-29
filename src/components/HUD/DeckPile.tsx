interface Props {
  count: number
}

export function DeckPile({ count }: Props) {
  return (
    <div className="flex flex-col items-center gap-0.5 select-none" title={`${count} cards remaining`}>
      {/* Stack of face-down cards */}
      <div className="relative w-8 h-11">
        {/* Shadow cards to show depth */}
        {count > 2 && (
          <div className="absolute inset-0 translate-x-0.5 translate-y-0.5 rounded border border-gray-600 bg-gray-700" />
        )}
        {count > 1 && (
          <div className="absolute inset-0 translate-x-px translate-y-px rounded border border-gray-500 bg-gray-700" />
        )}
        {/* Top card */}
        <div className="absolute inset-0 rounded border border-gray-400 bg-gradient-to-br from-gray-600 to-gray-800 flex items-center justify-center">
          <div className="w-4 h-6 rounded-sm border border-gray-500 bg-gray-700/60" />
        </div>
        {count === 0 && (
          <div className="absolute inset-0 rounded border border-gray-700 bg-gray-900/80 flex items-center justify-center">
            <span className="text-[8px] text-gray-600">—</span>
          </div>
        )}
      </div>
      <span className="text-[10px] text-gray-400 font-semibold tabular-nums">{count}</span>
    </div>
  )
}
