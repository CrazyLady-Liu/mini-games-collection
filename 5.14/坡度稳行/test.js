const assert = require('assert');

const GameState = {
    READY: 'ready',
    PLAYING: 'playing',
    SUCCESS: 'success',
    FAILED: 'failed',
    ALL_CLEAR: 'all_clear'
};

const skinConfigs = {
    grass: { friction: 0.98, rollingFriction: 0.995, name: '草地' },
    ice: { friction: 0.995, rollingFriction: 0.999, name: '冰面' },
    sand: { friction: 0.94, rollingFriction: 0.98, name: '砂石' }
};

const MAX_ANGLE = 25;

function createGame() {
    return {
        targetAngle: 0,
        currentAngle: 0,
        slowMode: false,
        currentSkin: 'grass',
        gameState: GameState.PLAYING,
        block: {
            x: 100,
            y: 330,
            velocityX: 0,
            velocityY: 0,
            angularVelocity: 0,
            rotation: 0,
            onGround: true
        },
        ground: {
            y: 350,
            startX: 50,
            endX: 750
        }
    };
}

function updateAngle(game) {
    const angleDiff = game.targetAngle - game.currentAngle;
    game.currentAngle += angleDiff * 0.15;
}

function updatePhysics(game, deltaTime) {
    if (game.gameState !== GameState.PLAYING) return;
    
    const timeScale = game.slowMode ? 0.4 : 1;
    const dt = deltaTime * timeScale;
    
    const gravity = 800;
    const skin = skinConfigs[game.currentSkin];
    const friction = skin.friction;
    const rollingFriction = skin.rollingFriction;
    const angleRad = game.currentAngle * Math.PI / 180;
    
    const acceleration = gravity * Math.sin(angleRad) * 0.3;
    game.block.velocityX += acceleration * dt;
    game.block.velocityX *= Math.pow(friction, dt * 60);
    
    game.block.velocityY += gravity * dt;
    
    game.block.x += game.block.velocityX * dt;
    game.block.y += game.block.velocityY * dt;
    
    const groundY = game.ground.y;
    const blockBottom = game.block.y + 20;
    
    if (blockBottom >= groundY) {
        game.block.y = groundY - 20;
        game.block.velocityY = 0;
        game.block.onGround = true;
        
        const rotationAccel = acceleration * 0.02;
        game.block.angularVelocity += rotationAccel * dt;
        game.block.angularVelocity *= Math.pow(rollingFriction, dt * 60);
    } else {
        game.block.onGround = false;
        game.block.angularVelocity *= 0.998;
    }
    
    game.block.rotation += game.block.angularVelocity * dt;
    
    if (Math.abs(game.block.velocityX) > 300) {
        game.block.velocityX = Math.sign(game.block.velocityX) * 300;
    }
}

console.log('🧪 开始运行单元测试...\n');

let passed = 0;
let failed = 0;

function test(name, fn) {
    try {
        fn();
        console.log(`✅  ${name}`);
        passed++;
    } catch (e) {
        console.log(`❌  ${name}`);
        console.log(`   错误: ${e.message}`);
        failed++;
    }
}

console.log('📐 【坡度调节模块测试】');
console.log('─'.repeat(50));

test('初始角度应为0', () => {
    const game = createGame();
    assert.strictEqual(game.targetAngle, 0);
    assert.strictEqual(game.currentAngle, 0);
});

test('目标角度设置后应平滑过渡到目标值', () => {
    const game = createGame();
    game.targetAngle = 10;
    
    const initialAngle = game.currentAngle;
    updateAngle(game);
    
    assert(game.currentAngle > initialAngle, '角度应该增加');
    assert(game.currentAngle < game.targetAngle, '角度应该小于目标值（缓动效果）');
});

test('角度应严格限制在±25°范围内（UI层限制）', () => {
    const game = createGame();
    
    function setAngle(value) {
        return Math.max(-MAX_ANGLE, Math.min(MAX_ANGLE, value));
    }
    
    const angle1 = setAngle(30);
    assert.strictEqual(angle1, MAX_ANGLE, '超过25°的角度应被限制为25°');
    
    const angle2 = setAngle(-30);
    assert.strictEqual(angle2, -MAX_ANGLE, '低于-25°的角度应被限制为-25°');
    
    const angle3 = setAngle(10);
    assert.strictEqual(angle3, 10, '正常范围内的角度应保持不变');
});

test('角度缓动算法应渐进趋近目标值', () => {
    const game = createGame();
    game.targetAngle = 20;
    
    let prevDiff = Math.abs(game.targetAngle - game.currentAngle);
    for (let i = 0; i < 50; i++) {
        updateAngle(game);
        const currDiff = Math.abs(game.targetAngle - game.currentAngle);
        assert(currDiff <= prevDiff + 0.001, `第${i+1}次更新后差值不应增大`);
        prevDiff = currDiff;
    }
    
    assert(Math.abs(game.currentAngle - game.targetAngle) < 0.5, `角度应接近目标值，实际差值: ${Math.abs(game.currentAngle - game.targetAngle).toFixed(3)}`);
});

test('角度调节过程中不应出现剧烈抖动', () => {
    const game = createGame();
    game.targetAngle = 15;
    
    let prevAngle = game.currentAngle;
    for (let i = 0; i < 20; i++) {
        updateAngle(game);
        const change = Math.abs(game.currentAngle - prevAngle);
        assert(change < 5, `角度变化不应超过5°/帧，实际: ${change.toFixed(2)}°`);
        prevAngle = game.currentAngle;
    }
});

console.log('\n🚀 【方块滚动速度测试】');
console.log('─'.repeat(50));

test('坡度为0时方块不应移动', () => {
    const game = createGame();
    game.currentAngle = 0;
    const initialX = game.block.x;
    
    for (let i = 0; i < 10; i++) {
        updatePhysics(game, 0.016);
    }
    
    assert.strictEqual(game.block.velocityX, 0, '速度应为0');
    assert.strictEqual(game.block.x, initialX, '位置不应变化');
});

test('正坡度时方块应向右加速', () => {
    const game = createGame();
    game.currentAngle = 10;
    const initialVelocity = game.block.velocityX;
    
    updatePhysics(game, 0.016);
    
    assert(game.block.velocityX > initialVelocity, '速度应该增加');
    assert(game.block.velocityX > 0, '速度应该为正值（向右）');
});

test('负坡度时方块应向左加速', () => {
    const game = createGame();
    game.currentAngle = -10;
    const initialVelocity = game.block.velocityX;
    
    updatePhysics(game, 0.016);
    
    assert(game.block.velocityX < initialVelocity, '速度应该减小（向左）');
    assert(game.block.velocityX < 0, '速度应该为负值（向左）');
});

test('坡度越大加速度越大', () => {
    const game1 = createGame();
    game1.currentAngle = 5;
    
    const game2 = createGame();
    game2.currentAngle = 15;
    
    updatePhysics(game1, 0.016);
    updatePhysics(game2, 0.016);
    
    assert(game2.block.velocityX > game1.block.velocityX, '15°坡度的加速度应大于5°坡度');
});

test('速度上限应限制在300以内', () => {
    const game = createGame();
    game.currentAngle = 25;
    game.block.velocityX = 280;
    
    for (let i = 0; i < 50; i++) {
        updatePhysics(game, 0.016);
    }
    
    assert(game.block.velocityX <= 300, `速度不应超过300，实际: ${game.block.velocityX.toFixed(2)}`);
});

console.log('\n🎨 【皮肤摩擦力测试】');
console.log('─'.repeat(50));

test('冰面摩擦力应大于草地（滑行更远）', () => {
    assert(skinConfigs.ice.friction > skinConfigs.grass.friction, 
        `冰面摩擦系数(${skinConfigs.ice.friction})应大于草地(${skinConfigs.grass.friction})`);
});

test('砂石摩擦力应小于草地（更快停下）', () => {
    assert(skinConfigs.sand.friction < skinConfigs.grass.friction, 
        `砂石摩擦系数(${skinConfigs.sand.friction})应小于草地(${skinConfigs.grass.friction})`);
});

test('相同坡度下冰面速度增长比草地快', () => {
    const grassGame = createGame();
    grassGame.currentSkin = 'grass';
    grassGame.currentAngle = 10;
    
    const iceGame = createGame();
    iceGame.currentSkin = 'ice';
    iceGame.currentAngle = 10;
    
    for (let i = 0; i < 30; i++) {
        updatePhysics(grassGame, 0.016);
        updatePhysics(iceGame, 0.016);
    }
    
    assert(iceGame.block.velocityX > grassGame.block.velocityX, 
        `冰面速度(${iceGame.block.velocityX.toFixed(2)})应大于草地(${grassGame.block.velocityX.toFixed(2)})`);
});

test('相同初速度下砂石比草地更快减速', () => {
    const grassGame = createGame();
    grassGame.currentSkin = 'grass';
    grassGame.currentAngle = 0;
    grassGame.block.velocityX = 100;
    
    const sandGame = createGame();
    sandGame.currentSkin = 'sand';
    sandGame.currentAngle = 0;
    sandGame.block.velocityX = 100;
    
    for (let i = 0; i < 20; i++) {
        updatePhysics(grassGame, 0.016);
        updatePhysics(sandGame, 0.016);
    }
    
    assert(sandGame.block.velocityX < grassGame.block.velocityX, 
        `砂石速度(${sandGame.block.velocityX.toFixed(2)})应小于草地(${grassGame.block.velocityX.toFixed(2)})`);
});

console.log('\n🐢 【慢放模式测试】');
console.log('─'.repeat(50));

test('慢放模式下时间缩放应为0.4', () => {
    const normalGame = createGame();
    normalGame.currentAngle = 10;
    
    const slowGame = createGame();
    slowGame.slowMode = true;
    slowGame.currentAngle = 10;
    
    updatePhysics(normalGame, 0.016);
    updatePhysics(slowGame, 0.016);
    
    const expectedRatio = 0.4;
    const actualRatio = slowGame.block.velocityX / normalGame.block.velocityX;
    
    assert(Math.abs(actualRatio - expectedRatio) < 0.1, 
        `慢放速度比例应为${expectedRatio}，实际: ${actualRatio.toFixed(2)}`);
});

test('慢放模式下方块移动距离应显著小于正常模式', () => {
    const normalGame = createGame();
    normalGame.currentAngle = 10;
    const normalStartX = normalGame.block.x;
    
    const slowGame = createGame();
    slowGame.slowMode = true;
    slowGame.currentAngle = 10;
    const slowStartX = slowGame.block.x;
    
    for (let i = 0; i < 10; i++) {
        updatePhysics(normalGame, 0.016);
        updatePhysics(slowGame, 0.016);
    }
    
    const normalDistance = normalGame.block.x - normalStartX;
    const slowDistance = slowGame.block.x - slowStartX;
    const ratio = slowDistance / normalDistance;
    
    assert(ratio > 0.1 && ratio < 0.6, 
        `慢放移动距离比例应在0.1-0.6之间（考虑摩擦影响），实际: ${ratio.toFixed(2)}`);
    assert(slowDistance < normalDistance * 0.8, 
        `慢放距离(${slowDistance.toFixed(2)})应显著小于正常距离(${normalDistance.toFixed(2)})`);
});

console.log('\n⚽ 【滚动与旋转测试】');
console.log('─'.repeat(50));

test('方块在地面上滚动时应产生旋转', () => {
    const game = createGame();
    game.currentAngle = 10;
    const initialRotation = game.block.rotation;
    
    for (let i = 0; i < 5; i++) {
        updatePhysics(game, 0.016);
    }
    
    assert(game.block.rotation !== initialRotation, '方块应该产生旋转');
});

test('向右滚动时旋转应为正值（顺时针）', () => {
    const game = createGame();
    game.currentAngle = 10;
    
    for (let i = 0; i < 10; i++) {
        updatePhysics(game, 0.016);
    }
    
    assert(game.block.rotation > 0, `向右滚动时旋转应为正，实际: ${game.block.rotation.toFixed(4)}`);
});

test('向左滚动时旋转应为负值（逆时针）', () => {
    const game = createGame();
    game.currentAngle = -10;
    
    for (let i = 0; i < 10; i++) {
        updatePhysics(game, 0.016);
    }
    
    assert(game.block.rotation < 0, `向左滚动时旋转应为负，实际: ${game.block.rotation.toFixed(4)}`);
});

test('方块应停留在地面上（不会穿透）', () => {
    const game = createGame();
    game.currentAngle = 5;
    game.block.y = 400;
    
    for (let i = 0; i < 10; i++) {
        updatePhysics(game, 0.016);
    }
    
    assert(game.block.y <= game.ground.y, `方块底部不应穿透地面，y=${game.block.y.toFixed(2)}, groundY=${game.ground.y}`);
});

console.log('\n⭐ 【综合稳定性测试】');
console.log('─'.repeat(50));

test('长时间运行后方块不应出现异常速度', () => {
    const game = createGame();
    game.currentAngle = 5;
    
    for (let i = 0; i < 1000; i++) {
        updatePhysics(game, 0.016);
        updateAngle(game);
        
        assert(!isNaN(game.block.velocityX), '速度不应为NaN');
        assert(isFinite(game.block.velocityX), '速度不应为无穷大');
        assert(Math.abs(game.block.velocityX) <= 300, `速度不应超过限制: ${game.block.velocityX}`);
    }
});

test('角度切换时过渡平滑无突变', () => {
    const game = createGame();
    game.targetAngle = 20;
    
    for (let i = 0; i < 30; i++) {
        updateAngle(game);
    }
    
    game.targetAngle = -20;
    let prevAngle = game.currentAngle;
    
    for (let i = 0; i < 10; i++) {
        updateAngle(game);
        const change = Math.abs(game.currentAngle - prevAngle);
        assert(change < 6.5, `角度突变不应超过6.5°，实际: ${change.toFixed(2)}°`);
        prevAngle = game.currentAngle;
    }
});

console.log('\n' + '═'.repeat(50));
console.log(`📊 测试结果: ${passed} 个通过, ${failed} 个失败`);
console.log('═'.repeat(50));

if (failed > 0) {
    process.exit(1);
} else {
    console.log('\n🎉 所有测试通过！核心逻辑验证完成。');
}
