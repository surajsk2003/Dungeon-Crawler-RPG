class AudioManager {
    constructor(assetLoader) {
        this.assetLoader = assetLoader;
        this.audioContext = null;
        this.masterGain = null;
        this.musicGain = null;
        this.sfxGain = null;
        
        this.currentMusic = null;
        this.musicVolume = 0.6;
        this.sfxVolume = 0.8;
        this.masterVolume = 1.0;
        
        this.musicTracks = new Map();
        this.soundEffects = new Map();
        this.musicQueue = [];
        
        this.init();
    }

    async init() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Create gain nodes for volume control
            this.masterGain = this.audioContext.createGain();
            this.musicGain = this.audioContext.createGain();
            this.sfxGain = this.audioContext.createGain();
            
            // Connect gain nodes
            this.musicGain.connect(this.masterGain);
            this.sfxGain.connect(this.masterGain);
            this.masterGain.connect(this.audioContext.destination);
            
            // Set initial volumes
            this.updateVolumes();
            
            await this.loadAudioAssets();
        } catch (error) {
            console.warn('Web Audio API not supported:', error);
        }
    }

    async loadAudioAssets() {
        const audioFiles = {
            music: {
                ambient: 'assets/dark-fantasy-ambient-dungeon-synth-248213.mp3',
                combat: 'assets/music/combat_theme.mp3',
                victory: 'assets/music/victory.mp3',
                boss: 'assets/music/boss_battle.mp3'
            },
            sounds: {
                // Combat sounds
                sword_hit: 'assets/RPG Sound Pack/sword_hit.wav',
                arrow_shoot: 'assets/RPG Sound Pack/arrow_shoot.wav',
                spell_cast: 'assets/RPG Sound Pack/spell_cast.wav',
                shield_block: 'assets/RPG Sound Pack/shield_block.wav',
                
                // Movement sounds
                footstep: 'assets/DungonCrawlGameSounds/footstep.wav',
                door_open: 'assets/DungonCrawlGameSounds/door_open.wav',
                stairs: 'assets/DungonCrawlGameSounds/stairs.wav',
                
                // Item sounds
                item_pickup: 'assets/sounds/item_pickup.wav',
                gold_pickup: 'assets/sounds/gold_pickup.wav',
                potion_drink: 'assets/sounds/potion_drink.wav',
                
                // UI sounds
                menu_select: 'assets/sounds/menu_select.wav',
                menu_confirm: 'assets/sounds/menu_confirm.wav',
                inventory_open: 'assets/sounds/inventory_open.wav',
                
                // Enemy sounds
                skeleton_death: 'assets/sounds/skeleton_death.wav',
                goblin_attack: 'assets/sounds/goblin_attack.wav',
                level_up: 'assets/sounds/level_up.wav'
            }
        };

        // Load music tracks
        for (const [key, path] of Object.entries(audioFiles.music)) {
            try {
                const audio = new Audio(path);
                audio.loop = true;
                audio.volume = 0;
                this.musicTracks.set(key, audio);
            } catch (error) {
                console.warn(`Failed to load music: ${path}`);
            }
        }

        // Load sound effects
        for (const [key, path] of Object.entries(audioFiles.sounds)) {
            try {
                const audio = new Audio(path);
                audio.volume = 0;
                this.soundEffects.set(key, audio);
            } catch (error) {
                console.warn(`Failed to load sound: ${path}`);
            }
        }
    }

    playMusic(trackName, fadeTime = 1000) {
        if (!this.musicTracks.has(trackName)) {
            console.warn(`Music track not found: ${trackName}`);
            return;
        }

        const newTrack = this.musicTracks.get(trackName);
        
        if (this.currentMusic === newTrack) {
            return; // Already playing
        }

        // Fade out current music
        if (this.currentMusic) {
            this.fadeOut(this.currentMusic, fadeTime);
        }

        // Fade in new music
        this.currentMusic = newTrack;
        this.fadeIn(newTrack, fadeTime);
    }

    fadeIn(audio, duration) {
        audio.currentTime = 0;
        audio.volume = 0;
        audio.play().catch(e => console.warn('Audio play failed:', e));
        
        const steps = 20;
        const stepTime = duration / steps;
        const volumeStep = this.musicVolume / steps;
        
        let currentStep = 0;
        const fadeInterval = setInterval(() => {
            currentStep++;
            audio.volume = Math.min(volumeStep * currentStep, this.musicVolume);
            
            if (currentStep >= steps) {
                clearInterval(fadeInterval);
            }
        }, stepTime);
    }

    fadeOut(audio, duration) {
        const initialVolume = audio.volume;
        const steps = 20;
        const stepTime = duration / steps;
        const volumeStep = initialVolume / steps;
        
        let currentStep = 0;
        const fadeInterval = setInterval(() => {
            currentStep++;
            audio.volume = Math.max(initialVolume - (volumeStep * currentStep), 0);
            
            if (currentStep >= steps) {
                audio.pause();
                audio.currentTime = 0;
                clearInterval(fadeInterval);
            }
        }, stepTime);
    }

    playSound(soundName, volume = 1.0) {
        if (!this.soundEffects.has(soundName)) {
            console.warn(`Sound effect not found: ${soundName}`);
            return;
        }

        const sound = this.soundEffects.get(soundName).cloneNode();
        sound.volume = this.sfxVolume * volume;
        sound.play().catch(e => console.warn('Sound play failed:', e));
        
        return sound;
    }

    playRandomSound(soundArray, volume = 1.0) {
        if (soundArray.length === 0) return;
        
        const randomSound = soundArray[Math.floor(Math.random() * soundArray.length)];
        return this.playSound(randomSound, volume);
    }

    stopMusic() {
        if (this.currentMusic) {
            this.fadeOut(this.currentMusic, 500);
            this.currentMusic = null;
        }
    }

    stopAllSounds() {
        this.soundEffects.forEach(sound => {
            sound.pause();
            sound.currentTime = 0;
        });
    }

    setMasterVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
        this.updateVolumes();
    }

    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        this.updateVolumes();
        
        if (this.currentMusic) {
            this.currentMusic.volume = this.musicVolume;
        }
    }

    setSfxVolume(volume) {
        this.sfxVolume = Math.max(0, Math.min(1, volume));
        this.updateVolumes();
    }

    updateVolumes() {
        if (this.masterGain) {
            this.masterGain.gain.value = this.masterVolume;
        }
        if (this.musicGain) {
            this.musicGain.gain.value = this.musicVolume;
        }
        if (this.sfxGain) {
            this.sfxGain.gain.value = this.sfxVolume;
        }
    }

    // Dynamic music system
    updateMusicForGameState(gameState) {
        switch(gameState) {
            case 'exploration':
                this.playMusic('ambient');
                break;
            case 'combat':
                this.playMusic('combat');
                break;
            case 'boss':
                this.playMusic('boss');
                break;
            case 'victory':
                this.playMusic('victory');
                break;
        }
    }

    // 3D positional audio for immersion
    playPositionalSound(soundName, x, y, playerX, playerY, maxDistance = 200) {
        const distance = Math.sqrt((x - playerX) ** 2 + (y - playerY) ** 2);
        const volume = Math.max(0, 1 - (distance / maxDistance));
        
        if (volume > 0) {
            this.playSound(soundName, volume);
        }
    }
}

window.AudioManager = AudioManager;