import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'
import { useInView } from 'react-intersection-observer'

const About = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  })
  const [trailCells, setTrailCells] = useState([])
  const [isShiftHeld, setIsShiftHeld] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [expandedSection, setExpandedSection] = useState(null)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const lastCellRef = useRef(null)
  const timeoutsRef = useRef([])
  const heldCellsRef = useRef([])
  const shiftHeldRef = useRef(false)
  const touchHoldTimeoutRef = useRef(null)
  const touchStartTimeRef = useRef(null)

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
  }, [])

  const toggleSection = (section) => {
    setExpandedSection(expandedSection === section ? null : section)
  }

  const skills = [
    // Programming Languages
    { name: 'Python', type: 'programming', color: 'bg-blue-500' },
    { name: 'C++', type: 'programming', color: 'bg-blue-500' },
    { name: 'HTML', type: 'programming', color: 'bg-blue-500' },
    { name: 'CSS', type: 'programming', color: 'bg-blue-500' },
    { name: 'React', type: 'programming', color: 'bg-blue-500' },
    { name: 'JavaScript', type: 'programming', color: 'bg-blue-500' },
    { name: 'TypeScript', type: 'programming', color: 'bg-blue-500' },
    { name: 'Node.js', type: 'programming', color: 'bg-blue-500' },
    { name: 'Next.js', type: 'programming', color: 'bg-blue-500' },
    { name: 'FastAPI', type: 'programming', color: 'bg-blue-500' },
    { name: 'Arduino', type: 'programming', color: 'bg-blue-500' },
    { name: 'Go', type: 'programming', color: 'bg-blue-500' },
    { name: 'Bash', type: 'programming', color: 'bg-blue-500' },
    { name: 'Scheme', type: 'programming', color: 'bg-blue-500' },
    { name: 'OCaml', type: 'programming', color: 'bg-blue-500' },
    { name: 'SmallTalk', type: 'programming', color: 'bg-blue-500' },
    { name: 'Prolog', type: 'programming', color: 'bg-blue-500' },
    { name: 'Assembly', type: 'programming', color: 'bg-blue-500' },
    
    // Design Skills
    { name: 'Framer', type: 'design', color: 'bg-red-500' },
    { name: 'Figma', type: 'design', color: 'bg-red-500' },
    { name: 'ProTools', type: 'design', color: 'bg-red-500' },
    { name: 'Logic Pro', type: 'design', color: 'bg-red-500' },
    { name: 'Max/MSP', type: 'design', color: 'bg-red-500' },
    { name: 'Adobe Photoshop', type: 'design', color: 'bg-red-500' },
    { name: 'Adobe Premiere Pro', type: 'design', color: 'bg-red-500' },
    { name: 'Adobe After Effects', type: 'design', color: 'bg-red-500' },
    { name: 'Adobe Lightroom', type: 'design', color: 'bg-red-500' },
    { name: 'Procreate', type: 'design', color: 'bg-red-500' },
    { name: 'Blender', type: 'design', color: 'bg-red-500' },
    { name: 'Godot', type: 'design', color: 'bg-red-500' },
    
    // Other Skills
    { name: 'PostgreSQL', type: 'other', color: 'bg-yellow-500' }, 
    { name: 'Git', type: 'other', color: 'bg-yellow-500' },
    { name: 'Microsoft 365', type: 'other', color: 'bg-yellow-500' },
    { name: 'Microsoft Power Suite', type: 'other', color: 'bg-yellow-500' },
  ]

  // Group skills by type
  const groupedSkills = {
    programming: skills.filter(skill => skill.type === 'programming'),
    design: skills.filter(skill => skill.type === 'design'),
    other: skills.filter(skill => skill.type === 'other')
  }

  const sectionConfig = {
    programming: { title: 'Programming Languages, Frameworks, and Libraries', color: 'bg-blue-500' },
    design: { title: 'Design and Creative', color: 'bg-red-500' },
    other: { title: 'Other Tools', color: 'bg-yellow-500' }
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
      {/* Trail Cells */}
      <AnimatePresence>
        {trailCells.map(cell => (
          <motion.div
            key={cell.id}
            className="fixed w-8 h-8 bg-[#000052] pointer-events-none z-20"
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
        {/* Grid Overlay - covers main content and footer */}
        <div
          className="absolute inset-0 pointer-events-none z-10"
          style={{
            backgroundImage: `
              linear-gradient(rgba(0, 0, 0, 0.035) 1px, transparent 1px),
              linear-gradient(90deg, rgba(0, 0, 0, 0.035) 1px, transparent 1px)
            `,
            backgroundSize: '32px 32px',
            backgroundAttachment: 'fixed'
          }}
        />
        <motion.main 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="flex-1 pt-20 relative"
        >
          <section className="px-6 sm:px-8 lg:px-24 pt-48 md:pt-32 pb-10 relative z-20">
            <div className="max-w-7xl mx-auto">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.8 }}
                className="flex flex-col md:flex-row gap-8 items-start"
              >
                {/* Image - above text on mobile, left side on desktop */}
                <div className="w-full md:w-auto md:flex-shrink-0 order-1 md:order-1 md:ml-32 -mt-40 md:mt-0">
                  <img 
                    src="/mobilebackground.png" 
                    alt="About" 
                    className="w-3/4 mx-auto md:w-auto md:max-w-xs object-contain"
                  />
                </div>
                
                {/* Text Content */}
                <div className="flex-1 space-y-4 md:ml-auto md:max-w-2xl order-2 md:order-2">
                  <span className="text-xl sm:text-2xl md:text-4xl font-bold mb-4 text-[#000052]">
                    Who am I?
                  </span>
                  {/* <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#000052]">
                    About
                  </h1> */}
                  <div className="space-y-4 text-[#000052]">
                    <p className="text-sm sm:text-sm md:text-lg leading-relaxed">
                      I'm a software developer and creative technologist with a unique blend of technical skills and artistic vision. I love to build: from software and hardware to music, digital art, and games. Explore some of my work below!
                    </p>
                    <p className="text-sm sm:text-sm md:text-lg leading-relaxed">
                      I graduated from Hamilton College in 2025 as a Computer Science major and Digital Arts and Music minors. I currently work at Boston Children's Hospital in Pediatrics-Emergency Medicine creating custom software solutions to help with process enhancement, automation, and workflow improvement.
                    </p>
                  </div>
                </div>
              </motion.div>
              
              {/* Navigation Buttons */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.0 }}
                className="flex flex-wrap gap-2 md:gap-64 justify-center mt-16 md:mt-32 mb-8 md:mb-20"
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to="/projects"
                    className="inline-block px-3 py-2 md:px-6 md:py-3 bg-[#000052] text-white text-xs md:text-base font-medium transition-all duration-300 hover:shadow-lg"
                  >
                    Projects
                  </Link>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to="/music"
                    className="inline-block px-3 py-2 md:px-6 md:py-3 bg-[#000052] text-white text-xs md:text-base font-medium transition-all duration-300 hover:shadow-lg"
                  >
                    Music
                  </Link>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Link
                    to="/games"
                    className="inline-block px-3 py-2 md:px-6 md:py-3 bg-[#000052] text-white text-xs md:text-base font-medium transition-all duration-300 hover:shadow-lg"
                  >
                    Games
                  </Link>
                </motion.div>
              </motion.div>
              
              {/* Skills Section */}
              {/*<div ref={ref} className="mt-12 md:mt-16 relative z-40">
                <h4 className="text-base sm:text-lg font-semibold text-[#000052] mb-4 sm:mb-6">
                  Technical Skills
                </h4>
                
                <div className="hidden md:block relative z-40">
                  <div className="max-w-2xl space-y-4 relative z-40">
                    {Object.entries(groupedSkills).map(([type, skillsList], index) => {
                      const config = sectionConfig[type]
                      return (
                        <motion.div
                          key={type}
                          initial={{ opacity: 0, y: 20 }}
                          animate={inView ? { opacity: 1, y: 0 } : {}}
                          transition={{ delay: 0.2 + index * 0.1 }}
                          className={`bg-white rounded-none border border-black overflow-hidden transition-all duration-200 ${
                            expandedSection === type ? 'border-[#000052] border-2 bg-gray-50' : ''
                          }`}
                        >
                          <motion.button
                            onClick={() => toggleSection(type)}
                            className={`w-full p-6 text-left flex items-center justify-between transition-colors duration-200 ${
                              expandedSection === type ? 'bg-gray-50' : 'hover:bg-gray-50'
                            }`}
                            whileHover={{ scale: 1.01 }}
                            whileTap={{ scale: 0.99 }}
                          >
                            <div className="flex items-center space-x-3">
                              <div className={`w-3 h-3 rounded-none ${config.color} flex-shrink-0`}></div>
                              <span className="text-[#000052] font-semibold text-sm">{config.title}</span>
                            </div>
                            <motion.div
                              animate={{ rotate: expandedSection === type ? 180 : 0 }}
                              transition={{ duration: 0.2 }}
                              className="text-[#000052]/60"
                            >
                              ▼
                            </motion.div>
                          </motion.button>

                          <motion.div
                            initial={false}
                            animate={{
                              height: expandedSection === type ? 'auto' : 0,
                              opacity: expandedSection === type ? 1 : 0
                            }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="overflow-hidden"
                          >
                            <div className="p-4 bg-gray-50 border-t border-[#000052]/20">
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                {skillsList.map((skill, index) => (
                                  <motion.div
                                    key={skill.name}
                                    initial={{ opacity: 0, x: -10 }}
                                    animate={inView && expandedSection === type ? { opacity: 1, x: 0 } : {}}
                                    transition={{ delay: index * 0.05 }}
                                    className="flex items-center space-x-3 p-2 rounded-none hover:bg-white transition-colors duration-200"
                                  >
                                    <div className={`w-3 h-3 rounded-none ${skill.color} flex-shrink-0`}></div>
                                    <span className="text-[#000052] font-medium text-xs">{skill.name}</span>
                                  </motion.div>
                                ))}
                              </div>
                            </div>
                          </motion.div>
                        </motion.div>
                      )
                    })}
                  </div>
                </div>

                <div className="md:hidden space-y-3 sm:space-y-4">
                  {Object.entries(groupedSkills).map(([type, skillsList], index) => {
                    const config = sectionConfig[type]
                    return (
                      <motion.div
                        key={type}
                        initial={{ opacity: 0, y: 20 }}
                        animate={inView ? { opacity: 1, y: 0 } : {}}
                        transition={{ delay: 0.2 + index * 0.1 }}
                        className="border border-[#000052] rounded-none overflow-hidden"
                      >
                        <button
                          onClick={() => toggleSection(type)}
                          className="w-full flex items-center justify-between p-4 bg-white hover:bg-gray-50 transition-colors duration-200"
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`w-3 h-3 rounded-none ${config.color} flex-shrink-0`}></div>
                            <span className="text-[#000052] font-semibold text-sm">{config.title}</span>
                          </div>
                          <motion.div
                            animate={{ rotate: expandedSection === type ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                            className="text-[#000052]/60"
                          >
                            ▼
                          </motion.div>
                        </button>
                        <motion.div
                          initial={false}
                          animate={{
                            height: expandedSection === type ? 'auto' : 0,
                            opacity: expandedSection === type ? 1 : 0
                          }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                          className="overflow-hidden"
                        >
                          <div className="p-4 bg-gray-50">
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                              {skillsList.map((skill, index) => (
                                <motion.div
                                  key={skill.name}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={inView && expandedSection === type ? { opacity: 1, x: 0 } : {}}
                                  transition={{ delay: index * 0.05 }}
                                  className="flex items-center space-x-3 p-2 rounded-none hover:bg-white transition-colors duration-200"
                                >
                                  <div className={`w-3 h-3 rounded-none ${skill.color} flex-shrink-0`}></div>
                                  <span className="text-[#000052] font-medium text-xs">{skill.name}</span>
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      </motion.div>
                    )
                  })}
                </div>
              </div> */}
            </div>
          </section>
        </motion.main>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="px-6 sm:px-8 lg:px-12 py-12 border-t border-black relative z-20"
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
                    <a href="https://www.linkedin.com/in/jude-rouhana/" className="text-sm text-[#000052] hover:underline">LinkedIn</a>
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
    </div>
  )
}

export default About

