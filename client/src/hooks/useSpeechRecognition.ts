import { useCallback, useEffect, useRef, useState } from 'react';

interface UseSpeechRecognitionOptions {
  onTranscript: (text: string, isFinal: boolean) => void;
  onError?: (error: string) => void;
  onEnd?: () => void;
}

interface UseSpeechRecognitionReturn {
  isSupported: boolean;
  isListening: boolean;
  start: () => void;
  stop: () => void;
  toggle: () => void;
}

export function useSpeechRecognition({
  onTranscript,
  onError,
  onEnd,
}: UseSpeechRecognitionOptions): UseSpeechRecognitionReturn {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const callbacksRef = useRef({ onTranscript, onError, onEnd });

  useEffect(() => {
    callbacksRef.current = { onTranscript, onError, onEnd };
  }, [onTranscript, onError, onEnd]);

  const isSupported =
    typeof window !== 'undefined' &&
    !!(window.SpeechRecognition || window.webkitSpeechRecognition);

  const start = useCallback(() => {
    if (!isSupported || recognitionRef.current) return;

    const Ctor = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!Ctor) return;

    const recognition = new Ctor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = 'en-US';
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = '';
      let final = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0]?.transcript || '';
        if (result.isFinal) {
          final += transcript;
        } else {
          interim += transcript;
        }
      }

      if (final) {
        callbacksRef.current.onTranscript(final, true);
      }
      if (interim) {
        callbacksRef.current.onTranscript(interim, false);
      }
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      if (event.error === 'no-speech' || event.error === 'aborted') return;

      let message = 'Voice input failed.';
      if (event.error === 'not-allowed' || event.error === 'service-not-allowed') {
        message = 'Microphone permission was denied.';
      } else if (event.error === 'network') {
        message = 'Network error — voice input needs an internet connection.';
      } else if (event.error === 'audio-capture') {
        message = 'No microphone found on this device.';
      }

      callbacksRef.current.onError?.(message);
      setIsListening(false);
      recognitionRef.current = null;
    };

    recognition.onend = () => {
      setIsListening(false);
      recognitionRef.current = null;
      callbacksRef.current.onEnd?.();
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch (err) {
      console.error('[speech] failed to start:', err);
      setIsListening(false);
      recognitionRef.current = null;
    }
  }, [isSupported]);

  const stop = useCallback(() => {
    const rec = recognitionRef.current;
    if (!rec) {
      setIsListening(false);
      return;
    }

    // Flip UI immediately — don't wait for the browser
    setIsListening(false);

    try {
      rec.stop();
    } catch {
      /* ignore */
    }

    // Force-shutdown if the browser ignores stop() within 500ms
    window.setTimeout(() => {
      const still = recognitionRef.current;
      if (still === rec) {
        try {
          still.abort();
        } catch {
          /* ignore */
        }
        recognitionRef.current = null;
      }
    }, 500);
  }, []);

  const toggle = useCallback(() => {
    if (recognitionRef.current) {
      stop();
    } else {
      start();
    }
  }, [start, stop]);

  useEffect(() => {
    return () => {
      const rec = recognitionRef.current;
      if (rec) {
        try {
          rec.abort();
        } catch {
          /* ignore */
        }
      }
    };
  }, []);

  return { isSupported, isListening, start, stop, toggle };
}
