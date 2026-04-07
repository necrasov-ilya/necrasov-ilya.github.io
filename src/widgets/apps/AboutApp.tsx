import { profile } from '../../entities/application/model/profile';

export function AboutApp() {
  return (
    <div className="app-pane app-pane--about">
      <section className="hero-panel">
        <div className="hero-panel__copy">
          <div className="hero-panel__intro">
            <div className="eyebrow">СЕССИЯ / ПРОФИЛЬ</div>
            <div className="hero-kicker">{profile.headline}</div>
            <h1>{profile.name}</h1>
            <p className="hero-copy hero-copy--lead">{profile.intro}</p>
          </div>

          <div className="hero-panel__quick-grid">
            <article className="about-callout">
              <span>Что это</span>
              <strong>Профиль инженера, который соединяет GenAI, продукт и интерфейсы</strong>
            </article>
            <article className="about-callout">
              <span>Где полезен</span>
              <strong>RAG, агентные сценарии, внутренние системы и клиентские AI-функции</strong>
            </article>
            <article className="about-callout">
              <span>Формат работы</span>
              <strong>От идеи и UX-сценария до рабочей интеграции и production-ready frontend</strong>
            </article>
          </div>

          <p className="hero-copy hero-copy--muted">{profile.status}</p>

          <div className="chip-list">
            {profile.focus.map((item) => (
              <span className="chip" key={item}>
                {item}
              </span>
            ))}
          </div>
        </div>

        <aside className="hero-panel__media hero-panel__media--summary">
          <div className="hero-panel__overlay">
            <div className="hero-panel__brand">
              <img alt="NKSV logo" src="/media/hero/logo/logo-nksv-mark-filled.svg" />
              <div>
                <strong>AI-системы и интерфейсы</strong>
                <span>{profile.headline}</span>
              </div>
            </div>

            <div className="hero-panel__links">
              {profile.links.map((link) => (
                <a className="about-link-card" href={link.href} key={link.label} rel="noreferrer" target="_blank">
                  <span>{link.label}</span>
                  <strong>{link.value}</strong>
                </a>
              ))}
            </div>
          </div>
        </aside>
      </section>

      <section className="stat-grid">
        {profile.facts.map((fact) => (
          <article className="stat-card" key={fact.label}>
            <span>{fact.label}</span>
            <strong>{fact.value}</strong>
          </article>
        ))}
      </section>

      <section className="about-section">
        <div className="about-section__head">
          <div className="eyebrow">КАК Я РАБОТАЮ</div>
          <p>Три направления, через которые обычно собирается моя роль в продукте.</p>
        </div>

        <div className="split-grid">
          {profile.workstreams.map((stream) => (
            <article className="glass-card" key={stream.title}>
              <h2>{stream.title}</h2>
              <p>{stream.text}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
