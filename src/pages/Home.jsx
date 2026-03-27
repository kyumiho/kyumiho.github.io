import { motion } from 'framer-motion'

const languages = [
  { name: 'C', color: '#00599C' },
  { name: 'Ruby', color: '#CC342D' },
  { name: 'Java', color: '#ED8B00' },
  { name: 'HTML/CSS/JS', color: '#E34F26' },
  { name: 'C++', color: '#00599C' },
  { name: 'Unix', color: '#FCC624' },
  { name: 'Kotlin', color: '#7F52FF' },
  { name: 'C#', color: '#239120' },
  { name: 'Python', color: '#3776AB' },
]

const tools = [
  { name: 'Eclipse', icon: '🌑' },
  { name: 'Visual Studio', icon: '💜' },
  { name: 'RubyMine', icon: '💎' },
  { name: 'Windows', icon: '🪟' },
  { name: 'Firebase', icon: '🔥' },
  { name: 'Unity', icon: '🎮' },
  { name: 'Ruby on Rails', icon: '🛤️' },
  { name: 'Git', icon: '🔀' },
  { name: 'Oracle SQL', icon: '🗄️' },
  { name: 'MySQL', icon: '🐬' },
  { name: 'Spotfire', icon: '📊' },
  { name: 'KNIME', icon: '🔬' },
]

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.05, ease: 'easeOut' },
  }),
}

export default function Home() {
  return (
    <main className="min-h-screen pt-24 pb-20 px-6 max-w-6xl mx-auto">
      {/* Hero */}
      <section className="py-20 flex flex-col items-start gap-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-violet-500/30 bg-violet-500/10 text-violet-300 text-xs font-mono"
        >
          <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse" />
          Available for opportunities
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="text-5xl md:text-7xl font-bold text-white leading-tight tracking-tight"
        >
          Hi, I'm{' '}
          <span className="relative inline-block">
            <span className="bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
              Lebant
            </span>
            <motion.span
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-violet-400 to-cyan-400 origin-left"
            />
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="text-lg md:text-xl text-zinc-400 max-w-2xl leading-relaxed"
        >
          A passionate software developer who loves building things that live on the internet.
          I enjoy turning complex problems into simple, beautiful, and intuitive solutions.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="flex items-center gap-4"
        >
          <a
            href="/projects"
            className="px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 text-white font-medium text-sm hover:shadow-lg hover:shadow-violet-500/25 transition-all duration-300 hover:scale-105"
          >
            View Projects
          </a>
          <a
            href="/contact"
            className="px-6 py-3 rounded-xl border border-white/10 text-zinc-300 font-medium text-sm hover:border-white/20 hover:text-white transition-all duration-300"
          >
            Contact Me
          </a>
        </motion.div>
      </section>

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-white/10 to-transparent my-4" />

      {/* Languages */}
      <section className="py-16">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-50px' }}
        >
          <motion.p variants={fadeUp} custom={0} className="text-xs font-mono text-violet-400 uppercase tracking-widest mb-3">
            Languages
          </motion.p>
          <motion.h2 variants={fadeUp} custom={1} className="text-2xl md:text-3xl font-bold text-white mb-10">
            What I code with
          </motion.h2>

          <div className="flex flex-wrap gap-3">
            {languages.map((lang, i) => (
              <motion.div
                key={lang.name}
                variants={fadeUp}
                custom={i + 2}
                whileHover={{ scale: 1.06, y: -2 }}
                className="group relative px-5 py-3 rounded-xl border border-white/8 bg-white/3 backdrop-blur-sm cursor-default"
              >
                <span
                  className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  style={{ background: `${lang.color}15`, borderColor: `${lang.color}40` }}
                />
                <span className="relative text-sm font-medium text-zinc-300 group-hover:text-white transition-colors">
                  {lang.name}
                </span>
                <span
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 h-0.5 w-0 group-hover:w-3/4 rounded-full transition-all duration-300"
                  style={{ background: lang.color }}
                />
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Tools */}
      <section className="py-8">
        <motion.div
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: '-50px' }}
        >
          <motion.p variants={fadeUp} custom={0} className="text-xs font-mono text-cyan-400 uppercase tracking-widest mb-3">
            Tools & Technologies
          </motion.p>
          <motion.h2 variants={fadeUp} custom={1} className="text-2xl md:text-3xl font-bold text-white mb-10">
            My toolbox
          </motion.h2>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {tools.map((tool, i) => (
              <motion.div
                key={tool.name}
                variants={fadeUp}
                custom={i + 2}
                whileHover={{ scale: 1.04, y: -3 }}
                className="flex items-center gap-3 px-4 py-3.5 rounded-xl border border-white/8 bg-white/3 hover:bg-white/6 hover:border-white/15 transition-all duration-300 cursor-default group"
              >
                <span className="text-xl">{tool.icon}</span>
                <span className="text-sm font-medium text-zinc-400 group-hover:text-white transition-colors">
                  {tool.name}
                </span>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Background decoration */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-violet-600/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 right-1/4 w-80 h-80 bg-cyan-600/8 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 left-1/3 w-64 h-64 bg-violet-600/6 rounded-full blur-3xl" />
      </div>
    </main>
  )
}
