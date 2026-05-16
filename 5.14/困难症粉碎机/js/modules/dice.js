const DiceModule = (() => {
    const state = {
        isRolling: false,
        lastResults: []
    };

    const elements = {};

    function init() {
        cacheElements();
        bindEvents();
    }

    function cacheElements() {
        elements.countInput = document.getElementById('dice-count');
        elements.sidesSelect = document.getElementById('dice-sides');
        elements.rollBtn = document.getElementById('dice-btn');
        elements.container = document.getElementById('dice-container');
        elements.resultDiv = document.getElementById('dice-result');
    }

    function bindEvents() {
        elements.rollBtn.addEventListener('click', handleRoll);
    }

    function handleRoll() {
        if (state.isRolling) return;
        
        const count = parseInt(elements.countInput.value) || 1;
        const sides = parseInt(elements.sidesSelect.value) || 6;
        
        state.isRolling = true;
        elements.rollBtn.disabled = true;
        
        showRollingAnimation(count);
        elements.resultDiv.textContent = '摇骰子中...';
        
        setTimeout(() => {
            const results = Random.rollMultipleDice(count, sides);
            state.lastResults = results;
            showResults(results);
            
            const total = results.reduce((a, b) => a + b, 0);
            elements.resultDiv.textContent = `结果：${results.join(' + ')} = ${total}`;
            
            state.isRolling = false;
            elements.rollBtn.disabled = false;
        }, 800);
    }

    function showRollingAnimation(count) {
        elements.container.innerHTML = Array(count).fill(0).map(() => 
            `<div class="dice rolling">?</div>`
        ).join('');
    }

    function showResults(results) {
        elements.container.innerHTML = results.map(value => 
            `<div class="dice">${value}</div>`
        ).join('');
    }

    return {
        init
    };
})();

window.DiceModule = DiceModule;
