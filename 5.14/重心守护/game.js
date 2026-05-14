const GAME = {
    currentLevel: 1,
    blocks: [],
    removedCount: 0,
    targetRemove: 6,
    gameState: 'playing'
};

const LEVELS = [
    {
        id: 1,
        name: '新手入门',
        description: '简单的 5 层塔',
        structure: [
            [0, 1, 2, 3, 4],
            [1, 2, 3],
            [1, 2, 3],
            [2],
            [2]
        ],
        targetRemove: 6,
        colors: ['#e74c3c', '#f39c12', '#2ecc71', '#3498db', '#9b59b6']
    },
    {
        id: 2,
        name: '小试牛刀',
        description: '6 层塔，需要拆除 7 块',
        structure: [
            [0, 1, 2, 3, 4],
            [0, 2, 4],
            [1, 2, 3],
            [2],
            [2],
            [2]
        ],
        targetRemove: 7,
        colors: ['#e74c3c', '#e67e22', '#f1c40f', '#2ecc71', '#3498db', '#9b59b6']
    },
    {
        id: 3,
        name: '步步为营',
        description: '7 层塔，需要拆除 8 块',
        structure: [
            [0, 1, 2, 3, 4],
            [1, 2, 3],
            [0, 2, 4],
            [1, 3],
            [2],
            [2],
            [2]
        ],
        targetRemove: 8,
        colors: ['#e74c3c', '#e67e22', '#f1c40f', '#2ecc71', '#1abc9c', '#3498db', '#9b59b6']
    },
    {
        id: 4,
        name: '如履薄冰',
        description: '8 层塔，需要拆除 9 块',
        structure: [
            [0, 1, 2, 3, 4],
            [0, 2, 4],
            [1, 2, 3],
            [0, 4],
            [1, 3],
            [2],
            [2],
            [2]
        ],
        targetRemove: 9,
        colors: ['#e74c3c', '#e67e22', '#f1c40f', '#2ecc71', '#1abc9c', '#3498db', '#8e44ad', '#e91e63']
    },
    {
        id: 5,
        name: '千钧一发',
        description: '9 层塔，需要拆除 10 块',
        structure: [
            [0, 1, 2, 3, 4],
            [1, 2, 3],
            [0, 2, 4],
            [1, 3],
            [0, 4],
            [2],
            [2],
            [2],
            [2]
        ],
        targetRemove: 10,
        colors: ['#e74c3c', '#e67e22', '#f1c40f', '#2ecc71', '#1abc9c', '#3498db', '#8e44ad', '#e91e63', '#009688']
    },
    {
        id: 6,
        name: '命悬一线',
        description: '10 层塔，终极挑战',
        structure: [
            [0, 1, 2, 3, 4],
            [0, 2, 4],
            [1, 2, 3],
            [0, 4],
            [1, 3],
            [0, 4],
            [2],
            [2],
            [2],
            [2]
        ],
        targetRemove: 10,
        colors: ['#e74c3c', '#e67e22', '#f1c40f', '#2ecc71', '#1abc9c', '#3498db', '#8e44ad', '#e91e63', '#009688', '#607d8b']
    },
    {
        id: 7,
        name: '左右为难',
        description: '11 层不对称塔，拆除 11 块',
        structure: [
            [0, 1, 2, 3, 4],
            [0, 1, 2, 3, 4],
            [1, 2, 4],
            [0, 2, 3],
            [1, 3],
            [0, 4],
            [1, 2],
            [2, 3],
            [1, 3],
            [2],
            [2]
        ],
        targetRemove: 11,
        colors: ['#e74c3c', '#c0392b', '#e67e22', '#f39c12', '#f1c40f', '#2ecc71', '#27ae60', '#1abc9c', '#3498db', '#9b59b6', '#8e44ad']
    },
    {
        id: 8,
        name: '悬崖峭壁',
        description: '12 层偏斜塔，拆除 12 块',
        structure: [
            [0, 1, 2, 3, 4],
            [0, 1, 3, 4],
            [1, 2, 3],
            [0, 2, 4],
            [0, 1, 3, 4],
            [1, 2, 3],
            [0, 4],
            [1, 3],
            [0, 2, 4],
            [1, 3],
            [2],
            [2]
        ],
        targetRemove: 12,
        colors: ['#e74c3c', '#c0392b', '#e67e22', '#f39c12', '#f1c40f', '#2ecc71', '#27ae60', '#1abc9c', '#00bcd4', '#3498db', '#9b59b6', '#8e44ad']
    },
    {
        id: 9,
        name: '步步惊心',
        description: '13 层复杂塔，拆除 13 块',
        structure: [
            [0, 1, 2, 3, 4],
            [0, 1, 2, 3, 4],
            [0, 2, 4],
            [1, 2, 3],
            [0, 1, 3, 4],
            [0, 2, 4],
            [1, 3],
            [0, 2, 4],
            [1, 2, 3],
            [0, 4],
            [1, 3],
            [2],
            [2]
        ],
        targetRemove: 13,
        colors: ['#e74c3c', '#c0392b', '#e67e22', '#f39c12', '#f1c40f', '#ffc107', '#2ecc71', '#27ae60', '#1abc9c', '#00bcd4', '#3498db', '#9b59b6', '#8e44ad']
    },
    {
        id: 10,
        name: '登峰造极',
        description: '14 层终极挑战，拆除 14 块',
        structure: [
            [0, 1, 2, 3, 4],
            [0, 1, 2, 3, 4],
            [0, 1, 3, 4],
            [1, 2, 3],
            [0, 2, 4],
            [0, 1, 3, 4],
            [1, 2, 3],
            [0, 2, 4],
            [0, 1, 3, 4],
            [1, 3],
            [0, 2, 4],
            [1, 3],
            [2],
            [2]
        ],
        targetRemove: 14,
        colors: ['#e74c3c', '#c0392b', '#e67e22', '#d35400', '#f39c12', '#f1c40f', '#ffc107', '#2ecc71', '#27ae60', '#1abc9c', '#00bcd4', '#3498db', '#9b59b6', '#8e44ad']
    }
];

function initGame() {
    loadLevel(GAME.currentLevel);
    setupEventListeners();
}

function loadLevel(levelNum) {
    const level = LEVELS[levelNum - 1];
    if (!level) return;

    GAME.currentLevel = levelNum;
    GAME.targetRemove = level.targetRemove;
    GAME.removedCount = 0;
    GAME.gameState = 'playing';
    GAME.blocks = [];

    document.getElementById('level-display').textContent = levelNum;
    updateRemainingDisplay();
    hideAllModals();

    buildTower(level);
    updateRemovableBlocks();
}

function buildTower(level) {
    const tower = document.getElementById('tower');
    tower.classList.remove('collapsing');
    tower.innerHTML = '';

    const { structure, colors } = level;

    for (let layer = 0; layer < structure.length; layer++) {
        const layerPositions = structure[layer];
        const layerDiv = document.createElement('div');
        layerDiv.className = 'layer';
        layerDiv.dataset.layer = layer;
        layerDiv.style.display = 'flex';
        layerDiv.style.justifyContent = 'center';
        layerDiv.style.gap = '2px';
        layerDiv.style.position = 'relative';

        layerPositions.forEach((pos) => {
            const block = createBlock(layer, pos, colors[layer]);
            layerDiv.appendChild(block.element);
            GAME.blocks.push(block);
        });

        tower.appendChild(layerDiv);
    }
}

function createBlock(layer, position, color) {
    const element = document.createElement('div');
    element.className = 'block';
    element.style.background = color;
    element.dataset.layer = layer;
    element.dataset.position = position;
    element.textContent = getPositionLabel(position);

    const block = {
        element,
        layer,
        position,
        color,
        removed: false
    };

    element.addEventListener('click', () => handleBlockClick(block));

    return block;
}

function getPositionLabel(pos) {
    const labels = ['左1', '左2', '中', '右2', '右1'];
    return labels[pos] || pos;
}

function handleBlockClick(block) {
    if (GAME.gameState !== 'playing') return;
    if (block.removed) return;

    if (!isBlockRemovable(block)) {
        return;
    }

    removeBlock(block);
}

function isBlockRemovable(block) {
    if (block.layer === 0) {
        return false;
    }

    const blocksAbove = GAME.blocks.filter(b => 
        !b.removed && 
        b.layer > block.layer &&
        Math.abs(b.position - block.position) <= 1
    );

    if (blocksAbove.length > 0) {
        return false;
    }

    return true;
}

function removeBlock(block) {
    block.removed = true;
    GAME.removedCount++;

    block.element.classList.add('falling');

    setTimeout(() => {
        block.element.style.display = 'none';
        checkGameState();
    }, 800);
}

function checkGameState() {
    const collapseResult = checkTowerCollapse();

    if (collapseResult.collapsed) {
        triggerCollapseAnimation();
        GAME.gameState = 'failed';
        setTimeout(() => {
            loadLevel(GAME.currentLevel);
        }, 600);
        return;
    }

    updateWarningState(collapseResult.riskLevel);

    updateRemainingDisplay();

    if (GAME.removedCount >= GAME.targetRemove) {
        GAME.gameState = 'success';
        clearWarnings();
        showGameOver(true);
        if (GAME.currentLevel < LEVELS.length) {
            setTimeout(() => {
                loadLevel(GAME.currentLevel + 1);
            }, 2500);
        }
        return;
    }

    updateRemovableBlocks();
}

function checkTowerCollapse() {
    const remainingBlocks = GAME.blocks.filter(b => !b.removed);
    
    if (remainingBlocks.length === 0) {
        return { collapsed: false, riskLevel: 0 };
    }

    const baseBlocks = remainingBlocks.filter(b => b.layer === 0);
    if (baseBlocks.length === 0) {
        return { collapsed: true, reason: 'base_destoryed', riskLevel: 1 };
    }

    const layers = [...new Set(remainingBlocks.map(b => b.layer))].sort((a, b) => a - b);

    for (let i = 0; i < layers.length - 1; i++) {
        const currentLayer = layers[i];
        const nextLayer = layers[i + 1];
        
        if (nextLayer - currentLayer > 1) {
            const upperBlocks = remainingBlocks.filter(b => b.layer >= nextLayer);
            if (upperBlocks.length > 0) {
                return { collapsed: true, reason: 'layer_gap', riskLevel: 1 };
            }
        }
    }

    for (let layer = 1; layer <= Math.max(...layers); layer++) {
        const layerBlocks = remainingBlocks.filter(b => b.layer === layer);
        if (layerBlocks.length === 0) continue;

        const lowerLayerBlocks = remainingBlocks.filter(b => b.layer === layer - 1);
        
        for (const block of layerBlocks) {
            const supportingBlocks = lowerLayerBlocks.filter(b => 
                Math.abs(b.position - block.position) <= 1
            );
            
            if (supportingBlocks.length === 0) {
                return { collapsed: true, reason: 'no_support', riskLevel: 1 };
            }
        }
    }

    const totalWeight = remainingBlocks.length;
    let totalMomentX = 0;

    remainingBlocks.forEach(block => {
        const distanceFromCenter = block.position - 2;
        const layerWeight = 1 + block.layer * 0.1;
        totalMomentX += distanceFromCenter * layerWeight;
    });

    const centerOfMassOffset = totalMomentX / totalWeight;

    const minBasePos = Math.min(...baseBlocks.map(b => b.position));
    const maxBasePos = Math.max(...baseBlocks.map(b => b.position));

    const baseCenterMin = minBasePos - 2 - 0.5;
    const baseCenterMax = maxBasePos - 2 + 0.5;

    if (centerOfMassOffset < baseCenterMin || centerOfMassOffset > baseCenterMax) {
        return { collapsed: true, reason: 'center_of_mass', riskLevel: 1 };
    }

    const leftSupport = baseBlocks.filter(b => b.position <= 1).length;
    const rightSupport = baseBlocks.filter(b => b.position >= 3).length;
    
    if (leftSupport === 0 && centerOfMassOffset < -0.3) {
        return { collapsed: true, reason: 'left_imbalance', riskLevel: 1 };
    }
    if (rightSupport === 0 && centerOfMassOffset > 0.3) {
        return { collapsed: true, reason: 'right_imbalance', riskLevel: 1 };
    }

    const absOffset = Math.abs(centerOfMassOffset);
    let riskLevel = 0;
    
    if (absOffset > 0.4) {
        riskLevel = 2;
    } else if (absOffset > 0.25) {
        riskLevel = 1;
    }

    const baseSupportRatio = baseBlocks.length / 5;
    if (baseSupportRatio <= 0.4 && absOffset > 0.15) {
        riskLevel = Math.max(riskLevel, 1);
    }

    return { collapsed: false, riskLevel };
}

function updateWarningState(riskLevel) {
    GAME.blocks.forEach(block => {
        if (block.removed) return;
        
        if (riskLevel >= 1) {
            block.element.classList.add('warning');
        } else {
            block.element.classList.remove('warning');
        }
    });
}

function clearWarnings() {
    GAME.blocks.forEach(block => {
        block.element.classList.remove('warning');
    });
}

function triggerCollapseAnimation() {
    const tower = document.getElementById('tower');
    tower.classList.add('collapsing');

    GAME.blocks.forEach(block => {
        if (!block.removed) {
            block.element.classList.add('collapsing');
        }
    });
}

function updateRemovableBlocks() {
    GAME.blocks.forEach(block => {
        if (block.removed) {
            block.element.classList.remove('removable', 'not-removable');
            return;
        }

        const removable = isBlockRemovable(block);
        if (removable) {
            block.element.classList.add('removable');
            block.element.classList.remove('not-removable');
        } else {
            block.element.classList.remove('removable');
            block.element.classList.add('not-removable');
        }
    });
}

function updateRemainingDisplay() {
    const remaining = GAME.targetRemove - GAME.removedCount;
    document.getElementById('remaining-display').textContent = Math.max(0, remaining);
}

function showGameOver(success) {
    const modal = document.getElementById('game-over-modal');
    const title = document.getElementById('game-over-title');
    const message = document.getElementById('game-over-message');
    const nextLevelBtn = document.getElementById('next-level-btn');

    if (success) {
        title.textContent = '🎉 恭喜通关！';
        title.style.color = '#4caf50';
        message.textContent = `你成功拆除了 ${GAME.removedCount} 块积木，塔身依然稳固！`;
        
        if (GAME.currentLevel < LEVELS.length) {
            nextLevelBtn.classList.remove('hidden');
        } else {
            nextLevelBtn.classList.add('hidden');
        }
    } else {
        title.textContent = '💥 游戏失败';
        title.style.color = '#e94560';
        message.textContent = '塔身倒塌了！请重新尝试。';
        nextLevelBtn.classList.add('hidden');
    }

    modal.classList.remove('hidden');
}

function hideAllModals() {
    document.getElementById('level-modal').classList.add('hidden');
    document.getElementById('game-over-modal').classList.add('hidden');
}

function showLevelSelect() {
    const levelList = document.getElementById('level-list');
    levelList.innerHTML = '';

    LEVELS.forEach(level => {
        const item = document.createElement('div');
        item.className = 'level-item';
        item.innerHTML = `
            <div class="level-num">${level.id}</div>
            <div class="level-info">${level.name}</div>
            <div class="level-info">拆除 ${level.targetRemove} 块</div>
        `;
        item.addEventListener('click', () => {
            loadLevel(level.id);
            hideAllModals();
        });
        levelList.appendChild(item);
    });

    document.getElementById('level-modal').classList.remove('hidden');
}

function setupEventListeners() {
    document.getElementById('restart-btn').addEventListener('click', () => {
        loadLevel(GAME.currentLevel);
    });

    document.getElementById('level-select-btn').addEventListener('click', showLevelSelect);

    document.getElementById('close-modal-btn').addEventListener('click', hideAllModals);

    document.getElementById('retry-btn').addEventListener('click', () => {
        loadLevel(GAME.currentLevel);
    });

    document.getElementById('next-level-btn').addEventListener('click', () => {
        if (GAME.currentLevel < LEVELS.length) {
            loadLevel(GAME.currentLevel + 1);
        }
    });

    document.querySelectorAll('.modal').forEach(modal => {
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                hideAllModals();
            }
        });
    });
}

document.addEventListener('DOMContentLoaded', initGame);
