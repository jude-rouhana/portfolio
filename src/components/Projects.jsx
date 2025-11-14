import { motion, AnimatePresence } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { useState } from 'react'
import { getVideoUrl } from '../config/assets'

const Projects = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  })
  const [showVideoModal, setShowVideoModal] = useState(false)
  const [showDescriptionModal, setShowDescriptionModal] = useState(false)
  const [showFocusAidModal, setShowFocusAidModal] = useState(false)
  const [descriptionText, setDescriptionText] = useState("")
  const [activeProjectId, setActiveProjectId] = useState(null)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [focusAidImageIndex, setFocusAidImageIndex] = useState(0)
  const [expandedProject, setExpandedProject] = useState(null)

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.1
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
    if (projectId === 1 || projectId === 2 || projectId === 5) { // VBT, Othello, or Astro Invader
      setActiveProjectId(projectId)
      setShowVideoModal(true)
    }
  }

  const handleDescriptionClick = () => {
    setShowDescriptionModal(true)
  }

  const toggleProject = (projectId) => {
    setExpandedProject(expandedProject === projectId ? null : projectId)
  }

  // Video Modal Component
  const VideoModal = () => {
    if (!showVideoModal) return null

    const isVBTProject = activeProjectId === 1
    const isOthelloProject = activeProjectId === 2
    const isAstroInvaderProject = activeProjectId === 5

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
          className="relative bg-white rounded-xl p-6 max-w-4xl w-full mx-4 max-h-[80vh] overflow-y-auto shadow-2xl"
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
            <h3 className="text-2xl font-bold text-gray-800 font-display mb-2">
              {isVBTProject ? 'VBT System Demo' : isOthelloProject ? 'Othello AI Demo' : 'Astro Invader Demo'}
            </h3>
            <p className="text-gray-600">
              {isVBTProject 
                ? 'Watch Hamilton College\'s Strength and Conditioning Coach use the device and web application in action'
                : isOthelloProject
                ? 'Watch the AI opponent in action with minimax algorithm'
                : 'Watch the space-themed arcade game in action'
              }
            </p>
          </div>

          {/* Video Container */}
          {isVBTProject ? (
            <div className="grid md:grid-cols-2 gap-4">
              {/* Demo.mp4 */}
              <div className="space-y-2">
                <h4 className="text-lg font-semibold text-contrast text-center">
                  Screen Recording
                </h4>
                <video
                  className="w-full rounded-lg"
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
                <h4 className="text-lg font-semibold text-contrast text-center">
                  Live Action
                </h4>
                <video
                  className="w-full rounded-lg"
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
          ) : isOthelloProject ? (
            <div className="w-full max-w-lg mx-auto">
              <video
                className="w-full rounded-lg"
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
                className="w-full rounded-lg"
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
                    className="text-blue-600 hover:text-blue-800 underline"
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
          className="relative bg-white rounded-xl p-6 max-w-4xl w-full mx-4 max-h-[95vh] overflow-y-auto shadow-2xl"
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.9, opacity: 0 }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={() => setShowDescriptionModal(false)}
            className="absolute top-4 right-4 text-contrast-gray hover:text-contrast text-2xl z-10"
          >
            ×
          </button>

          {/* Modal Header */}
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-contrast font-display mb-2">
              Chord Progression Neural Network
            </h3>
            <p className="text-contrast-gray">
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
              className="w-full h-96 p-4 bg-primary border border-border-color rounded-lg text-contrast placeholder-contrast-gray resize-none focus:outline-none focus:border-accent-blue"
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
        <div className="relative bg-white rounded-xl p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto shadow-2xl" onClick={(e) => e.stopPropagation()}>
          {/* Close Button */}
          <button
            onClick={() => setShowFocusAidModal(false)}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl z-10"
          >
            ×
          </button>

          {/* Modal Header */}
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-gray-800 font-display mb-2">
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
              className="absolute left-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/80 text-gray-800 p-3 rounded-full hover:bg-white shadow-lg transition-all duration-200"
            >
              ←
            </button>
            
            <button
              onClick={nextImage}
              className="absolute right-4 top-1/2 transform -translate-y-1/2 z-20 bg-white/80 text-gray-800 p-3 rounded-full hover:bg-white shadow-lg transition-all duration-200"
            >
              →
            </button>

            {/* Image Display - Only this part changes */}
            <div className="w-full h-96 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center">
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
      id: 2,
      title: "Othello Smart AI Opponent",
      fullTitle: "Othello AI",
      description: "An intelligent Othello game implementation with AI opponent using minimax algorithm and alpha-beta pruning. Features a fun interface with original artwork. Built by myself and Jacob Helzner.",
      image: "/assets/coding%20projects/Othello/othello.png",
      technologies: ["Python", "Minimax Algorithm", "Alpha-Beta Pruning", "Pixel Art", "Graphical User Interface"],
      hasDemo: true
    },
    {
      id: 3,
      title: "Portfolio Website: Jude Rouhana",
      fullTitle: "Portfolio Website",
      description: "This very portfolio website! Built from scratch using React, Framer Motion, Three.js, and Tailwind CSS. Features smooth animations, custom-made 3D ocean background, and responsive design. Continue exploring my work below, more projects coming soon!",
      image: "/portfolio.png",
      technologies: ["React", "Framer Motion", "Three.js", "WebGL", "Tailwind CSS", "Vite"],
      hasDemo: false
    },
    {
      id: 4,
      title: "Chord Progression Neural Network",
      fullTitle: "Chord Progression Neural Network",
      description: "A neural network to generate musically coherent chord progressions by learning harmonic relationships between chords. Trained on the Chordonomicon dataset with one-hot encoded inputs, the model predicts the next chord based on the previous four. With 132 chord types and a two-layer architecture, it outputs progressions that often mirror real musical structures — including the classic I–V–vi–IV progression found in many pop songs. Built by myself and Jacob Helzner.",
      image: "/assets/coding%20projects/Chord%20Classifier%3AGenerator/Image.png",
      technologies: ["Python", "Neural Networks", "Machine Learning"],
      hasDescription: true
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
      title: "FocusAid: A Chrome Extension for Focus Enhancement",
      fullTitle: "FocusAid",
      description: "A Chrome extension which serves as an all-in-one focus tool for people with Autism and/or ADHD. FocusAid's architecture features interactive components that enhance text selection. The floating action box offers options like highlighting, underlining, isolating, or summarizing (using OpenAI's API), while the color selection box enables custom highlight colors, and the help box provides user guidance. Researched, designed, built, and documented by myself and Pandelis Margaronis in our Developing Accessible User Interfaces course.",
      image: "/assets/coding%20projects/FocusAid/focusaid.png",
      technologies: ["OpenAI API", "Chrome Extension", "HTML", "CSS", "JavaScript"],
      hasGallery: true
    }
  ]

  return (
    <section
      id="projects"
      data-section="projects"
      className="bg-transparent"
    >
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
        >
          {/* Section Header */}
          <motion.div variants={itemVariants} className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-contrast mb-4 font-display">
              Featured Coding Projects
            </h2>
            <div className="w-24 h-1 bg-accent-gold mx-auto rounded-full mb-8"></div>
          </motion.div>

          {/* Projects List */}
          <motion.div variants={itemVariants} className="space-y-4">
            {projects.map((project, index) => (
              <motion.div
                key={project.id}
                className="bg-primary-dark rounded-lg border border-border-color overflow-hidden"
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ delay: index * 0.1 }}
              >
                {/* Project Title (Clickable) */}
                <motion.button
                  onClick={() => toggleProject(project.id)}
                  className="w-full p-6 text-left flex items-center justify-between hover:bg-primary/70 transition-colors duration-200"
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                >
                  <h3 className="text-lg font-bold text-accent-blue font-display">
                    {project.title}
                  </h3>
                  <motion.div
                    animate={{ rotate: expandedProject === project.id ? 180 : 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <svg 
                      className="w-6 h-6 text-contrast-gray" 
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
                      className="border-t border-border-color"
                    >
                      <div className="p-6 space-y-6">
                        {/* Project Image */}
                        <div className="flex justify-center">
                          <div className="h-48 w-full max-w-md bg-accent-light/10 rounded-lg flex items-center justify-center">
                            {project.image && (project.image.startsWith('assets/') || project.image.startsWith('/')) ? (
                              <img 
                                src={project.image} 
                                alt={project.fullTitle}
                                className="max-w-full max-h-full object-contain"
                              />
                            ) : (
                              <span className="text-6xl">{project.image || '📁'}</span>
                            )}
                          </div>
                        </div>

                        {/* Full Title */}
                        <div className="text-center">
                          <h4 className="text-2xl font-bold text-contrast font-display mb-2">
                            {project.fullTitle}
                          </h4>
                        </div>

                        {/* Description */}
                        <p className="text-contrast-gray leading-relaxed">
                          {project.description}
                        </p>

                        {/* Technologies */}
                        <div className="flex flex-wrap gap-2 justify-center">
                          {project.technologies.map((tech) => (
                            <span
                              key={tech}
                              className="px-3 py-1 bg-accent-blue/10 text-accent-blue text-sm font-medium rounded-full border border-accent-blue/20"
                            >
                              {tech}
                            </span>
                          ))}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex justify-center gap-4">
                          {project.hasDemo && (
                            <motion.button
                              onClick={() => handleLiveDemoClick(project.id)}
                              className="px-6 py-3 bg-accent-blue text-white font-semibold rounded-lg hover:bg-accent-blue/80 transition-all duration-300"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              Watch Demo
                            </motion.button>
                          )}
                          {project.hasDescription && (
                            <motion.button
                              onClick={handleDescriptionClick}
                              className="px-6 py-3 bg-accent-gold text-white font-semibold rounded-lg hover:bg-accent-gold/80 transition-all duration-300"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                            >
                              Full Description
                            </motion.button>
                          )}
                          {project.hasGallery && (
                            <motion.button
                              onClick={() => setShowFocusAidModal(true)}
                              className="px-6 py-3 bg-accent-gold text-white font-semibold rounded-lg hover:bg-accent-gold/80 transition-all duration-300"
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
      
      {/* Modals */}
      <VideoModal />
      <DescriptionModal />
      <FocusAidModal />
    </section>
  )
}

export default Projects 