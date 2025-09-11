/**
 * 管理员界面增强功能
 */

// 页面标题映射
const pageTitles = {
    'dashboard': '仪表板',
    'categories': '分类管理',
    'products': '产品管理',
    'uploads': '文件上传',
    'settings': '系统设置'
};

// 初始化增强功能
document.addEventListener('DOMContentLoaded', function() {
    initializeEnhancements();
});

function initializeEnhancements() {
    // 初始化菜单增强
    enhanceMenuNavigation();
    
    // 初始化卡片动画
    initializeCardAnimations();
    
    // 初始化提示系统
    initializeToastSystem();
    
    // 初始化数字动画
    initializeCounterAnimations();
    
    // 初始化响应式侧边栏
    initializeResponsiveSidebar();
}

// 增强菜单导航
function enhanceMenuNavigation() {
    const menuItems = document.querySelectorAll('.menu-item');
    const pageTitleElement = document.getElementById('current-page-title');
    
    menuItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            
            // 更新页面标题
            const section = this.dataset.section;
            if (pageTitleElement && pageTitles[section]) {
                pageTitleElement.textContent = pageTitles[section];
                
                // 添加图标
                const icon = this.querySelector('i').className;
                pageTitleElement.innerHTML = `<i class="${icon}"></i> ${pageTitles[section]}`;
            }
            
            // 原有的菜单切换逻辑
            switchSection(section);
        });
    });
}

// 卡片动画初始化
function initializeCardAnimations() {
    // 为统计卡片添加延迟动画
    const statCards = document.querySelectorAll('.stat-card');
    statCards.forEach((card, index) => {
        card.style.animationDelay = `${index * 0.1}s`;
        card.classList.add('fade-in');
    });
}

// 提示系统
let toastContainer = null;

function initializeToastSystem() {
    // 创建提示容器
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    toastContainer.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        z-index: 10000;
        display: flex;
        flex-direction: column;
        gap: 10px;
    `;
    document.body.appendChild(toastContainer);
}

function showToast(message, type = 'info', duration = 3000) {
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    
    const icon = getToastIcon(type);
    toast.innerHTML = `
        <i class="${icon}"></i>
        <span>${message}</span>
        <button onclick="this.parentElement.remove()" style="
            background: none;
            border: none;
            color: white;
            font-size: 1.2rem;
            cursor: pointer;
            margin-left: auto;
        ">×</button>
    `;
    
    toastContainer.appendChild(toast);
    
    // 显示动画
    setTimeout(() => toast.classList.add('show'), 100);
    
    // 自动隐藏
    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

function getToastIcon(type) {
    const icons = {
        success: 'fas fa-check-circle',
        error: 'fas fa-exclamation-circle',
        warning: 'fas fa-exclamation-triangle',
        info: 'fas fa-info-circle'
    };
    return icons[type] || icons.info;
}

// 数字动画
function initializeCounterAnimations() {
    const counters = document.querySelectorAll('.stat-info h3');
    
    const animateCounter = (element, target) => {
        const duration = 1000;
        const start = 0;
        const increment = target / (duration / 16);
        let current = start;
        
        const updateCounter = () => {
            current += increment;
            if (current < target) {
                element.textContent = Math.floor(current);
                requestAnimationFrame(updateCounter);
            } else {
                element.textContent = target;
            }
        };
        
        updateCounter();
    };
    
    // 在数据加载后触发动画
    const originalLoadDashboardData = window.loadDashboardData;
    window.loadDashboardData = async function() {
        await originalLoadDashboardData.call(this);
        
        // 延迟执行动画
        setTimeout(() => {
            counters.forEach(counter => {
                const target = parseInt(counter.textContent) || 0;
                counter.textContent = '0';
                animateCounter(counter, target);
            });
        }, 500);
    };
}

// 响应式侧边栏
function initializeResponsiveSidebar() {
    // 创建移动端菜单按钮
    const mobileMenuBtn = document.createElement('button');
    mobileMenuBtn.innerHTML = '<i class="fas fa-bars"></i>';
    mobileMenuBtn.className = 'mobile-menu-btn';
    mobileMenuBtn.style.cssText = `
        display: none;
        position: fixed;
        top: 15px;
        left: 15px;
        z-index: 1001;
        background: var(--primary-color);
        color: white;
        border: none;
        padding: 10px;
        border-radius: 6px;
        cursor: pointer;
    `;
    
    document.body.appendChild(mobileMenuBtn);
    
    const sidebar = document.querySelector('.sidebar');
    
    mobileMenuBtn.addEventListener('click', () => {
        sidebar.classList.toggle('mobile-open');
    });
    
    // 点击侧边栏外区域关闭菜单
    document.addEventListener('click', (e) => {
        if (window.innerWidth <= 768 && 
            !sidebar.contains(e.target) && 
            !mobileMenuBtn.contains(e.target)) {
            sidebar.classList.remove('mobile-open');
        }
    });
    
    // 响应式显示/隐藏菜单按钮
    function checkScreenSize() {
        if (window.innerWidth <= 768) {
            mobileMenuBtn.style.display = 'block';
        } else {
            mobileMenuBtn.style.display = 'none';
            sidebar.classList.remove('mobile-open');
        }
    }
    
    window.addEventListener('resize', checkScreenSize);
    checkScreenSize();
}

// 加载状态管理
function showLoading(message = '加载中...') {
    let loadingOverlay = document.getElementById('loading-overlay');
    if (!loadingOverlay) {
        loadingOverlay = document.createElement('div');
        loadingOverlay.id = 'loading-overlay';
        loadingOverlay.className = 'loading-overlay';
        loadingOverlay.innerHTML = `
            <div style="text-align: center;">
                <div class="loading-spinner"></div>
                <p style="margin-top: 16px; color: var(--text-secondary);">${message}</p>
            </div>
        `;
        document.body.appendChild(loadingOverlay);
    }
    loadingOverlay.style.display = 'flex';
}

function hideLoading() {
    const loadingOverlay = document.getElementById('loading-overlay');
    if (loadingOverlay) {
        loadingOverlay.style.display = 'none';
    }
}

// 增强原有函数
const originalShowLoading = window.showLoading || function() {};
const originalHideLoading = window.hideLoading || function() {};

window.showLoading = showLoading;
window.hideLoading = hideLoading;
window.showToast = showToast;

// 拦截API调用以显示友好提示
const originalAPI = window.api;
if (originalAPI) {
    // 增强登录函数
    const originalLogin = originalAPI.login;
    originalAPI.login = async function(...args) {
        try {
            showLoading('正在登录...');
            const result = await originalLogin.apply(this, args);
            hideLoading();
            showToast('登录成功！', 'success');
            return result;
        } catch (error) {
            hideLoading();
            showToast('登录失败: ' + error.message, 'error');
            throw error;
        }
    };
    
    // 增强CRUD操作
    const operations = ['createCategory', 'updateCategory', 'deleteCategory', 
                       'createProduct', 'updateProduct', 'deleteProduct'];
    
    operations.forEach(op => {
        if (originalAPI[op]) {
            const originalFn = originalAPI[op];
            originalAPI[op] = async function(...args) {
                try {
                    const result = await originalFn.apply(this, args);
                    const action = op.includes('create') ? '创建' : 
                                  op.includes('update') ? '更新' : '删除';
                    const type = op.includes('Category') ? '分类' : '产品';
                    showToast(`${action}${type}成功！`, 'success');
                    return result;
                } catch (error) {
                    const action = op.includes('create') ? '创建' : 
                                  op.includes('update') ? '更新' : '删除';
                    const type = op.includes('Category') ? '分类' : '产品';
                    showToast(`${action}${type}失败: ${error.message}`, 'error');
                    throw error;
                }
            };
        }
    });
}
