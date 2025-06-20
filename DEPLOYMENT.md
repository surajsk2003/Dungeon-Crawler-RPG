# 🚀 Deployment Guide

## Quick Start (Local Development)

```bash
# Clone the repository
git clone https://github.com/yourusername/dungeon-crawler-rpg.git
cd dungeon-crawler-rpg

# Install dependencies
npm install

# Start development server
npm start

# Open browser to http://localhost:3000
```

## Production Deployment

### Option 1: GitHub Pages (Recommended)

```bash
# Build production version
npm run build

# Deploy to GitHub Pages
npm run deploy
```

### Option 2: Custom Server

```bash
# Build production version
npm run build

# Upload contents of 'dist' folder to web server
# Ensure MIME types are configured for audio files
```

### Option 3: Netlify

1. Connect GitHub repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `dist`
4. Deploy automatically on push

## Pre-Deployment Checklist

### Testing
- [ ] Run `npm test` and ensure all tests pass
- [ ] Test on Chrome, Firefox, Safari, and Edge
- [ ] Test on mobile devices (iOS and Android)
- [ ] Verify save/load functionality works
- [ ] Test offline capabilities (PWA)

### Optimization
- [ ] Run `npm run cleanup` to remove unused assets
- [ ] Verify total file size is under 50MB
- [ ] Check that JavaScript bundle is under 300KB
- [ ] Ensure images are optimized (PNG-8 where possible)
- [ ] Compress audio files if needed

### Configuration
- [ ] Update repository URL in package.json
- [ ] Set correct base URL for deployment
- [ ] Configure HTTPS for PWA features
- [ ] Set up error tracking (optional)

## Post-Deployment

### Monitoring
- [ ] Check browser console for errors
- [ ] Monitor loading times
- [ ] Test save file corruption reports
- [ ] Track user feedback

### Updates
- [ ] Set up continuous deployment
- [ ] Plan update strategy for existing saves
- [ ] Document version compatibility

## Troubleshooting

### Common Issues

**404 Errors on Assets**
- Check file paths are correct
- Ensure case sensitivity matches server
- Verify MIME types are configured

**Audio Not Playing**
- Check browser audio permissions
- Verify audio file formats are supported
- Test Web Audio API fallback

**Save System Not Working**
- Check Local Storage permissions
- Verify HTTPS for secure contexts
- Test import/export functionality

**Mobile Performance Issues**
- Reduce particle count on mobile
- Lower audio quality for mobile
- Test memory usage on older devices

## Server Configuration

### Apache (.htaccess)
```apache
# Enable compression
<IfModule mod_deflate.c>
    AddOutputFilterByType DEFLATE text/plain
    AddOutputFilterByType DEFLATE text/html
    AddOutputFilterByType DEFLATE text/xml
    AddOutputFilterByType DEFLATE text/css
    AddOutputFilterByType DEFLATE application/xml
    AddOutputFilterByType DEFLATE application/xhtml+xml
    AddOutputFilterByType DEFLATE application/rss+xml
    AddOutputFilterByType DEFLATE application/javascript
    AddOutputFilterByType DEFLATE application/x-javascript
</IfModule>

# Set MIME types
AddType audio/mpeg .mp3
AddType audio/wav .wav
AddType application/json .json
```

### Nginx
```nginx
# Enable compression
gzip on;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;

# Set MIME types
location ~* \.(mp3|wav)$ {
    add_header Cache-Control "public, max-age=31536000";
}
```

## Performance Optimization

### Build Optimization
- JavaScript minification reduces size by ~40%
- CSS minification reduces size by ~30%
- Asset compression can reduce total size by 60-80%

### Runtime Optimization
- Viewport culling improves FPS by 20-30%
- Particle limiting prevents memory issues
- Asset caching reduces loading times

### Mobile Optimization
- Touch controls increase mobile usability
- Responsive design works on all screen sizes
- Battery optimization extends gameplay time

## Security Considerations

### Client-Side Security
- Input validation prevents XSS attacks
- Save data validation prevents corruption
- HTTPS ensures secure asset loading

### Privacy
- No server-side data collection
- Local storage only
- Offline capable

## Success Metrics

### Performance Targets
- Initial load time: < 5 seconds
- Frame rate: 60 FPS sustained
- Memory usage: < 100MB
- Asset size: < 50MB total

### Compatibility Targets
- 95%+ browser compatibility
- Mobile device support
- Offline functionality
- Save system reliability

---

Your Dungeon Crawler RPG is ready for production deployment! 🎮🚀