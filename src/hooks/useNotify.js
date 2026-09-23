import { useCallback } from 'react';
import { useApp } from '../store/AppContext.jsx';
import { useT } from '../i18n/index.jsx';
import { badgeById } from '../data/badges.js';
import { levelForStars } from '../data/worlds.js';

/** Convert engine events into localized child toasts. */
export function useNotify() {
  const { pushToast } = useApp();
  const t = useT();

  return useCallback(
    (events = []) => {
      events.forEach((e) => {
        switch (e.kind) {
          case 'stars':
            pushToast({ icon: '⭐', text: t('toast.stars', { n: e.n }), tone: 'warm' });
            break;
          case 'world':
            pushToast({ icon: '🌟', text: t('toast.world', { name: t(`worlds.${e.id}`) }), tone: 'success' });
            break;
          case 'badge': {
            const b = badgeById(e.id);
            pushToast({ icon: '🏅', text: t('toast.badge', { name: b ? t(b.nameKey) : e.id }), tone: 'info' });
            break;
          }
          case 'level': {
            const lv = levelForStars(0);
            const nameKey = { beginner: 'levels.beginner', explorer: 'levels.explorer', reader: 'levels.reader', storyteller: 'levels.storyteller' }[e.id] || 'levels.beginner';
            pushToast({ icon: '🎉', text: t('toast.level', { level: t(nameKey) }), tone: 'success' });
            break;
          }
          case 'streak':
            pushToast({ icon: '🔥', text: t('toast.streak', { n: e.n }), tone: 'warm' });
            break;
          case 'word':
            pushToast({ icon: '🎉', text: t('toast.word', { word: e.word }), tone: 'success' });
            break;
          case 'quest':
            pushToast({ icon: '🗺️', text: t('toast.quest'), tone: 'success' });
            break;
          default:
            break;
        }
      });
    },
    [pushToast, t]
  );
}
