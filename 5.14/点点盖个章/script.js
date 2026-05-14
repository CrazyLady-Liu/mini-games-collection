通关 & 关卡递进模块
自由盖章拼成接近目标图案 → 自动判定完成，平滑跳转下一关
关卡难度：从简单单点图案 → 多印章组合图案，样式更丰富
通关动效：画布柔和发光、细碎光斑，过渡自然// 游戏状态
let gameState = {
    selectedStamp: null,
    stamps: [],
    isPressing: false,
    referenceVisible: false,
    currentLevel: 0
};

// 目标图案数据
const targetPatterns = [
    {
        name: "小花",
        elements: [
            { type: "flower", x: 100, y: 100 },
            { type: "flower", x: 150, y: 120 },
            { type: "flower", x: 200, y: 100 }
        ]
    },
    {
        name: "笑脸",
        elements: [
            { type: "smile", x: 150, y: 100 }
        ]
    },
    {
        name: "爱心组合",
        elements: [
            { type: "heart", x: 100, y: 100 },
            { type: "heart", x: 150, y: 80 },
            { type: "heart", x: 200, y: 100 }
        ]
    },
    {
        name: "云朵群",
        elements: [
            { type: "cloud", x: 100, y: 80 },
            { type: "cloud", x: 180, y: 100 },
            { type: "cloud", x: 260, y: 80 }
        ]
    }
];

// 印章SVG数据
const stampSVGs = {
    flower: `<svg width="60" height="60" viewBox="0 0 60 60">
                <circle cx="30" cy="30" r="20" fill="#ff9e9e"/>
                <circle cx="30" cy="20" r="5" fill="#ff6b6b"/>
                <circle cx="40" cy="30" r="5" fill="#ff6b6b"/>
                <circle cx="30" cy="40" r="5" fill="#ff6b6b"/>
                <circle cx="20" cy="30" r="5" fill="#ff6b6b"/>
                <circle cx="26" cy="26" r="5" fill="#ff6b6b"/>
                <circle cx="34" cy="26" r="5" fill="#ff6b6b"/>
                <circle cx="26" cy="34" r="5" fill="#ff6b6b"/>
                <circle cx="34" cy="34" r="5" fill="#ff6b6b"/>
            </svg>`,
    smile: `<svg width="60" height="60" viewBox="0 0 60 60">
                <circle cx="30" cy="30" r="20" fill="#ffd93d"/>
                <circle cx="24" cy="25" r="3" fill="#333"/>
                <circle cx="36" cy="25" r="3" fill="#333"/>
                <path d="M20,35 Q30,45 40,35" stroke="#333" stroke-width="3" fill="none"/>
            </svg>`,
    heart: `<svg width="60" height="60" viewBox="0 0 60 60">
                <path d="M30,10 Q35,5 40,15 Q45,5 50,15 Q55,25 45,35 Q40,45 30,40 Q20,45 15,35 Q5,25 10,15 Q15,5 20,15 Q25,5 30,10" fill="#ff6b6b"/>
            </svg>`,
    cloud: `<svg width="60" height="60" viewBox="0 0 60 60">
                <circle cx="25" cy="35" r="10" fill="#e0e0e0"/>
                <circle cx="35" cy="30" r="12" fill="#e0e0e0"/>
                <circle cx="45" cy="35" r="10" fill="#e0e0e0"/>
                <rect x="15" y="35" width="35" height="10" fill="#e0e0e0"/>
            </svg>`
};

// 初始化游戏
function initGame() {
    setupEventListeners();
    loadTargetPattern();
}

// 设置事件监听器
function setupEventListeners() {
    // 印章选择
    document.querySelectorAll('.stamp').forEach(stamp => {
        stamp.addEventListener('click', () => {
            selectStamp(stamp.dataset.stamp);
        });
    });
    
    // 画布操作
    const canvas = document.getElementById('canvas');
    canvas.addEventListener('mousedown', handleMouseDown);
    canvas.addEventListener('mouseup', handleMouseUp);
    canvas.addEventListener('mousemove', handleMouseMove);
    
    // 撤销按钮
    document.getElementById('undoBtn').addEventListener('click', undo);
    
    // 清空按钮
    document.getElementById('clearBtn').addEventListener('click', clearCanvas);
    
    // 参考图切换
    document.getElementById('toggleReference').addEventListener('click', toggleReference);
}

// 选择印章
function selectStamp(stampType) {
    gameState.selectedStamp = stampType;
    
    // 更新UI
    document.querySelectorAll('.stamp').forEach(stamp => {
        if (stamp.dataset.stamp === stampType) {
            stamp.classList.add('selected');
        } else {
            stamp.classList.remove('selected');
        }
    });
}

// 处理鼠标按下
function handleMouseDown(e) {
    if (!gameState.selectedStamp) return;
    
    gameState.isPressing = true;
    createStampImpression(e);
}

// 处理鼠标松开
function handleMouseUp() {
    gameState.isPressing = false;
    
    // 移除所有按压效果
    document.querySelectorAll('.stamp-pressing').forEach(el => {
        el.classList.remove('stamp-pressing');
    });
}

// 处理鼠标移动
function handleMouseMove(e) {
    if (gameState.isPressing && gameState.selectedStamp) {
        createStampImpression(e);
    }
}

// 创建印章印记
function createStampImpression(e) {
    const canvas = document.getElementById('canvas');
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left - 30; // 30是印章宽度的一半
    const y = e.clientY - rect.top - 30;  // 30是印章高度的一半
    
    // 创建印章元素
    const stampImpression = document.createElement('div');
    stampImpression.className = 'stamp-impression stamp-pressing';
    stampImpression.style.left = `${x}px`;
    stampImpression.style.top = `${y}px`;
    stampImpression.innerHTML = stampSVGs[gameState.selectedStamp];
    
    // 添加到画布
    canvas.appendChild(stampImpression);
    
    // 记录印章
    gameState.stamps.push(stampImpression);
    
    // 移除按压效果
    setTimeout(() => {
        stampImpression.classList.remove('stamp-pressing');
    }, 200);
}

// 撤销操作
function undo() {
    if (gameState.stamps.length > 0) {
        const lastStamp = gameState.stamps.pop();
        if (lastStamp && lastStamp.parentNode) {
            lastStamp.parentNode.removeChild(lastStamp);
        }
    }
}

// 清空画布
function clearCanvas() {
    const canvas = document.getElementById('canvas');
    canvas.innerHTML = '';
    gameState.stamps = [];
}

// 切换参考图显示
function toggleReference() {
    gameState.referenceVisible = !gameState.referenceVisible;
    const targetPattern = document.getElementById('targetPattern');
    const toggleBtn = document.getElementById('toggleReference');
    
    if (gameState.referenceVisible) {
        targetPattern.classList.add('visible');
        toggleBtn.textContent = '隐藏参考图';
    } else {
        targetPattern.classList.remove('visible');
        toggleBtn.textContent = '显示参考图';
    }
}

// 加载目标图案
function loadTargetPattern() {
    const targetPattern = document.getElementById('targetPattern');
    targetPattern.innerHTML = '';
    
    const currentPattern = targetPatterns[gameState.currentLevel];
    
    currentPattern.elements.forEach(element => {
        const stamp = document.createElement('div');
        stamp.className = 'stamp-impression';
        stamp.style.left = `${element.x}px`;
        stamp.style.top = `${element.y}px`;
        stamp.innerHTML = stampSVGs[element.type];
        targetPattern.appendChild(stamp);
    });
}

// 初始化游戏
initGame();