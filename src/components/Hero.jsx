import { motion, AnimatePresence } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { useState, useEffect } from 'react'


const Hero = () => {
  const [ref, inView] = useInView({
    triggerOnce: false, // Changed to false so animation runs every time
    threshold: 0.1
  })

  const [planeLanded, setPlaneLanded] = useState(false)
  const [showIntro, setShowIntro] = useState(true)
  const [startLetterWave, setStartLetterWave] = useState(false)

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

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.3
      }
    }
  }

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.6,
        ease: "easeOut"
      }
    }
  }

  // Intro animation effect
  useEffect(() => {
    // Reset intro state on component mount
    setShowIntro(true)
    setStartLetterWave(false)
    
    const timer = setTimeout(() => {
      setStartLetterWave(true) // Start letter wave animation
    }, 1500) // Start wave after 1.5 seconds (reduced from 2.5)
    
    const hideTimer = setTimeout(() => {
      setShowIntro(false) // Hide intro after wave completes
    }, 3500) // Total 3.5 seconds (reduced from 6 seconds)
    
    return () => {
      clearTimeout(timer)
      clearTimeout(hideTimer)
    }
  }, []) // Empty dependency array ensures this runs only on mount

  // Reset plane animation when section comes into view
  useEffect(() => {
    if (inView) {
      setPlaneLanded(false) // Keep plane flying continuously
    }
  }, [inView])

  const scrollToSection = (sectionId) => {
    const element = document.getElementById(sectionId)
    if (element) {
      // Get navbar height (h-16 = 64px) plus some extra spacing
      const navbarHeight = 80 // 64px navbar + 16px spacing
      const elementPosition = element.getBoundingClientRect().top + window.pageYOffset
      const offsetPosition = elementPosition - navbarHeight
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      })
    }
  }

  return (
    <section
      id="home"
      data-section="home"
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
    >


      {/* Intro Overlay with Wavy Animation */}
      <AnimatePresence>
        {showIntro && (
          <motion.div
            key="intro-overlay"
            className="absolute inset-0 bg-contrast z-50 flex items-center justify-center"
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
            
            {/* Portfolio Title */}
            <motion.h1
              key="intro-title"
              className="text-3xl sm:text-4xl md:text-6xl font-bold text-white text-center font-figtree"
              initial={{ opacity: 0, y: 50 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 1,
                ease: "easeOut"
              }}
            >
              {/* Jude Rouhana - Individual letters for wave effect */}
              <div className="flex justify-center items-center">
                {["J", "U", "D", "E", " ", "R", "O", "U", "H", "A", "N", "A"].map((letter, index) => (
                  <motion.span
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ 
                      opacity: startLetterWave ? 0 : 1, 
                      y: startLetterWave ? -20 : 0,
                      transition: {
                        duration: 0.3,
                        delay: startLetterWave ? index * 0.02 : 0.2 + index * 0.02,
                        ease: "easeOut"
                      }
                    }}
                    className="inline-block"
                  >
                    {letter === " " ? "\u00A0" : letter}
                  </motion.span>
                ))}
              </div>
              <br />
              {/* Logo instead of Portfolio text */}
              <div className="flex justify-center items-center">
                <motion.img
                  src="/logo/JR%20Logo.png"
                  alt="JR Logo"
                  className="w-12 h-12 sm:w-16 sm:h-16 md:w-20 md:h-20 object-contain"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ 
                    opacity: startLetterWave ? 0 : 1, 
                    y: startLetterWave ? -20 : 0,
                    transition: {
                      duration: 0.3,
                      delay: startLetterWave ? 0.6 : 0.4,
                      ease: "easeOut"
                    }
                  }}
                />
              </div>
            </motion.h1>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Animated Plane */}
      {/* <motion.img
        src="/plane.png"
        alt="Flying plane"
        className="absolute w-32 h-32 z-20"
        key={inView ? 'flying' : 'reset'} // Force re-render when inView changes
        initial={{ 
          x: 1200, 
          y: -250,
          opacity: 1
        }}
        animate={{
          // Continuous sine wave motion from right to left with repeat
          x: [
            1200,    // Start off-screen right
            1000,    // 
            800,     // 
            600,     // 
            400,     // 
            200,     // 
            0,       // Center
            -200,    // 
            -400,    // Off-screen left
            -600,    // Stay off-screen (pause)
            -800,    // Stay off-screen (pause)
          ],
          y: [
            -250,    // Start height (perfect position)
            -230,    // Down
            -270,    // Up
            -220,    // Down
            -280,    // Up
            -225,    // Down
            -265,    // Up
            -230,    // Down
            -250,    // Back to start height
            -240,    // Stay same (pause)
            -250,    // Stay same (pause)
          ]
        }}
        transition={{
          // Continuous animation with pause and repeat
          duration: 11, // 10 seconds flying + 1 second pause
          repeat: Infinity,
          repeatType: "loop",
          ease: "linear"
        }}
      /> */}

      {/* Computer Sprite - Bottom Right
      <motion.img
        src="/computer.png"
        alt="Pixel art computer setup"
        className="absolute bottom-10 right-10 w-24 h-24 z-10"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.8 }}
        transition={{
          duration: 1.5,
          // delay: 1,
          ease: "easeOut"
        }}
        whileHover={{ 
          scale: 1.5, 
          opacity: 1,
          transition: { duration: 0.3 }
        }}
      /> */}

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-20">
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={inView && !showIntro ? "visible" : "hidden"}
          className="text-center"
          style={{ visibility: showIntro ? 'hidden' : 'visible' }}
        >

          {/* Main Heading */}
          <motion.h1 
            variants={itemVariants}
            className="text-3xl sm:text-4xl lg:text-7xl font-bold text-white mb-4 sm:mb-6 font-display drop-shadow-lg"
          >
            <span className="text-accent-blue">
              {/* Jude Rouhana */}
            </span>
          </motion.h1>

          {/* Tagline */}
          <motion.p 
            variants={itemVariants}
            className="text-lg sm:text-xl lg:text-3xl text-white mb-6 sm:mb-8 max-w-3xl mx-auto font-light drop-shadow-lg"
          >
            {/* Full-Stack Developer */}
          </motion.p>

          {/* Description
          <motion.p 
            variants={itemVariants}
            className="text-lg text-contrast-gray mb-12 max-w-2xl mx-auto leading-relaxed"
          >
            I bring ideas to life through code, design, and creativity.
          </motion.p> */}

          {/* Call to Action Buttons */}
          {/* <motion.div 
            variants={itemVariants}
            className="flex flex-col sm:flex-row gap-4 justify-center items-center"
          >
            <motion.button
              onClick={() => scrollToSection('projects')}
              className="px-8 py-4 bg-accent-blue text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              View My Work
            </motion.button>
            
            <motion.button
              onClick={() => scrollToSection('contact')}
              className="px-8 py-4 border-2 border-accent-blue text-accent-blue font-semibold rounded-lg hover:bg-accent-blue hover:text-white transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Get In Touch
            </motion.button>
          </motion.div> */}

        </motion.div>
      </div>

      {/* Explore Message with Bobbing Animation */}
      <motion.div
        variants={itemVariants}
        className="absolute transform -translate-x-1/2 flex flex-col items-center gap-2 z-30"
        initial={{ opacity: 0, y: 20 }}
        animate={{ 
          opacity: 1, 
          y: 0,
          transition: {
            duration: 0.8,
            delay: 3.0
          }
        }}
      >
        <motion.p
          className="text-white text-2xl font-medium drop-shadow-2xl"
          animate={{
            y: [0, -8, 0],
            transition: {
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut"
            }
          }}
        >
          EXPLORE
        </motion.p>
        <motion.div
          animate={{
            y: [0, -8, 0],
            transition: {
              duration: 3,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.3
            }
          }}
        >
          <svg 
            xmlns="http://www.w3.org/2000/svg" 
            className="h-6 w-6 text-white drop-shadow-2xl" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M19 14l-7 7m0 0l-7-7m7 7V3" 
            />
          </svg>
        </motion.div>
      </motion.div>
    </section>
  )
}

export default Hero 