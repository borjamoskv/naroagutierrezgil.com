'use client';

import React, { useEffect, useRef, useState } from 'react';

interface AudioSynthesizerProps {
  isPlaying?: boolean;
  pointerDown?: boolean;
  pointerX?: number;
  pointerY?: number;
}

export const AudioSynthesizer: React.FC<AudioSynthesizerProps> = ({
  isPlaying = false,
  pointerDown = false,
}) => {
  const active = isPlaying || pointerDown;
  const audioCtxRef = useRef<AudioContext | null>(null);
  const osc1Ref = useRef<OscillatorNode | null>(null);
  const osc2Ref = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);

  useEffect(() => {
    if (active) {
      try {
        const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
        const ctx = new AudioCtx();
        audioCtxRef.current = ctx;

        // Master Gain
        const masterGain = ctx.createGain();
        masterGain.gain.setValueAtTime(0.001, ctx.currentTime);
        masterGain.gain.exponentialRampToValueAtTime(0.12, ctx.currentTime + 3);
        masterGain.connect(ctx.destination);
        gainNodeRef.current = masterGain;

        // Mineral Base Drone Oscillator (108Hz)
        const osc1 = ctx.createOscillator();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(108, ctx.currentTime);

        // Gold Resonance Filter
        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(320, ctx.currentTime);

        osc1.connect(filter);
        filter.connect(masterGain);
        osc1.start();
        osc1Ref.current = osc1;

        // Subtle Overtone Oscillator (216Hz)
        const osc2 = ctx.createOscillator();
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(216, ctx.currentTime);

        const gain2 = ctx.createGain();
        gain2.gain.setValueAtTime(0.03, ctx.currentTime);

        osc2.connect(gain2);
        gain2.connect(masterGain);
        osc2.start();
        osc2Ref.current = osc2;
      } catch (err) {
        console.error('Web Audio API error:', err);
      }
    } else {
      if (gainNodeRef.current && audioCtxRef.current) {
        const ctx = audioCtxRef.current;
        gainNodeRef.current.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 1);
        setTimeout(() => {
          osc1Ref.current?.stop();
          osc2Ref.current?.stop();
          audioCtxRef.current?.close();
          audioCtxRef.current = null;
        }, 1050);
      }
    }

    return () => {
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close();
      }
    };
  }, [active]);

  return null;
};

export default AudioSynthesizer;
