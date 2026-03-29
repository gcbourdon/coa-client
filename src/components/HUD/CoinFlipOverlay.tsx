import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { PlayerIndex } from '../../types/game'

interface Props {
  firstPlayer: PlayerIndex
  myPlayerIndex: PlayerIndex
  onDone: () => void
}

export function CoinFlipOverlay({ firstPlayer, myPlayerIndex, onDone }: Props) {
  const [visible, setVisible] = useState(true)

  useEffect(() => {
    const t = setTimeout(() => {
      setVisible(false)
      setTimeout(onDone, 400)
    }, 3000)
    return () => clearTimeout(t)
  }, [onDone])

  const goingFirst = firstPlayer === myPlayerIndex
  const label = goingFirst ? 'You go first!' : 'Opponent goes first'
  const subLabel = goingFirst
    ? 'Good luck — make your move.'
    : 'Prepare your defenses.'

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          key="coin-flip"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.8 }}
          transition={{ type: 'spring', stiffness: 260, damping: 20 }}
          className="fixed inset-0 flex items-center justify-center z-50 bg-black/70"
        >
          <div className="flex flex-col items-center gap-4 text-center px-8">
            {/* Coin */}
            <motion.div
              animate={{ rotateY: [0, 360, 720, 1080] }}
              transition={{ duration: 1.2, ease: 'easeOut' }}
              className="text-6xl select-none"
            >
              🪙
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.3 }}
              className="flex flex-col gap-1"
            >
              <span className={`text-3xl font-bold ${goingFirst ? 'text-yellow-300' : 'text-gray-300'}`}>
                {label}
              </span>
              <span className="text-sm text-gray-400">{subLabel}</span>
            </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
