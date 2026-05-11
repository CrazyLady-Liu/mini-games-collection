const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const gameMessage = document.getElementById('gameMessage');
const progressEl = document.getElementById('progress');
const resetBtn = document.getElementById('resetBtn');

const CANVAS_WIDTH = 600;
const CANVAS_HEIGHT = 600;
const PLAYER_RADIUS = 15;
const PATH_WIDTH = 80;
const BORDER_MARGIN = 50;

let player = { x: 0, y: 0 };
let obstacles = [];
let gameState = { running: true, angle: 0, completed: false };
let keys = {};
let isDragging = false;
let startAngle = 0;
let lastAngle = 0;

function init() {
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    
    player.x = CANVAS_WIDTH / 2;
    player.y = BORDER_MARGIN + PATH_WIDTH / 2;
    startAngle = getAngle(player.x, player.y);
    lastAngle = startAngle;
    gameState = { running: true, angle: 0, completed: false };
    
    obstacles = [];
    generateObstacles();
    
    gameMessage.classList.remove('show', 'win', 'lose');
    updateProgress(0);
    
    gameLoop();
}

function getAngle(x, y) {
    const centerX = CANVAS_WIDTH / 2;
    const centerY = CANVAS_HEIGHT / 2;
    return Math.atan2(y - centerY, x - centerX);
}

function generateObstacles() {
    const centerX = CANVAS_WIDTH / 2;
    const centerY = CANVAS_HEIGHT / 2;
    const innerRadius = (CANVAS_WIDTH - 2 * BORDER_MARGIN - PATH_WIDTH) / 2;
    const outerRadius = innerRadius + PATH_WIDTH;
    const pathRadius = innerRadius + PATH_WIDTH / 2;
    
    const numObstacles = 15;
    const minObstacleSize = 8;
    const maxObstacleSize = 18;
    const safeZoneWidth = PLAYER_RADIUS * 3;
    const minObstacleDistance = 50;
    
    const safeInnerRadius = pathRadius - safeZoneWidth / 2;
    const safeOuterRadius = pathRadius + safeZoneWidth / 2;
    
    for (let i = 0; i < numObstacles; i++) {
        let validPosition = false;
        let attempts = 0;
        let obsX, obsY, obsSize, obsAngle;
        
        while (!validPosition && attempts < 100) {
            attempts++;
            obsAngle = (i / numObstacles) * Math.PI * 2 + Math.random() * 0.4 - 0.2;
            
            const side = Math.random() < 0.5 ? 'inner' : 'outer';
            let distFromCenter;
            
            if (side === 'inner') {
                const innerMin = innerRadius + maxObstacleSize + 5;
                const innerMax = safeInnerRadius - maxObstacleSize - 5;
                distFromCenter = innerMin + Math.random() * (innerMax - innerMin);
            } else {
                const outerMin = safeOuterRadius + maxObstacleSize + 5;
                const outerMax = outerRadius - maxObstacleSize - 5;
                distFromCenter = outerMin + Math.random() * (outerMax - outerMin);
            }
            
            obsX = centerX + Math.cos(obsAngle) * distFromCenter;
            obsY = centerY + Math.sin(obsAngle) * distFromCenter;
            obsSize = minObstacleSize + Math.random() * (maxObstacleSize - minObstacleSize);
            
            validPosition = true;
            for (const existing of obstacles) {
                const dist = Math.sqrt((obsX - existing.x) ** 2 + (obsY - existing.y) ** 2);
                if (dist < obsSize + existing.size + minObstacleDistance) {
                    validPosition = false;
                    break;
                }
            }
        }
        
        if (validPosition) {
            obstacles.push({ x: obsX, y: obsY, size: obsSize, angle: obsAngle });
        }
    }
}

function movePlayer(dx, dy) {
    if (!gameState.running) return;
    
    const newX = player.x + dx;
    const newY = player.y + dy;
    
    const centerX = CANVAS_WIDTH / 2;
    const centerY = CANVAS_HEIGHT / 2;
    const innerRadius = (CANVAS_WIDTH - 2 * BORDER_MARGIN - PATH_WIDTH) / 2;
    const outerRadius = innerRadius + PATH_WIDTH;
    const dist = Math.sqrt((newX - centerX) ** 2 + (newY - centerY) ** 2);
    
    if (dist >= innerRadius + PLAYER_RADIUS && dist <= outerRadius - PLAYER_RADIUS) {
        player.x = newX;
        player.y = newY;
        updateAngle();
    }
}

function updateAngle() {
    const currentAngle = getAngle(player.x, player.y);
    let delta = currentAngle - lastAngle;
    
    if (delta > Math.PI) delta -= 2 * Math.PI;
    if (delta < -Math.PI) delta += 2 * Math.PI;
    
    gameState.angle += delta;
    lastAngle = currentAngle;
    
    const progress = Math.abs((gameState.angle / (Math.PI * 2)) * 100);
    updateProgress(Math.min(progress, 100));
    
    if (Math.abs(gameState.angle) >= Math.PI * 2) {
        gameWin();
    }
}

function updateProgress(value) {
    progressEl.textContent = Math.floor(value);
}

function checkCollision() {
    if (!gameState.running) return;
    
    for (const obs of obstacles) {
        const dist = Math.sqrt((player.x - obs.x) ** 2 + (player.y - obs.y) ** 2);
        if (dist < PLAYER_RADIUS + obs.size) {
            gameLose();
            return;
        }
    }
}

function gameWin() {
    gameState.running = false;
    gameState.completed = true;
    gameMessage.textContent = '🎉 通关成功！';
    gameMessage.classList.add('show', 'win');
}

function gameLose() {
    gameState.running = false;
    gameMessage.textContent = '💥 碰撞失败！';
    gameMessage.classList.add('show', 'lose');
}

function draw() {
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    const centerX = CANVAS_WIDTH / 2;
    const centerY = CANVAS_HEIGHT / 2;
    const innerRadius = (CANVAS_WIDTH - 2 * BORDER_MARGIN - PATH_WIDTH) / 2;
    const outerRadius = innerRadius + PATH_WIDTH;
    const pathRadius = innerRadius + PATH_WIDTH / 2;
    const safeZoneWidth = PLAYER_RADIUS * 3;
    const safeInnerRadius = pathRadius - safeZoneWidth / 2;
    const safeOuterRadius = pathRadius + safeZoneWidth / 2;
    
    const bgGradient = ctx.createRadialGradient(centerX, centerY, innerRadius, centerX, centerY, outerRadius);
    bgGradient.addColorStop(0, '#e8f5e9');
    bgGradient.addColorStop(0.5, '#c8e6c9');
    bgGradient.addColorStop(1, '#a5d6a7');
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, outerRadius, 0, Math.PI * 2);
    ctx.arc(centerX, centerY, innerRadius, 0, Math.PI * 2, true);
    ctx.fillStyle = bgGradient;
    ctx.fill();
    ctx.strokeStyle = '#66bb6a';
    ctx.lineWidth = 3;
    ctx.stroke();
    
    const safeGradient = ctx.createRadialGradient(centerX, centerY, safeInnerRadius, centerX, centerY, safeOuterRadius);
    safeGradient.addColorStop(0, 'rgba(102, 187, 106, 0.1)');
    safeGradient.addColorStop(0.5, 'rgba(102, 187, 106, 0.2)');
    safeGradient.addColorStop(1, 'rgba(102, 187, 106, 0.1)');
    
    ctx.beginPath();
    ctx.arc(centerX, centerY, safeOuterRadius, 0, Math.PI * 2);
    ctx.arc(centerX, centerY, safeInnerRadius, 0, Math.PI * 2, true);
    ctx.fillStyle = safeGradient;
    ctx.fill();
    ctx.setLineDash([6, 4]);
    ctx.strokeStyle = 'rgba(102, 187, 106, 0.5)';
    ctx.lineWidth = 1.5;
    ctx.stroke();
    ctx.setLineDash([]);
    
    for (const obs of obstacles) {
        const gradient = ctx.createRadialGradient(
            obs.x - obs.size * 0.3, 
            obs.y - obs.size * 0.3, 
            0, 
            obs.x, 
            obs.y, 
            obs.size
        );
        gradient.addColorStop(0, '#ff8a80');
        gradient.addColorStop(0.5, '#ef5350');
        gradient.addColorStop(1, '#e53935');
        
        ctx.beginPath();
        ctx.arc(obs.x, obs.y, obs.size, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.globalAlpha = 0.85;
        ctx.fill();
        ctx.globalAlpha = 1;
        
        ctx.strokeStyle = 'rgba(198, 40, 40, 0.6)';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        ctx.beginPath();
        ctx.arc(obs.x - obs.size * 0.3, obs.y - obs.size * 0.3, obs.size * 0.25, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.fill();
    }
    
    const playerGradient = ctx.createRadialGradient(
        player.x - PLAYER_RADIUS * 0.3, 
        player.y - PLAYER_RADIUS * 0.3, 
        0, 
        player.x, 
        player.y, 
        PLAYER_RADIUS
    );
    playerGradient.addColorStop(0, '#64b5f6');
    playerGradient.addColorStop(0.5, '#42a5f5');
    playerGradient.addColorStop(1, '#1e88e5');
    
    ctx.beginPath();
    ctx.arc(player.x, player.y, PLAYER_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = playerGradient;
    ctx.fill();
    ctx.strokeStyle = '#1565c0';
    ctx.lineWidth = 3;
    ctx.stroke();
    
    ctx.beginPath();
    ctx.arc(player.x - 5, player.y - 5, 5, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.fill();
}

function gameLoop() {
    if (keys['ArrowUp'] || keys['w'] || keys['W']) movePlayer(0, -5);
    if (keys['ArrowDown'] || keys['s'] || keys['S']) movePlayer(0, 5);
    if (keys['ArrowLeft'] || keys['a'] || keys['A']) movePlayer(-5, 0);
    if (keys['ArrowRight'] || keys['d'] || keys['D']) movePlayer(5, 0);
    
    checkCollision();
    draw();
    
    if (gameState.running) {
        requestAnimationFrame(gameLoop);
    }
}

document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

canvas.addEventListener('mousedown', (e) => {
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const dist = Math.sqrt((x - player.x) ** 2 + (y - player.y) ** 2);
    if (dist <= PLAYER_RADIUS + 10) {
        isDragging = true;
    }
});

canvas.addEventListener('mousemove', (e) => {
    if (isDragging && gameState.running) {
        const rect = canvas.getBoundingClientRect();
        const targetX = e.clientX - rect.left;
        const targetY = e.clientY - rect.top;
        const dx = targetX - player.x;
        const dy = targetY - player.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 0) {
            const speed = Math.min(dist, 8);
            movePlayer((dx / dist) * speed, (dy / dist) * speed);
        }
    }
});

canvas.addEventListener('mouseup', () => {
    isDragging = false;
});

canvas.addEventListener('mouseleave', () => {
    isDragging = false;
});

canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    const touch = e.touches[0];
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    const dist = Math.sqrt((x - player.x) ** 2 + (y - player.y) ** 2);
    if (dist <= PLAYER_RADIUS + 20) {
        isDragging = true;
    }
});

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (isDragging && gameState.running) {
        const rect = canvas.getBoundingClientRect();
        const touch = e.touches[0];
        const targetX = touch.clientX - rect.left;
        const targetY = touch.clientY - rect.top;
        const dx = targetX - player.x;
        const dy = targetY - player.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist > 0) {
            const speed = Math.min(dist, 8);
            movePlayer((dx / dist) * speed, (dy / dist) * speed);
        }
    }
});

canvas.addEventListener('touchend', () => {
    isDragging = false;
});

resetBtn.addEventListener('click', init);

init();
