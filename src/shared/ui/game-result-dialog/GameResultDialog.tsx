type GameResultStat = {
  label: string;
  value: string;
};

type GameResultDialogProps = {
  actionLabel?: string;
  description: string;
  eyebrow?: string;
  isOpen: boolean;
  onRestart: () => void;
  stats?: GameResultStat[];
  title: string;
};

export function GameResultDialog({
  actionLabel = 'Начать заново',
  description,
  eyebrow = 'Раунд завершён',
  isOpen,
  onRestart,
  stats = [],
  title,
}: GameResultDialogProps) {
  if (!isOpen) {
    return null;
  }

  return (
    <div className="game-result-backdrop" role="presentation">
      <section
        aria-describedby="game-result-description"
        aria-labelledby="game-result-title"
        aria-modal="true"
        className="game-result-dialog"
        role="dialog"
      >
        <div className="eyebrow">{eyebrow}</div>
        <h3 id="game-result-title">{title}</h3>
        <p id="game-result-description">{description}</p>

        {stats.length > 0 ? (
          <div className="game-result-stats">
            {stats.map((stat) => (
              <article className="game-result-stat" key={stat.label}>
                <span>{stat.label}</span>
                <strong>{stat.value}</strong>
              </article>
            ))}
          </div>
        ) : null}

        <button className="ghost-button game-result-dialog__action" onClick={onRestart} type="button">
          {actionLabel}
        </button>
      </section>
    </div>
  );
}
