import { galleryAssets } from '../../entities/application/model/profile';

export function GalleryApp() {
  return (
    <div className="app-pane">
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
