import { Injectable } from '@angular/core';

type SoundTone = {
  frequency: number;
  duration: number;
  delay?: number;
};

type AudioContextConstructor = new () => AudioContext;

type WebAudioWindow = Window & {
  webkitAudioContext?: AudioContextConstructor;
};

@Injectable({
  providedIn: 'root'
})
export class SoundService {
  private readonly storageKey = 'lebnani.sound.enabled';
  private audioContext: AudioContext | null = null;

  isEnabled(): boolean {
    try {
      return localStorage.getItem(this.storageKey) !== 'false';
    } catch {
      return true;
    }
  }

  setEnabled(enabled: boolean): void {
    try {
      localStorage.setItem(this.storageKey, String(enabled));
    } catch {
      // Ignore storage errors.
    }
  }

  toggle(): boolean {
    const nextValue = !this.isEnabled();
    this.setEnabled(nextValue);
    return nextValue;
  }

  playCorrect(): void {
    this.playSequence([
      { frequency: 660, duration: 0.08 },
      { frequency: 880, duration: 0.12, delay: 0.07 }
    ]);
  }

  playWrong(): void {
    this.playSequence([
      { frequency: 220, duration: 0.1 },
      { frequency: 165, duration: 0.14, delay: 0.08 }
    ]);
  }

  playComplete(): void {
    this.playSequence([
      { frequency: 523.25, duration: 0.08 },
      { frequency: 659.25, duration: 0.08, delay: 0.07 },
      { frequency: 783.99, duration: 0.16, delay: 0.14 }
    ]);
  }

  private playSequence(tones: SoundTone[]): void {
    if (!this.isEnabled() || typeof globalThis.window === 'undefined') {
      return;
    }

    try {
      const context = this.getAudioContext();

      if (!context) {
        return;
      }

      if (context.state === 'suspended') {
        void context.resume();
      }

      const now = context.currentTime;

      for (const tone of tones) {
        this.playTone(context, tone, now + (tone.delay ?? 0));
      }
    } catch {
      // Sound FX should never break the app.
    }
  }

  private getAudioContext(): AudioContext | null {
    if (this.audioContext) {
      return this.audioContext;
    }

    const audioWindow = globalThis.window as WebAudioWindow;
    const AudioContextClass = globalThis.window.AudioContext ?? audioWindow.webkitAudioContext;

    if (!AudioContextClass) {
      return null;
    }

    this.audioContext = new AudioContextClass();
    return this.audioContext;
  }

  private playTone(context: AudioContext, tone: SoundTone, startTime: number): void {
    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.type = 'sine';
    oscillator.frequency.setValueAtTime(tone.frequency, startTime);

    gain.gain.setValueAtTime(0.0001, startTime);
    gain.gain.exponentialRampToValueAtTime(0.06, startTime + 0.015);
    gain.gain.exponentialRampToValueAtTime(0.0001, startTime + tone.duration);

    oscillator.connect(gain);
    gain.connect(context.destination);

    oscillator.start(startTime);
    oscillator.stop(startTime + tone.duration + 0.03);
  }
}