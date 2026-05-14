class Game {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.width = 800;
        this.height = 600;
        
        this.player = null;
        this.reefs = [];
        this.shells = [];
        this.seaweeds = [];
        this.particles = [];
        this.floatingTexts = [];
        
        this.score = 0;
        this.shellCount = 0;
        this.time = 60;
        this.level = 1;
        this.maxUnlockedLevel = 1;
        this.targetShells = 10;
        
        this.gameState = 'idle';
        this.timer = null;
        this.animationId = null;
        
        this.keys = {};
        this.mousePos = null;
        this.isMouseDown = false;
        this.touchStart = null;
        
        this.shakeTimer = 0;
        this.winAnimationTimer = 0;
        
        this.init();
    }
    
    getLevelConfig(level) {
        const baseTime = 60;
        const baseTarget = 10;
        const baseSeaweeds = 3;
        
        return {
            targetShells: baseTarget + (level - 1) * 3,
            time: Math.max(30, baseTime - (level - 1) * 5),
            seaweedCount: baseSeaweeds + Math.floor((level - 1) * 1.5),
            seaweedSpeed: 0.02 + (level - 1) * 0.01,
            shellCount: 5 + level * 2
        };
    }
    
    init() {
        try {
            this.setupCanvas();
            this.setupEventListeners();
            this.setupStartScreen();
        } catch (error) {
            this.handleError('游戏初始化失败', error);
        }
    }
    
    setupCanvas() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        
        const maxWidth = Math.min(window.innerWidth - 40, 800);
        const maxHeight = Math.min(window.innerHeight - 200, 600);
        
        this.width = maxWidth;
        this.height = maxHeight;
        
        this.canvas.width = this.width;
        this.canvas.height = this.height;
    }
    
    setupEventListeners() {
        window.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
            if (e.key === 'Escape' && this.gameState === 'playing') {
                this.pauseGame();
            } else if (e.key === 'Escape' && this.gameState === 'paused') {
                this.resumeGame();
            }
        });
        
        window.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });
        
        this.canvas.addEventListener('mousedown', (e) => {
            this.isMouseDown = true;
            this.mousePos = this.getMousePos(e);
        });
        
        this.canvas.addEventListener('mousemove', (e) => {
            if (this.isMouseDown) {
                this.mousePos = this.getMousePos(e);
            }
        });
        
        this.canvas.addEventListener('mouseup', () => {
            this.isMouseDown = false;
            this.mousePos = null;
        });
        
        this.canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.touchStart = this.getTouchPos(e);
        }, { passive: false });
        
        this.canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            if (this.touchStart) {
                const currentPos = this.getTouchPos(e);
                const dx = currentPos.x - this.touchStart.x;
                const dy = currentPos.y - this.touchStart.y;
                
                if (this.player && this.gameState === 'playing') {
                    this.player.moveBy(dx * 0.5, dy * 0.5);
                }
                
                this.touchStart = currentPos;
            }
        }, { passive: false });
        
        this.canvas.addEventListener('touchend', () => {
            this.touchStart = null;
        });
        
        window.addEventListener('resize', () => {
            if (this.gameState === 'playing' || this.gameState === 'paused') {
                this.setupCanvas();
            }
        });
    }
    
    setupStartScreen() {
        const startBtn = document.getElementById('start-btn');
        startBtn.addEventListener('click', () => {
            this.loadProgress();
            this.showLevelSelect();
        });

        startBtn.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                this.loadProgress();
                this.showLevelSelect();
            }
        });
    }
    
    loadProgress() {
        const savedProgress = localStorage.getItem('shellGameProgress');
        if (savedProgress) {
            this.maxUnlockedLevel = parseInt(savedProgress, 10);
        } else {
            this.maxUnlockedLevel = 1;
        }
    }
    
    saveProgress(level) {
        if (level > this.maxUnlockedLevel) {
            this.maxUnlockedLevel = level;
            localStorage.setItem('shellGameProgress', level.toString());
        }
    }
    
    showLevelSelect() {
        document.getElementById('login-screen').classList.add('hidden');
        document.getElementById('game-screen').classList.add('hidden');
        document.getElementById('level-select-screen').classList.remove('hidden');
        this.renderLevelSelect();
    }
    
    renderLevelSelect() {
        const levelGrid = document.getElementById('level-grid');
        levelGrid.innerHTML = '';
        
        const totalLevels = 10;
        
        for (let i = 1; i <= totalLevels; i++) {
            const cell = document.createElement('div');
            cell.className = `level-cell ${i <= this.maxUnlockedLevel ? 'unlocked' : 'locked'} ${i === this.level ? 'current' : ''}`;
            
            if (i <= this.maxUnlockedLevel) {
                cell.textContent = i;
                cell.addEventListener('click', () => {
                    this.selectLevel(i);
                });
            } else {
                cell.textContent = '🔒';
            }
            
            levelGrid.appendChild(cell);
        }
    }
    
    selectLevel(level) {
        this.level = level;
        this.showLevelSelect();
        this.enterGame();
    }
    
    enterGame() {
        document.getElementById('level-select-screen').classList.add('hidden');
        document.getElementById('game-screen').classList.remove('hidden');
        this.startGame();
    }
    
    startGame() {
        try {
            this.gameState = 'playing';
            this.score = 0;
            this.shellCount = 0;
            
            const config = this.getLevelConfig(this.level);
            this.time = config.time;
            this.targetShells = config.targetShells;
            
            this.updateUI();
            this.generateLevel();
            this.startTimer();
            this.gameLoop();
        } catch (error) {
            this.handleError('游戏开始失败', error);
        }
    }
    
    generateLevel() {
        this.reefs = this.generateReefs();
        this.shells = this.generateShells();
        this.seaweeds = this.generateSeaweeds();
        
        const spawnPoint = this.getRandomReefPoint();
        this.player = new Player(spawnPoint.x, spawnPoint.y, this);
    }
    
    generateReefs() {
        const reefs = [];
        const rows = 5 + Math.floor(this.level * 0.5);
        const cols = 8 + Math.floor(this.level * 0.3);
        
        const reefWidth = this.width / cols;
        const reefHeight = this.height / (rows + 2);
        
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                if (Math.random() > 0.25) {
                    const x = j * reefWidth + Math.random() * reefWidth * 0.3;
                    const y = this.height * 0.3 + i * reefHeight + Math.random() * reefHeight * 0.3;
                    const w = reefWidth * (0.7 + Math.random() * 0.4);
                    const h = reefHeight * (0.6 + Math.random() * 0.5);
                    
                    reefs.push({
                        x, y, width: w, height: h,
                        color: `rgb(${80 + Math.random() * 40}, ${70 + Math.random() * 30}, ${60 + Math.random() * 20})`
                    });
                }
            }
        }
        
        return reefs;
    }
    
    generateShells() {
        const shells = [];
        const count = 5 + this.level * 2;
        
        for (let i = 0; i < count; i++) {
            const point = this.getRandomReefPoint();
            shells.push(new Shell(point.x, point.y, this));
        }
        
        return shells;
    }
    
    generateSeaweeds() {
        const seaweeds = [];
        const config = this.getLevelConfig(this.level);
        
        for (let i = 0; i < config.seaweedCount; i++) {
            const point = this.getRandomReefPoint();
            seaweeds.push(new Seaweed(point.x, point.y, this, config.seaweedSpeed));
        }
        
        return seaweeds;
    }
    
    getRandomReefPoint() {
        const reef = this.reefs[Math.floor(Math.random() * this.reefs.length)];
        return {
            x: reef.x + reef.width * (0.2 + Math.random() * 0.6),
            y: reef.y + reef.height * (0.2 + Math.random() * 0.6)
        };
    }
    
    startTimer() {
        this.timer = setInterval(() => {
            if (this.gameState === 'playing') {
                this.time--;
                this.updateUI();
                
                if (this.time <= 0) {
                    this.failGame();
                }
            }
        }, 1000);
    }
    
    stopTimer() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }
    
    gameLoop() {
        if (this.gameState !== 'playing') return;
        
        this.update();
        this.render();
        
        this.animationId = requestAnimationFrame(() => this.gameLoop());
    }
    
    update() {
        if (this.player) {
            this.player.update();
        }
        
        this.seaweeds.forEach(seaweed => seaweed.update());
        
        this.updateParticles();
        this.updateFloatingTexts();
        
        if (this.shakeTimer > 0) {
            this.shakeTimer--;
        }
        
        if (this.winAnimationTimer > 0) {
            this.winAnimationTimer--;
        }
        
        this.checkCollisions();
    }
    
    updateParticles() {
        this.particles = this.particles.filter(p => {
            p.x += p.vx;
            p.y += p.vy;
            p.vy += 0.15;
            p.life--;
            p.alpha = p.life / p.maxLife;
            return p.life > 0;
        });
    }
    
    updateFloatingTexts() {
        this.floatingTexts = this.floatingTexts.filter(t => {
            t.y -= 1.5;
            t.life--;
            t.alpha = t.life / t.maxLife;
            return t.life > 0;
        });
    }
    
    createCollectEffect(x, y) {
        for (let i = 0; i < 12; i++) {
            const angle = (i / 12) * Math.PI * 2;
            const speed = 3 + Math.random() * 3;
            this.particles.push({
                x,
                y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 2,
                color: '#FFD700',
                size: 4 + Math.random() * 4,
                life: 30,
                maxLife: 30,
                alpha: 1,
                type: 'sparkle'
            });
        }
        
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            const speed = 2 + Math.random() * 2;
            this.particles.push({
                x,
                y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                color: '#FFA500',
                size: 8 + Math.random() * 6,
                life: 40,
                maxLife: 40,
                alpha: 1,
                type: 'shell'
            });
        }
        
        this.floatingTexts.push({
            x,
            y: y - 20,
            text: '+10',
            color: '#FFD700',
            size: 24,
            life: 40,
            maxLife: 40,
            alpha: 1
        });
    }
    
    createHitEffect(x, y) {
        this.shakeTimer = 15;
        
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2;
            const speed = 2 + Math.random() * 2;
            this.particles.push({
                x,
                y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 1,
                color: '#8B4513',
                size: 3 + Math.random() * 3,
                life: 20,
                maxLife: 20,
                alpha: 1,
                type: 'hit'
            });
        }
        
        this.floatingTexts.push({
            x,
            y: y - 20,
            text: '-5',
            color: '#E53935',
            size: 24,
            life: 30,
            maxLife: 30,
            alpha: 1
        });
    }
    
    renderParticles(ctx) {
        this.particles.forEach(p => {
            ctx.save();
            ctx.globalAlpha = p.alpha;
            ctx.fillStyle = p.color;
            
            if (p.type === 'sparkle') {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
                
                ctx.fillStyle = 'rgba(255, 255, 255, 0.8)';
                ctx.beginPath();
                ctx.arc(p.x - p.size * 0.3, p.y - p.size * 0.3, p.size * 0.3, 0, Math.PI * 2);
                ctx.fill();
            } else if (p.type === 'shell') {
                ctx.beginPath();
                for (let i = 0; i < 6; i++) {
                    const angle = (i / 6) * Math.PI * 2;
                    const px = Math.cos(angle) * p.size / 2;
                    const py = Math.sin(angle) * p.size / 3;
                    if (i === 0) ctx.moveTo(px, py);
                    else ctx.lineTo(px, py);
                }
                ctx.closePath();
                ctx.fill();
            } else if (p.type === 'wave') {
                ctx.beginPath();
                ctx.ellipse(p.x, p.y, p.size, p.size * 0.4, 0, 0, Math.PI * 2);
                ctx.fill();
                
                ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
                ctx.beginPath();
                ctx.ellipse(p.x - p.size * 0.2, p.y - p.size * 0.15, p.size * 0.4, p.size * 0.15, 0, 0, Math.PI * 2);
                ctx.fill();
            } else {
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fill();
            }
            
            ctx.restore();
        });
    }
    
    renderFloatingTexts(ctx) {
        this.floatingTexts.forEach(t => {
            ctx.save();
            ctx.globalAlpha = t.alpha;
            ctx.fillStyle = t.color;
            ctx.font = `bold ${t.size}px Arial`;
            ctx.textAlign = 'center';
            ctx.shadowColor = t.color;
            ctx.shadowBlur = 10;
            ctx.fillText(t.text, t.x, t.y);
            ctx.restore();
        });
    }
    
    render() {
        this.ctx.save();
        
        if (this.shakeTimer > 0) {
            const offsetX = (Math.random() - 0.5) * 8;
            const offsetY = (Math.random() - 0.5) * 8;
            this.ctx.translate(offsetX, offsetY);
        }
        
        this.drawBackground();
        this.drawReefs();
        this.seaweeds.forEach(seaweed => seaweed.render(this.ctx));
        this.shells.forEach(shell => shell.render(this.ctx));
        if (this.player) {
            this.player.render(this.ctx);
        }
        
        this.renderParticles(this.ctx);
        this.renderFloatingTexts(this.ctx);
        
        this.drawTimeWarning();
        
        this.ctx.restore();
    }
    
    drawTimeWarning() {
        if (this.time <= 5 && this.gameState === 'playing') {
            const timeElement = document.getElementById('time');
            const opacity = 0.5 + Math.sin(Date.now() * 0.005) * 0.5;
            const scale = 1 + Math.sin(Date.now() * 0.005) * 0.1;
            
            timeElement.style.color = '#E53935';
            timeElement.style.fontWeight = 'bold';
            timeElement.style.fontSize = `${20 * scale}px`;
            timeElement.style.opacity = opacity;
            timeElement.style.textShadow = `0 0 10px rgba(229, 57, 53, ${opacity})`;
        } else {
            const timeElement = document.getElementById('time');
            timeElement.style.color = '';
            timeElement.style.fontWeight = '';
            timeElement.style.fontSize = '';
            timeElement.style.opacity = '';
            timeElement.style.textShadow = '';
        }
    }
    
    drawBackground() {
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
        gradient.addColorStop(0, '#87CEEB');
        gradient.addColorStop(0.4, '#B0E0E6');
        gradient.addColorStop(0.7, '#FFE4B5');
        gradient.addColorStop(1, '#DEB887');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        this.drawSun();
        this.drawWaves();
        this.drawClouds();
    }
    
    drawSun() {
        const sunX = this.width - 80;
        const sunY = 60;
        
        this.ctx.beginPath();
        this.ctx.arc(sunX, sunY, 40, 0, Math.PI * 2);
        this.ctx.fillStyle = '#FFD700';
        this.ctx.fill();
        
        this.ctx.beginPath();
        this.ctx.arc(sunX, sunY, 35, 0, Math.PI * 2);
        this.ctx.fillStyle = '#FFEC8B';
        this.ctx.fill();
    }
    
    drawWaves() {
        this.ctx.strokeStyle = '#1E90FF';
        this.ctx.lineWidth = 3;
        
        for (let i = 0; i < 3; i++) {
            const y = this.height * (0.55 + i * 0.05);
            this.ctx.beginPath();
            
            for (let x = 0; x <= this.width; x += 30) {
                const waveY = y + Math.sin((x + Date.now() * 0.001) * 0.05) * 8;
                if (x === 0) {
                    this.ctx.moveTo(x, waveY);
                } else {
                    this.ctx.lineTo(x, waveY);
                }
            }
            
            this.ctx.stroke();
        }
    }
    
    drawClouds() {
        const clouds = [
            { x: 100, y: 50, scale: 1 },
            { x: 350, y: 80, scale: 0.8 },
            { x: 600, y: 40, scale: 1.2 }
        ];
        
        clouds.forEach(cloud => {
            this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            
            this.ctx.beginPath();
            this.ctx.arc(cloud.x, cloud.y, 25 * cloud.scale, 0, Math.PI * 2);
            this.ctx.arc(cloud.x + 20 * cloud.scale, cloud.y - 10 * cloud.scale, 20 * cloud.scale, 0, Math.PI * 2);
            this.ctx.arc(cloud.x + 40 * cloud.scale, cloud.y, 25 * cloud.scale, 0, Math.PI * 2);
            this.ctx.arc(cloud.x + 20 * cloud.scale, cloud.y + 10 * cloud.scale, 18 * cloud.scale, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }
    
    drawReefs() {
        this.reefs.forEach(reef => {
            this.ctx.fillStyle = reef.color;
            this.ctx.beginPath();
            
            const points = [
                { x: reef.x, y: reef.y + reef.height },
                { x: reef.x + reef.width * 0.1, y: reef.y + reef.height * 0.7 },
                { x: reef.x + reef.width * 0.3, y: reef.y },
                { x: reef.x + reef.width * 0.6, y: reef.y + reef.height * 0.2 },
                { x: reef.x + reef.width * 0.85, y: reef.y },
                { x: reef.x + reef.width, y: reef.y + reef.height * 0.6 },
                { x: reef.x + reef.width * 0.9, y: reef.y + reef.height }
            ];
            
            this.ctx.moveTo(points[0].x, points[0].y);
            for (let i = 1; i < points.length; i++) {
                this.ctx.lineTo(points[i].x, points[i].y);
            }
            this.ctx.closePath();
            this.ctx.fill();
            
            this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
        });
    }
    
    checkCollisions() {
        if (!this.player) return;
        
        this.shells = this.shells.filter(shell => {
            if (this.isColliding(this.player, shell)) {
                this.collectShell(shell.x, shell.y);
                return false;
            }
            return true;
        });
        
        this.seaweeds.forEach(seaweed => {
            if (this.isColliding(this.player, seaweed)) {
                this.hitSeaweed(this.player.x, this.player.y);
            }
        });
    }
    
    isColliding(obj1, obj2) {
        const padding = 5;
        return obj1.x - obj1.size / 2 < obj2.x + obj2.size / 2 + padding &&
               obj1.x + obj1.size / 2 + padding > obj2.x - obj2.size / 2 &&
               obj1.y - obj1.size / 2 < obj2.y + obj2.size / 2 + padding &&
               obj1.y + obj1.size / 2 + padding > obj2.y - obj2.size / 2;
    }
    
    collectShell(x, y) {
        this.score += 10;
        this.shellCount++;
        this.updateUI();
        
        this.createCollectEffect(x, y);
        
        if (this.shellCount >= this.targetShells) {
            this.winGame();
            return;
        }
        
        const newShell = new Shell(this.getRandomReefPoint().x, this.getRandomReefPoint().y, this);
        this.shells.push(newShell);
    }
    
    hitSeaweed(x, y) {
        if (this.player.seaweedHitCooldown > 0) return;
        
        this.score = Math.max(0, this.score - 5);
        this.player.slowDown();
        this.player.seaweedHitCooldown = 30;
        this.updateUI();
        
        this.createHitEffect(x, y);
    }
    
    updateUI() {
        document.getElementById('level').textContent = this.level;
        document.getElementById('score').textContent = this.score;
        document.getElementById('shells').textContent = this.shellCount;
        document.getElementById('target-shells').textContent = this.targetShells;
        document.getElementById('time').textContent = this.time;
    }
    
    pauseGame() {
        this.gameState = 'paused';
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        document.getElementById('pause-screen').classList.remove('hidden');
    }
    
    resumeGame() {
        this.gameState = 'playing';
        document.getElementById('pause-screen').classList.add('hidden');
        this.gameLoop();
    }
    
    winGame() {
        this.gameState = 'won';
        this.stopTimer();
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        this.saveProgress(this.level);
        
        this.createWinEffect();
        
        setTimeout(() => {
            document.getElementById('final-score').textContent = this.score;
            document.getElementById('final-shells').textContent = this.shellCount;
            document.getElementById('final-level').textContent = this.level;
            document.getElementById('win-screen').classList.remove('hidden');
        }, 1500);
    }
    
    createWinEffect() {
        for (let i = 0; i < 30; i++) {
            setTimeout(() => {
                const x = Math.random() * this.width;
                const y = Math.random() * this.height;
                
                for (let j = 0; j < 8; j++) {
                    const angle = (j / 8) * Math.PI * 2;
                    const speed = 4 + Math.random() * 4;
                    this.particles.push({
                        x,
                        y,
                        vx: Math.cos(angle) * speed,
                        vy: Math.sin(angle) * speed - 2,
                        color: ['#FFD700', '#FFA500', '#FF69B4', '#00CED1', '#9370DB'][Math.floor(Math.random() * 5)],
                        size: 6 + Math.random() * 6,
                        life: 60,
                        maxLife: 60,
                        alpha: 1,
                        type: 'sparkle'
                    });
                }
            }, i * 100);
        }
        
        for (let i = 0; i < 20; i++) {
            setTimeout(() => {
                const x = this.width / 2 + (Math.random() - 0.5) * 400;
                const y = this.height + 20;
                this.particles.push({
                    x,
                    y,
                    vx: (Math.random() - 0.5) * 2,
                    vy: -3 - Math.random() * 4,
                    color: '#1E90FF',
                    size: 10 + Math.random() * 10,
                    life: 80,
                    maxLife: 80,
                    alpha: 0.8,
                    type: 'wave'
                });
            }, i * 150);
        }
    }
    
    failGame() {
        this.gameState = 'failed';
        this.stopTimer();
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        document.getElementById('fail-shells').textContent = this.shellCount;
        document.getElementById('fail-target').textContent = this.targetShells;
        document.getElementById('fail-screen').classList.remove('hidden');
    }
    
    resetGame() {
        this.stopTimer();
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        document.getElementById('pause-screen').classList.add('hidden');
        document.getElementById('win-screen').classList.add('hidden');
        document.getElementById('fail-screen').classList.add('hidden');
        
        this.startGame();
    }
    
    quitGame() {
        this.stopTimer();
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
        
        document.getElementById('pause-screen').classList.add('hidden');
        document.getElementById('game-screen').classList.add('hidden');
        document.getElementById('start-screen').classList.remove('hidden');
        
        this.gameState = 'idle';
    }
    
    getMousePos(e) {
        const rect = this.canvas.getBoundingClientRect();
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    }
    
    getTouchPos(e) {
        const rect = this.canvas.getBoundingClientRect();
        const touch = e.touches[0];
        return {
            x: touch.clientX - rect.left,
            y: touch.clientY - rect.top
        };
    }
    
    handleError(message, error) {
        console.error(message, error);
        alert(`${message}: ${error.message}`);
    }
}

class Player {
    constructor(x, y, game) {
        this.x = x;
        this.y = y;
        this.size = 35;
        this.speed = 5;
        this.normalSpeed = 5;
        this.slowSpeed = 2;
        this.slowTimer = 0;
        this.seaweedHitCooldown = 0;
        this.game = game;
        this.direction = 1;
        this.animationFrame = 0;
    }
    
    update() {
        let dx = 0;
        let dy = 0;
        
        if (this.game.keys['arrowup'] || this.game.keys['w']) dy -= 1;
        if (this.game.keys['arrowdown'] || this.game.keys['s']) dy += 1;
        if (this.game.keys['arrowleft'] || this.game.keys['a']) {
            dx -= 1;
            this.direction = -1;
        }
        if (this.game.keys['arrowright'] || this.game.keys['d']) {
            dx += 1;
            this.direction = 1;
        }
        
        if (this.game.mousePos && this.game.isMouseDown) {
            dx = (this.game.mousePos.x - this.x) * 0.1;
            dy = (this.game.mousePos.y - this.y) * 0.1;
            this.direction = dx >= 0 ? 1 : -1;
        }
        
        if (dx !== 0 || dy !== 0) {
            const length = Math.sqrt(dx * dx + dy * dy);
            dx /= length;
            dy /= length;
            
            const currentSpeed = this.slowTimer > 0 ? this.slowSpeed : this.normalSpeed;
            this.x += dx * currentSpeed;
            this.y += dy * currentSpeed;
        }
        
        this.clampToReefs();
        
        if (this.slowTimer > 0) {
            this.slowTimer -= 1;
            if (this.slowTimer <= 0) {
                this.speed = this.normalSpeed;
            }
        }
        
        if (this.seaweedHitCooldown > 0) {
            this.seaweedHitCooldown -= 1;
        }
        
        this.animationFrame = (this.animationFrame + 0.15) % 4;
    }
    
    moveBy(dx, dy) {
        this.x += dx;
        this.y += dy;
        this.clampToReefs();
        
        if (dx > 0) this.direction = 1;
        if (dx < 0) this.direction = -1;
    }
    
    clampToReefs() {
        const padding = this.size / 2;
        
        this.x = Math.max(padding, Math.min(this.game.width - padding, this.x));
        this.y = Math.max(padding, Math.min(this.game.height - padding, this.y));
        
        let onReef = false;
        for (const reef of this.game.reefs) {
            if (this.x >= reef.x - padding &&
                this.x <= reef.x + reef.width + padding &&
                this.y >= reef.y - padding &&
                this.y <= reef.y + reef.height + padding) {
                onReef = true;
                break;
            }
        }
        
        if (!onReef) {
            const closestReef = this.findClosestReef();
            if (closestReef) {
                this.x = Math.max(closestReef.x, Math.min(closestReef.x + closestReef.width, this.x));
                this.y = Math.max(closestReef.y, Math.min(closestReef.y + closestReef.height, this.y));
            }
        }
    }
    
    findClosestReef() {
        let closest = null;
        let minDist = Infinity;
        
        for (const reef of this.game.reefs) {
            const reefCenterX = reef.x + reef.width / 2;
            const reefCenterY = reef.y + reef.height / 2;
            const dist = Math.sqrt(Math.pow(this.x - reefCenterX, 2) + Math.pow(this.y - reefCenterY, 2));
            
            if (dist < minDist) {
                minDist = dist;
                closest = reef;
            }
        }
        
        return closest;
    }
    
    slowDown() {
        this.slowTimer = 30;
        this.speed = this.slowSpeed;
    }
    
    render(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.scale(this.direction, 1);
        
        ctx.fillStyle = '#FF6B6B';
        ctx.beginPath();
        ctx.arc(0, 0, this.size / 2, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(-6, -4, 6, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#333333';
        ctx.beginPath();
        ctx.arc(-6, -4, 3, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#FFB6C1';
        ctx.beginPath();
        ctx.ellipse(0, 5, 8, 5, 0, 0, Math.PI * 2);
        ctx.fill();
        
        const armOffset = Math.sin(this.animationFrame) * 3;
        ctx.fillStyle = '#FF6B6B';
        ctx.beginPath();
        ctx.ellipse(-12, armOffset, 5, 8, -0.3, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(12, -armOffset, 5, 8, 0.3, 0, Math.PI * 2);
        ctx.fill();
        
        if (this.slowTimer > 0) {
            ctx.strokeStyle = '#FFD700';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.arc(0, 0, this.size / 2 + 5, 0, Math.PI * 2);
            ctx.stroke();
        }
        
        ctx.restore();
    }
}

class Shell {
    constructor(x, y, game) {
        this.x = x;
        this.y = y;
        this.size = 25;
        this.game = game;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.02;
        this.colors = ['#FFD700', '#FFA500', '#FF69B4', '#00CED1', '#9370DB'];
        this.color = this.colors[Math.floor(Math.random() * this.colors.length)];
        this.bobOffset = Math.random() * Math.PI * 2;
    }
    
    update() {
        this.rotation += this.rotationSpeed;
        this.bobOffset += 0.05;
    }
    
    render(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y + Math.sin(this.bobOffset) * 2);
        ctx.rotate(this.rotation);
        
        ctx.fillStyle = this.color;
        ctx.beginPath();
        
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            const x = Math.cos(angle) * this.size / 2;
            const y = Math.sin(angle) * this.size / 3;
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        
        ctx.closePath();
        ctx.fill();
        
        ctx.fillStyle = '#FFF5EE';
        ctx.beginPath();
        ctx.arc(0, 0, this.size / 4, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
        ctx.lineWidth = 2;
        ctx.stroke();
        
        ctx.restore();
    }
}

class Seaweed {
    constructor(x, y, game, speed = 0.02) {
        this.x = x;
        this.y = y;
        this.size = 30;
        this.game = game;
        this.moveType = Math.random() > 0.5 ? 'horizontal' : 'vertical';
        this.moveOffset = Math.random() * Math.PI * 2;
        this.moveSpeed = speed + Math.random() * 0.01;
        this.moveRange = 10 + Math.random() * 10;
        this.segments = 3;
    }
    
    update() {
        this.moveOffset += this.moveSpeed;
    }
    
    render(ctx) {
        const offset = Math.sin(this.moveOffset) * this.moveRange;
        const renderX = this.moveType === 'horizontal' ? this.x + offset : this.x;
        const renderY = this.moveType === 'vertical' ? this.y + offset : this.y;
        
        ctx.strokeStyle = '#228B22';
        ctx.lineWidth = 4;
        ctx.lineCap = 'round';
        
        ctx.beginPath();
        ctx.moveTo(renderX, renderY + this.size / 2);
        
        for (let i = 1; i <= this.segments; i++) {
            const t = i / this.segments;
            const waveOffset = Math.sin(this.moveOffset + t * Math.PI) * 8;
            const segY = renderY - (this.size / this.segments) * i;
            const segX = renderX + waveOffset * t;
            
            ctx.lineTo(segX, segY);
        }
        
        ctx.stroke();
        
        ctx.fillStyle = '#32CD32';
        for (let i = 1; i <= this.segments; i++) {
            const t = i / this.segments;
            const waveOffset = Math.sin(this.moveOffset + t * Math.PI) * 8;
            const segY = renderY - (this.size / this.segments) * i + (this.size / this.segments) * 0.5;
            const segX = renderX + waveOffset * t;
            
            ctx.beginPath();
            ctx.arc(segX, segY, 6, 0, Math.PI * 2);
            ctx.fill();
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    try {
        const game = new Game();
        
        document.getElementById('pause-btn').addEventListener('click', () => {
            game.pauseGame();
        });
        
        document.getElementById('resume-btn').addEventListener('click', () => {
            game.resumeGame();
        });
        
        document.getElementById('restart-btn').addEventListener('click', () => {
            game.resetGame();
        });
        
        document.getElementById('quit-btn').addEventListener('click', () => {
            game.quitGame();
        });
        
        document.getElementById('reset-btn').addEventListener('click', () => {
            game.resetGame();
        });
        
        document.getElementById('level-select-btn').addEventListener('click', () => {
            game.showLevelSelect();
        });
        
        document.getElementById('back-to-login-btn').addEventListener('click', () => {
            document.getElementById('level-select-screen').classList.add('hidden');
            document.getElementById('start-screen').classList.remove('hidden');
        });
        
        document.getElementById('play-again-btn').addEventListener('click', () => {
            game.resetGame();
        });
        
        document.getElementById('next-level-btn').addEventListener('click', () => {
            document.getElementById('win-screen').classList.add('hidden');
            game.level++;
            game.startGame();
        });
        
        document.getElementById('back-to-level-btn').addEventListener('click', () => {
            document.getElementById('win-screen').classList.add('hidden');
            game.showLevelSelect();
        });
        
        document.getElementById('back-to-level-btn2').addEventListener('click', () => {
            document.getElementById('fail-screen').classList.add('hidden');
            game.showLevelSelect();
        });
        
        document.getElementById('retry-btn').addEventListener('click', () => {
            document.getElementById('fail-screen').classList.add('hidden');
            game.startGame();
        });
        
        window.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (game.gameState === 'playing') {
                    game.pauseGame();
                } else if (game.gameState === 'paused') {
                    game.resumeGame();
                }
            }
            
            if (e.key.toLowerCase() === 'r') {
                if (game.gameState === 'paused' || game.gameState === 'playing') {
                    game.resetGame();
                }
            }
        });
        
        window.addEventListener('error', (e) => {
            console.error('全局异常:', e.error);
            alert('游戏出现异常，请刷新页面重试');
        });
        
        window.addEventListener('unhandledrejection', (e) => {
            console.error('未处理的Promise异常:', e.reason);
            alert('游戏出现异常，请刷新页面重试');
        });
    } catch (error) {
        console.error('游戏启动失败:', error);
        alert('游戏启动失败，请刷新页面重试');
    }
});