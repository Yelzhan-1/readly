/* Demo child: Ayan, 7 — dinosaurs + space, b/d confusion,
   missing letters, long words. Realistic multi-week history so the
   parent dashboard tells a story the moment judges open it. */

import { todayKey, daysAgoKey } from '../utils/dates.js';
import { emptySkills } from '../services/profileService.js';
import { seededRandom, shuffle } from '../utils/random.js';

const DEMO_WORDS = [
  'friend',
  'rocket',
  'dog',
  'dinosaur',
  'because',
  'bed',
  'ball',
  'telescope',
  'planet',
  'rainbow',
  'together',
  'dino',
];

function buildErrorLog(rng) {
  const log = [];
  const push = (type, daysBack, times) => {
    for (let i = 0; i < times; i += 1) {
      const d = new Date();
      d.setDate(d.getDate() - daysBack);
      d.setHours(15 + Math.floor(rng() * 4), Math.floor(rng() * 59), 0, 0);
      log.push({ type, at: d.getTime(), module: 'practice' });
    }
  };

  // b/d confusion: heavy older, tapering recently (visible improvement trend)
  push('bd_confusion', 9, 3);
  push('bd_confusion', 7, 2);
  push('bd_confusion', 5, 2);
  push('bd_confusion', 3, 1);
  push('bd_confusion', 1, 1);

  // missing letters: persistent but easing
  push('missing_letter', 8, 3);
  push('missing_letter', 6, 2);
  push('missing_letter', 4, 2);
  push('missing_letter', 2, 2);
  push('missing_letter', 1, 1);

  // long words
  push('long_word', 6, 2);
  push('long_word', 4, 1);
  push('long_word', 2, 2);
  push('long_word', 0, 1);

  // misc
  push('spelling', 5, 1);
  push('spelling', 2, 1);
  push('vowel_confusion', 7, 1);
  push('wrong_letter', 3, 1);

  return log.sort((a, b) => b.at - a.at);
}

function buildHistory(rng) {
  const history = [];
  const modules = ['letters', 'reading', 'writing', 'game', 'practice'];

  for (let d = 12; d >= 0; d -= 1) {
    if (d === 3 || d === 6 || d === 9) continue; // rest days
    const count = 3 + Math.floor(rng() * 3);
    for (let i = 0; i < count; i += 1) {
      const at = new Date();
      at.setDate(at.getDate() - d);
      at.setHours(16 + (i % 3), (i * 13 + Math.floor(rng() * 10)) % 59, 0, 0);
      const module = modules[(i + d) % modules.length];
      const acc = 0.6 + (12 - d) * 0.022 + rng() * 0.1;
      const ok = rng() < Math.min(0.93, acc);
      const skillMap = {
        letters: 'letterRecognition',
        reading: 'reading',
        writing: 'writing',
        game: 'letterRecognition',
        practice: 'spelling',
      };
      let errors = [];
      if (!ok) {
        const roll = rng();
        if (d >= 5 && roll < 0.5) errors = ['bd_confusion'];
        else if (roll < 0.7) errors = ['missing_letter'];
        else if (roll < 0.85) errors = ['long_word'];
        else errors = ['spelling'];
      }
      history.push({
        id: `demo_${d}_${i}`,
        at: at.getTime(),
        module,
        skill: skillMap[module],
        ok,
        word: DEMO_WORDS[Math.floor(rng() * DEMO_WORDS.length)],
        errors,
        hints: ok && rng() < 0.25 ? 1 : 0,
        durationSec: 35 + Math.floor(rng() * 55),
      });
    }
  }
  return history.sort((a, b) => b.at - a.at).slice(0, 60);
}

function buildSessions(rng, history) {
  const byDay = {};
  history.forEach((h) => {
    const key = new Date(h.at).toDateString();
    if (!byDay[key]) byDay[key] = [];
    byDay[key].push(h);
  });
  return Object.values(byDay)
    .map((items) => {
      const correct = items.filter((x) => x.ok).length;
      return {
        at: items[0].at,
        module: items[0].module,
        correct,
        total: items.length,
        stars: correct * 3,
        durationSec: items.reduce((s, x) => s + x.durationSec, 0),
      };
    })
    .sort((a, b) => b.at - a.at);
}

function buildAyan() {
  const rng = seededRandom('ayan-demo-seed-v2');
  const history = buildHistory(rng);
  const sessions = buildSessions(rng, history);
  const skills = emptySkills();

  skills.letterRecognition = { attempts: 47, correct: 44 };
  skills.spelling = { attempts: 52, correct: 37 };
  skills.reading = { attempts: 34, correct: 26 };
  skills.comprehension = { attempts: 21, correct: 18 };
  skills.writing = { attempts: 19, correct: 14 };

  const now = Date.now();
  const DAY = 86400000;

  return {
    id: 'p_ayan',
    name: 'Ayan',
    age: 7,
    demo: true,
    diagnosticDone: true,
    interests: ['dinosaur', 'space'],
    mascot: 'dino',
    color: '#FF7A45',
    stars: 132,
    streak: 4,
    lastActiveDate: daysAgoKey(1),
    createdAt: daysAgoKey(14),
    badges: ['firstSteps', 'questDay', 'streak3', 'reader5'],
    worlds: ['dino', 'space'],
    readStories: 6,
    wordsPracticed: 87,
    questsDone: 5,
    dailyQuest: {
      date: todayKey(),
      items: { letters: false, reading: false, writing: false, game: false },
    },
    learning: {
      skills,
      readingSpeed: 64,
      errorLog: buildErrorLog(rng),
      difficultWords: [
        { word: 'friend', ease: 2.1, interval: 1, due: now - DAY, lapses: 2, seen: 3 },
        { word: 'because', ease: 2.3, interval: 1, due: now - 3600000, lapses: 1, seen: 2 },
        { word: 'rocket', ease: 2.4, interval: 2, due: now + DAY, lapses: 1, seen: 2 },
        { word: 'telescope', ease: 2.0, interval: 1, due: now - 2 * DAY, lapses: 2, seen: 3 },
        { word: 'dinosaur', ease: 2.5, interval: 2, due: now + 3 * DAY, lapses: 0, seen: 2 },
        { word: 'together', ease: 2.2, interval: 1, due: now + 2 * DAY, lapses: 1, seen: 2 },
        { word: 'dog', ease: 2.6, interval: 1, due: now - 60000, lapses: 1, seen: 2 },
      ],
      masteredWords: ['cat', 'sun', 'moon', 'star', 'egg', 'ball', 'hat', 'bus', 'cake', 'bed'],
      masteredSkills: ['letter_basic'],
      skillsInProgress: ['missing_letter', 'bd_confusion', 'long_words'],
      difficulty: 2,
      preferredDifficulty: 'auto',
      recent: [
        { ok: true, at: now - 3600000 },
        { ok: true, at: now - 7200000 },
        { ok: false, at: now - 9000000 },
        { ok: true, at: now - 10800000 },
        { ok: true, at: now - DAY },
        { ok: true, at: now - DAY - 3600000 },
        { ok: false, at: now - DAY - 7200000 },
        { ok: true, at: now - 2 * DAY },
      ],
    },
    history,
    sessions,
  };
}

export function createDemoState() {
  return {
    lang: 'en',
    onboarded: true,
    diagnosticDone: true,
    settings: {
      sound: true,
      textSize: 'md',
      reducedMotion: false,
      sessionLength: 'medium',
      difficulty: 'auto',
      goals: ['letters', 'reading', 'writing'],
      reminder: false,
    },
    profiles: [buildAyan()],
    activeProfileId: 'p_ayan',
    stories: [],
  };
}

export function emptyProfile({ name, age = 6, interests = [], mascot = 'dino', color = '#FF7A45' }) {
  return {
    id: `p_${Date.now().toString(36)}`,
    name,
    age,
    demo: false,
    diagnosticDone: false,
    interests,
    mascot,
    color,
    stars: 0,
    streak: 0,
    lastActiveDate: null,
    createdAt: new Date().toISOString(),
    badges: [],
    worlds: ['dino'],
    readStories: 0,
    wordsPracticed: 0,
    questsDone: 0,
    dailyQuest: {
      date: todayKey(),
      items: { letters: false, reading: false, writing: false, game: false },
    },
    learning: {
      skills: emptySkills(),
      readingSpeed: 0,
      errorLog: [],
      difficultWords: [],
      masteredWords: [],
      masteredSkills: [],
      skillsInProgress: [],
      difficulty: 1,
      preferredDifficulty: 'auto',
      recent: [],
    },
    history: [],
    sessions: [],
  };
}

export { shuffle };
