const referenceCanvas = document.getElementById('referenceCanvas');
const referenceCtx = referenceCanvas.getContext('2d');
const drawCanvas = document.getElementById('drawCanvas');
const drawCtx = drawCanvas.getContext('2d');
const mirrorPreview = document.getElementById('mirrorPreview');
const mirrorCtx = mirrorPreview.getContext('2d');

const undoBtn = document.getElementById('undoBtn');
const clearBtn = document.getElementById('clearBtn');
const checkBtn = document.getElementById('checkBtn');
const hintBtn = document.getElementById('hintBtn');
const nextBtn = document.getElementById('nextBtn');
const message = document.getElementById('message');
const currentLevelEl = document.getElementById('currentLevel');
const totalLevelsEl = document.getElementById('totalLevels');
const similarityEl = document.getElementById('similarity');
const levelButtons = document.getElementById('levelButtons');
const successModal = document.getElementById('successModal');
const finalSimilarityEl = document.getElementById('finalSimilarity');
const modalNextBtn = document.getElementById('modalNextBtn');
const modalReplayBtn = document.getElementById('modalReplayBtn');
const mirrorModeEl = document.getElementById('mirrorMode');

const MIRROR_MODES = {
    HORIZONTAL: {
        id: 'HORIZONTAL',
        name: '左右镜像',
        icon: '↔️',
        description: '沿竖轴对称'
    },
    VERTICAL: {
        id: 'VERTICAL',
        name: '上下镜像',
        icon: '↕️',
        description: '沿横轴对称'
    },
    DIAGONAL: {
        id: 'DIAGONAL',
        name: '对角镜像',
        icon: '↗️',
        description: '沿对角线对称'
    },
    CENTER: {
        id: 'CENTER',
        name: '中心对称',
        icon: '🔄',
        description: '旋转180°对称'
    }
};

let isDrawing = false;
let lastX = 0;
let lastY = 0;
let currentLevel = 1;
let drawingHistory = [];
let currentStroke = [];
let completedLevels = new Set();
let levelMirrorModes = {};
let currentMirrorMode = MIRROR_MODES.HORIZONTAL;
const PASS_THRESHOLD = 65;

const levels = [
    {
        name: "竖线",
        draw: (ctx, w, h) => {
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 4;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(w / 2, h * 0.2);
            ctx.lineTo(w / 2, h * 0.8);
            ctx.stroke();
        }
    },
    {
        name: "横线",
        draw: (ctx, w, h) => {
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 4;
            ctx.lineCap = 'round';
            ctx.beginPath();
            ctx.moveTo(w * 0.3, h / 2);
            ctx.lineTo(w * 0.7, h / 2);
            ctx.stroke();
        }
    },
    {
        name: "圆形",
        draw: (ctx, w, h) => {
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(w / 2, h / 2, Math.min(w, h) * 0.25, 0, Math.PI * 2);
            ctx.stroke();
        }
    },
    {
        name: "正方形",
        draw: (ctx, w, h) => {
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 4;
            const size = Math.min(w, h) * 0.4;
            ctx.strokeRect(w / 2 - size / 2, h / 2 - size / 2, size, size);
        }
    },
    {
        name: "三角形",
        draw: (ctx, w, h) => {
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 4;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            const size = Math.min(w, h) * 0.3;
            ctx.beginPath();
            ctx.moveTo(w / 2, h / 2 - size);
            ctx.lineTo(w / 2 - size, h / 2 + size * 0.7);
            ctx.lineTo(w / 2 + size, h / 2 + size * 0.7);
            ctx.closePath();
            ctx.stroke();
        }
    },
    {
        name: "心形",
        draw: (ctx, w, h) => {
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 4;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            const cx = w / 2;
            const cy = h / 2;
            const size = Math.min(w, h) * 0.15;
            ctx.beginPath();
            ctx.moveTo(cx, cy + size);
            ctx.bezierCurveTo(cx - size * 2, cy - size * 0.5, cx - size, cy - size * 1.5, cx, cy - size * 0.5);
            ctx.bezierCurveTo(cx + size, cy - size * 1.5, cx + size * 2, cy - size * 0.5, cx, cy + size);
            ctx.stroke();
        }
    },
    {
        name: "星形",
        draw: (ctx, w, h) => {
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 4;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            const cx = w / 2;
            const cy = h / 2;
            const outerRadius = Math.min(w, h) * 0.25;
            const innerRadius = outerRadius * 0.4;
            const spikes = 5;
            ctx.beginPath();
            for (let i = 0; i < spikes * 2; i++) {
                const radius = i % 2 === 0 ? outerRadius : innerRadius;
                const angle = (i * Math.PI) / spikes - Math.PI / 2;
                const x = cx + Math.cos(angle) * radius;
                const y = cy + Math.sin(angle) * radius;
                if (i === 0) ctx.moveTo(x, y);
                else ctx.lineTo(x, y);
            }
            ctx.closePath();
            ctx.stroke();
        }
    },
    {
        name: "箭头",
        draw: (ctx, w, h) => {
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 4;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            const cx = w / 2;
            const cy = h / 2;
            const size = Math.min(w, h) * 0.25;
            ctx.beginPath();
            ctx.moveTo(cx, cy - size);
            ctx.lineTo(cx, cy + size);
            ctx.moveTo(cx - size * 0.6, cy + size * 0.3);
            ctx.lineTo(cx, cy + size);
            ctx.lineTo(cx + size * 0.6, cy + size * 0.3);
            ctx.stroke();
        }
    },
    {
        name: "房子",
        draw: (ctx, w, h) => {
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 4;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            const cx = w / 2;
            const cy = h / 2;
            const size = Math.min(w, h) * 0.2;
            ctx.strokeRect(cx - size, cy - size * 0.3, size * 2, size * 1.3);
            ctx.beginPath();
            ctx.moveTo(cx - size * 1.2, cy - size * 0.3);
            ctx.lineTo(cx, cy - size * 1.3);
            ctx.lineTo(cx + size * 1.2, cy - size * 0.3);
            ctx.stroke();
            ctx.strokeRect(cx - size * 0.3, cy + size * 0.3, size * 0.6, size * 0.7);
        }
    },
    {
        name: "花朵",
        draw: (ctx, w, h) => {
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 4;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            const cx = w / 2;
            const cy = h / 2;
            const petalSize = Math.min(w, h) * 0.1;
            const centerSize = petalSize * 0.5;
            for (let i = 0; i < 6; i++) {
                const angle = (i * Math.PI) / 3;
                const px = cx + Math.cos(angle) * petalSize;
                const py = cy + Math.sin(angle) * petalSize;
                ctx.beginPath();
                ctx.ellipse(px, py, petalSize * 0.8, petalSize * 0.5, angle, 0, Math.PI * 2);
                ctx.stroke();
            }
            ctx.beginPath();
            ctx.arc(cx, cy, centerSize, 0, Math.PI * 2);
            ctx.stroke();
        }
    },
    {
        name: "菱形",
        draw: (ctx, w, h) => {
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 4;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            const cx = w / 2;
            const cy = h / 2;
            const size = Math.min(w, h) * 0.25;
            ctx.beginPath();
            ctx.moveTo(cx, cy - size);
            ctx.lineTo(cx + size, cy);
            ctx.lineTo(cx, cy + size);
            ctx.lineTo(cx - size, cy);
            ctx.closePath();
            ctx.stroke();
        }
    },
    {
        name: "沙漏",
        draw: (ctx, w, h) => {
            ctx.strokeStyle = '#333';
            ctx.lineWidth = 4;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            const cx = w / 2;
            const cy = h / 2;
            const size = Math.min(w, h) * 0.25;
            ctx.beginPath();
            ctx.moveTo(cx - size, cy - size);
            ctx.lineTo(cx + size, cy - size);
            ctx.lineTo(cx - size, cy + size);
            ctx.lineTo(cx + size, cy + size);
            ctx.closePath();
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(cx - size, cy - size);
            ctx.lineTo(cx + size, cy + size);
            ctx.moveTo(cx + size, cy - size);
            ctx.lineTo(cx - size, cy + size);
            ctx.stroke();
        }
    }
];

function generateLevelModes() {
    const modeKeys = Object.keys(MIRROR_MODES);
    for (let i = 1; i <= levels.length; i++) {
        const randomMode = modeKeys[Math.floor(Math.random() * modeKeys.length)];
        levelMirrorModes[i] = randomMode;
    }
}

function init() {
    totalLevelsEl.textContent = levels.length;
    generateLevelModes();
    setupCanvas();
    setupEventListeners();
    createLevelButtons();
    loadLevel(currentLevel);
}

function setupCanvas() {
    drawCtx.strokeStyle = '#4a90d9';
    drawCtx.lineWidth = 4;
    drawCtx.lineCap = 'round';
    drawCtx.lineJoin = 'round';
    
    mirrorCtx.strokeStyle = '#e74c3c';
    mirrorCtx.lineWidth = 4;
    mirrorCtx.lineCap = 'round';
    mirrorCtx.lineJoin = 'round';
}

function setupEventListeners() {
    drawCanvas.addEventListener('mousedown', startDrawing);
    drawCanvas.addEventListener('mousemove', draw);
    drawCanvas.addEventListener('mouseup', stopDrawing);
    drawCanvas.addEventListener('mouseout', stopDrawing);
    
    drawCanvas.addEventListener('touchstart', handleTouch);
    drawCanvas.addEventListener('touchmove', handleTouch);
    drawCanvas.addEventListener('touchend', stopDrawing);
    
    undoBtn.addEventListener('click', undo);
    clearBtn.addEventListener('click', clearCanvas);
    checkBtn.addEventListener('click', checkSymmetry);
    hintBtn.addEventListener('click', showHint);
    nextBtn.addEventListener('click', nextLevel);
    
    modalNextBtn.addEventListener('click', () => {
        successModal.classList.remove('show');
        nextLevel();
    });
    modalReplayBtn.addEventListener('click', () => {
        successModal.classList.remove('show');
        clearCanvas();
    });
}

function createLevelButtons() {
    levelButtons.innerHTML = '';
    for (let i = 1; i <= levels.length; i++) {
        const btn = document.createElement('button');
        btn.className = 'level-btn';
        btn.innerHTML = `<span style="font-size: 0.7rem;">${MIRROR_MODES[levelMirrorModes[i]].icon}</span><br>${i}`;
        btn.title = `${levels[i - 1].name} - ${MIRROR_MODES[levelMirrorModes[i]].name}`;
        if (i === currentLevel) btn.classList.add('active');
        if (completedLevels.has(i)) btn.classList.add('completed');
        btn.addEventListener('click', () => loadLevel(i));
        levelButtons.appendChild(btn);
    }
}

function loadLevel(levelNum) {
    currentLevel = levelNum;
    currentLevelEl.textContent = currentLevel;
    currentMirrorMode = MIRROR_MODES[levelMirrorModes[levelNum]];
    mirrorModeEl.textContent = `${currentMirrorMode.icon} ${currentMirrorMode.name}`;
    drawingHistory = [];
    currentStroke = [];
    similarityEl.textContent = '0%';
    nextBtn.disabled = true;
    message.textContent = '';
    message.className = 'message';
    
    clearDrawCanvas();
    drawReference();
    drawSymmetryGuide();
    updateMirrorPreview();
    createLevelButtons();
    showMessage(`第 ${currentLevel} 关: ${levels[currentLevel - 1].name} | ${currentMirrorMode.icon} ${currentMirrorMode.name}`, 'info');
}

function drawReference() {
    referenceCtx.clearRect(0, 0, referenceCanvas.width, referenceCanvas.height);
    levels[currentLevel - 1].draw(referenceCtx, referenceCanvas.width, referenceCanvas.height);
}

function drawSymmetryGuide() {
    referenceCtx.save();
    referenceCtx.strokeStyle = 'rgba(255, 100, 100, 0.4)';
    referenceCtx.lineWidth = 2;
    referenceCtx.setLineDash([5, 5]);
    
    const w = referenceCanvas.width;
    const h = referenceCanvas.height;
    
    referenceCtx.beginPath();
    switch (currentMirrorMode.id) {
        case 'HORIZONTAL':
            referenceCtx.moveTo(w / 2, 0);
            referenceCtx.lineTo(w / 2, h);
            break;
        case 'VERTICAL':
            referenceCtx.moveTo(0, h / 2);
            referenceCtx.lineTo(w, h / 2);
            break;
        case 'DIAGONAL':
            referenceCtx.moveTo(0, 0);
            referenceCtx.lineTo(w, h);
            break;
        case 'CENTER':
            referenceCtx.arc(w / 2, h / 2, 15, 0, Math.PI * 2);
            referenceCtx.moveTo(w / 2 - 20, h / 2);
            referenceCtx.lineTo(w / 2 + 20, h / 2);
            referenceCtx.moveTo(w / 2, h / 2 - 20);
            referenceCtx.lineTo(w / 2, h / 2 + 20);
            break;
    }
    referenceCtx.stroke();
    referenceCtx.restore();
}

function startDrawing(e) {
    isDrawing = true;
    const rect = drawCanvas.getBoundingClientRect();
    lastX = e.clientX - rect.left;
    lastY = e.clientY - rect.top;
    currentStroke = [{ x: lastX, y: lastY }];
}

function draw(e) {
    if (!isDrawing) return;
    
    const rect = drawCanvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    drawCtx.beginPath();
    drawCtx.moveTo(lastX, lastY);
    drawCtx.lineTo(x, y);
    drawCtx.stroke();
    
    currentStroke.push({ x, y });
    lastX = x;
    lastY = y;
    
    updateMirrorPreview();
}

function stopDrawing() {
    if (isDrawing && currentStroke.length > 0) {
        drawingHistory.push([...currentStroke]);
        currentStroke = [];
    }
    isDrawing = false;
}

function handleTouch(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const mouseEvent = {
        clientX: touch.clientX,
        clientY: touch.clientY
    };
    
    if (e.type === 'touchstart') {
        startDrawing(mouseEvent);
    } else if (e.type === 'touchmove') {
        draw(mouseEvent);
    }
}

function getMirroredPoint(x, y, width, height, mode) {
    const cx = width / 2;
    const cy = height / 2;
    
    switch (mode) {
        case 'HORIZONTAL':
            return { x: width - x, y: y };
        case 'VERTICAL':
            return { x: x, y: height - y };
        case 'DIAGONAL':
            return { x: y * width / height, y: x * height / width };
        case 'CENTER':
            return { x: width - x, y: height - y };
        default:
            return { x: width - x, y: y };
    }
}

function updateMirrorPreview() {
    mirrorCtx.clearRect(0, 0, mirrorPreview.width, mirrorPreview.height);
    
    const w = mirrorPreview.width;
    const h = mirrorPreview.height;
    
    drawingHistory.forEach(stroke => {
        if (stroke.length < 2) return;
        mirrorCtx.beginPath();
        
        const firstMirrored = getMirroredPoint(stroke[0].x, stroke[0].y, w, h, currentMirrorMode.id);
        mirrorCtx.moveTo(firstMirrored.x, firstMirrored.y);
        
        for (let i = 1; i < stroke.length; i++) {
            const mirrored = getMirroredPoint(stroke[i].x, stroke[i].y, w, h, currentMirrorMode.id);
            mirrorCtx.lineTo(mirrored.x, mirrored.y);
        }
        mirrorCtx.stroke();
    });
}

function undo() {
    if (drawingHistory.length === 0) {
        showMessage('没有可以撤销的操作', 'error');
        return;
    }
    
    drawingHistory.pop();
    redrawCanvas();
    updateMirrorPreview();
    showMessage('已撤销上一步', 'info');
}

function redrawCanvas() {
    clearDrawCanvas();
    drawingHistory.forEach(stroke => {
        if (stroke.length < 2) return;
        drawCtx.beginPath();
        drawCtx.moveTo(stroke[0].x, stroke[0].y);
        for (let i = 1; i < stroke.length; i++) {
            drawCtx.lineTo(stroke[i].x, stroke[i].y);
        }
        drawCtx.stroke();
    });
}

function clearCanvas() {
    drawingHistory = [];
    currentStroke = [];
    clearDrawCanvas();
    updateMirrorPreview();
    similarityEl.textContent = '0%';
    nextBtn.disabled = true;
    showMessage('画布已清空', 'info');
}

function clearDrawCanvas() {
    drawCtx.clearRect(0, 0, drawCanvas.width, drawCanvas.height);
}

function checkSymmetry() {
    if (drawingHistory.length === 0) {
        showMessage('请先绘制一些内容！', 'error');
        return;
    }
    
    const similarity = calculateSymmetry();
    similarityEl.textContent = `${similarity}%`;
    
    if (similarity >= PASS_THRESHOLD) {
        completedLevels.add(currentLevel);
        nextBtn.disabled = false;
        showMessage(`太棒了！相似度 ${similarity}%，通关成功！`, 'success');
        finalSimilarityEl.textContent = `${similarity}%`;
        
        if (currentLevel < levels.length) {
            modalNextBtn.style.display = 'inline-block';
        } else {
            modalNextBtn.style.display = 'none';
            showMessage('🎉 恭喜你完成了所有关卡！', 'success');
        }
        
        setTimeout(() => {
            successModal.classList.add('show');
        }, 500);
        
        createLevelButtons();
    } else {
        showMessage(`相似度 ${similarity}%，需要 ${PASS_THRESHOLD}% 才能通关，再试试！`, 'error');
    }
}

function calculateSymmetry() {
    const canvasWidth = drawCanvas.width;
    const canvasHeight = drawCanvas.height;
    
    const allPixels = [];
    drawingHistory.forEach(stroke => {
        stroke.forEach(point => {
            allPixels.push(point);
        });
    });
    
    if (allPixels.length === 0) {
        return 0;
    }
    
    let matchedPoints = 0;
    const tolerance = 25;
    
    allPixels.forEach(point => {
        const mirrored = getMirroredPoint(point.x, point.y, canvasWidth, canvasHeight, currentMirrorMode.id);
        
        const foundMatch = allPixels.some(otherPoint => {
            if (otherPoint === point) return false;
            const distance = Math.sqrt(
                Math.pow(otherPoint.x - mirrored.x, 2) + 
                Math.pow(otherPoint.y - mirrored.y, 2)
            );
            return distance <= tolerance;
        });
        
        if (foundMatch) {
            matchedPoints++;
        }
    });
    
    const totalPoints = allPixels.length;
    if (totalPoints === 0) return 0;
    
    const rawSimilarity = (matchedPoints / totalPoints) * 100;
    
    const strokeCount = drawingHistory.length;
    const strokeBonus = Math.min(strokeCount * 2, 10);
    
    const finalSimilarity = Math.round(
        rawSimilarity * 0.85 + 
        strokeBonus * 0.15
    );
    
    return Math.min(Math.max(finalSimilarity, 0), 100);
}

function showHint() {
    mirrorCtx.clearRect(0, 0, mirrorPreview.width, mirrorPreview.height);
    
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = referenceCanvas.width;
    tempCanvas.height = referenceCanvas.height;
    const tempCtx = tempCanvas.getContext('2d');
    
    levels[currentLevel - 1].draw(tempCtx, tempCanvas.width, tempCanvas.height);
    
    const imageData = tempCtx.getImageData(0, 0, tempCanvas.width, tempCanvas.height);
    const data = imageData.data;
    
    for (let y = 0; y < tempCanvas.height; y++) {
        for (let x = 0; x < tempCanvas.width; x++) {
            const idx = (y * tempCanvas.width + x) * 4;
            if (data[idx + 3] > 0) {
                const mirrored = getMirroredPoint(x, y, tempCanvas.width, tempCanvas.height, currentMirrorMode.id);
                const mx = Math.floor(mirrored.x);
                const my = Math.floor(mirrored.y);
                if (mx >= 0 && mx < tempCanvas.width && my >= 0 && my < tempCanvas.height) {
                    const midx = (my * tempCanvas.width + mx) * 4;
                    data[midx] = 231;
                    data[midx + 1] = 76;
                    data[midx + 2] = 60;
                    data[midx + 3] = 128;
                }
            }
        }
    }
    
    tempCtx.putImageData(imageData, 0, 0);
    mirrorCtx.drawImage(tempCanvas, 0, 0);
    
    showMessage(`已显示 ${currentMirrorMode.name} 提示`, 'info');
    
    setTimeout(() => {
        updateMirrorPreview();
    }, 3000);
}

function nextLevel() {
    if (currentLevel < levels.length) {
        loadLevel(currentLevel + 1);
    } else {
        showMessage('🎉 你已经完成了所有关卡！', 'success');
    }
}

function showMessage(text, type) {
    message.textContent = text;
    message.className = `message ${type}`;
}

init();
