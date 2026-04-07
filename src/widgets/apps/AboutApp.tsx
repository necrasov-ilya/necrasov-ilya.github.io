import { galleryAssets, profile } from '../../entities/application/model/profile';

export function AboutApp() {
  return (
    <div className="app-pane app-pane--about">
      <section className="hero-panel">
        <div className="hero-panel__copy">
          <div className="eyebrow">BOOTED / ABOUT.EXE</div>
          <h1>{profile.name}</h1>
          <p className="hero-copy">{profile.intro}</p>
          <p className="hero-copy hero-copy--muted">{profile.status}</p>
          <div className="chip-list">
            {profile.focus.map((item) => (
              <span className="chip" key={item}>
                {item}
              </span>
            ))}
          </div>
        </div>
        <div className="hero-panel__media">
          <img alt="Hero still" src={galleryAssets.aboutHero} />
          <div className="hero-panel__overlay">
            <img alt="NKSV logo" src="/media/hero/logo/logo-nksv-mark-filled.svg" />
            <span>ML UI Workstation</span>
          </div>
        </div>
      </section>

      <section className="stat-grid">
        {profile.facts.map((fact) => (
          <article className="stat-card" key={fact.label}>
            <span>{fact.label}</span>
            <strong>{fact.value}</strong>
          </article>
        ))}
      </section>

      <section className="split-grid">
        {profile.workstreams.map((stream) => (
          <article className="glass-card" key={stream.title}>
            <div className="eyebrow">{stream.title}</div>
            <p>{stream.text}</p>
          </article>
        ))}
      </section>
    </div>
  );
}
