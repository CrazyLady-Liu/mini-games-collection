const GameState = {
    READY: 'ready',
    RUNNING: 'running',
    WIN: 'win',
    LOSE: 'lose'
};

const DifficultyConfig = {
    easy: {
        cols: 13,
        rows: 11,
        cellSize: 36,
        timeLeft: 100,
        removeDeadEnds: 0.6,
        addBranches: 0.3,
        colors: {
            wall: '#93c5fd',
            wallBorder: '#3b82f6',
            wallHighlight: '#bfdbfe',
            path: '#fef3c7',
            pathDark: '#fde68a',
            grass: '#86efac',
            grassDark: '#4ade80',
            player: '#fb7185',
            playerHighlight: '#fda4af',
            exit: '#4ade80',
            exitBorder: '#22c55e',
            exitGlow: '#86efac'
        }
    },
    normal: {
        cols: 19,
        rows: 15,
        cellSize: 30,
        timeLeft: 85,
        removeDeadEnds: 0.35,
        addBranches: 0.2,
        colors: {
            wall: '#c4b5fd',
            wallBorder: '#8b5cf6',
            wallHighlight: '#ddd6fe',
            path: '#fce7f3',
            pathDark: '#fbcfe8',
            grass: '#a7f3d0',
            grassDark: '#6ee7b7',
            player: '#f472b6',
            playerHighlight: '#f9a8d4',
            exit: '#4ade80',
            exitBorder: '#22c55e',
            exitGlow: '#86efac'
        }
    },
    hard: {
        cols: 27,
        rows: 21,
        cellSize: 24,
        timeLeft: 70,
        removeDeadEnds: 0,
        addBranches: 0,
        colors: {
            wall: '#fda4af',
            wallBorder: '#f43f5e',
            wallHighlight: '#fecaca',
            path: '#fef2f2',
            pathDark: '#fecaca',
            grass: '#fecdd3',
            grassDark: '#fda4af',
            player: '#f87171',
            playerHighlight: '#fca5a5',
            exit: '#4ade80',
            exitBorder: '#22c55e',
            exitGlow: '#86efac'
        }
    }
};

class MazeGame {
    constructor() {
        this.canvas = document.getElementById('maze-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.addRoundRectPolyfill();
        this.difficulty = 'easy';
        this.config = DifficultyConfig.easy;
        this.grassPattern = null;
        
        this.initDifficulty();
        this.initGame();
    }
    
    addRoundRectPolyfill() {
        if (!this.ctx.roundRect) {
            this.ctx.roundRect = function(x, y, width, height, radius) {
                if (typeof radius === 'number') {
                    radius = {tl: radius, tr: radius, br: radius, bl: radius};
                }
                this.moveTo(x + radius.tl, y);
                this.lineTo(x + width - radius.tr, y);
                this.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
                this.lineTo(x + width, y + height - radius.br);
                this.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
                this.lineTo(x + radius.bl, y + height);
                this.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
                this.lineTo(x, y + radius.tl);
                this.quadraticCurveTo(x, y, x + radius.tl, y);
                this.closePath();
            };
        }
    }
    
    initDifficulty() {
        const buttons = document.querySelectorAll('.difficulty-btn');
        buttons.forEach(btn => {
            btn.addEventListener('click', () => {
                if (this.state === GameState.RUNNING) return;
                
                buttons.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                this.difficulty = btn.dataset.difficulty;
                this.config = DifficultyConfig[this.difficulty];
                this.initGame();
            });
        });
    }
    
    initGame() {
        this.cols = this.config.cols;
        this.rows = this.config.rows;
        this.cellSize = this.config.cellSize;
        this.canvas.width = this.cols * this.cellSize;
        this.canvas.height = this.rows * this.cellSize;
        
        this.maze = [];
        this.player = { x: 1, y: 1 };
        this.playerTarget = { x: 1, y: 1 };
        this.exit = { x: this.cols - 2, y: this.rows - 2 };
        this.timeLeft = this.config.timeLeft;
        this.state = GameState.READY;
        this.timerInterval = null;
        this.animationId = null;
        this.decorations = [];
        
        this.generateMaze();
        this.generateDecorations();
        this.draw();
        this.setupEventListeners();
        this.updateTimeDisplay();
        this.updateStatus('准备开始');
    }
    
    setupEventListeners() {
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.getElementById('start-btn').addEventListener('click', () => this.startGame());
        document.getElementById('reset-btn').addEventListener('click', () => this.resetGame());
        document.getElementById('modal-btn').addEventListener('click', () => this.resetGame());
    }
    
    generateMaze() {
        for (let y = 0; y < this.rows; y++) {
            this.maze[y] = [];
            for (let x = 0; x < this.cols; x++) {
                this.maze[y][x] = 1;
            }
        }
        
        const stack = [];
        const startX = 1;
        const startY = 1;
        this.maze[startY][startX] = 0;
        stack.push({ x: startX, y: startY });
        
        while (stack.length > 0) {
            const current = stack[stack.length - 1];
            const neighbors = this.getUnvisitedNeighbors(current.x, current.y);
            
            if (neighbors.length > 0) {
                const randomIndex = Math.floor(Math.random() * neighbors.length);
                const next = neighbors[randomIndex];
                const wallX = current.x + (next.x - current.x) / 2;
                const wallY = current.y + (next.y - current.y) / 2;
                this.maze[wallY][wallX] = 0;
                this.maze[next.y][next.x] = 0;
                stack.push(next);
            } else {
                stack.pop();
            }
        }
        
        if (this.config.addBranches > 0) {
            this.addExtraBranches(this.config.addBranches);
        }
        
        if (this.config.removeDeadEnds > 0) {
            this.removeSomeDeadEnds(this.config.removeDeadEnds);
        }
        
        this.ensurePathToExit();
    }
    
    getUnvisitedNeighbors(x, y) {
        const neighbors = [];
        const directions = [
            { dx: 0, dy: -2 },
            { dx: 2, dy: 0 },
            { dx: 0, dy: 2 },
            { dx: -2, dy: 0 }
        ];
        
        for (const dir of directions) {
            const nx = x + dir.dx;
            const ny = y + dir.dy;
            if (nx > 0 && nx < this.cols - 1 && ny > 0 && ny < this.rows - 1 && this.maze[ny][nx] === 1) {
                neighbors.push({ x: nx, y: ny });
            }
        }
        
        for (let i = neighbors.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [neighbors[i], neighbors[j]] = [neighbors[j], neighbors[i]];
        }
        
        return neighbors;
    }
    
    addExtraBranches(ratio) {
        const wallsToRemove = [];
        
        for (let y = 2; y < this.rows - 2; y += 2) {
            for (let x = 2; x < this.cols - 2; x += 2) {
                const directions = [
                    { dx: 0, dy: -1 },
                    { dx: 1, dy: 0 },
                    { dx: 0, dy: 1 },
                    { dx: -1, dy: 0 }
                ];
                
                for (const dir of directions) {
                    const wx = x + dir.dx;
                    const wy = y + dir.dy;
                    const nx = x + dir.dx * 2;
                    const ny = y + dir.dy * 2;
                    
                    if (this.maze[y][x] === 0 && this.maze[ny][nx] === 0 && this.maze[wy][wx] === 1) {
                        wallsToRemove.push({ x: wx, y: wy });
                    }
                }
            }
        }
        
        const toRemove = Math.floor(wallsToRemove.length * ratio);
        for (let i = 0; i < toRemove; i++) {
            if (wallsToRemove.length === 0) break;
            const index = Math.floor(Math.random() * wallsToRemove.length);
            const wall = wallsToRemove.splice(index, 1)[0];
            this.maze[wall.y][wall.x] = 0;
        }
    }
    
    removeSomeDeadEnds(ratio) {
        const deadEnds = [];
        
        for (let y = 1; y < this.rows - 1; y++) {
            for (let x = 1; x < this.cols - 1; x++) {
                if (this.maze[y][x] === 0) {
                    let wallCount = 0;
                    const directions = [
                        { dx: 0, dy: -1 },
                        { dx: 1, dy: 0 },
                        { dx: 0, dy: 1 },
                        { dx: -1, dy: 0 }
                    ];
                    
                    for (const dir of directions) {
                        if (this.maze[y + dir.dy][x + dir.dx] === 1) {
                            wallCount++;
                        }
                    }
                    
                    if (wallCount === 3) {
                        deadEnds.push({ x, y });
                    }
                }
            }
        }
        
        const toRemove = Math.floor(deadEnds.length * ratio);
        for (let i = 0; i < toRemove; i++) {
            if (deadEnds.length === 0) break;
            
            const index = Math.floor(Math.random() * deadEnds.length);
            const deadEnd = deadEnds.splice(index, 1)[0];
            
            const directions = [
                { dx: 0, dy: -1 },
                { dx: 1, dy: 0 },
                { dx: 0, dy: 1 },
                { dx: -1, dy: 0 }
            ];
            
            for (const dir of directions) {
                const nx = deadEnd.x + dir.dx;
                const ny = deadEnd.y + dir.dy;
                if (nx > 0 && nx < this.cols - 1 && ny > 0 && ny < this.rows - 1 && this.maze[ny][nx] === 1) {
                    const nnx = deadEnd.x + dir.dx * 2;
                    const nny = deadEnd.y + dir.dy * 2;
                    if (nnx > 0 && nnx < this.cols - 1 && nny > 0 && nny < this.rows - 1 && this.maze[nny][nnx] === 0) {
                        this.maze[ny][nx] = 0;
                        break;
                    }
                }
            }
        }
    }
    
    ensurePathToExit() {
        const visited = new Set();
        const queue = [{ x: 1, y: 1 }];
        visited.add('1,1');
        
        while (queue.length > 0) {
            const current = queue.shift();
            
            if (current.x === this.exit.x && current.y === this.exit.y) {
                return;
            }
            
            const directions = [
                { dx: 0, dy: -1 },
                { dx: 1, dy: 0 },
                { dx: 0, dy: 1 },
                { dx: -1, dy: 0 }
            ];
            
            for (const dir of directions) {
                const nx = current.x + dir.dx;
                const ny = current.y + dir.dy;
                const key = `${nx},${ny}`;
                
                if (nx >= 0 && nx < this.cols && ny >= 0 && ny < this.rows && 
                    this.maze[ny][nx] === 0 && !visited.has(key)) {
                    visited.add(key);
                    queue.push({ x: nx, y: ny });
                }
            }
        }
        
        let x = this.exit.x;
        let y = this.exit.y;
        this.maze[y][x] = 0;
        
        while (x > 1 || y > 1) {
            const directions = [];
            if (x > 1) directions.push({ dx: -2, dy: 0 });
            if (y > 1) directions.push({ dx: 0, dy: -2 });
            
            if (directions.length === 0) break;
            
            const dir = directions[Math.floor(Math.random() * directions.length)];
            const wallX = x + dir.dx / 2;
            const wallY = y + dir.dy / 2;
            x += dir.dx;
            y += dir.dy;
            
            this.maze[wallY][wallX] = 0;
            this.maze[y][x] = 0;
        }
    }
    
    generateDecorations() {
        this.decorations = [];
        
        for (let y = 1; y < this.rows - 1; y++) {
            for (let x = 1; x < this.cols - 1; x++) {
                if (this.maze[y][x] === 0 && 
                    !(x === 1 && y === 1) && 
                    !(x === this.exit.x && y === this.exit.y)) {
                    
                    if (Math.random() < 0.15) {
                        const types = ['flower', 'mushroom', 'stone'];
                        this.decorations.push({
                            x: x,
                            y: y,
                            type: types[Math.floor(Math.random() * types.length)],
                            offsetX: (Math.random() - 0.5) * 0.3,
                            offsetY: (Math.random() - 0.5) * 0.3,
                            scale: 0.5 + Math.random() * 0.3
                        });
                    }
                }
            }
        }
    }
    
    startGame() {
        if (this.state === GameState.RUNNING) return;
        this.state = GameState.RUNNING;
        this.timeLeft = this.config.timeLeft;
        this.player = { x: 1, y: 1 };
        this.playerTarget = { x: 1, y: 1 };
        this.updateStatus('游戏中...');
        this.startTimer();
        this.animate();
    }
    
    resetGame() {
        this.stopTimer();
        this.cancelAnimationFrame();
        this.initGame();
    }
    
    startTimer() {
        this.timerInterval = setInterval(() => {
            this.timeLeft--;
            this.updateTimeDisplay();
            if (this.timeLeft <= 0) {
                this.gameLose();
            }
        }, 1000);
    }
    
    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }
    
    handleKeyDown(e) {
        if (this.state !== GameState.RUNNING) return;
        
        let dx = 0, dy = 0;
        
        switch (e.key) {
            case 'ArrowUp':
            case 'w':
            case 'W':
                dy = -1;
                break;
            case 'ArrowDown':
            case 's':
            case 'S':
                dy = 1;
                break;
            case 'ArrowLeft':
            case 'a':
            case 'A':
                dx = -1;
                break;
            case 'ArrowRight':
            case 'd':
            case 'D':
                dx = 1;
                break;
            default:
                return;
        }
        
        e.preventDefault();
        
        const newX = this.playerTarget.x + dx;
        const newY = this.playerTarget.y + dy;
        
        if (this.canMove(newX, newY)) {
            this.playerTarget.x = newX;
            this.playerTarget.y = newY;
        }
    }
    
    canMove(x, y) {
        if (x < 0 || x >= this.cols || y < 0 || y >= this.rows) return false;
        return this.maze[y][x] === 0;
    }
    
    animate() {
        if (this.state !== GameState.RUNNING) return;
        
        const speed = 0.15;
        this.player.x += (this.playerTarget.x - this.player.x) * speed;
        this.player.y += (this.playerTarget.y - this.player.y) * speed;
        
        if (Math.abs(this.player.x - this.exit.x) < 0.1 && Math.abs(this.player.y - this.exit.y) < 0.1) {
            this.gameWin();
            return;
        }
        
        this.draw();
        this.animationId = requestAnimationFrame(() => this.animate());
    }
    
    cancelAnimationFrame() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }
    
    gameWin() {
        this.state = GameState.WIN;
        this.stopTimer();
        this.cancelAnimationFrame();
        this.updateStatus('通关成功！');
        this.showModal('恭喜通关！', `你在 ${this.config.timeLeft - this.timeLeft} 秒内逃出了迷宫！`);
    }
    
    gameLose() {
        this.state = GameState.LOSE;
        this.stopTimer();
        this.cancelAnimationFrame();
        this.updateStatus('时间到！');
        this.showModal('游戏失败', '很遗憾，时间用完了！');
    }
    
    showModal(title, message) {
        document.getElementById('modal-title').textContent = title;
        document.getElementById('modal-message').textContent = message;
        document.getElementById('modal').classList.remove('hidden');
    }
    
    hideModal() {
        document.getElementById('modal').classList.add('hidden');
    }
    
    updateTimeDisplay() {
        document.getElementById('time-display').textContent = this.timeLeft;
    }
    
    updateStatus(text) {
        document.getElementById('status-display').textContent = text;
    }
    
    draw() {
        const colors = this.config.colors;
        
        this.drawBackground(colors);
        
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                if (this.maze[y][x] === 1) {
                    this.drawRoundedWall(x, y, colors);
                } else {
                    this.drawPathTile(x, y, colors);
                }
            }
        }
        
        this.drawDecorations(colors);
        this.drawExit(colors);
        this.drawPlayer(colors);
    }
    
    drawBackground(colors) {
        this.ctx.fillStyle = colors.grass;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        const size = this.cellSize;
        for (let y = 0; y < this.rows; y++) {
            for (let x = 0; x < this.cols; x++) {
                const px = x * size;
                const py = y * size;
                
                if ((x + y) % 3 === 0) {
                    this.ctx.fillStyle = colors.grassDark;
                    this.ctx.globalAlpha = 0.3;
                    this.ctx.beginPath();
                    this.ctx.arc(px + size * 0.2, py + size * 0.3, size * 0.08, 0, Math.PI * 2);
                    this.ctx.fill();
                    this.ctx.beginPath();
                    this.ctx.arc(px + size * 0.7, py + size * 0.6, size * 0.06, 0, Math.PI * 2);
                    this.ctx.fill();
                    this.ctx.globalAlpha = 1;
                }
            }
        }
    }
    
    drawPathTile(x, y, colors) {
        const size = this.cellSize;
        const px = x * size;
        const py = y * size;
        
        this.ctx.fillStyle = colors.path;
        this.ctx.fillRect(px, py, size, size);
        
        if ((x + y) % 2 === 0) {
            this.ctx.fillStyle = colors.pathDark;
            this.ctx.globalAlpha = 0.3;
            this.ctx.fillRect(px + 2, py + 2, size - 4, size - 4);
            this.ctx.globalAlpha = 1;
        }
        
        this.ctx.fillStyle = 'rgba(0,0,0,0.05)';
        this.ctx.fillRect(px + size * 0.15, py + size * 0.2, size * 0.1, size * 0.1);
        this.ctx.fillRect(px + size * 0.6, py + size * 0.65, size * 0.12, size * 0.08);
    }
    
    drawRoundedWall(x, y, colors) {
        const size = this.cellSize;
        const px = x * size;
        const py = y * size;
        const radius = 8;
        const padding = 2;
        
        const hasTopWall = y > 0 && this.maze[y - 1][x] === 1;
        const hasRightWall = x < this.cols - 1 && this.maze[y][x + 1] === 1;
        const hasBottomWall = y < this.rows - 1 && this.maze[y + 1][x] === 1;
        const hasLeftWall = x > 0 && this.maze[y][x - 1] === 1;
        
        const x1 = px + padding;
        const y1 = py + padding;
        const x2 = px + size - padding;
        const y2 = py + size - padding;
        
        this.ctx.fillStyle = 'rgba(0,0,0,0.15)';
        this.ctx.beginPath();
        this.drawWallShape(x1 + 2, y1 + 3, x2 + 2, y2 + 3, radius, hasTopWall, hasRightWall, hasBottomWall, hasLeftWall);
        this.ctx.fill();
        
        this.ctx.fillStyle = colors.wall;
        this.ctx.beginPath();
        this.drawWallShape(x1, y1, x2, y2, radius, hasTopWall, hasRightWall, hasBottomWall, hasLeftWall);
        this.ctx.fill();
        
        this.ctx.fillStyle = colors.wallHighlight;
        this.ctx.globalAlpha = 0.5;
        this.ctx.beginPath();
        this.drawWallShape(x1 + 2, y1 + 2, x2 - 4, y2 / 2 + py + size / 4, radius - 2, hasTopWall, hasRightWall, false, hasLeftWall);
        this.ctx.fill();
        this.ctx.globalAlpha = 1;
        
        this.ctx.strokeStyle = colors.wallBorder;
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.drawWallShape(x1, y1, x2, y2, radius, hasTopWall, hasRightWall, hasBottomWall, hasLeftWall);
        this.ctx.stroke();
    }
    
    drawWallShape(x1, y1, x2, y2, radius, hasTop, hasRight, hasBottom, hasLeft) {
        this.ctx.moveTo(x1 + radius, y1);
        
        if (!hasTop) {
            this.ctx.lineTo(x2 - radius, y1);
        } else {
            this.ctx.lineTo(x2, y1);
        }
        
        if (!hasRight) {
            this.ctx.quadraticCurveTo(x2, y1, x2, y1 + radius);
        }
        this.ctx.lineTo(x2, y2 - radius);
        
        if (!hasRight) {
            this.ctx.quadraticCurveTo(x2, y2, x2 - radius, y2);
        } else {
            this.ctx.lineTo(x2, y2);
        }
        
        if (!hasBottom) {
            this.ctx.lineTo(x1 + radius, y2);
        } else {
            this.ctx.lineTo(x1, y2);
        }
        
        if (!hasLeft) {
            this.ctx.quadraticCurveTo(x1, y2, x1, y2 - radius);
        }
        this.ctx.lineTo(x1, y1 + radius);
        
        if (!hasLeft) {
            this.ctx.quadraticCurveTo(x1, y1, x1 + radius, y1);
        } else {
            this.ctx.lineTo(x1, y1);
            this.ctx.lineTo(x1 + radius, y1);
        }
        
        this.ctx.closePath();
    }
    
    drawDecorations(colors) {
        for (const deco of this.decorations) {
            const px = (deco.x + deco.offsetX) * this.cellSize + this.cellSize / 2;
            const py = (deco.y + deco.offsetY) * this.cellSize + this.cellSize / 2;
            const scale = deco.scale;
            const size = this.cellSize * scale;
            
            switch (deco.type) {
                case 'flower':
                    this.drawFlower(px, py, size);
                    break;
                case 'mushroom':
                    this.drawMushroom(px, py, size);
                    break;
                case 'stone':
                    this.drawStone(px, py, size);
                    break;
            }
        }
    }
    
    drawFlower(x, y, size) {
        const petalColors = ['#fda4af', '#fbbf24', '#a78bfa', '#60a5fa'];
        const petalColor = petalColors[Math.floor(Math.random() * petalColors.length)];
        
        this.ctx.fillStyle = petalColor;
        for (let i = 0; i < 5; i++) {
            const angle = (i / 5) * Math.PI * 2 - Math.PI / 2;
            const px = x + Math.cos(angle) * size * 0.25;
            const py = y + Math.sin(angle) * size * 0.25;
            this.ctx.beginPath();
            this.ctx.arc(px, py, size * 0.18, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        this.ctx.fillStyle = '#fde047';
        this.ctx.beginPath();
        this.ctx.arc(x, y, size * 0.15, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    drawMushroom(x, y, size) {
        this.ctx.fillStyle = '#fef3c7';
        this.ctx.beginPath();
        this.ctx.ellipse(x, y + size * 0.15, size * 0.15, size * 0.25, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.fillStyle = '#f87171';
        this.ctx.beginPath();
        this.ctx.ellipse(x, y - size * 0.1, size * 0.3, size * 0.2, 0, Math.PI, 0);
        this.ctx.fill();
        
        this.ctx.fillStyle = '#fff';
        this.ctx.beginPath();
        this.ctx.arc(x - size * 0.12, y - size * 0.15, size * 0.06, 0, Math.PI * 2);
        this.ctx.arc(x + size * 0.08, y - size * 0.18, size * 0.05, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    drawStone(x, y, size) {
        this.ctx.fillStyle = '#9ca3af';
        this.ctx.beginPath();
        this.ctx.ellipse(x, y, size * 0.25, size * 0.18, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.fillStyle = '#d1d5db';
        this.ctx.beginPath();
        this.ctx.ellipse(x - size * 0.05, y - size * 0.05, size * 0.1, size * 0.07, -0.3, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    drawPlayer(colors) {
        const centerX = this.player.x * this.cellSize + this.cellSize / 2;
        const centerY = this.player.y * this.cellSize + this.cellSize / 2;
        const radius = this.cellSize / 3;
        
        this.ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
        this.ctx.beginPath();
        this.ctx.ellipse(centerX + 3, centerY + radius + 3, radius * 0.8, radius * 0.35, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        const gradient = this.ctx.createRadialGradient(
            centerX - radius * 0.3, centerY - radius * 0.3, 0,
            centerX, centerY, radius
        );
        gradient.addColorStop(0, colors.playerHighlight);
        gradient.addColorStop(1, colors.player);
        
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
        this.ctx.beginPath();
        this.ctx.ellipse(centerX - radius * 0.25, centerY - radius * 0.35, radius * 0.35, radius * 0.25, -Math.PI / 4, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.fillStyle = '#fff';
        const eyeRadius = radius / 5;
        const eyeY = centerY - radius / 5;
        this.ctx.beginPath();
        this.ctx.arc(centerX - radius / 3, eyeY, eyeRadius, 0, Math.PI * 2);
        this.ctx.arc(centerX + radius / 3, eyeY, eyeRadius, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.fillStyle = '#333';
        const pupilRadius = radius / 8;
        this.ctx.beginPath();
        this.ctx.arc(centerX - radius / 3 + pupilRadius * 0.3, eyeY, pupilRadius, 0, Math.PI * 2);
        this.ctx.arc(centerX + radius / 3 + pupilRadius * 0.3, eyeY, pupilRadius, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.fillStyle = '#fff';
        this.ctx.beginPath();
        this.ctx.arc(centerX - radius / 3 - pupilRadius * 0.1, eyeY - pupilRadius * 0.2, pupilRadius * 0.3, 0, Math.PI * 2);
        this.ctx.arc(centerX + radius / 3 - pupilRadius * 0.1, eyeY - pupilRadius * 0.2, pupilRadius * 0.3, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.fillStyle = 'rgba(251, 113, 133, 0.4)';
        this.ctx.beginPath();
        this.ctx.ellipse(centerX - radius * 0.55, centerY + radius * 0.15, radius * 0.15, radius * 0.1, 0, 0, Math.PI * 2);
        this.ctx.ellipse(centerX + radius * 0.55, centerY + radius * 0.15, radius * 0.15, radius * 0.1, 0, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.strokeStyle = '#fff';
        this.ctx.lineWidth = 2.5;
        this.ctx.lineCap = 'round';
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY + radius * 0.1, radius * 0.35, 0.1 * Math.PI, 0.9 * Math.PI);
        this.ctx.stroke();
    }
    
    drawExit(colors) {
        const x = this.exit.x * this.cellSize;
        const y = this.exit.y * this.cellSize;
        const size = this.cellSize;
        const padding = 2;
        const radius = 10;
        
        const time = Date.now() / 1000;
        const glowSize = 8 + Math.sin(time * 3) * 3;
        
        this.ctx.shadowColor = colors.exitGlow;
        this.ctx.shadowBlur = glowSize;
        
        this.ctx.fillStyle = colors.exit;
        this.ctx.beginPath();
        this.ctx.roundRect(x + padding, y + padding, size - padding * 2, size - padding * 2, radius);
        this.ctx.fill();
        
        this.ctx.shadowBlur = 0;
        
        this.ctx.strokeStyle = colors.exitBorder;
        this.ctx.lineWidth = 3;
        this.ctx.stroke();
        
        this.ctx.fillStyle = '#fff';
        this.ctx.font = `bold ${size * 0.55}px Arial`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText('🚪', x + size / 2, y + size / 2);
        
        this.ctx.fillStyle = '#fff';
        this.ctx.font = `${size * 0.22}px Arial`;
        this.ctx.fillText('EXIT', x + size / 2, y + size - size * 0.15);
    }
}

const game = new MazeGame();
