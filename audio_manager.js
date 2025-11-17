class AudioManager {
    constructor() {
        this.audioContext = null;
        this.sounds = {};
        this.masterVolume = 0.3;
        this.initAudioContext();
        this.createSounds();
    }
    
    initAudioContext() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
        } catch (error) {
            console.warn('Web Audio API not supported:', error);
        }
    }
    
    createSounds() {
        // 使用Web Audio API创建合成音效
        this.sounds = {
            shoot: () => this.createTone(800, 0.1, 'square', 0.1),
            explosion: () => this.createExplosionSound(),
            enemyShoot: () => this.createTone(400, 0.2, 'sawtooth', 0.1),
            powerUp: () => this.createTone(1000, 0.3, 'sine', 0.2),
            gameOver: () => this.createGameOverSound(),
            levelUp: () => this.createLevelUpSound()
        };
    }
    
    createTone(frequency, duration, type = 'sine', volume = 0.1) {
        if (!this.audioContext) return;
        
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
        oscillator.type = type;
        
        gainNode.gain.setValueAtTime(volume * this.masterVolume, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + duration);
    }
    
    createExplosionSound() {
        if (!this.audioContext) return;
        
        // 创建多层爆炸音效
        const frequencies = [100, 150, 200];
        const durations = [0.3, 0.2, 0.15];
        
        frequencies.forEach((freq, index) => {
            setTimeout(() => {
                this.createTone(freq, durations[index], 'sawtooth', 0.2);
            }, index * 50);
        });
    }
    
    createGameOverSound() {
        if (!this.audioContext) return;
        
        // 创建下降音调
        const oscillator = this.audioContext.createOscillator();
        const gainNode = this.audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(this.audioContext.destination);
        
        oscillator.type = 'sawtooth';
        oscillator.frequency.setValueAtTime(400, this.audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(100, this.audioContext.currentTime + 1);
        
        gainNode.gain.setValueAtTime(0.2 * this.masterVolume, this.audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + 1);
        
        oscillator.start(this.audioContext.currentTime);
        oscillator.stop(this.audioContext.currentTime + 1);
    }
    
    createLevelUpSound() {
        if (!this.audioContext) return;
        
        // 创建上升音调
        const notes = [523, 659, 784, 1047]; // C, E, G, C
        const duration = 0.15;
        
        notes.forEach((freq, index) => {
            setTimeout(() => {
                this.createTone(freq, duration, 'sine', 0.15);
            }, index * 150);
        });
    }
    
    play(soundName) {
        if (this.sounds[soundName]) {
            this.sounds[soundName]();
        }
    }
    
    setVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
    }
}

// 导出音频管理器
window.AudioManager = AudioManager;