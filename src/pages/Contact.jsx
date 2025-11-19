import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useState, useEffect, useRef } from 'react'
import { useInView } from 'react-intersection-observer'
import emailjs from '@emailjs/browser'
import Toast from '../components/Toast'

const Contact = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  })
  const [trailCells, setTrailCells] = useState([])
  const [isShiftHeld, setIsShiftHeld] = useState(false)
  const [isMobile, setIsMobile] = useState(false)
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' })
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

  // Form handlers
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      // EmailJS configuration
      const serviceId = 'service_b8x6dgi'
      const templateId = 'template_ywy32zf'
      const publicKey = 'DEVcfMoSMdqumXQr8'
      
      const templateParams = {
        to_email: 'juderouhana@gmail.com',
        from_name: formData.name,
        from_email: formData.email,
        subject: formData.subject,
        message: formData.message,
        reply_to: formData.email
      }

      const result = await emailjs.send(serviceId, templateId, templateParams, publicKey)
      
      if (result.status === 200) {
        setToast({ show: true, message: "Message sent successfully! I'll get back to you soon.", type: 'success' })
        setFormData({ name: '', email: '', subject: '', message: '' })
      } else {
        setToast({ show: true, message: "Failed to send message. Please try again.", type: 'error' })
      }
    } catch (error) {
      console.error('Email sending failed:', error)
      setToast({ show: true, message: "Failed to send message. Please try again later.", type: 'error' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const socialLinks = [
    {
      name: 'LinkedIn',
      url: 'https://www.linkedin.com/in/jude-rouhana-798542261/',
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/></svg>,
    },
    {
      name: 'Instagram',
      url: 'https://www.instagram.com/juderouhana/',
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>,
    },
    {
      name: 'Pinterest',
      url: 'https://www.pinterest.com/juderouhana10/_profile/',
      icon: <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0c-6.627 0-12 5.373-12 12 0 4.99 3.045 9.27 7.38 11.08-.11-.937-.2-2.38.042-3.407.217-.937 1.407-5.965 1.407-5.965s-.36-.72-.36-1.78c0-1.67.968-2.915 2.172-2.915 1.024 0 1.518.77 1.518 1.69 0 1.03-.654 2.568-.993 3.995-.283 1.195.598 2.17 1.775 2.17 2.13 0 3.77-2.245 3.77-5.475 0-2.86-2.06-4.875-5.008-4.875-3.41 0-5.41 2.562-5.41 5.22 0 1.033.397 2.14.893 2.738.098.12.11.224.083.345-.09.375-.293 1.2-.334 1.365-.053.225-.175.27-.402.165-1.495-.69-2.433-2.878-2.433-4.645 0-3.77 2.738-7.255 7.92-7.255 4.162 0 7.397 2.967 7.397 6.93 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.36-.63-2.75-1.378l-.748 2.853c-.27 1.042-1.002 2.348-1.492 3.145 1.124.345 2.317.532 3.554.532 6.627 0 12-5.373 12-12s-5.373-12-12-12z"/></svg>,
    }
  ]

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
              JUDE ROUHANA
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
                CONTACT
              </h2>
              <p className="text-lg text-[#000052] mb-8">
                Get in touch with me
              </p>
              <div className="w-24 h-1 bg-[#000052] mx-auto mb-8"></div>
            </motion.div>

            <div className="grid lg:grid-cols-2 gap-12">
              {/* Contact Form */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: 1.0 }}
              >
                <h3 className="text-2xl font-bold text-[#000052] mb-6">Send a Message</h3>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid sm:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-[#000052] mb-2">
                        Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-black bg-white text-[#000052] placeholder-gray-400 transition-all duration-300"
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-[#000052] mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-black bg-white text-[#000052] placeholder-gray-400 transition-all duration-300"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-[#000052] mb-2">
                      Subject *
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-black bg-white text-[#000052] placeholder-gray-400 transition-all duration-300"
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-[#000052] mb-2">
                      Message *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      required
                      rows={6}
                      className="w-full px-4 py-3 border border-black bg-white text-[#000052] placeholder-gray-400 transition-all duration-300 resize-none"
                    />
                  </div>
                  
                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full px-8 py-4 bg-[#000052] text-white font-semibold hover:opacity-80 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                    whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                    whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
                  >
                    {isSubmitting ? 'Sending...' : 'Send Message'}
                  </motion.button>
                </form>
              </motion.div>

              {/* Contact Information */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : {}}
                transition={{ duration: 0.8, delay: 1.2 }}
                className="space-y-8"
              >
                <div>
                  <h3 className="text-2xl font-bold text-[#000052] mb-6">Let's Connect</h3>
                </div>

                {/* Contact Details */}
                <div className="space-y-4">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-[#000052] flex items-center justify-center">
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 text-white">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
                      </svg>
                    </div>
                    <div className="bg-white border border-black px-4 py-2">
                      <div className="text-sm font-medium text-[#000052]">Email</div>
                      <a href="mailto:juderouhana@gmail.com" className="text-[#000052] hover:opacity-80 transition-colors duration-300">
                        juderouhana@gmail.com
                      </a>
                    </div>
                  </div>
                </div>

                {/* Social Links */}
                <div>
                  <h4 className="text-lg font-semibold text-[#000052] mb-4">Follow Me</h4>
                  <div className="flex flex-wrap gap-4">
                    {socialLinks.map((social) => (
                      <motion.a
                        key={social.name}
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-black hover:opacity-80 transition-all duration-300 group"
                        whileHover={{ y: -2 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        <span className="text-xl text-[#000052]">{social.icon}</span>
                        <span className="text-[#000052]">
                          {social.name}
                        </span>
                      </motion.a>
                    ))}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
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

      {/* Toast Notification */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.show}
        onClose={() => setToast({ show: false, message: '', type: 'success' })}
      />
    </div>
  )
}

export default Contact

