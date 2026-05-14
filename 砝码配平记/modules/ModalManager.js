export class ModalManager {
    constructor() {
        this.modalOverlay = document.getElementById('modal-overlay');
        this.modalTitle = document.getElementById('modal-title');
        this.modalMessage = document.getElementById('modal-message');
        this.modalOk = document.getElementById('modal-ok');
        this.modalNext = document.getElementById('modal-next');
        
        this.hintOverlay = document.getElementById('hint-overlay');
        this.hintClose = document.getElementById('hint-close');
        
        this.okHandler = null;
        this.nextHandler = null;
        this.hintCloseHandler = null;
        
        this.initHintCloseListener();
    }
    
    initHintCloseListener() {
        this.hintClose.addEventListener('click', () => {
            this.hideHint();
            this.hintCloseHandler?.();
        });
    }

    showWinModal(level, leftWeight, rightWeight, difference, steps) {
        this.modalTitle.textContent = '恭喜通关！';
        this.modalMessage.textContent = `第 ${level} 关完成！\n\n左盘: ${leftWeight}g\n右盘: ${rightWeight}g\n差值: ${difference}g\n\n使用步数: ${steps} 步`;
        this.modalOk.style.display = 'none';
        this.modalNext.style.display = 'inline-block';
        this.modalOverlay.classList.add('show');
    }

    showLoseModal(level, leftWeight, rightWeight) {
        this.modalTitle.textContent = '步数用尽';
        this.modalMessage.textContent = `第 ${level} 关失败！\n\n步数已用尽，请重新尝试。\n\n当前状态:\n左盘: ${leftWeight}g\n右盘: ${rightWeight}g`;
        this.modalOk.style.display = 'inline-block';
        this.modalNext.style.display = 'none';
        this.modalOverlay.classList.add('show');
    }

    showPauseModal() {
        this.modalTitle.textContent = '游戏暂停';
        this.modalMessage.textContent = '游戏已暂停，点击继续按钮恢复游戏。';
        this.modalOk.style.display = 'inline-block';
        this.modalNext.style.display = 'none';
        this.modalOverlay.classList.add('show');
    }

    hideModal() {
        this.modalOverlay.classList.remove('show');
    }

    showHint() {
        this.hintOverlay.classList.remove('hidden');
    }

    hideHint() {
        this.hintOverlay.classList.add('hidden');
    }

    setOkHandler(handler) {
        this.okHandler = handler;
        this.modalOk.addEventListener('click', () => {
            this.hideModal();
            this.okHandler?.();
        });
    }

    setNextHandler(handler) {
        this.nextHandler = handler;
        this.modalNext.addEventListener('click', () => {
            this.hideModal();
            this.nextHandler?.();
        });
    }

    setHintCloseHandler(handler) {
        this.hintClose.addEventListener('click', () => {
            this.hideHint();
            handler?.();
        });
    }
}