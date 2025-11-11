# Asset Upload Guide

Your portfolio has large media files (660MB total) that exceed Vercel's deployment limits. This guide explains how to host them externally.

## Option 1: Cloudinary (Recommended for Videos/Images)

### Setup:
1. Sign up for free account at https://cloudinary.com
2. Get your Cloud Name from the dashboard
3. Upload your videos/images to Cloudinary
4. Set environment variable in Vercel:
   - `VITE_CLOUDINARY_CLOUD_NAME` = your cloud name

### Upload Videos:
Upload these videos to Cloudinary and update the URLs in `src/config/assets.js`:

- `animations/JRouhana_Final_Project.mp4` (93MB)
- `coding projects/Thesis/Product images and video/Demo.mp4`
- `coding projects/Thesis/Product images and video/VBT Demo.mp4`
- `coding projects/Othello/othello_demo.mp4` (46MB)
- `coding projects/Astro Invader/astroinvader.mov`
- `coding projects/Pixel Art Smoother/pixelartsmoother.mov`
- `coding projects/Particle Visualization.mov`

### Get Cloudinary URLs:
After uploading, copy the "Secure URL" from Cloudinary and update `videoAssets` in `src/config/assets.js`.

## Option 2: GitHub Releases (Free, Simple)

### Setup:
1. Create a new GitHub release in your repo
2. Attach all large media files as release assets
3. Use GitHub's CDN URLs:
   ```
   https://github.com/jude-rouhana/portfolio/releases/download/v1.0.0/filename.mp4
   ```

### Update assets.js:
Replace external URLs with GitHub release URLs.

## Option 3: AWS S3 + CloudFront (Most Reliable)

### Setup:
1. Create S3 bucket
2. Upload files with public read access
3. Optionally set up CloudFront CDN
4. Use S3/CloudFront URLs in `assets.js`

## Option 4: Vercel Blob Storage

### Setup:
1. Install: `npm install @vercel/blob`
2. Upload files programmatically
3. Store blob URLs in environment variables
4. Update `assets.js` to use blob URLs

## For Audio Files (35-68MB each):

Audio files are very large. Consider:
1. **Compress audio** to MP3 (much smaller than WAV)
2. **Use GitHub Releases** for hosting
3. **Use a free CDN** like jsDelivr with GitHub releases

### Compress Audio:
```bash
# Install ffmpeg, then:
ffmpeg -i "music/Bossa Nova.wav" -b:a 192k "music/Bossa Nova.mp3"
```

Then update file extensions in your code from `.wav` to `.mp3`.

## Quick Start (Recommended):

1. **Compress audio files** to MP3 (reduces 35-68MB files to ~3-5MB)
2. **Upload videos to Cloudinary** (free tier: 25GB storage)
3. **Keep compressed audio in repo** (now small enough)
4. **Update `assets.js`** with Cloudinary URLs

This approach:
- ✅ Keeps deployment under Vercel limits
- ✅ Uses free services
- ✅ Maintains fast load times
- ✅ Works in both dev and production

