const gameState = {
    level: 1,
    score: 0,
    combo: 0,
    maxCombo: 0,
    hints: 3,
    currentAnswer: '',
    wrongCount: 0,
    maxWrong: 3,
    currentMode: 'text'
};

const drawState = {
    isDrawing: false,
    lastX: 0,
    lastY: 0,
    currentPath: [],
    allPaths: [],
    targetSymmetry: 70,
    currentPattern: null
};

const characterPool = [
    { char: '人', similar: ['入', '八', '乂'] },
    { char: '大', similar: ['太', '犬', '天', '夫'] },
    { char: '小', similar: ['少', '水', '永', '小'] },
    { char: '日', similar: ['曰', '目', '月', '田'] },
    { char: '月', similar: ['日', '用', '丹', '冉'] },
    { char: '山', similar: ['出', '岳', '崖', '峰'] },
    { char: '水', similar: ['永', '冰', '求', '氽'] },
    { char: '火', similar: ['炎', '焱', '灭', '灰'] },
    { char: '木', similar: ['本', '术', '未', '末'] },
    { char: '金', similar: ['全', '余', '金', '鑫'] },
    { char: '土', similar: ['士', '工', '干', '王'] },
    { char: '王', similar: ['玉', '主', '五', '丑'] },
    { char: '天', similar: ['夫', '无', '元', '云'] },
    { char: '地', similar: ['池', '驰', '他', '她'] },
    { char: '上', similar: ['下', '止', '土', '工'] },
    { char: '下', similar: ['上', '不', '卞', '卡'] },
    { char: '左', similar: ['右', '在', '存', '佐'] },
    { char: '右', similar: ['左', '有', '佑', '布'] },
    { char: '中', similar: ['口', '日', '曰', '丰'] },
    { char: '东', similar: ['车', '冻', '栋', '陈'] },
    { char: '西', similar: ['四', '酉', '洒', '晒'] },
    { char: '南', similar: ['男', '楠', '喃', '献'] },
    { char: '北', similar: ['比', '背', '兆', '非'] },
    { char: '春', similar: ['春', '秦', '泰', '奉'] },
    { char: '夏', similar: ['复', '厦', '嘎', '忧'] },
    { char: '秋', similar: ['和', '科', '秒', '秘'] },
    { char: '冬', similar: ['各', '备', '咎', '佟'] },
    { char: '风', similar: ['凤', '夙', '凡', '帆'] },
    { char: '云', similar: ['去', '云', '动', '层'] },
    { char: '雨', similar: ['两', '而', '面', '丙'] },
    { char: '雪', similar: ['雷', '霜', '雾', '雯'] },
    { char: '花', similar: ['华', '化', '花', '苍'] },
    { char: '草', similar: ['早', '章', '卓', '罩'] },
    { char: '树', similar: ['村', '材', '林', '森'] },
    { char: '鸟', similar: ['马', '鱼', '乌', '岛'] },
    { char: '鱼', similar: ['鸟', '鲁', '渔', '鲜'] },
    { char: '虫', similar: ['中', '丰', '串', '患'] },
    { char: '龙', similar: ['尤', '龙', '庞', '笼'] },
    { char: '虎', similar: ['虚', '虑', '虔', '彪'] },
    { char: '马', similar: ['鸟', '与', '写', '焉'] },
    { char: '牛', similar: ['午', '丰', '年', '朱'] },
    { char: '羊', similar: ['半', '兰', '养', '姜'] },
    { char: '狗', similar: ['句', '够', '苟', '枸'] },
    { char: '猪', similar: ['都', '著', '堵', '赌'] },
    { char: '鸡', similar: ['鸭', '鹅', '鸣', '鸦'] },
    { char: '鸭', similar: ['鸡', '鹅', '鸥', '鸦'] },
    { char: '爱', similar: ['受', '爱', '援', '媛'] },
    { char: '情', similar: ['清', '晴', '请', '青'] },
    { char: '心', similar: ['必', '沁', '芯', '志'] },
    { char: '思', similar: ['恩', '念', '想', '息'] },
    { char: '明', similar: ['朋', '朗', '萌', '盟'] },
    { char: '光', similar: ['兴', '米', '来', '平'] },
    { char: '星', similar: ['生', '胜', '姓', '性'] },
    { char: '梦', similar: ['楚', '焚', '禁', '梵'] },
    { char: '诗', similar: ['待', '持', '特', '诗'] },
    { char: '书', similar: ['画', '昼', '尽', '书'] },
    { char: '画', similar: ['书', '函', '幽', '凿'] },
    { char: '琴', similar: ['瑟', '琵', '琶', '琴'] },
    { char: '棋', similar: ['旗', '期', '欺', '斯'] },
    { char: '剑', similar: ['敛', '脸', '险', '验'] },
    { char: '刀', similar: ['力', '刃', '习', '刁'] },
    { char: '酒', similar: ['洒', '晒', '栖', '牺'] },
    { char: '茶', similar: ['菜', '茶', '荼', '搽'] },
    { char: '河', similar: ['何', '呵', '柯', '珂'] },
    { char: '海', similar: ['每', '梅', '霉', '酶'] },
    { char: '江', similar: ['工', '红', '虹', '鸿'] },
    { char: '湖', similar: ['胡', '糊', '蝴', '葫'] },
    { char: '石', similar: ['右', '古', '占', '岩'] },
    { char: '玉', similar: ['王', '主', '五', '丑'] },
    { char: '宝', similar: ['玉', '国', '园', '圆'] },
    { char: '珠', similar: ['朱', '株', '蛛', '诛'] },
    { char: '城', similar: ['成', '诚', '盛', '乘'] },
    { char: '门', similar: ['们', '闭', '闲', '间'] },
    { char: '窗', similar: ['空', '窝', '容', '窜'] },
    { char: '家', similar: ['逐', '蒙', '豪', '膏'] },
    { char: '国', similar: ['园', '圆', '困', '围'] },
    { char: '学', similar: ['字', '宇', '宙', '宗'] },
    { char: '校', similar: ['交', '郊', '效', '饺'] },
    { char: '师', similar: ['狮', '筛', '帅', '归'] },
    { char: '生', similar: ['牛', '丰', '失', '朱'] },
    { char: '友', similar: ['有', '发', '反', '叔'] },
    { char: '亲', similar: ['新', '薪', '辛', '幸'] },
    { char: '父', similar: ['夫', '失', '丈', '义'] },
    { char: '母', similar: ['每', '海', '梅', '霉'] },
    { char: '子', similar: ['了', '孑', '孓', '予'] },
    { char: '女', similar: ['好', '如', '妃', '妄'] },
    { char: '男', similar: ['南', '男', '舅', '甥'] },
    { char: '老', similar: ['考', '者', '孝', '老'] },
    { char: '少', similar: ['小', '水', '沙', '纱'] },
    { char: '多', similar: ['夕', '名', '罗', '岁'] },
    { char: '高', similar: ['亮', '膏', '豪', '毫'] },
    { char: '低', similar: ['底', '抵', '邸', '诋'] },
    { char: '长', similar: ['张', '涨', '帐', '胀'] },
    { char: '短', similar: ['知', '智', '矮', '矬'] },
    { char: '快', similar: ['块', '筷', '炔', '缺'] },
    { char: '慢', similar: ['漫', '蔓', '馒', '鳗'] },
    { char: '美', similar: ['善', '姜', '羡', '義'] },
    { char: '丑', similar: ['五', '王', '牛', '生'] },
    { char: '真', similar: ['直', '值', '植', '殖'] },
    { char: '假', similar: ['暇', '遐', '瑕', '霞'] },
    { char: '善', similar: ['美', '姜', '养', '恙'] },
    { char: '恶', similar: ['亚', '严', '业', '丽'] },
    { char: '好', similar: ['如', '妃', '妄', '奸'] },
    { char: '坏', similar: ['环', '怀', '还', '杯'] },
    { char: '新', similar: ['亲', '薪', '辛', '幸'] },
    { char: '旧', similar: ['日', '旦', '早', '旱'] },
    { char: '冷', similar: ['令', '领', '零', '铃'] },
    { char: '热', similar: ['然', '熟', '煮', '熬'] },
    { char: '甜', similar: ['甘', '柑', '甜', '酣'] },
    { char: '苦', similar: ['若', '苦', '菩', '莫'] },
    { char: '酸', similar: ['俊', '骏', '峻', '竣'] },
    { char: '辣', similar: ['刺', '棘', '辣', '辞'] },
    { char: '红', similar: ['江', '虹', '鸿', '扛'] },
    { char: '蓝', similar: ['篮', '兰', '拦', '栏'] },
    { char: '绿', similar: ['录', '禄', '碌', '逯'] },
    { char: '黄', similar: ['横', '簧', '磺', '蝗'] },
    { char: '白', similar: ['日', '百', '自', '白'] },
    { char: '黑', similar: ['墨', '默', '黔', '黛'] },
    { char: '青', similar: ['清', '晴', '请', '情'] },
    { char: '紫', similar: ['此', '些', '柴', '些'] },
    { char: '一', similar: ['二', '三', '十', '丁'] },
    { char: '二', similar: ['一', '三', '干', '土'] },
    { char: '三', similar: ['二', '王', '主', '玉'] },
    { char: '十', similar: ['千', '干', '土', '士'] },
    { char: '百', similar: ['白', '自', '首', '舌'] },
    { char: '千', similar: ['十', '干', '升', '开'] },
    { char: '万', similar: ['方', '石', '右', '古'] },
    { char: '亿', similar: ['乙', '忆', '乞', '讫'] },
    { char: '银', similar: ['很', '恨', '狠', '痕'] },
    { char: '铜', similar: ['同', '桐', '童', '潼'] },
    { char: '铁', similar: ['失', '秩', '迭', '跌'] },
    { char: '纸', similar: ['低', '底', '抵', '邸'] },
    { char: '笔', similar: ['毛', '尾', '笔', '耗'] },
    { char: '墨', similar: ['黑', '默', '黔', '黛'] },
    { char: '砚', similar: ['见', '观', '现', '规'] },
    { char: '食', similar: ['良', '粮', '狼', '浪'] },
    { char: '衣', similar: ['依', '装', '袋', '袭'] },
    { char: '住', similar: ['主', '往', '注', '柱'] },
    { char: '行', similar: ['街', '衡', '待', '得'] },
    { char: '坐', similar: ['座', '从', '丛', '巫'] },
    { char: '卧', similar: ['臣', '宦', '颐', '熙'] },
    { char: '立', similar: ['位', '泣', '拉', '粒'] },
    { char: '走', similar: ['足', '是', '页', '徙'] }
];

const patternTemplates = [
    { type: 'triangle', complexity: 1 },
    { type: 'square', complexity: 1 },
    { type: 'circle', complexity: 1 },
    { type: 'heart', complexity: 2 },
    { type: 'star', complexity: 2 },
    { type: 'diamond', complexity: 1 },
    { type: 'arrow', complexity: 2 },
    { type: 'wave', complexity: 2 },
    { type: 'zigzag', complexity: 2 },
    { type: 'spiral', complexity: 3 },
    { type: 'cross', complexity: 1 },
    { type: 'crescent', complexity: 2 },
    { type: 'leaf', complexity: 2 },
    { type: 'mountain', complexity: 2 },
    { type: 'house', complexity: 3 },
    { type: 'tree', complexity: 3 },
    { type: 'fish', complexity: 3 },
    { type: 'butterfly', complexity: 3 },
    { type: 'flower', complexity: 3 },
    { type: 'cloud', complexity: 2 }
];

const levelConfig = {
    1: { distortLevel: 1, charCount: 1, addSimilar: 0, timeBonus: 100, scoreMultiplier: 1, targetSymmetry: 60, patternComplexity: 1 },
    2: { distortLevel: 2, charCount: 1, addSimilar: 0, timeBonus: 100, scoreMultiplier: 1.2, targetSymmetry: 65, patternComplexity: 1 },
    3: { distortLevel: 2, charCount: 1, addSimilar: 1, timeBonus: 90, scoreMultiplier: 1.4, targetSymmetry: 65, patternComplexity: 1 },
    4: { distortLevel: 3, charCount: 1, addSimilar: 1, timeBonus: 90, scoreMultiplier: 1.6, targetSymmetry: 70, patternComplexity: 2 },
    5: { distortLevel: 3, charCount: 2, addSimilar: 1, timeBonus: 80, scoreMultiplier: 1.8, targetSymmetry: 70, patternComplexity: 2 },
    6: { distortLevel: 4, charCount: 2, addSimilar: 2, timeBonus: 80, scoreMultiplier: 2.0, targetSymmetry: 75, patternComplexity: 2 },
    7: { distortLevel: 4, charCount: 2, addSimilar: 2, timeBonus: 70, scoreMultiplier: 2.5, targetSymmetry: 75, patternComplexity: 3 },
    8: { distortLevel: 5, charCount: 3, addSimilar: 2, timeBonus: 70, scoreMultiplier: 3.0, targetSymmetry: 78, patternComplexity: 3 },
    9: { distortLevel: 5, charCount: 3, addSimilar: 3, timeBonus: 60, scoreMultiplier: 3.5, targetSymmetry: 78, patternComplexity: 3 },
    10: { distortLevel: 6, charCount: 3, addSimilar: 3, timeBonus: 60, scoreMultiplier: 4.0, targetSymmetry: 80, patternComplexity: 3 },
    11: { distortLevel: 6, charCount: 4, addSimilar: 3, timeBonus: 50, scoreMultiplier: 4.5, targetSymmetry: 80, patternComplexity: 3 },
    12: { distortLevel: 7, charCount: 4, addSimilar: 4, timeBonus: 50, scoreMultiplier: 5.0, targetSymmetry: 82, patternComplexity: 3 },
    13: { distortLevel: 7, charCount: 4, addSimilar: 4, timeBonus: 40, scoreMultiplier: 6.0, targetSymmetry: 82, patternComplexity: 3 },
    14: { distortLevel: 8, charCount: 5, addSimilar: 4, timeBonus: 40, scoreMultiplier: 7.0, targetSymmetry: 85, patternComplexity: 3 },
    15: { distortLevel: 8, charCount: 5, addSimilar: 5, timeBonus: 30, scoreMultiplier: 8.0, targetSymmetry: 85, patternComplexity: 3 }
};

const distortionEffects = [
    { transform: 'skewX(5deg) scaleY(1.1)', filter: 'blur(0.5px)', animation: '' },
    { transform: 'rotate(-3deg) scale(1.05)', filter: 'blur(1px) brightness(1.2)', animation: '' },
    { transform: 'skewY(4deg) rotate(2deg)', filter: 'blur(1.5px) contrast(0.8)', animation: '' },
    { transform: 'scaleX(1.2) scaleY(0.9) rotate(-4deg)', filter: 'blur(2px) saturate(1.5)', animation: 'animate-wave' },
    { transform: 'skewX(-8deg) skewY(5deg) rotate(5deg)', filter: 'blur(2.5px) brightness(0.8) contrast(1.2)', animation: 'animate-wiggle' },
    { transform: 'scale(1.3) rotate(8deg) skewX(10deg)', filter: 'blur(3px) hue-rotate(20deg)', animation: 'animate-pulse-glow' },
    { transform: 'scaleX(0.7) scaleY(1.4) rotate(-10deg)', filter: 'blur(3.5px) saturate(0.5) brightness(1.3)', animation: 'animate-wave' },
    { transform: 'skewY(-8deg) rotate(12deg) scale(0.9)', filter: 'blur(4px) contrast(0.6) brightness(1.5)', animation: 'animate-wiggle' }
];

function getRandomChar() {
    return characterPool[Math.floor(Math.random() * characterPool.length)];
}

function getRandomSimilarChars(excludeChar, count) {
    const allChars = characterPool.map(c => c.char);
    const similar = [];
    while (similar.length < count) {
        const randomChar = allChars[Math.floor(Math.random() * allChars.length)];
        if (randomChar !== excludeChar && !similar.includes(randomChar)) {
            similar.push(randomChar);
        }
    }
    return similar;
}

function applyDistortion(element, level, charIndex) {
    const effectIndex = Math.min(level - 1 + charIndex, distortionEffects.length - 1);
    const effect = distortionEffects[effectIndex];
    
    element.style.transform = effect.transform;
    element.style.filter = effect.filter;
    
    element.classList.remove('animate-wave', 'animate-wiggle', 'animate-pulse-glow');
    if (effect.animation) {
        element.classList.add(effect.animation);
    }
}

function generatePuzzle() {
    const config = levelConfig[Math.min(gameState.level, 15)];
    const puzzleContainer = document.getElementById('puzzleContainer');
    puzzleContainer.innerHTML = '';
    
    const answerChars = [];
    const charGroup = document.createElement('div');
    charGroup.className = 'char-group';
    
    for (let i = 0; i < config.charCount; i++) {
        const charData = getRandomChar();
        answerChars.push(charData.char);
        
        const charSpan = document.createElement('span');
        charSpan.className = 'puzzle-char';
        charSpan.textContent = charData.char;
        
        applyDistortion(charSpan, config.distortLevel, i);
        
        charGroup.appendChild(charSpan);
    }
    
    for (let i = 0; i < config.addSimilar; i++) {
        const similarChar = getRandomSimilarChars(answerChars[0], 1)[0];
        const decoySpan = document.createElement('span');
        decoySpan.className = 'puzzle-char';
        decoySpan.textContent = similarChar;
        decoySpan.style.opacity = '0.3';
        decoySpan.style.position = 'absolute';
        decoySpan.style.left = `${30 + Math.random() * 40}%`;
        decoySpan.style.top = `${20 + Math.random() * 60}%`;
        decoySpan.style.fontSize = '2rem';
        decoySpan.style.pointerEvents = 'none';
        decoySpan.style.filter = 'blur(2px)';
        
        charGroup.appendChild(decoySpan);
    }
    
    puzzleContainer.appendChild(charGroup);
    
    gameState.currentAnswer = answerChars.join('');
    
    const hintElement = document.getElementById('puzzleHint');
    hintElement.textContent = `请输入你看到的 ${config.charCount} 个文字`;
}

function updateUI() {
    document.getElementById('level').textContent = gameState.level;
    document.getElementById('score').textContent = gameState.score;
    document.getElementById('combo').textContent = gameState.combo;
    document.getElementById('hintCount').textContent = gameState.hints;
    
    const starsCount = Math.min(Math.ceil(gameState.level / 3), 5);
    const stars = '★'.repeat(starsCount) + '☆'.repeat(5 - starsCount);
    document.getElementById('difficultyStars').textContent = stars;
    
    document.getElementById('hintBtn').disabled = gameState.hints <= 0;
    
    if (gameState.currentMode === 'draw') {
        const config = levelConfig[Math.min(gameState.level, 15)];
        document.getElementById('targetPercent').textContent = config.targetSymmetry;
    }
}

function showFeedback(message, isCorrect) {
    const feedback = document.getElementById('feedback');
    feedback.textContent = message;
    feedback.className = 'feedback ' + (isCorrect ? 'correct' : 'wrong');
    
    setTimeout(() => {
        feedback.textContent = '';
        feedback.className = 'feedback';
    }, 1500);
}

function checkAnswer() {
    const input = document.getElementById('answerInput');
    const userAnswer = input.value.trim();
    
    if (!userAnswer) {
        showFeedback('请输入文字！', false);
        return;
    }
    
    if (userAnswer === gameState.currentAnswer) {
        handleCorrectAnswer();
    } else {
        handleWrongAnswer(`错误！正确答案是：${gameState.currentAnswer}`);
    }
}

function handleCorrectAnswer() {
    const config = levelConfig[Math.min(gameState.level, 15)];
    const baseScore = 100 * config.scoreMultiplier;
    const comboBonus = gameState.combo * 10;
    const totalScore = Math.floor(baseScore + comboBonus);
    
    gameState.score += totalScore;
    gameState.combo++;
    gameState.maxCombo = Math.max(gameState.maxCombo, gameState.combo);
    
    showFeedback(`正确！+${totalScore}分`, true);
    
    if (gameState.combo % 5 === 0) {
        gameState.level++;
        const levelEl = document.getElementById('level');
        levelEl.classList.add('level-up');
        setTimeout(() => levelEl.classList.remove('level-up'), 800);
        showFeedback(`升级！进入第 ${gameState.level} 关`, true);
    }
    
    updateUI();
    
    if (gameState.currentMode === 'text') {
        document.getElementById('answerInput').value = '';
        setTimeout(() => {
            generatePuzzle();
        }, 500);
    } else {
        setTimeout(() => {
            generateDrawPuzzle();
        }, 500);
    }
}

function handleWrongAnswer(message) {
    gameState.combo = 0;
    gameState.wrongCount++;
    
    showFeedback(message, false);
    updateUI();
    
    if (gameState.wrongCount >= gameState.maxWrong) {
        gameOver();
    } else {
        if (gameState.currentMode === 'text') {
            document.getElementById('answerInput').value = '';
            setTimeout(() => {
                generatePuzzle();
            }, 1500);
        } else {
            setTimeout(() => {
                generateDrawPuzzle();
            }, 1500);
        }
    }
}

function useHint() {
    if (gameState.hints <= 0) return;
    
    gameState.hints--;
    updateUI();
    
    if (gameState.currentMode === 'text') {
        const hintElement = document.getElementById('puzzleHint');
        const answer = gameState.currentAnswer;
        let hintText = '提示：';
        
        for (let i = 0; i < answer.length; i++) {
            if (i === 0) {
                hintText += answer[i];
            } else {
                hintText += '？';
            }
        }
        
        hintElement.textContent = hintText;
        hintElement.style.color = '#f093fb';
        
        setTimeout(() => {
            hintElement.style.color = '#888';
        }, 3000);
    } else {
        const canvas = document.getElementById('referenceCanvas');
        canvas.style.boxShadow = '0 0 30px rgba(240, 147, 251, 0.8)';
        setTimeout(() => {
            canvas.style.boxShadow = '';
        }, 2000);
    }
}

function skipLevel() {
    gameState.combo = 0;
    gameState.wrongCount++;
    updateUI();
    
    if (gameState.currentMode === 'text') {
        showFeedback(`已跳过，正确答案是：${gameState.currentAnswer}`, false);
    } else {
        showFeedback('已跳过当前图案', false);
    }
    
    if (gameState.wrongCount >= gameState.maxWrong) {
        gameOver();
    } else {
        setTimeout(() => {
            if (gameState.currentMode === 'text') {
                generatePuzzle();
            } else {
                generateDrawPuzzle();
            }
        }, 1000);
    }
}

function gameOver() {
    document.getElementById('finalScore').textContent = gameState.score;
    document.getElementById('finalLevel').textContent = gameState.level;
    document.getElementById('gameOverModal').classList.remove('hidden');
}

function restartGame() {
    gameState.level = 1;
    gameState.score = 0;
    gameState.combo = 0;
    gameState.maxCombo = 0;
    gameState.hints = 3;
    gameState.currentAnswer = '';
    gameState.wrongCount = 0;
    
    document.getElementById('gameOverModal').classList.add('hidden');
    
    if (gameState.currentMode === 'text') {
        document.getElementById('answerInput').value = '';
        updateUI();
        generatePuzzle();
    } else {
        updateUI();
        generateDrawPuzzle();
    }
}

function initDrawMode() {
    const canvas = document.getElementById('drawCanvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = 200;
    canvas.height = 300;
    
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#f093fb';
    
    canvas.addEventListener('mousedown', startDrawing);
    canvas.addEventListener('mousemove', draw);
    canvas.addEventListener('mouseup', stopDrawing);
    canvas.addEventListener('mouseout', stopDrawing);
    
    canvas.addEventListener('touchstart', handleTouchStart);
    canvas.addEventListener('touchmove', handleTouchMove);
    canvas.addEventListener('touchend', stopDrawing);
    
    canvas.addEventListener('mouseup', calculateSymmetry);
    canvas.addEventListener('touchend', calculateSymmetry);
    
    document.getElementById('clearBtn').addEventListener('click', clearCanvas);
    document.getElementById('undoBtn').addEventListener('click', undoPath);
    document.getElementById('submitDrawBtn').addEventListener('click', submitDrawing);
}

function startDrawing(e) {
    drawState.isDrawing = true;
    const rect = e.target.getBoundingClientRect();
    drawState.lastX = e.clientX - rect.left;
    drawState.lastY = e.clientY - rect.top;
    drawState.currentPath = [{ x: drawState.lastX, y: drawState.lastY }];
}

function draw(e) {
    if (!drawState.isDrawing) return;
    
    const canvas = document.getElementById('drawCanvas');
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    ctx.beginPath();
    ctx.moveTo(drawState.lastX, drawState.lastY);
    ctx.lineTo(x, y);
    ctx.stroke();
    
    drawState.currentPath.push({ x, y });
    drawState.lastX = x;
    drawState.lastY = y;
}

function stopDrawing() {
    if (drawState.isDrawing && drawState.currentPath.length > 0) {
        drawState.allPaths.push([...drawState.currentPath]);
    }
    drawState.isDrawing = false;
    drawState.currentPath = [];
}

function handleTouchStart(e) {
    e.preventDefault();
    const touch = e.touches[0];
    const rect = e.target.getBoundingClientRect();
    drawState.isDrawing = true;
    drawState.lastX = touch.clientX - rect.left;
    drawState.lastY = touch.clientY - rect.top;
    drawState.currentPath = [{ x: drawState.lastX, y: drawState.lastY }];
}

function handleTouchMove(e) {
    e.preventDefault();
    if (!drawState.isDrawing) return;
    
    const touch = e.touches[0];
    const canvas = document.getElementById('drawCanvas');
    const ctx = canvas.getContext('2d');
    const rect = canvas.getBoundingClientRect();
    const x = touch.clientX - rect.left;
    const y = touch.clientY - rect.top;
    
    ctx.beginPath();
    ctx.moveTo(drawState.lastX, drawState.lastY);
    ctx.lineTo(x, y);
    ctx.stroke();
    
    drawState.currentPath.push({ x, y });
    drawState.lastX = x;
    drawState.lastY = y;
}

function clearCanvas() {
    const canvas = document.getElementById('drawCanvas');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    drawState.allPaths = [];
    drawState.currentPath = [];
    updateSymmetryDisplay(0);
}

function undoPath() {
    if (drawState.allPaths.length === 0) return;
    
    drawState.allPaths.pop();
    redrawCanvas();
    calculateSymmetry();
}

function redrawCanvas() {
    const canvas = document.getElementById('drawCanvas');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#f093fb';
    
    drawState.allPaths.forEach(path => {
        if (path.length < 2) return;
        ctx.beginPath();
        ctx.moveTo(path[0].x, path[0].y);
        for (let i = 1; i < path.length; i++) {
            ctx.lineTo(path[i].x, path[i].y);
        }
        ctx.stroke();
    });
}

function generatePattern(points, type) {
    const patterns = [];
    const centerX = 100;
    const centerY = 150;
    
    switch (type) {
        case 'triangle':
            for (let i = 0; i < points; i++) {
                const angle = (i / points) * Math.PI * 2 - Math.PI / 2;
                const r = 80 + Math.random() * 20;
                patterns.push({
                    x: centerX + Math.cos(angle) * r,
                    y: centerY + Math.sin(angle) * r
                });
            }
            break;
        case 'square':
            for (let i = 0; i < points; i++) {
                const t = i / points;
                const side = Math.floor(t * 4);
                const progress = (t * 4) % 1;
                let x, y;
                switch (side) {
                    case 0: x = centerX - 70 + progress * 140; y = centerY - 70; break;
                    case 1: x = centerX + 70; y = centerY - 70 + progress * 140; break;
                    case 2: x = centerX + 70 - progress * 140; y = centerY + 70; break;
                    case 3: x = centerX - 70; y = centerY + 70 - progress * 140; break;
                }
                patterns.push({ x: x + (Math.random() - 0.5) * 10, y: y + (Math.random() - 0.5) * 10 });
            }
            break;
        case 'circle':
            for (let i = 0; i < points; i++) {
                const angle = (i / points) * Math.PI * 2;
                const r = 70 + Math.random() * 10;
                patterns.push({
                    x: centerX + Math.cos(angle) * r,
                    y: centerY + Math.sin(angle) * r
                });
            }
            break;
        case 'heart':
            for (let i = 0; i < points; i++) {
                const t = (i / points) * Math.PI * 2;
                const x = 16 * Math.pow(Math.sin(t), 3);
                const y = -(13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t));
                patterns.push({
                    x: centerX + x * 4,
                    y: centerY + y * 4
                });
            }
            break;
        case 'star':
            for (let i = 0; i < points * 2; i++) {
                const angle = (i / (points * 2)) * Math.PI * 2 - Math.PI / 2;
                const r = i % 2 === 0 ? 80 : 35;
                patterns.push({
                    x: centerX + Math.cos(angle) * r,
                    y: centerY + Math.sin(angle) * r
                });
            }
            break;
        case 'diamond':
            for (let i = 0; i < points; i++) {
                const t = i / points;
                const side = Math.floor(t * 4);
                const progress = (t * 4) % 1;
                let x, y;
                switch (side) {
                    case 0: x = centerX; y = centerY - 80 + progress * 80; break;
                    case 1: x = centerX + progress * 80; y = centerY; break;
                    case 2: x = centerX + 80 - progress * 80; y = centerY + progress * 80; break;
                    case 3: x = centerX - progress * 80; y = centerY + 80 - progress * 80; break;
                }
                patterns.push({ x, y });
            }
            break;
        case 'arrow':
            patterns.push({ x: centerX - 50, y: centerY });
            patterns.push({ x: centerX + 30, y: centerY });
            patterns.push({ x: centerX + 10, y: centerY - 40 });
            patterns.push({ x: centerX + 50, y: centerY });
            patterns.push({ x: centerX + 10, y: centerY + 40 });
            patterns.push({ x: centerX + 30, y: centerY });
            break;
        case 'wave':
            for (let i = 0; i < points; i++) {
                const x = centerX - 80 + (i / points) * 160;
                const y = centerY + Math.sin((i / points) * Math.PI * 3) * 30;
                patterns.push({ x, y });
            }
            break;
        case 'zigzag':
            for (let i = 0; i < points; i++) {
                const x = centerX - 80 + (i / points) * 160;
                const y = centerY + (i % 2 === 0 ? -30 : 30);
                patterns.push({ x, y });
            }
            break;
        case 'spiral':
            for (let i = 0; i < points * 3; i++) {
                const angle = (i / 20) * Math.PI * 2;
                const r = (i / (points * 3)) * 70;
                patterns.push({
                    x: centerX + Math.cos(angle) * r,
                    y: centerY + Math.sin(angle) * r
                });
            }
            break;
        case 'cross':
            patterns.push({ x: centerX, y: centerY - 70 });
            patterns.push({ x: centerX, y: centerY + 70 });
            patterns.push({ x: centerX - 50, y: centerY });
            patterns.push({ x: centerX + 50, y: centerY });
            break;
        case 'crescent':
            for (let i = 0; i < points; i++) {
                const angle = (i / points) * Math.PI - Math.PI / 2;
                const r = 70;
                patterns.push({
                    x: centerX + Math.cos(angle) * r,
                    y: centerY + Math.sin(angle) * r
                });
            }
            for (let i = points - 1; i >= 0; i--) {
                const angle = (i / points) * Math.PI - Math.PI / 2;
                const r = 50;
                patterns.push({
                    x: centerX + 20 + Math.cos(angle) * r,
                    y: centerY + Math.sin(angle) * r
                });
            }
            break;
        case 'leaf':
            for (let i = 0; i < points; i++) {
                const t = i / points;
                const angle = t * Math.PI;
                const r = 60 * Math.sin(angle);
                patterns.push({
                    x: centerX + Math.cos(angle) * r,
                    y: centerY - 50 + t * 100
                });
            }
            break;
        case 'mountain':
            patterns.push({ x: centerX - 80, y: centerY + 60 });
            patterns.push({ x: centerX - 30, y: centerY - 40 });
            patterns.push({ x: centerX + 20, y: centerY + 20 });
            patterns.push({ x: centerX + 50, y: centerY - 60 });
            patterns.push({ x: centerX + 80, y: centerY + 60 });
            break;
        case 'house':
            patterns.push({ x: centerX - 60, y: centerY + 60 });
            patterns.push({ x: centerX - 60, y: centerY - 10 });
            patterns.push({ x: centerX, y: centerY - 60 });
            patterns.push({ x: centerX + 60, y: centerY - 10 });
            patterns.push({ x: centerX + 60, y: centerY + 60 });
            patterns.push({ x: centerX - 60, y: centerY + 60 });
            patterns.push({ x: centerX - 20, y: centerY + 60 });
            patterns.push({ x: centerX - 20, y: centerY + 10 });
            patterns.push({ x: centerX + 20, y: centerY + 10 });
            patterns.push({ x: centerX + 20, y: centerY + 60 });
            break;
        case 'tree':
            patterns.push({ x: centerX, y: centerY - 80 });
            patterns.push({ x: centerX - 50, y: centerY });
            patterns.push({ x: centerX - 25, y: centerY });
            patterns.push({ x: centerX - 40, y: centerY + 40 });
            patterns.push({ x: centerX - 15, y: centerY + 40 });
            patterns.push({ x: centerX - 15, y: centerY + 70 });
            patterns.push({ x: centerX + 15, y: centerY + 70 });
            patterns.push({ x: centerX + 15, y: centerY + 40 });
            patterns.push({ x: centerX + 40, y: centerY + 40 });
            patterns.push({ x: centerX + 25, y: centerY });
            patterns.push({ x: centerX + 50, y: centerY });
            patterns.push({ x: centerX, y: centerY - 80 });
            break;
        case 'fish':
            for (let i = 0; i < points; i++) {
                const angle = (i / points) * Math.PI * 2;
                const rx = 60, ry = 35;
                patterns.push({
                    x: centerX - 10 + Math.cos(angle) * rx,
                    y: centerY + Math.sin(angle) * ry
                });
            }
            patterns.push({ x: centerX + 50, y: centerY });
            patterns.push({ x: centerX + 80, y: centerY - 30 });
            patterns.push({ x: centerX + 80, y: centerY + 30 });
            patterns.push({ x: centerX + 50, y: centerY });
            break;
        case 'butterfly':
            for (let i = 0; i < points; i++) {
                const t = i / points;
                const angle = t * Math.PI;
                const r = 50 + 30 * Math.sin(angle * 2);
                patterns.push({
                    x: centerX - 20 - Math.cos(angle) * r,
                    y: centerY + Math.sin(angle) * r * 0.8
                });
            }
            patterns.push({ x: centerX, y: centerY - 50 });
            patterns.push({ x: centerX, y: centerY + 50 });
            for (let i = points - 1; i >= 0; i--) {
                const t = i / points;
                const angle = t * Math.PI;
                const r = 50 + 30 * Math.sin(angle * 2);
                patterns.push({
                    x: centerX + 20 + Math.cos(angle) * r,
                    y: centerY + Math.sin(angle) * r * 0.8
                });
            }
            break;
        case 'flower':
            const petals = 6;
            for (let p = 0; p < petals; p++) {
                const baseAngle = (p / petals) * Math.PI * 2;
                for (let i = 0; i < Math.floor(points / petals); i++) {
                    const t = i / Math.floor(points / petals);
                    const angle = baseAngle + (t - 0.5) * Math.PI * 0.5;
                    const r = 20 + 40 * Math.sin(t * Math.PI);
                    patterns.push({
                        x: centerX + Math.cos(angle) * r,
                        y: centerY + Math.sin(angle) * r
                    });
                }
            }
            break;
        case 'cloud':
            patterns.push({ x: centerX - 70, y: centerY + 20 });
            patterns.push({ x: centerX - 60, y: centerY - 20 });
            patterns.push({ x: centerX - 30, y: centerY - 40 });
            patterns.push({ x: centerX, y: centerY - 30 });
            patterns.push({ x: centerX + 30, y: centerY - 50 });
            patterns.push({ x: centerX + 60, y: centerY - 30 });
            patterns.push({ x: centerX + 70, y: centerY + 10 });
            patterns.push({ x: centerX + 50, y: centerY + 30 });
            patterns.push({ x: centerX - 50, y: centerY + 30 });
            patterns.push({ x: centerX - 70, y: centerY + 20 });
            break;
        default:
            for (let i = 0; i < points; i++) {
                const angle = (i / points) * Math.PI * 2;
                const r = 60 + Math.random() * 20;
                patterns.push({
                    x: centerX + Math.cos(angle) * r,
                    y: centerY + Math.sin(angle) * r
                });
            }
    }
    
    return patterns;
}

function generateDrawPuzzle() {
    const config = levelConfig[Math.min(gameState.level, 15)];
    drawState.targetSymmetry = config.targetSymmetry;
    
    const refCanvas = document.getElementById('referenceCanvas');
    const refCtx = refCanvas.getContext('2d');
    const drawCanvas = document.getElementById('drawCanvas');
    const drawCtx = drawCanvas.getContext('2d');
    
    refCanvas.width = 200;
    refCanvas.height = 300;
    drawCanvas.width = 200;
    drawCanvas.height = 300;
    
    drawCtx.clearRect(0, 0, drawCanvas.width, drawCanvas.height);
    drawState.allPaths = [];
    drawState.currentPath = [];
    
    drawCtx.lineCap = 'round';
    drawCtx.lineJoin = 'round';
    drawCtx.lineWidth = 4;
    drawCtx.strokeStyle = '#f093fb';
    
    const complexityMultiplier = config.patternComplexity;
    const availablePatterns = patternTemplates.filter(p => p.complexity <= complexityMultiplier);
    const selectedPattern = availablePatterns[Math.floor(Math.random() * availablePatterns.length)];
    drawState.currentPattern = selectedPattern;
    
    const pointCount = Math.min(8 + gameState.level * 2, 30);
    const patternPoints = generatePattern(pointCount, selectedPattern.type);
    
    refCtx.clearRect(0, 0, refCanvas.width, refCanvas.height);
    refCtx.lineCap = 'round';
    refCtx.lineJoin = 'round';
    refCtx.lineWidth = 3;
    refCtx.strokeStyle = 'rgba(240, 147, 251, 0.8)';
    refCtx.setLineDash([5, 5]);
    
    if (patternPoints.length > 1) {
        refCtx.beginPath();
        refCtx.moveTo(patternPoints[0].x, patternPoints[0].y);
        for (let i = 1; i < patternPoints.length; i++) {
            refCtx.lineTo(patternPoints[i].x, patternPoints[i].y);
        }
        if (['triangle', 'square', 'circle', 'diamond', 'cross', 'house', 'fish', 'flower', 'cloud'].includes(selectedPattern.type)) {
            refCtx.closePath();
        }
        refCtx.stroke();
    }
    
    refCtx.setLineDash([]);
    refCtx.fillStyle = '#f093fb';
    patternPoints.forEach(point => {
        refCtx.beginPath();
        refCtx.arc(point.x, point.y, 3, 0, Math.PI * 2);
        refCtx.fill();
    });
    
    drawState.targetPoints = patternPoints;
    
    updateSymmetryDisplay(0);
    document.getElementById('targetPercent').textContent = config.targetSymmetry;
}

function calculateSymmetry() {
    const canvas = document.getElementById('drawCanvas');
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    if (drawState.allPaths.length === 0) {
        updateSymmetryDisplay(0);
        return 0;
    }
    
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
    
    let matchCount = 0;
    let totalDrawnPixels = 0;
    const tolerance = 3;
    
    for (let y = 0; y < height; y++) {
        for (let x = 0; x < width / 2; x++) {
            const idx = (y * width + x) * 4;
            const mirrorX = width - 1 - x;
            const mirrorIdx = (y * width + mirrorX) * 4;
            
            const isDrawn = data[idx + 3] > 50;
            const isMirrorDrawn = data[mirrorIdx + 3] > 50;
            
            if (isDrawn) {
                totalDrawnPixels++;
                
                if (isMirrorDrawn) {
                    matchCount++;
                } else {
                    let foundMatch = false;
                    for (let dy = -tolerance; dy <= tolerance && !foundMatch; dy++) {
                        for (let dx = -tolerance; dx <= tolerance && !foundMatch; dx++) {
                            const checkY = y + dy;
                            const checkX = mirrorX + dx;
                            if (checkY >= 0 && checkY < height && checkX >= 0 && checkX < width) {
                                const checkIdx = (checkY * width + checkX) * 4;
                                if (data[checkIdx + 3] > 50) {
                                    foundMatch = true;
                                }
                            }
                        }
                    }
                    if (foundMatch) {
                        matchCount++;
                    }
                }
            }
        }
    }
    
    const symmetryPercent = totalDrawnPixels > 0 ? Math.round((matchCount / totalDrawnPixels) * 100) : 0;
    updateSymmetryDisplay(symmetryPercent);
    
    return symmetryPercent;
}

function updateSymmetryDisplay(percent) {
    document.getElementById('symmetryPercent').textContent = percent;
    const progressBar = document.getElementById('symmetryProgress');
    progressBar.style.width = `${percent}%`;
    
    if (percent >= drawState.targetSymmetry) {
        progressBar.style.background = 'linear-gradient(90deg, #4ade80 0%, #22c55e 100%)';
    } else {
        progressBar.style.background = `linear-gradient(90deg, ${percent < 30 ? '#f87171' : percent < 60 ? '#fbbf24' : '#4ade80'} 0%, ${percent < 30 ? '#ef4444' : percent < 60 ? '#f59e0b' : '#22c55e'} 100%)`;
    }
}

function submitDrawing() {
    const symmetryPercent = calculateSymmetry();
    const config = levelConfig[Math.min(gameState.level, 15)];
    
    if (drawState.allPaths.length === 0) {
        showFeedback('请先绘制图案！', false);
        return;
    }
    
    if (symmetryPercent >= config.targetSymmetry) {
        handleCorrectAnswer();
    } else {
        handleWrongAnswer(`对称度不足！当前: ${symmetryPercent}%，目标: ${config.targetSymmetry}%`);
    }
}

function switchMode(mode) {
    gameState.currentMode = mode;
    gameState.wrongCount = 0;
    
    document.getElementById('modeText').classList.toggle('active', mode === 'text');
    document.getElementById('modeDraw').classList.toggle('active', mode === 'draw');
    document.getElementById('textMode').classList.toggle('hidden', mode !== 'text');
    document.getElementById('drawMode').classList.toggle('hidden', mode !== 'draw');
    
    updateUI();
    
    if (mode === 'text') {
        generatePuzzle();
        document.getElementById('answerInput').focus();
    } else {
        generateDrawPuzzle();
    }
}

function initEventListeners() {
    document.getElementById('submitBtn').addEventListener('click', checkAnswer);
    document.getElementById('answerInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') checkAnswer();
    });
    document.getElementById('hintBtn').addEventListener('click', useHint);
    document.getElementById('skipBtn').addEventListener('click', skipLevel);
    document.getElementById('restartBtn').addEventListener('click', restartGame);
    
    document.getElementById('modeText').addEventListener('click', () => switchMode('text'));
    document.getElementById('modeDraw').addEventListener('click', () => switchMode('draw'));
}

function initGame() {
    initEventListeners();
    initDrawMode();
    updateUI();
    generatePuzzle();
    document.getElementById('answerInput').focus();
}

document.addEventListener('DOMContentLoaded', initGame);
