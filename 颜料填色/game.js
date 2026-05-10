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
        this.isComplete = false;
        this.regions = [];
        this.filledRegions = new Set();
        
        this.init();
    }
    
    init() {
        this.createColorPanel();
        this.bindEvents();
        this.drawPattern();
        this.updateStatus('请选择颜色开始填色');
    }
    
    createColorPanel() {
        const panel = document.getElementById('colorPanel');
        this.colors.forEach((color, index) => {
            const btn = document.createElement('div');
            btn.className = 'color-btn' + (index === 0 ? ' active' : '');
            btn.style.background = color;
            btn.addEventListener('click', () => this.selectColor(color, btn));
            panel.appendChild(btn);
        });
    }
    
    selectColor(color, btn) {
        if (this.isComplete) return;
        
        this.currentColor = color;
        this.isEraser = false;
        
        document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        document.getElementById('brushBtn').classList.add('active');
        this.canvas.style.cursor = 'crosshair';
    }
    
    bindEvents() {
        this.canvas.addEventListener('click', (e) => this.handleClick(e));
        
        document.getElementById('brushBtn').addEventListener('click', () => {
            if (this.isComplete) return;
            this.isEraser = false;
            document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
            document.getElementById('brushBtn').classList.add('active');
            this.canvas.style.cursor = 'crosshair';
        });
        
        document.getElementById('eraserBtn').addEventListener('click', () => {
            if (this.isComplete) return;
            this.isEraser = true;
            document.querySelectorAll('.tool-btn').forEach(b => b.classList.remove('active'));
            document.getElementById('eraserBtn').classList.add('active');
            this.canvas.style.cursor = 'cell';
        });
        
        document.getElementById('resetBtn').addEventListener('click', () => this.reset());
    }
    
    drawPattern() {
        this.ctx.lineWidth = 4;
        this.ctx.strokeStyle = '#000';
        this.ctx.fillStyle = '#ffffff';
        
        this.drawHouse();
        this.drawTree();
        this.drawSun();
        this.drawCloud();
        this.drawGround();
    }
    
    drawHouse() {
        this.ctx.beginPath();
        this.ctx.moveTo(100, 350);
        this.ctx.lineTo(100, 200);
        this.ctx.lineTo(200, 130);
        this.ctx.lineTo(300, 200);
        this.ctx.lineTo(300, 350);
        this.ctx.closePath();
        this.ctx.stroke();
        this.regions.push({type: 'roof', x: 200, y: 200, color: null});
        
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
    }
    
    drawTree() {
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
    }
    
    drawSun() {
        this.ctx.beginPath();
        this.ctx.arc(500, 80, 40, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();
        this.regions.push({type: 'sun', x: 500, y: 80, color: null});
    }
    
    drawCloud() {
        this.ctx.beginPath();
        this.ctx.arc(150, 80, 25, 0, Math.PI * 2);
        this.ctx.arc(180, 70, 30, 0, Math.PI * 2);
        this.ctx.arc(210, 80, 25, 0, Math.PI * 2);
        this.ctx.arc(180, 90, 20, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.stroke();
        this.regions.push({type: 'cloud', x: 180, y: 80, color: null});
    }
    
    drawGround() {
        this.ctx.fillRect(0, 400, 600, 100);
        this.ctx.strokeRect(0, 400, 600, 100);
        this.regions.push({type: 'ground', x: 300, y: 450, color: null});
    }
    
    handleClick(e) {
        if (this.isComplete) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = Math.floor(e.clientX - rect.left);
        const y = Math.floor(e.clientY - rect.top);
        
        const imageData = this.ctx.getImageData(0, 0, this.width, this.height);
        const targetColor = this.getPixelColor(imageData, x, y);
        
        if (this.isEraser) {
            this.floodFill(imageData, x, y, targetColor, [255, 255, 255, 255]);
            this.updateRegionColor(x, y, null);
        } else {
            const fillColor = this.hexToRgb(this.currentColor);
            this.floodFill(imageData, x, y, targetColor, [...fillColor, 255]);
            this.updateRegionColor(x, y, this.currentColor);
        }
        
        this.ctx.putImageData(imageData, 0, 0);
        this.checkComplete();
    }
    
    getPixelColor(imageData, x, y) {
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
        
        while (pixelsToCheck.length > 0) {
            const [x, y] = pixelsToCheck.pop();
            
            if (x < 0 || x >= width || y < 0 || y >= height) continue;
            
            const index = (y * width + x) * 4;
            const currentColor = [
                data[index],
                data[index + 1],
                data[index + 2],
                data[index + 3]
            ];
            
            if (!this.colorsMatch(currentColor, targetColor)) continue;
            
            data[index] = fillColor[0];
            data[index + 1] = fillColor[1];
            data[index + 2] = fillColor[2];
            data[index + 3] = fillColor[3];
            
            pixelsToCheck.push([x + 1, y], [x - 1, y], [x, y + 1], [x, y - 1]);
        }
    }
    
    colorsMatch(color1, color2) {
        return color1[0] === color2[0] && color1[1] === color2[1] && 
               color1[2] === color2[2] && color1[3] === color2[3];
    }
    
    isBlack(color) {
        return color[0] === 0 && color[1] === 0 && color[2] === 0;
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
        this.regions.forEach(region => {
            const dx = Math.abs(x - region.x);
            const dy = Math.abs(y - region.y);
            if (dx < 80 && dy < 80) {
                region.color = color;
            }
        });
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
        this.isComplete = false;
        this.filledRegions.clear();
        this.regions.forEach(r => r.color = null);
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.drawPattern();
        this.canvas.style.cursor = 'crosshair';
        this.updateStatus('请选择颜色开始填色');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new PaintGame();
});
