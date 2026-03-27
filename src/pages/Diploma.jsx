import { motion } from 'framer-motion'

const education = [
  {
    degree: 'Bachelor of Science in Computer Science & Engineering',
    school: 'The Ohio State University',
    period: 'Aug 2019 – May 2023',
    location: 'Columbus, OH',
    description: 'Specialization in Software Engineering. Studied computer systems, algorithms, software design, OOP, and engineering principles.',
    tags: ['Software Engineering', 'Computer Science', 'Algorithms', 'OOP'],
  },
]

const workExperience = [
  {
    company: 'SK Battery America',
    role: 'MES Specialist · Business System Analyst',
    period: 'Sep 2023 – Present',
    location: 'Columbus, OH',
    bullets: [
      'Analyze, design, develop, test, and implement improvements to Manufacturing Execution System (MES) processes, specifically focused on Formation.',
      'Define and guide efficient manufacturing system processes within process management, quality management, and equipment management.',
      'Operate local sites (SOR/SOP) and provide immediate support during system malfunctions.',
    ],
    tags: ['MES', 'Business Analysis', 'Process Design', 'Manufacturing'],
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
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', paddingTop: '100px', paddingBottom: '100px', paddingLeft: '24px', paddingRight: '24px' }}>
      <div style={{ maxWidth: '768px', margin: '0 auto' }}>
        <motion.div initial="hidden" animate="show" variants={stagger} style={{ width: '100%' }}>
          <motion.p
            variants={fadeUp}
            className="text-xs font-medium tracking-[0.2em] uppercase mb-4 text-center"
            style={{ color: 'rgba(255,255,255,0.25)' }}
          >
            Education & Experience
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
            My academic background and work experience.
          </motion.p>

          {/* Education */}
          <motion.p
            variants={fadeUp}
            className="text-xs font-medium tracking-[0.2em] uppercase mb-4"
            style={{ color: 'rgba(255,255,255,0.2)' }}
          >
            Education
          </motion.p>
          <div className="flex flex-col gap-4 mb-16">
            {education.map((edu, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                whileHover={{ scale: 1.01 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className="rounded-3xl"
                style={{
                  padding: '40px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.07)',
                }}
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-xl font-semibold mb-1.5" style={{ color: '#f5f5f7' }}>
                      {edu.degree}
                    </h3>
                    <p className="text-base font-medium mb-0.5" style={{ color: 'rgba(255,255,255,0.55)' }}>
                      {edu.school}
                    </p>
                    <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
                      {edu.location}
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

          {/* Work Experience */}
          <motion.p
            variants={fadeUp}
            className="text-xs font-medium tracking-[0.2em] uppercase mb-4"
            style={{ color: 'rgba(255,255,255,0.2)' }}
          >
            Work Experience
          </motion.p>
          <div className="flex flex-col gap-4">
            {workExperience.map((job, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                whileHover={{ scale: 1.01 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className="rounded-3xl"
                style={{
                  padding: '40px',
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.07)',
                }}
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-xl font-semibold mb-1.5" style={{ color: '#f5f5f7' }}>
                      {job.company}
                    </h3>
                    <p className="text-base font-medium mb-0.5" style={{ color: 'rgba(255,255,255,0.55)' }}>
                      {job.role}
                    </p>
                    <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>
                      {job.location}
                    </p>
                  </div>
                  <span
                    className="shrink-0 px-3 py-1 rounded-full text-xs font-mono self-start"
                    style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.3)' }}
                  >
                    {job.period}
                  </span>
                </div>
                <ul className="flex flex-col gap-2 mb-6">
                  {job.bullets.map((b, j) => (
                    <li key={j} className="flex gap-2 text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.35)' }}>
                      <span style={{ color: 'rgba(255,255,255,0.2)', flexShrink: 0 }}>·</span>
                      {b}
                    </li>
                  ))}
                </ul>
                <div className="flex flex-wrap gap-2">
                  {job.tags.map(tag => (
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
