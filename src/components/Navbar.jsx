import { useState, useEffect } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useTheme } from '../ThemeContext'

const links = [
  { to: '/', label: 'Home' },
  { to: '/projects', label: 'Projects' },
  { to: '/diploma', label: 'Diploma' },
  { to: '/contact', label: 'Contact Me' },
]

function SunIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="5"/>
      <line x1="12" y1="1" x2="12" y2="3"/>
      <line x1="12" y1="21" x2="12" y2="23"/>
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
      <line x1="1" y1="12" x2="3" y2="12"/>
      <line x1="21" y1="12" x2="23" y2="12"/>
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
    </svg>
  )
}

function MoonIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
    </svg>
  )
}

export default function Navbar() {
  const { pathname } = useLocation()
  const { theme, toggleTheme } = useTheme()
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => setMenuOpen(false), [pathname])

  const isLight = theme === 'light'

  return (
    <motion.nav
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      style={{
        background: scrolled ? 'var(--clr-nav-bg)' : 'transparent',
        backdropFilter: scrolled ? 'saturate(180%) blur(20px)' : 'none',
        WebkitBackdropFilter: scrolled ? 'saturate(180%) blur(20px)' : 'none',
        borderBottom: scrolled ? '1px solid var(--clr-nav-border)' : '1px solid transparent',
      }}
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-500"
    >
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '0 24px' }} className="h-12 flex items-center justify-between">
        {/* Logo */}
        <Link to="/">
          <span className="flex items-center gap-1.5 text-sm font-medium tracking-tight" style={{ color: 'var(--clr-text-1)' }}>
            <span style={{ fontSize: '16px', lineHeight: 1 }}>✦</span>
            Simon Ha
          </span>
        </Link>

        {/* Desktop links */}
        <div className="hidden md:flex items-center" style={{ gap: '13px' }}>
          {links.map(({ to, label }) => (
            <Link key={to} to={to}>
              <span
                className="px-3 py-1.5 font-medium rounded-full transition-all duration-300"
                style={{
                  fontSize: '13px',
                  color: pathname === to ? 'var(--clr-text-1)' : 'var(--clr-nav-link)',
                  background: pathname === to ? 'var(--clr-nav-active-bg)' : 'transparent',
                }}
                onMouseEnter={e => { if (pathname !== to) e.currentTarget.style.color = 'var(--clr-text-1)' }}
                onMouseLeave={e => { if (pathname !== to) e.currentTarget.style.color = 'var(--clr-nav-link)' }}
              >
                {label}
              </span>
            </Link>
          ))}
        </div>

        {/* Right actions */}
        <div className="hidden md:flex items-center gap-2">
          {/* Theme toggle */}
          <button
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="flex items-center justify-center rounded-full transition-all duration-300"
            style={{
              width: '32px', height: '32px',
              background: 'var(--clr-resume-bg)',
              color: 'var(--clr-text-1)',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--clr-resume-hover)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--clr-resume-bg)'}
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={theme}
                initial={{ opacity: 0, rotate: -30, scale: 0.7 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={{ opacity: 0, rotate: 30, scale: 0.7 }}
                transition={{ duration: 0.18 }}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                {isLight ? <MoonIcon /> : <SunIcon />}
              </motion.span>
            </AnimatePresence>
          </button>

          {/* Resume */}
          <a
            href="/assets/RESUME.pdf"
            download
            className="px-4 py-1.5 text-xs font-medium rounded-full transition-all duration-300"
            style={{
              color: 'var(--clr-text-1)',
              background: 'var(--clr-resume-bg)',
            }}
            onMouseEnter={e => e.currentTarget.style.background = 'var(--clr-resume-hover)'}
            onMouseLeave={e => e.currentTarget.style.background = 'var(--clr-resume-bg)'}
          >
            Resume
          </a>
        </div>

        {/* Mobile hamburger */}
        <button
          className="md:hidden p-1"
          style={{ color: 'var(--clr-nav-link)' }}
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
            style={{
              background: isLight ? 'rgba(238,243,255,0.96)' : 'rgba(0,0,0,0.92)',
              backdropFilter: 'blur(20px)',
              WebkitBackdropFilter: 'blur(20px)',
              borderTop: '1px solid var(--clr-nav-border)',
            }}
            className="md:hidden"
          >
            <div className="px-6 py-4 flex flex-col gap-1">
              {links.map(({ to, label }) => (
                <Link
                  key={to}
                  to={to}
                  className="px-3 py-2.5 rounded-xl text-sm transition-colors"
                  style={{ color: pathname === to ? 'var(--clr-text-1)' : 'var(--clr-nav-link)' }}
                >
                  {label}
                </Link>
              ))}
              <div className="flex items-center gap-2 mt-2">
                <button
                  onClick={toggleTheme}
                  className="flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm transition-colors"
                  style={{ color: 'var(--clr-nav-link)' }}
                >
                  {isLight ? <MoonIcon /> : <SunIcon />}
                  {isLight ? 'Dark Mode' : 'Light Mode'}
                </button>
              </div>
              <a
                href="/assets/RESUME.pdf"
                download
                className="px-3 py-2.5 rounded-xl text-sm transition-colors"
                style={{ color: 'var(--clr-nav-link)' }}
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
