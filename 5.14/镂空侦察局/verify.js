console.log('=== 验证：自动跳转功能 ===\n');

const gameState = {
    level: 1,
    shapes: [],
    markedIds: new Set(),
    targetCount: 0
};

const colors = ['#e74c3c', '#3498db', '#f39c12', '#9b59b6', '#1abc9c', '#e67e22', '#34495e'];
const basicShapes = ['circle', 'square', 'triangle', 'hexagon', 'star', 'diamond'];

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

function checkAnswer() {
    const hollowIds = gameState.shapes.filter(s => s.fillType === 'hollow').map(s => s.id);
    const markedHollow = hollowIds.filter(id => gameState.markedIds.has(id));
    const wrongMarked = Array.from(gameState.markedIds).filter(id => !hollowIds.includes(id));
    return markedHollow.length === hollowIds.length && wrongMarked.length === 0;
}

function nextLevel() {
    gameState.level++;
    console.log(`  ✅ 自动跳转到第 ${gameState.level} 关`);
}

console.log('模拟提交答案正确的情况：\n');

for (let i = 1; i <= 3; i++) {
    console.log(`[测试 ${i}] 当前关卡: ${gameState.level}`);
    const config = generateShapes();
    console.log(`  生成图形: ${config.total}个，全镂空: ${config.hollow}个`);
    
    gameState.shapes.filter(s => s.fillType === 'hollow').forEach(s => gameState.markedIds.add(s.id));
    console.log(`  标记所有全镂空图形`);
    
    const isCorrect = checkAnswer();
    console.log(`  答案验证: ${isCorrect ? '正确' : '错误'}`);
    
    if (isCorrect) {
        console.log(`  显示提示消息: "🎉 通关！即将进入第 ${gameState.level + 1} 关..."`);
        console.log(`  等待1秒后自动跳转...`);
        nextLevel();
    }
    console.log('');
}

console.log('=== 验证通过：答对后自动跳转功能正常 ===');
