import { motion } from 'framer-motion'

const orbs = [
  // 왼쪽 보라
  {
    color: 'rgba(120, 60, 255, 0.15)',
    size: 700,
    initial: { x: '-20%', y: '-10%' },
    animate: {
      x: ['-20%', '5%', '-10%', '-20%'],
      y: ['-10%', '20%', '40%', '-10%'],
    },
    duration: 13,
  },
  // 오른쪽 파랑
  {
    color: 'rgba(0, 160, 255, 0.13)',
    size: 650,
    initial: { x: '70%', y: '-5%' },
    animate: {
      x: ['70%', '55%', '75%', '70%'],
      y: ['-5%', '25%', '10%', '-5%'],
    },
    duration: 15,
  },
  // 왼쪽 하단 보라/핑크
  {
    color: 'rgba(200, 50, 255, 0.09)',
    size: 550,
    initial: { x: '-10%', y: '55%' },
    animate: {
      x: ['-10%', '15%', '-5%', '-10%'],
      y: ['55%', '35%', '65%', '55%'],
    },
    duration: 12,
  },
  // 오른쪽 하단 청록
  {
    color: 'rgba(0, 210, 180, 0.09)',
    size: 500,
    initial: { x: '75%', y: '60%' },
    animate: {
      x: ['75%', '60%', '80%', '75%'],
      y: ['60%', '75%', '45%', '60%'],
    },
    duration: 14,
  },
  // 오른쪽 중간 보라
  {
    color: 'rgba(140, 80, 255, 0.1)',
    size: 480,
    initial: { x: '80%', y: '30%' },
    animate: {
      x: ['80%', '65%', '85%', '80%'],
      y: ['30%', '50%', '20%', '30%'],
    },
    duration: 17,
  },
]

export default function AnimatedBackground() {
  return (
    <div
      className="fixed inset-0 -z-10 overflow-hidden pointer-events-none"
      style={{ background: '#000' }}
    >
      {orbs.map((orb, i) => (
        <motion.div
          key={i}
          initial={orb.initial}
          animate={orb.animate}
          transition={{
            duration: orb.duration,
            repeat: Infinity,
            ease: 'easeInOut',
          }}
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

      {/* 미세한 노이즈 텍스처 느낌을 위한 오버레이 */}
      <div
        style={{
          position: 'absolute',
          inset: 0,
          background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.6) 100%)',
        }}
      />
    </div>
  )
}
