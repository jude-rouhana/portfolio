// Asset configuration for development vs production
// In production, large assets are hosted externally to avoid Vercel size limits

const isProduction = import.meta.env.PROD;

// Base URLs for external asset hosting
// Set these in Vercel environment variables:
// - VITE_CLOUDINARY_CLOUD_NAME (for videos/images)
// - VITE_AUDIO_CDN_URL (for audio files)
const CLOUDINARY_CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'djsfb1hrn';
const CLOUDINARY_BASE = `https://res.cloudinary.com/${CLOUDINARY_CLOUD_NAME}/video/upload`;
const AUDIO_CDN_BASE = import.meta.env.VITE_AUDIO_CDN_URL || null;

// Helper function to get asset URL
export const getAssetUrl = (localPath, externalPath = null) => {
  // In development, always use local files
  if (!isProduction) {
    return localPath;
  }

  // In production, use external URL if available, otherwise fall back to local
  if (externalPath) {
    return externalPath;
  }

  // If no external path provided, use local (for small assets)
  return localPath;
};

// Video assets configuration
export const videoAssets = {
  // Animations
  jazzCats: {
    local: "/assets/animations/JRouhana_Final_Project.mp4",
    external: "https://res.cloudinary.com/djsfb1hrn/video/upload/v1762887329/JRouhana_Final_Project_qmnk3l.mp4",
  },
  
  // Thesis/VBT videos
  vbtDemo: {
    local: "/assets/coding%20projects/Thesis/Product%20images%20and%20video/Demo.mp4",
    external: "https://res.cloudinary.com/djsfb1hrn/video/upload/v1762887365/Demo_ucax2k.mp4",
  },
  vbtLiveDemo: {
    local: "/assets/coding%20projects/Thesis/Product%20images%20and%20video/VBT%20Demo.mp4",
    external: "https://res.cloudinary.com/djsfb1hrn/video/upload/v1762887367/VBT_Demo_lh2kgy.mp4",
  },
  
  // Othello
  othelloDemo: {
    local: "/assets/coding%20projects/Othello/othello_demo.mp4",
    external: "https://res.cloudinary.com/djsfb1hrn/video/upload/v1762887400/othello_demo_unrklr.mov",
  },
  
  // Astro Invader
  astroInvader: {
    local: "/assets/coding%20projects/Astro%20Invader/astroinvader.mov",
    external: "https://res.cloudinary.com/djsfb1hrn/video/upload/v1762887407/astroinvader_god3nc.mov",
  },
  
  // Pixel Art Smoother
  pixelArtSmoother: {
    local: "/assets/coding%20projects/Pixel%20Art%20Smoother/pixelartsmoother.mov",
    external: "https://res.cloudinary.com/djsfb1hrn/video/upload/v1762887417/pixelartsmoother_jjdsbw.mov",
  },
  
  // Particle Visualization
  particleVisualization: {
    local: "/assets/coding%20projects/Particle%20Visualization.mov",
    external: null, // Add Cloudinary URL when available
  },
};

// Audio assets configuration
export const audioAssets = {
  bossaNova: {
    local: "/assets/music/Bossa%20Nova.mp3",
    external: AUDIO_CDN_BASE ? `${AUDIO_CDN_BASE}/music/Bossa%20Nova.mp3` : null,
  },
  ballad: {
    local: "/assets/music/Ballad.mp3",
    external: AUDIO_CDN_BASE ? `${AUDIO_CDN_BASE}/music/Ballad.mp3` : null,
  },
  classical: {
    local: "/assets/music/Classical.mp3",
    external: AUDIO_CDN_BASE ? `${AUDIO_CDN_BASE}/music/Classical.mp3` : null,
  },
  house: {
    local: "/assets/music/House.mp3",
    external: AUDIO_CDN_BASE ? `${AUDIO_CDN_BASE}/music/House.mp3` : null,
  },
  rnb: {
    local: "/assets/music/R%26B.mp3",
    external: AUDIO_CDN_BASE ? `${AUDIO_CDN_BASE}/music/R%26B.mp3` : null,
  },
};

// Image assets (keep in repo if < 1MB, otherwise use external)
export const imageAssets = {
  // These can stay local as they're smaller
  othello: "/assets/coding%20projects/Othello/othello.png",
  astroInvader: "/assets/coding%20projects/Astro%20Invader/astroinvader.png",
  focusAid: "/assets/coding%20projects/FocusAid/focusaid.png",
  vbtLogo: "/assets/coding%20projects/Thesis/Product%20images%20and%20video/VBT_logo_gray.png",
  chordClassifier: "/assets/coding%20projects/Chord%20Classifier%3AGenerator/Image.png",
  
  // FocusAid gallery
  focusAidGallery: [
    "/assets/coding%20projects/FocusAid/FocusAid1.png",
    "/assets/coding%20projects/FocusAid/FocusAid2.png",
    "/assets/coding%20projects/FocusAid/FocusAid3.png",
    "/assets/coding%20projects/FocusAid/FocusAid4.png",
    "/assets/coding%20projects/FocusAid/FocusAid5.png",
    "/assets/coding%20projects/FocusAid/FocusAid6.png",
    "/assets/coding%20projects/FocusAid/FocusAid7.png",
  ],
};

// Helper to get video URL
export const getVideoUrl = (key) => {
  const asset = videoAssets[key];
  if (!asset) return null;
  return getAssetUrl(asset.local, asset.external);
};

// Helper to get audio URL
export const getAudioUrl = (key) => {
  const asset = audioAssets[key];
  if (!asset) return null;
  return getAssetUrl(asset.local, asset.external);
};

