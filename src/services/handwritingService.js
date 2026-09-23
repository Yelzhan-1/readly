/* Replaceable handwriting recognition service.
   ---------------------------------------------------------------
   Contract: given ink data + the expected word, return a grade.
   DEMO implementation does NOT pretend to read the drawing —
   it asks the child to type the word so grading stays honest.
   Swap this file for a real on-device model later without
   touching any UI code.
   --------------------------------------------------------------- */

export const HANDWRITING_MODE = 'typed-fallback'; // future: 'onnx', 'cloud'

/**
 * @param {{strokes: Array, expected: string, typed: string}} input
 * @returns {Promise<{ok:boolean, actual:string, source:'typed'|'ink', note?:string}>}
 */
export async function recognizeInk({ strokes = [], expected = '', typed = '' } = {}) {
  // simulate a tiny "thinking" pause for polish
  await new Promise((r) => setTimeout(r, 250));

  if (typed && typed.trim()) {
    return { ok: null, actual: typed, source: 'typed' };
  }

  if (!strokes.length) {
    return { ok: false, actual: '', source: 'ink', note: 'empty' };
  }

  // Ink exists but we can't read it honestly without an ML model.
  return {
    ok: false,
    actual: '',
    source: 'ink',
    note: 'needs-typed',
    expected,
  };
}

export function hasInk(strokes) {
  return Array.isArray(strokes) && strokes.length > 0;
}
