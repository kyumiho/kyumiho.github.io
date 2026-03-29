import { HashRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ThemeProvider } from './ThemeContext'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import AnimatedBackground from './components/AnimatedBackground'
import CustomCursor from './components/CustomCursor'
import Home from './pages/Home'
import Projects from './pages/Projects'
import Diploma from './pages/Diploma'
import Contact from './pages/Contact'

const noiseStyle = {
  position: 'fixed', inset: 0, pointerEvents: 'none', zIndex: 9990,
  backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
  backgroundSize: '160px 160px',
}

function AnimatedRoutes() {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={location.key}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -8 }}
        transition={{ duration: 0.22, ease: [0.25, 0.1, 0.25, 1] }}
      >
        <Routes location={location}>
          <Route path="/" element={<Home />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/diploma" element={<Diploma />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
        <Footer />
      </motion.div>
    </AnimatePresence>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <HashRouter>
        <AnimatedBackground />
        <div style={noiseStyle} className="noise-overlay" />
        <CustomCursor />
        <Navbar />
        <AnimatedRoutes />
      </HashRouter>
    </ThemeProvider>
  )
}
