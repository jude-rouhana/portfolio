import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { useState, useRef } from 'react'

const Music = () => {
  const [ref, inView] = useInView({
    triggerOnce: true,
    threshold: 0.1
  })

  const [currentTrack, setCurrentTrack] = useState(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const audioRef = useRef(null)

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

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, '0')}`
  }

  const handlePlayPause = (track) => {
    if (currentTrack && currentTrack.id === track.id) {
      if (isPlaying) {
        audioRef.current.pause()
        setIsPlaying(false)
      } else {
        audioRef.current.play()
        setIsPlaying(true)
      }
    } else {
      setCurrentTrack(track)
      setIsPlaying(true)
      if (audioRef.current) {
        audioRef.current.src = track.audioFile
        audioRef.current.play()
      }
    }
  }

  const handleTimeUpdate = () => {
    if (audioRef.current) {
      setCurrentTime(audioRef.current.currentTime)
      setDuration(audioRef.current.duration)
    }
  }

  const handleSeek = (e) => {
    const rect = e.currentTarget.getBoundingClientRect()
    const percent = (e.clientX - rect.left) / rect.width
    const newTime = percent * duration
    audioRef.current.currentTime = newTime
    setCurrentTime(newTime)
  }

  const handleEnded = () => {
    setIsPlaying(false)
    setCurrentTime(0)
  }

  // Music tracks with actual audio files
  const tracks = [
    {
      id: 1,
      title: "How My Heart Beats",
      artist: "Jude Rouhana",
      duration: "2:14",
      genre: "Bossa Nova",
      audioFile: "assets/music/Bossa Nova.wav",
      description: "A smooth bossa nova piece featuring warm saxophone, marimba, and piano melodies and gentle rhythms. Written, recorded, mixed, and produced by Jude Rouhana.",
      featured: false
    },
    {
      id: 2,
      title: "Misty",
      artist: "Original by Erroll Garner",
      duration: "2:22",
      genre: "Jazz Ballad",
      audioFile: "assets/music/Ballad.wav",
      description: "A classic jazz ballad interpretation with soulful saxophone and piano phrasing and rich harmonic textures. Written by Erroll Garner. Recorded, mixed, and produced by Jude Rouhana.",
      featured: false
    },
    {
      id: 3,
      title: "Consolation No. 3",
      artist: "Original by Franz Liszt",
      duration: "4:09",
      genre: "Classical",
      audioFile: "assets/music/Classical.wav",
      description: "A classical piece that combines traditional classical harmony with elements inspired from jazz. Written by Franz Liszt. Recorded, mixed, and produced by Jude Rouhana.",
      featured: false
    },
    {
      id: 4,
      title: "Jazz, In The House",
      artist: "Jude Rouhana",
      duration: "2:08",
      genre: "House Jazz",
      audioFile: "assets/music/House.wav",
      description: "A house jazz piece that combines traditional house beats with a jazz-inspired melody. Written by Jude Rouhana. Recorded, mixed, and produced by Jude Rouhana.",
      featured: true
    },
    {
      id: 5,
      title: "Begin Again",
      artist: "Jude Rouhana",
      duration: "3:16",
      genre: "R&B/Ballad",
      audioFile: "assets/music/R&B.wav",
      description: "A R&B/Ballad that explores the use of ambient sounds and textures to create a more immersive and emotional experience. Written by Jude Rouhana. Recorded, mixed, and produced by Jude Rouhana.",
      featured: true
    },
  ]

  const featuredTracks = tracks.filter(track => track.featured)
  const otherTracks = tracks.filter(track => !track.featured)

  return (
    <section
      id="music"
      data-section="music"
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
              Music
            </h2>
            <div className="w-24 h-1 bg-accent-gold mx-auto rounded-full mb-8"></div>
            {/* <p className="text-xl text-contrast-gray max-w-3xl mx-auto mb-8">
            "Music is your own experience, your own thoughts, your wisdom. If you don't live it, it won't come out of your horn. They teach you there's a boundary line to music. But, man, there's no boundary line to art" – Charlie Parker
            </p> */}
            
            {/* Saxophone Photo */}
            {/* <div className="flex justify-center">
              <div className="relative">
                <div className="w-64 h-64 rounded-full bg-accent-light p-1">
                  <div className="w-full h-full rounded-full bg-primary overflow-hidden">
                    <img 
                      src="assets/music/SaxophoneSolo.jpg" 
                      alt="Saxophone Solo Performance" 
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div> */}
                {/* Decorative music notes */}
                {/* <div className="absolute top-1/2 left-1/2 text-2xl text-accent-gold opacity-60 orbit-animation">♪</div>
                <div className="absolute top-1/2 left-1/2 text-xl text-accent-gold opacity-60 orbit-animation-reverse">♫</div>
                <div className="absolute top-1/2 left-1/2 text-2xl text-accent-gold opacity-60 orbit-animation-2">♩</div>
                <div className="absolute top-1/2 left-1/2 text-xl text-accent-gold opacity-60 orbit-animation-3">♬</div>
                <div className="absolute top-1/2 left-1/2 text-2xl text-accent-gold opacity-60 orbit-animation-4">♭</div>

                <div className="absolute top-1/2 left-1/2 text-2xl text-accent-gold opacity-60 orbit-animation">♪</div>
                <div className="absolute top-1/2 left-1/2 text-2xl text-accent-gold opacity-60 orbit-animation-2">♩</div>
              </div>
            </div> */}
          </motion.div>

          {/* Hidden audio element */}
          <audio
            ref={audioRef}
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleEnded}
            onLoadedMetadata={() => setDuration(audioRef.current.duration)}
          />

          {/* Featured Music Player */}
          <motion.div variants={itemVariants} className="mb-16">
            <h3 className="text-2xl font-bold text-contrast mb-8 font-display">Featured Tracks</h3>
            <div className="grid lg:grid-cols-2 gap-8">
              {featuredTracks.map((track, index) => {
                const isCurrentTrack = currentTrack && currentTrack.id === track.id
                const isTrackPlaying = isCurrentTrack && isPlaying
                
                return (
                  <motion.div
                    key={track.id}
                    className="bg-primary-dark rounded-xl p-6 border border-border-color hover:border-accent-gold/50 transition-all duration-300 hover:shadow-xl"
                    whileHover={{ y: -5 }}
                    initial={{ opacity: 0, y: 30 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: index * 0.2 }}
                  >
                    {/* Track Info */}
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h4 className="text-xl font-bold text-contrast mb-2 font-display">
                          {track.title}
                        </h4>
                        <p className="text-contrast-gray mb-2">{track.artist}</p>
                        <div className="flex items-center gap-4 text-sm text-contrast-gray mb-3">
                          <span>{track.duration}</span>
                          <span>•</span>
                          <span>{track.genre}</span>
                        </div>
                        <p className="text-contrast-gray text-sm leading-relaxed">
                          {track.description}
                        </p>
                      </div>
                      {/* <div className="text-4xl">🎵</div> */}
                    </div>

                    {/* Audio Player */}
                    <div className="bg-accent-light/10 rounded-lg p-4 mb-4">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <button 
                            onClick={() => handlePlayPause(track)}
                            className="w-10 h-10 bg-accent-gold rounded-full flex items-center justify-center hover:bg-accent-gold/80 transition-colors"
                          >
                            <span className="text-white text-lg">
                              {isTrackPlaying ? (
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                  <rect x="6" y="4" width="4" height="16" />
                                  <rect x="14" y="4" width="4" height="16" />
                                </svg>
                              ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M8 5v14l11-7z" />
                                </svg>
                              )}
                            </span>
                          </button>
                          <div>
                            <div className="text-sm font-medium text-contrast">
                              {isCurrentTrack ? (isTrackPlaying ? 'Now Playing' : 'Paused') : ''}
                            </div>
                            <div className="text-xs text-contrast-gray">{track.title}</div>
                          </div>
                        </div>
                        <div className="text-xs text-contrast-gray">
                          {isCurrentTrack ? formatTime(currentTime) : track.duration}
                        </div>
                      </div>
                      
                      {/* Progress Bar */}
                      <div 
                        className="w-full bg-gray-200 rounded-full h-2 mb-2 cursor-pointer"
                        onClick={handleSeek}
                      >
                        <motion.div
                          className="h-2 bg-accent-gold rounded-full"
                          initial={{ width: "0%" }}
                          animate={inView ? { 
                            width: isCurrentTrack ? `${(currentTime / duration) * 100}%` : "0%" 
                          } : {}}
                          transition={{ duration: 0.1 }}
                        />
                      </div>
                      
                      {/* Time Display */}
                      {isCurrentTrack && (
                        <div className="flex justify-between text-xs text-contrast-gray">
                          <span>{formatTime(currentTime)}</span>
                          <span>{formatTime(duration)}</span>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>

          {/* Other Tracks */}
          <motion.div variants={itemVariants}>
            {/* <h3 className="text-2xl font-bold text-contrast mb-8 font-display">More Music</h3> */}
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {otherTracks.map((track, index) => {
                const isCurrentTrack = currentTrack && currentTrack.id === track.id
                const isTrackPlaying = isCurrentTrack && isPlaying
                
                return (
                  <motion.div
                    key={track.id}
                    className="bg-primary-dark rounded-lg p-4 border border-border-color hover:border-accent-gold/50 transition-all duration-300 hover:shadow-lg"
                    whileHover={{ y: -3 }}
                    initial={{ opacity: 0, y: 20 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: index * 0.1 + 0.5 }}
                  >
                    {/* Track Info */}
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="text-lg font-bold text-contrast mb-1 font-display">
                          {track.title}
                        </h4>
                        <p className="text-contrast-gray text-sm mb-2">{track.artist}</p>
                        <div className="flex items-center gap-2 text-xs text-contrast-gray mb-2">
                          <span>{track.duration}</span>
                          <span>•</span>
                          <span>{track.genre}</span>
                        </div>
                        <p className="text-contrast-gray text-xs leading-relaxed">
                          {track.description}
                        </p>
                      </div>
                    </div>

                    {/* Mini Player */}
                    <div className="bg-accent-light/5 rounded p-3 mb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <button 
                            onClick={() => handlePlayPause(track)}
                            className="w-6 h-6 bg-accent-gold rounded-full flex items-center justify-center hover:bg-accent-gold/80 transition-colors"
                          >
                            <span className="text-white text-lg">
                              {isTrackPlaying ? (
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                  <rect x="6" y="4" width="4" height="16" />
                                  <rect x="14" y="4" width="4" height="16" />
                                </svg>
                              ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                                  <path d="M8 5v14l11-7z" />
                                </svg>
                              )}
                            </span>
                          </button>
                          <span className="text-xs text-contrast-gray">
                            {isCurrentTrack ? (isTrackPlaying ? 'Playing' : 'Paused') : 'Play'}
                          </span>
                        </div>
                        <span className="text-xs text-contrast-gray">{track.duration}</span>
                      </div>
                    </div>
                  </motion.div>
                )
              })}
            </div>
          </motion.div>

          {/* Call to Action */}
          {/* <motion.div
            variants={itemVariants}
            className="text-center mt-16"
          >
            <motion.button
              className="px-8 py-4 bg-accent-gold text-white font-semibold rounded-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Listen to Full Discography
            </motion.button>
          </motion.div> */}
        </motion.div>
      </div>
    </section>
  )
}

export default Music 