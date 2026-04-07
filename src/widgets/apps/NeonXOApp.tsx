import { useEffect, useState } from 'react';

import { GameResultDialog } from '../../shared/ui/game-result-dialog/GameResultDialog';

type CellValue = 'X' | 'O' | null;

type RoundResult = {
  description: string;
  title: string;
};

const winningLines = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

function getWinner(board: CellValue[]) {
  for (const [a, b, c] of winningLines) {
    if (board[a] && board[a] === board[b] && board[b] === board[c]) {
      return board[a];
    }
  }

  return null;
}

function pickBotMove(board: CellValue[]) {
  for (const [a, b, c] of winningLines) {
    const line = [board[a], board[b], board[c]];

    if (line.filter((value) => value === 'O').length === 2 && line.includes(null)) {
      return [a, b, c][line.indexOf(null)];
    }
  }

  for (const [a, b, c] of winningLines) {
    const line = [board[a], board[b], board[c]];

    if (line.filter((value) => value === 'X').length === 2 && line.includes(null)) {
      return [a, b, c][line.indexOf(null)];
    }
  }

  if (board[4] === null) {
    return 4;
  }

  const priority = [0, 2, 6, 8, 1, 3, 5, 7];
  return priority.find((index) => board[index] === null) ?? -1;
}

function getRoundResult(winner: CellValue, isDraw: boolean): RoundResult | null {
  if (winner === 'X') {
    return {
      title: 'Ты выиграл раунд',
      description: 'Линия собрана раньше модели. Запускаем следующий раунд?',
    };
  }

  if (winner === 'O') {
    return {
      title: 'Раунд за моделью',
      description: 'Модель закрыла линию первой. Хочешь сыграть ещё раз?',
    };
  }

  if (isDraw) {
    return {
      title: 'Ничья',
      description: 'Поле закончилось без победителя. Начать заново?',
    };
  }

  return null;
}

export function NeonXOApp() {
  const [game, setGame] = useState({
    board: Array(9).fill(null) as CellValue[],
    xScore: 0,
    oScore: 0,
  });

  const { board, xScore, oScore } = game;
  const winner = getWinner(board);
  const isDraw = !winner && board.every(Boolean);
  const roundResult = getRoundResult(winner, isDraw);
  const canPlay = !winner && !isDraw;
  const xCount = board.filter((value) => value === 'X').length;
  const oCount = board.filter((value) => value === 'O').length;
  const turnLabel = !canPlay
    ? winner === 'X'
      ? 'Раунд взят тобой.'
      : winner === 'O'
        ? 'Раунд взяла модель.'
        : 'Раунд завершился ничьей.'
    : xCount === oCount
      ? 'Сейчас твой ход.'
      : 'Модель отвечает.';

  useEffect(() => {
    if (!canPlay || xCount !== oCount + 1) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setGame((current) => {
        if (getWinner(current.board)) {
          return current;
        }

        const move = pickBotMove(current.board);

        if (move < 0) {
          return current;
        }

        const next = [...current.board];
        next[move] = 'O';
        const nextWinner = getWinner(next);

        return {
          board: next,
          xScore: current.xScore,
          oScore: current.oScore + (nextWinner === 'O' ? 1 : 0),
        };
      });
    }, 320);

    return () => window.clearTimeout(timeoutId);
  }, [board, canPlay, oCount, xCount]);

  function handleCellClick(index: number) {
    if (!canPlay || board[index] !== null || xCount !== oCount) {
      return;
    }

    setGame((current) => {
      const next = [...current.board];
      next[index] = 'X';
      const nextWinner = getWinner(next);

      return {
        board: next,
        xScore: current.xScore + (nextWinner === 'X' ? 1 : 0),
        oScore: current.oScore,
      };
    });
  }

  function resetBoard() {
    setGame((current) => ({
      ...current,
      board: Array(9).fill(null),
    }));
  }

  return (
    <div className="app-pane app-pane--game">
      <div className="game-shell game-shell--xo">
        <section className="game-main">
          <div className="game-header">
            <div className="eyebrow">Игра / Неон XO</div>
            <h2>Обыграй модель в 3×3</h2>
            <p className="game-copy">
              <strong>{turnLabel}</strong> Ставь <strong>X</strong>, модель отвечает через 320 мс и пытается
              закрыть линию раньше тебя.
            </p>
          </div>

          <div className="game-board-wrap">
            <div className="xo-grid">
              {board.map((cell, index) => (
                <button
                  aria-label={cell ? `Клетка ${index + 1}: ${cell}` : `Поставить X в клетку ${index + 1}`}
                  className={`xo-cell ${cell ? 'is-filled' : ''}`}
                  key={index}
                  onClick={() => handleCellClick(index)}
                  type="button"
                >
                  {cell}
                </button>
              ))}
            </div>
          </div>
        </section>

        <aside className="game-sidebar">
          <button className="ghost-button" onClick={resetBoard} type="button">
            Новый раунд
          </button>

          <div className="score-strip score-strip--stacked">
            <span>Ты: {xScore}</span>
            <span>Модель: {oScore}</span>
          </div>

          <div className="game-note">
            Забирай линию из трёх символов раньше модели. Ничья тоже завершает раунд и сразу переводит тебя к
            перезапуску.
          </div>
        </aside>

        <GameResultDialog
          description={roundResult?.description ?? ''}
          eyebrow="Раунд / Неон XO"
          isOpen={Boolean(roundResult)}
          onRestart={resetBoard}
          stats={[
            { label: 'Ты', value: String(xScore) },
            { label: 'Модель', value: String(oScore) },
          ]}
          title={roundResult?.title ?? ''}
        />
      </div>
    </div>
  );
}
