class OneStrokeGame {
    constructor() {
        this.init();
    }

    init() {
        this.gameState = {
            score: 0,
            isDrawing: false,
            currentShape: null,
            drawnPath: [],
            coveredSegments: new Set(),
            currentPool: 'buddha'
        };

        this.tolerance = 45;
        this.lineWidth = 7;
        this.canvasSize = 400;
        this.center = 200;
        this.shapeSize = 110;

        this.pools = {
            buddha: ['square', 'triangle', 'diamond'],
            casual: ['heart', 'cloud', 'crescent', 'miniflower']
        };

        this.shapeLibrary = this.createShapeLibrary();
        this.setupCanvases();
        this.setupEventListeners();
        this.generateNewShape();
    }

    createShapeLibrary() {
        const cx = this.center;
        const cy = this.center;
        const size = this.shapeSize;

        return {
            square: {
                name: '正方形',
                draw: (ctx) => {
                    ctx.beginPath();
                    ctx.rect(cx - size, cy - size, size * 2, size * 2);
                    ctx.stroke();
                },
                getPath: () => [
                    { x: cx - size, y: cy - size },
                    { x: cx + size, y: cy - size },
                    { x: cx + size, y: cy + size },
                    { x: cx - size, y: cy + size },
                    { x: cx - size, y: cy - size }
                ]
            },
            triangle: {
                name: '三角形',
                draw: (ctx) => {
                    ctx.beginPath();
                    ctx.moveTo(cx, cy - size * 1.1);
                    ctx.lineTo(cx + size, cy + size * 0.8);
                    ctx.lineTo(cx - size, cy + size * 0.8);
                    ctx.closePath();
                    ctx.stroke();
                },
                getPath: () => [
                    { x: cx, y: cy - size * 1.1 },
                    { x: cx + size, y: cy + size * 0.8 },
                    { x: cx - size, y: cy + size * 0.8 },
                    { x: cx, y: cy - size * 1.1 }
                ]
            },
            diamond: {
                name: '菱形',
                draw: (ctx) => {
                    ctx.beginPath();
                    ctx.moveTo(cx, cy - size * 1.15);
                    ctx.lineTo(cx + size * 0.85, cy);
                    ctx.lineTo(cx, cy + size * 1.15);
                    ctx.lineTo(cx - size * 0.85, cy);
                    ctx.closePath();
                    ctx.stroke();
                },
                getPath: () => [
                    { x: cx, y: cy - size * 1.15 },
                    { x: cx + size * 0.85, y: cy },
                    { x: cx, y: cy + size * 1.15 },
                    { x: cx - size * 0.85, y: cy },
                    { x: cx, y: cy - size * 1.15 }
                ]
            },
            heart: {
                name: '爱心',
                draw: (ctx) => {
                    ctx.beginPath();
                    ctx.moveTo(cx, cy + size * 0.6);
                    ctx.bezierCurveTo(cx - size * 1.2, cy - size * 0.1, cx - size * 0.9, cy - size * 1.0, cx, cy - size * 0.45);
                    ctx.bezierCurveTo(cx + size * 0.9, cy - size * 1.0, cx + size * 1.2, cy - size * 0.1, cx, cy + size * 0.6);
                    ctx.stroke();
                },
                getPath: () => {
                    const points = [];
                    for (let t = 0; t <= 1; t += 0.025) {
                        points.push(this.bezierPoint(
                            { x: cx, y: cy + size * 0.6 },
                            { x: cx - size * 1.2, y: cy - size * 0.1 },
                            { x: cx - size * 0.9, y: cy - size * 1.0 },
                            { x: cx, y: cy - size * 0.45 },
                            t
                        ));
                    }
                    for (let t = 0; t <= 1; t += 0.025) {
                        points.push(this.bezierPoint(
                            { x: cx, y: cy - size * 0.45 },
                            { x: cx + size * 0.9, y: cy - size * 1.0 },
                            { x: cx + size * 1.2, y: cy - size * 0.1 },
                            { x: cx, y: cy + size * 0.6 },
                            t
                        ));
                    }
                    return points;
                }
            },
            cloud: {
                name: '云朵',
                draw: (ctx) => {
                    ctx.beginPath();
                    ctx.moveTo(cx - size * 1.25, cy + size * 0.2);
                    ctx.arc(cx - size * 0.85, cy - size * 0.1, size * 0.45, Math.PI, 0);
                    ctx.arc(cx - size * 0.25, cy - size * 0.35, size * 0.52, Math.PI, 0);
                    ctx.arc(cx + size * 0.4, cy - size * 0.1, size * 0.48, Math.PI, 0);
                    ctx.arc(cx + size * 0.9, cy + size * 0.1, size * 0.42, Math.PI * 1.5, Math.PI * 0.5);
                    ctx.arc(cx + size * 0.35, cy + size * 0.3, size * 0.4, 0, Math.PI);
                    ctx.arc(cx - size * 0.4, cy + size * 0.3, size * 0.4, 0, Math.PI);
                    ctx.closePath();
                    ctx.stroke();
                },
                getPath: () => {
                    const points = [];
                    points.push({ x: cx - size * 1.25, y: cy + size * 0.2 });
                    
                    const arc1 = this.getArcPoints(cx - size * 0.85, cy - size * 0.1, size * 0.45, Math.PI, 0);
                    points.push(...arc1);
                    
                    const arc2 = this.getArcPoints(cx - size * 0.25, cy - size * 0.35, size * 0.52, Math.PI, 0);
                    points.push(...arc2);
                    
                    const arc3 = this.getArcPoints(cx + size * 0.4, cy - size * 0.1, size * 0.48, Math.PI, 0);
                    points.push(...arc3);
                    
                    const arc4 = this.getArcPoints(cx + size * 0.9, cy + size * 0.1, size * 0.42, Math.PI * 1.5, Math.PI * 0.5);
                    points.push(...arc4);
                    
                    const arc5 = this.getArcPoints(cx + size * 0.35, cy + size * 0.3, size * 0.4, 0, Math.PI);
                    points.push(...arc5);
                    
                    const arc6 = this.getArcPoints(cx - size * 0.4, cy + size * 0.3, size * 0.4, 0, Math.PI);
                    points.push(...arc6);
                    
                    points.push({ x: cx - size * 1.25, y: cy + size * 0.2 });
                    return points;
                }
            },
            crescent: {
                name: '月牙',
                draw: (ctx) => {
                    ctx.beginPath();
                    ctx.arc(cx, cy, size * 1.05, Math.PI * 0.28, Math.PI * 1.72);
                    ctx.quadraticCurveTo(cx + size * 0.35, cy, cx, cy - size * 1.02);
                    ctx.stroke();
                },
                getPath: () => {
                    const points = [];
                    for (let i = 0; i <= 22; i++) {
                        const angle = Math.PI * 0.28 + (i / 22) * Math.PI * 1.44;
                        points.push({
                            x: cx + Math.cos(angle) * size * 1.05,
                            y: cy + Math.sin(angle) * size * 1.05
                        });
                    }
                    for (let t = 0; t <= 1; t += 0.035) {
                        const start = { x: cx + Math.cos(Math.PI * 1.72) * size * 1.05, y: cy + Math.sin(Math.PI * 1.72) * size * 1.05 };
                        const end = { x: cx, y: cy - size * 1.02 };
                        const ctrl = { x: cx + size * 0.35, y: cy };
                        const mt = 1 - t;
                        points.push({
                            x: mt * mt * start.x + 2 * mt * t * ctrl.x + t * t * end.x,
                            y: mt * mt * start.y + 2 * mt * t * ctrl.y + t * t * end.y
                        });
                    }
                    return points;
                }
            },
            miniflower: {
                name: '小花花',
                draw: (ctx) => {
                    ctx.beginPath();
                    for (let i = 0; i < 4; i++) {
                        const angle = (i / 4) * Math.PI * 2 - Math.PI / 4;
                        const nextAngle = ((i + 1) / 4) * Math.PI * 2 - Math.PI / 4;
                        const cpAngle = angle + Math.PI / 4;
                        
                        const startX = cx + Math.cos(angle) * size * 0.28;
                        const startY = cy + Math.sin(angle) * size * 0.28;
                        
                        const cpX = cx + Math.cos(cpAngle) * size * 1.15;
                        const cpY = cy + Math.sin(cpAngle) * size * 1.15;
                        
                        const endX = cx + Math.cos(nextAngle) * size * 0.28;
                        const endY = cy + Math.sin(nextAngle) * size * 0.28;
                        
                        if (i === 0) ctx.moveTo(startX, startY);
                        ctx.quadraticCurveTo(cpX, cpY, endX, endY);
                    }
                    ctx.closePath();
                    ctx.stroke();
                    
                    ctx.beginPath();
                    ctx.arc(cx, cy, size * 0.22, 0, Math.PI * 2);
                    ctx.stroke();
                },
                getPath: () => {
                    const points = [];
                    for (let i = 0; i < 4; i++) {
                        const angle = (i / 4) * Math.PI * 2 - Math.PI / 4;
                        const nextAngle = ((i + 1) / 4) * Math.PI * 2 - Math.PI / 4;
                        const cpAngle = angle + Math.PI / 4;
                        
                        const start = { x: cx + Math.cos(angle) * size * 0.28, y: cy + Math.sin(angle) * size * 0.28 };
                        const cp = { x: cx + Math.cos(cpAngle) * size * 1.15, y: cy + Math.sin(cpAngle) * size * 1.15 };
                        const end = { x: cx + Math.cos(nextAngle) * size * 0.28, y: cy + Math.sin(nextAngle) * size * 0.28 };
                        
                        if (i === 0) points.push(start);
                        
                        for (let t = 0; t <= 1; t += 0.05) {
                            const mt = 1 - t;
                            points.push({
                                x: mt * mt * start.x + 2 * mt * t * cp.x + t * t * end.x,
                                y: mt * mt * start.y + 2 * mt * t * cp.y + t * t * end.y
                            });
                        }
                    }
                    
                    const firstAngle = -Math.PI / 4;
                    points.push({ x: cx + Math.cos(firstAngle) * size * 0.28, y: cy + Math.sin(firstAngle) * size * 0.28 });
                    
                    for (let i = 0; i <= 18; i++) {
                        const a = (i / 18) * Math.PI * 2;
                        points.push({
                            x: cx + Math.cos(a) * size * 0.22,
                            y: cy + Math.sin(a) * size * 0.22
                        });
                    }
                    
                    points.push({ x: cx + Math.cos(firstAngle) * size * 0.28, y: cy + Math.sin(firstAngle) * size * 0.28 });
                    return points;
                }
            }
        };
    }

    bezierPoint(p0, p1, p2, p3, t) {
        const mt = 1 - t;
        return {
            x: mt * mt * mt * p0.x + 3 * mt * mt * t * p1.x + 3 * mt * t * t * p2.x + t * t * t * p3.x,
            y: mt * mt * mt * p0.y + 3 * mt * mt * t * p1.y + 3 * mt * t * t * p2.y + t * t * t * p3.y
        };
    }

    getArcPoints(cx, cy, radius, startAngle, endAngle) {
        const points = [];
        const steps = 11;
        let angleDiff = endAngle - startAngle;
        if (angleDiff < 0) angleDiff += Math.PI * 2;
        
        for (let i = 0; i <= steps; i++) {
            const angle = startAngle + (i / steps) * angleDiff;
            points.push({
                x: cx + Math.cos(angle) * radius,
                y: cy + Math.sin(angle) * radius
            });
        }
        return points;
    }

    setupCanvases() {
        this.refCanvas = document.getElementById('reference-canvas');
        this.drawCanvas = document.getElementById('draw-canvas');
        this.refCtx = this.refCanvas.getContext('2d');
        this.drawCtx = this.drawCanvas.getContext('2d');

        this.refCanvas.width = this.canvasSize;
        this.refCanvas.height = this.canvasSize;
        this.drawCanvas.width = this.canvasSize;
        this.drawCanvas.height = this.canvasSize;
    }

    setupEventListeners() {
        const canvas = this.drawCanvas;

        canvas.addEventListener('mousedown', (e) => this.startDrawing(e));
        canvas.addEventListener('mousemove', (e) => this.draw(e));
        canvas.addEventListener('mouseup', () => this.stopDrawing());
        canvas.addEventListener('mouseleave', () => this.stopDrawing());

        canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
            this.startDrawing(e.touches[0]);
        });
        canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
            this.draw(e.touches[0]);
        });
        canvas.addEventListener('touchend', () => this.stopDrawing());

        document.getElementById('next-btn').addEventListener('click', () => this.generateNewShape());
        document.getElementById('reset-btn').addEventListener('click', () => this.resetDrawing());
        
        document.getElementById('pool-buddha').addEventListener('click', () => this.switchPool('buddha'));
        document.getElementById('pool-casual').addEventListener('click', () => this.switchPool('casual'));
    }

    switchPool(poolName) {
        this.gameState.currentPool = poolName;
        
        document.querySelectorAll('.pool-btn').forEach(btn => btn.classList.remove('active'));
        document.getElementById(`pool-${poolName}`).classList.add('active');
        
        this.generateNewShape();
    }

    generateNewShape() {
        const shapes = this.pools[this.gameState.currentPool];
        const randomIndex = Math.floor(Math.random() * shapes.length);
        this.gameState.currentShape = shapes[randomIndex];
        
        this.resetDrawing();
        this.drawReference();
        document.getElementById('shape-name').textContent = this.shapeLibrary[this.gameState.currentShape].name;
    }

    drawReference() {
        const ctx = this.refCtx;
        ctx.clearRect(0, 0, this.canvasSize, this.canvasSize);
        ctx.strokeStyle = '#c8e6d9';
        ctx.lineWidth = 5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        this.shapeLibrary[this.gameState.currentShape].draw(ctx);
    }

    resetDrawing() {
        const ctx = this.drawCtx;
        ctx.clearRect(0, 0, this.canvasSize, this.canvasSize);
        this.gameState.drawnPath = [];
        this.gameState.coveredSegments = new Set();
        this.gameState.isDrawing = false;
        this.hideMessage();
    }

    getCanvasPosition(e) {
        const rect = this.drawCanvas.getBoundingClientRect();
        const scaleX = this.canvasSize / rect.width;
        const scaleY = this.canvasSize / rect.height;
        return {
            x: (e.clientX - rect.left) * scaleX,
            y: (e.clientY - rect.top) * scaleY
        };
    }

    startDrawing(e) {
        this.gameState.isDrawing = true;
        const pos = this.getCanvasPosition(e);
        this.gameState.drawnPath = [pos];
        
        this.drawCtx.strokeStyle = '#4a9d7c';
        this.drawCtx.lineWidth = this.lineWidth;
        this.drawCtx.lineCap = 'round';
        this.drawCtx.lineJoin = 'round';
        this.drawCtx.beginPath();
        this.drawCtx.moveTo(pos.x, pos.y);
    }

    draw(e) {
        if (!this.gameState.isDrawing) return;
        
        const pos = this.getCanvasPosition(e);
        this.gameState.drawnPath.push(pos);
        
        this.drawCtx.lineTo(pos.x, pos.y);
        this.drawCtx.stroke();
        this.drawCtx.beginPath();
        this.drawCtx.moveTo(pos.x, pos.y);
        
        this.checkPathCoverage(pos);
    }

    stopDrawing() {
        if (!this.gameState.isDrawing) return;
        this.gameState.isDrawing = false;
        
        if (this.gameState.drawnPath.length > 1) {
            this.validateDrawing();
        }
    }

    checkPathCoverage(point) {
        if (!this.gameState.currentShape) return;
        
        const shape = this.shapeLibrary[this.gameState.currentShape];
        const pathPoints = shape.getPath();
        
        for (let i = 0; i < pathPoints.length - 1; i++) {
            const dist = this.pointToSegmentDistance(point, pathPoints[i], pathPoints[i + 1]);
            if (dist < this.tolerance) {
                this.gameState.coveredSegments.add(i);
            }
        }
    }

    pointToSegmentDistance(p, a, b) {
        const atob = { x: b.x - a.x, y: b.y - a.y };
        const atop = { x: p.x - a.x, y: p.y - a.y };
        const len = atob.x * atob.x + atob.y * atob.y;
        let dot = atop.x * atob.x + atop.y * atob.y;
        let t = Math.min(Math.max(dot / len, 0), 1);
        
        const closest = {
            x: a.x + atob.x * t,
            y: a.y + atob.y * t
        };
        
        const dx = p.x - closest.x;
        const dy = p.y - closest.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    validateDrawing() {
        const shape = this.shapeLibrary[this.gameState.currentShape];
        const pathPoints = shape.getPath();
        const totalSegments = pathPoints.length - 1;
        const coverage = this.gameState.coveredSegments.size / totalSegments;
        
        if (coverage >= 0.82) {
            this.gameState.score += 10;
            document.getElementById('score').textContent = this.gameState.score;
            this.showMessage('完美！🌟');
            
            setTimeout(() => {
                this.generateNewShape();
            }, 1300);
        } else if (coverage >= 0.55) {
            this.showMessage('差一点哦～');
        } else {
            this.showMessage('再试一下吧');
        }
    }

    showMessage(text) {
        const msgEl = document.getElementById('game-message');
        msgEl.textContent = text;
        msgEl.classList.add('show');
    }

    hideMessage() {
        const msgEl = document.getElementById('game-message');
        msgEl.classList.remove('show');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new OneStrokeGame();
});
