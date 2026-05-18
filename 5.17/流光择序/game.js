const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');

const COLORS = [
    { main: '#ff6b6b', glow: 'rgba(255, 107, 107, 0.6)' },
    { main: '#4ecdc4', glow: 'rgba(78, 205, 196, 0.6)' },
    { main: '#45b7d1', glow: 'rgba(69, 183, 209, 0.6)' },
    { main: '#96ceb4', glow: 'rgba(150, 206, 180, 0.6)' },
    { main: '#ffeaa7', glow: 'rgba(255, 234, 167, 0.6)' },
    { main: '#dfe6e9', glow: 'rgba(223, 230, 233, 0.6)' },
    { main: '#a29bfe', glow: 'rgba(162, 155, 254, 0.6)' },
    { main: '#fd79a8', glow: 'rgba(253, 121, 168, 0.6)' },
    { main: '#00b894', glow: 'rgba(0, 184, 148, 0.6)' },
    { main: '#e17055', glow: 'rgba(225, 112, 85, 0.6)' },
];

const GameState = {
    IDLE: 'idle',
    SHOWING: 'showing',
    PLAYING: 'playing',
    SUCCESS: 'success',
    GAME_OVER: 'gameOver'
};

let gameState = GameState.IDLE;
let level = 1;
let lightStrips = [];
let clickOrder = [];
let currentClickIndex = 0;
let showIndex = 0;
let showTimer = 0;
let particles = [];

function resizeCanvas() {
    const container = document.getElementById('game-container');
    canvas.width = container.clientWidth;
    canvas.height = container.clientHeight;
}

class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 8;
        this.vy = (Math.random() - 0.5) * 8;
        this.life = 1;
        this.decay = 0.02 + Math.random() * 0.02;
        this.color = color;
        this.size = 3 + Math.random() * 4;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vx *= 0.98;
        this.vy *= 0.98;
        this.life -= this.decay;
    }

    draw(ctx) {
        ctx.save();
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size * this.life, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

class LightStrip {
    constructor(index, totalStrips, canvasWidth, canvasHeight) {
        this.index = index;
        this.totalStrips = totalStrips;
        this.color = COLORS[index % COLORS.length];
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight;
        this.visible = false;
        this.progress = 0;
        this.speed = 0.008 + Math.random() * 0.004;
        this.waveOffset = Math.random() * Math.PI * 2;
        this.waveAmplitude = 30 + Math.random() * 40;
        this.thickness = 6 + Math.random() * 4;
        this.clickable = false;
        this.clicked = false;
        this.highlight = 0;
        
        this.generatePath();
    }

    generatePath() {
        const edge = Math.floor(Math.random() * 4);
        let startX, startY, endX, endY;
        
        switch (edge) {
            case 0:
                startX = Math.random() * this.canvasWidth;
                startY = -50;
                endX = Math.random() * this.canvasWidth;
                endY = this.canvasHeight + 50;
                break;
            case 1:
                startX = this.canvasWidth + 50;
                startY = Math.random() * this.canvasHeight;
                endX = -50;
                endY = Math.random() * this.canvasHeight;
                break;
            case 2:
                startX = Math.random() * this.canvasWidth;
                startY = this.canvasHeight + 50;
                endX = Math.random() * this.canvasWidth;
                endY = -50;
                break;
            case 3:
                startX = -50;
                startY = Math.random() * this.canvasHeight;
                endX = this.canvasWidth + 50;
                endY = Math.random() * this.canvasHeight;
                break;
        }
        
        this.startX = startX;
        this.startY = startY;
        this.endX = endX;
        this.endY = endY;
        
        const midX = (startX + endX) / 2 + (Math.random() - 0.5) * 200;
        const midY = (startY + endY) / 2 + (Math.random() - 0.5) * 200;
        this.midX = midX;
        this.midY = midY;
    }

    getPosition(progress) {
        const t = progress;
        const mt = 1 - t;
        
        const x = mt * mt * this.startX + 2 * mt * t * this.midX + t * t * this.endX;
        const y = mt * mt * this.startY + 2 * mt * t * this.midY + t * t * this.endY;
        
        const wave = Math.sin(t * Math.PI * 3 + this.waveOffset) * this.waveAmplitude;
        
        const dx = 2 * mt * (this.midX - this.startX) + 2 * t * (this.endX - this.midX);
        const dy = 2 * mt * (this.midY - this.startY) + 2 * t * (this.endY - this.midY);
        const len = Math.sqrt(dx * dx + dy * dy) || 1;
        
        const nx = -dy / len;
        const ny = dx / len;
        
        return {
            x: x + nx * wave,
            y: y + ny * wave,
            nx, ny
        };
    }

    update(deltaTime) {
        if (this.visible && gameState !== GameState.PLAYING) {
            this.progress += this.speed * deltaTime * 60;
            if (this.progress > 1) {
                this.progress = 1;
            }
        }
        
        if (this.highlight > 0) {
            this.highlight -= 0.02;
        }
    }

    draw(ctx) {
        if (!this.visible && this.progress <= 0) return;
        
        const drawProgress = Math.min(this.progress, 1);
        const segments = 50;
        
        ctx.save();
        
        if (this.clicked) {
            ctx.globalAlpha = 0.3;
        }
        
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        for (let i = 0; i <= segments; i++) {
            const t = (i / segments) * drawProgress;
            const pos = this.getPosition(t);
            
            if (i === 0) {
                ctx.beginPath();
                ctx.moveTo(pos.x, pos.y);
            } else {
                ctx.lineTo(pos.x, pos.y);
            }
        }
        
        const gradient = ctx.createLinearGradient(this.startX, this.startY, this.endX, this.endY);
        gradient.addColorStop(0, this.color.main);
        gradient.addColorStop(1, this.color.main);
        
        ctx.strokeStyle = gradient;
        ctx.lineWidth = this.thickness + (this.highlight > 0 ? 8 : 0);
        ctx.stroke();
        
        ctx.shadowColor = this.color.main;
        ctx.shadowBlur = 20 + (this.highlight > 0 ? 30 : 0);
        ctx.lineWidth = this.thickness * 0.5;
        ctx.stroke();
        
        if (drawProgress > 0 && drawProgress < 1) {
            const headPos = this.getPosition(drawProgress);
            ctx.beginPath();
            ctx.arc(headPos.x, headPos.y, this.thickness * 1.5, 0, Math.PI * 2);
            ctx.fillStyle = '#ffffff';
            ctx.shadowColor = this.color.main;
            ctx.shadowBlur = 30;
            ctx.fill();
        }
        
        ctx.restore();
    }

    containsPoint(px, py) {
        if (!this.clickable || this.clicked) return false;
        if (this.progress < 0.2 || this.progress > 0.8) return false;
        
        const checkSegments = 30;
        for (let i = 0; i <= checkSegments; i++) {
            const t = 0.2 + (i / checkSegments) * 0.6;
            const pos = this.getPosition(t);
            const dist = Math.sqrt((px - pos.x) ** 2 + (py - pos.y) ** 2);
            if (dist < this.thickness + 15) {
                return true;
            }
        }
        return false;
    }

    getCenterPoint() {
        return this.getPosition(0.5);
    }
}

function createParticles(x, y, color, count = 20) {
    for (let i = 0; i < count; i++) {
        particles.push(new Particle(x, y, color));
    }
}

function startLevel() {
    console.log('[关卡] 开始第', level, '关');
    lightStrips = [];
    clickOrder = [];
    currentClickIndex = 0;
    particles = [];
    
    const numStrips = Math.min(3 + Math.floor(level / 2), 8);
    console.log('[关卡] 光带数量:', numStrips);
    
    for (let i = 0; i < numStrips; i++) {
        const strip = new LightStrip(i, numStrips, canvas.width, canvas.height);
        lightStrips.push(strip);
        clickOrder.push(i);
    }
    
    for (let i = clickOrder.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [clickOrder[i], clickOrder[j]] = [clickOrder[j], clickOrder[i]];
    }
    console.log('[关卡] 光带出现顺序:', clickOrder);
    
    gameState = GameState.SHOWING;
    showIndex = 0;
    showTimer = 0;
    
    showScreen('phase-indicator');
    document.getElementById('phase-text').textContent = '记住光带出现的顺序...';
    
    setTimeout(() => {
        showNextStrip();
    }, 1500);
    
    updateUI();
}

function showNextStrip() {
    if (showIndex >= clickOrder.length) {
        setTimeout(() => {
            startPlaying();
        }, 500);
        return;
    }
    
    const stripIndex = clickOrder[showIndex];
    const strip = lightStrips[stripIndex];
    strip.visible = true;
    strip.progress = 0;
    
    showIndex++;
    showTimer = 0;
    
    const delay = Math.max(800 - level * 30, 400);
    setTimeout(() => {
        showNextStrip();
    }, delay);
}

function startPlaying() {
    console.log('[游戏] 进入游戏阶段，玩家可以开始点击');
    gameState = GameState.PLAYING;
    hideAllScreens();
    
    lightStrips.forEach(strip => {
        strip.clickable = true;
        strip.progress = 0.5;
        console.log(`[游戏] 光带 ${strip.index}: progress设置为0.5, clickable=true`);
    });
    
    updateUI();
}

function handleClick(e) {
    console.log('[点击事件] 触发点击');
    console.log('[点击事件] 当前游戏状态:', gameState);
    
    if (gameState !== GameState.PLAYING) {
        console.log('[点击事件] 游戏状态不是PLAYING，忽略点击');
        return;
    }
    
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    console.log('[点击事件] 点击坐标:', x, y);
    console.log('[点击事件] 当前应该点击第', currentClickIndex + 1, '个光带，光带索引:', clickOrder[currentClickIndex]);
    console.log('[点击事件] 所有光带索引顺序:', clickOrder);
    
    for (let i = lightStrips.length - 1; i >= 0; i--) {
        const strip = lightStrips[i];
        const contains = strip.containsPoint(x, y);
        console.log(`[点击事件] 检查光带 ${strip.index}: 可点击=${strip.clickable}, 已点击=${strip.clicked}, progress=${strip.progress.toFixed(2)}, 命中=${contains}`);
        
        if (contains) {
            const expectedIndex = clickOrder[currentClickIndex];
            console.log(`[点击事件] 命中光带 ${strip.index}，期望光带 ${expectedIndex}`);
            
            if (strip.index === expectedIndex) {
                console.log('[点击事件] ✓ 点击正确！');
                strip.clicked = true;
                strip.highlight = 1;
                
                const center = strip.getCenterPoint();
                createParticles(center.x, center.y, strip.color.main, 30);
                
                currentClickIndex++;
                updateUI();
                
                if (currentClickIndex >= clickOrder.length) {
                    console.log('[点击事件] 本关完成！');
                    levelComplete();
                }
            } else {
                console.log('[点击事件] ✗ 点击错误！触发游戏结束');
                gameOver();
            }
            return;
        }
    }
    
    console.log('[点击事件] 未命中任何光带');
}

function levelComplete() {
    gameState = GameState.SUCCESS;
    showScreen('success-screen');
    
    setTimeout(() => {
        level++;
        startLevel();
    }, 1500);
}

function gameOver() {
    console.log('[游戏结束] 触发！到达关卡:', level);
    gameState = GameState.GAME_OVER;
    document.getElementById('final-level').textContent = level;
    showScreen('game-over-screen');
    console.log('[游戏结束] 失败界面已显示');
}

function updateUI() {
    document.getElementById('level').textContent = level;
    document.getElementById('progress').textContent = `${currentClickIndex}/${clickOrder.length}`;
}

function showScreen(screenId) {
    console.log('[UI] 显示界面:', screenId);
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(screenId).classList.add('active');
}

function hideAllScreens() {
    console.log('[UI] 隐藏所有界面');
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
}

let lastTime = 0;
function gameLoop(currentTime) {
    const deltaTime = (currentTime - lastTime) / 1000;
    lastTime = currentTime;
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    drawBackgroundStars();
    
    lightStrips.forEach(strip => {
        strip.update(deltaTime);
        strip.draw(ctx);
    });
    
    for (let i = particles.length - 1; i >= 0; i--) {
        particles[i].update();
        particles[i].draw(ctx);
        if (particles[i].life <= 0) {
            particles.splice(i, 1);
        }
    }
    
    requestAnimationFrame(gameLoop);
}

function drawBackgroundStars() {
    ctx.save();
    for (let i = 0; i < 50; i++) {
        const x = (i * 73) % canvas.width;
        const y = (i * 97) % canvas.height;
        const size = (i % 3) * 0.5 + 0.5;
        const alpha = 0.3 + Math.sin(Date.now() / 1000 + i) * 0.2;
        
        ctx.globalAlpha = alpha;
        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
    }
    ctx.restore();
}

function init() {
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    canvas.addEventListener('click', handleClick);
    
    document.getElementById('start-btn').addEventListener('click', () => {
        level = 1;
        startLevel();
    });
    
    document.getElementById('restart-btn').addEventListener('click', () => {
        level = 1;
        startLevel();
    });
    
    requestAnimationFrame(gameLoop);
}

init();
