# Readly — описание для жюри VentureHack 2026

Readly — адаптивный тренажёр чтения и письма для детей примерно 5–7 лет. Ребёнок видит короткие квесты и истории про свои интересы. Родитель видит понятные метрики приложения: время, точность, ошибки, которые система сама заметила. Readly не ставит медицинский диагноз и не заменяет учителя.

## Проблема

Одинаковые прописи не видят, что именно путает ребёнок: `b/d`, пропущенную букву, длинное слово. Родителю трудно понять, стало ли лучше, если смотреть только на «звёзды».

## Решение

Цикл **Observe → Understand → Adapt**:

1. **Observe.** Каждое задание сохраняется: верно или нет, тип ошибки, слово, модуль, время.
2. **Understand.** Профиль считает точность по навыкам, частые паттерны ошибок и слова, которые пора повторить.
3. **Adapt.** Следующий набор короче или длиннее, легче или сложнее, и чаще возвращает то, что ещё не закрепилось. Контекст задания берётся из интересов ребёнка (динозавры, космос и другие темы Readly). Это не персонажи чужих франшиз.

## Что есть в продукте

- Детский путь: главная, ежедневный квест (буквы, чтение, письмо, игра), истории, письмо, прогресс, профиль, настройки.
- Персональные короткие истории и задания вокруг интересов.
- Родительский режим: обзор (показатели → неделя → недавняя активность → Coach → заметки), прогресс, навыки, история, настройки.
- Цели родителя фильтруют сегодняшний квест в «Учить». Игра со словами остаётся. Ежедневное напоминание помечено как **Coming soon** и не притворяется уведомлением.
- Readly Coach: **DEMO** без ключей (локальные подсказки). **LIVE** только если edge-функция `coach` реально ответила ключом локализации. Бейдж не подделывается. Модельный API-ключ в браузер не кладётся.
- Два режима хранения. Без ключей Supabase всё живёт в `localStorage`. С anon-ключом и входом родителя данные синхронизируются в Postgres под RLS. `service_role` в браузер не попадает и клиент его отвергает.

## Стек

- Vite, React 18, React Router
- Интерфейс на английском, русском и казахском (`src/locales`, проверка `npm run check:i18n`)
- Адаптивный движок в `src/services/profileService.js` и `src/services/adaptiveEngine.js`
- Supabase: Auth родителя, таблицы `child_profiles`, `parent_child_links`, `progress_events`, `stories`, edge-функция `coach`
- Проект: `readly`, регион eu-central-1, ref `hrlpidapontbnrvmrqzw`. Новый проект не создавался.

## Публичный демо-сайт

https://yelzhan-1.github.io/readly/

Это статика GitHub Pages (проектный путь `/readly/`). Облако Supabase на публичном сайте не обязательно: демо Ayan и PIN 1234 работают из браузера. Деплой: workflow `.github/workflows/pages.yml` после пуша в `main`.

## Демо-путь для жюри

1. `npm i && npm run dev`
2. Открыть http://127.0.0.1:5173/
3. Start Learning → ребёнок **Ayan**
4. Home → Learn → короткая сессия → Stories → Writing
5. For parents → PIN **1234** → Overview, Progress, History, Settings

PIN показывается только на экране родительского замка. Настройки ребёнка открываются с профиля и из шапки.

Практика слов и историй на **английском** специально: это тренажёр английской грамотности. Язык интерфейса можно сменить. Микрофон в чтении вслух слушает `en-US`; на экране есть честная подпись.

## Supabase необязателен

- Нет `VITE_SUPABASE_URL` и `VITE_SUPABASE_ANON_KEY` — офлайн-демо, PIN `1234`, Coach DEMO.
- Ключи есть — родитель может создать аккаунт на экране настроек. Дети привязаны через `parent_child_links`, но вставить ссылку можно только на ребёнка, которого этот родитель сам создал (`owner_id`).
- `VITE_READLY_CLOUD=0` принудительно оставляет данные на устройстве даже при ключе.
- Пример переменных без секретов: `.env.example`. Файл `.env` в git не входит.
- Облачная подтяжка не затирает более свежий локальный прогресс и не удаляет демо-профиль Ayan. Повторная отправка в облако ставится в очередь, если предыдущая ещё идёт.

Миграции в `supabase/migrations/` — источник правды для схемы и RLS. Политика `20260923191000_tighten_parent_links.sql` закрывает привязку чужого ребёнка по UUID и разрешает обновление историй.

## Угол VentureHack 2026 EduTech

Readly показывает, как детский продукт может адаптироваться к реальной ошибке, а не к абстрактному «уровню», и как родительский экран остаётся честным: метрики приложения, а не клиническое заключение. Демо работает без сети и без платного API. Облако — опция с RLS, а не обязательный сервер.

## Что уже сделано

- Демо Ayan с историей на несколько недель, бейджи, звёзды, серии.
- Сложность и длина сессии влияют на следующий набор, включая слова в коротком письме.
- Озвучка подсказок, медленная речь, подсказки, режим «нажимай слова».
- Нормализация неполного профиля: пустые `history`, `worlds`, навыки. Родительские экраны не падают.
- Тост, если `localStorage` переполнен и сохранение не удалось.
- Размер текста до Extra large. Кнопки и карточки затемнены, чтобы белый текст читался.
- Проверки: `npm run build`, `npm run check:i18n`, `npm run check:guards`.

## Известные ограничения

- Почерк на холсте не распознаётся. Оценка идёт по набранному тексту. В интерфейсе письма это сказано прямо.
- LIVE Coach работает только с задеплоенной edge-функцией `coach` и anon-ключом. Без этого бейдж остаётся DEMO. Отдельный ключ модели в репозиторий не кладётся.
- Напоминание «каждый день» не отправляет push. Это Coming soon.
- Подтверждение email родителя зависит от настроек Auth в Supabase.
- Публичный демо-сайт: https://yelzhan-1.github.io/readly/ (GitHub Pages, без серверного логина).
- Уязвимости npm в инструментах сборки не блокируют демо, но перед боевым запуском их стоит пересмотреть (`npm audit`).

---

# Readly — VentureHack 2026 jury note (English)

Readly is an adaptive reading and writing trainer for children about 5–7. The child gets short quests and interest-themed stories. The parent sees app metrics: time, accuracy, and mistake patterns Readly actually observed. Readly does not diagnose and does not replace a teacher.

The loop is Observe → Understand → Adapt. Exercise results update the profile. The next set follows parent difficulty, session length, weak skills, and due words. Story context uses original interest themes only.

**Live demo:** https://yelzhan-1.github.io/readly/

**Local:** `npm i && npm run dev`, then http://127.0.0.1:5173/. Child **Ayan**. Parent PIN **1234** (shown only on the parent gate). Settings are on the child profile and in the header.

**Storage:** no Supabase keys → `localStorage` and Coach DEMO. Anon key + parent sign-in → Postgres with RLS. The browser never receives `service_role`. A parent can link only a child profile they own. Cloud hydrate keeps the newer copy and never drops the local demo profile. Story edits queue if a push is already running; story updates are allowed by RLS.

**Honest limits:** handwriting is graded from typed text; LIVE Coach requires the deployed `coach` edge function; the daily reminder is labeled Coming soon; practice content is English on purpose while the UI is English, Russian, and Kazakh. The public site is the offline demo at https://yelzhan-1.github.io/readly/.
