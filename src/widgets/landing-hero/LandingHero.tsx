import { motion } from 'framer-motion';
import { galleryAssets } from '../../entities/application/model/profile';
import './LandingHero.css';

interface LandingHeroProps {
  onOpenDesktop: () => void;
}

export function LandingHero({ onOpenDesktop }: LandingHeroProps) {
  return (
    <section className="landing-hero" data-hero-lock="true">
      <div className="landing-hero__body">
        <motion.div
          className="landing-hero__copy"
          initial={{ opacity: 0, y: 22 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.72, ease: [0.22, 1, 0.36, 1], delay: 0.08 }}
        >
          <h1 className="landing-hero__title">
            <span className="landing-hero__title-line">Привет, я</span>
            <span className="landing-hero__title-line landing-hero__title-line--outline">
              Илья Некрасов
            </span>
          </h1>
          <p className="landing-hero__lead">Фронтенд веб разработчик живущий в России</p>

          <div className="landing-hero__actions">
            <button className="landing-hero__cta" onClick={() => onOpenDesktop()} type="button">
              <span>Посмотреть больше</span>
              <span aria-hidden="true" className="landing-hero__cta-arrow">
                →
              </span>
            </button>
          </div>
        </motion.div>

        <motion.img
          alt=""
          aria-hidden="true"
          animate={{ opacity: 0.1, y: [0, -8, 0] }}
          className="landing-hero__silhouette"
          initial={{ opacity: 0, y: 0 }}
          src={galleryAssets.heroSilhouette}
          transition={{
            opacity: { duration: 0.9, ease: [0.22, 1, 0.36, 1], delay: 0.18 },
            y: { duration: 9, ease: 'easeInOut', repeat: Infinity },
          }}
          whileHover={{
            opacity: 0.96,
            filter: 'drop-shadow(0 0 24px rgba(255, 255, 255, 0.16))',
          }}
        />
      </div>
    </section>
  );
}
