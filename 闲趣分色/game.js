const CONFIG = {
    dotSize: 40,
    dragSensitivity: 1,
    dampeningFactor: 0.12,
    velocityDecay: 0.88,
    snapExpandFactor: 1.5,
    speedPresets: {
        slow: { dampening: 0.06, decay: 0.92 },
        normal: { dampening: 0.12, decay: 0.88 },
        fast: { dampening: 0.2, decay: 0.82 },
        extreme: { dampening: 0.3, decay: 0.75 }
    },
    baseColors: {
        easy: ['#FF3B30', '#007AFF'],
        normal: ['#FF3B30', '#007AFF', '#FFCC00', '#34C759'],
        hard: ['#E57373', '#EF5350', '#64B5F6', '#42A5F5', '#81C784', '#66BB6A']
    }
};

const DIFFICULTY_CONFIG = {
    easy: {
        dotCount: 6,
        colorCount: 2,
        containerRows: 1,
        containerCols: 2,
        randomLayout: false,
        containerGap: 30
    },
    normal: {
        dotCount: 12,
        colorCount: 4,
        containerRows: 1,
        containerCols: 4,
        randomLayout: true,
        randomRange: 0.15,
        containerGap: 20
    },
    hard: {
        dotCount: 24,
        colorCount: 6,
        containerRows: 2,
        containerCols: 3,
        randomLayout: true,
        randomRange: 0.25,
        shuffleLayout: true,
        containerGap: 15
    }
};

class ColorSortGame {
    constructor() {
        this.difficulty = 'easy';
        this.dots = [];
        this.containers = [];
        this.draggingDot = null;
        this.dragOffset = { x: 0, y: 0 };
        this.velocity = { x: 0, y: 0 };
        this.currentPosition = { x: 0, y: 0 };
        this.targetPosition = { x: 0, y: 0 };
        this.animationId = null;
        this.isPaused = false;
        this.currentSpeedPreset = 'normal';
        this.customDampening = 0.12;
        
        this.initElements();
        this.initEventListeners();
        this.initGame();
    }

    initElements() {
        this.containersArea = document.getElementById('containersArea');
        this.dotsArea = document.getElementById('dotsArea');
        this.gameOverlay = document.getElementById('gameOverlay');
        this.restartBtn = document.getElementById('restartBtn');
        this.continueBtn = document.getElementById('continueBtn');
        this.difficultyBtns = document.querySelectorAll('.difficulty-btn');
        this.speedBtns = document.querySelectorAll('.speed-btn');
        this.speedSlider = document.getElementById('speedSlider');
        this.speedValue = document.getElementById('speedValue');
        this.pauseBtn = document.getElementById('pauseBtn');
    }

    initEventListeners() {
        this.difficultyBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.difficultyBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.difficulty = btn.dataset.difficulty;
                this.initGame();
            });
        });

        this.speedBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.speedBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.setSpeedPreset(btn.dataset.speed);
            });
        });

        this.speedSlider.addEventListener('input', (e) => {
            this.setCustomSpeed(parseFloat(e.target.value));
        });

        this.pauseBtn.addEventListener('click', () => {
            this.togglePause();
        });

        this.restartBtn.addEventListener('click', () => this.initGame());
        this.continueBtn.addEventListener('click', () => {
            this.gameOverlay.classList.remove('show');
            this.initGame();
        });

        this.dotsArea.addEventListener('mousedown', (e) => this.handleDragStart(e));
        this.dotsArea.addEventListener('mousemove', (e) => this.handleDragMove(e));
        this.dotsArea.addEventListener('mouseup', () => this.handleDragEnd());
        this.dotsArea.addEventListener('mouseleave', () => this.handleDragEnd());

        this.dotsArea.addEventListener('touchstart', (e) => this.handleDragStart(e), { passive: false });
        this.dotsArea.addEventListener('touchmove', (e) => this.handleDragMove(e), { passive: false });
        this.dotsArea.addEventListener('touchend', () => this.handleDragEnd());
    }

    setSpeedPreset(preset) {
        this.currentSpeedPreset = preset;
        const config = CONFIG.speedPresets[preset];
        this.customDampening = config.dampening;
        this.speedSlider.value = config.dampening;
        this.speedValue.textContent = config.dampening.toFixed(2);
    }

    setCustomSpeed(value) {
        this.customDampening = value;
        this.speedValue.textContent = value.toFixed(2);
        this.speedBtns.forEach(b => b.classList.remove('active'));
    }

    togglePause() {
        this.isPaused = !this.isPaused;
        if (this.isPaused) {
            this.pauseBtn.textContent = '▶ 继续';
            this.pauseBtn.classList.add('paused');
            this.dotsArea.style.pointerEvents = 'none';
            this.dotsArea.style.opacity = '0.5';
        } else {
            this.pauseBtn.textContent = '⏸ 暂停';
            this.pauseBtn.classList.remove('paused');
            this.dotsArea.style.pointerEvents = 'auto';
            this.dotsArea.style.opacity = '1';
        }
    }

    initGame() {
        this.dots = [];
        this.containers = [];
        this.draggingDot = null;
        this.containersArea.innerHTML = '';
        this.dotsArea.innerHTML = '';
        this.gameOverlay.classList.remove('show');
        
        if (this.isPaused) {
            this.togglePause();
        }

        this.generateContainers();
        this.generateDots();
    }

    generateContainers() {
        const config = DIFFICULTY_CONFIG[this.difficulty];
        const colors = CONFIG.baseColors[this.difficulty].slice(0, config.colorCount);
        
        let rows = config.containerRows;
        let cols = config.containerCols;
        
        if (config.shuffleLayout) {
            const layouts = [[2, 3], [3, 2], [1, 6]];
            const layout = layouts[Math.floor(Math.random() * layouts.length)];
            rows = layout[0];
            cols = layout[1];
        }

        colors.forEach((color, index) => {
            const container = document.createElement('div');
            container.className = 'color-container';
            container.style.backgroundColor = color;
            container.dataset.color = color;
            
            if (config.randomLayout) {
                const offset = (Math.random() - 0.5) * config.randomRange * 100;
                container.style.transform = `translateX(${offset}px)`;
            }

            for (let i = 0; i < 9; i++) {
                const miniDot = document.createElement('div');
                miniDot.className = 'mini-dot';
                container.appendChild(miniDot);
            }

            this.containersArea.appendChild(container);
            this.containers.push({
                element: container,
                color: color,
                dots: []
            });
        });
    }

    generateDots() {
        const config = DIFFICULTY_CONFIG[this.difficulty];
        const colors = CONFIG.baseColors[this.difficulty].slice(0, config.colorCount);
        const dotsPerColor = Math.ceil(config.dotCount / colors.length);
        const areaRect = this.dotsArea.getBoundingClientRect();
        const padding = CONFIG.dotSize;

        for (let i = 0; i < config.dotCount; i++) {
            const color = colors[i % colors.length];
            const dot = this.createDot(color);
            
            let x, y;
            let attempts = 0;
            do {
                x = padding + Math.random() * (areaRect.width - padding * 2 - CONFIG.dotSize);
                y = padding + Math.random() * (areaRect.height - padding * 2 - CONFIG.dotSize);
                attempts++;
            } while (this.isOverlapping(x, y) && attempts < 50);

            dot.style.left = `${x}px`;
            dot.style.top = `${y}px`;
            
            this.dotsArea.appendChild(dot);
            this.dots.push({
                element: dot,
                color: color,
                x: x,
                y: y,
                container: null
            });
        }
    }

    createDot(color) {
        const dot = document.createElement('div');
        dot.className = 'dot';
        dot.style.width = `${CONFIG.dotSize}px`;
        dot.style.height = `${CONFIG.dotSize}px`;
        dot.style.backgroundColor = color;
        dot.style.boxShadow = `0 4px 15px ${color}80`;
        return dot;
    }

    isOverlapping(x, y) {
        for (const dot of this.dots) {
            const dx = x - dot.x;
            const dy = y - dot.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance < CONFIG.dotSize * 1.2) {
                return true;
            }
        }
        return false;
    }

    handleDragStart(e) {
        e.preventDefault();
        const target = e.target;
        if (!target.classList.contains('dot')) return;

        const dotData = this.dots.find(d => d.element === target);
        if (!dotData) return;

        this.draggingDot = dotData;
        target.classList.add('dragging');

        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        const rect = target.getBoundingClientRect();

        this.dragOffset.x = clientX - rect.left;
        this.dragOffset.y = clientY - rect.top;
        this.currentPosition.x = dotData.x;
        this.currentPosition.y = dotData.y;
        this.targetPosition.x = dotData.x;
        this.targetPosition.y = dotData.y;
        this.velocity.x = 0;
        this.velocity.y = 0;

        if (dotData.container) {
            const container = this.containers.find(c => c === dotData.container);
            if (container) {
                container.dots = container.dots.filter(d => d !== dotData);
            }
            dotData.container = null;
            this.dotsArea.appendChild(target);
        }
    }

    handleDragMove(e) {
        if (!this.draggingDot) return;
        e.preventDefault();

        const clientX = e.touches ? e.touches[0].clientX : e.clientX;
        const clientY = e.touches ? e.touches[0].clientY : e.clientY;
        const areaRect = this.dotsArea.getBoundingClientRect();

        this.targetPosition.x = clientX - areaRect.left - this.dragOffset.x;
        this.targetPosition.y = clientY - areaRect.top - this.dragOffset.y;

        if (!this.animationId) {
            this.smoothDrag();
        }

        this.checkContainerHighlight();
    }

    smoothDrag() {
        const currentDecay = this.getDecayFromDampening(this.customDampening);
        this.velocity.x += (this.targetPosition.x - this.currentPosition.x) * this.customDampening;
        this.velocity.y += (this.targetPosition.y - this.currentPosition.y) * this.customDampening;
        this.velocity.x *= currentDecay;
        this.velocity.y *= currentDecay;

        this.currentPosition.x += this.velocity.x;
        this.currentPosition.y += this.velocity.y;

        this.draggingDot.x = this.currentPosition.x;
        this.draggingDot.y = this.currentPosition.y;
        this.draggingDot.element.style.left = `${this.currentPosition.x}px`;
        this.draggingDot.element.style.top = `${this.currentPosition.y}px`;

        if (Math.abs(this.velocity.x) > 0.05 || Math.abs(this.velocity.y) > 0.05 ||
            Math.abs(this.targetPosition.x - this.currentPosition.x) > 0.05 ||
            Math.abs(this.targetPosition.y - this.currentPosition.y) > 0.05) {
            this.animationId = requestAnimationFrame(() => this.smoothDrag());
        } else {
            this.animationId = null;
        }
    }

    getDecayFromDampening(dampening) {
        if (dampening <= 0.06) return 0.92;
        if (dampening <= 0.12) return 0.88;
        if (dampening <= 0.2) return 0.82;
        return 0.75;
    }

    handleDragEnd() {
        if (!this.draggingDot) return;

        this.draggingDot.element.classList.remove('dragging');
        this.containers.forEach(c => c.element.classList.remove('highlight'));

        const matchingContainer = this.findMatchingContainer();
        if (matchingContainer && matchingContainer.color === this.draggingDot.color) {
            this.placeDotInContainer(this.draggingDot, matchingContainer);
        }

        this.draggingDot = null;
        this.animationId = null;

        this.checkWinCondition();
    }

    checkContainerHighlight() {
        const dotRect = this.draggingDot.element.getBoundingClientRect();
        const dotCenterX = dotRect.left + dotRect.width / 2;
        const dotCenterY = dotRect.top + dotRect.height / 2;

        this.containers.forEach(container => {
            const containerRect = container.element.getBoundingClientRect();
            const expand = 30 * CONFIG.snapExpandFactor;
            const isOver = dotCenterX >= containerRect.left - expand &&
                           dotCenterX <= containerRect.right + expand &&
                           dotCenterY >= containerRect.top - expand &&
                           dotCenterY <= containerRect.bottom + expand;
            
            if (isOver && container.color === this.draggingDot.color) {
                container.element.classList.add('highlight');
            } else {
                container.element.classList.remove('highlight');
            }
        });
    }

    findMatchingContainer() {
        const dotRect = this.draggingDot.element.getBoundingClientRect();
        const dotCenterX = dotRect.left + dotRect.width / 2;
        const dotCenterY = dotRect.top + dotRect.height / 2;

        for (const container of this.containers) {
            const containerRect = container.element.getBoundingClientRect();
            const expand = 30 * CONFIG.snapExpandFactor;
            if (dotCenterX >= containerRect.left - expand &&
                dotCenterX <= containerRect.right + expand &&
                dotCenterY >= containerRect.top - expand &&
                dotCenterY <= containerRect.bottom + expand) {
                return container;
            }
        }
        return null;
    }

    placeDotInContainer(dotData, container) {
        const miniDots = container.element.querySelectorAll('.mini-dot');
        const emptyMiniDot = Array.from(miniDots).find(md => !md.classList.contains('occupied'));
        
        if (emptyMiniDot) {
            emptyMiniDot.classList.add('occupied');
            emptyMiniDot.style.background = dotData.color;
            dotData.element.style.display = 'none';
            dotData.container = container;
            container.dots.push(dotData);
            
            emptyMiniDot.style.cursor = 'pointer';
            emptyMiniDot.title = '点击取出';
            const clickHandler = (e) => this.restoreDotFromContainer(e, dotData, container, emptyMiniDot, clickHandler);
            emptyMiniDot.addEventListener('click', clickHandler);
        }
    }

    restoreDotFromContainer(e, dotData, container, miniDot, clickHandler) {
        e.stopPropagation();
        miniDot.removeEventListener('click', clickHandler);
        miniDot.classList.remove('occupied');
        miniDot.style.background = 'rgba(255, 255, 255, 0.5)';
        miniDot.style.cursor = 'default';
        miniDot.title = '';
        
        container.dots = container.dots.filter(d => d !== dotData);
        dotData.container = null;
        dotData.element.style.display = 'block';
        
        const areaRect = this.dotsArea.getBoundingClientRect();
        const x = 50 + Math.random() * (areaRect.width - 150);
        const y = 50 + Math.random() * (areaRect.height - 150);
        dotData.x = x;
        dotData.y = y;
        dotData.element.style.left = `${x}px`;
        dotData.element.style.top = `${y}px`;
        
        this.dotsArea.appendChild(dotData.element);
    }

    checkWinCondition() {
        const allPlaced = this.dots.every(dot => dot.container !== null);
        if (allPlaced) {
            setTimeout(() => {
                this.gameOverlay.classList.add('show');
            }, 300);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new ColorSortGame();
});
