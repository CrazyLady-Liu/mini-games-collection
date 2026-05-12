const canvas = document.getElementById('game-canvas');
const ctx = canvas.getContext('2d');
let gameState = 'menu';
let score = 0;
let difficulty = 'easy';
let fallingObjects = [];
let lastSpawnTime = 0;
let animationId = null;
let isPaused = false;
let gameSpeed = 1;
const speedOptions = [0.5, 1, 1.5, 2];
let currentSpeedIndex = 1;

const difficultyConfigs = {
    easy: {
        rainCount: 1,
        debrisCount: 0,
        powerupChance: 0.1,
        specialRainChance: 0.15,
        colors: ['#4A90A4', '#7EC8E3'],
        spawnInterval: 1500,
        fallSpeed: 2,
        gridSpacing: 120,
        randomOffset: 0,
        name: '简单'
    },
    normal: {
        rainCount: 2,
        debrisCount: 1,
        powerupChance: 0.15,
        specialRainChance: 0.2,
        colors: ['#4A90A4', '#7EC8E3', '#98D8C8', '#F7DC6F'],
        spawnInterval: 800,
        fallSpeed: 3,
        gridSpacing: 100,
        randomOffset: 30,
        name: '普通'
    },
    hard: {
        rainCount: 3,
        debrisCount: 2,
        powerupChance: 0.2,
        specialRainChance: 0.25,
        colors: ['#5A7D7C', '#6B8E8D', '#7B9E9D', '#8CAEAD'],
        spawnInterval: 400,
        fallSpeed: 4,
        gridSpacing: 80,
        randomOffset: 50,
        name: '困难'
    }
};

const powerupTypes = {
    widenTray: { name: '加宽托盘', color: '#32CD32', type: 'buff', duration: 8000 },
    shield: { name: '护盾', color: '#FFD700', type: 'buff', uses: 1 },
    doubleScore: { name: '双倍得分', color: '#FF69B4', type: 'buff', duration: 10000 },
    slowDown: { name: '减速', color: '#00CED1', type: 'buff', duration: 6000 },
    shrinkTray: { name: '缩小托盘', color: '#FF8C00', type: 'debuff', duration: 5000 },
    speedUp: { name: '加速下落', color: '#DC143C', type: 'debuff', duration: 4000 }
};

const specialRainTypes = {
    golden: { name: '金色雨滴', color: '#FFD700', score: 50, priority: true },
    frozen: { name: '冰冻雨滴', color: '#00FFFF', score: 20, effect: 'freeze' },
    poison: { name: '毒雨滴', color: '#800080', score: 0, effect: 'poison' }
};

let activeEffects = {
    widenTray: false,
    shield: 0,
    doubleScore: false,
    slowDown: false,
    shrinkTray: false,
    speedUp: false,
    freeze: false,
    poison: false,
    poisonEndTime: 0
};

let tray = {
    x: 0,
    y: 0,
    width: 140,
    height: 25,
    targetX: 0,
    speed: 0,
    hitboxWidth: 180,
    baseWidth: 140,
    baseHitboxWidth: 180
};

const TOP_BAR_HEIGHT = 50; // 顶部信息栏高度

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    tray.y = canvas.height - 100 - TOP_BAR_HEIGHT;
    tray.x = canvas.width / 2 - tray.width / 2;
    tray.targetX = tray.x;
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

function createFallingObject(type, x, isPowerup = false, powerupKind = null, isSpecialRain = false, specialRainKind = null) {
    const config = difficultyConfigs[difficulty];
    let color, size, objType;
    
    if (isPowerup && powerupKind) {
        color = powerupTypes[powerupKind].color;
        size = { width: 30, height: 30 };
        objType = 'powerup';
    } else if (isSpecialRain && specialRainKind) {
        color = specialRainTypes[specialRainKind].color;
        size = { width: 22, height: 32 };
        objType = 'specialRain';
    } else if (type === 'rain') {
        color = config.colors[Math.floor(Math.random() * config.colors.length)];
        size = { width: 20, height: 30 };
        objType = 'rain';
    } else if (type === 'leaf') {
        color = '#8B4513';
        size = { width: 25, height: 20 };
        objType = 'leaf';
    } else {
        color = '#696969';
        size = { width: 18, height: 18 };
        objType = 'stone';
    }
    
    return {
        x: x,
        y: -size.height + TOP_BAR_HEIGHT, // 从信息栏下方开始
        width: size.width,
        height: size.height,
        type: objType,
        color: color,
        powerupKind: powerupKind,
        specialRainKind: specialRainKind,
        speed: config.fallSpeed + Math.random() * 1,
        frozen: false
    };
}

let currentGridOffset = 0;
function spawnObjects(timestamp) {
    const config = difficultyConfigs[difficulty];
    const adjustedInterval = config.spawnInterval / gameSpeed;
    if (timestamp - lastSpawnTime < adjustedInterval) return;
    lastSpawnTime = timestamp;
    
    if (difficulty === 'hard') {
        currentGridOffset = Math.random() * config.gridSpacing;
    }
    
    const objectsToSpawn = [];
    const numRain = config.rainCount;
    const numDebris = config.debrisCount;
    const availablePositions = [];
    
    let x = currentGridOffset;
    while (x < canvas.width) {
        availablePositions.push(x + Math.random() * config.randomOffset);
        x += config.gridSpacing;
    }
    
    const shuffled = [...availablePositions].sort(() => Math.random() - 0.5);
    let posIndex = 0;
    
    if (Math.random() < config.specialRainChance && posIndex < shuffled.length) {
        const specialTypes = difficulty === 'hard' 
            ? ['golden', 'frozen', 'poison'] 
            : ['golden', 'frozen'];
        const specialKind = specialTypes[Math.floor(Math.random() * specialTypes.length)];
        objectsToSpawn.push(createFallingObject(null, shuffled[posIndex++], false, null, true, specialKind));
    }
    
    if (Math.random() < config.powerupChance && posIndex < shuffled.length) {
        const powerupKinds = Object.keys(powerupTypes);
        const powerupKind = powerupKinds[Math.floor(Math.random() * powerupKinds.length)];
        objectsToSpawn.push(createFallingObject(null, shuffled[posIndex++], true, powerupKind, false, null));
    }
    
    for (let i = 0; i < numRain && posIndex < shuffled.length; i++) {
        objectsToSpawn.push(createFallingObject('rain', shuffled[posIndex++]));
    }
    
    for (let i = 0; i < numDebris && posIndex < shuffled.length; i++) {
        const type = Math.random() > 0.5 ? 'leaf' : 'stone';
        objectsToSpawn.push(createFallingObject(type, shuffled[posIndex++]));
    }
    
    fallingObjects.push(...objectsToSpawn);
}

function drawRaindrop(obj) {
    ctx.fillStyle = obj.color;
    ctx.beginPath();
    ctx.moveTo(obj.x + obj.width / 2, obj.y);
    ctx.bezierCurveTo(
        obj.x + obj.width, obj.y + obj.height * 0.6,
        obj.x + obj.width, obj.y + obj.height,
        obj.x + obj.width / 2, obj.y + obj.height
    );
    ctx.bezierCurveTo(
        obj.x, obj.y + obj.height,
        obj.x, obj.y + obj.height * 0.6,
        obj.x + obj.width / 2, obj.y
    );
    ctx.fill();
}

function drawSpecialRain(obj) {
    if (obj.specialRainKind === 'golden') {
        ctx.shadowColor = '#FFD700';
        ctx.shadowBlur = 15;
    }
    drawRaindrop(obj);
    ctx.shadowBlur = 0;
    
    if (obj.specialRainKind === 'frozen') {
        ctx.strokeStyle = '#FFFFFF';
        ctx.lineWidth = 2;
        const cx = obj.x + obj.width / 2;
        const cy = obj.y + obj.height / 2;
        for (let i = 0; i < 6; i++) {
            const angle = (i * 60) * Math.PI / 180;
            ctx.beginPath();
            ctx.moveTo(cx, cy);
            ctx.lineTo(cx + Math.cos(angle) * 12, cy + Math.sin(angle) * 12);
            ctx.stroke();
        }
    }
    
    if (obj.specialRainKind === 'poison') {
        ctx.fillStyle = 'rgba(128, 0, 128, 0.3)';
        ctx.beginPath();
        ctx.arc(obj.x + obj.width / 2, obj.y + obj.height / 2, obj.width, 0, Math.PI * 2);
        ctx.fill();
    }
}

function drawPowerup(obj) {
    ctx.fillStyle = obj.color;
    ctx.beginPath();
    const cx = obj.x + obj.width / 2;
    const cy = obj.y + obj.height / 2;
    ctx.arc(cx, cy, obj.width / 2, 0, Math.PI * 2);
    ctx.fill();
    
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 3;
    ctx.stroke();
    
    ctx.shadowColor = obj.color;
    ctx.shadowBlur = 10;
    ctx.stroke();
    ctx.shadowBlur = 0;
    
    ctx.fillStyle = '#FFFFFF';
    ctx.font = '16px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    let icon = '';
    switch(obj.powerupKind) {
        case 'widenTray': icon = '↔'; break;
        case 'shield': icon = '🛡'; break;
        case 'doubleScore': icon = '×2'; break;
        case 'slowDown': icon = '⏱'; break;
        case 'shrinkTray': icon = '⊖'; break;
        case 'speedUp': icon = '⚡'; break;
    }
    ctx.fillText(icon, cx, cy);
}

function drawLeaf(obj) {
    ctx.fillStyle = obj.color;
    ctx.beginPath();
    const cx = obj.x + obj.width / 2;
    const cy = obj.y + obj.height / 2;
    ctx.ellipse(cx, cy, obj.width / 2, obj.height / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#5D4037';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(obj.x, cy);
    ctx.lineTo(obj.x + obj.width, cy);
    ctx.stroke();
}

function drawStone(obj) {
    ctx.fillStyle = obj.color;
    ctx.beginPath();
    ctx.arc(obj.x + obj.width / 2, obj.y + obj.height / 2, obj.width / 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#4A4A4A';
    ctx.lineWidth = 2;
    ctx.stroke();
}

function drawTray() {
    if (activeEffects.shield > 0) {
        ctx.strokeStyle = '#FFD700';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.roundRect(tray.x - 10, tray.y - 10, tray.width + 20, tray.height + 20, 12);
        ctx.stroke();
    }
    
    const gradient = ctx.createLinearGradient(tray.x, tray.y, tray.x, tray.y + tray.height);
    gradient.addColorStop(0, '#8B4513');
    gradient.addColorStop(1, '#654321');
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.roundRect(tray.x, tray.y, tray.width, tray.height, 8);
    ctx.fill();
    ctx.fillStyle = '#A0522D';
    ctx.beginPath();
    ctx.roundRect(tray.x + 5, tray.y + 5, tray.width - 10, tray.height - 10, 5);
    ctx.fill();
}

function drawPoisonEffect() {
    if (activeEffects.poison && Date.now() < activeEffects.poisonEndTime) {
        const gameHeight = canvas.height - TOP_BAR_HEIGHT;
        ctx.fillStyle = 'rgba(128, 0, 128, 0.4)';
        ctx.fillRect(0, 0, canvas.width, gameHeight);
        
        for (let i = 0; i < 20; i++) {
            const x = Math.random() * canvas.width;
            const y = Math.random() * gameHeight;
            const radius = 30 + Math.random() * 50;
            const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
            gradient.addColorStop(0, 'rgba(128, 0, 128, 0.6)');
            gradient.addColorStop(1, 'rgba(128, 0, 128, 0)');
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

function updateTray() {
    if (activeEffects.widenTray) {
        tray.width = tray.baseWidth * 1.8;
        tray.hitboxWidth = tray.baseHitboxWidth * 1.8;
    } else if (activeEffects.shrinkTray) {
        tray.width = tray.baseWidth * 0.5;
        tray.hitboxWidth = tray.baseHitboxWidth * 0.5;
    } else {
        tray.width = tray.baseWidth;
        tray.hitboxWidth = tray.baseHitboxWidth;
    }
    
    const diff = tray.targetX - tray.x;
    tray.speed = diff * 0.15;
    tray.x += tray.speed;
    tray.speed *= 0.9;
    tray.x = Math.max(0, Math.min(canvas.width - tray.width, tray.x));
}

function checkCollision(obj) {
    const trayHitboxLeft = tray.x - (tray.hitboxWidth - tray.width) / 2;
    const trayHitboxRight = tray.x + tray.width + (tray.hitboxWidth - tray.width) / 2;
    const trayTop = tray.y;
    const objBottom = obj.y + obj.height;
    const objCenterX = obj.x + obj.width / 2;
    return objBottom >= trayTop &&
           objBottom <= trayTop + tray.height + 10 &&
           objCenterX >= trayHitboxLeft &&
           objCenterX <= trayHitboxRight;
}

function applyPowerup(powerupKind) {
    const powerup = powerupTypes[powerupKind];
    if (powerup.type === 'buff' || powerup.type === 'debuff') {
        if (powerup.duration) {
            activeEffects[powerupKind] = true;
            setTimeout(() => {
                activeEffects[powerupKind] = false;
            }, powerup.duration);
        }
        if (powerup.uses) {
            activeEffects.shield = powerup.uses;
        }
    }
}

function applySpecialRain(specialRainKind) {
    const special = specialRainTypes[specialRainKind];
    let points = special.score;
    if (activeEffects.doubleScore) points *= 2;
    score += points;
    
    if (special.effect === 'freeze') {
        activeEffects.freeze = true;
        fallingObjects.forEach(obj => obj.frozen = true);
        setTimeout(() => {
            activeEffects.freeze = false;
            fallingObjects.forEach(obj => obj.frozen = false);
        }, 3000);
    } else if (special.effect === 'poison') {
        activeEffects.poison = true;
        activeEffects.poisonEndTime = Date.now() + 5000;
    }
}

function updateFallingObjects() {
    let speedMultiplier = 1;
    if (activeEffects.slowDown) speedMultiplier = 0.4;
    if (activeEffects.speedUp) speedMultiplier = 1.8;
    speedMultiplier *= gameSpeed;
    const gameHeight = canvas.height - TOP_BAR_HEIGHT;
    
    for (let i = fallingObjects.length - 1; i >= 0; i--) {
        const obj = fallingObjects[i];
        
        if (!obj.frozen) {
            obj.y += obj.speed * speedMultiplier;
        }
        
        if (checkCollision(obj)) {
            if (obj.type === 'rain') {
                let points = 10;
                if (activeEffects.doubleScore) points *= 2;
                score += points;
            } else if (obj.type === 'specialRain') {
                applySpecialRain(obj.specialRainKind);
            } else if (obj.type === 'powerup') {
                applyPowerup(obj.powerupKind);
            } else {
                if (activeEffects.shield > 0) {
                    activeEffects.shield--;
                } else {
                    score -= 5;
                    if (score < 0) score = 0;
                }
            }
            fallingObjects.splice(i, 1);
            updateScoreDisplay();
            continue;
        }
        if (obj.y > gameHeight) {
            fallingObjects.splice(i, 1);
        }
    }
}

function updateScoreDisplay() {
    document.getElementById('score-display').textContent = `分数: ${score}`;
}

function updateActiveEffectsUI() {
    const container = document.getElementById('active-effects');
    container.innerHTML = '';
    
    if (activeEffects.widenTray) {
        container.innerHTML += '<span class="effect-tag" style="background:#32CD32;">加宽托盘</span>';
    }
    if (activeEffects.shield > 0) {
        container.innerHTML += `<span class="effect-tag" style="background:#FFD700;">护盾 x${activeEffects.shield}</span>`;
    }
    if (activeEffects.doubleScore) {
        container.innerHTML += '<span class="effect-tag" style="background:#FF69B4;">双倍得分</span>';
    }
    if (activeEffects.slowDown) {
        container.innerHTML += '<span class="effect-tag" style="background:#00CED1;">减速中</span>';
    }
    if (activeEffects.shrinkTray) {
        container.innerHTML += '<span class="effect-tag" style="background:#FF8C00;">缩小托盘</span>';
    }
    if (activeEffects.speedUp) {
        container.innerHTML += '<span class="effect-tag" style="background:#DC143C;">加速下落</span>';
    }
    if (activeEffects.freeze) {
        container.innerHTML += '<span class="effect-tag" style="background:#00FFFF;">时间冻结</span>';
    }
}

function gameLoop(timestamp) {
    if (gameState !== 'playing') return;
    if (isPaused) {
        animationId = requestAnimationFrame(gameLoop);
        return;
    }
    
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    ctx.translate(0, TOP_BAR_HEIGHT); // 整个游戏下移
    
    spawnObjects(timestamp);
    updateTray();
    updateFallingObjects();
    drawPoisonEffect();
    
    fallingObjects.forEach(obj => {
        if (obj.type === 'rain') drawRaindrop(obj);
        else if (obj.type === 'specialRain') drawSpecialRain(obj);
        else if (obj.type === 'powerup') drawPowerup(obj);
        else if (obj.type === 'leaf') drawLeaf(obj);
        else drawStone(obj);
    });
    
    drawTray();
    ctx.restore();
    updateActiveEffectsUI();
    animationId = requestAnimationFrame(gameLoop);
}

function handlePointerMove(e) {
    if (gameState !== 'playing' || isPaused) return;
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    tray.targetX = clientX - tray.width / 2;
}

canvas.addEventListener('mousemove', handlePointerMove);
canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    handlePointerMove(e);
});

function setActiveButton(diff) {
    document.querySelectorAll('.btn-easy, .btn-normal, .btn-hard').forEach(btn => {
        btn.classList.remove('active');
    });
    const activeBtn = document.querySelector(`.btn-${diff}`);
    if (activeBtn) {
        activeBtn.classList.add('active');
    }
}

function togglePause() {
    isPaused = !isPaused;
    const pauseBtn = document.getElementById('pause-btn');
    const pauseScreen = document.getElementById('pause-screen');
    
    if (isPaused) {
        pauseBtn.textContent = '继续';
        pauseBtn.classList.add('active');
        pauseScreen.classList.remove('hidden');
    } else {
        pauseBtn.textContent = '暂停';
        pauseBtn.classList.remove('active');
        pauseScreen.classList.add('hidden');
    }
}

function toggleSpeed() {
    currentSpeedIndex = (currentSpeedIndex + 1) % speedOptions.length;
    gameSpeed = speedOptions[currentSpeedIndex];
    document.getElementById('speed-btn').textContent = `速度: ${gameSpeed}x`;
}

function resetGame() {
    if (difficulty) {
        startGame(difficulty);
    }
}

function startGame(diff) {
    setActiveButton(diff);
    difficulty = diff;
    score = 0;
    fallingObjects = [];
    lastSpawnTime = 0;
    currentGridOffset = 0;
    isPaused = false;
    gameSpeed = 1;
    currentSpeedIndex = 1;
    
    tray.x = canvas.width / 2 - tray.width / 2;
    tray.targetX = tray.x;
    activeEffects = {
        widenTray: false,
        shield: 0,
        doubleScore: false,
        slowDown: false,
        shrinkTray: false,
        speedUp: false,
        freeze: false,
        poison: false,
        poisonEndTime: 0
    };
    updateScoreDisplay();
    document.getElementById('difficulty-label').textContent = `难度: ${difficultyConfigs[diff].name}`;
    document.getElementById('menu-screen').classList.add('hidden');
    document.getElementById('game-over-screen').classList.add('hidden');
    document.getElementById('pause-screen').classList.add('hidden');
    document.getElementById('bottom-controls').classList.remove('hidden');
    document.getElementById('pause-btn').textContent = '暂停';
    document.getElementById('pause-btn').classList.remove('active');
    document.getElementById('speed-btn').textContent = '速度: 1x';
    
    gameState = 'playing';
    animationId = requestAnimationFrame(gameLoop);
}

function showMenu() {
    gameState = 'menu';
    if (animationId) cancelAnimationFrame(animationId);
    document.getElementById('menu-screen').classList.remove('hidden');
    document.getElementById('game-over-screen').classList.add('hidden');
    document.getElementById('bottom-controls').classList.add('hidden');
    document.getElementById('pause-screen').classList.add('hidden');
}

window.startGame = startGame;
window.showMenu = showMenu;
window.togglePause = togglePause;
window.toggleSpeed = toggleSpeed;
window.resetGame = resetGame;
