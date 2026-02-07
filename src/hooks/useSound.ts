import { useCallback, useEffect, useRef, useState } from 'react';

// Sound effect types
export type SoundType =
  | 'cardFlip'
  | 'damage'
  | 'heal'
  | 'equipWeapon'
  | 'victory'
  | 'defeat'
  | 'buttonClick'
  | 'monsterKill';

// Simple oscillator-based sound effects (no external files needed)
const SOUND_CONFIGS: Record<SoundType, { frequency: number; duration: number; type: OscillatorType; gain: number }[]> = {
  cardFlip: [
    { frequency: 800, duration: 0.05, type: 'sine', gain: 0.2 },
    { frequency: 1200, duration: 0.05, type: 'sine', gain: 0.15 },
  ],
  damage: [
    { frequency: 150, duration: 0.1, type: 'sawtooth', gain: 0.3 },
    { frequency: 100, duration: 0.15, type: 'sawtooth', gain: 0.2 },
  ],
  heal: [
    { frequency: 400, duration: 0.1, type: 'sine', gain: 0.2 },
    { frequency: 600, duration: 0.1, type: 'sine', gain: 0.2 },
    { frequency: 800, duration: 0.15, type: 'sine', gain: 0.15 },
  ],
  equipWeapon: [
    { frequency: 200, duration: 0.05, type: 'square', gain: 0.15 },
    { frequency: 400, duration: 0.08, type: 'square', gain: 0.2 },
    { frequency: 600, duration: 0.1, type: 'sine', gain: 0.15 },
  ],
  victory: [
    { frequency: 523, duration: 0.15, type: 'sine', gain: 0.25 }, // C5
    { frequency: 659, duration: 0.15, type: 'sine', gain: 0.25 }, // E5
    { frequency: 784, duration: 0.15, type: 'sine', gain: 0.25 }, // G5
    { frequency: 1047, duration: 0.3, type: 'sine', gain: 0.2 }, // C6
  ],
  defeat: [
    { frequency: 400, duration: 0.2, type: 'sawtooth', gain: 0.2 },
    { frequency: 300, duration: 0.2, type: 'sawtooth', gain: 0.2 },
    { frequency: 200, duration: 0.3, type: 'sawtooth', gain: 0.15 },
    { frequency: 100, duration: 0.4, type: 'sawtooth', gain: 0.1 },
  ],
  buttonClick: [
    { frequency: 600, duration: 0.03, type: 'sine', gain: 0.15 },
  ],
  monsterKill: [
    { frequency: 300, duration: 0.08, type: 'square', gain: 0.2 },
    { frequency: 200, duration: 0.1, type: 'square', gain: 0.15 },
    { frequency: 100, duration: 0.15, type: 'sawtooth', gain: 0.1 },
  ],
};

export function useSound() {
  const [soundEnabled, setSoundEnabled] = useState(() => {
    const stored = localStorage.getItem('scoundrel_sound_enabled');
    return stored !== 'false'; // Default to true
  });

  const audioContextRef = useRef<AudioContext | null>(null);

  // Initialize audio context on first user interaction
  const initAudioContext = useCallback(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    return audioContextRef.current;
  }, []);

  // Play a sound effect
  const playSound = useCallback((type: SoundType) => {
    if (!soundEnabled) return;

    try {
      const ctx = initAudioContext();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }

      const config = SOUND_CONFIGS[type];
      let startTime = ctx.currentTime;

      config.forEach((note) => {
        const oscillator = ctx.createOscillator();
        const gainNode = ctx.createGain();

        oscillator.type = note.type;
        oscillator.frequency.setValueAtTime(note.frequency, startTime);

        // Envelope for smooth sound
        gainNode.gain.setValueAtTime(0, startTime);
        gainNode.gain.linearRampToValueAtTime(note.gain, startTime + 0.01);
        gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + note.duration);

        oscillator.connect(gainNode);
        gainNode.connect(ctx.destination);

        oscillator.start(startTime);
        oscillator.stop(startTime + note.duration);

        startTime += note.duration * 0.8; // Slight overlap for smoother sound
      });
    } catch (error) {
      console.warn('Sound playback failed:', error);
    }
  }, [soundEnabled, initAudioContext]);

  // Toggle sound on/off
  const toggleSound = useCallback(() => {
    setSoundEnabled((prev) => {
      const newValue = !prev;
      localStorage.setItem('scoundrel_sound_enabled', String(newValue));
      return newValue;
    });
  }, []);

  // Cleanup
  useEffect(() => {
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  return {
    playSound,
    soundEnabled,
    toggleSound,
  };
}

// Sound context for global access
import { createContext, useContext } from 'react';

interface SoundContextType {
  playSound: (type: SoundType) => void;
  soundEnabled: boolean;
  toggleSound: () => void;
}

export const SoundContext = createContext<SoundContextType | null>(null);

export function useSoundContext() {
  const context = useContext(SoundContext);
  if (!context) {
    throw new Error('useSoundContext must be used within SoundProvider');
  }
  return context;
}
