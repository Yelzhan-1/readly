/* Speech helpers: TTS for listening, optional STT for read-aloud. */

const TTS_LANG = { en: 'en-US', ru: 'ru-RU', kk: 'kk-KZ' };

export function ttsSupported() {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

export function speak(text, { lang = 'en', rate = 0.95, pitch = 1.05, onEnd = null } = {}) {
  if (!ttsSupported()) return false;
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = TTS_LANG[lang] || 'en-US';
    u.rate = rate;
    u.pitch = pitch;
    if (onEnd) u.onend = onEnd;
    window.speechSynthesis.speak(u);
    return true;
  } catch (err) {
    console.warn('[speech] tts failed', err);
    return false;
  }
}

export function stopSpeaking() {
  if (ttsSupported()) window.speechSynthesis.cancel();
}

export function recognitionSupported() {
  return (
    typeof window !== 'undefined' &&
    (window.SpeechRecognition || window.webkitSpeechRecognition)
  );
}

/**
 * Create a recognition session.
 * @returns {null|{start:Function, stop:Function}} null when unsupported
 */
export function createRecognizer({ lang = 'en-US', onFinal, onInterim, onError } = {}) {
  const Ctor = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!Ctor) return null;
  const rec = new Ctor();
  rec.lang = lang;
  rec.continuous = true;
  rec.interimResults = true;
  rec.maxAlternatives = 1;

  rec.onresult = (event) => {
    let interim = '';
    let final = '';
    for (let i = event.resultIndex; i < event.results.length; i += 1) {
      const r = event.results[i];
      if (r.isFinal) final += r[0].transcript;
      else interim += r[0].transcript;
    }
    if (final && onFinal) onFinal(final.trim());
    if (interim && onInterim) onInterim(interim.trim());
  };
  rec.onerror = (event) => {
    if (onError) onError(event.error || 'unknown');
  };

  return {
    start: () => {
      try {
        rec.start();
      } catch {
        /* already started */
      }
    },
    stop: () => {
      try {
        rec.stop();
      } catch {
        /* noop */
      }
    },
  };
}

/** Compare a transcript to the expected sentence — word-level stats. */
export function analyzeTranscript(expectedSentence, transcript, durationSec = 1) {
  const norm = (s) =>
    String(s || '')
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, ' ')
      .trim();
  const exp = norm(expectedSentence).split(' ').filter(Boolean);
  const got = norm(transcript).split(' ').filter(Boolean);

  const gotSet = new Set(got);
  let correct = 0;
  const incorrect = [];
  const skipped = [];
  const seen = new Set();
  let repeated = 0;

  exp.forEach((w) => {
    if (gotSet.has(w)) {
      correct += 1;
      if (seen.has(w)) repeated += 1;
      seen.add(w);
    } else {
      skipped.push(w);
    }
  });

  got.forEach((w) => {
    if (!exp.includes(w) && !skipped.includes(w)) incorrect.push(w);
  });

  const wpm = durationSec > 1 ? Math.round((got.length / durationSec) * 60) : Math.round(exp.length * 1.2);

  return {
    correct,
    total: exp.length,
    incorrect,
    skipped,
    repeated,
    wpm: Math.max(10, Math.min(180, wpm)),
    pauses: Math.max(0, Math.floor(durationSec / 4) - 1),
    transcript,
  };
}

/**
 * Deterministic demo reading simulation used when no microphone exists.
 * Slightly "misses" words the profile struggles with — labelled as practice.
 */
export function simulateReading(expectedSentence, profile) {
  const words = String(expectedSentence).split(/\s+/).filter(Boolean);
  const hard = new Set(
    (profile.learning.difficultWords || []).map((d) => d.word.toLowerCase())
  );
  const accuracy = recentReadingAccuracy(profile);
  let correct = 0;
  const missed = [];
  words.forEach((w) => {
    const clean = w.toLowerCase().replace(/[^a-z]/g, '');
    const missChance = hard.has(clean) ? 0.75 : 1 - accuracy;
    if (Math.random() > missChance) correct += 1;
    else missed.push(clean);
  });
  return {
    correct,
    total: words.length,
    incorrect: [],
    skipped: missed,
    repeated: 0,
    wpm: 55 + Math.round(Math.random() * 30),
    pauses: missed.length > 2 ? 2 : 1,
    simulated: true,
    missedWords: missed,
  };
}

function recentReadingAccuracy(profile) {
  const s = profile?.learning?.skills?.reading;
  if (!s || !s.attempts) return 0.75;
  return Math.max(0.5, Math.min(0.95, s.correct / s.attempts));
}
