import { useEffect, useState } from 'react';
import { collectSystemSnapshot } from '../../entities/system/model/collectSystemSnapshot';
import type {
  SystemDetailEntry,
  SystemSnapshot,
  SystemTabId,
} from '../../entities/system/model/types';

const tabs: Array<{ id: SystemTabId; label: string }> = [
  { id: 'overview', label: 'Обзор' },
  { id: 'browser', label: 'Браузер' },
  { id: 'system', label: 'Система' },
];

function DetailList({ entries }: { entries: SystemDetailEntry[] }) {
  return (
    <div className="system-detail-list">
      {entries.map((entry) => (
        <article className="system-detail" key={entry.label}>
          <span>{entry.label}</span>
          <strong>{entry.value}</strong>
        </article>
      ))}
    </div>
  );
}

export function SystemApp() {
  const [activeTab, setActiveTab] = useState<SystemTabId>('overview');
  const [snapshot, setSnapshot] = useState<SystemSnapshot | null>(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let isMounted = true;

    collectSystemSnapshot()
      .then((nextSnapshot) => {
        if (!isMounted) {
          return;
        }

        setSnapshot(nextSnapshot);
      })
      .catch(() => {
        if (!isMounted) {
          return;
        }

        setHasError(true);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  if (hasError) {
    return (
      <div className="app-pane">
        <section className="empty-card">
          <div className="eyebrow">СИСТЕМА / OFFLINE</div>
          <h2>Не удалось собрать системный снимок</h2>
          <p>
            В этом окне используются только браузерные API. Похоже, часть доступа или инициализации
            сейчас недоступна.
          </p>
        </section>
      </div>
    );
  }

  if (!snapshot) {
    return (
      <div className="app-pane">
        <section className="empty-card">
          <div className="eyebrow">СИСТЕМА / СБОР</div>
          <h2>Собираю мини-паспорт окружения</h2>
          <p>Сканирую браузер, устройство и поддержку ключевых веб-возможностей.</p>
        </section>
      </div>
    );
  }

  return (
    <div className="app-pane">
      <section className="system-hero">
        <div className="system-hero__copy">
          <div className="eyebrow">ЭТО ТЫ / ПАСПОРТ</div>
          <h2>Браузер, железо и процент живых возможностей прямо в текущем окне.</h2>
          <p>
            Снимок собирается локально на клиенте и показывает не абстрактные характеристики, а
            реальное окружение, в котором открыт сайт сейчас.
          </p>
        </div>

        <div className="system-stat-grid">
          <article className="stat-card">
            <span>ID устройства</span>
            <strong>{snapshot.deviceId}</strong>
          </article>
          <article className="stat-card">
            <span>Поддержка API</span>
            <strong>
              {snapshot.supportPercent}% · {snapshot.supportedCount}/{snapshot.totalFeatures}
            </strong>
          </article>
          <article className="stat-card">
            <span>Уровень подозрительности UA</span>
            <strong>{snapshot.suspicion.label}</strong>
          </article>
          <article className="stat-card">
            <span>Текущий профиль</span>
            <strong>{snapshot.overview[0]?.value}</strong>
          </article>
        </div>
      </section>

      <section className="system-panel">
        <div className="system-panel__head">
          <div className="system-tabs" role="tablist" aria-label="Вкладки системного паспорта">
            {tabs.map((tab) => (
              <button
                aria-selected={activeTab === tab.id}
                className={`system-tab ${activeTab === tab.id ? 'is-active' : ''}`}
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                role="tab"
                type="button"
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className={`system-suspicion system-suspicion--${snapshot.suspicion.tone}`}>
            <span>UA</span>
            <strong>{snapshot.suspicion.label}</strong>
            <p>{snapshot.suspicion.summary}</p>
          </div>
        </div>

        {activeTab === 'overview' && (
          <div className="system-panel__body system-panel__body--overview">
            <DetailList entries={snapshot.overview} />

            <section className="system-feature-columns">
              <article className="system-feature-card">
                <div className="eyebrow">ПОДДЕРЖИВАЕТСЯ</div>
                <h3>Сильная сторона окружения</h3>
                <div className="chip-list">
                  {snapshot.supportedFeatures.slice(0, 12).map((feature) => (
                    <span className="chip" key={feature.id}>
                      {feature.label}
                    </span>
                  ))}
                </div>
              </article>

              <article className="system-feature-card">
                <div className="eyebrow">НЕ ХВАТАЕТ</div>
                <h3>Пробелы в среде</h3>
                <div className="chip-list">
                  {snapshot.missingFeatures.length > 0 ? (
                    snapshot.missingFeatures.slice(0, 8).map((feature) => (
                      <span className="chip chip--muted" key={feature.id}>
                        {feature.label}
                      </span>
                    ))
                  ) : (
                    <span className="chip">Почти полный профиль</span>
                  )}
                </div>
              </article>
            </section>
          </div>
        )}

        {activeTab === 'browser' && (
          <div className="system-panel__body">
            <DetailList entries={snapshot.browser} />
          </div>
        )}

        {activeTab === 'system' && (
          <div className="system-panel__body">
            <DetailList entries={snapshot.system} />
          </div>
        )}
      </section>
    </div>
  );
}
