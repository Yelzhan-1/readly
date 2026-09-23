import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useT, useI18n } from '../i18n/index.jsx';
import { useApp } from '../store/AppContext.jsx';
import Button from '../components/ui/Button.jsx';
import LanguageSelector from '../components/ui/LanguageSelector.jsx';
import { Logo, DinoMascot } from '../components/ui/Mascots.jsx';

export default function Landing() {
  const t = useT();
  const { lang } = useI18n();
  const { profile } = useApp();
  const navigate = useNavigate();

  const start = () => navigate('/profiles');
  const parent = () => navigate('/parent');

  return (
    <div className="landing page-enter" key={lang}>
      <div className="container">
        <header className="landing__bar">
          <Logo />
          <div className="row">
            <LanguageSelector compact />
            <Button variant="ghost" size="sm" onClick={parent}>
              🔒 {t('common.forParent')}
            </Button>
          </div>
        </header>

        <section className="landing__hero">
          <div>
            <div className="landing__kicker">{t('landing.kicker')}</div>
            <h1 className="landing__title">
              {t('landing.headlineA')} <em>{t('landing.headlineEm')}</em>{' '}
              {t('landing.headlineB')}
            </h1>
            <p className="landing__sub">{t('landing.sub')}</p>
            <div className="landing__cta">
              <Button variant="primary" size="lg" onClick={start}>
                🚀 {t('landing.ctaStart')}
              </Button>
              <Button variant="ghost" size="lg" onClick={parent}>
                👨‍👩‍👧 {t('landing.ctaParent')}
              </Button>
            </div>
            <div className="landing__trust">
              <span>{t('landing.trust1')}</span>
              <span>{t('landing.trust2')}</span>
              <span>{t('landing.trust3')}</span>
            </div>
          </div>

          <div className="hero-art" aria-hidden="true">
            <span className="hero-float hero-float--a">{t('landing.floatA')}</span>
            <span className="hero-float hero-float--b">{t('landing.floatB')}</span>
            <span className="hero-float hero-float--c">{t('landing.floatC')}</span>
            <div className="hero-art__scene">
              <div
                className="card"
                style={{ padding: 22, marginBottom: 16, transform: 'rotate(-1.5deg)' }}
              >
                <div className="row" style={{ gap: 14, marginBottom: 10 }}>
                  <span
                    style={{
                      width: 44,
                      height: 44,
                      borderRadius: 14,
                      background: 'var(--sun-soft)',
                      display: 'grid',
                      placeItems: 'center',
                      fontSize: '1.4rem',
                    }}
                  >
                    📖
                  </span>
                  <strong style={{ fontFamily: 'var(--font-display)' }}>{t('landing.heroTitle')}</strong>
                </div>
                <p
                  style={{
                    margin: 0,
                    fontFamily: 'var(--font-display)',
                    fontSize: '1.15rem',
                    lineHeight: 1.5,
                    color: 'var(--ink)',
                  }}
                >
                  {t('landing.heroLine')}
                </p>
              </div>
              <div
                className="card card--soft"
                style={{ padding: 16, transform: 'rotate(1.5deg)' }}
              >
                <div className="row" style={{ gap: 10 }}>
                  <div className="progress progress--teal" style={{ flex: 1 }}>
                    <div className="progress__fill" style={{ width: '78%' }} />
                  </div>
                  <strong style={{ fontFamily: 'var(--font-display)', color: 'var(--teal)' }}>
                    +10 ⭐
                  </strong>
                </div>
              </div>
              <div style={{ display: 'grid', placeItems: 'center', marginTop: 6 }}>
                <DinoMascot size={130} />
              </div>
            </div>
          </div>
        </section>

        <section className="landing__strip">
          <div>
            <div className="num">01</div>
            <h3>{t('landing.stripObserve')}</h3>
            <p>{t('landing.stripObserveD')}</p>
          </div>
          <div>
            <div className="num">02</div>
            <h3>{t('landing.stripAdapt')}</h3>
            <p>{t('landing.stripAdaptD')}</p>
          </div>
          <div>
            <div className="num">03</div>
            <h3>{t('landing.stripGrow')}</h3>
            <p>{t('landing.stripGrowD')}</p>
          </div>
        </section>
      </div>

      <footer className="container" style={{ paddingBottom: 30 }}>
        <p className="small muted center" style={{ margin: 0 }}>
          Readly · {profile ? `${profile.name} · ` : ''}
          {t('common.demoMode')} · PIN 1234
        </p>
      </footer>
    </div>
  );
}
