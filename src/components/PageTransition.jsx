import { motion, AnimatePresence } from 'framer-motion'
import { useLocation } from 'react-router-dom'

function PageTransition({ children }) {
  const location = useLocation()

  return (
    <>
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial="initial"
          animate="animate"
          exit="exit"
          variants={{
            initial: {
              x: '100%'
            },
            animate: {
              x: 0,
              transition: {
                duration: 0.35,
                ease: "easeInOut"
              }
            },
            exit: {
              x: '-100%',
              transition: {
                duration: 0.15,
                ease: "easeInOut"
              }
            }
          }}
          className="fixed inset-0 bg-[#000052] z-[100] pointer-events-none"
        />
      </AnimatePresence>
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3, delay: 0.35 }}
        >
          {children}
        </motion.div>
      </AnimatePresence>
    </>
  )
}

export default PageTransition

