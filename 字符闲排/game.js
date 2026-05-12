class CharSortGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.gameModeSelect = document.getElementById('gameMode');
        this.sortModeSelect = document.getElementById('sortMode');
        this.sortModeGroup = document.getElementById('sortModeGroup');
        this.newGameBtn = document.getElementById('newGameBtn');
        this.playAgainBtn = document.getElementById('playAgainBtn');
        this.targetDisplay = document.getElementById('targetDisplay');
        this.progressCount = document.getElementById('progressCount');
        this.totalCount = document.getElementById('totalCount');
        this.successMessage = document.getElementById('successMessage');

        // 完整字符池
        this.numbers = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
        this.allLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 
                          'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'];
        this.vowels = ['A', 'E', 'I', 'O', 'U'];
        this.consonants = ['B', 'C', 'D', 'F', 'G', 'H', 'J', 'K', 'L', 'M', 
                          'N', 'P', 'Q', 'R', 'S', 'T', 'V', 'W', 'X', 'Y', 'Z'];
        
        this.currentChars = [];
        this.targetOrder = [];
        this.currentIndex = 0;

        this.init();
    }

    init() {
        this.bindEvents();
        this.updateSortModeOptions();
        this.startNewGame();
    }

    bindEvents() {
        this.newGameBtn.addEventListener('click', () => this.startNewGame());
        this.playAgainBtn.addEventListener('click', () => {
            this.hideSuccessMessage();
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

    updateSortModeOptions() {
        const gameMode = this.gameModeSelect.value;
        let options = [];

        if (gameMode === 'numbers') {
            options = [
                { value: 'asc', text: '正序 (1-9)' },
                { value: 'desc', text: '倒序 (9-1)' },
                { value: 'oddEven', text: '奇偶分开' }
            ];
        } else if (gameMode === 'letters') {
            options = [
                { value: 'asc', text: '正序 (A-Z)' },
                { value: 'desc', text: '倒序 (Z-A)' },
                { value: 'vowelConsonant', text: '元音辅音' }
            ];
        } else if (gameMode === 'mixed') {
            options = [
                { value: 'numberFirst', text: '先数字后字母' },
                { value: 'letterFirst', text: '先字母后数字' },
                { value: 'interleave', text: '数字字母交替' }
            ];
        }

        this.sortModeSelect.innerHTML = '';
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
        const gameMode = this.gameModeSelect.value;
        const sortMode = this.sortModeSelect.value;

        let sourcePool = [];
        
        if (gameMode === 'numbers') {
            sourcePool = [...this.numbers];
        } else if (gameMode === 'letters') {
            sourcePool = [...this.allLetters];
        } else if (gameMode === 'mixed') {
            sourcePool = [...this.numbers, ...this.allLetters.slice(0, 9)];
        }

        this.currentChars = [...sourcePool];
        this.shuffleArray(this.currentChars);

        this.targetOrder = this.generateTargetOrder(gameMode, sortMode);
    }

    generateTargetOrder(gameMode, sortMode) {
        let target = [];

        if (gameMode === 'numbers') {
            if (sortMode === 'asc') {
                target = [...this.numbers];
            } else if (sortMode === 'desc') {
                target = [...this.numbers].reverse();
            } else if (sortMode === 'oddEven') {
                const odds = this.numbers.filter(n => parseInt(n) % 2 === 1);
                const evens = this.numbers.filter(n => parseInt(n) % 2 === 0);
                target = [...odds, ...evens];
            }
        } else if (gameMode === 'letters') {
            if (sortMode === 'asc') {
                target = [...this.allLetters];
            } else if (sortMode === 'desc') {
                target = [...this.allLetters].reverse();
            } else if (sortMode === 'vowelConsonant') {
                target = [...this.vowels, ...this.consonants];
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
        
        this.currentChars.forEach((char, index) => {
            const item = document.createElement('div');
            item.className = 'char-item';
            item.textContent = char;
            item.dataset.char = char;
            item.dataset.index = index;

            item.addEventListener('click', (e) => this.handleCharClick(e, char, item));

            this.canvas.appendChild(item);
        });
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
        this.currentIndex++;
        this.updateDisplay();

        if (this.currentIndex === this.targetOrder.length) {
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
