class LightBeatGame {
    constructor() {
        this.currentSkin = 'soft';
        this.currentScreen = 'start';
        this.isPaused = false;
        
        this.BEAT_INTERVAL_SLOW = 2500;
        this.BEAT_INTERVAL_NORMAL = 2000;
        this.BEAT_PRE_WINDOW = 400;
        this.BEAT_POST_WINDOW = 800;
        this.BEAT_VISIBLE_DURATION = 400;
        this.TOTAL_ROUNDS = 8;
        
        this.gameState = {
            isPlaying: false,
            currentRound: 0,
            beatActive: false,
            beatVisible: false,
            lastBeatStartTime: 0,
            nextBeatScheduledTime: 0,
            
            combo: 0,
            maxCombo: 0,
            successHits: 0,
            roundHitThisBeat: false,
        };
        
        this.timers = {
            beatSchedule: null,
            beatVisible: null,
            beatEnd: null,
        };
        
        this.initElements();
        this.bindEvents();
        this.selectSkin(this.currentSkin);
    }
    
    initElements() {
        this.startScreen = document.getElementById('start-screen');
        this.gameScreen = document.getElementById('game-screen');
        this.pauseScreen = document.getElementById('pause-screen');
        this.resultScreen = document.getElementById('result-screen');
        
        this.startBtn = document.getElementById('start-btn');
        this.pauseBtn = document.getElementById('pause-btn');
        this.resumeBtn = document.getElementById('resume-btn');
        this.restartBtnGame = document.getElementById('restart-btn-game');
        this.pauseRestartBtn = document.getElementById('pause-restart-btn');
        this.pauseHomeBtn = document.getElementById('pause-home-btn');
        this.playAgainBtn = document.getElementById('play-again-btn');
        this.backHomeBtn = document.getElementById('back-home-btn');
        
        this.beatCircle = document.getElementById('beat-circle');
        this.particlesContainer = document.getElementById('particles-container');
        this.backgroundGlow = document.getElementById('background-glow');
        
        this.levelDisplay = document.getElementById('level-display');
        this.comboDisplayUi = document.getElementById('combo-display-ui');
        this.progressDisplay = document.getElementById('progress-display');
        this.starsDisplay = document.getElementById('stars-display');
        
        this.resultStar1 = document.getElementById('result-star-1');
        this.resultStar2 = document.getElementById('result-star-2');
        this.resultStar3 = document.getElementById('result-star-3');
        this.ratingMessage = document.getElementById('rating-message');
        this.statMaxCombo = document.getElementById('stat-max-combo');
        this.statSuccessHits = document.getElementById('stat-success-hits');
        this.statAccuracy = document.getElementById('stat-accuracy');
        
        this.skinBtns = document.querySelectorAll('.skin-btn');
    }
    
    bindEvents() {
        this.startBtn.addEventListener('click', () => this.startGame());
        this.pauseBtn.addEventListener('click', () => this.pauseGame());
        this.resumeBtn.addEventListener('click', () => this.resumeGame());
        this.restartBtnGame.addEventListener('click', () => this.restartGame());
        this.pauseRestartBtn.addEventListener('click', () => this.restartGame());
        this.pauseHomeBtn.addEventListener('click', () => this.goToStart());
        this.playAgainBtn.addEventListener('click', () => this.startGame());
        this.backHomeBtn.addEventListener('click', () => this.goToStart());
        
        this.skinBtns.forEach(btn => {
            btn.addEventListener('click', () => this.selectSkin(btn.dataset.skin));
        });
        
        this.beatCircle.addEventListener('click', () => this.handleClick());
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space' && this.gameState.isPlaying && !this.isPaused) {
                e.preventDefault();
                this.handleClick();
            }
            if (e.code === 'Escape') {
                if (this.gameState.isPlaying && !this.isPaused) {
                    this.pauseGame();
                } else if (this.isPaused) {
                    this.resumeGame();
                }
            }
        });
    }
    
    selectSkin(skinName) {
        this.currentSkin = skinName;
        
        this.skinBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.skin === skinName);
        });
        
        this.fullResetVisualEffects();
    }
    
    fullResetVisualEffects() {
        if (!this.beatCircle) return;
        
        this.beatCircle.className = 'beat-circle';
        this.beatCircle.classList.add(`skin-${this.currentSkin}`);
        this.beatCircle.classList.remove('active', 'success');
        
        if (this.particlesContainer) {
            const particles = this.particlesContainer.querySelectorAll('.particle');
            particles.forEach(p => p.remove());
        }
        
        if (this.backgroundGlow) {
            this.backgroundGlow.classList.remove('pulsing');
        }
    }
    
    showScreen(screenName) {
        this.currentScreen = screenName;
        
        this.startScreen.classList.toggle('active', screenName === 'start');
        this.gameScreen.classList.toggle('active', screenName === 'game');
        this.pauseScreen.classList.toggle('active', screenName === 'pause');
        this.resultScreen.classList.toggle('active', screenName === 'result');
    }
    
    goToStart() {
        this.stopGame();
        this.isPaused = false;
        this.showScreen('start');
    }
    
    startGame() {
        this.fullResetAllState();
        this.showScreen('game');
        this.fullResetVisualEffects();
        
        this.backgroundGlow.classList.add('active');
        
        setTimeout(() => {
            this.gameState.isPlaying = true;
            this.scheduleNextBeat();
        }, 500);
    }
    
    fullResetAllState() {
        this.clearAllTimers();
        
        this.gameState = {
            isPlaying: false,
            currentRound: 0,
            beatActive: false,
            beatVisible: false,
            lastBeatStartTime: 0,
            nextBeatScheduledTime: 0,
            
            combo: 0,
            maxCombo: 0,
            successHits: 0,
            roundHitThisBeat: false,
        };
        
        this.isPaused = false;
        
        this.updateTopBar();
        this.fullResetVisualEffects();
        
        if (this.backgroundGlow) {
            this.backgroundGlow.classList.remove('pulsing');
        }
    }
    
    clearAllTimers() {
        if (this.timers.beatSchedule) {
            clearTimeout(this.timers.beatSchedule);
            this.timers.beatSchedule = null;
        }
        if (this.timers.beatVisible) {
            clearTimeout(this.timers.beatVisible);
            this.timers.beatVisible = null;
        }
        if (this.timers.beatEnd) {
            clearTimeout(this.timers.beatEnd);
            this.timers.beatEnd = null;
        }
    }
    
    stopGame() {
        this.gameState.isPlaying = false;
        this.isPaused = false;
        
        this.clearAllTimers();
        
        if (this.backgroundGlow) {
            this.backgroundGlow.classList.remove('pulsing', 'active');
        }
    }
    
    pauseGame() {
        if (!this.gameState.isPlaying || this.isPaused) return;
        
        this.isPaused = true;
        this.clearAllTimers();
        
        this.beatCircle.classList.remove('active');
        this.gameState.beatVisible = false;
        
        this.showScreen('pause');
    }
    
    resumeGame() {
        if (!this.isPaused) return;
        
        this.isPaused = false;
        this.showScreen('game');
        
        this.scheduleNextBeat();
    }
    
    restartGame() {
        this.stopGame();
        this.startGame();
    }
    
    scheduleNextBeat() {
        if (!this.gameState.isPlaying || this.isPaused) return;
        if (this.gameState.currentRound >= this.TOTAL_ROUNDS) {
            this.endGame();
            return;
        }
        
        const now = Date.now();
        const interval = this.gameState.currentRound % 2 === 0 ? this.BEAT_INTERVAL_SLOW : this.BEAT_INTERVAL_NORMAL;
        const nextBeatTime = now + interval;
        
        this.gameState.nextBeatScheduledTime = nextBeatTime;
        this.gameState.beatActive = false;
        this.gameState.beatVisible = false;
        this.gameState.roundHitThisBeat = false;
        
        this.timers.beatSchedule = setTimeout(() => {
            this.triggerBeat();
        }, interval);
    }
    
    triggerBeat() {
        if (!this.gameState.isPlaying || this.isPaused) return;
        
        this.gameState.currentRound++;
        this.gameState.beatActive = true;
        this.gameState.beatVisible = true;
        this.gameState.lastBeatStartTime = Date.now();
        
        this.updateTopBar();
        
        this.beatCircle.classList.add('active');
        this.triggerBackgroundPulse();
        this.spawnParticles();
        
        this.timers.beatVisible = setTimeout(() => {
            this.beatCircle.classList.remove('active');
            this.gameState.beatVisible = false;
        }, this.BEAT_VISIBLE_DURATION);
        
        this.timers.beatEnd = setTimeout(() => {
            this.gameState.beatActive = false;
            
            if (!this.gameState.roundHitThisBeat) {
                this.missBeat();
            }
            
            if (this.gameState.isPlaying && !this.isPaused) {
                this.scheduleNextBeat();
            }
        }, this.BEAT_POST_WINDOW);
    }
    
    triggerBackgroundPulse() {
        if (!this.backgroundGlow) return;
        
        this.backgroundGlow.classList.remove('pulsing');
        void this.backgroundGlow.offsetWidth;
        this.backgroundGlow.classList.add('pulsing');
    }
    
    spawnParticles() {
        if (this.currentSkin === 'soft') return;
        if (!this.particlesContainer) return;
        
        const container = this.particlesContainer;
        const particleCount = this.currentSkin === 'star' ? 8 : 4;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            
            if (this.currentSkin === 'star') {
                particle.classList.add('star-particle');
                const size = 4 + Math.random() * 4;
                particle.style.width = `${size}px`;
                particle.style.height = `${size}px`;
                particle.style.left = '50%';
                particle.style.top = '50%';
                
                const angle = (Math.PI * 2 * i) / particleCount;
                const distance = 70 + Math.random() * 40;
                particle.style.setProperty('--tx', `${Math.cos(angle) * distance}px`);
                particle.style.setProperty('--ty', `${Math.sin(angle) * distance}px`);
            } else if (this.currentSkin === 'bubble') {
                particle.classList.add('bubble-particle');
                const size = 6 + Math.random() * 8;
                particle.style.width = `${size}px`;
                particle.style.height = `${size}px`;
                particle.style.left = `${25 + Math.random() * 50}%`;
                particle.style.top = '50%';
            }
            
            container.appendChild(particle);
            
            setTimeout(() => {
                if (particle.parentNode === container) {
                    particle.remove();
                }
            }, 1000);
        }
    }
    
    handleClick() {
        if (!this.gameState.isPlaying || this.isPaused) return;
        
        const now = Date.now();
        const preWindowStart = this.gameState.nextBeatScheduledTime - this.BEAT_PRE_WINDOW;
        const postWindowEnd = this.gameState.lastBeatStartTime + this.BEAT_POST_WINDOW;
        
        const isInPreWindow = this.gameState.nextBeatScheduledTime > 0 && 
                              now >= preWindowStart && 
                              now < this.gameState.nextBeatScheduledTime;
        
        const isInPostWindow = this.gameState.beatActive && 
                               now <= postWindowEnd;
        
        if (isInPreWindow || isInPostWindow) {
            this.hitBeat();
        }
    }
    
    hitBeat() {
        if (this.gameState.roundHitThisBeat) return;
        
        this.gameState.roundHitThisBeat = true;
        this.gameState.successHits++;
        this.gameState.combo++;
        
        if (this.gameState.combo > this.gameState.maxCombo) {
            this.gameState.maxCombo = this.gameState.combo;
        }
        
        this.updateTopBar();
        this.beatCircle.classList.add('success');
        
        setTimeout(() => {
            this.beatCircle.classList.remove('success');
        }, 400);
    }
    
    missBeat() {
        this.gameState.combo = 0;
        this.updateTopBar();
    }
    
    updateTopBar() {
        this.levelDisplay.textContent = '1';
        this.comboDisplayUi.textContent = this.gameState.combo;
        this.progressDisplay.textContent = `${this.gameState.currentRound}/${this.TOTAL_ROUNDS}`;
        
        let currentStars = 0;
        if (this.gameState.currentRound > 0) {
            const currentHitRate = this.gameState.successHits / this.gameState.currentRound;
            if (currentHitRate >= 0.85) currentStars = 3;
            else if (currentHitRate >= 0.5) currentStars = 2;
            else if (currentHitRate >= 0.25) currentStars = 1;
        }
        
        this.starsDisplay.textContent = this.getStarsText(currentStars);
    }
    
    getStarsText(starCount) {
        const filled = '★';
        const empty = '☆';
        return filled.repeat(starCount) + empty.repeat(3 - starCount);
    }
    
    endGame() {
        this.gameState.isPlaying = false;
        this.clearAllTimers();
        this.showResult();
    }
    
    showResult() {
        const hitRate = this.gameState.successHits / this.TOTAL_ROUNDS;
        let stars = 1;
        let rating = '继续加油！';
        
        if (hitRate >= 0.5) {
            stars = 2;
            rating = '很不错！';
        }
        if (hitRate >= 0.85) {
            stars = 3;
            rating = '完美！';
        }
        
        const accuracy = Math.round(hitRate * 100);
        
        this.statMaxCombo.textContent = this.gameState.maxCombo;
        this.statSuccessHits.textContent = this.gameState.successHits;
        this.statAccuracy.textContent = `${accuracy}%`;
        this.ratingMessage.textContent = rating;
        
        this.resultStar1.classList.remove('active');
        this.resultStar2.classList.remove('active');
        this.resultStar3.classList.remove('active');
        
        this.showScreen('result');
        
        const activateStar = (starElement, delay) => {
            setTimeout(() => {
                starElement.classList.add('active');
            }, delay);
        };
        
        if (stars >= 1) activateStar(this.resultStar1, 300);
        if (stars >= 2) activateStar(this.resultStar2, 600);
        if (stars >= 3) activateStar(this.resultStar3, 900);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new LightBeatGame();
});