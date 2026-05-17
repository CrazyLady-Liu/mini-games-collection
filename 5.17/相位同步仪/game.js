class PhaseSynchronizer {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.level = 1;
        this.shapes = [];
        this.isLevelComplete = false;
        this.animationId = null;
        this.lastTime = 0;
        this.debugLogEnabled = true;
        this.logFrameCount = 0;
        
        this.colors = [
            '#00d4ff',
            '#7c3aed',
            '#f472b6',
            '#22c55e',
            '#f59e0b',
            '#ef4444',
            '#06b6d4',
            '#8b5cf6'
        ];
        
        this.shapeTypes = ['triangle', 'square', 'pentagon', 'hexagon', 'star', 'diamond'];
        
        this.init();
    }
    
    init() {
        this.setupLevel();
        this.setupEventListeners();
        this.gameLoop();
    }
    
    getLevelConfig() {
        const baseSpeed = 0.5;
        const speedVariance = Math.min(0.3 + this.level * 0.1, 1.5);
        const shapeCount = Math.min(2 + Math.floor(this.level / 2), 6);
        
        return {
            shapeCount,
            baseSpeed,
            speedVariance,
            hasVariableSpeed: this.level >= 3,
            variableCount: this.level >= 3 ? Math.max(1, Math.floor((this.level - 1) / 2)) : 0
        };
    }
    
    setupLevel() {
        const config = this.getLevelConfig();
        this.shapes = [];
        this.isLevelComplete = false;
        
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        const radius = Math.min(centerX, centerY) * 0.35;
        
        for (let i = 0; i < config.shapeCount; i++) {
            const angle = (i / config.shapeCount) * Math.PI * 2;
            const x = centerX + Math.cos(angle) * radius;
            const y = centerY + Math.sin(angle) * radius;
            
            const baseSpeed = config.baseSpeed + (Math.random() - 0.5) * config.speedVariance;
            const initialPhase = Math.random() * Math.PI * 2;
            
            const isVariable = i < config.variableCount && config.hasVariableSpeed;
            
            this.shapes.push({
                x,
                y,
                radius: 45,
                rotation: initialPhase,
                baseSpeed: baseSpeed,
                currentSpeed: baseSpeed,
                userSpeed: baseSpeed,
                color: this.colors[i % this.colors.length],
                shapeType: this.shapeTypes[i % this.shapeTypes.length],
                isVariable,
                variablePhase: Math.random() * Math.PI * 2,
                variableSpeed: 0.3 + Math.random() * 0.3,
                variableAmount: 0.2 + Math.random() * 0.2
            });
        }
        
        this.createSliders();
        this.updateLevelDisplay();
    }
    
    createSliders() {
        const container = document.getElementById('slidersContainer');
        container.innerHTML = '';
        
        this.shapes.forEach((shape, index) => {
            const sliderGroup = document.createElement('div');
            sliderGroup.className = 'slider-group';
            
            const minSpeed = -2;
            const maxSpeed = 2;
            const step = 0.01;
            
            sliderGroup.innerHTML = `
                <div class="slider-header">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <div class="shape-indicator" style="background: ${shape.color};"></div>
                        <span>图形 ${index + 1}${shape.isVariable ? ' ⚡' : ''}</span>
                    </div>
                    <span class="speed-value" id="speed-${index}">${shape.userSpeed.toFixed(2)}</span>
                </div>
                <input type="range" 
                       id="slider-${index}" 
                       min="${minSpeed}" 
                       max="${maxSpeed}" 
                       step="${step}" 
                       value="${shape.userSpeed}">
            `;
            
            container.appendChild(sliderGroup);
            
            const slider = sliderGroup.querySelector(`#slider-${index}`);
            const speedDisplay = sliderGroup.querySelector(`#speed-${index}`);
            
            slider.addEventListener('input', (e) => {
                const value = parseFloat(e.target.value);
                this.shapes[index].userSpeed = value;
                speedDisplay.textContent = value.toFixed(2);
            });
        });
    }
    
    setupEventListeners() {
        document.getElementById('resetBtn').addEventListener('click', () => {
            this.resetLevel();
        });
        
        document.getElementById('hintBtn').addEventListener('click', () => {
            this.showHint();
        });
        
        document.addEventListener('keydown', (e) => {
            if (e.key >= '1' && e.key <= '9') {
                this.level = parseInt(e.key);
                this.setupLevel();
                console.log(`🔄 跳转到关卡 ${this.level}`);
            }
            if (e.key === 'l' || e.key === 'L') {
                this.debugLogEnabled = !this.debugLogEnabled;
                console.log(`📝 日志输出: ${this.debugLogEnabled ? '开启' : '关闭'}`);
            }
        });
    }
    
    resetLevel() {
        this.shapes.forEach((shape, index) => {
            shape.rotation = Math.random() * Math.PI * 2;
            shape.currentSpeed = shape.baseSpeed;
            shape.userSpeed = shape.baseSpeed;
            
            const slider = document.getElementById(`slider-${index}`);
            const speedDisplay = document.getElementById(`speed-${index}`);
            if (slider) slider.value = shape.baseSpeed;
            if (speedDisplay) speedDisplay.textContent = shape.baseSpeed.toFixed(2);
        });
        
        this.isLevelComplete = false;
        document.getElementById('levelComplete').classList.add('hidden');
    }
    
    showHint() {
        if (this.shapes.length < 2) return;
        
        const targetSpeed = this.shapes[0].userSpeed;
        const targetRotation = this.shapes[0].rotation;
        this.shapes.forEach((shape, index) => {
            if (index > 0) {
                shape.userSpeed = targetSpeed;
                shape.rotation = targetRotation;
                const slider = document.getElementById(`slider-${index}`);
                const speedDisplay = document.getElementById(`speed-${index}`);
                if (slider) slider.value = targetSpeed;
                if (speedDisplay) speedDisplay.textContent = targetSpeed.toFixed(2);
            }
        });
    }
    
    update(deltaTime) {
        if (this.isLevelComplete) return;
        
        this.logFrameCount++;
        const shouldLog = this.debugLogEnabled && this.level >= 3 && this.logFrameCount % 60 === 0;
        
        if (shouldLog) {
            console.log(`========== 帧 ${this.logFrameCount} | 关卡 ${this.level} | Δt=${deltaTime.toFixed(4)}s ==========`);
        }
        
        const baseShape = this.shapes[0];
        const baseSpeed = baseShape.userSpeed;
        
        this.shapes.forEach((shape, index) => {
            const prevRotation = shape.rotation;
            const prevSpeed = shape.currentSpeed;
            shape.isLocked = false;
            
            if (shape.isVariable) {
                shape.variablePhase += shape.variableSpeed * deltaTime;
                const variation = Math.sin(shape.variablePhase) * shape.variableAmount;
                shape.currentSpeed = shape.userSpeed + variation;
                
                if (shouldLog) {
                    console.log(`  [图形${index+1}⚡] 变速干扰:`);
                    console.log(`    variablePhase: ${shape.variablePhase.toFixed(4)} rad`);
                    console.log(`    sin(phase): ${Math.sin(shape.variablePhase).toFixed(4)}`);
                    console.log(`    variation: ${variation.toFixed(4)}`);
                    console.log(`    userSpeed: ${shape.userSpeed.toFixed(4)}`);
                    console.log(`    currentSpeed: ${prevSpeed.toFixed(4)} → ${shape.currentSpeed.toFixed(4)}`);
                }
            } else {
                shape.currentSpeed = shape.userSpeed;
            }
            
            shape.rotation += shape.currentSpeed * deltaTime;
            shape.rotation = shape.rotation % (Math.PI * 2);
            if (shape.rotation < 0) shape.rotation += Math.PI * 2;
            
            if (index > 0) {
                const speedDiff = Math.abs(shape.userSpeed - baseSpeed);
                const speedThreshold = 0.15;
                
                if (speedDiff < speedThreshold) {
                    let phaseDiff = shape.rotation - baseShape.rotation;
                    while (phaseDiff > Math.PI) phaseDiff -= Math.PI * 2;
                    while (phaseDiff < -Math.PI) phaseDiff += Math.PI * 2;
                    
                    const phaseThreshold = 0.5;
                    if (Math.abs(phaseDiff) < phaseThreshold) {
                        const lockStrength = (1 - Math.abs(phaseDiff) / phaseThreshold) * 0.3;
                        shape.rotation -= phaseDiff * lockStrength;
                        shape.isLocked = true;
                        
                        if (shouldLog) {
                            console.log(`  [图形${index+1}] 🔗 相位锁定: phaseDiff=${phaseDiff.toFixed(4)}, 修正=${(phaseDiff * lockStrength).toFixed(4)}`);
                        }
                    }
                }
            }
            
            if (shouldLog) {
                const type = shape.isVariable ? '⚡变速' : '普通';
                const lockTag = shape.isLocked ? ' 🔗' : '';
                console.log(`  [图形${index+1} ${type}]${lockTag} rotation: ${prevRotation.toFixed(4)} → ${shape.rotation.toFixed(4)} | speed: ${shape.currentSpeed.toFixed(4)}`);
            }
        });
        
        this.checkSync(shouldLog);
        this.updateSyncDisplay();
    }
    
    checkSync(shouldLog = false) {
        if (this.shapes.length < 2) return;
        
        const tolerance = 0.1;
        let allSynced = true;
        const baseRotation = this.shapes[0].rotation;
        const baseSpeed = this.shapes[0].userSpeed;
        
        if (shouldLog) {
            console.log(`  --- 同步检测 ---`);
            console.log(`  基准[图形1]: rotation=${baseRotation.toFixed(4)}, userSpeed=${baseSpeed.toFixed(4)}`);
            console.log(`  容差: phase≤${tolerance}, speed≤0.05`);
        }
        
        for (let i = 1; i < this.shapes.length; i++) {
            const shape = this.shapes[i];
            
            let phaseDiff = Math.abs(shape.rotation - baseRotation);
            phaseDiff = Math.min(phaseDiff, Math.PI * 2 - phaseDiff);
            
            const speedDiff = Math.abs(shape.userSpeed - baseSpeed);
            const isVariable = shape.isVariable;
            
            const phaseOk = phaseDiff <= tolerance;
            const speedOk = speedDiff <= 0.05;
            const shapeOk = phaseOk && speedOk;
            
            if (shouldLog) {
                const status = shapeOk ? '✓同步' : '✗不同步';
                const varTag = isVariable ? '⚡' : '  ';
                console.log(`  ${varTag}[图形${i+1}] phaseDiff=${phaseDiff.toFixed(4)} ${phaseOk?'✓':'✗'}, speedDiff=${speedDiff.toFixed(4)} ${speedOk?'✓':'✗'} → ${status}`);
                if (isVariable && !phaseOk) {
                    console.log(`      变速参数: currentSpeed=${shape.currentSpeed.toFixed(4)}, userSpeed=${shape.userSpeed.toFixed(4)}, varPhase=${shape.variablePhase.toFixed(4)}`);
                }
            }
            
            if (!shapeOk) {
                allSynced = false;
            }
        }
        
        if (shouldLog) {
            console.log(`  最终结果: ${allSynced ? '✓ 全部同步!' : '✗ 未同步'}`);
        }
        
        if (allSynced) {
            if (this.debugLogEnabled && this.level >= 3) {
                console.log(`🎉 关卡 ${this.level} 通关!`);
            }
            this.levelComplete();
        }
    }
    
    calculateSyncLevel() {
        if (this.shapes.length < 2) return 100;
        
        let totalDiff = 0;
        const baseRotation = this.shapes[0].rotation;
        
        for (let i = 1; i < this.shapes.length; i++) {
            let phaseDiff = Math.abs(this.shapes[i].rotation - baseRotation);
            phaseDiff = Math.min(phaseDiff, Math.PI * 2 - phaseDiff);
            totalDiff += phaseDiff;
        }
        
        const avgDiff = totalDiff / (this.shapes.length - 1);
        const maxDiff = Math.PI;
        const syncLevel = Math.max(0, 100 - (avgDiff / maxDiff) * 100);
        
        return Math.round(syncLevel);
    }
    
    updateSyncDisplay() {
        document.getElementById('sync-level').textContent = this.calculateSyncLevel() + '%';
    }
    
    updateLevelDisplay() {
        document.getElementById('level').textContent = this.level;
    }
    
    levelComplete() {
        if (this.isLevelComplete) return;
        
        this.isLevelComplete = true;
        document.getElementById('levelComplete').classList.remove('hidden');
        
        setTimeout(() => {
            this.level++;
            this.setupLevel();
            document.getElementById('levelComplete').classList.add('hidden');
        }, 2000);
    }
    
    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.drawCenterIndicator();
        this.drawConnectionLines();
        
        this.shapes.forEach((shape) => {
            this.drawShape(shape, shape.isLocked);
        });
    }
    
    drawCenterIndicator() {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, 8, 0, Math.PI * 2);
        this.ctx.fillStyle = '#00d4ff';
        this.ctx.fill();
        
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, 15, 0, Math.PI * 2);
        this.ctx.strokeStyle = 'rgba(0, 212, 255, 0.3)';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        
        const pulseRadius = 20 + Math.sin(Date.now() / 500) * 5;
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, pulseRadius, 0, Math.PI * 2);
        this.ctx.strokeStyle = 'rgba(124, 58, 237, 0.3)';
        this.ctx.lineWidth = 1;
        this.ctx.stroke();
    }
    
    drawConnectionLines() {
        const centerX = this.canvas.width / 2;
        const centerY = this.canvas.height / 2;
        
        this.shapes.forEach((shape) => {
            this.ctx.beginPath();
            this.ctx.moveTo(centerX, centerY);
            this.ctx.lineTo(shape.x, shape.y);
            this.ctx.strokeStyle = shape.color + '40';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
        });
    }
    
    drawShape(shape, isLocked = false) {
        this.ctx.save();
        this.ctx.translate(shape.x, shape.y);
        this.ctx.rotate(shape.rotation);
        
        this.ctx.shadowColor = shape.color;
        this.ctx.shadowBlur = isLocked ? 35 : 20;
        
        if (isLocked) {
            this.ctx.beginPath();
            this.ctx.arc(0, 0, shape.radius + 12, 0, Math.PI * 2);
            this.ctx.strokeStyle = '#22c55e80';
            this.ctx.lineWidth = 3;
            this.ctx.stroke();
            
            const lockPulse = Math.sin(Date.now() / 100) * 3;
            this.ctx.beginPath();
            this.ctx.arc(0, 0, shape.radius + 8 + lockPulse, 0, Math.PI * 2);
            this.ctx.strokeStyle = '#22c55e40';
            this.ctx.lineWidth = 2;
            this.ctx.stroke();
        }
        
        this.ctx.beginPath();
        this.ctx.arc(0, 0, shape.radius + 5, 0, Math.PI * 2);
        this.ctx.strokeStyle = shape.color + '30';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        
        this.ctx.beginPath();
        
        switch (shape.shapeType) {
            case 'triangle':
                this.drawPolygon(3, shape.radius);
                break;
            case 'square':
                this.drawPolygon(4, shape.radius);
                break;
            case 'pentagon':
                this.drawPolygon(5, shape.radius);
                break;
            case 'hexagon':
                this.drawPolygon(6, shape.radius);
                break;
            case 'star':
                this.drawStar(5, shape.radius, shape.radius * 0.5);
                break;
            case 'diamond':
                this.drawDiamond(shape.radius);
                break;
        }
        
        this.ctx.fillStyle = shape.color;
        this.ctx.fill();
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        
        this.ctx.beginPath();
        this.ctx.moveTo(0, 0);
        this.ctx.lineTo(0, -shape.radius * 0.8);
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 3;
        this.ctx.stroke();
        
        this.ctx.restore();
    }
    
    drawPolygon(sides, radius) {
        for (let i = 0; i < sides; i++) {
            const angle = (i / sides) * Math.PI * 2 - Math.PI / 2;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            
            if (i === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        }
        this.ctx.closePath();
    }
    
    drawStar(points, outerRadius, innerRadius) {
        for (let i = 0; i < points * 2; i++) {
            const angle = (i / (points * 2)) * Math.PI * 2 - Math.PI / 2;
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            
            if (i === 0) {
                this.ctx.moveTo(x, y);
            } else {
                this.ctx.lineTo(x, y);
            }
        }
        this.ctx.closePath();
    }
    
    drawDiamond(radius) {
        this.ctx.moveTo(0, -radius);
        this.ctx.lineTo(radius * 0.6, 0);
        this.ctx.lineTo(0, radius);
        this.ctx.lineTo(-radius * 0.6, 0);
        this.ctx.closePath();
    }
    
    gameLoop(currentTime = 0) {
        const deltaTime = Math.min((currentTime - this.lastTime) / 1000, 0.1);
        this.lastTime = currentTime;
        
        this.update(deltaTime);
        this.render();
        
        this.animationId = requestAnimationFrame((time) => this.gameLoop(time));
    }
    
    destroy() {
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new PhaseSynchronizer();
});
