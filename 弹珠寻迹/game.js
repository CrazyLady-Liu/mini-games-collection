const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const levelDisplay = document.getElementById('level');
const powerDisplay = document.getElementById('powerDisplay');
const angleDisplay = document.getElementById('angleDisplay');
const winMessage = document.getElementById('winMessage');
const speedSlider = document.getElementById('speedSlider');
const speedValue = document.getElementById('speedValue');
const speedBtns = document.querySelectorAll('.speed-btn');
const pauseBtn = document.getElementById('pauseBtn');
const pauseOverlay = document.getElementById('pauseOverlay');

const CONFIG = {
    canvasWidth: 800,
    canvasHeight: 600,
    ballRadius: 12,
    minPower: 5,
    maxPower: 25,
    gravity: 0.15,
    friction: 0.99,
    restitution: 0.8,
    paddleWidth: 80,
    paddleHeight: 16,
    targetRadius: 25
};

canvas.width = CONFIG.canvasWidth;
canvas.height = CONFIG.canvasHeight;

let gameState = {
    level: 1,
    ball: null,
    paddles: [],
    target: null,
    isDragging: false,
    isLaunched: false,
    launchAngle: -Math.PI / 4,
    launchPower: 15,
    particles: [],
    speedMultiplier: 1.5,
    isPaused: false
};

class Ball {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.vx = 0;
        this.vy = 0;
        this.radius = CONFIG.ballRadius;
        this.trail = [];
    }

    update() {
        this.vy += CONFIG.gravity * gameState.speedMultiplier;
        this.vx *= Math.pow(CONFIG.friction, gameState.speedMultiplier);
        this.vy *= Math.pow(CONFIG.friction, gameState.speedMultiplier);
        this.x += this.vx * gameState.speedMultiplier;
        this.y += this.vy * gameState.speedMultiplier;

        this.trail.push({ x: this.x, y: this.y });
        if (this.trail.length > 30) this.trail.shift();

        if (this.x - this.radius < 0) {
            this.x = this.radius;
            this.vx = -this.vx * CONFIG.restitution;
        }
        if (this.x + this.radius > canvas.width) {
            this.x = canvas.width - this.radius;
            this.vx = -this.vx * CONFIG.restitution;
        }
        if (this.y - this.radius < 0) {
            this.y = this.radius;
            this.vy = -this.vy * CONFIG.restitution;
        }
        if (this.y + this.radius > canvas.height) {
            this.y = canvas.height - this.radius;
            this.vy = -this.vy * CONFIG.restitution;
        }
    }

    draw() {
        ctx.beginPath();
        for (let i = 0; i < this.trail.length; i++) {
            const alpha = i / this.trail.length * 0.5;
            const radius = this.radius * (i / this.trail.length);
            ctx.fillStyle = `rgba(0, 212, 255, ${alpha})`;
            ctx.beginPath();
            ctx.arc(this.trail[i].x, this.trail[i].y, radius, 0, Math.PI * 2);
            ctx.fill();
        }

        const gradient = ctx.createRadialGradient(
            this.x - 4, this.y - 4, 0,
            this.x, this.y, this.radius
        );
        gradient.addColorStop(0, '#00d4ff');
        gradient.addColorStop(1, '#0066aa');
        
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
        
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius + 5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 212, 255, 0.2)';
        ctx.fill();
    }
}

class Paddle {
    constructor(x, y, width, height, angle = 0, type = 'normal') {
        this.x = x;
        this.y = y;
        this.originalX = x;
        this.originalY = y;
        this.width = width;
        this.height = height;
        this.angle = angle;
        this.type = type;
        
        this.movePhase = Math.random() * Math.PI * 2;
        this.moveSpeed = 0.02 + Math.random() * 0.03;
        this.moveRange = 30 + Math.random() * 40;
        this.moveDirection = Math.random() > 0.5 ? 'horizontal' : 'vertical';
        
        this.softDistortion = 0;
        this.softness = 0.6 + Math.random() * 0.4;
        
        this.oneWayDirection = Math.random() > 0.5 ? 1 : -1;
    }

    update() {
        if (this.type === 'moving' && !gameState.isPaused) {
            this.movePhase += this.moveSpeed * gameState.speedMultiplier;
            if (this.moveDirection === 'horizontal') {
                this.x = this.originalX + Math.sin(this.movePhase) * this.moveRange;
            } else {
                this.y = this.originalY + Math.sin(this.movePhase) * this.moveRange;
            }
        }
        
        if (this.type === 'soft' && this.softDistortion > 0) {
            this.softDistortion *= 0.92;
            if (this.softDistortion < 0.1) this.softDistortion = 0;
        }
    }

    draw() {
        ctx.save();
        ctx.translate(this.x + this.width / 2, this.y + this.height / 2);
        ctx.rotate(this.angle);
        
        let gradient, color1, color2, strokeColor;
        
        switch(this.type) {
            case 'moving':
                color1 = '#9b59b6';
                color2 = '#8e44ad';
                strokeColor = 'rgba(180, 120, 255, 0.8)';
                break;
            case 'soft':
                color1 = '#3498db';
                color2 = '#2980b9';
                strokeColor = 'rgba(100, 180, 255, 0.8)';
                break;
            case 'oneway':
                color1 = '#2ecc71';
                color2 = '#27ae60';
                strokeColor = 'rgba(100, 255, 150, 0.8)';
                break;
            default:
                color1 = '#ff6b6b';
                color2 = '#ff8e53';
                strokeColor = 'rgba(255, 255, 255, 0.5)';
        }
        
        gradient = ctx.createLinearGradient(-this.width / 2, 0, this.width / 2, 0);
        gradient.addColorStop(0, color1);
        gradient.addColorStop(0.5, color2);
        gradient.addColorStop(1, color1);
        
        ctx.fillStyle = gradient;
        
        if (this.type === 'soft' && this.softDistortion > 0) {
            ctx.beginPath();
            const segments = 12;
            for (let i = 0; i <= segments; i++) {
                const t = i / segments;
                const x = -this.width / 2 + t * this.width;
                const distortion = Math.sin(t * Math.PI) * this.softDistortion * 15;
                if (i === 0) {
                    ctx.moveTo(x, -this.height / 2 - distortion);
                } else {
                    ctx.lineTo(x, -this.height / 2 - distortion);
                }
            }
            for (let i = segments; i >= 0; i--) {
                const t = i / segments;
                const x = -this.width / 2 + t * this.width;
                const distortion = Math.sin(t * Math.PI) * this.softDistortion * 15;
                ctx.lineTo(x, this.height / 2 + distortion);
            }
            ctx.closePath();
            ctx.fill();
        } else {
            ctx.fillRect(-this.width / 2, -this.height / 2, this.width, this.height);
        }
        
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 2;
        
        if (this.type === 'oneway') {
            ctx.beginPath();
            const arrowSize = this.height * 0.4;
            const arrowX = this.oneWayDirection * this.width * 0.2;
            ctx.moveTo(arrowX - arrowSize, -arrowSize / 2);
            ctx.lineTo(arrowX + arrowSize, 0);
            ctx.lineTo(arrowX - arrowSize, arrowSize / 2);
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.lineWidth = 2;
            ctx.stroke();
            
            ctx.strokeStyle = strokeColor;
            ctx.strokeRect(-this.width / 2, -this.height / 2, this.width, this.height);
        } else if (this.type === 'moving') {
            ctx.setLineDash([5, 3]);
            ctx.strokeRect(-this.width / 2, -this.height / 2, this.width, this.height);
            ctx.setLineDash([]);
        } else {
            ctx.strokeRect(-this.width / 2, -this.height / 2, this.width, this.height);
        }
        
        if (this.type === 'soft') {
            ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
            ctx.font = 'bold 12px Arial';
            ctx.textAlign = 'center';
            ctx.fillText('SOFT', 0, 4);
        }
        
        ctx.restore();
    }

    checkCollision(ball) {
        const cx = this.x + this.width / 2;
        const cy = this.y + this.height / 2;
        const cos = Math.cos(-this.angle);
        const sin = Math.sin(-this.angle);
        
        const localX = cos * (ball.x - cx) - sin * (ball.y - cy);
        const localY = sin * (ball.x - cx) + cos * (ball.y - cy);
        const prevLocalX = cos * (ball.x - ball.vx * gameState.speedMultiplier - cx) - sin * (ball.y - ball.vy * gameState.speedMultiplier - cy);
        const prevLocalY = sin * (ball.x - ball.vx * gameState.speedMultiplier - cx) + cos * (ball.y - ball.vy * gameState.speedMultiplier - cy);
        
        const halfW = this.width / 2 + ball.radius;
        const halfH = this.height / 2 + ball.radius;
        
        if (Math.abs(localX) > halfW || Math.abs(localY) > halfH) return false;
        
        if (this.type === 'oneway') {
            const movingDirection = this.oneWayDirection > 0 ? 1 : -1;
            const ballApproachDir = localX - prevLocalX;
            if (ballApproachDir * movingDirection > 0) {
                return false;
            }
        }
        
        const dx = Math.abs(localX) - this.width / 2;
        const dy = Math.abs(localY) - this.height / 2;
        
        let normalX = 0, normalY = 0;
        
        if (dx > dy && dx > 0) {
            normalX = localX > 0 ? 1 : -1;
        } else if (dy > dx && dy > 0) {
            normalY = localY > 0 ? 1 : -1;
        } else {
            if (Math.abs(localX) / this.width > Math.abs(localY) / this.height) {
                normalX = localX > 0 ? 1 : -1;
            } else {
                normalY = localY > 0 ? 1 : -1;
            }
        }
        
        if (normalX === 0 && normalY === 0) {
            if (Math.abs(localX) > Math.abs(localY)) {
                normalX = localX > 0 ? 1 : -1;
            } else {
                normalY = localY > 0 ? 1 : -1;
            }
        }
        
        const worldNormalX = cos * normalX + sin * normalY;
        const worldNormalY = -sin * normalX + cos * normalY;
        
        let restitution = CONFIG.restitution;
        if (this.type === 'soft') {
            restitution = 1.2 + this.softness * 0.3;
            this.softDistortion = 1;
        }
        if (this.type === 'moving') {
            restitution = CONFIG.restitution * 1.1;
        }
        
        const dot = ball.vx * worldNormalX + ball.vy * worldNormalY;
        ball.vx -= 2 * dot * worldNormalX * restitution;
        ball.vy -= 2 * dot * worldNormalY * restitution;
        
        if (this.type === 'moving') {
            if (this.moveDirection === 'horizontal') {
                ball.vx += Math.cos(this.movePhase) * 2;
            } else {
                ball.vy += Math.cos(this.movePhase) * 2;
            }
        }
        
        const overlap = Math.max(dx, dy, 0) + ball.radius;
        ball.x -= worldNormalX * overlap;
        ball.y -= worldNormalY * overlap;
        
        let particleColor = '#ff6b6b';
        if (this.type === 'moving') particleColor = '#9b59b6';
        if (this.type === 'soft') particleColor = '#3498db';
        if (this.type === 'oneway') particleColor = '#2ecc71';
        
        const particleCount = this.type === 'soft' ? 8 : 5;
        for (let i = 0; i < particleCount; i++) {
            gameState.particles.push({
                x: ball.x,
                y: ball.y,
                vx: (Math.random() - 0.5) * 6,
                vy: (Math.random() - 0.5) * 6,
                life: 35,
                color: particleColor
            });
        }
        
        return true;
    }
}

class Target {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.radius = CONFIG.targetRadius;
        this.pulse = 0;
    }

    update() {
        this.pulse += 0.08 * gameState.speedMultiplier;
    }

    draw() {
        const pulseRadius = this.radius + Math.sin(this.pulse) * 5;
        
        for (let i = 3; i > 0; i--) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, pulseRadius + i * 10, 0, Math.PI * 2);
            ctx.fillStyle = `rgba(0, 255, 136, ${0.1 / i})`;
            ctx.fill();
        }
        
        const gradient = ctx.createRadialGradient(
            this.x, this.y, 0,
            this.x, this.y, pulseRadius
        );
        gradient.addColorStop(0, '#00ff88');
        gradient.addColorStop(0.7, '#00cc6a');
        gradient.addColorStop(1, '#008844');
        
        ctx.beginPath();
        ctx.arc(this.x, this.y, pulseRadius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
        
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 24px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('★', this.x, this.y);
    }

    checkCollision(ball) {
        const dx = ball.x - this.x;
        const dy = ball.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        return dist < ball.radius + this.radius;
    }
}

function generatePaddles(level) {
    const paddles = [];
    const rows = 2 + Math.floor(level / 3);
    const cols = 3 + Math.floor(level / 2);
    const useRowLayout = Math.random() > 0.5;
    
    const paddleTypes = ['normal', 'normal', 'normal', 'moving', 'soft', 'oneway'];
    
    const startX = 100;
    const startY = 150;
    const spacingX = (canvas.width - 200) / (cols - 1);
    const spacingY = (canvas.height - 300) / (rows - 1);
    
    for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
            if (Math.random() < 0.3 + level * 0.02) continue;
            
            let x, y, width, angle;
            
            if (useRowLayout) {
                x = startX + col * spacingX + (row % 2) * 30;
                y = startY + row * spacingY;
                width = CONFIG.paddleWidth - level * 2 + (Math.random() - 0.5) * 20;
                angle = (Math.random() - 0.5) * 0.5;
            } else {
                x = startX + col * spacingX;
                y = startY + row * spacingY + (col % 2) * 30;
                width = CONFIG.paddleWidth - level * 2 + (Math.random() - 0.5) * 20;
                angle = (Math.random() - 0.5) * 0.5;
            }
            
            width = Math.max(40, Math.min(120, width));
            const type = paddleTypes[Math.floor(Math.random() * paddleTypes.length)];
            paddles.push(new Paddle(x, y, width, CONFIG.paddleHeight, angle, type));
        }
    }
    
    return paddles;
}

function initLevel() {
    gameState.ball = new Ball(100, canvas.height - 100);
    gameState.paddles = generatePaddles(gameState.level);
    gameState.target = new Target(
        canvas.width - 100,
        100 + Math.random() * 200
    );
    gameState.isLaunched = false;
    gameState.isDragging = false;
    gameState.launchAngle = -Math.PI / 4;
    gameState.launchPower = 15;
    gameState.particles = [];
    levelDisplay.textContent = `关卡 ${gameState.level}`;
    updateUI();
}

function updateUI() {
    const angleDeg = Math.round(-gameState.launchAngle * 180 / Math.PI);
    const powerPercent = Math.round((gameState.launchPower - CONFIG.minPower) / (CONFIG.maxPower - CONFIG.minPower) * 100);
    angleDisplay.textContent = angleDeg;
    powerDisplay.textContent = powerPercent;
}

function launchBall() {
    gameState.ball.vx = Math.cos(gameState.launchAngle) * gameState.launchPower;
    gameState.ball.vy = Math.sin(gameState.launchAngle) * gameState.launchPower;
    gameState.isLaunched = true;
}

function showWin() {
    winMessage.style.opacity = '1';
    for (let i = 0; i < 30; i++) {
        gameState.particles.push({
            x: gameState.target.x,
            y: gameState.target.y,
            vx: (Math.random() - 0.5) * 15,
            vy: (Math.random() - 0.5) * 15,
            life: 60,
            color: '#00ff88'
        });
    }
    setTimeout(() => {
        winMessage.style.opacity = '0';
        gameState.level++;
        initLevel();
    }, 1500);
}

function drawAimLine() {
    if (gameState.isLaunched) return;
    
    const startX = gameState.ball.x;
    const startY = gameState.ball.y;
    const length = 100 + gameState.launchPower * 8;
    const endX = startX + Math.cos(gameState.launchAngle) * length;
    const endY = startY + Math.sin(gameState.launchAngle) * length;
    
    ctx.setLineDash([10, 10]);
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(startX, startY);
    ctx.lineTo(endX, endY);
    ctx.stroke();
    ctx.setLineDash([]);
    
    const arrowX = endX - Math.cos(gameState.launchAngle) * 15;
    const arrowY = endY - Math.sin(gameState.launchAngle) * 15;
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.beginPath();
    ctx.moveTo(endX, endY);
    ctx.lineTo(arrowX + Math.cos(gameState.launchAngle + 2.5) * 15, arrowY + Math.sin(gameState.launchAngle + 2.5) * 15);
    ctx.lineTo(arrowX + Math.cos(gameState.launchAngle - 2.5) * 15, arrowY + Math.sin(gameState.launchAngle - 2.5) * 15);
    ctx.closePath();
    ctx.fill();
}

function drawParticles() {
    gameState.particles = gameState.particles.filter(p => {
        p.x += p.vx * gameState.speedMultiplier;
        p.y += p.vy * gameState.speedMultiplier;
        p.life -= gameState.speedMultiplier;
        p.vx *= Math.pow(0.95, gameState.speedMultiplier);
        p.vy *= Math.pow(0.95, gameState.speedMultiplier);
        
        if (p.life > 0) {
            ctx.beginPath();
            ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
            ctx.fillStyle = p.color;
            ctx.globalAlpha = p.life / 60;
            ctx.fill();
            ctx.globalAlpha = 1;
            return true;
        }
        return false;
    });
}

function drawBackground() {
    const gradient = ctx.createRadialGradient(
        canvas.width / 2, canvas.height / 2, 0,
        canvas.width / 2, canvas.height / 2, canvas.width
    );
    gradient.addColorStop(0, '#1e3a5f');
    gradient.addColorStop(1, '#0f1e30');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
    ctx.lineWidth = 1;
    for (let x = 0; x < canvas.width; x += 50) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
    }
    for (let y = 0; y < canvas.height; y += 50) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
    }
}

function gameLoop() {
    drawBackground();
    
    if (!gameState.isPaused) {
        gameState.paddles.forEach(p => p.update());
    }
    
    gameState.paddles.forEach(p => p.draw());
    
    if (!gameState.isPaused) {
        gameState.target.update();
        if (gameState.isLaunched) {
            gameState.ball.update();
            gameState.paddles.forEach(p => p.checkCollision(gameState.ball));
            
            if (gameState.target.checkCollision(gameState.ball)) {
                showWin();
            }
        }
    }
    gameState.target.draw();
    
    gameState.ball.draw();
    drawAimLine();
    drawParticles();
    
    requestAnimationFrame(gameLoop);
}

canvas.addEventListener('mousedown', (e) => {
    if (gameState.isLaunched) return;
    gameState.isDragging = true;
});

canvas.addEventListener('mousemove', (e) => {
    if (!gameState.isDragging || gameState.isLaunched) return;
    
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    
    const dx = mx - gameState.ball.x;
    const dy = my - gameState.ball.y;
    
    gameState.launchAngle = Math.atan2(dy, dx);
    
    const dist = Math.sqrt(dx * dx + dy * dy);
    gameState.launchPower = CONFIG.minPower + Math.min(dist / 10, CONFIG.maxPower - CONFIG.minPower);
    
    updateUI();
});

canvas.addEventListener('mouseup', () => {
    if (gameState.isDragging && !gameState.isLaunched) {
        launchBall();
    }
    gameState.isDragging = false;
});

canvas.addEventListener('mouseleave', () => {
    gameState.isDragging = false;
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'p' || e.key === 'P') {
        togglePause();
        return;
    }
    
    if (gameState.isLaunched || gameState.isPaused) return;
    
    switch (e.key) {
        case 'ArrowLeft':
            gameState.launchAngle -= 0.05;
            break;
        case 'ArrowRight':
            gameState.launchAngle += 0.05;
            break;
        case 'ArrowUp':
            gameState.launchPower = Math.min(CONFIG.maxPower, gameState.launchPower + 1);
            break;
        case 'ArrowDown':
            gameState.launchPower = Math.max(CONFIG.minPower, gameState.launchPower - 1);
            break;
        case ' ':
            e.preventDefault();
            launchBall();
            break;
    }
    updateUI();
});

function setSpeed(speed) {
    gameState.speedMultiplier = speed;
    speedSlider.value = speed;
    speedValue.textContent = speed.toFixed(1) + 'x';
    
    speedBtns.forEach(btn => {
        btn.classList.remove('active');
        if (parseFloat(btn.dataset.speed) === speed) {
            btn.classList.add('active');
        }
    });
}

function togglePause() {
    gameState.isPaused = !gameState.isPaused;
    pauseBtn.classList.toggle('paused', gameState.isPaused);
    pauseBtn.textContent = gameState.isPaused ? '▶ 继续' : '⏸ 暂停';
    pauseOverlay.classList.toggle('show', gameState.isPaused);
}

speedBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        setSpeed(parseFloat(btn.dataset.speed));
    });
});

speedSlider.addEventListener('input', (e) => {
    const speed = parseFloat(e.target.value);
    setSpeed(speed);
});

pauseBtn.addEventListener('click', togglePause);

initLevel();
gameLoop();
