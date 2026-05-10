const Game = (function() {
    const CANVAS_WIDTH = 800;
    const CANVAS_HEIGHT = 600;
    const CLOUD_WIDTH = 80;
    const CLOUD_HEIGHT = 40;
    const DROP_SIZE = 30;
    const INITIAL_LIVES = 3;
    const GRAVITY = 0.5;
    const BASE_SPEED = 2;

    let canvas, ctx;
    let cloud, drops, effects, floatingTexts;
    let score, lives, combo, comboTimer;
    let difficulty, gameRunning, hasShield;
    let cloudFlash, shakeOffset, shakeTimer;
    let keys = {};
    let mouseX = CANVAS_WIDTH / 2;
    let currentMilestone = 500;
    let milestones = [500, 1000, 2000, 3500, 5000, 7000, 10000];

    const initModule = {
        init: function() {
            canvas = document.getElementById('gameCanvas');
            ctx = canvas.getContext('2d');
            canvas.width = CANVAS_WIDTH;
            canvas.height = CANVAS_HEIGHT;
            this.resetGame();
            this.setupEventListeners();
            renderGame();
        },
        resetGame: function() {
            cloud = {
                x: CANVAS_WIDTH / 2 - CLOUD_WIDTH / 2,
                y: CANVAS_HEIGHT - 80,
                width: CLOUD_WIDTH,
                height: CLOUD_HEIGHT,
                speed: 8
            };
            drops = [];
            effects = [];
            floatingTexts = [];
            score = 0;
            lives = INITIAL_LIVES;
            combo = 0;
            comboTimer = null;
            difficulty = 1;
            gameRunning = false;
            hasShield = false;
            cloudFlash = 0;
            shakeOffset = { x: 0, y: 0 };
            shakeTimer = null;
            currentMilestone = 500;
            this.updateUI();
        },
        setupEventListeners: function() {
            document.getElementById('startButton').addEventListener('click', () => {
                initModule.startGame();
            });
            document.addEventListener('keydown', (e) => keys[e.key] = true);
            document.addEventListener('keyup', (e) => keys[e.key] = false);
            canvas.addEventListener('mousemove', (e) => {
                const rect = canvas.getBoundingClientRect();
                mouseX = e.clientX - rect.left;
            });
        },
        startGame: function() {
            document.getElementById('gameOverlay').style.display = 'none';
            this.resetGame();
            gameRunning = true;
            requestAnimationFrame(gameLoop);
        },
        gameOver: function() {
            gameRunning = false;
            const overlay = document.getElementById('gameOverlay');
            document.getElementById('overlayTitle').textContent = '游戏结束';
            document.getElementById('overlayMessage').textContent = `最终分数: ${score}`;
            document.getElementById('startButton').textContent = '重新开始';
            overlay.style.display = 'flex';
        },
        updateUI: function() {
            document.getElementById('score').textContent = score;
            document.getElementById('combo').textContent = combo;
            const livesDisplay = document.getElementById('livesDisplay');
            livesDisplay.innerHTML = '';
            for (let i = 0; i < lives; i++) {
                const heart = document.createElement('span');
                heart.className = 'heart';
                heart.textContent = '❤️';
                livesDisplay.appendChild(heart);
            }
            const shieldDisplay = document.getElementById('shieldDisplay');
            shieldDisplay.style.display = hasShield ? 'block' : 'none';
            const milestoneIndex = milestones.findIndex(m => m > score);
            if (milestoneIndex !== -1) {
                currentMilestone = milestones[milestoneIndex];
                document.getElementById('milestoneDisplay').textContent = `下一目标: ${currentMilestone}分`;
            } else {
                document.getElementById('milestoneDisplay').textContent = '恭喜！完成所有目标！';
            }
        },
        triggerShake: function() {
            let shakeCount = 0;
            shakeOffset = { x: 0, y: 0 };
            if (shakeTimer) clearInterval(shakeTimer);
            shakeTimer = setInterval(() => {
                shakeOffset.x = (Math.random() - 0.5) * 10;
                shakeOffset.y = (Math.random() - 0.5) * 10;
                shakeCount++;
                if (shakeCount >= 15) {
                    clearInterval(shakeTimer);
                    shakeOffset = { x: 0, y: 0 };
                }
            }, 30);
        }
    };

    const playerControlModule = {
        update: function() {
            if (keys['ArrowLeft'] || keys['a']) {
                cloud.x -= cloud.speed;
            }
            if (keys['ArrowRight'] || keys['d']) {
                cloud.x += cloud.speed;
            }
            if (mouseX !== null) {
                const targetX = mouseX - CLOUD_WIDTH / 2;
                cloud.x += (targetX - cloud.x) * 0.15;
            }
            cloud.x = Math.max(0, Math.min(CANVAS_WIDTH - CLOUD_WIDTH, cloud.x));
            if (cloudFlash > 0) cloudFlash--;
        }
    };

    const dropModule = {
        spawn: function() {
            if (Math.random() < 0.02 * difficulty) {
                const rand = Math.random();
                let type;
                if (rand < 0.4) type = 'rain';
                else if (rand < 0.92) type = 'sun';
                else type = 'shield';
                drops.push({
                    x: Math.random() * (CANVAS_WIDTH - DROP_SIZE),
                    y: -DROP_SIZE,
                    width: DROP_SIZE,
                    height: DROP_SIZE,
                    vy: BASE_SPEED + Math.random() * 2,
                    type: type
                });
            }
        },
        update: function() {
            this.spawn();
            drops = drops.filter(drop => {
                drop.vy += GRAVITY * 0.1;
                drop.y += drop.vy;
                return drop.y < CANVAS_HEIGHT;
            });
        }
    };

    const collisionModule = {
        check: function() {
            drops = drops.filter(drop => {
                if (this.isColliding(cloud, drop)) {
                    if (drop.type === 'sun') {
                        scoringModule.addScore(drop.x, drop.y);
                        effectModule.addFlash(drop.x + DROP_SIZE / 2, drop.y + DROP_SIZE / 2);
                    } else if (drop.type === 'rain') {
                        scoringModule.takeDamage();
                    } else if (drop.type === 'shield') {
                        scoringModule.gainShield(drop.x, drop.y);
                        effectModule.addFlash(drop.x + DROP_SIZE / 2, drop.y + DROP_SIZE / 2, '#00BFFF');
                    }
                    return false;
                }
                return true;
            });
        },
        isColliding: function(rect1, rect2) {
            return rect1.x < rect2.x + rect2.width &&
                   rect1.x + rect1.width > rect2.x &&
                   rect1.y < rect2.y + rect2.height &&
                   rect1.y + rect1.height > rect2.y;
        }
    };

    const scoringModule = {
        addScore: function(x, y) {
            combo++;
            let multiplier = 1;
            if (combo >= 5) multiplier = 2;
            else if (combo >= 3) multiplier = 1.5;
            const baseScore = 10;
            const earnedScore = Math.floor(baseScore * multiplier);
            score += earnedScore;
            effectModule.addFloatingText(x, y, `+${earnedScore}`, multiplier > 1 ? '#FFD700' : '#FFFFFF');
            if (comboTimer) clearTimeout(comboTimer);
            comboTimer = setTimeout(() => {
                combo = 0;
                initModule.updateUI();
            }, 1500);
            difficulty = 1 + score / 500;
            this.checkMilestone();
            initModule.updateUI();
        },
        checkMilestone: function() {
            if (score >= currentMilestone && milestones.includes(currentMilestone)) {
                effectModule.addFloatingText(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2, `🎉 达成 ${currentMilestone}分！`, '#FFD700');
                if (!hasShield) {
                    hasShield = true;
                    effectModule.addFloatingText(CANVAS_WIDTH / 2, CANVAS_HEIGHT / 2 + 40, '获得护盾！', '#00BFFF');
                }
            }
        },
        takeDamage: function() {
            if (hasShield) {
                hasShield = false;
                effectModule.addFloatingText(cloud.x, cloud.y - 20, '护盾破碎！', '#00BFFF');
                initModule.updateUI();
                return;
            }
            lives--;
            combo = 0;
            cloudFlash = 30;
            initModule.triggerShake();
            if (comboTimer) clearTimeout(comboTimer);
            initModule.updateUI();
            if (lives <= 0) {
                initModule.gameOver();
            }
        },
        gainShield: function(x, y) {
            hasShield = true;
            effectModule.addFloatingText(x, y, '获得护盾！', '#00BFFF');
            initModule.updateUI();
        }
    };

    const effectModule = {
        addFlash: function(x, y, color = '#FFD700') {
            effects.push({
                x, y,
                radius: 5,
                maxRadius: 30,
                color: color,
                alpha: 1
            });
        },
        addFloatingText: function(x, y, text, color) {
            const container = document.getElementById('floatingTextContainer');
            const textEl = document.createElement('div');
            textEl.className = 'floating-text';
            textEl.style.left = x + 'px';
            textEl.style.top = y + 'px';
            textEl.style.color = color;
            textEl.textContent = text;
            container.appendChild(textEl);
            setTimeout(() => {
                if (container.contains(textEl)) {
                    container.removeChild(textEl);
                }
            }, 1000);
        },
        update: function() {
            effects = effects.filter(effect => {
                effect.radius += 2;
                effect.alpha -= 0.05;
                return effect.alpha > 0;
            });
        }
    };

    function renderGame() {
        ctx.save();
        ctx.translate(shakeOffset.x, shakeOffset.y);
        ctx.fillStyle = '#87CEEB';
        ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
        drawEffects();
        drawDrops();
        drawCloud();
        ctx.restore();
    }

    function drawCloud() {
        if (cloudFlash > 0 && Math.floor(cloudFlash / 3) % 2 === 0) {
            ctx.globalAlpha = 0.5;
        }
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(cloud.x + 20, cloud.y + 25, 20, 0, Math.PI * 2);
        ctx.arc(cloud.x + 40, cloud.y + 20, 25, 0, Math.PI * 2);
        ctx.arc(cloud.x + 60, cloud.y + 25, 20, 0, Math.PI * 2);
        ctx.fill();
        if (hasShield) {
            ctx.strokeStyle = '#00BFFF';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(cloud.x + CLOUD_WIDTH / 2, cloud.y + CLOUD_HEIGHT / 2, 45, 0, Math.PI * 2);
            ctx.stroke();
        }
        ctx.globalAlpha = 1;
    }

    function drawDrops() {
        drops.forEach(drop => {
            if (drop.type === 'rain') {
                ctx.fillStyle = '#4169E1';
                ctx.beginPath();
                ctx.moveTo(drop.x + drop.width / 2, drop.y);
                ctx.lineTo(drop.x + drop.width, drop.y + drop.height);
                ctx.lineTo(drop.x, drop.y + drop.height);
                ctx.closePath();
                ctx.fill();
            } else if (drop.type === 'sun') {
                ctx.fillStyle = '#FFD700';
                ctx.beginPath();
                ctx.arc(drop.x + drop.width / 2, drop.y + drop.height / 2, drop.width / 2, 0, Math.PI * 2);
                ctx.fill();
            } else if (drop.type === 'shield') {
                ctx.fillStyle = '#00BFFF';
                ctx.beginPath();
                ctx.moveTo(drop.x + drop.width / 2, drop.y);
                ctx.lineTo(drop.x + drop.width, drop.y + drop.height * 0.3);
                ctx.lineTo(drop.x + drop.width, drop.y + drop.height * 0.7);
                ctx.lineTo(drop.x + drop.width / 2, drop.y + drop.height);
                ctx.lineTo(drop.x, drop.y + drop.height * 0.7);
                ctx.lineTo(drop.x, drop.y + drop.height * 0.3);
                ctx.closePath();
                ctx.fill();
            }
        });
    }

    function drawEffects() {
        effects.forEach(effect => {
            ctx.save();
            ctx.globalAlpha = effect.alpha;
            ctx.strokeStyle = effect.color;
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(effect.x, effect.y, effect.radius, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        });
    }

    function gameLoop() {
        if (!gameRunning) return;
        playerControlModule.update();
        dropModule.update();
        collisionModule.check();
        effectModule.update();
        renderGame();
        requestAnimationFrame(gameLoop);
    }

    return {
        init: initModule.init.bind(initModule)
    };
})();

window.addEventListener('DOMContentLoaded', () => {
    Game.init();
});
