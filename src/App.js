import { useState } from 'react';

function Square({value, onSquareClick, isWinning}) {
  return (
    <button 
      className={`square ${isWinning ? 'winning-square' : ''}`} 
      onClick={onSquareClick}
    >
      {value}
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
  
  let status;
  if (winner) {
    status = "Winner: " + winner;
  } else if (squares.every(square => square !== null)) {
    status = "Draw! No one wins.";
  } else {
    status = "Next Player: " + (xIsNext ? "x" : "o");
  }

  // Use loops to create the board
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
      <div className="status">{status}</div>
      {board}
    </>
  );  
}

export default function Game() {
  const [history, setHistory] = useState([{squares: Array(9).fill(null), location: null}]);
  const [currentMove, setCurrentMove] = useState(0);
  const [isAscending, setIsAscending] = useState(true);
  const xIsNext = currentMove % 2 === 0;
  const currentSquares = history[currentMove].squares;

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

  const moves = history.map((step, move) => {
    let description;
    if (move > 0) {
      const {row, col} = step.location;
      description = `Go to move #${move} (${row}, ${col})`;
    } else {
      description = 'Go to game start';
    }
    
    // Show current move as text instead of button
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

  // Sort moves based on toggle
  const sortedMoves = isAscending ? moves : moves.slice().reverse();

  return (
    <div className="game">
      <div className="game-board">
        <Board xIsNext={xIsNext} squares={currentSquares} onPlay={handlePlay} />
      </div>
      <div className="game-info">
        <button onClick={toggleSort}>
          Sort: {isAscending ? 'Ascending ↑' : 'Descending ↓'}
        </button>
        <ol>{sortedMoves}</ol>
      </div>
    </div>
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