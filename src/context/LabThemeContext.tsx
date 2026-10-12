import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';

interface LabThemeContextType {
  calmMode: boolean;
  toggleCalmMode: () => void;
  audioFeedback: boolean;
  toggleAudioFeedback: () => void;
  playClick: (type?: 'heavy' | 'soft' | 'toggle' | 'success' | 'alert') => void;
  activeMission: string | null;
  setActiveMission: (mission: string | null) => void;
}

const LabThemeContext = createContext<LabThemeContextType | undefined>(undefined);

// Web Audio API Synthetic Laboratory Instrument Sound Engine
class SyntheticLabAudioEngine {
  private ctx: AudioContext | null = null;

  private initCtx() {
    if (!this.ctx && typeof window !== 'undefined') {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  playClick(type: 'heavy' | 'soft' | 'toggle' | 'success' | 'alert' = 'soft') {
    try {
      this.initCtx();
      if (!this.ctx) return;

      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      if (type === 'heavy') {
        // Crisp physical relay / solenoid latch
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.04);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
        osc.start(now);
        osc.stop(now + 0.045);
      } else if (type === 'toggle') {
        // Instrument toggle switch flip
        osc.type = 'sine';
        osc.frequency.setValueAtTime(540, now);
        osc.frequency.exponentialRampToValueAtTime(220, now + 0.035);
        gain.gain.setValueAtTime(0.09, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.035);
        osc.start(now);
        osc.stop(now + 0.04);
      } else if (type === 'success') {
        // High-purity chime
        osc.type = 'sine';
        osc.frequency.setValueAtTime(659.25, now); // E5
        osc.frequency.setValueAtTime(880, now + 0.06); // A5
        gain.gain.setValueAtTime(0.1, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
        osc.start(now);
        osc.stop(now + 0.23);
      } else if (type === 'alert') {
        // Subtly damped dual tick
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(280, now);
        gain.gain.setValueAtTime(0.08, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.07);
        osc.start(now);
        osc.stop(now + 0.075);
      } else {
        // Subtle micro-switch tick
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(300, now + 0.02);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.02);
        osc.start(now);
        osc.stop(now + 0.025);
      }
    } catch {
      // AudioContext policy suppression fallback
    }
  }
}

const labAudio = new SyntheticLabAudioEngine();

export const LabThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [calmMode, setCalmMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('cognitia_calm_mode');
      if (saved !== null) return JSON.parse(saved);
      return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    } catch {
      return false;
    }
  });

  const [audioFeedback, setAudioFeedback] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('cognitia_audio_feedback');
      return saved ? JSON.parse(saved) : false; // Muted by default per specification
    } catch {
      return false;
    }
  });

  const [activeMission, setActiveMission] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem('cognitia_calm_mode', JSON.stringify(calmMode));
      if (calmMode) {
        document.body.classList.add('calm-mode');
      } else {
        document.body.classList.remove('calm-mode');
      }
    } catch {
      // Ignored
    }
  }, [calmMode]);

  useEffect(() => {
    try {
      localStorage.setItem('cognitia_audio_feedback', JSON.stringify(audioFeedback));
    } catch {
      // Ignored
    }
  }, [audioFeedback]);

  const toggleCalmMode = useCallback(() => {
    setCalmMode((prev) => !prev);
  }, []);

  const toggleAudioFeedback = useCallback(() => {
    setAudioFeedback((prev) => {
      const next = !prev;
      if (next) labAudio.playClick('toggle');
      return next;
    });
  }, []);

  const playClick = useCallback(
    (type: 'heavy' | 'soft' | 'toggle' | 'success' | 'alert' = 'soft') => {
      if (audioFeedback) {
        labAudio.playClick(type);
      }
    },
    [audioFeedback]
  );

  return (
    <LabThemeContext.Provider
      value={{
        calmMode,
        toggleCalmMode,
        audioFeedback,
        toggleAudioFeedback,
        playClick,
        activeMission,
        setActiveMission,
      }}
    >
      {children}
    </LabThemeContext.Provider>
  );
};

export const useLabTheme = (): LabThemeContextType => {
  const context = useContext(LabThemeContext);
  if (!context) {
    throw new Error('useLabTheme must be used within a LabThemeProvider');
  }
  return context;
};
