const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const statusEl = document.getElementById('status');
const winCountEl = document.getElementById('win-count');
const levelEl = document.getElementById('level');
const scoreEl = document.getElementById('score');
const resetBtn = document.getElementById('resetBtn');
const newGameBtn = document.getElementById('newGameBtn');
const diffBtns = document.querySelectorAll('.diff-btn');

const CANVAS_SIZE = 380;
const POINT_RADIUS = 25;

const DIFFICULTIES = {
    easy: {
        minObstacleCount: 4,
        maxObstacleCount: 6,
        obstacleRadius: 18,
        safeZoneWidth: 50,
        minObstacleDistance: 55,
        minDistance: 250,
        pointsPerLevel: 100,
        spreadFactor: 1.3
    },
    normal: {
        minObstacleCount: 7,
        maxObstacleCount: 9,
        obstacleRadius: 20,
        safeZoneWidth: 40,
        minObstacleDistance: 50,
        minDistance: 220,
        pointsPerLevel: 200,
        spreadFactor: 1.1
    },
    hard: {
        minObstacleCount: 10,
        maxObstacleCount: 14,
        obstacleRadius: 22,
        safeZoneWidth: 30,
        minObstacleDistance: 48,
        minDistance: 200,
        pointsPerLevel: 350,
        spreadFactor: 0.9
    }
};

let gameState = {
    startPoint: { x: 0, y: 0 },
    endPoint: { x: 0, y: 0 },
    obstacles: [],
    path: [],
    isDrawing: false,
    gameOver: false,
    gameWon: false,
    winCount: 0,
    level: 1,
    score: 0,
    startedFromStart: false,
    difficulty: 'easy',
    animationTime: 0,
    particles: []
};

class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.vx = (Math.random() - 0.5) * 4;
        this.vy = (Math.random() - 0.5) * 4;
        this.life = 1;
        this.decay = 0.02 + Math.random() * 0.02;
        this.size = 3 + Math.random() * 5;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.life -= this.decay;
        this.size *= 0.98;
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = this.color.replace('1)', `${this.life})`);
        ctx.fill();
    }
}

function initCanvas() {
    canvas.width = CANVAS_SIZE;
    canvas.height = CANVAS_SIZE;
}

function randomPoint() {
    const margin = POINT_RADIUS + 30;
    return {
        x: margin + Math.random() * (CANVAS_SIZE - 2 * margin),
        y: margin + Math.random() * (CANVAS_SIZE - 2 * margin)
    };
}

function distance(p1, p2) {
    return Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
}

function distanceToLine(point, lineStart, lineEnd) {
    const A = point.x - lineStart.x;
    const B = point.y - lineStart.y;
    const C = lineEnd.x - lineStart.x;
    const D = lineEnd.y - lineStart.y;

    const dot = A * C + B * D;
    const lenSq = C * C + D * D;
    let param = -1;

    if (lenSq !== 0) param = dot / lenSq;

    let xx, yy;

    if (param < 0) {
        xx = lineStart.x;
        yy = lineStart.y;
    } else if (param > 1) {
        xx = lineEnd.x;
        yy = lineEnd.y;
    } else {
        xx = lineStart.x + param * C;
        yy = lineStart.y + param * D;
    }

    return {
        distance: distance(point, { x: xx, y: yy }),
        param: param
    };
}

function generatePoints() {
    const config = DIFFICULTIES[gameState.difficulty];
    gameState.startPoint = randomPoint();
    let attempts = 0;
    do {
        gameState.endPoint = randomPoint();
        attempts++;
    } while (distance(gameState.startPoint, gameState.endPoint) < config.minDistance && attempts < 100);
}

function isInSafeZone(obstacle, config) {
    const lineCheck = distanceToLine(obstacle, gameState.startPoint, gameState.endPoint);
    if (lineCheck.param >= 0 && lineCheck.param <= 1) {
        const forbiddenStart = Math.max(0.05, 0.1 - gameState.level * 0.005);
        const forbiddenEnd = Math.min(0.95, 0.9 + gameState.level * 0.005);
        
        if (lineCheck.param > forbiddenStart && lineCheck.param < forbiddenEnd) {
            if (lineCheck.distance < config.safeZoneWidth + config.obstacleRadius) {
                return true;
            }
        }
    }
    return false;
}

function generateObstacles() {
    gameState.obstacles = [];
    const config = DIFFICULTIES[gameState.difficulty];
    
    const midX = (gameState.startPoint.x + gameState.endPoint.x) / 2;
    const midY = (gameState.startPoint.y + gameState.endPoint.y) / 2;
    
    const lineLength = distance(gameState.startPoint, gameState.endPoint);
    const spread = Math.min(150, lineLength * 0.6) + gameState.level * 3;
    
    const targetCount = Math.min(
        config.maxObstacleCount,
        config.minObstacleCount + Math.floor(gameState.level * 0.3)
    );
    
    const zones = [
        { angleOffset: Math.PI / 2, multiplier: config.spreadFactor },
        { angleOffset: -Math.PI / 2, multiplier: config.spreadFactor }
    ];
    
    let zoneIndex = 0;
    
    for (let i = 0; i < targetCount; i++) {
        let obstacle;
        let valid = false;
        let attempts = 0;
        
        while (!valid && attempts < 200) {
            let zone = zones[zoneIndex % zones.length];
            
            const baseAngle = Math.atan2(
                gameState.endPoint.y - gameState.startPoint.y,
                gameState.endPoint.x - gameState.startPoint.x);
            const angleVariation = (Math.random() - 0.5) * Math.PI * 0.8;
            const angle = baseAngle + zone.angleOffset + angleVariation;
            
            const dist = (Math.random() * 0.6 + 0.4) * spread * zone.multiplier;
            
            const distFromMid = Math.random() * 0.6 - 0.3;
            const offsetX = (gameState.endPoint.x - gameState.startPoint.x) * distFromMid;
            const offsetY = (gameState.endPoint.y - gameState.startPoint.y) * distFromMid;
            
            obstacle = {
                x: midX + offsetX + Math.cos(angle) * dist,
                y: midY + offsetY + Math.sin(angle) * dist,
                pulse: Math.random() * Math.PI * 2
            };
            
            if (obstacle.x < 35 || obstacle.x > CANVAS_SIZE - 35 || 
                obstacle.y < 35 || obstacle.y > CANVAS_SIZE - 35) {
                attempts++;
                continue;
            }
            
            valid = true;
            
            if (isInSafeZone(obstacle, config)) {
                valid = false;
            }
            
            if (distance(obstacle, gameState.startPoint) < POINT_RADIUS + config.obstacleRadius + 25) {
                valid = false;
            }
            if (distance(obstacle, gameState.endPoint) < POINT_RADIUS + config.obstacleRadius + 25) {
                valid = false;
            }
            
            for (const obs of gameState.obstacles) {
                if (distance(obstacle, obs) < config.minObstacleDistance) {
                    valid = false;
                    break;
                }
            }
            
            attempts++;
        }
        
        if (valid) {
            gameState.obstacles.push(obstacle);
            zoneIndex++;
        }
    }
    
    if (gameState.obstacles.length < config.minObstacleCount) {
        for (let i = gameState.obstacles.length; i < config.minObstacleCount; i++) {
            let obstacle;
            let valid = false;
            let attempts = 0;
            
            while (!valid && attempts < 250) {
                const angle = Math.random() * Math.PI * 2;
                const dist = (Math.random() * 0.8 + 0.2) * spread;
                
                obstacle = {
                    x: midX + Math.cos(angle) * dist,
                    y: midY + Math.sin(angle) * dist,
                    pulse: Math.random() * Math.PI * 2
                };
                
                if (obstacle.x < 35 || obstacle.x > CANVAS_SIZE - 35 || 
                    obstacle.y < 35 || obstacle.y > CANVAS_SIZE - 35) {
                    attempts++;
                    continue;
                }
                
                valid = true;
                
                if (isInSafeZone(obstacle, config)) {
                    valid = false;
                }
                
                if (distance(obstacle, gameState.startPoint) < POINT_RADIUS + config.obstacleRadius + 25) {
                    valid = false;
                }
                if (distance(obstacle, gameState.endPoint) < POINT_RADIUS + config.obstacleRadius + 25) {
                    valid = false;
                }
                
                for (const obs of gameState.obstacles) {
                    if (distance(obstacle, obs) < config.minObstacleDistance) {
                        valid = false;
                        break;
                    }
                }
                
                attempts++;
            }
            
            if (valid) {
                gameState.obstacles.push(obstacle);
            }
        }
    }
}

function drawGlow(x, y, radius, color, innerRadius) {
    const gradient = ctx.createRadialGradient(x, y, innerRadius || 0, x, y, radius);
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, 'transparent');
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = gradient;
    ctx.fill();
}

function drawCircle(x, y, radius, color, innerColor, borderColor) {
    if (innerColor) {
        drawGlow(x, y, radius * 1.5, innerColor, radius * 0.5);
    }
    
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, Math.PI * 2);
    ctx.fillStyle = color;
    ctx.fill();
    
    if (borderColor) {
        ctx.strokeStyle = borderColor;
        ctx.lineWidth = 3;
        ctx.stroke();
    }
}

function draw() {
    const config = DIFFICULTIES[gameState.difficulty];
    
    ctx.clearRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    
    ctx.fillStyle = '#f8f9fa';
    ctx.fillRect(0, 0, CANVAS_SIZE, CANVAS_SIZE);
    
    ctx.strokeStyle = '#e9ecef';
    ctx.lineWidth = 1;
    for (let i = 0; i < CANVAS_SIZE; i += 40) {
        ctx.beginPath();
        ctx.moveTo(i, 0);
        ctx.lineTo(i, CANVAS_SIZE);
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(CANVAS_SIZE, i);
        ctx.stroke();
    }
    
    const angle = Math.atan2(
        gameState.endPoint.y - gameState.startPoint.y,
        gameState.endPoint.x - gameState.startPoint.x
    );
    const perpAngle = angle + Math.PI / 2;
    const safeW = config.safeZoneWidth;
    
    const p1x = gameState.startPoint.x + Math.cos(perpAngle) * safeW;
    const p1y = gameState.startPoint.y + Math.sin(perpAngle) * safeW;
    const p2x = gameState.endPoint.x + Math.cos(perpAngle) * safeW;
    const p2y = gameState.endPoint.y + Math.sin(perpAngle) * safeW;
    const p3x = gameState.endPoint.x - Math.cos(perpAngle) * safeW;
    const p3y = gameState.endPoint.y - Math.sin(perpAngle) * safeW;
    const p4x = gameState.startPoint.x - Math.cos(perpAngle) * safeW;
    const p4y = gameState.startPoint.y - Math.sin(perpAngle) * safeW;
    
    ctx.beginPath();
    ctx.moveTo(p1x, p1y);
    ctx.lineTo(p2x, p2y);
    ctx.lineTo(p3x, p3y);
    ctx.lineTo(p4x, p4y);
    ctx.closePath();
    ctx.fillStyle = 'rgba(74, 222, 128, 0.08)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(74, 222, 128, 0.3)';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    ctx.setLineDash([12, 8]);
    ctx.strokeStyle = 'rgba(102, 126, 234, 0.4)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(gameState.startPoint.x, gameState.startPoint.y);
    ctx.lineTo(gameState.endPoint.x, gameState.endPoint.y);
    ctx.stroke();
    ctx.setLineDash([]);
    
    for (const obs of gameState.obstacles) {
        obs.pulse += 0.05;
        const pulseScale = 1 + Math.sin(obs.pulse) * 0.05;
        const r = config.obstacleRadius * pulseScale;
        
        drawGlow(obs.x, obs.y, r * 2, 'rgba(239, 68, 68, 0.2)');
        drawCircle(obs.x, obs.y, r, '#ef4444', 'rgba(239, 68, 68, 0.3)', '#dc2626');
        drawCircle(obs.x, obs.y, r * 0.5, '#fca5a5');
        
        ctx.fillStyle = 'white';
        ctx.font = 'bold 16px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('!', obs.x, obs.y);
    }
    
    drawCircle(gameState.startPoint.x, gameState.startPoint.y, POINT_RADIUS, '#4ade80', 'rgba(74, 222, 128, 0.3)', '#22c55e');
    drawCircle(gameState.startPoint.x, gameState.startPoint.y, POINT_RADIUS * 0.5, '#86efac');
    
    drawCircle(gameState.endPoint.x, gameState.endPoint.y, POINT_RADIUS, '#60a5fa', 'rgba(96, 165, 250, 0.3)', '#3b82f6');
    drawCircle(gameState.endPoint.x, gameState.endPoint.y, POINT_RADIUS * 0.5, '#93c5fd');
    
    if (gameState.path.length > 1) {
        ctx.beginPath();
        ctx.moveTo(gameState.path[0].x, gameState.path[0].y);
        for (let i = 1; i < gameState.path.length; i++) {
            ctx.lineTo(gameState.path[i].x, gameState.path[i].y);
        }
        ctx.strokeStyle = gameState.gameWon ? '#4ade80' : (gameState.gameOver ? '#ef4444' : '#667eea');
        ctx.lineWidth = 10;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.lineDashOffset = -gameState.animationTime;
        ctx.setLineDash([15, 5]);
        ctx.stroke();
        ctx.setLineDash([]);
        
        ctx.lineWidth = 6;
        ctx.strokeStyle = gameState.gameWon ? 'rgba(74, 222, 128, 0.5)' : 
                         (gameState.gameOver ? 'rgba(239, 68, 68, 0.5)' : 'rgba(102, 126, 234, 0.5)');
        ctx.globalAlpha = 0.3;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.lineWidth = 4;
        ctx.stroke();
        ctx.globalAlpha = 1;
    }
    
    for (let i = gameState.particles.length - 1; i >= 0; i--) {
        gameState.particles[i].update();
        gameState.particles[i].draw(ctx);
        if (gameState.particles[i].life <= 0) {
            gameState.particles.splice(i, 1);
        }
    }
    
    ctx.fillStyle = 'white';
    ctx.font = 'bold 14px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('起点', gameState.startPoint.x, gameState.startPoint.y);
    ctx.fillText('终点', gameState.endPoint.x, gameState.endPoint.y);
    
    gameState.animationTime += 0.5;
}

function checkCollisionWithObstacles(point) {
    const config = DIFFICULTIES[gameState.difficulty];
    for (const obs of gameState.obstacles) {
        if (distance(point, obs) < config.obstacleRadius + 5) {
            for (let i = 0; i < 15; i++) {
                gameState.particles.push(new Particle(obs.x, obs.y, 'rgba(239, 68, 68, '));
            }
            return true;
        }
    }
    return false;
}

function checkWin(point) {
    if (distance(point, gameState.endPoint) < POINT_RADIUS) {
        for (let i = 0; i < 20; i++) {
            gameState.particles.push(new Particle(gameState.endPoint.x, gameState.endPoint.y, 'rgba(74, 222, 128, '));
        }
        return true;
    }
    return false;
}

function getPosition(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    let clientX, clientY;
    if (e.touches && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
    } else {
        clientX = e.clientX;
        clientY = e.clientY;
    }

    return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY
    };
}

function handleStart(e) {
    e.preventDefault();
    if (gameState.gameOver || gameState.gameWon) return;

    const pos = getPosition(e);

    if (distance(pos, gameState.startPoint) < POINT_RADIUS) {
        gameState.isDrawing = true;
        gameState.startedFromStart = true;
        gameState.path = [pos];
        statusEl.textContent = '正在画线...';
        draw();
    }
}

function handleMove(e) {
    e.preventDefault();
    if (!gameState.isDrawing || gameState.gameOver || gameState.gameWon) return;

    const pos = getPosition(e);
    gameState.path.push(pos);

    if (checkCollisionWithObstacles(pos)) {
        gameState.isDrawing = false;
        gameState.gameOver = true;
        statusEl.textContent = '💥 碰到干扰点了！';
        draw();
        setTimeout(resetLevel, 1500);
        return;
    }

    if (checkWin(pos) && gameState.startedFromStart) {
        gameState.isDrawing = false;
        gameState.gameWon = true;
        gameState.winCount++;
        winCountEl.textContent = gameState.winCount;
        
        const config = DIFFICULTIES[gameState.difficulty];
        const levelBonus = gameState.level * 10;
        gameState.score += config.pointsPerLevel + levelBonus;
        scoreEl.textContent = gameState.score;
        
        statusEl.textContent = `🎉 太棒了！+${config.pointsPerLevel + levelBonus}分`;
        draw();
        setTimeout(nextLevel, 1500);
        return;
    }

    draw();
}

function handleEnd(e) {
    e.preventDefault();
    if (gameState.gameOver || gameState.gameWon) return;

    if (gameState.isDrawing && !gameState.gameWon) {
        gameState.isDrawing = false;
        if (!gameState.gameWon) {
            statusEl.textContent = '未到达终点，请重新尝试';
        }
    }
}

function nextLevel() {
    gameState.level++;
    levelEl.textContent = gameState.level;
    resetLevel();
    statusEl.textContent = `第 ${gameState.level} 关 - 开始！`;
}

function resetLevel() {
    gameState.path = [];
    gameState.isDrawing = false;
    gameState.gameOver = false;
    gameState.gameWon = false;
    gameState.startedFromStart = false;
    gameState.particles = [];

    generatePoints();
    generateObstacles();
    if (!gameState.gameWon && !gameState.gameOver) {
        statusEl.textContent = `第 ${gameState.level} 关 - 按住并从起点画到终点`;
    }
    draw();
}

function resetGame() {
    gameState.level = 1;
    gameState.score = 0;
    gameState.winCount = 0;
    levelEl.textContent = '1';
    scoreEl.textContent = '0';
    winCountEl.textContent = '0';
    resetLevel();
}

function setDifficulty(diff) {
    gameState.difficulty = diff;
    diffBtns.forEach(btn => btn.classList.remove('active'));
    document.querySelector(`[data-diff="${diff}"]`).classList.add('active');
    resetLevel();
}

function initGame() {
    initCanvas();
    
    canvas.addEventListener('mousedown', handleStart);
    canvas.addEventListener('mousemove', handleMove);
    canvas.addEventListener('mouseup', handleEnd);
    canvas.addEventListener('mouseleave', handleEnd);

    canvas.addEventListener('touchstart', handleStart);
    canvas.addEventListener('touchmove', handleMove);
    canvas.addEventListener('touchend', handleEnd);

    resetBtn.addEventListener('click', resetLevel);
    newGameBtn.addEventListener('click', resetGame);
    
    diffBtns.forEach(btn => {
        btn.addEventListener('click', () => setDifficulty(btn.dataset.diff));
    });
    
    resetGame();
    
    function animate() {
        if (gameState.particles.length > 0) {
            draw();
        }
        requestAnimationFrame(animate);
    }
    animate();
}

initGame();
