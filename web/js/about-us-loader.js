/**
 * 关于我们内容加载
 */

// 加载关于我们内容
async function loadAboutUsContent() {
    try {
        console.log('Loading about us content...');
        
        const response = await fetch(`${window.api ? window.api.baseURL : '/api'}/about-us/`);
        
        if (!response.ok) {
            console.warn('Failed to load about us data, using default content');
            return;
        }

        const data = await response.json();
        console.log('About us data loaded:', data);
        
        // 更新标题
        if (data.title) {
            const titleElement = document.getElementById('about-title');
            if (titleElement) {
                titleElement.textContent = data.title;
            }
        }
        
        // 更新内容
        if (data.content) {
            const contentElement = document.getElementById('about-content');
            if (contentElement) {
                // 将换行符转换为段落
                const paragraphs = data.content.split('\n').filter(p => p.trim());
                contentElement.innerHTML = paragraphs.map(p => `<p>${p.trim()}</p>`).join('');
            }
        }
        
        // 更新样式
        updateAboutUsStyles(data);
        
    } catch (error) {
        console.error('Error loading about us content:', error);
    }
}

// 更新关于我们样式
function updateAboutUsStyles(data) {
    const aboutSection = document.getElementById('about');
    const overlay = document.querySelector('.about-background-overlay');
    
    if (!aboutSection) return;
    
    // 设置背景图片
    if (data.background_image_url) {
        aboutSection.style.backgroundImage = `url(${data.background_image_url})`;
        aboutSection.style.backgroundSize = 'cover';
        aboutSection.style.backgroundPosition = 'center';
        aboutSection.style.backgroundRepeat = 'no-repeat';
        aboutSection.style.position = 'relative';
        
        // 显示遮罩层
        if (overlay) {
            overlay.style.display = 'block';
            overlay.style.background = data.background_overlay || 'rgba(255, 255, 255, 0.8)';
        }
    } else {
        // 移除背景图片
        aboutSection.style.backgroundImage = 'none';
        if (overlay) {
            overlay.style.display = 'none';
        }
    }
    
    // 设置文字颜色
    if (data.text_color) {
        const titleElement = document.getElementById('about-title');
        const contentElement = document.getElementById('about-content');
        
        if (titleElement) {
            titleElement.style.color = data.text_color;
        }
        if (contentElement) {
            contentElement.style.color = data.text_color;
        }
    }
}

// 在DOM加载完成后自动加载内容
document.addEventListener('DOMContentLoaded', function() {
    // 延迟加载以确保其他脚本先完成
    setTimeout(loadAboutUsContent, 100);
});

// 导出函数供其他脚本使用
window.aboutUsLoader = {
    loadContent: loadAboutUsContent,
    updateStyles: updateAboutUsStyles
};