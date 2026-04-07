const columns = [
  {
    title: 'Frontend Stack',
    items: [
      'React + TypeScript',
      'Vite / modern tooling',
      'State and interaction architecture',
      'Design tokens and motion systems',
      'Responsive layouts without dead zones',
    ],
  },
  {
    title: 'ML Toolkit',
    items: [
      'Prompting and evaluation loops',
      'Embeddings / retrieval mechanics',
      'Prototype orchestration',
      'Human-in-the-loop UX',
      'Interface patterns for generated output',
    ],
  },
  {
    title: 'What matters',
    items: [
      'Readable structure',
      'Clear states and feedback',
      'Strong visual narrative',
      'Performance-aware interactions',
      'Taste that survives implementation',
    ],
  },
];

export function LabApp() {
  return (
    <div className="app-pane">
      <section className="lab-banner">
        <div>
          <div className="eyebrow">LAB / SYSTEM STATUS</div>
          <h2>Designing interfaces that can explain intelligence</h2>
          <p>
            Меня больше всего интересуют продукты, где надо сделать понятным то, что внутри по
            природе нелинейно: поиск, генерация, рекомендации, uncertain output.
          </p>
        </div>
        <div className="lab-meter">
          <span>Context</span>
          <strong>87%</strong>
          <span>Signal clarity</span>
          <strong>94%</strong>
        </div>
      </section>

      <section className="split-grid">
        {columns.map((column) => (
          <article className="glass-card" key={column.title}>
            <div className="eyebrow">{column.title}</div>
            <ul className="feature-list">
              {column.items.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </article>
        ))}
      </section>
    </div>
  );
}
