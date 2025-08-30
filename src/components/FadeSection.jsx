import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'

const FadeSection = ({ children, className = "", delay = 0, duration = 1.2 }) => {
  const [ref, inView] = useInView({
    triggerOnce: false, // Allow re-triggering when scrolling back up
    threshold: 0.05, // Start animation when just a small part is visible
    rootMargin: '-200px 0px -200px 0px' // Start animation much earlier
  })

  const fadeVariants = {
    hidden: {
      opacity: 0,
      y: 30,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: duration,
        delay: delay,
        ease: [0.25, 0.46, 0.45, 0.94] // Smooth easing
      }
    },
    exit: {
      opacity: 0,
      y: -20,
      transition: {
        duration: duration * 0.8,
        ease: [0.25, 0.46, 0.45, 0.94]
      }
    }
  }

  return (
    <motion.div
      ref={ref}
      variants={fadeVariants}
      initial="hidden"
      animate={inView ? "visible" : "exit"}
      className={`relative z-10 ${className}`}
    >
      {children}
    </motion.div>
  )
}

export default FadeSection
