const App = (() => {
    const state = {
        currentMode: 'draw',
        modules: {}
    };

    function init() {
        setupGlobalEvents();
        setupToastHandler();
        initModules();
        switchMode(state.currentMode);
    }

    function setupGlobalEvents() {
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.addEventListener('click', () => switchMode(btn.dataset.mode));
        });

        window.addEventListener('beforeunload', handleUnload);
    }

    function setupToastHandler() {
        EventBus.on('toast:show', showToast);
    }

    function initModules() {
        if (typeof CustomModule !== 'undefined') {
            state.modules.custom = CustomModule;
            CustomModule.init();
        }
        
        if (typeof DrawModule !== 'undefined') {
            state.modules.draw = DrawModule;
            DrawModule.init();
        }
        
        if (typeof DiceModule !== 'undefined') {
            state.modules.dice = DiceModule;
            DiceModule.init();
        }
        
        if (typeof WheelModule !== 'undefined') {
            state.modules.wheel = WheelModule;
            WheelModule.init();
        }
    }

    function switchMode(mode) {
        state.currentMode = mode;
        
        document.querySelectorAll('.mode-btn').forEach(btn => {
            btn.classList.toggle('active', btn.dataset.mode === mode);
        });
        
        document.querySelectorAll('.mode-section').forEach(section => {
            section.classList.toggle('active', section.id === `mode-${mode}`);
        });
    }

    function showToast(message) {
        const toast = document.getElementById('toast');
        if (!toast) return;
        
        toast.textContent = message;
        toast.classList.add('show');
        
        setTimeout(() => {
            toast.classList.remove('show');
        }, 2000);
    }

    function handleUnload() {
        if (state.modules.wheel && typeof state.modules.wheel.destroy === 'function') {
            state.modules.wheel.destroy();
        }
        EventBus.clear();
    }

    return {
        init,
        switchMode
    };
})();

document.addEventListener('DOMContentLoaded', () => {
    App.init();
});
