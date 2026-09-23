import { useEffect, useRef } from 'react';
import { useApp } from '../store/AppContext.jsx';
import { speak, stopSpeaking } from '../services/speechService.js';

/** TTS bound to the current language + sound preference. */
export function useSpeech() {
  const { lang, settings } = useApp();
  const enabled = settings.sound !== false;

  useEffect(() => () => stopSpeaking(), []);

  const say = (text, opts = {}) => {
    if (!enabled || !text) return false;
    return speak(text, { lang, ...opts });
  };

  const stop = () => stopSpeaking();

  return { say, stop, enabled, ttsSupported: typeof window !== 'undefined' && 'speechSynthesis' in window };
}
