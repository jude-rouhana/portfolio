import { useEffect } from 'react'

const BackgroundTransition = () => {
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY
      const windowHeight = window.innerHeight
      
      // Get sections for transition calculation
      const aboutSection = document.getElementById('about')
      if (!aboutSection) return
      
      const aboutOffset = aboutSection.offsetTop
      const aboutHeight = aboutSection.offsetHeight
      
      // Start transition immediately when scrolling begins
      const transitionStart = 0 // Start from the very beginning
      const transitionEnd = aboutOffset + aboutHeight * 0.5
      
      // Calculate opacity based on scroll position
      let opacity = 0
      
      if (scrollY >= transitionStart && scrollY <= transitionEnd) {
        opacity = (scrollY - transitionStart) / (transitionEnd - transitionStart)
        opacity = Math.max(0, Math.min(1, opacity)) // Clamp between 0 and 1
      } else if (scrollY > transitionEnd) {
        opacity = 1
      }
      
      // Apply the opacity to the pixelated background
      document.documentElement.style.setProperty('--pixelated-opacity', opacity)
    }

    // Initialize opacity to 0
    document.documentElement.style.setProperty('--pixelated-opacity', '0')
    
    // Add scroll event listener
    window.addEventListener('scroll', handleScroll, { passive: true })
    
    // Initial call to set correct state
    handleScroll()
    
    // Cleanup
    return () => {
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return null // This component doesn't render anything
}

export default BackgroundTransition
