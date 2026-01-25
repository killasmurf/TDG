/**
 * Audio Manager
 * Handles all game audio including sound effects and music
 */

import Config from '../config.js';

class AudioManager {
    constructor() {
        this.sounds = new Map();
        this.music = null;
        this.musicVolume = Config.audio.musicVolume;
        this.sfxVolume = Config.audio.sfxVolume;
        this.masterVolume = Config.audio.masterVolume;
        this.muted = false;
        this.initialized = false;

        // Audio context for web audio API
        this.audioContext = null;
    }

    /**
     * Initialize the audio context (must be called after user interaction)
     */
    init() {
        if (this.initialized) return;

        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            this.initialized = true;
            console.log('Audio system initialized');
        } catch (error) {
            console.warn('Web Audio API not supported:', error);
        }
    }

    /**
     * Load a sound effect
     * @param {string} name - Identifier for the sound
     * @param {string} url - URL to the audio file
     * @returns {Promise}
     */
    async loadSound(name, url) {
        try {
            const response = await fetch(url);
            const arrayBuffer = await response.arrayBuffer();

            if (this.audioContext) {
                const audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
                this.sounds.set(name, { buffer: audioBuffer, type: 'buffer' });
            } else {
                // Fallback to HTML5 Audio
                const audio = new Audio(url);
                audio.preload = 'auto';
                this.sounds.set(name, { element: audio, type: 'element' });
            }

            console.log(`Sound loaded: ${name}`);
        } catch (error) {
            console.warn(`Failed to load sound ${name}:`, error);
        }
    }

    /**
     * Load multiple sounds at once
     * @param {Object} soundMap - Object mapping names to URLs
     * @returns {Promise}
     */
    async loadSounds(soundMap) {
        const promises = Object.entries(soundMap).map(([name, url]) =>
            this.loadSound(name, url)
        );
        await Promise.all(promises);
    }

    /**
     * Play a sound effect
     * @param {string} name - Name of the sound to play
     * @param {number} volume - Volume override (0-1)
     */
    play(name, volume = 1) {
        if (this.muted) return;

        const sound = this.sounds.get(name);

        if (!sound) {
            // Sound not loaded, fail silently for now
            console.debug(`Sound not loaded: ${name}`);
            return;
        }

        const finalVolume = volume * this.sfxVolume * this.masterVolume;

        if (sound.type === 'buffer' && this.audioContext) {
            // Web Audio API playback
            const source = this.audioContext.createBufferSource();
            const gainNode = this.audioContext.createGain();

            source.buffer = sound.buffer;
            gainNode.gain.value = finalVolume;

            source.connect(gainNode);
            gainNode.connect(this.audioContext.destination);

            source.start(0);
        } else if (sound.type === 'element') {
            // HTML5 Audio fallback
            const audio = sound.element.cloneNode();
            audio.volume = finalVolume;
            audio.play().catch(() => {
                // Ignore autoplay errors
            });
        }
    }

    /**
     * Play background music
     * @param {string} url - URL to the music file
     * @param {boolean} loop - Whether to loop the music
     */
    playMusic(url, loop = true) {
        this.stopMusic();

        this.music = new Audio(url);
        this.music.loop = loop;
        this.music.volume = this.musicVolume * this.masterVolume;

        if (!this.muted) {
            this.music.play().catch(() => {
                console.debug('Music autoplay blocked, waiting for user interaction');
            });
        }
    }

    /**
     * Stop background music
     */
    stopMusic() {
        if (this.music) {
            this.music.pause();
            this.music.currentTime = 0;
            this.music = null;
        }
    }

    /**
     * Pause background music
     */
    pauseMusic() {
        if (this.music) {
            this.music.pause();
        }
    }

    /**
     * Resume background music
     */
    resumeMusic() {
        if (this.music && !this.muted) {
            this.music.play().catch(() => {});
        }
    }

    /**
     * Set master volume
     * @param {number} volume - Volume level (0-1)
     */
    setMasterVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
        this.updateMusicVolume();
    }

    /**
     * Set music volume
     * @param {number} volume - Volume level (0-1)
     */
    setMusicVolume(volume) {
        this.musicVolume = Math.max(0, Math.min(1, volume));
        this.updateMusicVolume();
    }

    /**
     * Set sound effects volume
     * @param {number} volume - Volume level (0-1)
     */
    setSfxVolume(volume) {
        this.sfxVolume = Math.max(0, Math.min(1, volume));
    }

    /**
     * Update music element volume
     */
    updateMusicVolume() {
        if (this.music) {
            this.music.volume = this.musicVolume * this.masterVolume;
        }
    }

    /**
     * Toggle mute state
     * @returns {boolean} New mute state
     */
    toggleMute() {
        this.muted = !this.muted;

        if (this.muted) {
            this.pauseMusic();
        } else {
            this.resumeMusic();
        }

        return this.muted;
    }

    /**
     * Set mute state
     * @param {boolean} muted - Whether audio should be muted
     */
    setMuted(muted) {
        this.muted = muted;

        if (muted) {
            this.pauseMusic();
        } else {
            this.resumeMusic();
        }
    }

    /**
     * Check if audio is muted
     * @returns {boolean}
     */
    isMuted() {
        return this.muted;
    }

    /**
     * Clean up audio resources
     */
    destroy() {
        this.stopMusic();
        this.sounds.clear();

        if (this.audioContext) {
            this.audioContext.close();
            this.audioContext = null;
        }

        this.initialized = false;
    }
}

export default AudioManager;
