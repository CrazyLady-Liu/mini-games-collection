const gameState = {
    level: 1,
    score: 0,
    combo: 0,
    maxCombo: 0,
    selectedSentences: new Set(),
    currentCondition: null,
    currentSentences: [],
    isLocked: false
};

const emotionWords = [
    '开心', '快乐', '悲伤', '愤怒', '害怕', '惊喜', '厌恶', '焦虑',
    '幸福', '痛苦', '兴奋', '沮丧', '平静', '激动', '紧张', '放松',
    '喜悦', '悲哀', '恐惧', '惊奇', '满意', '失望', '感激', '嫉妒',
    '骄傲', '羞愧', '自豪', '自卑', '乐观', '悲观', '温柔', '暴躁'
];

const actionVerbs = [
    '跑', '跳', '走', '吃', '喝', '看', '听', '说', '读', '写',
    '打', '踢', '扔', '接', '推', '拉', '开', '关', '坐', '站',
    '睡', '醒', '笑', '哭', '唱', '跳', '画', '做', '煮', '洗',
    '打扫', '整理', '学习', '工作', '休息', '锻炼', '旅行', '购物'
];

const negativeWords = ['不', '没', '无', '非', '否', '别', '勿', '未', '禁止', '难以'];

const personPronouns = ['我', '你', '他', '她', '我们', '你们', '他们', '她们', '自己', '别人', '大家', '某人'];

const questionWords = ['吗', '呢', '吧', '啊', '？', '怎样', '如何', '什么', '为什么', '哪里', '谁', '多少'];

const timeWords = ['今天', '昨天', '明天', '早上', '晚上', '中午', '下午', '现在', '过去', '未来', '刚才', '立刻'];

const natureWords = ['太阳', '月亮', '星星', '天空', '大海', '山', '河', '花', '草', '树', '风', '雨', '雪', '云'];

const colorWords = ['红色', '蓝色', '绿色', '黄色', '白色', '黑色', '紫色', '橙色', '粉色', '灰色', '金色', '银色'];

const sentencesPool = [
    { text: '我今天非常开心', tags: ['emotion', 'person', 'time'] },
    { text: '小猫在阳光下睡觉', tags: ['action', 'nature'] },
    { text: '他跑得很快', tags: ['action', 'person'] },
    { text: '这朵花很漂亮', tags: ['emotion', 'nature'] },
    { text: '我不喜欢吃蔬菜', tags: ['negative', 'person', 'action'] },
    { text: '天空是蓝色的', tags: ['nature', 'color'] },
    { text: '她悲伤地离开了', tags: ['emotion', 'action', 'person'] },
    { text: '明天我们去爬山', tags: ['time', 'person', 'action', 'nature'] },
    { text: '这本书很有趣', tags: ['emotion'] },
    { text: '他没有完成作业', tags: ['negative', 'person', 'action'] },
    { text: '鸟儿在树上唱歌', tags: ['action', 'nature'] },
    { text: '我感到非常幸福', tags: ['emotion', 'person'] },
    { text: '别打开那个盒子', tags: ['negative', 'action'] },
    { text: '今天天气真好', tags: ['time', 'nature', 'emotion'] },
    { text: '她穿着红色的裙子', tags: ['color', 'person'] },
    { text: '我喜欢在雨中散步', tags: ['action', 'nature', 'person'] },
    { text: '他从不迟到', tags: ['negative', 'person', 'time'] },
    { text: '星星在夜空中闪烁', tags: ['nature', 'action'] },
    { text: '我很失望听到这个消息', tags: ['emotion', 'person'] },
    { text: '请不要随地吐痰', tags: ['negative', 'action'] },
    { text: '妈妈在厨房做饭', tags: ['action', 'person'] },
    { text: '这条河很清澈', tags: ['nature'] },
    { text: '他激动地跳了起来', tags: ['emotion', 'action', 'person'] },
    { text: '我无法理解你的意思', tags: ['negative', 'person'] },
    { text: '秋天的树叶变黄了', tags: ['nature', 'color', 'action'] },
    { text: '她温柔地抚摸着小猫', tags: ['emotion', 'action', 'person'] },
    { text: '没有人知道答案', tags: ['negative', 'person'] },
    { text: '我们在海边看日出', tags: ['person', 'action', 'nature', 'time'] },
    { text: '这个消息令人惊讶', tags: ['emotion'] },
    { text: '他关上了窗户', tags: ['action', 'person'] },
    { text: '我从未见过如此美丽的风景', tags: ['negative', 'emotion', 'nature', 'person'] },
    { text: '小狗在草地上奔跑', tags: ['action', 'nature'] },
    { text: '她的眼睛是绿色的', tags: ['color', 'person'] },
    { text: '别忘了带雨伞', tags: ['negative', 'action'] },
    { text: '他紧张地等待着结果', tags: ['emotion', 'action', 'person'] },
    { text: '月亮从云层后面出来了', tags: ['nature', 'action'] },
    { text: '我非常感激你的帮助', tags: ['emotion', 'person'] },
    { text: '这不是我的错', tags: ['negative', 'person'] },
    { text: '孩子们在公园里玩耍', tags: ['action', 'person', 'nature'] },
    { text: '清晨的空气很清新', tags: ['time', 'nature', 'emotion'] },
    { text: '他愤怒地摔门而去', tags: ['emotion', 'action', 'person'] },
    { text: '我无法忘记那天发生的事', tags: ['negative', 'person', 'time', 'action'] },
    { text: '雪花纷纷扬扬地落下', tags: ['nature', 'action'] },
    { text: '她总是那么乐观', tags: ['emotion', 'person'] },
    { text: '请不要在图书馆里大声说话', tags: ['negative', 'action'] },
    { text: '我昨晚做了一个奇怪的梦', tags: ['time', 'person', 'action'] },
    { text: '夕阳把天空染成了橙色', tags: ['nature', 'color', 'action'] },
    { text: '他平静地接受了现实', tags: ['emotion', 'action', 'person'] },
    { text: '这里没有任何人', tags: ['negative', 'person'] },
    { text: '我们一起度过了美好的时光', tags: ['person', 'emotion', 'time', 'action'] },
    { text: '这个问题很难回答', tags: ['negative'] },
    { text: '蜜蜂在花丛中采蜜', tags: ['action', 'nature'] },
    { text: '她害羞地低下了头', tags: ['emotion', 'action', 'person'] },
    { text: '我不同意你的观点', tags: ['negative', 'person'] },
    { text: '时间过得真快', tags: ['time', 'emotion'] },
    { text: '他穿着黑色的西装', tags: ['color', 'person', 'action'] },
    { text: '雨后的彩虹很漂亮', tags: ['nature', 'emotion'] },
    { text: '她兴奋地告诉大家这个好消息', tags: ['emotion', 'action', 'person'] },
    { text: '我听不懂你在说什么', tags: ['negative', 'person', 'action'] },
    { text: '春风吹绿了大地', tags: ['nature', 'action', 'color'] },
    { text: '他为自己的成就感到骄傲', tags: ['emotion', 'person'] },
    { text: '请勿触摸展品', tags: ['negative', 'action'] },
    { text: '我今天下午要去图书馆', tags: ['time', 'person', 'action'] },
    { text: '这条小路通向山顶', tags: ['nature', 'action'] },
    { text: '她的脸上露出了满意的笑容', tags: ['emotion', 'person', 'action'] },
    { text: '这不可能是真的', tags: ['negative'] },
    { text: '我们在雪地里堆雪人', tags: ['person', 'action', 'nature'] },
    { text: '他非常害怕黑暗', tags: ['emotion', 'person'] },
    { text: '别忘了明天的会议', tags: ['negative', 'time', 'action'] },
    { text: '瀑布从高处倾泻而下', tags: ['nature', 'action'] },
    { text: '我很荣幸能参加这次活动', tags: ['emotion', 'person', 'action'] },
    { text: '他没有说出真相', tags: ['negative', 'person', 'action'] },
    { text: '粉色的樱花盛开了', tags: ['color', 'nature', 'action'] },
    { text: '她感到一阵莫名的恐惧', tags: ['emotion', 'person'] },
    { text: '无论如何我都不会放弃', tags: ['negative', 'person', 'action'] },
    { text: '清晨的露珠闪闪发光', tags: ['time', 'nature', 'action'] },
    { text: '他温柔地安慰着哭泣的孩子', tags: ['emotion', 'action', 'person'] },
    { text: '这里禁止吸烟', tags: ['negative', 'action'] },
    { text: '我最喜欢秋天的落叶', tags: ['emotion', 'nature', 'person', 'time'] },
    { text: '她的眼睛闪烁着兴奋的光芒', tags: ['emotion', 'person'] },
    { text: '他无法忍受这种痛苦', tags: ['negative', 'emotion', 'person'] },
    { text: '夜幕降临，星星开始出现', tags: ['time', 'nature', 'action'] },
    { text: '我们应该互相帮助', tags: ['person', 'action'] },
    { text: '这个决定让我很后悔', tags: ['emotion', 'person'] },
    { text: '不要让机会溜走', tags: ['negative', 'action'] },
    { text: '他在夕阳下孤独地走着', tags: ['emotion', 'action', 'person', 'nature', 'time'] },
    { text: '我无比怀念那段时光', tags: ['emotion', 'person', 'time'] },
    { text: '这无疑是最好的选择', tags: ['negative'] },
    { text: '鸟儿在清晨欢快地歌唱', tags: ['action', 'nature', 'time', 'emotion'] },
    { text: '她的心情突然变得很糟糕', tags: ['emotion', 'person', 'action'] },
    { text: '我不确定他是否会来', tags: ['negative', 'person', 'action'] },
    { text: '金色的阳光洒在海面上', tags: ['color', 'nature', 'action'] },
    { text: '他感到前所未有的放松', tags: ['emotion', 'person'] },
    { text: '未经允许请勿进入', tags: ['negative', 'action'] },
    { text: '我们在山顶欣赏美丽的风景', tags: ['person', 'action', 'nature', 'emotion'] },
    { text: '这个消息让所有人都很震惊', tags: ['emotion', 'person'] },
    { text: '他从不抱怨生活的艰辛', tags: ['negative', 'person', 'emotion', 'action'] },
    { text: '雨滴敲打着窗户', tags: ['nature', 'action'] },
    { text: '我真诚地向你道歉', tags: ['emotion', 'person', 'action'] },
    { text: '这不是我想要的结果', tags: ['negative', 'person', 'action'] }
];

const conditions = {
    emotion: {
        name: '包含情绪词',
        description: '找出所有表达情绪的句子',
        check: (tags) => tags.includes('emotion'),
        difficulty: 1
    },
    action: {
        name: '描述动作',
        description: '找出所有包含动作的句子',
        check: (tags) => tags.includes('action'),
        difficulty: 1
    },
    negative: {
        name: '表达否定',
        description: '找出所有包含否定含义的句子',
        check: (tags) => tags.includes('negative'),
        difficulty: 1
    },
    person: {
        name: '指代人物',
        description: '找出所有提到人物的句子',
        check: (tags) => tags.includes('person'),
        difficulty: 1
    },
    nature: {
        name: '描写自然',
        description: '找出所有描写自然景物的句子',
        check: (tags) => tags.includes('nature'),
        difficulty: 2
    },
    time: {
        name: '提到时间',
        description: '找出所有提到时间的句子',
        check: (tags) => tags.includes('time'),
        difficulty: 2
    },
    color: {
        name: '包含颜色',
        description: '找出所有提到颜色的句子',
        check: (tags) => tags.includes('color'),
        difficulty: 2
    },
    emotion_action: {
        name: '同时包含情绪和动作',
        description: '找出既表达情绪又描述动作的句子',
        check: (tags) => tags.includes('emotion') && tags.includes('action'),
        difficulty: 3
    },
    person_action: {
        name: '人物做出动作',
        description: '找出有人物且有动作的句子',
        check: (tags) => tags.includes('person') && tags.includes('action'),
        difficulty: 3
    },
    negative_person: {
        name: '人物表达否定',
        description: '找出有人物且表达否定的句子',
        check: (tags) => tags.includes('negative') && tags.includes('person'),
        difficulty: 3
    },
    nature_emotion: {
        name: '借景抒情',
        description: '找出既描写自然又表达情绪的句子',
        check: (tags) => tags.includes('nature') && tags.includes('emotion'),
        difficulty: 3
    },
    person_time_action: {
        name: '人物在特定时间做动作',
        description: '找出同时包含人物、时间和动作的句子',
        check: (tags) => tags.includes('person') && tags.includes('time') && tags.includes('action'),
        difficulty: 4
    },
    nature_color_action: {
        name: '有颜色的自然景象在变化',
        description: '找出同时包含自然、颜色和动作的句子',
        check: (tags) => tags.includes('nature') && tags.includes('color') && tags.includes('action'),
        difficulty: 4
    }
};

const levelConfig = [
    { sentenceCount: 5, conditionDifficulty: [1], matchRatio: 0.4 },
    { sentenceCount: 6, conditionDifficulty: [1], matchRatio: 0.4 },
    { sentenceCount: 6, conditionDifficulty: [1, 2], matchRatio: 0.35 },
    { sentenceCount: 7, conditionDifficulty: [1, 2], matchRatio: 0.35 },
    { sentenceCount: 7, conditionDifficulty: [2], matchRatio: 0.35 },
    { sentenceCount: 8, conditionDifficulty: [2, 3], matchRatio: 0.3 },
    { sentenceCount: 8, conditionDifficulty: [2, 3], matchRatio: 0.3 },
    { sentenceCount: 9, conditionDifficulty: [3], matchRatio: 0.3 },
    { sentenceCount: 9, conditionDifficulty: [3, 4], matchRatio: 0.25 },
    { sentenceCount: 10, conditionDifficulty: [3, 4], matchRatio: 0.25 },
];

function getLevelConfig(level) {
    if (level <= levelConfig.length) {
        return levelConfig[level - 1];
    }
    return {
        sentenceCount: Math.min(12, 10 + Math.floor((level - 10) / 2)),
        conditionDifficulty: [3, 4],
        matchRatio: 0.25
    };
}

function getAvailableConditions(difficultyRange) {
    return Object.entries(conditions)
        .filter(([_, cond]) => difficultyRange.includes(cond.difficulty))
        .map(([key, _]) => key);
}

function shuffleArray(array) {
    const newArray = [...array];
    for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
    }
    return newArray;
}

function selectRandomItems(array, count) {
    const shuffled = shuffleArray(array);
    return shuffled.slice(0, count);
}

function generateLevel() {
    const config = getLevelConfig(gameState.level);
    const availableConditions = getAvailableConditions(config.conditionDifficulty);
    const conditionKey = availableConditions[Math.floor(Math.random() * availableConditions.length)];
    const condition = conditions[conditionKey];
    
    gameState.currentCondition = { key: conditionKey, ...condition };
    
    const matchingSentences = sentencesPool.filter(s => condition.check(s.tags));
    const nonMatchingSentences = sentencesPool.filter(s => !condition.check(s.tags));
    
    const matchCount = Math.max(1, Math.min(
        Math.floor(config.sentenceCount * config.matchRatio),
        matchingSentences.length
    ));
    const nonMatchCount = Math.max(1, config.sentenceCount - matchCount);
    const actualNonMatchCount = Math.min(nonMatchCount, nonMatchingSentences.length);
    const actualSentenceCount = matchCount + actualNonMatchCount;
    
    const selectedMatches = selectRandomItems(matchingSentences, matchCount);
    const selectedNonMatches = selectRandomItems(nonMatchingSentences, actualNonMatchCount);
    
    gameState.currentSentences = shuffleArray([...selectedMatches, ...selectedNonMatches]);
    gameState.selectedSentences.clear();
}

function renderSentences() {
    const container = document.getElementById('sentencesContainer');
    container.innerHTML = '';
    
    gameState.currentSentences.forEach((sentence, index) => {
        const item = document.createElement('div');
        item.className = 'sentence-item';
        item.dataset.index = index;
        
        item.innerHTML = `
            <div class="checkbox"></div>
            <div class="sentence-text">${sentence.text}</div>
        `;
        
        item.addEventListener('click', () => toggleSentence(index));
        container.appendChild(item);
    });
}

function renderCondition() {
    const conditionText = document.getElementById('conditionText');
    const conditionHint = document.getElementById('conditionHint');
    
    conditionText.textContent = gameState.currentCondition.name;
    conditionHint.textContent = gameState.currentCondition.description;
}

function updateStats() {
    document.getElementById('levelDisplay').textContent = gameState.level;
    document.getElementById('scoreDisplay').textContent = gameState.score;
    document.getElementById('comboDisplay').textContent = gameState.combo;
}

function toggleSentence(index) {
    if (gameState.isLocked) return;
    
    const items = document.querySelectorAll('.sentence-item');
    const item = items[index];
    
    if (gameState.selectedSentences.has(index)) {
        gameState.selectedSentences.delete(index);
        item.classList.remove('selected');
    } else {
        gameState.selectedSentences.add(index);
        item.classList.add('selected');
    }
    
    checkAnswer();
}

function showFeedback(message, type) {
    const feedback = document.getElementById('feedback');
    feedback.textContent = message;
    feedback.className = `feedback ${type}`;
    
    setTimeout(() => {
        feedback.textContent = '';
        feedback.className = 'feedback';
    }, 2000);
}

function checkAnswer() {
    if (gameState.isLocked) return;
    if (gameState.selectedSentences.size === 0) {
        showFeedback('请至少选择一个句子', 'error');
        return;
    }
    
    gameState.isLocked = true;
    
    const condition = gameState.currentCondition;
    const items = document.querySelectorAll('.sentence-item');
    let correctCount = 0;
    let wrongCount = 0;
    
    items.forEach((item, index) => {
        const sentence = gameState.currentSentences[index];
        const isSelected = gameState.selectedSentences.has(index);
        const shouldBeSelected = condition.check(sentence.tags);
        
        if (isSelected && shouldBeSelected) {
            item.classList.add('correct');
            correctCount++;
        } else if (isSelected && !shouldBeSelected) {
            item.classList.add('wrong');
            wrongCount++;
        } else if (!isSelected && shouldBeSelected) {
            item.classList.add('wrong');
            wrongCount++;
        }
    });
    
    const isPerfect = wrongCount === 0 && correctCount > 0;
    
    if (isPerfect) {
        gameState.combo++;
        if (gameState.combo > gameState.maxCombo) {
            gameState.maxCombo = gameState.combo;
        }
        const baseScore = 100 * gameState.level;
        const comboBonus = Math.floor(baseScore * (gameState.combo - 1) * 0.2);
        const totalScore = baseScore + comboBonus;
        gameState.score += totalScore;
        
        const comboText = gameState.combo > 1 ? ` 🔥 ${gameState.combo}连击!` : '';
        showFeedback(`✓ 完美通关! +${totalScore}分${comboText}`, 'success');
        
        updateStats();
        
        setTimeout(() => {
            gameState.level++;
            startLevel();
        }, 1500);
    } else {
        gameState.combo = 0;
        if (wrongCount > 0) {
            showFeedback('✗ 有错误选择或漏选，请重试', 'error');
        } else {
            showFeedback('✗ 请选择所有符合条件的句子', 'error');
        }
        updateStats();
        
        setTimeout(() => {
            gameState.isLocked = false;
            resetSelection();
        }, 1500);
    }
}

function resetSelection() {
    if (gameState.isLocked) return;
    
    gameState.selectedSentences.clear();
    document.querySelectorAll('.sentence-item').forEach(item => {
        item.classList.remove('selected', 'correct', 'wrong');
    });
}

function startLevel() {
    gameState.isLocked = false;
    gameState.selectedSentences.clear();
    generateLevel();
    renderCondition();
    renderSentences();
    updateStats();
    const feedback = document.getElementById('feedback');
    feedback.textContent = '';
    feedback.className = 'feedback';
}

function startGame() {
    gameState.level = 1;
    gameState.score = 0;
    gameState.combo = 0;
    gameState.maxCombo = 0;
    
    document.getElementById('startModal').classList.add('hidden');
    document.getElementById('gameOverModal').classList.add('hidden');
    
    startLevel();
}

function endGame() {
    document.getElementById('finalLevel').textContent = gameState.level;
    document.getElementById('finalScore').textContent = gameState.score;
    document.getElementById('finalCombo').textContent = gameState.maxCombo;
    document.getElementById('gameOverModal').classList.remove('hidden');
}

document.getElementById('startBtn').addEventListener('click', startGame);
document.getElementById('restartBtn').addEventListener('click', startGame);
document.getElementById('resetBtn').addEventListener('click', resetSelection);
document.getElementById('submitBtn').addEventListener('click', checkAnswer);

document.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !document.getElementById('startModal').classList.contains('hidden')) {
        startGame();
    } else if (e.key === 'Enter' && !gameState.isLocked) {
        checkAnswer();
    } else if (e.key === 'r' || e.key === 'R') {
        resetSelection();
    }
});
