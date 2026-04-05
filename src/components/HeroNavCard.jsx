import { AnimatePresence, motion } from 'framer-motion';

const cardTransition = {
  type: 'spring',
  stiffness: 250,
  damping: 26,
  mass: 0.72,
};

const detailsTransition = {
  duration: 0.36,
  ease: [0.22, 1, 0.36, 1],
};

const baseSurface = '#2E2E2E';

const materialIconPaths = {
  person:
    'M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z',
  grid_view:
    'M3 3h8v8H3V3zm10 0h8v8h-8V3zM3 13h8v8H3v-8zm10 0h8v8h-8v-8z',
  mail_outline:
    'M20 4H4c-1.1 0-2 .9-2 2l.01 12c0 1.1.89 2 1.99 2H20c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z',
};

function HeroNavIcon({ name }) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
      <path d={materialIconPaths[name]} />
    </svg>
  );
}

function HeroNavCard({ item, isActive, onActivate, onNavigate }) {
  return (
    <motion.button
      layout
      type="button"
      className={`hero-nav-card ${isActive ? 'is-active' : ''}`}
      style={{
        '--card-text': '#f7f2f5',
      }}
      animate={{
        flexGrow: isActive ? 1.52 : 0.88,
        height: isActive ? 284 : 112,
        backgroundColor: isActive ? item.surface : baseSurface,
        y: isActive ? -10 : 0,
        scale: isActive ? 1.01 : 0.99,
      }}
      transition={cardTransition}
      onMouseEnter={() => onActivate(item.id)}
      onFocus={() => onActivate(item.id)}
      onPointerLeave={() => onActivate(null)}
      onClick={() => onNavigate(item)}
      aria-expanded={isActive}
      aria-controls={item.id}
    >
      <span className="hero-nav-card__border" aria-hidden="true" />

      <motion.div
        className="hero-nav-card__stack"
        layout
        animate={{ y: isActive ? 0 : 8 }}
        transition={cardTransition}
      >
        <motion.div className="hero-nav-card__header" layout="position">
          <div className="hero-nav-card__badge" aria-hidden="true">
            <span className="hero-nav-card__icon">
              <HeroNavIcon name={item.icon} />
            </span>
          </div>

          <motion.div className="hero-nav-card__copy" layout="position">
            <span className="hero-nav-card__eyebrow">{item.eyebrow}</span>
            <span className="hero-nav-card__title">{item.title}</span>
          </motion.div>

          <motion.span
            className="hero-nav-card__indicator"
            animate={{ x: isActive ? 0 : -6, opacity: isActive ? 1 : 0.44 }}
            transition={detailsTransition}
            aria-hidden="true"
          >
            /
          </motion.span>
        </motion.div>

        <AnimatePresence initial={false}>
          {isActive && (
            <motion.div
              className="hero-nav-card__details"
              key={`${item.id}-details`}
              layout
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 14 }}
              transition={detailsTransition}
            >
              <p className="hero-nav-card__description">{item.description}</p>

              <div className="hero-nav-card__pills" aria-hidden="true">
                {item.pills.map((pill) => (
                  <span key={pill} className="hero-nav-card__pill">
                    {pill}
                  </span>
                ))}
              </div>

              <motion.span
                className="hero-nav-card__action"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 8 }}
                transition={{ ...detailsTransition, delay: 0.04 }}
              >
                {item.actionLabel}
              </motion.span>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.button>
  );
}

export default HeroNavCard;
