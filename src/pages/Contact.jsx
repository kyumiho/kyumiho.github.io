import { useState } from 'react'
import { motion } from 'framer-motion'

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  show: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.1, ease: 'easeOut' },
  }),
}

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', message: '' })
  const [status, setStatus] = useState(null)

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = e => {
    e.preventDefault()
    // mailto fallback
    const subject = encodeURIComponent(`Contact from ${form.name}`)
    const body = encodeURIComponent(`Name: ${form.name}\nEmail: ${form.email}\n\n${form.message}`)
    window.location.href = `mailto:your@email.com?subject=${subject}&body=${body}`
    setStatus('sent')
  }

  return (
    <main className="min-h-screen pt-24 pb-20 px-6 max-w-6xl mx-auto">
      <section className="py-16">
        <motion.div initial="hidden" animate="show">
          <motion.p variants={fadeUp} custom={0} className="text-xs font-mono text-violet-400 uppercase tracking-widest mb-3">
            Get in touch
          </motion.p>
          <motion.h1 variants={fadeUp} custom={1} className="text-4xl md:text-5xl font-bold text-white mb-4 tracking-tight">
            Contact Me
          </motion.h1>
          <motion.p variants={fadeUp} custom={2} className="text-zinc-400 text-lg mb-16 max-w-xl">
            Have a question or want to work together? Drop me a message.
          </motion.p>

          <div className="grid md:grid-cols-2 gap-12">
            {/* Info side */}
            <motion.div variants={fadeUp} custom={3} className="flex flex-col gap-6">
              <div className="p-6 rounded-2xl border border-white/8 bg-white/3">
                <h3 className="text-white font-semibold mb-4">Let's connect</h3>
                <div className="flex flex-col gap-3">
                  {[
                    {
                      icon: (
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                        </svg>
                      ),
                      label: 'GitHub',
                      href: 'https://github.com/lebantion',
                      value: '@lebantion',
                    },
                    {
                      icon: (
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                        </svg>
                      ),
                      label: 'LinkedIn',
                      href: '#',
                      value: 'LinkedIn Profile',
                    },
                    {
                      icon: (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      ),
                      label: 'Email',
                      href: 'mailto:your@email.com',
                      value: 'your@email.com',
                    },
                  ].map(item => (
                    <a
                      key={item.label}
                      href={item.href}
                      target={item.href.startsWith('http') ? '_blank' : undefined}
                      rel="noreferrer"
                      className="flex items-center gap-3 text-zinc-400 hover:text-white transition-colors group"
                    >
                      <span className="w-8 h-8 rounded-lg bg-white/5 border border-white/8 flex items-center justify-center text-violet-400 group-hover:bg-violet-500/10 group-hover:border-violet-500/30 transition-all">
                        {item.icon}
                      </span>
                      <span className="text-sm">{item.value}</span>
                    </a>
                  ))}
                </div>
              </div>
            </motion.div>

            {/* Form side */}
            <motion.form
              variants={fadeUp}
              custom={4}
              onSubmit={handleSubmit}
              className="flex flex-col gap-4"
            >
              {[
                { name: 'name', label: 'Name', type: 'text', placeholder: 'Your name' },
                { name: 'email', label: 'Email', type: 'email', placeholder: 'your@email.com' },
              ].map(field => (
                <div key={field.name}>
                  <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wide">
                    {field.label}
                  </label>
                  <input
                    type={field.type}
                    name={field.name}
                    value={form[field.name]}
                    onChange={handleChange}
                    placeholder={field.placeholder}
                    required
                    className="w-full px-4 py-3 rounded-xl bg-white/3 border border-white/8 text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/50 focus:bg-white/5 transition-all text-sm"
                  />
                </div>
              ))}

              <div>
                <label className="block text-xs font-medium text-zinc-400 mb-1.5 uppercase tracking-wide">
                  Message
                </label>
                <textarea
                  name="message"
                  value={form.message}
                  onChange={handleChange}
                  placeholder="What's on your mind?"
                  required
                  rows={5}
                  className="w-full px-4 py-3 rounded-xl bg-white/3 border border-white/8 text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/50 focus:bg-white/5 transition-all text-sm resize-none"
                />
              </div>

              <motion.button
                type="submit"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-violet-600 to-cyan-500 text-white font-medium text-sm hover:shadow-lg hover:shadow-violet-500/25 transition-all duration-300"
              >
                {status === 'sent' ? '✓ Message sent' : 'Send Message'}
              </motion.button>
            </motion.form>
          </div>
        </motion.div>
      </section>

      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-violet-600/8 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/3 w-80 h-80 bg-cyan-600/6 rounded-full blur-3xl" />
      </div>
    </main>
  )
}
