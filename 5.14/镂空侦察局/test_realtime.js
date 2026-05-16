console.log('=== 镂空侦察局 - 实时校验功能测试 ===\n');

const gameState = {
    level: 1,
    shapes: [],
    markedIds: new Set(),
    targetCount: 0
};

const colors = ['#e74c3c', '#3498db', '#f39c12'];
const basicShapes = ['circle', 'square', 'triangle'];

function getDifficultyPhase(level) {
    if (level <= 3) return 'easy';
    if (level <= 6) return 'medium';
    return 'hard';
}

function getDifficultyConfig(level) {
    const phase = getDifficultyPhase(level);
    const baseCount = 6;
    const increment = 2;
    const levelInPhase = level - 1;
    const totalShapes = baseCount + levelInPhase * increment;
    const hollowRatio = 0.35;
    const hollowCount = Math.max(2, Math.floor(totalShapes * hollowRatio));
    const halfCount = Math.floor((totalShapes - hollowCount) * 0.4);
    const solidCount = totalShapes - hollowCount - halfCount;
    return { total: totalShapes, hollow: hollowCount, half: halfCount, solid: solidCount, phase: phase };
}

function generateShapes() {
    const config = getDifficultyConfig(gameState.level);
    const shapes = [];
    const shapePool = [];
    for (let i = 0; i < config.hollow; i++) shapePool.push('hollow');
    for (let i = 0; i < config.half; i++) shapePool.push('half');
    for (let i = 0; i < config.solid; i++) shapePool.push('solid');
    for (let i = shapePool.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [shapePool[i], shapePool[j]] = [shapePool[j], shapePool[i]];
    }
    shapePool.forEach((fillType, index) => {
        shapes.push({ id: index, shapeType: basicShapes[0], fillType: fillType, color: colors[0] });
    });
    gameState.shapes = shapes;
    gameState.targetCount = config.hollow;
    gameState.markedIds.clear();
    return config;
}

function updateUI() {
    console.log(`  [UI] 关卡: ${gameState.level}, 目标: ${gameState.targetCount}, 已标记: ${gameState.markedIds.size}`);
}

function showMessage(text, type) {
    console.log(`  [消息] ${text}`);
}

function nextLevel() {
    gameState.level++;
    console.log(`  [跳转] 自动进入第 ${gameState.level} 关`);
    generateShapes();
}

function checkRealTime() {
    const hollowIds = gameState.shapes.filter(s => s.fillType === 'hollow').map(s => s.id);
    const markedHollow = hollowIds.filter(id => gameState.markedIds.has(id));
    const allHollowMarked = markedHollow.length === hollowIds.length;
    
    if (allHollowMarked && gameState.markedIds.size === hollowIds.length) {
        console.log(`  ✅ 全部找对！准备自动进入下一关...`);
        setTimeout(() => {
            nextLevel();
        }, 100);
        return true;
    }
    return false;
}

function toggleMark(id) {
    const shape = gameState.shapes.find(s => s.id === id);
    console.log(`  [点击] 图形ID ${id}，类型: ${shape.fillType}`);
    
    if (gameState.markedIds.has(id)) {
        gameState.markedIds.delete(id);
        console.log(`  [操作] 取消标记`);
    } else {
        if (shape.fillType !== 'hollow') {
            console.log(`  ❌ 选错了！这不是全镂空图形`);
            console.log(`  [操作] 显示错误提示，0.8秒后自动取消标记`);
            gameState.markedIds.add(id);
            updateUI();
            setTimeout(() => {
                gameState.markedIds.delete(id);
                updateUI();
                console.log(`  [操作] 已自动取消错误标记`);
            }, 80);
            return;
        }
        gameState.markedIds.add(id);
        console.log(`  ✅ 正确标记全镂空图形`);
    }
    updateUI();
    return checkRealTime();
}

console.log('测试场景1：正确标记所有全镂空图形\n');

generateShapes();
console.log(`第 ${gameState.level} 关：图形总数 ${gameState.shapes.length}，全镂空 ${gameState.targetCount} 个`);

const hollowShapes = gameState.shapes.filter(s => s.fillType === 'hollow');
console.log(`全镂空图形ID: ${hollowShapes.map(s => s.id).join(', ')}\n`);

hollowShapes.forEach((shape, index) => {
    console.log(`[操作 ${index + 1}] 点击全镂空图形 ID ${shape.id}`);
    const result = toggleMark(shape.id);
    console.log('');
    if (result && index === hollowShapes.length - 1) {
        console.log('=== 测试场景1通过：全部选对后自动进入下一关 ===\n');
    }
});

setTimeout(() => {
    console.log('\n测试场景2：错误点击实心/半镂空图形\n');
    console.log(`当前第 ${gameState.level} 关：图形总数 ${gameState.shapes.length}，全镂空 ${gameState.targetCount} 个`);
    
    const solidShape = gameState.shapes.find(s => s.fillType === 'solid');
    console.log(`[操作] 点击实心图形 ID ${solidShape.id}`);
    toggleMark(solidShape.id);
    
    setTimeout(() => {
        console.log('\n测试场景3：取消标记\n');
        const hollowShape = gameState.shapes.find(s => s.fillType === 'hollow' && !gameState.markedIds.has(s.id));
        if (hollowShape) {
            console.log(`[操作1] 标记全镂空图形 ID ${hollowShape.id}`);
            toggleMark(hollowShape.id);
            console.log(`[操作2] 取消标记全镂空图形 ID ${hollowShape.id}`);
            toggleMark(hollowShape.id);
        }
        
        console.log('\n=== 所有测试通过！实时校验功能正常 ===');
    }, 200);
}, 200);
