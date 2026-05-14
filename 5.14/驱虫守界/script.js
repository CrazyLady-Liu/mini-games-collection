class BugGame {
    constructor() {
        this.gameArea = document.getElementById('gameArea');
        this.levelElement = document.getElementById('level');
        this.remainingTimeElement = document.getElementById('remainingTime');
        this.survivalTimeElement = document.getElementById('survivalTime');
        this.bugCountElement = document.getElementById('bugCount');
        this.comboCountElement = document.getElementById('comboCount');
        this.comboStatElement = document.getElementById('comboStat');
        this.comboDisplayElement = document.getElementById('comboDisplay');
        
        this.level = 1;
        this.remainingTime = 30;
        this.survivalTime = 0;
        this.score = 0;
        this.combo = 0;
        this.comboTimer = null;
        this.comboTimeout = 1500;
        this.bugs = [];
        this.isPaused = false;
        this.isGameOver = false;
        this.hasShownTutorial = false;
        
        this.gameLoop = null;
        this.timerInterval = null;
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.showTutorialModal();
    }
    
    setupEventListeners() {
        document.getElementById('howToPlayBtn').addEventListener('click', () => {
            this.showModal('howToPlayModal');
            this.pause();
        });
        
        document.getElementById('closeModalBtn').addEventListener('click', () => {
            this.hideModal('howToPlayModal');
            if (!this.hasShownTutorial) {
                this.hasShownTutorial = true;
                this.startGame();
            } else {
                this.resume();
            }
        });
        
        document.getElementById('pauseBtn').addEventListener('click', () => {
            if (this.isPaused) {
                this.resume();
            } else {
                this.pause();
            }
        });
        
        document.getElementById('restartBtn').addEventListener('click', () => {
            this.restart();
        });
        
        document.getElementById('restartGameBtn').addEventListener('click', () => {
            this.hideModal('gameOverModal');
            this.restart();
        });
        
        this.gameArea.addEventListener('click', (e) => {
            if (e.target.closest('.bug')) {
                this.hitBug(e.target.closest('.bug'));
            }
        });
    }
    
    showTutorialModal() {
        this.showModal('howToPlayModal');
    }
    
    startGame() {
        this.resetGameState();
        this.spawnBugs();
        this.startTimer();
        this.startGameLoop();
    }
    
    resetGameState() {
        this.level = 1;
        this.remainingTime = 30;
        this.survivalTime = 0;
        this.score = 0;
        this.combo = 0;
        this.bugs = [];
        this.isPaused = false;
        this.isGameOver = false;
        
        if (this.comboTimer) {
            clearTimeout(this.comboTimer);
            this.comboTimer = null;
        }
        
        this.gameArea.innerHTML = '';
        this.updateUI();
        this.updateComboDisplay(0);
    }
    
    restart() {
        this.stopGame();
        this.startGame();
    }
    
    stopGame() {
        if (this.gameLoop) {
            cancelAnimationFrame(this.gameLoop);
            this.gameLoop = null;
        }
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
        if (this.comboTimer) {
            clearTimeout(this.comboTimer);
            this.comboTimer = null;
        }
    }
    
    pause() {
        if (!this.isGameOver) {
            this.isPaused = true;
            document.getElementById('pauseBtn').textContent = '继续';
        }
    }
    
    resume() {
        if (!this.isGameOver) {
            this.isPaused = false;
            document.getElementById('pauseBtn').textContent = '暂停';
        }
    }
    
    spawnBugs() {
        const bugCount = this.getBugCountForLevel();
        for (let i = 0; i < bugCount; i++) {
            this.createBug();
        }
        this.updateBugCount();
    }
    
    getBugCountForLevel() {
        return Math.min(2 + this.level, 10);
    }
    
    getBugSpeed(type) {
        const difficultyMultiplier = this.getDifficultyMultiplier();
        const baseSpeed = 0.35 + this.level * 0.2;
        const adjustedSpeed = baseSpeed * difficultyMultiplier;
        
        if (type === 'orange') {
            return adjustedSpeed * 1.5;
        }
        return adjustedSpeed;
    }
    
    getDifficultyMultiplier() {
        if (this.level <= 2) {
            return 0.7;
        } else if (this.level <= 4) {
            return 0.85;
        } else if (this.level <= 6) {
            return 1.0;
        } else {
            return 1.15;
        }
    }
    
    getOrangeBugProbability() {
        if (this.level <= 2) {
            return 0.15;
        } else if (this.level <= 4) {
            return 0.25;
        } else {
            return 0.35;
        }
    }
    
    createBug() {
        const orangeProb = this.getOrangeBugProbability();
        const isOrange = Math.random() < orangeProb;
        const type = isOrange ? 'orange' : 'green';
        const colorClass = isOrange ? 'orange' : 'green';
        
        const bug = document.createElement('div');
        bug.className = `bug ${colorClass}`;
        
        bug.innerHTML = `
            <div class="bug-body"></div>
            <div class="bug-antenna antenna-left"></div>
            <div class="bug-antenna antenna-right"></div>
            <div class="bug-eyes">
                <div class="bug-eye"></div>
                <div class="bug-eye"></div>
            </div>
            <div class="bug-cheeks">
                <div class="bug-cheek"></div>
                <div class="bug-cheek"></div>
            </div>
            <div class="bug-mouth"></div>
            <div class="bug-legs">
                <div class="bug-leg"></div>
                <div class="bug-leg"></div>
                <div class="bug-leg"></div>
                <div class="bug-leg"></div>
                <div class="bug-leg"></div>
                <div class="bug-leg"></div>
            </div>
        `;
        
        const x = Math.random() * (this.gameArea.clientWidth - 40);
        const y = Math.random() * (this.gameArea.clientHeight - 44);
        
        bug.style.left = x + 'px';
        bug.style.top = y + 'px';
        
        this.gameArea.appendChild(bug);
        
        const angle = Math.random() * Math.PI * 2;
        const speed = this.getBugSpeed(type);
        
        this.bugs.push({
            element: bug,
            type: type,
            x: x,
            y: y,
            vx: Math.cos(angle) * speed,
            vy: Math.sin(angle) * speed,
            directionChangeTimer: 0,
            isBeingRepelled: false,
            repelTimer: 0
        });
    }
    
    hitBug(bugElement) {
        if (this.isPaused || this.isGameOver) return;
        
        const bugData = this.bugs.find(b => b.element === bugElement);
        if (!bugData) return;
        
        this.addDissolveEffect(bugData.x + 18, bugData.y + 18);
        
        if (navigator.vibrate) {
            navigator.vibrate(50);
        }
        
        bugElement.classList.add('bug-hit');
        setTimeout(() => bugElement.classList.remove('bug-hit'), 400);
        
        const centerX = this.gameArea.clientWidth / 2;
        const centerY = this.gameArea.clientHeight / 2;
        
        const angle = Math.atan2(centerY - bugData.y, centerX - bugData.x);
        const repelSpeed = bugData.type === 'orange' ? 10 : 8;
        
        bugData.vx = Math.cos(angle) * repelSpeed;
        bugData.vy = Math.sin(angle) * repelSpeed;
        bugData.isBeingRepelled = true;
        bugData.repelTimer = 30;
        
        this.incrementCombo();
    }
    
    incrementCombo() {
        this.combo++;
        this.score += 10 * this.combo;
        
        if (this.combo >= 2) {
            if (this.combo >= 3) {
                this.addComboTime();
            }
            this.showComboPopup();
        }
        
        this.updateComboDisplay(this.combo);
        
        if (this.comboTimer) {
            clearTimeout(this.comboTimer);
        }
        
        this.comboTimer = setTimeout(() => {
            this.combo = 0;
            this.updateComboDisplay(0);
        }, this.comboTimeout);
    }
    
    addComboTime() {
        const bonusTime = Math.min(this.combo - 2, 3);
        this.remainingTime += bonusTime;
        this.updateUI();
    }
    
    showComboPopup() {
        const popup = document.createElement('div');
        popup.className = 'combo-popup';
        popup.textContent = `${this.combo}连击!`;
        
        if (this.combo >= 5) {
            popup.classList.add('super-combo');
            popup.textContent = `超级连击 x${this.combo}!`;
        } else if (this.combo >= 3) {
            popup.classList.add('nice-combo');
        }
        
        popup.style.left = '50%';
        popup.style.top = '40%';
        popup.style.transform = 'translateX(-50%)';
        
        this.comboDisplayElement.appendChild(popup);
        
        setTimeout(() => {
            popup.remove();
        }, 1000);
    }
    
    updateComboDisplay(count) {
        this.comboCountElement.textContent = count;
        
        if (count >= 3) {
            this.comboStatElement.classList.add('combo-active');
        } else {
            this.comboStatElement.classList.remove('combo-active');
        }
    }
    
    addDissolveEffect(x, y) {
        const effect = document.createElement('div');
        effect.className = 'dissolve-effect';
        effect.style.left = x + 'px';
        effect.style.top = y + 'px';
        this.gameArea.appendChild(effect);
        
        setTimeout(() => {
            effect.remove();
        }, 600);
    }
    
    startTimer() {
        this.timerInterval = setInterval(() => {
            if (!this.isPaused && !this.isGameOver) {
                this.remainingTime--;
                this.survivalTime++;
                this.updateUI();
                
                if (this.remainingTime <= 0) {
                    this.nextLevel();
                }
            }
        }, 1000);
    }
    
    nextLevel() {
        this.level++;
        this.remainingTime = 30;
        this.spawnAdditionalBug();
        this.updateUI();
        
        this.showLevelUpPopup();
    }
    
    showLevelUpPopup() {
        const popup = document.createElement('div');
        popup.className = 'level-up-popup';
        popup.textContent = `第 ${this.level} 关!`;
        
        popup.style.left = '50%';
        popup.style.top = '40%';
        popup.style.transform = 'translateX(-50%)';
        
        this.comboDisplayElement.appendChild(popup);
        
        setTimeout(() => {
            popup.remove();
        }, 1500);
    }
    
    spawnAdditionalBug() {
        const extraBugs = this.getBugCountForLevel() - this.bugs.length;
        for (let i = 0; i < extraBugs; i++) {
            this.createBug();
        }
        this.updateBugCount();
    }
    
    startGameLoop() {
        const update = () => {
            if (!this.isPaused && !this.isGameOver) {
                this.updateBugs();
            }
            this.gameLoop = requestAnimationFrame(update);
        };
        this.gameLoop = requestAnimationFrame(update);
    }
    
    updateBugs() {
        const width = this.gameArea.clientWidth;
        const height = this.gameArea.clientHeight;
        const margin = this.getBoundaryMargin();
        
        for (const bug of this.bugs) {
            if (bug.isBeingRepelled) {
                bug.repelTimer--;
                if (bug.repelTimer <= 0) {
                    bug.isBeingRepelled = false;
                    const speed = this.getBugSpeed(bug.type);
                    const angle = Math.random() * Math.PI * 2;
                    bug.vx = Math.cos(angle) * speed;
                    bug.vy = Math.sin(angle) * speed;
                }
            } else {
                bug.directionChangeTimer--;
                if (bug.directionChangeTimer <= 0) {
                    this.changeBugDirection(bug, width, height);
                    const interval = this.getDirectionChangeInterval(bug.type);
                    bug.directionChangeTimer = interval;
                }
            }
            
            bug.x += bug.vx;
            bug.y += bug.vy;
            
            if (!bug.isBeingRepelled) {
                if (bug.x < margin) bug.vx = Math.abs(bug.vx);
                if (bug.x > width - margin) bug.vx = -Math.abs(bug.vx);
                if (bug.y < margin) bug.vy = Math.abs(bug.vy);
                if (bug.y > height - margin) bug.vy = -Math.abs(bug.vy);
            }
            
            bug.x = Math.max(0, Math.min(width - 40, bug.x));
            bug.y = Math.max(0, Math.min(height - 44, bug.y));
            
            bug.element.style.left = bug.x + 'px';
            bug.element.style.top = bug.y + 'px';
            
            if (this.checkBoundaryExit(bug, width, height)) {
                this.gameOver();
                return;
            }
        }
    }
    
    getBoundaryMargin() {
        if (this.level <= 2) {
            return 50;
        } else if (this.level <= 4) {
            return 40;
        } else {
            return 36;
        }
    }
    
    getDirectionChangeInterval(type) {
        if (this.level <= 2) {
            return type === 'orange' ? 50 + Math.random() * 50 : 90 + Math.random() * 60;
        } else if (this.level <= 4) {
            return type === 'orange' ? 40 + Math.random() * 40 : 70 + Math.random() * 50;
        } else {
            return type === 'orange' ? 30 + Math.random() * 40 : 60 + Math.random() * 60;
        }
    }
    
    changeBugDirection(bug, width, height) {
        const angleToEdge = Math.random() * Math.PI * 2;
        
        let randomAdjustment;
        if (this.level <= 2) {
            randomAdjustment = (Math.random() - 0.5) * Math.PI * (bug.type === 'orange' ? 0.5 : 0.3);
        } else if (this.level <= 4) {
            randomAdjustment = (Math.random() - 0.5) * Math.PI * (bug.type === 'orange' ? 0.65 : 0.4);
        } else {
            randomAdjustment = (Math.random() - 0.5) * Math.PI * (bug.type === 'orange' ? 0.8 : 0.5);
        }
        
        let finalAngle = angleToEdge + randomAdjustment;
        
        const speed = this.getBugSpeed(bug.type);
        bug.vx = Math.cos(finalAngle) * speed;
        bug.vy = Math.sin(finalAngle) * speed;
    }
    
    checkBoundaryExit(bug, width, height) {
        const exitThreshold = this.getExitThreshold();
        return bug.x <= exitThreshold || bug.x >= width - (40 - exitThreshold) || 
               bug.y <= exitThreshold || bug.y >= height - (44 - exitThreshold);
    }
    
    getExitThreshold() {
        if (this.level <= 2) {
            return -20;
        } else if (this.level <= 4) {
            return -15;
        } else {
            return -10;
        }
    }
    
    gameOver() {
        this.isGameOver = true;
        this.stopGame();
        this.showModal('gameOverModal');
    }
    
    showModal(modalId) {
        document.getElementById(modalId).classList.add('active');
    }
    
    hideModal(modalId) {
        document.getElementById(modalId).classList.remove('active');
    }
    
    updateUI() {
        this.levelElement.textContent = this.level;
        this.remainingTimeElement.textContent = this.remainingTime;
        this.survivalTimeElement.textContent = this.survivalTime;
    }
    
    updateBugCount() {
        this.bugCountElement.textContent = this.bugs.length;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new BugGame();
});