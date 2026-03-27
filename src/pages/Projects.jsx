import { motion } from 'framer-motion'

const projects = []

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
}

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.25, 0.1, 0.25, 1] } },
}

export default function Projects() {
  return (
    <main style={{ minHeight: '100vh', paddingTop: '120px', paddingBottom: '120px', paddingLeft: '24px', paddingRight: '24px' }}>
      <div style={{ maxWidth: '896px', margin: '0 auto' }}>
        <motion.div initial="hidden" animate="show" variants={stagger}>
          <motion.p
            variants={fadeUp}
            className="text-xs font-medium tracking-[0.2em] uppercase mb-4 text-center"
            style={{ color: 'rgba(255,255,255,0.25)' }}
          >
            Portfolio
          </motion.p>
          <motion.h1
            variants={fadeUp}
            className="text-5xl md:text-7xl font-bold text-center mb-6"
            style={{ color: '#f5f5f7', letterSpacing: '-0.03em' }}
          >
            Projects.
          </motion.h1>
          <motion.p
            variants={fadeUp}
            className="text-center text-lg mb-20"
            style={{ color: 'rgba(255,255,255,0.35)' }}
          >
            Things I've built and shipped.
          </motion.p>

          {projects.length === 0 ? (
            <motion.div
              variants={fadeUp}
              className="flex flex-col items-center justify-center py-40 gap-4"
            >
              <span className="text-4xl" style={{ filter: 'grayscale(0.3)' }}>🚧</span>
              <p style={{ color: 'rgba(255,255,255,0.2)' }} className="text-sm">Coming soon</p>
            </motion.div>
          ) : (
            <div className="grid md:grid-cols-2 gap-4">
              {projects.map((project, i) => (
                <motion.div
                  key={project.title}
                  variants={fadeUp}
                  whileHover={{ scale: 1.02 }}
                  transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                  className="p-6 rounded-3xl"
                  style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid rgba(255,255,255,0.07)',
                  }}
                >
                  <h3 className="text-lg font-semibold mb-2" style={{ color: '#f5f5f7' }}>{project.title}</h3>
                  <p className="text-sm leading-relaxed mb-5" style={{ color: 'rgba(255,255,255,0.4)' }}>{project.description}</p>
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map(tag => (
                      <span
                        key={tag}
                        className="px-2.5 py-1 rounded-full text-xs"
                        style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.5)' }}
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </div>
    </main>
  )
}
