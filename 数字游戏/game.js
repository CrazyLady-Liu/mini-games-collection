const GameState = {
    PLAYING: 'playing',
    WON: 'won',
    LOST: 'lost'
};

class NumberGuessGame {
    constructor() {
        this.targetNumber = 0;
        this.attempts = 0;
        this.maxAttempts = 7;
        this.score = 0;
        this.bestScore = this.loadBestScore();
        this.guessHistory = [];
        this.gameState = GameState.PLAYING;
        this.lowerBound = 1;
        this.upperBound = 100;
        
        this.elements = {
            guessInput: document.getElementById('guess-input'),
            guessBtn: document.getElementById('guess-btn'),
            restartBtn: document.getElementById('restart-btn'),
            hint: document.getElementById('hint'),
            currentScore: document.getElementById('current-score'),
            bestScore: document.getElementById('best-score'),
            remainingAttempts: document.getElementById('remaining-attempts'),
            guessHistory: document.getElementById('guess-history')
        };
        
        this.init();
    }
    
    init() {
        this.bindEvents();
        this.initGame();
        this.updateBestScoreDisplay();
    }
    
    bindEvents() {
        this.elements.guessBtn.addEventListener('click', () => this.handleGuess());
        this.elements.restartBtn.addEventListener('click', () => this.initGame());
        this.elements.guessInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.handleGuess();
            }
        });
    }
    
    initGame() {
        this.targetNumber = this.generateNumber();
        this.attempts = 0;
        this.score = 0;
        this.guessHistory = [];
        this.gameState = GameState.PLAYING;
        this.lowerBound = 1;
        this.upperBound = 100;
        
        this.elements.guessInput.value = '';
        this.elements.guessInput.disabled = false;
        this.elements.guessBtn.disabled = false;
        this.elements.hint.className = 'hint';
        this.elements.hint.textContent = '猜一个1-100之间的数字';
        this.elements.guessHistory.innerHTML = '';
        
        this.updateScoreDisplay();
        this.updateRemainingAttemptsDisplay();
    }
    
    generateNumber() {
        return Math.floor(Math.random() * 100) + 1;
    }
    
    validateInput(input) {
        const regex = /^\d+$/;
        if (!regex.test(input)) {
            return { valid: false, message: '请输入有效的数字！' };
        }
        
        const num = parseInt(input, 10);
        if (num < 1 || num > 100) {
            return { valid: false, message: '数字必须在1-100之间！' };
        }
        
        return { valid: true, number: num };
    }
    
    handleGuess() {
        if (this.gameState !== GameState.PLAYING) {
            return;
        }
        
        const input = this.elements.guessInput.value.trim();
        const validation = this.validateInput(input);
        
        if (!validation.valid) {
            this.showHint(validation.message, 'error');
            return;
        }
        
        const guess = validation.number;
        this.attempts++;
        
        const result = this.compareNumber(guess);
        this.addToHistory(guess, result);
        this.processResult(result, guess);
        
        this.elements.guessInput.value = '';
        this.elements.guessInput.focus();
    }
    
    compareNumber(guess) {
        if (guess === this.targetNumber) {
            return 'correct';
        } else if (guess > this.targetNumber) {
            return 'too-high';
        } else {
            return 'too-low';
        }
    }
    
    processResult(result, guess) {
        this.updateRemainingAttemptsDisplay();
        
        if (result === 'correct') {
            this.gameState = GameState.WON;
            this.score = this.calculateScore();
            this.updateScoreDisplay();
            this.checkAndUpdateBestScore();
            const hintHTML = `
                <div style="margin-bottom: 10px;">� 恭喜你猜对了！</div>
                <div style="font-size: 1.8em; font-weight: bold;">答案是 ${this.targetNumber}</div>
                <div style="margin-top: 10px; font-size: 0.9em;">得分：${this.score} 分</div>
            `;
            this.showHint(hintHTML, 'correct');
            this.disableInput();
        } else if (this.attempts >= this.maxAttempts) {
            this.gameState = GameState.LOST;
            const hintHTML = `
                <div style="margin-bottom: 10px;">😔 游戏结束！</div>
                <div style="font-size: 1.8em; font-weight: bold;">答案是 ${this.targetNumber}</div>
                <div style="margin-top: 10px; font-size: 0.9em;">下次加油！</div>
            `;
            this.showHint(hintHTML, 'game-over');
            this.disableInput();
        } else {
            // 更新区间
            if (result === 'too-high') {
                this.upperBound = Math.min(this.upperBound, guess - 1);
            } else {
                this.lowerBound = Math.max(this.lowerBound, guess + 1);
            }
            
            const directionEmoji = result === 'too-high' ? '📈' : '📉';
            const directionText = result === 'too-high' ? '太大了' : '太小了';
            const hintHTML = `
                <div style="margin-bottom: 12px;">${directionEmoji} ${guess} ${directionText}！</div>
                <div style="background: rgba(255,255,255,0.5); padding: 8px; border-radius: 6px; font-weight: bold; font-size: 1.2em;">
                    🎯 目标在 <span style="color: #667eea; font-size: 1.3em;">${this.lowerBound}</span> ~ <span style="color: #667eea; font-size: 1.3em;">${this.upperBound}</span> 之间
                </div>
                <div style="margin-top: 10px; font-size: 0.85em; opacity: 0.8;">
                    还剩 ${this.maxAttempts - this.attempts} 次机会
                </div>
            `;
            this.showHint(hintHTML, result);
        }
    }
    
    calculateScore() {
        const baseScore = 1000;
        const penalty = (this.attempts - 1) * 50;
        return Math.max(baseScore - penalty, 100);
    }
    
    checkAndUpdateBestScore() {
        if (this.score > this.bestScore) {
            this.bestScore = this.score;
            this.saveBestScore();
            this.updateBestScoreDisplay();
        }
    }
    
    loadBestScore() {
        const saved = localStorage.getItem('numberGuessBestScore');
        return saved ? parseInt(saved, 10) : 0;
    }
    
    saveBestScore() {
        localStorage.setItem('numberGuessBestScore', this.bestScore.toString());
    }
    
    updateScoreDisplay() {
        this.elements.currentScore.textContent = this.score;
    }
    
    updateBestScoreDisplay() {
        this.elements.bestScore.textContent = this.bestScore > 0 ? this.bestScore : '--';
    }
    
    updateRemainingAttemptsDisplay() {
        const remaining = this.maxAttempts - this.attempts;
        this.elements.remainingAttempts.textContent = remaining;
    }
    
    showHint(message, type) {
        this.elements.hint.className = `hint ${type}`;
        this.elements.hint.innerHTML = message;
    }
    
    addToHistory(guess, result) {
        this.guessHistory.push({ guess, result, attempt: this.attempts });
        this.renderHistory();
    }
    
    renderHistory() {
        this.elements.guessHistory.innerHTML = '';
        
        this.guessHistory.slice().reverse().forEach(item => {
            const div = document.createElement('div');
            div.className = `history-item ${item.result}`;
            
            let resultText;
            switch (item.result) {
                case 'correct':
                    resultText = '✓ 猜对了！';
                    break;
                case 'too-high':
                    resultText = '太大了';
                    break;
                case 'too-low':
                    resultText = '太小了';
                    break;
                default:
                    resultText = '';
            }
            
            div.innerHTML = `
                <span>第 ${item.attempt} 次</span>
                <span>${item.guess}</span>
                <span>${resultText}</span>
            `;
            
            this.elements.guessHistory.appendChild(div);
        });
    }
    
    disableInput() {
        this.elements.guessInput.disabled = true;
        this.elements.guessBtn.disabled = true;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new NumberGuessGame();
});
