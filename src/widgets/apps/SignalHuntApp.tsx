import { useEffect, useState } from 'react';

const GRID_SIZE = 16;
const ROUND_TIME = 20;

function randomCellIndex() {
  return Math.floor(Math.random() * GRID_SIZE);
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
      <div className="game-header">
        <div>
          <div className="eyebrow">GAME / SIGNAL HUNT</div>
          <h2>Поймай активный сигнал до того, как он уйдёт</h2>
        </div>
        <button className="ghost-button" onClick={startRound} type="button">
          {isRunning ? 'Перезапуск' : 'Старт'}
        </button>
      </div>

      <div className="score-strip">
        <span>Счёт: {score}</span>
        <span>Лучший: {bestScore}</span>
        <span>Таймер: {timeLeft}s</span>
      </div>

      <div className="signal-grid">
        {Array.from({ length: GRID_SIZE }, (_, index) => (
          <button
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
  );
}
