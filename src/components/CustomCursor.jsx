import { useEffect, useState } from 'react'
import { motion, useMotionValue, useSpring } from 'framer-motion'

export default function CustomCursor() {
  const [isTouch] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia('(hover: none)').matches
  )
  const [hovered, setHovered] = useState(false)

  const mouseX = useMotionValue(-100)
  const mouseY = useMotionValue(-100)
  const springX = useSpring(mouseX, { stiffness: 350, damping: 30 })
  const springY = useSpring(mouseY, { stiffness: 350, damping: 30 })

  useEffect(() => {
    if (isTouch) return
    const onMove = e => { mouseX.set(e.clientX); mouseY.set(e.clientY) }
    const onOver = e => setHovered(!!e.target.closest('a, button, [role="button"], input, textarea'))
    window.addEventListener('mousemove', onMove)
    window.addEventListener('mouseover', onOver)
    return () => {
      window.removeEventListener('mousemove', onMove)
      window.removeEventListener('mouseover', onOver)
    }
  }, [isTouch, mouseX, mouseY])

  if (isTouch) return null

  return (
    <>
      {/* Outer glow ring — springs behind */}
      <motion.div
        style={{
          position: 'fixed', top: 0, left: 0, pointerEvents: 'none', zIndex: 99998,
          x: springX, y: springY,
          translateX: '-50%', translateY: '-50%',
          width: hovered ? 44 : 30,
          height: hovered ? 44 : 30,
          borderRadius: '50%',
          border: `1px solid rgba(160,130,255,${hovered ? 0.45 : 0.25})`,
          background: `radial-gradient(circle, rgba(140,100,255,${hovered ? 0.12 : 0.06}) 0%, transparent 70%)`,
          transition: 'width 0.2s ease, height 0.2s ease, border-color 0.2s ease',
        }}
      />
      {/* Inner dot — snaps exactly */}
      <motion.div
        style={{
          position: 'fixed', top: 0, left: 0, pointerEvents: 'none', zIndex: 99999,
          x: mouseX, y: mouseY,
          translateX: '-50%', translateY: '-50%',
          width: 4, height: 4,
          borderRadius: '50%',
          background: 'rgba(190,170,255,0.9)',
        }}
      />
    </>
  )
}
