export class Weights {
    constructor() {
        this.leftWeights = [];
        this.rightWeights = [];
        this.leftContainer = document.getElementById('left-weights');
        this.rightContainer = document.getElementById('right-weights');
        
        this.weightTypes = {
            1: { className: 'weight-1', width: 30, height: 20 },
            2: { className: 'weight-2', width: 35, height: 25 },
            5: { className: 'weight-5', width: 40, height: 30 },
            10: { className: 'weight-10', width: 50, height: 35 }
        };
    }

    addWeight(pan, weight) {
        if (pan === 'left') {
            this.leftWeights.push(weight);
            this.renderWeights('left', this.leftWeights.length - 1);
        } else {
            this.rightWeights.push(weight);
            this.renderWeights('right', this.rightWeights.length - 1);
        }
    }

    removeWeight(pan, index) {
        const container = pan === 'left' ? this.leftContainer : this.rightContainer;
        const weightElement = container.children[index];
        
        if (weightElement) {
            weightElement.style.transition = 'all 0.2s ease-in';
            weightElement.style.transform = 'scale(0)';
            weightElement.style.opacity = '0';
        }
        
        return new Promise((resolve) => {
            setTimeout(() => {
                if (pan === 'left') {
                    this.leftWeights.splice(index, 1);
                } else {
                    this.rightWeights.splice(index, 1);
                }
                this.renderWeights(pan);
                resolve();
            }, 200);
        });
    }

    renderWeights(pan, newIndex = null) {
        const container = pan === 'left' ? this.leftContainer : this.rightContainer;
        const weights = pan === 'left' ? this.leftWeights : this.rightWeights;
        
        container.innerHTML = '';
        
        weights.forEach((weight, index) => {
            const weightElement = this.createWeightElement(weight, index, pan);
            
            if (newIndex !== null && index === newIndex) {
                weightElement.style.transform = 'scale(1.3)';
                weightElement.style.opacity = '0';
            }
            
            container.appendChild(weightElement);
            
            if (newIndex !== null && index === newIndex) {
                setTimeout(() => {
                    weightElement.style.transition = 'all 0.3s ease-out';
                    weightElement.style.transform = 'scale(1)';
                    weightElement.style.opacity = '1';
                }, 10);
            }
        });
    }

    createWeightElement(weight, index, pan) {
        const element = document.createElement('div');
        element.className = `weight-item ${this.weightTypes[weight].className}`;
        element.textContent = `${weight}g`;
        element.addEventListener('click', (e) => {
            e.stopPropagation();
            this.onWeightRemove?.(pan, index);
        });
        return element;
    }

    getTotalWeight(pan) {
        const weights = pan === 'left' ? this.leftWeights : this.rightWeights;
        return weights.reduce((sum, w) => sum + w, 0);
    }

    getLeftTotal() {
        return this.getTotalWeight('left');
    }

    getRightTotal() {
        return this.getTotalWeight('right');
    }

    reset() {
        this.leftWeights = [];
        this.rightWeights = [];
        this.leftContainer.innerHTML = '';
        this.rightContainer.innerHTML = '';
    }

    setOnWeightRemove(callback) {
        this.onWeightRemove = callback;
    }
}