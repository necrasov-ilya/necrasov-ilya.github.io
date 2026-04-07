import { useEffect, useState } from 'react';

import { GameResultDialog } from '../../shared/ui/game-result-dialog/GameResultDialog';

const GRID_SIZE = 16;
const ROUND_TIME = 20;

type RoundResult = {
  description: string;
  title: string;
};

function randomCellIndex() {
  return Math.floor(Math.random() * GRID_SIZE);
}

function getRoundResult(score: number, bestScore: number): RoundResult {
  if (score === 0) {
    return {
      title: 'Сигнал ушёл',
      description: 'Ты не успел поймать ни одной активной плитки. Хочешь сразу запустить новый раунд?',
    };
  }

  if (score >= bestScore) {
    return {
      title: 'Новый лучший результат',
      description: `Ты поймал ${score} сигнал${score === 1 ? '' : score < 5 ? 'а' : 'ов'}. Запустить ещё один раунд?`,
    };
  }

  return {
    title: 'Раунд завершён',
    description: `Ты поймал ${score} сигнал${score === 1 ? '' : score < 5 ? 'а' : 'ов'}. Хочешь попробовать улучшить результат?`,
  };
}

export function SignalHuntApp() {
  const [game, setGame] = useState({
    score: 0,
    timeLeft: ROUND_TIME,
    activeIndex: null as number | null,
    isRunning: false,
    bestScore: 0,
  });

  const { score, timeLeft, activeIndex, isRunning, bestScore } = game;
  const roundResult = !isRunning && timeLeft === 0 ? getRoundResult(score, bestScore) : null;
  const phaseLabel = isRunning
    ? 'Раунд идёт.'
    : timeLeft === 0
      ? 'Раунд завершён.'
      : 'Ждёт запуска.';

  useEffect(() => {
    if (!isRunning) {
      return;
    }

    const timerId = window.setInterval(() => {
      setGame((current) => {
        if (current.timeLeft <= 1) {
          window.clearInterval(timerId);
          return {
            ...current,
            timeLeft: 0,
            isRunning: false,
            activeIndex: null,
            bestScore: Math.max(current.bestScore, current.score),
          };
        }

        return {
          ...current,
          timeLeft: current.timeLeft - 1,
        };
      });
    }, 1000);

    return () => window.clearInterval(timerId);
  }, [isRunning]);

  useEffect(() => {
    if (!isRunning) {
      return;
    }

    const tickId = window.setInterval(() => {
      setGame((current) =>
        current.isRunning
          ? {
              ...current,
              activeIndex: randomCellIndex(),
            }
          : current,
      );
    }, 650);

    return () => window.clearInterval(tickId);
  }, [isRunning]);

  function startRound() {
    setGame((current) => ({
      ...current,
      score: 0,
      timeLeft: ROUND_TIME,
      activeIndex: randomCellIndex(),
      isRunning: true,
    }));
  }

  function handleCellClick(index: number) {
    if (!isRunning || activeIndex !== index) {
      return;
    }

    setGame((current) => ({
      ...current,
      score: current.score + 1,
      activeIndex: randomCellIndex(),
    }));
  }

  return (
    <div className="app-pane app-pane--game">
      <div className="game-shell game-shell--signal">
        <section className="game-main">
          <div className="game-header">
            <div className="eyebrow">Игра / Сигнал</div>
            <h2>Лови активную плитку вовремя</h2>
            <p className="game-copy">
              <strong>{phaseLabel}</strong> Активный сигнал прыгает по сетке каждые 650 мс, а раунд длится всего
              {` ${ROUND_TIME} секунд.`}
            </p>
          </div>

          <div className="game-board-wrap">
            <div className="signal-grid">
              {Array.from({ length: GRID_SIZE }, (_, index) => (
                <button
                  aria-label={activeIndex === index ? `Активная клетка ${index + 1}` : `Пустая клетка ${index + 1}`}
                  className={`signal-cell ${activeIndex === index ? 'is-active' : ''}`}
                  key={index}
                  onClick={() => handleCellClick(index)}
                  type="button"
                >
                  <span />
                </button>
              ))}
            </div>
          </div>
        </section>

        <aside className="game-sidebar">
          <button className="ghost-button" onClick={startRound} type="button">
            {isRunning ? 'Перезапуск' : 'Старт'}
          </button>

          <div className="score-strip score-strip--stacked">
            <span>Счёт: {score}</span>
            <span>Лучший: {bestScore}</span>
            <span>Таймер: {timeLeft}s</span>
          </div>

          <div className="game-note">
            Жми только по активной плитке. Как только таймер заканчивается, раунд закрывается и предлагает перезапуск.
          </div>
        </aside>

        <GameResultDialog
          actionLabel="Ещё раунд"
          description={roundResult?.description ?? ''}
          eyebrow="Раунд / Сигнал"
          isOpen={Boolean(roundResult)}
          onRestart={startRound}
          stats={[
            { label: 'Счёт', value: String(score) },
            { label: 'Лучший', value: String(bestScore) },
          ]}
          title={roundResult?.title ?? ''}
        />
      </div>
    </div>
  );
}
