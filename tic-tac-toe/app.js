// --- Game state ---
let board = Array(9).fill(null); // values: 'X', 'O', or null
let currentPlayer = 'X';
let gameOver = false;
let selectedIndex = 0;

const WIN_LINES = [
  [0,1,2],[3,4,5],[6,7,8], // rows
  [0,3,6],[1,4,7],[2,5,8], // cols
  [0,4,8],[2,4,6]          // diagonals
];

// --- DOM refs ---
const boardEl = document.getElementById('board');
const cells = Array.from(document.querySelectorAll('.cell'));
const statusBannerEl = document.getElementById('statusBanner');
const statusTextEl = document.getElementById('statusText');
const resetBtn = document.getElementById('resetBtn');

function isTypingInField() {
    const el = document.activeElement;
    if (!el) return false;
    const tag = el.tagName?.toLowerCase();
    return tag === 'input' || tag === 'textarea' || el.isContentEditable;
  }

  function setStatus(text, type = 'info') {
    statusTextEl.textContent = text;
  
    // Remove any previous state classes and apply the new one
    statusBannerEl.classList.remove('info', 'win', 'draw');
    statusBannerEl.classList.add(type);
  
    // Small “pop” animation on status changes
    statusBannerEl.classList.remove('pop');
    // trigger reflow so animation restarts
    void statusBannerEl.offsetWidth;
    statusBannerEl.classList.add('pop');
  }
  

function render() {
    cells.forEach((cell, i) => {
      cell.textContent = board[i] ?? '';
      cell.dataset.mark = board[i] ?? '';        
      cell.classList.toggle('disabled', gameOver || board[i] !== null);
  
      // keyboard highlight
      cell.classList.toggle('selected', i === selectedIndex && !gameOver);
  
      // Only clear win highlights during active play (keep visible after game over)
      if (!gameOver) {
        cell.classList.remove('win');
      }
    });
  
    if (!gameOver) {
        setStatus(`Turn: ${currentPlayer}`, 'info');
      }      
  }
  

function checkWinner() {
  for (const [a, b, c] of WIN_LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return { winner: board[a], line: [a, b, c] };
    }
  }
  return null;
}

function isDraw() {
  return board.every(v => v !== null);
}

function moveSelection(dx, dy) {
    const row = Math.floor(selectedIndex / 3);
    const col = selectedIndex % 3;
  
    // Clamp within the 3x3 grid (no wrap)
    const newRow = Math.max(0, Math.min(2, row + dy));
    const newCol = Math.max(0, Math.min(2, col + dx));
  
    selectedIndex = newRow * 3 + newCol;
    render();
  }
  
  function selectFromMouse(index) {
    selectedIndex = index;
    render();
  }

function handleMove(index) {
  if (gameOver) return;
  if (board[index] !== null) return;

  board[index] = currentPlayer;

  const result = checkWinner();
  if (result) {
    gameOver = true;
    setStatus(`🏆 ${result.winner} wins!`, 'win');
    result.line.forEach(i => cells[i].classList.add('win'));
    render();
    return;
  }

  if (isDraw()) {
    gameOver = true;
    setStatus(`🤝 Draw!`, 'draw');
    render();
    return;
  }

  currentPlayer = (currentPlayer === 'X') ? 'O' : 'X';
  render();
}

function resetGame() {
    board = Array(9).fill(null);
    currentPlayer = 'X';
    gameOver = false;
    selectedIndex = 0;
  
    setStatus(`Turn: X`, 'info');
    render();
  
    // Optional: put keyboard focus on the board so you can start immediately
    boardEl.focus();
  }

boardEl.addEventListener('click', (e) => {
    const cell = e.target.closest('.cell');
    if (!cell) return;
  
    const index = Number(cell.dataset.i);
  
    // Clicking also moves the keyboard highlight and focuses the board
    selectFromMouse(index);
    boardEl.focus();
  
    handleMove(index);
  });

  window.addEventListener('keydown', (e) => {
    if (gameOver) return;
    if (isTypingInField()) return;
  
    // Only hijack the keys we use for gameplay
    const keys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter', ' '];
    if (!keys.includes(e.key)) return;
  
    e.preventDefault();
  
    switch (e.key) {
      case 'ArrowUp':
        moveSelection(0, -1);
        break;
      case 'ArrowDown':
        moveSelection(0, 1);
        break;
      case 'ArrowLeft':
        moveSelection(-1, 0);
        break;
      case 'ArrowRight':
        moveSelection(1, 0);
        break;
      case 'Enter':
      case ' ':
        handleMove(selectedIndex);
        break;
    }
  });  

    
resetBtn.addEventListener('click', resetGame);

// Initial render
rrender();
boardEl.focus();
