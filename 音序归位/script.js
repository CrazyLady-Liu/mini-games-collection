class MusicSortGame {
    constructor() {
        this.currentLevel = 1;
        this.moves = 0;
        this.hints = 3;
        this.notes = [];
        this.draggedNote = null;
        this.dragStartX = 0;
        this.dragOffsetX = 0;
        this.notesContainer = document.getElementById('notesContainer');
        this.levelDisplay = document.querySelector('.level');
        this.movesDisplay = document.querySelector('.moves');
        this.hintsDisplay = document.querySelector('.hints');
        this.winModal = document.getElementById('winModal');
        this.winLevel = document.getElementById('winLevel');
        this.winMoves = document.getElementById('winMoves');
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.startLevel();
    }

    setupEventListeners() {
        document.getElementById('btnRetry').addEventListener('click', () => this.startLevel());
        document.getElementById('btnHint').addEventListener('click', () => this.showHint());
        document.getElementById('btnCheck').addEventListener('click', () => this.checkWin());
        document.getElementById('btnNext').addEventListener('click', () => this.nextLevel());
    }

    getNoteCount() {
        return Math.min(5 + Math.floor((this.currentLevel - 1) / 2), 7);
    }

    generateShuffledNotes() {
        const count = this.getNoteCount();
        const notes = [];
        for (let i = 1; i <= count; i++) {
            notes.push(i);
        }
        
        let shuffled;
        let attempts = 0;
        do {
            shuffled = this.fisherYatesShuffle([...notes]);
            attempts++;
        } while (this.isSorted(shuffled) && attempts < 100);
        
        return shuffled;
    }

    fisherYatesShuffle(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    isSorted(array) {
        return array.every((value, index) => value === index + 1);
    }

    startLevel() {
        this.moves = 0;
        this.hints = Math.max(3, 5 - Math.floor(this.currentLevel / 3));
        this.notes = this.generateShuffledNotes();
        this.updateDisplays();
        this.renderNotes();
        this.winModal.classList.remove('show');
    }

    nextLevel() {
        this.currentLevel++;
        this.startLevel();
    }

    updateDisplays() {
        this.levelDisplay.textContent = this.currentLevel;
        this.movesDisplay.textContent = this.moves;
        this.hintsDisplay.textContent = this.hints;
    }

    renderNotes() {
        this.notesContainer.innerHTML = '';
        this.notes.forEach((value, index) => {
            const note = document.createElement('div');
            note.className = `note note-${value}`;
            note.textContent = value;
            note.dataset.index = index;
            note.dataset.value = value;
            
            note.addEventListener('mousedown', (e) => this.startDrag(e, note));
            note.addEventListener('touchstart', (e) => this.startDrag(e, note));
            
            this.notesContainer.appendChild(note);
        });
        
        document.addEventListener('mousemove', (e) => this.onDrag(e));
        document.addEventListener('mouseup', () => this.stopDrag());
        document.addEventListener('touchmove', (e) => this.onDrag(e));
        document.addEventListener('touchend', () => this.stopDrag());
    }

    startDrag(e, note) {
        e.preventDefault();
        this.draggedNote = note;
        note.classList.add('dragging');
        
        const clientX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
        this.dragStartX = clientX;
        this.dragOffsetX = clientX - note.getBoundingClientRect().left;
    }

    onDrag(e) {
        if (!this.draggedNote) return;
        
        e.preventDefault();
        const clientX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
        const trackRect = this.notesContainer.getBoundingClientRect();
        const noteWidth = this.draggedNote.offsetWidth;
        
        let newLeft = clientX - trackRect.left - this.dragOffsetX;
        newLeft = Math.max(0, Math.min(newLeft, trackRect.width - noteWidth));
        
        this.draggedNote.style.position = 'absolute';
        this.draggedNote.style.left = `${newLeft}px`;
        
        this.updateSwapIndicator(newLeft);
    }

    updateSwapIndicator(currentX) {
        const noteElements = this.notesContainer.querySelectorAll('.note:not(.dragging)');
        let closestIndex = null;
        let minDistance = Infinity;
        
        noteElements.forEach((note) => {
            const rect = note.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const draggedCenterX = currentX + this.draggedNote.offsetWidth / 2;
            const distance = Math.abs(draggedCenterX - centerX);
            
            if (distance < minDistance && distance < this.draggedNote.offsetWidth) {
                minDistance = distance;
                closestIndex = parseInt(note.dataset.index);
            }
        });
        
        noteElements.forEach((note) => {
            note.style.transform = parseInt(note.dataset.index) === closestIndex ? 'scale(0.9)' : 'scale(1)';
        });
        
        this.closestSwapIndex = closestIndex;
    }

    stopDrag() {
        if (!this.draggedNote) return;
        
        const draggedIndex = parseInt(this.draggedNote.dataset.index);
        
        if (this.closestSwapIndex !== null && this.closestSwapIndex !== draggedIndex) {
            this.swapNotes(draggedIndex, this.closestSwapIndex);
            this.moves++;
            this.updateDisplays();
            this.checkWin();
        }
        
        this.draggedNote.classList.remove('dragging');
        this.draggedNote.style.position = '';
        this.draggedNote.style.left = '';
        this.draggedNote = null;
        this.closestSwapIndex = null;
        
        this.notesContainer.querySelectorAll('.note').forEach(note => {
            note.style.transform = 'scale(1)';
        });
    }

    swapNotes(index1, index2) {
        [this.notes[index1], this.notes[index2]] = [this.notes[index2], this.notes[index1]];
        this.renderNotes();
    }

    checkWin() {
        const isSorted = this.notes.every((value, index) => value === index + 1);
        
        if (isSorted) {
            this.winLevel.textContent = this.currentLevel;
            this.winMoves.textContent = this.moves;
            setTimeout(() => {
                this.winModal.classList.add('show');
            }, 300);
        } else {
            this.updateCorrectNotes();
        }
    }

    updateCorrectNotes() {
        const noteElements = this.notesContainer.querySelectorAll('.note');
        noteElements.forEach((note, index) => {
            const value = parseInt(note.dataset.value);
            if (value === index + 1) {
                note.classList.add('correct');
            } else {
                note.classList.remove('correct');
            }
        });
    }

    showHint() {
        if (this.hints <= 0) {
            this.showToast('提示次数已用完！');
            return;
        }
        
        const incorrectIndices = [];
        this.notes.forEach((value, index) => {
            if (value !== index + 1) {
                incorrectIndices.push(index);
            }
        });
        
        if (incorrectIndices.length >= 2) {
            const [index1, index2] = incorrectIndices.slice(0, 2);
            const noteElements = this.notesContainer.querySelectorAll('.note');
            
            noteElements[index1].style.animation = 'hintPulse 0.5s ease 2';
            noteElements[index2].style.animation = 'hintPulse 0.5s ease 2';
            
            setTimeout(() => {
                noteElements.forEach(note => note.style.animation = '');
            }, 1000);
            
            this.hints--;
            this.updateDisplays();
        }
    }

    showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 2000);
    }
}

let game;

document.addEventListener('DOMContentLoaded', () => {
    game = new MusicSortGame();
    console.log('🎵 音序归位游戏已加载');
    console.log('📋 测试命令：');
    console.log('  - game.swapNotes(0, 1)  - 交换第1和第2个音符');
    console.log('  - game.notes           - 查看当前音符顺序');
    console.log('  - game.checkWin()      - 检查是否通关');
    console.log('  - game.showHint()      - 使用提示');
    console.log('  - game.startLevel()    - 重新开始');
});