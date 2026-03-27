import { motion } from 'framer-motion'

const education = [
  {
    degree: 'Bachelor of Science in Computer Science & Engineering',
    school: 'The Ohio State University',
    period: '20XX – 20XX',
    description: 'Specializing in Software Engineering. Studied computer systems, algorithms, software design, and engineering principles in the United States.',
    tags: ['Software Engineering', 'Computer Science'],
  },
]

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.1 } },
}

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.25, 0.1, 0.25, 1] } },
}

export default function Diploma() {
  return (
    <main style={{ minHeight: '100vh', paddingTop: '120px', paddingBottom: '120px', paddingLeft: '24px', paddingRight: '24px' }}>
      <div style={{ maxWidth: '768px', margin: '0 auto' }}>
        <motion.div initial="hidden" animate="show" variants={stagger}>
          <motion.p
            variants={fadeUp}
            className="text-xs font-medium tracking-[0.2em] uppercase mb-4 text-center"
            style={{ color: 'rgba(255,255,255,0.25)' }}
          >
            Education
          </motion.p>
          <motion.h1
            variants={fadeUp}
            className="text-5xl md:text-7xl font-bold text-center mb-6"
            style={{ color: '#f5f5f7', letterSpacing: '-0.03em' }}
          >
            Diploma.
          </motion.h1>
          <motion.p
            variants={fadeUp}
            className="text-center text-lg mb-20"
            style={{ color: 'rgba(255,255,255,0.35)' }}
          >
            My academic background.
          </motion.p>

          <div className="flex flex-col gap-4">
            {education.map((edu, i) => (
              <motion.div
                key={i}
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
                  <div>
                    <h3 className="text-xl font-semibold mb-1.5" style={{ color: '#f5f5f7' }}>
                      {edu.degree}
                    </h3>
                    <p className="text-base font-medium" style={{ color: 'rgba(255,255,255,0.45)' }}>
                      {edu.school}
                    </p>
                  </div>
                  <span
                    className="shrink-0 px-3 py-1 rounded-full text-xs font-mono self-start"
                    style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.3)' }}
                  >
                    {edu.period}
                  </span>
                </div>

                <p className="text-sm leading-relaxed mb-6" style={{ color: 'rgba(255,255,255,0.35)' }}>
                  {edu.description}
                </p>

                <div className="flex flex-wrap gap-2">
                  {edu.tags.map(tag => (
                    <span
                      key={tag}
                      className="px-3 py-1 rounded-full text-xs"
                      style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.45)' }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </div>
    </main>
  )
}
