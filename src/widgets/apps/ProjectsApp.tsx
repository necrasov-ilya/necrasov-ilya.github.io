import { repositories } from '../../entities/content/model/repositories';

export function ProjectsApp() {
  const latestRepository = repositories[0];

  return (
    <div className="app-pane">
      <section className="repo-hero">
        <div>
          <div className="eyebrow">РЕПО / GITHUB</div>
          <h2>Репозитории и рабочие наработки</h2>
          <p>
            Окно собирается из GitHub API на этапе синхронизации. Здесь нет захардкоженных карточек: только
            актуальные репозитории, даты пушей и живые ссылки.
          </p>
        </div>

        <div className="repo-stats">
          <article>
            <span>Репозиториев в выдаче</span>
            <strong>{repositories.length}</strong>
          </article>
          <article>
            <span>Последнее обновление</span>
            <strong>{latestRepository?.updatedLabel ?? 'Нет данных'}</strong>
          </article>
          <article>
            <span>Источник</span>
            <strong>GitHub API</strong>
          </article>
        </div>
      </section>

      <section className="repo-grid">
        {repositories.map((repository) => (
          <article className="repo-card" key={repository.id}>
            <div className="repo-card__meta">
              <span>{repository.year}</span>
              <span>{repository.updatedLabel}</span>
            </div>
            <h3>{repository.name}</h3>
            <p>{repository.summary}</p>
            <div className="blog-card__tags">
              {repository.tags.map((tag) => (
                <span key={`${repository.id}-${tag}`}>{tag}</span>
              ))}
            </div>
            <div className="repo-card__links">
              {repository.homepageUrl && (
                <a href={repository.homepageUrl} rel="noreferrer" target="_blank">
                  Демо
                </a>
              )}
              <a href={repository.repositoryUrl} rel="noreferrer" target="_blank">
                Код
              </a>
            </div>
          </article>
        ))}
      </section>
    </div>
  );
}
