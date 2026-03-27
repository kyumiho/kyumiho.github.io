import { motion } from 'framer-motion'

const education = [
  {
    degree: 'Degree Title',
    school: 'University / Institution Name',
    period: '20XX – 20XX',
    description: 'Brief description of what you studied, major achievements, or relevant coursework.',
    tags: ['Major', 'Minor'],
  },
]

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: 'easeOut' },
  }),
}

export default function Diploma() {
  return (
    <main className="min-h-screen pt-24 pb-20 px-6 max-w-6xl mx-auto">
      <section className="py-16">
        <motion.div initial="hidden" animate="show">
          <motion.p variants={fadeUp} custom={0} className="text-xs font-mono text-cyan-400 uppercase tracking-widest mb-3">
            Education
          </motion.p>
          <motion.h1 variants={fadeUp} custom={1} className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
            Diploma
          </motion.h1>
          <motion.p variants={fadeUp} custom={2} className="text-zinc-400 text-lg mb-16 max-w-xl">
            My academic background and qualifications.
          </motion.p>

          <div className="relative">
            {/* Timeline line */}
            <div className="absolute left-6 top-0 bottom-0 w-px bg-gradient-to-b from-violet-500/50 via-cyan-500/30 to-transparent hidden md:block" />

            <div className="flex flex-col gap-8">
              {education.map((edu, i) => (
                <motion.div
                  key={edu.degree + i}
                  variants={fadeUp}
                  custom={i + 3}
                  className="md:pl-16 relative"
                >
                  {/* Timeline dot */}
                  <div className="absolute left-4 top-6 w-4 h-4 rounded-full border-2 border-violet-500 bg-[#0a0a0f] hidden md:block" />

                  <motion.div
                    whileHover={{ x: 4 }}
                    className="p-6 md:p-8 rounded-2xl border border-white/8 bg-white/3 hover:bg-white/5 hover:border-white/12 transition-all duration-300 group"
                  >
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-3 mb-4">
                      <div>
                        <h3 className="text-xl font-semibold text-white mb-1">{edu.degree}</h3>
                        <p className="text-violet-300 font-medium">{edu.school}</p>
                      </div>
                      <span className="shrink-0 px-3 py-1.5 rounded-lg bg-white/5 border border-white/8 text-zinc-400 text-sm font-mono">
                        {edu.period}
                      </span>
                    </div>

                    <p className="text-zinc-400 text-sm leading-relaxed mb-5">{edu.description}</p>

                    <div className="flex flex-wrap gap-2">
                      {edu.tags.map(tag => (
                        <span key={tag} className="px-2.5 py-1 rounded-md bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-xs font-mono">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </motion.div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>
      </section>

      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/3 w-96 h-96 bg-cyan-600/8 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-violet-600/6 rounded-full blur-3xl" />
      </div>
    </main>
  )
}
