import { useState, useEffect } from 'react';
import Confetti from 'react-confetti';

function XMark() {
  return (
    <svg viewBox="0 0 50 50" className="mark mark-x">
      <line x1="10" y1="10" x2="40" y2="40" className="x-line x-line-1" />
      <line x1="40" y1="10" x2="10" y2="40" className="x-line x-line-2" />
    </svg>
  );
}

function OMark() {
  return (
    <svg viewBox="0 0 50 50" className="mark mark-o">
      <circle cx="25" cy="25" r="15" className="o-circle" />
    </svg>
  );
}

function Square({value, onSquareClick, isWinning}) {
  return (
    <button
      className={`square ${isWinning ? 'winning-square' : ''}`}
      onClick={onSquareClick}
    >
      {value === 'x' && <XMark />}
      {value === 'o' && <OMark />}
    </button>
  );
}

function Board({ xIsNext, squares, onPlay }) {
  function handleClick(i){
    if (calculateWinner(squares) || squares[i]) {
      return;
    }
    const nextSquares = squares.slice();
    if (xIsNext) {
      nextSquares[i] = 'x';
    } else {
      nextSquares[i] = 'o';
    }
    onPlay(nextSquares, i); 
  }

  const winnerInfo = calculateWinner(squares);
  const winner = winnerInfo ? winnerInfo.winner : null;
  const winningLine = winnerInfo ? winnerInfo.line : [];
  const isDraw = !winner && squares.every(square => square !== null);

  let status;
  let statusClass = 'status';
  if (winner) {
    status = `Winner: ${winner.toUpperCase()}!`;
    statusClass = 'status status-win';
  } else if (isDraw) {
    status = "It's a Draw!";
    statusClass = 'status status-draw';
  } else {
    status = "Next Player: " + (xIsNext ? "X" : "O");
  }

  const board = [];
  for (let row = 0; row < 3; row++) {
    const boardRow = [];
    for (let col = 0; col < 3; col++) {
      const index = row * 3 + col;
      boardRow.push(
        <Square 
          key={index}
          value={squares[index]} 
          onSquareClick={() => handleClick(index)}
          isWinning={winningLine.includes(index)}
        />
      );
    }
    board.push(
      <div key={row} className="board-row">
        {boardRow}
      </div>
    );
  }

  return (
    <>
      <div className={statusClass}>{status}</div>
      {board}
    </>
  );  
}

export default function Game() {
  const [history, setHistory] = useState([{squares: Array(9).fill(null), location: null}]);
  const [currentMove, setCurrentMove] = useState(0);
  const [isAscending, setIsAscending] = useState(true);
  const [showConfetti, setShowConfetti] = useState(false);
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight
  });

  const xIsNext = currentMove % 2 === 0;
  const currentSquares = history[currentMove].squares;
  const winnerInfo = calculateWinner(currentSquares);
  const winner = winnerInfo ? winnerInfo.winner : null;

  useEffect(() => {
    function handleResize() {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (winner) {
      setShowConfetti(true);
      const timer = setTimeout(() => setShowConfetti(false), 5000);
      return () => clearTimeout(timer);
    } else {
      setShowConfetti(false);
    }
  }, [winner]);

  function handlePlay(nextSquares, squareIndex) {
    const row = Math.floor(squareIndex / 3);
    const col = squareIndex % 3;
    
    const nextHistory = [
      ...history.slice(0, currentMove + 1), 
      {squares: nextSquares, location: {row, col}}
    ];
    setHistory(nextHistory);
    setCurrentMove(nextHistory.length - 1);
  }

  function jumpTo(nextMove) {
    setCurrentMove(nextMove);
  }

  function toggleSort() {
    setIsAscending(!isAscending);
  }

  function handleNewGame() {
    setHistory([{squares: Array(9).fill(null), location: null}]);
    setCurrentMove(0);
    setShowConfetti(false);
  }

  const moves = history.map((step, move) => {
    let description;
    if (move > 0) {
      const {row, col} = step.location;
      description = `Go to move #${move} (${row}, ${col})`;
    } else {
      description = 'Go to game start';
    }
    
    if (move === currentMove) {
      return (
        <li key={move}> 
          <strong>You are at move #{move}</strong>
        </li>
      );
    }
    
    return (
      <li key={move}> 
        <button onClick={() => jumpTo(move)}>{description}</button>
      </li>
    );
  });

  const sortedMoves = isAscending ? moves : moves.slice().reverse();

  return (
    <>
      {showConfetti && (
        <Confetti
          width={windowSize.width}
          height={windowSize.height}
          colors={['#E8C97A', '#E8ABBC', '#D6CCEB', '#C8E6D4', '#F5DCC8', '#D4919E']}
          numberOfPieces={250}
          gravity={0.15}
          recycle={false}
        />
      )}
      <div className="game">
        <div className="game-board">
          <h1 className="game-title">✨ Tic-Tac-Toe ✨</h1>
          <Board xIsNext={xIsNext} squares={currentSquares} onPlay={handlePlay} />
          <button className="new-game-btn" onClick={handleNewGame}>New Game</button>
        </div>
        <div className="divider" />
        <div className="game-info">
          <button onClick={toggleSort}>
            Sort: {isAscending ? 'Ascending ↑' : 'Descending ↓'}
          </button>
          <h2 className="history-label">Move History</h2>
          <ol>{sortedMoves}</ol>
        </div>
      </div>
    </>
  );
}

function calculateWinner(squares) {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6]
  ];

  for (let i = 0; i < lines.length; i++) {
    const [a, b, c] = lines[i];
    if (squares[a] && squares[a] === squares[b] && squares[a] === squares[c]) {
      return {
        winner: squares[a],
        line: [a, b, c]
      };
    }
  }
  return null;
}