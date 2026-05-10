class PaintGame {
    constructor() {
        this.canvas = document.getElementById('canvas');
        this.ctx = this.canvas.getContext('2d');
        this.width = 600;
        this.height = 500;
        this.canvas.width = this.width;
        this.canvas.height = this.height;

        this.colors = [
            '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4',
            '#FFEAA7', '#DDA0DD', '#98D8C8', '#F7DC6F',
            '#BB8FCE', '#85C1E9', '#F8B500', '#00CED1'
        ];
        this.currentColor = this.colors[0];
        this.isEraser = false;
        this.isPicker = false;
        this.isComplete = false;
        this.opacity = 1;
        this.recentColors = [];
        this.maxRecentColors = 6;

        this.currentLevel = 0;
        this.levels = this.createLevels();
        this.regions = [];

        this.history = [];
        this.historyIndex = -1;
        this.maxHistory = 30;

        this.init();
    }

    createLevels() {
        return [
            {
                name: '房屋',
                draw: this.drawHouseLevel.bind(this),
                regions: []
            },
            {
                name: '猫咪',
                draw: this.drawCatLevel.bind(this),
                regions: []
            },
            {
                name: '花朵',
                draw: this.drawFlowerLevel.bind(this),
                regions: []
            },
            {
                name: '几何',
                draw: this.drawGeometryLevel.bind(this),
                regions: []
            }
        ];
    }

    init() {
        this.createColorPanel();
        this.bindEvents();
        this.loadLevel(this.currentLevel);
        this.updateStatus('请选择颜色开始填色');
    }

    createColorPanel() {
        const panel = document.getElementById('colorPanel');
        panel.innerHTML = '';
        this.colors.forEach((color, index) => {
            const btn = document.createElement('div');
            btn.className = 'color-btn' + (index === 0 ? ' active' : '');
            btn.style.background = color;
            btn.addEventListener('click', () => this.selectColor(color, btn));
            panel.appendChild(btn);
        });
    }

    selectColor(color, btn = null) {
        if (this.isComplete) return;

        this.currentColor = color;
        this.isEraser = false;
        this.isPicker = false;

        document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
        document.getElementById('brushBtn').classList.add('active');
        
        if (btn) btn.classList.add('active');
        
        this.canvas.style.cursor = 'crosshair';
        this.updateColorDisplay();
        this.addToRecentColors(color);
    }

    updateColorDisplay() {
        const preview = document.getElementById('colorPreview');
        const hex = document.getElementById('colorHex');
        const colorPicker = document.getElementById('colorPicker');
        const colorInput = document.getElementById('colorInput');
        
        preview.style.background = this.currentColor;
        hex.textContent = this.currentColor.toUpperCase();
        colorPicker.value = this.currentColor;
        colorInput.value = this.currentColor.replace('#', '');
    }

    addToRecentColors(color) {
        this.recentColors = this.recentColors.filter(c => c !== color);
        this.recentColors.unshift(color);
        if (this.recentColors.length > this.maxRecentColors) {
            this.recentColors.pop();
        }
        this.renderRecentColors();
    }

    renderRecentColors() {
        const container = document.getElementById('recentColors');
        container.innerHTML = '';
        
        if (this.recentColors.length === 0) {
            return;
        }

        this.recentColors.forEach(color => {
            const btn = document.createElement('div');
            btn.className = 'recent-color-btn';
            btn.style.background = color;
            btn.addEventListener('click', () => this.selectColor(color));
            container.appendChild(btn);
        });
    }

    bindEvents() {
        this.canvas.addEventListener('click', (e) => this.handleClick(e));

        document.querySelectorAll('.level-btn').forEach(btn => {
            btn.addEventListener('click', () => {
                const level = parseInt(btn.dataset.level);
                this.loadLevel(level);
                document.querySelectorAll('.level-btn').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });

        document.getElementById('brushBtn').addEventListener('click', () => {
            if (this.isComplete) return;
            this.isEraser = false;
            this.isPicker = false;
            document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
            document.getElementById('brushBtn').classList.add('active');
            this.canvas.style.cursor = 'crosshair';
        });

        document.getElementById('eraserBtn').addEventListener('click', () => {
            if (this.isComplete) return;
            this.isEraser = true;
            this.isPicker = false;
            document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
            document.getElementById('eraserBtn').classList.add('active');
            this.canvas.style.cursor = 'cell';
        });

        document.getElementById('fillBtn').addEventListener('click', () => {
            if (this.isComplete) return;
            this.isEraser = false;
            this.isPicker = false;
            document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
            document.getElementById('fillBtn').classList.add('active');
            this.canvas.style.cursor = 'crosshair';
        });

        document.getElementById('pickerBtn').addEventListener('click', () => {
            if (this.isComplete) return;
            this.isPicker = true;
            this.isEraser = false;
            document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
            document.getElementById('pickerBtn').classList.add('active');
            this.canvas.style.cursor = 'pointer';
        });

        document.getElementById('colorPicker').addEventListener('input', (e) => {
            this.currentColor = e.target.value;
            this.isEraser = false;
            this.isPicker = false;
            document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
            document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
            document.getElementById('brushBtn').classList.add('active');
            this.canvas.style.cursor = 'crosshair';
            this.updateColorDisplay();
            this.addToRecentColors(this.currentColor);
        });

        document.getElementById('colorInput').addEventListener('input', (e) => {
            let value = e.target.value.replace(/[^0-9a-fA-F]/g, '');
            if (value.length === 6) {
                const color = '#' + value;
                this.currentColor = color;
                this.isEraser = false;
                this.isPicker = false;
                document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
                document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
                document.getElementById('brushBtn').classList.add('active');
                this.canvas.style.cursor = 'crosshair';
                this.updateColorDisplay();
                this.addToRecentColors(this.currentColor);
            }
        });

        document.getElementById('opacitySlider').addEventListener('input', (e) => {
            this.opacity = e.target.value / 100;
            document.getElementById('opacityValue').textContent = e.target.value + '%';
            
            document.querySelectorAll('.opacity-preset').forEach(btn => {
                btn.classList.remove('active');
                if (parseInt(btn.dataset.opacity) === parseInt(e.target.value)) {
                    btn.classList.add('active');
                }
            });
        });

        document.querySelectorAll('.opacity-preset').forEach(btn => {
            btn.addEventListener('click', () => {
                const opacity = parseInt(btn.dataset.opacity);
                this.opacity = opacity / 100;
                document.getElementById('opacitySlider').value = opacity;
                document.getElementById('opacityValue').textContent = opacity + '%';
                
                document.querySelectorAll('.opacity-preset').forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });

        document.getElementById('undoBtn').addEventListener('click', () => this.undo());
        document.getElementById('redoBtn').addEventListener('click', () => this.redo());
        document.getElementById('resetBtn').addEventListener('click', () => this.reset());
    }

    loadLevel(levelIndex) {
        this.currentLevel = levelIndex;
        this.isComplete = false;
        this.history = [];
        this.historyIndex = -1;
        this.updateUndoRedoButtons();
        
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(0, 0, this.width, this.height);
        this.regions = [];
        
        this.levels[levelIndex].draw();
        this.saveState();
        this.updateStatus('请选择颜色开始填色');
    }

    drawHouseLevel() {
        this.ctx.lineWidth = 4;
        this.ctx.strokeStyle = '#000';
        this.ctx.fillStyle = '#ffffff';

        this.ctx.beginPath();
        this.ctx.moveTo(100, 350);
        this.ctx.lineTo(100, 200);
        this.ctx.lineTo(200, 130);
        this.ctx.lineTo(300, 200);
        this.ctx.lineTo(300, 350);
        this.ctx.closePath();
        this.ctx.stroke();
        this.regions.push({type: 'roof', x: 200, y: 190, color: null});

        this.ctx.fillRect(100, 200, 200, 150);
        this.ctx.strokeRect(100, 200, 200, 150);
        this.regions.push({type: 'wall', x: 200, y: 280, color: null});

        this.ctx.fillRect(160, 260, 80, 90);
        this.ctx.strokeRect(160, 260, 80, 90);
        this.regions.push({type: 'door', x: 200, y: 310, color: null});

        this.ctx.fillRect(120, 220, 50, 50);
        this.ctx.strokeRect(120, 220, 50, 50);
        this.ctx.beginPath();
        this.ctx.moveTo(145, 220);
        this.ctx.lineTo(145, 270);
        this.ctx.moveTo(120, 245);
        this.ctx.lineTo(170, 245);
        this.ctx.stroke();
        this.regions.push({type: 'window1', x: 145, y: 245, color: null});

        this.ctx.fillRect(230, 220, 50, 50);
        this.ctx.strokeRect(230, 220, 50, 50);
        this.ctx.beginPath();
        this.ctx.moveTo(255, 220);
        this.ctx.lineTo(255, 270);
        this.ctx.moveTo(230, 245);
        this.ctx.lineTo(280, 245);
        this.ctx.stroke();
        this.regions.push({type: 'window2', x: 255, y: 245, color: null});

        this.ctx.fillRect(400, 300, 40, 100);
        this.ctx.strokeRect(400, 300, 40, 100);
        this.regions.push({type: 'trunk', x: 420, y: 350, color: null});

        this.ctx.beginPath();
        this.ctx.moveTo(420, 150);
        this.ctx.lineTo(340, 300);
        this.ctx.lineTo(500, 300);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();
        this.regions.push({type: 'crown', x: 420, y: 240, color: null});

        this.ctx.beginPath();
        this.ctx.moveTo(420, 100);
        this.ctx.lineTo(360, 220);
        this.ctx.lineTo(480, 220);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();
        this.regions.push({type: 'crown2', x: 420, y: 170, color: null});

        this.ctx.beginPath();
        this.ctx.arc(500, 80, 40, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();
        this.regions.push({type: 'sun', x: 500, y: 80, color: null});

        this.ctx.beginPath();
        this.ctx.arc(150, 80, 25, 0, Math.PI * 2);
        this.ctx.arc(180, 70, 30, 0, Math.PI * 2);
        this.ctx.arc(210, 80, 25, 0, Math.PI * 2);
        this.ctx.arc(180, 90, 20, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();
        this.regions.push({type: 'cloud', x: 180, y: 80, color: null});

        this.ctx.fillRect(0, 400, 600, 100);
        this.ctx.strokeRect(0, 400, 600, 100);
        this.regions.push({type: 'ground', x: 300, y: 450, color: null});
    }

    drawCatLevel() {
        this.ctx.lineWidth = 4;
        this.ctx.strokeStyle = '#000';
        this.ctx.fillStyle = '#ffffff';

        this.ctx.beginPath();
        this.ctx.arc(300, 250, 120, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();
        this.regions.push({type: 'face', x: 300, y: 250, color: null});

        this.ctx.beginPath();
        this.ctx.moveTo(200, 150);
        this.ctx.lineTo(170, 80);
        this.ctx.lineTo(230, 120);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();
        this.regions.push({type: 'ear1', x: 200, y: 120, color: null});

        this.ctx.beginPath();
        this.ctx.moveTo(400, 150);
        this.ctx.lineTo(430, 80);
        this.ctx.lineTo(370, 120);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();
        this.regions.push({type: 'ear2', x: 400, y: 120, color: null});

        this.ctx.beginPath();
        this.ctx.ellipse(255, 220, 20, 25, 0, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();
        this.regions.push({type: 'eye1', x: 255, y: 220, color: null});

        this.ctx.beginPath();
        this.ctx.ellipse(345, 220, 20, 25, 0, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();
        this.regions.push({type: 'eye2', x: 345, y: 220, color: null});

        this.ctx.beginPath();
        this.ctx.ellipse(300, 280, 25, 20, 0, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();
        this.regions.push({type: 'nose', x: 300, y: 280, color: null});

        this.ctx.beginPath();
        this.ctx.moveTo(300, 300);
        this.ctx.quadraticCurveTo(270, 320, 240, 310);
        this.ctx.moveTo(300, 300);
        this.ctx.quadraticCurveTo(330, 320, 360, 310);
        this.ctx.stroke();

        this.ctx.beginPath();
        this.ctx.moveTo(200, 270);
        this.ctx.lineTo(140, 260);
        this.ctx.moveTo(200, 285);
        this.ctx.lineTo(140, 285);
        this.ctx.moveTo(200, 300);
        this.ctx.lineTo(140, 310);
        this.ctx.moveTo(400, 270);
        this.ctx.lineTo(460, 260);
        this.ctx.moveTo(400, 285);
        this.ctx.lineTo(460, 285);
        this.ctx.moveTo(400, 300);
        this.ctx.lineTo(460, 310);
        this.ctx.stroke();

        this.ctx.fillRect(180, 370, 80, 100);
        this.ctx.strokeRect(180, 370, 80, 100);
        this.regions.push({type: 'leg1', x: 220, y: 420, color: null});

        this.ctx.fillRect(340, 370, 80, 100);
        this.ctx.strokeRect(340, 370, 80, 100);
        this.regions.push({type: 'leg2', x: 380, y: 420, color: null});

        this.ctx.beginPath();
        this.ctx.ellipse(90, 350, 40, 60, -0.5, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();
        this.regions.push({type: 'tail', x: 90, y: 350, color: null});

        this.ctx.fillRect(0, 470, 600, 30);
        this.ctx.strokeRect(0, 470, 600, 30);
        this.regions.push({type: 'ground', x: 300, y: 485, color: null});
    }

    drawFlowerLevel() {
        this.ctx.lineWidth = 4;
        this.ctx.strokeStyle = '#000';
        this.ctx.fillStyle = '#ffffff';

        this.ctx.fillRect(290, 250, 20, 200);
        this.ctx.strokeRect(290, 250, 20, 200);
        this.regions.push({type: 'stem', x: 300, y: 350, color: null});

        for (let i = 0; i < 6; i++) {
            const angle = (i * Math.PI * 2) / 6;
            const x = 300 + Math.cos(angle) * 50;
            const y = 170 + Math.sin(angle) * 50;
            this.ctx.beginPath();
            this.ctx.ellipse(x, y, 35, 55, angle, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.stroke();
            this.regions.push({type: 'petal' + i, x: x, y: y, color: null});
        }

        this.ctx.beginPath();
        this.ctx.arc(300, 170, 40, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();
        this.regions.push({type: 'center', x: 300, y: 170, color: null});

        this.ctx.beginPath();
        this.ctx.ellipse(240, 320, 30, 50, -0.5, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();
        this.regions.push({type: 'leaf1', x: 240, y: 320, color: null});

        this.ctx.beginPath();
        this.ctx.ellipse(360, 320, 30, 50, 0.5, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();
        this.regions.push({type: 'leaf2', x: 360, y: 320, color: null});

        this.ctx.beginPath();
        this.ctx.arc(120, 100, 25, 0, Math.PI * 2);
        this.ctx.arc(145, 90, 30, 0, Math.PI * 2);
        this.ctx.arc(175, 100, 25, 0, Math.PI * 2);
        this.ctx.arc(150, 110, 20, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();
        this.regions.push({type: 'cloud1', x: 150, y: 100, color: null});

        this.ctx.beginPath();
        this.ctx.arc(480, 120, 20, 0, Math.PI * 2);
        this.ctx.arc(500, 110, 25, 0, Math.PI * 2);
        this.ctx.arc(525, 120, 20, 0, Math.PI * 2);
        this.ctx.arc(505, 130, 18, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();
        this.regions.push({type: 'cloud2', x: 505, y: 120, color: null});

        this.ctx.beginPath();
        this.ctx.arc(500, 60, 35, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();
        this.regions.push({type: 'sun', x: 500, y: 60, color: null});

        this.ctx.fillRect(0, 450, 600, 50);
        this.ctx.strokeRect(0, 450, 600, 50);
        this.regions.push({type: 'ground', x: 300, y: 475, color: null});
    }

    drawGeometryLevel() {
        this.ctx.lineWidth = 4;
        this.ctx.strokeStyle = '#000';
        this.ctx.fillStyle = '#ffffff';

        this.ctx.fillRect(50, 50, 150, 150);
        this.ctx.strokeRect(50, 50, 150, 150);
        this.regions.push({type: 'square1', x: 125, y: 125, color: null});

        this.ctx.beginPath();
        this.ctx.moveTo(325, 50);
        this.ctx.lineTo(250, 170);
        this.ctx.lineTo(400, 170);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();
        this.regions.push({type: 'triangle1', x: 325, y: 120, color: null});

        this.ctx.beginPath();
        this.ctx.arc(500, 125, 65, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();
        this.regions.push({type: 'circle1', x: 500, y: 125, color: null});

        this.ctx.fillRect(80, 250, 100, 180);
        this.ctx.strokeRect(80, 250, 100, 180);
        this.regions.push({type: 'rect1', x: 130, y: 340, color: null});

        this.ctx.beginPath();
        this.ctx.ellipse(325, 340, 75, 55, 0, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();
        this.regions.push({type: 'ellipse1', x: 325, y: 340, color: null});

        this.ctx.beginPath();
        this.ctx.moveTo(500, 250);
        this.ctx.lineTo(450, 330);
        this.ctx.lineTo(480, 430);
        this.ctx.lineTo(520, 430);
        this.ctx.lineTo(550, 330);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.stroke();
        this.regions.push({type: 'pentagon1', x: 500, y: 350, color: null});

        this.ctx.beginPath();
        this.ctx.rect(100, 100, 50, 50);
        this.ctx.fill();
        this.ctx.stroke();
        this.regions.push({type: 'inner1', x: 125, y: 125, color: null});

        this.ctx.beginPath();
        this.ctx.arc(325, 120, 25, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();
        this.regions.push({type: 'inner2', x: 325, y: 120, color: null});

        this.ctx.beginPath();
        this.ctx.arc(500, 125, 25, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();
        this.regions.push({type: 'inner3', x: 500, y: 125, color: null});

        this.ctx.fillRect(0, 470, 600, 30);
        this.ctx.strokeRect(0, 470, 600, 30);
        this.regions.push({type: 'ground', x: 300, y: 485, color: null});
    }

    saveState() {
        const imageData = this.ctx.getImageData(0, 0, this.width, this.height);
        const regionsCopy = JSON.parse(JSON.stringify(this.regions));
        
        if (this.historyIndex < this.history.length - 1) {
            this.history = this.history.slice(0, this.historyIndex + 1);
        }
        
        this.history.push({
            imageData: imageData,
            regions: regionsCopy,
            isComplete: this.isComplete
        });
        
        if (this.history.length > this.maxHistory) {
            this.history.shift();
        } else {
            this.historyIndex++;
        }
        
        this.updateUndoRedoButtons();
    }

    undo() {
        if (this.historyIndex > 0) {
            this.historyIndex--;
            const state = this.history[this.historyIndex];
            this.ctx.putImageData(state.imageData, 0, 0);
            this.regions = state.regions;
            this.isComplete = state.isComplete;
            this.updateUndoRedoButtons();
            this.checkComplete();
        }
    }

    redo() {
        if (this.historyIndex < this.history.length - 1) {
            this.historyIndex++;
            const state = this.history[this.historyIndex];
            this.ctx.putImageData(state.imageData, 0, 0);
            this.regions = state.regions;
            this.isComplete = state.isComplete;
            this.updateUndoRedoButtons();
            this.checkComplete();
        }
    }

    updateUndoRedoButtons() {
        document.getElementById('undoBtn').disabled = this.historyIndex <= 0;
        document.getElementById('redoBtn').disabled = this.historyIndex >= this.history.length - 1;
    }

    handleClick(e) {
        if (this.isComplete && !this.isPicker) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = Math.floor(e.clientX - rect.left);
        const y = Math.floor(e.clientY - rect.top);

        if (this.isPicker) {
            this.pickColor(x, y);
            return;
        }

        const imageData = this.ctx.getImageData(0, 0, this.width, this.height);
        const targetColor = this.getPixelColor(imageData, x, y);

        if (this.isBlack(targetColor)) return;

        if (this.isEraser) {
            this.floodFill(imageData, x, y, targetColor, [255, 255, 255, 255]);
            this.updateRegionColor(x, y, null);
        } else {
            const fillColor = this.hexToRgb(this.currentColor);
            const alphaColor = [...fillColor, Math.floor(this.opacity * 255)];
            this.floodFill(imageData, x, y, targetColor, alphaColor);
            this.updateRegionColor(x, y, this.currentColor);
        }

        this.ctx.putImageData(imageData, 0, 0);
        this.saveState();
        this.checkComplete();
    }

    pickColor(x, y) {
        const imageData = this.ctx.getImageData(0, 0, this.width, this.height);
        const color = this.getPixelColor(imageData, x, y);
        
        if (this.isBlack(color)) return;

        const hex = this.rgbToHex(color[0], color[1], color[2]);
        this.currentColor = hex;
        this.isEraser = false;
        this.isPicker = false;
        
        document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
        document.getElementById('brushBtn').classList.add('active');
        this.canvas.style.cursor = 'crosshair';
        
        this.updateColorDisplay();
        this.addToRecentColors(this.currentColor);
    }

    rgbToHex(r, g, b) {
        return '#' + [r, g, b].map(x => {
            const hex = x.toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        }).join('');
    }

    getPixelColor(imageData, x, y) {
        if (x < 0 || x >= this.width || y < 0 || y >= this.height) {
            return [0, 0, 0, 255];
        }
        const index = (y * this.width + x) * 4;
        return [
            imageData.data[index],
            imageData.data[index + 1],
            imageData.data[index + 2],
            imageData.data[index + 3]
        ];
    }

    floodFill(imageData, startX, startY, targetColor, fillColor) {
        if (this.colorsMatch(targetColor, fillColor)) return;
        if (this.isBlack(targetColor)) return;

        const pixelsToCheck = [[startX, startY]];
        const width = this.width;
        const height = this.height;
        const data = imageData.data;
        
        const visited = new Set();

        while (pixelsToCheck.length > 0) {
            const [x, y] = pixelsToCheck.pop();
            const key = `${x},${y}`;
            
            if (visited.has(key)) continue;
            if (x < 0 || x >= width || y < 0 || y >= height) continue;

            const index = (y * width + x) * 4;
            const currentColor = [
                data[index],
                data[index + 1],
                data[index + 2],
                data[index + 3]
            ];

            if (!this.colorsMatch(currentColor, targetColor)) continue;
            if (this.isBlack(currentColor)) continue;

            visited.add(key);
            
            if (fillColor[3] < 255) {
                data[index] = Math.floor(data[index] * (1 - fillColor[3]/255) + fillColor[0] * (fillColor[3]/255));
                data[index + 1] = Math.floor(data[index + 1] * (1 - fillColor[3]/255) + fillColor[1] * (fillColor[3]/255));
                data[index + 2] = Math.floor(data[index + 2] * (1 - fillColor[3]/255) + fillColor[2] * (fillColor[3]/255));
                data[index + 3] = 255;
            } else {
                data[index] = fillColor[0];
                data[index + 1] = fillColor[1];
                data[index + 2] = fillColor[2];
                data[index + 3] = fillColor[3];
            }

            if (!visited.has(`${x + 1},${y}`)) pixelsToCheck.push([x + 1, y]);
            if (!visited.has(`${x - 1},${y}`)) pixelsToCheck.push([x - 1, y]);
            if (!visited.has(`${x},${y + 1}`)) pixelsToCheck.push([x, y + 1]);
            if (!visited.has(`${x},${y - 1}`)) pixelsToCheck.push([x, y - 1]);
        }
    }

    colorsMatch(color1, color2, tolerance = 10) {
        return Math.abs(color1[0] - color2[0]) <= tolerance &&
               Math.abs(color1[1] - color2[1]) <= tolerance &&
               Math.abs(color1[2] - color2[2]) <= tolerance;
    }

    isBlack(color) {
        return color[0] < 50 && color[1] < 50 && color[2] < 50;
    }

    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? [
            parseInt(result[1], 16),
            parseInt(result[2], 16),
            parseInt(result[3], 16)
        ] : [0, 0, 0];
    }

    updateRegionColor(x, y, color) {
        let minDist = Infinity;
        let nearestRegion = null;
        
        this.regions.forEach(region => {
            const dx = x - region.x;
            const dy = y - region.y;
            const dist = dx * dx + dy * dy;
            if (dist < minDist) {
                minDist = dist;
                nearestRegion = region;
            }
        });
        
        if (nearestRegion && minDist < 10000) {
            nearestRegion.color = color;
        }
    }

    checkComplete() {
        const filledCount = this.regions.filter(r => r.color !== null).length;
        if (filledCount === this.regions.length && !this.isComplete) {
            this.isComplete = true;
            this.updateStatus('🎉 恭喜通关！所有区域已填色完成！');
            this.showCelebration();
        } else if (!this.isComplete) {
            this.updateStatus(`已填色: ${filledCount} / ${this.regions.length}`);
        }
    }

    showCelebration() {
        this.canvas.style.cursor = 'default';
    }

    updateStatus(text) {
        document.getElementById('statusText').textContent = text;
    }

    reset() {
        this.loadLevel(this.currentLevel);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new PaintGame();
});
