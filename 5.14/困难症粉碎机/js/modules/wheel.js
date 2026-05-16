const WheelModule = (() => {
    const COLORS = [
        '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
        '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
        '#F8B500', '#FF8C42', '#6BCB77', '#4D96FF', '#FF6B6B'
    ];

    const state = {
        ctx: null,
        options: [],
        rotation: 0,
        animationId: null,
        isSpinning: false,
        selectedPresetId: null
    };

    const elements = {};

    function init() {
        cacheElements();
        setupCanvas();
        bindEvents();
        render();
        EventBus.on('presets:updated', renderPresetSelect);
    }

    function cacheElements() {
        elements.canvas = document.getElementById('wheel-canvas');
        elements.presetSelect = document.getElementById('wheel-preset-select');
        elements.spinBtn = document.getElementById('wheel-btn');
        elements.resultDiv = document.getElementById('wheel-result');
    }

    function setupCanvas() {
        if (!elements.canvas) return;
        state.ctx = elements.canvas.getContext('2d');
    }

    function bindEvents() {
        elements.spinBtn.addEventListener('click', handleSpin);
        elements.presetSelect.addEventListener('change', (e) => {
            state.selectedPresetId = e.target.value;
            updateOptionsFromPreset();
            render();
        });
    }

    function render() {
        renderPresetSelect();
        drawWheel();
    }

    function renderPresetSelect() {
        if (!elements.presetSelect) return;
        
        const presets = Storage.get('presets', []);
        const options = presets.map(p => 
            `<option value="${p.id}" ${p.id === state.selectedPresetId ? 'selected' : ''}>${p.name} (${p.options.length}个选项)</option>`
        ).join('');
        
        elements.presetSelect.innerHTML = '<option value="">-- 请选择 --</option>' + options;
    }

    function updateOptionsFromPreset() {
        const presetId = state.selectedPresetId;
        if (!presetId) {
            state.options = [];
            return;
        }
        
        const presets = Storage.get('presets', []);
        const preset = presets.find(p => p.id === presetId);
        if (preset) {
            state.options = [...preset.options];
        } else {
            state.options = [];
        }
    }

    function drawWheel() {
        if (!state.ctx) return;
        
        const canvas = elements.canvas;
        const centerX = canvas.width / 2;
        const centerY = canvas.height / 2;
        const radius = 140;
        
        state.ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        if (state.options.length === 0) {
            drawEmptyState(centerX, centerY, radius);
            return;
        }
        
        const sliceAngle = (2 * Math.PI) / state.options.length;
        
        for (let i = 0; i < state.options.length; i++) {
            drawSlice(centerX, centerY, radius, i, sliceAngle);
        }
        
        drawCenterCircle(centerX, centerY);
    }

    function drawEmptyState(centerX, centerY, radius) {
        state.ctx.beginPath();
        state.ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        state.ctx.fillStyle = '#e0e0e0';
        state.ctx.fill();
        
        state.ctx.fillStyle = '#999';
        state.ctx.font = '16px sans-serif';
        state.ctx.textAlign = 'center';
        state.ctx.fillText('请先选择选项集', centerX, centerY);
    }

    function drawSlice(centerX, centerY, radius, index, sliceAngle) {
        const startAngle = state.rotation + index * sliceAngle;
        const endAngle = startAngle + sliceAngle;
        
        state.ctx.beginPath();
        state.ctx.moveTo(centerX, centerY);
        state.ctx.arc(centerX, centerY, radius, startAngle, endAngle);
        state.ctx.closePath();
        state.ctx.fillStyle = COLORS[index % COLORS.length];
        state.ctx.fill();
        state.ctx.strokeStyle = 'white';
        state.ctx.lineWidth = 2;
        state.ctx.stroke();
        
        state.ctx.save();
        state.ctx.translate(centerX, centerY);
        state.ctx.rotate(startAngle + sliceAngle / 2);
        state.ctx.textAlign = 'right';
        state.ctx.fillStyle = 'white';
        state.ctx.font = 'bold 12px sans-serif';
        state.ctx.shadowColor = 'rgba(0,0,0,0.3)';
        state.ctx.shadowBlur = 2;
        const text = state.options[index].length > 8 ? state.options[index].slice(0, 8) + '...' : state.options[index];
        state.ctx.fillText(text, radius - 10, 5);
        state.ctx.restore();
    }

    function drawCenterCircle(centerX, centerY) {
        state.ctx.beginPath();
        state.ctx.arc(centerX, centerY, 20, 0, 2 * Math.PI);
        state.ctx.fillStyle = 'white';
        state.ctx.fill();
        state.ctx.strokeStyle = '#667eea';
        state.ctx.lineWidth = 3;
        state.ctx.stroke();
    }

    function handleSpin() {
        if (state.isSpinning) {
            EventBus.emit('toast:show', '转盘正在旋转中...');
            return;
        }
        
        if (state.options.length === 0) {
            EventBus.emit('toast:show', '请先选择一个选项集');
            return;
        }
        
        state.isSpinning = true;
        elements.spinBtn.disabled = true;
        elements.resultDiv.textContent = '';
        
        const targetRotation = state.rotation + Math.PI * 8 + Random.secureRandomInt(0, 360) * Math.PI / 180;
        const duration = 4000;
        const startTime = performance.now();
        const startRotation = state.rotation;
        
        function animate(currentTime) {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            
            state.rotation = startRotation + (targetRotation - startRotation) * easeProgress;
            drawWheel();
            
            if (progress < 1) {
                state.animationId = requestAnimationFrame(animate);
            } else {
                const selectedIndex = calculateSelectedIndex();
                elements.resultDiv.textContent = `🎯 结果：${state.options[selectedIndex]}`;
                state.isSpinning = false;
                elements.spinBtn.disabled = false;
            }
        }
        
        state.animationId = requestAnimationFrame(animate);
    }

    function calculateSelectedIndex() {
        const sliceAngle = (2 * Math.PI) / state.options.length;
        const normalizedRotation = ((state.rotation % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
        return Math.floor((2 * Math.PI - normalizedRotation + sliceAngle / 2) / sliceAngle) % state.options.length;
    }

    function destroy() {
        if (state.animationId) {
            cancelAnimationFrame(state.animationId);
        }
    }

    return {
        init,
        destroy
    };
})();

window.WheelModule = WheelModule;
