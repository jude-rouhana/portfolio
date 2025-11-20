import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { useState, useEffect, useRef } from 'react'
import { getVideoUrl } from '../config/assets'

const Games = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  })
  const [showVideoModal, setShowVideoModal] = useState(false)
  const [activeProjectId, setActiveProjectId] = useState(null)
  const [expandedProject, setExpandedProject] = useState(null)
  const [trailCells, setTrailCells] = useState([])
  const [isShiftHeld, setIsShiftHeld] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const lastCellRef = useRef(null)
  const timeoutsRef = useRef([])
  const heldCellsRef = useRef([])
  const shiftHeldRef = useRef(false)
  const touchHoldTimeoutRef = useRef(null)
  const touchStartTimeRef = useRef(null)

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.9
      }
    }
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut"
      }
    }
  }

  const dropdownVariants = {
    hidden: { height: 0, opacity: 0 },
    visible: { 
      height: "auto", 
      opacity: 1,
      transition: {
        height: { duration: 0.3, ease: "easeInOut" },
        opacity: { duration: 0.2, delay: 0.1 }
      }
    },
    exit: { 
      height: 0, 
      opacity: 0,
      transition: {
        height: { duration: 0.3, ease: "easeInOut" },
        opacity: { duration: 0.2 }
      }
    }
  }

  const handleLiveDemoClick = (projectId) => {
    if (projectId === 2 || projectId === 5 || projectId === 6) { // Othello, Astro Invader, or Sailing Game
      setActiveProjectId(projectId)
      setShowVideoModal(true)
    }
  }

  const toggleProject = (projectId) => {
    setExpandedProject(expandedProject === projectId ? null : projectId)
  }

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

  // Cursor grid trail effect
  useEffect(() => {
    // Check if any modal is open - if so, halt all cursor animation
    const isAnyModalOpen = showVideoModal
    
    if (isAnyModalOpen) {
      // Clear all trail cells and reset state when modal opens
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
  }, [showVideoModal])

  // Video Modal Component
  const VideoModal = () => {
    if (!showVideoModal) return null

    const isOthelloProject = activeProjectId === 2
    const isAstroInvaderProject = activeProjectId === 5
    const isSailingGame = activeProjectId === 6

    return (
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => {
          setShowVideoModal(false)
          setActiveProjectId(null)
        }}
      >
        <motion.div
          className="relative bg-white rounded-none p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto shadow-2xl"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={() => {
              setShowVideoModal(false)
              setActiveProjectId(null)
            }}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl z-10"
          >
            ×
          </button>

          {/* Modal Header */}
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-[#000052] mb-2">
              {isOthelloProject ? 'Othello AI Demo' : isAstroInvaderProject ? 'Astro Invader Demo' : 'Sailing Game Demo'}
            </h3>
            <p className="text-gray-600">
              {isOthelloProject
                ? 'Watch the AI opponent in action with minimax algorithm'
                : isAstroInvaderProject
                ? 'Watch the space-themed arcade game in action'
                : 'Watch the interactive 3D sailing game'
              }
            </p>
          </div>

          {/* Video Container */}
          {isOthelloProject ? (
            <div className="w-full max-w-lg mx-auto">
              <video
                className="w-full rounded-none"
                controls
                preload="metadata"
                autoPlay
                muted
              >
                <source src={getVideoUrl('othelloDemo') || "/assets/coding%20projects/Othello/othello_demo.mp4"} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          ) : isAstroInvaderProject ? (
            <div className="w-full max-w-lg mx-auto space-y-4">
              <video
                className="w-full rounded-none"
                controls
                preload="metadata"
                autoPlay
                muted
                onError={(e) => {
                  console.error('Video failed to load:', e.target.error)
                }}
              >
                <source src={getVideoUrl('astroInvader') || "/assets/coding%20projects/Astro%20Invader/astroinvader.mov"} type="video/quicktime" />
                <source src={getVideoUrl('astroInvader') || "/assets/coding%20projects/Astro%20Invader/astroinvader.mov"} type="video/mp4" />
                <p className="text-center text-gray-600 p-4">
                  Your browser does not support the video format. 
                  <br />
                  <a 
                    href={getVideoUrl('astroInvader') || "/assets/coding%20projects/Astro%20Invader/astroinvader.mov"} 
                    download
                    className="text-[#000052] hover:opacity-80 underline"
                  >
                    Download the video file
                  </a>
                </p>
              </video>
            </div>
          ) : isSailingGame ? (
            <div className="w-full max-w-lg mx-auto space-y-4">
              <video
                className="w-full rounded-none"
                controls
                preload="metadata"
                autoPlay
                muted
                onError={(e) => {
                  console.error('Video failed to load:', e.target.error)
                }}
              >
                <source src={getVideoUrl('sailingGame') || "/sailing.mp4"} type="video/mp4" />
                <p className="text-center text-gray-600 p-4">
                  Your browser does not support the video format. 
                  <br />
                  <a 
                    href={getVideoUrl('sailingGame') || "/sailing.mp4"} 
                    download
                    className="text-[#000052] hover:opacity-80 underline"
                  >
                    Download the video file
                  </a>
                </p>
              </video>
            </div>
          ) : null}
        </motion.div>
      </motion.div>
    )
  }

  // Games array - only Othello and Astro Invader
  const games = [
    {
      id: 2,
      title: "Othello Smart AI Opponent",
      fullTitle: "Othello AI",
      description: "An intelligent Othello game implementation with AI opponent using minimax algorithm and alpha-beta pruning. Features a fun interface with original artwork. Built by myself and Jacob Helzner.",
      image: "/assets/coding%20projects/Othello/othello.png",
      technologies: ["Python", "Minimax Algorithm", "Alpha-Beta Pruning", "Pixel Art", "Graphical User Interface"],
      hasDemo: true
    },
    {
      id: 5,
      title: "Astro Invader: A Space-Themed Arcade Game",
      fullTitle: "Astro Invader",
      description: "A space-themed arcade game built from scratch in Assembly Language (ASM). Features multiple enemy types, obstacles, and music. Built by myself and Pandelis Margaronis.",
      image: "/assets/coding%20projects/Astro%20Invader/astroinvader.png",
      technologies: ["Assembly", "DOSBox"],
      hasDemo: true
    },
    {
      id: 6,
      title: "3D Sailing Game",
      fullTitle: "3D Sailing Game",
      description: "An experimental sailing game built from scratch in Three.js and React, featuring a procedurally animated ocean with multi-component wave physics (primary waves, secondary chop, swell, and small choppy waves) that create realistic water movement. Built by myself.",
      image: "/sailing.png",
      technologies: ["Three.js", "React", "WebGL", "Tailwind CSS", "Vite"],
      hasDemo: true
    }
  ]

  return (
    <div
      className="min-h-screen bg-white text-[#000052] relative"
      style={{
        backgroundImage: `
          linear-gradient(rgba(0, 0, 0, 0.035) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0, 0, 0, 0.035) 1px, transparent 1px),
          url('/paper texture.jpg')
        `,
        backgroundSize: '32px 32px, 32px 32px, cover',
        backgroundPosition: '0 0, 0 0, center',
        backgroundRepeat: 'repeat, repeat, no-repeat',
        backgroundAttachment: 'fixed, fixed, fixed'
      }}
    >
      {/* Trail Cells */}
      <AnimatePresence>
        {trailCells.map(cell => (
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

      {/* Navigation */}
      <motion.nav
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="fixed top-0 left-0 right-0 z-40 bg-white border-b border-black"
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

      {/* Main Content */}
      <div className="min-h-screen flex flex-col relative z-10">
        <main className="flex-1 pt-20">
          <section className="px-6 sm:px-8 lg:px-12 py-10">
            <div className="max-w-7xl mx-auto">
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
        >
          {/* Section Header */}
          <motion.div variants={itemVariants} className="text-center mb-16">
                  <h2 className="text-4xl sm:text-5xl font-bold text-[#000052] mb-4">
                    GAMES
            </h2>
            <p className="text-lg text-[#000052] mb-4">Games I've built using various programming languages and game development tools.</p>
                  <div className="w-24 h-1 bg-[#000052] mx-auto rounded-none mb-8"></div>
          </motion.div>

                {/* Desktop: Two-column layout */}
                <div className="hidden md:grid md:grid-cols-2 md:gap-8">
                  {/* Left Column: Games List */}
          <motion.div variants={itemVariants} className="space-y-4">
            {games.map((game, index) => (
              <motion.div
                key={game.id}
                        className={`bg-white rounded-none border border-black overflow-hidden transition-all duration-200 ${
                          expandedProject === game.id ? 'border-[#000052] border-2 bg-gray-50' : ''
                        }`}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: index * 0.1 }}
              >
                {/* Game Title (Clickable) */}
                <motion.button
                  onClick={() => toggleProject(game.id)}
                          className={`w-full p-6 text-left flex items-center justify-between transition-colors duration-200 ${
                            expandedProject === game.id ? 'bg-gray-50' : 'hover:bg-gray-50'
                          }`}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                          <h3 className="text-lg font-bold text-[#000052]">
                            {game.title}
                          </h3>
                          <svg 
                            className="w-6 h-6 text-[#000052]" 
                            fill="none" 
                            stroke="currentColor" 
                            viewBox="0 0 24 24"
                            style={{ transform: 'rotate(-90deg)' }}
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </motion.button>
                      </motion.div>
                    ))}
                  </motion.div>

                  {/* Right Column: Side Panel */}
                  <div className="relative">
                    <AnimatePresence mode="wait">
                      {expandedProject && (() => {
                        const selectedGame = games.find(g => g.id === expandedProject)
                        if (!selectedGame) return null
                        
                        return (
                          <motion.div
                            key={expandedProject}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                            className="bg-white rounded-none border border-black p-6 space-y-6"
                          >
                            {/* Game Image */}
                            {selectedGame.image && (
                              <div className="flex justify-center">
                                <div className="h-48 w-full max-w-md bg-gray-50 rounded-none flex items-center justify-center">
                                  {selectedGame.image.startsWith('assets/') || selectedGame.image.startsWith('/') ? (
                                    <img 
                                      src={selectedGame.image} 
                                      alt={selectedGame.fullTitle}
                                      className="max-w-full max-h-full object-contain"
                                    />
                                  ) : (
                                    <span className="text-6xl">{selectedGame.image}</span>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Full Title */}
                            <div className="text-center">
                              <h4 className="text-2xl font-bold text-[#000052] mb-2">
                                {selectedGame.fullTitle}
                              </h4>
                            </div>

                            {/* Description */}
                            <p className="text-[#000052] leading-relaxed">
                              {selectedGame.description}
                            </p>

                            {/* Technologies */}
                            <div className="flex flex-wrap gap-2 justify-center">
                              {selectedGame.technologies.map((tech) => (
                                <span
                                  key={tech}
                                  className="px-3 py-1 bg-[#000052]/10 text-[#000052] text-sm font-medium rounded-none border border-[#000052]/20"
                                >
                                  {tech}
                                </span>
                              ))}
                            </div>

                            {/* Action Buttons */}
                            <div className="flex justify-center gap-4 flex-wrap">
                              {selectedGame.id === 6 ? (
                                <motion.div
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                >
                                  <Link
                                    to="/sailing-game"
                                    className="inline-block px-6 py-3 bg-[#000052] text-white font-medium transition-all duration-300 hover:shadow-lg"
                                  >
                                    Play
                                  </Link>
                                </motion.div>
                              ) : selectedGame.hasDemo && (
                                <motion.div
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                >
                                  <button
                                    onClick={() => handleLiveDemoClick(selectedGame.id)}
                                    className="inline-block px-6 py-3 bg-[#000052] text-white font-medium transition-all duration-300 hover:shadow-lg"
                                  >
                                    Watch Demo
                                  </button>
                                </motion.div>
                              )}
                            </div>
                          </motion.div>
                        )
                      })()}
                    </AnimatePresence>
                  </div>
                </div>

                {/* Mobile: Dropdown layout */}
                <motion.div variants={itemVariants} className="md:hidden space-y-4">
                  {games.map((game, index) => (
                    <motion.div
                      key={game.id}
                      className="bg-white rounded-none border border-black overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: index * 0.1 }}
              >
                {/* Game Title (Clickable) */}
                <motion.button
                  onClick={() => toggleProject(game.id)}
                        className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors duration-200"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                        <h3 className="text-lg font-bold text-[#000052]">
                    {game.title}
                  </h3>
                  <motion.div
                    animate={{ rotate: expandedProject === game.id ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <svg 
                            className="w-6 h-6 text-[#000052]" 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </motion.div>
                </motion.button>

                {/* Expanded Content */}
                <AnimatePresence>
                  {expandedProject === game.id && (
                    <motion.div
                      variants={dropdownVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                            className="border-t border-black"
                    >
                      <div className="p-6 space-y-6">
                        {/* Game Image */}
                        {game.image && (
                        <div className="flex justify-center">
                            <div className="h-48 w-full max-w-md bg-gray-50 rounded-none flex items-center justify-center">
                              {game.image.startsWith('assets/') || game.image.startsWith('/') ? (
                              <img 
                                src={game.image} 
                                alt={game.fullTitle}
                                className="max-w-full max-h-full object-contain"
                              />
                            ) : (
                                <span className="text-6xl">{game.image}</span>
                            )}
                          </div>
                        </div>
                        )}

                        {/* Full Title */}
                        <div className="text-center">
                                <h4 className="text-2xl font-bold text-[#000052] mb-2">
                            {game.fullTitle}
                          </h4>
                        </div>

                        {/* Description */}
                              <p className="text-[#000052] leading-relaxed">
                          {game.description}
                        </p>

                        {/* Technologies */}
                        <div className="flex flex-wrap gap-2 justify-center">
                          {game.technologies.map((tech) => (
                            <span
                              key={tech}
                                    className="px-3 py-1 bg-[#000052]/10 text-[#000052] text-sm font-medium rounded-none border border-[#000052]/20"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-center gap-4">
                          {game.id === 6 ? (
                            <motion.div
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <Link
                                to="/sailing-game"
                                className="inline-block px-6 py-3 bg-[#000052] text-white font-medium transition-all duration-300 hover:shadow-lg"
                              >
                                Play
                              </Link>
                            </motion.div>
                          ) : game.hasDemo && (
                            <motion.div
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              <button
                                onClick={() => handleLiveDemoClick(game.id)}
                                className="inline-block px-6 py-3 bg-[#000052] text-white font-medium transition-all duration-300 hover:shadow-lg"
                              >
                                Watch Demo
                              </button>
                            </motion.div>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>
            </div>
          </section>
        </main>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="px-6 sm:px-8 lg:px-12 py-12 border-t border-black"
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
      </div>
      
      {/* Modals */}
      <VideoModal />
    </div>
  )
}

export default Games
