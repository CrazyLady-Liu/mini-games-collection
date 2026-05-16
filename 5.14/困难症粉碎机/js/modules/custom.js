const CustomModule = (() => {
    const DEFAULT_TEMPLATES = [
        { id: 'team-building', name: '🎯 团建活动', emoji: '🎯', options: ['密室逃脱', 'KTV唱歌', '户外烧烤', '剧本杀', '桌游聚会', '运动健身', '看电影', '聚餐火锅'] },
        { id: 'party-games', name: '🎉 聚会游戏', emoji: '🎉', options: ['真心话大冒险', '谁是卧底', '狼人杀', ' Uno牌', '大富翁', '你画我猜', '数字炸弹', '猜歌名'] },
        { id: 'food-choices', name: '🍜 今天吃什么', emoji: '🍜', options: ['火锅', '烧烤', '日料', '韩餐', '川菜', '粤菜', '西餐', '汉堡', '披萨', '麻辣烫', '螺蛳粉', '兰州拉面'] },
        { id: 'drinks', name: '🥤 喝点什么', emoji: '🥤', options: ['奶茶', '咖啡', '可乐', '果汁', '柠檬水', '绿茶', '红茶', '气泡水', '酸奶', '啤酒'] },
        { id: 'weekend-activities', name: '🌞 周末活动', emoji: '🌞', options: ['睡懒觉', '看电影', '去逛街', '宅在家打游戏', '运动健身', '看书学习', '约朋友吃饭', '看展览'] },
        { id: 'movie-genres', name: '🎬 看什么电影', emoji: '🎬', options: ['动作片', '喜剧片', '科幻片', '爱情片', '悬疑片', '恐怖片', '动画片', '纪录片'] },
        { id: 'sports', name: '⚽ 运动项目', emoji: '⚽', options: ['篮球', '足球', '羽毛球', '乒乓球', '游泳', '跑步', '健身', '瑜伽', '骑行', '攀岩'] },
        { id: 'travel', name: '✈️ 旅游目的地', emoji: '✈️', options: ['北京', '上海', '广州', '深圳', '杭州', '成都', '重庆', '西安', '厦门', '青岛', '云南', '三亚'] }
    ];

    const elements = {};

    function init() {
        cacheElements();
        bindEvents();
        ensureDefaultPresets();
        render();
    }

    function cacheElements() {
        elements.nameInput = document.getElementById('custom-name');
        elements.optionsTextarea = document.getElementById('custom-options');
        elements.saveBtn = document.getElementById('custom-save-btn');
        elements.presetList = document.getElementById('preset-list');
        elements.templateGrid = document.getElementById('template-grid');
    }

    function bindEvents() {
        elements.saveBtn.addEventListener('click', handleSave);
    }

    function ensureDefaultPresets() {
        const presets = Storage.get('presets', null);
        if (presets === null) {
            const defaultPresets = DEFAULT_TEMPLATES.slice(0, 4).map(t => ({
                id: t.id,
                name: t.name,
                options: [...t.options],
                createdAt: Date.now(),
                updatedAt: Date.now()
            }));
            Storage.set('presets', defaultPresets);
        }
    }

    function render() {
        renderPresetList();
        renderTemplateGrid();
    }

    function renderPresetList() {
        if (!elements.presetList) return;
        
        const presets = Storage.get('presets', []);
        
        if (presets.length === 0) {
            elements.presetList.innerHTML = '<div class="empty-state">暂无自定义选项集</div>';
            return;
        }
        
        elements.presetList.innerHTML = presets.map(preset => `
            <div class="preset-item" data-id="${preset.id}">
                <div class="preset-info">
                    <h4>${escapeHtml(preset.name)}</h4>
                    <p>${preset.options.length}个选项 · ${preset.options.slice(0, 3).map(escapeHtml).join('、')}${preset.options.length > 3 ? '...' : ''}</p>
                </div>
                <div class="preset-actions">
                    <button class="icon-btn" data-action="edit" data-id="${preset.id}">编辑</button>
                    <button class="icon-btn delete" data-action="delete" data-id="${preset.id}">删除</button>
                </div>
            </div>
        `).join('');
        
        elements.presetList.querySelectorAll('button[data-action]').forEach(btn => {
            btn.addEventListener('click', handlePresetAction);
        });
    }

    function renderTemplateGrid() {
        if (!elements.templateGrid) return;
        
        elements.templateGrid.innerHTML = DEFAULT_TEMPLATES.map(template => `
            <div class="template-card" data-template-id="${template.id}">
                <div class="emoji">${template.emoji}</div>
                <h4>${escapeHtml(template.name)}</h4>
                <p>${template.options.length}个选项</p>
            </div>
        `).join('');
        
        elements.templateGrid.querySelectorAll('.template-card').forEach(card => {
            card.addEventListener('click', () => {
                const templateId = card.dataset.templateId;
                importTemplate(templateId);
            });
        });
    }

    function handleSave() {
        const name = elements.nameInput.value.trim();
        const options = elements.optionsTextarea.value
            .split('\n')
            .map(o => o.trim())
            .filter(o => o.length > 0);
        
        if (!name) {
            EventBus.emit('toast:show', '请输入选项集名称');
            return;
        }
        
        if (options.length < 2) {
            EventBus.emit('toast:show', '请至少输入2个选项');
            return;
        }
        
        const id = 'custom-' + Date.now();
        const presets = Storage.get('presets', []);
        
        presets.push({
            id,
            name,
            options,
            createdAt: Date.now(),
            updatedAt: Date.now()
        });
        
        Storage.set('presets', presets, { debounce: false });
        
        elements.nameInput.value = '';
        elements.optionsTextarea.value = '';
        
        render();
        EventBus.emit('presets:updated');
        EventBus.emit('toast:show', '保存成功！');
    }

    function handlePresetAction(e) {
        const action = e.currentTarget.dataset.action;
        const id = e.currentTarget.dataset.id;
        
        if (action === 'edit') {
            handleEdit(id);
        } else if (action === 'delete') {
            handleDelete(id);
        }
    }

    function handleEdit(id) {
        const presets = Storage.get('presets', []);
        const preset = presets.find(p => p.id === id);
        if (!preset) return;
        
        elements.nameInput.value = preset.name;
        elements.optionsTextarea.value = preset.options.join('\n');
        
        deletePresetById(id);
        EventBus.emit('toast:show', '请修改后重新保存');
    }

    function handleDelete(id) {
        if (!confirm('确定要删除这个选项集吗？')) return;
        deletePresetById(id);
    }

    function deletePresetById(id) {
        let presets = Storage.get('presets', []);
        presets = presets.filter(p => p.id !== id);
        Storage.set('presets', presets, { debounce: false });
        
        render();
        EventBus.emit('presets:updated');
        EventBus.emit('toast:show', '已删除');
    }

    function importTemplate(templateId) {
        const template = DEFAULT_TEMPLATES.find(t => t.id === templateId);
        if (!template) return;
        
        const presets = Storage.get('presets', []);
        
        if (presets.some(p => p.id === templateId)) {
            EventBus.emit('toast:show', '该模板已存在');
            return;
        }
        
        presets.push({
            id: template.id,
            name: template.name,
            options: [...template.options],
            createdAt: Date.now(),
            updatedAt: Date.now()
        });
        
        Storage.set('presets', presets, { debounce: false });
        
        render();
        EventBus.emit('presets:updated');
        EventBus.emit('toast:show', `已添加「${template.name}」`);
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

window.CustomModule = CustomModule;
