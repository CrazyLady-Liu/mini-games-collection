class GridGame {
    constructor() {
        this.currentLevel = 1;
        this.grid = [];
        this.gridSize = 0;
        this.startPos = null;
        this.endPos = null;
        this.clearedCount = 0;
        this.requiredClear = 0;
        this.isAnimating = false;
        this.playerPos = null;
        this.currentPath = [];
        this.elasticCells = new Map();

        this.gameGrid = document.getElementById('gameGrid');
        this.trailCanvas = document.getElementById('trailCanvas');
        this.ctx = this.trailCanvas.getContext('2d');
        this.levelEl = document.getElementById('currentLevel');
        this.clearedEl = document.getElementById('clearedCount');
        this.requiredEl = document.getElementById('requiredCount');
        this.gridSizeEl = document.getElementById('gridSize');
        this.levelCompleteEl = document.getElementById('levelComplete');
        this.statusHintEl = document.getElementById('statusHint');

        this.init();
    }

    init() {
        document.getElementById('resetBtn').addEventListener('click', () => this.resetLevel());
        document.getElementById('hintBtn').addEventListener('click', () => this.showHint());
        this.loadLevel(this.currentLevel);
    }

    getLevelConfig(level) {
        if (level <= 3) {
            return {
                size: 5,
                obstacleDensity: 0.35,
                requiredClear: 2 + level,
                rotatorRatio: 0,
                elasticRatio: 0
            };
        } else if (level <= 6) {
            return {
                size: 7 + Math.floor((level - 3) / 2),
                obstacleDensity: 0.28 + (level - 3) * 0.04,
                requiredClear: 5 + (level - 3) * 2,
                rotatorRatio: 0.15,
                elasticRatio: 0.1
            };
        } else {
            return {
                size: Math.min(10 + Math.floor((level - 6) / 2), 14),
                obstacleDensity: Math.min(0.35 + (level - 6) * 0.02, 0.45),
                requiredClear: 10 + (level - 6) * 3,
                rotatorRatio: 0.2,
                elasticRatio: 0.15
            };
        }
    }

    getObstacleType(config) {
        const rand = Math.random();
        if (rand < config.rotatorRatio) {
            return 'rotator';
        } else if (rand < config.rotatorRatio + config.elasticRatio) {
            return 'elastic';
        }
        return 'stone';
    }

    loadLevel(level) {
        const config = this.getLevelConfig(level);
        this.gridSize = config.size;
        this.requiredClear = config.requiredClear;
        this.clearedCount = 0;
        this.isAnimating = false;
        this.currentPath = [];
        this.elasticCells.clear();

        this.generateGrid(config);
        this.renderGrid();
        this.updateUI();
        this.showStatusHint(null);
        this.playerPos = { ...this.startPos };
    }

    generateGrid(config) {
        const { size, obstacleDensity, requiredClear } = config;
        let attempts = 0;
        const maxAttempts = 100;

        while (attempts < maxAttempts) {
            attempts++;
            this.grid = [];
            for (let y = 0; y < size; y++) {
                this.grid[y] = [];
                for (let x = 0; x < size; x++) {
                    this.grid[y][x] = { type: 'empty', cleared: false };
                }
            }

            this.startPos = { x: 0, y: Math.floor(size / 2) };
            this.endPos = { x: size - 1, y: Math.floor(size / 2) };
            this.grid[this.startPos.y][this.startPos.x].type = 'start';
            this.grid[this.endPos.y][this.endPos.x].type = 'end';

            const midY = Math.floor(size / 2);
            const mainPathPositions = [];
            for (let x = 1; x < size - 1; x++) {
                mainPathPositions.push({ x, y: midY });
                if (midY > 0) mainPathPositions.push({ x, y: midY - 1 });
                if (midY < size - 1) mainPathPositions.push({ x, y: midY + 1 });
            }

            this.shuffleArray(mainPathPositions);
            let stonesPlaced = 0;
            const obstaclePositions = [];

            for (const pos of mainPathPositions) {
                if (stonesPlaced >= requiredClear + 1) break;
                if (this.grid[pos.y][pos.x].type === 'empty') {
                    this.grid[pos.y][pos.x] = {
                        type: 'obstacle',
                        obstacleType: 'stone',
                        cleared: false,
                        rotation: 0,
                        active: true
                    };
                    obstaclePositions.push(pos);
                    stonesPlaced++;
                }
            }

            const obstacleCount = Math.floor(size * size * obstacleDensity);
            let placed = obstaclePositions.length;

            while (placed < obstacleCount) {
                const x = Math.floor(Math.random() * size);
                const y = Math.floor(Math.random() * size);

                if (this.grid[y][x].type === 'empty' &&
                    !this.isAdjacent(x, y, this.startPos) &&
                    !this.isAdjacent(x, y, this.endPos)) {
                    const obstacleType = this.getObstacleType(config);
                    this.grid[y][x] = {
                        type: 'obstacle',
                        obstacleType: obstacleType,
                        cleared: false,
                        rotation: obstacleType === 'rotator' ? Math.floor(Math.random() * 4) : 0,
                        active: true
                    };
                    obstaclePositions.push({ x, y });
                    placed++;
                }
            }

            const finalPath = this.findPath(this.startPos, this.endPos, true);
            if (finalPath && finalPath.stones.length >= requiredClear) {
                return;
            }
        }

        this.generateSimpleGrid(config);
    }

    generateSimpleGrid(config) {
        const { size, requiredClear } = config;
        this.grid = [];
        for (let y = 0; y < size; y++) {
            this.grid[y] = [];
            for (let x = 0; x < size; x++) {
                this.grid[y][x] = { type: 'empty', cleared: false };
            }
        }

        this.startPos = { x: 0, y: Math.floor(size / 2) };
        this.endPos = { x: size - 1, y: Math.floor(size / 2) };
        this.grid[this.startPos.y][this.startPos.x].type = 'start';
        this.grid[this.endPos.y][this.endPos.x].type = 'end';

        const midY = Math.floor(size / 2);
        const emptyPositions = [];

        for (let x = 1; x < size - 1; x++) {
            for (let y = 0; y < size; y++) {
                if (this.grid[y][x].type === 'empty') {
                    emptyPositions.push({ x, y });
                }
            }
        }

        this.shuffleArray(emptyPositions);

        const stonePositions = [];
        const otherPositions = [];
        for (const pos of emptyPositions) {
            const obstacleType = this.getObstacleType(config);
            this.grid[pos.y][pos.x] = {
                type: 'obstacle',
                obstacleType: obstacleType,
                cleared: false,
                rotation: obstacleType === 'rotator' ? Math.floor(Math.random() * 4) : 0,
                active: true
            };
            if (obstacleType === 'stone') {
                stonePositions.push(pos);
            } else {
                otherPositions.push(pos);
            }
        }

        const pathResult = this.findPath(this.startPos, this.endPos, true);
        if (pathResult && pathResult.stones.length >= requiredClear) {
            return;
        }

        for (const pos of otherPositions) {
            this.grid[pos.y][pos.x] = { type: 'empty', cleared: false };
        }

        stonePositions.length = Math.min(stonePositions.length, requiredClear + 2);
    }

    isAdjacent(x1, y1, pos2) {
        return Math.abs(x1 - pos2.x) <= 1 && Math.abs(y1 - pos2.y) <= 1;
    }

    shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }

    canPassThrough(cell, fromDir) {
        if (cell.type !== 'obstacle') return true;
        if (cell.cleared) return true;
        if (!cell.active) return true;

        if (cell.obstacleType === 'rotator') {
            const blockedDirs = this.getRotatorBlockedDirections(cell.rotation);
            return !blockedDirs.includes(fromDir);
        }

        return false;
    }

    getRotatorBlockedDirections(rotation) {
        const patterns = [
            ['up', 'down'],
            ['right', 'left'],
            ['up', 'right'],
            ['down', 'left']
        ];
        return patterns[rotation % 4];
    }

    getDirectionName(dx, dy) {
        if (dx === 0 && dy === -1) return 'up';
        if (dx === 0 && dy === 1) return 'down';
        if (dx === 1 && dy === 0) return 'right';
        if (dx === -1 && dy === 0) return 'left';
        return null;
    }

    findPath(start, end, countObstacles = false) {
        const queue = [{ pos: start, path: [], stones: [], rotators: [], elastics: [] }];
        const visited = new Set();
        visited.add(`${start.x},${start.y}`);

        const directions = [
            { x: 0, y: -1 }, { x: 1, y: 0 },
            { x: 0, y: 1 }, { x: -1, y: 0 }
        ];

        while (queue.length > 0) {
            const { pos, path, stones, rotators, elastics } = queue.shift();

            if (pos.x === end.x && pos.y === end.y) {
                if (countObstacles) {
                    return { path: [...path, pos], stones, rotators, elastics };
                }
                return [...path, pos];
            }

            for (const dir of directions) {
                const nx = pos.x + dir.x;
                const ny = pos.y + dir.y;
                const key = `${nx},${ny}`;

                if (nx >= 0 && nx < this.gridSize && ny >= 0 && ny < this.gridSize && !visited.has(key)) {
                    const cell = this.grid[ny][nx];
                    const fromDir = this.getDirectionName(dir.x, dir.y);

                    if (cell.type === 'obstacle' && !cell.cleared && cell.active) {
                        if (cell.obstacleType === 'stone') {
                            visited.add(key);
                            queue.push({
                                pos: { x: nx, y: ny },
                                path: [...path, pos],
                                stones: [...stones, { x: nx, y: ny }],
                                rotators,
                                elastics
                            });
                        } else if (cell.obstacleType === 'rotator') {
                            if (this.canPassThrough(cell, fromDir)) {
                                visited.add(key);
                                queue.push({
                                    pos: { x: nx, y: ny },
                                    path: [...path, pos],
                                    stones,
                                    rotators: [...rotators, { x: nx, y: ny }],
                                    elastics
                                });
                            }
                        } else if (cell.obstacleType === 'elastic') {
                            visited.add(key);
                            queue.push({
                                pos: { x: nx, y: ny },
                                path: [...path, pos],
                                stones,
                                rotators,
                                elastics: [...elastics, { x: nx, y: ny }]
                            });
                        }
                    } else {
                        visited.add(key);
                        queue.push({
                            pos: { x: nx, y: ny },
                            path: [...path, pos],
                            stones,
                            rotators,
                            elastics
                        });
                    }
                }
            }
        }

        return null;
    }

    findOptimalPath() {
        const queue = [{ pos: this.startPos, path: [], stones: [], rotators: [], elastics: [] }];
        const visited = new Map();
        visited.set(`${this.startPos.x},${this.startPos.y}`, 0);

        const directions = [
            { x: 0, y: -1 }, { x: 1, y: 0 },
            { x: 0, y: 1 }, { x: -1, y: 0 }
        ];

        while (queue.length > 0) {
            const { pos, path, stones, rotators, elastics } = queue.shift();

            if (pos.x === this.endPos.x && pos.y === this.endPos.y) {
                return { path: [...path, pos], stones, rotators, elastics };
            }

            for (const dir of directions) {
                const nx = pos.x + dir.x;
                const ny = pos.y + dir.y;
                const key = `${nx},${ny}`;

                if (nx >= 0 && nx < this.gridSize && ny >= 0 && ny < this.gridSize) {
                    const cell = this.grid[ny][nx];
                    const fromDir = this.getDirectionName(dir.x, dir.y);
                    let cost = stones.length;

                    if (cell.type === 'obstacle' && !cell.cleared && cell.active) {
                        if (cell.obstacleType === 'stone') {
                            cost += 1;
                        } else if (cell.obstacleType === 'rotator') {
                            if (!this.canPassThrough(cell, fromDir)) {
                                continue;
                            }
                        }
                    }

                    if (!visited.has(key) || visited.get(key) > cost) {
                        visited.set(key, cost);
                        let newStones = stones;
                        let newRotators = rotators;
                        let newElastics = elastics;

                        if (cell.type === 'obstacle' && !cell.cleared && cell.active) {
                            if (cell.obstacleType === 'stone') {
                                newStones = [...stones, { x: nx, y: ny }];
                            } else if (cell.obstacleType === 'rotator') {
                                newRotators = [...rotators, { x: nx, y: ny }];
                            } else if (cell.obstacleType === 'elastic') {
                                newElastics = [...elastics, { x: nx, y: ny }];
                            }
                        }

                        queue.push({
                            pos: { x: nx, y: ny },
                            path: [...path, pos],
                            stones: newStones,
                            rotators: newRotators,
                            elastics: newElastics
                        });
                    }
                }
            }
        }

        return null;
    }

    renderGrid() {
        this.gameGrid.innerHTML = '';
        this.gameGrid.style.gridTemplateColumns = `repeat(${this.gridSize}, 1fr)`;

        const cellSize = Math.min(40, Math.floor(450 / this.gridSize));
        this.trailCanvas.width = this.gridSize * (cellSize + 4) - 4;
        this.trailCanvas.height = this.gridSize * (cellSize + 4) - 4;
        this.ctx.clearRect(0, 0, this.trailCanvas.width, this.trailCanvas.height);

        for (let y = 0; y < this.gridSize; y++) {
            for (let x = 0; x < this.gridSize; x++) {
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.x = x;
                cell.dataset.y = y;
                cell.style.width = `${cellSize}px`;
                cell.style.height = `${cellSize}px`;

                const cellData = this.grid[y][x];

                if (cellData.type === 'obstacle' && !cellData.cleared && cellData.active) {
                    cell.classList.add('cell-obstacle');

                    if (cellData.obstacleType === 'stone') {
                        cell.classList.add('obstacle-stone');
                        cell.addEventListener('click', () => this.handleStoneClick(x, y, cell));
                    } else if (cellData.obstacleType === 'rotator') {
                        cell.classList.add('obstacle-rotator');
                        cell.style.transform = `rotate(${cellData.rotation * 90}deg)`;
                        cell.innerHTML = this.getRotatorIcon();
                        cell.addEventListener('click', () => this.handleRotatorClick(x, y, cell));
                    } else if (cellData.obstacleType === 'elastic') {
                        cell.classList.add('obstacle-elastic');
                        cell.addEventListener('click', () => this.handleElasticClick(x, y, cell));
                    }
                } else if (cellData.type === 'start') {
                    cell.classList.add('cell-start');
                    const player = document.createElement('div');
                    player.className = 'player';
                    player.id = 'player';
                    cell.appendChild(player);
                } else if (cellData.type === 'end') {
                    cell.classList.add('cell-end');
                } else {
                    cell.classList.add('cell-empty');
                }

                this.gameGrid.appendChild(cell);
            }
        }
    }

    getRotatorIcon() {
        return `
            <svg width="70%" height="70%" viewBox="0 0 40 40">
                <rect x="2" y="16" width="36" height="8" fill="rgba(255,255,255,0.8)" rx="2"/>
                <circle cx="20" cy="20" r="6" fill="rgba(255,255,255,0.9)"/>
            </svg>
        `;
    }

    handleStoneClick(x, y, cellEl) {
        if (this.isAnimating) return;

        const cell = this.grid[y][x];
        if (cell.type !== 'obstacle' || cell.obstacleType !== 'stone' || cell.cleared) return;

        cell.cleared = true;
        this.clearedCount++;
        cellEl.classList.add('clearing');

        setTimeout(() => {
            cellEl.classList.remove('cell-obstacle', 'obstacle-stone', 'clearing');
            cellEl.classList.add('cell-empty');
            cellEl.style.background = 'rgba(0, 210, 255, 0.2)';
            setTimeout(() => {
                cellEl.style.background = '';
            }, 300);
        }, 300);

        this.updateUI();
        this.checkPathStatus();
        this.checkWinCondition();
    }

    handleRotatorClick(x, y, cellEl) {
        if (this.isAnimating) return;

        const cell = this.grid[y][x];
        if (cell.type !== 'obstacle' || cell.obstacleType !== 'rotator') return;

        cell.rotation = (cell.rotation + 1) % 4;
        cellEl.style.transform = `rotate(${cell.rotation * 90}deg)`;
        cellEl.classList.add('rotating');
        setTimeout(() => cellEl.classList.remove('rotating'), 300);

        this.checkPathStatus();
        this.checkWinCondition();
    }

    handleElasticClick(x, y, cellEl) {
        if (this.isAnimating) return;

        const cell = this.grid[y][x];
        if (cell.type !== 'obstacle' || cell.obstacleType !== 'elastic' || !cell.active) return;

        cell.active = false;
        cellEl.classList.add('elastic-press');

        setTimeout(() => {
            cellEl.classList.remove('cell-obstacle', 'obstacle-elastic', 'elastic-press');
            cellEl.classList.add('cell-empty', 'elastic-deactivated');
        }, 200);

        const key = `${x},${y}`;
        this.elasticCells.set(key, { cell, cellEl, timer: null });

        this.checkPathStatus();
        this.checkWinCondition();
    }

    restoreElastic(x, y) {
        const key = `${x},${y}`;
        const elasticData = this.elasticCells.get(key);
        if (!elasticData) return;

        const { cell, cellEl } = elasticData;
        cell.active = true;

        cellEl.classList.remove('cell-empty', 'elastic-deactivated');
        cellEl.classList.add('cell-obstacle', 'obstacle-elastic', 'elastic-restore');

        setTimeout(() => {
            cellEl.classList.remove('elastic-restore');
        }, 300);

        this.elasticCells.delete(key);

        if (!this.isAnimating) {
            this.checkPathStatus();
        }
    }

    checkWinCondition() {
        if (this.clearedCount < this.requiredClear) return;

        const result = this.findOptimalPath();
        if (result) {
            this.currentPath = result.path;
            this.animatePlayerMovement(result.path, result.elastics);
        }
    }

    animatePlayerMovement(path, elastics) {
        this.isAnimating = true;
        const player = document.getElementById('player');
        if (!player) return;

        player.classList.add('moving');
        this.drawPathTrail(path);

        const elasticSet = new Set(elastics.map(e => `${e.x},${e.y}`));

        let step = 0;
        const animateStep = () => {
            if (step >= path.length) {
                this.onLevelComplete();
                return;
            }

            const pos = path[step];
            const cellEl = this.gameGrid.children[pos.y * this.gridSize + pos.x];

            const existingPlayer = document.getElementById('player');
            if (existingPlayer) {
                existingPlayer.remove();
            }

            const newPlayer = document.createElement('div');
            newPlayer.className = 'player moving';
            newPlayer.id = 'player';
            cellEl.appendChild(newPlayer);

            cellEl.classList.add('cell-highlight');
            setTimeout(() => cellEl.classList.remove('cell-highlight'), 500);

            const key = `${pos.x},${pos.y}`;
            if (elasticSet.has(key) && this.elasticCells.has(key)) {
                const elasticData = this.elasticCells.get(key);
                clearTimeout(elasticData.timer);
                elasticData.timer = setTimeout(() => {
                    this.restoreElastic(pos.x, pos.y);
                }, 500);
            }

            step++;
            setTimeout(animateStep, 200);
        };

        animateStep();
    }

    drawPathTrail(path) {
        this.ctx.clearRect(0, 0, this.trailCanvas.width, this.trailCanvas.height);

        const cellSize = Math.min(40, Math.floor(450 / this.gridSize));
        const gap = 4;
        const totalCellSize = cellSize + gap;

        this.ctx.strokeStyle = 'rgba(0, 210, 255, 0.6)';
        this.ctx.lineWidth = 4;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        this.ctx.shadowColor = 'rgba(0, 210, 255, 0.8)';
        this.ctx.shadowBlur = 10;

        this.ctx.beginPath();
        for (let i = 0; i < path.length; i++) {
            const x = path[i].x * totalCellSize + cellSize / 2;
            const y = path[i].y * totalCellSize + cellSize / 2;

            if (i === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        }
        this.ctx.stroke();

        this.ctx.shadowBlur = 0;
    }

    onLevelComplete() {
        this.gameGrid.classList.add('grid-glow');

        setTimeout(() => {
            this.levelCompleteEl.classList.remove('hidden');

            setTimeout(() => {
                this.levelCompleteEl.classList.add('hidden');
                this.gameGrid.classList.remove('grid-glow');
                this.currentLevel++;
                this.loadLevel(this.currentLevel);
            }, 1500);
        }, 500);
    }

    showHint() {
        if (this.isAnimating) return;

        const result = this.findOptimalPath();
        if (!result) return;

        this.currentPath.forEach(pos => {
            const cellEl = this.gameGrid.children[pos.y * this.gridSize + pos.x];
            cellEl.classList.remove('cell-path');
        });

        this.currentPath = result.path;
        result.stones.forEach(pos => {
            const cellEl = this.gameGrid.children[pos.y * this.gridSize + pos.x];
            cellEl.classList.add('cell-path');
        });

        setTimeout(() => {
            result.stones.forEach(pos => {
                const cellEl = this.gameGrid.children[pos.y * this.gridSize + pos.x];
                cellEl.classList.remove('cell-path');
            });
        }, 2000);
    }

    resetLevel() {
        if (this.isAnimating) return;
        this.loadLevel(this.currentLevel);
    }

    updateUI() {
        this.levelEl.textContent = this.currentLevel;
        this.clearedEl.textContent = this.clearedCount;
        this.requiredEl.textContent = this.requiredClear;
        this.gridSizeEl.textContent = `${this.gridSize}×${this.gridSize}`;
    }

    showStatusHint(message, type = 'warning') {
        if (!message) {
            this.statusHintEl.classList.add('hidden');
            return;
        }

        this.statusHintEl.textContent = message;
        this.statusHintEl.className = `status-hint ${type}`;
    }

    checkPathStatus() {
        if (this.clearedCount >= this.requiredClear) {
            const path = this.findPath(this.startPos, this.endPos, false);
            if (path) {
                this.showStatusHint('通路已连通，圆点即将通行', 'success');
            } else {
                this.showStatusHint('继续清除石块，打通完整通路', 'warning');
            }
        } else {
            this.showStatusHint(null);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new GridGame();
});
