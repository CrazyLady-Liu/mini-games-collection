class DustCleanGame {
    constructor() {
        this.canvas = document.getElementById('dustCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.config = {
            brushSize: 40,
            densityLevel: 'low',
            densityCounts: {
                low: 60,
                medium: 150,
                high: 300
            },
            generationSpeed: 20
        };
        this.dustParticles = [];
        this.sparkles = [];
        this.isDrawing = false;
        this.lastX = 0;
        this.lastY = 0;
        this.autoGenerateInterval = null;
        
        this.init();
    }

    init() {
        this.resizeCanvas();
        this.setupEventListeners();
        this.generateDust();
        this.startAutoGeneration();
        this.animate();
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }

    setupEventListeners() {
        window.addEventListener('resize', () => this.resizeCanvas());

        this.canvas.addEventListener('mousedown', (e) => this.startDrawing(e));
        this.canvas.addEventListener('mousemove', (e) => this.draw(e));
        this.canvas.addEventListener('mouseup', () => this.stopDrawing());
        this.canvas.addEventListener('mouseout', () => this.stopDrawing());

        this.canvas.addEventListener('touchstart', (e) => this.startDrawing(e));
        this.canvas.addEventListener('touchmove', (e) => this.draw(e));
        this.canvas.addEventListener('touchend', () => this.stopDrawing());

        document.getElementById('densitySelect').addEventListener('change', (e) => {
            this.config.densityLevel = e.target.value;
        });

        document.getElementById('brushSlider').addEventListener('input', (e) => {
            this.config.brushSize = parseInt(e.target.value);
            document.getElementById('brushValue').textContent = e.target.value;
        });

        document.getElementById('speedSlider').addEventListener('input', (e) => {
            this.config.generationSpeed = parseInt(e.target.value);
            document.getElementById('speedValue').textContent = e.target.value;
            this.startAutoGeneration();
        });

        document.getElementById('resetBtn').addEventListener('click', () => {
            this.dustParticles = [];
            this.generateDust();
        });
    }

    generateDust() {
        const count = this.config.densityCounts[this.config.densityLevel];
        for (let i = 0; i < count; i++) {
            this.dustParticles.push(this.createParticle());
        }
    }

    createParticle() {
        const type = Math.random();
        // 细浮尘 (35%) - 圆形颗粒
        if (type < 0.35) {
            return {
                type: 'fineDust',
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: 1 + Math.random() * 3,
                opacity: 0.25 + Math.random() * 0.35,
                color: 'rgba(160, 160, 160, ',
                vx: (Math.random() - 0.5) * 0.15,
                vy: (Math.random() - 0.5) * 0.15,
                fadeOut: false,
                fadeSpeed: 0.02
            };
        } 
        // 短线灰尘 (25%) - 细长线条
        else if (type < 0.6) {
            return {
                type: 'lineDust',
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                length: 5 + Math.random() * 12,
                thickness: 0.8 + Math.random() * 1.5,
                opacity: 0.3 + Math.random() * 0.4,
                color: 'rgba(140, 140, 140, ',
                rotation: Math.random() * Math.PI * 2,
                vx: (Math.random() - 0.5) * 0.1,
                vy: (Math.random() - 0.5) * 0.1,
                fadeOut: false,
                fadeSpeed: 0.018
            };
        } 
        // 细小毛絮 (20%) - 不规则星状或毛发状
        else if (type < 0.8) {
            return {
                type: 'lint',
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: 3 + Math.random() * 7,
                opacity: 0.35 + Math.random() * 0.4,
                color: 'rgba(150, 150, 150, ',
                rotation: Math.random() * Math.PI * 2,
                branches: 3 + Math.floor(Math.random() * 5),
                branchData: [], // 存储分支形状数据
                vx: (Math.random() - 0.5) * 0.15,
                vy: (Math.random() - 0.5) * 0.15,
                fadeOut: false,
                fadeSpeed: 0.015
            };
        } 
        // 浅淡水渍 (20%) - 不规则淡色斑点
        else {
            return {
                type: 'waterStain',
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                width: 12 + Math.random() * 25,
                height: 8 + Math.random() * 20,
                opacity: 0.15 + Math.random() * 0.25,
                color: 'rgba(130, 140, 150, ',
                rotation: Math.random() * Math.PI * 2,
                shapePoints: [], // 存储形状数据
                vx: 0,
                vy: 0,
                fadeOut: false,
                fadeSpeed: 0.012
            };
        }
    }

    startDrawing(e) {
        this.isDrawing = true;
        const pos = this.getMousePos(e);
        this.lastX = pos.x;
        this.lastY = pos.y;
    }

    draw(e) {
        if (!this.isDrawing) return;
        
        const pos = this.getMousePos(e);
        
        this.cleanDust(pos.x, pos.y);
        
        this.addSparkle(pos.x, pos.y);
        
        this.lastX = pos.x;
        this.lastY = pos.y;
    }

    stopDrawing() {
        this.isDrawing = false;
    }

    getMousePos(e) {
        const rect = this.canvas.getBoundingClientRect();
        let clientX, clientY;
        if (e.touches) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }
        return {
            x: clientX - rect.left,
            y: clientY - rect.top
        };
    }

    cleanDust(x, y) {
        const brushRadius = this.config.brushSize;
        
        this.dustParticles.forEach(particle => {
            const dx = particle.x - x;
            const dy = particle.y - y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance < brushRadius && !particle.fadeOut) {
                particle.fadeOut = true;
            }
        });
    }

    addSparkle(x, y) {
        for (let i = 0; i < 3; i++) {
            this.sparkles.push({
                x: x + (Math.random() - 0.5) * 20,
                y: y + (Math.random() - 0.5) * 20,
                size: 2 + Math.random() * 4,
                opacity: 0.8,
                fadeSpeed: 0.03 + Math.random() * 0.03
            });
        }
    }

    startAutoGeneration() {
        if (this.autoGenerateInterval) {
            clearInterval(this.autoGenerateInterval);
        }
        
        if (this.config.generationSpeed > 0) {
            const maxCount = this.config.densityCounts[this.config.densityLevel] * 2;
            const interval = 1000 / (this.config.generationSpeed / 10);
            this.autoGenerateInterval = setInterval(() => {
                if (this.dustParticles.length < maxCount) {
                    this.dustParticles.push(this.createParticle());
                }
            }, interval);
        }
    }

    animate() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.drawBackground();
        
        this.updateParticles();
        
        this.drawParticles();
        
        this.updateSparkles();
        
        this.drawSparkles();
        
        this.cleanupParticles();
        
        requestAnimationFrame(() => this.animate());
    }

    drawBackground() {
        const gradient = this.ctx.createRadialGradient(
            this.canvas.width / 2, this.canvas.height / 2, 0,
            this.canvas.width / 2, this.canvas.height / 2, Math.max(this.canvas.width, this.canvas.height) / 2
        );
        gradient.addColorStop(0, '#fafbfc');
        gradient.addColorStop(1, '#e9ecef');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    updateParticles() {
        this.dustParticles.forEach(particle => {
            if (!particle.fadeOut) {
                particle.x += particle.vx;
                particle.y += particle.vy;
                
                if (particle.x < 0) particle.x = this.canvas.width;
                if (particle.x > this.canvas.width) particle.x = 0;
                if (particle.y < 0) particle.y = this.canvas.height;
                if (particle.y > this.canvas.height) particle.y = 0;
                
                if (particle.rotation !== undefined) {
                    particle.rotation += 0.005 + Math.random() * 0.01;
                }
            } else {
                particle.opacity -= particle.fadeSpeed;
                // 根据不同粒子类型缩放
                if (particle.size !== undefined) {
                    particle.size *= 0.98;
                }
                if (particle.length !== undefined) {
                    particle.length *= 0.98;
                }
                if (particle.width !== undefined) {
                    particle.width *= 0.98;
                    particle.height *= 0.98;
                }
            }
        });
    }

    drawParticles() {
        this.dustParticles.forEach(particle => {
            if (particle.opacity <= 0) return;
            
            this.ctx.save();
            
            if (particle.type === 'fineDust') {
                // 细浮尘：极细圆点
                this.ctx.beginPath();
                this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                this.ctx.fillStyle = particle.color + particle.opacity + ')';
                this.ctx.fill();
            } else if (particle.type === 'lineDust') {
                // 短线灰尘：细长线条
                this.ctx.translate(particle.x, particle.y);
                this.ctx.rotate(particle.rotation);
                this.ctx.beginPath();
                this.ctx.moveTo(-particle.length / 2, 0);
                this.ctx.lineTo(particle.length / 2, 0);
                this.ctx.strokeStyle = particle.color + particle.opacity + ')';
                this.ctx.lineWidth = particle.thickness;
                this.ctx.lineCap = 'round';
                this.ctx.stroke();
            } else if (particle.type === 'lint') {
                // 细小毛絮：多分支星状
                this.ctx.translate(particle.x, particle.y);
                this.ctx.rotate(particle.rotation);
                this.ctx.strokeStyle = particle.color + particle.opacity + ')';
                this.ctx.lineWidth = 1;
                this.ctx.lineCap = 'round';
                
                // 初始化分支数据（一次生成，避免闪烁）
                if (particle.branchData.length === 0) {
                    for (let i = 0; i < particle.branches; i++) {
                        particle.branchData.push({
                            angle: (i / particle.branches) * Math.PI * 2,
                            branchLength: particle.size * (0.5 + Math.random() * 0.5),
                            midOffset: (Math.random() - 0.5) * 0.4
                        });
                    }
                }
                
                particle.branchData.forEach(data => {
                    this.ctx.beginPath();
                    this.ctx.moveTo(0, 0);
                    const midAngle = data.angle + data.midOffset;
                    const midX = Math.cos(midAngle) * data.branchLength * 0.5;
                    const midY = Math.sin(midAngle) * data.branchLength * 0.5;
                    const endX = Math.cos(data.angle) * data.branchLength;
                    const endY = Math.sin(data.angle) * data.branchLength;
                    this.ctx.quadraticCurveTo(midX, midY, endX, endY);
                    this.ctx.stroke();
                });
            } else if (particle.type === 'waterStain') {
                // 浅淡水渍：不规则斑点
                this.ctx.translate(particle.x, particle.y);
                this.ctx.rotate(particle.rotation);
                this.ctx.beginPath();
                
                // 初始化形状数据（一次生成，避免闪烁）
                if (particle.shapePoints.length === 0) {
                    const points = 10;
                    for (let i = 0; i <= points; i++) {
                        const angle = (i / points) * Math.PI * 2;
                        particle.shapePoints.push({
                            angle: angle,
                            radiusX: (particle.width / 2) * (0.6 + Math.random() * 0.4),
                            radiusY: (particle.height / 2) * (0.6 + Math.random() * 0.4)
                        });
                    }
                }
                
                particle.shapePoints.forEach((point, index) => {
                    const px = Math.cos(point.angle) * point.radiusX;
                    const py = Math.sin(point.angle) * point.radiusY;
                    if (index === 0) {
                        this.ctx.moveTo(px, py);
                    } else {
                        this.ctx.lineTo(px, py);
                    }
                });
                
                this.ctx.closePath();
                this.ctx.fillStyle = particle.color + particle.opacity + ')';
                this.ctx.fill();
            }
            
            this.ctx.restore();
        });
    }

    updateSparkles() {
        this.sparkles.forEach(sparkle => {
            sparkle.opacity -= sparkle.fadeSpeed;
            sparkle.y -= 0.5;
        });
    }

    drawSparkles() {
        this.sparkles.forEach(sparkle => {
            if (sparkle.opacity <= 0) return;
            
            this.ctx.save();
            this.ctx.globalAlpha = sparkle.opacity;
            this.ctx.beginPath();
            this.ctx.arc(sparkle.x, sparkle.y, sparkle.size, 0, Math.PI * 2);
            const gradient = this.ctx.createRadialGradient(
                sparkle.x, sparkle.y, 0,
                sparkle.x, sparkle.y, sparkle.size
            );
            gradient.addColorStop(0, 'rgba(255, 255, 255, 1)');
            gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
            this.ctx.fillStyle = gradient;
            this.ctx.fill();
            this.ctx.restore();
        });
    }

    cleanupParticles() {
        this.dustParticles = this.dustParticles.filter(p => p.opacity > 0);
        this.sparkles = this.sparkles.filter(s => s.opacity > 0);
    }
}

window.addEventListener('DOMContentLoaded', () => {
    new DustCleanGame();
});
