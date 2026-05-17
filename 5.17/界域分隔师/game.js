const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const CANVAS_WIDTH = 800;
const CANVAS_HEIGHT = 600;
canvas.width = CANVAS_WIDTH;
canvas.height = CANVAS_HEIGHT;

let gameState = {
    level: 1,
    dots: [],
    lines: [],
    currentLine: null,
    isDrawing: false,
    gravityStrength: 0.5,
    friction: 0.98,
    isWin: false,
    winTimer: 0,
    enclosedAreas: [],
    mode: 'normal',
    currentOrderTarget: 0,
    dotSpawnTimer: 0,
    pendingDots: []
};

let drawingManager;

const DOT_RADIUS = 15;
const LINE_COLOR = '#64d2ff';
const LINE_WIDTH = 3;
const DOT_COLORS = ['#ff6b6b', '#ffd93d', '#6bcb77', '#4d96ff', '#ff85a2', '#a66cff', '#ff9f43', '#00d2d3'];

const levelConfigs = [
    { dots: 3, gravity: 0.3 },
    { dots: 4, gravity: 0.4 },
    { dots: 5, gravity: 0.5 },
    { dots: 6, gravity: 0.55 },
    { dots: 7, gravity: 0.6 },
    { dots: 8, gravity: 0.65 },
    { dots: 9, gravity: 0.7 },
    { dots: 10, gravity: 0.75 },
    { dots: 11, gravity: 0.8 },
    { dots: 12, gravity: 0.85 }
];

class Dot {
    constructor(x, y, color, order = 0) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 2;
        this.vy = (Math.random() - 0.5) * 2;
        this.radius = DOT_RADIUS;
        this.color = color;
        this.groupId = -1;
        this.order = order;
        this.isolated = false;
        this.spawnScale = 0;
    }

    update(dots, gravity, deltaTime = 1) {
        if (this.spawnScale < 1) {
            this.spawnScale = Math.min(1, this.spawnScale + 0.05 * deltaTime);
        }
        
        if (this.isolated) return;
        
        for (let other of dots) {
            if (other === this || other.isolated) continue;
            
            const dx = other.x - this.x;
            const dy = other.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist > 0 && dist < 300) {
                const force = gravity / (dist * dist) * 500;
                this.vx += (dx / dist) * force;
                this.vy += (dy / dist) * force;
            }
        }

        this.vx *= gameState.friction;
        this.vy *= gameState.friction;

        this.x += this.vx;
        this.y += this.vy;

        if (this.x - this.radius < 0) {
            this.x = this.radius;
            this.vx *= -0.5;
        }
        if (this.x + this.radius > CANVAS_WIDTH) {
            this.x = CANVAS_WIDTH - this.radius;
            this.vx *= -0.5;
        }
        if (this.y - this.radius < 0) {
            this.y = this.radius;
            this.vy *= -0.5;
        }
        if (this.y + this.radius > CANVAS_HEIGHT) {
            this.y = CANVAS_HEIGHT - this.radius;
            this.vy *= -0.5;
        }

        for (let other of dots) {
            if (other === this) continue;
            const dx = other.x - this.x;
            const dy = other.y - this.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const minDist = this.radius + other.radius;
            
            if (dist < minDist) {
                const overlap = minDist - dist;
                const nx = dx / dist;
                const ny = dy / dist;
                
                this.x -= nx * overlap * 0.5;
                this.y -= ny * overlap * 0.5;
                other.x += nx * overlap * 0.5;
                other.y += ny * overlap * 0.5;
                
                const dvx = this.vx - other.vx;
                const dvy = this.vy - other.vy;
                const dvDotN = dvx * nx + dvy * ny;
                
                if (dvDotN > 0) {
                    this.vx -= dvDotN * nx * 0.5;
                    this.vy -= dvDotN * ny * 0.5;
                    other.vx += dvDotN * nx * 0.5;
                    other.vy += dvDotN * ny * 0.5;
                }
            }
        }
    }

    draw(ctx, isCurrentTarget = false) {
        const scale = this.spawnScale;
        const drawRadius = this.radius * scale;
        
        if (this.isolated) {
            ctx.globalAlpha = 0.4;
        }
        
        if (isCurrentTarget) {
            ctx.beginPath();
            ctx.arc(this.x, this.y, drawRadius + 8 + Math.sin(Date.now() / 200) * 3, 0, Math.PI * 2);
            ctx.strokeStyle = '#ff85a2';
            ctx.lineWidth = 3;
            ctx.stroke();
        }
        
        const gradient = ctx.createRadialGradient(
            this.x - drawRadius * 0.3, this.y - drawRadius * 0.3, 0,
            this.x, this.y, drawRadius
        );
        gradient.addColorStop(0, '#ffffff');
        gradient.addColorStop(0.3, this.color);
        gradient.addColorStop(1, this.darkenColor(this.color, 0.3));
        
        ctx.beginPath();
        ctx.arc(this.x, this.y, drawRadius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
        
        ctx.shadowColor = this.color;
        ctx.shadowBlur = 15;
        ctx.beginPath();
        ctx.arc(this.x, this.y, drawRadius, 0, Math.PI * 2);
        ctx.fillStyle = gradient;
        ctx.fill();
        ctx.shadowBlur = 0;

        ctx.fillStyle = '#fff';
        ctx.font = `bold ${Math.floor(12 * scale)}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(this.order + 1, this.x, this.y);
        
        ctx.globalAlpha = 1;
    }

    darkenColor(color, factor) {
        const hex = color.replace('#', '');
        const r = Math.max(0, parseInt(hex.substr(0, 2), 16) * (1 - factor));
        const g = Math.max(0, parseInt(hex.substr(2, 2), 16) * (1 - factor));
        const b = Math.max(0, parseInt(hex.substr(4, 2), 16) * (1 - factor));
        return `rgb(${Math.floor(r)}, ${Math.floor(g)}, ${Math.floor(b)})`;
    }
}

function initLevel(levelNum) {
    gameState.level = levelNum;
    const config = levelConfigs[Math.min(levelNum - 1, levelConfigs.length - 1)];
    
    gameState.dots = [];
    gameState.lines = [];
    gameState.currentLine = null;
    gameState.isDrawing = false;
    gameState.isWin = false;
    gameState.winTimer = 0;
    gameState.gravityStrength = config.gravity;
    gameState.enclosedAreas = [];
    gameState.currentOrderTarget = 0;
    gameState.dotSpawnTimer = 0;
    gameState.pendingDots = [];
    
    const padding = 80;
    const positions = [];
    
    for (let i = 0; i < config.dots; i++) {
        let x, y, valid;
        let attempts = 0;
        
        do {
            valid = true;
            x = padding + Math.random() * (CANVAS_WIDTH - padding * 2);
            y = padding + Math.random() * (CANVAS_HEIGHT - padding * 2);
            
            for (let pos of positions) {
                const dist = Math.sqrt((x - pos.x) ** 2 + (y - pos.y) ** 2);
                if (dist < DOT_RADIUS * 4) {
                    valid = false;
                    break;
                }
            }
            attempts++;
        } while (!valid && attempts < 100);
        
        positions.push({ x, y });
        const color = DOT_COLORS[i % DOT_COLORS.length];
        gameState.pendingDots.push({ x, y, color, order: i });
    }
    
    if (gameState.mode === 'order') {
        const first = gameState.pendingDots.shift();
        const firstDot = new Dot(first.x, first.y, first.color, first.order);
        firstDot.spawnScale = 1;
        gameState.dots.push(firstDot);
    } else {
        for (let dotData of gameState.pendingDots) {
            const dot = new Dot(dotData.x, dotData.y, dotData.color, dotData.order);
            dot.spawnScale = 1;
            gameState.dots.push(dot);
        }
        gameState.pendingDots = [];
    }
    
    document.getElementById('levelNum').textContent = levelNum;
    document.getElementById('dotsCount').textContent = config.dots;
    updateModeUI();
    document.getElementById('winOverlay').classList.add('hidden');
    
    if (drawingManager) {
        drawingManager.updateButtons();
    }
}

function updateModeUI() {
    const modeIndicator = document.getElementById('modeIndicator');
    const orderTarget = document.getElementById('orderTarget');
    const targetNum = document.getElementById('targetNum');
    const status = document.getElementById('status');
    
    if (gameState.mode === 'order') {
        if (modeIndicator) modeIndicator.textContent = '有序模式';
        if (orderTarget) orderTarget.classList.remove('hidden');
        const totalDots = gameState.dots.length + gameState.pendingDots.length;
        if (gameState.currentOrderTarget < totalDots) {
            if (targetNum) targetNum.textContent = gameState.currentOrderTarget + 1;
            if (status) status.textContent = '按顺序逐个隔离圆点';
        } else {
            if (status) status.textContent = '🎉 所有圆点已隔离！';
        }
    } else {
        if (modeIndicator) modeIndicator.textContent = '普通模式';
        if (orderTarget) orderTarget.classList.add('hidden');
        if (status) status.textContent = '绘制封闭区域分隔圆点';
    }
}

function lineIntersectsDot(x1, y1, x2, y2, dot) {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const fx = x1 - dot.x;
    const fy = y1 - dot.y;
    
    const a = dx * dx + dy * dy;
    const b = 2 * (fx * dx + fy * dy);
    const c = fx * fx + fy * fy - (dot.radius + LINE_WIDTH) * (dot.radius + LINE_WIDTH);
    
    let discriminant = b * b - 4 * a * c;
    if (discriminant < 0) return false;
    
    discriminant = Math.sqrt(discriminant);
    const t1 = (-b - discriminant) / (2 * a);
    const t2 = (-b + discriminant) / (2 * a);
    
    return (t1 >= 0 && t1 <= 1) || (t2 >= 0 && t2 <= 1);
}

function isPointInPolygon(point, polygon) {
    let inside = false;
    const x = point.x, y = point.y;
    
    for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
        const xi = polygon[i].x, yi = polygon[i].y;
        const xj = polygon[j].x, yj = polygon[j].y;
        
        if (((yi > y) !== (yj > y)) && (x < (xj - xi) * (y - yi) / (yj - yi) + xi)) {
            inside = !inside;
        }
    }
    
    return inside;
}

function isLineClosed(points) {
    if (points.length < 10) return false;
    const first = points[0];
    const last = points[points.length - 1];
    const dist = Math.sqrt((first.x - last.x) ** 2 + (first.y - last.y) ** 2);
    return dist < 30;
}

function lineSegmentsIntersect(p1, p2, p3, p4) {
    const d1x = p2.x - p1.x, d1y = p2.y - p1.y;
    const d2x = p4.x - p3.x, d2y = p4.y - p3.y;
    const den = d1x * d2y - d1y * d2x;
    
    if (Math.abs(den) < 0.0001) return false;
    
    const s = ((p3.x - p1.x) * d2y - (p3.y - p1.y) * d2x) / den;
    const t = ((p3.x - p1.x) * d1y - (p3.y - p1.y) * d1x) / den;
    
    return s >= 0 && s <= 1 && t >= 0 && t <= 1;
}

function checkSelfIntersection(points) {
    if (points.length < 4) return false;
    for (let i = 0; i < points.length - 3; i++) {
        for (let j = i + 2; j < points.length - 1; j++) {
            if (lineSegmentsIntersect(points[i], points[i + 1], points[j], points[j + 1])) {
                return true;
            }
        }
    }
    return false;
}

function calculateEnclosedAreas() {
    gameState.enclosedAreas = [];
    
    for (let line of gameState.lines) {
        if (line.isClosed && line.points.length >= 10) {
            const area = {
                points: line.points,
                dots: []
            };
            
            for (let dot of gameState.dots) {
                if (isPointInPolygon(dot, line.points)) {
                    area.dots.push(dot);
                }
            }
            
            gameState.enclosedAreas.push(area);
        }
    }
}

function checkWinCondition() {
    if (gameState.lines.length === 0) return false;
    
    calculateEnclosedAreas();
    
    const dotGroups = [];
    const ungroupedDots = [...gameState.dots];
    
    for (let area of gameState.enclosedAreas) {
        if (area.dots.length > 0) {
            dotGroups.push(area.dots);
            for (let dot of area.dots) {
                const idx = ungroupedDots.indexOf(dot);
                if (idx > -1) ungroupedDots.splice(idx, 1);
            }
        }
    }
    
    if (ungroupedDots.length > 0) {
        dotGroups.push(ungroupedDots);
    }
    
    for (let i = 0; i < gameState.dots.length; i++) {
        gameState.dots[i].groupId = -1;
    }
    
    for (let i = 0; i < dotGroups.length; i++) {
        for (let dot of dotGroups[i]) {
            dot.groupId = i;
        }
    }
    
    if (gameState.mode === 'order') {
        return checkOrderModeWin();
    }
    
    return dotGroups.every(group => group.length <= 1);
}

function checkOrderModeWin() {
    const nonIsolatedDots = gameState.dots.filter(d => !d.isolated);
    
    if (nonIsolatedDots.length === 0 && gameState.pendingDots.length === 0) {
        return true;
    }
    
    const newlyIsolated = [];
    for (let area of gameState.enclosedAreas) {
        for (let dot of area.dots) {
            if (!dot.isolated) {
                newlyIsolated.push(dot);
            }
        }
    }
    
    if (newlyIsolated.length > 0) {
        const targetDot = gameState.dots.find(d => d.order === gameState.currentOrderTarget);
        if (targetDot && !targetDot.isolated) {
            const isTargetInArea = newlyIsolated.some(d => d.order === gameState.currentOrderTarget);
            const hasOtherDots = newlyIsolated.some(d => d.order !== gameState.currentOrderTarget);
            
            if (isTargetInArea && newlyIsolated.length === 1) {
                targetDot.isolated = true;
                gameState.currentOrderTarget++;
                gameState.lines = [];
                gameState.enclosedAreas = [];
                
                if (gameState.pendingDots.length > 0) {
                    const next = gameState.pendingDots.shift();
                    gameState.dots.push(new Dot(next.x, next.y, next.color, next.order));
                }
                
                updateModeUI();
            } else if (hasOtherDots || newlyIsolated.length > 1) {
                gameState.lines.pop();
                gameState.enclosedAreas = [];
                for (let dot of gameState.dots) {
                    dot.groupId = -1;
                }
            }
        }
    }
    
    return false;
}

class DrawingManager {
    constructor(canvas, gameState) {
        this.canvas = canvas;
        this.gameState = gameState;
        this.undoBtn = document.getElementById('undoBtn');
        this.clearBtn = document.getElementById('clearBtn');
        this.restartBtn = document.getElementById('restartBtn');
        this.modeBtn = document.getElementById('modeBtn');
        
        this.bindEvents();
    }

    getMousePos(e) {
        const rect = this.canvas.getBoundingClientRect();
        const scaleX = this.canvas.width / rect.width;
        const scaleY = this.canvas.height / rect.height;
        
        let clientX, clientY;
        if (e.touches && e.touches.length > 0) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }
        
        return {
            x: (clientX - rect.left) * scaleX,
            y: (clientY - rect.top) * scaleY
        };
    }

    updateButtons() {
        const hasLines = this.gameState.lines.length > 0;
        const isDrawing = this.gameState.isDrawing;
        this.undoBtn.disabled = !hasLines && !isDrawing;
        this.clearBtn.disabled = !hasLines && !isDrawing;
    }

    resetDotGroups() {
        this.gameState.enclosedAreas = [];
        for (let dot of this.gameState.dots) {
            dot.groupId = -1;
        }
    }

    startDrawing(e) {
        if (this.gameState.isWin) return;
        e.preventDefault();
        
        const pos = this.getMousePos(e);
        this.gameState.isDrawing = true;
        this.gameState.currentLine = {
            points: [pos],
            isClosed: false
        };
        this.updateButtons();
    }

    draw(e) {
        if (!this.gameState.isDrawing || this.gameState.isWin) return;
        e.preventDefault();
        
        const pos = this.getMousePos(e);
        const points = this.gameState.currentLine.points;
        const lastPos = points[points.length - 1];
        const dist = Math.sqrt((pos.x - lastPos.x) ** 2 + (pos.y - lastPos.y) ** 2);
        
        if (dist > 3) {
            points.push(pos);
        }
        
        if (isLineClosed(points)) {
            this.gameState.currentLine.isClosed = true;
            points.push({ x: points[0].x, y: points[0].y });
        }
    }

    stopDrawing(e) {
        if (!this.gameState.isDrawing || this.gameState.isWin) return;
        e.preventDefault();
        
        const line = this.gameState.currentLine;
        if (line && line.points.length > 2) {
            if (isLineClosed(line.points)) {
                line.isClosed = true;
                line.points.push({ x: line.points[0].x, y: line.points[0].y });
            }
            this.gameState.lines.push(line);
        }
        
        this.gameState.currentLine = null;
        this.gameState.isDrawing = false;
        this.updateButtons();
    }

    undo() {
        if (this.gameState.lines.length > 0) {
            this.gameState.lines.pop();
            this.resetDotGroups();
            this.updateButtons();
        }
    }

    clear() {
        this.gameState.lines = [];
        this.gameState.currentLine = null;
        this.resetDotGroups();
        this.updateButtons();
    }

    restart() {
        initLevel(this.gameState.level);
    }

    toggleMode() {
        this.gameState.mode = this.gameState.mode === 'normal' ? 'order' : 'normal';
        this.modeBtn.textContent = this.gameState.mode === 'normal' ? '切换有序模式' : '切换普通模式';
        initLevel(this.gameState.level);
    }

    bindEvents() {
        this.canvas.addEventListener('mousedown', (e) => this.startDrawing(e));
        this.canvas.addEventListener('mousemove', (e) => this.draw(e));
        this.canvas.addEventListener('mouseup', (e) => this.stopDrawing(e));
        this.canvas.addEventListener('mouseleave', (e) => this.stopDrawing(e));
        
        this.canvas.addEventListener('touchstart', (e) => this.startDrawing(e));
        this.canvas.addEventListener('touchmove', (e) => this.draw(e));
        this.canvas.addEventListener('touchend', (e) => this.stopDrawing(e));
        
        this.undoBtn.addEventListener('click', () => this.undo());
        this.clearBtn.addEventListener('click', () => this.clear());
        this.restartBtn.addEventListener('click', () => this.restart());
        this.modeBtn.addEventListener('click', () => this.toggleMode());
    }
}

function drawGrid() {
    ctx.strokeStyle = 'rgba(100, 210, 255, 0.1)';
    ctx.lineWidth = 1;
    
    const gridSize = 40;
    for (let x = 0; x <= CANVAS_WIDTH; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, CANVAS_HEIGHT);
        ctx.stroke();
    }
    for (let y = 0; y <= CANVAS_HEIGHT; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(CANVAS_WIDTH, y);
        ctx.stroke();
    }
}

function drawLines() {
    for (let line of gameState.lines) {
        if (line.points.length < 2) continue;
        
        ctx.beginPath();
        ctx.moveTo(line.points[0].x, line.points[0].y);
        
        for (let i = 1; i < line.points.length; i++) {
            ctx.lineTo(line.points[i].x, line.points[i].y);
        }
        
        ctx.strokeStyle = line.isClosed ? 'rgba(100, 210, 255, 0.8)' : LINE_COLOR;
        ctx.lineWidth = LINE_WIDTH;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();
        
        if (line.isClosed) {
            ctx.fillStyle = 'rgba(100, 210, 255, 0.1)';
            ctx.fill();
        }
    }
    
    if (gameState.currentLine && gameState.currentLine.points.length > 1) {
        ctx.beginPath();
        ctx.moveTo(gameState.currentLine.points[0].x, gameState.currentLine.points[0].y);
        
        for (let i = 1; i < gameState.currentLine.points.length; i++) {
            ctx.lineTo(gameState.currentLine.points[i].x, gameState.currentLine.points[i].y);
        }
        
        ctx.strokeStyle = LINE_COLOR;
        ctx.lineWidth = LINE_WIDTH;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        ctx.stroke();
        
        const first = gameState.currentLine.points[0];
        ctx.beginPath();
        ctx.arc(first.x, first.y, 8, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(100, 210, 255, 0.5)';
        ctx.fill();
    }
}

function drawGravityLines() {
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.1)';
    ctx.lineWidth = 1;
    
    for (let i = 0; i < gameState.dots.length; i++) {
        for (let j = i + 1; j < gameState.dots.length; j++) {
            const d1 = gameState.dots[i];
            const d2 = gameState.dots[j];
            
            if (gameState.mode === 'order' && (d1.isolated || d2.isolated)) {
                continue;
            }
            
            const dist = Math.sqrt((d1.x - d2.x) ** 2 + (d1.y - d2.y) ** 2);
            
            if (dist < 200 && d1.groupId === d2.groupId) {
                ctx.beginPath();
                ctx.moveTo(d1.x, d1.y);
                ctx.lineTo(d2.x, d2.y);
                ctx.stroke();
            }
        }
    }
}

function gameLoop() {
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);
    
    drawGrid();
    
    if (!gameState.isWin) {
        for (let dot of gameState.dots) {
            dot.update(gameState.dots, gameState.gravityStrength);
        }
    }
    
    drawGravityLines();
    drawLines();
    
    for (let dot of gameState.dots) {
        const isCurrentTarget = gameState.mode === 'order' && 
                                dot.order === gameState.currentOrderTarget && 
                                !dot.isolated;
        dot.draw(ctx, isCurrentTarget);
    }
    
    if (!gameState.isWin && gameState.lines.length > 0) {
        if (checkWinCondition()) {
            gameState.isWin = true;
            gameState.winTimer = Date.now();
            document.getElementById('status').textContent = '🎉 通关成功！';
            document.getElementById('nextLevel').textContent = gameState.level + 1;
            document.getElementById('winOverlay').classList.remove('hidden');
            
            setTimeout(() => {
                initLevel(gameState.level + 1);
            }, 2000);
        }
    }
    
    requestAnimationFrame(gameLoop);
}

drawingManager = new DrawingManager(canvas, gameState);
initLevel(1);
gameLoop();
