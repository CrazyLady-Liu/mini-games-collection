const Game = {
    coins: 100,
    collection: [],
    isAnimating: false,

    collectionPool: {
        common: [
            { id: 1, name: '橡皮擦', icon: '📎', rarity: 'common' },
            { id: 2, name: '回形针', icon: '📌', rarity: 'common' },
            { id: 3, name: '便利贴', icon: '📝', rarity: 'common' },
            { id: 4, name: '便签纸', icon: '📄', rarity: 'common' },
            { id: 5, name: '铅笔', icon: '✏️', rarity: 'common' },
            { id: 6, name: '书签', icon: '🔖', rarity: 'common' },
        ],
        rare: [
            { id: 7, name: '小玩具', icon: '🧸', rarity: 'rare' },
            { id: 8, name: '钥匙扣', icon: '🔑', rarity: 'rare' },
            { id: 9, name: '明信片', icon: '📮', rarity: 'rare' },
            { id: 10, name: '钥匙链', icon: '🎀', rarity: 'rare' },
            { id: 11, name: '小徽章', icon: '🏅', rarity: 'rare' },
        ],
        limited: [
            { id: 12, name: '黄金奖杯', icon: '🏆', rarity: 'limited' },
            { id: 13, name: '神秘水晶', icon: '💎', rarity: 'limited' },
            { id: 14, name: '金色皇冠', icon: '👑', rarity: 'limited' },
            { id: 15, name: '魔法星星', icon: '⭐', rarity: 'limited' },
        ]
    },

    probability: {
        common: 0.65,
        rare: 0.28,
        limited: 0.07
    },

    init() {
        this.loadGameState();
        this.bindEvents();
        this.updateUI();
    },

    loadGameState() {
        const saved = localStorage.getItem('xianheGame');
        if (saved) {
            const data = JSON.parse(saved);
            this.coins = data.coins || 100;
            this.collection = data.collection || [];
        }
    },

    saveGameState() {
        localStorage.setItem('xianheGame', JSON.stringify({
            coins: this.coins,
            collection: this.collection
        }));
    },

    bindEvents() {
        document.getElementById('open-btn').addEventListener('click', () => this.openBlindBox());
        document.getElementById('close-popup').addEventListener('click', () => this.closePopup());
        document.getElementById('collection-btn').addEventListener('click', () => this.showCollection());
        document.getElementById('close-modal').addEventListener('click', () => this.hideCollection());
    },

    updateUI() {
        document.getElementById('coins').textContent = this.coins;
    },

    getRandomRarity() {
        const rand = Math.random();
        if (rand < this.probability.limited) return 'limited';
        if (rand < this.probability.limited + this.probability.rare) return 'rare';
        return 'common';
    },

    generateItem() {
        const rarity = this.getRandomRarity();
        const items = this.collectionPool[rarity];
        return items[Math.floor(Math.random() * items.length)];
    },

    async openBlindBox() {
        if (this.isAnimating || this.coins < 10) {
            if (this.coins < 10) alert('金币不足！');
            return;
        }

        this.isAnimating = true;
        this.coins -= 10;
        this.updateUI();

        const blindBox = document.getElementById('blind-box');
        const openBtn = document.getElementById('open-btn');
        openBtn.disabled = true;

        blindBox.classList.add('shaking');
        await this.sleep(500);
        blindBox.classList.remove('shaking');
        blindBox.classList.add('opening');

        await this.sleep(800);

        const item = this.generateItem();
        this.addToCollection(item);
        this.showResult(item);

        blindBox.classList.remove('opening');
        this.isAnimating = false;
        openBtn.disabled = false;
        this.saveGameState();
    },

    addToCollection(item) {
        if (!this.collection.includes(item.id)) {
            this.collection.push(item.id);
        }
    },

    showResult(item) {
        const popup = document.getElementById('result-popup');
        document.getElementById('item-display').textContent = item.icon;
        document.getElementById('item-name').textContent = item.name;

        const rarityEl = document.getElementById('item-rarity');
        let rarityText = '';
        let rarityClass = '';
        switch (item.rarity) {
            case 'common':
                rarityText = '【普通】';
                rarityClass = 'rarity-common';
                break;
            case 'rare':
                rarityText = '【稀有】';
                rarityClass = 'rarity-rare';
                break;
            case 'limited':
                rarityText = '【限定】';
                rarityClass = 'rarity-limited';
                break;
        }
        rarityEl.textContent = rarityText;
        rarityEl.className = 'item-rarity ' + rarityClass;

        popup.classList.add('show');
    },

    closePopup() {
        document.getElementById('result-popup').classList.remove('show');
    },

    showCollection() {
        const modal = document.getElementById('collection-modal');
        const grid = document.getElementById('collection-grid');
        grid.innerHTML = '';

        const allItems = [
            ...this.collectionPool.common,
            ...this.collectionPool.rare,
            ...this.collectionPool.limited
        ];

        allItems.forEach(item => {
            const div = document.createElement('div');
            const isCollected = this.collection.includes(item.id);
            div.className = 'collection-item ' + (isCollected ? 'collected' : 'locked');
            div.innerHTML = `
                <div class="item-icon">${item.icon}</div>
                <div class="item-label">${isCollected ? item.name : '???'}</div>
            `;
            grid.appendChild(div);
        });

        modal.classList.add('show');
    },

    hideCollection() {
        document.getElementById('collection-modal').classList.remove('show');
    },

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
};

document.addEventListener('DOMContentLoaded', () => {
    Game.init();
});
