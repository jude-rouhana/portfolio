import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Navbar from './components/Navbar'
import Hero from './components/Hero'
import About from './components/About'
import Projects from './components/Projects'
import Music from './components/Music'
import AdditionalProjects from './components/AdditionalProjects'
import Contact from './components/Contact'
import ScrollToTop from './components/ScrollToTop'
import ThemeToggle from './components/ThemeToggle'
import OceanBackground from './components/OceanBackground'
import FadeSection from './components/FadeSection'
import BackgroundTransition from './components/BackgroundTransition'
function App() {
  const [theme, setTheme] = useState('light')
  const [activeSection, setActiveSection] = useState('home')
  const [isScrolled, setIsScrolled] = useState(false)
  const [isGameMode, setIsGameMode] = useState(false)

  // Theme management
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'light'
    setTheme(savedTheme)
    document.documentElement.setAttribute('data-theme', savedTheme)
  }, [])

  // Scroll to top on page load/reload
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  // Prevent scroll bounce and ensure proper scroll boundaries
  useEffect(() => {
    const preventScrollBounce = (e) => {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop
      const scrollHeight = document.documentElement.scrollHeight
      const clientHeight = document.documentElement.clientHeight
      
      // Prevent scrolling above the top
      if (scrollTop <= 0 && e.deltaY < 0) {
        e.preventDefault()
        return false
      }
      
      // Prevent scrolling below the bottom
      if (scrollTop + clientHeight >= scrollHeight && e.deltaY > 0) {
        e.preventDefault()
        return false
      }
    }

    // Add event listeners for wheel and touch events
    document.addEventListener('wheel', preventScrollBounce, { passive: false })
    document.addEventListener('touchmove', preventScrollBounce, { passive: false })
    
    // Prevent overscroll behavior
    document.body.style.overscrollBehavior = 'none'
    document.documentElement.style.overscrollBehavior = 'none'

    return () => {
      document.removeEventListener('wheel', preventScrollBounce)
      document.removeEventListener('touchmove', preventScrollBounce)
      document.body.style.overscrollBehavior = ''
      document.documentElement.style.overscrollBehavior = ''
    }
  }, [])

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(newTheme)
    localStorage.setItem('theme', newTheme)
    document.documentElement.setAttribute('data-theme', newTheme)
  }



  // Intersection Observer for active section
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id)
          }
        })
      },
      { threshold: 0.5 }
    )

    const sections = document.querySelectorAll('section[id]')
    sections.forEach((section) => observer.observe(section))

    return () => observer.disconnect()
  }, [])



  return (
    <div className="min-h-screen bg-transparent text-contrast transition-colors duration-300 relative">
      {/* Background Transition Effect */}
      {!isGameMode && <BackgroundTransition />}
      
      {/* Ocean Background - Fixed position */}
      <OceanBackground onGameModeChange={setIsGameMode} />
      
      <AnimatePresence>
        {!isGameMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6 }}
            className="relative z-10"
          >
          {/* Navigation */}
          <Navbar activeSection={activeSection} theme={theme} />
          
          {/* Theme Toggle */}
          {/* <ThemeToggle theme={theme} toggleTheme={toggleTheme} activeSection={activeSection} /> */}

          {/* Main Content */}
          <main className="relative z-10">
            <Hero />
            <FadeSection delay={0.2} duration={2}>
              <About />
            </FadeSection>
            <FadeSection delay={0.2}>
              <Projects />
            </FadeSection>
            <FadeSection delay={0.2}>
              <Music />
            </FadeSection>
            <FadeSection delay={0.2}>
              <AdditionalProjects />
            </FadeSection>
            <FadeSection delay={0.2}>
              <Contact />
            </FadeSection>
          </main>

          {/* Scroll to Top Button */}
          <ScrollToTop />
        </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default App 