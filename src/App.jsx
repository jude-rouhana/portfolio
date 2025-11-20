import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'
import Home from './pages/Home'
import ExperimentalPage from './pages/ExperimentalPage'
import Projects from './pages/Projects'
import About from './pages/About'
import ScrollToTop from './components/ScrollToTop'
import Music from './pages/Music'
import Games from './pages/Games'
import Contact from './pages/Contact'

function App() {
  const location = useLocation()
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [mosaicCells, setMosaicCells] = useState([])
  const previousPathRef = useRef(location.pathname)
  const isInitialLoadRef = useRef(true)

  // Generate random opacity for #000052
  const getRandomShade = () => {
    // Base color #000052
    // Random opacity between 0.3 and 1.0 for variation
    const opacity = 1.0;
    return `rgba(0, 0, 82, ${opacity})`
  }

  // Generate mosaic cells
  useEffect(() => {
    if (isTransitioning) {
      const cellSize = 32
      const width = window.innerWidth
      const height = window.innerHeight
      const cols = Math.ceil(width / cellSize)
      const rows = Math.ceil(height / cellSize)
      
      const cells = []
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          cells.push({
            id: `${row}-${col}`,
            x: col * cellSize,
            y: row * cellSize,
            color: getRandomShade(),
            delay: Math.random() * 0.5 // Random delay between 0 and 0.5s
          })
        }
      }
      setMosaicCells(cells)
    }
    // Don't clear cells here - let the timer handle it after exit animation
  }, [isTransitioning])

  useEffect(() => {
    // Check if intro has already been shown in this session
    const introShown = sessionStorage.getItem('introShown')
    
    // Check if this is an initial site visit (external link or direct visit)
    const referrer = document.referrer
    const isInitialVisit = !referrer || !referrer.includes(window.location.hostname)
    
    // Skip transition on initial load if it's an initial visit AND intro hasn't been shown
    // (intro animation will play instead)
    if (isInitialLoadRef.current && isInitialVisit && !introShown) {
      isInitialLoadRef.current = false
      previousPathRef.current = location.pathname
      return
    }
    
    // Mark initial load as complete
    if (isInitialLoadRef.current) {
      isInitialLoadRef.current = false
    }
    
    // Show transition for all navigation (including to home page if not initial visit or intro already shown)
    setIsTransitioning(true)
    // Start exit animation after fade-in completes
    const exitTimer = setTimeout(() => {
      setIsTransitioning(false)
    }, 1000) // Wait for fade-in to complete, then trigger exit
    
    // Clear cells after exit animation completes
    const clearTimer = setTimeout(() => {
      setMosaicCells([])
    }, 2600) // Wait for both fade-in and fade-out to complete
    
    previousPathRef.current = location.pathname
    
    return () => {
      clearTimeout(exitTimer)
      clearTimeout(clearTimer)
    }
  }, [location.pathname])

  return (
    <>
      <ScrollToTop />
      {/* Mosaic Transition Overlay */}
      {mosaicCells.length > 0 && (
        <div
          className="fixed inset-0 z-[100] pointer-events-none overflow-hidden"
        >
      <AnimatePresence>
            {mosaicCells.map((cell) => (
          <motion.div
                key={cell.id}
                initial={{ opacity: 0 }}
            animate={{ 
                  opacity: isTransitioning ? 1 : 0,
              transition: {
                    duration: 0.3,
                    delay: isTransitioning ? cell.delay : Math.max(0, 0.5 - cell.delay),
                ease: "easeInOut"
              }
            }}
                className="absolute w-8 h-8"
                style={{
                  left: `${cell.x}px`,
                  top: `${cell.y}px`,
                  backgroundColor: cell.color
                }}
              />
            ))}
      </AnimatePresence>
        </div>
      )}
      
      {/* Page Content */}
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/sailing-game" element={<ExperimentalPage />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/games" element={<Games />} />
          <Route path="/music" element={<Music />} />
          <Route path="/contact" element={<Contact />} />
        </Routes>
      </AnimatePresence>
    </>
  )
}

export default App 