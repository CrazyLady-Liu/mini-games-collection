const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const reverseCanvas = document.getElementById('reverseCanvas');
const reverseCtx = reverseCanvas.getContext('2d');

const scoreEl = document.getElementById('score');
const timerEl = document.getElementById('timer');
const questionEl = document.getElementById('question');
const optionsEl = document.getElementById('options');
const resultOverlay = document.getElementById('resultOverlay');
const resultText = document.getElementById('resultText');
const restartBtn = document.getElementById('restartBtn');
const nextBtn = document.getElementById('nextBtn');
const gameOverModal = document.getElementById('gameOverModal');
const finalScoreEl = document.getElementById('finalScore');
const totalQuestionsEl = document.getElementById('totalQuestions');
const playAgainBtn = document.getElementById('playAgainBtn');

const forwardModeBtn = document.getElementById('forwardModeBtn');
const reverseModeBtn = document.getElementById('reverseModeBtn');
const forwardMode = document.getElementById('forwardMode');
const reverseMode = document.getElementById('reverseMode');

const targetPercentEl = document.getElementById('targetPercent');
const reverseResultOverlay = document.getElementById('reverseResultOverlay');
const reverseResultText = document.getElementById('reverseResultText');
const currentBlankPercentEl = document.getElementById('currentBlankPercent');
const accuracyEl = document.getElementById('accuracy');
const clearBtn = document.getElementById('clearBtn');
const submitBtn = document.getElementById('submitBtn');
const brushSizeInput = document.getElementById('brushSize');
const brushSizeValue = document.getElementById('brushSizeValue');

let currentMode = 'forward';
let score = 0;
let timeLeft = 60;
let questionCount = 0;
let timerInterval = null;
let currentBlankPercent = 0;
let correctRange = 0;
let isAnswered = false;
let isGameOver = false;

let targetPercent = 50;
let isDrawing = false;
let brushSize = 50;
let currentReverseBlank = 100;

const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
    '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F',
    '#BB8FCE', '#85C1E9', '#F8B500', '#00CED1',
    '#FF69B4', '#32CD32', '#FF7F50', '#9370DB'
];

function getRandomColor() {
    return colors[Math.floor(Math.random() * colors.length)];
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function switchMode(mode) {
    currentMode = mode;
    
    if (mode === 'forward') {
        forwardModeBtn.classList.add('active');
        reverseModeBtn.classList.remove('active');
        forwardMode.classList.remove('hidden');
        reverseMode.classList.add('hidden');
    } else {
        reverseModeBtn.classList.add('active');
        forwardModeBtn.classList.remove('active');
        reverseMode.classList.remove('hidden');
        forwardMode.classList.add('hidden');
        initReverseQuestion();
    }
}

function generateShapes() {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const shapeCount = getRandomInt(5, 12);
    
    for (let i = 0; i < shapeCount; i++) {
        const shapeType = Math.random();
        const color = getRandomColor();
        
        if (shapeType < 0.3) {
            drawRandomCircle(color);
        } else if (shapeType < 0.6) {
            drawRandomRect(color);
        } else if (shapeType < 0.8) {
            drawRandomTriangle(color);
        } else {
            drawRandomPolygon(color);
        }
    }
    
    calculateBlankPercent();
}

function drawRandomCircle(color) {
    const x = getRandomInt(50, canvas.width - 50);
    const y = getRandomInt(50, canvas.height - 50);
    const radius = getRandomInt(30, 100);
    
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
}

function drawRandomRect(color) {
    const x = getRandomInt(20, canvas.width - 120);
    const y = getRandomInt(20, canvas.height - 120);
    const width = getRandomInt(50, 150);
    const height = getRandomInt(50, 150);
    const rotation = Math.random() * Math.PI * 2;
    
    ctx.save();
    ctx.translate(x + width / 2, y + height / 2);
    ctx.rotate(rotation);
    ctx.fillStyle = color;
    ctx.fillRect(-width / 2, -height / 2, width, height);
    ctx.restore();
}

function drawRandomTriangle(color) {
    const x1 = getRandomInt(30, canvas.width - 30);
    const y1 = getRandomInt(30, canvas.height - 30);
    const x2 = x1 + getRandomInt(-80, 80);
    const y2 = y1 + getRandomInt(-80, 80);
    const x3 = x1 + getRandomInt(-80, 80);
    const y3 = y1 + getRandomInt(-80, 80);
    
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.lineTo(x3, y3);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
}

function drawRandomPolygon(color) {
    const sides = getRandomInt(5, 8);
    const centerX = getRandomInt(50, canvas.width - 50);
    const centerY = getRandomInt(50, canvas.height - 50);
    const radius = getRandomInt(30, 80);
    const rotation = Math.random() * Math.PI * 2;
    
    ctx.beginPath();
    for (let i = 0; i < sides; i++) {
        const angle = (i * 2 * Math.PI / sides) + rotation;
        const r = radius * (0.7 + Math.random() * 0.6);
        const x = centerX + r * Math.cos(angle);
        const y = centerY + r * Math.sin(angle);
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
}

function calculateBlankPercent() {
    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const data = imageData.data;
    let whitePixels = 0;
    const totalPixels = canvas.width * canvas.height;
    
    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        if (r === 255 && g === 255 && b === 255) {
            whitePixels++;
        }
    }
    
    currentBlankPercent = (whitePixels / totalPixels) * 100;
    
    if (currentBlankPercent < 25) {
        correctRange = 0;
    } else if (currentBlankPercent < 50) {
        correctRange = 1;
    } else if (currentBlankPercent < 75) {
        correctRange = 2;
    } else {
        correctRange = 3;
    }
    
    shuffleOptions();
}

function shuffleOptions() {
    const buttons = optionsEl.querySelectorAll('.option-btn');
    const ranges = [0, 1, 2, 3];
    
    for (let i = ranges.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [ranges[i], ranges[j]] = [ranges[j], ranges[i]];
    }
    
    const labels = ['A. 0% - 25%', 'B. 25% - 50%', 'C. 50% - 75%', 'D. 75% - 100%'];
    
    buttons.forEach((btn, index) => {
        btn.dataset.range = ranges[index];
        btn.textContent = labels[ranges[index]];
        btn.disabled = false;
        btn.classList.remove('correct', 'wrong');
    });
}

function handleAnswer(e) {
    if (isAnswered || isGameOver) return;
    
    isAnswered = true;
    const selectedRange = parseInt(e.target.dataset.range);
    const buttons = optionsEl.querySelectorAll('.option-btn');
    
    buttons.forEach(btn => {
        btn.disabled = true;
        const range = parseInt(btn.dataset.range);
        if (range === correctRange) {
            btn.classList.add('correct');
        } else if (range === selectedRange && range !== correctRange) {
            btn.classList.add('wrong');
        }
    });
    
    if (selectedRange === correctRange) {
        score += 10;
        showResult(`✅ 正确！`);
    } else {
        showResult(`❌ 错误！留白: ${currentBlankPercent.toFixed(1)}%`);
    }
    
    scoreEl.textContent = score;
    
    setTimeout(() => {
        hideResult();
        if (!isGameOver) {
            nextQuestion();
        }
    }, 1000);
}

function showResult(text) {
    resultText.textContent = text;
    resultOverlay.classList.remove('hidden');
}

function hideResult() {
    resultOverlay.classList.add('hidden');
}

function nextQuestion() {
    questionCount++;
    questionEl.textContent = questionCount;
    isAnswered = false;
    
    if (currentMode === 'forward') {
        generateShapes();
    } else {
        initReverseQuestion();
    }
}

function initReverseQuestion() {
    targetPercent = getRandomInt(10, 90);
    targetPercentEl.textContent = `${targetPercent}%`;
    
    reverseCtx.fillStyle = '#FFFFFF';
    reverseCtx.fillRect(0, 0, reverseCanvas.width, reverseCanvas.height);
    
    currentReverseBlank = 100;
    updateReverseInfo();
    reverseResultOverlay.classList.add('hidden');
}

function updateReverseInfo() {
    const imageData = reverseCtx.getImageData(0, 0, reverseCanvas.width, reverseCanvas.height);
    const data = imageData.data;
    let whitePixels = 0;
    const totalPixels = reverseCanvas.width * reverseCanvas.height;
    
    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        if (r === 255 && g === 255 && b === 255) {
            whitePixels++;
        }
    }
    
    currentReverseBlank = (whitePixels / totalPixels) * 100;
    currentBlankPercentEl.textContent = `${currentReverseBlank.toFixed(1)}%`;
    
    const diff = Math.abs(currentReverseBlank - targetPercent);
    const accuracy = Math.max(0, 100 - diff * 2);
    accuracyEl.textContent = `${accuracy.toFixed(1)}%`;
}

function drawOnCanvas(e) {
    if (isGameOver) return;
    
    const rect = reverseCanvas.getBoundingClientRect();
    const scaleX = reverseCanvas.width / rect.width;
    const scaleY = reverseCanvas.height / rect.height;
    
    let clientX, clientY;
    if (e.touches) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
    } else {
        clientX = e.clientX;
        clientY = e.clientY;
    }
    
    const x = (clientX - rect.left) * scaleX;
    const y = (clientY - rect.top) * scaleY;
    
    reverseCtx.beginPath();
    reverseCtx.arc(x, y, brushSize / 2, 0, Math.PI * 2);
    reverseCtx.fillStyle = getRandomColor();
    reverseCtx.fill();
    
    updateReverseInfo();
}

function submitReverseAnswer() {
    if (isGameOver) return;
    
    const diff = Math.abs(currentReverseBlank - targetPercent);
    const accuracy = Math.max(0, 100 - diff * 2);
    
    let points = 0;
    let resultMsg = '';
    
    if (diff <= 5) {
        points = 15;
        resultMsg = `🎉 完美！+${points}分`;
    } else if (diff <= 10) {
        points = 10;
        resultMsg = `✨ 很好！+${points}分`;
    } else if (diff <= 20) {
        points = 5;
        resultMsg = `👍 不错！+${points}分`;
    } else {
        resultMsg = `😅 继续加油！`;
    }
    
    score += points;
    scoreEl.textContent = score;
    
    reverseResultText.innerHTML = `${resultMsg}<br><small>目标: ${targetPercent}% | 你的: ${currentReverseBlank.toFixed(1)}%</small>`;
    reverseResultOverlay.classList.remove('hidden');
    
    setTimeout(() => {
        reverseResultOverlay.classList.add('hidden');
        if (!isGameOver) {
            nextQuestion();
        }
    }, 1500);
}

function clearCanvas() {
    if (isGameOver) return;
    reverseCtx.fillStyle = '#FFFFFF';
    reverseCtx.fillRect(0, 0, reverseCanvas.width, reverseCanvas.height);
    updateReverseInfo();
}

function startTimer() {
    clearInterval(timerInterval);
    timerInterval = setInterval(() => {
        timeLeft--;
        timerEl.textContent = timeLeft;
        
        if (timeLeft <= 0) {
            endGame();
        }
    }, 1000);
}

function endGame() {
    isGameOver = true;
    clearInterval(timerInterval);
    
    finalScoreEl.textContent = score;
    totalQuestionsEl.textContent = questionCount;
    gameOverModal.classList.remove('hidden');
    
    const buttons = optionsEl.querySelectorAll('.option-btn');
    buttons.forEach(btn => btn.disabled = true);
}

function restartGame() {
    score = 0;
    timeLeft = 60;
    questionCount = 0;
    isAnswered = false;
    isGameOver = false;
    
    scoreEl.textContent = '0';
    timerEl.textContent = '60';
    questionEl.textContent = '1';
    gameOverModal.classList.add('hidden');
    hideResult();
    reverseResultOverlay.classList.add('hidden');
    
    startTimer();
    nextQuestion();
}

forwardModeBtn.addEventListener('click', () => switchMode('forward'));
reverseModeBtn.addEventListener('click', () => switchMode('reverse'));

optionsEl.addEventListener('click', (e) => {
    if (e.target.classList.contains('option-btn')) {
        handleAnswer(e);
    }
});

restartBtn.addEventListener('click', restartGame);
nextBtn.addEventListener('click', () => {
    if (!isAnswered && !isGameOver) {
        nextQuestion();
    }
});
playAgainBtn.addEventListener('click', restartGame);

reverseCanvas.addEventListener('mousedown', (e) => {
    isDrawing = true;
    drawOnCanvas(e);
});

reverseCanvas.addEventListener('mousemove', (e) => {
    if (isDrawing) {
        drawOnCanvas(e);
    }
});

reverseCanvas.addEventListener('mouseup', () => {
    isDrawing = false;
});

reverseCanvas.addEventListener('mouseleave', () => {
    isDrawing = false;
});

reverseCanvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    isDrawing = true;
    drawOnCanvas(e);
});

reverseCanvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (isDrawing) {
        drawOnCanvas(e);
    }
});

reverseCanvas.addEventListener('touchend', () => {
    isDrawing = false;
});

clearBtn.addEventListener('click', clearCanvas);
submitBtn.addEventListener('click', submitReverseAnswer);

brushSizeInput.addEventListener('input', (e) => {
    brushSize = parseInt(e.target.value);
    brushSizeValue.textContent = brushSize;
});

window.addEventListener('load', () => {
    startTimer();
    nextQuestion();
});