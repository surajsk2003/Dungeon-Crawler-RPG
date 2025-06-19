// Background music system
const music = {
    tracks: {},
    currentTrack: null,
    muted: false,
    volume: 0.3,
    
    // Initialize music system
    init: function() {
        this.loadTracks();
    },
    
    // Load all music tracks
    loadTracks: function() {
        const tracksToLoad = [
            { 
                name: 'dungeon', 
                src: 'asset/dark-fantasy-ambient-dungeon-synth-248213.mp3'
            },
            {
                name: 'ambient',
                src: 'asset/DungonCrawlGameSounds/Ambience(Loop)/01 DSGNDron, Dungeon, Ambience, Drone, Dark, Loop.wav'
            }
        ];
        
        tracksToLoad.forEach(track => {
            try {
                const audio = new Audio(track.src);
                audio.loop = true;
                audio.volume = this.volume;
                
                // Add error handling for missing audio files
                audio.onerror = () => {
                    console.warn(`Failed to load music track: ${track.name}`);
                };
                
                this.tracks[track.name] = audio;
            } catch (e) {
                console.warn(`Error creating audio for ${track.name}: ${e.message}`);
            }
        });
    },
    
    // Play a music track
    play: function(name) {
        if (this.muted || !this.tracks[name]) return;
        
        try {
            // Stop current track if playing
            if (this.currentTrack && !this.currentTrack.paused) {
                this.currentTrack.pause();
                this.currentTrack.currentTime = 0;
            }
            
            this.currentTrack = this.tracks[name];
            this.currentTrack.play().catch(e => {
                // Ignore autoplay errors
                console.warn(`Error playing music ${name}: ${e.message}`);
            });
        } catch (e) {
            console.warn(`Error playing music ${name}: ${e.message}`);
        }
    },
    
    // Stop the current track
    stop: function() {
        if (this.currentTrack && !this.currentTrack.paused) {
            try {
                this.currentTrack.pause();
                this.currentTrack.currentTime = 0;
            } catch (e) {
                console.warn(`Error stopping music: ${e.message}`);
            }
        }
    },
    
    // Toggle mute
    toggleMute: function() {
        this.muted = !this.muted;
        
        if (this.currentTrack) {
            try {
                this.currentTrack.muted = this.muted;
            } catch (e) {
                console.warn(`Error toggling mute: ${e.message}`);
            }
        }
        
        return this.muted;
    },
    
    // Set volume (0-1)
    setVolume: function(volume) {
        this.volume = Math.max(0, Math.min(1, volume));
        
        Object.values(this.tracks).forEach(track => {
            try {
                track.volume = this.volume;
            } catch (e) {
                console.warn(`Error setting volume: ${e.message}`);
            }
        });
    }
};