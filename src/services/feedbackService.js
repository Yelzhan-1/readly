/* Child-friendly feedback. Never punishing, always specific. */

import { normalizeWord } from './errorAnalyzer.js';

export function encouragementKey() {
  const keys = ['feedback.enc1', 'feedback.enc2', 'feedback.enc3', 'feedback.enc4'];
  return keys[Math.floor(Math.random() * keys.length)];
}

/**
 * Build feedback for a graded attempt.
 * @returns {{tone:'great'|'good'|'almost'|'tricky', titleKey, titleVars, textKey, textVars}}
 */
export function buildFeedback(analysis, { hints = 0, attempt = 1, kind = 'word', expected = '', wpm = null } = {}) {
  if (analysis.ok) {
    if (hints === 0 && attempt === 1) {
      return { tone: 'great', titleKey: 'feedback.perfectTitle', titleVars: {}, textKey: 'feedback.perfectText', textVars: {} };
    }
    if (attempt >= 3) {
      return { tone: 'good', titleKey: 'feedback.goodTitle', titleVars: {}, textKey: 'feedback.goodText', textVars: {} };
    }
    return { tone: 'great', titleKey: 'feedback.greatTitle', titleVars: {}, textKey: 'feedback.independent', textVars: {} };
  }

  if (kind === 'sentence' && analysis.types?.includes('sentence_structure')) {
    return { tone: 'almost', titleKey: 'feedback.almostTitle', titleVars: {}, textKey: 'feedback.sentence', textVars: {} };
  }

  const primary = analysis.primary;
  const first = analysis.errors?.[0] || {};

  switch (primary) {
    case 'missing_letter':
      return {
        tone: 'almost',
        titleKey: 'feedback.almostTitle',
        titleVars: {},
        textKey: first.count > 1 ? 'feedback.missing' : 'feedback.missingAt',
        textVars: first.count > 1 ? {} : { letter: String(first.letter || '').toUpperCase() },
      };
    case 'extra_letter':
      return { tone: 'almost', titleKey: 'feedback.almostTitle', titleVars: {}, textKey: 'feedback.extra', textVars: {} };
    case 'bd_confusion':
      return {
        tone: 'tricky',
        titleKey: 'feedback.trickyTitle',
        titleVars: {},
        textKey: 'feedback.bd',
        textVars: { a: String(first.from || 'b').toUpperCase(), b: String(first.to || 'd').toUpperCase() },
      };
    case 'pq_confusion':
      return {
        tone: 'tricky',
        titleKey: 'feedback.trickyTitle',
        titleVars: {},
        textKey: 'feedback.pq',
        textVars: { a: String(first.from || 'p').toUpperCase(), b: String(first.to || 'q').toUpperCase() },
      };
    case 'vowel_confusion':
      return {
        tone: 'almost',
        titleKey: 'feedback.almostTitle',
        titleVars: {},
        textKey: 'feedback.vowel',
        textVars: { a: String(first.from || '').toUpperCase(), b: String(first.to || '').toUpperCase() },
      };
    case 'wrong_letter':
      return {
        tone: 'almost',
        titleKey: 'feedback.almostTitle',
        titleVars: {},
        textKey: 'feedback.wrong',
        textVars: { index: (first.index || 1) },
      };
    case 'letter_order':
      return { tone: 'almost', titleKey: 'feedback.almostTitle', titleVars: {}, textKey: 'feedback.order', textVars: {} };
    case 'long_word':
    case 'spelling':
      return { tone: 'tricky', titleKey: 'feedback.trickyTitle', titleVars: {}, textKey: 'feedback.spelling', textVars: {} };
    case 'skipped_word':
      return { tone: 'almost', titleKey: 'feedback.almostTitle', titleVars: {}, textKey: 'feedback.skipped', textVars: {} };
    case 'repeated_word':
      return { tone: 'good', titleKey: 'feedback.goodTitle', titleVars: {}, textKey: 'feedback.repeated', textVars: {} };
    case 'word_substitution':
      return {
        tone: 'almost',
        titleKey: 'feedback.almostTitle',
        titleVars: {},
        textKey: 'feedback.substitution',
        textVars: { expected: String(expected).toUpperCase() },
      };
    default:
      if (attempt >= 2) {
        return { tone: 'tricky', titleKey: 'feedback.trickyTitle', titleVars: {}, textKey: 'feedback.tryAgainText', textVars: {} };
      }
      return { tone: 'almost', titleKey: 'feedback.almostTitle', titleVars: {}, textKey: encouragementKey(), textVars: {} };
  }
}

export function starsForResult(ok, hints, attempt) {
  if (!ok) return 0;
  if (hints === 0 && attempt === 1) return 5;
  if (hints <= 1) return 4;
  if (attempt <= 2) return 3;
  return 2;
}

export function readingResultMessage(correct, total) {
  if (correct === total) return { titleKey: 'reading.analysisTitle', textKey: 'reading.allCorrect', vars: { correct, total, n: 0 } };
  const missed = total - correct;
  return {
    titleKey: 'reading.analysisTitle',
    textKey: 'reading.wordsRead',
    vars: { correct, total },
    practice: missed,
  };
}

export { normalizeWord };
