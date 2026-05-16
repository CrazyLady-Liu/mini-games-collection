const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const angleSlider = document.getElementById('angleSlider');
const angleDisplay = document.getElementById('angleDisplay');
const levelDisplay = document.getElementById('levelDisplay');
const starsDisplay = document.getElementById('starsDisplay');
const overlay = document.getElementById('overlay');
const overlayTitle = document.getElementById('overlayTitle');
const overlayText = document.getElementById('overlayText');
const starsResult = document.getElementById('starsResult');
const startBtn = document.getElementById('startBtn');
const resetBtn = document.getElementById('resetBtn');
const slowModeToggle = document.getElementById('slowModeToggle');
const skinButtons = document.querySelectorAll('.skin-btn');
const blockButtons = document.querySelectorAll('.block-btn');

const GameState = {
    READY: 'ready',
    PLAYING: 'playing',
    SUCCESS: 'success',
    FAILED: 'failed',
    ALL_CLEAR: 'all_clear'
};

let gameState = GameState.READY;
let currentLevel = 1;
const totalLevels = 5;

let targetAngle = 0;
let currentAngle = 0;
const MAX_ANGLE = 25;

let slowMode = false;
let currentSkin = 'grass';
let currentBlockType = 'square';
let unlockedBlocks = ['square'];

let adjustmentCount = 0;
let maxRotation = 0;
let totalAngleChange = 0;
let lastAngle = 0;
let levelStartTime = 0;

const ground = {
    y: 350,
    startX: 50,
    endX: 750
};

const block = {
    x: 100,
    y: 330,
    size: 40,
    rotation: 0,
    velocityX: 0,
    velocityY: 0,
    angularVelocity: 0,
    onGround: true
};

const startLine = { x: 80 };
const endLine = { x: 720 };

const skinConfigs = {
    grass: {
        friction: 0.98,
        rollingFriction: 0.995,
        groundColor: '#8B4513',
        groundColor2: '#654321',
        topColor: '#228B22',
        name: '草地'
    },
    ice: {
        friction: 0.995,
        rollingFriction: 0.999,
        groundColor: '#B0E0E6',
        groundColor2: '#87CEEB',
        topColor: '#E0FFFF',
        name: '冰面'
    },
    sand: {
        friction: 0.94,
        rollingFriction: 0.98,
        groundColor: '#D2B48C',
        groundColor2: '#C4A35A',
        topColor: '#F4A460',
        name: '砂石'
    }
};

const levels = [
    { groundY: 350, startX: 100, endX: 700, obstacles: [], unlockBlock: null },
    { groundY: 350, startX: 100, endX: 700, obstacles: [{ x: 350, width: 60, height: 20 }], unlockBlock: 'ball' },
    { groundY: 340, startX: 100, endX: 700, obstacles: [{ x: 280, width: 50, height: 30 }, { x: 480, width: 50, height: 30 }], unlockBlock: null },
    { groundY: 360, startX: 80, endX: 720, obstacles: [{ x: 300, width: 80, height: 25 }, { x: 500, width: 80, height: 25 }], unlockBlock: 'heart' },
    { groundY: 350, startX: 100, endX: 700, obstacles: [{ x: 250, width: 40, height: 35 }, { x: 400, width: 40, height: 35 }, { x: 550, width: 40, height: 35 }], unlockBlock: null }
];

function initLevel() {
    const level = levels[Math.min(currentLevel - 1, levels.length - 1)];
    ground.y = level.groundY;
    ground.startX = level.startX;
    ground.endX = level.endX;
    
    block.x = ground.startX + 50;
    block.y = ground.y - block.size / 2;
    block.rotation = 0;
    block.velocityX = 0;
    block.velocityY = 0;
    block.angularVelocity = 0;
    block.onGround = true;
    
    targetAngle = 0;
    currentAngle = 0;
    angleSlider.value = 0;
    angleDisplay.textContent = '0';
    
    adjustmentCount = 0;
    maxRotation = 0;
    totalAngleChange = 0;
    lastAngle = 0;
    levelStartTime = Date.now();
    
    levelDisplay.textContent = currentLevel;
    starsDisplay.textContent = '☆☆☆';
    
    updateBlockButtons();
    
    console.log(`[关卡初始化] 第 ${currentLevel} 关 | 障碍物: ${level.obstacles.length}个 | 地面Y: ${level.groundY} | 皮肤: ${skinConfigs[currentSkin].name} | 方块: ${getBlockName(currentBlockType)}`);
}

function updateBlockButtons() {
    blockButtons.forEach(btn => {
        const blockType = btn.dataset.block;
        btn.classList.remove('active', 'locked');
        
        if (blockType === currentBlockType) {
            btn.classList.add('active');
        }
        
        if (!unlockedBlocks.includes(blockType)) {
            btn.classList.add('locked');
        }
    });
}

function drawGround() {
    const level = levels[Math.min(currentLevel - 1, levels.length - 1)];
    const centerX = (ground.startX + ground.endX) / 2;
    const skin = skinConfigs[currentSkin];
    
    ctx.save();
    ctx.translate(centerX, ground.y);
    ctx.rotate(currentAngle * Math.PI / 180);
    ctx.translate(-centerX, -ground.y);
    
    const gradient = ctx.createLinearGradient(0, ground.y, 0, ground.y + 50);
    gradient.addColorStop(0, skin.groundColor);
    gradient.addColorStop(1, skin.groundColor2);
    
    ctx.fillStyle = gradient;
    ctx.beginPath();
    ctx.moveTo(ground.startX - 50, ground.y);
    ctx.lineTo(ground.endX + 50, ground.y);
    ctx.lineTo(ground.endX + 50, ground.y + 50);
    ctx.lineTo(ground.startX - 50, ground.y + 50);
    ctx.closePath();
    ctx.fill();
    
    ctx.fillStyle = skin.topColor;
    ctx.fillRect(ground.startX - 50, ground.y - 5, ground.endX - ground.startX + 100, 5);
    
    if (currentSkin === 'grass') {
        ctx.fillStyle = '#228B22';
        for (let i = ground.startX - 30; i < ground.endX + 30; i += 15) {
            ctx.beginPath();
            ctx.moveTo(i, ground.y - 5);
            ctx.lineTo(i + 3, ground.y - 12);
            ctx.lineTo(i + 6, ground.y - 5);
            ctx.closePath();
            ctx.fill();
        }
    } else if (currentSkin === 'ice') {
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.lineWidth = 1;
        for (let i = ground.startX - 20; i < ground.endX + 20; i += 30) {
            ctx.beginPath();
            ctx.moveTo(i, ground.y + 10);
            ctx.lineTo(i + 20, ground.y + 10);
            ctx.stroke();
        }
    } else if (currentSkin === 'sand') {
        ctx.fillStyle = '#C4A35A';
        for (let i = ground.startX - 20; i < ground.endX + 20; i += 25) {
            ctx.beginPath();
            ctx.arc(i + Math.random() * 10, ground.y + 20 + Math.random() * 15, 2, 0, Math.PI * 2);
            ctx.fill();
        }
    }
    
    ctx.strokeStyle = skin.groundColor2;
    ctx.lineWidth = 1;
    for (let i = ground.startX; i < ground.endX; i += 40) {
        ctx.beginPath();
        ctx.moveTo(i, ground.y + 5);
        ctx.lineTo(i + 20, ground.y + 45);
        ctx.stroke();
    }
    
    level.obstacles.forEach(obs => {
        ctx.fillStyle = skin.groundColor;
        ctx.fillRect(obs.x, ground.y - obs.height, obs.width, obs.height);
        ctx.fillStyle = skin.topColor;
        ctx.fillRect(obs.x, ground.y - obs.height, obs.width, 5);
    });
    
    ctx.restore();
}

function drawStartEnd() {
    ctx.save();
    ctx.strokeStyle = '#4CAF50';
    ctx.lineWidth = 3;
    ctx.setLineDash([10, 5]);
    ctx.beginPath();
    ctx.moveTo(startLine.x, ground.y - 100);
    ctx.lineTo(startLine.x, ground.y);
    ctx.stroke();
    ctx.setLineDash([]);
    
    ctx.fillStyle = '#4CAF50';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.fillText('起点', startLine.x, ground.y - 110);
    
    ctx.strokeStyle = '#FF5722';
    ctx.lineWidth = 3;
    ctx.setLineDash([10, 5]);
    ctx.beginPath();
    ctx.moveTo(endLine.x, ground.y - 100);
    ctx.lineTo(endLine.x, ground.y);
    ctx.stroke();
    ctx.setLineDash([]);
    
    ctx.fillStyle = '#FF5722';
    ctx.font = 'bold 14px Arial';
    ctx.fillText('终点', endLine.x, ground.y - 110);
    
    ctx.fillStyle = '#FFD700';
    ctx.beginPath();
    ctx.moveTo(endLine.x, ground.y - 100);
    ctx.lineTo(endLine.x + 25, ground.y - 90);
    ctx.lineTo(endLine.x, ground.y - 80);
    ctx.closePath();
    ctx.fill();
    
    ctx.restore();
}

function drawBlock() {
    ctx.save();
    ctx.translate(block.x, block.y);
    ctx.rotate(block.rotation);
    
    if (currentBlockType === 'square') {
        ctx.fillStyle = '#FF6B6B';
        ctx.fillRect(-block.size / 2, -block.size / 2, block.size, block.size);
        
        ctx.strokeStyle = '#CC5555';
        ctx.lineWidth = 3;
        ctx.strokeRect(-block.size / 2, -block.size / 2, block.size, block.size);
        
        ctx.fillStyle = '#FFF';
        ctx.font = 'bold 20px Arial';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('■', 0, 0);
    } else if (currentBlockType === 'ball') {
        const gradient = ctx.createRadialGradient(-8, -8, 5, 0, 0, block.size / 2);
        gradient.addColorStop(0, '#FFB6C1');
        gradient.addColorStop(1, '#FF6B6B');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(0, 0, block.size / 2, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = '#CC5555';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        ctx.beginPath();
        ctx.arc(-8, -8, 8, 0, Math.PI * 2);
        ctx.fill();
    } else if (currentBlockType === 'heart') {
        ctx.fillStyle = '#FF6B6B';
        ctx.beginPath();
        const s = block.size / 2;
        ctx.moveTo(0, s * 0.6);
        ctx.bezierCurveTo(s, s * 0.2, s * 0.8, -s * 0.4, 0, -s * 0.1);
        ctx.bezierCurveTo(-s * 0.8, -s * 0.4, -s, s * 0.2, 0, s * 0.6);
        ctx.fill();
        
        ctx.strokeStyle = '#CC5555';
        ctx.lineWidth = 3;
        ctx.stroke();
        
        ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        ctx.beginPath();
        ctx.ellipse(-s * 0.3, -s * 0.1, 5, 3, -0.5, 0, Math.PI * 2);
        ctx.fill();
    }
    
    ctx.restore();
}

function drawBackground() {
    let skyGradient;
    if (currentSkin === 'ice') {
        skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        skyGradient.addColorStop(0, '#4682B4');
        skyGradient.addColorStop(1, '#B0E0E6');
    } else if (currentSkin === 'sand') {
        skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        skyGradient.addColorStop(0, '#FF8C00');
        skyGradient.addColorStop(1, '#FFD700');
    } else {
        skyGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        skyGradient.addColorStop(0, '#87CEEB');
        skyGradient.addColorStop(1, '#E0F6FF');
    }
    ctx.fillStyle = skyGradient;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
    drawCloud(100, 80, 50);
    drawCloud(300, 50, 40);
    drawCloud(550, 90, 45);
    drawCloud(680, 60, 35);
    
    if (currentSkin === 'grass') {
        ctx.fillStyle = '#90EE90';
        ctx.beginPath();
        ctx.moveTo(0, 400);
        ctx.quadraticCurveTo(200, 320, 400, 380);
        ctx.quadraticCurveTo(600, 420, 800, 360);
        ctx.lineTo(800, 500);
        ctx.lineTo(0, 500);
        ctx.closePath();
        ctx.fill();
    } else if (currentSkin === 'ice') {
        ctx.fillStyle = '#E0FFFF';
        ctx.beginPath();
        ctx.moveTo(0, 400);
        ctx.quadraticCurveTo(200, 340, 400, 390);
        ctx.quadraticCurveTo(600, 430, 800, 370);
        ctx.lineTo(800, 500);
        ctx.lineTo(0, 500);
        ctx.closePath();
        ctx.fill();
    } else if (currentSkin === 'sand') {
        ctx.fillStyle = '#DEB887';
        ctx.beginPath();
        ctx.moveTo(0, 400);
        ctx.quadraticCurveTo(200, 330, 400, 385);
        ctx.quadraticCurveTo(600, 425, 800, 365);
        ctx.lineTo(800, 500);
        ctx.lineTo(0, 500);
        ctx.closePath();
        ctx.fill();
    }
}

function drawCloud(x, y, size) {
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.arc(x + size * 0.8, y - size * 0.2, size * 0.7, 0, Math.PI * 2);
    ctx.arc(x + size * 1.5, y, size * 0.8, 0, Math.PI * 2);
    ctx.fill();
}

function drawSlowModeIndicator() {
    if (slowMode && gameState === GameState.PLAYING) {
        ctx.save();
        ctx.fillStyle = 'rgba(102, 126, 234, 0.9)';
        ctx.fillRect(canvas.width - 130, 10, 120, 35);
        ctx.fillStyle = 'white';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('🐢 慢放模式', canvas.width - 70, 33);
        ctx.restore();
    }
}

function getGroundYAt(x) {
    const centerX = (ground.startX + ground.endX) / 2;
    const dx = x - centerX;
    const angleRad = currentAngle * Math.PI / 180;
    return ground.y + dx * Math.tan(angleRad);
}

function getObstacleHeightAt(x) {
    const level = levels[Math.min(currentLevel - 1, levels.length - 1)];
    const centerX = (ground.startX + ground.endX) / 2;
    const angleRad = currentAngle * Math.PI / 180;
    
    for (const obs of level.obstacles) {
        const obsLeft = obs.x;
        const obsRight = obs.x + obs.width;
        
        if (x >= obsLeft - block.size / 2 && x <= obsRight + block.size / 2) {
            const obsTopY = ground.y - obs.height;
            const dx = x - centerX;
            return obsTopY + dx * Math.tan(angleRad);
        }
    }
    return null;
}

function updatePhysics(deltaTime) {
    if (gameState !== GameState.PLAYING) return;
    
    const timeScale = slowMode ? 0.4 : 1;
    const dt = deltaTime * timeScale;
    
    const GRAVITY = 800;
    const MAX_SPEED = 300;
    const ACCEL_FACTOR = 0.3;
    const ROTATION_FACTOR = 0.02;
    
    const skin = skinConfigs[currentSkin];
    const friction = skin.friction;
    const rollingFriction = skin.rollingFriction;
    const angleRad = currentAngle * Math.PI / 180;
    
    const acceleration = GRAVITY * Math.sin(angleRad) * ACCEL_FACTOR;
    block.velocityX += acceleration * dt;
    block.velocityX *= Math.pow(friction, dt * 60);
    
    block.velocityY += GRAVITY * dt;
    
    block.x += block.velocityX * dt;
    block.y += block.velocityY * dt;
    
    const groundY = getGroundYAt(block.x);
    const obstacleY = getObstacleHeightAt(block.x);
    const effectiveGroundY = obstacleY !== null ? Math.min(groundY, obstacleY) : groundY;
    const blockBottom = block.y + block.size / 2;
    
    if (blockBottom >= effectiveGroundY) {
        block.y = effectiveGroundY - block.size / 2;
        block.velocityY = 0;
        block.onGround = true;
        
        const rotationAccel = acceleration * ROTATION_FACTOR;
        block.angularVelocity += rotationAccel * dt;
        block.angularVelocity *= Math.pow(rollingFriction, dt * 60);
    } else {
        block.onGround = false;
        block.angularVelocity *= 0.998;
    }
    
    block.rotation += block.angularVelocity * dt;
    
    const rotationDeg = Math.abs(block.rotation * 180 / Math.PI);
    if (rotationDeg > maxRotation) {
        maxRotation = rotationDeg;
    }
    
    if (Math.abs(block.velocityX) > MAX_SPEED) {
        block.velocityX = Math.sign(block.velocityX) * MAX_SPEED;
    }
    
    checkGameState();
}

function checkGameState() {
    if (block.x < ground.startX - 100 || block.x > ground.endX + 100) {
        console.log(`[掉落检测] 方块超出水平边界 | 位置: x=${block.x.toFixed(1)}, y=${block.y.toFixed(1)} | 边界范围: [${ground.startX - 100}, ${ground.endX + 100}]`);
        gameOver(false, '方块掉落了！');
        return;
    }
    
    if (block.y > canvas.height + 100) {
        console.log(`[掉落检测] 方块跌出画布下方 | 位置: x=${block.x.toFixed(1)}, y=${block.y.toFixed(1)} | 画布高度: ${canvas.height}`);
        gameOver(false, '方块掉落了！');
        return;
    }
    
    const tiltThreshold = 50;
    const rotationDeg = block.rotation * 180 / Math.PI;
    const normalizedRotation = ((rotationDeg % 360) + 360) % 360;
    if (normalizedRotation > tiltThreshold && normalizedRotation < 360 - tiltThreshold) {
        console.log(`[侧翻检测] 方块侧翻 | 原始角度: ${rotationDeg.toFixed(1)}° | 归一化角度: ${normalizedRotation.toFixed(1)}° | 阈值: ±${tiltThreshold}°`);
        console.log(`[侧翻检测] 当前状态 | 速度: vx=${block.velocityX.toFixed(1)}, vy=${block.velocityY.toFixed(1)} | 在地面: ${block.onGround}`);
        gameOver(false, '方块侧翻了！');
        return;
    }
    
    if (block.x >= endLine.x - 10 && block.onGround) {
        const timeTaken = ((Date.now() - levelStartTime) / 1000).toFixed(1);
        console.log(`[通关检测] 方块抵达终点 | 位置: x=${block.x.toFixed(1)}, y=${block.y.toFixed(1)} | 终点线: x=${endLine.x}`);
        console.log(`[通关检测] 通关数据 | 用时: ${timeTaken}s | 调节次数: ${adjustmentCount} | 最大旋转: ${maxRotation.toFixed(1)}° | 总角度变化: ${totalAngleChange.toFixed(1)}°`);
        console.log(`[通关检测] 物理状态 | 最终速度: ${block.velocityX.toFixed(1)} | 在地面: ${block.onGround} | 当前坡度: ${currentAngle.toFixed(1)}°`);
        gameOver(true, '平稳抵达终点！');
    }
}

function calculateStars() {
    let stars = 1;
    
    if (maxRotation < 20) {
        stars++;
    }
    
    if (adjustmentCount < 15 && totalAngleChange < 200) {
        stars++;
    }
    
    return stars;
}

function displayStars(count) {
    let result = '';
    for (let i = 0; i < 3; i++) {
        result += i < count ? '⭐' : '☆';
    }
    starsResult.textContent = result;
    starsDisplay.textContent = result;
}

function gameOver(success, message) {
    if (success) {
        gameState = GameState.SUCCESS;
        const stars = calculateStars();
        displayStars(stars);
        
        const level = levels[Math.min(currentLevel - 1, levels.length - 1)];
        let unlockMessage = '';
        if (level.unlockBlock && !unlockedBlocks.includes(level.unlockBlock)) {
            unlockedBlocks.push(level.unlockBlock);
            updateBlockButtons();
            unlockMessage = ` | 解锁外观: ${getBlockName(level.unlockBlock)}`;
            message += `\n🎉 解锁新外观: ${getBlockName(level.unlockBlock)}！`;
        }
        
        console.log(`[游戏结束] ✅ 通关成功 | 关卡: ${currentLevel}/${totalLevels} | 星级: ${'⭐'.repeat(stars)}${'☆'.repeat(3-stars)} (${stars}/3)${unlockMessage}`);
        
        let starText = '';
        if (stars === 3) starText = '完美通关！';
        else if (stars === 2) starText = '表现不错！';
        else starText = '顺利通关！';
        
        showOverlay('🎉 ' + starText, message + '\n准备进入下一关...', 'success');
        
        setTimeout(() => {
            if (currentLevel < totalLevels) {
                currentLevel++;
                console.log(`[关卡切换] 进入第 ${currentLevel} 关`);
                initLevel();
                gameState = GameState.PLAYING;
                hideOverlay();
            } else {
                gameState = GameState.ALL_CLEAR;
                console.log('[游戏结束] 🏆 全部通关！');
                showOverlay('🏆 恭喜通关！', '你已完成所有关卡！\n点击重新开始', 'success', '重新开始');
            }
        }, 2500);
    } else {
        gameState = GameState.FAILED;
        console.log(`[游戏结束] ❌ 挑战失败 | 关卡: ${currentLevel} | 原因: ${message}`);
        starsResult.textContent = '';
        showOverlay('😢 挑战失败', message + '\n点击重试', 'failure', '重试');
    }
}

function getBlockName(type) {
    const names = {
        square: '方块',
        ball: '圆球',
        heart: '爱心'
    };
    return names[type] || type;
}

function showOverlay(title, text, type, btnText) {
    overlayTitle.textContent = title;
    overlayText.textContent = text;
    overlayTitle.className = type;
    overlayText.className = type;
    startBtn.textContent = btnText || '继续';
    overlay.classList.remove('hidden');
}

function hideOverlay() {
    overlay.classList.add('hidden');
    starsResult.textContent = '';
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    drawBackground();
    drawGround();
    drawStartEnd();
    drawBlock();
    drawSlowModeIndicator();
    
    if (Math.abs(currentAngle) > MAX_ANGLE * 0.8) {
        ctx.fillStyle = 'rgba(255, 0, 0, 0.1)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        ctx.fillStyle = '#f44336';
        ctx.font = 'bold 16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('⚠️ 注意：坡度过陡！', canvas.width / 2, 30);
    }
}

let lastTime = 0;
function gameLoop(timestamp) {
    const deltaTime = Math.min((timestamp - lastTime) / 1000, 0.05);
    lastTime = timestamp;
    
    const ANGLE_LERP = 0.15;
    const angleDiff = targetAngle - currentAngle;
    currentAngle += angleDiff * ANGLE_LERP;
    
    if (gameState === GameState.PLAYING) {
        updatePhysics(deltaTime);
    }
    
    draw();
    requestAnimationFrame(gameLoop);
}

angleSlider.addEventListener('input', (e) => {
    const newAngle = parseFloat(e.target.value);
    const clampedAngle = Math.max(-MAX_ANGLE, Math.min(MAX_ANGLE, newAngle));
    
    if (Math.abs(clampedAngle - targetAngle) > 0.1) {
        targetAngle = clampedAngle;
        angleDisplay.textContent = targetAngle.toFixed(1);
        
        if (gameState === GameState.PLAYING) {
            adjustmentCount++;
            totalAngleChange += Math.abs(targetAngle - lastAngle);
            lastAngle = targetAngle;
            
            if (adjustmentCount % 5 === 0) {
                console.log(`[坡度调节] 第${adjustmentCount}次调节 | 目标坡度: ${targetAngle.toFixed(1)}° | 方块位置: x=${block.x.toFixed(1)}, vx=${block.velocityX.toFixed(1)}`);
            }
        }
    }
});

startBtn.addEventListener('click', () => {
    if (gameState === GameState.ALL_CLEAR) {
        currentLevel = 1;
        initLevel();
    } else if (gameState === GameState.FAILED || gameState === GameState.READY) {
        initLevel();
    }
    gameState = GameState.PLAYING;
    hideOverlay();
});

resetBtn.addEventListener('click', () => {
    initLevel();
    if (gameState !== GameState.PLAYING) {
        gameState = GameState.PLAYING;
        hideOverlay();
    }
});

slowModeToggle.addEventListener('change', (e) => {
    slowMode = e.target.checked;
});

skinButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        skinButtons.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        currentSkin = btn.dataset.skin;
    });
});

blockButtons.forEach(btn => {
    btn.addEventListener('click', () => {
        const blockType = btn.dataset.block;
        if (unlockedBlocks.includes(blockType)) {
            blockButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentBlockType = blockType;
        }
    });
});

document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'a') {
        targetAngle = Math.max(targetAngle - 1, -MAX_ANGLE);
        angleSlider.value = targetAngle;
        angleDisplay.textContent = targetAngle.toFixed(1);
        if (gameState === GameState.PLAYING) {
            adjustmentCount++;
            totalAngleChange += Math.abs(targetAngle - lastAngle);
            lastAngle = targetAngle;
        }
    } else if (e.key === 'ArrowRight' || e.key === 'd') {
        targetAngle = Math.min(targetAngle + 1, MAX_ANGLE);
        angleSlider.value = targetAngle;
        angleDisplay.textContent = targetAngle.toFixed(1);
        if (gameState === GameState.PLAYING) {
            adjustmentCount++;
            totalAngleChange += Math.abs(targetAngle - lastAngle);
            lastAngle = targetAngle;
        }
    } else if (e.key === 'r' || e.key === 'R') {
        initLevel();
        if (gameState !== GameState.PLAYING) {
            gameState = GameState.PLAYING;
            hideOverlay();
        }
    } else if (e.key === ' ' && gameState !== GameState.PLAYING) {
        e.preventDefault();
        startBtn.click();
    } else if (e.key === 's' || e.key === 'S') {
        slowModeToggle.checked = !slowModeToggle.checked;
        slowMode = slowModeToggle.checked;
    }
});

initLevel();
console.log('🎮 坡度稳行游戏启动 | 按F12打开开发者工具查看调试日志');
console.log('📋 日志说明: [关卡初始化] [坡度调节] [掉落检测] [侧翻检测] [通关检测] [游戏结束]');
requestAnimationFrame(gameLoop);
