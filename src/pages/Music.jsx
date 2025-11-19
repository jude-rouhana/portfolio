import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'
import { useInView } from 'react-intersection-observer'
import { getAudioUrl } from '../config/assets'

const Music = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  })
  const [trailCells, setTrailCells] = useState([])
  const [isShiftHeld, setIsShiftHeld] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [currentTrack, setCurrentTrack] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const audioRef = useRef(null)
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
      if (touchHoldTimeoutRef.current) {
        clearTimeout(touchHoldTimeoutRef.current)
      }
      touchHoldTimeoutRef.current = setTimeout(() => {
        shiftHeldRef.current = true
        setIsShiftHeld(true)
      }, 2000)
    }

    const handleTouchEnd = (event) => {
      if (touchHoldTimeoutRef.current) {
        clearTimeout(touchHoldTimeoutRef.current)
        touchHoldTimeoutRef.current = null
      }
      
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

  // Audio player functions
  const formatTime = (time) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const handlePlayPause = (track) => {
    if (currentTrack && currentTrack.id === track.id) {
      if (isPlaying) {
        audioRef.current.pause()
        setIsPlaying(false)
      } else {
        audioRef.current.play()
        setIsPlaying(true)
      }
    } else {
      setCurrentTrack(track)
      setIsPlaying(true)
      if (audioRef.current) {
        audioRef.current.src = track.audioFile
        audioRef.current.play()
      }
    }
  }

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime)
      setDuration(audioRef.current.duration)
    }
  }

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const percent = (e.clientX - rect.left) / rect.width
    const newTime = percent * duration
    audioRef.current.currentTime = newTime
    setCurrentTime(newTime)
  }

  const handleEnded = () => {
    setIsPlaying(false)
    setCurrentTime(0)
  }

  // Music tracks
  const tracks = [
    {
      id: 1,
      title: "How My Heart Beats",
      artist: "Jude Rouhana",
      duration: "2:14",
      genre: "Bossa Nova",
      audioFile: getAudioUrl('bossaNova') || "/assets/music/Bossa%20Nova.mp3",
      description: "A smooth bossa nova piece featuring warm saxophone, marimba, and piano melodies and gentle rhythms. Written, recorded, mixed, and produced by Jude Rouhana.",
      featured: true
    },
    {
      id: 2,
      title: "Misty",
      artist: "Original by Erroll Garner",
      duration: "2:22",
      genre: "Jazz Ballad",
      audioFile: getAudioUrl('ballad') || "/assets/music/Ballad.mp3",
      description: "A classic jazz ballad interpretation with soulful saxophone and piano phrasing and rich harmonic textures. Written by Erroll Garner. Recorded, mixed, and produced by Jude Rouhana.",
      featured: true
    },
    {
      id: 3,
      title: "Consolation No. 3",
      artist: "Original by Franz Liszt",
      duration: "4:09",
      genre: "Classical",
      audioFile: getAudioUrl('classical') || "/assets/music/Classical.mp3",
      description: "A classical piece that combines traditional classical harmony with elements inspired from jazz. Written by Franz Liszt. Recorded, mixed, and produced by Jude Rouhana.",
      featured: true
    },
    {
      id: 4,
      title: "Jazz, In The House",
      artist: "Jude Rouhana",
      duration: "2:08",
      genre: "House Jazz",
      audioFile: getAudioUrl('house') || "/assets/music/House.mp3",
      description: "A house jazz piece that combines traditional house beats with a jazz-inspired melody. Written by Jude Rouhana. Recorded, mixed, and produced by Jude Rouhana.",
      featured: true
    },
    {
      id: 5,
      title: "Begin Again",
      artist: "Jude Rouhana",
      duration: "3:16",
      genre: "R&B/Ballad",
      audioFile: getAudioUrl('rnb') || "/assets/music/R%26B.mp3",
      description: "A R&B/Ballad that explores the use of ambient sounds and textures to create a more immersive and emotional experience. Written by Jude Rouhana. Recorded, mixed, and produced by Jude Rouhana.",
      featured: true
    },
    {
      id: 6,
      title: "Blues, All Day Long",
      artist: "Jude Rouhana",
      duration: "3:44",
      genre: "Blues",
      audioFile: getAudioUrl('blues') || "/assets/music/Blues.mp3",
      description: "An expressive solo on saxophone, piano, and clarinet over a simple blues progression that combines traditional blues with elements inspired from jazz. Written by Jude Rouhana. Recorded, mixed, and produced by Jude Rouhana.",
      featured: true
    },
  ]

  const featuredTracks = tracks.filter(track => track.featured)
  const otherTracks = tracks.filter(track => !track.featured)

  return (
    <div
      className="min-h-screen bg-white text-[#000052] relative"
      style={{
        backgroundImage: `
          linear-gradient(rgba(0, 0, 0, 0.08) 1px, transparent 1px),
          linear-gradient(90deg, rgba(0, 0, 0, 0.08) 1px, transparent 1px)
        `,
        backgroundSize: '32px 32px',
        backgroundAttachment: 'fixed'
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
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-4">
          <div className="flex justify-between items-center">              
            <Link to="/" className="text-xl font-bold tracking-tight text-[#000052]">
              JUDE ROUHANA
            </Link>
            <div className="hidden md:flex space-x-8 text-sm font-medium">
              <Link to="/about" className="text-[#000052] hover:opacity-80 transition-colors">About</Link>
              <Link to="/projects" className="text-[#000052] hover:opacity-80 transition-colors">Projects</Link>
              <Link to="/music" className="text-[#000052] hover:opacity-80 transition-colors">Music</Link>
              <Link to="/games" className="text-[#000052] hover:opacity-80 transition-colors">Games</Link>
              <Link to="/" className="text-[#000052] hover:opacity-80 transition-colors">Contact</Link>
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
        <motion.main 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.8 }}
          className="flex-1 pt-20 relative"
        >
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-12">
            {/* Section Header */}
            <motion.div
              ref={ref}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="text-center mb-16"
            >
              <h2 className="text-4xl sm:text-5xl md:text-6xl font-bold text-[#000052] mb-4">
                MUSIC
              </h2>
              <p className="text-lg text-[#000052] mb-8">
                A collection of pieces I've written, recorded, and produced.
              </p>
              <div className="w-24 h-1 bg-[#000052] mx-auto mb-8"></div>
            </motion.div>

            {/* Hidden audio element */}
            <audio
              ref={audioRef}
              onTimeUpdate={handleTimeUpdate}
              onEnded={handleEnded}
              onLoadedMetadata={() => setDuration(audioRef.current.duration)}
            />

            {/* Featured Music Player */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 1.0 }}
              className="mb-16"
            >
              {/* <h3 className="text-2xl font-bold text-[#000052] mb-8">Featured Tracks</h3> */}
              <div className="grid lg:grid-cols-2 gap-8">
                {featuredTracks.map((track, index) => {
                  const isCurrentTrack = currentTrack && currentTrack.id === track.id
                  const isTrackPlaying = isCurrentTrack && isPlaying
                  
                  return (
                    <motion.div
                      key={track.id}
                      className="bg-white border border-black p-6 hover:shadow-lg transition-all duration-300"
                      initial={{ opacity: 0, y: 30 }}
                      animate={inView ? { opacity: 1, y: 0 } : {}}
                      transition={{ delay: index * 0.2 + 1.0 }}
                    >
                      {/* Track Info */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex-1">
                          <h4 className="text-xl font-bold text-[#000052] mb-2">
                            {track.title}
                          </h4>
                          <p className="text-[#000052] mb-2">{track.artist}</p>
                          <div className="flex items-center gap-4 text-sm text-[#000052] mb-3">
                            <span>{track.duration}</span>
                            <span>•</span>
                            <span>{track.genre}</span>
                          </div>
                          <p className="text-[#000052] text-sm leading-relaxed">
                            {track.description}
                          </p>
                        </div>
                      </div>

                      {/* Audio Player */}
                      <div className="bg-white border border-black p-4 mb-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center gap-3">
                            <button 
                              onClick={() => handlePlayPause(track)}
                              className="w-10 h-10 bg-[#000052] flex items-center justify-center hover:opacity-80 transition-colors"
                            >
                              <span className="text-white text-lg">
                                {isTrackPlaying ? (
                                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                    <rect x="6" y="4" width="4" height="16" />
                                    <rect x="14" y="4" width="4" height="16" />
                                  </svg>
                                ) : (
                                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M8 5v14l11-7z" />
                                  </svg>
                                )}
                              </span>
                            </button>
                            <div>
                              <div className="text-sm font-medium text-[#000052]">
                                {isCurrentTrack ? (isTrackPlaying ? 'Now Playing' : 'Paused') : ''}
                              </div>
                              <div className="text-xs text-[#000052]">{track.title}</div>
                            </div>
                          </div>
                          <div className="text-xs text-[#000052]">
                            {isCurrentTrack ? formatTime(currentTime) : track.duration}
                          </div>
                        </div>
                        
                        {/* Progress Bar */}
                        <div 
                          className="w-full bg-gray-200 h-2 mb-2 cursor-pointer"
                          onClick={handleSeek}
                        >
                          <motion.div
                            className="h-2 bg-[#000052]"
                            initial={{ width: "0%" }}
                            animate={{ 
                              width: isCurrentTrack ? `${(currentTime / duration) * 100}%` : "0%" 
                            }}
                            transition={{ duration: 0.1 }}
                          />
                        </div>
                        
                        {/* Time Display */}
                        {isCurrentTrack && (
                          <div className="flex justify-between text-xs text-[#000052]">
                            <span>{formatTime(currentTime)}</span>
                            <span>{formatTime(duration)}</span>
                          </div>
                        )}
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>

            {/* Other Tracks */}
            {otherTracks.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: 1.2 }}
              >
                <h3 className="text-2xl font-bold text-[#000052] mb-8">More Music</h3>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {otherTracks.map((track, index) => {
                    const isCurrentTrack = currentTrack && currentTrack.id === track.id
                    const isTrackPlaying = isCurrentTrack && isPlaying
                    
                    return (
                      <motion.div
                        key={track.id}
                        className="bg-white border border-black p-4 hover:shadow-lg transition-all duration-300"
                        initial={{ opacity: 0, y: 20 }}
                        animate={inView ? { opacity: 1, y: 0 } : {}}
                        transition={{ delay: index * 0.1 + 1.2 }}
                      >
                        {/* Track Info */}
                        <div className="flex items-start justify-between mb-3">
                          <div className="flex-1">
                            <h4 className="text-lg font-bold text-[#000052] mb-1">
                              {track.title}
                            </h4>
                            <p className="text-[#000052] text-sm mb-2">{track.artist}</p>
                            <div className="flex items-center gap-2 text-xs text-[#000052] mb-2">
                              <span>{track.duration}</span>
                              <span>•</span>
                              <span>{track.genre}</span>
                            </div>
                            <p className="text-[#000052] text-xs leading-relaxed">
                              {track.description}
                            </p>
                          </div>
                        </div>

                        {/* Mini Player */}
                        <div className="bg-white border border-black p-3 mb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <button 
                                onClick={() => handlePlayPause(track)}
                                className="w-6 h-6 bg-[#000052] flex items-center justify-center hover:opacity-80 transition-colors"
                              >
                                <span className="text-white text-xs">
                                  {isTrackPlaying ? (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                      <rect x="6" y="4" width="4" height="16" />
                                      <rect x="14" y="4" width="4" height="16" />
                                    </svg>
                                  ) : (
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                                      <path d="M8 5v14l11-7z" />
                                    </svg>
                                  )}
                                </span>
                              </button>
                              <span className="text-xs text-[#000052]">
                                {isCurrentTrack ? (isTrackPlaying ? 'Playing' : 'Paused') : 'Play'}
                              </span>
                            </div>
                            <span className="text-xs text-[#000052]">{track.duration}</span>
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </motion.div>
            )}
          </div>
        </motion.main>
      </div>
    </div>
  )
}

export default Music
