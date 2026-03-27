import { useState } from 'react'
import { motion } from 'framer-motion'

const stagger = {
  hidden: {},
  show: { transition: { staggerChildren: 0.08 } },
}

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.25, 0.1, 0.25, 1] } },
}

const socials = [
  {
    label: 'GitHub',
    value: '@lebantion',
    href: 'https://github.com/lebantion',
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
      </svg>
    ),
  },
  {
    label: 'LinkedIn',
    value: 'SeongRok Ha',
    href: 'https://www.linkedin.com/in/seongrok-ha',
    icon: (
      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
      </svg>
    ),
  },
  {
    label: 'Email',
    value: 'lahel97@gmail.com',
    href: 'mailto:lahel97@gmail.com',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
    ),
  },
]

const inputStyle = {
  background: 'rgba(255,255,255,0.04)',
  border: '1px solid rgba(255,255,255,0.08)',
  color: '#f5f5f7',
  outline: 'none',
}

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [sent, setSent] = useState(false)

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = e => {
    e.preventDefault()
    const subject = encodeURIComponent(`Contact from ${form.name}`)
    const body = encodeURIComponent(`Name: ${form.name}\nEmail: ${form.email}\n\n${form.message}`)
    window.location.href = `mailto:lahel97@gmail.com?subject=${subject}&body=${body}`
    setSent(true)
  }

  return (
    <main style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', paddingTop: '80px', paddingBottom: '80px', paddingLeft: '24px', paddingRight: '24px' }}>
      <div style={{ maxWidth: '768px', margin: '0 auto', width: '100%' }}>
        <motion.div initial="hidden" animate="show" variants={stagger}>
          <motion.p
            variants={fadeUp}
            className="text-xs font-medium tracking-[0.2em] uppercase mb-4 text-center"
            style={{ color: 'rgba(255,255,255,0.25)' }}
          >
            Get in touch
          </motion.p>
          <motion.h1
            variants={fadeUp}
            className="text-5xl md:text-7xl font-bold text-center mb-6"
            style={{ color: '#f5f5f7', letterSpacing: '-0.03em' }}
          >
            Contact Me.
          </motion.h1>
          <motion.p
            variants={fadeUp}
            className="text-center text-lg mb-20"
            style={{ color: 'rgba(255,255,255,0.35)' }}
          >
            Have a question? I'd love to hear from you.
          </motion.p>

          {/* Social links */}
          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row gap-3" style={{ marginTop: '30px', marginBottom: '10px' }}>
            {socials.map(s => (
              <a
                key={s.label}
                href={s.href}
                target={s.href.startsWith('http') ? '_blank' : undefined}
                rel="noreferrer"
                className="flex-1 flex items-center gap-3 px-5 py-4 rounded-2xl transition-all duration-300 group"
                style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)' }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}
              >
                <span style={{ color: 'rgba(255,255,255,0.4)' }} className="group-hover:text-white/70 transition-colors">
                  {s.icon}
                </span>
                <div className="min-w-0">
                  <p className="text-xs mb-0.5" style={{ color: 'rgba(255,255,255,0.25)' }}>{s.label}</p>
                  <p className="text-sm truncate" style={{ color: 'rgba(255,255,255,0.6)' }}>{s.value}</p>
                </div>
              </a>
            ))}
          </motion.div>

          {/* Form */}
          <motion.form variants={fadeUp} onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div className="grid sm:grid-cols-2 gap-3" style={{ marginBottom: '10px' }}>
              {[
                { name: 'name', placeholder: 'Name', type: 'text' },
                { name: 'email', placeholder: 'Email', type: 'email' },
              ].map(f => (
                <input
                  key={f.name}
                  type={f.type}
                  name={f.name}
                  value={form[f.name]}
                  onChange={handleChange}
                  placeholder={f.placeholder}
                  required
                  className="w-full py-3.5 rounded-2xl text-sm placeholder:text-white/20 focus:border-white/20 transition-all"
                  style={{ ...inputStyle, paddingLeft: '32px', paddingRight: '20px' }}
                  onFocus={e => e.target.style.borderColor = 'rgba(255,255,255,0.2)'}
                  onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
                />
              ))}
            </div>
            <textarea
              name="message"
              value={form.message}
              onChange={handleChange}
              placeholder="Message"
              required
              rows={5}
              className="w-full py-3.5 rounded-2xl text-sm placeholder:text-white/20 resize-none transition-all"
              style={{ ...inputStyle, paddingLeft: '20px', paddingRight: '20px' }}
              onFocus={e => e.target.style.borderColor = 'rgba(255,255,255,0.2)'}
              onBlur={e => e.target.style.borderColor = 'rgba(255,255,255,0.08)'}
            />
            <motion.button
              type="submit"
              whileHover={{ scale: 1.01 }}
              whileTap={{ scale: 0.99 }}
              className="w-full py-3.5 rounded-2xl text-sm font-medium text-white transition-all duration-300"
              style={{ background: sent ? 'rgba(255,255,255,0.08)' : 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.1)' }}
            >
              {sent ? '✓ Sent' : 'Send Message'}
            </motion.button>
          </motion.form>
        </motion.div>
      </div>
    </main>
  )
}
