import { motion } from 'framer-motion'

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
  { name: 'Spotfire',       icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/apache/apache-original.svg' },
  { name: 'KNIME',          icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/anaconda/anaconda-original.svg' },
]

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.04 } },
}

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.25, 0.1, 0.25, 1] } },
}

// 빗방울 낙하 애니메이션 — 각 카드마다 랜덤 딜레이로 자연스러운 비 효과
const rainDrop = (index) => ({
  hidden: { opacity: 0, y: -80 },
  show: {
    opacity: 1,
    y: 0,
    transition: {
      delay: Math.random() * 0.6,   // 0~0.6초 랜덤 딜레이
      duration: 0.45,
      ease: [0.22, 1, 0.36, 1],     // 빠르게 떨어지고 살짝 튕기는 느낌
    },
  },
})

function TechCard({ name, icon, index }) {
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
      <img src={icon} alt={name} className="w-9 h-9 object-contain" />
      <span className="text-xs text-white/40 text-center leading-tight">{name}</span>
    </motion.div>
  )
}

export default function Home() {
  return (
    <main className="min-h-screen">

      {/* ── Hero ── */}
      <section className="relative flex flex-col items-center justify-center min-h-screen text-center px-6 overflow-hidden">
        {/* Ambient glow */}
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
            className="text-6xl md:text-8xl font-bold tracking-tight"
            style={{
              color: '#f5f5f7',
              letterSpacing: '-0.03em',
              lineHeight: 1.05,
            }}
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
            Studying Computer Science & Engineering in the United States.
            From South Korea — passionate about building great software.
          </motion.p>

          <motion.div variants={fadeUp} className="flex items-center gap-3 mt-2">
            <a
              href="/projects"
              className="px-6 py-2.5 rounded-full text-sm font-medium text-white transition-all duration-300"
              style={{ background: 'rgba(255,255,255,0.12)', border: '1px solid rgba(255,255,255,0.12)' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.18)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
            >
              View Projects
            </a>
            <a
              href="/contact"
              className="px-6 py-2.5 rounded-full text-sm font-medium transition-all duration-300"
              style={{ color: 'rgba(255,255,255,0.55)', border: '1px solid rgba(255,255,255,0.1)' }}
              onMouseEnter={e => { e.currentTarget.style.color = '#fff'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.25)' }}
              onMouseLeave={e => { e.currentTarget.style.color = 'rgba(255,255,255,0.55)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)' }}
            >
              Contact Me
            </a>
          </motion.div>
        </motion.div>

        {/* Scroll indicator */}
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
      <section className="py-36 px-6">
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

            <motion.div
              variants={stagger}
              className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-6 gap-3"
            >
              {languages.map((lang, i) => (
                <TechCard key={lang.name} {...lang} index={i} />
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Divider */}
      <div style={{ maxWidth: '896px', margin: '0 auto', padding: '0 24px' }}>
        <div style={{ height: '1px', background: 'rgba(255,255,255,0.06)' }} />
      </div>

      {/* ── Tools ── */}
      <section className="py-36 px-6" style={{ paddingTop: '100px', paddingBottom: '120px' }}>
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

            <motion.div
              variants={stagger}
              className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-6 gap-3"
            >
              {tools.map((tool, i) => (
                <TechCard key={tool.name} {...tool} index={i} />
              ))}
            </motion.div>
          </motion.div>
        </div>
      </section>

    </main>
  )
}
