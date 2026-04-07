import { galleryAssets } from '../../entities/application/model/profile';

export function GalleryApp() {
  return (
    <div className="app-pane">
      <section className="repo-hero">
        <div>
          <div className="eyebrow">МЕДИА / АССЕТЫ</div>
          <h2>Локальный набор визуальных материалов</h2>
          <p>
            Здесь лежат логотипы и hero-стиллы, которые используются в desktop-сцене. Окно нужно,
            чтобы быстро проверить ассеты внутри самого интерфейса.
          </p>
        </div>
      </section>

      <section className="gallery-grid">
        {[...galleryAssets.darkStills, ...galleryAssets.lightStills].map((image) => (
          <figure className="media-card" key={image}>
            <img alt="Hero asset" src={image} />
          </figure>
        ))}
      </section>

      <section className="logo-strip">
        {galleryAssets.logos.map((logo) => (
          <div className="logo-card" key={logo}>
            <img alt="Logo variant" src={logo} />
          </div>
        ))}
      </section>
    </div>
  );
}
