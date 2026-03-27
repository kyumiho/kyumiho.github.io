import { motion } from 'framer-motion'

const projects = [
  {
    title: 'Car Rental Service Platform',
    period: 'Jan 2023 – Present',
    description: 'Capstone project with a team of 5 developers. A full-featured web application that allows customers to rent vehicles across Ohio. Built with an agile workflow using React.js, Django, Redux, Tailwind CSS, and SASS.',
    tags: ['React.js', 'Django', 'Redux', 'Tailwind CSS', 'SASS', 'Agile'],
    link: null,
    badge: 'Capstone',
  },
  {
    title: 'Hack/ILLINOIS — Go-Moku AI',
    period: 'Feb 2022',
    description: 'Go-Moku board game built with Java and a Min-Max Algorithm. Players compete against an AI opponent that calculates optimal moves. Version-controlled with Git and hosted on GitHub.',
    tags: ['Java', 'Min-Max Algorithm', 'AI', 'Git'],
    link: 'https://github.com/lebantion/Omok',
    badge: 'Hackathon',
  },
  {
    title: 'HackOHI/O — OSUGrades Android',
    period: 'Nov 2020',
    description: 'Android application built with Java and Android Studio. Designed for OSU students to store and browse professor ratings and difficulty scores, helping students make informed course decisions.',
    tags: ['Java', 'Android Studio', 'Firebase', 'Git'],
    link: 'https://github.com/lebantion/OSUGrades-Android',
    badge: 'Hackathon',
  },
]

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

          <div className="flex flex-col gap-4">
            {projects.map((project) => (
              <motion.div
                key={project.title}
                variants={fadeUp}
                whileHover={{ scale: 1.01 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className="p-8 rounded-3xl"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.07)',
                }}
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                  <div className="flex items-start gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1.5">
                        <h3 className="text-xl font-semibold" style={{ color: '#f5f5f7' }}>{project.title}</h3>
                        <span
                          className="px-2 py-0.5 rounded-full text-xs"
                          style={{ background: 'rgba(120,80,255,0.15)', color: 'rgba(180,160,255,0.7)', border: '1px solid rgba(120,80,255,0.2)' }}
                        >
                          {project.badge}
                        </span>
                      </div>
                    </div>
                  </div>
                  <span
                    className="shrink-0 px-3 py-1 rounded-full text-xs font-mono self-start"
                    style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.3)' }}
                  >
                    {project.period}
                  </span>
                </div>

                <p className="text-sm leading-relaxed mb-6" style={{ color: 'rgba(255,255,255,0.4)' }}>
                  {project.description}
                </p>

                <div className="flex items-center justify-between flex-wrap gap-4">
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
                  {project.link && (
                    <a
                      href={project.link}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 text-xs font-medium transition-all duration-200"
                      style={{ color: 'rgba(255,255,255,0.35)' }}
                      onMouseEnter={e => e.currentTarget.style.color = 'rgba(255,255,255,0.8)'}
                      onMouseLeave={e => e.currentTarget.style.color = 'rgba(255,255,255,0.35)'}
                    >
                      <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                      </svg>
                      View on GitHub
                    </a>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </main>
  )
}
