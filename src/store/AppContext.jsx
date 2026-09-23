import React, {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useReducer,
  useCallback,
} from 'react';
import { loadState, saveState, clearState } from '../services/storage.js';
import { createDemoState } from '../data/demoSeed.js';
import { resetDailyQuest } from '../services/profileService.js';
import { uid } from '../utils/random.js';

const STORAGE_KEY_PARENT = 'readly.parent.unlocked';
const AppCtx = createContext(null);

function freshQuests(state) {
  const clone = JSON.parse(JSON.stringify(state));
  clone.profiles = (clone.profiles || []).map((p) => resetDailyQuest(p));
  return clone;
}

function initState() {
  const saved = loadState();
  const base = saved && saved.profiles?.length ? saved : createDemoState();
  return freshQuests({
    lang: base.lang || 'en',
    settings: {
      sound: true,
      textSize: 'md',
      reducedMotion: false,
      sessionLength: 'medium',
      difficulty: 'auto',
      goals: ['letters', 'reading', 'writing'],
      reminder: false,
      ...(base.settings || {}),
    },
    profiles: base.profiles || [],
    activeProfileId: base.activeProfileId || base.profiles?.[0]?.id || null,
    stories: base.stories || [],
    parentUnlocked:
      typeof sessionStorage !== 'undefined' && sessionStorage.getItem(STORAGE_KEY_PARENT) === '1',
    toasts: [],
  });
}

function reducer(state, action) {
  switch (action.type) {
    case 'setLang':
      return { ...state, lang: action.lang };

    case 'updateSettings':
      return { ...state, settings: { ...state.settings, ...action.patch } };

    case 'addProfile':
      return {
        ...state,
        profiles: [...state.profiles, action.profile],
        activeProfileId: action.profile.id,
      };

    case 'selectProfile':
      return { ...state, activeProfileId: action.id };

    case 'mutateProfile': {
      const profiles = state.profiles.map((p) =>
        p.id === action.id ? action.fn(p) : p
      );
      return { ...state, profiles };
    }

    case 'addStory':
      return { ...state, stories: [action.story, ...state.stories].slice(0, 14) };

    case 'setParent':
      if (typeof sessionStorage !== 'undefined') {
        if (action.value) sessionStorage.setItem(STORAGE_KEY_PARENT, '1');
        else sessionStorage.removeItem(STORAGE_KEY_PARENT);
      }
      return { ...state, parentUnlocked: action.value };

    case 'pushToast':
      return { ...state, toasts: [...state.toasts, action.toast].slice(-3) };

    case 'dismissToast':
      return { ...state, toasts: state.toasts.filter((t) => t.id !== action.id) };

    case 'resetDemo': {
      clearState();
      return freshQuests({
        ...createDemoState(),
        parentUnlocked: false,
        toasts: [],
      });
    }

    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, undefined, initState);

  /* persistence */
  useEffect(() => {
    saveState(state);
  }, [state.lang, state.settings, state.profiles, state.activeProfileId, state.stories]);

  /* accessibility prefs on <html> */
  useEffect(() => {
    const root = document.documentElement;
    root.classList.toggle('text-lg', state.settings.textSize === 'lg');
    root.classList.toggle('text-xl', state.settings.textSize === 'xl');
    root.classList.toggle('reduced-motion', !!state.settings.reducedMotion);
  }, [state.settings.textSize, state.settings.reducedMotion]);

  const profile = useMemo(
    () => state.profiles.find((p) => p.id === state.activeProfileId) || null,
    [state.profiles, state.activeProfileId]
  );

  const setLang = useCallback((lang) => dispatch({ type: 'setLang', lang }), []);
  const updateSettings = useCallback((patch) => dispatch({ type: 'updateSettings', patch }), []);
  const addProfile = useCallback((p) => dispatch({ type: 'addProfile', profile: p }), []);
  const selectProfile = useCallback((id) => dispatch({ type: 'selectProfile', id }), []);
  const mutateProfile = useCallback(
    (id, fn) => dispatch({ type: 'mutateProfile', id, fn }),
    []
  );
  const addStory = useCallback((story) => dispatch({ type: 'addStory', story }), []);
  const setParentUnlocked = useCallback(
    (value) => dispatch({ type: 'setParent', value }),
    []
  );
  const resetDemo = useCallback(() => dispatch({ type: 'resetDemo' }), []);

  const pushToast = useCallback((toast) => {
    const id = uid('toast');
    dispatch({ type: 'pushToast', toast: { id, ...toast } });
    setTimeout(() => dispatch({ type: 'dismissToast', id }), 4200);
    return id;
  }, []);

  const dismissToast = useCallback((id) => dispatch({ type: 'dismissToast', id }), []);

  const value = useMemo(
    () => ({
      state,
      profile,
      settings: state.settings,
      lang: state.lang,
      setLang,
      updateSettings,
      addProfile,
      selectProfile,
      mutateProfile,
      addStory,
      parentUnlocked: state.parentUnlocked,
      setParentUnlocked,
      resetDemo,
      toasts: state.toasts,
      pushToast,
      dismissToast,
    }),
    [
      state,
      profile,
      setLang,
      updateSettings,
      addProfile,
      selectProfile,
      mutateProfile,
      addStory,
      setParentUnlocked,
      resetDemo,
      pushToast,
      dismissToast,
    ]
  );

  return <AppCtx.Provider value={value}>{children}</AppCtx.Provider>;
}

export function useApp() {
  const ctx = useContext(AppCtx);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
