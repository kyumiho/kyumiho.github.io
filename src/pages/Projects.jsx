import { motion } from 'framer-motion'

const projects = [
  {
    title: 'Project Name',
    description: 'Short description of what this project does and the problem it solves.',
    tags: ['React', 'Firebase', 'Tailwind'],
    link: '#',
    github: '#',
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

export default function Projects() {
  return (
    <main className="min-h-screen pt-24 pb-20 px-6 max-w-6xl mx-auto">
      <section className="py-16">
        <motion.div
          initial="hidden"
          animate="show"
        >
          <motion.p variants={fadeUp} custom={0} className="text-xs font-mono text-violet-400 uppercase tracking-widest mb-3">
            Portfolio
          </motion.p>
          <motion.h1 variants={fadeUp} custom={1} className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
            Projects
          </motion.h1>
          <motion.p variants={fadeUp} custom={2} className="text-zinc-400 text-lg mb-16 max-w-xl">
            Things I've built, explored, and shipped.
          </motion.p>

          {projects.length === 0 ? (
            <motion.div
              variants={fadeUp}
              custom={3}
              className="flex flex-col items-center justify-center py-32 text-center"
            >
              <span className="text-5xl mb-4">🚧</span>
              <p className="text-zinc-500 text-lg">Projects coming soon...</p>
            </motion.div>
          ) : (
            <div className="grid md:grid-cols-2 gap-5">
              {projects.map((project, i) => (
                <motion.div
                  key={project.title}
                  variants={fadeUp}
                  custom={i + 3}
                  whileHover={{ y: -4 }}
                  className="group relative p-6 rounded-2xl border border-white/8 bg-white/3 hover:bg-white/5 hover:border-white/12 transition-all duration-300 overflow-hidden"
                >
                  <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-violet-500/30 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-lg font-semibold text-white">{project.title}</h3>
                    <div className="flex gap-3 ml-4 shrink-0">
                      {project.github && project.github !== '#' && (
                        <a href={project.github} target="_blank" rel="noreferrer" className="text-zinc-500 hover:text-white transition-colors">
                          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                          </svg>
                        </a>
                      )}
                    </div>
                  </div>

                  <p className="text-zinc-400 text-sm mb-5 leading-relaxed">{project.description}</p>

                  <div className="flex flex-wrap gap-2">
                    {project.tags.map(tag => (
                      <span key={tag} className="px-2.5 py-1 rounded-md bg-violet-500/10 border border-violet-500/20 text-violet-300 text-xs font-mono">
                        {tag}
                      </span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </section>

      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-violet-600/8 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 left-1/4 w-80 h-80 bg-cyan-600/6 rounded-full blur-3xl" />
      </div>
    </main>
  )
}
