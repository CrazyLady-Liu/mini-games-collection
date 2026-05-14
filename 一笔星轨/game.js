class StarTrackGame {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.level = 1;
        this.stars = [];
        this.connectedStars = [];
        this.lines = [];
        this.currentLine = [];
        this.isDrawing = false;
        this.isPaused = false;
        this.isDestroyed = false;
        this.steps = 0;
        this.lastConnectedIndex = 0;
        this.errorMessage = '';
        this.celebrationActive = false;
        this.celebrationParticles = [];
        this.animationFrameId = null;
        
        this.resizeHandler = () => this.resizeCanvas();
        this.mouseDownHandler = (e) => this.handleMouseDown(e);
        this.mouseMoveHandler = (e) => this.handleMouseMove(e);
        this.mouseUpHandler = () => this.handleMouseUp();
        this.mouseLeaveHandler = () => this.handleMouseUp();
        this.touchStartHandler = (e) => this.handleTouchStart(e);
        this.touchMoveHandler = (e) => this.handleTouchMove(e);
        this.touchEndHandler = () => this.handleTouchEnd();
        this.restartHandler = () => this.restart();
        this.clearLinesHandler = () => this.clearLines();
        this.helpHandler = () => this.showHelp();
        this.pauseHandler = () => this.togglePause();
        this.closeHandler = () => this.hideHelp();
        this.resumeHandler = () => this.togglePause();
        this.nextHandler = () => this.nextLevel();
        
        this.init();
    }
    
    init() {
        this.resizeCanvas();
        window.addEventListener('resize', this.resizeHandler);
        
        this.generateStars();
        this.bindEvents();
        this.updateUI();
        this.draw();
        
        this.startAnimationLoop();
    }
    
    startAnimationLoop() {
        const animate = () => {
            if (this.isDestroyed) return;
            
            if (!this.isPaused) {
                this.draw();
            }
            
            this.animationFrameId = requestAnimationFrame(animate);
        };
        animate();
    }
    
    destroy() {
        this.isDestroyed = true;
        
        if (this.animationFrameId) {
            cancelAnimationFrame(this.animationFrameId);
            this.animationFrameId = null;
        }
        
        window.removeEventListener('resize', this.resizeHandler);
        this.unbindEvents();
        
        this.celebrationActive = false;
        this.celebrationParticles = null;
        this.stars = null;
        this.connectedStars = null;
        this.lines = null;
        this.currentLine = null;
        this.canvas = null;
        this.ctx = null;
    }
    
    resizeCanvas() {
        if (!this.canvas) return;
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        if (this.stars && this.stars.length > 0) {
            this.draw();
        }
    }
    
    generateStars() {
        this.stars.length = 0;
        this.connectedStars.length = 0;
        this.lines.length = 0;
        this.currentLine.length = 0;
        this.lastConnectedIndex = 0;
        this.steps = 0;
        
        const minStars = 6;
        const maxStars = Math.min(12, 6 + Math.floor(this.level / 2));
        const starCount = minStars + Math.floor(Math.random() * (maxStars - minStars + 1));
        
        const padding = 80;
        const areaWidth = this.canvas.width - padding * 2;
        const areaHeight = this.canvas.height - padding * 2;
        
        const minDistance = this.calculateMinDistance(starCount);
        
        for (let i = 0; i < starCount; i++) {
            let attempts = 0;
            let validPosition = false;
            let x, y;
            
            while (!validPosition && attempts < 100) {
                x = padding + Math.random() * areaWidth;
                y = padding + Math.random() * areaHeight;
                validPosition = true;
                
                for (let j = 0; j < this.stars.length; j++) {
                    const star = this.stars[j];
                    const distance = Math.sqrt(Math.pow(x - star.x, 2) + Math.pow(y - star.y, 2));
                    if (distance < minDistance) {
                        validPosition = false;
                        break;
                    }
                }
                attempts++;
            }
            
            this.stars.push({
                id: i + 1,
                x: x,
                y: y,
                connected: false
            });
        }
        
        this.stars.sort((a, b) => a.id - b.id);
        document.getElementById('total').textContent = this.stars.length;
    }
    
    calculateMinDistance(starCount) {
        const baseDistance = 100;
        const densityFactor = Math.min(1, starCount / 8);
        const levelFactor = Math.min(0.8, 1 - (this.level - 1) * 0.05);
        return baseDistance * densityFactor * levelFactor;
    }
    
    bindEvents() {
        this.canvas.addEventListener('mousedown', this.mouseDownHandler);
        this.canvas.addEventListener('mousemove', this.mouseMoveHandler);
        this.canvas.addEventListener('mouseup', this.mouseUpHandler);
        this.canvas.addEventListener('mouseleave', this.mouseLeaveHandler);
        this.canvas.addEventListener('touchstart', this.touchStartHandler);
        this.canvas.addEventListener('touchmove', this.touchMoveHandler);
        this.canvas.addEventListener('touchend', this.touchEndHandler);
        
        document.getElementById('btn-restart').addEventListener('click', this.restartHandler);
        document.getElementById('btn-clear').addEventListener('click', this.clearLinesHandler);
        document.getElementById('btn-help').addEventListener('click', this.helpHandler);
        document.getElementById('btn-pause').addEventListener('click', this.pauseHandler);
        document.getElementById('btn-close').addEventListener('click', this.closeHandler);
        document.getElementById('btn-resume').addEventListener('click', this.resumeHandler);
        document.getElementById('btn-next').addEventListener('click', this.nextHandler);
    }
    
    unbindEvents() {
        if (this.canvas) {
            this.canvas.removeEventListener('mousedown', this.mouseDownHandler);
            this.canvas.removeEventListener('mousemove', this.mouseMoveHandler);
            this.canvas.removeEventListener('mouseup', this.mouseUpHandler);
            this.canvas.removeEventListener('mouseleave', this.mouseLeaveHandler);
            this.canvas.removeEventListener('touchstart', this.touchStartHandler);
            this.canvas.removeEventListener('touchmove', this.touchMoveHandler);
            this.canvas.removeEventListener('touchend', this.touchEndHandler);
        }
        
        document.getElementById('btn-restart').removeEventListener('click', this.restartHandler);
        document.getElementById('btn-clear').removeEventListener('click', this.clearLinesHandler);
        document.getElementById('btn-help').removeEventListener('click', this.helpHandler);
        document.getElementById('btn-pause').removeEventListener('click', this.pauseHandler);
        document.getElementById('btn-close').removeEventListener('click', this.closeHandler);
        document.getElementById('btn-resume').removeEventListener('click', this.resumeHandler);
        document.getElementById('btn-next').removeEventListener('click', this.nextHandler);
    }
    
    handleMouseDown(e) {
        if (this.isPaused || this.isDestroyed) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        this.checkAndStartDrawing(x, y);
    }
    
    handleMouseMove(e) {
        if (!this.isDrawing || this.isPaused || this.isDestroyed) return;
        
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        this.currentLine.push({ x, y });
    }
    
    handleMouseUp() {
        if (this.isDrawing) {
            this.isDrawing = false;
            
            if (this.currentLine.length > 1) {
                if (this.hasLineCrossing(this.currentLine)) {
                    this.showError('连线交叉！请重新连接');
                    this.currentLine.length = 0;
                    return;
                }
                
                this.lines.push([...this.currentLine]);
            }
            this.currentLine.length = 0;
        }
    }
    
    handleTouchStart(e) {
        e.preventDefault();
        if (this.isPaused || this.isDestroyed) return;
        
        const touch = e.touches[0];
        const rect = this.canvas.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        
        this.checkAndStartDrawing(x, y);
    }
    
    handleTouchMove(e) {
        e.preventDefault();
        if (!this.isDrawing || this.isPaused || this.isDestroyed) return;
        
        const touch = e.touches[0];
        const rect = this.canvas.getBoundingClientRect();
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        
        this.currentLine.push({ x, y });
    }
    
    handleTouchEnd() {
        this.handleMouseUp();
    }
    
    checkAndStartDrawing(x, y) {
        const clickedStar = this.findStarAtPosition(x, y);
        
        if (clickedStar) {
            const expectedNextId = this.lastConnectedIndex === 0 ? 1 : this.lastConnectedIndex + 1;
            
            if (clickedStar.id === expectedNextId) {
                this.errorMessage = '';
                this.connectStar(clickedStar);
                this.isDrawing = true;
                this.currentLine.length = 0;
                this.currentLine.push({ x: clickedStar.x, y: clickedStar.y });
                this.steps++;
                this.updateUI();
            } else if (clickedStar.connected) {
                this.showError('星星已连接！');
            } else {
                this.showError(`请按顺序连接！下一个应为 ${expectedNextId}`);
            }
        }
    }
    
    findStarAtPosition(x, y) {
        for (let i = 0; i < this.stars.length; i++) {
            const star = this.stars[i];
            const dx = x - star.x;
            const dy = y - star.y;
            if (dx * dx + dy * dy <= 625) {
                return star;
            }
        }
        return null;
    }
    
    connectStar(star) {
        star.connected = true;
        this.connectedStars.push(star);
        this.lastConnectedIndex = star.id;
        
        if (this.connectedStars.length === this.stars.length) {
            this.validateAndComplete();
        }
    }
    
    validateAndComplete() {
        if (this.hasAnyLineCrossing()) {
            this.showError('连线存在交叉！请清空后重新连接');
            return;
        }
        
        if (!this.isCorrectOrder()) {
            this.showError('连接顺序不正确！');
            return;
        }
        
        this.showSuccess();
    }
    
    ccw(A, B, C) {
        return (C.y - A.y) * (B.x - A.x) > (B.y - A.y) * (C.x - A.x);
    }
    
    linesIntersect(A, B, C, D) {
        return this.ccw(A, C, D) !== this.ccw(B, C, D) && this.ccw(A, B, C) !== this.ccw(A, B, D);
    }
    
    hasLineCrossing(newLine) {
        if (newLine.length < 2) return false;
        
        for (let i = 0; i < newLine.length - 1; i++) {
            const segment1Start = newLine[i];
            const segment1End = newLine[i + 1];
            
            for (let j = 0; j < this.lines.length; j++) {
                const existingLine = this.lines[j];
                for (let k = 0; k < existingLine.length - 1; k++) {
                    const segment2Start = existingLine[k];
                    const segment2End = existingLine[k + 1];
                    
                    if (this.linesIntersect(segment1Start, segment1End, segment2Start, segment2End)) {
                        return true;
                    }
                }
            }
            
            for (let j = i + 2; j < newLine.length - 1; j++) {
                const segment2Start = newLine[j];
                const segment2End = newLine[j + 1];
                
                if (this.linesIntersect(segment1Start, segment1End, segment2Start, segment2End)) {
                    return true;
                }
            }
        }
        
        return false;
    }
    
    hasAnyLineCrossing() {
        const allSegments = [];
        
        for (let i = 0; i < this.lines.length; i++) {
            const line = this.lines[i];
            for (let j = 0; j < line.length - 1; j++) {
                allSegments.push({ start: line[j], end: line[j + 1] });
            }
        }
        
        for (let i = 0; i < allSegments.length; i++) {
            for (let j = i + 1; j < allSegments.length; j++) {
                const seg1 = allSegments[i];
                const seg2 = allSegments[j];
                
                if (this.linesIntersect(seg1.start, seg1.end, seg2.start, seg2.end)) {
                    return true;
                }
            }
        }
        
        return false;
    }
    
    isCorrectOrder() {
        for (let i = 0; i < this.connectedStars.length; i++) {
            if (this.connectedStars[i].id !== i + 1) {
                return false;
            }
        }
        return true;
    }
    
    draw() {
        if (!this.ctx || !this.canvas) return;
        
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.drawLines();
        this.drawStars();
        
        if (this.celebrationActive && this.celebrationParticles) {
            this.drawCelebration();
        }
    }
    
    drawLines() {
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';
        
        const hasCrossing = this.hasAnyLineCrossing();
        
        for (let i = 0; i < this.lines.length; i++) {
            const line = this.lines[i];
            if (line.length < 2) continue;
            this.drawGlowingLine(line, hasCrossing);
        }
        
        if (this.currentLine.length > 1) {
            const isCrossing = this.hasLineCrossing(this.currentLine);
            this.drawGlowingLine(this.currentLine, isCrossing, true);
        }
    }
    
    drawGlowingLine(points, isError, isCurrent = false) {
        const baseColor = isError ? { r: 255, g: 68, b: 68 } : { r: 0, g: 180, b: 255 };
        const opacity = isCurrent ? 0.6 : 0.8;
        
        this.ctx.save();
        
        this.ctx.shadowColor = `rgba(${baseColor.r}, ${baseColor.g}, ${baseColor.b}, 0.8)`;
        this.ctx.shadowBlur = 20;
        
        this.ctx.beginPath();
        this.ctx.moveTo(points[0].x, points[0].y);
        
        for (let i = 1; i < points.length; i++) {
            this.ctx.lineTo(points[i].x, points[i].y);
        }
        
        this.ctx.strokeStyle = `rgba(${baseColor.r}, ${baseColor.g}, ${baseColor.b}, ${opacity})`;
        this.ctx.lineWidth = 3;
        this.ctx.stroke();
        
        this.ctx.shadowBlur = 35;
        this.ctx.lineWidth = 8;
        this.ctx.strokeStyle = `rgba(${baseColor.r}, ${baseColor.g}, ${baseColor.b}, ${opacity * 0.3})`;
        this.ctx.stroke();
        
        this.ctx.restore();
    }
    
    drawStars() {
        const hasCrossing = this.hasAnyLineCrossing();
        
        for (let i = 0; i < this.stars.length; i++) {
            this.drawStar(this.stars[i], hasCrossing);
        }
    }
    
    drawStar(star, hasError) {
        this.ctx.save();
        
        const pulsePhase = star.connected ? 0 : Math.sin(Date.now() / 500) * 0.2 + 0.8;
        
        const outerRadius = 20 * pulsePhase;
        const innerRadius = 12 * pulsePhase;
        
        const gradient = this.ctx.createRadialGradient(
            star.x, star.y, 0,
            star.x, star.y, outerRadius
        );
        
        if (star.connected) {
            gradient.addColorStop(0, '#ffffff');
            gradient.addColorStop(0.3, '#00e5ff');
            gradient.addColorStop(0.6, '#0099ff');
            gradient.addColorStop(1, 'transparent');
        } else {
            gradient.addColorStop(0, '#ffffff');
            gradient.addColorStop(0.4, '#ffff88');
            gradient.addColorStop(0.7, '#ffdd00');
            gradient.addColorStop(1, 'transparent');
        }
        
        this.ctx.fillStyle = gradient;
        this.ctx.beginPath();
        this.ctx.arc(star.x, star.y, outerRadius, 0, Math.PI * 2);
        this.ctx.fill();
        
        if (star.connected) {
            this.ctx.shadowColor = 'rgba(0, 229, 255, 0.8)';
            this.ctx.shadowBlur = 25;
        } else {
            this.ctx.shadowColor = 'rgba(255, 255, 136, 0.6)';
            this.ctx.shadowBlur = 15;
        }
        
        this.ctx.beginPath();
        this.ctx.arc(star.x, star.y, innerRadius, 0, Math.PI * 2);
        
        if (star.connected) {
            const starGradient = this.ctx.createRadialGradient(
                star.x, star.y, 0,
                star.x, star.y, innerRadius
            );
            starGradient.addColorStop(0, '#ffffff');
            starGradient.addColorStop(0.5, '#00e5ff');
            starGradient.addColorStop(1, '#0099ff');
            this.ctx.fillStyle = starGradient;
        } else {
            this.ctx.fillStyle = '#ffff88';
        }
        this.ctx.fill();
        
        this.ctx.shadowBlur = 0;
        
        this.ctx.fillStyle = '#1a1a3e';
        this.ctx.font = 'bold 14px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
        this.ctx.fillText(star.id.toString(), star.x, star.y);
        
        if (star.connected) {
            this.drawStarRays(star);
        }
        
        this.ctx.restore();
    }
    
    drawStarRays(star) {
        this.ctx.save();
        this.ctx.strokeStyle = 'rgba(0, 229, 255, 0.4)';
        this.ctx.lineWidth = 1;
        
        const time = Date.now() / 1000;
        
        for (let i = 0; i < 8; i++) {
            const angle = (i / 8) * Math.PI * 2 + time;
            const length = 30 + Math.sin(time * 2 + i) * 10;
            
            this.ctx.beginPath();
            this.ctx.moveTo(star.x, star.y);
            this.ctx.lineTo(
                star.x + Math.cos(angle) * length,
                star.y + Math.sin(angle) * length
            );
            this.ctx.stroke();
        }
        
        this.ctx.restore();
    }
    
    drawCelebration() {
        this.ctx.save();
        
        for (let i = 0; i < this.celebrationParticles.length; i++) {
            const particle = this.celebrationParticles[i];
            
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.vy += 0.1;
            particle.life -= particle.decay;
            
            if (particle.life <= 0) continue;
            
            this.ctx.globalAlpha = particle.life;
            this.ctx.shadowColor = particle.color;
            this.ctx.shadowBlur = 10;
            this.ctx.fillStyle = particle.color;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
        }
        
        this.ctx.restore();
    }
    
    updateUI() {
        document.getElementById('level').textContent = this.level;
        document.getElementById('connected').textContent = this.connectedStars.length;
        document.getElementById('steps').textContent = this.steps;
        
        const status = document.getElementById('status');
        if (this.errorMessage) {
            status.textContent = `❌ ${this.errorMessage}`;
            status.style.color = '#ff4444';
        } else if (this.connectedStars.length === 0) {
            status.textContent = '从星星1开始';
            status.style.color = '#ffdd00';
        } else if (this.connectedStars.length === this.stars.length) {
            status.textContent = '🎉 通关！';
            status.style.color = '#00ff88';
        } else {
            status.textContent = `下一个: ${this.lastConnectedIndex + 1}`;
            status.style.color = '#ffdd00';
        }
    }
    
    showError(message) {
        this.errorMessage = message;
        this.updateUI();
        
        setTimeout(() => {
            if (!this.isDestroyed && this.errorMessage === message) {
                this.errorMessage = '';
                this.updateUI();
            }
        }, 2000);
    }
    
    restart() {
        this.errorMessage = '';
        this.celebrationActive = false;
        if (this.celebrationParticles) {
            this.celebrationParticles.length = 0;
        }
        this.generateStars();
        this.updateUI();
    }
    
    clearLines() {
        this.errorMessage = '';
        for (let i = 0; i < this.stars.length; i++) {
            this.stars[i].connected = false;
        }
        this.connectedStars.length = 0;
        this.lines.length = 0;
        this.currentLine.length = 0;
        this.lastConnectedIndex = 0;
        this.steps = 0;
        this.updateUI();
    }
    
    showHelp() {
        document.getElementById('modal-overlay').classList.add('show');
    }
    
    hideHelp() {
        document.getElementById('modal-overlay').classList.remove('show');
    }
    
    togglePause() {
        this.isPaused = !this.isPaused;
        
        if (this.isPaused) {
            document.getElementById('pause-overlay').classList.add('show');
            document.getElementById('btn-pause').textContent = '继续';
        } else {
            document.getElementById('pause-overlay').classList.remove('show');
            document.getElementById('btn-pause').textContent = '暂停';
        }
    }
    
    showSuccess() {
        this.startCelebration();
        setTimeout(() => {
            if (!this.isDestroyed) {
                document.getElementById('final-steps').textContent = this.steps;
                document.getElementById('final-level').textContent = this.level;
                document.getElementById('success-overlay').classList.add('show');
            }
        }, 2000);
    }
    
    startCelebration() {
        this.celebrationActive = true;
        
        if (!this.celebrationParticles) {
            this.celebrationParticles = [];
        }
        this.celebrationParticles.length = 0;
        
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const colors = ['#00e5ff', '#00ff88', '#ffff00', '#ff6b6b', '#ff9ff3'];
        
        for (let i = 0; i < 100; i++) {
            const angle = (i / 100) * Math.PI * 2;
            const speed = 2 + Math.random() * 4;
            
            this.celebrationParticles.push({
                x: centerX,
                y: centerY,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: 2 + Math.random() * 4,
                color: colors[Math.floor(Math.random() * colors.length)],
                life: 1,
                decay: 0.01 + Math.random() * 0.02
            });
        }
    }
    
    nextLevel() {
        document.getElementById('success-overlay').classList.remove('show');
        this.celebrationActive = false;
        if (this.celebrationParticles) {
            this.celebrationParticles.length = 0;
        }
        this.level++;
        this.generateStars();
        this.updateUI();
    }
}

let gameInstance = null;
let initTimeout = null;

function initGame() {
    if (gameInstance) {
        gameInstance.destroy();
        gameInstance = null;
    }
    
    if (initTimeout) {
        clearTimeout(initTimeout);
    }
    
    initTimeout = setTimeout(() => {
        gameInstance = new StarTrackGame();
    }, 100);
}

window.addEventListener('DOMContentLoaded', initGame);

window.addEventListener('unload', () => {
    if (gameInstance) {
        gameInstance.destroy();
        gameInstance = null;
    }
    if (initTimeout) {
        clearTimeout(initTimeout);
    }
});