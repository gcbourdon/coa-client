import { motion } from 'framer-motion'

interface Props {
  damage: number
  isReturn?: boolean
}

export function DamageNumber({ damage, isReturn }: Props) {
  return (
    <motion.div
      className={`absolute pointer-events-none font-bold text-lg z-50 ${isReturn ? 'text-orange-400' : 'text-red-400'}`}
      initial={{ y: 0, opacity: 1 }}
      animate={{ y: -40, opacity: 0 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
    >
      -{damage}
    </motion.div>
  )
}
