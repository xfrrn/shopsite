/**
 * 页脚信息加载器
 * 负责从API加载页脚信息并渲染到页面
 */

class FooterLoader {
    constructor() {
        this.apiUrl = '/api/footer-info/';
        this.isLoaded = false;
    }

    /**
     * 加载页脚信息
     */
    async loadContent() {
        try {
            console.log('Loading footer info...');
            
            const response = await fetch(this.apiUrl);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const footerData = await response.json();
            this.renderFooter(footerData);
            this.isLoaded = true;
            
        } catch (error) {
            console.error('加载页脚信息失败:', error);
            // 保持默认内容，不进行渲染
        }
    }

    /**
     * 渲染页脚信息
     */
    renderFooter(data) {
        try {
            // 获取当前语言
            const currentLang = window.i18n ? window.i18n.getCurrentLanguage() : 'zh';
            
            // 关于我们部分
            const aboutTitle = document.getElementById('footer-about-title');
            const aboutContent = document.getElementById('footer-about-content');
            
            if (aboutTitle) {
                aboutTitle.textContent = currentLang === 'en' && data.about_title_en 
                    ? data.about_title_en 
                    : data.about_title || '关于我们';
            }
            
            if (aboutContent) {
                aboutContent.textContent = currentLang === 'en' && data.about_content_en 
                    ? data.about_content_en 
                    : data.about_content || '我们致力于为客户提供高质量的产品和优质的服务体验。';
            }

            // 快速链接部分
            const quickLinksTitle = document.getElementById('footer-quicklinks-title');
            if (quickLinksTitle) {
                quickLinksTitle.textContent = currentLang === 'en' && data.quick_links_title_en 
                    ? data.quick_links_title_en 
                    : data.quick_links_title || '快速链接';
            }

            // 联系我们部分
            const contactTitle = document.getElementById('footer-contact-title');
            const contactEmail = document.getElementById('footer-contact-email');
            const contactPhone = document.getElementById('footer-contact-phone');
            const contactAddress = document.getElementById('footer-contact-address');
            
            if (contactTitle) {
                contactTitle.textContent = currentLang === 'en' && data.contact_title_en 
                    ? data.contact_title_en 
                    : data.contact_title || '联系我们';
            }
            
            if (contactEmail && data.contact_email) {
                contactEmail.textContent = data.contact_email;
            }
            
            if (contactPhone && data.contact_phone) {
                contactPhone.textContent = data.contact_phone;
            }
            
            if (contactAddress) {
                contactAddress.textContent = currentLang === 'en' && data.contact_address_en 
                    ? data.contact_address_en 
                    : data.contact_address || '中国，上海市';
            }

            // 社交媒体部分
            const socialTitle = document.getElementById('footer-social-title');
            if (socialTitle) {
                socialTitle.textContent = currentLang === 'en' && data.social_title_en 
                    ? data.social_title_en 
                    : data.social_title || '关注我们';
            }

            // 社交媒体链接
            const wechatLink = document.getElementById('footer-wechat-link');
            const weiboLink = document.getElementById('footer-weibo-link');
            const githubLink = document.getElementById('footer-github-link');
            
            if (wechatLink && data.wechat_url) {
                wechatLink.href = data.wechat_url;
            }
            
            if (weiboLink && data.weibo_url) {
                weiboLink.href = data.weibo_url;
            }
            
            if (githubLink && data.github_url) {
                githubLink.href = data.github_url;
            }

            // 版权信息
            const copyright = document.getElementById('footer-copyright');
            if (copyright) {
                copyright.textContent = currentLang === 'en' && data.copyright_text_en 
                    ? data.copyright_text_en 
                    : data.copyright_text || '© 2024 产品展示网站. 保留所有权利.';
            }
            
            console.log('页脚信息渲染完成');
            
        } catch (error) {
            console.error('渲染页脚信息失败:', error);
        }
    }

    /**
     * 获取当前页脚数据（用于管理员编辑）
     */
    async getCurrentData() {
        try {
            const response = await fetch(this.apiUrl);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            return await response.json();
        } catch (error) {
            console.error('获取页脚数据失败:', error);
            return null;
        }
    }

    /**
     * 更新页脚信息（用于管理员编辑）
     */
    async updateData(data) {
        try {
            const response = await fetch(this.apiUrl, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data)
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const result = await response.json();
            
            // 更新后重新渲染
            this.renderFooter(result);
            
            return result;
        } catch (error) {
            console.error('更新页脚信息失败:', error);
            throw error;
        }
    }
}

// 创建全局实例
window.footerLoader = new FooterLoader();

// 页面加载完成后自动加载页脚信息
document.addEventListener('DOMContentLoaded', () => {
    if (window.footerLoader) {
        window.footerLoader.loadContent();
    }
});

// 监听语言切换事件
window.addEventListener('languageChanged', () => {
    if (window.footerLoader && window.footerLoader.isLoaded) {
        // 重新加载页脚信息以应用新语言
        window.footerLoader.loadContent();
    }
});