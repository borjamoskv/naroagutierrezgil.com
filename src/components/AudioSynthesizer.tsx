// SYS_ID: AUDIO_SYNTHESIZER_OMEGA
// STATE: C5-REAL
// AESTHETIC: INDUSTRIAL_NOIR_2026
// CREATOR: borjamoskv

"use client";

import React, { useRef, useState, useEffect } from "react";
import MagneticButton from "./MagneticButton";

/**
 * AudioSynthesizer component that uses the Web Audio API to create a live, responsive atmospheric soundscape.
 * Creates an ambient drone (Industrial Noir) and synthesizes crystalline resonance when carving kintsugi lines.
 * Self-tracks pointer positions to enable clean global drop-in.
 * Reacts to the 'data-borja' global state to transition between warm ambient drone and deep industrial rumble.
 * 
 * Credits & Production: Borja Moskv (borjamoskv) / MOSKV-1 APEX
 */
export default function AudioSynthesizer() {
  const [audioActive, setAudioActive] = useState(false);
  const [isBorjaActive, setIsBorjaActive] = useState(false);
  
  const audioCtxRef = useRef<AudioContext | null>(null);
  
  // Ambient drone nodes
  const osc1Ref = useRef<OscillatorNode | null>(null);
  const osc2Ref = useRef<OscillatorNode | null>(null);
  const filterRef = useRef<BiquadFilterNode | null>(null);
  const mainGainRef = useRef<GainNode | null>(null);

  // Scratching/Carving synthesis nodes
  const carveOscRef = useRef<OscillatorNode | null>(null);
  const carveGainRef = useRef<GainNode | null>(null);

  // Pointer state tracked locally
  const [pointerDown, setPointerDown] = useState(false);
  const [pointerPos, setPointerPos] = useState({ x: 0, y: 0 });

  // Listen to mouse/touch events globally
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setPointerPos({ x: e.clientX, y: e.clientY });
    };
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches[0]) {
        setPointerPos({ x: e.touches[0].clientX, y: e.touches[0].clientY });
      }
    };
    const handleMouseDown = () => setPointerDown(true);
    const handleMouseUp = () => setPointerDown(false);

    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("mousedown", handleMouseDown, { passive: true });
    window.addEventListener("mouseup", handleMouseUp, { passive: true });
    window.addEventListener("touchstart", handleMouseDown, { passive: true });
    window.addEventListener("touchend", handleMouseUp, { passive: true });

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("mousedown", handleMouseDown);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchstart", handleMouseDown);
      window.removeEventListener("touchend", handleMouseUp);
    };
  }, []);

  // Listen to data-borja global HTML attribute mutation
  useEffect(() => {
    const checkBorja = () => {
      const root = document.documentElement;
      setIsBorjaActive(root.getAttribute("data-borja") === "true");
    };
    checkBorja();

    const observer = new MutationObserver(checkBorja);
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-borja"] });

    return () => observer.disconnect();
  }, []);

  const initAudio = () => {
    if (audioCtxRef.current) return;

    try {
      const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      const ctx = new AudioContextClass();
      audioCtxRef.current = ctx;

      // Master Gain
      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(0.2, ctx.currentTime);
      masterGain.connect(ctx.destination);
      mainGainRef.current = masterGain;

      // Low Pass Filter for deep drone
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(110, ctx.currentTime);
      filter.Q.setValueAtTime(4, ctx.currentTime);
      filter.connect(masterGain);
      filterRef.current = filter;

      // LFO Drone 1
      const osc1 = ctx.createOscillator();
      osc1.type = "sawtooth";
      osc1.frequency.setValueAtTime(55, ctx.currentTime); // A1 note
      osc1.connect(filter);
      osc1.start();
      osc1Ref.current = osc1;

      // LFO Drone 2
      const osc2 = ctx.createOscillator();
      osc2.type = "sine";
      osc2.frequency.setValueAtTime(55.4, ctx.currentTime); // slight detune
      osc2.connect(filter);
      osc2.start();
      osc2Ref.current = osc2;

      // Carving Resonator Synth
      const carveGain = ctx.createGain();
      carveGain.gain.setValueAtTime(0.0, ctx.currentTime);
      carveGain.connect(masterGain);
      carveGainRef.current = carveGain;

      const carveOsc = ctx.createOscillator();
      carveOsc.type = "sine";
      carveOsc.frequency.setValueAtTime(600, ctx.currentTime);
      carveOsc.connect(carveGain);
      carveOsc.start();
      carveOscRef.current = carveOsc;

      setAudioActive(true);
    } catch {
      // Web Audio API unavailable — graceful degradation
    }
  };

  const toggleAudio = () => {
    if (!audioCtxRef.current) {
      initAudio();
    } else {
      if (audioCtxRef.current.state === "suspended") {
        audioCtxRef.current.resume();
        setAudioActive(true);
      } else if (audioCtxRef.current.state === "running") {
        audioCtxRef.current.suspend();
        setAudioActive(false);
      }
    }
  };

  // Modulate drone filter based on cursor coordinates
  useEffect(() => {
    const filter = filterRef.current;
    const ctx = audioCtxRef.current;
    if (!filter || !ctx || ctx.state !== "running") return;

    const widthPct = pointerPos.x / window.innerWidth;
    const heightPct = pointerPos.y / window.innerHeight;
    
    // Map cursor X/Y to filter cutoff frequency (100Hz to 600Hz)
    const targetFreq = 100 + (widthPct * 400) + (heightPct * 100);
    filter.frequency.setTargetAtTime(targetFreq, ctx.currentTime, 0.1);
  }, [pointerPos]);

  // Handle carving resonance on pointer drag
  useEffect(() => {
    const carveGain = carveGainRef.current;
    const carveOsc = carveOscRef.current;
    const ctx = audioCtxRef.current;
    if (!carveGain || !carveOsc || !ctx || ctx.state !== "running") return;

    if (pointerDown) {
      // Map pointer Y to frequency (300Hz to 1200Hz)
      const pctY = pointerPos.y / window.innerHeight;
      const freq = 1200 - pctY * 900;
      
      carveOsc.frequency.setTargetAtTime(freq, ctx.currentTime, 0.05);
      // Fade in carve synthesizer gain
      carveGain.gain.setTargetAtTime(0.08, ctx.currentTime, 0.05);
    } else {
      // Fade out carve synthesizer gain
      carveGain.gain.setTargetAtTime(0.0, ctx.currentTime, 0.1);
    }
  }, [pointerDown, pointerPos]);

  // Mutate soundscape based on Borja mode (Industrial Noir)
  useEffect(() => {
    const ctx = audioCtxRef.current;
    const filter = filterRef.current;
    const osc1 = osc1Ref.current;
    const osc2 = osc2Ref.current;
    if (!ctx || !osc1 || !osc2 || !filter || ctx.state !== "running") return;

    if (isBorjaActive) {
      // Darker, heavier industrial drone (C1 notes)
      filter.frequency.setTargetAtTime(70, ctx.currentTime, 1.5);
      osc1.frequency.setTargetAtTime(32.70, ctx.currentTime, 2.0); // C1 sub rumble
      osc2.frequency.setTargetAtTime(32.90, ctx.currentTime, 2.0); // detuned sub rumble
    } else {
      // Warm ambient drone (A1 notes)
      filter.frequency.setTargetAtTime(110, ctx.currentTime, 1.5);
      osc1.frequency.setTargetAtTime(55.00, ctx.currentTime, 2.0); // A1 note
      osc2.frequency.setTargetAtTime(55.40, ctx.currentTime, 2.0); // detuned A1
    }
  }, [isBorjaActive]);

  return (
    <div className="fixed bottom-6 right-6 z-50 pointer-events-auto mix-blend-difference">
      <MagneticButton
        onClick={toggleAudio}
        range={50}
        strength={0.3}
        className={`px-5 py-3 rounded-full border text-[9px] tracking-[0.2em] uppercase font-mono transition-all duration-300 ${
          audioActive
            ? "border-primary bg-primary/10 text-primary shadow-[0_0_15px_rgba(43,59,229,0.3)]"
            : "border-white/10 bg-transparent text-white/50 hover:border-white/30"
        }`}
      >
        Soundscape: {audioActive ? "ON" : "OFF"}
      </MagneticButton>
    </div>
  );
}
