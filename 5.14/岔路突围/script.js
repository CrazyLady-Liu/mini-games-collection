class ForkEscapeGame {
    constructor() {
        this.gameArea = document.getElementById('gameArea');
        this.mazeSvg = document.getElementById('mazeSvg');
        this.pathContainer = document.getElementById('pathContainer');
        this.levelElement = document.getElementById('level');
        this.attemptsElement = document.getElementById('attempts');
        this.messageOverlay = document.getElementById('messageOverlay');
        this.messageIcon = document.getElementById('messageIcon');
        this.messageTitle = document.getElementById('messageTitle');
        this.messageText = document.getElementById('messageText');
        this.messageBtn = document.getElementById('messageBtn');
        
        this.level = 1;
        this.attempts = 0;
        this.isGameActive = false;
        this.isAnimating = false;
        
        this.startPoint = { x: 0, y: 0 };
        this.endPoint = { x: 0, y: 0 };
        
        this.paths = [];
        this.correctPathIndex = -1;
        this.decisionDots = [];
        this.svgLines = [];
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.showTutorialModal();
    }
    
    setupEventListeners() {
        document.getElementById('howToPlayBtn').addEventListener('click', () => {
            this.showModal('howToPlayModal');
        });
        
        document.getElementById('closeModalBtn').addEventListener('click', () => {
            this.hideModal('howToPlayModal');
            this.startGame();
        });
        
        document.getElementById('restartBtn').addEventListener('click', () => {
            this.restartGame();
        });
        
        document.getElementById('messageBtn').addEventListener('click', () => {
            this.handleMessageClose();
        });
    }
    
    showTutorialModal() {
        this.showModal('howToPlayModal');
    }
    
    showModal(modalId) {
        document.getElementById(modalId).classList.add('active');
    }
    
    hideModal(modalId) {
        document.getElementById(modalId).classList.remove('active');
    }
    
    startGame() {
        this.level = 1;
        this.attempts = 0;
        this.updateUI();
        this.generateLevel();
        this.isGameActive = true;
    }
    
    restartGame() {
        this.level = 1;
        this.attempts = 0;
        this.updateUI();
        this.hideMessage();
        this.generateLevel();
        this.isGameActive = true;
    }
    
    updateUI() {
        this.levelElement.textContent = this.level;
        this.attemptsElement.textContent = this.attempts;
    }
    
    generateLevel() {
        this.paths = [];
        this.decisionDots = [];
        this.svgLines = [];
        this.mazeSvg.innerHTML = '';
        this.pathContainer.innerHTML = '';
        
        const oldButtons = document.querySelectorAll('.path-start-area');
        oldButtons.forEach(btn => btn.remove());
        
        this.calculatePoints();
        this.generatePaths();
        this.renderPaths();
    }
    
    calculatePoints() {
        const rect = this.gameArea.getBoundingClientRect();
        this.startPoint = {
            x: 80,
            y: rect.height / 2
        };
        this.endPoint = {
            x: rect.width - 80,
            y: rect.height / 2
        };
    }
    
    getLevelConfig() {
        if (this.level === 1) {
            return {
                pathCount: 2 + Math.floor(Math.random() * 2),
                maxBranchDepth: 1,
                deadEndShort: true,
                complexity: 'low'
            };
        } else if (this.level <= 3) {
            return {
                pathCount: 3 + Math.floor(Math.random() * 2),
                maxBranchDepth: 2,
                deadEndShort: false,
                complexity: 'medium'
            };
        } else {
            return {
                pathCount: Math.min(4 + Math.floor(Math.random() * 2), 6),
                maxBranchDepth: Math.min(2 + Math.floor(this.level / 4), 4),
                deadEndShort: false,
                complexity: 'high'
            };
        }
    }
    
    generatePaths() {
        const config = this.getLevelConfig();
        const rect = this.gameArea.getBoundingClientRect();
        const pathCount = config.pathCount;
        
        this.correctPathIndex = Math.floor(Math.random() * pathCount);
        
        const pathYPositions = this.calculatePathYPositions(pathCount, rect);
        
        for (let i = 0; i < pathCount; i++) {
            const isCorrect = i === this.correctPathIndex;
            const targetY = pathYPositions[i];
            
            const path = this.createAdvancedPath(
                i,
                pathCount,
                targetY,
                config,
                rect,
                isCorrect
            );
            this.paths.push(path);
        }
    }
    
    calculatePathYPositions(pathCount, rect) {
        const positions = [];
        const centerY = this.startPoint.y;
        const totalHeight = rect.height - 200;
        const spacing = totalHeight / (pathCount + 1);
        
        for (let i = 0; i < pathCount; i++) {
            const offset = (i - (pathCount - 1) / 2) * spacing;
            positions.push(centerY + offset);
        }
        
        return positions;
    }
    
    createAdvancedPath(pathIndex, totalPaths, targetY, config, rect, isCorrect) {
        const path = {
            id: pathIndex,
            isCorrect: isCorrect,
            segments: [],
            branches: [],
            decisionPoints: []
        };
        
        const startX = this.startPoint.x;
        const endX = this.endPoint.x;
        const startY = this.startPoint.y;
        const finalEndY = isCorrect ? this.endPoint.y : targetY;
        
        path.segments.push({
            start: { x: startX, y: startY },
            end: { x: startX, y: targetY },
            type: 'vertical',
            isMain: true
        });
        
        const segmentsCount = this.getSegmentCount(config);
        const segmentWidth = (endX - startX) / (segmentsCount + 1);
        
        let currentX = startX;
        let currentY = targetY;
        
        for (let s = 0; s < segmentsCount; s++) {
            const nextX = startX + segmentWidth * (s + 1);
            
            if (!isCorrect && Math.random() > 0.4 && config.maxBranchDepth > 0) {
                const branch = this.createFakeBranch(
                    currentX,
                    currentY,
                    nextX,
                    config,
                    1,
                    rect
                );
                path.branches.push(branch);
                path.decisionPoints.push({
                    x: currentX + (nextX - currentX) * 0.4,
                    y: currentY,
                    isFake: true
                });
            }
            
            const yVariation = this.getYVariation(config, s, segmentsCount);
            const midX = currentX + (nextX - currentX) * 0.5;
            const midY = currentY + yVariation;
            
            path.segments.push({
                start: { x: currentX, y: currentY },
                end: { x: midX, y: currentY },
                type: 'horizontal',
                isMain: true
            });
            
            path.segments.push({
                start: { x: midX, y: currentY },
                end: { x: midX, y: midY },
                type: 'vertical',
                isMain: true
            });
            
            path.segments.push({
                start: { x: midX, y: midY },
                end: { x: nextX, y: midY },
                type: 'horizontal',
                isMain: true
            });
            
            currentX = nextX;
            currentY = midY;
        }
        
        if (isCorrect) {
            path.segments.push({
                start: { x: currentX, y: currentY },
                end: { x: currentX, y: finalEndY },
                type: 'vertical',
                isMain: true
            });
            
            path.segments.push({
                start: { x: currentX, y: finalEndY },
                end: { x: endX, y: finalEndY },
                type: 'horizontal',
                isMain: true
            });
        } else {
            const deadEnd = this.createDeadEnd(currentX, currentY, config, rect);
            path.segments.push(deadEnd);
        }
        
        return path;
    }
    
    getSegmentCount(config) {
        if (config.complexity === 'low') return 2;
        if (config.complexity === 'medium') return 3;
        return Math.min(3 + Math.floor(this.level / 3), 5);
    }
    
    getYVariation(config, segmentIndex, totalSegments) {
        const baseVariation = config.complexity === 'low' ? 40 : 
                              config.complexity === 'medium' ? 60 : 80;
        
        const variation = (Math.random() - 0.5) * baseVariation * 2;
        const centerPull = segmentIndex < totalSegments / 2 ? 0.3 : -0.3;
        
        return variation + centerPull * baseVariation;
    }
    
    createFakeBranch(startX, startY, endX, config, depth, rect) {
        const branch = {
            segments: [],
            depth: depth
        };
        
        const branchLength = (endX - startX) * 0.4;
        const branchX = startX + (endX - startX) * 0.4;
        const yDirection = Math.random() > 0.5 ? 1 : -1;
        const branchY = startY + yDirection * (40 + Math.random() * 40);
        
        branch.segments.push({
            start: { x: branchX, y: startY },
            end: { x: branchX, y: branchY },
            type: 'vertical',
            isBranch: true
        });
        
        if (depth < config.maxBranchDepth && Math.random() > 0.5) {
            const subBranchEndX = branchX + branchLength * 0.6;
            branch.segments.push({
                start: { x: branchX, y: branchY },
                end: { x: subBranchEndX, y: branchY },
                type: 'horizontal',
                isBranch: true
            });
            
            const subBranch = this.createFakeBranch(
                branchX,
                branchY,
                subBranchEndX,
                config,
                depth + 1,
                rect
            );
            branch.subBranches = [subBranch];
        } else {
            const deadEndDirection = Math.random() > 0.5 ? 1 : -1;
            const deadEndLength = config.deadEndShort ? 40 : 60 + Math.random() * 40;
            
            branch.segments.push({
                start: { x: branchX, y: branchY },
                end: { x: branchX + deadEndDirection * deadEndLength, y: branchY },
                type: 'deadend',
                isDeadEnd: true,
                isBranch: true
            });
        }
        
        return branch;
    }
    
    createDeadEnd(currentX, currentY, config, rect) {
        const direction = Math.random() > 0.5 ? 1 : -1;
        const type = Math.random() > 0.5 ? 'horizontal' : 'vertical';
        
        let endX, endY;
        const length = config.deadEndShort ? 50 : 70 + Math.random() * 50;
        
        if (type === 'horizontal') {
            endX = currentX + direction * length;
            endY = currentY;
        } else {
            endX = currentX;
            endY = currentY + direction * length;
            
            endY = Math.max(80, Math.min(rect.height - 80, endY));
        }
        
        return {
            start: { x: currentX, y: currentY },
            end: { x: endX, y: endY },
            type: 'deadend',
            isDeadEnd: true
        };
    }
    
    renderPaths() {
        this.svgLines = [];
        
        this.addSvgGradients();
        
        for (const path of this.paths) {
            for (const segment of path.segments) {
                if (segment.isDeadEnd) continue;
                const line = this.renderSegment(segment, false);
                this.svgLines.push({ line: line, segment: segment, path: path });
            }
            
            this.renderPathNodes(path);
            
            for (const branch of path.branches) {
                this.renderBranch(branch, path);
            }
        }
        
        this.createPathSelectionAreas();
    }
    
    addSvgGradients() {
        const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
        
        const pathGradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
        pathGradient.setAttribute('id', 'pathGradient');
        pathGradient.setAttribute('x1', '0%');
        pathGradient.setAttribute('y1', '0%');
        pathGradient.setAttribute('x2', '100%');
        pathGradient.setAttribute('y2', '0%');
        
        const pathStop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        pathStop1.setAttribute('offset', '0%');
        pathStop1.setAttribute('stop-color', '#e8e0f5');
        
        const pathStop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        pathStop2.setAttribute('offset', '30%');
        pathStop2.setAttribute('stop-color', '#ddd5ed');
        
        const pathStop3 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        pathStop3.setAttribute('offset', '70%');
        pathStop3.setAttribute('stop-color', '#d5cce8');
        
        const pathStop4 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        pathStop4.setAttribute('offset', '100%');
        pathStop4.setAttribute('stop-color', '#e8e0f5');
        
        pathGradient.appendChild(pathStop1);
        pathGradient.appendChild(pathStop2);
        pathGradient.appendChild(pathStop3);
        pathGradient.appendChild(pathStop4);
        defs.appendChild(pathGradient);
        
        const nodeGradient = document.createElementNS('http://www.w3.org/2000/svg', 'radialGradient');
        nodeGradient.setAttribute('id', 'nodeGradient');
        nodeGradient.setAttribute('cx', '50%');
        nodeGradient.setAttribute('cy', '50%');
        nodeGradient.setAttribute('r', '50%');
        
        const nodeStop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        nodeStop1.setAttribute('offset', '0%');
        nodeStop1.setAttribute('stop-color', 'rgba(230, 225, 240, 0.35)');
        
        const nodeStop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        nodeStop2.setAttribute('offset', '40%');
        nodeStop2.setAttribute('stop-color', 'rgba(210, 205, 220, 0.25)');
        
        const nodeStop3 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        nodeStop3.setAttribute('offset', '100%');
        nodeStop3.setAttribute('stop-color', 'rgba(200, 195, 210, 0.08)');
        
        nodeGradient.appendChild(nodeStop1);
        nodeGradient.appendChild(nodeStop2);
        nodeGradient.appendChild(nodeStop3);
        defs.appendChild(nodeGradient);
        
        const successGradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
        successGradient.setAttribute('id', 'successGradient');
        successGradient.setAttribute('x1', '0%');
        successGradient.setAttribute('y1', '0%');
        successGradient.setAttribute('x2', '100%');
        successGradient.setAttribute('y2', '0%');
        
        const successStop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        successStop1.setAttribute('offset', '0%');
        successStop1.setAttribute('stop-color', '#69f0ae');
        
        const successStop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        successStop2.setAttribute('offset', '50%');
        successStop2.setAttribute('stop-color', '#00e676');
        
        const successStop3 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        successStop3.setAttribute('offset', '100%');
        successStop3.setAttribute('stop-color', '#69f0ae');
        
        successGradient.appendChild(successStop1);
        successGradient.appendChild(successStop2);
        successGradient.appendChild(successStop3);
        defs.appendChild(successGradient);
        
        const failGradient = document.createElementNS('http://www.w3.org/2000/svg', 'linearGradient');
        failGradient.setAttribute('id', 'failGradient');
        failGradient.setAttribute('x1', '0%');
        failGradient.setAttribute('y1', '0%');
        failGradient.setAttribute('x2', '100%');
        failGradient.setAttribute('y2', '0%');
        
        const failStop1 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        failStop1.setAttribute('offset', '0%');
        failStop1.setAttribute('stop-color', '#ff8a65');
        
        const failStop2 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        failStop2.setAttribute('offset', '50%');
        failStop2.setAttribute('stop-color', '#ff5722');
        
        const failStop3 = document.createElementNS('http://www.w3.org/2000/svg', 'stop');
        failStop3.setAttribute('offset', '100%');
        failStop3.setAttribute('stop-color', '#ff8a65');
        
        failGradient.appendChild(failStop1);
        failGradient.appendChild(failStop2);
        failGradient.appendChild(failStop3);
        defs.appendChild(failGradient);
        
        this.mazeSvg.appendChild(defs);
    }
    
    renderPathNodes(path) {
        const totalSegments = path.segments.filter(s => !s.isDeadEnd).length;
        
        for (let i = 0; i < path.segments.length; i++) {
            const segment = path.segments[i];
            if (segment.isDeadEnd) continue;
            
            if (i > 0 && (i === Math.floor(totalSegments / 2) || i === totalSegments - 1)) {
                this.renderNode(segment.start.x, segment.start.y);
            }
            
            if (i === path.segments.length - 1 && totalSegments > 3) {
                this.renderNode(segment.end.x, segment.end.y);
            }
        }
    }
    
    renderNode(x, y) {
        const node = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        node.setAttribute('cx', x);
        node.setAttribute('cy', y);
        node.setAttribute('r', 4);
        node.setAttribute('class', 'path-node');
        
        this.mazeSvg.appendChild(node);
    }
    
    renderBranch(branch, parentPath) {
        for (const segment of branch.segments) {
            if (segment.isDeadEnd) continue;
            const line = this.renderSegment(segment, true);
            this.svgLines.push({ line: line, segment: segment, path: parentPath, isBranch: true });
        }
        
        if (branch.subBranches) {
            for (const subBranch of branch.subBranches) {
                this.renderBranch(subBranch, parentPath);
            }
        }
    }
    
    renderSegment(segment, isBranch) {
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', segment.start.x);
        line.setAttribute('y1', segment.start.y);
        line.setAttribute('x2', segment.end.x);
        line.setAttribute('y2', segment.end.y);
        line.setAttribute('class', 'path-line');
        
        if (isBranch) {
            line.style.opacity = '0.6';
        }
        
        this.mazeSvg.appendChild(line);
        return line;
    }
    
    createPathSelectionAreas() {
        const gameContainer = document.querySelector('.game-container');
        
        for (let i = 0; i < this.paths.length; i++) {
            const path = this.paths[i];
            
            let targetSegment = null;
            for (const segment of path.segments) {
                if (segment.type === 'horizontal' && !segment.isDeadEnd) {
                    targetSegment = segment;
                    break;
                }
            }
            
            if (!targetSegment) {
                continue;
            }
            
            const startX = targetSegment.start.x;
            const startY = targetSegment.start.y;
            const endX = targetSegment.end.x;
            
            const clickArea = document.createElement('button');
            clickArea.className = 'path-start-area';
            clickArea.textContent = `路径 ${i + 1}`;
            
            const padding = 25;
            const minX = Math.min(startX, endX) - padding;
            const maxX = Math.max(startX, endX) + padding;
            
            clickArea.style.left = minX + 'px';
            clickArea.style.top = (80 + startY - padding) + 'px';
            clickArea.style.width = (maxX - minX) + 'px';
            clickArea.style.height = (padding * 2) + 'px';
            
            clickArea.addEventListener('click', () => {
                if (!this.isGameActive || this.isAnimating) return;
                this.selectPath(path);
            });
            
            gameContainer.appendChild(clickArea);
        }
    }
    
    selectPath(path) {
        if (this.isAnimating) return;
        
        this.attempts++;
        this.updateUI();
        this.isAnimating = true;
        
        this.animatePathSelection(path, (success) => {
            if (success) {
                this.animateWin(path);
            } else {
                this.animateFail(path);
            }
        });
    }
    
    animatePathSelection(path, callback) {
        const allSegments = this.getAllPathSegments(path);
        let currentSegmentIndex = 0;
        let progress = 0;
        
        const travelDot = document.createElement('div');
        travelDot.className = 'travel-dot';
        this.pathContainer.appendChild(travelDot);
        
        const animate = () => {
            if (currentSegmentIndex >= allSegments.length) {
                travelDot.remove();
                callback(path.isCorrect);
                return;
            }
            
            const segment = allSegments[currentSegmentIndex];
            
            if (segment.isDeadEnd) {
                travelDot.remove();
                callback(false);
                return;
            }
            
            const startX = segment.start.x;
            const startY = segment.start.y;
            const endX = segment.end.x;
            const endY = segment.end.y;
            
            const x = startX + (endX - startX) * progress;
            const y = startY + (endY - startY) * progress;
            
            travelDot.style.left = (x - 8) + 'px';
            travelDot.style.top = (y - 8) + 'px';
            
            progress += 0.025;
            
            if (progress >= 1) {
                progress = 0;
                currentSegmentIndex++;
            }
            
            requestAnimationFrame(animate);
        };
        
        animate();
    }
    
    getAllPathSegments(path) {
        const segments = [...path.segments];
        return segments.filter(s => !s.isBranch);
    }
    
    animateWin(path) {
        const winLines = this.svgLines.filter(item => 
            item.path.id === path.id && !item.isBranch && !item.segment.isDeadEnd
        );
        
        for (const item of winLines) {
            item.line.classList.add('path-glow-success');
        }
        
        this.showSuccessParticles();
        
        setTimeout(() => {
            this.isAnimating = false;
            this.handleSuccess();
        }, 1000);
    }
    
    animateFail(path) {
        const failLines = this.svgLines.filter(item => 
            item.path.id === path.id && !item.isBranch
        );
        
        for (const item of failLines) {
            item.line.classList.add('path-fail');
        }
        
        this.gameArea.classList.add('shake-effect');
        
        setTimeout(() => {
            this.gameArea.classList.remove('shake-effect');
        }, 500);
        
        setTimeout(() => {
            this.isAnimating = false;
            this.handleFailure();
        }, 800);
    }
    
    showSuccessParticles() {
        const colors = ['#69f0ae', '#00e676', '#b388ff', '#7c4dff', '#ffd3a5'];
        
        for (let i = 0; i < 20; i++) {
            const particle = document.createElement('div');
            particle.className = 'success-particle';
            
            const x = Math.random() * this.gameArea.clientWidth;
            const y = Math.random() * this.gameArea.clientHeight;
            const color = colors[Math.floor(Math.random() * colors.length)];
            const size = 8 + Math.random() * 12;
            
            particle.style.left = x + 'px';
            particle.style.top = y + 'px';
            particle.style.width = size + 'px';
            particle.style.height = size + 'px';
            particle.style.background = color;
            particle.style.animationDelay = (Math.random() * 0.5) + 's';
            
            this.pathContainer.appendChild(particle);
            
            setTimeout(() => {
                particle.remove();
            }, 1500);
        }
    }
    
    handleSuccess() {
        this.showMessage(
            'success',
            '通关成功!',
            `太棒了！你成功通过了第 ${this.level} 关！`,
            '下一关'
        );
        this.messageBtn.dataset.action = 'next';
    }
    
    handleFailure() {
        this.showMessage(
            'failure',
            '走错了!',
            '这是一条死胡同！别灰心，再试一次吧！',
            '重新挑战'
        );
        this.messageBtn.dataset.action = 'retry';
    }
    
    showMessage(type, title, text, btnText) {
        this.messageIcon.className = 'message-icon ' + type;
        this.messageTitle.className = 'message-title ' + type;
        this.messageTitle.textContent = title;
        this.messageText.textContent = text;
        this.messageBtn.textContent = btnText;
        this.messageOverlay.classList.add('active');
    }
    
    hideMessage() {
        this.messageOverlay.classList.remove('active');
    }
    
    handleMessageClose() {
        const action = this.messageBtn.dataset.action;
        
        if (action === 'next') {
            this.level++;
            this.updateUI();
            this.hideMessage();
            this.generateLevel();
        } else if (action === 'retry') {
            this.hideMessage();
            this.generateLevel();
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new ForkEscapeGame();
});
