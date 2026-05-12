class Game {
    constructor() {
        this.level = 1;
        this.highScore = this.loadHighScore();
        this.beans = [];
        this.gameArea = document.getElementById('gameArea');
        this.redContainer = document.getElementById('redContainer');
        this.blueContainer = document.getElementById('blueContainer');
        this.levelDisplay = document.getElementById('level');
        this.message = document.getElementById('message');
        this.errorToast = document.getElementById('errorToast');
        this.completeToast = document.getElementById('completeToast');
        this.highScoreDisplay = document.getElementById('highScoreNum');
        this.draggingBean = null;
        this.offsetX = 0;
        this.offsetY = 0;
        
        this.init();
    }

    init() {
        this.highScoreDisplay.textContent = this.highScore;
        this.generateBeans();
        this.setupEventListeners();
        this.message.textContent = '拖动豆子到对应颜色的容器中！';
    }

    generateBeans() {
        const beanCount = Math.floor(Math.random() * 5) + 8;
        const colors = ['red', 'blue'];
        
        for (let i = 0; i < beanCount; i++) {
            const color = colors[Math.floor(Math.random() * colors.length)];
            const bean = document.createElement('div');
            bean.className = `bean ${color}`;
            bean.dataset.color = color;
            
            const x = Math.random() * (this.gameArea.offsetWidth - 60) + 10;
            const y = Math.random() * (this.gameArea.offsetHeight - 200) + 10;
            
            bean.style.left = x + 'px';
            bean.style.top = y + 'px';
            
            this.gameArea.appendChild(bean);
            this.beans.push(bean);
        }
    }

    setupEventListeners() {
        this.beans.forEach(bean => {
            bean.addEventListener('mousedown', (e) => this.startDrag(e, bean));
            bean.addEventListener('touchstart', (e) => this.startDrag(e, bean), { passive: false });
        });

        document.addEventListener('mousemove', (e) => this.drag(e));
        document.addEventListener('touchmove', (e) => this.drag(e), { passive: false });
        document.addEventListener('mouseup', () => this.endDrag());
        document.addEventListener('touchend', () => this.endDrag());
    }

    startDrag(e, bean) {
        e.preventDefault();
        this.draggingBean = bean;
        bean.classList.add('dragging');
        this.addBounceEffect(bean);
        
        const rect = bean.getBoundingClientRect();
        const clientX = e.clientX || e.touches[0].clientX;
        const clientY = e.clientY || e.touches[0].clientY;
        
        this.offsetX = clientX - rect.left;
        this.offsetY = clientY - rect.top;
    }

    addBounceEffect(bean) {
        bean.classList.add('bounce');
        setTimeout(() => {
            bean.classList.remove('bounce');
        }, 300);
    }

    drag(e) {
        if (!this.draggingBean) return;
        e.preventDefault();
        
        const clientX = e.clientX || e.touches[0].clientX;
        const clientY = e.clientY || e.touches[0].clientY;
        
        const gameRect = this.gameArea.getBoundingClientRect();
        let x = clientX - gameRect.left - this.offsetX;
        let y = clientY - gameRect.top - this.offsetY;
        
        x = Math.max(0, Math.min(x, this.gameArea.offsetWidth - 40));
        y = Math.max(0, Math.min(y, this.gameArea.offsetHeight - 40));
        
        this.draggingBean.style.left = x + 'px';
        this.draggingBean.style.top = y + 'px';
        
        this.checkContainerHighlight();
    }

    endDrag() {
        if (!this.draggingBean) return;
        
        this.draggingBean.classList.remove('dragging');
        
        const container = this.getCollidingContainer();
        if (container) {
            this.checkBeanPlacement(container);
        }
        
        this.redContainer.classList.remove('highlight');
        this.blueContainer.classList.remove('highlight');
        this.draggingBean = null;
    }

    checkContainerHighlight() {
        const redRect = this.redContainer.getBoundingClientRect();
        const blueRect = this.blueContainer.getBoundingClientRect();
        const beanRect = this.draggingBean.getBoundingClientRect();
        
        const redColliding = this.isColliding(beanRect, redRect);
        const blueColliding = this.isColliding(beanRect, blueRect);
        
        this.redContainer.classList.toggle('highlight', redColliding);
        this.blueContainer.classList.toggle('highlight', blueColliding);
    }

    getCollidingContainer() {
        const redRect = this.redContainer.getBoundingClientRect();
        const blueRect = this.blueContainer.getBoundingClientRect();
        const beanRect = this.draggingBean.getBoundingClientRect();
        
        if (this.isColliding(beanRect, redRect)) {
            return this.redContainer;
        }
        if (this.isColliding(beanRect, blueRect)) {
            return this.blueContainer;
        }
        return null;
    }

    isColliding(rect1, rect2) {
        return !(rect1.right < rect2.left || 
                 rect1.left > rect2.right || 
                 rect1.bottom < rect2.top || 
                 rect1.top > rect2.bottom);
    }

    checkBeanPlacement(container) {
        const beanColor = this.draggingBean.dataset.color;
        const containerColor = container.id.replace('Container', '');
        
        if (beanColor === containerColor) {
            this.addBounceEffect(this.draggingBean);
            setTimeout(() => {
                this.removeBean(this.draggingBean);
                this.checkWin();
            }, 150);
        } else {
            this.snapBeanToContainer(container);
        }
    }

    snapBeanToContainer(container) {
        const containerRect = container.getBoundingClientRect();
        const gameRect = this.gameArea.getBoundingClientRect();
        
        const containerCenterX = containerRect.left + containerRect.width / 2 - gameRect.left - 20;
        const containerCenterY = containerRect.top + containerRect.height / 2 - gameRect.top - 20;
        
        this.draggingBean.style.left = containerCenterX + 'px';
        this.draggingBean.style.top = containerCenterY + 'px';
        
        this.draggingBean.classList.add('wrong-place');
        setTimeout(() => {
            this.draggingBean.classList.remove('wrong-place');
        }, 500);
        
        this.showErrorToast();
    }

    showErrorToast() {
        this.errorToast.classList.add('show');
        setTimeout(() => {
            this.errorToast.classList.remove('show');
        }, 1000);
    }

    removeBean(bean) {
        const index = this.beans.indexOf(bean);
        if (index > -1) {
            this.beans.splice(index, 1);
        }
        bean.remove();
    }

    checkWin() {
        if (this.beans.length === 0) {
            this.message.textContent = '太棒了，全部归位！';
            this.message.classList.add('success');
            
            if (this.level >= this.highScore) {
                this.highScore = this.level;
                this.saveHighScore();
                this.highScoreDisplay.textContent = this.highScore;
            }
            
            this.showCompleteToast();
            setTimeout(() => {
                this.nextLevel();
            }, 1000);
        }
    }

    showCompleteToast() {
        this.completeToast.classList.add('show');
        setTimeout(() => {
            this.completeToast.classList.remove('show');
        }, 1500);
    }

    loadHighScore() {
        const saved = localStorage.getItem('beanGameHighScore');
        return saved ? parseInt(saved, 10) : 1;
    }

    saveHighScore() {
        localStorage.setItem('beanGameHighScore', this.highScore.toString());
    }

    nextLevel() {
        this.level++;
        this.levelDisplay.textContent = this.level;
        this.message.classList.remove('success');
        this.message.textContent = '拖动豆子到对应颜色的容器中！';
        this.generateBeans();
        this.setupEventListeners();
    }
}

window.addEventListener('DOMContentLoaded', () => {
    new Game();
});