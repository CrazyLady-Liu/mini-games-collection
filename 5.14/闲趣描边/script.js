(function() {
    'use strict';
    
    let gameInstance = null;
    
    const LEVELS = [
        {
            type: 'circle',
            params: { cx: 0.5, cy: 0.5, radius: 0.3 },
            name: '圆形',
            difficulty: 1,
            timeLimit: 60,
            starTimes: [20, 35, 50]
        },
        {
            type: 'heart',
            params: { cx: 0.5, cy: 0.45, size: 0.25 },
            name: '爱心',
            difficulty: 2,
            timeLimit: 55,
            starTimes: [25, 40, 50]
        },
        {
            type: 'star',
            params: { cx: 0.5, cy: 0.5, outerRadius: 0.3, innerRadius: 0.15, points: 5 },
            name: '五角星',
            difficulty: 3,
            timeLimit: 50,
            starTimes: [30, 40, 48],
            forceTimed: true
        },
        {
            type: 'diamond',
            params: { cx: 0.5, cy: 0.5, width: 0.5, height: 0.6 },
            name: '菱形',
            difficulty: 2,
            timeLimit: 55,
            starTimes: [20, 35, 50]
        },
        {
            type: 'cloud',
            params: { cx: 0.5, cy: 0.5, width: 0.6, height: 0.35 },
            name: '云朵',
            difficulty: 3,
            timeLimit: 45,
            starTimes: [25, 35, 43],
            forceTimed: true
        }
    ];
    
    const CONFIG = {
        TOLERANCE: 25,
        LINE_WIDTH: 8,
        GLOW_SIZE: 15,
        WIN_PERCENT: 95
    };
    
    class TraceGame {
        constructor(mode = 'normal') {
            console.log('TraceGame constructor called, mode:', mode);
            
            this.mode = mode;
            this.isDrawing = false;
            this.currentLevel = 1;
            this.strokes = [];
            this.currentStroke = [];
            this.outlinePoints = [];
            this.coveredPoints = new Set();
            this.totalOutlineLength = 0;
            this.progress = 0;
            this.isPaused = false;
            this.hasWon = false;
            this.isWinAnimating = false;
            this.canvasWidth = 0;
            this.canvasHeight = 0;
            
            this.winAnimationId = null;
            this.sparkles = [];
            this.winAnimationProgress = 0;
            
            this.isTimedMode = false;
            this.timeRemaining = 0;
            this.timerInterval = null;
            this.startTime = 0;
            this.elapsedTime = 0;
            
            this.outlineCanvas = null;
            this.drawCanvas = null;
            this.outlineCtx = null;
            this.drawCtx = null;
            
            this.init();
        }
        
        init() {
            console.log('TraceGame init called');
            
            try {
                this.outlineCanvas = document.getElementById('outlineCanvas');
                this.drawCanvas = document.getElementById('drawCanvas');
                
                if (!this.outlineCanvas || !this.drawCanvas) {
                    console.error('Canvas elements not found!');
                    return;
                }
                
                this.outlineCtx = this.outlineCanvas.getContext('2d');
                this.drawCtx = this.drawCanvas.getContext('2d');
                
                if (!this.outlineCtx || !this.drawCtx) {
                    console.error('Canvas context not available!');
                    return;
                }
                
                console.log('Canvas elements and contexts ready');
                
                this.setupCanvasSize();
                this.setupEventListeners();
                this.drawLevel();
                
                console.log('TraceGame initialization complete');
            } catch (error) {
                console.error('Error in init:', error);
            }
        }
        
        setupCanvasSize() {
            console.log('setupCanvasSize called');
            
            try {
                const container = this.drawCanvas.parentElement;
                const rect = container.getBoundingClientRect();
                const dpr = window.devicePixelRatio || 1;
                
                console.log('Container rect:', rect.width, 'x', rect.height);
                
                let width = rect.width;
                let height = rect.height;
                
                if (width <= 0 || height <= 0) {
                    width = 600;
                    height = 400;
                    console.log('Using default size:', width, 'x', height);
                }
                
                this.outlineCanvas.width = width * dpr;
                this.outlineCanvas.height = height * dpr;
                this.outlineCanvas.style.width = width + 'px';
                this.outlineCanvas.style.height = height + 'px';
                
                this.drawCanvas.width = width * dpr;
                this.drawCanvas.height = height * dpr;
                this.drawCanvas.style.width = width + 'px';
                this.drawCanvas.style.height = height + 'px';
                
                this.outlineCtx.setTransform(1, 0, 0, 1, 0, 0);
                this.drawCtx.setTransform(1, 0, 0, 1, 0, 0);
                this.outlineCtx.scale(dpr, dpr);
                this.drawCtx.scale(dpr, dpr);
                
                this.canvasWidth = width;
                this.canvasHeight = height;
                
                console.log('Canvas size set:', width, 'x', height);
            } catch (error) {
                console.error('Error in setupCanvasSize:', error);
            }
        }
        
        drawLevel() {
            console.log('drawLevel called, level:', this.currentLevel);
            
            try {
                this.stopTimer();
                
                const level = LEVELS[(this.currentLevel - 1) % LEVELS.length];
                
                this.outlinePoints = [];
                this.coveredPoints = new Set();
                this.strokes = [];
                this.progress = 0;
                this.hasWon = false;
                this.elapsedTime = 0;
                
                this.isTimedMode = (this.mode === 'timed') || (level.forceTimed === true);
                
                this.updateTimerUI();
                
                this.generateOutlinePoints(level);
                this.drawOutline();
                this.updateProgressUI();
                
                const levelNumberEl = document.getElementById('levelNumber');
                if (levelNumberEl) {
                    levelNumberEl.textContent = this.currentLevel;
                }
                
                if (this.isTimedMode) {
                    this.startTimer(level.timeLimit);
                }
                
                console.log('Level drawn, outline points:', this.outlinePoints.length, 'timedMode:', this.isTimedMode);
            } catch (error) {
                console.error('Error in drawLevel:', error);
            }
        }
        
        startTimer(seconds) {
            this.stopTimer();
            this.timeRemaining = seconds;
            this.startTime = Date.now();
            this.updateTimerUI();
            
            this.timerInterval = setInterval(() => {
                if (this.isPaused || this.hasWon || this.isWinAnimating) {
                    return;
                }
                
                this.elapsedTime = Math.floor((Date.now() - this.startTime) / 1000);
                this.timeRemaining = Math.max(0, seconds - this.elapsedTime);
                this.updateTimerUI();
                
                if (this.timeRemaining <= 0) {
                    this.timeUp();
                }
            }, 100);
        }
        
        stopTimer() {
            if (this.timerInterval) {
                clearInterval(this.timerInterval);
                this.timerInterval = null;
            }
        }
        
        updateTimerUI() {
            const timerDisplay = document.getElementById('timerDisplay');
            const timerLabel = document.getElementById('timerLabel');
            const toleranceHint = document.getElementById('toleranceHint');
            
            if (!timerDisplay || !timerLabel) return;
            
            if (this.isTimedMode) {
                timerDisplay.style.display = 'flex';
                if (toleranceHint) {
                    toleranceHint.style.display = 'none';
                }
                
                timerLabel.textContent = this.timeRemaining;
                
                timerDisplay.classList.remove('warning', 'danger');
                if (this.timeRemaining <= 10) {
                    timerDisplay.classList.add('danger');
                } else if (this.timeRemaining <= 20) {
                    timerDisplay.classList.add('warning');
                }
            } else {
                timerDisplay.style.display = 'none';
                if (toleranceHint) {
                    toleranceHint.style.display = 'flex';
                }
            }
        }
        
        timeUp() {
            this.stopTimer();
            this.isPaused = true;
            
            alert('时间到！再试一次吧！');
            this.restartLevel();
        }
        
        generateOutlinePoints(level) {
            const w = this.canvasWidth;
            const h = this.canvasHeight;
            
            switch(level.type) {
                case 'circle':
                    this.generateCirclePoints(level.params, w, h);
                    break;
                case 'heart':
                    this.generateHeartPoints(level.params, w, h);
                    break;
                case 'star':
                    this.generateStarPoints(level.params, w, h);
                    break;
                case 'diamond':
                    this.generateDiamondPoints(level.params, w, h);
                    break;
                case 'cloud':
                    this.generateCloudPoints(level.params, w, h);
                    break;
            }
            
            this.totalOutlineLength = this.outlinePoints.length;
        }
        
        generateCirclePoints(params, w, h) {
            const cx = params.cx * w;
            const cy = params.cy * h;
            const r = params.radius * Math.min(w, h);
            const step = Math.PI / 180;
            
            for (let angle = 0; angle < 2 * Math.PI; angle += step) {
                this.outlinePoints.push({
                    x: cx + r * Math.cos(angle),
                    y: cy + r * Math.sin(angle)
                });
            }
        }
        
        generateHeartPoints(params, w, h) {
            const cx = params.cx * w;
            const cy = params.cy * h;
            const size = params.size * Math.min(w, h);
            const step = Math.PI / 180;
            
            for (let t = 0; t < 2 * Math.PI; t += step) {
                const x = 16 * Math.pow(Math.sin(t), 3);
                const y = -(13 * Math.cos(t) - 5 * Math.cos(2 * t) - 2 * Math.cos(3 * t) - Math.cos(4 * t));
                this.outlinePoints.push({
                    x: cx + x * size / 16,
                    y: cy + y * size / 16
                });
            }
        }
        
        generateStarPoints(params, w, h) {
            const cx = params.cx * w;
            const cy = params.cy * h;
            const outerR = params.outerRadius * Math.min(w, h);
            const innerR = params.innerRadius * Math.min(w, h);
            const points = params.points;
            const step = Math.PI / points;
            
            for (let i = 0; i < points * 2; i++) {
                const angle = (i * step) - Math.PI / 2;
                const r = i % 2 === 0 ? outerR : innerR;
                const startAngle = angle;
                const endAngle = angle + step;
                
                for (let t = startAngle; t < endAngle; t += Math.PI / 180) {
                    this.outlinePoints.push({
                        x: cx + r * Math.cos(t),
                        y: cy + r * Math.sin(t)
                    });
                }
            }
        }
        
        generateDiamondPoints(params, w, h) {
            const cx = params.cx * w;
            const cy = params.cy * h;
            const width = params.width * w;
            const height = params.height * h;
            
            const points = [
                { x: cx, y: cy - height / 2 },
                { x: cx + width / 2, y: cy },
                { x: cx, y: cy + height / 2 },
                { x: cx - width / 2, y: cy },
                { x: cx, y: cy - height / 2 }
            ];
            
            for (let i = 0; i < points.length - 1; i++) {
                const start = points[i];
                const end = points[i + 1];
                const dist = Math.hypot(end.x - start.x, end.y - start.y);
                const steps = Math.ceil(dist / 3);
                
                for (let j = 0; j <= steps; j++) {
                    const t = j / steps;
                    this.outlinePoints.push({
                        x: start.x + (end.x - start.x) * t,
                        y: start.y + (end.y - start.y) * t
                    });
                }
            }
        }
        
        generateCloudPoints(params, w, h) {
            const cx = params.cx * w;
            const cy = params.cy * h;
            const width = params.width * w;
            const height = params.height * h;
            
            const circles = [
                { x: cx - width * 0.3, y: cy, r: height * 0.5 },
                { x: cx - width * 0.1, y: cy - height * 0.25, r: height * 0.55 },
                { x: cx + width * 0.15, y: cy - height * 0.15, r: height * 0.5 },
                { x: cx + width * 0.35, y: cy, r: height * 0.45 }
            ];
            
            for (let i = 0; i < circles.length; i++) {
                const circle = circles[i];
                const startAngle = i === 0 ? Math.PI : 0;
                const endAngle = i < circles.length - 1 ? Math.PI : 2 * Math.PI;
                
                for (let angle = startAngle; angle <= endAngle; angle += Math.PI / 90) {
                    this.outlinePoints.push({
                        x: circle.x + circle.r * Math.cos(angle),
                        y: circle.y + circle.r * Math.sin(angle)
                    });
                }
            }
            
            const bottomLeft = { x: cx - width * 0.3 - height * 0.5, y: cy };
            const bottomRight = { x: cx + width * 0.35 + height * 0.45, y: cy };
            const steps = Math.ceil(Math.abs(bottomRight.x - bottomLeft.x) / 3);
            
            for (let i = 0; i <= steps; i++) {
                const t = i / steps;
                this.outlinePoints.push({
                    x: bottomLeft.x + (bottomRight.x - bottomLeft.x) * t,
                    y: cy
                });
            }
        }
        
        drawOutline() {
            const w = this.canvasWidth;
            const h = this.canvasHeight;
            
            this.outlineCtx.clearRect(0, 0, w, h);
            
            if (this.outlinePoints.length === 0) {
                console.warn('No outline points to draw');
                return;
            }
            
            this.outlineCtx.save();
            
            this.outlineCtx.strokeStyle = '#e0e0e0';
            this.outlineCtx.lineWidth = CONFIG.LINE_WIDTH + 4;
            this.outlineCtx.lineCap = 'round';
            this.outlineCtx.lineJoin = 'round';
            
            this.outlineCtx.beginPath();
            this.outlineCtx.moveTo(this.outlinePoints[0].x, this.outlinePoints[0].y);
            
            for (let i = 1; i < this.outlinePoints.length; i++) {
                this.outlineCtx.lineTo(this.outlinePoints[i].x, this.outlinePoints[i].y);
            }
            
            this.outlineCtx.closePath();
            this.outlineCtx.stroke();
            
            this.outlineCtx.strokeStyle = '#667eea';
            this.outlineCtx.lineWidth = 2;
            this.outlineCtx.setLineDash([5, 5]);
            this.outlineCtx.beginPath();
            this.outlineCtx.moveTo(this.outlinePoints[0].x, this.outlinePoints[0].y);
            
            for (let i = 1; i < this.outlinePoints.length; i++) {
                this.outlineCtx.lineTo(this.outlinePoints[i].x, this.outlinePoints[i].y);
            }
            
            this.outlineCtx.closePath();
            this.outlineCtx.stroke();
            
            this.outlineCtx.restore();
            
            console.log('Outline drawn with', this.outlinePoints.length, 'points');
        }
        
        setupEventListeners() {
            console.log('setupEventListeners called');
            
            try {
                this.drawCanvas.addEventListener('mousedown', (e) => this.startDrawing(e));
                this.drawCanvas.addEventListener('mousemove', (e) => this.draw(e));
                this.drawCanvas.addEventListener('mouseup', (e) => this.stopDrawing(e));
                this.drawCanvas.addEventListener('mouseleave', (e) => this.stopDrawing(e));
                
                this.drawCanvas.addEventListener('touchstart', (e) => {
                    e.preventDefault();
                    this.startDrawing(e.touches[0]);
                }, { passive: false });
                
                this.drawCanvas.addEventListener('touchmove', (e) => {
                    e.preventDefault();
                    this.draw(e.touches[0]);
                }, { passive: false });
                
                this.drawCanvas.addEventListener('touchend', (e) => {
                    e.preventDefault();
                    this.stopDrawing();
                }, { passive: false });
                
                const btnHelp = document.getElementById('btnHelp');
                const btnCloseHelp = document.getElementById('btnCloseHelp');
                const btnPause = document.getElementById('btnPause');
                const btnResume = document.getElementById('btnResume');
                const btnClear = document.getElementById('btnClear');
                const btnRestart = document.getElementById('btnRestart');
                const btnNext = document.getElementById('btnNext');
                
                if (btnHelp) {
                    btnHelp.addEventListener('click', () => this.showModal('helpModal'));
                }
                if (btnCloseHelp) {
                    btnCloseHelp.addEventListener('click', () => this.hideModal('helpModal'));
                }
                if (btnPause) {
                    btnPause.addEventListener('click', () => this.pauseGame());
                }
                if (btnResume) {
                    btnResume.addEventListener('click', () => this.resumeGame());
                }
                if (btnClear) {
                    btnClear.addEventListener('click', () => this.clearStrokes());
                }
                if (btnRestart) {
                    btnRestart.addEventListener('click', () => this.restartLevel());
                }
                if (btnNext) {
                    btnNext.addEventListener('click', () => this.nextLevel());
                }
                
                ['helpModal', 'pauseModal', 'winModal'].forEach(modalId => {
                    const modal = document.getElementById(modalId);
                    if (modal) {
                        modal.addEventListener('click', (e) => {
                            if (e.target.id === modalId) {
                                this.hideModal(modalId);
                                if (modalId === 'pauseModal') {
                                    this.resumeGame();
                                }
                            }
                        });
                    }
                });
                
                console.log('Event listeners set up');
            } catch (error) {
                console.error('Error in setupEventListeners:', error);
            }
        }
        
        getPosition(e) {
            const rect = this.drawCanvas.getBoundingClientRect();
            return {
                x: e.clientX - rect.left,
                y: e.clientY - rect.top
            };
        }
        
        startDrawing(e) {
            if (this.isPaused || this.hasWon) return;
            
            this.isDrawing = true;
            const pos = this.getPosition(e);
            this.currentStroke = [{ x: pos.x, y: pos.y, timestamp: Date.now() }];
            
            this.drawCtx.beginPath();
            this.drawCtx.moveTo(pos.x, pos.y);
        }
        
        draw(e) {
            if (!this.isDrawing || this.isPaused || this.hasWon) return;
            
            const pos = this.getPosition(e);
            const lastPoint = this.currentStroke[this.currentStroke.length - 1];
            const dist = Math.hypot(pos.x - lastPoint.x, pos.y - lastPoint.y);
            
            if (dist > 2) {
                this.currentStroke.push({ x: pos.x, y: pos.y, timestamp: Date.now() });
                
                const closePoints = this.findClosePoints(pos.x, pos.y);
                const isDeviating = closePoints.length === 0;
                
                if (!isDeviating) {
                    closePoints.forEach(idx => this.coveredPoints.add(idx));
                }
                
                this.drawCtx.save();
                this.drawCtx.lineWidth = CONFIG.LINE_WIDTH;
                this.drawCtx.lineCap = 'round';
                this.drawCtx.lineJoin = 'round';
                
                if (isDeviating) {
                    this.drawCtx.strokeStyle = 'red';
                    this.drawCtx.shadowColor = 'red';
                } else {
                    this.drawCtx.strokeStyle = '#667eea';
                    this.drawCtx.shadowColor = '#667eea';
                }
                this.drawCtx.shadowBlur = CONFIG.GLOW_SIZE;
                
                this.drawCtx.lineTo(pos.x, pos.y);
                this.drawCtx.stroke();
                this.drawCtx.restore();
                
                this.drawCtx.beginPath();
                this.drawCtx.moveTo(pos.x, pos.y);
                
                this.updateProgress();
            }
        }
        
        stopDrawing(e) {
            if (!this.isDrawing) return;
            
            this.isDrawing = false;
            
            if (this.currentStroke.length > 1) {
                this.strokes.push([...this.currentStroke]);
            }
            
            this.currentStroke = [];
            
            if (this.checkWinCondition() && !this.isWinAnimating) {
                this.startWinAnimation();
            }
        }
        
        findClosePoints(x, y) {
            const closePoints = [];
            
            for (let i = 0; i < this.outlinePoints.length; i++) {
                const point = this.outlinePoints[i];
                const dist = Math.hypot(x - point.x, y - point.y);
                
                if (dist <= CONFIG.TOLERANCE) {
                    closePoints.push(i);
                }
            }
            
            return closePoints;
        }
        
        updateProgress() {
            if (this.totalOutlineLength === 0) return;
            
            const coveredPercent = (this.coveredPoints.size / this.totalOutlineLength) * 100;
            this.progress = Math.min(coveredPercent, 100);
            this.updateProgressUI();
        }
        
        updateProgressUI() {
            const progressPercent = Math.round(this.progress);
            const progressFill = document.getElementById('progressFill');
            const progressPercentEl = document.getElementById('progressPercent');
            
            if (progressFill) {
                progressFill.style.width = progressPercent + '%';
            }
            if (progressPercentEl) {
                progressPercentEl.textContent = progressPercent + '%';
            }
        }
        
        checkWinCondition() {
            if (this.progress >= CONFIG.WIN_PERCENT) {
                this.hasWon = true;
                return true;
            }
            return false;
        }
        
        showModal(modalId) {
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.classList.add('active');
            }
        }
        
        hideModal(modalId) {
            const modal = document.getElementById(modalId);
            if (modal) {
                modal.classList.remove('active');
            }
        }
        
        showWinModal() {
            const finalProgress = document.getElementById('finalProgress');
            const starRating = document.getElementById('starRating');
            const completionTime = document.getElementById('completionTime');
            const timeTaken = document.getElementById('timeTaken');
            
            if (finalProgress) {
                finalProgress.textContent = Math.round(this.progress) + '%';
            }
            
            const level = LEVELS[(this.currentLevel - 1) % LEVELS.length];
            
            if (this.isTimedMode && level.starTimes) {
                if (starRating) {
                    starRating.style.display = 'flex';
                    const stars = starRating.querySelectorAll('.star');
                    stars.forEach(star => star.classList.remove('active'));
                    
                    let starCount = 1;
                    const elapsed = this.elapsedTime || (level.timeLimit - this.timeRemaining);
                    
                    if (elapsed <= level.starTimes[0]) {
                        starCount = 3;
                    } else if (elapsed <= level.starTimes[1]) {
                        starCount = 2;
                    } else if (elapsed <= level.starTimes[2]) {
                        starCount = 1;
                    }
                    
                    let delay = 0;
                    for (let i = 0; i < starCount; i++) {
                        setTimeout(() => {
                            if (stars[i]) {
                                stars[i].classList.add('active');
                            }
                        }, delay);
                        delay += 300;
                    }
                }
                
                if (completionTime && timeTaken) {
                    completionTime.style.display = 'block';
                    const elapsed = this.elapsedTime || (level.timeLimit - this.timeRemaining);
                    timeTaken.textContent = elapsed;
                }
            } else {
                if (starRating) {
                    starRating.style.display = 'none';
                }
                if (completionTime) {
                    completionTime.style.display = 'none';
                }
            }
            
            this.showModal('winModal');
        }
        
        clearStrokes() {
            if (this.hasWon) return;
            
            this.strokes = [];
            this.coveredPoints = new Set();
            this.progress = 0;
            this.drawCtx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
            this.updateProgressUI();
        }
        
        restartLevel() {
            this.hideModal('winModal');
            this.drawLevel();
            this.drawCtx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
        }
        
        nextLevel() {
            this.currentLevel++;
            this.restartLevel();
        }
        
        pauseGame() {
            this.isPaused = true;
            this.showModal('pauseModal');
        }
        
        resumeGame() {
            this.isPaused = false;
            this.hideModal('pauseModal');
        }
        
        startWinAnimation() {
            console.log('Starting win animation');
            this.isWinAnimating = true;
            this.winAnimationProgress = 0;
            this.sparkles = [];
            
            this.createSparkles();
            
            const animate = (timestamp) => {
                this.winAnimationProgress += 0.016;
                
                this.drawWinFrame();
                
                if (this.winAnimationProgress < 2.5) {
                    this.winAnimationId = requestAnimationFrame(animate);
                } else {
                    this.isWinAnimating = false;
                    this.drawFinalWinState();
                    setTimeout(() => {
                        this.showWinModal();
                    }, 500);
                }
            };
            
            this.winAnimationId = requestAnimationFrame(animate);
        }
        
        createSparkles() {
            const centerX = this.canvasWidth / 2;
            const centerY = this.canvasHeight / 2;
            const count = 30;
            
            for (let i = 0; i < count; i++) {
                const angle = (Math.PI * 2 * i) / count + Math.random() * 0.2;
                const distance = 50 + Math.random() * 150;
                const speed = 2 + Math.random() * 3;
                const size = 4 + Math.random() * 8;
                const color = this.getRandomSparkleColor();
                
                this.sparkles.push({
                    x: centerX,
                    y: centerY,
                    targetX: centerX + Math.cos(angle) * distance,
                    targetY: centerY + Math.sin(angle) * distance,
                    speed: speed,
                    size: size,
                    color: color,
                    alpha: 1,
                    angle: angle,
                    progress: 0,
                    twinkleSpeed: 0.1 + Math.random() * 0.2
                });
            }
        }
        
        getRandomSparkleColor() {
            const colors = [
                '#FFD700',
                '#FF69B4',
                '#00CED1',
                '#FF6347',
                '#98FB98',
                '#DDA0DD',
                '#87CEEB',
                '#FFA07A'
            ];
            return colors[Math.floor(Math.random() * colors.length)];
        }
        
        drawWinFrame() {
            this.drawCtx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
            
            const t = Math.min(this.winAnimationProgress, 1);
            const fillProgress = Math.min(this.winAnimationProgress - 0.3, 0.7) / 0.7;
            const sparkleProgress = this.winAnimationProgress;
            
            this.drawAnimatedStrokes(t);
            
            if (fillProgress > 0) {
                this.drawAnimatedFill(fillProgress);
            }
            
            if (sparkleProgress > 0.2) {
                this.drawSparkles(sparkleProgress - 0.2);
            }
        }
        
        drawAnimatedStrokes(t) {
            this.strokes.forEach(stroke => {
                if (stroke.length < 2) return;
                
                this.drawCtx.save();
                this.drawCtx.lineWidth = CONFIG.LINE_WIDTH;
                this.drawCtx.lineCap = 'round';
                this.drawCtx.lineJoin = 'round';
                
                const greenIntensity = Math.min(t * 1.5, 1);
                const r = Math.floor(102 - 102 * greenIntensity);
                const g = Math.floor(126 + 50 * greenIntensity);
                const b = Math.floor(234 - 100 * greenIntensity);
                
                const strokeColor = `rgb(${r}, ${g}, ${b})`;
                const glowColor = greenIntensity > 0.5 
                    ? `rgba(50, 205, 50, ${greenIntensity * 0.8})` 
                    : `rgba(102, 126, 234, 0.8)`;
                
                this.drawCtx.strokeStyle = strokeColor;
                this.drawCtx.shadowColor = glowColor;
                this.drawCtx.shadowBlur = CONFIG.GLOW_SIZE + 10 * greenIntensity;
                
                this.drawCtx.beginPath();
                this.drawCtx.moveTo(stroke[0].x, stroke[0].y);
                
                for (let i = 1; i < stroke.length; i++) {
                    this.drawCtx.lineTo(stroke[i].x, stroke[i].y);
                }
                
                this.drawCtx.stroke();
                this.drawCtx.restore();
            });
        }
        
        drawAnimatedFill(progress) {
            if (this.outlinePoints.length < 3) return;
            
            this.outlineCtx.save();
            
            const fillAlpha = Math.min(progress * 0.4, 0.4);
            const gradient = this.outlineCtx.createRadialGradient(
                this.canvasWidth / 2,
                this.canvasHeight / 2,
                0,
                this.canvasWidth / 2,
                this.canvasHeight / 2,
                Math.max(this.canvasWidth, this.canvasHeight) / 2
            );
            
            gradient.addColorStop(0, `rgba(144, 238, 144, ${fillAlpha})`);
            gradient.addColorStop(0.5, `rgba(50, 205, 50, ${fillAlpha * 0.7})`);
            gradient.addColorStop(1, `rgba(34, 139, 34, ${fillAlpha * 0.5})`);
            
            this.outlineCtx.fillStyle = gradient;
            
            this.outlineCtx.beginPath();
            this.outlineCtx.moveTo(this.outlinePoints[0].x, this.outlinePoints[0].y);
            
            const pointsToDraw = Math.floor(this.outlinePoints.length * progress);
            for (let i = 1; i < pointsToDraw; i++) {
                this.outlineCtx.lineTo(this.outlinePoints[i].x, this.outlinePoints[i].y);
            }
            
            if (progress >= 1) {
                this.outlineCtx.closePath();
            }
            
            this.outlineCtx.fill();
            
            this.outlineCtx.restore();
        }
        
        drawSparkles(progress) {
            this.sparkles.forEach(sparkle => {
                if (sparkle.progress >= 1) return;
                
                sparkle.progress += sparkle.speed * 0.01;
                sparkle.progress = Math.min(sparkle.progress, 1);
                
                const easeProgress = this.easeOutQuad(sparkle.progress);
                const x = sparkle.x + (sparkle.targetX - sparkle.x) * easeProgress;
                const y = sparkle.y + (sparkle.targetY - sparkle.y) * easeProgress;
                
                const twinkle = 0.5 + 0.5 * Math.sin(sparkle.progress * Math.PI * 2 / sparkle.twinkleSpeed);
                const alpha = sparkle.alpha * (1 - sparkle.progress) * twinkle;
                const size = sparkle.size * (0.5 + 0.5 * twinkle) * (1 - sparkle.progress * 0.3);
                
                this.drawCtx.save();
                this.drawCtx.globalAlpha = alpha;
                this.drawCtx.fillStyle = sparkle.color;
                this.drawCtx.shadowColor = sparkle.color;
                this.drawCtx.shadowBlur = size * 2;
                
                this.drawSparkleShape(x, y, size);
                
                this.drawCtx.restore();
            });
        }
        
        drawSparkleShape(x, y, size) {
            this.drawCtx.beginPath();
            
            for (let i = 0; i < 5; i++) {
                const angle = (i * Math.PI * 2) / 5 - Math.PI / 2;
                const outerX = x + Math.cos(angle) * size;
                const outerY = y + Math.sin(angle) * size;
                const innerAngle = angle + Math.PI / 5;
                const innerX = x + Math.cos(innerAngle) * size * 0.4;
                const innerY = y + Math.sin(innerAngle) * size * 0.4;
                
                if (i === 0) {
                    this.drawCtx.moveTo(outerX, outerY);
                } else {
                    this.drawCtx.lineTo(outerX, outerY);
                }
                this.drawCtx.lineTo(innerX, innerY);
            }
            
            this.drawCtx.closePath();
            this.drawCtx.fill();
        }
        
        easeOutQuad(t) {
            return t * (2 - t);
        }
        
        drawFinalWinState() {
            this.drawCtx.clearRect(0, 0, this.canvasWidth, this.canvasHeight);
            
            this.strokes.forEach(stroke => {
                if (stroke.length < 2) return;
                
                this.drawCtx.save();
                this.drawCtx.lineWidth = CONFIG.LINE_WIDTH;
                this.drawCtx.lineCap = 'round';
                this.drawCtx.lineJoin = 'round';
                this.drawCtx.strokeStyle = '#32CD32';
                this.drawCtx.shadowColor = '#32CD32';
                this.drawCtx.shadowBlur = CONFIG.GLOW_SIZE + 5;
                
                this.drawCtx.beginPath();
                this.drawCtx.moveTo(stroke[0].x, stroke[0].y);
                
                for (let i = 1; i < stroke.length; i++) {
                    this.drawCtx.lineTo(stroke[i].x, stroke[i].y);
                }
                
                this.drawCtx.stroke();
                this.drawCtx.restore();
            });
            
            if (this.outlinePoints.length >= 3) {
                this.outlineCtx.save();
                
                const gradient = this.outlineCtx.createRadialGradient(
                    this.canvasWidth / 2,
                    this.canvasHeight / 2,
                    0,
                    this.canvasWidth / 2,
                    this.canvasHeight / 2,
                    Math.max(this.canvasWidth, this.canvasHeight) / 2
                );
                
                gradient.addColorStop(0, 'rgba(144, 238, 144, 0.4)');
                gradient.addColorStop(0.5, 'rgba(50, 205, 50, 0.28)');
                gradient.addColorStop(1, 'rgba(34, 139, 34, 0.2)');
                
                this.outlineCtx.fillStyle = gradient;
                
                this.outlineCtx.beginPath();
                this.outlineCtx.moveTo(this.outlinePoints[0].x, this.outlinePoints[0].y);
                
                for (let i = 1; i < this.outlinePoints.length; i++) {
                    this.outlineCtx.lineTo(this.outlinePoints[i].x, this.outlinePoints[i].y);
                }
                
                this.outlineCtx.closePath();
                this.outlineCtx.fill();
                
                this.outlineCtx.restore();
            }
        }
    }
    
    function setupModeSelector() {
        console.log('setupModeSelector called');
        
        const modeSelector = document.getElementById('modeSelector');
        const gameContainer = document.getElementById('gameContainer');
        const btnNormalMode = document.getElementById('btnNormalMode');
        const btnTimedMode = document.getElementById('btnTimedMode');
        
        if (!modeSelector || !gameContainer || !btnNormalMode || !btnTimedMode) {
            console.error('Mode selector elements not found!');
            return;
        }
        
        function startGameWithMode(mode) {
            console.log('Starting game with mode:', mode);
            
            modeSelector.style.display = 'none';
            gameContainer.style.display = 'flex';
            
            if (gameInstance) {
                gameInstance.stopTimer();
            }
            
            try {
                gameInstance = new TraceGame(mode);
                console.log('Game started successfully with mode:', mode);
            } catch (error) {
                console.error('Failed to start game:', error);
            }
        }
        
        btnNormalMode.addEventListener('click', () => {
            startGameWithMode('normal');
        });
        
        btnTimedMode.addEventListener('click', () => {
            startGameWithMode('timed');
        });
        
        console.log('Mode selector setup complete');
    }
    
    if (document.readyState === 'complete' || document.readyState === 'interactive') {
        console.log('Document ready, setting up mode selector');
        setTimeout(setupModeSelector, 100);
    } else {
        console.log('Waiting for DOMContentLoaded');
        document.addEventListener('DOMContentLoaded', () => {
            console.log('DOMContentLoaded fired');
            setTimeout(setupModeSelector, 100);
        });
    }
    
    window.addEventListener('load', () => {
        console.log('window.load fired');
        if (!gameInstance) {
            setupModeSelector();
        }
    });
    
    console.log('TraceGame script loaded');
})();
