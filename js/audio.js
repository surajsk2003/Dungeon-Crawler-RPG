class AudioManager {
    constructor(assetLoader) {
        this.assetLoader = assetLoader;
        this.sounds = new Map();
        this.music = new Map();
        this.currentMusic = null;
        this.masterVolume = 1.0;
        this.musicVolume = 0.7;
        this.sfxVolume = 0.8;
        this.isEnabled = true;
        
        this.init();
    }

    init() {
        // Load available audio files
        this.loadAudioFiles();
    }

    loadAudioFiles() {
        // Only load sounds that actually exist
        const soundFiles = [
            { name: 'attack', file: 'assets/sounds/attack.mp3' },
            { name: 'hit', file: 'assets/sounds/hit.mp3' },
            { name: 'item', file: 'assets/sounds/item.mp3' },
            { name: 'levelup', file: 'assets/sounds/levelup.mp3' },
            { name: 'gameover', file: 'assets/sounds/gameover.mp3' },
            { name: 'fireball', file: 'assets/sounds/fireball.mp3' }
        ];

        const musicFiles = [
            { name: 'ambient', file: 'assets/dark-fantasy-ambient-dungeon-synth-248213.mp3' },
            { name: 'combat', file: 'assets/466_Drow_Slave_Camp.mp3' }
        ];

        // Load sounds with error handling
        soundFiles.forEach(({ name, file }) => {
            this.loadSound(name, file);
        });

        // Load music with error handling
        musicFiles.forEach(({ name, file }) => {
            this.loadMusic(name, file);
        });
    }

    loadSound(name, file) {
        try {
            const audio = new Audio();
            audio.preload = 'auto';
            audio.volume = this.sfxVolume * this.masterVolume;
            
            audio.oncanplaythrough = () => {
                this.sounds.set(name, audio);
            };
            
            audio.onerror = () => {
                console.warn(`Failed to load sound: ${name} from ${file}`);
                // Create silent fallback
                this.sounds.set(name, { play: () => {}, pause: () => {} });
            };
            
            audio.src = file;
        } catch (error) {
            console.warn(`Error loading sound ${name}:`, error);
            this.sounds.set(name, { play: () => {}, pause: () => {} });
        }
    }

    loadMusic(name, file) {
        try {
            const audio = new Audio();
            audio.preload = 'auto';
            audio.loop = true;
            audio.volume = this.musicVolume * this.masterVolume;
            
            audio.oncanplaythrough = () => {
                this.music.set(name, audio);
            };
            
            audio.onerror = () => {
                console.warn(`Failed to load music: ${name} from ${file}`);
                // Create silent fallback
                this.music.set(name, { play: () => {}, pause: () => {}, stop: () => {} });
            };
            
            audio.src = file;
        } catch (error) {
            console.warn(`Error loading music ${name}:`, error);
            this.music.set(name, { play: () => {}, pause: () => {}, stop: () => {} });
        }
    }

    playSound(soundName) {
        if (!this.isEnabled) return;
        
        const sound = this.sounds.get(soundName);
        if (sound && sound.play) {
            try {
                sound.currentTime = 0;
                sound.volume = this.sfxVolume * this.masterVolume;
                sound.play().catch(error => {
                    console.warn(`Failed to play sound ${soundName}:`, error);
                });
            } catch (error) {
                console.warn(`Error playing sound ${soundName}:`, error);
            }
        }
    }

    playMusic(musicName) {
        if (!this.isEnabled) return;
        
        // Stop current music
        this.stopMusic();
        
        const music = this.music.get(musicName);
        if (music && music.play) {
            try {
                music.volume = this.musicVolume * this.masterVolume;
                music.play().catch(error => {
                    console.warn(`Failed to play music ${musicName}:`, error);
                });
                this.currentMusic = music;
            } catch (error) {
                console.warn(`Error playing music ${musicName}:`, error);
            }
        }
    }

    stopMusic() {
        if (this.currentMusic) {
            try {
                this.currentMusic.pause();
                this.currentMusic.currentTime = 0;
            } catch (error) {
                console.warn('Error stopping music:', error);
            }
            this.currentMusic = null;
        }
    }

    updateMusicForGameState(state) {
        switch(state) {
            case 'exploration':
                this.playMusic('ambient');
                break;
            case 'combat':
                this.playMusic('combat');
                break;
            case 'menu':
                this.stopMusic();
                break;
        }
    }

    setEnabled(enabled) {
        this.isEnabled = enabled;
        if (!enabled) {
            this.stopMusic();
        }
    }
}

window.AudioManager = AudioManager;