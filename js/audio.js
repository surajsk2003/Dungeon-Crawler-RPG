// Audio management system
const audio = {
    sounds: {},
    muted: false,
    
    init: function() {
        this.loadSounds();
    },
    
    loadSounds: function() {
        const soundsToLoad = [
            { name: 'attack', src: 'assets/sounds/attack.wav' },
            { name: 'hit', src: 'assets/sounds/hit.wav' },
            { name: 'fireball', src: 'assets/sounds/fireball.wav' },
            { name: 'item', src: 'assets/sounds/item.wav' },
            { name: 'levelup', src: 'assets/sounds/levelup.wav' },
            { name: 'gameover', src: 'assets/sounds/gameover.wav' }
        ];
        
        soundsToLoad.forEach(sound => {
            try {
                this.sounds[sound.name] = new Audio(sound.src);
                this.sounds[sound.name].onerror = () => {
                    console.warn(`Failed to load sound: ${sound.name}`);
                };
            } catch (e) {
                console.warn(`Error creating audio for ${sound.name}: ${e.message}`);
            }
        });
    },
    
    play: function(name) {
        if (this.muted || !this.sounds[name]) return;
        
        try {
            const sound = this.sounds[name].cloneNode();
            sound.volume = 0.5;
            sound.play().catch(e => {
                console.warn(`Error playing sound ${name}: ${e.message}`);
            });
        } catch (e) {
            console.warn(`Error playing sound ${name}: ${e.message}`);
        }
    },
    
    toggleMute: function() {
        this.muted = !this.muted;
        return this.muted;
    }
};