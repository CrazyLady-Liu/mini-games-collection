const Game = (() => {
    // ==================== 数据与常量 ====================
    const SHAPE_TYPES = ['circle', 'rect', 'triangle', 'pentagon', 'hexagon', 'star', 'diamond'];
    const COLORS = [
        '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
        '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
        '#F8B500', '#00CED1', '#FF69B4', '#32CD32', '#FF8C00'
    ];
    const SHAPE_NAMES = {
        circle: '圆形', rect: '正方形', triangle: '三角形',
        pentagon: '五边形', hexagon: '六边形', star: '星形', diamond: '菱形'
    };

    // ==================== 纯函数模块 ====================
    const LevelConfig = {
        get(level) {
            const baseLayers = 3;
            const maxLayers = 10;
            const layerCount = Math.min(baseLayers + Math.floor((level - 1) / 2), maxLayers);
            const shapesPerLayer = level >= 5 ? 2 : 1;
            const baseTime = 60;
            const timeIncrement = 10;
            return {
                layerCount,
                shapesPerLayer,
                minSize: 40,
                maxSize: 260,
                totalShapes: layerCount * shapesPerLayer,
                timeLimit: baseTime + (level - 1) * timeIncrement
            };
        }
    };

    const LevelGenerator = {
        generate(level, canvasWidth, canvasHeight) {
            const config = LevelConfig.get(level);
            const shapes = [];
            const centerX = canvasWidth / 2;
            const centerY = canvasHeight / 2;
            let idCounter = 0;

            for (let layer = 1; layer <= config.layerCount; layer++) {
                const layerProgress = (layer - 1) / (config.layerCount - 1 || 1);
                const size = config.maxSize - layerProgress * (config.maxSize - config.minSize);

                for (let i = 0; i < config.shapesPerLayer; i++) {
                    const type = SHAPE_TYPES[Math.floor(Math.random() * SHAPE_TYPES.length)];
                    const color = COLORS[(idCounter * 3 + layer * 7) % COLORS.length];
                    let offsetX = 0, offsetY = 0;

                    if (config.shapesPerLayer > 1) {
                        const angle = (i / config.shapesPerLayer) * Math.PI * 2 + (layer * 0.3);
                        const offsetRadius = size * 0.15;
                        offsetX = Math.cos(angle) * offsetRadius;
                        offsetY = Math.sin(angle) * offsetRadius;
                    }

                    shapes.push({
                        id: idCounter++,
                        type,
                        layer,
                        x: centerX + offsetX,
                        y: centerY + offsetY,
                        size,
                        color,
                        rotation: (layer * i * 15) % 360
                    });
                }
            }

            for (let i = shapes.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [shapes[i], shapes[j]] = [shapes[j], shapes[i]];
            }

            return shapes;
        }
    };

    const LayerValidator = {
        calculateCorrectLayers(shapes, shapesPerLayer) {
            const shapesBySize = [...shapes].sort((a, b) => b.size - a.size);
            const correctAssignments = {};
            shapesBySize.forEach((shape, index) => {
                correctAssignments[shape.id] = Math.floor(index / shapesPerLayer) + 1;
            });
            return correctAssignments;
        },

        validate(shapes, assignments, shapesPerLayer) {
            const correct = LayerValidator.calculateCorrectLayers(shapes, shapesPerLayer);
            return Object.keys(assignments).every(id => assignments[id] === correct[id]);
        }
    };

    const ShapeHitTester = {
        isPointInShape(x, y, shape) {
            const dx = x - shape.x;
            const dy = y - shape.y;
            const angle = -(shape.rotation * Math.PI) / 180;
            const rotatedX = dx * Math.cos(angle) - dy * Math.sin(angle);
            const rotatedY = dx * Math.sin(angle) + dy * Math.cos(angle);
            const radius = shape.size / 2;

            switch (shape.type) {
                case 'circle':
                    return rotatedX * rotatedX + rotatedY * rotatedY <= radius * radius;
                case 'rect':
                    return Math.abs(rotatedX) <= radius && Math.abs(rotatedY) <= radius;
                case 'triangle':
                case 'pentagon':
                case 'hexagon':
                case 'star':
                    return rotatedX * rotatedX + rotatedY * rotatedY <= radius * radius;
                case 'diamond':
                    return Math.abs(rotatedX) / radius + Math.abs(rotatedY) / radius <= 1;
                default:
                    return false;
            }
        },

        getShapeAtPosition(x, y, shapes) {
            const sortedShapes = [...shapes].sort((a, b) => a.size - b.size);
            for (const shape of sortedShapes) {
                if (ShapeHitTester.isPointInShape(x, y, shape)) {
                    return shape;
                }
            }
            return null;
        }
    };

    // ==================== 标注操作模块 ====================
    const AssignmentManager = {
        state: {
            assignments: {},
            selectedShapeId: null
        },

        init() {
            this.state.assignments = {};
            this.state.selectedShapeId = null;
        },

        selectShape(shapeId) {
            this.state.selectedShapeId = shapeId;
        },

        getSelectedShapeId() {
            return this.state.selectedShapeId;
        },

        assignLayer(layer) {
            if (this.state.selectedShapeId === null) return false;

            const existingShapeId = Object.keys(this.state.assignments).find(
                id => this.state.assignments[id] === layer && parseInt(id) !== this.state.selectedShapeId
            );

            if (existingShapeId) {
                delete this.state.assignments[existingShapeId];
            }

            this.state.assignments[this.state.selectedShapeId] = layer;
            return true;
        },

        getAssignments() {
            return { ...this.state.assignments };
        },

        getAssignedCount() {
            return Object.keys(this.state.assignments).length;
        },

        getAssignmentForShape(shapeId) {
            return this.state.assignments[shapeId];
        },

        getUsedLayers() {
            return Object.values(this.state.assignments);
        }
    };

    // ==================== 渲染模块 ====================
    const Renderer = {
        ctx: null,
        canvas: null,

        init(canvas) {
            this.canvas = canvas;
            this.ctx = canvas.getContext('2d');
        },

        drawPolygon(sides, radius) {
            for (let i = 0; i < sides; i++) {
                const angle = (i * 2 * Math.PI) / sides - Math.PI / 2;
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;
                if (i === 0) this.ctx.moveTo(x, y);
                else this.ctx.lineTo(x, y);
            }
            this.ctx.closePath();
        },

        drawStar(points, outerRadius, innerRadius) {
            for (let i = 0; i < points * 2; i++) {
                const radius = i % 2 === 0 ? outerRadius : innerRadius;
                const angle = (i * Math.PI) / points - Math.PI / 2;
                const x = Math.cos(angle) * radius;
                const y = Math.sin(angle) * radius;
                if (i === 0) this.ctx.moveTo(x, y);
                else this.ctx.lineTo(x, y);
            }
            this.ctx.closePath();
        },

        drawShape(shape, isSelected, assignedLevel) {
            const ctx = this.ctx;
            ctx.save();
            ctx.translate(shape.x, shape.y);
            ctx.rotate((shape.rotation * Math.PI) / 180);

            ctx.fillStyle = shape.color;
            ctx.strokeStyle = isSelected ? '#2d3748' : 'rgba(0,0,0,0.2)';
            ctx.lineWidth = isSelected ? 4 : 2;

            const size = shape.size;
            ctx.beginPath();

            switch (shape.type) {
                case 'circle':
                    ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
                    break;
                case 'rect':
                    ctx.rect(-size / 2, -size / 2, size, size);
                    break;
                case 'triangle':
                    this.drawPolygon(3, size / 2);
                    break;
                case 'pentagon':
                    this.drawPolygon(5, size / 2);
                    break;
                case 'hexagon':
                    this.drawPolygon(6, size / 2);
                    break;
                case 'star':
                    this.drawStar(5, size / 2, size / 4);
                    break;
                case 'diamond':
                    ctx.moveTo(0, -size / 2);
                    ctx.lineTo(size / 2, 0);
                    ctx.lineTo(0, size / 2);
                    ctx.lineTo(-size / 2, 0);
                    ctx.closePath();
                    break;
            }

            ctx.fill();
            ctx.stroke();

            if (assignedLevel !== undefined) {
                ctx.fillStyle = 'rgba(0,0,0,0.7)';
                ctx.beginPath();
                ctx.arc(size / 2 - 12, -size / 2 + 12, 16, 0, Math.PI * 2);
                ctx.fill();
                ctx.fillStyle = 'white';
                ctx.font = 'bold 16px Arial';
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillText(assignedLevel.toString(), size / 2 - 12, -size / 2 + 12);
            }

            ctx.restore();
        },

        render(shapes, selectedShapeId, assignments) {
            const ctx = this.ctx;
            ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

            ctx.fillStyle = '#f8f9fa';
            ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

            ctx.strokeStyle = 'rgba(0,0,0,0.05)';
            ctx.lineWidth = 1;
            for (let x = 0; x <= this.canvas.width; x += 30) {
                ctx.beginPath();
                ctx.moveTo(x, 0);
                ctx.lineTo(x, this.canvas.height);
                ctx.stroke();
            }
            for (let y = 0; y <= this.canvas.height; y += 30) {
                ctx.beginPath();
                ctx.moveTo(0, y);
                ctx.lineTo(this.canvas.width, y);
                ctx.stroke();
            }

            const sortedShapes = [...shapes].sort((a, b) => b.size - a.size);
            sortedShapes.forEach(shape => {
                this.drawShape(
                    shape,
                    shape.id === selectedShapeId,
                    assignments[shape.id]
                );
            });
        }
    };

    // ==================== UI 更新模块 ====================
    const UI = {
        elements: {},

        init() {
            this.elements = {
                levelNumber: document.getElementById('levelNumber'),
                selectedShape: document.getElementById('selectedShape'),
                selectedLevel: document.getElementById('selectedLevel'),
                layerButtons: document.getElementById('layerButtons'),
                progressText: document.getElementById('progressText'),
                submitBtn: document.getElementById('submitBtn'),
                resetBtn: document.getElementById('resetBtn'),
                message: document.getElementById('message'),
                successModal: document.getElementById('successModal'),
                completedLevel: document.getElementById('completedLevel'),
                nextLevelBtn: document.getElementById('nextLevelBtn'),
                timerValue: document.getElementById('timerValue'),
                timerInfo: document.getElementById('timerInfo'),
                timeoutModal: document.getElementById('timeoutModal'),
                retryBtn: document.getElementById('retryBtn')
            };
        },

        updateTimer(seconds) {
            this.elements.timerValue.textContent = seconds;
            if (seconds <= 10) {
                this.elements.timerInfo.classList.add('warning');
            } else {
                this.elements.timerInfo.classList.remove('warning');
            }
        },

        showTimeoutModal() {
            this.elements.timeoutModal.classList.add('show');
        },

        hideTimeoutModal() {
            this.elements.timeoutModal.classList.remove('show');
        },

        updateLevelNumber(level) {
            this.elements.levelNumber.textContent = level;
        },

        updateSelectedInfo(shape, assignedLevel) {
            if (!shape) {
                this.elements.selectedShape.textContent = '无';
                this.elements.selectedLevel.textContent = '无';
            } else {
                this.elements.selectedShape.textContent = SHAPE_NAMES[shape.type] || shape.type;
                this.elements.selectedLevel.textContent = assignedLevel !== undefined ? assignedLevel : '未标注';
            }
        },

        updateLayerButtons(layerCount, currentAssignment, usedLayers, onLayerClick) {
            this.elements.layerButtons.innerHTML = '';
            for (let i = 1; i <= layerCount; i++) {
                const btn = document.createElement('button');
                btn.className = 'layer-btn';
                btn.textContent = i;
                if (i === currentAssignment) btn.classList.add('active');
                if (usedLayers.includes(i) && i !== currentAssignment) btn.classList.add('used');
                btn.addEventListener('click', () => onLayerClick(i));
                this.elements.layerButtons.appendChild(btn);
            }
        },

        updateProgress(assignedCount, totalShapes) {
            this.elements.progressText.textContent = `${assignedCount} / ${totalShapes}`;
            this.elements.submitBtn.disabled = assignedCount !== totalShapes;
        },

        showMessage(text, type = 'info') {
            this.elements.message.textContent = text;
            this.elements.message.className = 'message ' + type;
        },

        showSuccessModal(level) {
            this.elements.completedLevel.textContent = level;
            setTimeout(() => {
                this.elements.successModal.classList.add('show');
            }, 500);
        },

        hideSuccessModal() {
            this.elements.successModal.classList.remove('show');
        }
    };

    // ==================== 计时器模块 ====================
    const CountdownTimer = {
        timerId: null,
        remaining: 0,
        onTick: null,
        onTimeout: null,

        start(seconds, onTick, onTimeout) {
            this.stop();
            this.remaining = seconds;
            this.onTick = onTick;
            this.onTimeout = onTimeout;

            if (this.onTick) this.onTick(this.remaining);

            this.timerId = setInterval(() => {
                this.remaining--;
                if (this.onTick) this.onTick(this.remaining);

                if (this.remaining <= 0) {
                    this.stop();
                    if (this.onTimeout) this.onTimeout();
                }
            }, 1000);
        },

        stop() {
            if (this.timerId) {
                clearInterval(this.timerId);
                this.timerId = null;
            }
        },

        getRemaining() {
            return this.remaining;
        }
    };

    // ==================== 游戏主控制器 ====================
    const GameController = {
        state: {
            currentLevel: 1,
            shapes: [],
            isComplete: false
        },

        init() {
            const canvas = document.getElementById('gameCanvas');
            Renderer.init(canvas);
            UI.init();
            AssignmentManager.init();

            canvas.addEventListener('click', (e) => this.handleCanvasClick(e));
            UI.elements.submitBtn.addEventListener('click', () => this.handleSubmit());
            UI.elements.resetBtn.addEventListener('click', () => this.handleReset());
            UI.elements.nextLevelBtn.addEventListener('click', () => this.handleNextLevel());
            UI.elements.retryBtn.addEventListener('click', () => this.handleRetry());

            this.startLevel();
        },

        startLevel() {
            const canvas = document.getElementById('gameCanvas');
            const config = LevelConfig.get(this.state.currentLevel);

            this.state.shapes = LevelGenerator.generate(this.state.currentLevel, canvas.width, canvas.height);
            this.state.isComplete = false;
            AssignmentManager.init();

            UI.updateLevelNumber(this.state.currentLevel);
            this.refreshUI();
            UI.showMessage('点击图形开始标注层级', 'info');

            CountdownTimer.start(
                config.timeLimit,
                (seconds) => UI.updateTimer(seconds),
                () => this.handleTimeout()
            );
        },

        refreshUI() {
            const config = LevelConfig.get(this.state.currentLevel);
            const selectedShapeId = AssignmentManager.getSelectedShapeId();
            const selectedShape = this.state.shapes.find(s => s.id === selectedShapeId);
            const assignedLevel = selectedShape ? AssignmentManager.getAssignmentForShape(selectedShapeId) : undefined;

            UI.updateSelectedInfo(selectedShape, assignedLevel);
            UI.updateLayerButtons(
                config.layerCount,
                assignedLevel,
                AssignmentManager.getUsedLayers(),
                (layer) => this.handleLayerAssign(layer)
            );
            UI.updateProgress(AssignmentManager.getAssignedCount(), config.totalShapes);
            Renderer.render(this.state.shapes, selectedShapeId, AssignmentManager.getAssignments());
        },

        handleCanvasClick(e) {
            if (this.state.isComplete) return;

            const canvas = document.getElementById('gameCanvas');
            const rect = canvas.getBoundingClientRect();
            const scaleX = canvas.width / rect.width;
            const scaleY = canvas.height / rect.height;
            const x = (e.clientX - rect.left) * scaleX;
            const y = (e.clientY - rect.top) * scaleY;

            const shape = ShapeHitTester.getShapeAtPosition(x, y, this.state.shapes);
            if (shape) {
                AssignmentManager.selectShape(shape.id);
                this.refreshUI();
                UI.showMessage('请为该图形选择所属层级', 'info');
            }
        },

        handleLayerAssign(layer) {
            if (AssignmentManager.getSelectedShapeId() === null) {
                UI.showMessage('请先点击选择一个图形', 'error');
                return;
            }

            AssignmentManager.assignLayer(layer);
            this.refreshUI();
            const shape = this.state.shapes.find(s => s.id === AssignmentManager.getSelectedShapeId());
            UI.showMessage(`已将 ${SHAPE_NAMES[shape.type]} 标注为第 ${layer} 层`, 'info');
        },

        handleSubmit() {
            const config = LevelConfig.get(this.state.currentLevel);
            const assignedCount = AssignmentManager.getAssignedCount();

            if (assignedCount !== config.totalShapes) {
                UI.showMessage(`还有 ${config.totalShapes - assignedCount} 个图形未标注`, 'error');
                return;
            }

            const isValid = LayerValidator.validate(
                this.state.shapes,
                AssignmentManager.getAssignments(),
                config.shapesPerLayer
            );

            if (isValid) {
                this.state.isComplete = true;
                CountdownTimer.stop();
                UI.showMessage('恭喜！所有标注正确！', 'success');
                UI.showSuccessModal(this.state.currentLevel);
            } else {
                UI.showMessage('部分标注有误，请检查后重新提交', 'error');
            }
        },

        handleTimeout() {
            this.state.isComplete = true;
            UI.showMessage('时间到！挑战失败', 'error');
            UI.showTimeoutModal();
        },

        handleRetry() {
            UI.hideTimeoutModal();
            this.startLevel();
            UI.showMessage('重新开始挑战', 'info');
        },

        handleNextLevel() {
            UI.hideSuccessModal();
            this.state.currentLevel++;
            this.startLevel();
            UI.showMessage(`进入第 ${this.state.currentLevel} 关`, 'info');
        },

        handleReset() {
            this.startLevel();
            UI.showMessage('已重置本关', 'info');
        }
    };

    return { init: () => GameController.init() };
})();

document.addEventListener('DOMContentLoaded', Game.init);
