const BubbleType = {
    NORMAL: 'normal',
    FAST: 'fast',
    SLOW: 'slow',
    FRAGILE: 'fragile'
};

const BubbleTypeConfig = {
    [BubbleType.NORMAL]: {
        name: '普通气泡',
        className: 'normal-bubble',
        ariaLabel: '普通气泡',
        targetTime: 3000,
        minSpeedRatio: 0.5,
        maxSpeedRatio: 1.5,
        reboundOnWrongSpeed: false
    },
    [BubbleType.FAST]: {
        name: '快压气泡',
        className: 'fast-bubble',
        ariaLabel: '快压气泡',
        targetTime: 2000,
        minSpeedRatio: 1.2,
        maxSpeedRatio: 2.0,
        reboundOnWrongSpeed: true
    },
    [BubbleType.SLOW]: {
        name: '慢压气泡',
        className: 'slow-bubble',
        ariaLabel: '慢压气泡',
        targetTime: 4000,
        minSpeedRatio: 0.4,
        maxSpeedRatio: 0.8,
        reboundOnWrongSpeed: true
    },
    [BubbleType.FRAGILE]: {
        name: '易碎气泡',
        className: 'fragile-bubble',
        ariaLabel: '易碎气泡',
        targetTime: 3000,
        minSpeedRatio: 0.5,
        maxSpeedRatio: 1.5,
        reboundOnWrongSpeed: false,
        breakOnRelease: true
    }
};

class BubbleGame {
    constructor() {
        this.level = 1;
        this.bubbles = [];
        this.currentPressingBubble = null;
        this.isPaused = false;
        this.chances = 3;
        this.gameContainer = document.getElementById('game-container');
        this.bubblesContainer = document.getElementById('bubbles-container');
        this.levelDisplay = document.getElementById('level-display');
        this.bubblesCountDisplay = document.getElementById('bubbles-count');
        this.chancesCountDisplay = document.getElementById('chances-count');
        this.speedText = document.getElementById('speed-text');
        this.speedIndicator = document.querySelector('.speed-indicator');
        this.showRhythmBar = true;
        this.rhythmToggle = document.getElementById('rhythm-toggle');
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.startLevel();
    }
    
    bindEvents() {
        document.getElementById('how-to-play-btn').addEventListener('click', () => {
            this.showModal('how-to-play-modal');
        });
        
        document.getElementById('close-modal-btn').addEventListener('click', () => {
            this.hideModal('how-to-play-modal');
        });
        
        document.getElementById('pause-btn').addEventListener('click', () => {
            this.pauseGame();
        });
        
        document.getElementById('resume-btn').addEventListener('click', () => {
            this.resumeGame();
        });
        
        document.getElementById('restart-btn').addEventListener('click', () => {
            this.restartGame();
        });
        
        document.getElementById('pause-restart-btn').addEventListener('click', () => {
            this.hideModal('pause-modal');
            this.restartGame();
        });
        
        document.getElementById('next-level-btn').addEventListener('click', () => {
            this.hideModal('level-complete-modal');
            this.level++;
            this.startLevel();
        });
        
        document.getElementById('game-over-restart-btn').addEventListener('click', () => {
            this.hideModal('game-over-modal');
            this.restartGame();
        });
        
        this.rhythmToggle.addEventListener('change', (e) => {
            this.showRhythmBar = e.target.checked;
        });
        
        document.addEventListener('mouseup', () => this.handleRelease());
        document.addEventListener('touchend', (e) => {
            e.preventDefault();
            this.handleRelease();
        });
        
        document.addEventListener('contextmenu', (e) => e.preventDefault());
    }
    
    getLevelConfig() {
        const baseBubbles = 3;
        const additionalBubbles = Math.min(this.level - 1, 7);
        const bubbleCount = baseBubbles + additionalBubbles;
        
        const baseSpeedTolerance = 0.5;
        const speedTolerance = Math.max(0.2, baseSpeedTolerance - (this.level - 1) * 0.05);
        
        const specialBubbleRatio = Math.min(0.6, 0.2 + (this.level - 1) * 0.05);
        
        return {
            minBubbles: Math.max(3, bubbleCount - 1),
            maxBubbles: bubbleCount + 1,
            minSize: 60,
            maxSize: 100,
            pressSpeed: 0.02,
            speedTolerance: speedTolerance,
            targetScale: 0.05,
            specialBubbleRatio: specialBubbleRatio
        };
    }
    
    startLevel() {
        this.bubbles = [];
        this.bubblesContainer.innerHTML = '';
        this.isPaused = false;
        this.updateUI();
        requestAnimationFrame(() => {
            setTimeout(() => {
                this.generateBubbles();
            }, 100);
        });
    }
    
    getRandomBubbleType(config) {
        const rand = Math.random();
        const specialChance = config.specialBubbleRatio;
        
        if (rand < specialChance * 0.3) {
            return BubbleType.FAST;
        } else if (rand < specialChance * 0.6) {
            return BubbleType.SLOW;
        } else if (rand < specialChance) {
            return BubbleType.FRAGILE;
        } else {
            return BubbleType.NORMAL;
        }
    }
    
    generateBubbles() {
        const config = this.getLevelConfig();
        const count = Math.floor(Math.random() * (config.maxBubbles - config.minBubbles + 1)) + config.minBubbles;
        const positions = [];
        
        for (let i = 0; i < count; i++) {
            const size = Math.floor(Math.random() * (config.maxSize - config.minSize + 1)) + config.minSize;
            const position = this.getRandomPosition(size, positions);
            
            if (position) {
                positions.push(position);
                const type = this.getRandomBubbleType(config);
                this.createBubble(position, size, config, type);
            }
        }
        
        this.updateUI();
    }
    
    getRandomPosition(size, existingPositions) {
        const containerRect = this.bubblesContainer.getBoundingClientRect();
        const maxAttempts = 100;
        const padding = 20;
        
        let availableWidth = Math.max(containerRect.width, window.innerWidth * 0.8);
        let availableHeight = Math.max(containerRect.height, window.innerHeight * 0.6);
        
        availableWidth = Math.max(availableWidth, size + padding * 2 + 100);
        availableHeight = Math.max(availableHeight, size + padding * 2 + 100);
        
        for (let i = 0; i < maxAttempts; i++) {
            const x = Math.random() * (availableWidth - size - padding * 2) + padding;
            const y = Math.random() * (availableHeight - size - padding * 2) + padding;
            
            let valid = true;
            for (const pos of existingPositions) {
                const dx = x - pos.x;
                const dy = y - pos.y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < (size + pos.size) / 2 + 20) {
                    valid = false;
                    break;
                }
            }
            
            if (valid) {
                return { x, y, size };
            }
        }
        
        const angle = (existingPositions.length * 45) * Math.PI / 180;
        const radius = 150 + existingPositions.length * 50;
        const centerX = availableWidth / 2;
        const centerY = availableHeight / 2;
        
        return {
            x: centerX + Math.cos(angle) * radius - size / 2,
            y: centerY + Math.sin(angle) * radius - size / 2,
            size: size
        };
    }
    
    createBubble(position, size, config, type) {
        const typeConfig = BubbleTypeConfig[type];
        const bubble = document.createElement('div');
        bubble.className = `bubble ${typeConfig.className}`;
        bubble.setAttribute('role', 'button');
        bubble.setAttribute('aria-label', typeConfig.ariaLabel);
        bubble.style.width = `${size}px`;
        bubble.style.height = `${size}px`;
        bubble.style.left = `${position.x}px`;
        bubble.style.top = `${position.y}px`;
        
        const rhythmBarContainer = this.createRhythmBar(typeConfig);
        rhythmBarContainer.style.left = `${position.x + size / 2}px`;
        rhythmBarContainer.style.top = `${position.y + size + 10}px`;
        
        const bubbleData = {
            element: bubble,
            rhythmBarContainer: rhythmBarContainer,
            rhythmBar: rhythmBarContainer.querySelector('.rhythm-bar'),
            rhythmSpeedIndicator: rhythmBarContainer.querySelector('.rhythm-speed-indicator'),
            scale: 1,
            isPressed: false,
            isEliminated: false,
            config: config,
            type: type,
            typeConfig: typeConfig,
            pressStartTime: 0,
            initialScale: 1
        };
        
        this.bubbles.push(bubbleData);
        
        bubble.addEventListener('mousedown', (e) => {
            e.preventDefault();
            this.handlePress(bubbleData);
        });
        
        bubble.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.handlePress(bubbleData);
        });
        
        this.bubblesContainer.appendChild(bubble);
        this.bubblesContainer.appendChild(rhythmBarContainer);
    }
    
    createRhythmBar(typeConfig) {
        const container = document.createElement('div');
        container.className = 'rhythm-bar-container';
        
        const bar = document.createElement('div');
        bar.className = 'rhythm-bar';
        
        const indicator = document.createElement('div');
        indicator.className = 'rhythm-bar-indicator';
        
        const speedIndicator = document.createElement('div');
        speedIndicator.className = 'rhythm-speed-indicator';
        speedIndicator.style.left = '0%';
        
        container.appendChild(bar);
        container.appendChild(indicator);
        container.appendChild(speedIndicator);
        
        return container;
    }
    
    handlePress(bubbleData) {
        if (this.isPaused || bubbleData.isEliminated || this.currentPressingBubble) {
            return;
        }
        
        this.currentPressingBubble = bubbleData;
        bubbleData.isPressed = true;
        bubbleData.element.classList.add('pressing');
        bubbleData.pressStartTime = performance.now();
        bubbleData.initialScale = bubbleData.scale;
        
        bubbleData.rhythmBar.style.width = '0%';
        bubbleData.rhythmSpeedIndicator.style.left = '0%';
        bubbleData.rhythmSpeedIndicator.className = 'rhythm-speed-indicator';
        
        if (this.showRhythmBar) {
            bubbleData.rhythmBarContainer.classList.add('visible');
        }
        
        const typeConfig = bubbleData.typeConfig;
        this.updateSpeedIndicatorText(bubbleData.type);
        this.speedIndicator.className = 'speed-indicator normal';
        
        this.pressAnimationFrame = requestAnimationFrame(() => this.updatePress());
    }
    
    updateSpeedIndicatorText(type) {
        const typeConfig = BubbleTypeConfig[type];
        if (type === BubbleType.FAST) {
            this.speedText.textContent = '快压气泡 - 加快节奏！';
        } else if (type === BubbleType.SLOW) {
            this.speedText.textContent = '慢压气泡 - 放慢节奏！';
        } else if (type === BubbleType.FRAGILE) {
            this.speedText.textContent = '易碎气泡 - 不要松手！';
        } else {
            this.speedText.textContent = '匀速按压';
        }
    }
    
    updatePress() {
        if (!this.currentPressingBubble || this.isPaused) {
            return;
        }
        
        const bubbleData = this.currentPressingBubble;
        const now = performance.now();
        const totalElapsed = now - bubbleData.pressStartTime;
        const config = bubbleData.config;
        const typeConfig = bubbleData.typeConfig;
        
        const targetTime = typeConfig.targetTime;
        const progress = Math.min(totalElapsed / targetTime, 1);
        const idealScale = 1 - (1 - config.targetScale) * progress;
        
        bubbleData.scale = Math.max(config.targetScale, idealScale);
        bubbleData.element.style.transform = `scale(${bubbleData.scale})`;
        bubbleData.element.style.setProperty('--current-scale', bubbleData.scale);
        
        if (this.showRhythmBar) {
            bubbleData.rhythmBar.style.width = `${progress * 100}%`;
        }
        
        const idealRate = (1 - config.targetScale) / targetTime;
        const actualRate = (bubbleData.initialScale - bubbleData.scale) / Math.max(totalElapsed, 1);
        const speedRatio = actualRate / idealRate;
        
        this.checkSpeedAndHandle(bubbleData, speedRatio, typeConfig);
        
        if (bubbleData.scale <= config.targetScale) {
            this.eliminateBubble(bubbleData);
            return;
        }
        
        this.pressAnimationFrame = requestAnimationFrame(() => this.updatePress());
    }
    
    checkSpeedAndHandle(bubbleData, speedRatio, typeConfig) {
        const speedIndicator = this.speedIndicator;
        const bubble = bubbleData.element;
        
        speedIndicator.classList.remove('normal', 'fast', 'slow');
        bubble.classList.remove('normal-speed', 'fast-speed', 'slow-speed');
        
        const now = performance.now();
        const totalElapsed = now - bubbleData.pressStartTime;
        const targetTime = typeConfig.targetTime;
        const progress = Math.min(totalElapsed / targetTime, 1);
        const displayPosition = Math.min(progress * speedRatio, 1) * 100;
        
        bubbleData.rhythmSpeedIndicator.style.left = `${displayPosition}%`;
        bubbleData.rhythmSpeedIndicator.classList.remove('in-range', 'too-fast', 'too-slow');
        
        if (speedRatio > typeConfig.maxSpeedRatio) {
            speedIndicator.classList.add('fast');
            bubble.classList.add('fast-speed');
            this.speedText.textContent = '太快了！';
            bubbleData.rhythmSpeedIndicator.classList.add('too-fast');
            
            if (typeConfig.reboundOnWrongSpeed && bubbleData.type === BubbleType.SLOW) {
                this.handleWrongSpeed(bubbleData);
                return;
            }
        } else if (speedRatio < typeConfig.minSpeedRatio) {
            speedIndicator.classList.add('slow');
            bubble.classList.add('slow-speed');
            this.speedText.textContent = '太慢了！';
            bubbleData.rhythmSpeedIndicator.classList.add('too-slow');
            
            if (typeConfig.reboundOnWrongSpeed && bubbleData.type === BubbleType.FAST) {
                this.handleWrongSpeed(bubbleData);
                return;
            }
        } else {
            speedIndicator.classList.add('normal');
            bubble.classList.add('normal-speed');
            bubbleData.rhythmSpeedIndicator.classList.add('in-range');
            this.updateSpeedIndicatorText(bubbleData.type);
        }
    }
    
    handleWrongSpeed(bubbleData) {
        cancelAnimationFrame(this.pressAnimationFrame);
        this.reboundBubble(bubbleData);
        this.currentPressingBubble = null;
        this.resetSpeedIndicator();
    }
    
    handleRelease() {
        if (!this.currentPressingBubble) {
            return;
        }
        
        const bubbleData = this.currentPressingBubble;
        cancelAnimationFrame(this.pressAnimationFrame);
        
        if (bubbleData.scale <= bubbleData.config.targetScale) {
            this.eliminateBubble(bubbleData);
            return;
        }
        
        const typeConfig = bubbleData.typeConfig;
        
        if (typeConfig.breakOnRelease) {
            this.breakBubble(bubbleData);
        } else {
            this.reboundBubble(bubbleData);
        }
        
        this.currentPressingBubble = null;
        this.resetSpeedIndicator();
    }
    
    reboundBubble(bubbleData) {
        bubbleData.isPressed = false;
        const bubble = bubbleData.element;
        const rhythmBarContainer = bubbleData.rhythmBarContainer;
        
        rhythmBarContainer.classList.remove('visible');
        bubble.classList.remove('pressing', 'normal-speed', 'fast-speed', 'slow-speed');
        bubble.classList.add('rebound');
        
        setTimeout(() => {
            bubble.classList.remove('rebound');
            bubbleData.scale = 1;
            bubble.style.transform = 'scale(1)';
            bubble.style.setProperty('--current-scale', 1);
        }, 500);
    }
    
    breakBubble(bubbleData) {
        bubbleData.isEliminated = true;
        const bubble = bubbleData.element;
        const rhythmBarContainer = bubbleData.rhythmBarContainer;
        
        rhythmBarContainer.classList.remove('visible');
        bubble.classList.remove('pressing', 'normal-speed', 'fast-speed', 'slow-speed');
        bubble.classList.add('broken');
        
        this.chances--;
        this.updateUI();
        
        if (this.chances <= 0) {
            setTimeout(() => {
                this.gameOver();
            }, 400);
        } else {
            setTimeout(() => {
                if (bubble.parentNode) {
                    bubble.parentNode.removeChild(bubble);
                }
                if (rhythmBarContainer.parentNode) {
                    rhythmBarContainer.parentNode.removeChild(rhythmBarContainer);
                }
                this.checkLevelComplete();
            }, 400);
        }
    }
    
    gameOver() {
        this.showModal('game-over-modal');
    }
    
    eliminateBubble(bubbleData) {
        cancelAnimationFrame(this.pressAnimationFrame);
        bubbleData.isEliminated = true;
        
        const bubble = bubbleData.element;
        const rhythmBarContainer = bubbleData.rhythmBarContainer;
        
        rhythmBarContainer.classList.remove('visible');
        bubble.classList.remove('pressing', 'normal-speed', 'fast-speed', 'slow-speed');
        bubble.classList.add('eliminated');
        
        setTimeout(() => {
            if (bubble.parentNode) {
                bubble.parentNode.removeChild(bubble);
            }
            if (rhythmBarContainer.parentNode) {
                rhythmBarContainer.parentNode.removeChild(rhythmBarContainer);
            }
            this.checkLevelComplete();
        }, 300);
        
        this.currentPressingBubble = null;
        this.resetSpeedIndicator();
        this.updateUI();
    }
    
    resetSpeedIndicator() {
        this.speedIndicator.classList.remove('normal', 'fast', 'slow');
        this.speedText.textContent = '准备开始';
    }
    
    checkLevelComplete() {
        const remainingBubbles = this.bubbles.filter(b => !b.isEliminated);
        
        if (remainingBubbles.length === 0) {
            setTimeout(() => {
                this.showModal('level-complete-modal');
            }, 500);
        }
    }
    
    updateUI() {
        this.levelDisplay.textContent = this.level;
        const remainingBubbles = this.bubbles.filter(b => !b.isEliminated).length;
        this.bubblesCountDisplay.textContent = remainingBubbles;
        this.chancesCountDisplay.textContent = this.chances;
    }
    
    pauseGame() {
        if (this.currentPressingBubble) {
            this.handleRelease();
        }
        this.isPaused = true;
        this.showModal('pause-modal');
    }
    
    resumeGame() {
        this.isPaused = false;
        this.hideModal('pause-modal');
    }
    
    restartGame() {
        this.level = 1;
        this.chances = 3;
        this.startLevel();
    }
    
    showModal(id) {
        document.getElementById(id).classList.remove('hidden');
    }
    
    hideModal(id) {
        document.getElementById(id).classList.add('hidden');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new BubbleGame();
});
