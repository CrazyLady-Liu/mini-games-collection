export class UIManager {
    constructor() {
        this.leftWeightDisplay = document.getElementById('left-weight');
        this.rightWeightDisplay = document.getElementById('right-weight');
        this.weightDifferenceDisplay = document.getElementById('weight-difference');
        this.targetDisplay = document.getElementById('target-display');
        this.currentLevelDisplay = document.getElementById('current-level');
        this.panIndicator = document.getElementById('pan-indicator');
        
        this.weightButtons = document.querySelectorAll('.weight-btn');
        this.pauseBtn = document.getElementById('pause-btn');
        this.restartBtn = document.getElementById('restart-btn');
        this.hintBtn = document.getElementById('hint-btn');
        
        this.leftPan = document.getElementById('left-pan');
        this.rightPan = document.getElementById('right-pan');
        
        this.selectedWeight = null;
    }

    updateWeights(leftWeight, rightWeight) {
        this.leftWeightDisplay.textContent = `${leftWeight}g`;
        this.rightWeightDisplay.textContent = `${rightWeight}g`;
        
        const difference = Math.abs(leftWeight - rightWeight);
        this.weightDifferenceDisplay.textContent = `${difference}g`;
        
        if (difference <= 1) {
            this.weightDifferenceDisplay.style.color = '#27ae60';
            this.weightDifferenceDisplay.style.fontWeight = 'bold';
        } else {
            this.weightDifferenceDisplay.style.color = '#e74c3c';
            this.weightDifferenceDisplay.style.fontWeight = 'normal';
        }
        
        this.animateNumberChange(this.leftWeightDisplay, leftWeight);
        this.animateNumberChange(this.rightWeightDisplay, rightWeight);
    }

    animateNumberChange(element, newValue) {
        element.style.transition = 'all 0.3s ease-out';
        const oldValue = parseInt(element.textContent);
        if (newValue > oldValue) {
            element.style.transform = 'scale(1.2)';
        } else if (newValue < oldValue) {
            element.style.transform = 'scale(0.8)';
        }
        setTimeout(() => {
            element.style.transform = 'scale(1)';
        }, 300);
    }

    setTarget(target) {
        this.targetDisplay.textContent = target;
    }

    setLevel(level) {
        this.currentLevelDisplay.textContent = level;
    }

    selectWeight(weight) {
        if (this.selectedWeight === weight) {
            this.selectedWeight = null;
            this.panIndicator.textContent = '点击选择要放置的托盘';
        } else {
            this.selectedWeight = weight;
            this.panIndicator.textContent = `已选择 ${weight}g 砝码，点击左盘或右盘放置（可连续放置）`;
        }
        
        this.weightButtons.forEach(btn => {
            const btnWeight = parseInt(btn.dataset.weight);
            btn.classList.toggle('selected', btnWeight === this.selectedWeight);
        });
    }

    getSelectedWeight() {
        return this.selectedWeight;
    }

    setPauseState(isPaused) {
        this.pauseBtn.textContent = isPaused ? '继续' : '暂停';
    }

    setPanClickHandlers(leftHandler, rightHandler) {
        this.leftPan.addEventListener('click', leftHandler);
        this.rightPan.addEventListener('click', rightHandler);
    }

    setButtonHandlers(pauseHandler, restartHandler, hintHandler) {
        this.pauseBtn.addEventListener('click', pauseHandler);
        this.restartBtn.addEventListener('click', restartHandler);
        this.hintBtn.addEventListener('click', hintHandler);
    }

    setWeightButtonHandlers(handler) {
        this.weightButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const weight = parseInt(e.target.dataset.weight);
                handler(weight);
            });
        });
    }
}