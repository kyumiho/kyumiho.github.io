import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const languages = [
  { name: 'C',           icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/c/c-original.svg' },
  { name: 'Ruby',        icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/ruby/ruby-original.svg' },
  { name: 'Java',        icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/java/java-original.svg' },
  { name: 'HTML',        icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg' },
  { name: 'CSS',         icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg' },
  { name: 'JavaScript',  icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg' },
  { name: 'C++',         icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/cplusplus/cplusplus-original.svg' },
  { name: 'Unix',        icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/linux/linux-original.svg' },
  { name: 'Kotlin',      icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/kotlin/kotlin-original.svg' },
  { name: 'C#',          icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/csharp/csharp-original.svg' },
  { name: 'Python',      icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg' },
]

// Custom SVG icons for tools without devicons
const SpotfireIcon = () => (
  <svg viewBox="0 0 32 32" className="w-9 h-9" fill="none">
    <rect x="2" y="20" width="6" height="10" rx="1.5" fill="rgba(255,160,60,0.85)" />
    <rect x="11" y="13" width="6" height="17" rx="1.5" fill="rgba(255,130,50,0.85)" />
    <rect x="20" y="5" width="6" height="25" rx="1.5" fill="rgba(255,100,40,0.85)" />
    <circle cx="5" cy="16" r="2.5" fill="rgba(255,200,100,0.9)" />
    <circle cx="14" cy="9" r="2.5" fill="rgba(255,180,80,0.9)" />
    <circle cx="23" cy="2" r="2.5" fill="rgba(255,160,60,0.9)" />
    <polyline points="5,16 14,9 23,2" stroke="rgba(255,200,120,0.5)" strokeWidth="1.2" fill="none" />
  </svg>
)

const KnimeIcon = () => (
  <svg viewBox="0 0 32 32" className="w-9 h-9" fill="none">
    <polygon points="16,2 30,28 2,28" fill="rgba(240,200,40,0.85)" />
    <polygon points="16,8 26,26 6,26" fill="rgba(0,0,0,0.25)" />
    <circle cx="16" cy="14" r="3" fill="rgba(255,230,100,0.9)" />
  </svg>
)

const tools = [
  { name: 'Eclipse',        icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/eclipse/eclipse-original.svg' },
  { name: 'Visual Studio',  icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/visualstudio/visualstudio-plain.svg' },
  { name: 'RubyMine',       icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/rubymine/rubymine-original.svg' },
  { name: 'Windows',        icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/windows8/windows8-original.svg' },
  { name: 'Firebase',       icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/firebase/firebase-plain.svg' },
  { name: 'Unity',          icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/unity/unity-original.svg' },
  { name: 'Ruby on Rails',  icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/rails/rails-plain.svg' },
  { name: 'Git',            icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg' },
  { name: 'Oracle SQL',     icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/oracle/oracle-original.svg' },
  { name: 'MySQL',          icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mysql/mysql-original.svg' },
  { name: 'Spotfire',       iconEl: <SpotfireIcon /> },
  { name: 'KNIME',          iconEl: <KnimeIcon /> },
]

const positions = [
  'Software Engineer',
  'Project / Product Manager',
  'Business System Analyst',
  'Data Analyst',
  'Software Consultant',
]

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04 } },
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] } },
}

const rainDrop = () => ({
  hidden: { opacity: 0, y: -80 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      delay: Math.random() * 0.6,
      duration: 0.45,
      ease: [0.22, 1, 0.36, 1],
    },
  },
})

function TechCard({ name, icon, iconEl, index }) {
  return (
    <motion.div
      variants={rainDrop(index)}
      whileHover={{ scale: 1.05, y: -4 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
      className="flex flex-col items-center gap-2.5 p-4 rounded-2xl cursor-default"
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {iconEl
        ? <div className="w-9 h-9 flex items-center justify-center">{iconEl}</div>
        : <img src={icon} alt={name} className="w-9 h-9 object-contain" />
      }
      <span className="text-xs text-white/40 text-center leading-tight">{name}</span>
    </motion.div>
  )
}

export default function Home() {
  const [posIndex, setPosIndex] = useState(0)

  useEffect(() => {
    const t = setInterval(() => setPosIndex(i => (i + 1) % positions.length), 2500)
    return () => clearInterval(t)
  }, [])

  return (
    <main className="min-h-screen">

      {/* ── Hero ── */}
      <section className="relative flex flex-col items-center justify-center min-h-screen text-center px-6 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div
            className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full"
            style={{ background: 'radial-gradient(circle, rgba(120,80,255,0.12) 0%, transparent 70%)' }}
          />
        </div>

        <motion.div
          initial="hidden"
          animate="show"
          variants={stagger}
          className="relative z-10 flex flex-col items-center gap-6 max-w-3xl"
        >
          <motion.p
            variants={fadeUp}
            className="text-xs font-medium tracking-[0.2em] uppercase"
            style={{ color: 'rgba(255,255,255,0.35)' }}
          >
            Software Engineer
          </motion.p>

          <motion.h1
            variants={fadeUp}
            className="text-5xl sm:text-6xl md:text-8xl font-bold tracking-tight"
            style={{ color: '#f5f5f7', letterSpacing: '-0.03em', lineHeight: 1.05 }}
          >
            SeongRok Ha
            <br />
            <span style={{ color: 'rgba(245,245,247,0.45)' }}>Simon.</span>
          </motion.h1>

          <motion.p
            variants={fadeUp}
            className="text-lg md:text-xl max-w-xl leading-relaxed"
            style={{ color: 'rgba(255,255,255,0.45)' }}
          >
            CS&E graduate from The Ohio State University.
            From South Korea — passionate about building great software.
          </motion.p>

        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5, duration: 1 }}
          className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2"
        >
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ repeat: Infinity, duration: 1.8, ease: 'easeInOut' }}
            className="w-px h-10"
            style={{ background: 'linear-gradient(to bottom, rgba(255,255,255,0.3), transparent)' }}
          />
        </motion.div>
      </section>

      {/* ── Languages ── */}
      <section className="py-16 md:py-36 px-6">
        <div style={{ maxWidth: '896px', margin: '0 auto' }}>
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: false, margin: '-80px' }}
            variants={stagger}
          >
            <motion.p
              variants={fadeUp}
              className="text-center text-xs font-medium tracking-[0.2em] uppercase"
              style={{ color: 'rgba(255,255,255,0.25)', marginTop: '10px', marginBottom: '10px' }}
            >
              Languages
            </motion.p>
            <motion.h2
              variants={fadeUp}
              className="text-center text-4xl md:text-5xl font-bold"
              style={{ color: '#f5f5f7', letterSpacing: '-0.025em', marginBottom: '50px' }}
            >
              What I Code With.
            </motion.h2>
            <motion.div variants={stagger} className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {languages.map((lang, i) => (
                <TechCard key={lang.name} {...lang} index={i} />
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Divider */}
      <div style={{ maxWidth: '896px', margin: '0 auto', padding: '5px 24px' }}>
        <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)' }} />
      </div>

      {/* ── Tools ── */}
      <section className="py-16 md:py-28 px-6">
        <div style={{ maxWidth: '896px', margin: '0 auto' }}>
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: false, margin: '-80px' }}
            variants={stagger}
          >
            <motion.p
              variants={fadeUp}
              className="text-center text-xs font-medium tracking-[0.2em] uppercase"
              style={{ color: 'rgba(255,255,255,0.25)', marginTop: '10px', marginBottom: '10px' }}
            >
              Tools & Technologies
            </motion.p>
            <motion.h2
              variants={fadeUp}
              className="text-center text-4xl md:text-5xl font-bold"
              style={{ color: '#f5f5f7', letterSpacing: '-0.025em', marginBottom: '50px' }}
            >
              My Toolbox.
            </motion.h2>
            <motion.div variants={stagger} className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {tools.map((tool, i) => (
                <TechCard key={tool.name} {...tool} index={i} />
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Divider */}
      <div style={{ maxWidth: '896px', margin: '0 auto', padding: '5px 24px' }}>
        <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)' }} />
      </div>

      {/* ── Position Slideshow ── */}
      <section className="px-6" style={{ paddingTop: '50px', paddingBottom: '50px' }}>
        <div style={{ maxWidth: '896px', margin: '0 auto' }} className="text-center">
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: false, margin: '-80px' }}
            variants={stagger}
          >
            <motion.p
              variants={fadeUp}
              className="text-xs font-medium tracking-[0.2em] uppercase mb-4"
              style={{ color: 'rgba(255,255,255,0.25)' }}
            >
              Open To
            </motion.p>
            <motion.h2
              variants={fadeUp}
              className="text-3xl md:text-4xl font-semibold mb-8"
              style={{ color: 'rgba(255,255,255,0.45)', letterSpacing: '-0.02em' }}
            >
              I'm looking for a role as
            </motion.h2>

            <motion.div
              variants={fadeUp}
              style={{ minHeight: '90px' }}
              className="flex items-center justify-center"
            >
              <AnimatePresence mode="wait">
                <motion.span
                  key={posIndex}
                  initial={{ opacity: 0, y: 32 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -32 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                  className="text-3xl md:text-5xl font-bold block"
                  style={{ color: '#f5f5f7', letterSpacing: '-0.025em' }}
                >
                  {positions[posIndex]}
                </motion.span>
              </AnimatePresence>
            </motion.div>

            <motion.div variants={fadeUp} className="flex items-center justify-center gap-2 mt-8">
              {positions.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setPosIndex(i)}
                  className="rounded-full transition-all duration-300"
                  style={{
                    width: i === posIndex ? '24px' : '6px',
                    height: '6px',
                    background: i === posIndex ? 'rgba(255,255,255,0.7)' : 'rgba(255,255,255,0.18)',
                  }}
                />
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Divider */}
      <div style={{ maxWidth: '896px', margin: '0 auto', padding: '5px 24px' }}>
        <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)' }} />
      </div>

      {/* ── About / Bio ── */}
      <section className="px-6" style={{ paddingTop: '48px', paddingBottom: '160px' }}>
        <div style={{ maxWidth: '896px', margin: '0 auto' }}>
          <motion.div
            initial="hidden"
            whileInView="show"
            viewport={{ once: false, margin: '-80px' }}
            variants={stagger}
          >
            <motion.p
              variants={fadeUp}
              className="text-xs font-medium tracking-[0.2em] uppercase mb-4 text-center"
              style={{ color: 'rgba(255,255,255,0.25)' }}
            >
              About
            </motion.p>
            <motion.h2
              variants={fadeUp}
              className="text-4xl md:text-5xl font-bold text-center"
              style={{ color: '#f5f5f7', letterSpacing: '-0.025em', marginBottom: '30px' }}
            >
              Who am I?
            </motion.h2>

            <div className="grid md:grid-cols-2 gap-5">
              {/* Bio */}
              <motion.div
                variants={fadeUp}
                className="rounded-3xl"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', padding: '44px' }}
              >
                <p className="text-sm leading-7" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  I'm a{' '}
                  <span style={{ color: 'rgba(255,255,255,0.85)' }}>Computer Science & Engineering</span>{' '}
                  graduate from{' '}
                  <span style={{ color: 'rgba(255,255,255,0.85)' }}>The Ohio State University</span>{' '}
                  (May 2023), specializing in Software Engineering. Currently working as an{' '}
                  <span style={{ color: 'rgba(255,255,255,0.85)' }}>Lead Business System Analyst</span>{' '}
                  at SK Battery America, designing and implementing Manufacturing Execution System processes.
                </p>
                <p className="text-sm leading-7 mt-6" style={{ color: 'rgba(255,255,255,0.5)' }}>
                  With hands-on experience in full-stack development — React, Python, Java, Django, Ruby on Rails — and a
                  background in Agile methodologies and OOP, I bridge technical depth with business-oriented thinking.
                  I thrive in roles where software meets strategy.
                </p>
              </motion.div>

              {/* Highlights */}
              <div className="flex flex-col gap-4">
                {/* AI Agent */}
                <motion.div
                  variants={fadeUp}
                  className="rounded-2xl"
                  style={{ background: 'rgba(120,80,255,0.07)', border: '1px solid rgba(120,80,255,0.18)', padding: '32px' }}
                >
                  <p className="text-xs font-medium tracking-widest uppercase mb-2" style={{ color: 'rgba(180,160,255,0.55)' }}>
                    AI Agent Proficiency
                  </p>
                  <p className="text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.5)' }}>
                    I actively leverage AI agents and tools like{' '}
                    <span style={{ color: 'rgba(200,180,255,0.9)' }}>Claude Code</span>{' '}
                    to accelerate development and iterate faster — staying ahead of the curve in how modern software gets built and shipped.
                  </p>
                </motion.div>

                {/* Current Role */}
                <motion.div
                  variants={fadeUp}
                  className="rounded-2xl"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', padding: '32px' }}
                >
                  <p className="text-xs font-medium tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.22)', marginBottom: '10px' }}>
                    Current Role
                  </p>
                  <p className="text-sm font-medium mb-0.5" style={{ color: 'rgba(255,255,255,0.8)' }}>
                    Lead Business System Analyst
                  </p>
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
                    SK Battery America · Sep 2023 – Present
                  </p>
                </motion.div>

                {/* Location */}
                <motion.div
                  variants={fadeUp}
                  className="rounded-2xl"
                  style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', padding: '32px' }}
                >
                  <p className="text-xs font-medium tracking-widest uppercase" style={{ color: 'rgba(255,255,255,0.22)', marginBottom: '10px' }}>
                    Location
                  </p>
                  <p className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.7)' }}>Duluth, GA</p>
                  <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.3)' }}>Open to Remote</p>
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

    </main>
  )
}
