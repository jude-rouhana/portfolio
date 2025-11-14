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



  // Intersection Observer for active section - improved to better detect active section
  useEffect(() => {
    const sections = document.querySelectorAll('section[id]')
    
    // Function to determine which section is currently most visible
    const getActiveSection = () => {
      const scrollPosition = window.scrollY + 100 // Account for navbar + offset
      let activeSection = 'home'
      let maxScore = -1

      sections.forEach((section) => {
        const rect = section.getBoundingClientRect()
        // getBoundingClientRect() gives position relative to viewport, so add scrollY
        const sectionTop = rect.top + window.scrollY
        const sectionBottom = sectionTop + rect.height
        
        // Calculate how much of the section is visible in the viewport
        const viewportTop = window.scrollY
        const viewportBottom = window.scrollY + window.innerHeight
        
        // Calculate intersection
        const visibleTop = Math.max(sectionTop, viewportTop)
        const visibleBottom = Math.min(sectionBottom, viewportBottom)
        const visibleHeight = Math.max(0, visibleBottom - visibleTop)
        const visibilityRatio = visibleHeight / rect.height
        
        // Check if scroll position is within section bounds
        const isInRange = scrollPosition >= sectionTop && scrollPosition <= sectionBottom
        
        // Calculate a score: prioritize sections in range, then by visibility
        let score = visibilityRatio
        if (isInRange) {
          score += 1.0 // Boost score if scroll position is within section
        }
        
        // Also boost if section top is near the top of viewport (accounting for navbar)
        const distanceFromTop = Math.abs(rect.top - 80) // 80px = navbar height + spacing
        if (distanceFromTop < 200) {
          score += 0.5 * (1 - distanceFromTop / 200) // More boost the closer to top
        }
        
        if (score > maxScore) {
          maxScore = score
          activeSection = section.id
        }
      })

      return activeSection
    }

    // Use IntersectionObserver with better configuration
    const observer = new IntersectionObserver(
      (entries) => {
        // Check all sections to find the most visible one
        const active = getActiveSection()
        setActiveSection(active)
      },
      {
        root: null,
        rootMargin: '-80px 0px -50% 0px', // Account for navbar, trigger when section is near top
        threshold: [0, 0.1, 0.3, 0.5, 0.7, 1.0] // Multiple thresholds for better detection
      }
    )

    sections.forEach((section) => observer.observe(section))

    // Also listen to scroll events for more accurate detection (with requestAnimationFrame)
    let scrollFrameId = null
    const handleScroll = () => {
      // Clear previous frame request
      if (scrollFrameId !== null) {
        cancelAnimationFrame(scrollFrameId)
      }
      
      // Use requestAnimationFrame for smooth updates
      scrollFrameId = requestAnimationFrame(() => {
        const active = getActiveSection()
        setActiveSection(active)
        scrollFrameId = null
      })
    }

    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      observer.disconnect()
      window.removeEventListener('scroll', handleScroll)
      if (scrollFrameId !== null) {
        cancelAnimationFrame(scrollFrameId)
      }
    }
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