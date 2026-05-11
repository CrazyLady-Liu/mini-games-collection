const DifficultyConfigs = {
    easy: { rows: 5, cols: 6, colorCount: 3 },
    normal: { rows: 8, cols: 10, colorCount: 5 },
    hard: { rows: 10, cols: 12, colorCount: 7 }
};

const AllColors = [
    { name: '珊瑚粉', value: '#e898a5' },
    { name: '雾霾蓝', value: '#8aa9c8' },
    { name: '薄荷绿', value: '#9dc6a7' },
    { name: '鹅黄色', value: '#e6d5a7' },
    { name: '薰衣草', value: '#b0aac0' },
    { name: '蜜桃橙', value: '#f0c090' },
    { name: '豆沙紫', value: '#c197d2' }
];

const GameState = {
    difficulty: 'easy',
    rows: 5,
    cols: 6,
    colors: [],
    targetColor: null,
    targetColorCount: 0,
    grid: [],
    score: 0,
    hasAnswered: false
};

const Elements = {
    gridContainer: document.getElementById('gridContainer'),
    targetColorPreview: document.getElementById('targetColorPreview'),
    targetColorName: document.getElementById('targetColorName'),
    score: document.getElementById('score'),
    answerInput: document.getElementById('answerInput'),
    submitBtn: document.getElementById('submitBtn'),
    resetBtn: document.getElementById('resetBtn'),
    result: document.getElementById('result'),
    difficultyBtns: document.querySelectorAll('.difficulty-btn')
};

function initModule() {
    GameState.grid = [];
    GameState.hasAnswered = false;
    Elements.result.textContent = '';
    Elements.result.className = 'result';
    Elements.answerInput.value = '';
    Elements.answerInput.disabled = false;
    Elements.submitBtn.disabled = false;
    
    const config = DifficultyConfigs[GameState.difficulty];
    GameState.rows = config.rows;
    GameState.cols = config.cols;
    GameState.colors = AllColors.slice(0, config.colorCount);
    
    GameState.targetColor = GameState.colors[Math.floor(Math.random() * GameState.colors.length)];
    Elements.targetColorPreview.style.backgroundColor = GameState.targetColor.value;
    Elements.targetColorName.textContent = GameState.targetColor.name;
}

function getDistance(pos1, pos2) {
    return Math.sqrt(Math.pow(pos1.row - pos2.row, 2) + Math.pow(pos1.col - pos2.col, 2));
}

function getMinDistance(pos, positions) {
    if (positions.length === 0) return Infinity;
    let minDist = Infinity;
    for (const p of positions) {
        const dist = getDistance(pos, p);
        if (dist < minDist) minDist = dist;
    }
    return minDist;
}

function getAdjacentSameColor(grid, row, col, color) {
    const directions = [[-1, 0], [1, 0], [0, -1], [0, 1], [-1, -1], [-1, 1], [1, -1], [1, 1]];
    let count = 0;
    
    for (const [dr, dc] of directions) {
        const newRow = row + dr;
        const newCol = col + dc;
        
        if (newRow >= 0 && newRow < grid.length && 
            newCol >= 0 && newCol < grid[0].length && 
            grid[newRow][newCol] === color) {
            count++;
        }
    }
    
    return count;
}

function generateGridModule() {
    const totalCells = GameState.rows * GameState.cols;
    const colorsPerCell = Math.floor(totalCells / GameState.colors.length);
    const remainder = totalCells % GameState.colors.length;
    
    let colorCounts = {};
    GameState.colors.forEach(color => {
        colorCounts[color.value] = colorsPerCell;
    });
    
    for (let i = 0; i < remainder; i++) {
        const randomColor = GameState.colors[i % GameState.colors.length];
        colorCounts[randomColor.value]++;
    }
    
    const targetMinRatio = GameState.difficulty === 'easy' ? 0.18 : GameState.difficulty === 'normal' ? 0.15 : 0.12;
    const targetMinCount = Math.max(6, Math.floor(totalCells * targetMinRatio));
    const targetMaxCount = Math.floor(totalCells * 0.28);
    
    if (colorCounts[GameState.targetColor.value] < targetMinCount) {
        const extra = targetMinCount - colorCounts[GameState.targetColor.value];
        colorCounts[GameState.targetColor.value] = targetMinCount;
        
        let distributed = 0;
        for (const color of GameState.colors) {
            if (color.value !== GameState.targetColor.value && distributed < extra) {
                const reduce = Math.min(extra - distributed, colorCounts[color.value] - 2);
                if (reduce > 0) {
                    colorCounts[color.value] -= reduce;
                    distributed += reduce;
                }
            }
        }
    } else if (colorCounts[GameState.targetColor.value] > targetMaxCount) {
        const reduce = colorCounts[GameState.targetColor.value] - targetMaxCount;
        colorCounts[GameState.targetColor.value] = targetMaxCount;
        
        let distributed = 0;
        for (const color of GameState.colors) {
            if (color.value !== GameState.targetColor.value && distributed < reduce) {
                colorCounts[color.value]++;
                distributed++;
            }
        }
    }
    
    GameState.targetColorCount = colorCounts[GameState.targetColor.value];
    
    let grid = [];
    for (let row = 0; row < GameState.rows; row++) {
        grid[row] = [];
        for (let col = 0; col < GameState.cols; col++) {
            grid[row][col] = null;
        }
    }
    
    let targetPositions = [];
    const targetCount = colorCounts[GameState.targetColor.value];
    
    let availablePositions = [];
    for (let row = 0; row < GameState.rows; row++) {
        for (let col = 0; col < GameState.cols; col++) {
            availablePositions.push({ row, col });
        }
    }
    
    const centerRow = (GameState.rows - 1) / 2;
    const centerCol = (GameState.cols - 1) / 2;
    availablePositions.sort((a, b) => {
        const distA = getDistance(a, { row: centerRow, col: centerCol });
        const distB = getDistance(b, { row: centerRow, col: centerCol });
        return distA - distB;
    });
    
    let startIndex = Math.floor(availablePositions.length * 0.2);
    let firstPos = availablePositions[startIndex + Math.floor(Math.random() * Math.floor(availablePositions.length * 0.3))];
    targetPositions.push(firstPos);
    grid[firstPos.row][firstPos.col] = GameState.targetColor.value;
    availablePositions = availablePositions.filter(p => !(p.row === firstPos.row && p.col === firstPos.col));
    
    for (let i = 1; i < targetCount; i++) {
        let bestPos = null;
        let bestScore = -Infinity;
        
        const sampleSize = Math.min(30, availablePositions.length);
        const shuffled = [...availablePositions].sort(() => Math.random() - 0.5).slice(0, sampleSize);
        
        for (const pos of shuffled) {
            let score = 0;
            
            const minDist = getMinDistance(pos, targetPositions);
            score += minDist * 3;
            
            const edgeDist = Math.min(pos.row, pos.col, GameState.rows - 1 - pos.row, GameState.cols - 1 - pos.col);
            score += edgeDist * 1.5;
            
            const centerDist = getDistance(pos, { row: centerRow, col: centerCol });
            const idealDist = Math.min(GameState.rows, GameState.cols) * 0.35;
            score -= Math.abs(centerDist - idealDist) * 0.5;
            
            score += Math.random() * 2;
            
            if (score > bestScore) {
                bestScore = score;
                bestPos = pos;
            }
        }
        
        targetPositions.push(bestPos);
        grid[bestPos.row][bestPos.col] = GameState.targetColor.value;
        availablePositions = availablePositions.filter(p => !(p.row === bestPos.row && p.col === bestPos.col));
    }
    
    let remainingCounts = { ...colorCounts };
    remainingCounts[GameState.targetColor.value] = 0;
    
    for (let row = 0; row < GameState.rows; row++) {
        for (let col = 0; col < GameState.cols; col++) {
            if (grid[row][col] !== null) continue;
            
            let availableColors = [];
            
            for (const color of GameState.colors) {
                if (remainingCounts[color.value] > 0) {
                    availableColors.push(color.value);
                }
            }
            
            availableColors.sort((a, b) => {
                const aAdj = getAdjacentSameColor(grid, row, col, a);
                const bAdj = getAdjacentSameColor(grid, row, col, b);
                return aAdj - bAdj;
            });
            
            let selectedColor;
            if (Math.random() < 0.75) {
                selectedColor = availableColors[0];
            } else {
                const randomIndex = Math.floor(Math.random() * Math.min(4, availableColors.length));
                selectedColor = availableColors[randomIndex];
            }
            
            grid[row][col] = selectedColor;
            remainingCounts[selectedColor]--;
        }
    }
    
    GameState.grid = grid;
}

function displayModule() {
    Elements.gridContainer.innerHTML = '';
    Elements.gridContainer.style.gridTemplateColumns = `repeat(${GameState.cols}, 42px)`;
    Elements.gridContainer.style.gridTemplateRows = `repeat(${GameState.rows}, 42px)`;
    
    for (let row = 0; row < GameState.rows; row++) {
        for (let col = 0; col < GameState.cols; col++) {
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            cell.style.backgroundColor = GameState.grid[row][col];
            cell.dataset.row = row;
            cell.dataset.col = col;
            
            const delay = (row * GameState.cols + col) * 15;
            cell.style.animation = `cellAppear 0.4s ease-out ${delay}ms both`;
            
            Elements.gridContainer.appendChild(cell);
        }
    }
}

function inputModule() {
    Elements.answerInput.addEventListener('input', (e) => {
        const value = e.target.value;
        if (value < 0) {
            e.target.value = 0;
        }
    });
    
    Elements.answerInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            submitAnswer();
        }
    });
}

function difficultyModule() {
    Elements.difficultyBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            Elements.difficultyBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            GameState.difficulty = btn.dataset.difficulty;
            resetModule();
        });
    });
}

function judgeScoringModule(userAnswer) {
    if (GameState.hasAnswered) return;
    
    GameState.hasAnswered = true;
    Elements.answerInput.disabled = true;
    Elements.submitBtn.disabled = true;
    
    if (userAnswer === GameState.targetColorCount) {
        const bonus = GameState.difficulty === 'easy' ? 5 : GameState.difficulty === 'normal' ? 10 : 15;
        GameState.score += bonus;
        Elements.result.textContent = `✨ 太棒了！目标颜色格子数量是 ${GameState.targetColorCount}，+${bonus}分！`;
        Elements.result.className = 'result correct';
    } else {
        Elements.result.textContent = `😊 答案是 ${GameState.targetColorCount}，再试一次吧！`;
        Elements.result.className = 'result wrong';
    }
    
    Elements.score.textContent = GameState.score;
}

function resetModule() {
    initModule();
    generateGridModule();
    displayModule();
}

function submitAnswer() {
    const userAnswer = parseInt(Elements.answerInput.value);
    
    if (isNaN(userAnswer)) {
        Elements.result.textContent = '请输入有效的数字哦~';
        Elements.result.className = 'result wrong';
        return;
    }
    
    judgeScoringModule(userAnswer);
}

const style = document.createElement('style');
style.textContent = `
    @keyframes cellAppear {
        from {
            opacity: 0;
            transform: scale(0.6) rotate(-5deg);
        }
        to {
            opacity: 1;
            transform: scale(1) rotate(0deg);
        }
    }
`;
document.head.appendChild(style);

Elements.submitBtn.addEventListener('click', submitAnswer);
Elements.resetBtn.addEventListener('click', resetModule);

inputModule();
difficultyModule();
resetModule();
