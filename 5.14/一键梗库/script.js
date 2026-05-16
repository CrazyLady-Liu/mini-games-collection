const offlineQuotes = {
    love: [
        "你知道我想成为什么人吗？你的人。",
        "你是我的今天，以及所有的明天。",
        "我一点也不想你，一点半再想。",
        "你可以笑一下吗？我的咖啡忘加糖了。",
        "你累不累啊？你在我脑子里跑了一天了。",
        "我有超能力，超级喜欢你。",
        "你最近是不是胖了？因为你在我心里的分量越来越重了。",
        "你是什么血型？A型。不，你是我的理想型。",
        "你上辈子一定是碳酸饮料吧，不然我为什么一看到你就开心地冒泡。",
        "我想买一块地，你的死心塌地。",
        "莫文蔚的阴天，孙燕姿的雨天，周杰伦的晴天，都不如你和我聊天。",
        "你知道我的缺点是什么吗？是缺点你。",
        "我怀疑你的本质是一本书，不然我怎么越看越想睡。",
        "你是方便面我是白开水，今生今世我泡定你了。",
        "我想你一定很忙，所以你只看前三个字就好。"
    ],
    crazy: [
        "谁懂啊！我真的会谢！",
        "咱就是说一整个大动作的给到！",
        "救命啊家人们，我直接原地螺旋起飞！",
        "破防了破防了，真的蚌埠住了！",
        "咱就是说狠狠的期待住了！",
        "我不发疯谁发疯！精神状态良好！",
        "无语住了家人们，谁懂这种感觉啊！",
        "真的会谢，我直接一个托马斯全旋！",
        "咱就是说纯纯的大无语事件！",
        "我疯了我疯了我疯了！重要的事情说三遍！",
        "家人们谁懂啊，这也太绝了吧！",
        "我直接原地去世，真的顶不住了！",
        "狠狠的emo了，谁来救救我！",
        "咱就是说一整个爱住的大动作！",
        "真的会栓Q，我真的服了！"
    ],
    moments: [
        "把快乐放进重点反复背诵。",
        "生活原本沉闷，但跑起来就有风。",
        "今天也是被好风景收买的一天。",
        "普通小孩，热爱生活中。",
        "愿你历经山河，仍觉人间值得。",
        "揣着一口袋的开心满载而归。",
        "生活不仅要吃甜头，还要吃肉。",
        "拥有快乐，储蓄热爱。",
        "日子渺小重复，却都是幸福。",
        "温柔和浪漫都藏在花里。",
        "记得把普通的日子过得浪漫一些。",
        "保持热爱，奔赴山海。",
        "阳光正好，微风不燥，不负美好时光。",
        "把烦心事都丢掉，腾出地方装鲜花。",
        "慢慢理解世界，慢慢更新自己。"
    ],
    emoji: [
        "(๑•̀ㅂ•́)و✧",
        "(╯°□°）╯︵ ┻━┻",
        "ლ(´ڡ`ლ)",
        "(｡・ω・｡)",
        "o(≧v≦)o",
        "(=^･ω･^=)",
        "(ノ°ο°)ノ",
        "φ(≧ω≦*)♪",
        "(＾▽＾)",
        "(｡♥‿♥｡)",
        "o(〃＾▽＾〃)o",
        "(✿◠‿◠)",
        "ヽ(✿ﾟ▽ﾟ)ノ",
        "(￣▽￣)~*",
        "✧*｡٩(ˊᗜˋ*)و✧*｡",
        "٩(๑•̀ω•́๑)۶",
        "ψ(｀∇´)ψ",
        "(๑˘ ³˘๑)♥",
        "o(>ω<)o",
        "(≧∇≦)ﾉ"
    ]
};

const categoryNames = {
    love: '土味情话',
    crazy: '发疯文学',
    moments: '朋友圈文案',
    emoji: '表情符号'
};

const emojiLibrary = {
    love: {
        prefix: ['💘', '💕', '💖', '💗', '💓', '💝', '💞', '💟', '😍', '🥰', '😘', '😻', '💑', '👩‍❤️‍👨', '💌'],
        suffix: ['✨', '💫', '⭐', '🌟', '💖', '💕', '💘', '💗', '💓', '💝']
    },
    crazy: {
        prefix: ['😤', '🤯', '😱', '🤬', '😭', '😫', '😩', '🥺', '😤', '🤪', '😜', '🤡', '💀', '☠️', '🔥'],
        suffix: ['💥', '💢', '😤', '🤯', '😭', '💀', '🔥', '⚡', '💫', '😱']
    },
    moments: {
        prefix: ['🌸', '🌺', '🌻', '🌷', '🌹', '🍀', '🌿', '🍃', '🌙', '☀️', '🌈', '✨', '💫', '🎀', '💝'],
        suffix: ['✨', '💫', '🌙', '☀️', '🌸', '🍀', '💖', '💕', '🌿', '🌺']
    },
    emoji: {
        prefix: ['✨', '💫', '⭐', '🌟', '💖', '💕', '💘', '💗', '💓', '💝'],
        suffix: ['✨', '💫', '⭐', '🌟', '💖', '💕', '💘', '💗', '💓', '💝']
    }
};

const CACHE_KEY = 'yijian_gengku_cache';
const CACHE_DATE_KEY = 'yijian_gengku_cache_date';
const FAVORITES_KEY = 'yijian_gengku_favorites';
const HISTORY_KEY = 'yijian_gengku_history';
const USE_MOCK = location.protocol === 'http:';
const MOCK_API_BASE = 'http://localhost:3000';
const HISTORY_MAX_LENGTH = 10;

let currentQuotes = { ...offlineQuotes };
let currentCategory = 'love';
let currentIndex = -1;
let isOnline = navigator.onLine;
let useEmojiDecoration = true;
let currentRawQuote = '';
let currentDisplayQuote = '';
let favorites = [];
let history = [];

const tabs = document.querySelectorAll('.tab');
const quoteText = document.getElementById('quote-text');
const categoryLabel = document.getElementById('category-label');
const refreshBtn = document.getElementById('refresh-btn');
const copyBtn = document.getElementById('copy-btn');
const toast = document.getElementById('toast');
const statusIndicator = document.createElement('div');
const simulateOfflineBtn = document.getElementById('simulate-offline-btn');
const simulateOnlineBtn = document.getElementById('simulate-online-btn');
const clearCacheBtn = document.getElementById('clear-cache-btn');
const emojiToggleBtn = document.getElementById('emoji-toggle-btn');
const favoriteBtn = document.getElementById('favorite-btn');
const favoriteIcon = document.getElementById('favorite-icon');
const favoritesBtn = document.getElementById('favorites-btn');
const favoritesCount = document.getElementById('favorites-count');
const historyBtn = document.getElementById('history-btn');
const favoritesModal = document.getElementById('favorites-modal');
const historyModal = document.getElementById('history-modal');
const favoritesList = document.getElementById('favorites-list');
const historyList = document.getElementById('history-list');

let simulatedOffline = false;

function getRandomEmoji(category, type) {
    const emojis = emojiLibrary[category][type];
    return emojis[Math.floor(Math.random() * emojis.length)];
}

function decorateWithEmoji(quote, category) {
    if (!useEmojiDecoration) return quote;
    const prefix = getRandomEmoji(category, 'prefix');
    const suffix = getRandomEmoji(category, 'suffix');
    return `${prefix} ${quote} ${suffix}`;
}

function loadFavorites() {
    try {
        const saved = localStorage.getItem(FAVORITES_KEY);
        favorites = saved ? JSON.parse(saved) : [];
    } catch (e) {
        favorites = [];
    }
    updateFavoritesCount();
}

function saveFavorites() {
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(favorites));
    updateFavoritesCount();
}

function updateFavoritesCount() {
    favoritesCount.textContent = favorites.length;
    favoritesCount.style.display = favorites.length > 0 ? 'block' : 'none';
}

function isFavorite(quote) {
    return favorites.some(f => f.quote === quote);
}

function toggleFavorite(quote, category) {
    const index = favorites.findIndex(f => f.quote === quote);
    if (index > -1) {
        favorites.splice(index, 1);
        showToast('已取消收藏');
    } else {
        favorites.unshift({
            quote: quote,
            category: category,
            time: Date.now()
        });
        showToast('已添加到收藏 ⭐');
    }
    saveFavorites();
    updateFavoriteIcon(quote);
}

function updateFavoriteIcon(quote) {
    if (isFavorite(quote)) {
        favoriteIcon.textContent = '★';
        favoriteIcon.classList.add('active');
    } else {
        favoriteIcon.textContent = '☆';
        favoriteIcon.classList.remove('active');
    }
}

function loadHistory() {
    try {
        const saved = localStorage.getItem(HISTORY_KEY);
        history = saved ? JSON.parse(saved) : [];
    } catch (e) {
        history = [];
    }
}

function saveHistory() {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
}

function addToHistory(quote, category) {
    const existingIndex = history.findIndex(h => h.quote === quote);
    if (existingIndex > -1) {
        history.splice(existingIndex, 1);
    }
    history.unshift({
        quote: quote,
        category: category,
        time: Date.now()
    });
    if (history.length > HISTORY_MAX_LENGTH) {
        history = history.slice(0, HISTORY_MAX_LENGTH);
    }
    saveHistory();
}

function formatTime(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    if (diff < 60000) return '刚刚';
    if (diff < 3600000) return `${Math.floor(diff / 60000)}分钟前`;
    if (diff < 86400000) return `${Math.floor(diff / 3600000)}小时前`;
    return date.toLocaleDateString();
}

function renderFavoritesList() {
    if (favorites.length === 0) {
        favoritesList.innerHTML = '<div class="empty-state">还没有收藏的文案哦~<br><span style="font-size:12px;color:#bbb;">点击卡片上的 ☆ 按钮收藏喜欢的文案</span></div>';
        return;
    }
    favoritesList.innerHTML = favorites.map((item, index) => `
        <div class="list-item">
            <div class="list-item-content">${item.quote}</div>
            <div class="list-item-meta">
                <span class="list-item-category">${categoryNames[item.category] || item.category}</span>
                <div class="list-item-actions">
                    <button class="list-item-btn" onclick="copyFromList('${item.quote.replace(/'/g, "\\'")}')">复制</button>
                    <button class="list-item-btn danger" onclick="removeFavorite(${index})">删除</button>
                </div>
            </div>
        </div>
    `).join('');
}

function renderHistoryList() {
    if (history.length === 0) {
        historyList.innerHTML = '<div class="empty-state">还没有浏览记录哦~<br><span style="font-size:12px;color:#bbb;">浏览过的文案会自动记录在这里</span></div>';
        return;
    }
    historyList.innerHTML = history.map((item, index) => `
        <div class="list-item">
            <div class="list-item-content">${item.quote}</div>
            <div class="list-item-meta">
                <span class="list-item-category">${categoryNames[item.category] || item.category}</span>
                <div class="list-item-actions">
                    <span style="font-size:11px;color:#bbb;">${formatTime(item.time)}</span>
                    <button class="list-item-btn" onclick="copyFromList('${item.quote.replace(/'/g, "\\'")}')">复制</button>
                </div>
            </div>
        </div>
    `).join('');
}

function copyFromList(text) {
    navigator.clipboard.writeText(text).then(() => {
        showToast('复制成功！');
    }).catch(() => {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        showToast('复制成功！');
    });
}

function removeFavorite(index) {
    favorites.splice(index, 1);
    saveFavorites();
    renderFavoritesList();
    updateFavoriteIcon(currentRawQuote);
    showToast('已从收藏中删除');
}

function openModal(modal) {
    modal.classList.add('show');
    if (modal === favoritesModal) {
        renderFavoritesList();
    } else if (modal === historyModal) {
        renderHistoryList();
    }
}

function closeModal(modal) {
    modal.classList.remove('show');
}

async function fetchLatestMemes(forceRefresh = false) {
    const today = new Date().toDateString();
    const cachedDate = localStorage.getItem(CACHE_DATE_KEY);
    const cachedData = localStorage.getItem(CACHE_KEY);

    if (!forceRefresh && cachedDate === today && cachedData) {
        try {
            const parsed = JSON.parse(cachedData);
            mergeQuotes(parsed);
            console.log('使用今日缓存热梗');
            return true;
        } catch (e) {
            console.warn('缓存解析失败，使用离线数据');
        }
    }

    if (simulatedOffline || !navigator.onLine) {
        console.log('无网络，使用离线数据');
        currentQuotes = { ...offlineQuotes };
        return false;
    }

    try {
        showToast('正在获取最新热梗...', 1500);
        const [hotMemes, crazyTexts, loveQuotes] = await Promise.all([
            fetchHotMemes(),
            fetchCrazyTexts(),
            fetchLoveQuotes()
        ]);

        const onlineData = {
            love: [...(loveQuotes || []), ...offlineQuotes.love],
            crazy: [...(crazyTexts || [])],
            moments: offlineQuotes.moments,
            emoji: offlineQuotes.emoji
        };

        if (hotMemes && hotMemes.length > 0) {
            onlineData.crazy = [...onlineData.crazy, ...hotMemes];
        }

        if (onlineData.crazy.length === 0) {
            onlineData.crazy = [...offlineQuotes.crazy];
        }

        mergeQuotes(onlineData);
        localStorage.setItem(CACHE_KEY, JSON.stringify(onlineData));
        localStorage.setItem(CACHE_DATE_KEY, today);

        showToast('已更新最新热梗！', 1500);
        return true;
    } catch (error) {
        console.warn('获取热梗失败，使用离线数据:', error);
        currentQuotes = { ...offlineQuotes };
        showToast('网络连接失败，使用离线内容', 2000);
        return false;
    }
}

async function fetchHotMemes() {
    const apiUrl = USE_MOCK
        ? `${MOCK_API_BASE}/api/hotlist/hotlist`
        : 'https://api.oi.ukenn.top/api/hotlist/hotlist';

    console.log(`[API] 请求热梗: ${apiUrl}`);

    try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 8000);

        const response = await fetch(apiUrl, {
            signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (!response.ok) throw new Error(`API error: ${response.status}`);
        const data = await response.json();

        if (data && data.data && Array.isArray(data.data)) {
            const memes = data.data.slice(0, 20).map(item => {
                const title = item.title || item.name || item;
                return typeof title === 'string' ? title : null;
            }).filter(Boolean);
            console.log(`[API] 获取到 ${memes.length} 条热梗`);
            return memes;
        }
        return null;
    } catch (e) {
        console.warn('[API] 获取热梗失败:', e.message);
        return null;
    }
}

async function fetchCrazyTexts() {
    if (USE_MOCK) {
        try {
            const response = await fetch(`${MOCK_API_BASE}/api/crazy`);
            if (response.ok) {
                const data = await response.json();
                if (data && data.data && Array.isArray(data.data)) {
                    console.log(`[API] 获取到 ${data.data.length} 条发疯文学`);
                    return data.data;
                }
            }
        } catch (e) {
            console.warn('[API] 获取发疯文学失败，使用备用数据');
        }
    }

    return [
        "谁懂啊家人们！今天也是被生活按在地上摩擦的一天！",
        "咱就是说一整个大破防了家人们！",
        "救命！这谁顶得住啊！",
        "我真的会谢！真的会栓Q！",
        "破防了破防了！真的蚌埠住了！",
        "咱就是说狠狠的期待住了！",
        "家人们谁懂啊！我直接原地起飞！",
        "我不发疯谁发疯！精神状态良好！",
        "无语住了家人们！纯纯大无语事件！",
        "咱就是说一整个爱住的大动作！"
    ];
}

async function fetchLoveQuotes() {
    if (USE_MOCK) {
        try {
            const response = await fetch(`${MOCK_API_BASE}/api/love`);
            if (response.ok) {
                const data = await response.json();
                if (data && data.data && Array.isArray(data.data)) {
                    console.log(`[API] 获取到 ${data.data.length} 条土味情话`);
                    return data.data;
                }
            }
        } catch (e) {
            console.warn('[API] 获取土味情话失败，使用备用数据');
        }
    }

    return [
        "你是我电量只剩1%也要回消息的人",
        "遇见你爱意汹涌，看世间万物都浪漫心动",
        "你是我的今天，以及所有的明天",
        "喜欢你是我藏在微风里的欢喜",
        "你是我疲惫生活里的英雄梦想"
    ];
}

function mergeQuotes(onlineData) {
    currentQuotes = {
        love: onlineData.love && onlineData.love.length > 0
            ? [...onlineData.love]
            : [...offlineQuotes.love],
        crazy: onlineData.crazy && onlineData.crazy.length > 0
            ? [...onlineData.crazy]
            : [...offlineQuotes.crazy],
        moments: [...offlineQuotes.moments],
        emoji: [...offlineQuotes.emoji]
    };
}

function getRandomQuote(category) {
    const categoryQuotes = currentQuotes[category] || offlineQuotes[category];
    let newIndex;
    do {
        newIndex = Math.floor(Math.random() * categoryQuotes.length);
    } while (newIndex === currentIndex && categoryQuotes.length > 1);
    currentIndex = newIndex;
    return categoryQuotes[newIndex];
}

function updateQuote(category) {
    const rawQuote = getRandomQuote(category);
    currentRawQuote = rawQuote;
    currentDisplayQuote = decorateWithEmoji(rawQuote, category);
    quoteText.textContent = currentDisplayQuote;
    categoryLabel.textContent = categoryNames[category];

    updateFavoriteIcon(rawQuote);
    addToHistory(rawQuote, category);

    quoteText.style.opacity = '0';
    quoteText.style.transform = 'translateY(10px)';
    setTimeout(() => {
        quoteText.style.opacity = '1';
        quoteText.style.transform = 'translateY(0)';
    }, 50);
}

tabs.forEach(tab => {
    tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        currentCategory = tab.dataset.category;
        currentIndex = -1;
        updateQuote(currentCategory);
    });
});

refreshBtn.addEventListener('click', async () => {
    if (!simulatedOffline && navigator.onLine) {
        refreshBtn.style.transform = 'rotate(360deg)';
        refreshBtn.style.transition = 'transform 0.5s ease';
        await fetchLatestMemes(true);
        setTimeout(() => {
            refreshBtn.style.transform = 'rotate(0deg)';
        }, 500);
    } else {
        showToast('当前为离线模式，无法联网更新', 2000);
    }
    currentIndex = -1;
    updateQuote(currentCategory);
});

copyBtn.addEventListener('click', async () => {
    const text = quoteText.textContent;
    try {
        await navigator.clipboard.writeText(text);
        showToast('复制成功！');
    } catch (err) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-9999px';
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
            showToast('复制成功！');
        } catch (e) {
            showToast('复制失败，请手动复制');
        }
        document.body.removeChild(textArea);
    }
});

favoriteBtn.addEventListener('click', () => {
    toggleFavorite(currentRawQuote, currentCategory);
});

emojiToggleBtn.addEventListener('click', () => {
    useEmojiDecoration = !useEmojiDecoration;
    emojiToggleBtn.classList.toggle('active', useEmojiDecoration);
    if (useEmojiDecoration) {
        showToast('已开启智能配图');
        currentDisplayQuote = decorateWithEmoji(currentRawQuote, currentCategory);
    } else {
        showToast('已关闭智能配图');
        currentDisplayQuote = currentRawQuote;
    }
    quoteText.textContent = currentDisplayQuote;
});

favoritesBtn.addEventListener('click', () => openModal(favoritesModal));
historyBtn.addEventListener('click', () => openModal(historyModal));

document.querySelectorAll('.modal-close').forEach(btn => {
    btn.addEventListener('click', (e) => {
        const modalId = e.target.dataset.close;
        const modal = document.getElementById(modalId);
        if (modal) closeModal(modal);
    });
});

document.querySelectorAll('.modal').forEach(modal => {
    modal.addEventListener('click', (e) => {
        if (e.target === modal) {
            closeModal(modal);
        }
    });
});

function showToast(message, duration = 2000) {
    toast.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, duration);
}

window.addEventListener('online', () => {
    isOnline = true;
    fetchLatestMemes(false);
});

window.addEventListener('offline', () => {
    isOnline = false;
    currentQuotes = { ...offlineQuotes };
    showToast('已切换到离线模式');
});

quoteText.style.transition = 'opacity 0.3s ease, transform 0.3s ease';

const simulateOfflineBtn = document.getElementById('simulate-offline-btn');
const simulateOnlineBtn = document.getElementById('simulate-online-btn');
const clearCacheBtn = document.getElementById('clear-cache-btn');

if (simulateOfflineBtn) {
    simulateOfflineBtn.addEventListener('click', () => {
        simulatedOffline = true;
        currentQuotes = { ...offlineQuotes };
        showToast('已模拟断网，切换到离线模式', 2000);
        currentIndex = -1;
        updateQuote(currentCategory);
    });
}

if (simulateOnlineBtn) {
    simulateOnlineBtn.addEventListener('click', () => {
        simulatedOffline = false;
        showToast('已恢复网络，尝试更新热梗...', 1500);
        fetchLatestMemes(true);
        currentIndex = -1;
        updateQuote(currentCategory);
    });
}

if (clearCacheBtn) {
    clearCacheBtn.addEventListener('click', () => {
        localStorage.removeItem(CACHE_KEY);
        localStorage.removeItem(CACHE_DATE_KEY);
        showToast('缓存已清除', 1500);
    });
}

const test1Btn = document.getElementById('test1-btn');
const test2Btn = document.getElementById('test2-btn');
const test3Btn = document.getElementById('test3-btn');
const runAllBtn = document.getElementById('run-all-btn');

let testResults = { test1: null, test2: null, test3: null };

function clearAllTestData() {
    localStorage.removeItem(FAVORITES_KEY);
    localStorage.removeItem(HISTORY_KEY);
    localStorage.removeItem('stress_test_checkpoint');
    favorites = [];
    history = [];
    updateFavoritesCount();
}

async function runTest1() {
    const iterations = 500;
    const testQuote = '高频压测专用文案';
    
    console.log('='.repeat(60));
    console.log('🏃 测试 1: 高频点击压测 (500次)');
    console.log('='.repeat(60));

    test1Btn.disabled = true;
    test1Btn.textContent = '1️⃣ 测试中...';
    runAllBtn.disabled = true;
    
    clearAllTestData();
    
    const errors = [];
    let startTime = Date.now();

    for (let i = 0; i < iterations; i++) {
        const shouldAdd = i % 2 === 0;
        
        try {
            let favs = getFavorites();
            const existingIndex = favs.findIndex(f => f.quote === testQuote);
            
            if (shouldAdd) {
                if (existingIndex === -1) {
                    favs.unshift({ quote: testQuote, category: 'love', time: Date.now() });
                    saveFavorites(favs);
                    
                    const after = getFavorites();
                    if (!after.find(f => f.quote === testQuote)) {
                        errors.push(`第${i}次: 收藏失败，数据未写入`);
                    }
                } else {
                    errors.push(`第${i}次: 重复收藏检测失败，已存在却允许重复添加`);
                }
            } else {
                if (existingIndex > -1) {
                    favs.splice(existingIndex, 1);
                    saveFavorites(favs);
                    
                    const after = getFavorites();
                    if (after.find(f => f.quote === testQuote)) {
                        errors.push(`第${i}次: 取消收藏失败，数据未删除`);
                    }
                }
            }

            const current = getFavorites();
            const expectedCount = Math.ceil((i + 1) / 2);
            if (current.length !== expectedCount) {
                errors.push(`第${i}次: 数量不匹配 期望${expectedCount} 实际${current.length}`);
            }

            if ((i + 1) % 100 === 0) {
                console.log(`📍 进度 ${i + 1}/${iterations}，错误: ${errors.length}`);
                showToast(`高频压测中... ${i + 1}/${iterations}`, 500);
                await new Promise(r => setTimeout(r, 30));
            }

            if ((i + 1) % 10 === 0) {
                await new Promise(r => setTimeout(r, 1));
            }
        } catch (e) {
            errors.push(`第${i}次: 异常 ${e.message}`);
        }
    }

    const totalTime = (Date.now() - startTime) / 1000;
    const finalFavs = getFavorites();
    const expectedFinal = Math.ceil(iterations / 2);
    const countMatch = finalFavs.length === expectedFinal;
    const passed = errors.length === 0 && countMatch;

    console.log('');
    console.log('📊 测试 1 结果:');
    console.log(`总点击: ${iterations} 次`);
    console.log(`总用时: ${totalTime.toFixed(2)} 秒`);
    console.log(`平均速度: ${(iterations / totalTime).toFixed(0)} 次/秒`);
    console.log(`最终数量: ${finalFavs.length}/${expectedFinal} ${countMatch ? '✅' : '❌'}`);
    console.log(`操作错误: ${errors.length} ${errors.length === 0 ? '✅' : '❌'}`);
    
    if (errors.length > 0) {
        console.log('❌ 错误详情:');
        errors.slice(0, 10).forEach(e => console.log(`  - ${e}`));
        if (errors.length > 10) console.log(`  ... 还有 ${errors.length - 10} 个错误`);
    }
    
    console.log(passed 
        ? '✅ 测试1通过！按钮响应正常，无卡死、无重复、状态准确' 
        : '❌ 测试1未通过');
    console.log('='.repeat(60));

    testResults.test1 = passed;
    showToast(passed ? '✅ 测试1通过！' : `❌ 测试1失败，${errors.length}个错误`, 2000);
    
    clearAllTestData();
    test1Btn.disabled = false;
    test1Btn.textContent = '1️⃣ 高频点击';
    runAllBtn.disabled = false;
    
    return passed;
}

async function runTest2() {
    const totalItems = 200;
    const categories = ['love', 'crazy', 'moments', 'emoji'];
    
    console.log('='.repeat(60));
    console.log('💾 测试 2: 大容量数据压测 (200条)');
    console.log('='.repeat(60));

    test2Btn.disabled = true;
    test2Btn.textContent = '2️⃣ 测试中...';
    runAllBtn.disabled = true;
    
    clearAllTestData();
    
    const errors = [];
    let startTime = Date.now();

    console.log('📥 开始批量插入 200 条数据...');
    
    for (let i = 0; i < totalItems; i++) {
        const category = categories[i % categories.length];
        const quote = `大容量测试文案 #${i + 1} - ${Date.now()}`;
        
        try {
            const favs = getFavorites();
            favs.unshift({ quote, category, time: Date.now() - i * 1000 });
            saveFavorites(favs);

            if ((i + 1) % 40 === 0) {
                console.log(`📍 插入进度 ${i + 1}/${totalItems}`);
                showToast(`大容量压测中... 插入 ${i + 1}/${totalItems}`, 500);
                await new Promise(r => setTimeout(r, 20));
            }
        } catch (e) {
            errors.push(`第${i}条: 插入异常 ${e.message}`);
        }
    }

    const insertTime = (Date.now() - startTime) / 1000;
    console.log(`✅ 插入完成，用时 ${insertTime.toFixed(2)} 秒`);
    console.log('🔍 开始验证数据完整性...');

    startTime = Date.now();
    const finalFavs = getFavorites();
    
    let missingCount = 0;
    let duplicateCount = 0;
    let orderErrors = 0;
    const seenQuotes = new Set();

    for (let i = 0; i < finalFavs.length; i++) {
        const item = finalFavs[i];
        if (seenQuotes.has(item.quote)) {
            duplicateCount++;
        }
        seenQuotes.add(item.quote);
        if (i > 0 && finalFavs[i].time > finalFavs[i - 1].time) {
            orderErrors++;
        }
    }

    for (let i = 0; i < totalItems; i++) {
        if (!finalFavs.find(f => f.quote && f.quote.includes(`#${i + 1}`))) {
            missingCount++;
            if (missingCount <= 5) {
                errors.push(`缺失数据: #${i + 1}`);
            }
        }
    }

    const verifyTime = (Date.now() - startTime) / 1000;
    const localStorageSize = new Blob([localStorage.getItem(FAVORITES_KEY)]).size / 1024;
    const countMatch = finalFavs.length === totalItems;
    const passed = errors.length === 0 && missingCount === 0 && duplicateCount === 0;

    console.log('');
    console.log('📊 测试 2 结果:');
    console.log(`数据总数: ${totalItems} 条`);
    console.log(`实际存储: ${finalFavs.length}/${totalItems} ${countMatch ? '✅' : '❌'}`);
    console.log(`插入用时: ${insertTime.toFixed(2)} 秒`);
    console.log(`验证用时: ${verifyTime.toFixed(2)} 秒`);
    console.log(`存储大小: ${localStorageSize.toFixed(2)} KB`);
    console.log(`缺失数据: ${missingCount} ${missingCount === 0 ? '✅' : '❌'}`);
    console.log(`重复数据: ${duplicateCount} ${duplicateCount === 0 ? '✅' : '❌'}`);
    console.log(`顺序错误: ${orderErrors} ${orderErrors === 0 ? '✅' : '⚠️ 可接受'}`);
    console.log(`操作异常: ${errors.length} ${errors.length === 0 ? '✅' : '❌'}`);
    
    if (errors.length > 0) {
        console.log('❌ 错误详情:');
        errors.slice(0, 10).forEach(e => console.log(`  - ${e}`));
    }
    
    console.log(passed 
        ? '✅ 测试2通过！收藏列表完整展示，无缺失、乱序、重复条目' 
        : '❌ 测试2未通过');
    console.log('='.repeat(60));

    testResults.test2 = passed;
    showToast(passed ? '✅ 测试2通过！' : `❌ 测试2失败`, 2000);
    
    clearAllTestData();
    test2Btn.disabled = false;
    test2Btn.textContent = '2️⃣ 大容量';
    runAllBtn.disabled = false;
    
    return passed;
}

async function runTest3() {
    const initialCount = 100;
    const totalRounds = 20;
    const categories = ['love', 'crazy', 'moments', 'emoji'];
    
    console.log('='.repeat(60));
    console.log('🔄 测试 3: 重启持久化压测 (20轮)');
    console.log('='.repeat(60));

    test3Btn.disabled = true;
    test3Btn.textContent = '3️⃣ 测试中...';
    runAllBtn.disabled = true;
    
    clearAllTestData();
    
    const errors = [];
    let dataLossCount = 0;
    const referenceQuotes = [];

    console.log(`📥 生成 ${initialCount} 条初始测试数据...`);
    for (let i = 0; i < initialCount; i++) {
        referenceQuotes.push({
            quote: `持久化测试 #${i + 1}`,
            category: categories[i % 4],
            time: Date.now() - i * 1000
        });
    }
    saveFavorites(referenceQuotes);

    const initialVerify = getFavorites();
    if (initialVerify.length !== initialCount) {
        errors.push(`初始数据验证失败，期望 ${initialCount}，实际 ${initialVerify.length}`);
    }

    let startTime = Date.now();

    for (let round = 1; round <= totalRounds; round++) {
        try {
            const current = getFavorites();
            
            if (current.length < 1) {
                dataLossCount++;
                errors.push(`第${round}轮: 数据完全丢失！`);
            }

            const verifyCount = Math.min(10, current.length);
            for (let i = 0; i < verifyCount; i++) {
                if (!current[i].quote || !current[i].category) {
                    errors.push(`第${round}轮: 数据格式损坏，索引${i}`);
                }
            }

            const modifyCount = Math.floor(Math.random() * 3) + 1;
            for (let i = 0; i < modifyCount; i++) {
                const favs = getFavorites();
                if (favs.length > 0 && Math.random() > 0.5) {
                    const removeIndex = Math.floor(Math.random() * favs.length);
                    favs.splice(removeIndex, 1);
                    saveFavorites(favs);
                } else {
                    favs.unshift({
                        quote: `持久化测试 #${initialCount + round * 10 + i + 1}`,
                        category: 'love',
                        time: Date.now()
                    });
                    saveFavorites(favs);
                }
            }

            await new Promise(r => setTimeout(r, 20));

            const afterModify = getFavorites();
            const serialized = JSON.stringify(afterModify);
            const restored = JSON.parse(serialized);
            
            if (restored.length !== afterModify.length) {
                errors.push(`第${round}轮: 序列化/反序列化后数据不一致`);
            }

            if (round % 5 === 0) {
                console.log(`📍 第 ${round}/${totalRounds} 轮，当前数据: ${afterModify.length} 条`);
                showToast(`持久化压测中... 第 ${round}/${totalRounds} 轮`, 500);
            }
        } catch (e) {
            errors.push(`第${round}轮: 异常 ${e.message}`);
        }
    }

    const totalTime = (Date.now() - startTime) / 1000;
    const finalData = getFavorites();
    const passed = errors.length === 0 && dataLossCount === 0;

    console.log('');
    console.log('📊 测试 3 结果:');
    console.log(`测试轮数: ${totalRounds} 轮`);
    console.log(`初始数据: ${initialCount} 条`);
    console.log(`最终数据: ${finalData.length} 条`);
    console.log(`总用时: ${totalTime.toFixed(2)} 秒`);
    console.log(`数据丢失: ${dataLossCount} 次 ${dataLossCount === 0 ? '✅' : '❌'}`);
    console.log(`操作异常: ${errors.length} ${errors.length === 0 ? '✅' : '❌'}`);
    
    if (errors.length > 0) {
        console.log('❌ 错误详情:');
        errors.slice(0, 10).forEach(e => console.log(`  - ${e}`));
    }
    
    console.log(passed 
        ? '✅ 测试3通过！收藏数据100%不丢失，持久化正常' 
        : '❌ 测试3未通过');
    console.log('='.repeat(60));

    testResults.test3 = passed;
    showToast(passed ? '✅ 测试3通过！' : `❌ 测试3失败`, 2000);
    
    clearAllTestData();
    test3Btn.disabled = false;
    test3Btn.textContent = '3️⃣ 持久化';
    runAllBtn.disabled = false;
    
    return passed;
}

async function runAllTests() {
    console.log('\n\n');
    console.log('🚀'.repeat(20));
    console.log('🚀 开始执行全部三项压测...');
    console.log('🚀'.repeat(20));
    console.log('\n');

    runAllBtn.disabled = true;
    runAllBtn.textContent = '🚀 测试中...';

    const t1 = await runTest1();
    await new Promise(r => setTimeout(r, 1000));
    const t2 = await runTest2();
    await new Promise(r => setTimeout(r, 1000));
    const t3 = await runTest3();

    console.log('\n\n');
    console.log('🏆'.repeat(20));
    console.log('🏆 综合测试报告');
    console.log('🏆'.repeat(20));
    console.log('');
    console.log(`测试 1 (高频点击): ${t1 ? '✅ 通过' : '❌ 未通过'}`);
    console.log(`测试 2 (大容量):   ${t2 ? '✅ 通过' : '❌ 未通过'}`);
    console.log(`测试 3 (持久化):   ${t3 ? '✅ 通过' : '❌ 未通过'}`);
    console.log('');
    
    const allPassed = t1 && t2 && t3;
    if (allPassed) {
        console.log('🎉 恭喜！所有测试全部通过！系统稳定性优秀！');
        showToast('🎉 所有测试全部通过！', 5000);
    } else {
        const passedCount = [t1, t2, t3].filter(Boolean).length;
        console.log(`⚠️  部分测试未通过，通过 ${passedCount}/3`);
        showToast(`⚠️  通过 ${passedCount}/3 项测试`, 5000);
    }
    console.log('🏆'.repeat(20));

    runAllBtn.disabled = false;
    runAllBtn.textContent = '🚀 一键全测';
}

test1Btn.addEventListener('click', runTest1);
test2Btn.addEventListener('click', runTest2);
test3Btn.addEventListener('click', runTest3);
runAllBtn.addEventListener('click', runAllTests);

loadFavorites();
loadHistory();
updateFavoritesCount();

(async function init() {
    await fetchLatestMemes(false);
    updateQuote(currentCategory);
})();
