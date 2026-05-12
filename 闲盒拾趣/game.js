const Game = {
    coins: 100,
    collection: [],
    isAnimating: false,
    effectsEnabled: true,

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
            this.effectsEnabled = data.effectsEnabled !== false;
        }
        this.updateEffectsButton();
    },

    saveGameState() {
        localStorage.setItem('xianheGame', JSON.stringify({
            coins: this.coins,
            collection: this.collection,
            effectsEnabled: this.effectsEnabled
        }));
    },

    bindEvents() {
        document.getElementById('open-btn').addEventListener('click', () => this.openBlindBox());
        document.getElementById('close-popup').addEventListener('click', () => this.closePopup());
        document.getElementById('collection-btn').addEventListener('click', () => this.showCollection());
        document.getElementById('close-modal').addEventListener('click', () => this.hideCollection());
        document.getElementById('effects-toggle').addEventListener('click', () => this.toggleEffects());
    },

    toggleEffects() {
        this.effectsEnabled = !this.effectsEnabled;
        this.updateEffectsButton();
        this.saveGameState();
    },

    updateEffectsButton() {
        const btn = document.getElementById('effects-toggle');
        if (this.effectsEnabled) {
            btn.textContent = '✨ 特效';
            btn.className = 'btn effects-on';
        } else {
            btn.textContent = '🔇 摸鱼';
            btn.className = 'btn effects-off';
        }
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

    createParticles(color, count = 8) {
        if (!this.effectsEnabled) return;
        
        const container = document.getElementById('particles-container');
        const colors = color ? [color] : ['#FFD700', '#FFA500', '#FF69B4', '#00CED1', '#9370DB'];
        
        for (let i = 0; i < count; i++) {
            const particle = document.createElement('div');
            particle.className = 'particle';
            
            const size = Math.random() * 6 + 3;
            const startX = 150;
            const startY = 150;
            const angle = Math.random() * Math.PI * 2;
            const distance = Math.random() * 80 + 40;
            const finalX = startX + Math.cos(angle) * distance;
            const finalY = startY + Math.sin(angle) * distance;
            
            particle.style.width = `${size}px`;
            particle.style.height = `${size}px`;
            particle.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            particle.style.left = `${startX}px`;
            particle.style.top = `${startY}px`;
            particle.style.opacity = '0.6';
            particle.style.boxShadow = `0 0 ${size * 0.5}px ${particle.style.backgroundColor}`;
            
            container.appendChild(particle);
            
            particle.animate([
                { transform: 'scale(1)', opacity: 0.6, left: `${startX}px`, top: `${startY}px` },
                { transform: 'scale(0)', opacity: 0, left: `${finalX}px`, top: `${finalY}px` }
            ], {
                duration: 1200 + Math.random() * 600,
                easing: 'ease-out',
                fill: 'forwards'
            }).onfinish = () => particle.remove();
        }
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

        const item = this.generateItem();
        this.addToCollection(item);

        if (item.rarity === 'common') {
            blindBox.classList.add('opening-slow');
            await this.sleep(1200);
        } else {
            if (this.effectsEnabled) {
                blindBox.classList.add('vibrating');
                blindBox.classList.add('shaking');
                await this.sleep(500);
                blindBox.classList.remove('shaking');
                blindBox.classList.remove('vibrating');
            }
            blindBox.classList.add('opening');
            await this.sleep(800);

            if (this.effectsEnabled) {
                if (item.rarity === 'rare') {
                    this.createParticles('#87CEEB', 8);
                } else if (item.rarity === 'limited') {
                    this.createParticles('#F5DEB3', 8);
                }
            }
        }

        this.showResult(item);

        blindBox.classList.remove('opening');
        blindBox.classList.remove('opening-slow');
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
        const popupContent = popup.querySelector('.popup-content');
        const itemDisplay = document.getElementById('item-display');
        
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
        
        popupContent.classList.remove('limited-glow');
        popupContent.classList.remove('common-minimal');
        itemDisplay.classList.remove('limited-sparkle');
        
        if (item.rarity === 'common') {
            popupContent.classList.add('common-minimal');
        } else if (this.effectsEnabled && item.rarity === 'limited') {
            popupContent.classList.add('limited-glow');
            itemDisplay.classList.add('limited-sparkle');
        }

        popup.classList.add('show');
    },

    closePopup() {
        const popup = document.getElementById('result-popup');
        const popupContent = popup.querySelector('.popup-content');
        const itemDisplay = document.getElementById('item-display');
        
        popup.classList.remove('show');
        popupContent.classList.remove('limited-glow');
        popupContent.classList.remove('common-minimal');
        itemDisplay.classList.remove('limited-sparkle');
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
