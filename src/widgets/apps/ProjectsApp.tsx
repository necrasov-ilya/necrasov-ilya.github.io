const projectCards = [
  {
    label: '01 / Product shells',
    title: 'Desktop-like interfaces that feel tactile',
    text: 'Люблю интерфейсы, в которых у пользователя есть чувство среды: окна, фокус, иерархия, слои и живые состояния вместо плоского лендинга.',
  },
  {
    label: '02 / ML experience',
    title: 'Model-aware flows, not just model-powered labels',
    text: 'Проектирую сценарии так, чтобы ML становился частью UX: подсказка, confidence, iterative output, provenance и понятная обратная связь.',
  },
  {
    label: '03 / Design engineering',
    title: 'From visual direction to implementation details',
    text: 'Сильный вкус в интерфейсе имеет смысл только тогда, когда он доживает до продакшена: токены, motion, responsive logic и аккуратная архитектура.',
  },
];

const pipeline = [
  'Discover: раскладываю задачу на сигналы пользователя, ограничения и продуктовые риски.',
  'Shape: собираю визуальную систему, mood и интеракции, чтобы интерфейс имел собственный ритм.',
  'Build: переношу это в код, не ломая структуру проекта и не превращая всё в монолит.',
  'Refine: тестирую поток, читаемость, поведение состояний и ощущение от продукта как среды.',
];

export function ProjectsApp() {
  return (
    <div className="app-pane">
      <section className="stacked-grid">
        {projectCards.map((card) => (
          <article className="glass-card glass-card--accent" key={card.title}>
            <div className="eyebrow">{card.label}</div>
            <h2>{card.title}</h2>
            <p>{card.text}</p>
          </article>
        ))}
      </section>

      <section className="timeline-card">
        <div className="eyebrow">Workflow</div>
        <h2>Как я обычно довожу идею до рабочего интерфейса</h2>
        <div className="timeline-list">
          {pipeline.map((step) => (
            <div className="timeline-item" key={step}>
              {step}
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
