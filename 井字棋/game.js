const boardElement = document.getElementById('board');
const statusElement = document.getElementById('status');
const restartBtn = document.getElementById('restartBtn');

let board = ['', '', '', '', '', '', '', '', ''];
let currentPlayer = 'X';
let gameActive = true;
const PLAYER = 'X';
const AI = 'O';
const PLAYER_ICON = '⭐';
const AI_ICON = '🎃';
const winPatterns = [
    { pattern: [0, 1, 2], type: 'horizontal', position: 0 },
    { pattern: [3, 4, 5], type: 'horizontal', position: 1 },
    { pattern: [6, 7, 8], type: 'horizontal', position: 2 },
    { pattern: [0, 3, 6], type: 'vertical', position: 0 },
    { pattern: [1, 4, 7], type: 'vertical', position: 1 },
    { pattern: [2, 5, 8], type: 'vertical', position: 2 },
    { pattern: [0, 4, 8], type: 'diagonal', position: 0 },
    { pattern: [2, 4, 6], type: 'diagonal', position: 1 }
];

function initBoard() {
    boardElement.innerHTML = '';
    board.forEach((cell, index) => {
        const cellElement = document.createElement('div');
        cellElement.classList.add('cell');
        cellElement.dataset.index = index;
        cellElement.addEventListener('click', handleCellClick);
        boardElement.appendChild(cellElement);
    });
}

function handleCellClick(e) {
    const index = e.target.dataset.index;
    if (board[index] !== '' || !gameActive || currentPlayer !== PLAYER) return;
    
    const cellElement = e.target;
    cellElement.classList.add('clicked');
    setTimeout(() => cellElement.classList.remove('clicked'), 300);
    
    makeMove(index, PLAYER);
    if (gameActive) {
        currentPlayer = AI;
        statusElement.textContent = 'AI思考中...';
        setTimeout(() => {
            aiMove();
        }, 500);
    }
}

function makeMove(index, player) {
    board[index] = player;
    const cellElements = document.querySelectorAll('.cell');
    cellElements[index].textContent = player === PLAYER ? PLAYER_ICON : AI_ICON;
    cellElements[index].classList.add('taken');
    cellElements[index].classList.add(player === PLAYER ? 'player' : 'ai');
    checkGameResult();
}

function checkGameResult() {
    const winnerData = checkWinner();
    if (winnerData) {
        gameActive = false;
        highlightWinnerCells(winnerData.pattern);
        drawWinLine(winnerData.type, winnerData.position);
        statusElement.textContent = winnerData.player === PLAYER ? '你赢了！🎉' : 'AI赢了！😢';
        return;
    }
    if (!board.includes('')) {
        gameActive = false;
        statusElement.textContent = '平局！🤝';
        return;
    }
    if (currentPlayer === PLAYER) {
        statusElement.textContent = '你的回合 (' + PLAYER_ICON + ')';
    }
}

function checkWinner() {
    for (const winData of winPatterns) {
        const [a, b, c] = winData.pattern;
        if (board[a] && board[a] === board[b] && board[a] === board[c]) {
            return { 
                player: board[a], 
                pattern: winData.pattern,
                type: winData.type,
                position: winData.position
            };
        }
    }
    return null;
}

function highlightWinnerCells(pattern) {
    const cellElements = document.querySelectorAll('.cell');
    pattern.forEach(index => {
        cellElements[index].classList.add('winner');
    });
}

function drawWinLine(type, position) {
    const line = document.createElement('div');
    line.classList.add('win-line');
    
    if (type === 'horizontal') {
        line.classList.add('win-line-horizontal');
        const topPositions = [75, 195, 315];
        line.style.top = topPositions[position] + 'px';
    } else if (type === 'vertical') {
        line.classList.add('win-line-vertical');
        const leftPositions = [75, 195, 315];
        line.style.left = leftPositions[position] + 'px';
    } else if (type === 'diagonal') {
        if (position === 0) {
            line.classList.add('win-line-diagonal1');
            line.style.marginTop = '-6px';
        } else {
            line.classList.add('win-line-diagonal2');
            line.style.marginTop = '-6px';
        }
    }
    
    boardElement.appendChild(line);
}

function aiMove() {
    let bestMove = findBestMove();
    if (bestMove === -1) {
        const emptyCells = board.map((cell, index) => cell === '' ? index : -1).filter(i => i !== -1);
        bestMove = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    }
    makeMove(bestMove, AI);
    if (gameActive) {
        currentPlayer = PLAYER;
        statusElement.textContent = '你的回合 (' + PLAYER_ICON + ')';
    }
}

function findBestMove() {
    for (let i = 0; i < 9; i++) {
        if (board[i] === '') {
            board[i] = AI;
            if (checkWinner() && checkWinner().player === AI) {
                board[i] = '';
                return i;
            }
            board[i] = '';
        }
    }
    for (let i = 0; i < 9; i++) {
        if (board[i] === '') {
            board[i] = PLAYER;
            if (checkWinner() && checkWinner().player === PLAYER) {
                board[i] = '';
                return i;
            }
            board[i] = '';
        }
    }
    if (board[4] === '') return 4;
    const corners = [0, 2, 6, 8];
    const emptyCorners = corners.filter(i => board[i] === '');
    if (emptyCorners.length > 0) {
        return emptyCorners[Math.floor(Math.random() * emptyCorners.length)];
    }
    return -1;
}

function restartGame() {
    board = ['', '', '', '', '', '', '', '', ''];
    currentPlayer = PLAYER;
    gameActive = true;
    statusElement.textContent = '你的回合 (' + PLAYER_ICON + ')';
    initBoard();
}

restartBtn.addEventListener('click', restartGame);
initBoard();