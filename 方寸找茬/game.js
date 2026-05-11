class SpotDifferenceGame {
    constructor() {
        this.canvas1 = document.getElementById('canvas1');
        this.canvas2 = document.getElementById('canvas2');
        this.ctx1 = this.canvas1.getContext('2d');
        this.ctx2 = this.canvas2.getContext('2d');
        this.feedback1 = document.getElementById('feedback1');
        this.feedback2 = document.getElementById('feedback2');
        this.scoreEl = document.getElementById('score');
        this.levelEl = document.getElementById('level');
        this.timerEl = document.getElementById('timer');
        this.messageEl = document.getElementById('message');
        this.hintBtn = document.getElementById('hintBtn');
        this.nextBtn = document.getElementById('nextBtn');

        this.score = 0;
        this.level = 1;
        this.startTime = Date.now();
        this.timerInterval = null;
        this.difference = null;
        this.isSolved = false;
        this.elements = [];

        this.colors = {
            wall: '#f0f0f0',
            desk: '#8B7355',
            deskEdge: '#6B5344',
            monitor: '#2d3436',
            monitorScreen: '#74b9ff',
            keyboard: '#636e72',
            cup: '#dfe6e9',
            cupLiquid: '#0984e3',
            plant: '#00b894',
            plantPot: '#b2bec3',
            pen: '#2d3436',
            notebook: '#ffeaa7',
            mouse: '#b2bec3',
            lamp: '#636e72',
            lampLight: 'rgba(253, 203, 110, 0.3)'
        };

        this.init();
    }

    init() {
        this.startTimer();
        this.bindEvents();
        this.generateLevel();
    }

    startTimer() {
        this.startTime = Date.now();
        this.timerInterval = setInterval(() => {
            const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
            const mins = Math.floor(elapsed / 60).toString().padStart(2, '0');
            const secs = (elapsed % 60).toString().padStart(2, '0');
            this.timerEl.textContent = `${mins}:${secs}`;
        }, 1000);
    }

    bindEvents() {
        this.canvas1.addEventListener('click', (e) => this.handleClick(e, this.canvas1, this.feedback1));
        this.canvas2.addEventListener('click', (e) => this.handleClick(e, this.canvas2, this.feedback2));
        this.hintBtn.addEventListener('click', () => this.showHint());
        this.nextBtn.addEventListener('click', () => this.nextLevel());
    }

    getRandomInt(min, max) {
        return Math.floor(Math.random() * (max - min + 1)) + min;
    }

    adjustColor(color, amount) {
        const hex = color.replace('#', '');
        const r = Math.max(0, Math.min(255, parseInt(hex.substr(0, 2), 16) + amount));
        const g = Math.max(0, Math.min(255, parseInt(hex.substr(2, 2), 16) + amount));
        const b = Math.max(0, Math.min(255, parseInt(hex.substr(4, 2), 16) + amount));
        return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
    }

    generateLevel() {
        this.isSolved = false;
        this.elements = [];
        this.messageEl.textContent = '找出两张图中的不同之处~';
        this.messageEl.className = 'message';
        this.feedback1.style.opacity = '0';
        this.feedback2.style.opacity = '0';

        const diffTypes = [
            'cupHeight',
            'penThickness',
            'plantColor',
            'wallLineLength',
            'cornerRadius',
            'notebookCornerRadius',
            'keyboardCornerRadius',
            'cupLiquidHeight',
            'monitorScreenShade',
            'mouseSize',
            'lampArmLength',
            'plantLeafSize'
        ];
        const diffType = diffTypes[this.getRandomInt(0, diffTypes.length - 1)];

        this.generateElements();
        this.createDifference(diffType);
        this.drawScene(this.ctx1, false);
        this.drawScene(this.ctx2, true);
    }

    generateElements() {
        const deskX = 50;
        const deskY = 180;
        const deskW = 300;
        const deskH = 100;

        this.elements.push({ 
            type: 'wall', 
            x: 0, 
            y: 0, 
            w: 400, 
            h: 300,
            wallLines: []
        });

        for (let i = 0; i < 10; i++) {
            this.elements[0].wallLines.push({
                y: 30 + i * 30,
                startX: this.getRandomInt(0, 5),
                endX: 400 - this.getRandomInt(0, 5)
            });
        }

        this.elements.push({ 
            type: 'desk', 
            x: deskX, 
            y: deskY, 
            w: deskW, 
            h: deskH,
            cornerRadius: 3
        });

        this.elements.push({
            type: 'monitor',
            x: deskX + 100,
            y: deskY - 90,
            w: 100,
            h: 70,
            baseW: 30,
            baseH: 20,
            screenShade: 0,
            cornerRadius: 2
        });

        this.elements.push({
            type: 'keyboard',
            x: deskX + 90,
            y: deskY + 20,
            w: 120,
            h: 30,
            cornerRadius: 4
        });

        this.elements.push({
            type: 'mouse',
            x: deskX + 220,
            y: deskY + 25,
            w: 25,
            h: 15,
            sizeScale: 1
        });

        this.elements.push({
            type: 'cup',
            x: deskX + 30,
            y: deskY + 10,
            w: 35,
            h: 50,
            liquidHeight: 15,
            cupHeightScale: 1
        });

        this.elements.push({
            type: 'plant',
            x: deskX + 260,
            y: deskY - 30,
            potW: 40,
            potH: 35,
            plantH: 40,
            leafSize: 1,
            plantShade: 0
        });

        this.elements.push({
            type: 'notebook',
            x: deskX + 150,
            y: deskY + 55,
            w: 70,
            h: 40,
            cornerRadius: 2
        });

        this.elements.push({
            type: 'pen',
            x: deskX + 235,
            y: deskY + 62,
            length: 38,
            thickness: 3,
            angle: 0.25
        });

        this.elements.push({
            type: 'lamp',
            x: deskX + deskW - 20,
            y: deskY - 60,
            armW: 40,
            armH: 60,
            headW: 50,
            headH: 25,
            armLengthScale: 1
        });
    }

    createDifference(diffType) {
        const modifiableElements = this.elements.filter(el =>
            !['wall', 'desk'].includes(el.type)
        );
        const targetEl = modifiableElements[this.getRandomInt(0, modifiableElements.length - 1)];
        const targetIndex = this.elements.indexOf(targetEl);

        let diffX, diffY, diffRadius;

        switch (diffType) {
            case 'cupHeight':
                const cupEl = this.elements.find(el => el.type === 'cup');
                targetIndex = this.elements.indexOf(cupEl);
                this.difference = {
                    x: cupEl.x + cupEl.w / 2,
                    y: cupEl.y + cupEl.h / 2,
                    radius: 25,
                    elementIndex: targetIndex,
                    elementType: 'cup',
                    type: 'cupHeight',
                    heightScale: 0.93
                };
                break;

            case 'penThickness':
                const penEl = this.elements.find(el => el.type === 'pen');
                targetIndex = this.elements.indexOf(penEl);
                this.difference = {
                    x: penEl.x + penEl.length / 2,
                    y: penEl.y,
                    radius: 20,
                    elementIndex: targetIndex,
                    elementType: 'pen',
                    type: 'penThickness',
                    thicknessChange: -1
                };
                break;

            case 'plantColor':
                const plantEl = this.elements.find(el => el.type === 'plant');
                targetIndex = this.elements.indexOf(plantEl);
                this.difference = {
                    x: plantEl.x + plantEl.potW / 2,
                    y: plantEl.y - plantEl.plantH / 2,
                    radius: 28,
                    elementIndex: targetIndex,
                    elementType: 'plant',
                    type: 'plantColor',
                    shade: this.getRandomInt(-15, -8) || this.getRandomInt(8, 15)
                };
                break;

            case 'wallLineLength':
                this.difference = {
                    x: 200,
                    y: this.elements[0].wallLines[this.getRandomInt(2, 7)].y,
                    radius: 45,
                    elementIndex: 0,
                    elementType: 'wall',
                    type: 'wallLineLength',
                    lineIndex: this.getRandomInt(2, 7),
                    side: Math.random() > 0.5 ? 'left' : 'right',
                    change: 15
                };
                break;

            case 'cornerRadius':
            case 'notebookCornerRadius':
                const nbEl = this.elements.find(el => el.type === 'notebook');
                targetIndex = this.elements.indexOf(nbEl);
                this.difference = {
                    x: nbEl.x + nbEl.w / 2,
                    y: nbEl.y + nbEl.h / 2,
                    radius: 30,
                    elementIndex: targetIndex,
                    elementType: 'notebook',
                    type: 'notebookCornerRadius',
                    radiusChange: 5
                };
                break;

            case 'keyboardCornerRadius':
                const kbEl = this.elements.find(el => el.type === 'keyboard');
                targetIndex = this.elements.indexOf(kbEl);
                this.difference = {
                    x: kbEl.x + kbEl.w / 2,
                    y: kbEl.y + kbEl.h / 2,
                    radius: 28,
                    elementIndex: targetIndex,
                    elementType: 'keyboard',
                    type: 'keyboardCornerRadius',
                    radiusChange: 4
                };
                break;

            case 'cupLiquidHeight':
                const cupLiqEl = this.elements.find(el => el.type === 'cup');
                targetIndex = this.elements.indexOf(cupLiqEl);
                this.difference = {
                    x: cupLiqEl.x + cupLiqEl.w / 2,
                    y: cupLiqEl.y + 18,
                    radius: 22,
                    elementIndex: targetIndex,
                    elementType: 'cup',
                    type: 'cupLiquidHeight',
                    liquidChange: -3
                };
                break;

            case 'monitorScreenShade':
                const monEl = this.elements.find(el => el.type === 'monitor');
                targetIndex = this.elements.indexOf(monEl);
                this.difference = {
                    x: monEl.x + monEl.w / 2,
                    y: monEl.y + monEl.h / 2,
                    radius: 30,
                    elementIndex: targetIndex,
                    elementType: 'monitor',
                    type: 'monitorScreenShade',
                    shade: this.getRandomInt(-12, -6) || this.getRandomInt(6, 12)
                };
                break;

            case 'mouseSize':
                const mouseEl = this.elements.find(el => el.type === 'mouse');
                targetIndex = this.elements.indexOf(mouseEl);
                this.difference = {
                    x: mouseEl.x + mouseEl.w / 2,
                    y: mouseEl.y + mouseEl.h / 2,
                    radius: 20,
                    elementIndex: targetIndex,
                    elementType: 'mouse',
                    type: 'mouseSize',
                    sizeScale: 0.92
                };
                break;

            case 'lampArmLength':
                const lampEl = this.elements.find(el => el.type === 'lamp');
                targetIndex = this.elements.indexOf(lampEl);
                this.difference = {
                    x: lampEl.x + 5,
                    y: lampEl.y + lampEl.armH / 2,
                    radius: 25,
                    elementIndex: targetIndex,
                    elementType: 'lamp',
                    type: 'lampArmLength',
                    armScale: 0.93
                };
                break;

            case 'plantLeafSize':
                const plantLeafEl = this.elements.find(el => el.type === 'plant');
                targetIndex = this.elements.indexOf(plantLeafEl);
                this.difference = {
                    x: plantLeafEl.x + plantLeafEl.potW / 2,
                    y: plantLeafEl.y - 12,
                    radius: 25,
                    elementIndex: targetIndex,
                    elementType: 'plant',
                    type: 'plantLeafSize',
                    leafScale: 0.88
                };
                break;
        }
    }

    drawScene(ctx, isSecond) {
        ctx.clearRect(0, 0, 400, 300);

        for (let i = 0; i < this.elements.length; i++) {
            const el = this.elements[i];
            this.drawElement(ctx, el, isSecond, i);
        }
    }

    drawElement(ctx, el, isSecond, index) {
        let modifiedEl = { ...el };

        if (isSecond && this.difference && this.difference.elementIndex === index) {
            switch (this.difference.type) {
                case 'cupHeight':
                    modifiedEl = { ...el, h: el.h * this.difference.heightScale };
                    break;
                case 'penThickness':
                    modifiedEl = { ...el, thickness: el.thickness + this.difference.thicknessChange };
                    break;
                case 'plantColor':
                    modifiedEl = { ...el, plantShade: this.difference.shade };
                    break;
                case 'wallLineLength':
                    modifiedEl = { ...el };
                    break;
                case 'notebookCornerRadius':
                    modifiedEl = { ...el, cornerRadius: el.cornerRadius + this.difference.radiusChange };
                    break;
                case 'keyboardCornerRadius':
                    modifiedEl = { ...el, cornerRadius: el.cornerRadius + this.difference.radiusChange };
                    break;
                case 'cupLiquidHeight':
                    modifiedEl = { ...el, liquidHeight: el.liquidHeight + this.difference.liquidChange };
                    break;
                case 'monitorScreenShade':
                    modifiedEl = { ...el, screenShade: this.difference.shade };
                    break;
                case 'mouseSize':
                    modifiedEl = { ...el, sizeScale: this.difference.sizeScale };
                    break;
                case 'lampArmLength':
                    modifiedEl = { ...el, armH: el.armH * this.difference.armScale };
                    break;
                case 'plantLeafSize':
                    modifiedEl = { ...el, leafSize: this.difference.leafScale };
                    break;
            }
        }

        switch (el.type) {
            case 'wall':
                ctx.fillStyle = this.colors.wall;
                ctx.fillRect(0, 0, 400, 300);
                ctx.strokeStyle = '#e5e5e5';
                ctx.lineWidth = 1;
                
                for (let i = 0; i < el.wallLines.length; i++) {
                    const line = el.wallLines[i];
                    let startX = line.startX;
                    let endX = line.endX;
                    
                    if (isSecond && this.difference && this.difference.type === 'wallLineLength' && this.difference.lineIndex === i) {
                        if (this.difference.side === 'left') {
                            startX += this.difference.change;
                        } else {
                            endX -= this.difference.change;
                        }
                    }
                    
                    ctx.beginPath();
                    ctx.moveTo(startX, line.y);
                    ctx.lineTo(endX, line.y);
                    ctx.stroke();
                }
                break;

            case 'desk':
                ctx.fillStyle = this.colors.desk;
                ctx.beginPath();
                ctx.roundRect(modifiedEl.x, modifiedEl.y, modifiedEl.w, modifiedEl.h, modifiedEl.cornerRadius);
                ctx.fill();
                ctx.fillStyle = this.colors.deskEdge;
                ctx.fillRect(modifiedEl.x, modifiedEl.y, modifiedEl.w, 7);
                ctx.fillRect(modifiedEl.x + 20, modifiedEl.y + modifiedEl.h, 25, 100);
                ctx.fillRect(modifiedEl.x + modifiedEl.w - 45, modifiedEl.y + modifiedEl.h, 25, 100);
                break;

            case 'monitor':
                ctx.fillStyle = this.colors.monitor;
                ctx.beginPath();
                ctx.roundRect(modifiedEl.x, modifiedEl.y, modifiedEl.w, modifiedEl.h, modifiedEl.cornerRadius);
                ctx.fill();
                
                const screenColor = modifiedEl.screenShade 
                    ? this.adjustColor(this.colors.monitorScreen, modifiedEl.screenShade)
                    : this.colors.monitorScreen;
                ctx.fillStyle = screenColor;
                ctx.fillRect(modifiedEl.x + 8, modifiedEl.y + 8, modifiedEl.w - 16, modifiedEl.h - 16);
                ctx.fillStyle = this.colors.monitor;
                ctx.fillRect(modifiedEl.x + modifiedEl.w / 2 - 8, modifiedEl.y + modifiedEl.h, 16, 15);
                ctx.fillRect(modifiedEl.x + modifiedEl.w / 2 - 15, modifiedEl.y + modifiedEl.h + 15, 30, 18);
                break;

            case 'keyboard':
                ctx.fillStyle = this.colors.keyboard;
                ctx.beginPath();
                ctx.roundRect(modifiedEl.x, modifiedEl.y, modifiedEl.w, modifiedEl.h, modifiedEl.cornerRadius);
                ctx.fill();
                ctx.fillStyle = '#505a5e';
                for (let row = 0; row < 2; row++) {
                    for (let col = 0; col < 8; col++) {
                        ctx.fillRect(modifiedEl.x + 8 + col * 14, modifiedEl.y + 6 + row * 12, 10, 8);
                    }
                }
                break;

            case 'mouse':
                const mouseW = modifiedEl.w * modifiedEl.sizeScale;
                const mouseH = modifiedEl.h * modifiedEl.sizeScale;
                ctx.fillStyle = this.colors.mouse;
                ctx.beginPath();
                ctx.ellipse(
                    modifiedEl.x + modifiedEl.w / 2, 
                    modifiedEl.y + modifiedEl.h / 2,
                    mouseW / 2, 
                    mouseH / 2, 
                    0, 0, Math.PI * 2
                );
                ctx.fill();
                ctx.fillStyle = '#a0a8ad';
                ctx.fillRect(
                    modifiedEl.x + modifiedEl.w / 2 - 1.5 * modifiedEl.sizeScale, 
                    modifiedEl.y + 2, 
                    3 * modifiedEl.sizeScale, 
                    5 * modifiedEl.sizeScale
                );
                break;

            case 'cup':
                ctx.fillStyle = this.colors.cup;
                ctx.beginPath();
                ctx.moveTo(modifiedEl.x, modifiedEl.y);
                ctx.lineTo(modifiedEl.x + modifiedEl.w, modifiedEl.y);
                ctx.lineTo(modifiedEl.x + modifiedEl.w - 4, modifiedEl.y + modifiedEl.h);
                ctx.lineTo(modifiedEl.x + 4, modifiedEl.y + modifiedEl.h);
                ctx.closePath();
                ctx.fill();
                ctx.fillStyle = this.colors.cupLiquid;
                ctx.fillRect(modifiedEl.x + 5, modifiedEl.y + 8, modifiedEl.w - 10, modifiedEl.liquidHeight);
                ctx.strokeStyle = this.colors.cup;
                ctx.lineWidth = 3;
                ctx.beginPath();
                ctx.arc(modifiedEl.x + modifiedEl.w + 5, modifiedEl.y + 20, 9, -Math.PI / 2, Math.PI / 2);
                ctx.stroke();
                ctx.lineWidth = 1;
                break;

            case 'plant':
                ctx.fillStyle = this.colors.plantPot;
                ctx.beginPath();
                ctx.moveTo(modifiedEl.x, modifiedEl.y);
                ctx.lineTo(modifiedEl.x + modifiedEl.potW, modifiedEl.y);
                ctx.lineTo(modifiedEl.x + modifiedEl.potW - 7, modifiedEl.y + modifiedEl.potH);
                ctx.lineTo(modifiedEl.x + 7, modifiedEl.y + modifiedEl.potH);
                ctx.closePath();
                ctx.fill();
                
                const plantColor = modifiedEl.plantShade 
                    ? this.adjustColor(this.colors.plant, modifiedEl.plantShade)
                    : this.colors.plant;
                ctx.fillStyle = plantColor;
                
                for (let i = 0; i < 5; i++) {
                    const offset = (i - 2) * 7;
                    ctx.beginPath();
                    ctx.ellipse(
                        modifiedEl.x + modifiedEl.potW / 2 + offset,
                        modifiedEl.y - modifiedEl.plantH / 2 + Math.abs(i - 2) * 9,
                        6 * modifiedEl.leafSize,
                        (modifiedEl.plantH / 2) * modifiedEl.leafSize,
                        offset * 0.03,
                        0,
                        Math.PI * 2
                    );
                    ctx.fill();
                }
                break;

            case 'notebook':
                ctx.fillStyle = this.colors.notebook;
                ctx.beginPath();
                ctx.roundRect(modifiedEl.x, modifiedEl.y, modifiedEl.w, modifiedEl.h, modifiedEl.cornerRadius);
                ctx.fill();
                ctx.strokeStyle = '#e17055';
                ctx.lineWidth = 2;
                ctx.beginPath();
                ctx.roundRect(modifiedEl.x, modifiedEl.y, modifiedEl.w, modifiedEl.h, modifiedEl.cornerRadius);
                ctx.stroke();
                ctx.strokeStyle = '#d0d0d0';
                ctx.lineWidth = 1;
                for (let i = 0; i < 4; i++) {
                    ctx.beginPath();
                    ctx.moveTo(modifiedEl.x + 10, modifiedEl.y + 10 + i * 8);
                    ctx.lineTo(modifiedEl.x + modifiedEl.w - 10, modifiedEl.y + 10 + i * 8);
                    ctx.stroke();
                }
                break;

            case 'pen':
                ctx.save();
                ctx.translate(modifiedEl.x, modifiedEl.y);
                ctx.rotate(modifiedEl.angle);
                ctx.fillStyle = this.colors.pen;
                ctx.beginPath();
                ctx.roundRect(0, -modifiedEl.thickness / 2, modifiedEl.length, modifiedEl.thickness, modifiedEl.thickness / 2);
                ctx.fill();
                ctx.beginPath();
                ctx.moveTo(modifiedEl.length, -modifiedEl.thickness / 2);
                ctx.lineTo(modifiedEl.length + 6, 0);
                ctx.lineTo(modifiedEl.length, modifiedEl.thickness / 2);
                ctx.closePath();
                ctx.fill();
                ctx.restore();
                break;

            case 'lamp':
                ctx.fillStyle = this.colors.lamp;
                ctx.fillRect(modifiedEl.x - 10, modifiedEl.y + modifiedEl.armH - 10, 30, 15);
                ctx.fillRect(modifiedEl.x, modifiedEl.y, 8, modifiedEl.armH);
                ctx.beginPath();
                ctx.moveTo(modifiedEl.x - 10, modifiedEl.y);
                ctx.lineTo(modifiedEl.x + modifiedEl.headW, modifiedEl.y);
                ctx.lineTo(modifiedEl.x + modifiedEl.headW - 9, modifiedEl.y + modifiedEl.headH);
                ctx.lineTo(modifiedEl.x, modifiedEl.y + modifiedEl.headH);
                ctx.closePath();
                ctx.fill();
                ctx.fillStyle = 'rgba(253, 203, 110, 0.28)';
                ctx.beginPath();
                ctx.moveTo(modifiedEl.x, modifiedEl.y + modifiedEl.headH);
                ctx.lineTo(modifiedEl.x + modifiedEl.headW, modifiedEl.y + modifiedEl.headH);
                ctx.lineTo(modifiedEl.x + modifiedEl.headW + 55, modifiedEl.y + modifiedEl.headH + 75);
                ctx.lineTo(modifiedEl.x - 55, modifiedEl.y + modifiedEl.headH + 75);
                ctx.closePath();
                ctx.fill();
                break;
        }
    }

    handleClick(e, canvas, feedback) {
        if (this.isSolved) return;

        const rect = canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const distance = Math.sqrt(
            Math.pow(x - this.difference.x, 2) +
            Math.pow(y - this.difference.y, 2)
        );

        if (distance <= this.difference.radius) {
            this.showCorrectFeedback(feedback, x, y);
            this.score += 10;
            this.scoreEl.textContent = this.score;
            this.isSolved = true;
            this.messageEl.textContent = '🎉 找对啦！休息一下继续~';
            this.messageEl.className = 'message success';
        } else {
            this.showWrongFeedback(feedback, x, y);
            this.messageEl.textContent = '🤔 再仔细看看哦~';
            this.messageEl.className = 'message error';
            setTimeout(() => {
                if (!this.isSolved) {
                    this.messageEl.textContent = '找出两张图中的不同之处~';
                    this.messageEl.className = 'message';
                }
            }, 1500);
        }
    }

    showCorrectFeedback(feedback, x, y) {
        feedback.style.left = `${x}px`;
        feedback.style.top = `${y}px`;
        feedback.className = 'feedback correct';
        feedback.style.transform = 'translate(-50%, -50%)';
        feedback.style.opacity = '1';

        this.feedback1.style.left = `${this.difference.x}px`;
        this.feedback1.style.top = `${this.difference.y}px`;
        this.feedback1.className = 'feedback correct';
        this.feedback1.style.transform = 'translate(-50%, -50%)';
        this.feedback1.style.opacity = '1';

        this.feedback2.style.left = `${this.difference.x}px`;
        this.feedback2.style.top = `${this.difference.y}px`;
        this.feedback2.className = 'feedback correct';
        this.feedback2.style.transform = 'translate(-50%, -50%)';
        this.feedback2.style.opacity = '1';
    }

    showWrongFeedback(feedback, x, y) {
        feedback.textContent = '✗';
        feedback.style.left = `${x}px`;
        feedback.style.top = `${y}px`;
        feedback.className = 'feedback wrong';
        feedback.style.transform = 'translate(-50%, -50%)';
        feedback.style.opacity = '1';
        setTimeout(() => {
            feedback.style.opacity = '0';
        }, 500);
    }

    showHint() {
        if (this.isSolved) return;

        const pulse = (ctx, x, y) => {
            let radius = 22;
            let growing = true;
            let count = 0;
            const animate = () => {
                if (count >= 5) return;
                this.drawScene(ctx, ctx === this.ctx2);
                ctx.strokeStyle = '#e17055';
                ctx.lineWidth = 2;
                ctx.setLineDash([3, 3]);
                ctx.beginPath();
                ctx.arc(x, y, radius, 0, Math.PI * 2);
                ctx.stroke();
                ctx.setLineDash([]);
                if (growing) {
                    radius += 0.7;
                    if (radius >= 35) growing = false;
                } else {
                    radius -= 0.7;
                    if (radius <= 22) {
                        growing = true;
                        count++;
                    }
                }
                if (count < 5) requestAnimationFrame(animate);
            };
            animate();
        };

        pulse(this.ctx1, this.difference.x, this.difference.y);
        pulse(this.ctx2, this.difference.x, this.difference.y);

        this.messageEl.textContent = '💡 提示已显示~';
        this.messageEl.className = 'message';
    }

    nextLevel() {
        this.level++;
        this.levelEl.textContent = this.level;
        this.generateLevel();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new SpotDifferenceGame();
});
