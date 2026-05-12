const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const optionsContainer = document.getElementById('optionsContainer');
const messageEl = document.getElementById('message');
const currentLevelEl = document.getElementById('currentLevel');
const nextBtn = document.getElementById('nextBtn');
const retryBtn = document.getElementById('retryBtn');
const scoreDisplay = document.getElementById('scoreDisplay');
const currentScoreEl = document.getElementById('currentScore');
const modeBtns = document.querySelectorAll('.mode-btn');

let currentLevel = 1;
let currentShape = null;
let isGameOver = false;
let currentMode = 'basic';
let score = 0;
let gradientTimer = null;
let gradientStartTime = 0;
let currentBlur = 15;
let missingFeature = null;
let puzzleFragments = [];

const shapes = [
    {
        name: '圆形',
        draw: (ctx, x, y, size) => {
            ctx.beginPath();
            ctx.arc(x, y, size * 0.4, 0, Math.PI * 2);
            ctx.fill();
        },
        featureAreas: [
            { x: 0, y: -0.35, desc: '顶部圆弧' },
            { x: 0.35, y: 0, desc: '右侧圆弧' },
            { x: -0.35, y: 0, desc: '左侧圆弧' }
        ]
    },
    {
        name: '正方形',
        draw: (ctx, x, y, size) => {
            const half = size * 0.35;
            ctx.fillRect(x - half, y - half, half * 2, half * 2);
        },
        featureAreas: [
            { x: -0.25, y: -0.25, desc: '左上角' },
            { x: 0.25, y: -0.25, desc: '右上角' },
            { x: 0, y: -0.3, desc: '上边' }
        ]
    },
    {
        name: '三角形',
        draw: (ctx, x, y, size) => {
            ctx.beginPath();
            ctx.moveTo(x, y - size * 0.4);
            ctx.lineTo(x + size * 0.4, y + size * 0.3);
            ctx.lineTo(x - size * 0.4, y + size * 0.3);
            ctx.closePath();
            ctx.fill();
        },
        featureAreas: [
            { x: 0, y: -0.35, desc: '顶部尖角' },
            { x: 0.3, y: 0.2, desc: '右下角' },
            { x: -0.3, y: 0.2, desc: '左下角' }
        ]
    },
    {
        name: '菱形',
        draw: (ctx, x, y, size) => {
            ctx.beginPath();
            ctx.moveTo(x, y - size * 0.45);
            ctx.lineTo(x + size * 0.35, y);
            ctx.lineTo(x, y + size * 0.45);
            ctx.lineTo(x - size * 0.35, y);
            ctx.closePath();
            ctx.fill();
        },
        featureAreas: [
            { x: 0, y: -0.38, desc: '顶部尖角' },
            { x: 0.3, y: 0, desc: '右角' },
            { x: 0, y: 0.38, desc: '底部尖角' }
        ]
    },
    {
        name: '五边形',
        draw: (ctx, x, y, size) => {
            ctx.beginPath();
            for (let i = 0; i < 5; i++) {
                const angle = (i * 2 * Math.PI / 5) - Math.PI / 2;
                const px = x + size * 0.4 * Math.cos(angle);
                const py = y + size * 0.4 * Math.sin(angle);
                if (i === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
            }
            ctx.closePath();
            ctx.fill();
        },
        featureAreas: [
            { x: 0, y: -0.35, desc: '顶部角' },
            { x: 0.3, y: -0.1, desc: '右上角' },
            { x: -0.3, y: -0.1, desc: '左上角' }
        ]
    },
    {
        name: '六边形',
        draw: (ctx, x, y, size) => {
            ctx.beginPath();
            for (let i = 0; i < 6; i++) {
                const angle = (i * 2 * Math.PI / 6) - Math.PI / 2;
                const px = x + size * 0.4 * Math.cos(angle);
                const py = y + size * 0.4 * Math.sin(angle);
                if (i === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
            }
            ctx.closePath();
            ctx.fill();
        },
        featureAreas: [
            { x: 0, y: -0.35, desc: '顶部角' },
            { x: 0.35, y: -0.1, desc: '右上边' },
            { x: -0.35, y: -0.1, desc: '左上边' }
        ]
    },
    {
        name: '星星',
        draw: (ctx, x, y, size) => {
            ctx.beginPath();
            for (let i = 0; i < 10; i++) {
                const angle = (i * Math.PI / 5) - Math.PI / 2;
                const r = i % 2 === 0 ? size * 0.4 : size * 0.2;
                const px = x + r * Math.cos(angle);
                const py = y + r * Math.sin(angle);
                if (i === 0) ctx.moveTo(px, py);
                else ctx.lineTo(px, py);
            }
            ctx.closePath();
            ctx.fill();
        },
        featureAreas: [
            { x: 0, y: -0.38, desc: '顶部尖角' },
            { x: 0.35, y: -0.12, desc: '右尖角' },
            { x: -0.35, y: -0.12, desc: '左尖角' }
        ]
    },
    {
        name: '心形',
        draw: (ctx, x, y, size) => {
            const s = size * 0.015;
            ctx.beginPath();
            ctx.moveTo(x, y + 20 * s);
            ctx.bezierCurveTo(x - 25 * s, y - 10 * s, x - 25 * s, y - 30 * s, x, y - 15 * s);
            ctx.bezierCurveTo(x + 25 * s, y - 30 * s, x + 25 * s, y - 10 * s, x, y + 20 * s);
            ctx.fill();
        },
        featureAreas: [
            { x: 0, y: 0.25, desc: '底部尖角' },
            { x: -0.3, y: -0.2, desc: '左侧圆弧' },
            { x: 0.3, y: -0.2, desc: '右侧圆弧' }
        ]
    },
    {
        name: '月亮',
        draw: (ctx, x, y, size) => {
            ctx.beginPath();
            ctx.arc(x, y, size * 0.4, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalCompositeOperation = 'destination-out';
            ctx.beginPath();
            ctx.arc(x + size * 0.15, y - size * 0.1, size * 0.32, 0, Math.PI * 2);
            ctx.fill();
            ctx.globalCompositeOperation = 'source-over';
        },
        featureAreas: [
            { x: -0.3, y: 0, desc: '左侧弯弧' },
            { x: 0, y: -0.32, desc: '顶部弯弧' },
            { x: 0, y: 0.32, desc: '底部弯弧' }
        ]
    },
    {
        name: '云朵',
        draw: (ctx, x, y, size) => {
            const s = size * 0.01;
            ctx.beginPath();
            ctx.arc(x - 20 * s, y, 20 * s, 0, Math.PI * 2);
            ctx.arc(x, y - 15 * s, 25 * s, 0, Math.PI * 2);
            ctx.arc(x + 25 * s, y, 22 * s, 0, Math.PI * 2);
            ctx.arc(x + 5 * s, y + 8 * s, 18 * s, 0, Math.PI * 2);
            ctx.fill();
        },
        featureAreas: [
            { x: 0, y: -0.3, desc: '顶部圆弧' },
            { x: -0.3, y: 0, desc: '左侧圆弧' },
            { x: 0.32, y: 0, desc: '右侧圆弧' }
        ]
    },
    {
        name: '箭头',
        draw: (ctx, x, y, size) => {
            const s = size * 0.01;
            ctx.beginPath();
            ctx.moveTo(x - 25 * s, y);
            ctx.lineTo(x + 15 * s, y);
            ctx.lineTo(x + 15 * s, y - 15 * s);
            ctx.lineTo(x + 35 * s, y);
            ctx.lineTo(x + 15 * s, y + 15 * s);
            ctx.lineTo(x + 15 * s, y);
            ctx.closePath();
            ctx.fill();
        },
        featureAreas: [
            { x: 0.35, y: 0, desc: '箭头尖端' },
            { x: -0.25, y: 0, desc: '箭尾' },
            { x: 0.15, y: -0.12, desc: '箭头左上' }
        ]
    },
    {
        name: '太阳',
        draw: (ctx, x, y, size) => {
            const s = size * 0.01;
            ctx.beginPath();
            ctx.arc(x, y, 20 * s, 0, Math.PI * 2);
            ctx.fill();
            for (let i = 0; i < 8; i++) {
                const angle = (i * Math.PI / 4);
                const sx = x + Math.cos(angle) * 25 * s;
                const sy = y + Math.sin(angle) * 25 * s;
                const ex = x + Math.cos(angle) * 40 * s;
                const ey = y + Math.sin(angle) * 40 * s;
                ctx.beginPath();
                ctx.moveTo(sx, sy);
                ctx.lineTo(ex, ey);
                ctx.lineWidth = 4 * s;
                ctx.strokeStyle = ctx.fillStyle;
                ctx.stroke();
            }
        },
        featureAreas: [
            { x: 0, y: -0.35, desc: '顶部光芒' },
            { x: 0.35, y: 0, desc: '右侧光芒' },
            { x: -0.35, y: 0, desc: '左侧光芒' }
        ]
    },
    {
        name: '闪电',
        draw: (ctx, x, y, size) => {
            const s = size * 0.01;
            ctx.beginPath();
            ctx.moveTo(x + 5 * s, y - 35 * s);
            ctx.lineTo(x - 10 * s, y);
            ctx.lineTo(x + 5 * s, y);
            ctx.lineTo(x - 5 * s, y + 35 * s);
            ctx.lineTo(x + 20 * s, y - 5 * s);
            ctx.lineTo(x + 5 * s, y - 5 * s);
            ctx.closePath();
            ctx.fill();
        },
        featureAreas: [
            { x: 0.05, y: -0.32, desc: '顶部尖角' },
            { x: -0.05, y: 0.32, desc: '底部尖角' },
            { x: 0.15, y: -0.05, desc: '中间转折' }
        ]
    },
    {
        name: '房子',
        draw: (ctx, x, y, size) => {
            const s = size * 0.01;
            ctx.fillRect(x - 25 * s, y, 50 * s, 35 * s);
            ctx.beginPath();
            ctx.moveTo(x - 30 * s, y);
            ctx.lineTo(x, y - 30 * s);
            ctx.lineTo(x + 30 * s, y);
            ctx.closePath();
            ctx.fill();
        },
        featureAreas: [
            { x: 0, y: -0.25, desc: '屋顶尖' },
            { x: -0.25, y: 0, desc: '屋顶左角' },
            { x: 0.25, y: 0, desc: '屋顶右角' }
        ]
    },
    {
        name: '树',
        draw: (ctx, x, y, size) => {
            const s = size * 0.01;
            ctx.fillRect(x - 5 * s, y + 15 * s, 10 * s, 20 * s);
            ctx.beginPath();
            ctx.moveTo(x, y - 35 * s);
            ctx.lineTo(x + 25 * s, y + 15 * s);
            ctx.lineTo(x - 25 * s, y + 15 * s);
            ctx.closePath();
            ctx.fill();
        },
        featureAreas: [
            { x: 0, y: -0.32, desc: '树冠顶部' },
            { x: 0.2, y: 0.1, desc: '树冠右角' },
            { x: -0.2, y: 0.1, desc: '树冠左角' }
        ]
    },
    {
        name: '雨伞',
        draw: (ctx, x, y, size) => {
            const s = size * 0.01;
            ctx.beginPath();
            ctx.arc(x, y - 10 * s, 30 * s, Math.PI, 0);
            ctx.fill();
            ctx.fillRect(x - 2 * s, y - 10 * s, 4 * s, 35 * s);
            ctx.beginPath();
            ctx.arc(x + 5 * s, y + 25 * s, 5 * s, 0, Math.PI * 1.5);
            ctx.lineWidth = 3 * s;
            ctx.strokeStyle = ctx.fillStyle;
            ctx.stroke();
        },
        featureAreas: [
            { x: 0, y: -0.35, desc: '伞顶圆弧' },
            { x: -0.28, y: -0.08, desc: '伞左边缘' },
            { x: 0.28, y: -0.08, desc: '伞右边缘' }
        ]
    },
    {
        name: '彩虹',
        draw: (ctx, x, y, size) => {
            const s = size * 0.01;
            ctx.lineWidth = 5 * s;
            for (let i = 0; i < 5; i++) {
                ctx.beginPath();
                ctx.arc(x, y + 20 * s, 35 * s - i * 6 * s, Math.PI, 0);
                ctx.strokeStyle = ['#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff', '#9b59b6'][i];
                ctx.stroke();
            }
        },
        featureAreas: [
            { x: 0, y: -0.28, desc: '顶部弧' },
            { x: -0.3, y: 0.15, desc: '左端点' },
            { x: 0.3, y: 0.15, desc: '右端点' }
        ]
    },
    {
        name: '气球',
        draw: (ctx, x, y, size) => {
            const s = size * 0.01;
            ctx.beginPath();
            ctx.ellipse(x, y - 15 * s, 22 * s, 28 * s, 0, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.moveTo(x, y + 13 * s);
            ctx.quadraticCurveTo(x + 10 * s, y + 25 * s, x - 5 * s, y + 35 * s);
            ctx.lineWidth = 2 * s;
            ctx.strokeStyle = ctx.fillStyle;
            ctx.stroke();
        },
        featureAreas: [
            { x: 0, y: -0.38, desc: '气球顶部' },
            { x: -0.2, y: -0.15, desc: '气球左侧' },
            { x: 0.2, y: -0.15, desc: '气球右侧' }
        ]
    }
];

const positionNames = ['上方', '右上方', '右方', '右下方', '下方', '左下方', '左方', '左上方'];

function shuffleArray(array) {
    const arr = [...array];
    for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
}

function drawBlurredFragment() {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const size = Math.min(canvas.width, canvas.height);
    
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const colors = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe', '#43e97b', '#fa709a', '#fee140'];
    const shapeColor = colors[Math.floor(Math.random() * colors.length)];
    ctx.fillStyle = shapeColor;
    ctx.save();
    currentShape.draw(ctx, centerX, centerY, size);
    ctx.restore();
    
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext('2d');
    
    tempCtx.drawImage(canvas, 0, 0);
    
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const featureArea = currentShape.featureAreas[Math.floor(Math.random() * currentShape.featureAreas.length)];
    const clipX = centerX + featureArea.x * size + (Math.random() - 0.5) * 20;
    const clipY = centerY + featureArea.y * size + (Math.random() - 0.5) * 20;
    const clipRadius = 45 + Math.random() * 35;
    const blurAmount = 4 + Math.random() * 4;
    const featherAmount = 18 + Math.random() * 17;
    
    const maskCanvas = document.createElement('canvas');
    maskCanvas.width = canvas.width;
    maskCanvas.height = canvas.height;
    const maskCtx = maskCanvas.getContext('2d');
    
    const gradient = maskCtx.createRadialGradient(
        clipX, clipY, clipRadius - featherAmount,
        clipX, clipY, clipRadius
    );
    gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    
    maskCtx.fillStyle = gradient;
    maskCtx.beginPath();
    maskCtx.arc(clipX, clipY, clipRadius, 0, Math.PI * 2);
    maskCtx.fill();
    
    const blurredCanvas = document.createElement('canvas');
    blurredCanvas.width = canvas.width;
    blurredCanvas.height = canvas.height;
    const blurredCtx = blurredCanvas.getContext('2d');
    
    blurredCtx.filter = `blur(${blurAmount}px)`;
    blurredCtx.drawImage(tempCanvas, 0, 0);
    
    const resultCanvas = document.createElement('canvas');
    resultCanvas.width = canvas.width;
    resultCanvas.height = canvas.height;
    const resultCtx = resultCanvas.getContext('2d');
    
    resultCtx.drawImage(blurredCanvas, 0, 0);
    resultCtx.globalCompositeOperation = 'destination-in';
    resultCtx.drawImage(maskCanvas, 0, 0);
    resultCtx.globalCompositeOperation = 'source-over';
    
    ctx.drawImage(resultCanvas, 0, 0);
    
    ctx.strokeStyle = 'rgba(102, 126, 234, 0.15)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(clipX, clipY, clipRadius, 0, Math.PI * 2);
    ctx.stroke();
}

function drawReverseMode() {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const size = Math.min(canvas.width, canvas.height);
    
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const colors = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe', '#43e97b', '#fa709a', '#fee140'];
    const shapeColor = colors[Math.floor(Math.random() * colors.length)];
    ctx.fillStyle = shapeColor;
    ctx.save();
    currentShape.draw(ctx, centerX, centerY, size);
    ctx.restore();
    
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.drawImage(canvas, 0, 0);
    
    const missingIndex = Math.floor(Math.random() * currentShape.featureAreas.length);
    missingFeature = currentShape.featureAreas[missingIndex];
    
    const clipX = centerX + missingFeature.x * size + (Math.random() - 0.5) * 15;
    const clipY = centerY + missingFeature.y * size + (Math.random() - 0.5) * 15;
    const clipRadius = 50 + Math.random() * 25;
    
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(tempCanvas, 0, 0);
    
    ctx.fillStyle = '#f8f9fa';
    ctx.beginPath();
    ctx.arc(clipX, clipY, clipRadius, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.arc(clipX, clipY, clipRadius, 0, Math.PI * 2);
    ctx.stroke();
    ctx.setLineDash([]);
}

function drawPuzzleMode() {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const size = Math.min(canvas.width, canvas.height);
    
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const colors = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe', '#43e97b', '#fa709a', '#fee140'];
    const shapeColor = colors[Math.floor(Math.random() * colors.length)];
    ctx.fillStyle = shapeColor;
    ctx.save();
    currentShape.draw(ctx, centerX, centerY, size);
    ctx.restore();
    
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = canvas.width;
    tempCanvas.height = canvas.height;
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.drawImage(canvas, 0, 0);
    
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const numFragments = 2 + Math.floor(Math.random() * 2);
    const shuffledFeatures = shuffleArray([...currentShape.featureAreas]);
    puzzleFragments = shuffledFeatures.slice(0, numFragments);
    
    puzzleFragments.forEach((feature, index) => {
        const clipX = centerX + feature.x * size + (Math.random() - 0.5) * 15;
        const clipY = centerY + feature.y * size + (Math.random() - 0.5) * 15;
        const clipRadius = 40 + Math.random() * 20;
        const blurAmount = 3 + Math.random() * 3;
        const featherAmount = 15 + Math.random() * 10;
        
        const maskCanvas = document.createElement('canvas');
        maskCanvas.width = canvas.width;
        maskCanvas.height = canvas.height;
        const maskCtx = maskCanvas.getContext('2d');
        
        const gradient = maskCtx.createRadialGradient(
            clipX, clipY, clipRadius - featherAmount,
            clipX, clipY, clipRadius
        );
        gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
        gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        maskCtx.fillStyle = gradient;
        maskCtx.beginPath();
        maskCtx.arc(clipX, clipY, clipRadius, 0, Math.PI * 2);
        maskCtx.fill();
        
        const blurredCanvas = document.createElement('canvas');
        blurredCanvas.width = canvas.width;
        blurredCanvas.height = canvas.height;
        const blurredCtx = blurredCanvas.getContext('2d');
        
        blurredCtx.filter = `blur(${blurAmount}px)`;
        blurredCtx.drawImage(tempCanvas, 0, 0);
        
        const resultCanvas = document.createElement('canvas');
        resultCanvas.width = canvas.width;
        resultCanvas.height = canvas.height;
        const resultCtx = resultCanvas.getContext('2d');
        
        resultCtx.drawImage(blurredCanvas, 0, 0);
        resultCtx.globalCompositeOperation = 'destination-in';
        resultCtx.drawImage(maskCanvas, 0, 0);
        resultCtx.globalCompositeOperation = 'source-over';
        
        ctx.drawImage(resultCanvas, 0, 0);
        
        ctx.strokeStyle = 'rgba(102, 126, 234, 0.2)';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(clipX, clipY, clipRadius, 0, Math.PI * 2);
        ctx.stroke();
    });
}

function drawGradientMode(blurAmount) {
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const size = Math.min(canvas.width, canvas.height);
    
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    const colors = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe', '#43e97b', '#fa709a', '#fee140'];
    const shapeColor = colors[Math.floor(Math.random() * colors.length)];
    ctx.fillStyle = shapeColor;
    ctx.save();
    currentShape.draw(ctx, centerX, centerY, size);
    ctx.restore();
    
    if (blurAmount > 0) {
        const tempCanvas = document.createElement('canvas');
        tempCanvas.width = canvas.width;
        tempCanvas.height = canvas.height;
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.drawImage(canvas, 0, 0);
        
        ctx.fillStyle = '#f8f9fa';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.filter = `blur(${blurAmount}px)`;
        ctx.drawImage(tempCanvas, 0, 0);
        ctx.filter = 'none';
    }
}

function startGradientAnimation() {
    currentBlur = 8;
    gradientStartTime = Date.now();
    
    if (gradientTimer) clearInterval(gradientTimer);
    
    gradientTimer = setInterval(() => {
        const elapsed = (Date.now() - gradientStartTime) / 1000;
        currentBlur = Math.max(0, 8 - elapsed * 1.2);
        
        if (currentBlur <= 0) {
            clearInterval(gradientTimer);
            currentBlur = 0;
        }
        
        drawGradientMode(currentBlur);
    }, 50);
    
    drawGradientMode(currentBlur);
}

function createOptions() {
    const correctIndex = Math.floor(Math.random() * shapes.length);
    currentShape = shapes[correctIndex];
    
    let options = [currentShape];
    const otherShapes = shapes.filter(s => s.name !== currentShape.name);
    const shuffledOthers = shuffleArray(otherShapes);
    
    for (let i = 0; i < 3 && i < shuffledOthers.length; i++) {
        options.push(shuffledOthers[i]);
    }
    
    options = shuffleArray(options);
    
    optionsContainer.innerHTML = '';
    options.forEach(shape => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.textContent = shape.name;
        btn.onclick = () => checkAnswer(shape, btn);
        optionsContainer.appendChild(btn);
    });
}

function createReverseOptions() {
    let options = [missingFeature];
    const otherFeatures = currentShape.featureAreas.filter(f => f.desc !== missingFeature.desc);
    const shuffledOthers = shuffleArray(otherFeatures);
    
    for (let i = 0; i < 3 && i < shuffledOthers.length; i++) {
        options.push(shuffledOthers[i]);
    }
    
    options = shuffleArray(options);
    
    optionsContainer.innerHTML = '';
    options.forEach(feature => {
        const btn = document.createElement('button');
        btn.className = 'option-btn';
        btn.textContent = feature.desc;
        btn.onclick = () => checkReverseAnswer(feature, btn);
        optionsContainer.appendChild(btn);
    });
}

function checkAnswer(selectedShape, button) {
    if (isGameOver) return;
    
    const buttons = optionsContainer.querySelectorAll('.option-btn');
    buttons.forEach(btn => btn.disabled = true);
    
    if (selectedShape.name === currentShape.name) {
            button.classList.add('correct');
            if (currentMode === 'gradient') {
                const elapsed = (Date.now() - gradientStartTime) / 1000;
                const points = Math.max(10, Math.floor(100 - elapsed * 15));
                score += points;
                currentScoreEl.textContent = score;
                showMessage(`猜对了！+${points}分 🌟`, 'success');
            } else {
                showMessage('猜对了！真棒 🌟', 'success');
            }
            nextBtn.style.display = 'block';
        } else {
        button.classList.add('wrong');
        buttons.forEach(btn => {
            if (btn.textContent === currentShape.name) {
                btn.classList.add('correct');
            }
        });
        showMessage('再想想看 💭', 'error');
        retryBtn.style.display = 'block';
    }
    
    isGameOver = true;
    
    if (gradientTimer) {
        clearInterval(gradientTimer);
    }
}

function checkReverseAnswer(selectedFeature, button) {
    if (isGameOver) return;
    
    const buttons = optionsContainer.querySelectorAll('.option-btn');
    buttons.forEach(btn => btn.disabled = true);
    
    if (selectedFeature.desc === missingFeature.desc) {
        button.classList.add('correct');
        showMessage('猜对了！真棒 🌟', 'success');
        nextBtn.style.display = 'block';
    } else {
        button.classList.add('wrong');
        buttons.forEach(btn => {
            if (btn.textContent === missingFeature.desc) {
                btn.classList.add('correct');
            }
        });
        showMessage('再想想看 💭', 'error');
        retryBtn.style.display = 'block';
    }
    
    isGameOver = true;
}

function showMessage(text, type) {
    messageEl.textContent = text;
    messageEl.className = 'message ' + type;
}

function clearMessage() {
    messageEl.textContent = '';
    messageEl.className = 'message';
}

function initLevel() {
    isGameOver = false;
    currentLevelEl.textContent = currentLevel;
    clearMessage();
    nextBtn.style.display = 'none';
    retryBtn.style.display = 'none';
    
    if (gradientTimer) {
        clearInterval(gradientTimer);
    }
    
    switch (currentMode) {
        case 'basic':
            scoreDisplay.style.display = 'none';
            createOptions();
            drawBlurredFragment();
            break;
        case 'reverse':
            scoreDisplay.style.display = 'none';
            const correctIndex = Math.floor(Math.random() * shapes.length);
            currentShape = shapes[correctIndex];
            drawReverseMode();
            createReverseOptions();
            break;
        case 'puzzle':
            scoreDisplay.style.display = 'none';
            createOptions();
            drawPuzzleMode();
            break;
        case 'gradient':
            scoreDisplay.style.display = 'block';
            createOptions();
            startGradientAnimation();
            break;
    }
}

function switchMode(mode) {
    currentMode = mode;
    currentLevel = 1;
    score = 0;
    currentScoreEl.textContent = score;
    
    modeBtns.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.mode === mode);
    });
    
    initLevel();
}

nextBtn.onclick = () => {
    currentLevel++;
    initLevel();
};

retryBtn.onclick = () => {
    initLevel();
};

modeBtns.forEach(btn => {
    btn.onclick = () => switchMode(btn.dataset.mode);
});

initLevel();
