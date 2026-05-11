const CANVAS_WIDTH = 400;
const CANVAS_HEIGHT = 600;
const TRAY_WIDTH = 100;
const TRAY_HEIGHT = 20;
const ITEM_SIZE = 40;

let canvas, ctx;
let score = 0;
let gameRunning = false;
let tray = { x: CANVAS_WIDTH / 2 - TRAY_WIDTH / 2, y: CANVAS_HEIGHT - 60, targetX: CANVAS_WIDTH / 2 - TRAY_WIDTH / 2 };
let items = [];
let keys = { left: false, right: false };
let lastItemTime = 0;
let itemInterval = 800;
let animationId;
let effectsEnabled = true;
let particles = [];

const itemTypes = [
    { type: 'coin', emoji: '💰', points: 10, good: true, glow: true, slowFall: false },
    { type: 'luckyBag', emoji: '🎁', points: 20, good: true, float: true, slowFall: true },
    { type: 'stone', emoji: '🪨', points: -15, good: false, slowFall: false },
    { type: 'trash', emoji: '🗑️', points: -10, good: false, slowFall: false }
];

function init() {
    canvas = document.getElementById('gameCanvas');
    canvas.width = CANVAS_WIDTH;
    canvas.height = CANVAS_HEIGHT;
    ctx = canvas.getContext('2d');
    
    document.getElementById('startBtn').addEventListener('click', startGame);
    document.getElementById('restartBtn').addEventListener('click', startGame);
    document.getElementById('toggleEffects').addEventListener('click', toggleEffects);
    
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);
    
    canvas.addEventListener('touchstart', handleTouch);
    canvas.addEventListener('touchmove', handleTouch);
    canvas.addEventListener('touchend', handleTouchEnd);
    
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mousemove', handleMouseMove);
    canvas.addEventListener('mouseup', handleMouseUp);
    
    draw();
}

function toggleEffects() {
    effectsEnabled = !effectsEnabled;
    const btn = document.getElementById('toggleEffects');
    btn.classList.toggle('active', effectsEnabled);
    btn.textContent = effectsEnabled ? '✨ 特效' : '🎯 简约';
}

function startGame() {
    score = 0;
    items = [];
    particles = [];
    tray.x = CANVAS_WIDTH / 2 - TRAY_WIDTH / 2;
    tray.targetX = tray.x;
    gameRunning = true;
    lastItemTime = Date.now();
    
    document.getElementById('startScreen').style.display = 'none';
    document.getElementById('gameOverScreen').style.display = 'none';
    updateScore();
    
    gameLoop();
}

function endGame() {
    gameRunning = false;
    cancelAnimationFrame(animationId);
    document.getElementById('finalScore').textContent = score;
    document.getElementById('gameOverScreen').style.display = 'block';
}

function gameLoop() {
    if (!gameRunning) return;
    
    update();
    draw();
    animationId = requestAnimationFrame(gameLoop);
}

function update() {
    const speed = 8;
    if (keys.left) {
        tray.targetX -= speed;
    }
    if (keys.right) {
        tray.targetX += speed;
    }
    
    tray.targetX = Math.max(0, Math.min(CANVAS_WIDTH - TRAY_WIDTH, tray.targetX));
    
    const damping = 0.15;
    tray.x += (tray.targetX - tray.x) * damping;
    
    const now = Date.now();
    if (now - lastItemTime > itemInterval) {
        spawnItem();
        lastItemTime = now;
    }
    
    for (let i = items.length - 1; i >= 0; i--) {
        const item = items[i];
        
        if (item.float && effectsEnabled) {
            item.floatOffset = (item.floatOffset || 0) + 0.025;
            item.floatX = (item.floatX || item.x) + Math.sin(item.floatOffset) * 0.15;
            item.x = item.floatX;
        }
        
        item.y += item.speed;
        item.rotation = (item.rotation || 0) + (item.float ? 0.008 : 0.02);
        
        if (checkCollision(item)) {
            score += item.points;
            updateScore();
            
            if (effectsEnabled) {
                createParticles(item.x + item.width / 2, item.y + item.height / 2, item.good);
            }
            
            items.splice(i, 1);
            
            if (score < 0) {
                endGame();
                return;
            }
            continue;
        }
        
        if (item.y > CANVAS_HEIGHT) {
            items.splice(i, 1);
        }
    }
    
    for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.02;
        p.vy += 0.1;
        
        if (p.life <= 0) {
            particles.splice(i, 1);
        }
    }
}

function spawnItem() {
    const typeIndex = Math.floor(Math.random() * itemTypes.length);
    const itemType = itemTypes[typeIndex];
    const x = Math.random() * (CANVAS_WIDTH - ITEM_SIZE);
    
    items.push({
        x: x,
        y: -ITEM_SIZE,
        width: ITEM_SIZE,
        height: ITEM_SIZE,
        speed: itemType.float ? 1.3 : 2.5 + Math.random() * 1.2,
        rotation: 0,
        floatOffset: Math.random() * Math.PI * 2,
        floatX: x,
        ...itemType
    });
}

function createParticles(x, y, good) {
    const color = good ? '#FFD700' : '#888888';
    for (let i = 0; i < 8; i++) {
        particles.push({
            x: x,
            y: y,
            vx: (Math.random() - 0.5) * 6,
            vy: (Math.random() - 0.5) * 6 - 2,
            life: 1,
            color: color,
            size: Math.random() * 4 + 2
        });
    }
}

function checkCollision(item) {
    return item.y + item.height >= tray.y &&
           item.y <= tray.y + TRAY_HEIGHT &&
           item.x + item.width >= tray.x &&
           item.x <= tray.x + TRAY_WIDTH;
}

function draw() {
    const gradient = ctx.createLinearGradient(0, 0, 0, CANVAS_HEIGHT);
    gradient.addColorStop(0, '#faf6f0');
    gradient.addColorStop(1, '#f0e8dc');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    drawDeskTexture();
    
    particles.forEach(p => {
        ctx.globalAlpha = p.life;
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
    });
    ctx.globalAlpha = 1;
    
    drawTray();
    
    items.forEach(item => {
        ctx.save();
        ctx.translate(item.x + item.width / 2, item.y + item.height / 2);
        
        if (item.glow && effectsEnabled) {
            const time = Date.now() / 1000;
            const pulse = Math.sin(time * 2.5) * 0.5 + 0.5;
            const glowIntensity = 8 + pulse * 6;
            ctx.shadowColor = `rgba(255, 215, 0, ${0.6 + pulse * 0.4})`;
            ctx.shadowBlur = glowIntensity;
        }
        
        ctx.rotate(item.rotation);
        ctx.font = '36px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(item.emoji, 0, 0);
        
        ctx.restore();
    });
}

function drawDeskTexture() {
    ctx.strokeStyle = 'rgba(139, 115, 85, 0.05)';
    ctx.lineWidth = 1;
    for (let i = 0; i < CANVAS_HEIGHT; i += 20) {
        ctx.beginPath();
        ctx.moveTo(0, i);
        ctx.lineTo(CANVAS_WIDTH, i);
        ctx.stroke();
    }
}

function drawTray() {
    ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(tray.x + 3, tray.y + 3, TRAY_WIDTH, TRAY_HEIGHT);
    
    const trayGradient = ctx.createLinearGradient(tray.x, tray.y, tray.x, tray.y + TRAY_HEIGHT);
    trayGradient.addColorStop(0, '#c9a76c');
    trayGradient.addColorStop(1, '#a8894f');
    ctx.fillStyle = trayGradient;
    ctx.fillRect(tray.x, tray.y, TRAY_WIDTH, TRAY_HEIGHT);
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fillRect(tray.x + 5, tray.y + 2, TRAY_WIDTH - 10, 4);
}

function updateScore() {
    document.getElementById('score').textContent = score;
}

function handleKeyDown(e) {
    if (e.key === 'ArrowLeft') keys.left = true;
    if (e.key === 'ArrowRight') keys.right = true;
}

function handleKeyUp(e) {
    if (e.key === 'ArrowLeft') keys.left = false;
    if (e.key === 'ArrowRight') keys.right = false;
}

let isDragging = false;

function handleTouch(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = canvas.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    tray.targetX = x - TRAY_WIDTH / 2;
    tray.targetX = Math.max(0, Math.min(CANVAS_WIDTH - TRAY_WIDTH, tray.targetX));
}

function handleTouchEnd() {
}

function handleMouseDown(e) {
    isDragging = true;
}

function handleMouseMove(e) {
    if (!isDragging) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    tray.targetX = x - TRAY_WIDTH / 2;
    tray.targetX = Math.max(0, Math.min(CANVAS_WIDTH - TRAY_WIDTH, tray.targetX));
}

function handleMouseUp() {
    isDragging = false;
}

init();
