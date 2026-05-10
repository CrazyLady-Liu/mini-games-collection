class TypingGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        
        this.gameRunning = false;
        this.score = 0;
        this.combo = 0;
        this.level = 1;
        this.playerInput = '';
        this.fallingTexts = [];
        this.lastSpawnTime = 0;
        this.gameStartTime = 0;
        this.eliminatedCount = 0;
        
        this.baseSpeed = 1;
        this.currentSpeed = this.baseSpeed;
        this.spawnInterval = 2500;
        this.lastTime = 0;
        
        this.wordPool = this.generateWordPool();
        this.colors = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe', '#00f2fe', '#43e97b', '#38f9d7'];
        
        this.initUI();
        this.bindEvents();
    }
    
    generateWordPool() {
        const chars = '的一是了我不人在他有这个上们来到时大地为子中你说生国年着就那和要她出也得里后自以会家可下而过天去能对小多然于心学么之都好看起发当没成只如事把还用第样道想作种开美总从无情己面最女但现前些所同日手又行意动方期它头经长儿回位分爱老因很给名法间斯知世什两次使身者被高已亲其进此话常与活正感见明问力理尔点文几定本公特做外孩相西果走将月十实向声车全信重机工物气每并别真打太新比才便夫再书部水像眼少家经';
        const twoWords = ['喜欢', '学习', '快乐', '梦想', '奋斗', '青春', '未来', '希望', '成功', '坚持', '努力', '勇敢', '智慧', '创新', '科技', '文化', '历史', '自然', '和平', '友谊', '家庭', '幸福', '健康', '美丽', '音乐', '艺术', '文学', '数学', '科学', '宇宙', '生活', '工作', '朋友', '爱情', '理想', '信念', '勇气', '力量', '知识', '时间'];
        const fourWords = ['天天向上', '好好学习', '心想事成', '万事如意', '一帆风顺', '马到成功', '前程似锦', '锦上添花', '吉祥如意', '年年有余', '恭喜发财', '幸福美满', '团团圆圆', '和和美美', '平平安安', '快快乐乐', '健健康康', '开开心心', '顺顺利利', '圆圆满满', '学业有成', '事业有成', '金榜题名', '步步高升'];
        return { chars: chars.split(''), twoWords, fourWords };
    }
    
    initUI() {
        this.scoreDisplay = document.getElementById('score');
        this.comboDisplay = document.getElementById('combo');
        this.levelDisplay = document.getElementById('level');
        this.inputTextDisplay = document.getElementById('input-text');
        this.inputDisplay = document.getElementById('input-display');
        this.cursorDisplay = document.getElementById('cursor');
        this.startScreen = document.getElementById('start-screen');
        this.gameOverScreen = document.getElementById('game-over-screen');
        this.finalScoreDisplay = document.getElementById('final-score');
        this.clearBtn = document.getElementById('clearBtn');
        
        this.updateFocusState();
    }
    
    bindEvents() {
        document.getElementById('startBtn').addEventListener('click', () => this.startGame());
        document.getElementById('restartBtn').addEventListener('click', () => this.startGame());
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        this.clearBtn.addEventListener('click', () => this.clearInput());
    }
    
    startGame() {
        this.score = 0;
        this.combo = 0;
        this.level = 1;
        this.playerInput = '';
        this.fallingTexts = [];
        this.lastSpawnTime = 0;
        this.gameStartTime = Date.now();
        this.eliminatedCount = 0;
        this.currentSpeed = this.baseSpeed;
        this.spawnInterval = 2500;
        this.gameRunning = true;
        
        this.startScreen.classList.add('hidden');
        this.gameOverScreen.classList.add('hidden');
        
        this.updateUI();
        this.updateInputDisplay();
        this.updateFocusState();
        this.lastTime = performance.now();
        requestAnimationFrame((time) => this.gameLoop(time));
    }
    
    normalizeText(text) {
        if (!text) return '';
        return text.toLowerCase();
    }
    
    handleKeyDown(e) {
        if (!this.gameRunning) return;
        
        if (e.key === 'Backspace') {
            this.playerInput = this.playerInput.slice(0, -1);
        } else if (e.key === 'Escape') {
            this.clearInput();
        } else if (e.key.length === 1 && e.key.match(/[\u4e00-\u9fa5a-zA-Z]/)) {
            this.playerInput += e.key;
        }
        
        this.updateInputDisplay();
        this.updateFocusState();
        this.checkMatch();
    }
    
    clearInput() {
        this.playerInput = '';
        this.updateInputDisplay();
        this.updateFocusState();
    }
    
    updateInputDisplay() {
        this.inputTextDisplay.textContent = this.playerInput;
    }
    
    updateFocusState() {
        if (this.playerInput === '') {
            this.inputDisplay.classList.add('focused');
        } else {
            this.inputDisplay.classList.remove('focused');
        }
    }
    
    getTextTypeByScore() {
        if (this.score < 200) {
            return 'char';
        } else if (this.score < 800) {
            return Math.random() > 0.4 ? 'char' : 'two';
        } else if (this.score < 2000) {
            const rand = Math.random();
            if (rand < 0.3) return 'char';
            if (rand < 0.8) return 'two';
            return 'four';
        } else {
            const rand = Math.random();
            if (rand < 0.2) return 'char';
            if (rand < 0.6) return 'two';
            return 'four';
        }
    }
    
    getRandomPosition(textWidth) {
        const margin = 20;
        const availableWidth = this.width - 2 * margin - textWidth;
        const sections = 5;
        const sectionWidth = availableWidth / sections;
        
        let bestX = null;
        let maxMinDistance = 0;
        
        for (let i = 0; i < 20; i++) {
            const candidateX = margin + Math.random() * availableWidth;
            
            let minDistance = Infinity;
            for (const ft of this.fallingTexts) {
                const ftWidth = this.ctx.measureText(ft.text).width;
                const distance = Math.abs(candidateX - ft.x);
                const requiredDistance = (textWidth + ftWidth) / 2 + 30;
                
                if (distance < minDistance) {
                    minDistance = distance;
                }
                
                if (distance < requiredDistance) {
                    minDistance = 0;
                    break;
                }
            }
            
            if (minDistance > maxMinDistance) {
                maxMinDistance = minDistance;
                bestX = candidateX;
            }
        }
        
        return bestX !== null ? bestX : margin + Math.random() * availableWidth;
    }
    
    spawnText() {
        const textType = this.getTextTypeByScore();
        let text;
        let fontSize;
        
        switch (textType) {
            case 'char':
                text = this.wordPool.chars[Math.floor(Math.random() * this.wordPool.chars.length)];
                fontSize = 36;
                break;
            case 'two':
                text = this.wordPool.twoWords[Math.floor(Math.random() * this.wordPool.twoWords.length)];
                fontSize = 32;
                break;
            case 'four':
                text = this.wordPool.fourWords[Math.floor(Math.random() * this.wordPool.fourWords.length)];
                fontSize = 28;
                break;
        }
        
        this.ctx.font = `bold ${fontSize}px Microsoft YaHei`;
        const textWidth = this.ctx.measureText(text).width;
        const x = this.getRandomPosition(textWidth);
        
        this.fallingTexts.push({
            text,
            originalText: text,
            x,
            y: -50,
            speed: this.currentSpeed + Math.random() * 0.4,
            color: this.colors[Math.floor(Math.random() * this.colors.length)],
            fontSize
        });
    }
    
    checkMatch() {
        if (!this.playerInput) return;
        
        const normalizedInput = this.normalizeText(this.playerInput);
        let matched = false;
        
        for (let i = this.fallingTexts.length - 1; i >= 0; i--) {
            const ft = this.fallingTexts[i];
            const normalizedText = this.normalizeText(ft.text);
            
            if (normalizedInput === normalizedText) {
                this.fallingTexts.splice(i, 1);
                matched = true;
                this.eliminatedCount++;
                this.combo++;
                this.addScore(ft.text.length);
                this.playerInput = '';
                this.updateInputDisplay();
                this.updateFocusState();
                break;
            }
        }
        
        if (!matched) {
            for (const ft of this.fallingTexts) {
                const normalizedText = this.normalizeText(ft.text);
                const normalizedInput = this.normalizeText(this.playerInput);
                if (normalizedText.startsWith(normalizedInput)) {
                    return;
                }
            }
        }
    }
    
    addScore(textLength) {
        const baseScore = 10 * textLength;
        const comboBonus = this.combo * 5;
        const levelBonus = this.level * 3;
        this.score += baseScore + comboBonus + levelBonus;
        this.updateUI();
    }
    
    increaseDifficulty() {
        const newLevelByScore = Math.floor(this.score / 300) + 1;
        const timeElapsed = (Date.now() - this.gameStartTime) / 1000;
        const newLevelByTime = Math.floor(timeElapsed / 25) + 1;
        const newLevel = Math.max(newLevelByScore, newLevelByTime, 1);
        
        if (newLevel > this.level) {
            this.level = newLevel;
            this.currentSpeed = this.baseSpeed + (this.level - 1) * 0.25;
            this.spawnInterval = Math.max(700, 2500 - (this.level - 1) * 200);
        }
        
        if (this.eliminatedCount > 0 && this.eliminatedCount % 20 === 0) {
            this.currentSpeed += 0.08;
        }
    }
    
    updateUI() {
        this.scoreDisplay.textContent = this.score;
        this.comboDisplay.textContent = this.combo;
        this.levelDisplay.textContent = this.level;
    }
    
    checkGameOver() {
        for (const ft of this.fallingTexts) {
            if (ft.y > this.height - 30) {
                return true;
            }
        }
        return false;
    }
    
    gameOver() {
        this.gameRunning = false;
        this.finalScoreDisplay.textContent = `最终得分: ${this.score}`;
        this.gameOverScreen.classList.remove('hidden');
    }
    
    update(deltaTime) {
        const currentTime = Date.now();
        
        if (currentTime - this.lastSpawnTime > this.spawnInterval) {
            this.spawnText();
            this.lastSpawnTime = currentTime;
        }
        
        for (const ft of this.fallingTexts) {
            ft.y += ft.speed * deltaTime * 0.06;
        }
        
        this.increaseDifficulty();
        
        if (this.checkGameOver()) {
            this.gameOver();
        }
    }
    
    draw() {
        this.ctx.fillStyle = '#0f0f23';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        for (const ft of this.fallingTexts) {
            this.ctx.font = `bold ${ft.fontSize}px Microsoft YaHei`;
            this.ctx.textAlign = 'left';
            this.ctx.textBaseline = 'top';
            
            this.ctx.shadowColor = ft.color;
            this.ctx.shadowBlur = 15;
            this.ctx.fillStyle = ft.color;
            this.ctx.fillText(ft.text, ft.x, ft.y);
            this.ctx.shadowBlur = 0;
            
            if (this.playerInput) {
                const normalizedText = this.normalizeText(ft.text);
                const normalizedInput = this.normalizeText(this.playerInput);
                if (normalizedText.startsWith(normalizedInput)) {
                    this.ctx.fillStyle = '#43e97b';
                    this.ctx.fillText(ft.text.substring(0, this.playerInput.length), ft.x, ft.y);
                }
            }
        }
    }
    
    gameLoop(time) {
        if (!this.gameRunning) return;
        
        const deltaTime = time - this.lastTime;
        this.lastTime = time;
        
        this.update(deltaTime);
        this.draw();
        
        requestAnimationFrame((t) => this.gameLoop(t));
    }
}

const game = new TypingGame();
