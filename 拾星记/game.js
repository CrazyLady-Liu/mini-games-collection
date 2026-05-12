const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const finalScoreElement = document.getElementById('finalScore');
const startScreen = document.getElementById('startScreen');
const gameOverScreen = document.getElementById('gameOverScreen');
const pauseScreen = document.getElementById('pauseScreen');
const startBtn = document.getElementById('startBtn');
const pauseBtn = document.getElementById('pauseBtn');
const restartBtn = document.getElementById('restartBtn');
const gameOverRestartBtn = document.getElementById('gameOverRestartBtn');
const gameContainer = document.querySelector('.game-container');

const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 600;
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

let gameRunning = false;
let gamePaused = false;
let score = 0;
let animationId;

const player = {
    x: CANVAS_WIDTH / 2 - 25,
    y: CANVAS_HEIGHT - 70,
    width: 50,
    height: 50,
    speed: 8,
    dx: 0
};

const stars = [];
const obstacles = [];

const keys = {
    left: false,
    right: false
};

function initGame() {
    score = 0;
    scoreElement.textContent = score;
    player.x = CANVAS_WIDTH / 2 - 25;
    player.dx = 0;
    stars.length = 0;
    obstacles.length = 0;
}

function drawPlayer() {
    ctx.save();
    
    const centerX = player.x + player.width / 2;
    const centerY = player.y + player.height / 2;
    
    ctx.fillStyle = '#4fc3f7';
    ctx.beginPath();
    ctx.arc(centerX, centerY, 20, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.moveTo(centerX, player.y);
    ctx.lineTo(centerX - 15, player.y + 15);
    ctx.lineTo(centerX + 15, player.y + 15);
    ctx.closePath();
    ctx.fill();
    
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(centerX - 7, centerY - 5, 5, 0, Math.PI * 2);
    ctx.arc(centerX + 7, centerY - 5, 5, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.fillStyle = '#333';
    ctx.beginPath();
    ctx.arc(centerX - 7, centerY - 5, 2, 0, Math.PI * 2);
    ctx.arc(centerX + 7, centerY - 5, 2, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.restore();
}

function drawStar(star) {
    ctx.save();
    ctx.translate(star.x + star.size / 2, star.y + star.size / 2);
    ctx.rotate(star.rotation);
    
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, star.size / 2);
    gradient.addColorStop(0, '#fff8e0');
    gradient.addColorStop(0.5, '#f5e6c8');
    gradient.addColorStop(1, '#e8d4a8');
    
    ctx.fillStyle = gradient;
    ctx.shadowColor = 'rgba(245, 230, 200, 0.6)';
    ctx.shadowBlur = 12;
    
    ctx.beginPath();
    for (let i = 0; i < 5; i++) {
        const angle = (i * Math.PI * 2) / 5 - Math.PI / 2;
        const x = Math.cos(angle) * (star.size / 2);
        const y = Math.sin(angle) * (star.size / 2);
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
        const innerAngle = angle + Math.PI / 5;
        const innerX = Math.cos(innerAngle) * (star.size / 4);
        const innerY = Math.sin(innerAngle) * (star.size / 4);
        ctx.lineTo(innerX, innerY);
    }
    ctx.closePath();
    ctx.fill();
    
    ctx.restore();
}

function drawObstacle(obstacle) {
    ctx.save();
    ctx.translate(obstacle.x + obstacle.size / 2, obstacle.y + obstacle.size / 2);
    ctx.rotate(obstacle.rotation);
    
    const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, obstacle.size / 2);
    gradient.addColorStop(0, '#ff6b6b');
    gradient.addColorStop(1, '#c44040');
    
    ctx.fillStyle = gradient;
    ctx.shadowColor = 'rgba(255, 100, 100, 0.4)';
    ctx.shadowBlur = 8;
    
    const halfSize = obstacle.size / 2;
    const radius = 4;
    ctx.beginPath();
    ctx.moveTo(-halfSize + radius, -halfSize);
    ctx.lineTo(halfSize - radius, -halfSize);
    ctx.quadraticCurveTo(halfSize, -halfSize, halfSize, -halfSize + radius);
    ctx.lineTo(halfSize, halfSize - radius);
    ctx.quadraticCurveTo(halfSize, halfSize, halfSize - radius, halfSize);
    ctx.lineTo(-halfSize + radius, halfSize);
    ctx.quadraticCurveTo(-halfSize, halfSize, -halfSize, halfSize - radius);
    ctx.lineTo(-halfSize, -halfSize + radius);
    ctx.quadraticCurveTo(-halfSize, -halfSize, -halfSize + radius, -halfSize);
    ctx.closePath();
    ctx.fill();
    
    ctx.restore();
}

function spawnStar() {
    const size = 30 + Math.random() * 20;
    stars.push({
        x: Math.random() * (CANVAS_WIDTH - size),
        y: -size,
        size: size,
        speed: 2 + Math.random() * 3,
        rotation: 0
    });
}

function spawnObstacle() {
    const size = 35 + Math.random() * 15;
    obstacles.push({
        x: Math.random() * (CANVAS_WIDTH - size),
        y: -size,
        size: size,
        speed: 3 + Math.random() * 4,
        rotation: 0
    });
}

function updatePlayer() {
    if (keys.left) {
        player.dx = -player.speed;
    } else if (keys.right) {
        player.dx = player.speed;
    } else {
        player.dx = 0;
    }
    
    player.x += player.dx;
    
    if (player.x < 0) {
        player.x = 0;
    }
    if (player.x + player.width > CANVAS_WIDTH) {
        player.x = CANVAS_WIDTH - player.width;
    }
}

function updateStars() {
    for (let i = stars.length - 1; i >= 0; i--) {
        const star = stars[i];
        star.y += star.speed;
        star.rotation += 0.05;
        
        if (checkCollision(player, star)) {
            score += 10;
            scoreElement.textContent = score;
            stars.splice(i, 1);
        } else if (star.y > CANVAS_HEIGHT) {
            stars.splice(i, 1);
        }
    }
}

function updateObstacles() {
    for (let i = obstacles.length - 1; i >= 0; i--) {
        const obstacle = obstacles[i];
        obstacle.y += obstacle.speed;
        obstacle.rotation += 0.03;
        
        if (checkCollision(player, obstacle)) {
            triggerShake();
            gameOver();
            return;
        } else if (obstacle.y > CANVAS_HEIGHT) {
            obstacles.splice(i, 1);
        }
    }
}

function checkCollision(rect1, rect2) {
    const r1 = {
        x: rect1.x,
        y: rect1.y,
        width: rect1.width,
        height: rect1.height
    };
    const r2 = {
        x: rect2.x,
        y: rect2.y,
        width: rect2.size,
        height: rect2.size
    };
    
    return r1.x < r2.x + r2.width &&
           r1.x + r1.width > r2.x &&
           r1.y < r2.y + r2.height &&
           r1.y + r1.height > r2.y;
}

function triggerShake() {
    gameContainer.classList.add('shake');
    setTimeout(() => {
        gameContainer.classList.remove('shake');
    }, 300);
}

function drawBackground() {
    const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    gradient.addColorStop(0, '#0a0f1a');
    gradient.addColorStop(0.4, '#0d1424');
    gradient.addColorStop(1, '#101830');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    for (let i = 0; i < 60; i++) {
        const x = (i * 37 + 10) % CANVAS_WIDTH;
        const y = (i * 23 + 5) % CANVAS_HEIGHT;
        const size = 0.5 + (i % 3) * 0.3;
        const alpha = 0.2 + (i % 5) * 0.1;
        
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(200, 210, 230, ${alpha})`;
        ctx.fill();
    }
}

let lastStarSpawn = 0;
let lastObstacleSpawn = 0;

function gameLoop(timestamp) {
    if (!gameRunning || gamePaused) return;
    
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    drawBackground();
    
    if (timestamp - lastStarSpawn > 800) {
        spawnStar();
        lastStarSpawn = timestamp;
    }
    
    if (timestamp - lastObstacleSpawn > 2000) {
        spawnObstacle();
        lastObstacleSpawn = timestamp;
    }
    
    updatePlayer();
    updateStars();
    updateObstacles();
    
    stars.forEach(drawStar);
    obstacles.forEach(drawObstacle);
    drawPlayer();
    
    animationId = requestAnimationFrame(gameLoop);
}

function togglePause() {
    if (!gameRunning) return;
    
    gamePaused = !gamePaused;
    
    if (gamePaused) {
        cancelAnimationFrame(animationId);
        pauseScreen.classList.remove('hidden');
        pauseBtn.textContent = '继续';
    } else {
        pauseScreen.classList.add('hidden');
        pauseBtn.textContent = '暂停';
        const now = performance.now();
        lastStarSpawn = now;
        lastObstacleSpawn = now;
        animationId = requestAnimationFrame(gameLoop);
    }
}

function resetGame() {
    gameRunning = false;
    gamePaused = false;
    cancelAnimationFrame(animationId);
    initGame();
    pauseBtn.textContent = '暂停';
    startScreen.classList.remove('hidden');
    gameOverScreen.classList.add('hidden');
    pauseScreen.classList.add('hidden');
    drawBackground();
    drawPlayer();
}

function startGame() {
    initGame();
    startScreen.classList.add('hidden');
    gameOverScreen.classList.add('hidden');
    pauseScreen.classList.add('hidden');
    gameRunning = true;
    gamePaused = false;
    pauseBtn.textContent = '暂停';
    lastStarSpawn = 0;
    lastObstacleSpawn = 0;
    animationId = requestAnimationFrame(gameLoop);
}

function gameOver() {
    gameRunning = false;
    gamePaused = false;
    cancelAnimationFrame(animationId);
    pauseScreen.classList.add('hidden');
    finalScoreElement.textContent = score;
    gameOverScreen.classList.remove('hidden');
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'Left') {
        keys.left = true;
    }
    if (e.key === 'ArrowRight' || e.key === 'Right') {
        keys.right = true;
    }
});

document.addEventListener('keyup', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'Left') {
        keys.left = false;
    }
    if (e.key === 'ArrowRight' || e.key === 'Right') {
        keys.right = false;
    }
});

startBtn.addEventListener('click', startGame);
pauseBtn.addEventListener('click', togglePause);
restartBtn.addEventListener('click', resetGame);
gameOverRestartBtn.addEventListener('click', startGame);

drawBackground();
drawPlayer();
