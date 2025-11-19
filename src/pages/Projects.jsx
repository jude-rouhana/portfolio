import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { useState, useEffect, useRef } from 'react'
import { getVideoUrl } from '../config/assets'

const Projects = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  })
  const [showVideoModal, setShowVideoModal] = useState(false)
  const [showDescriptionModal, setShowDescriptionModal] = useState(false)
  const [showFocusAidModal, setShowFocusAidModal] = useState(false)
  const [showPixelArtModal, setShowPixelArtModal] = useState(false)
  const [descriptionText, setDescriptionText] = useState("")
  const [activeProjectId, setActiveProjectId] = useState(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [focusAidImageIndex, setFocusAidImageIndex] = useState(0)
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
    if (projectId === 1 || projectId === 7) { // VBT or Jazz Cats
      setActiveProjectId(projectId)
      setShowVideoModal(true)
    } else if (projectId === 8) { // Pixel Art Smoother
      setShowPixelArtModal(true)
    }
  }

  const handleDescriptionClick = () => {
    setShowDescriptionModal(true)
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
    const isAnyModalOpen = showVideoModal || showDescriptionModal || showFocusAidModal || showPixelArtModal
    
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
  }, [showVideoModal, showDescriptionModal, showFocusAidModal, showPixelArtModal])

  // Helper function to render description with bold CANVAS
  const renderDescription = (description) => {
    if (!description) return null
    const parts = description.split('**Canvas**')
    return (
      <>
        {parts.map((part, index) => (
          <span key={index}>
            {part}
            {index < parts.length - 1 && <strong>Canvas</strong>}
          </span>
        ))}
      </>
    )
  }

  // Video Modal Component
  const VideoModal = () => {
    if (!showVideoModal) return null

    const isVBTProject = activeProjectId === 1
    const isJazzCatsProject = activeProjectId === 7

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
              {isVBTProject ? 'VBT System Demo' : 'The Jazz Cats'}
            </h3>
            <p className="text-gray-600">
              {isVBTProject 
                ? 'Watch Hamilton College\'s Strength and Conditioning Coach use the device and web application in action'
                : 'Watch the animated short story about a cat who finds another world inside of a glass jar'
              }
            </p>
          </div>

          {/* Video Container */}
          {isVBTProject ? (
            <div className="grid md:grid-cols-2 gap-4">
              {/* Demo.mp4 */}
              <div className="space-y-2">
                <h4 className="text-lg font-semibold text-[#000052] text-center">
                  Screen Recording
                </h4>
                <video
                  className="w-full rounded-none"
                  controls
                  preload="metadata"
                  muted
                  onPlay={(e) => {
                    // Sync with other video
                    const otherVideo = e.target.parentElement.nextElementSibling?.querySelector('video')
                    if (otherVideo) {
                      otherVideo.currentTime = e.target.currentTime
                      otherVideo.play()
                    }
                  }}
                >
                  <source src={getVideoUrl('vbtDemo') || "/assets/coding%20projects/Thesis/Product%20images%20and%20video/Demo.mp4"} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>

              {/* VBT Demo.mov */}
              <div className="space-y-2">
                <h4 className="text-lg font-semibold text-[#000052] text-center">
                  Live Action
                </h4>
                <video
                  className="w-full rounded-none"
                  controls
                  preload="metadata"
                  muted
                  onPlay={(e) => {
                    // Sync with other video
                    const otherVideo = e.target.parentElement.previousElementSibling?.querySelector('video')
                    if (otherVideo) {
                      otherVideo.currentTime = e.target.currentTime
                      otherVideo.play()
                    }
                  }}
                >
                  <source src={getVideoUrl('vbtLiveDemo') || "/assets/coding%20projects/Thesis/Product%20images%20and%20video/VBT%20Demo.mp4"} type="video/mp4" />
                  Your browser does not support the video tag.
                </video>
              </div>
            </div>
          ) : isJazzCatsProject ? (
            <div className="w-full max-w-xl mx-auto">
              <video
                className="w-full rounded-none"
                controls
                preload="metadata"
                autoPlay
                muted
                onPlay={(e) => {
                  e.target.muted = false
                }}
                onLoadedMetadata={(e) => {
                  const video = e.target
                  setTimeout(() => {
                    if (!video.paused) {
                      video.muted = false
                    }
                  }, 100)
                }}
              >
                <source src={getVideoUrl('jazzCats') || "/assets/animations/JRouhana_Final_Project.mp4"} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
            </div>
          ) : null}
        </motion.div>
      </motion.div>
    )
  }

  // Description Modal Component
  const DescriptionModal = () => {
    if (!showDescriptionModal) return null

    return (
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setShowDescriptionModal(false)}
      >
        <motion.div
          className="relative bg-white rounded-none p-6 max-w-4xl w-full mx-4 max-h-[95vh] overflow-y-auto shadow-2xl"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={() => setShowDescriptionModal(false)}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl z-10"
          >
            ×
          </button>

          {/* Modal Header */}
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-[#000052] mb-2">
              Chord Progression Neural Network
            </h3>
            <p className="text-gray-600">
              Full Project Description
            </p>
          </div>

          {/* Description Text Area */}
          <div className="space-y-4">
            <textarea
              value={descriptionText}
              onChange={(e) => setDescriptionText(e.target.value)}
              placeholder="One of the most interesting aspects of our implementation was developing a neural network that could generate musically coherent chord progressions. Rather than approaching this as a simple classification problem, we designed our network to understand the musical relationships between chords sequentially. By training on the Chordonomicon dataset and representing chords using one-hot encoding, we attempted to have our model develop an understanding of harmonic context beyond simple pattern matching. The chord classifier model predicts the next chord in a musical progression based on previous chords, trained on the Chordonomicon dataset containing real chord progressions from songs. The model works with 132 different chords (12 notes × 11 chord types), each represented using one-hot encoding. This representation allows the network to understand each chord as a distinct entity while preserving the mathematical relationships needed for learning. The chord generator uses a neural network with 528 input nodes, representing four context chords encoded as one-hot vectors (4 × 132). It includes two hidden layers with 20 nodes each and an output layer with 132 nodes, which produces a one-hot encoded prediction of the next chord in the progression. The training process involved collecting 100 random samples of five consecutive chords from the Chordonomicon dataset, using the first four chords in each sequence to predict the fifth. The network was trained for 1000 epochs with a learning rate of 0.1. To generate chord progressions, the system begins with four randomly selected chords as the initial context, then randomly selects one of two pre-trained models. It generates eight warm-up chords, which are discarded, followed by eight output chords that form the final progression.
The model successfully generates musically coherent progressions like:
['C', 'G', 'Am', 'F', 'C', 'G', 'Am', 'F']
This specific example demonstrates the popular I-V-vi-IV progression (in the key of C), which appears in countless pop songs. The fact that our neural network independently discovered this common progression suggests it has learned meaningful harmonic relationships from the training data. 
"
              className="w-full h-96 p-4 bg-white border border-[#000052] rounded-none text-[#000052] placeholder:text-[#000052] resize-none focus:outline-none focus:border-[#000052]"
              style={{ color: '#000052' }}
            />
          </div>
        </motion.div>
      </motion.div>
    )
  }

  // FocusAid Modal Component
  const FocusAidModal = () => {
    if (!showFocusAidModal) return null

    // Array of FocusAid images
    const focusAidImages = [
      "/assets/coding%20projects/FocusAid/FocusAid1.png",
      "/assets/coding%20projects/FocusAid/FocusAid2.png",
      "/assets/coding%20projects/FocusAid/FocusAid3.png",
      "/assets/coding%20projects/FocusAid/FocusAid4.png",
      "/assets/coding%20projects/FocusAid/FocusAid5.png",
      "/assets/coding%20projects/FocusAid/FocusAid6.png",
      "/assets/coding%20projects/FocusAid/FocusAid7.png"
    ]

    const nextImage = () => {
      setFocusAidImageIndex((prev) => (prev + 1) % focusAidImages.length)
    }

    const prevImage = () => {
      setFocusAidImageIndex((prev) => (prev - 1 + focusAidImages.length) % focusAidImages.length)
    }

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm" onClick={() => setShowFocusAidModal(false)}>
        <div className="relative bg-white rounded-none p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
          {/* Close Button */}
          <button
            onClick={() => setShowFocusAidModal(false)}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl z-10"
          >
            ×
          </button>

          {/* Modal Header */}
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-[#000052] mb-2">
              FocusAid
            </h3>
            <p className="text-gray-600">
              Chrome Extension for Focus Enhancement
            </p>
          </div>

          {/* Simple Carousel */}
          <div className="relative">
            {/* Navigation Buttons */}
            <button
              onClick={prevImage}
              className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/80 text-[#000052] p-3 rounded-none hover:bg-white shadow-lg transition-all duration-200"
            >
              ←
            </button>
            
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/80 text-[#000052] p-3 rounded-none hover:bg-white shadow-lg transition-all duration-200"
            >
              →
            </button>

            {/* Image Display - Only this part changes */}
            <div className="w-full h-96 bg-gray-100 rounded-none overflow-hidden flex items-center justify-center">
              <AnimatePresence mode="wait">
                <motion.img
                  key={focusAidImageIndex}
                  src={focusAidImages[focusAidImageIndex]}
                  alt={`FocusAid screenshot ${focusAidImageIndex + 1}`}
                  className="max-w-full max-h-full object-contain"
                  initial={{ opacity: 0, x: 50 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -50 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                />
              </AnimatePresence>
            </div>

            {/* Image Counter */}
            <div className="text-center mt-4">
              <span className="text-gray-600 text-sm">
                {focusAidImageIndex + 1} of {focusAidImages.length}
              </span>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Pixel Art Smoother Modal Component
  const PixelArtModal = () => {
    if (!showPixelArtModal) return null

    return (
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setShowPixelArtModal(false)}
      >
        <motion.div
          className="relative bg-white rounded-none p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto shadow-2xl"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={() => setShowPixelArtModal(false)}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl z-10"
          >
            ×
          </button>

          {/* Modal Header */}
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-[#000052] mb-2">
              Pixel Art Smoother Example - Cyndaquil Sprite
            </h3>
          </div>

          {/* Video Container */}
          <div className="w-full max-w-3xl mx-auto">
            <video
              className="w-full rounded-none"
              controls
              preload="metadata"
              autoPlay
              muted
              onPlay={(e) => {
                e.target.muted = false
              }}
              onLoadedMetadata={(e) => {
                const video = e.target
                video.playbackRate = 2.0
                setTimeout(() => {
                  if (!video.paused) {
                    video.muted = false
                  }
                }, 100)
              }}
              onError={(e) => {
                console.error('Video failed to load:', e.target.error)
              }}
            >
              <source src={getVideoUrl('pixelArtSmoother') || "/assets/coding%20projects/Pixel%20Art%20Smoother/pixelartsmoother.mov"} type="video/quicktime" />
              <source src={getVideoUrl('pixelArtSmoother') || "/assets/coding%20projects/Pixel%20Art%20Smoother/pixelartsmoother.mov"} type="video/mp4" />
              <p className="text-center text-gray-600 p-4">
                Your browser does not support the video format. 
                <br />
                <a 
                  href={getVideoUrl('pixelArtSmoother') || "/assets/coding%20projects/Pixel%20Art%20Smoother/pixelartsmoother.mov"} 
                  download
                  className="text-[#000052] hover:opacity-80 underline"
                >
                  Download the video file
                </a>
              </p>
            </video>
          </div>
        </motion.div>
      </motion.div>
    )
  }

  // Projects array
  const projects = [
    {
      id: 1,
      title: "Velocity-Based Training System for Hamilton College's Athletics Department",
      fullTitle: "Velocity-Based Training System",
      description: "The Velocity-Based Training (VBT) System is a device and full-stack web application created for Hamilton College's Athletics Department. The VBT is a small, portable device that measures the velocity of a repition of an exercise on a barbell and sends the data to the web application where the data is stored and displayed in a user-friendly interface in order to track peak and average velocity of an athlete's lifts. The 5 devices are built with an Arduino Nano IoT board, a battery, charger, and switch, all of which are housed in a custom-designed, 3D-printed case. Logo and UI design created by myself. Product design, development, production, and documentation by myself, Pandelis Margaronis, Teddy Rosenbaum, and Kien Tran as our Senior Thesis project.",
      image: "/assets/coding%20projects/Thesis/Product%20images%20and%20video/VBT_logo_gray.png",
      technologies: ["Python", "React", "Next.js", "Node.js", "FastAPI", "Arduino", "Blender", "3D Printing", "Wire Soldering"],
      hasDemo: true
    },
    {
      id: 3,
      title: "Portfolio Website: Jude Rouhana",
      fullTitle: "Portfolio Website",
      description: "This very portfolio website. Built from scratch using React, Framer Motion, Three.js, and Tailwind CSS. Features smooth animations and responsive design. Try out the **Canvas** feature on the home page, a built in pixel art designer. Continue exploring my work below.",
      image: "/portfoliov2.png",
      technologies: ["React", "Framer Motion", "Three.js", "WebGL", "Tailwind CSS", "Vite"],
      hasDemo: false
    },
    {
      id: 4,
      title: "Chord Progression Neural Network",
      fullTitle: "Chord Progression Neural Network",
      description: "A neural network to generate musically coherent chord progressions by learning harmonic relationships between chords. Trained on the Chordonomicon dataset with one-hot encoded inputs, the model predicts the next chord based on the previous four. With 132 chord types and a two-layer architecture, it outputs progressions that often mirror real musical structures — including the classic I–V–vi–IV progression found in many pop songs. Built by myself and Jacob Helzner.",
    //   image: "/assets/coding%20projects/Chord%20Classifier%3AGenerator/Image.png",
      technologies: ["Python", "Neural Networks", "Machine Learning"],
      hasDescription: true
    },
    {
      id: 6,
      title: "FocusAid: A Chrome Extension for Focus Enhancement",
      fullTitle: "FocusAid",
      description: "A Chrome extension which serves as an all-in-one focus tool for people with Autism and/or ADHD. FocusAid's architecture features interactive components that enhance text selection. The floating action box offers options like highlighting, underlining, isolating, or summarizing (using OpenAI's API), while the color selection box enables custom highlight colors, and the help box provides user guidance. Researched, designed, built, and documented by myself and Pandelis Margaronis in our Developing Accessible User Interfaces course.",
      image: "/assets/coding%20projects/FocusAid/focusaid.png",
      technologies: ["OpenAI API", "Chrome Extension", "HTML", "CSS", "JavaScript"],
      hasGallery: true
    },
    {
      id: 7,
      title: "The Jazz Cats: An Animated Short",
      fullTitle: "The Jazz Cats",
      description: "An animation made with Procreate and Premiere Pro. The Jazz Cats is a short story about a cat who finds another world inside of a glass jar on his evening stroll. Hand-drawn and animated by myself. Music by myself. Fall 2022",
    //   image: "/assets/animations/JRouhana_Final_Project.mp4",
      technologies: ["Procreate", "Premiere Pro"],
      hasDemo: true
    },
    {
      id: 8,
      title: "Pixel Art Smoother",
      fullTitle: "Pixel Art Smoother",
      description: "This Python tool and retro interface uses custom algorithms to upscale and smooth pixel art images. It implements corner detection, color averaging, and multi-pass processing to transform low-resolution pixel art into higher-quality, smoother versions while preserving the original artistic style. Try it out for yourself and download the smoothed pixel art! Built by myself and Jacob Helzner.",
    //   image: "/assets/coding%20projects/Pixel%20Art%20Smoother/pixelartsmoother.mov",
      technologies: ["Python", "PIL", "Image Processing Algorithms"],
      hasDemo: true,
      hasLink: true,
      linkUrl: "https://pixelartsmoother.onrender.com"
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
            <Link to="/" className="text-xl font-bold tracking-tight text-[#000052]">
              {/* JUDE ROUHANA */}
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
                    PROJECTS
            </h2>
            <p className="text-lg text-[#000052] mb-4">My coding work, web applications, and other creative projects.</p>
                  <div className="w-24 h-1 bg-[#000052] mx-auto rounded-none mb-8"></div>
          </motion.div>

                {/* Desktop: Two-column layout */}
                <div className="hidden md:grid md:grid-cols-2 md:gap-8">
                  {/* Left Column: Projects List */}
          <motion.div variants={itemVariants} className="space-y-4">
            {projects.map((project, index) => (
              <motion.div
                key={project.id}
                        className={`bg-white rounded-none border border-black overflow-hidden transition-all duration-200 ${
                          expandedProject === project.id ? 'border-[#000052] border-2 bg-gray-50' : ''
                        }`}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: index * 0.1 }}
              >
                {/* Project Title (Clickable) */}
                <motion.button
                  onClick={() => toggleProject(project.id)}
                          className={`w-full p-6 text-left flex items-center justify-between transition-colors duration-200 ${
                            expandedProject === project.id ? 'bg-gray-50' : 'hover:bg-gray-50'
                          }`}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                          <h3 className="text-lg font-bold text-[#000052]">
                            {project.title}
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
                        const selectedProject = projects.find(p => p.id === expandedProject)
                        if (!selectedProject) return null
                        
                        return (
                          <motion.div
                            key={expandedProject}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                            className="bg-white rounded-none border border-black p-6 space-y-6"
                          >
                            {/* Project Image */}
                            {selectedProject.image && (
                              <div className="flex justify-center">
                                <div className="h-48 w-full max-w-md bg-gray-50 rounded-none flex items-center justify-center">
                                  {selectedProject.image.startsWith('assets/') || selectedProject.image.startsWith('/') ? (
                                    <img 
                                      src={selectedProject.image} 
                                      alt={selectedProject.fullTitle}
                                      className="max-w-full max-h-full object-contain"
                                    />
                                  ) : (
                                    <span className="text-6xl">{selectedProject.image}</span>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Full Title */}
                            <div className="text-center">
                              <h4 className="text-2xl font-bold text-[#000052] mb-2">
                                {selectedProject.fullTitle}
                              </h4>
                            </div>

                            {/* Description */}
                            <p className="text-[#000052] leading-relaxed">
                              {renderDescription(selectedProject.description)}
                            </p>

                            {/* Technologies */}
                            <div className="flex flex-wrap gap-2 justify-center">
                              {selectedProject.technologies.map((tech) => (
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
                              {selectedProject.hasLink && (
                                <motion.a
                                  href={selectedProject.linkUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="px-6 py-3 bg-[#000052] text-white font-semibold rounded-none hover:opacity-80 transition-all duration-300"
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                >
                                  Check it out!
                                </motion.a>
                              )}
                              {selectedProject.hasDemo && (
                                <motion.button
                                  onClick={() => handleLiveDemoClick(selectedProject.id)}
                                  className="px-6 py-3 bg-[#000052] text-white font-semibold rounded-none hover:opacity-80 transition-all duration-300"
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                >
                                  {selectedProject.id === 7 ? 'Watch Animation' : 'Watch Demo'}
                                </motion.button>
                              )}
                              {selectedProject.hasDescription && (
                                <motion.button
                                  onClick={handleDescriptionClick}
                                  className="px-6 py-3 bg-[#000052] text-white font-semibold rounded-none hover:opacity-80 transition-all duration-300"
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                >
                                  Full Description
                                </motion.button>
                              )}
                              {selectedProject.hasGallery && (
                                <motion.button
                                  onClick={() => setShowFocusAidModal(true)}
                                  className="px-6 py-3 bg-[#000052] text-white font-semibold rounded-none hover:opacity-80 transition-all duration-300"
                                  whileHover={{ scale: 1.05 }}
                                  whileTap={{ scale: 0.95 }}
                                >
                                  View Gallery
                                </motion.button>
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
                  {projects.map((project, index) => (
                    <motion.div
                      key={project.id}
                      className="bg-white rounded-none border border-black overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: index * 0.1 }}
              >
                {/* Project Title (Clickable) */}
                <motion.button
                  onClick={() => toggleProject(project.id)}
                        className="w-full p-6 text-left flex items-center justify-between hover:bg-gray-50 transition-colors duration-200"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                        <h3 className="text-lg font-bold text-[#000052]">
                    {project.title}
                  </h3>
                  <motion.div
                    animate={{ rotate: expandedProject === project.id ? 180 : 0 }}
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
                  {expandedProject === project.id && (
                    <motion.div
                      variants={dropdownVariants}
                      initial="hidden"
                      animate="visible"
                      exit="exit"
                            className="border-t border-black"
                    >
                      <div className="p-6 space-y-6">
                        {/* Project Image */}
                        {project.image && (
                        <div className="flex justify-center">
                            <div className="h-48 w-full max-w-md bg-gray-50 rounded-none flex items-center justify-center">
                              {project.image.startsWith('assets/') || project.image.startsWith('/') ? (
                              <img 
                                src={project.image} 
                                alt={project.fullTitle}
                                className="max-w-full max-h-full object-contain"
                              />
                            ) : (
                                <span className="text-6xl">{project.image}</span>
                            )}
                          </div>
                        </div>
                        )}

                        {/* Full Title */}
                        <div className="text-center">
                                <h4 className="text-2xl font-bold text-[#000052] mb-2">
                            {project.fullTitle}
                          </h4>
                        </div>

                        {/* Description */}
                              <p className="text-[#000052] leading-relaxed">
                          {renderDescription(project.description)}
                        </p>

                        {/* Technologies */}
                        <div className="flex flex-wrap gap-2 justify-center">
                          {project.technologies.map((tech) => (
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
                          {project.hasLink && (
                            <motion.a
                              href={project.linkUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-6 py-3 bg-[#000052] text-white font-semibold rounded-none hover:opacity-80 transition-all duration-300"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              Check it out!
                            </motion.a>
                          )}
                          {project.hasDemo && (
                            <motion.button
                              onClick={() => handleLiveDemoClick(project.id)}
                                    className="px-6 py-3 bg-[#000052] text-white font-semibold rounded-none hover:opacity-80 transition-all duration-300"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              {project.id === 7 ? 'Watch Animation' : 'Watch Demo'}
                            </motion.button>
                          )}
                          {project.hasDescription && (
                            <motion.button
                              onClick={handleDescriptionClick}
                                    className="px-6 py-3 bg-[#000052] text-white font-semibold rounded-none hover:opacity-80 transition-all duration-300"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              Full Description
                            </motion.button>
                          )}
                          {project.hasGallery && (
                            <motion.button
                              onClick={() => setShowFocusAidModal(true)}
                                    className="px-6 py-3 bg-[#000052] text-white font-semibold rounded-none hover:opacity-80 transition-all duration-300"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              View Gallery
                            </motion.button>
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
      <DescriptionModal />
      <FocusAidModal />
      <PixelArtModal />
    </div>
  )
}

export default Projects 
