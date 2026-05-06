import { TestBed } from '@angular/core/testing';
import { beforeEach, describe, expect, it, vi } from 'vitest';

import { SoundService } from './sound.service';

describe('SoundService', () => {
  let service: SoundService;

  beforeEach(() => {
    localStorage.clear();

    TestBed.configureTestingModule({});
    service = TestBed.inject(SoundService);
  });

  it('should be enabled by default', () => {
    expect(service.isEnabled()).toBe(true);
  });

  it('should store disabled state', () => {
    service.setEnabled(false);

    expect(service.isEnabled()).toBe(false);
    expect(localStorage.getItem('lebnani.sound.enabled')).toBe('false');
  });

  it('should store enabled state', () => {
    service.setEnabled(false);
    service.setEnabled(true);

    expect(service.isEnabled()).toBe(true);
    expect(localStorage.getItem('lebnani.sound.enabled')).toBe('true');
  });

  it('should toggle sound state', () => {
    expect(service.toggle()).toBe(false);
    expect(service.isEnabled()).toBe(false);

    expect(service.toggle()).toBe(true);
    expect(service.isEnabled()).toBe(true);
  });

  it('should not throw when playing sounds in test environment', () => {
    expect(() => service.playCorrect()).not.toThrow();
    expect(() => service.playWrong()).not.toThrow();
    expect(() => service.playComplete()).not.toThrow();
  });

  it('should not create an audio context when disabled', () => {
    const originalAudioContext = window.AudioContext;
    const audioContextMock = vi.fn();

    Object.defineProperty(window, 'AudioContext', {
      configurable: true,
      writable: true,
      value: audioContextMock
    });

    service.setEnabled(false);
    service.playCorrect();

    expect(audioContextMock).not.toHaveBeenCalled();

    Object.defineProperty(window, 'AudioContext', {
      configurable: true,
      writable: true,
      value: originalAudioContext
    });
  });
});