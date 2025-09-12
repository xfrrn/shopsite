/**
 * 顶部信息栏滚动控制
 */

class TopInfoBarController {
    constructor() {
        this.topBar = document.getElementById('topInfoBar');
        this.navbar = document.querySelector('.navbar');
        this.body = document.body;
        this.lastScrollY = 0;
        this.isVisible = true;
        this.scrollThreshold = 10; // 滚动阈值
        
        this.init();
    }
    
    init() {
        if (!this.topBar) return;
        
        // 添加body class以启用顶部信息栏样式
        this.body.classList.add('has-top-bar');
        
        // 绑定滚动事件
        this.bindScrollEvents();
        
        // 添加社交媒体颜色类
        this.addSocialColors();
        
        // 初始状态检查
        this.checkInitialState();
    }
    
    bindScrollEvents() {
        let ticking = false;
        
        window.addEventListener('scroll', () => {
            if (!ticking) {
                requestAnimationFrame(() => {
                    this.handleScroll();
                    ticking = false;
                });
                ticking = true;
            }
        });
    }
    
    handleScroll() {
        const currentScrollY = window.scrollY;
        
        // 如果在页面顶部（滚动距离小于阈值）
        if (currentScrollY <= this.scrollThreshold) {
            this.showTopBar();
        } else {
            this.hideTopBar();
        }
        
        this.lastScrollY = currentScrollY;
    }
    
    showTopBar() {
        if (!this.isVisible) {
            this.topBar.classList.remove('hidden');
            this.body.classList.remove('top-bar-hidden');
            this.isVisible = true;
            
            // 立即更新导航栏位置
            this.updateNavbarPosition();
            
            console.log('顶部信息栏显示');
        }
    }
    
    hideTopBar() {
        if (this.isVisible) {
            this.topBar.classList.add('hidden');
            this.body.classList.add('top-bar-hidden');
            this.isVisible = false;
            
            // 立即更新导航栏位置
            this.updateNavbarPosition();
            
            console.log('顶部信息栏隐藏');
        }
    }
    
    updateNavbarPosition() {
        if (!this.navbar) return;
        
        const hasTopBar = this.body.classList.contains('has-top-bar');
        const topBarHidden = this.body.classList.contains('top-bar-hidden');
        
        // 根据顶部信息栏状态更新导航栏位置
        let navbarTop = '0px';
        if (hasTopBar && !topBarHidden) {
            navbarTop = '40px'; // 顶部信息栏高度
        }
        
        this.navbar.style.setProperty('top', navbarTop, 'important');
        console.log(`导航栏位置已更新: ${navbarTop}`);
    }
    
    addSocialColors() {
        // 为社交媒体图标添加悬浮颜色类
        const socialLinks = {
            'wechatLink': 'wechat-color',
            'weiboLink': 'weibo-color',
            'qqLink': 'qq-color',
            'githubLink': 'github-color',
            'linkedinLink': 'linkedin-color'
        };
        
        Object.entries(socialLinks).forEach(([id, colorClass]) => {
            const element = document.getElementById(id);
            if (element) {
                element.classList.add(colorClass);
            }
        });
    }
    
    checkInitialState() {
        // 页面加载时检查初始滚动位置
        const currentScrollY = window.scrollY;
        if (currentScrollY > this.scrollThreshold) {
            this.hideTopBar();
        } else {
            // 确保导航栏位置正确
            this.updateNavbarPosition();
        }
    }
}

// 加载顶部信息栏数据
async function loadTopInfoBarData() {
    try {
        console.log('Loading top info bar data...');
        
        // 这里可以从API加载数据，暂时使用默认配置
        const apiBase = window.api ? window.api.baseURL : (window.location.hostname === 'localhost' ? 'http://localhost:8000/api' : '/api');
        const response = await fetch(`${apiBase}/top-info/`);
        
        if (response.ok) {
            const data = await response.json();
            updateTopInfoBar(data);
        } else {
            console.log('Using default top info bar data');
            // 使用默认数据
            setDefaultTopInfoBar();
        }
    } catch (error) {
        console.warn('Failed to load top info bar data, using defaults:', error);
        setDefaultTopInfoBar();
    }
}

// 更新顶部信息栏内容
function updateTopInfoBar(data) {
    // 更新联系信息
    if (data.phone) {
        const phoneElement = document.getElementById('servicePhone');
        if (phoneElement) {
            phoneElement.textContent = data.phone;
            phoneElement.href = `tel:${data.phone}`;
        }
    }
    
    if (data.email) {
        const emailElement = document.getElementById('serviceEmail');
        if (emailElement) {
            emailElement.textContent = data.email;
            emailElement.href = `mailto:${data.email}`;
        }
    }
    
    // 更新社交媒体链接
    const socialLinks = ['wechat', 'weibo', 'qq', 'github', 'linkedin'];
    socialLinks.forEach(platform => {
        const element = document.getElementById(`${platform}Link`);
        if (element && data[platform + '_url']) {
            element.href = data[platform + '_url'];
            element.addEventListener('click', (e) => {
                if (platform === 'wechat' && data.wechat_qr) {
                    // 微信可以显示二维码
                    e.preventDefault();
                    showWeChatQR(data.wechat_qr);
                }
            });
        }
    });
}

// 设置默认的顶部信息栏数据
function setDefaultTopInfoBar() {
    const defaultData = {
        phone: '400-123-4567',
        email: 'service@example.com',
        wechat_url: '#',
        weibo_url: 'https://weibo.com/',
        qq_url: 'https://qzone.qq.com/',
        github_url: 'https://github.com/',
        linkedin_url: 'https://linkedin.com/'
    };
    
    updateTopInfoBar(defaultData);
}

// 显示微信二维码（可选功能）
function showWeChatQR(qrUrl) {
    // 创建模态框显示微信二维码
    const modal = document.createElement('div');
    modal.className = 'wechat-qr-modal';
    modal.innerHTML = `
        <div class="qr-modal-content">
            <span class="qr-close">&times;</span>
            <h3>扫码关注微信</h3>
            <img src="${qrUrl}" alt="微信二维码" class="qr-image">
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // 关闭功能
    modal.addEventListener('click', (e) => {
        if (e.target === modal || e.target.classList.contains('qr-close')) {
            document.body.removeChild(modal);
        }
    });
}

// DOM加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    // 初始化顶部信息栏控制器
    new TopInfoBarController();
    
    // 加载顶部信息栏数据
    setTimeout(loadTopInfoBarData, 100);
});

// 导出到全局以供其他脚本使用
window.TopInfoBarController = TopInfoBarController;