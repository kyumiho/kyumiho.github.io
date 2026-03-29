import { motion } from 'framer-motion'
import { useTheme } from '../ThemeContext'

const darkOrbs = [
  {
    color: 'rgba(120, 60, 255, 0.15)', size: 700,
    initial: { x: '-20%', y: '-10%' },
    animate: { x: ['-20%', '5%', '-10%', '-20%'], y: ['-10%', '20%', '40%', '-10%'] },
    duration: 13,
  },
  {
    color: 'rgba(0, 160, 255, 0.13)', size: 650,
    initial: { x: '70%', y: '-5%' },
    animate: { x: ['70%', '55%', '75%', '70%'], y: ['-5%', '25%', '10%', '-5%'] },
    duration: 15,
  },
  {
    color: 'rgba(200, 50, 255, 0.09)', size: 550,
    initial: { x: '-10%', y: '55%' },
    animate: { x: ['-10%', '15%', '-5%', '-10%'], y: ['55%', '35%', '65%', '55%'] },
    duration: 12,
  },
  {
    color: 'rgba(0, 210, 180, 0.09)', size: 500,
    initial: { x: '75%', y: '60%' },
    animate: { x: ['75%', '60%', '80%', '75%'], y: ['60%', '75%', '45%', '60%'] },
    duration: 14,
  },
  {
    color: 'rgba(140, 80, 255, 0.1)', size: 480,
    initial: { x: '80%', y: '30%' },
    animate: { x: ['80%', '65%', '85%', '80%'], y: ['30%', '50%', '20%', '30%'] },
    duration: 17,
  },
]

const lightOrbs = [
  {
    color: 'rgba(120, 170, 255, 0.22)', size: 700,
    initial: { x: '-20%', y: '-10%' },
    animate: { x: ['-20%', '5%', '-10%', '-20%'], y: ['-10%', '20%', '40%', '-10%'] },
    duration: 13,
  },
  {
    color: 'rgba(160, 200, 255, 0.2)', size: 650,
    initial: { x: '70%', y: '-5%' },
    animate: { x: ['70%', '55%', '75%', '70%'], y: ['-5%', '25%', '10%', '-5%'] },
    duration: 15,
  },
  {
    color: 'rgba(180, 210, 255, 0.16)', size: 550,
    initial: { x: '-10%', y: '55%' },
    animate: { x: ['-10%', '15%', '-5%', '-10%'], y: ['55%', '35%', '65%', '55%'] },
    duration: 12,
  },
  {
    color: 'rgba(140, 190, 255, 0.14)', size: 500,
    initial: { x: '75%', y: '60%' },
    animate: { x: ['75%', '60%', '80%', '75%'], y: ['60%', '75%', '45%', '60%'] },
    duration: 14,
  },
  {
    color: 'rgba(200, 220, 255, 0.18)', size: 480,
    initial: { x: '80%', y: '30%' },
    animate: { x: ['80%', '65%', '85%', '80%'], y: ['30%', '50%', '20%', '30%'] },
    duration: 17,
  },
]

export default function AnimatedBackground() {
  const { theme } = useTheme()
  const orbs = theme === 'light' ? lightOrbs : darkOrbs

  return (
    <div
      className="fixed inset-0 -z-10 overflow-hidden pointer-events-none"
      style={{ background: 'var(--clr-bg)', transition: 'background 0.28s ease' }}
    >
      {orbs.map((orb, i) => (
        <motion.div
          key={i}
          initial={orb.initial}
          animate={orb.animate}
          transition={{ duration: orb.duration, repeat: Infinity, ease: 'easeInOut' }}
          style={{
            position: 'absolute',
            width: orb.size,
            height: orb.size,
            borderRadius: '50%',
            background: `radial-gradient(circle, ${orb.color} 0%, transparent 70%)`,
            filter: 'blur(40px)',
            willChange: 'transform',
          }}
        />
      ))}

      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: theme === 'light'
            ? 'radial-gradient(ellipse at center, rgba(255,255,255,0.5) 0%, transparent 70%)'
            : 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.6) 100%)',
          transition: 'background 0.28s ease',
        }}
      />
    </div>
  )
}
