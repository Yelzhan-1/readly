# Readly design refs

Patterns taken from the three sources below and applied in CSS (no extra animation libraries, no third-party characters).

## Refero — https://refero.design

Used as the parent-dashboard spine, not a copy of any one product.

- Dashboard screens such as [Andante](https://refero.design/screens/1bb46e95-1265-43de-b18a-1a5283151713): stats first, then a trend (line/bar), then timeline/history. Cards, a calm sidebar, one accent.
- Literacy parent dashboards (card grid, time / accuracy / practice, badges, a next step in plain language): overview order is **KPI → weekly trend → recent activity → coach note**.
- Child side stays a quest, not a chart: one large continue button, progress dots, interest world, badge chips.

## 21st.dev — https://21st.dev

- Owned components, not a runtime dependency. Stat tiles are label + large value + hint. Buttons are tall, soft, and obvious.
- Parent KPI cards and the child continue / create actions follow that: big type, one job per card, token colours rather than a new theme.

## React Bits — https://reactbits.dev

Light versions only. The demo must stay fast and respect reduced motion.

- [Fade Content](https://reactbits.dev/animations/fade-content): short fade-up on home, session, stories, and parent panels (already `fadeUp`, ~0.35s).
- [Count Up](https://reactbits.dev/text-animations/count-up): `CountUp` on numeric parent KPIs and the star total. Reduced motion jumps to the final number.
- [Spotlight Card](https://reactbits.dev/components/spotlight-card): a soft radial highlight on parent stat cards and home quick cards. No WebGL.
- Click-spark and heavy shaders are skipped. Ages 5–7 need a clear button, not particles.

## Rules

- Warm pastels (peach, cream, lilac, mint). Large hit targets.
- Interest worlds and original mascots only. No Disney or other licensed characters.
- Parent copy stays non-clinical.
