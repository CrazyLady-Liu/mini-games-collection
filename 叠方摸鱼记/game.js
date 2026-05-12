const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const scoreElement = document.getElementById('score');
const zenModeBtn = document.getElementById('zenMode');
const activeModeBtn = document.getElementById('activeMode');
const autoModeBtn = document.getElementById('autoMode');
const centerBtn = document.getElementById('centerBtn');
const sensitivitySlider = document.getElementById('sensitivity');
const sensitivityValue = document.getElementById('sensitivityValue');
const speedIdleBtn = document.getElementById('speedIdle');
const speedEasyBtn = document.getElementById('speedEasy');
const speedNormalBtn = document.getElementById('speedNormal');
const speedHardBtn = document.getElementById('speedHard');
const speedSlider = document.getElementById('speedSlider');
const speedValue = document.getElementById('speedValue');
const pauseBtn = document.getElementById('pauseBtn');

canvas.width = 400;
canvas.height = 600;

const gameConfig = {
    zen: {
        blockSize: 60,
        moveSpeed: 6
    },
    active: {
        blockSize: 50,
        moveSpeed: 10
    }
};

const speedPresets = {
    idle: 0.2,
    easy: 0.8,
    normal: 1.8,
    hard: 3.5
};

const softColors = [
    '#FFB3BA', '#FFDFBA', '#FFFFBA', '#BAFFC9',
    '#BAE1FF', '#E0BBE4', '#957DAD', '#D4A5A5'
];

let currentMode = 'zen';
let config = gameConfig.zen;
let currentSpeedPreset = 'easy';
let currentSpeed = speedPresets.easy;
let isPaused = false;
let score = 0;
let blocks = [];
let currentBlock = null;
let baseY = canvas.height - 20;
let isAutoMode = false;
let sensitivity = 0.5;
let targetX = canvas.width / 2;
let velocityX = 0;
let autoTargetX = canvas.width / 2;

function randomColor() {
    return softColors[Math.floor(Math.random() * softColors.length)];
}

function createBlock() {
    const x = (canvas.width - config.blockSize) / 2;
    return {
        x: x,
        y: -config.blockSize,
        width: config.blockSize,
        height: config.blockSize,
        color: randomColor(),
        speed: currentSpeed,
        rotation: (Math.random() - 0.5) * 0.2
    };
}

function checkCollision(block, stackBlocks) {
    if (block.y + block.height >= baseY) {
        return { collided: true, newY: baseY - block.height };
    }

    for (let i = stackBlocks.length - 1; i >= 0; i--) {
        const stacked = stackBlocks[i];
        const tolerance = block.width * 0.5;
        
        const xOverlap = !(block.x + block.width < stacked.x - tolerance || 
                           block.x > stacked.x + stacked.width + tolerance);
        const yContact = block.y + block.height >= stacked.y && 
                        block.y + block.height <= stacked.y + 25;

        if (xOverlap && yContact) {
            return { collided: true, newY: stacked.y - block.height };
        }
    }
    return { collided: false };
}

function updateScore() {
    if (blocks.length > 0) {
        const highestBlock = blocks.reduce((highest, block) => 
            block.y < highest.y ? block : highest
        );
        score = Math.floor((baseY - highestBlock.y) / config.blockSize);
    } else {
        score = 0;
    }
    scoreElement.textContent = score;
}

function drawRoundedRect(x, y, width, height, radius) {
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();
}

function drawBlock(block) {
    ctx.save();
    const centerX = block.x + block.width / 2;
    const centerY = block.y + block.height / 2;
    ctx.translate(centerX, centerY);
    if (block.rotation) {
        ctx.rotate(block.rotation);
    }
    ctx.translate(-centerX, -centerY);
    
    ctx.fillStyle = block.color;
    drawRoundedRect(block.x, block.y, block.width, block.height, 10);
    ctx.fill();
    
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.lineWidth = 3;
    drawRoundedRect(block.x, block.y, block.width, block.height, 10);
    ctx.stroke();
    
    ctx.restore();
}

function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.fillStyle = '#e0e0e0';
    ctx.fillRect(0, baseY, canvas.width, canvas.height - baseY);
    
    blocks.forEach(drawBlock);
    
    if (currentBlock) {
        drawBlock(currentBlock);
    }
    
    if (isPaused) {
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = 'white';
        ctx.font = 'bold 32px Microsoft YaHei';
        ctx.textAlign = 'center';
        ctx.fillText('已暂停', canvas.width / 2, canvas.height / 2);
        ctx.font = '16px Microsoft YaHei';
        ctx.fillText('点击暂停按钮继续', canvas.width / 2, canvas.height / 2 + 40);
    }
}

function update() {
    if (isPaused) return;
    
    if (!currentBlock) {
        currentBlock = createBlock();
        if (isAutoMode) {
            autoTargetX = canvas.width / 2 + (Math.random() - 0.5) * 100;
        }
    }

    if (currentBlock) {
        currentBlock.y += currentBlock.speed;

        if (isAutoMode) {
            const diff = autoTargetX - (currentBlock.x + currentBlock.width / 2);
            velocityX += diff * 0.02;
            velocityX *= 0.9;
        }
        
        const targetDiff = targetX - (currentBlock.x + currentBlock.width / 2);
        velocityX += targetDiff * 0.15;
        velocityX *= 0.92;
        
        currentBlock.x += velocityX;
        currentBlock.x = Math.max(0, Math.min(canvas.width - config.blockSize, currentBlock.x));
    }

    const collision = checkCollision(currentBlock, blocks);
    if (collision.collided) {
        currentBlock.y = collision.newY;
        currentBlock.rotation = (Math.random() - 0.5) * 0.3;
        blocks.push(currentBlock);
        currentBlock = null;
        velocityX = 0;
        targetX = canvas.width / 2;
        updateScore();
    }

    if (currentBlock && currentBlock.y > canvas.height) {
        currentBlock = null;
    }
}

function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

document.addEventListener('keydown', (e) => {
    if (!currentBlock || isPaused) return;
    if (e.key === 'ArrowLeft') {
        targetX -= config.moveSpeed * sensitivity * 2;
    } else if (e.key === 'ArrowRight') {
        targetX += config.moveSpeed * sensitivity * 2;
    }
    targetX = Math.max(config.blockSize / 2, Math.min(canvas.width - config.blockSize / 2, targetX));
});

let touchStartX = 0;
canvas.addEventListener('touchstart', (e) => {
    touchStartX = e.touches[0].clientX;
});

canvas.addEventListener('touchmove', (e) => {
    e.preventDefault();
    if (!currentBlock || isPaused) return;
    const touchX = e.touches[0].clientX;
    const diff = touchX - touchStartX;
    if (Math.abs(diff) > 3) {
        targetX += diff * sensitivity;
        touchStartX = touchX;
    }
    targetX = Math.max(config.blockSize / 2, Math.min(canvas.width - config.blockSize / 2, targetX));
});

let mouseStartX = 0;
let isDragging = false;
canvas.addEventListener('mousedown', (e) => {
    isDragging = true;
    mouseStartX = e.clientX;
});

canvas.addEventListener('mousemove', (e) => {
    if (!isDragging || !currentBlock || isPaused) return;
    const diff = e.clientX - mouseStartX;
    if (Math.abs(diff) > 3) {
        targetX += diff * sensitivity * 0.8;
        mouseStartX = e.clientX;
    }
    targetX = Math.max(config.blockSize / 2, Math.min(canvas.width - config.blockSize / 2, targetX));
});

canvas.addEventListener('mouseup', () => {
    isDragging = false;
});

canvas.addEventListener('mouseleave', () => {
    isDragging = false;
});

function setMode(mode) {
    currentMode = mode;
    config = gameConfig[mode];
    
    zenModeBtn.classList.toggle('active', mode === 'zen');
    activeModeBtn.classList.toggle('active', mode === 'active');
}

function setSpeedPreset(preset) {
    currentSpeedPreset = preset;
    currentSpeed = speedPresets[preset];
    speedSlider.value = currentSpeed;
    speedValue.textContent = currentSpeed.toFixed(1);
    
    speedIdleBtn.classList.toggle('active', preset === 'idle');
    speedEasyBtn.classList.toggle('active', preset === 'easy');
    speedNormalBtn.classList.toggle('active', preset === 'normal');
    speedHardBtn.classList.toggle('active', preset === 'hard');
    
    if (currentBlock) {
        currentBlock.speed = currentSpeed;
    }
}

function togglePause() {
    isPaused = !isPaused;
    pauseBtn.classList.toggle('active', isPaused);
    pauseBtn.textContent = isPaused ? '继续' : '暂停';
}

zenModeBtn.addEventListener('click', () => setMode('zen'));
activeModeBtn.addEventListener('click', () => setMode('active'));

autoModeBtn.addEventListener('click', () => {
    isAutoMode = !isAutoMode;
    autoModeBtn.classList.toggle('active', isAutoMode);
});

centerBtn.addEventListener('click', () => {
    if (currentBlock) {
        targetX = canvas.width / 2;
    }
});

sensitivitySlider.addEventListener('input', (e) => {
    sensitivity = e.target.value / 100;
    sensitivityValue.textContent = e.target.value;
});

speedIdleBtn.addEventListener('click', () => setSpeedPreset('idle'));
speedEasyBtn.addEventListener('click', () => setSpeedPreset('easy'));
speedNormalBtn.addEventListener('click', () => setSpeedPreset('normal'));
speedHardBtn.addEventListener('click', () => setSpeedPreset('hard'));

speedSlider.addEventListener('input', (e) => {
    currentSpeed = parseFloat(e.target.value);
    speedValue.textContent = currentSpeed.toFixed(1);
    
    speedIdleBtn.classList.remove('active');
    speedEasyBtn.classList.remove('active');
    speedNormalBtn.classList.remove('active');
    speedHardBtn.classList.remove('active');
    
    if (currentBlock) {
        currentBlock.speed = currentSpeed;
    }
});

pauseBtn.addEventListener('click', togglePause);

targetX = canvas.width / 2;
gameLoop();
