import { useEffect, useState } from 'react';

type CellValue = 'X' | 'O' | null;

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

export function NeonXOApp() {
  const [game, setGame] = useState({
    board: Array(9).fill(null) as CellValue[],
    xScore: 0,
    oScore: 0,
  });

  const { board, xScore, oScore } = game;

  const winner = getWinner(board);
  const isDraw = !winner && board.every(Boolean);
  const canPlay = !winner && !isDraw;
  const xCount = board.filter((value) => value === 'X').length;
  const oCount = board.filter((value) => value === 'O').length;
  const status = winner
    ? winner === 'X'
      ? 'Раунд за тобой.'
      : 'Модель дожала раунд.'
    : isDraw
      ? 'Ничья. Плотный матч.'
      : xCount === oCount
        ? 'Твой ход. Ставь X.'
        : 'Модель думает...';

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
    if (!canPlay || board[index] !== null) {
      return;
    }

    if (xCount !== oCount) {
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
      <div className="game-header">
        <div>
          <div className="eyebrow">GAME / NEON XO</div>
          <h2>{status}</h2>
        </div>
        <button className="ghost-button" onClick={resetBoard} type="button">
          Новый раунд
        </button>
      </div>

      <div className="score-strip">
        <span>Ты: {xScore}</span>
        <span>Модель: {oScore}</span>
      </div>

      <div className="xo-grid">
        {board.map((cell, index) => (
          <button
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
  );
}
