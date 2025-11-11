# Deployment Guide for Large Assets

Your portfolio has **660MB of media files** that exceed Vercel's deployment limits. This guide provides step-by-step instructions to deploy successfully.

## Quick Solution (Recommended)

### Step 1: Compress Audio Files (Reduces 233MB → ~15MB)

Your audio files are 35-68MB each in WAV format. Compress them to MP3:

```bash
# Install ffmpeg if needed: brew install ffmpeg (Mac) or apt-get install ffmpeg (Linux)

# Compress all audio files
cd public/music
ffmpeg -i "Bossa Nova.wav" -b:a 192k "Bossa Nova.mp3"
ffmpeg -i "Ballad.wav" -b:a 192k "Ballad.mp3"
ffmpeg -i "Classical.wav" -b:a 192k "Classical.mp3"
ffmpeg -i "House.wav" -b:a 192k "House.mp3"
ffmpeg -i "R&B.wav" -b:a 192k "R&B.mp3"
```

Then update `src/config/assets.js` to use `.mp3` instead of `.wav`.

### Step 2: Upload Videos to Cloudinary (Free)

1. **Sign up**: https://cloudinary.com (free tier: 25GB storage, 25GB bandwidth/month)

2. **Upload videos**:
   - Go to Media Library → Upload
   - Upload these videos:
     - `animations/JRouhana_Final_Project.mp4` (93MB)
     - `coding projects/Thesis/Product images and video/Demo.mp4`
     - `coding projects/Thesis/Product images and video/VBT Demo.mp4`
     - `coding projects/Othello/othello_demo.mp4` (46MB)
     - `coding projects/Astro Invader/astroinvader.mov`
     - `coding projects/Pixel Art Smoother/pixelartsmoother.mov`
     - `coding projects/Particle Visualization.mov`

3. **Get URLs**:
   - For each video, click it → Copy "Secure URL"
   - Format: `https://res.cloudinary.com/YOUR_CLOUD_NAME/video/upload/v1234567890/filename.mp4`

4. **Update configuration**:
   - Open `src/config/assets.js`
   - Replace the `external` URLs in `videoAssets` with your Cloudinary URLs
   - Set environment variable in Vercel: `VITE_CLOUDINARY_CLOUD_NAME` = your cloud name

### Step 3: Remove Large Files from Git

After uploading to Cloudinary, remove large files from Git LFS:

```bash
# Remove large videos from Git (they're now on Cloudinary)
git rm --cached "public/coding projects/Thesis/Product images and video/Demo.mp4"
git rm --cached "public/coding projects/Thesis/Product images and video/VBT Demo.mp4"
git rm --cached "public/coding projects/Othello/othello_demo.mp4"
git rm --cached "public/animations/JRouhana_Final_Project.mp4"
# ... etc

# Keep only compressed audio and small images
git add .
git commit -m "Remove large videos, use Cloudinary instead"
git push
```

### Step 4: Deploy to Vercel

1. **Set environment variables** in Vercel dashboard:
   - `VITE_CLOUDINARY_CLOUD_NAME` = your Cloudinary cloud name

2. **Deploy**: Push to GitHub, Vercel will auto-deploy

3. **Verify**: Check that videos load from Cloudinary URLs

## Alternative Solutions

### Option A: GitHub Releases (Free, No Account Needed)

1. Create a GitHub release
2. Attach large files as release assets
3. Use URLs like: `https://github.com/jude-rouhana/portfolio/releases/download/v1.0.0/filename.mp4`
4. Update `src/config/assets.js` with these URLs

### Option B: AWS S3 + CloudFront

1. Create S3 bucket
2. Upload files with public read access
3. Optionally set up CloudFront CDN
4. Use S3/CloudFront URLs in `assets.js`

### Option C: Keep Everything Local (Not Recommended)

If you must keep files local:
- Compress all videos (use HandBrake or ffmpeg)
- Compress all audio to MP3
- Optimize images (use TinyPNG or similar)
- This may still hit Vercel limits

## File Size Summary

| Type | Current Size | After Compression | Solution |
|------|-------------|-------------------|----------|
| Videos | ~333MB | ~100MB (if compressed) | Cloudinary |
| Audio | 233MB | ~15MB (MP3) | Keep in repo |
| Images | ~94MB | ~10MB (optimized) | Keep in repo |
| **Total** | **660MB** | **~125MB** | ✅ Deployable |

## Testing

After deployment:
1. Check browser console for 404 errors
2. Verify videos play correctly
3. Test audio playback
4. Check network tab for asset loading

## Troubleshooting

**Videos not loading?**
- Check Cloudinary URLs in `assets.js`
- Verify `VITE_CLOUDINARY_CLOUD_NAME` is set in Vercel
- Check Cloudinary dashboard for upload status

**Audio not loading?**
- Verify file paths after compression
- Check file extensions (.mp3 vs .wav)
- Update `assets.js` if you changed file names

**Build fails?**
- Check Vercel build logs
- Ensure all imports are correct
- Verify environment variables are set

