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
    role: 'MES Specialist · Lead Business System Analyst',
    period: 'Sep 2023 – Present',
    location: 'Duluth, GA',
    bullets: [
      'Analyze, design, develop, test, and implement improvements to Manufacturing Execution System (MES) processes, specifically focused on Formation.',
      'Define and guide efficient manufacturing system processes within process management, quality management, and equipment management.',
      'Operate local sites (SOR/SOP) and provide immediate support during system malfunctions.',
    ],
    tags: ['MES', 'Business Analysis', 'Process Design', 'Manufacturing'],
  },
]

const certificates = [
  {
    name: 'Lean Six Sigma Yellow Belt',
    issuer: 'Georgia Quick Start',
    issued: 'Sep 2025',
    tags: ['Lean Six Sigma', 'Process Improvement', 'Continuous Improvement'],
  },
]

const honors = [
  {
    title: 'Student Leadership Appreciation Award',
    issuer: 'Green River College',
    issued: 'Jun 2018',
  },
]

const organizations = [
  {
    name: 'Competitive Programming Club',
    affiliation: 'The Ohio State University',
    role: 'Member',
    period: 'Sep 2020 – May 2023',
    description: null,
  },
  {
    name: 'KID OSU',
    affiliation: 'The Ohio State University',
    role: 'Marketing Team Leader',
    period: 'Dec 2020 – Dec 2021',
    description: 'Provided information about Dokdo, advertised campus events, and designed promotional posts for the Korean community.',
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

function SectionLabel({ children }) {
  return (
    <motion.p
      variants={fadeUp}
      className="text-xs font-medium tracking-[0.2em] uppercase"
      style={{ color: 'rgba(255,255,255,0.2)', marginBottom: '19px' }}
    >
      {children}
    </motion.p>
  )
}

function SectionDivider() {
  return (
    <motion.div
      variants={fadeUp}
      style={{ height: '1px', background: 'rgba(255,255,255,0.06)', marginTop: '60px', marginBottom: '60px' }}
    />
  )
}

export default function Diploma() {
  return (
    <main className="min-h-screen flex items-center py-20 md:py-28 px-6">
      <div style={{ maxWidth: '768px', margin: '0 auto' }}>
        <motion.div initial="hidden" animate="show" variants={stagger} style={{ width: '100%' }}>

          {/* ── Header ── */}
          <motion.p
            variants={fadeUp}
            className="text-xs font-medium tracking-[0.2em] uppercase text-center"
            style={{ color: 'rgba(255,255,255,0.25)', marginBottom: '20px' }}
          >
            Education & Experience
          </motion.p>
          <motion.h1
            variants={fadeUp}
            className="text-5xl md:text-7xl font-bold text-center"
            style={{ color: '#f5f5f7', letterSpacing: '-0.03em', marginBottom: '16px' }}
          >
            Diploma.
          </motion.h1>
          <motion.p
            variants={fadeUp}
            className="text-center text-lg"
            style={{ color: 'rgba(255,255,255,0.35)', marginBottom: '40px' }}
          >
            My academic background and work experience.
          </motion.p>
          <motion.div
            variants={fadeUp}
            style={{ height: '1px', background: 'rgba(255,255,255,0.07)', marginBottom: '60px' }}
          />

          {/* ── Education ── */}
          <SectionLabel>Education</SectionLabel>
          <div className="flex flex-col gap-4">
            {education.map((edu, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                whileHover={{ scale: 1.01 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className="rounded-3xl"
                style={{ padding: '40px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-xl font-semibold mb-1.5" style={{ color: '#f5f5f7' }}>{edu.degree}</h3>
                    <p className="text-base font-medium mb-0.5" style={{ color: 'rgba(255,255,255,0.55)' }}>{edu.school}</p>
                    <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>{edu.location}</p>
                  </div>
                  <span className="shrink-0 px-3 py-1 rounded-full text-xs font-mono self-start"
                    style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.3)' }}>
                    {edu.period}
                  </span>
                </div>
                <p className="text-sm leading-relaxed mb-6" style={{ color: 'rgba(255,255,255,0.35)' }}>{edu.description}</p>
                <div className="flex flex-wrap gap-2">
                  {edu.tags.map(tag => (
                    <span key={tag} className="px-3 py-1 rounded-full text-xs"
                      style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.45)' }}>
                      {tag}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          <SectionDivider />

          {/* ── Work Experience ── */}
          <SectionLabel>Work Experience</SectionLabel>
          <div className="flex flex-col gap-4">
            {workExperience.map((job, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                whileHover={{ scale: 1.01 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className="rounded-3xl p-6 md:p-10"
                style={{
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid rgba(255,255,255,0.07)',
                }}
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                  <div>
                    <h3 className="text-xl font-semibold mb-1.5" style={{ color: '#f5f5f7' }}>{job.company}</h3>
                    <p className="text-base font-medium mb-0.5" style={{ color: 'rgba(255,255,255,0.55)' }}>{job.role}</p>
                    <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>{job.location}</p>
                  </div>
                  <span className="shrink-0 px-3 py-1 rounded-full text-xs font-mono self-start"
                    style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.3)' }}>
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
                    <span key={tag} className="px-3 py-1 rounded-full text-xs"
                      style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.45)' }}>
                      {tag}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          <SectionDivider />

          {/* ── Certificates ── */}
          <SectionLabel>Certificates</SectionLabel>
          <div className="flex flex-col gap-3">
            {certificates.map((cert, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                whileHover={{ scale: 1.01 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className="rounded-2xl"
                style={{ padding: '28px 32px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 mb-3">
                  <div>
                    <h3 className="text-base font-semibold mb-0.5" style={{ color: '#f5f5f7' }}>{cert.name}</h3>
                    <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>{cert.issuer}</p>
                  </div>
                  <span className="shrink-0 px-3 py-1 rounded-full text-xs font-mono self-start"
                    style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.3)' }}>
                    {cert.issued}
                  </span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {cert.tags.map(tag => (
                    <span key={tag} className="px-2.5 py-1 rounded-full text-xs"
                      style={{ background: 'rgba(255,255,255,0.07)', color: 'rgba(255,255,255,0.45)' }}>
                      {tag}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          <SectionDivider />

          {/* ── Honors & Awards ── */}
          <SectionLabel>Honors & Awards</SectionLabel>
          <div className="flex flex-col gap-3">
            {honors.map((h, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                whileHover={{ scale: 1.01 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className="rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3"
                style={{ padding: '28px 32px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <div>
                  <h3 className="text-base font-semibold mb-0.5" style={{ color: '#f5f5f7' }}>{h.title}</h3>
                  <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>{h.issuer}</p>
                </div>
                <span className="shrink-0 px-3 py-1 rounded-full text-xs font-mono self-start"
                  style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.3)' }}>
                  {h.issued}
                </span>
              </motion.div>
            ))}
          </div>

          <SectionDivider />

          {/* ── Organizations ── */}
          <SectionLabel>Organizations</SectionLabel>
          <div className="flex flex-col gap-3">
            {organizations.map((org, i) => (
              <motion.div
                key={i}
                variants={fadeUp}
                whileHover={{ scale: 1.01 }}
                transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                className="rounded-2xl"
                style={{ padding: '28px 32px', background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
              >
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-3 mb-2">
                  <div>
                    <h3 className="text-base font-semibold mb-0.5" style={{ color: '#f5f5f7' }}>{org.name}</h3>
                    <p className="text-sm mb-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>{org.role}</p>
                    <p className="text-xs" style={{ color: 'rgba(255,255,255,0.3)' }}>{org.affiliation}</p>
                  </div>
                  <span className="shrink-0 px-3 py-1 rounded-full text-xs font-mono self-start"
                    style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.3)' }}>
                    {org.period}
                  </span>
                </div>
                {org.description && (
                  <p className="text-sm leading-relaxed mt-2" style={{ color: 'rgba(255,255,255,0.35)' }}>
                    {org.description}
                  </p>
                )}
              </motion.div>
            ))}
          </div>

        </motion.div>
      </div>
    </main>
  )
}
