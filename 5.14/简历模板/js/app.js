const mockData = {
    name: '张小明',
    title: '高级前端工程师',
    phone: '138-8888-8888',
    email: 'zhangxiaoming@email.com',
    summary: '拥有5年前端开发经验，精通React、Vue等主流框架。热爱技术，善于解决复杂问题，具备良好的团队协作能力。对前端性能优化、用户体验有深入研究，曾主导多个大型项目的前端架构设计。',
    experiences: [
        {
            id: 1,
            company: '阿里巴巴集团',
            position: '高级前端工程师',
            startDate: '2022.03',
            endDate: '至今',
            location: '杭州',
            description: '负责淘宝核心业务页面开发，主导前端架构优化，页面加载速度提升40%。带领5人团队完成多个大型项目，推动前端工程化建设。'
        },
        {
            id: 2,
            company: '字节跳动',
            position: '前端工程师',
            startDate: '2020.06',
            endDate: '2022.02',
            location: '北京',
            description: '参与抖音电商业务开发，负责商品详情页、购物车等核心模块。使用React技术栈，推动组件库建设，提升团队开发效率30%。'
        }
    ],
    educations: [
        {
            id: 1,
            school: '浙江大学',
            degree: '硕士',
            major: '计算机科学与技术',
            startDate: '2017.09',
            endDate: '2020.06',
            description: '研究方向：前端工程化。发表SCI论文2篇，获得国家奖学金，优秀毕业生。'
        },
        {
            id: 2,
            school: '武汉大学',
            degree: '本科',
            major: '软件工程',
            startDate: '2013.09',
            endDate: '2017.06',
            description: 'GPA 3.8/4.0，获得优秀毕业生称号，多次获得学业奖学金。'
        }
    ],
    skills: [
        { id: 1, name: 'React', level: '精通' },
        { id: 2, name: 'Vue', level: '精通' },
        { id: 3, name: 'TypeScript', level: '熟练' },
        { id: 4, name: 'Node.js', level: '熟练' },
        { id: 5, name: 'Webpack', level: '熟练' },
        { id: 6, name: 'Git', level: '熟练' }
    ],
    template: 'modern'
};

const App = {
    data: {
        name: '',
        title: '',
        phone: '',
        email: '',
        summary: '',
        experiences: [],
        educations: [],
        skills: [],
        template: 'classic'
    },

    init() {
        this.loadFromStorage();
        this.bindEvents();
        this.renderEditor();
        this.renderPreview();
    },

    bindEvents() {
        document.querySelectorAll('.tab-btn').forEach(btn => {
            btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
        });

        document.getElementById('template-select').addEventListener('change', (e) => {
            this.data.template = e.target.value;
            this.renderPreview();
        });

        document.getElementById('fill-btn').addEventListener('click', () => this.fillMockData());
        document.getElementById('save-btn').addEventListener('click', () => this.saveToStorage());
        document.getElementById('load-btn').addEventListener('click', () => this.loadFromStorage());
        document.getElementById('clear-btn').addEventListener('click', () => this.clearData());

        document.getElementById('add-experience').addEventListener('click', () => this.addExperience());
        document.getElementById('add-education').addEventListener('click', () => this.addEducation());
        document.getElementById('add-skill').addEventListener('click', () => this.addSkill());

        ['name', 'title', 'phone', 'email', 'summary'].forEach(field => {
            document.getElementById(field).addEventListener('input', (e) => {
                this.data[field] = e.target.value;
                this.renderPreview();
            });
        });
    },

    switchTab(tab) {
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        
        document.querySelector(`[data-tab="${tab}"]`).classList.add('active');
        document.getElementById(`tab-${tab}`).classList.add('active');
    },

    addExperience() {
        this.data.experiences.push({
            id: Date.now(),
            company: '',
            position: '',
            startDate: '',
            endDate: '',
            location: '',
            description: ''
        });
        this.renderEditor();
        this.renderPreview();
    },

    addEducation() {
        this.data.educations.push({
            id: Date.now(),
            school: '',
            degree: '',
            major: '',
            startDate: '',
            endDate: '',
            description: ''
        });
        this.renderEditor();
        this.renderPreview();
    },

    addSkill() {
        this.data.skills.push({
            id: Date.now(),
            name: '',
            level: ''
        });
        this.renderEditor();
        this.renderPreview();
    },

    removeExperience(id) {
        this.data.experiences = this.data.experiences.filter(exp => exp.id !== id);
        this.renderEditor();
        this.renderPreview();
    },

    removeEducation(id) {
        this.data.educations = this.data.educations.filter(edu => edu.id !== id);
        this.renderEditor();
        this.renderPreview();
    },

    removeSkill(id) {
        this.data.skills = this.data.skills.filter(skill => skill.id !== id);
        this.renderEditor();
        this.renderPreview();
    },

    renderEditor() {
        document.getElementById('name').value = this.data.name;
        document.getElementById('title').value = this.data.title;
        document.getElementById('phone').value = this.data.phone;
        document.getElementById('email').value = this.data.email;
        document.getElementById('summary').value = this.data.summary;
        document.getElementById('template-select').value = this.data.template;

        const expList = document.getElementById('experience-list');
        expList.innerHTML = this.data.experiences.map(exp => `
            <div class="item-card" data-id="${exp.id}">
                <div class="item-header">
                    <h4>工作经历</h4>
                    <button class="delete-btn" onclick="App.removeExperience(${exp.id})">×</button>
                </div>
                <div class="form-group">
                    <label>公司名称</label>
                    <input type="text" value="${exp.company}" oninput="App.updateExperience(${exp.id}, 'company', this.value)">
                </div>
                <div class="form-group">
                    <label>职位</label>
                    <input type="text" value="${exp.position}" oninput="App.updateExperience(${exp.id}, 'position', this.value)">
                </div>
                <div class="row">
                    <div class="form-group">
                        <label>开始时间</label>
                        <input type="text" placeholder="2020.01" value="${exp.startDate}" oninput="App.updateExperience(${exp.id}, 'startDate', this.value)">
                    </div>
                    <div class="form-group">
                        <label>结束时间</label>
                        <input type="text" placeholder="至今" value="${exp.endDate}" oninput="App.updateExperience(${exp.id}, 'endDate', this.value)">
                    </div>
                </div>
                <div class="form-group">
                    <label>工作地点</label>
                    <input type="text" value="${exp.location}" oninput="App.updateExperience(${exp.id}, 'location', this.value)">
                </div>
                <div class="form-group">
                    <label>工作描述</label>
                    <textarea rows="3" oninput="App.updateExperience(${exp.id}, 'description', this.value)">${exp.description}</textarea>
                </div>
            </div>
        `).join('');

        const eduList = document.getElementById('education-list');
        eduList.innerHTML = this.data.educations.map(edu => `
            <div class="item-card" data-id="${edu.id}">
                <div class="item-header">
                    <h4>教育经历</h4>
                    <button class="delete-btn" onclick="App.removeEducation(${edu.id})">×</button>
                </div>
                <div class="form-group">
                    <label>学校名称</label>
                    <input type="text" value="${edu.school}" oninput="App.updateEducation(${edu.id}, 'school', this.value)">
                </div>
                <div class="row">
                    <div class="form-group">
                        <label>学历</label>
                        <input type="text" placeholder="本科/硕士" value="${edu.degree}" oninput="App.updateEducation(${edu.id}, 'degree', this.value)">
                    </div>
                    <div class="form-group">
                        <label>专业</label>
                        <input type="text" value="${edu.major}" oninput="App.updateEducation(${edu.id}, 'major', this.value)">
                    </div>
                </div>
                <div class="row">
                    <div class="form-group">
                        <label>开始时间</label>
                        <input type="text" placeholder="2016.09" value="${edu.startDate}" oninput="App.updateEducation(${edu.id}, 'startDate', this.value)">
                    </div>
                    <div class="form-group">
                        <label>结束时间</label>
                        <input type="text" placeholder="2020.06" value="${edu.endDate}" oninput="App.updateEducation(${edu.id}, 'endDate', this.value)">
                    </div>
                </div>
                <div class="form-group">
                    <label>描述</label>
                    <textarea rows="2" oninput="App.updateEducation(${edu.id}, 'description', this.value)">${edu.description}</textarea>
                </div>
            </div>
        `).join('');

        const skillList = document.getElementById('skills-list');
        skillList.innerHTML = this.data.skills.map(skill => `
            <div class="item-card" data-id="${skill.id}">
                <div class="item-header">
                    <h4>技能</h4>
                    <button class="delete-btn" onclick="App.removeSkill(${skill.id})">×</button>
                </div>
                <div class="row">
                    <div class="form-group">
                        <label>技能名称</label>
                        <input type="text" value="${skill.name}" oninput="App.updateSkill(${skill.id}, 'name', this.value)">
                    </div>
                    <div class="form-group">
                        <label>熟练程度</label>
                        <input type="text" placeholder="熟练/精通" value="${skill.level}" oninput="App.updateSkill(${skill.id}, 'level', this.value)">
                    </div>
                </div>
            </div>
        `).join('');
    },

    updateExperience(id, field, value) {
        const exp = this.data.experiences.find(e => e.id === id);
        if (exp) {
            exp[field] = value;
            this.renderPreview();
        }
    },

    updateEducation(id, field, value) {
        const edu = this.data.educations.find(e => e.id === id);
        if (edu) {
            edu[field] = value;
            this.renderPreview();
        }
    },

    updateSkill(id, field, value) {
        const skill = this.data.skills.find(s => s.id === id);
        if (skill) {
            skill[field] = value;
            this.renderPreview();
        }
    },

    renderPreview() {
        const previewEl = document.getElementById('resume-preview');
        const template = templates[this.data.template] || templates.classic;
        previewEl.innerHTML = template(this.data);
    },

    saveToStorage() {
        const success = Storage.save(this.data);
        if (success) {
            alert('数据保存成功！');
        } else {
            alert('数据保存失败，请检查浏览器设置。');
        }
    },

    loadFromStorage() {
        const saved = Storage.load();
        if (saved) {
            this.data = { ...this.data, ...saved };
            this.renderEditor();
            this.renderPreview();
        }
    },

    clearData() {
        if (confirm('确定要清空所有数据吗？此操作不可恢复。')) {
            Storage.clear();
            this.data = {
                name: '',
                title: '',
                phone: '',
                email: '',
                summary: '',
                experiences: [],
                educations: [],
                skills: [],
                template: 'classic'
            };
            this.renderEditor();
            this.renderPreview();
        }
    },

    fillMockData() {
        this.data = JSON.parse(JSON.stringify(mockData));
        this.renderEditor();
        this.renderPreview();
        alert('模拟数据已填充！');
    }
};

document.addEventListener('DOMContentLoaded', () => App.init());
