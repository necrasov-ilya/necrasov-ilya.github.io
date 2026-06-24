import { useRef } from 'react';
import { useDesktopManager } from '../../features/desktop-manager/model/useDesktopManager';
import type { AppId } from '../../shared/types/desktop';
import './PortfolioApp.css';

type PortfolioSectionId = 'portfolio-hero' | 'portfolio-about' | 'portfolio-contacts';

const technologies = [
  'TypeScript',
  'Python',
  'React',
  'Node.js',
  'Qdrant',
  'OpenSearch',
  'LangChain',
];

export function PortfolioApp() {
  const { openApp } = useDesktopManager();
  const pageRef = useRef<HTMLDivElement | null>(null);

  function scrollToSection(sectionId: PortfolioSectionId) {
    pageRef.current?.querySelector<HTMLElement>(`#${sectionId}`)?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }

  function launchApp(appId: AppId) {
    openApp(appId);

    window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => {
        document
          .querySelector<HTMLElement>(`.window-shell[data-app-id="${appId}"]`)
          ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      });
    });
  }

  return (
    <div className="portfolio-page" ref={pageRef}>
      <main>
        <section className="portfolio-section portfolio-hero" id="portfolio-hero">
          <div className="portfolio-container portfolio-hero-layout">
            <article className="portfolio-hero-avatar-box">
              <img
                alt="Силуэт Ильи Некрасова"
                className="portfolio-hero-avatar"
                src="/media/portfolio/avatar.png"
              />
              <div className="portfolio-hero-avatar-foot">
                <span aria-hidden="true" className="material-symbols-outlined">verified</span>
                <p>GenAI Application Engineer + Frontend Engineer</p>
              </div>
            </article>

            <article className="portfolio-panel portfolio-hero-intro">
              <img
                alt="NKSV"
                className="portfolio-hero-logo"
                src="/media/hero/logo/logo-nksv-filled.svg"
              />
              <p className="portfolio-hero-subtitle">
                RAG-системы, агентные сценарии и интеграция AI-логики в существующие
                веб-продукты.
              </p>
              <ul className="portfolio-hero-highlights">
                <li>
                  <span aria-hidden="true" className="material-symbols-outlined">terminal</span>
                  RAG-системы
                </li>
                <li>
                  <span aria-hidden="true" className="material-symbols-outlined">auto_graph</span>
                  AI-агенты
                </li>
                <li>
                  <span aria-hidden="true" className="material-symbols-outlined">
                    dashboard_customize
                  </span>
                  Frontend-интеграция в продукт
                </li>
              </ul>
              <div className="portfolio-hero-actions">
                <button className="portfolio-button" onClick={() => launchApp('projects')} type="button">
                  Смотреть проекты
                </button>
                <button
                  className="portfolio-button portfolio-button--ghost"
                  onClick={() => scrollToSection('portfolio-contacts')}
                  type="button"
                >
                  Связаться
                </button>
              </div>
            </article>
          </div>
        </section>

        <section className="portfolio-section portfolio-about" id="portfolio-about">
          <div className="portfolio-container">
            <div className="portfolio-section-head">
              <p className="portfolio-eyebrow">Обо мне</p>
              <h2 className="portfolio-section-title">
                <span aria-hidden="true" className="material-symbols-outlined">face</span>
                Обо мне
              </h2>
            </div>

            <div className="portfolio-about-bento">
              <article className="portfolio-panel portfolio-about-card portfolio-about-main">
                <h3>GenAI Application Engineer + Frontend</h3>
                <p>
                  Работаю на пересечении двух сфер. Строю RAG-системы, агентные сценарии и
                  пайплайны для AI-функций. Параллельно пишу клиентскую часть, интерфейсы и UX.
                  Сильная база в обоих направлениях позволяет вести связку от прототипа до
                  продакшена и аккуратно встраивать AI-логику в существующий сервис.
                </p>
              </article>

              <article className="portfolio-panel portfolio-about-card portfolio-about-focus">
                <h3>Что в фокусе</h3>
                <ul>
                  <li>RAG и retrieval-пайплайны</li>
                  <li>Агентные сценарии и работа с инструментами</li>
                  <li>Интерфейсы для внутренних систем</li>
                </ul>
              </article>

              <article className="portfolio-panel portfolio-about-card portfolio-about-stack">
                <h3>Технологии</h3>
                <ul className="portfolio-chip-list">
                  {technologies.map((technology) => (
                    <li key={technology}>{technology}</li>
                  ))}
                </ul>
              </article>

              <article className="portfolio-panel portfolio-about-card portfolio-about-now">
                <h3>UX/UI опыт</h3>
                <p>
                  Долгий практический опыт в UX/UI-дизайне: сценарии, прототипы, структура
                  интерфейсов и визуальные системы.
                </p>
              </article>
            </div>
          </div>
        </section>

        <section className="portfolio-section portfolio-contacts" id="portfolio-contacts">
          <div className="portfolio-container">
            <div className="portfolio-section-head portfolio-section-head--dark">
              <p className="portfolio-eyebrow">Контакты</p>
              <h2 className="portfolio-section-title">
                <span aria-hidden="true" className="material-symbols-outlined">alternate_email</span>
                Контакты
              </h2>
              <p className="portfolio-section-lead">Каналы связи.</p>
            </div>

            <div className="portfolio-contacts-bento">
              <article className="portfolio-panel-dark portfolio-contacts-main">
                <h3>Связь</h3>
                <p>Почта для рабочих и личных сообщений.</p>
                <a className="portfolio-button" href="mailto:ilya.e.nekrasov@yandex.ru">
                  ilya.e.nekrasov@yandex.ru
                </a>
              </article>

              <article className="portfolio-panel-dark portfolio-contact-item">
                <h3>
                  <span aria-hidden="true" className="material-symbols-outlined">code</span>
                  GitHub
                </h3>
                <a href="https://github.com/necrasov-ilya" rel="noreferrer" target="_blank">
                  necrasov-ilya
                </a>
              </article>

              <article className="portfolio-panel-dark portfolio-contact-item">
                <h3>
                  <span aria-hidden="true" className="material-symbols-outlined">send</span>
                  Telegram
                </h3>
                <a href="https://t.me/NKSV_ILYA" rel="noreferrer" target="_blank">
                  @NKSV_ILYA
                </a>
              </article>

              <article className="portfolio-panel-dark portfolio-contact-item">
                <h3>
                  <span aria-hidden="true" className="material-symbols-outlined">article</span>
                  Мой блог
                </h3>
                <button onClick={() => launchApp('blog')} type="button">Открыть блог</button>
              </article>
            </div>
          </div>
        </section>
      </main>

      <footer className="portfolio-footer">
        <div className="portfolio-container">
          <p>© {new Date().getFullYear()} Ilya Necrasov.</p>
        </div>
      </footer>
    </div>
  );
}
