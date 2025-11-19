import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    // Use both methods to ensure compatibility across all devices, including mobile
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant'
    })
    // Fallback for older browsers
    window.scrollTo(0, 0)
    // Also scroll document element for mobile Safari
    if (document.documentElement) {
      document.documentElement.scrollTop = 0
    }
    if (document.body) {
      document.body.scrollTop = 0
    }
  }, [pathname])

  return null
}

export default ScrollToTop
