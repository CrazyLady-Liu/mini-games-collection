const iconCategories = {
    shapes: ['●', '■', '▲', '◆', '★', '♥', '♦', '♣', '♠', '◎', '◉', '⬡', '⬢', '◈', '◊'],
    emojis: ['😀', '😎', '🤔', '😊', '🥳', '😇', '🤗', '😋', '🤩', '😜', '🥰', '😌', '🙂', '😄', '😉'],
    symbols: ['✓', '✕', '✦', '✧', '✩', '✪', '✫', '✬', '✭', '✮', '✯', '✰', '❀', '❁', '❂'],
    arrows: ['↑', '↓', '←', '→', '↗', '↘', '↙', '↖', '⇑', '⇓', '⇐', '⇒', '↕', '↔', '↻'],
    math: ['＋', '－', '×', '÷', '＝', '≠', '≈', '＜', '＞', '≤', '≥', '∞', 'π', '√', '∑'],
    weather: ['☀', '☁', '☂', '☃', '⚡', '❄', '🌈', '🌙', '⭐', '🔥', '💧', '🌊', '🍃', '🌸', '🌺']
};

const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
    '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
    '#F8B500', '#FF69B4', '#00CED1', '#FF7F50', '#9370DB'
];

const difficultyConfig = {
    easy: {
        iconCount: { min: 4, max: 6 },
        changeInterval: 1000,
        changeDuration: 400,
        maxRounds: 4,
        scaleRange: { min: 0.6, max: 1.4 },
        rotationRange: 60,
        opacityRange: { min: 0.4, max: 1 },
        colorChange: true,
        iconSize: 100,
        fontSize: '3rem',
        name: '简单',
        scoreMultiplier: 1
    },
    medium: {
        iconCount: { min: 6, max: 8 },
        changeInterval: 700,
        changeDuration: 250,
        maxRounds: 6,
        scaleRange: { min: 0.75, max: 1.25 },
        rotationRange: 40,
        opacityRange: { min: 0.5, max: 1 },
        colorChange: true,
        iconSize: 85,
        fontSize: '2.5rem',
        name: '进阶',
        scoreMultiplier: 1.5
    },
    hard: {
        iconCount: { min: 8, max: 10 },
        changeInterval: 500,
        changeDuration: 180,
        maxRounds: 8,
        scaleRange: { min: 0.85, max: 1.15 },
        rotationRange: 25,
        opacityRange: { min: 0.65, max: 1 },
        colorChange: true,
        iconSize: 70,
        fontSize: '2rem',
        name: '挑战',
        scoreMultiplier: 2
    }
};

const gameState = {
    level: 1,
    score: 0,
    icons: [],
    staticIndex: -1,
    isPlaying: false,
    animationIntervals: [],
    changeRounds: 0,
    maxRounds: 5,
    difficulty: 'easy',
    currentConfig: null
};

const startScreen = document.getElementById('startScreen');
const gameArea = document.getElementById('gameArea');
const iconsGrid = document.getElementById('iconsGrid');
const levelDisplay = document.getElementById('level');
const scoreDisplay = document.getElementById('score');
const message = document.getElementById('message');
const successModal = document.getElementById('successModal');
const errorModal = document.getElementById('errorModal');
const retryBtn = document.getElementById('retryBtn');
const successMessage = document.getElementById('successMessage');

function getRandomItem(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}

function shuffleArray(arr) {
    const newArr = [...arr];
    for (let i = newArr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    return newArr;
}

function getIconCount() {
    const config = gameState.currentConfig;
    const baseCount = config.iconCount.min;
    const extraCount = Math.min(Math.floor(gameState.level / 3), config.iconCount.max - config.iconCount.min);
    return baseCount + extraCount;
}

function getGridColumns(count) {
    if (count <= 6) return 3;
    if (count <= 8) return 4;
    return 3;
}

function generateIcons() {
    const categoryKeys = Object.keys(iconCategories);
    const categoryKey = getRandomItem(categoryKeys);
    const category = iconCategories[categoryKey];
    
    const iconCount = getIconCount();
    const shuffledIcons = shuffleArray(category);
    const selectedIcons = shuffledIcons.slice(0, iconCount);
    
    gameState.staticIndex = Math.floor(Math.random() * iconCount);
    gameState.icons = selectedIcons.map((icon, index) => ({
        icon: icon,
        originalIcon: icon,
        color: getRandomItem(colors),
        originalColor: getRandomItem(colors),
        isStatic: index === gameState.staticIndex,
        scale: 1,
        rotation: 0,
        opacity: 1
    }));
    
    gameState.icons[gameState.staticIndex].color = gameState.icons[gameState.staticIndex].originalColor;
}

function renderIcons() {
    const config = gameState.currentConfig;
    const iconCount = gameState.icons.length;
    const columns = getGridColumns(iconCount);
    iconsGrid.style.gridTemplateColumns = `repeat(${columns}, 1fr)`;
    iconsGrid.innerHTML = '';
    
    gameState.icons.forEach((iconData, index) => {
        const iconElement = document.createElement('div');
        iconElement.className = 'icon-item';
        iconElement.dataset.index = index;
        iconElement.textContent = iconData.icon;
        iconElement.style.color = iconData.color;
        iconElement.style.transform = `scale(${iconData.scale}) rotate(${iconData.rotation}deg)`;
        iconElement.style.opacity = iconData.opacity;
        iconElement.style.width = `${config.iconSize}px`;
        iconElement.style.height = `${config.iconSize}px`;
        iconElement.style.fontSize = config.fontSize;
        
        iconElement.addEventListener('click', () => handleIconClick(index));
        iconsGrid.appendChild(iconElement);
    });
}

function updateIconDisplay(index) {
    const iconElements = iconsGrid.querySelectorAll('.icon-item');
    if (iconElements[index]) {
        const iconData = gameState.icons[index];
        iconElements[index].textContent = iconData.icon;
        iconElements[index].style.color = iconData.color;
        iconElements[index].style.transform = `scale(${iconData.scale}) rotate(${iconData.rotation}deg)`;
        iconElements[index].style.opacity = iconData.opacity;
    }
}

function animateIcons() {
    const config = gameState.currentConfig;
    gameState.animationIntervals.forEach(interval => clearInterval(interval));
    gameState.animationIntervals = [];
    gameState.changeRounds = 0;
    
    message.textContent = '仔细观察，找出静止的图标...';
    
    const animationInterval = setInterval(() => {
        if (gameState.changeRounds >= config.maxRounds) {
            clearInterval(animationInterval);
            message.textContent = '现在点击那个静止的图标！';
            gameState.isPlaying = true;
            return;
        }
        
        gameState.icons.forEach((iconData, index) => {
            if (!iconData.isStatic) {
                const changeType = Math.floor(Math.random() * 4);
                
                switch (changeType) {
                    case 0:
                        if (config.colorChange) {
                            iconData.color = getRandomItem(colors);
                        }
                        break;
                    case 1:
                        iconData.scale = config.scaleRange.min + Math.random() * (config.scaleRange.max - config.scaleRange.min);
                        break;
                    case 2:
                        iconData.rotation = (Math.random() - 0.5) * config.rotationRange;
                        break;
                    case 3:
                        iconData.opacity = config.opacityRange.min + Math.random() * (config.opacityRange.max - config.opacityRange.min);
                        break;
                }
                
                setTimeout(() => {
                    if (!iconData.isStatic) {
                        iconData.scale = 1;
                        iconData.rotation = 0;
                        iconData.opacity = 1;
                        updateIconDisplay(index);
                    }
                }, config.changeDuration);
            }
            updateIconDisplay(index);
        });
        
        gameState.changeRounds++;
    }, config.changeInterval);
    
    gameState.animationIntervals.push(animationInterval);
}

function handleIconClick(index) {
    if (!gameState.isPlaying) return;
    
    const config = gameState.currentConfig;
    const iconElements = iconsGrid.querySelectorAll('.icon-item');
    
    if (index === gameState.staticIndex) {
        iconElements[index].classList.add('correct');
        gameState.isPlaying = false;
        
        const levelScore = Math.floor(100 * gameState.level * config.scoreMultiplier);
        gameState.score += levelScore;
        scoreDisplay.textContent = gameState.score;
        
        successMessage.textContent = `获得 ${levelScore} 分！`;
        successModal.style.display = 'flex';
        
        setTimeout(() => {
            successModal.style.display = 'none';
            nextLevel();
        }, 1500);
    } else {
        iconElements[index].classList.add('wrong');
        gameState.isPlaying = false;
        errorModal.style.display = 'flex';
    }
    
    iconElements.forEach(el => el.classList.add('clicked'));
}

function nextLevel() {
    gameState.level++;
    levelDisplay.textContent = gameState.level;
    startLevel();
}

function startLevel() {
    gameState.isPlaying = false;
    gameState.animationIntervals.forEach(interval => clearInterval(interval));
    gameState.animationIntervals = [];
    
    generateIcons();
    renderIcons();
    
    setTimeout(() => {
        animateIcons();
    }, 500);
}

function startGame(difficulty) {
    gameState.difficulty = difficulty || 'easy';
    gameState.currentConfig = difficultyConfig[gameState.difficulty];
    gameState.level = 1;
    gameState.score = 0;
    levelDisplay.textContent = '1';
    scoreDisplay.textContent = '0';
    
    startScreen.style.display = 'none';
    gameArea.style.display = 'block';
    
    startLevel();
}

function retryLevel() {
    errorModal.style.display = 'none';
    
    gameState.icons.forEach((iconData, index) => {
        if (!iconData.isStatic) {
            iconData.color = iconData.originalColor;
            iconData.scale = 1;
            iconData.rotation = 0;
            iconData.opacity = 1;
        }
    });
    
    renderIcons();
    
    setTimeout(() => {
        animateIcons();
    }, 500);
}

const difficultyBtns = document.querySelectorAll('.difficulty-card');
difficultyBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        difficultyBtns.forEach(b => b.classList.remove('selected'));
        btn.classList.add('selected');
        
        const difficulty = btn.dataset.difficulty;
        setTimeout(() => {
            startGame(difficulty);
        }, 300);
    });
});

retryBtn.addEventListener('click', retryLevel);
