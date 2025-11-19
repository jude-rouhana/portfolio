import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { useState } from 'react'
import { getVideoUrl } from '../config/assets'

const AdditionalProjects = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  })
  const [showVideoModal, setShowVideoModal] = useState(false)
  const [showParticleModal, setShowParticleModal] = useState(false)
  const [showPixelArtModal, setShowPixelArtModal] = useState(false)

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.1
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

  const additionalProjects = [
    {
      id: 1,
      title: "The Jazz Cats",
      description: "An animation made with Procreate and Premiere Pro. The Jazz Cats is a short story about a cat who finds another world inside of a glass jar on his evening stroll. Hand-drawn and animated by myself. Music by myself. Fall 2022",
      technologies: ["Procreate", "Premiere Pro"],
      category: "Animation",
    //   year: "2023"
    },
    {
      id: 2,
      title: "Pixel Art Smoother",
      description: "This Python tool and retro interface uses custom algorithms to upscale and smooth pixel art images. It implements corner detection, color averaging, and multi-pass processing to transform low-resolution pixel art into higher-quality, smoother versions while preserving the original artistic style. Try it out for yourself and download the smoothed pixel art! Built by myself and Jacob Helzner.",
      technologies: ["Python", "PIL", "Image Processing Algorithms"],
      category: "Pixel Art",
    },
    {
      id: 3,
      title: "More to come...",
      description: "Upcoming projects: video games, chord progression creator, and more!",
      technologies: [],
      category: "Stay tuned!",
    }
    // {
    //   id: 4,
    //   title: "Video Game",
    //   description: "A video game... will fill this in later.",
    //   technologies: [],
    //   category: "Video Game",
    // },
    // {
    //   id: 5,
    //   title: "Side Project 1",
    //   description: "A side project... will fill this in later.",
    //   technologies: [],
    //   category: "Side Project",
    // },
    // {
    //   id: 6,
    //   title: "Side Project 2",
    //   description: "A side project... will fill this in later.",
    //   technologies: [],
    //   category: "Side Project",
    // }
  ]

  // Video Modal Component
  const VideoModal = () => {
    if (!showVideoModal) return null

    return (
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setShowVideoModal(false)}
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
            onClick={() => setShowVideoModal(false)}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl z-10"
          >
            ×
          </button>

          {/* Modal Header */}
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-gray-800 font-display mb-2">
              The Jazz Cats
            </h3>
          </div>

          {/* Video Container */}
          <div className="w-full max-w-xl mx-auto">
            <video
              className="w-full rounded-none"
              controls
              preload="metadata"
              autoPlay
              muted
              onPlay={(e) => {
                // Enable sound when user clicks play
                e.target.muted = false
              }}
              onLoadedMetadata={(e) => {
                // Enable sound when video is ready
                const video = e.target
                // Try to enable sound after a short delay
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
        </motion.div>
      </motion.div>
    )
  }

  // Particle Video Modal Component
  const ParticleVideoModal = () => {
    if (!showParticleModal) return null

    return (
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={() => setShowParticleModal(false)}
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
            onClick={() => setShowParticleModal(false)}
            className="absolute top-4 right-4 text-gray-500 hover:text-gray-700 text-2xl z-10"
          >
            ×
          </button>

          {/* Modal Header */}
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-gray-800 font-display mb-2">
              Interactive Particle Visualization
            </h3>
          </div>

          {/* Video Container */}
          <div className="w-full">
            <video
              className="w-full rounded-none"
              controls
              preload="metadata"
              autoPlay
              muted
              onPlay={(e) => {
                // Enable sound when user clicks play
                e.target.muted = false
              }}
              onLoadedMetadata={(e) => {
                // Enable sound when video is ready
                const video = e.target
                // Try to enable sound after a short delay
                setTimeout(() => {
                  if (!video.paused) {
                    video.muted = false
                  }
                }, 100)
              }}
            >
              <source src={getVideoUrl('particleVisualization') || "/assets/coding%20projects/Particle%20Visualization.mov"} type="video/quicktime" />
              Your browser does not support the video tag.
            </video>
          </div>
        </motion.div>
      </motion.div>
    )
  }

  // Pixel Art Smoother Video Modal Component
  const PixelArtVideoModal = () => {
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
            <h3 className="text-2xl font-bold text-gray-800 font-display mb-2">
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
                // Enable sound when user clicks play
                e.target.muted = false
              }}
              onLoadedMetadata={(e) => {
                // Enable sound when video is ready and set playback speed to 2x
                const video = e.target
                video.playbackRate = 2.0 // Set to 2x speed
                // Try to enable sound after a short delay
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
                  className="text-blue-600 hover:text-blue-800 underline"
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

  return (
    <section
      id="additional-projects"
      data-section="additional-projects"
      className="bg-transparent"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div
          ref={ref}
          variants={containerVariants}
          initial="hidden"
          animate={inView ? "visible" : "hidden"}
        >
          {/* Section Header */}
          <motion.div variants={itemVariants} className="text-center mb-16">
            <h2 className="text-4xl sm:text-5xl font-bold text-contrast mb-4 font-display">
              Additional Projects
            </h2>
            <p className="text-contrast-gray text-lg max-w-3xl mx-auto">
              A collection of smaller projects and experiments showcasing various skills and interests
            </p>
            <div className="w-24 h-1 bg-accent-gold mx-auto rounded-none mt-6"></div>
          </motion.div>

          {/* Projects Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {additionalProjects.map((project, index) => (
              <motion.div
                key={project.id}
                variants={itemVariants}
                className="group bg-primary rounded-none overflow-hidden border border-border-color hover:border-accent-gold/50 transition-all duration-300 hover:shadow-lg"
                whileHover={{ y: -5 }}
              >
                {/* Project Header */}
                <div className="p-6 border-b border-border-color">
                  <div className="flex items-center justify-between mb-3">
                    <span className="px-3 py-1 bg-accent-blue/10 text-accent-blue text-xs font-medium rounded-none">
                      {project.category}
                    </span>
                    {/* <span className="text-contrast-gray text-sm font-medium">
                      {project.year}
                    </span> */}
                  </div>
                  <h3 className="text-xl font-bold text-contrast mb-2 font-display">
                    {project.title}
                  </h3>
                  <p className="text-contrast-gray text-sm leading-relaxed">
                    {project.description}
                  </p>
                </div>

                {/* Technologies */}
                <div className="p-6">
                  <div className="flex flex-wrap gap-2 mb-4">
                    {project.technologies.map((tech) => (
                      <span
                        key={tech}
                        className="px-2 py-1 bg-accent-gold/10 text-accent-gold text-xs font-medium rounded-none"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>

                  {/* Project Actions */}
                  <div className="flex gap-2">
                    {project.category === "Animation" ? (
                      <motion.button
                        onClick={() => setShowVideoModal(true)}
                        className="px-4 py-2 bg-accent-gold text-white text-sm font-semibold rounded-none hover:bg-accent-gold/80 transition-all duration-300"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        Watch Animation
                      </motion.button>
                    ) : project.id === 2 ? (
                      <>
                        <motion.a
                          href="https://pixelartsmoother.onrender.com"
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 bg-accent-gold text-white text-sm font-semibold rounded-none hover:bg-accent-gold/80 transition-all duration-300"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Check it out!
                        </motion.a>
                        <motion.button
                          onClick={() => setShowPixelArtModal(true)}
                          className="px-4 py-2 bg-accent-gold text-white text-sm font-semibold rounded-none hover:bg-accent-gold/80 transition-all duration-300"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Demo
                        </motion.button>
                      </>
                    ) : project.id === 3 ? (
                      // No buttons for project id 3
                      null
                    ) : (
                      <>
                        <motion.button
                          className="px-4 py-2 bg-accent-gold text-white text-sm font-semibold rounded-none hover:bg-accent-gold/80 transition-all duration-300"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          View Details
                        </motion.button>
                        <motion.button
                          className="px-4 py-2 border border-accent-gold text-accent-gold text-sm font-semibold rounded-none hover:bg-accent-gold hover:text-white transition-all duration-300"
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                        >
                          Demo
                        </motion.button>
                      </>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Call to Action */}
          {/* <motion.div 
            variants={itemVariants}
            className="text-center mt-12"
          >
            <p className="text-contrast-gray mb-6">
              Interested in seeing more of my work or collaborating on a project?
            </p>
            <motion.a
              href="#contact"
              className="inline-flex items-center gap-2 px-8 py-4 bg-accent-blue text-white font-semibold rounded-none hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <span>Get In Touch</span>
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
              </svg>
            </motion.a>
          </motion.div> */}
        </motion.div>
      </div>
      
      {/* Video Modal */}
      <VideoModal />
      {/* Particle Video Modal */}
      <ParticleVideoModal />
      {/* Pixel Art Smoother Video Modal */}
      <PixelArtVideoModal />
    </section>
  )
}

export default AdditionalProjects 