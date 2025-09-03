import { motion, AnimatePresence } from 'framer-motion'

const ThemeToggle = ({ theme, toggleTheme, activeSection }) => {
  // Only show the toggle when not on the hero section
  if (activeSection === 'home') {
    return null
  }

  return (
    <AnimatePresence>
      <motion.button
        className="fixed top-20 right-4 z-30 p-3 rounded-full bg-primary/80 backdrop-blur-md shadow-lg border border-border-color hover:shadow-xl transition-all duration-300"
        onClick={toggleTheme}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        initial={{ opacity: 0, x: 50 }}
        animate={{ opacity: 1, x: 0 }}
        exit={{ opacity: 0, x: 50 }}
        transition={{ delay: 0.8, duration: 0.6, type: "spring", stiffness: 400, damping: 10 }}
      >
        <motion.div
          className="w-6 h-6"
          animate={{ rotate: theme === 'dark' ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          {theme === 'light' ? (
            // Moon icon for dark mode
            <svg
              className="w-6 h-6 text-contrast"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"
              />
            </svg>
          ) : (
            // Sun icon for light mode
            <svg
              className="w-6 h-6 text-contrast"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"
              />
            </svg>
          )}
        </motion.div>
      </motion.button>
    </AnimatePresence>
  )
}

export default ThemeToggle 