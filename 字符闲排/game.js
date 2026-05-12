class CharSortGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.difficultySelect = document.getElementById('difficulty');
        this.gameModeSelect = document.getElementById('gameMode');
        this.gameModeGroup = document.getElementById('gameModeGroup');
        this.sortModeSelect = document.getElementById('sortMode');
        this.sortModeGroup = document.getElementById('sortModeGroup');
        this.newGameBtn = document.getElementById('newGameBtn');
        this.playAgainBtn = document.getElementById('playAgainBtn');
        this.clearHistoryBtn = document.getElementById('clearHistoryBtn');
        this.targetDisplay = document.getElementById('targetDisplay');
        this.progressCount = document.getElementById('progressCount');
        this.totalCount = document.getElementById('totalCount');
        this.successMessage = document.getElementById('successMessage');
        this.progressHistory = document.getElementById('progressHistory');

        this.numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
        this.allLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 
                          'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
        this.vowels = ['A', 'E', 'I', 'O', 'U'];
        this.consonants = ['B', 'C', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 
                          'N', 'P', 'Q', 'R', 'S', 'T', 'V', 'W', 'X', 'Y', 'Z'];

        this.easyColors = ['easy-color-1', 'easy-color-2'];
        this.normalColors = ['normal-color-1', 'normal-color-2', 'normal-color-3', 'normal-color-4'];
        this.hardColors = ['hard-color-1', 'hard-color-2', 'hard-color-3', 'hard-color-4', 'hard-color-5', 'hard-color-6'];

        this.currentChars = [];
        this.targetOrder = [];
        this.currentIndex = 0;
        this.currentDifficulty = 'easy';
        this.historyData = [];
        this.STORAGE_KEY = 'charSortGameHistory';

        this.init();
    }

    init() {
        this.loadHistory();
        this.bindEvents();
        this.updateOptions();
        this.renderHistory();
        this.startNewGame();
    }

    bindEvents() {
        this.newGameBtn.addEventListener('click', () => this.startNewGame());
        this.playAgainBtn.addEventListener('click', () => {
            this.hideSuccessMessage();
            this.startNewGame();
        });
        this.clearHistoryBtn.addEventListener('click', () => this.clearHistory());
        this.difficultySelect.addEventListener('change', () => {
            this.updateOptions();
            this.startNewGame();
        });
        this.gameModeSelect.addEventListener('change', () => {
            this.updateSortModeOptions();
            this.startNewGame();
        });
        this.sortModeSelect.addEventListener('change', () => {
            this.startNewGame();
        });
    }

    loadHistory() {
        try {
            const stored = localStorage.getItem(this.STORAGE_KEY);
            if (stored) {
                this.historyData = JSON.parse(stored);
            }
        } catch (e) {
            console.error('加载历史记录失败:', e);
            this.historyData = [];
        }
    }

    saveHistory() {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.historyData));
        } catch (e) {
            console.error('保存历史记录失败:', e);
        }
    }

    addHistoryRecord() {
        const record = {
            id: Date.now(),
            difficulty: this.currentDifficulty,
            gameMode: this.getCurrentGameMode(),
            sortMode: this.sortModeSelect.value,
            sortTypeText: this.getSortTypeText(),
            completedCount: this.targetOrder.length,
            completedAt: new Date().toISOString()
        };
        this.historyData.unshift(record);
        this.saveHistory();
        this.renderHistory();
    }

    getCurrentGameMode() {
        if (this.currentDifficulty === 'easy') {
            return 'numbers';
        } else if (this.currentDifficulty === 'normal') {
            return this.gameModeSelect.value;
        } else if (this.currentDifficulty === 'hard') {
            return 'mixed';
        }
        return 'numbers';
    }

    getSortTypeText() {
        const difficultyTexts = {
            'easy': '简单',
            'normal': '普通',
            'hard': '困难'
        };

        const sortModeTexts = {
            'asc': '正序',
            'desc': '倒序',
            'oddEven': '奇偶分开',
            'vowelConsonant': '元音辅音',
            'numberFirst': '先数字后字母',
            'letterFirst': '先字母后数字',
            'interleave': '数字字母交替'
        };

        const gameModeTexts = {
            'numbers': '数字',
            'letters': '字母',
            'mixed': '混合'
        };

        const difficulty = difficultyTexts[this.currentDifficulty];
        const gameMode = gameModeTexts[this.getCurrentGameMode()];
        const sortMode = sortModeTexts[this.sortModeSelect.value] || this.sortModeSelect.value;

        return `${difficulty} · ${gameMode} · ${sortMode}`;
    }

    clearHistory() {
        if (confirm('确定要清空所有闯关记录吗？')) {
            this.historyData = [];
            this.saveHistory();
            this.renderHistory();
        }
    }

    renderHistory() {
        if (this.historyData.length === 0) {
            this.progressHistory.innerHTML = '<p class="no-history">暂无闯关记录</p>';
            return;
        }

        let html = '';
        this.historyData.forEach((record, index) => {
            html += this.createHistoryItemHTML(record, index + 1);
        });

        this.progressHistory.innerHTML = html;
    }

    createHistoryItemHTML(record, index) {
        const date = new Date(record.completedAt);
        const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;

        return `
            <div class="history-item">
                <div class="history-info">
                    <span class="history-difficulty ${record.difficulty}">${this.getDifficultyText(record.difficulty)}</span>
                    <p class="history-sort-type">${record.sortTypeText}</p>
                </div>
                <div class="history-meta">
                    <div class="history-date">${dateStr}</div>
                    <span class="history-index">#${index}</span>
                </div>
            </div>
        `;
    }

    getDifficultyText(difficulty) {
        const texts = {
            'easy': '简单',
            'normal': '普通',
            'hard': '困难'
        };
        return texts[difficulty] || difficulty;
    }

    updateOptions() {
        const difficulty = this.difficultySelect.value;
        this.currentDifficulty = difficulty;

        if (difficulty === 'easy') {
            this.gameModeGroup.style.display = 'none';
            this.sortModeGroup.style.display = 'flex';
            this.gameModeSelect.innerHTML = '';
            this.sortModeSelect.innerHTML = '';
            
            const option1 = document.createElement('option');
            option1.value = 'asc';
            option1.textContent = '正序 (1-5)';
            const option2 = document.createElement('option');
            option2.value = 'desc';
            option2.textContent = '倒序 (5-1)';
            
            this.sortModeSelect.appendChild(option1);
            this.sortModeSelect.appendChild(option2);
        } else if (difficulty === 'normal') {
            this.gameModeGroup.style.display = 'flex';
            this.sortModeGroup.style.display = 'flex';
            this.updateGameModeOptions();
        } else if (difficulty === 'hard') {
            this.gameModeGroup.style.display = 'none';
            this.sortModeGroup.style.display = 'flex';
            this.gameModeSelect.innerHTML = '';
            this.sortModeSelect.innerHTML = '';
            
            const option1 = document.createElement('option');
            option1.value = 'numberFirst';
            option1.textContent = '先数字后字母';
            const option2 = document.createElement('option');
            option2.value = 'letterFirst';
            option2.textContent = '先字母后数字';
            const option3 = document.createElement('option');
            option3.value = 'interleave';
            option3.textContent = '数字字母交替';
            
            this.sortModeSelect.appendChild(option1);
            this.sortModeSelect.appendChild(option2);
            this.sortModeSelect.appendChild(option3);
        }
    }

    updateGameModeOptions() {
        this.gameModeSelect.innerHTML = '';
        const option1 = document.createElement('option');
        option1.value = 'numbers';
        option1.textContent = '数字排序';
        const option2 = document.createElement('option');
        option2.value = 'letters';
        option2.textContent = '字母排序';
        
        this.gameModeSelect.appendChild(option1);
        this.gameModeSelect.appendChild(option2);
        this.updateSortModeOptions();
    }

    updateSortModeOptions() {
        const gameMode = this.gameModeSelect.value;
        this.sortModeSelect.innerHTML = '';
        let options = [];

        if (gameMode === 'numbers') {
            options = [
                { value: 'asc', text: '正序 (1-7)' },
                { value: 'desc', text: '倒序 (7-1)' },
                { value: 'oddEven', text: '奇偶分开' }
            ];
        } else if (gameMode === 'letters') {
            options = [
                { value: 'asc', text: '正序 (A-G)' },
                { value: 'desc', text: '倒序 (G-A)' },
                { value: 'vowelConsonant', text: '元音辅音' }
            ];
        }

        options.forEach(opt => {
            const option = document.createElement('option');
            option.value = opt.value;
            option.textContent = opt.text;
            this.sortModeSelect.appendChild(option);
        });
    }

    startNewGame() {
        this.currentIndex = 0;
        this.generateChars();
        this.renderCanvas();
        this.updateDisplay();
    }

    generateChars() {
        const difficulty = this.currentDifficulty;
        let sourcePool = [];

        if (difficulty === 'easy') {
            sourcePool = this.numbers.slice(0, 5);
            const sortMode = this.sortModeSelect.value;
            if (sortMode === 'asc') {
                this.targetOrder = [...sourcePool];
            } else {
                this.targetOrder = [...sourcePool].reverse();
            }
        } else if (difficulty === 'normal') {
            const gameMode = this.gameModeSelect.value;
            const sortMode = this.sortModeSelect.value;
            
            if (gameMode === 'numbers') {
                sourcePool = this.numbers.slice(0, 7);
                this.targetOrder = this.getTargetOrder('numbers', sortMode, sourcePool);
            } else if (gameMode === 'letters') {
                sourcePool = this.allLetters.slice(0, 7);
                this.targetOrder = this.getTargetOrder('letters', sortMode, sourcePool);
            }
        } else if (difficulty === 'hard') {
            const sortMode = this.sortModeSelect.value;
            sourcePool = [...this.numbers, ...this.allLetters.slice(0, 9)];
            this.targetOrder = this.getTargetOrder('mixed', sortMode);
        }

        this.currentChars = [...sourcePool];
        this.shuffleArray(this.currentChars);
    }

    getTargetOrder(gameMode, sortMode, sourcePool) {
        let target = [];

        if (gameMode === 'numbers') {
            if (sortMode === 'asc') {
                target = [...sourcePool];
            } else if (sortMode === 'desc') {
                target = [...sourcePool].reverse();
            } else if (sortMode === 'oddEven') {
                const odds = sourcePool.filter(n => parseInt(n) % 2 === 1);
                const evens = sourcePool.filter(n => parseInt(n) % 2 === 0);
                target = [...odds, ...evens];
            }
        } else if (gameMode === 'letters') {
            if (sortMode === 'asc') {
                target = [...sourcePool];
            } else if (sortMode === 'desc') {
                target = [...sourcePool].reverse();
            } else if (sortMode === 'vowelConsonant') {
                const vowelsInPool = sourcePool.filter(c => this.vowels.includes(c));
                const consonantsInPool = sourcePool.filter(c => this.consonants.includes(c));
                target = [...vowelsInPool, ...consonantsInPool];
            }
        } else if (gameMode === 'mixed') {
            const nums = [...this.numbers];
            const lets = [...this.allLetters.slice(0, 9)];
            
            if (sortMode === 'numberFirst') {
                target = [...nums, ...lets];
            } else if (sortMode === 'letterFirst') {
                target = [...lets, ...nums];
            } else if (sortMode === 'interleave') {
                target = [];
                const maxLen = Math.max(nums.length, lets.length);
                for (let i = 0; i < maxLen; i++) {
                    if (nums[i]) target.push(nums[i]);
                    if (lets[i]) target.push(lets[i]);
                }
            }
        }

        return target;
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    renderCanvas() {
        this.canvas.innerHTML = '';
        this.canvas.className = 'game-canvas ' + this.currentDifficulty;

        this.currentChars.forEach((char, index) => {
            const item = document.createElement('div');
            item.className = 'char-item';
            item.textContent = char;
            item.dataset.char = char;
            item.dataset.index = index;

            this.applyStyleAndEffects(item, index);

            item.addEventListener('click', (e) => this.handleCharClick(e, char, item));

            this.canvas.appendChild(item);
        });
    }

    applyStyleAndEffects(element, index) {
        const difficulty = this.currentDifficulty;

        if (difficulty === 'easy') {
            const colorIndex = index % this.easyColors.length;
            element.classList.add(this.easyColors[colorIndex]);
        } else if (difficulty === 'normal') {
            const colorIndex = index % this.normalColors.length;
            element.classList.add(this.normalColors[colorIndex]);
        } else if (difficulty === 'hard') {
            const colorIndex = index % this.hardColors.length;
            element.classList.add(this.hardColors[colorIndex]);

            if (Math.random() > 0.6) {
                element.classList.add('hard-wiggle');
            }
            if (Math.random() > 0.7) {
                element.classList.add('hard-flicker');
            }
        }
    }

    handleCharClick(e, char, element) {
        if (element.classList.contains('completed')) {
            return;
        }

        if (char === this.targetOrder[this.currentIndex]) {
            this.handleCorrectClick(element);
        } else {
            this.handleWrongClick(element);
        }
    }

    handleCorrectClick(element) {
        element.classList.add('completed');
        element.classList.remove('hard-wiggle', 'hard-flicker');
        this.currentIndex++;
        this.updateDisplay();

        if (this.currentIndex === this.targetOrder.length) {
            this.addHistoryRecord();
            this.showSuccessMessage();
        }
    }

    handleWrongClick(element) {
        element.classList.add('wrong');
        setTimeout(() => {
            element.classList.remove('wrong');
        }, 500);
    }

    updateDisplay() {
        this.targetDisplay.textContent = this.targetOrder.join(' → ');
        this.progressCount.textContent = this.currentIndex;
        this.totalCount.textContent = this.targetOrder.length;
    }

    showSuccessMessage() {
        this.successMessage.classList.add('show');
    }

    hideSuccessMessage() {
        this.successMessage.classList.remove('show');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new CharSortGame();
});
