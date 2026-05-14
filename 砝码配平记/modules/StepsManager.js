export class StepsManager {
    constructor() {
        this.currentSteps = 0;
        this.maxSteps = 12;
        
        this.currentStepsDisplay = document.getElementById('current-steps');
        this.maxStepsDisplay = document.getElementById('max-steps');
        this.stepsInfo = document.querySelector('.steps-info');
    }

    increment() {
        this.currentSteps++;
        this.updateDisplay();
    }

    updateDisplay() {
        this.currentStepsDisplay.textContent = this.currentSteps;
        
        this.stepsInfo.classList.remove('warning', 'danger');
        
        const remainingSteps = this.maxSteps - this.currentSteps;
        
        if (remainingSteps <= 3) {
            this.stepsInfo.classList.add('danger');
        } else if (remainingSteps <= 5) {
            this.stepsInfo.classList.add('warning');
        }
    }

    isExhausted() {
        return this.currentSteps >= this.maxSteps;
    }

    getRemainingSteps() {
        return this.maxSteps - this.currentSteps;
    }

    reset() {
        this.currentSteps = 0;
        this.updateDisplay();
    }

    getCurrentSteps() {
        return this.currentSteps;
    }

    getMaxSteps() {
        return this.maxSteps;
    }
}