import { Balance } from './Balance.js';
import { Weights } from './Weights.js';
import { StepsManager } from './StepsManager.js';
import { UIManager } from './UIManager.js';
import { ModalManager } from './ModalManager.js';

export class GameController {
    constructor() {
        this.balance = new Balance();
        this.weights = new Weights();
        this.stepsManager = new StepsManager();
        this.uiManager = new UIManager();
        this.modalManager = new ModalManager();
        
        this.currentLevel = 1;
        this.targetWeight = 0;
        this.isPaused = false;
        this.isGameWon = false;
        this.isGameLost = false;
        
        this.init();
    }

    init() {
        this.weights.setOnWeightRemove((pan, index) => this.handleWeightRemove(pan, index));
        this.uiManager.setPanClickHandlers(
            () => this.placeWeight('left'),
            () => this.placeWeight('right')
        );
        this.uiManager.setButtonHandlers(
            () => this.togglePause(),
            () => this.restartGame(),
            () => this.showHint()
        );
        this.uiManager.setWeightButtonHandlers((weight) => this.selectWeight(weight));
        this.modalManager.setOkHandler(() => this.handleModalOk());
        this.modalManager.setNextHandler(() => this.nextLevel());
        this.modalManager.setHintCloseHandler(() => {});
        
        this.generateTarget();
        this.updateUI();
    }

    generateTarget() {
        const weights = [1, 2, 5, 10];
        const numWeights = Math.floor(Math.random() * 3) + 2;
        let target = 0;
        
        for (let i = 0; i < numWeights; i++) {
            const randomWeight = weights[Math.floor(Math.random() * weights.length)];
            target += randomWeight;
        }
        
        this.targetWeight = target;
        this.uiManager.setTarget(target);
    }

    selectWeight(weight) {
        if (this.isPaused || this.isGameWon || this.isGameLost) return;
        this.uiManager.selectWeight(weight);
    }

    placeWeight(pan) {
        if (this.isPaused || this.isGameWon || this.isGameLost) return;
        
        const selectedWeight = this.uiManager.getSelectedWeight();
        if (selectedWeight === null) return;
        
        this.weights.addWeight(pan, selectedWeight);
        this.stepsManager.increment();
        this.updateBalance();
        this.checkWin();
        this.checkLose();
    }

    handleWeightRemove(pan, index) {
        if (this.isPaused || this.isGameWon || this.isGameLost) return;
        
        this.weights.removeWeight(pan, index).then(() => {
            this.stepsManager.increment();
            this.updateBalance();
            this.checkWin();
            this.checkLose();
        });
    }

    updateBalance() {
        const leftWeight = this.weights.getLeftTotal();
        const rightWeight = this.weights.getRightTotal();
        
        this.balance.update(leftWeight, rightWeight);
        this.uiManager.updateWeights(leftWeight, rightWeight);
    }

    updateUI() {
        this.uiManager.setLevel(this.currentLevel);
        this.updateBalance();
    }

    checkWin() {
        const leftWeight = this.weights.getLeftTotal();
        const rightWeight = this.weights.getRightTotal();
        const difference = Math.abs(leftWeight - rightWeight);
        
        if (difference <= 1 && !this.isGameWon) {
            this.isGameWon = true;
            this.modalManager.showWinModal(
                this.currentLevel,
                leftWeight,
                rightWeight,
                difference,
                this.stepsManager.getCurrentSteps()
            );
        }
    }

    checkLose() {
        if (this.stepsManager.isExhausted() && !this.isGameWon && !this.isGameLost) {
            this.isGameLost = true;
            this.modalManager.showLoseModal(
                this.currentLevel,
                this.weights.getLeftTotal(),
                this.weights.getRightTotal()
            );
        }
    }

    togglePause() {
        this.isPaused = !this.isPaused;
        this.uiManager.setPauseState(this.isPaused);
        
        if (this.isPaused) {
            this.modalManager.showPauseModal();
        } else {
            this.modalManager.hideModal();
        }
    }

    handleModalOk() {
        if (this.isPaused) {
            this.togglePause();
        } else if (this.isGameLost) {
            this.restartGame();
        }
    }

    nextLevel() {
        this.currentLevel++;
        this.isGameWon = false;
        this.isGameLost = false;
        this.weights.reset();
        this.stepsManager.reset();
        this.uiManager.selectWeight(null);
        
        this.generateTarget();
        this.updateUI();
    }

    restartGame() {
        this.currentLevel = 1;
        this.isGameWon = false;
        this.isGameLost = false;
        this.isPaused = false;
        this.weights.reset();
        this.stepsManager.reset();
        this.uiManager.selectWeight(null);
        this.uiManager.setPauseState(false);
        
        this.generateTarget();
        this.updateUI();
    }

    showHint() {
        this.modalManager.showHint();
    }
}