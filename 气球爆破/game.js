const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

canvas.width = 800;
canvas.height = 600;

let score = 0;
let combo = 0;
let maxCombo = 0;
let lives = 3;
let gameRunning = true;
let gameTime = 0;
let level = 1;
let balloons = [];
let particles = [];
let floatingTexts = [];
let frozenUntil = 0;

const config = {
    baseSpawnRate: 1500,
    baseSpeed: 1,
    baseBalloonsPerSpawn: 1,
    colors: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dfe6e9', '#fd79a8', '#a29bfe'],
    sizes: [
        { name: 'small', radius: 25, score: 15, speedMultiplier: 1.4 },
        { name: 'medium', radius: 35, score: 10, speedMultiplier: 1 },
        { name: 'large', radius: 50, score: 5, speedMultiplier: 0.7 }
    ],
    specialTypes: [
        { name: 'golden', color: '#ffd700', chance: 0.08 },
        { name: 'bomb', color: '#333', chance: 0.05 },
        { name: 'ice', color: '#00bfff', chance: 0.07 }
    ],
    comboMultipliers: [
        { min: 0, max: 4, multiplier: 1, color: '#ffffff' },
        { min: 5, max: 9, multiplier: 2, color: '#ffd700' },
        { min: 10, max: 19, multiplier: 3, color: '#ff6b6b' },
        { min: 20, max: 39, multiplier: 4, color: '#4ecdc4' },
        { min: 40, max: Infinity, multiplier: 5, color: '#f093fb' }
    ],
    levelThresholds: [0, 500, 1200, 2200, 3500, 5000, 7000, 10000, 15000, 20000]
};

let currentSpawnRate = config.baseSpawnRate;
let currentSpeed = config.baseSpeed;
let currentBalloonsPerSpawn = config.baseBalloonsPerSpawn;
let wobbleChance = 0.6;
let specialChanceMultiplier = 1;

const scoreEl = document.getElementById('score');
const comboEl = document.getElementById('combo');
const multiplierEl = document.getElementById('multiplier');
const heartsContainer = document.getElementById('heartsContainer');
const levelEl = document.getElementById('level');
const gameOverEl = document.getElementById('gameOver');
const finalScoreEl = document.getElementById('finalScore');
const finalLevelEl = document.getElementById('finalLevel');
const maxComboEl = document.getElementById('maxCombo');
const restartBtn = document.getElementById('restartBtn');
const comboPopup = document.getElementById('comboPopup');
const levelUpPopup = document.getElementById('levelUpPopup');
const newLevelEl = document.getElementById('newLevel');
const damageFlash = document.getElementById('damageFlash');

class Balloon {
    constructor(x) {
        const sizeIndex = Math.floor(Math.random() * config.sizes.length);
        this.size = config.sizes[sizeIndex];
        this.radius = this.size.radius;

        this.type = 'normal';
        this.color = config.colors[Math.floor(Math.random() * config.colors.length)];

        const rand = Math.random();
        let cumulative = 0;
        const adjustedSpecialTypes = config.specialTypes.map(t => ({
            ...t,
            chance: t.chance * specialChanceMultiplier
        }));
        for (const special of adjustedSpecialTypes) {
            cumulative += special.chance;
            if (rand < cumulative) {
                this.type = special.name;
                this.color = special.color;
                break;
            }
        }

        if (x !== undefined) {
            this.x = x;
        } else {
            this.x = this.radius + Math.random() * (canvas.width - 2 * this.radius);
        }
        this.y = canvas.height + this.radius;

        this.baseSpeed = currentSpeed * this.size.speedMultiplier * (0.8 + Math.random() * 0.4);
        this.speed = this.baseSpeed;

        this.wobbleEnabled = Math.random() < wobbleChance;
        this.wobbleOffset = Math.random() * Math.PI * 2;
        this.wobbleSpeed = 0.015 + Math.random() * 0.02;
        this.wobbleAmount = 15 + Math.random() * 25;
        this.originalX = this.x;
    }

    update() {
        let actualSpeed = this.baseSpeed;
        if (frozenUntil > Date.now()) {
            actualSpeed *= 0.3;
        }
        this.speed = actualSpeed;

        this.y -= this.speed;

        if (this.wobbleEnabled) {
            this.wobbleOffset += this.wobbleSpeed;
            this.x = this.originalX + Math.sin(this.wobbleOffset) * this.wobbleAmount;
        }
    }

    draw() {
        ctx.save();

        const gradient = ctx.createRadialGradient(
            this.x - this.radius * 0.3,
            this.y - this.radius * 0.3,
            0,
            this.x,
            this.y,
            this.radius
        );

        if (this.type === 'golden') {
            gradient.addColorStop(0, '#fff7ae');
            gradient.addColorStop(0.5, '#ffd700');
            gradient.addColorStop(1, '#b8860b');
        } else if (this.type === 'bomb') {
            gradient.addColorStop(0, '#666');
            gradient.addColorStop(0.5, '#333');
            gradient.addColorStop(1, '#111');
        } else if (this.type === 'ice') {
            gradient.addColorStop(0, '#e0ffff');
            gradient.addColorStop(0.5, '#00bfff');
            gradient.addColorStop(1, '#0066cc');
        } else {
            gradient.addColorStop(0, this.lightenColor(this.color, 40));
            gradient.addColorStop(0.7, this.color);
            gradient.addColorStop(1, this.darkenColor(this.color, 20));
        }

        ctx.beginPath();
        ctx.ellipse(this.x, this.y, this.radius, this.radius * 1.1, 0, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();

        if (this.type === 'golden') {
            this.drawStar(this.x, this.y, 5, this.radius * 0.5, this.radius * 0.25);
        } else if (this.type === 'bomb') {
            this.drawBombIcon();
        } else if (this.type === 'ice') {
            this.drawSnowflake();
        }

        ctx.beginPath();
        ctx.moveTo(this.x, this.y + this.radius);
        ctx.lineTo(this.x - 5, this.y + this.radius + 10);
        ctx.lineTo(this.x + 5, this.y + this.radius + 10);
        ctx.closePath();
        ctx.fillStyle = this.type === 'golden' ? '#b8860b' :
            this.type === 'bomb' ? '#111' :
                this.type === 'ice' ? '#0066cc' :
                    this.darkenColor(this.color, 30);
        ctx.fill();

        const stringLength = this.radius * 2;
        ctx.beginPath();
        ctx.moveTo(this.x, this.y + this.radius + 10);
        ctx.quadraticCurveTo(
            this.x + 10, this.y + this.radius + 10 + stringLength * 0.4,
            this.x, this.y + this.radius + 10 + stringLength * 0.6
        );
        ctx.quadraticCurveTo(
            this.x - 10, this.y + this.radius + 10 + stringLength * 0.8,
            this.x, this.y + this.radius + 10 + stringLength
        );
        ctx.strokeStyle = this.color;
        ctx.lineWidth = 2;
        ctx.stroke();

        ctx.restore();
    }

    drawStar(cx, cy, spikes, outerRadius, innerRadius) {
        let rot = Math.PI / 2 * 3;
        let x = cx;
        let y = cy;
        const step = Math.PI / spikes;

        ctx.beginPath();
        ctx.moveTo(cx, cy - outerRadius);

        for (let i = 0; i < spikes; i++) {
            x = cx + Math.cos(rot) * outerRadius;
            y = cy + Math.sin(rot) * outerRadius;
            ctx.lineTo(x, y);
            rot += step;

            x = cx + Math.cos(rot) * innerRadius;
            y = cy + Math.sin(rot) * innerRadius;
            ctx.lineTo(x, y);
            rot += step;
        }

        ctx.lineTo(cx, cy - outerRadius);
        ctx.closePath();
        ctx.fillStyle = '#fff';
        ctx.fill();
    }

    drawBombIcon() {
        ctx.font = `bold ${this.radius * 0.6}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('💣', this.x, this.y);
    }

    drawSnowflake() {
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 3;

        for (let i = 0; i < 6; i++) {
            const angle = (i * Math.PI * 2) / 6;
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(
                this.x + Math.cos(angle) * this.radius * 0.4,
                this.y + Math.sin(angle) * this.radius * 0.4
            );
            ctx.stroke();
        }
    }

    isOffScreen() {
        return this.y + this.radius + this.radius * 2 < 0;
    }

    isClicked(clickX, clickY) {
        const dx = clickX - this.x;
        const dy = clickY - this.y;
        return Math.sqrt(dx * dx + dy * dy) <= this.radius;
    }

    getScore() {
        if (this.type === 'golden') return this.size.score * 5;
        if (this.type === 'bomb') return 0;
        if (this.type === 'ice') return this.size.score;
        return this.size.score;
    }

    lightenColor(color, percent) {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.min(255, (num >> 16) + amt);
        const G = Math.min(255, (num >> 8 & 0x00FF) + amt);
        const B = Math.min(255, (num & 0x0000FF) + amt);
        return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
    }

    darkenColor(color, percent) {
        const num = parseInt(color.replace('#', ''), 16);
        const amt = Math.round(2.55 * percent);
        const R = Math.max(0, (num >> 16) - amt);
        const G = Math.max(0, (num >> 8 & 0x00FF) - amt);
        const B = Math.max(0, (num & 0x0000FF) - amt);
        return '#' + (0x1000000 + R * 0x10000 + G * 0x100 + B).toString(16).slice(1);
    }
}

class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.color = color;
        this.radius = Math.random() * 8 + 2;
        const angle = Math.random() * Math.PI * 2;
        const speed = Math.random() * 8 + 2;
        this.vx = Math.cos(angle) * speed;
        this.vy = Math.sin(angle) * speed;
        this.life = 1;
        this.decay = Math.random() * 0.03 + 0.02;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.2;
        this.life -= this.decay;
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.life;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        ctx.restore();
    }

    isDead() {
        return this.life <= 0;
    }
}

class FloatingText {
    constructor(x, y, text, color, size = 24) {
        this.x = x;
        this.y = y;
        this.text = text;
        this.color = color;
        this.size = size;
        this.life = 1;
        this.vy = -2;
    }

    update() {
        this.y += this.vy;
        this.life -= 0.02;
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.life;
        ctx.font = `bold ${this.size}px Microsoft YaHei`;
        ctx.textAlign = 'center';
        ctx.fillStyle = this.color;
        ctx.shadowColor = 'rgba(0,0,0,0.3)';
        ctx.shadowBlur = 5;
        ctx.shadowOffsetY = 2;
        ctx.fillText(this.text, this.x, this.y);
        ctx.restore();
    }

    isDead() {
        return this.life <= 0;
    }
}

function initGame() {
    score = 0;
    combo = 0;
    maxCombo = 0;
    lives = 3;
    gameRunning = true;
    gameTime = 0;
    level = 1;
    balloons = [];
    particles = [];
    floatingTexts = [];
    frozenUntil = 0;
    currentSpawnRate = config.baseSpawnRate;
    currentSpeed = config.baseSpeed;
    currentBalloonsPerSpawn = config.baseBalloonsPerSpawn;
    wobbleChance = 0.6;
    specialChanceMultiplier = 1;

    updateUI();
    updateHearts();
    gameOverEl.style.display = 'none';
}

function getComboMultiplier() {
    for (const tier of config.comboMultipliers) {
        if (combo >= tier.min && combo <= tier.max) {
            return tier;
        }
    }
    return config.comboMultipliers[config.comboMultipliers.length - 1];
}

function updateUI() {
    scoreEl.textContent = score;
    comboEl.textContent = combo;

    const multiplierTier = getComboMultiplier();
    multiplierEl.textContent = `x${multiplierTier.multiplier}`;

    multiplierEl.className = 'multiplier';
    if (multiplierTier.multiplier >= 2) {
        multiplierEl.classList.add(`x${multiplierTier.multiplier}`);
    }

    levelEl.textContent = level;
}

function updateHearts() {
    const hearts = heartsContainer.querySelectorAll('.heart');
    hearts.forEach((heart, index) => {
        if (index < lives) {
            heart.classList.remove('lost');
        } else {
            heart.classList.add('lost');
        }
    });
}

function showDamageFlash() {
    damageFlash.classList.remove('active');
    void damageFlash.offsetWidth;
    damageFlash.classList.add('active');

    const hearts = heartsContainer.querySelectorAll('.heart');
    hearts.forEach(heart => {
        heart.classList.remove('shake');
        void heart.offsetWidth;
        heart.classList.add('shake');
    });
}

function showComboPopup(x, y, comboCount, multiplier) {
    const popup = document.createElement('div');
    popup.className = 'combo-popup';
    popup.style.left = `${x}px`;
    popup.style.top = `${y}px`;

    const tier = getComboMultiplier();
    const size = Math.min(24 + comboCount * 0.5, 48);
    popup.style.fontSize = `${size}px`;
    popup.style.color = tier.color;

    if (comboCount >= 40) {
        popup.textContent = `🔥 传说连击 x${multiplier}! 🔥`;
    } else if (comboCount >= 20) {
        popup.textContent = `⭐ 超级连击 x${multiplier}! ⭐`;
    } else if (comboCount >= 10) {
        popup.textContent = `✨ 连击 x${multiplier}! ✨`;
    } else if (comboCount >= 5) {
        popup.textContent = `连击 x${multiplier}!`;
    } else {
        popup.textContent = `+${Math.floor(score * multiplier / comboCount)}`;
    }

    comboPopup.appendChild(popup);
    setTimeout(() => popup.remove(), 1000);
}

function showLevelUp(newLevel) {
    newLevelEl.textContent = newLevel;
    levelUpPopup.style.display = 'block';
    setTimeout(() => {
        levelUpPopup.style.display = 'none';
    }, 2000);
}

function showFloatingText(x, y, text, color) {
    floatingTexts.push(new FloatingText(x, y, text, color));
}

function pulseElement(element) {
    element.classList.remove('pulse');
    void element.offsetWidth;
    element.classList.add('pulse');
    setTimeout(() => element.classList.remove('pulse'), 100);
}

function spawnBalloons() {
    const balloonsToSpawn = currentBalloonsPerSpawn;
    const sections = [];

    for (let i = 0; i < balloonsToSpawn; i++) {
        const sectionWidth = canvas.width / balloonsToSpawn;
        const minX = sectionWidth * i + 60;
        const maxX = sectionWidth * (i + 1) - 60;
        sections.push({ minX, maxX });
    }

    sections.sort(() => Math.random() - 0.5);

    for (let i = 0; i < balloonsToSpawn; i++) {
        const section = sections[i];
        const x = section.minX + Math.random() * (section.maxX - section.minX);
        const balloon = new Balloon(x);

        let overlap = false;
        for (const existing of balloons) {
            const dx = balloon.x - existing.x;
            const dy = balloon.y - existing.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < balloon.radius + existing.radius + 30) {
                overlap = true;
                break;
            }
        }

        if (!overlap) {
            balloons.push(balloon);
        }
    }
}

function createExplosion(x, y, color, count = 20) {
    for (let i = 0; i < count; i++) {
        particles.push(new Particle(x, y, color));
    }
}

function handleClick(e) {
    if (!gameRunning) return;

    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    for (let i = balloons.length - 1; i >= 0; i--) {
        if (balloons[i].isClicked(clickX, clickY)) {
            const balloon = balloons[i];

            if (balloon.type === 'bomb') {
                lives--;
                combo = 0;
                createExplosion(balloon.x, balloon.y, '#ff0000', 40);
                balloons.splice(i, 1);
                updateUI();
                updateHearts();
                showDamageFlash();

                if (lives <= 0) {
                    endGame();
                }
                return;
            } else if (balloon.type === 'ice') {
                frozenUntil = Date.now() + 3000;
                createExplosion(balloon.x, balloon.y, '#00bfff', 30);
                showFloatingText(balloon.x, balloon.y, '❄️ 冰冻!', '#00bfff', 32);
            } else if (balloon.type === 'golden') {
                createExplosion(balloon.x, balloon.y, '#ffd700', 30);
            } else {
                createExplosion(balloon.x, balloon.y, balloon.color);
            }

            balloons.splice(i, 1);

            combo++;
            if (combo > maxCombo) maxCombo = combo;

            const multiplierTier = getComboMultiplier();
            const pointsEarned = balloon.getScore() * multiplierTier.multiplier;
            score += pointsEarned;

            showFloatingText(balloon.x, balloon.y - 30, `+${pointsEarned}`, multiplierTier.color);
            showComboPopup(balloon.x + 50, balloon.y, combo, multiplierTier.multiplier);

            pulseElement(scoreEl);
            pulseElement(comboEl);

            checkLevelUp();

            updateUI();
            return;
        }
    }

    combo = 0;
    updateUI();
}

function checkLevelUp() {
    const nextThreshold = config.levelThresholds[level];
    if (nextThreshold !== undefined && score >= nextThreshold) {
        level++;
        updateDifficultyForLevel();
        showLevelUp(level);
    }
}

function updateDifficultyForLevel() {
    currentSpawnRate = Math.max(600, config.baseSpawnRate - (level - 1) * 100);
    currentSpeed = config.baseSpeed + (level - 1) * 0.25;
    currentBalloonsPerSpawn = config.baseBalloonsPerSpawn + Math.floor((level - 1) / 2);
    wobbleChance = Math.min(0.9, 0.6 + (level - 1) * 0.05);
    specialChanceMultiplier = 1 + (level - 1) * 0.15;
}

function updateDifficulty() {
}

function endGame() {
    gameRunning = false;
    finalScoreEl.textContent = score;
    finalLevelEl.textContent = level;
    maxComboEl.textContent = maxCombo;
    gameOverEl.style.display = 'block';
}

let lastSpawnTime = 0;
let lastTime = 0;

function gameLoop(timestamp) {
    if (!lastTime) lastTime = timestamp;
    const deltaTime = timestamp - lastTime;
    lastTime = timestamp;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (frozenUntil > Date.now()) {
        ctx.save();
        ctx.fillStyle = 'rgba(0, 191, 255, 0.1)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.restore();
    }

    if (gameRunning) {
        gameTime += deltaTime;

        if (timestamp - lastSpawnTime > currentSpawnRate) {
            spawnBalloons();
            lastSpawnTime = timestamp;
        }

        for (let i = balloons.length - 1; i >= 0; i--) {
            balloons[i].update();
            balloons[i].draw();

            if (balloons[i].isOffScreen() && balloons[i].type !== 'bomb') {
                balloons.splice(i, 1);
                combo = 0;
                lives--;
                updateUI();
                updateHearts();
                showDamageFlash();

                if (lives <= 0) {
                    endGame();
                }
            } else if (balloons[i].isOffScreen() && balloons[i].type === 'bomb') {
                balloons.splice(i, 1);
            }
        }

        for (let i = floatingTexts.length - 1; i >= 0; i--) {
            floatingTexts[i].update();
            floatingTexts[i].draw();
            if (floatingTexts[i].isDead()) {
                floatingTexts.splice(i, 1);
            }
        }

        for (let i = particles.length - 1; i >= 0; i--) {
            particles[i].update();
            particles[i].draw();

            if (particles[i].isDead()) {
                particles.splice(i, 1);
            }
        }
    }

    requestAnimationFrame(gameLoop);
}

canvas.addEventListener('click', handleClick);

restartBtn.addEventListener('click', () => {
    initGame();
});

initGame();
requestAnimationFrame(gameLoop);
