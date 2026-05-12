const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

let level = 1;
let timeLeft = 60;
let lines = [];
let cutCount = 0;
let isPlaying = false;
let isDrawing = false;
let drawPoints = [];
let animationId = null;
let timerInterval = null;

const colors = [
    '#f09595', '#9ac8eb', '#a8d5a2', '#f7cc7f', 
    '#c9a8d9', '#9cd0e3', '#eda5b8', '#c9b8a8'
];

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

class Line {
    constructor(x, speed, color) {
        this.x = x;
        this.y = -50;
        this.speed = speed;
        this.color = color;
        this.width = 3;
        this.height = 80 + Math.random() * 40;
        this.cut = false;
        this.cutY = null;
        this.alpha = 1;
    }

    update() {
        if (!this.cut) {
            this.y += this.speed;
        } else {
            this.alpha -= 0.02;
        }
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.strokeStyle = this.color;
        ctx.lineWidth = this.width;
        ctx.lineCap = 'round';

        if (!this.cut) {
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(this.x, this.y + this.height);
            ctx.stroke();
        } else {
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(this.x, this.cutY - 10);
            ctx.stroke();

            ctx.beginPath();
            ctx.moveTo(this.x, this.cutY + 10);
            ctx.lineTo(this.x, this.y + this.height);
            ctx.stroke();
        }

        ctx.restore();
    }

    isOffScreen() {
        return this.y > canvas.height && !this.cut;
    }

    isGone() {
        return this.alpha <= 0;
    }
}

function generateLines() {
    lines = [];
    let lineCount;
    if (level <= 3) {
        lineCount = 6;
    } else if (level <= 8) {
        lineCount = 8;
    } else {
        lineCount = 10;
    }
    
    const spacing = canvas.width / (lineCount + 1);
    const baseSpeed = 0.4 + level * 0.05;

    for (let i = 0; i < lineCount; i++) {
        const x = spacing * (i + 1) + (Math.random() - 0.5) * 20;
        const speed = baseSpeed + (Math.random() - 0.5) * 0.2;
        const color = colors[Math.floor(Math.random() * colors.length)];
        lines.push(new Line(x, speed, color));
    }

    cutCount = 0;
    updateUI();
}

function updateUI() {
    document.getElementById('level').textContent = level;
    document.getElementById('timer').textContent = timeLeft;
    document.getElementById('cut').textContent = cutCount;
    document.getElementById('total').textContent = lines.length;
}

function checkCollision(point1, point2) {
    for (let line of lines) {
        if (line.cut) continue;

        const lineTop = line.y;
        const lineBottom = line.y + line.height;
        const lineX = line.x;

        const minX = Math.min(point1.x, point2.x) - 20;
        const maxX = Math.max(point1.x, point2.x) + 20;
        const minY = Math.min(point1.y, point2.y) - 10;
        const maxY = Math.max(point1.y, point2.y) + 10;

        if (lineX >= minX && lineX <= maxX) {
            const checkY1 = point1.y;
            const checkY2 = point2.y;
            if ((checkY1 >= lineTop && checkY1 <= lineBottom) || (checkY2 >= lineTop && checkY2 <= lineBottom)) {
                line.cut = true;
                line.cutY = (point1.y + point2.y) / 2;
                cutCount++;
                updateUI();

                if (cutCount >= lines.length) {
                    winLevel();
                }
            }
        }
    }
}

function drawTrail() {
    if (drawPoints.length < 2) return;

    ctx.save();
    ctx.strokeStyle = '#9c8c7a';
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.globalAlpha = 0.6;

    ctx.beginPath();
    ctx.moveTo(drawPoints[0].x, drawPoints[0].y);
    for (let i = 1; i < drawPoints.length; i++) {
        ctx.lineTo(drawPoints[i].x, drawPoints[i].y);
    }
    ctx.stroke();

    ctx.restore();
}

function gameLoop() {
    ctx.fillStyle = 'rgba(248, 244, 235, 0.4)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    for (let i = lines.length - 1; i >= 0; i--) {
        lines[i].update();
        lines[i].draw();

        if (lines[i].isOffScreen()) {
            retryLevel();
            return;
        }

        if (lines[i].isGone()) {
            lines.splice(i, 1);
        }
    }

    drawTrail();

    animationId = requestAnimationFrame(gameLoop);
}

function startTimer() {
    timerInterval = setInterval(() => {
        timeLeft--;
        updateUI();

        if (timeLeft <= 0) {
            retryLevel();
        }
    }, 1000);
}

function stopTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

function startGame() {
    document.getElementById('start-screen').classList.add('hidden');
    level = 1;
    startLevel();
}

function startLevel() {
    timeLeft = 60 + level * 10;
    generateLines();
    isPlaying = true;
    startTimer();
    gameLoop();
}

function retryLevel() {
    isPlaying = false;
    stopTimer();
    if (animationId) {
        cancelAnimationFrame(animationId);
    }
    document.getElementById('retry-screen').classList.remove('hidden');
}

function winLevel() {
    isPlaying = false;
    stopTimer();
    if (animationId) {
        cancelAnimationFrame(animationId);
    }
    document.getElementById('win-screen').classList.remove('hidden');
}

function nextLevel() {
    document.getElementById('win-screen').classList.add('hidden');
    level++;
    startLevel();
}

function doRetry() {
    document.getElementById('retry-screen').classList.add('hidden');
    startLevel();
}

function getPointerPos(e) {
    const rect = canvas.getBoundingClientRect();
    if (e.touches) {
        return {
            x: e.touches[0].clientX - rect.left,
            y: e.touches[0].clientY - rect.top
        };
    }
    return {
        x: e.clientX - rect.left,
        y: e.clientY - rect.top
    };
}

function handleStart(e) {
    if (!isPlaying) return;
    e.preventDefault();
    isDrawing = true;
    drawPoints = [getPointerPos(e)];
}

function handleMove(e) {
    if (!isDrawing || !isPlaying) return;
    e.preventDefault();
    const newPoint = getPointerPos(e);
    const lastPoint = drawPoints[drawPoints.length - 1];
    
    drawPoints.push(newPoint);
    
    if (drawPoints.length > 2) {
        checkCollision(lastPoint, newPoint);
    }

    if (drawPoints.length > 20) {
        drawPoints.shift();
    }
}

function handleEnd(e) {
    isDrawing = false;
    drawPoints = [];
}

canvas.addEventListener('mousedown', handleStart);
canvas.addEventListener('mousemove', handleMove);
canvas.addEventListener('mouseup', handleEnd);
canvas.addEventListener('mouseleave', handleEnd);

canvas.addEventListener('touchstart', handleStart, { passive: false });
canvas.addEventListener('touchmove', handleMove, { passive: false });
canvas.addEventListener('touchend', handleEnd);
canvas.addEventListener('touchcancel', handleEnd);

document.getElementById('start-btn').addEventListener('click', startGame);
document.getElementById('retry-btn').addEventListener('click', doRetry);
document.getElementById('next-btn').addEventListener('click', nextLevel);

function drawInitialBackground() {
    ctx.fillStyle = '#f8f4eb';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
}

drawInitialBackground();
