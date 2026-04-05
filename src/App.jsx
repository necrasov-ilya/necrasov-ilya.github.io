import { motion } from 'framer-motion';
import avatar from '../assets/img/avatar.png';
import logo from '../assets/img/logo-avatar.svg';

const reveal = {
  hidden: { opacity: 0, y: 32 },
  visible: (delay = 0) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.75,
      ease: [0.22, 1, 0.36, 1],
      delay,
    },
  }),
};

function App() {
  return (
    <main className="page-shell">
      <div className="page-noise" aria-hidden="true" />
      <motion.header
        className="site-header"
        initial="hidden"
        animate="visible"
        variants={reveal}
      >
        <img className="site-mark" src={logo} alt="Логотип" />
        <span className="site-kicker">portfolio in progress</span>
      </motion.header>

      <section className="hero">
        <motion.div
          className="hero-copy"
          initial="hidden"
          animate="visible"
          custom={0.1}
          variants={reveal}
        >
          <p className="eyebrow">Илья Некрасов</p>
          <h1>Новый сайт-визитка для портфолио и проектов.</h1>
          <p className="hero-text">
            Каркас поднят на React + Vite. Дальше сюда лягут проектные блоки,
            анимационные паттерны и переработанная система интерактивных
            компонентов.
          </p>
          <div className="hero-actions">
            <a className="primary-link" href="#roadmap">
              План сборки
            </a>
            <span className="secondary-link secondary-link--static">
              Спецификация эффекта сохранена в <code>docs/</code>
            </span>
          </div>
        </motion.div>

        <motion.div
          className="hero-portrait"
          initial="hidden"
          animate="visible"
          custom={0.2}
          variants={reveal}
        >
          <div className="portrait-frame">
            <img src={avatar} alt="Портрет Ильи Некрасова" />
          </div>
          <div className="portrait-glow" aria-hidden="true" />
        </motion.div>
      </section>

      <motion.section
        id="roadmap"
        className="roadmap"
        initial="hidden"
        animate="visible"
        custom={0.3}
        variants={reveal}
      >
        <article className="roadmap-card">
          <span className="roadmap-index">01</span>
          <h2>Основа проекта</h2>
          <p>Подняли Vite, React и базовую файловую структуру без Tailwind.</p>
        </article>
        <article className="roadmap-card">
          <span className="roadmap-index">02</span>
          <h2>Библиотека эффектов</h2>
          <p>
            Описали механику активной боковой кнопки как отдельный reusable
            паттерн.
          </p>
        </article>
        <article className="roadmap-card">
          <span className="roadmap-index">03</span>
          <h2>Дальше</h2>
          <p>
            Следующим шагом можно собрать чистую версию `ExpandingSideButton` и
            начать раскладывать hero, проекты и секции портфолио.
          </p>
        </article>
      </motion.section>
    </main>
  );
}

export default App;
