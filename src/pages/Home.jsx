import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'

function Home() {
  // Initialize showIntro - will be set based on whether it's an initial visit
  const [showIntro, setShowIntro] = useState(false)
  const [startLetterWave, setStartLetterWave] = useState(false)
  const [logoReveal, setLogoReveal] = useState(false)
  const [isShiftHeld, setIsShiftHeld] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  
  // Canvas mode states
  const [isCanvasMode, setIsCanvasMode] = useState(false)
  const [canvasPixels, setCanvasPixels] = useState({})
  const [canvasHistory, setCanvasHistory] = useState([])
  const [selectedColor, setSelectedColor] = useState('#0d2b45')
  const [toolMode, setToolMode] = useState('draw')
  const [isDrawing, setIsDrawing] = useState(false)
  
  // Color palette - 9 colors
  const colorPalette = [
    '#000000',
    '#000052',
    '#0d2b45',
    '#203c56',
    '#544e68',
    '#8d697a',
    '#d08159',
    '#ffaa5e',
    '#ffd4a3',
    '#ffecd6',
    '#ffffff',
  ]

  const LETTER_WAVE_DELAY = 2500
  const LOGO_REVEAL_DELAY = 1500
  const INTRO_HIDE_DELAY = 3800

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMenuOpen && !event.target.closest('nav')) {
        setIsMenuOpen(false)
      }
    }

    if (isMenuOpen) {
      document.addEventListener('click', handleClickOutside)
      document.addEventListener('touchstart', handleClickOutside)
    }

    return () => {
      document.removeEventListener('click', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [isMenuOpen])

  // Scroll to top and prevent scrolling during intro animation
  useEffect(() => {
    // Scroll to top on page load
    window.scrollTo(0, 0)
    
    // Prevent scrolling during intro animation
    if (showIntro) {
      document.body.classList.add('no-scroll')
      document.body.classList.add('hide-navbar')
    } else {
      document.body.classList.remove('no-scroll')
      document.body.classList.remove('hide-navbar')
    }

    // Cleanup function to restore scrolling
    return () => {
      document.body.classList.remove('no-scroll')
      document.body.classList.remove('hide-navbar')
    }
  }, [showIntro])

  // Intro animation effect - only play on initial site visit (external link)
  useEffect(() => {
    // Check if intro has already been shown in this session
    const introShown = sessionStorage.getItem('introShown')
    
    // Check if this is an initial site visit (external link or direct visit)
    const referrer = document.referrer
    const isInitialVisit = !referrer || !referrer.includes(window.location.hostname)
    
    // Only show intro on initial visit AND if it hasn't been shown in this session
    if (isInitialVisit && !introShown) {
      // Mark intro as shown in session storage
      sessionStorage.setItem('introShown', 'true')
      
    setShowIntro(true)
    setStartLetterWave(false)
    setLogoReveal(false)
    
    const timer = setTimeout(() => {
      setStartLetterWave(true) // Start letter wave animation
    }, LETTER_WAVE_DELAY)

    const logoTimer = setTimeout(() => {
      setLogoReveal(true)
    }, LOGO_REVEAL_DELAY)
    
    const hideTimer = setTimeout(() => {
      setShowIntro(false) // Hide intro after wave completes
    }, INTRO_HIDE_DELAY)
    
    return () => {
      clearTimeout(timer)
      clearTimeout(logoTimer)
      clearTimeout(hideTimer)
      }
    } else {
      // Internal navigation or intro already shown - skip intro
      setShowIntro(false)
      setStartLetterWave(false)
      setLogoReveal(false)
    }
  }, []) // Empty dependency array ensures this runs only on mount

  const firstNameLetters = ['J', 'U', 'D', 'E']
  const lastNameLetters = ['R', 'O', 'U', 'H', 'A', 'N', 'A']

  const renderLetters = (letters, offset = 0) =>
    letters.map((letter, index) => (
      <motion.span
        key={`${offset}-${letter}-${index}`}
        initial={{ opacity: 0, y: 20 }}
        animate={{ 
          opacity: startLetterWave ? 0 : 1, 
          y: startLetterWave ? -20 : 0,
          transition: {
            duration: 0.3,
            delay: startLetterWave ? (offset + index) * 0.02 : 0.2 + (offset + index) * 0.02,
            ease: "easeOut"
          }
        }}
        className="inline-block"
      >
        {letter}
      </motion.span>
    ))

  const [trailCells, setTrailCells] = useState([])
  const lastCellRef = useRef(null)
  const timeoutsRef = useRef([])
  const heldCellsRef = useRef([])
  const shiftHeldRef = useRef(false)
  const touchHoldTimeoutRef = useRef(null)
  const touchStartTimeRef = useRef(null)

  useEffect(() => {
    if (showIntro || isCanvasMode) {
      setTrailCells([])
      lastCellRef.current = null
      timeoutsRef.current.forEach(clearTimeout)
      timeoutsRef.current = []
      heldCellsRef.current = []
      shiftHeldRef.current = false
      setIsShiftHeld(false)
      if (touchHoldTimeoutRef.current) {
        clearTimeout(touchHoldTimeoutRef.current)
        touchHoldTimeoutRef.current = null
      }
      touchStartTimeRef.current = null
      return
    }

    let animationFrameId = null

    const handleMouseMove = (event) => {
      const snappedX = Math.floor(event.clientX / 32) * 32
      const snappedY = Math.floor(event.clientY / 32) * 32
      const cellKey = `${snappedX}-${snappedY}`

      if (lastCellRef.current === cellKey) return
      lastCellRef.current = cellKey

      if (animationFrameId) cancelAnimationFrame(animationFrameId)

      animationFrameId = requestAnimationFrame(() => {
        const timestamp = performance.now()
        const id = `${cellKey}-${timestamp}`
        const newCell = { id, x: snappedX, y: snappedY, createdAt: timestamp }
        setTrailCells(prev => [...prev, newCell])

        if (shiftHeldRef.current) {
          heldCellsRef.current.push(id)
        } else {
          const timeoutId = setTimeout(() => {
            setTrailCells(prev => prev.filter(cell => cell.id !== id))
          }, 600)

          timeoutsRef.current.push(timeoutId)
        }
      })
    }

    const handleMouseLeave = () => {
      lastCellRef.current = null
    }

    const handleKeyDown = (event) => {
      if (event.key === 'Shift') {
        shiftHeldRef.current = true
        setIsShiftHeld(true)
      }
    }

    const handleKeyUp = (event) => {
      if (event.key === 'Shift') {
        shiftHeldRef.current = false
        setIsShiftHeld(false)
        const releaseCells = heldCellsRef.current
        heldCellsRef.current = []

        releaseCells.forEach((cellId, index) => {
          const timeoutId = setTimeout(() => {
            setTrailCells(prev => prev.filter(cell => cell.id !== cellId))
          }, 200 + index * 60)
          timeoutsRef.current.push(timeoutId)
        })
      }
    }

    const handleTouchStart = (event) => {
      touchStartTimeRef.current = Date.now()
      // Clear any existing timeout
      if (touchHoldTimeoutRef.current) {
        clearTimeout(touchHoldTimeoutRef.current)
      }
      // Set timeout for 2 seconds
      touchHoldTimeoutRef.current = setTimeout(() => {
        shiftHeldRef.current = true
        setIsShiftHeld(true)
      }, 2000)
    }

    const handleTouchEnd = (event) => {
      // Clear the timeout if touch ends before 2 seconds
      if (touchHoldTimeoutRef.current) {
        clearTimeout(touchHoldTimeoutRef.current)
        touchHoldTimeoutRef.current = null
      }
      
      // If shift was held (touch was held for 2+ seconds), release it
      if (shiftHeldRef.current) {
        shiftHeldRef.current = false
        setIsShiftHeld(false)
        const releaseCells = heldCellsRef.current
        heldCellsRef.current = []

        releaseCells.forEach((cellId, index) => {
          const timeoutId = setTimeout(() => {
            setTrailCells(prev => prev.filter(cell => cell.id !== cellId))
          }, 200 + index * 60)
          timeoutsRef.current.push(timeoutId)
        })
      }
      
      touchStartTimeRef.current = null
    }

    const handleTouchMove = (event) => {
      const touch = event.touches[0]
      if (touch) {
        const snappedX = Math.floor(touch.clientX / 32) * 32
        const snappedY = Math.floor(touch.clientY / 32) * 32
        const cellKey = `${snappedX}-${snappedY}`

        if (lastCellRef.current === cellKey) return
        lastCellRef.current = cellKey

        if (animationFrameId) cancelAnimationFrame(animationFrameId)

        animationFrameId = requestAnimationFrame(() => {
          const timestamp = performance.now()
          const id = `${cellKey}-${timestamp}`
          const newCell = { id, x: snappedX, y: snappedY, createdAt: timestamp }
          setTrailCells(prev => [...prev, newCell])

          if (shiftHeldRef.current) {
            heldCellsRef.current.push(id)
          } else {
            const timeoutId = setTimeout(() => {
              setTrailCells(prev => prev.filter(cell => cell.id !== id))
            }, 600)

            timeoutsRef.current.push(timeoutId)
          }
        })
      }
    }

    window.addEventListener('mousemove', handleMouseMove)
    window.addEventListener('mouseleave', handleMouseLeave)
    window.addEventListener('keydown', handleKeyDown)
    window.addEventListener('keyup', handleKeyUp)
    window.addEventListener('touchstart', handleTouchStart, { passive: true })
    window.addEventListener('touchend', handleTouchEnd, { passive: true })
    window.addEventListener('touchmove', handleTouchMove, { passive: true })

    return () => {
      window.removeEventListener('mousemove', handleMouseMove)
      window.removeEventListener('mouseleave', handleMouseLeave)
      window.removeEventListener('keydown', handleKeyDown)
      window.removeEventListener('keyup', handleKeyUp)
      window.removeEventListener('touchstart', handleTouchStart)
      window.removeEventListener('touchend', handleTouchEnd)
      window.removeEventListener('touchmove', handleTouchMove)
      lastCellRef.current = null
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId)
      }
      if (touchHoldTimeoutRef.current) {
        clearTimeout(touchHoldTimeoutRef.current)
        touchHoldTimeoutRef.current = null
      }
      timeoutsRef.current.forEach(clearTimeout)
      timeoutsRef.current = []
      heldCellsRef.current = []
      shiftHeldRef.current = false
      touchStartTimeRef.current = null
    }
  }, [showIntro, isCanvasMode])

  // Prevent scrolling in canvas mode
  useEffect(() => {
    if (isCanvasMode) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isCanvasMode])

  // Escape key handler
  useEffect(() => {
    const handleEscape = (event) => {
      if (event.key === 'Escape' && isCanvasMode) {
        setIsCanvasMode(false)
      }
    }
    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [isCanvasMode])

  // Canvas drawing handlers
  const canvasLastCellRef = useRef(null)
  const canvasContainerRef = useRef(null)
  const toolModeRef = useRef(toolMode)
  const selectedColorRef = useRef(selectedColor)
  const canvasPixelsRef = useRef(canvasPixels)
  
  // Keep refs in sync with state
  useEffect(() => {
    toolModeRef.current = toolMode
    selectedColorRef.current = selectedColor
    canvasPixelsRef.current = canvasPixels
  }, [toolMode, selectedColor, canvasPixels])

  const getSnappedCoordinates = (clientX, clientY) => {
    const snappedX = Math.floor(clientX / 32) * 32
    const snappedY = Math.floor(clientY / 32) * 32
    return { snappedX, snappedY }
  }

  const saveStateToHistory = () => {
    setCanvasHistory(prev => [...prev, JSON.parse(JSON.stringify(canvasPixels))])
  }

  const drawPixel = (x, y, isFirstPixel = false) => {
    const { snappedX, snappedY } = getSnappedCoordinates(x, y)
    const cellKey = `${snappedX}-${snappedY}`
    
    if (canvasLastCellRef.current === cellKey) return
    canvasLastCellRef.current = cellKey

    // Save state to history when starting a new stroke
    if (isFirstPixel) {
      saveStateToHistory()
    }

    if (toolMode === 'erase') {
      setCanvasPixels(prev => {
        const newPixels = { ...prev }
        delete newPixels[cellKey]
        return newPixels
      })
    } else {
      setCanvasPixels(prev => ({
        ...prev,
        [cellKey]: selectedColor
      }))
    }
  }

  const handleCanvasMouseDown = (event) => {
    if (!isCanvasMode) return
    // Don't draw if clicking on tools panel or buttons
    if (event.target.closest('.canvas-tools-panel')) return
    setIsDrawing(true)
    drawPixel(event.clientX, event.clientY, true)
  }

  const handleCanvasMouseMove = (event) => {
    if (!isCanvasMode || !isDrawing) return
    // Don't draw if over tools panel
    if (event.target.closest('.canvas-tools-panel')) return
    drawPixel(event.clientX, event.clientY)
  }

  const handleCanvasMouseUp = () => {
    if (!isCanvasMode) return
    setIsDrawing(false)
    canvasLastCellRef.current = null
  }

  const handleCanvasTouchStart = (event) => {
    if (!isCanvasMode) return
    // Don't draw if touching tools panel
    if (event.target.closest('.canvas-tools-panel')) {
      return
    }
    event.preventDefault()
    const touch = event.touches[0]
    if (touch) {
      setIsDrawing(true)
      drawPixel(touch.clientX, touch.clientY)
    }
  }

  const handleCanvasTouchMove = (event) => {
    if (!isCanvasMode || !isDrawing) return
    // Don't draw if over tools panel
    if (event.target.closest('.canvas-tools-panel')) return
    event.preventDefault()
    const touch = event.touches[0]
    if (touch) {
      drawPixel(touch.clientX, touch.clientY)
    }
  }

  const handleCanvasTouchEnd = () => {
    if (!isCanvasMode) return
    setIsDrawing(false)
    canvasLastCellRef.current = null
  }

  // Add touch event listeners with passive: false to allow preventDefault
  useEffect(() => {
    if (!isCanvasMode || !canvasContainerRef.current) return

    const container = canvasContainerRef.current

    const touchStartHandler = (event) => {
      if (!isCanvasMode) return
      // Don't draw if touching tools panel
      if (event.target.closest('.canvas-tools-panel')) {
        return
      }
      event.preventDefault()
      const touch = event.touches[0]
      if (touch) {
        setIsDrawing(true)
        // Save state to history when starting a new stroke
        setCanvasHistory(prev => [...prev, JSON.parse(JSON.stringify(canvasPixelsRef.current))])
        
        const { snappedX, snappedY } = getSnappedCoordinates(touch.clientX, touch.clientY)
        const cellKey = `${snappedX}-${snappedY}`
        
        if (canvasLastCellRef.current === cellKey) return
        canvasLastCellRef.current = cellKey

        if (toolModeRef.current === 'erase') {
          setCanvasPixels(prev => {
            const newPixels = { ...prev }
            delete newPixels[cellKey]
            return newPixels
          })
        } else {
          setCanvasPixels(prev => ({
            ...prev,
            [cellKey]: selectedColorRef.current
          }))
        }
      }
    }

    const touchMoveHandler = (event) => {
      if (!isCanvasMode || !isDrawing) return
      // Don't draw if over tools panel
      if (event.target.closest('.canvas-tools-panel')) return
      event.preventDefault()
      const touch = event.touches[0]
      if (touch) {
        const { snappedX, snappedY } = getSnappedCoordinates(touch.clientX, touch.clientY)
        const cellKey = `${snappedX}-${snappedY}`
        
        if (canvasLastCellRef.current === cellKey) return
        canvasLastCellRef.current = cellKey

        if (toolModeRef.current === 'erase') {
          setCanvasPixels(prev => {
            const newPixels = { ...prev }
            delete newPixels[cellKey]
            return newPixels
          })
        } else {
          setCanvasPixels(prev => ({
            ...prev,
            [cellKey]: selectedColorRef.current
          }))
        }
      }
    }

    const touchEndHandler = () => {
      if (!isCanvasMode) return
      setIsDrawing(false)
      canvasLastCellRef.current = null
    }

    container.addEventListener('touchstart', touchStartHandler, { passive: false })
    container.addEventListener('touchmove', touchMoveHandler, { passive: false })
    container.addEventListener('touchend', touchEndHandler, { passive: false })

    return () => {
      container.removeEventListener('touchstart', touchStartHandler)
      container.removeEventListener('touchmove', touchMoveHandler)
      container.removeEventListener('touchend', touchEndHandler)
    }
  }, [isCanvasMode, isDrawing])

  const clearCanvas = () => {
    saveStateToHistory()
    setCanvasPixels({})
  }

  const undoCanvas = () => {
    if (canvasHistory.length === 0) return
    const previousState = canvasHistory[canvasHistory.length - 1]
    setCanvasHistory(prev => prev.slice(0, -1))
    setCanvasPixels(JSON.parse(JSON.stringify(previousState)))
  }

  const saveCanvas = () => {
    if (Object.keys(canvasPixels).length === 0) {
      alert('Canvas is empty!')
      return
    }

    // Calculate bounds
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity
    Object.keys(canvasPixels).forEach(key => {
      const [x, y] = key.split('-').map(Number)
      minX = Math.min(minX, x)
      minY = Math.min(minY, y)
      maxX = Math.max(maxX, x)
      maxY = Math.max(maxY, y)
    })

    const width = (maxX - minX) / 32 + 1
    const height = (maxY - minY) / 32 + 1

    // Create canvas
    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const ctx = canvas.getContext('2d')

    // Fill with white background
    ctx.fillStyle = '#FFFFFF'
    ctx.fillRect(0, 0, width, height)

    // Draw pixels
    Object.entries(canvasPixels).forEach(([key, color]) => {
      const [x, y] = key.split('-').map(Number)
      const pixelX = (x - minX) / 32
      const pixelY = (y - minY) / 32
      ctx.fillStyle = color
      ctx.fillRect(pixelX, pixelY, 1, 1)
    })

    // Convert to blob and download
    canvas.toBlob((blob) => {
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `pixel-art-${Date.now()}.png`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      URL.revokeObjectURL(url)
    }, 'image/png')
  }

  return (
    <div
      className="min-h-screen bg-white text-[#000052] relative"
      style={{
        backgroundImage: `
          linear-gradient(rgba(0, 0, 0, 0.08) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0, 0, 0, 0.08) 1px, transparent 1px),
          url('/paper texture.jpg')
        `,
        backgroundSize: '32px 32px, 32px 32px, cover',
        backgroundPosition: '0 0, 0 0, center',
        backgroundRepeat: 'repeat, repeat, no-repeat',
        backgroundAttachment: 'fixed, fixed, fixed'
      }}
    >
      <AnimatePresence>
        {!showIntro &&
          trailCells.map(cell => (
            <motion.div
              key={cell.id}
              className="fixed w-8 h-8 bg-[#000052] pointer-events-none z-0"
              style={{ top: cell.y, left: cell.x }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.75 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.45 }}
            />
          ))}
      </AnimatePresence>
      {/* Intro Overlay with Wavy Animation */}
      <AnimatePresence>
        {showIntro && (
          <motion.div
            key="intro-overlay"
            className="fixed inset-0 bg-[#000052] z-50 flex items-center justify-center"
            initial={{ opacity: 1 }}
            animate={{ opacity: startLetterWave ? 0 : 1 }}
            transition={{ duration: 2, ease: "easeInOut" }}
            exit={{
              opacity: 0,
              transition: {
                duration: 2,
                ease: "easeInOut"
              }
            }}
          >
            {/* Simple fade-out animation without white flashes */}
            <motion.div
              className="absolute inset-0"
              initial={{ opacity: 1 }}
              exit={{
                opacity: 0,
                transition: {
                  duration: 2.5,
                  ease: "easeInOut"
                }
              }}
            />
            
            {/* Portfolio Title - Centered Container */}
            <div className="flex flex-col items-center justify-center">
              <motion.h1
                key="intro-title"
                className="text-3xl sm:text-4xl md:text-6xl font-bold text-white text-center"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 1,
                  ease: "easeOut"
                }}
              >
                {/* Jude Rouhana with expandable spacing */}
                <motion.div
                  className="flex items-center justify-center"
                  animate={{ gap: logoReveal ? 96 : 8 }}
                  initial={{ gap: 8 }}
                  transition={{ duration: 0.7, ease: "easeInOut" }}
                >
                  <div className="flex justify-center items-center">
                    {renderLetters(firstNameLetters, 0)}
                  </div>

                  <motion.div
                    className="flex justify-center items-center overflow-hidden"
                    style={{ minWidth: 0 }}
                    initial={{ opacity: 0, scale: 0.9, maxWidth: 0 }}
                    animate={{ 
                      opacity: logoReveal ? (startLetterWave ? 0 : 1) : 0,
                      scale: logoReveal ? 1 : 0.9,
                      maxWidth: logoReveal ? 120 : 0
                    }}
                    transition={{
                      duration: 0.6,
                      ease: "easeInOut"
                    }}
                  >
                    <img
                      src="/logo/Logo%20block%20color.png"
                      alt="JR Logo"
                      className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 object-contain"
                    />
                  </motion.div>

                  <div className="flex justify-center items-center">
                    {renderLetters(lastNameLetters, firstNameLetters.length)}
                  </div>
                </motion.div>
              </motion.h1>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Shift Instruction - only show when not in canvas mode */}
      {!isCanvasMode && (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: showIntro ? 0 : 1 }}
        transition={{ duration: 0.6, delay: showIntro ? 0 : 1.3 }}
          className="fixed top-28 md:top-20 right-4 z-10 bg-white border border-black px-5 py-3 text-sm font-medium text-[#000052]"
        style={{ visibility: showIntro ? 'hidden' : 'visible' }}
      >
        {isMobile ? (
          <>Press and <span className="font-bold">HOLD</span> to color</>
        ) : (
          <>Press and hold <span className="font-bold">SHIFT</span> to color</>
        )}
      </motion.div>
      )}

      {/* Canvas Pixels Rendering */}
      <AnimatePresence>
        {isCanvasMode && Object.entries(canvasPixels).map(([key, color]) => {
          const [x, y] = key.split('-').map(Number)
          return (
            <motion.div
              key={key}
              className="fixed w-8 h-8 pointer-events-none z-20"
              style={{ 
                top: y, 
                left: x, 
                backgroundColor: color 
              }}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            />
          )
        })}
      </AnimatePresence>

      {/* Main Content */}
      <div className="min-h-screen flex flex-col relative z-10">
        {/* Navigation */}
        <motion.nav
          initial={{ opacity: 0 }}
          animate={{ opacity: showIntro ? 0 : 1 }}
          transition={{ duration: 0.6, delay: showIntro ? 0 : 1.3 }}
          className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-black"
          style={{ visibility: showIntro ? 'hidden' : 'visible' }}
        >
          <div className="w-full px-6 sm:px-8 lg:px-12 py-4">
            <div className="flex justify-between items-center">              
              <Link to="/" className="flex items-center gap-2 text-xl font-bold tracking-tight text-[#000052]">
                <img 
                  src="/logo/Logo%20block%20color.png" 
                  alt="JR Logo" 
                  className="w-8 h-8 object-contain"
                />
                Jude Rouhana
              </Link>
              <div className="hidden md:flex space-x-8 text-sm font-medium">
                <Link to="/about" className="text-[#000052] hover:opacity-80 transition-colors">About</Link>
                <Link to="/projects" className="text-[#000052] hover:opacity-80 transition-colors">Projects</Link>
                <Link to="/music" className="text-[#000052] hover:opacity-80 transition-colors">Music</Link>
                <Link to="/games" className="text-[#000052] hover:opacity-80 transition-colors">Games</Link>
                <Link to="/contact" className="text-[#000052] hover:opacity-80 transition-colors">Contact</Link>
              </div>
              <div className="md:hidden relative">
                <motion.button
                  className="p-2 rounded-none focus:outline-none text-[#000052]"
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  whileTap={{ scale: 0.95 }}
                  aria-label="Toggle menu"
                >
                  <div className="w-6 h-6 flex flex-col justify-center items-center space-y-1.5">
                    <motion.span
                      className="block w-6 h-0.5 bg-[#000052] transition-all duration-300"
                      animate={{
                        rotate: isMenuOpen ? 45 : 0,
                        y: isMenuOpen ? 6 : 0
                      }}
                    />
                    <motion.span
                      className="block w-6 h-0.5 bg-[#000052] transition-all duration-300"
                      animate={{
                        opacity: isMenuOpen ? 0 : 1
                      }}
                    />
                    <motion.span
                      className="block w-6 h-0.5 bg-[#000052] transition-all duration-300"
                      animate={{
                        rotate: isMenuOpen ? -45 : 0,
                        y: isMenuOpen ? -6 : 0
                      }}
                    />
              </div>
                </motion.button>

                {/* Mobile Dropdown Menu */}
                <AnimatePresence>
                  {isMenuOpen && (
                    <motion.div
                      className="absolute right-0 top-full mt-2 w-48 bg-white border border-black shadow-lg rounded-none overflow-hidden z-50"
                      initial={{ opacity: 0, y: -10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -10, scale: 0.95 }}
                      transition={{ duration: 0.2 }}
                    >
                      <div className="py-2">
                        <Link
                          to="/"
                          className="block px-4 py-2 text-sm text-[#000052] hover:bg-[#000052] hover:text-white transition-colors"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Home
                        </Link>
                        <Link
                          to="/about"
                          className="block px-4 py-2 text-sm text-[#000052] hover:bg-[#000052] hover:text-white transition-colors"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          About
                        </Link>
                        <Link
                          to="/projects"
                          className="block px-4 py-2 text-sm text-[#000052] hover:bg-[#000052] hover:text-white transition-colors"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Projects
                        </Link>
                        <Link
                          to="/games"
                          className="block px-4 py-2 text-sm text-[#000052] hover:bg-[#000052] hover:text-white transition-colors"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Games
                        </Link>
                        <Link
                          to="/music"
                          className="block px-4 py-2 text-sm text-[#000052] hover:bg-[#000052] hover:text-white transition-colors"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Music
                        </Link>
                        <Link
                          to="/contact"
                          className="block px-4 py-2 text-sm text-[#000052] hover:bg-[#000052] hover:text-white transition-colors"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          Contact
                        </Link>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>
          </div>
        </motion.nav>

        {/* Canvas Mode UI */}
        {isCanvasMode && (
          <div 
            className="fixed top-16 left-0 right-0 bottom-0 z-30"
            style={{ height: 'calc(100vh - 64px)' }}
            ref={canvasContainerRef}
            onMouseDown={handleCanvasMouseDown}
            onMouseMove={handleCanvasMouseMove}
            onMouseUp={handleCanvasMouseUp}
            onMouseLeave={handleCanvasMouseUp}
          >
            {/* Canvas Tools Panel */}
            <div className="canvas-tools-panel absolute top-4 md:top-4 left-2 md:left-4 right-2 md:right-4 z-40 flex flex-wrap items-center gap-2 md:gap-4 bg-white border border-black p-2 md:p-4 shadow-lg max-w-full pointer-events-auto">
              {/* Color Palette */}
              <div className="flex items-center gap-1 md:gap-2">
                <span className="text-xs md:text-sm font-medium text-[#000052] hidden md:inline">Colors:</span>
                <div className="flex gap-1 md:gap-2">
                  {colorPalette.map((color) => (
                    <button
                      key={color}
                      onClick={() => {
                        setSelectedColor(color)
                        setToolMode('draw')
                      }}
                      className={`w-5 h-5 md:w-8 md:h-8 border-2 transition-all ${
                        selectedColor === color && toolMode === 'draw'
                          ? 'border-[#000052] scale-110'
                          : 'border-gray-300 hover:border-gray-500'
                      }`}
                      style={{ backgroundColor: color }}
                      title={color}
                    />
                  ))}
                </div>
              </div>

              {/* Tools */}
              <div className="flex items-center gap-1 md:gap-2">
                <motion.button
                  onClick={() => setToolMode('draw')}
                  className={`px-2 py-1 md:px-4 md:py-2 text-xs md:text-sm font-medium border transition-colors ${
                    toolMode === 'draw'
                      ? 'bg-[#000052] text-white border-[#000052]'
                      : 'bg-white text-[#000052] border-black hover:bg-gray-100'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Draw
                </motion.button>
                <motion.button
                  onClick={() => setToolMode('erase')}
                  className={`px-2 py-1 md:px-4 md:py-2 text-xs md:text-sm font-medium border transition-colors ${
                    toolMode === 'erase'
                      ? 'bg-[#000052] text-white border-[#000052]'
                      : 'bg-white text-[#000052] border-black hover:bg-gray-100'
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Eraser
                </motion.button>
                <motion.button
                  onClick={undoCanvas}
                  disabled={canvasHistory.length === 0}
                  className="px-2 py-1 md:px-4 md:py-2 text-xs md:text-sm font-medium bg-white text-[#000052] border border-black hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  whileHover={{ scale: canvasHistory.length === 0 ? 1 : 1.05 }}
                  whileTap={{ scale: canvasHistory.length === 0 ? 1 : 0.95 }}
                >
                  Undo
                </motion.button>
                <motion.button
                  onClick={clearCanvas}
                  className="px-2 py-1 md:px-4 md:py-2 text-xs md:text-sm font-medium bg-white text-[#000052] border border-black hover:bg-gray-100 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Clear
                </motion.button>
                <motion.button
                  onClick={saveCanvas}
                  className="px-2 py-1 md:px-4 md:py-2 text-xs md:text-sm font-medium bg-[#000052] text-white border border-[#000052] hover:bg-[#000052]/90 transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Save
                </motion.button>
              </div>

              {/* Instructions */}
              <div className="text-sm text-[#000052] ml-auto flex items-center gap-1 md:gap-2">
                <span className="hidden md:inline">Click or drag to draw • Press ESC to exit</span>
                <span className="md:hidden text-xs">Click to draw</span>
                <motion.button
                  onClick={() => setIsCanvasMode(false)}
                  className="md:hidden w-5 h-5 md:w-6 md:h-6 flex items-center justify-center bg-white border border-black text-[#000052] hover:bg-[#000052] hover:text-white transition-colors text-lg"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  aria-label="Exit canvas"
                >
                  ×
                </motion.button>
              </div>
            </div>
          </div>
        )}

        {/* CANVAS Button - below header, top left */}
        {!isCanvasMode && !showIntro && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 1.3 }}
            className="fixed top-28 md:top-20 left-6 z-30"
            style={{ visibility: showIntro ? 'hidden' : 'visible' }}
          >
            <motion.button
              onClick={() => setIsCanvasMode(true)}
              className="px-4 py-2 bg-[#000052] border border-black text-white text-sm font-medium hover:bg-white hover:text-[#000052] transition-colors"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Canvas
            </motion.button>
          </motion.div>
        )}

        {/* Main Content Area */}
        <main className={`flex-1 pt-20 ${isCanvasMode ? 'hidden' : ''}`}>
          {/* Hero Section */}
          <motion.section
            initial={{ opacity: 0 }}
            animate={{ opacity: showIntro ? 0 : 1 }}
            transition={{ duration: 0.6, delay: showIntro ? 0 : 1.3 }}
            className="min-h-screen flex flex-col justify-center px-6 sm:px-8 lg:px-12"
            style={{ visibility: showIntro ? 'hidden' : 'visible' }}
          >
            <div className="max-w-7xl mx-auto w-full">
              {/* Main Title */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: showIntro ? 0 : 1, y: 0 }}
                transition={{ duration: 0.8, delay: showIntro ? 0 : 1.5 }}
                className="text-7xl sm:text-8xl md:text-9xl lg:text-10xl font-bold tracking-tight mb-8 text-[#000052]"
              >
                {/* JUDE ROUHANA */}
                Jude Rouhana
              </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: showIntro ? 0 : 1, y: 0 }}
              transition={{ duration: 0.7, delay: showIntro ? 0 : 1.8 }}
              className="text-lg sm:text-xl font-medium text-[#000052] mb-4"
            >
              Scroll to explore ↓
            </motion.p>
            </div>
          </motion.section>

          {/* News/Content Section */}
          <motion.section
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: showIntro ? 0 : 1, y: 0 }}
            transition={{ duration: 0.8, delay: showIntro ? 0 : 2.0 }}
            className="px-6 sm:px-8 lg:px-12 py-20"
            style={{ visibility: showIntro ? 'hidden' : 'visible' }}
          >
            <div className="max-w-7xl mx-auto">
              <div className="space-y-16">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1">
                      <span className="text-xs font-medium uppercase tracking-wider mb-2 block text-[#000052]">WHO AM I</span>
                      <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-[#000052]">
                        About
                      </h2>
                    </div>
                    <motion.div
                      className="md:mt-8"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Link
                        to="/about"
                        className="inline-block px-6 py-3 bg-[#000052] text-white font-medium transition-all duration-300 hover:shadow-lg"
                      >
                        Learn More →
                      </Link>
                    </motion.div>
                  </div>
                {/* News Item 1 */}
                <div className="border-t border-black pt-8">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1">
                      <span className="text-xs font-medium uppercase tracking-wider mb-2 block text-[#000052]">WORK</span>
                      <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-[#000052]">
                        Projects
                      </h2>
                      <p className="text-lg text-[#000052] max-w-2xl">
                        Explore my coding work, applications, experiments, and other creative projects.
                      </p>
                    </div>
                    <motion.div
                      className="md:mt-8"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Link
                        to="/projects"
                        className="inline-block px-6 py-3 bg-[#000052] text-white font-medium transition-all duration-300 hover:shadow-lg"
                      >
                        View Projects →
                      </Link>
                    </motion.div>
                  </div>
                </div>

                <div className="border-t border-black pt-8">
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1">
                      <span className="text-xs font-medium uppercase tracking-wider mb-2 block text-[#000052]">CREATIVE</span>
                      <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-[#000052]">
                        Music
                      </h2>
                      <p className="text-lg text-[#000052] max-w-2xl">
                        A collection of pieces I've written, recorded, and produced.
                      </p>
                    </div>
                    <motion.div
                      className="md:mt-8"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Link
                        to="/music"
                        className="inline-block px-6 py-3 bg-[#000052] text-white font-medium transition-all duration-300 hover:shadow-lg"
                      >
                        View Music →
                      </Link>
                    </motion.div>
                  </div>
                  <br/>
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
                    <div className="flex-1">
                      <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 text-[#000052]">
                        Games
                      </h2>
                      <p className="text-lg text-[#000052] max-w-2xl">
                        Games I've built using various programming languages and game development tools.
                      </p>
                    </div>
                    <motion.div
                      className="md:mt-8"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Link
                        to="/games"
                        className="inline-block px-6 py-3 bg-[#000052] text-white font-medium transition-all duration-300 hover:shadow-lg"
                      >
                        View Games →
                      </Link>
                    </motion.div>
                  </div>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Footer */}
          <motion.footer
            initial={{ opacity: 0 }}
            animate={{ opacity: showIntro ? 0 : 1 }}
            transition={{ duration: 0.6, delay: showIntro ? 0 : 2.3 }}
            className="px-6 sm:px-8 lg:px-12 py-12 border-t border-black"
            style={{ visibility: showIntro ? 'hidden' : 'visible' }}
          >
            <div className="w-full">
              <div className="flex flex-col md:flex-row md:justify-between gap-8">
                <div>
                  <h3 className="text-xl font-bold mb-4 text-[#000052]">Jude Rouhana</h3>
                  <p className="text-sm text-[#000052]">Full-Stack Developer</p>
                </div>
                <div className="flex flex-col md:flex-row gap-8 md:gap-12">
                  <div>
                    <h4 className="text-sm font-medium mb-2 text-[#000052]">Contact</h4>
                    <a href="mailto:juderouhana@gmail.com" className="text-sm text-[#000052] hover:underline">
                      juderouhana@gmail.com
                    </a>
                  </div>
                  <div>
                    <h4 className="text-sm font-medium mb-2 text-[#000052]">Links</h4>
                    <div className="flex flex-col gap-1">
                      <a href="https://www.linkedin.com/in/jude-rouhana-798542261/" className="text-sm text-[#000052] hover:underline">LinkedIn</a>
                    </div>
                    <div className="flex flex-col gap-1">
                      <a href="https://www.juderouhana.com" className="text-sm text-[#000052] hover:underline">juderouhana.com</a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.footer>
        </main>
      </div>
    </div>
  )
}

export default Home
