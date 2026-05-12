const singleCharacters = [
    { character: '人', strokes: ['丿', '㇏'], positions: [[1, 1], [2, 2]] },
    { character: '口', strokes: ['丨', '𠃍', '一', '一'], positions: [[1, 1], [1, 2], [2, 1], [3, 2]] },
    { character: '日', strokes: ['丨', '𠃍', '一', '一', '一'], positions: [[1, 1], [1, 2], [2, 1], [3, 1], [3, 2]] },
    { character: '月', strokes: ['丿', '𠃌', '一', '一'], positions: [[1, 1], [1, 2], [2, 2], [3, 2]] },
    { character: '水', strokes: ['亅', '𠃌', '丿', '㇏'], positions: [[2, 2], [2, 1], [1, 2], [3, 2]] },
    { character: '山', strokes: ['丨', '𠃊', '丨', '𠃍'], positions: [[2, 1], [2, 2], [1, 2], [3, 2]] },
    { character: '田', strokes: ['丨', '𠃍', '一', '丨', '一'], positions: [[1, 1], [1, 2], [2, 1], [2, 2], [3, 1]] },
    { character: '木', strokes: ['一', '丨', '丿', '㇏'], positions: [[1, 2], [2, 1], [2, 0], [2, 3]] },
    { character: '十', strokes: ['一', '丨'], positions: [[1, 1], [2, 2]] },
    { character: '土', strokes: ['一', '丨', '一'], positions: [[1, 2], [2, 2], [3, 2]] }
];

const complexCharacters = [
    { character: '大', strokes: ['一', '丿', '㇏'], positions: [[1, 2], [2, 1], [2, 3]] },
    { character: '小', strokes: ['亅', '丿', '丶'], positions: [[2, 2], [1, 1], [1, 3]] },
    { character: '天', strokes: ['一', '一', '丿', '㇏'], positions: [[0, 2], [1, 2], [2, 1], [2, 3]] },
    { character: '地', strokes: ['一', '丨', '一', '𠃌', '丨', '乚'], positions: [[1, 1], [2, 1], [3, 1], [1, 3], [2, 3], [3, 3]] },
    { character: '王', strokes: ['一', '一', '丨', '一'], positions: [[0, 2], [2, 2], [1, 2], [3, 2]] },
    { character: '火', strokes: ['丶', '丿', '丿', '㇏'], positions: [[1, 2], [2, 1], [1, 1], [2, 3]] },
    { character: '石', strokes: ['一', '丿', '丨', '𠃍', '一'], positions: [[1, 1], [2, 0], [2, 1], [1, 2], [3, 2]] },
    { character: '白', strokes: ['丿', '𠃍', '一', '一', '一'], positions: [[0, 2], [1, 2], [1, 3], [2, 2], [3, 2]] }
];

const words = [
    { word: '人口', chars: ['人', '口'] },
    { word: '日月', chars: ['日', '月'] },
    { word: '山水', chars: ['山', '水'] },
    { word: '土木', chars: ['土', '木'] },
    { word: '十日', chars: ['十', '日'] },
    { word: '水田', chars: ['水', '田'] },
    { word: '火山', chars: ['火', '山'] },
    { word: '大小', chars: ['大', '小'] },
    { word: '天地', chars: ['天', '地'] },
    { word: '白天', chars: ['白', '天'] }
];

let difficulty = 'simple';
let currentMode = 'character';
let currentIndex = 0;
let currentTarget = null;
let currentCharIndex = 0;
let placedStrokes = [];
let draggedElement = null;
let offsetX = 0;
let offsetY = 0;

const targetGrid = document.getElementById('targetGrid');
const strokesContainer = document.getElementById('strokesContainer');
const feedback = document.getElementById('feedback');
const nextBtn = document.getElementById('nextBtn');
const resetBtn = document.getElementById('resetBtn');
const difficultyButtons = document.querySelectorAll('.difficulty-btn');
const targetHint = document.getElementById('targetHint');
const charPreview = document.getElementById('charPreview');

function initGame() {
    initGrid();
    setupEventListeners();
    loadContent();
}

function initGrid() {
    targetGrid.innerHTML = '';
    for (let i = 0; i < 16; i++) {
        const cell = document.createElement('div');
        cell.className = 'grid-cell';
        cell.dataset.index = i;
        cell.dataset.row = Math.floor(i / 4);
        cell.dataset.col = i % 4;
        targetGrid.appendChild(cell);
    }
}

function getContentForDifficulty() {
    let content = [];
    if (difficulty === 'simple') {
        content = singleCharacters.map(c => ({ type: 'character', data: c }));
    } else if (difficulty === 'normal') {
        const chars = singleCharacters.map(c => ({ type: 'character', data: c }));
        const simpleWords = words.slice(0, 5).map(w => ({ type: 'word', data: w }));
        content = [...chars, ...simpleWords];
    } else if (difficulty === 'hard') {
        const allChars = [...singleCharacters, ...complexCharacters].map(c => ({ type: 'character', data: c }));
        const allWords = words.map(w => ({ type: 'word', data: w }));
        content = [...allChars, ...allWords];
    }
    return content.sort(() => Math.random() - 0.5);
}

function loadContent() {
    const content = getContentForDifficulty();
    currentTarget = content[currentIndex % content.length];
    currentMode = currentTarget.type;
    currentCharIndex = 0;
    placedStrokes = [];
    
    updateTargetHint();
    loadCurrentChar();
}

function updateTargetHint() {
    if (currentMode === 'word') {
        const word = currentTarget.data.word;
        let hint = word.split('').map((c, i) => i < currentCharIndex ? c : '?').join('');
        targetHint.textContent = `目标：${hint}`;
    } else {
        targetHint.textContent = '';
    }
}

function loadCurrentChar() {
    let charData;
    if (currentMode === 'word') {
        const char = currentTarget.data.chars[currentCharIndex];
        charData = [...singleCharacters, ...complexCharacters].find(c => c.character === char);
    } else {
        charData = currentTarget.data;
    }
    
    charPreview.textContent = charData.character;
    feedback.textContent = '';
    feedback.className = 'feedback';
    
    const shuffledStrokes = [...charData.strokes].sort(() => Math.random() - 0.5);
    
    strokesContainer.innerHTML = '';
    shuffledStrokes.forEach((stroke, index) => {
        const strokeElement = createStrokeElement(stroke, index);
        strokesContainer.appendChild(strokeElement);
    });
    
    initGrid();
}

function createStrokeElement(stroke, index) {
    const element = document.createElement('div');
    element.className = 'stroke';
    element.textContent = stroke;
    element.dataset.strokeIndex = index;
    element.dataset.stroke = stroke;
    element.draggable = false;
    
    element.addEventListener('mousedown', startDrag);
    element.addEventListener('touchstart', startDrag, { passive: false });
    
    return element;
}

function startDrag(e) {
    e.preventDefault();
    draggedElement = e.target;
    draggedElement.classList.add('dragging');
    
    const rect = draggedElement.getBoundingClientRect();
    const clientX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
    const clientY = e.type === 'touchstart' ? e.touches[0].clientY : e.clientY;
    
    offsetX = clientX - rect.left;
    offsetY = clientY - rect.top;
    
    const clone = draggedElement.cloneNode(true);
    clone.style.position = 'fixed';
    clone.style.left = `${rect.left}px`;
    clone.style.top = `${rect.top}px`;
    clone.style.zIndex = '1000';
    clone.style.pointerEvents = 'none';
    clone.id = 'dragClone';
    document.body.appendChild(clone);
    
    draggedElement.style.opacity = '0.3';
    
    document.addEventListener('mousemove', drag);
    document.addEventListener('mouseup', endDrag);
    document.addEventListener('touchmove', drag, { passive: false });
    document.addEventListener('touchend', endDrag);
    
    highlightGridCells(true);
}

function drag(e) {
    e.preventDefault();
    const clone = document.getElementById('dragClone');
    if (!clone) return;
    
    const clientX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
    const clientY = e.type === 'touchmove' ? e.touches[0].clientY : e.clientY;
    
    clone.style.left = `${clientX - offsetX}px`;
    clone.style.top = `${clientY - offsetY}px`;
    
    const cells = document.querySelectorAll('.grid-cell');
    cells.forEach(cell => {
        const rect = cell.getBoundingClientRect();
        if (clientX >= rect.left && clientX <= rect.right &&
            clientY >= rect.top && clientY <= rect.bottom) {
            cells.forEach(c => c.classList.remove('highlight'));
            cell.classList.add('highlight');
        }
    });
}

function endDrag(e) {
    const clone = document.getElementById('dragClone');
    if (!clone) return;
    
    const clientX = e.type === 'touchend' ? e.changedTouches[0].clientX : e.clientX;
    const clientY = e.type === 'touchend' ? e.changedTouches[0].clientY : e.clientY;
    
    const cells = document.querySelectorAll('.grid-cell');
    let placed = false;
    
    cells.forEach(cell => {
        const rect = cell.getBoundingClientRect();
        if (clientX >= rect.left && clientX <= rect.right &&
            clientY >= rect.top && clientY <= rect.bottom) {
            placeStrokeInCell(cell);
            placed = true;
        }
    });
    
    if (!placed) {
        draggedElement.style.opacity = '1';
    }
    
    clone.remove();
    draggedElement.classList.remove('dragging');
    
    document.removeEventListener('mousemove', drag);
    document.removeEventListener('mouseup', endDrag);
    document.removeEventListener('touchmove', drag);
    document.removeEventListener('touchend', endDrag);
    
    highlightGridCells(false);
    
    checkCharCompletion();
}

function placeStrokeInCell(cell) {
    const stroke = draggedElement.dataset.stroke;
    const strokeIndex = parseInt(draggedElement.dataset.strokeIndex);
    
    if (cell.querySelector('.stroke')) {
        const existingStroke = cell.querySelector('.stroke');
        strokesContainer.appendChild(existingStroke);
        existingStroke.style.opacity = '1';
        existingStroke.classList.remove('placed');
        existingStroke.classList.remove('correct');
        placedStrokes = placedStrokes.filter(s => s.cellIndex !== parseInt(cell.dataset.index));
    }
    
    cell.innerHTML = '';
    const newStroke = document.createElement('div');
    newStroke.className = 'stroke placed';
    newStroke.textContent = stroke;
    newStroke.dataset.strokeIndex = strokeIndex;
    newStroke.dataset.stroke = stroke;
    newStroke.draggable = false;
    newStroke.addEventListener('mousedown', startDrag);
    newStroke.addEventListener('touchstart', startDrag, { passive: false });
    cell.appendChild(newStroke);
    
    draggedElement.remove();
    draggedElement = newStroke;
    
    let charData;
    if (currentMode === 'word') {
        const char = currentTarget.data.chars[currentCharIndex];
        charData = [...singleCharacters, ...complexCharacters].find(c => c.character === char);
    } else {
        charData = currentTarget.data;
    }
    
    const correctPos = charData.positions[strokeIndex];
    const currentRow = parseInt(cell.dataset.row);
    const currentCol = parseInt(cell.dataset.col);
    if (correctPos && currentRow === correctPos[0] && currentCol === correctPos[1]) {
        newStroke.classList.add('correct');
    }
    
    placedStrokes = placedStrokes.filter(s => s.strokeIndex !== strokeIndex);
    placedStrokes.push({
        stroke: stroke,
        strokeIndex: strokeIndex,
        cellIndex: parseInt(cell.dataset.index),
        row: currentRow,
        col: currentCol
    });
}

function highlightGridCells(highlight) {
    const cells = document.querySelectorAll('.grid-cell');
    cells.forEach(cell => {
        if (!highlight) {
            cell.classList.remove('highlight');
        }
    });
}

function checkCharCompletion() {
    let charData;
    if (currentMode === 'word') {
        const char = currentTarget.data.chars[currentCharIndex];
        charData = [...singleCharacters, ...complexCharacters].find(c => c.character === char);
    } else {
        charData = currentTarget.data;
    }
    
    if (placedStrokes.length !== charData.strokes.length) {
        feedback.textContent = '';
        feedback.className = 'feedback';
        return;
    }
    
    let allCorrect = true;
    placedStrokes.forEach(placed => {
        const correctPos = charData.positions[placed.strokeIndex];
        if (!correctPos || placed.row !== correctPos[0] || placed.col !== correctPos[1]) {
            allCorrect = false;
        }
    });
    
    if (allCorrect) {
        showCharSuccess();
    } else {
        feedback.textContent = '';
        feedback.className = 'feedback';
    }
}

function showCharSuccess() {
    let charData;
    if (currentMode === 'word') {
        const char = currentTarget.data.chars[currentCharIndex];
        charData = [...singleCharacters, ...complexCharacters].find(c => c.character === char);
    } else {
        charData = currentTarget.data;
    }
    
    feedback.textContent = `太棒了！你拼出了"${charData.character}"字！`;
    feedback.className = 'feedback success';
    
    if (currentMode === 'word') {
        currentCharIndex++;
        updateTargetHint();
        
        if (currentCharIndex < currentTarget.data.chars.length) {
            setTimeout(() => {
                placedStrokes = [];
                loadCurrentChar();
            }, 1500);
        } else {
            setTimeout(() => {
                showWordSuccess();
            }, 500);
        }
    }
}

function showWordSuccess() {
    feedback.textContent = `太厉害了！你拼出了词语"${currentTarget.data.word}"！`;
    feedback.className = 'feedback success';
}

function setupEventListeners() {
    nextBtn.addEventListener('click', () => {
        currentIndex++;
        loadContent();
    });
    
    resetBtn.addEventListener('click', () => {
        currentCharIndex = 0;
        placedStrokes = [];
        updateTargetHint();
        loadCurrentChar();
    });
    
    difficultyButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            difficultyButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            difficulty = btn.dataset.difficulty;
            currentIndex = 0;
            loadContent();
        });
    });
}

document.addEventListener('DOMContentLoaded', initGame);
