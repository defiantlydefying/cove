"use client";

import { useState, useRef, useCallback, useEffect } from "react";

interface VoiceInputProps {
  onTranscript: (text: string) => void;
  disabled?: boolean;
}

export default function VoiceInput({ onTranscript, disabled }: VoiceInputProps) {
  const [isListening, setIsListening] = useState(false);
  const [supported, setSupported] = useState(false);
  const [volume, setVolume] = useState(0); // 0-1 normalized volume
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const transcriptRef = useRef("");
  const silenceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animFrameRef = useRef<number>(0);
  const streamRef = useRef<MediaStream | null>(null);
  const SILENCE_TIMEOUT = 3500;

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    setSupported(!!SpeechRecognition);
  }, []);

  // Start volume monitoring via Web Audio API
  const startVolumeMonitor = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      const audioContext = new AudioContext();
      // Resume context if suspended (browser policy)
      if (audioContext.state === "suspended") {
        await audioContext.resume();
      }
      audioContextRef.current = audioContext;
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.3;
      source.connect(analyser);
      analyserRef.current = analyser;

      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const tick = () => {
        if (!analyserRef.current) return;
        analyser.getByteFrequencyData(dataArray);
        // Use RMS for more responsive volume detection
        let sumSquares = 0;
        for (let i = 0; i < dataArray.length; i++) {
          const normalized = dataArray[i] / 255;
          sumSquares += normalized * normalized;
        }
        const rms = Math.sqrt(sumSquares / dataArray.length);
        // Amplify for visual effect (rms is usually 0-0.3 for speech)
        const amplified = Math.min(1, rms * 3);
        setVolume(amplified);
        animFrameRef.current = requestAnimationFrame(tick);
      };
      tick();
    } catch (err) {
      console.warn("Volume monitor failed:", err);
    }
  }, []);

  const stopVolumeMonitor = useCallback(() => {
    if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
    audioContextRef.current?.close().catch(() => {});
    audioContextRef.current = null;
    analyserRef.current = null;
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setVolume(0);
  }, []);

  const toggle = useCallback(() => {
    if (isListening) {
      recognitionRef.current?.stop();
      stopVolumeMonitor();
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return;

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let full = "";
      for (let i = 0; i < event.results.length; i++) {
        full += event.results[i][0].transcript;
      }
      transcriptRef.current = full;

      if (silenceTimer.current) clearTimeout(silenceTimer.current);
      silenceTimer.current = setTimeout(() => {
        recognition.stop();
      }, SILENCE_TIMEOUT);
    };

    recognition.onerror = () => {
      if (silenceTimer.current) clearTimeout(silenceTimer.current);
      stopVolumeMonitor();
      if (transcriptRef.current.trim()) {
        onTranscript(transcriptRef.current.trim());
      }
      transcriptRef.current = "";
      setIsListening(false);
    };

    recognition.onend = () => {
      if (silenceTimer.current) clearTimeout(silenceTimer.current);
      stopVolumeMonitor();
      if (transcriptRef.current.trim()) {
        onTranscript(transcriptRef.current.trim());
      }
      transcriptRef.current = "";
      setIsListening(false);
    };

    recognitionRef.current = recognition;
    transcriptRef.current = "";
    recognition.start();
    startVolumeMonitor();
    setIsListening(true);
  }, [isListening, onTranscript, startVolumeMonitor, stopVolumeMonitor]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopVolumeMonitor();
      if (silenceTimer.current) clearTimeout(silenceTimer.current);
    };
  }, [stopVolumeMonitor]);

  if (!supported) return null;

  // Scale ring size based on volume (1.2 = quiet, up to 2.5 = loud)
  const ringScale = isListening ? 1.2 + volume * 1.3 : 1;
  const ringOpacity = isListening ? 0.1 + volume * 0.25 : 0;

  return (
    <button
      type="button"
      onClick={toggle}
      disabled={disabled}
      className={`relative p-2 rounded-full transition-colors ${
        isListening
          ? "text-red-500"
          : "text-cove-muted hover:text-cove-charcoal hover:bg-cove-accent/10"
      }`}
      aria-label={isListening ? "Stop recording" : "Start voice input"}
    >
      {/* Animated volume rings */}
      {isListening && (
        <>
          <span
            className="absolute inset-0 rounded-full bg-red-500 transition-all duration-100"
            style={{ transform: `scale(${ringScale})`, opacity: ringOpacity }}
          />
          <span
            className="absolute inset-0 rounded-full bg-red-500/10 animate-ping"
            style={{ animationDuration: "2s" }}
          />
        </>
      )}
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="relative z-10">
        <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
        <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
        <line x1="12" y1="19" x2="12" y2="23" />
        <line x1="8" y1="23" x2="16" y2="23" />
      </svg>
    </button>
  );
}
