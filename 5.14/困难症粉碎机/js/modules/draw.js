const DrawModule = (() => {
    const state = {
        selectedPresetId: null,
        drawnItems: [],
        currentResults: [],
        isAnimating: false
    };

    const elements = {};

    function init() {
        cacheElements();
        bindEvents();
        render();
        EventBus.on('presets:updated', renderPresetSelect);
    }

    function cacheElements() {
        elements.presetSelect = document.getElementById('draw-preset-select');
        elements.countInput = document.getElementById('draw-count');
        elements.noRepeatCheckbox = document.getElementById('draw-no-repeat');
        elements.drawBtn = document.getElementById('draw-btn');
        elements.resetBtn = document.getElementById('draw-reset-btn');
        elements.display = document.getElementById('draw-display');
    }

    function bindEvents() {
        elements.drawBtn.addEventListener('click', handleDraw);
        elements.resetBtn.addEventListener('click', handleReset);
        elements.presetSelect.addEventListener('change', (e) => {
            state.selectedPresetId = e.target.value;
            handleReset();
        });
    }

    function render() {
        renderPresetSelect();
        renderDisplay();
        updateResetButton();
    }

    function renderPresetSelect() {
        if (!elements.presetSelect) return;
        
        const presets = Storage.get('presets', []);
        const options = presets.map(p => 
            `<option value="${p.id}" ${p.id === state.selectedPresetId ? 'selected' : ''}>${p.name} (${p.options.length}个选项)</option>`
        ).join('');
        
        elements.presetSelect.innerHTML = '<option value="">-- 请选择 --</option>' + options;
    }

    function renderDisplay() {
        if (!elements.display) return;
        
        if (state.currentResults.length === 0) {
            elements.display.innerHTML = '<div class="draw-placeholder">点击下方按钮开始抽签</div>';
            return;
        }
        
        elements.display.innerHTML = state.currentResults.map(item => 
            `<div class="draw-item">${escapeHtml(item)}</div>`
        ).join('');
    }

    function updateResetButton() {
        if (!elements.resetBtn) return;
        elements.resetBtn.style.display = state.drawnItems.length > 0 ? 'block' : 'none';
    }

    function handleDraw() {
        if (state.isAnimating) return;
        
        const presetId = elements.presetSelect.value;
        if (!presetId) {
            EventBus.emit('toast:show', '请先选择一个选项集');
            return;
        }
        
        const presets = Storage.get('presets', []);
        const preset = presets.find(p => p.id === presetId);
        if (!preset) {
            EventBus.emit('toast:show', '选项集不存在');
            return;
        }
        
        const count = Math.max(1, Math.min(20, parseInt(elements.countInput.value) || 1));
        const noRepeat = elements.noRepeatCheckbox.checked;
        
        const results = Random.pickMany(preset.options, count, {
            allowRepeat: !noRepeat,
            exclude: noRepeat ? state.drawnItems : []
        });
        
        if (results.length === 0) {
            EventBus.emit('toast:show', '所有选项都已抽完，请重置');
            return;
        }
        
        state.currentResults = [];
        renderDisplay();
        
        state.isAnimating = true;
        elements.drawBtn.disabled = true;
        
        animateDraw(results, () => {
            state.currentResults = results;
            state.drawnItems.push(...results);
            renderDisplay();
            updateResetButton();
            state.isAnimating = false;
            elements.drawBtn.disabled = false;
        });
    }

    function animateDraw(results, callback) {
        const totalSteps = 20;
        let step = 0;
        
        const interval = setInterval(() => {
            const presets = Storage.get('presets', []);
            const preset = presets.find(p => p.id === state.selectedPresetId);
            if (!preset) return;
            
            const tempResults = [];
            for (let i = 0; i < results.length; i++) {
                tempResults.push(Random.pickOne(preset.options));
            }
            
            elements.display.innerHTML = tempResults.map(item => 
                `<div class="draw-item">${escapeHtml(item)}</div>`
            ).join('');
            
            step++;
            if (step >= totalSteps) {
                clearInterval(interval);
                callback();
            }
        }, 50);
    }

    function handleReset() {
        state.drawnItems = [];
        state.currentResults = [];
        renderDisplay();
        updateResetButton();
        EventBus.emit('toast:show', '已重置');
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    return {
        init
    };
})();

window.DrawModule = DrawModule;
