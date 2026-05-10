const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const levelEl = document.getElementById('level');
const scoreEl = document.getElementById('score');
const targetEl = document.getElementById('target');
const timerEl = document.getElementById('timer');
const powerFillEl = document.getElementById('powerFill');
const gameOverEl = document.getElementById('gameOver');
const gameOverTitle = document.getElementById('gameOverTitle');
const gameOverMsg = document.getElementById('gameOverMsg');
const restartBtn = document.getElementById('restartBtn');
const playAgainBtn = document.getElementById('playAgainBtn');
const angleSlider = document.getElementById('angleSlider');
const angleValue = document.getElementById('angleValue');
const shootBtn = document.getElementById('shootBtn');

canvas.width = 900;
canvas.height = 600;

let gameState = {
    level: 1,
    score: 0,
    targetScore: 100,
    timeLeft: 60,
    isPlaying: true,
    isCharging: false,
    power: 0,
    powerDirection: 1,
    shootEffect: null,
    shootEffectTime: 0
};

const levels = [
    { targetScore: 100, time: 60, targetX: 700, targetSpeed: 0 },
    { targetScore: 150, time: 55, targetX: 750, targetSpeed: 1.5 },
    { targetScore: 200, time: 50, targetX: 750, targetSpeed: 2.5 },
    { targetScore: 280, time: 45, targetX: 750, targetSpeed: 3.5 },
    { targetScore: 380, time: 40, targetX: 750, targetSpeed: 4.5 }
];

const bow = {
    x: 100,
    y: canvas.height / 2,
    angle: 0,
    length: 60
};

let arrows = [];

let target = {
    x: 700,
    y: canvas.height / 2,
    radius: 80,
    speed: 0,
    direction: 1,
    minX: 600,
    maxX: 850
};

function initLevel() {
    const levelData = levels[Math.min(gameState.level - 1, levels.length - 1)];
    gameState.targetScore = levelData.targetScore;
    gameState.timeLeft = levelData.time;
    target.x = levelData.targetX;
    target.speed = levelData.targetSpeed;
    target.direction = 1;
    target.y = canvas.height / 2;
    arrows = [];
    
    levelEl.textContent = gameState.level;
    scoreEl.textContent = gameState.score;
    targetEl.textContent = gameState.targetScore;
    timerEl.textContent = gameState.timeLeft;
}

function drawBackground() {
    const gradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
    gradient.addColorStop(0, '#87CEEB');
    gradient.addColorStop(1, '#E0F7FA');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#4CAF50';
    ctx.fillRect(0, canvas.height - 50, canvas.width, 50);
    
    ctx.fillStyle = '#8B4513';
    ctx.fillRect(0, canvas.height - 50, canvas.width, 10);
}

function drawBow() {
    ctx.save();
    ctx.translate(bow.x, bow.y);
    ctx.rotate(bow.angle);
    
    const pullBack = (gameState.power / 100) * 40;
    
    // 弓身 - 多层阴影效果
    ctx.beginPath();
    ctx.arc(0, 0, bow.length + 2, -Math.PI / 3, Math.PI / 3);
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.lineWidth = 10;
    ctx.stroke();
    
    // 主弓身
    ctx.beginPath();
    ctx.arc(0, 0, bow.length, -Math.PI / 3, Math.PI / 3);
    const bowGradient = ctx.createLinearGradient(-bow.length, 0, bow.length, 0);
    bowGradient.addColorStop(0, '#5D3A1A');
    bowGradient.addColorStop(0.5, '#8B4513');
    bowGradient.addColorStop(1, '#5D3A1A');
    ctx.strokeStyle = bowGradient;
    ctx.lineWidth = 8;
    ctx.lineCap = 'round';
    ctx.stroke();
    
    // 弓弦 - 带发光效果
    ctx.beginPath();
    ctx.moveTo(0, -bow.length * 0.866);
    ctx.lineTo(-pullBack, 0);
    ctx.lineTo(0, bow.length * 0.866);
    
    // 弓弦阴影
    ctx.shadowColor = 'rgba(255, 255, 255, 0.8)';
    ctx.shadowBlur = 5;
    ctx.strokeStyle = '#F0F0F0';
    ctx.lineWidth = 4;
    ctx.stroke();
    ctx.shadowBlur = 0;
    
    // 蓄力时的箭（更精致的绘制）
    if (gameState.isCharging && gameState.power > 0) {
        // 箭杆渐变
        const arrowGradient = ctx.createLinearGradient(-pullBack - 50, 0, -pullBack, 0);
        arrowGradient.addColorStop(0, '#8B4513');
        arrowGradient.addColorStop(1, '#A0522D');
        ctx.fillStyle = arrowGradient;
        ctx.fillRect(-pullBack - 50, -3, 50, 6);
        
        // 箭头 - 金属质感
        ctx.beginPath();
        ctx.moveTo(-pullBack, 0);
        ctx.lineTo(-pullBack - 15, -10);
        ctx.lineTo(-pullBack - 12, 0);
        ctx.lineTo(-pullBack - 15, 10);
        ctx.closePath();
        const arrowheadGradient = ctx.createLinearGradient(-pullBack - 15, -10, -pullBack, 10);
        arrowheadGradient.addColorStop(0, '#555');
        arrowheadGradient.addColorStop(0.5, '#888');
        arrowheadGradient.addColorStop(1, '#444');
        ctx.fillStyle = arrowheadGradient;
        ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
        ctx.shadowBlur = 3;
        ctx.fill();
        ctx.shadowBlur = 0;
        
        // 箭羽 - 彩色渐变
        ctx.fillStyle = '#FF6B35';
        ctx.beginPath();
        ctx.moveTo(-pullBack - 50, 0);
        ctx.lineTo(-pullBack - 62, -8);
        ctx.lineTo(-pullBack - 50, -4);
        ctx.closePath();
        ctx.fill();
        
        ctx.fillStyle = '#FF8C42';
        ctx.beginPath();
        ctx.moveTo(-pullBack - 50, 0);
        ctx.lineTo(-pullBack - 62, 8);
        ctx.lineTo(-pullBack - 50, 4);
        ctx.closePath();
        ctx.fill();
        
        // 箭杆装饰线
        ctx.strokeStyle = '#D2691E';
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(-pullBack - 45, -2);
        ctx.lineTo(-pullBack - 15, -2);
        ctx.moveTo(-pullBack - 45, 2);
        ctx.lineTo(-pullBack - 15, 2);
        ctx.stroke();
    }
    
    ctx.restore();
}

function drawArrow(a) {
    ctx.save();
    ctx.translate(a.x, a.y);
    ctx.rotate(a.angle);
    
    // 箭的运动残影效果
    const speed = Math.sqrt(a.vx * a.vx + a.vy * a.vy);
    const trailLength = Math.min(speed * 3, 30);
    
    for (let i = 0; i < 3; i++) {
        const alpha = 0.3 - i * 0.1;
        if (alpha <= 0) break;
        
        ctx.globalAlpha = alpha;
        const trailOffset = -trailLength * (i + 1);
        const arrowGradient = ctx.createLinearGradient(-a.length + trailOffset, 0, trailOffset, 0);
        arrowGradient.addColorStop(0, 'rgba(139, 69, 19, 0)');
        arrowGradient.addColorStop(1, 'rgba(139, 69, 19, 0.5)');
        ctx.fillStyle = arrowGradient;
        ctx.fillRect(-a.length + trailOffset, -2, a.length, 4);
    }
    ctx.globalAlpha = 1;
    
    // 主箭杆
    const arrowGradient = ctx.createLinearGradient(-a.length, 0, 0, 0);
    arrowGradient.addColorStop(0, '#8B4513');
    arrowGradient.addColorStop(1, '#A0522D');
    ctx.fillStyle = arrowGradient;
    ctx.fillRect(-a.length, -3, a.length, 6);
    
    // 箭头 - 金属质感
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-15, -10);
    ctx.lineTo(-12, 0);
    ctx.lineTo(-15, 10);
    ctx.closePath();
    const arrowheadGradient = ctx.createLinearGradient(-15, -10, 0, 10);
    arrowheadGradient.addColorStop(0, '#555');
    arrowheadGradient.addColorStop(0.5, '#888');
    arrowheadGradient.addColorStop(1, '#444');
    ctx.fillStyle = arrowheadGradient;
    ctx.shadowColor = 'rgba(0, 0, 0, 0.5)';
    ctx.shadowBlur = 5;
    ctx.fill();
    ctx.shadowBlur = 0;
    
    // 箭羽
    ctx.fillStyle = '#FF6B35';
    ctx.beginPath();
    ctx.moveTo(-a.length, 0);
    ctx.lineTo(-a.length - 12, -8);
    ctx.lineTo(-a.length, -4);
    ctx.closePath();
    ctx.fill();
    
    ctx.fillStyle = '#FF8C42';
    ctx.beginPath();
    ctx.moveTo(-a.length, 0);
    ctx.lineTo(-a.length - 12, 8);
    ctx.lineTo(-a.length, 4);
    ctx.closePath();
    ctx.fill();
    
    // 箭杆装饰线
    ctx.strokeStyle = '#D2691E';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(-a.length + 5, -2);
    ctx.lineTo(-15, -2);
    ctx.moveTo(-a.length + 5, 2);
    ctx.lineTo(-15, 2);
    ctx.stroke();
    
    ctx.restore();
}

function drawTarget() {
    // 环数：靶心10分、内环8分、中环6分、外环4分
    const rings = [
        { radius: 80, color: '#FFF', score: 4 },
        { radius: 60, color: '#000', score: 6 },
        { radius: 40, color: '#00F', score: 8 },
        { radius: 20, color: '#FFD700', score: 10 }
    ];
    
    for (let i = 0; i < rings.length; i++) {
        ctx.beginPath();
        ctx.arc(target.x, target.y, rings[i].radius, 0, Math.PI * 2);
        ctx.fillStyle = rings[i].color;
        ctx.fill();
    }
}

function drawTrajectory() {
    if (!gameState.isCharging || gameState.power === 0) return;
    
    ctx.save();
    
    let x = bow.x;
    let y = bow.y;
    let vx = Math.cos(bow.angle) * gameState.power * 0.15;
    let vy = Math.sin(bow.angle) * gameState.power * 0.15;
    const gravity = 0.15;
    
    // 计算完整轨迹
    const trajectoryPoints = [{x, y}];
    for (let i = 0; i < 120; i++) {
        x += vx;
        y += vy;
        vy += gravity;
        trajectoryPoints.push({x, y});
        if (y > canvas.height + 50 || x > canvas.width + 50) break;
    }
    
    // 绘制渐变轨迹线
    ctx.beginPath();
    ctx.moveTo(trajectoryPoints[0].x, trajectoryPoints[0].y);
    for (let i = 1; i < trajectoryPoints.length; i++) {
        ctx.lineTo(trajectoryPoints[i].x, trajectoryPoints[i].y);
    }
    
    const trajectoryGradient = ctx.createLinearGradient(
        trajectoryPoints[0].x, trajectoryPoints[0].y,
        trajectoryPoints[trajectoryPoints.length - 1].x, 
        trajectoryPoints[trajectoryPoints.length - 1].y
    );
    trajectoryGradient.addColorStop(0, 'rgba(255, 215, 0, 0.9)');
    trajectoryGradient.addColorStop(0.5, 'rgba(255, 165, 0, 0.6)');
    trajectoryGradient.addColorStop(1, 'rgba(255, 100, 0, 0.3)');
    
    ctx.lineWidth = 4;
    ctx.strokeStyle = trajectoryGradient;
    ctx.setLineDash([8, 4]);
    ctx.lineCap = 'round';
    ctx.stroke();
    
    // 绘制轨迹点
    ctx.setLineDash([]);
    for (let i = 5; i < trajectoryPoints.length; i += 8) {
        const point = trajectoryPoints[i];
        const alpha = 1 - (i / trajectoryPoints.length) * 0.7;
        const radius = 4 + (1 - i / trajectoryPoints.length) * 4;
        
        ctx.beginPath();
        ctx.arc(point.x, point.y, radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 255, 255, ${alpha})`;
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(point.x, point.y, radius + 2, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(255, 215, 0, ${alpha * 0.5})`;
        ctx.lineWidth = 2;
        ctx.stroke();
    }
    
    // 绘制预测落点标记
    const lastPoint = trajectoryPoints[trajectoryPoints.length - 1];
    ctx.beginPath();
    ctx.arc(lastPoint.x, lastPoint.y, 12, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 0, 0, 0.3)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(255, 0, 0, 0.8)';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    // 落点十字线
    ctx.beginPath();
    ctx.moveTo(lastPoint.x - 15, lastPoint.y);
    ctx.lineTo(lastPoint.x + 15, lastPoint.y);
    ctx.moveTo(lastPoint.x, lastPoint.y - 15);
    ctx.lineTo(lastPoint.x, lastPoint.y + 15);
    ctx.strokeStyle = 'rgba(255, 0, 0, 0.6)';
    ctx.lineWidth = 2;
    ctx.stroke();
    
    ctx.restore();
}

function updatePower() {
    if (!gameState.isCharging) return;
    
    gameState.power += gameState.powerDirection * 3;
    if (gameState.power >= 100) {
        gameState.power = 100;
        gameState.powerDirection = -1;
    } else if (gameState.power <= 10) {
        gameState.power = 10;
        gameState.powerDirection = 1;
    }
    
    powerFillEl.style.width = gameState.power + '%';
}

function updateTarget() {
    if (target.speed === 0) return;
    
    // 改为水平移动
    target.x += target.speed * target.direction;
    
    if (target.x - target.radius < target.minX) {
        target.x = target.minX + target.radius;
        target.direction = 1;
    } else if (target.x + target.radius > target.maxX) {
        target.x = target.maxX - target.radius;
        target.direction = -1;
    }
}

function updateArrows() {
    const gravity = 0.15;
    
    for (let i = arrows.length - 1; i >= 0; i--) {
        const a = arrows[i];
        a.x += a.vx;
        a.y += a.vy;
        a.vy += gravity;
        a.angle = Math.atan2(a.vy, a.vx);
        
        const dx = a.x - target.x;
        const dy = a.y - target.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        
        if (dist < target.radius) {
            const rings = [
                { radius: 80, score: 4 },
                { radius: 60, score: 6 },
                { radius: 40, score: 8 },
                { radius: 20, score: 10 }
            ];
            
            let points = 0;
            for (const ring of rings) {
                if (dist <= ring.radius) {
                    points = ring.score;
                }
            }
            
            gameState.score += points;
            scoreEl.textContent = gameState.score;
            showScorePopup(a.x, a.y, points);
            arrows.splice(i, 1);
            
            if (gameState.score >= gameState.targetScore) {
                nextLevel();
            }
            continue;
        }
        
        if (a.x > canvas.width + 50 || a.y > canvas.height + 50) {
            arrows.splice(i, 1);
        }
    }
}

function showScorePopup(x, y, points) {
    const popup = document.createElement('div');
    popup.textContent = '+' + points;
    popup.style.position = 'fixed';
    popup.style.left = x + 'px';
    popup.style.top = y + 'px';
    popup.style.color = '#FFD700';
    popup.style.fontSize = '24px';
    popup.style.fontWeight = 'bold';
    popup.style.pointerEvents = 'none';
    popup.style.zIndex = '1000';
    popup.style.textShadow = '2px 2px 4px rgba(0,0,0,0.5)';
    document.body.appendChild(popup);
    
    let opacity = 1;
    let offsetY = 0;
    const animate = () => {
        opacity -= 0.02;
        offsetY -= 1;
        popup.style.opacity = opacity;
        popup.style.transform = `translateY(${offsetY}px)`;
        if (opacity > 0) {
            requestAnimationFrame(animate);
        } else {
            popup.remove();
        }
    };
    animate();
}

function shootArrow() {
    if (gameState.power === 0) return;
    
    const pullBack = (gameState.power / 100) * 40;
    const newArrow = {
        x: bow.x + Math.cos(bow.angle) * (-pullBack + 10),
        y: bow.y + Math.sin(bow.angle) * (-pullBack + 10),
        vx: Math.cos(bow.angle) * gameState.power * 0.15,
        vy: Math.sin(bow.angle) * gameState.power * 0.15,
        angle: bow.angle,
        length: 40
    };
    
    arrows.push(newArrow);
    
    // 创建发射特效
    gameState.shootEffect = {
        x: bow.x + Math.cos(bow.angle) * (-pullBack),
        y: bow.y + Math.sin(bow.angle) * (-pullBack),
        particles: [],
        radius: 5,
        maxRadius: 50 + gameState.power * 0.3
    };
    
    // 添加粒子
    for (let i = 0; i < 20; i++) {
        const angle = (Math.PI * 2 / 20) * i + Math.random() * 0.5;
        const speed = 2 + Math.random() * 4;
        gameState.shootEffect.particles.push({
            x: gameState.shootEffect.x,
            y: gameState.shootEffect.y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            life: 1,
            decay: 0.02 + Math.random() * 0.02,
            size: 2 + Math.random() * 4
        });
    }
    
    gameState.shootEffectTime = 1;
    gameState.power = 0;
    gameState.isCharging = false;
    powerFillEl.style.width = '0%';
}

function drawShootEffect() {
    if (!gameState.shootEffect || gameState.shootEffectTime <= 0) return;
    
    const effect = gameState.shootEffect;
    
    // 绘制扩散光环
    const expandRadius = (1 - gameState.shootEffectTime) * effect.maxRadius;
    const alpha = gameState.shootEffectTime * 0.8;
    
    ctx.beginPath();
    ctx.arc(effect.x, effect.y, expandRadius, 0, Math.PI * 2);
    const gradient = ctx.createRadialGradient(
        effect.x, effect.y, expandRadius * 0.5,
        effect.x, effect.y, expandRadius
    );
    gradient.addColorStop(0, `rgba(255, 200, 100, ${alpha})`);
    gradient.addColorStop(0.5, `rgba(255, 150, 50, ${alpha * 0.6})`);
    gradient.addColorStop(1, `rgba(255, 100, 0, 0)`);
    ctx.fillStyle = gradient;
    ctx.fill();
    
    // 绘制粒子
    effect.particles.forEach((particle, index) => {
        if (particle.life <= 0) return;
        
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * particle.life, 0, Math.PI * 2);
        
        const particleGradient = ctx.createRadialGradient(
            particle.x, particle.y, 0,
            particle.x, particle.y, particle.size * particle.life
        );
        particleGradient.addColorStop(0, `rgba(255, 255, 200, ${particle.life})`);
        particleGradient.addColorStop(0.5, `rgba(255, 200, 100, ${particle.life * 0.7})`);
        particleGradient.addColorStop(1, `rgba(255, 100, 0, 0)`);
        ctx.fillStyle = particleGradient;
        ctx.fill();
    });
}

function updateShootEffect() {
    if (!gameState.shootEffect || gameState.shootEffectTime <= 0) return;
    
    gameState.shootEffectTime -= 0.03;
    
    gameState.shootEffect.particles.forEach(particle => {
        particle.x += particle.vx;
        particle.y += particle.vy;
        particle.vy += 0.05;
        particle.life -= particle.decay;
    });
    
    if (gameState.shootEffectTime <= 0) {
        gameState.shootEffect = null;
    }
}

function nextLevel() {
    gameState.level++;
    if (gameState.level > levels.length) {
        gameWin();
    } else {
        initLevel();
    }
}

function gameOver() {
    gameState.isPlaying = false;
    gameOverTitle.textContent = '时间到！';
    gameOverMsg.textContent = `最终得分: ${gameState.score}`;
    gameOverEl.classList.remove('hidden');
}

function gameWin() {
    gameState.isPlaying = false;
    gameOverTitle.textContent = '恭喜通关！';
    gameOverMsg.textContent = `完美通关！总分: ${gameState.score}`;
    gameOverEl.classList.remove('hidden');
}

function resetGame() {
    gameState.level = 1;
    gameState.score = 0;
    gameState.isPlaying = true;
    gameState.isCharging = false;
    gameState.power = 0;
    angleSlider.value = 0;
    angleValue.textContent = '0°';
    bow.angle = 0;
    powerFillEl.style.width = '0%';
    gameOverEl.classList.add('hidden');
    initLevel();
}

let lastTime = 0;
let timerInterval = null;

function gameLoop(timestamp) {
    if (!gameState.isPlaying) {
        requestAnimationFrame(gameLoop);
        return;
    }
    
    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;
    
    drawBackground();
    drawTarget();
    drawBow();
    drawTrajectory();
    arrows.forEach(drawArrow);
    drawShootEffect();
    
    updatePower();
    updateTarget();
    updateArrows();
    updateShootEffect();
    
    requestAnimationFrame(gameLoop);
}

function startTimer() {
    timerInterval = setInterval(() => {
        if (!gameState.isPlaying) return;
        gameState.timeLeft--;
        timerEl.textContent = gameState.timeLeft;
        
        if (gameState.timeLeft <= 0) {
            clearInterval(timerInterval);
            gameOver();
        }
    }, 1000);
}

// 角度滑块事件
angleSlider.addEventListener('input', (e) => {
    const angleDeg = parseInt(e.target.value);
    bow.angle = angleDeg * Math.PI / 180;
    angleValue.textContent = angleDeg + '°';
});

// 蓄力按钮
shootBtn.addEventListener('mousedown', () => {
    if (!gameState.isPlaying) return;
    gameState.isCharging = true;
    gameState.power = 10;
    gameState.powerDirection = 1;
    shootBtn.classList.add('charging');
});

shootBtn.addEventListener('mouseup', () => {
    if (!gameState.isPlaying) return;
    shootBtn.classList.remove('charging');
    if (!gameState.isCharging) return;
    shootArrow();
});

shootBtn.addEventListener('mouseleave', () => {
    if (!gameState.isPlaying) return;
    shootBtn.classList.remove('charging');
    if (!gameState.isCharging) return;
    shootArrow();
});

// 触屏支持
shootBtn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    if (!gameState.isPlaying) return;
    gameState.isCharging = true;
    gameState.power = 10;
    gameState.powerDirection = 1;
    shootBtn.classList.add('charging');
});

shootBtn.addEventListener('touchend', (e) => {
    e.preventDefault();
    if (!gameState.isPlaying) return;
    shootBtn.classList.remove('charging');
    if (!gameState.isCharging) return;
    shootArrow();
});

restartBtn.addEventListener('click', resetGame);
playAgainBtn.addEventListener('click', resetGame);

initLevel();
startTimer();
requestAnimationFrame(gameLoop);
