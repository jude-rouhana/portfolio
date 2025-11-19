import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { useState } from 'react'

const About = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  })
  const [expandedSections, setExpandedSections] = useState({
    programming: false,
    design: false,
    other: false
  })

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

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }))
  }

  const skills = [
    // Programming Languages
    { name: 'Python', type: 'programming', color: 'bg-blue-500' },
    { name: 'C++', type: 'programming', color: 'bg-blue-500' },
    { name: 'HTML', type: 'programming', color: 'bg-blue-500' },
    { name: 'CSS', type: 'programming', color: 'bg-blue-500' },
    { name: 'React', type: 'programming', color: 'bg-blue-500' },
    { name: 'JavaScript', type: 'programming', color: 'bg-blue-500' },
    { name: 'TypeScript', type: 'programming', color: 'bg-blue-500' },
    { name: 'Node.js', type: 'programming', color: 'bg-blue-500' },
    { name: 'Next.js', type: 'programming', color: 'bg-blue-500' },
    { name: 'FastAPI', type: 'programming', color: 'bg-blue-500' },
    { name: 'Arduino', type: 'programming', color: 'bg-blue-500' },
    { name: 'Go', type: 'programming', color: 'bg-blue-500' },
    { name: 'Bash', type: 'programming', color: 'bg-blue-500' },
    { name: 'Scheme', type: 'programming', color: 'bg-blue-500' },
    { name: 'OCaml', type: 'programming', color: 'bg-blue-500' },
    { name: 'SmallTalk', type: 'programming', color: 'bg-blue-500' },
    { name: 'Prolog', type: 'programming', color: 'bg-blue-500' },
    { name: 'Assembly', type: 'programming', color: 'bg-blue-500' },
    
    // Design Skills
    { name: 'Framer', type: 'design', color: 'bg-red-500' },
    { name: 'Figma', type: 'design', color: 'bg-red-500' },
    { name: 'ProTools', type: 'design', color: 'bg-red-500' },
    { name: 'Logic Pro', type: 'design', color: 'bg-red-500' },
    { name: 'Max/MSP', type: 'design', color: 'bg-red-500' },
    { name: 'Adobe Photoshop', type: 'design', color: 'bg-red-500' },
    { name: 'Adobe Premiere Pro', type: 'design', color: 'bg-red-500' },
    { name: 'Adobe After Effects', type: 'design', color: 'bg-red-500' },
    { name: 'Adobe Lightroom', type: 'design', color: 'bg-red-500' },
    { name: 'Procreate', type: 'design', color: 'bg-red-500' },
    { name: 'Blender', type: 'design', color: 'bg-red-500' },
    { name: 'Godot', type: 'design', color: 'bg-red-500' },
    
    // Other Skills
    { name: 'PostgreSQL', type: 'other', color: 'bg-yellow-500' }, 
    { name: 'Git', type: 'other', color: 'bg-yellow-500' },
    { name: 'Microsoft Suite', type: 'other', color: 'bg-yellow-500' },
    { name: 'Power Automate', type: 'other', color: 'bg-yellow-500' },
  ]

  // Group skills by type
  const groupedSkills = {
    programming: skills.filter(skill => skill.type === 'programming'),
    design: skills.filter(skill => skill.type === 'design'),
    other: skills.filter(skill => skill.type === 'other')
  }

  const sectionConfig = {
    programming: { title: 'Programming Languages, Frameworks, and Libraries', color: 'bg-blue-500' },
    design: { title: 'Design and Creative', color: 'bg-red-500' },
    other: { title: 'Other Tools', color: 'bg-yellow-500' }
  }

  return (
    <section
      id="about"
      data-section="about"
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
          <motion.div variants={itemVariants} className="text-center mb-8 sm:mb-16">
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-contrast mb-2 sm:mb-4 font-display">
              About Me
            </h2>
            <div className="w-16 sm:w-24 h-1 bg-accent-gold mx-auto rounded-none"></div>
          </motion.div>

          <div className="grid lg:grid-cols-2 gap-6 sm:gap-12 items-center">
            {/* Photo and Personal Info */}
            <motion.div variants={itemVariants} className="space-y-4 sm:space-y-8">
                              {/* Profile Photo */}
                <div className="relative">
                  <div className="w-48 h-48 sm:w-80 sm:h-80 mx-auto rounded-none bg-accent-light/20 p-1">
                    <div className="w-full h-full rounded-none bg-transparent overflow-hidden">
                      <img 
                        src="/headshot.jpg" 
                        alt="Jude Rouhana" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  </div>
                  {/* Decorative elements */}
                  <div className="absolute top-1/2 left-1/2 w-6 h-6 sm:w-8 sm:h-8 bg-[#8B0000] rounded-none opacity-60 orbit-animation"></div>
                  <div className="absolute top-1/2 left-1/2 w-4 h-4 sm:w-6 sm:h-6 bg-[#006400] rounded-none opacity-60 orbit-animation-reverse"></div>
                  <div className="absolute top-1/2 left-1/2 w-5 h-5 sm:w-7 sm:h-7 bg-[#B8860B] rounded-none opacity-60 orbit-animation-2"></div>
                  <div className="absolute top-1/2 left-1/2 w-4 h-4 sm:w-5 sm:h-5 bg-[#000080] rounded-none opacity-60 orbit-animation-3"></div>
                  <div className="absolute top-1/2 left-1/2 w-6 h-6 sm:w-9 sm:h-9 bg-[#10B0FF] rounded-none opacity-60 orbit-animation-4"></div>
                </div>

              {/* Quick Facts
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-primary-dark rounded-none border border-border-color">
                  <div className="text-2xl font-bold text-accent-blue">3+</div>
                  <div className="text-sm text-contrast-gray">Years Experience</div>
                </div>
                <div className="text-center p-4 bg-primary-dark rounded-none border border-border-color">
                  <div className="text-2xl font-bold text-accent-sky-blue">50+</div>
                  <div className="text-sm text-contrast-gray">Projects Completed</div>
                </div>
              </div> */}
            </motion.div>

            {/* Bio and Skills */}
            <motion.div variants={itemVariants} className="space-y-4 sm:space-y-8">
              {/* Bio */}
              <div className="bg-primary/40 backdrop-blur-md rounded-none p-2 sm:p-4 shadow-xl border border-border-color/50">
                <h4 className="text-lg sm:text-xl font-semibold text-contrast mb-2 sm:mb-4 font-display">
                  Hello!
                </h4>
                <p className="text-contrast-gray dark:text-navy-800 leading-relaxed mb-4 text-sm sm:text-base">
                I'm a software developer and creative technologist with a unique blend of technical skills and artistic vision. 
                I graduated from Hamilton College in 2025 as a Computer Science major and Digital Arts and Music minors.
                I love to build: from software and hardware to music, digital art, and games. Explore some of my work below!
                </p>
              </div>

              {/* Resume Button
              <motion.div variants={itemVariants} className="text-center">
                <motion.a
                  href="/Resume.pdf"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-accent-blue text-white font-semibold rounded-none hover:bg-accent-blue/80 hover:shadow-lg transform hover:-translate-y-1 transition-all duration-300"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  View Resume
                </motion.a>
              </motion.div> */}

              {/* Skills */}
              <div>
                <h4 className="text-lg sm:text-xl font-semibold text-contrast mb-4 sm:mb-6 font-display">
                  Technical Skills
                </h4>
                <div className="space-y-3 sm:space-y-4">
                  {Object.entries(groupedSkills).map(([type, skillsList]) => {
                    const config = sectionConfig[type]
                    return (
                      <motion.div
                        key={type}
                        initial={{ opacity: 0, y: 20 }}
                        animate={inView ? { opacity: 1, y: 0 } : {}}
                        transition={{ delay: 0.2 }}
                        className="border border-border-color rounded-none overflow-hidden"
                      >
                        {/* Section Header */}
                        <button
                          onClick={() => toggleSection(type)}
                          className="w-full flex items-center justify-between p-4 bg-primary-dark hover:bg-primary-dark/90 transition-colors duration-200"
                        >
                          <div className="flex items-center space-x-3">
                            <div className={`w-3 h-3 rounded-none ${config.color} flex-shrink-0`}></div>
                            <span className="text-contrast font-semibold">{config.title}</span>
                            <span className="text-contrast-gray text-sm">({skillsList.length})</span>
                          </div>
                          <motion.div
                            animate={{ rotate: expandedSections[type] ? 180 : 0 }}
                            transition={{ duration: 0.2 }}
                            className="text-contrast-gray"
                          >
                            ▼
                          </motion.div>
                        </button>

                        {/* Skills List */}
                        <motion.div
                          initial={false}
                          animate={{
                            height: expandedSections[type] ? 'auto' : 0,
                            opacity: expandedSections[type] ? 1 : 0
                          }}
                          transition={{ duration: 0.3, ease: "easeInOut" }}
                          className="overflow-hidden"
                        >
                          <div className="p-4 bg-primary/70">
                            <div className="grid grid-cols-2 gap-3">
                              {skillsList.map((skill, index) => (
                                <motion.div
                                  key={skill.name}
                                  initial={{ opacity: 0, x: -10 }}
                                  animate={inView && expandedSections[type] ? { opacity: 1, x: 0 } : {}}
                                  transition={{ delay: index * 0.05 }}
                                  className="flex items-center space-x-3 p-2 rounded-none hover:bg-primary-dark/70 transition-colors duration-200"
                                >
                                  <div className={`w-3 h-3 rounded-none ${skill.color} flex-shrink-0`}></div>
                                  <span className="text-contrast font-medium text-sm">{skill.name}</span>
                                </motion.div>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      </motion.div>
                    )
                  })}
                </div>
              </div>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}

export default About 