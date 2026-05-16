const templates = {
    classic: (data) => {
        const experiences = data.experiences.map(exp => `
            <div class="item">
                <div class="item-header">
                    <span class="item-title">${exp.company} - ${exp.position}</span>
                    <span class="item-date">${exp.startDate} - ${exp.endDate || '至今'}</span>
                </div>
                <div class="item-subtitle">${exp.location || ''}</div>
                <div class="item-desc">${exp.description || ''}</div>
            </div>
        `).join('');

        const educations = data.educations.map(edu => `
            <div class="item">
                <div class="item-header">
                    <span class="item-title">${edu.school} - ${edu.degree}</span>
                    <span class="item-date">${edu.startDate} - ${edu.endDate || '至今'}</span>
                </div>
                <div class="item-subtitle">${edu.major || ''}</div>
                <div class="item-desc">${edu.description || ''}</div>
            </div>
        `).join('');

        const skills = data.skills.map(skill => `
            <span class="skill-tag">${skill.name}${skill.level ? ` - ${skill.level}` : ''}</span>
        `).join('');

        return `
            <div class="resume-preview template-classic">
                <div class="resume-header">
                    <div class="name">${data.name || '您的姓名'}</div>
                    <div class="title">${data.title || '目标职位'}</div>
                    <div class="contact">
                        ${data.phone ? `📞 ${data.phone}` : ''}
                        ${data.phone && data.email ? ' | ' : ''}
                        ${data.email ? `✉️ ${data.email}` : ''}
                    </div>
                </div>

                ${data.summary ? `
                <div class="section">
                    <div class="section-title">个人简介</div>
                    <div class="summary">${data.summary}</div>
                </div>
                ` : ''}

                ${data.experiences.length > 0 ? `
                <div class="section">
                    <div class="section-title">工作经历</div>
                    ${experiences}
                </div>
                ` : ''}

                ${data.educations.length > 0 ? `
                <div class="section">
                    <div class="section-title">教育经历</div>
                    ${educations}
                </div>
                ` : ''}

                ${data.skills.length > 0 ? `
                <div class="section">
                    <div class="section-title">专业技能</div>
                    <div class="skills-list">${skills}</div>
                </div>
                ` : ''}
            </div>
        `;
    },

    modern: (data) => {
        const experiences = data.experiences.map(exp => `
            <div class="item">
                <div class="item-header">
                    <span class="item-title">${exp.position}</span>
                    <span class="item-date">${exp.startDate} - ${exp.endDate || '至今'}</span>
                </div>
                <div class="item-subtitle">${exp.company}${exp.location ? ` · ${exp.location}` : ''}</div>
                <div class="item-desc">${exp.description || ''}</div>
            </div>
        `).join('');

        const educations = data.educations.map(edu => `
            <div class="item">
                <div class="item-header">
                    <span class="item-title">${edu.degree}</span>
                    <span class="item-date">${edu.startDate} - ${edu.endDate || '至今'}</span>
                </div>
                <div class="item-subtitle">${edu.school}${edu.major ? ` · ${edu.major}` : ''}</div>
                <div class="item-desc">${edu.description || ''}</div>
            </div>
        `).join('');

        const skills = data.skills.map(skill => `
            <span class="skill-tag">${skill.name}</span>
        `).join('');

        const contactInfo = [
            data.phone ? `<div class="contact-item"><span>📞</span>${data.phone}</div>` : '',
            data.email ? `<div class="contact-item"><span>✉️</span>${data.email}</div>` : ''
        ].filter(Boolean).join('');

        return `
            <div class="resume-preview template-modern">
                <div class="sidebar">
                    <div class="profile-img">${(data.name || 'N').charAt(0).toUpperCase()}</div>
                    <div class="name">${data.name || '您的姓名'}</div>
                    <div class="title">${data.title || '目标职位'}</div>
                    
                    ${contactInfo ? `
                    <div class="sidebar-section">
                        <h3>联系方式</h3>
                        ${contactInfo}
                    </div>
                    ` : ''}

                    ${data.summary ? `
                    <div class="sidebar-section">
                        <h3>个人简介</h3>
                        <div class="sidebar-about">${data.summary}</div>
                    </div>
                    ` : ''}

                    ${data.skills.length > 0 ? `
                    <div class="sidebar-section">
                        <h3>专业技能</h3>
                        <div class="skills-list">${skills}</div>
                    </div>
                    ` : ''}
                </div>

                <div class="main-content-resume">
                    ${data.experiences.length > 0 ? `
                    <div class="section">
                        <div class="section-title">工作经历</div>
                        ${experiences}
                    </div>
                    ` : ''}

                    ${data.educations.length > 0 ? `
                    <div class="section">
                        <div class="section-title">教育经历</div>
                        ${educations}
                    </div>
                    ` : ''}
                </div>
            </div>
        `;
    },

    minimal: (data) => {
        const experiences = data.experiences.map(exp => `
            <div class="item">
                <div class="item-header">
                    <span class="item-title">${exp.position}</span>
                    <span class="item-date">${exp.startDate} — ${exp.endDate || '至今'}</span>
                </div>
                <div class="item-subtitle">${exp.company}${exp.location ? ` · ${exp.location}` : ''}</div>
                ${exp.description ? `<div class="item-desc">${exp.description}</div>` : ''}
            </div>
        `).join('');

        const educations = data.educations.map(edu => `
            <div class="item">
                <div class="item-header">
                    <span class="item-title">${edu.school}</span>
                    <span class="item-date">${edu.startDate} — ${edu.endDate || '至今'}</span>
                </div>
                <div class="item-subtitle">${edu.degree}${edu.major ? ` · ${edu.major}` : ''}</div>
                ${edu.description ? `<div class="item-desc">${edu.description}</div>` : ''}
            </div>
        `).join('');

        const skills = data.skills.map(skill => `
            <span class="skill-tag">${skill.name}</span>
        `).join('');

        return `
            <div class="resume-preview template-minimal">
                <div class="resume-header">
                    <div class="name">${data.name || '您的姓名'}</div>
                    <div class="title">${data.title || '目标职位'}</div>
                    <div class="contact">
                        ${data.phone ? `<span>📞 ${data.phone}</span>` : ''}
                        ${data.email ? `<span>✉️ ${data.email}</span>` : ''}
                    </div>
                </div>

                ${data.summary ? `
                <div class="section">
                    <div class="section-title">简介</div>
                    <div class="summary">${data.summary}</div>
                </div>
                ` : ''}

                ${data.experiences.length > 0 ? `
                <div class="section">
                    <div class="section-title">工作经历</div>
                    ${experiences}
                </div>
                ` : ''}

                ${data.educations.length > 0 ? `
                <div class="section">
                    <div class="section-title">教育经历</div>
                    ${educations}
                </div>
                ` : ''}

                ${data.skills.length > 0 ? `
                <div class="section">
                    <div class="section-title">技能</div>
                    <div class="skills-list">${skills}</div>
                </div>
                ` : ''}
            </div>
        `;
    }
};
