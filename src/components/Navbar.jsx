import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'

const links = [
  { to: '/', label: 'Home' },
  { to: '/projects', label: 'Projects' },
  { to: '/diploma', label: 'Diploma' },
  { to: '/contact', label: 'Contact Me' },
]

export default function Navbar() {
  const { pathname } = useLocation()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => setMenuOpen(false), [pathname])

  return (
    <motion.nav
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      style={{
        background: scrolled ? 'rgba(0,0,0,0.72)' : 'transparent',
        backdropFilter: scrolled ? 'saturate(180%) blur(20px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'saturate(180%) blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.08)' : '1px solid transparent',
      }}
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
    >
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '0 24px' }} className="h-12 flex items-center justify-between">
        {/* Logo */}
        <Link to="/">
          <span className="text-sm font-medium text-white/90 tracking-tight">
            Simon Ha
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center" style={{ gap: '13px' }}>
          {links.map(({ to, label }) => (
            <Link key={to} to={to}>
              <span
                className={`px-3 py-1.5 font-medium rounded-full transition-all duration-300 ${
                  pathname === to
                    ? 'text-white bg-white/10'
                    : 'text-white/60 hover:text-white/90'
                }`}
                style={{ fontSize: '13px' }}
              >
                {label}
              </span>
            </Link>
          ))}
        </div>

        {/* Resume button */}
        <div className="hidden md:block">
          <a
            href="/assets/Resume.pdf"
            download
            className="px-4 py-1.5 text-xs font-medium text-white bg-white/10 hover:bg-white/20 rounded-full border-none transition-all duration-300"
          >
            Resume
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden text-white/60 hover:text-white p-1"
          onClick={() => setMenuOpen(v => !v)}
        >
          <div className="w-5 flex flex-col gap-1.5">
            <span className={`block h-px bg-current transition-all duration-300 origin-center ${menuOpen ? 'rotate-45 translate-y-[7px]' : ''}`} />
            <span className={`block h-px bg-current transition-all duration-300 ${menuOpen ? 'opacity-0' : ''}`} />
            <span className={`block h-px bg-current transition-all duration-300 origin-center ${menuOpen ? '-rotate-45 -translate-y-[7px]' : ''}`} />
          </div>
        </button>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            style={{ background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(20px)' }}
            className="md:hidden border-t border-white/8"
          >
            <div className="px-6 py-4 flex flex-col gap-1">
              {links.map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  className={`px-3 py-2.5 rounded-xl text-sm transition-colors ${
                    pathname === to ? 'text-white bg-white/8' : 'text-white/60 hover:text-white'
                  }`}
                >
                  {label}
                </Link>
              ))}
              <a
                href="/assets/Resume.pdf"
                download
                className="mt-2 px-3 py-2.5 rounded-xl text-sm text-white/60 hover:text-white transition-colors"
              >
                Resume ↓
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.nav>
  )
}
