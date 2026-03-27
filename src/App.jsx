import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import AnimatedBackground from './components/AnimatedBackground'
import Home from './pages/Home'
import Projects from './pages/Projects'
import Diploma from './pages/Diploma'
import Contact from './pages/Contact'

export default function App() {
  return (
    <BrowserRouter>
      <AnimatedBackground />
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/projects" element={<Projects />} />
        <Route path="/diploma" element={<Diploma />} />
        <Route path="/contact" element={<Contact />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  )
}
