const gameState = {
    level: 1,
    shapes: [],
    markedIds: new Set(),
    targetCount: 0
};

const colors = ['#e74c3c', '#3498db', '#f39c12', '#9b59b6', '#1abc9c', '#e67e22', '#34495e'];

const basicShapes = ['circle', 'square', 'triangle', 'hexagon', 'star', 'diamond'];

const irregularShapes = ['blob', 'cross', 'heart', 'spiral', 'arrow', 'lightning'];

function getDifficultyPhase(level) {
    if (level <= 3) return 'easy';
    if (level <= 6) return 'medium';
    return 'hard';
}

function getDifficultyConfig(level) {
    const phase = getDifficultyPhase(level);
    const baseCount = phase === 'easy' ? 6 : phase === 'medium' ? 8 : 10;
    const increment = 2;
    const levelInPhase = phase === 'easy' ? level - 1 : phase === 'medium' ? level - 4 : level - 7;
    const totalShapes = baseCount + levelInPhase * increment;

    const hollowRatio = phase === 'easy' ? 0.35 : phase === 'medium' ? 0.3 : 0.25;
    const hollowCount = Math.max(2, Math.floor(totalShapes * hollowRatio));
    
    const halfRatio = phase === 'easy' ? 0.3 : phase === 'medium' ? 0.4 : 0.45;
    const halfCount = Math.floor(totalShapes * halfRatio);
    const solidCount = totalShapes - hollowCount - halfCount;

    let columns;
    if (totalShapes <= 6) columns = 3;
    else if (totalShapes <= 9) columns = 3;
    else if (totalShapes <= 12) columns = 4;
    else if (totalShapes <= 16) columns = 4;
    else columns = 5;

    const gap = phase === 'easy' ? '20px' : phase === 'medium' ? '12px' : '8px';
    const padding = phase === 'easy' ? '25px' : phase === 'medium' ? '18px' : '12px';
    const svgScale = phase === 'easy' ? '75%' : phase === 'medium' ? '65%' : '55%';
    const strokeWidth = phase === 'easy' ? 4 : phase === 'medium' ? 3 : 2.5;
    const halfStyle = phase === 'easy' ? 'stripes' : phase === 'medium' ? 'thin-stripes' : 'dots';
    const hasDistractors = phase === 'hard';
    const useIrregular = phase === 'hard';

    return {
        total: totalShapes,
        hollow: hollowCount,
        half: halfCount,
        solid: solidCount,
        columns: columns,
        gap: gap,
        padding: padding,
        svgScale: svgScale,
        strokeWidth: strokeWidth,
        halfStyle: halfStyle,
        hasDistractors: hasDistractors,
        useIrregular: useIrregular,
        phase: phase
    };
}

function getHalfPattern(color, style, id) {
    const cleanColor = color.replace('#', '');
    if (style === 'stripes') {
        return `
            <defs>
                <pattern id="${id}-${cleanColor}" patternUnits="userSpaceOnUse" width="10" height="10">
                    <rect width="10" height="10" fill="${color}"/>
                    <rect x="5" width="5" height="10" fill="white"/>
                </pattern>
            </defs>
        `;
    } else if (style === 'thin-stripes') {
        return `
            <defs>
                <pattern id="${id}-${cleanColor}" patternUnits="userSpaceOnUse" width="6" height="6">
                    <rect width="6" height="6" fill="white"/>
                    <rect width="2" height="6" fill="${color}"/>
                </pattern>
            </defs>
        `;
    } else {
        return `
            <defs>
                <pattern id="${id}-${cleanColor}" patternUnits="userSpaceOnUse" width="8" height="8">
                    <rect width="8" height="8" fill="white"/>
                    <circle cx="4" cy="4" r="1.5" fill="${color}"/>
                </pattern>
            </defs>
        `;
    }
}

function getShapeSVG(shapeData, config) {
    const { shapeType, fillType, color, id, hasDistractor } = shapeData;
    const strokeWidth = config.strokeWidth;
    const fill = fillType === 'solid' ? color : 'none';
    const stroke = color;
    const patternId = `half-${id}`;
    
    let mainShape = '';
    
    switch (shapeType) {
        case 'circle':
            mainShape = `<circle cx="50" cy="50" r="40" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}"/>`;
            break;
        case 'square':
            mainShape = `<rect x="15" y="15" width="70" height="70" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}"/>`;
            break;
        case 'triangle':
            mainShape = `<polygon points="50,10 90,85 10,85" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}"/>`;
            break;
        case 'hexagon':
            mainShape = `<polygon points="50,5 90,27.5 90,72.5 50,95 10,72.5 10,27.5" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}"/>`;
            break;
        case 'star':
            mainShape = `<polygon points="50,5 61,40 98,40 68,62 79,97 50,75 21,97 32,62 2,40 39,40" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}"/>`;
            break;
        case 'diamond':
            mainShape = `<polygon points="50,5 95,50 50,95 5,50" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}"/>`;
            break;
        case 'blob':
            mainShape = `<path d="M50,10 C75,15 90,30 85,50 C90,70 75,85 50,90 C25,85 10,70 15,50 C10,30 25,15 50,10 Z" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}"/>`;
            break;
        case 'cross':
            mainShape = `<path d="M35,10 L65,10 L65,35 L90,35 L90,65 L65,65 L65,90 L35,90 L35,65 L10,65 L10,35 L35,35 Z" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}"/>`;
            break;
        case 'heart':
            mainShape = `<path d="M50,85 C20,60 10,40 25,25 C35,15 45,20 50,30 C55,20 65,15 75,25 C90,40 80,60 50,85 Z" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}"/>`;
            break;
        case 'spiral':
            mainShape = `<path d="M50,50 m0,-35 a35,35 0 1,1 0,70 a30,30 0 1,0 0,-60 a25,25 0 1,1 0,50 a20,20 0 1,0 0,-40 a15,15 0 1,1 0,30 a10,10 0 1,0 0,-20 a5,5 0 1,1 0,10" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}"/>`;
            break;
        case 'arrow':
            mainShape = `<path d="M50,10 L80,40 L60,40 L60,90 L40,90 L40,40 L20,40 Z" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}"/>`;
            break;
        case 'lightning':
            mainShape = `<path d="M55,5 L30,50 L45,50 L35,95 L70,45 L55,45 L65,5 Z" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}"/>`;
            break;
        default:
            mainShape = `<circle cx="50" cy="50" r="40" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}"/>`;
    }

    if (fillType === 'half') {
        const cleanColor = color.replace('#', '');
        const pattern = getHalfPattern(color, config.halfStyle, patternId);
        mainShape = mainShape.replace(`fill="${fill}"`, `fill="url(#${patternId}-${cleanColor})"`);
        return `<svg viewBox="0 0 100 100">${pattern}${mainShape}</svg>`;
    }

    if (fillType === 'hollow') {
        mainShape = mainShape.replace(`fill="none"`, `fill="white"`);
    }

    let distractor = '';
    if (hasDistractor) {
        const distractorType = Math.floor(Math.random() * 3);
        if (distractorType === 0) {
            distractor = `<circle cx="${20 + Math.random() * 60}" cy="${20 + Math.random() * 60}" r="3" fill="${color}" opacity="0.3"/>`;
        } else if (distractorType === 1) {
            distractor = `<line x1="${15 + Math.random() * 30}" y1="${15 + Math.random() * 30}" x2="${55 + Math.random() * 30}" y2="${55 + Math.random() * 30}" stroke="${color}" stroke-width="1" opacity="0.2"/>`;
        } else {
            distractor = `<rect x="${15 + Math.random() * 50}" y="${15 + Math.random() * 50}" width="6" height="6" fill="${color}" opacity="0.25"/>`;
        }
    }

    return `<svg viewBox="0 0 100 100">${mainShape}${distractor}</svg>`;
}

function generateShapes() {
    const config = getDifficultyConfig(gameState.level);
    const shapes = [];
    
    const shapePool = [];
    
    for (let i = 0; i < config.hollow; i++) {
        shapePool.push('hollow');
    }
    for (let i = 0; i < config.half; i++) {
        shapePool.push('half');
    }
    for (let i = 0; i < config.solid; i++) {
        shapePool.push('solid');
    }
    
    for (let i = shapePool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shapePool[i], shapePool[j]] = [shapePool[j], shapePool[i]];
    }
    
    const availableShapes = config.useIrregular 
        ? [...basicShapes, ...irregularShapes]
        : basicShapes;
    
    shapePool.forEach((fillType, index) => {
        const shapeType = availableShapes[Math.floor(Math.random() * availableShapes.length)];
        const color = colors[Math.floor(Math.random() * colors.length)];
        const hasDistractor = config.hasDistractors && Math.random() < 0.3 && fillType !== 'hollow';
        
        shapes.push({
            id: index,
            shapeType: shapeType,
            fillType: fillType,
            color: color,
            hasDistractor: hasDistractor
        });
    });
    
    gameState.shapes = shapes;
    gameState.targetCount = config.hollow;
    gameState.markedIds.clear();
    
    return config;
}

function renderBoard() {
    const config = generateShapes();
    const board = document.getElementById('game-board');
    
    board.style.gridTemplateColumns = `repeat(${config.columns}, 1fr)`;
    board.style.gap = config.gap;
    board.style.padding = config.padding;
    board.innerHTML = '';
    
    const phaseLabel = document.getElementById('phase-label');
    const phaseText = config.phase === 'easy' ? '🌟 简单模式' : config.phase === 'medium' ? '⚡ 进阶模式' : '🔥 挑战模式';
    if (phaseLabel) {
        phaseLabel.textContent = phaseText;
    } else {
        const header = document.querySelector('.game-header');
        const labelDiv = document.createElement('div');
        labelDiv.id = 'phase-label';
        labelDiv.style.cssText = 'margin-top: 10px; padding: 8px 20px; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; border-radius: 20px; display: inline-block; font-weight: bold;';
        labelDiv.textContent = phaseText;
        header.appendChild(labelDiv);
    }
    
    gameState.shapes.forEach(shape => {
        const div = document.createElement('div');
        div.className = 'shape';
        div.dataset.id = shape.id;
        div.innerHTML = getShapeSVG(shape, config);
        div.querySelector('svg').style.width = config.svgScale;
        div.querySelector('svg').style.height = config.svgScale;
        
        div.addEventListener('click', () => toggleMark(shape.id, div));
        board.appendChild(div);
    });
    
    updateUI();
}

function toggleMark(id, element) {
    const shape = gameState.shapes.find(s => s.id === id);
    
    if (gameState.markedIds.has(id)) {
        gameState.markedIds.delete(id);
        element.classList.remove('marked');
    } else {
        if (shape.fillType !== 'hollow') {
            element.classList.add('marked', 'wrong-mark');
            showMessage('❌ 选错了！这不是全镂空图形', 'error');
            gameState.markedIds.add(id);
            updateUI();
            setTimeout(() => {
                gameState.markedIds.delete(id);
                element.classList.remove('marked', 'wrong-mark');
                updateUI();
            }, 800);
            return;
        }
        gameState.markedIds.add(id);
        element.classList.add('marked');
    }
    updateUI();
    checkRealTime();
}

function updateUI() {
    document.getElementById('level').textContent = gameState.level;
    document.getElementById('target-count').textContent = gameState.targetCount;
    document.getElementById('marked-count').textContent = gameState.markedIds.size;
}

function checkAnswer() {
    const hollowIds = gameState.shapes
        .filter(s => s.fillType === 'hollow')
        .map(s => s.id);
    
    const markedHollow = hollowIds.filter(id => gameState.markedIds.has(id));
    const wrongMarked = Array.from(gameState.markedIds).filter(id => !hollowIds.includes(id));
    
    const allHollowMarked = markedHollow.length === hollowIds.length;
    const noWrongMarks = wrongMarked.length === 0;
    
    if (allHollowMarked && noWrongMarks) {
        return { success: true, message: `太棒了！第 ${gameState.level} 关通过！` };
    } else if (!allHollowMarked) {
        const missing = hollowIds.length - markedHollow.length;
        return { success: false, message: `还有 ${missing} 个全镂空图形没找到！` };
    } else {
        return { success: false, message: `标记了 ${wrongMarked.length} 个错误的图形！` };
    }
}

function checkRealTime() {
    const hollowIds = gameState.shapes
        .filter(s => s.fillType === 'hollow')
        .map(s => s.id);
    
    const markedHollow = hollowIds.filter(id => gameState.markedIds.has(id));
    const allHollowMarked = markedHollow.length === hollowIds.length;
    
    if (allHollowMarked && gameState.markedIds.size === hollowIds.length) {
        const currentPhase = getDifficultyPhase(gameState.level);
        const nextPhase = getDifficultyPhase(gameState.level + 1);
        if (nextPhase !== currentPhase) {
            showMessage(`🎉 全部找对！即将进入${nextPhase === 'medium' ? '进阶模式' : '挑战模式'}...`, 'success');
        } else {
            showMessage(`🎉 全部找对！即将进入第 ${gameState.level + 1} 关...`, 'success');
        }
        setTimeout(() => {
            nextLevel();
        }, 1200);
    }
}

function showMessage(text, type) {
    const messageEl = document.getElementById('message');
    messageEl.textContent = text;
    messageEl.className = `message ${type}`;
    
    setTimeout(() => {
        messageEl.textContent = '';
        messageEl.className = 'message';
    }, 3000);
}

function showModal(title, message, buttonText, callback) {
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-message').innerHTML = message.replace(/\n/g, '<br>');
    document.getElementById('modal-btn').textContent = buttonText;
    document.getElementById('modal').classList.remove('hidden');
    
    const btn = document.getElementById('modal-btn');
    btn.onclick = () => {
        document.getElementById('modal').classList.add('hidden');
        if (callback) callback();
    };
}

function nextLevel() {
    gameState.level++;
    renderBoard();
    const phase = getDifficultyPhase(gameState.level);
    const phaseMsg = phase === 'easy' ? '简单模式' : phase === 'medium' ? '进阶模式' : '挑战模式';
    showMessage(`进入第 ${gameState.level} 关！（${phaseMsg}）`, 'success');
}

function resetLevel() {
    gameState.markedIds.clear();
    renderBoard();
    showMessage('本关已重置', 'success');
}

document.getElementById('reset-btn').addEventListener('click', resetLevel);

renderBoard();
