import { motion, AnimatePresence } from 'framer-motion'
import { useEffect, useState } from 'react'

const Toast = ({ message, type = 'success', isVisible, onClose }) => {
  const [isShowing, setIsShowing] = useState(false)

  useEffect(() => {
    if (isVisible) {
      setIsShowing(true)
      const timer = setTimeout(() => {
        setIsShowing(false)
        setTimeout(() => {
          onClose()
        }, 300) // Wait for fade out animation to complete
      }, 2000) // Show for 2 seconds

      return () => clearTimeout(timer)
    }
  }, [isVisible, onClose])

  const getToastStyles = () => {
    switch (type) {
      case 'success':
        return {
          bg: 'bg-green-500',
          border: 'border-green-400',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          )
        }
      case 'error':
        return {
          bg: 'bg-red-500',
          border: 'border-red-400',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )
        }
      default:
        return {
          bg: 'bg-blue-500',
          border: 'border-blue-400',
          icon: (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          )
        }
    }
  }

  const styles = getToastStyles()

  return (
    <AnimatePresence>
      {isShowing && (
        <motion.div
          initial={{ opacity: 0, x: 100, scale: 0.8 }}
          animate={{ opacity: 1, x: 0, scale: 1 }}
          exit={{ opacity: 0, x: 100, scale: 0.8 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
          className={`fixed bottom-6 right-6 z-50 max-w-sm w-full ${styles.bg} ${styles.border} border-2 rounded-lg shadow-2xl backdrop-blur-sm`}
        >
          <div className="flex items-center gap-3 p-4 text-white">
            <div className="flex-shrink-0">
              {styles.icon}
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium">
                {message}
              </p>
            </div>
            <button
              onClick={() => {
                setIsShowing(false)
                setTimeout(() => onClose(), 300)
              }}
              className="flex-shrink-0 opacity-70 hover:opacity-100 transition-opacity duration-200"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

export default Toast
