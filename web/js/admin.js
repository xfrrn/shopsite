/**
 * 管理后台JavaScript逻辑
 */

// 全局变量
let currentEditingCategory = null;
let currentEditingProduct = null;

// 缓存变量 - 避免重复API调用
let adminCache = {
    categories: null,
    categoriesTime: 0,
    products: null,
    productsTime: 0,
    stats: null,
    statsTime: 0
};
const CACHE_DURATION = 3 * 60 * 1000; // 3分钟缓存

// DOM加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    console.log('Admin panel script loaded');
    console.log('API available:', typeof api !== 'undefined' && api);
    
    // 检查登录状态
    checkAuthStatus();
    
    // 绑定登录表单
    bindLoginForm();
    
    // 绑定管理后台事件
    bindAdminEvents();
});

// 检查认证状态
function checkAuthStatus() {
    console.log('Checking auth status...');
    console.log('API is authenticated:', api.isAuthenticated());
    console.log('Token:', api.token);
    
    if (api.isAuthenticated()) {
        console.log('User is authenticated, showing admin panel');
        showAdminPanel();
        loadAdminData();
    } else {
        console.log('User not authenticated, showing login page');
        showLoginPage();
    }
}

// ==================== 背景图管理功能 ====================

let currentEditingBackgroundImage = null;

// 加载背景图数据
async function loadBackgroundImagesData() {
    try {
        showLoading();
        const response = await fetch('/api/admin/background-images/', {
            headers: {
                'Authorization': `Bearer ${api.getToken()}`
            }
        });

        if (response.ok) {
            const data = await response.json();
            displayBackgroundImages(data.items);
        } else {
            console.error('加载背景图失败:', response.statusText);
            showError('加载背景图失败');
        }
    } catch (error) {
        console.error('加载背景图出错:', error);
        showError('加载背景图出错');
    } finally {
        hideLoading();
    }
}

// 显示背景图列表
function displayBackgroundImages(backgroundImages) {
    const tableBody = document.getElementById('background-images-table');
    if (!tableBody) return;

    if (backgroundImages.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="7" class="text-center">暂无背景图</td></tr>';
        return;
    }

    tableBody.innerHTML = backgroundImages.map(bg => `
        <tr>
            <td>
                <img src="${bg.image_url}" alt="${bg.title_zh || bg.title}" style="width: 60px; height: 40px; object-fit: cover; border-radius: 4px;">
            </td>
            <td>
                <strong>${bg.title_zh || bg.title}</strong>
                ${bg.title_en ? `<br><small class="text-muted">${bg.title_en}</small>` : ''}
            </td>
            <td>
                ${bg.subtitle_zh || bg.subtitle || '-'}
                ${bg.subtitle_en ? `<br><small class="text-muted">${bg.subtitle_en}</small>` : ''}
            </td>
            <td>
                ${bg.button_text_zh || bg.button_text || '-'}
                ${bg.button_text_en ? `<br><small class="text-muted">${bg.button_text_en}</small>` : ''}
            </td>
            <td>${bg.sort_order}</td>
            <td>
                <span class="status ${bg.is_active ? 'status-active' : 'status-inactive'}">
                    ${bg.is_active ? '启用' : '禁用'}
                </span>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-sm btn-info" onclick="editBackgroundImage(${bg.id})" title="编辑">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn btn-sm ${bg.is_active ? 'btn-warning' : 'btn-success'}" 
                            onclick="toggleBackgroundImageStatus(${bg.id})" 
                            title="${bg.is_active ? '禁用' : '启用'}">
                        <i class="fas ${bg.is_active ? 'fa-eye-slash' : 'fa-eye'}"></i>
                    </button>
                    <button class="btn btn-sm btn-danger" onclick="deleteBackgroundImage(${bg.id})" title="删除">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
}

// 显示背景图模态框
function showBackgroundImageModal(backgroundImage = null) {
    const modal = document.getElementById('background-image-modal');
    const title = document.getElementById('background-image-modal-title');
    const form = document.getElementById('background-image-form');
    
    currentEditingBackgroundImage = backgroundImage;
    
    if (backgroundImage) {
        title.textContent = '编辑背景图';
        // 填充表单数据 - 中文环境下直接使用title_zh
        document.getElementById('bg-title').value = backgroundImage.title_zh || backgroundImage.title || '';
        document.getElementById('bg-title-en').value = backgroundImage.title_en || '';
        document.getElementById('bg-subtitle').value = backgroundImage.subtitle_zh || backgroundImage.subtitle || '';
        document.getElementById('bg-subtitle-en').value = backgroundImage.subtitle_en || '';
        document.getElementById('bg-button-text').value = backgroundImage.button_text_zh || backgroundImage.button_text || '';
        document.getElementById('bg-button-text-en').value = backgroundImage.button_text_en || '';
        document.getElementById('bg-button-link').value = backgroundImage.button_link || '';
        document.getElementById('bg-image-url').value = backgroundImage.image_url || '';
        document.getElementById('bg-sort-order').value = backgroundImage.sort_order || 0;
        document.getElementById('bg-is-active').checked = backgroundImage.is_active;
        
        // 显示图片预览
        updateImagePreview('bg-image-url');
    } else {
        title.textContent = '新增背景图';
        form.reset();
        document.getElementById('bg-is-active').checked = true;
        clearImagePreview('bg-image-preview');
    }
    
    modal.style.display = 'flex';
}

// 关闭背景图模态框
function closeBackgroundImageModal() {
    const modal = document.getElementById('background-image-modal');
    modal.style.display = 'none';
    currentEditingBackgroundImage = null;
}

// 编辑背景图
async function editBackgroundImage(id) {
    try {
        showLoading();
        const response = await fetch(`/api/admin/background-images/${id}`, {
            headers: {
                'Authorization': `Bearer ${api.getToken()}`
            }
        });

        if (response.ok) {
            const backgroundImage = await response.json();
            showBackgroundImageModal(backgroundImage);
        } else {
            showError('获取背景图信息失败');
        }
    } catch (error) {
        console.error('获取背景图信息出错:', error);
        showError('获取背景图信息出错');
    } finally {
        hideLoading();
    }
}

// 切换背景图状态
async function toggleBackgroundImageStatus(id) {
    try {
        showLoading();
        const response = await fetch(`/api/admin/background-images/${id}/toggle`, {
            method: 'PATCH',
            headers: {
                'Authorization': `Bearer ${api.getToken()}`,
                'Content-Type': 'application/json'
            }
        });

        if (response.ok) {
            showSuccess('背景图状态更新成功');
            loadBackgroundImagesData();
            // 刷新前端轮播
            if (typeof refreshHeroCarousel === 'function') {
                refreshHeroCarousel();
            }
        } else {
            showError('背景图状态更新失败');
        }
    } catch (error) {
        console.error('背景图状态更新出错:', error);
        showError('背景图状态更新出错');
    } finally {
        hideLoading();
    }
}

// 删除背景图
async function deleteBackgroundImage(id) {
    if (!confirm('确定要删除这个背景图吗？此操作不可恢复。')) {
        return;
    }

    try {
        showLoading();
        const response = await fetch(`/api/admin/background-images/${id}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${api.getToken()}`
            }
        });

        if (response.ok) {
            showSuccess('背景图删除成功');
            loadBackgroundImagesData();
            // 刷新前端轮播
            if (typeof refreshHeroCarousel === 'function') {
                refreshHeroCarousel();
            }
        } else {
            showError('背景图删除失败');
        }
    } catch (error) {
        console.error('背景图删除出错:', error);
        showError('背景图删除出错');
    } finally {
        hideLoading();
    }
}

// 绑定背景图表单提交事件
document.addEventListener('DOMContentLoaded', function() {
    const bgForm = document.getElementById('background-image-form');
    if (bgForm) {
        bgForm.addEventListener('submit', handleBackgroundImageSubmit);
    }
    
    // 绑定图片URL输入框事件
    const bgImageUrl = document.getElementById('bg-image-url');
    if (bgImageUrl) {
        bgImageUrl.addEventListener('input', () => updateImagePreview('bg-image-url'));
    }
});

// 处理背景图表单提交
async function handleBackgroundImageSubmit(e) {
    e.preventDefault();
    
    const formData = {
        title_zh: document.getElementById('bg-title').value,  // 中文标题直接存储为title_zh
        title_en: document.getElementById('bg-title-en').value,
        subtitle_zh: document.getElementById('bg-subtitle').value,  // 中文副标题直接存储为subtitle_zh
        subtitle_en: document.getElementById('bg-subtitle-en').value,
        button_text_zh: document.getElementById('bg-button-text').value,  // 中文按钮文本直接存储为button_text_zh
        button_text_en: document.getElementById('bg-button-text-en').value,
        button_link: document.getElementById('bg-button-link').value,
        image_url: document.getElementById('bg-image-url').value,
        sort_order: parseInt(document.getElementById('bg-sort-order').value) || 0,
        is_active: document.getElementById('bg-is-active').checked
    };

    try {
        showLoading();
        let response;

        if (currentEditingBackgroundImage) {
            // 编辑背景图
            response = await fetch(`/api/admin/background-images/${currentEditingBackgroundImage.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${api.getToken()}`
                },
                body: JSON.stringify(formData)
            });
        } else {
            // 新增背景图
            response = await fetch('/api/admin/background-images/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${api.getToken()}`
                },
                body: JSON.stringify(formData)
            });
        }

        if (response.ok) {
            const message = currentEditingBackgroundImage ? '背景图更新成功' : '背景图创建成功';
            showSuccess(message);
            closeBackgroundImageModal();
            loadBackgroundImagesData();
            // 刷新前端轮播
            if (typeof refreshHeroCarousel === 'function') {
                refreshHeroCarousel();
            }
        } else {
            const errorData = await response.json();
            showError(`操作失败: ${errorData.detail || '未知错误'}`);
        }
    } catch (error) {
        console.error('提交背景图出错:', error);
        showError('提交背景图出错');
    } finally {
        hideLoading();
    }
}

// 图片预览功能
function updateImagePreview(inputId) {
    const input = document.getElementById(inputId);
    const previewId = inputId.replace('-url', '-preview');
    const preview = document.getElementById(previewId);
    
    if (!input || !preview) return;
    
    const url = input.value.trim();
    if (url) {
        const img = document.createElement('img');
        img.src = url;
        img.style.cssText = 'max-width: 100%; height: auto; max-height: 200px; border-radius: 4px; margin-top: 10px;';
        img.onerror = function() {
            this.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjEyMCIgdmlld0JveD0iMCAwIDIwMCAxMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMTIwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMDAgNjBMMTIwIDQwSDgwTDEwMCA2MFoiIGZpbGw9IiNEMUQ1REIiLz4KPHN0cm9rZSBkPSJNNjAgODBMMTQwIDgwIiBzdHJva2U9IiNEMUQ1REIiIHN0cm9rZS13aWR0aD0iMiIvPgo8L3N2Zz4K';
        };
        preview.innerHTML = '';
        preview.appendChild(img);
    } else {
        clearImagePreview(previewId);
    }
}

function clearImagePreview(previewId) {
    const preview = document.getElementById(previewId);
    if (preview) {
        preview.innerHTML = '';
    }
}

// 打开图片选择器（简单实现，可以后续扩展为更完善的图片管理器）
function openImageSelector(targetInputId) {
    // 这里可以实现一个图片选择器
    // 目前简单提示用户输入URL
    const url = prompt('请输入图片URL:');
    if (url) {
        const input = document.getElementById(targetInputId);
        if (input) {
            input.value = url;
            updateImagePreview(targetInputId);
        }
    }
}// 显示登录页面
function showLoginPage() {
    document.getElementById('login-page').style.display = 'flex';
    document.getElementById('admin-panel').style.display = 'none';
}

// 显示管理后台
function showAdminPanel() {
    document.getElementById('login-page').style.display = 'none';
    document.getElementById('admin-panel').style.display = 'flex';
}

// 绑定登录表单
function bindLoginForm() {
    const loginForm = document.getElementById('login-form');
    if (!loginForm) return;
    
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;
        
        if (!username || !password) {
            alert('请输入用户名和密码');
            return;
        }
        
        try {
            console.log('Attempting login with:', username);
            showLoading();
            const result = await api.login(username, password);
            console.log('Login successful:', result);
            showAdminPanel();
            loadAdminData();
        } catch (error) {
            console.error('登录失败:', error);
            alert('登录失败: ' + error.message);
        } finally {
            hideLoading();
        }
    });
}

// 登出
async function logout() {
    try {
        await api.logout();
    } catch (error) {
        console.error('登出失败:', error);
    } finally {
        showLoginPage();
        // 清空表单
        document.getElementById('login-form').reset();
        // 清空缓存
        clearAdminCache();
    }
}

// 缓存辅助函数
function clearAdminCache() {
    adminCache.categories = null;
    adminCache.categoriesTime = 0;
    adminCache.products = null;
    adminCache.productsTime = 0;
    adminCache.stats = null;
    adminCache.statsTime = 0;
}

function isCacheValid(cacheTime) {
    return cacheTime && (Date.now() - cacheTime) < CACHE_DURATION;
}

async function getCachedCategories(forceRefresh = false) {
    if (!forceRefresh && adminCache.categories && isCacheValid(adminCache.categoriesTime)) {
        return adminCache.categories;
    }
    
    const categories = await api.getAllCategories();
    adminCache.categories = categories;
    adminCache.categoriesTime = Date.now();
    return categories;
}

async function getCachedProducts(params = {}, forceRefresh = false) {
    const cacheKey = JSON.stringify(params);
    if (!forceRefresh && adminCache.products && adminCache.products.cacheKey === cacheKey && isCacheValid(adminCache.productsTime)) {
        return adminCache.products.data;
    }
    
    const products = await api.getAllProducts(params);
    adminCache.products = { data: products, cacheKey };
    adminCache.productsTime = Date.now();
    return products;
}

async function getCachedStats(forceRefresh = false) {
    if (!forceRefresh && adminCache.stats && isCacheValid(adminCache.statsTime)) {
        return adminCache.stats;
    }
    
    const stats = await api.getDashboardStats();
    adminCache.stats = stats;
    adminCache.statsTime = Date.now();
    return stats;
}

// 切换侧边栏菜单部分
function switchSection(sectionName) {
    const menuItems = document.querySelectorAll('.menu-item');
    const targetMenuItem = document.querySelector(`.menu-item[data-section="${sectionName}"]`);
    
    if (!targetMenuItem) return;
    
    // 移除所有活动状态
    menuItems.forEach(mi => mi.classList.remove('active'));
    document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
    
    // 添加当前活动状态
    targetMenuItem.classList.add('active');
    const sectionId = sectionName + '-section';
    const section = document.getElementById(sectionId);
    
    if (section) {
        section.classList.add('active');
        
        // 加载对应数据
        switch (sectionName) {
            case 'dashboard':
                loadDashboardData();
                break;
            case 'categories':
                loadCategoriesData();
                break;
            case 'products':
                loadProductsData();
                break;
            case 'featured-products':
                loadFeaturedProductsData();
                break;
            case 'background-images':
                loadBackgroundImagesData();
                break;
            case 'about-us':
                loadAboutUsData();
                break;
            case 'settings':
                loadSettingsData();
                break;
        }
    }
}

// 绑定管理后台事件
function bindAdminEvents() {
    // 防抖变量
    let loadingTimeout = null;
    
    // 侧边栏菜单切换
    const menuItems = document.querySelectorAll('.menu-item');
    menuItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const sectionName = item.dataset.section;
            if (sectionName) {
                // 更新URL hash
                window.location.hash = sectionName;
                switchSection(sectionName);
            }
        });
    });
    
    // 绑定分类表单
    bindCategoryForm();
    
    // 绑定产品表单
    bindProductForm();
    
    // 绑定文件上传
    bindFileUpload();
    
    // 绑定关于我们事件
    bindAboutUsEvents();
}

// 加载管理后台数据
async function loadAdminData() {
    try {
        // 加载当前管理员信息
        const admin = await api.getCurrentAdmin();
        document.getElementById('admin-name').textContent = admin.full_name || admin.username;
        
        // 检查URL hash，如果有则跳转到对应页面，否则默认加载仪表板
        const hash = window.location.hash.substring(1); // 移除#号
        if (hash && ['dashboard', 'categories', 'products', 'featured-products', 'background-images', 'about-us', 'uploads', 'settings'].includes(hash)) {
            switchSection(hash);
        } else {
            // 清除hash并默认加载仪表板
            if (window.location.hash) {
                history.replaceState(null, null, window.location.pathname);
            }
            switchSection('dashboard');
        }
        
    } catch (error) {
        console.error('加载管理员数据失败:', error);
        // 如果token无效，返回登录页面
        if (error.message.includes('401') || error.message.includes('Unauthorized')) {
            showLoginPage();
        }
    }
}

// 加载仪表板数据
async function loadDashboardData() {
    try {
        const stats = await getCachedStats();
        
        document.getElementById('categories-count').textContent = stats.categories_count;
        document.getElementById('products-count').textContent = stats.products_count;
        document.getElementById('active-products-count').textContent = stats.active_products_count;
        document.getElementById('total-stock').textContent = stats.total_stock;
        
    } catch (error) {
        console.error('加载仪表板数据失败:', error);
    }
}

// 加载分类数据
async function loadCategoriesData() {
    try {
        const categories = await getCachedCategories();
        renderCategoriesTable(categories);
    } catch (error) {
        console.error('加载分类数据失败:', error);
    }
}

// 渲染分类表格
function renderCategoriesTable(categories) {
    const tbody = document.querySelector('#categories-table tbody');
    if (!tbody) return;
    
    tbody.innerHTML = categories.map(category => `
        <tr>
            <td>${category.id}</td>
            <td>${category.name}</td>
            <td>${category.name_en || '-'}</td>
            <td>${truncateText(category.description || '-', 50)}</td>
            <td>${category.sort_order}</td>
            <td>
                <span class="status-badge ${category.is_active ? 'status-active' : 'status-inactive'}">
                    ${category.is_active ? '启用' : '禁用'}
                </span>
            </td>
            <td>
                <button class="btn btn-secondary btn-sm" onclick="editCategory(${category.id})">编辑</button>
                <button class="btn btn-danger btn-sm" onclick="deleteCategory(${category.id})">删除</button>
            </td>
        </tr>
    `).join('');
}

// 加载产品数据
async function loadProductsData() {
    try {
        // 先加载分类用于下拉选择（使用缓存）
        const categories = await getCachedCategories();
        populateProductCategorySelect(categories);
        
        // 加载产品数据（使用缓存）
        const response = await getCachedProducts({ limit: 100 });
        renderProductsTable(response.items || response, categories);
    } catch (error) {
        console.error('加载产品数据失败:', error);
    }
}

// 渲染产品表格
function renderProductsTable(products, categories) {
    const tbody = document.querySelector('#products-table tbody');
    if (!tbody) return;
    
    tbody.innerHTML = products.map(product => {
        const category = categories.find(c => c.id === product.category_id);
        return `
            <tr>
                <td>${product.id}</td>
                <td>
                    ${product.image_url 
                        ? `<img src="${product.image_url}" alt="${product.name}" class="product-thumb">` 
                        : '<i class="fas fa-image"></i>'
                    }
                </td>
                <td>${product.name}</td>
                <td>${product.sku}</td>
                <td>${category ? category.name : '-'}</td>
                <td>¥${product.price.toFixed(2)}</td>
                <td>${product.stock_quantity || product.stock || 0}</td>
                <td>
                    <span class="status-badge ${product.is_active ? 'status-active' : 'status-inactive'}">
                        ${product.is_active ? '上架' : '下架'}
                    </span>
                </td>
                <td>
                    <button class="btn btn-secondary btn-sm" onclick="editProduct(${product.id})">编辑</button>
                    <button class="btn btn-danger btn-sm" onclick="deleteProduct(${product.id})">删除</button>
                </td>
            </tr>
        `;
    }).join('');
}

// 加载设置数据
async function loadSettingsData() {
    try {
        const admin = await api.getCurrentAdmin();
        
        document.getElementById('current-username').textContent = admin.username;
        document.getElementById('current-email').textContent = admin.email || '-';
        document.getElementById('last-login').textContent = admin.last_login 
            ? new Date(admin.last_login).toLocaleString() 
            : '-';
            
    } catch (error) {
        console.error('加载设置数据失败:', error);
    }
}

// === 分类管理相关函数 ===

// 显示分类模态框
function showCategoryModal(category = null) {
    currentEditingCategory = category;
    
    const modal = document.getElementById('category-modal');
    const title = document.getElementById('category-modal-title');
    const form = document.getElementById('category-form');
    const iconPreview = document.getElementById('category-icon-preview');
    const iconImg = document.getElementById('category-icon-img');
    const iconUrlInput = document.getElementById('category-icon-url');
    
    if (category) {
        title.textContent = '编辑分类';
        // 正确映射所有字段
        document.getElementById('category-name').value = category.name || '';
        document.getElementById('category-name-en').value = category.name_en || '';
        document.getElementById('category-description').value = category.description || '';
        document.getElementById('category-description-en').value = category.description_en || '';
        document.getElementById('category-sort-order').value = category.sort_order || 0;
        document.getElementById('category-is-active').checked = category.is_active;
        
        // 显示当前图标
        if (category.icon_url) {
            iconUrlInput.value = category.icon_url;
            iconImg.src = category.icon_url;
            iconPreview.style.display = 'block';
        } else {
            iconUrlInput.value = '';
            iconPreview.style.display = 'none';
        }
    } else {
        title.textContent = '新增分类';
        form.reset();
        document.getElementById('category-is-active').checked = true;
        iconPreview.style.display = 'none';
    }
    
    modal.style.display = 'block';
}

// 关闭分类模态框
function closeCategoryModal() {
    document.getElementById('category-modal').style.display = 'none';
    currentEditingCategory = null;
}

// 绑定分类表单
function bindCategoryForm() {
    const form = document.getElementById('category-form');
    if (!form) return;
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const data = {
            name: document.getElementById('category-name').value,
            name_en: document.getElementById('category-name-en').value || null,
            description: document.getElementById('category-description').value || null,
            description_en: document.getElementById('category-description-en').value || null,
            sort_order: parseInt(document.getElementById('category-sort-order').value) || 0,
            is_active: document.getElementById('category-is-active').checked,
            icon_url: document.getElementById('category-icon-url').value || null
        };
        
        try {
            showLoading();
            
            if (currentEditingCategory) {
                await api.updateCategory(currentEditingCategory.id, data);
            } else {
                await api.createCategory(data);
            }
            
            closeCategoryModal();
            // 强制刷新缓存
            adminCache.categories = null;
            adminCache.stats = null;
            loadCategoriesData();
            
        } catch (error) {
            console.error('保存分类失败:', error);
            alert('保存失败: ' + error.message);
        } finally {
            hideLoading();
        }
    });
}

// 编辑分类
async function editCategory(categoryId) {
    try {
        const category = await api.getAdminCategory(categoryId);
        showCategoryModal(category);
    } catch (error) {
        console.error('获取分类失败:', error);
        alert('获取分类失败: ' + error.message);
    }
}

// 删除分类
async function deleteCategory(categoryId) {
    if (!confirm('确定要删除这个分类吗？')) return;
    
    try {
        showLoading();
        await api.deleteCategory(categoryId);
        // 强制刷新缓存
        adminCache.categories = null;
        adminCache.stats = null;
        loadCategoriesData();
    } catch (error) {
        console.error('删除分类失败:', error);
        alert('删除失败: ' + error.message);
    } finally {
        hideLoading();
    }
}

// === 产品管理相关函数 ===

// 填充产品分类选择器
function populateProductCategorySelect(categories) {
    const select = document.getElementById('product-category');
    if (!select) return;
    
    select.innerHTML = '<option value="">请选择分类</option>' +
        categories.map(cat => `<option value="${cat.id}">${cat.name}</option>`).join('');
}

// 显示产品模态框
function showProductModal(product = null) {
    currentEditingProduct = product;
    
    const modal = document.getElementById('product-modal');
    const title = document.getElementById('product-modal-title');
    const form = document.getElementById('product-form');
    
    if (product) {
        title.textContent = '编辑产品';
        document.getElementById('product-name').value = product.name;
        document.getElementById('product-name-en').value = product.name_en || '';
        document.getElementById('product-sku').value = product.sku;
        document.getElementById('product-category').value = product.category_id;
        document.getElementById('product-description').value = product.description || '';
        document.getElementById('product-description-en').value = product.description_en || '';
        document.getElementById('product-price').value = product.price;
        document.getElementById('product-stock').value = product.stock_quantity || product.stock || '';
        document.getElementById('product-image-url').value = product.image_url || '';
        document.getElementById('product-is-active').checked = product.is_active;
    } else {
        title.textContent = '新增产品';
        form.reset();
        document.getElementById('product-is-active').checked = true;
    }
    
    modal.style.display = 'block';
}

// 关闭产品模态框
function closeProductModal() {
    document.getElementById('product-modal').style.display = 'none';
    currentEditingProduct = null;
}

// 绑定产品表单
function bindProductForm() {
    const form = document.getElementById('product-form');
    if (!form) return;
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const data = {
            name: document.getElementById('product-name').value,
            name_en: document.getElementById('product-name-en').value || null,
            sku: document.getElementById('product-sku').value,
            category_id: parseInt(document.getElementById('product-category').value),
            description: document.getElementById('product-description').value || '暂无描述',
            description_en: document.getElementById('product-description-en').value || null,
            price: parseFloat(document.getElementById('product-price').value),
            stock: parseInt(document.getElementById('product-stock').value) || 0,
            image_url: document.getElementById('product-image-url').value || 'https://via.placeholder.com/300x300?text=No+Image',
            is_active: document.getElementById('product-is-active').checked
        };
        
        try {
            showLoading();
            
            if (currentEditingProduct) {
                await api.updateProduct(currentEditingProduct.id, data);
            } else {
                await api.createProduct(data);
            }
            
            closeProductModal();
            // 强制刷新缓存
            adminCache.products = null;
            adminCache.stats = null;
            loadProductsData();
            
        } catch (error) {
            console.error('保存产品失败:', error);
            alert('保存失败: ' + error.message);
        } finally {
            hideLoading();
        }
    });
}

// 编辑产品
async function editProduct(productId) {
    try {
        const product = await api.getAdminProduct(productId);
        showProductModal(product);
    } catch (error) {
        console.error('获取产品失败:', error);
        alert('获取产品失败: ' + error.message);
    }
}

// 删除产品
async function deleteProduct(productId) {
    if (!confirm('确定要删除这个产品吗？')) return;
    
    try {
        showLoading();
        await api.deleteProduct(productId);
        // 强制刷新缓存
        adminCache.products = null;
        adminCache.stats = null;
        loadProductsData();
    } catch (error) {
        console.error('删除产品失败:', error);
        alert('删除失败: ' + error.message);
    } finally {
        hideLoading();
    }
}

// === 文件上传相关函数 ===

// 绑定文件上传
function bindFileUpload() {
    const fileInput = document.getElementById('file-input');
    const uploadBox = document.getElementById('upload-box');
    
    if (!fileInput || !uploadBox) return;
    
    fileInput.addEventListener('change', handleFileSelect);
    
    // 拖拽上传
    uploadBox.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadBox.classList.add('dragover');
    });
    
    uploadBox.addEventListener('dragleave', () => {
        uploadBox.classList.remove('dragover');
    });
    
    uploadBox.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadBox.classList.remove('dragover');
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            uploadFiles(Array.from(files));
        }
    });
}

// 处理文件选择
function handleFileSelect(e) {
    const files = Array.from(e.target.files);
    if (files.length > 0) {
        uploadFiles(files);
    }
}

// 上传文件
async function uploadFiles(files) {
    const progressContainer = document.getElementById('upload-progress');
    const progressFill = document.getElementById('progress-fill');
    const uploadStatus = document.getElementById('upload-status');
    
    progressContainer.style.display = 'block';
    
    let completed = 0;
    const total = files.length;
    
    for (const file of files) {
        try {
            uploadStatus.textContent = `正在上传 ${file.name}...`;
            
            const result = await api.uploadFile(file);
            console.log('上传成功:', result);
            
            completed++;
            const progress = (completed / total) * 100;
            progressFill.style.width = progress + '%';
            
        } catch (error) {
            console.error('上传失败:', error);
            alert(`上传 ${file.name} 失败: ${error.message}`);
        }
    }
    
    uploadStatus.textContent = `上传完成 (${completed}/${total})`;
    
    setTimeout(() => {
        progressContainer.style.display = 'none';
        progressFill.style.width = '0%';
    }, 2000);
}

// === 工具函数 ===

// 截断文本
function truncateText(text, maxLength) {
    if (!text) return '';
    return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
}

// 显示加载指示器
function showLoading() {
    const loading = document.getElementById('loading');
    if (loading) {
        loading.style.display = 'flex';
    }
}

// 隐藏加载指示器
function hideLoading() {
    const loading = document.getElementById('loading');
    if (loading) {
        loading.style.display = 'none';
    }
}

// 点击模态框外部关闭
window.onclick = function(event) {
    const categoryModal = document.getElementById('category-modal');
    const productModal = document.getElementById('product-modal');
    const backgroundImageModal = document.getElementById('background-image-modal');
    
    if (event.target === categoryModal) {
        closeCategoryModal();
    }
    
    if (event.target === productModal) {
        closeProductModal();
    }
    
    if (event.target === backgroundImageModal) {
        closeBackgroundImageModal();
    }
};

// 显示错误消息
function showError(message) {
    alert('错误: ' + message);
}

// 显示成功消息  
function showSuccess(message) {
    alert('成功: ' + message);
}

// 分类图标预览（从URL）
function previewCategoryIconFromUrl(event) {
    const url = event.target.value;
    const preview = document.getElementById('category-icon-preview');
    const img = document.getElementById('category-icon-img');
    
    if (url) {
        img.src = url;
        img.onerror = function() {
            preview.style.display = 'none';
            alert('无法加载图片，请检查URL是否正确');
        };
        img.onload = function() {
            preview.style.display = 'block';
        };
    } else {
        preview.style.display = 'none';
    }
}

// 分类图标预览（从文件，保留以防需要）
function previewCategoryIcon(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const preview = document.getElementById('category-icon-preview');
            const img = document.getElementById('category-icon-img');
            img.src = e.target.result;
            preview.style.display = 'block';
        };
        reader.readAsDataURL(file);
    } else {
        document.getElementById('category-icon-preview').style.display = 'none';
    }
}

// ===== 特色产品管理功能 =====

let featuredProductsData = {
    positions: {},
    products: [],
    categories: []
};

// 加载特色产品数据
async function loadFeaturedProductsData() {
    try {
        console.log('Loading featured products data...');
        
        // 并行加载所有需要的数据
        const [positionsResponse, productsResponse, categoriesResponse] = await Promise.all([
            fetch('/api/admin/featured-products/positions', {
                headers: { 'Authorization': `Bearer ${api.token}` }
            }),
            fetch('/api/admin/products/', {
                headers: { 'Authorization': `Bearer ${api.token}` }
            }),
            fetch('/api/admin/categories/', {
                headers: { 'Authorization': `Bearer ${api.token}` }
            })
        ]);

        if (positionsResponse.ok) {
            featuredProductsData.positions = await positionsResponse.json();
        }
        
        if (productsResponse.ok) {
            featuredProductsData.products = await productsResponse.json();
        }
        
        if (categoriesResponse.ok) {
            featuredProductsData.categories = await categoriesResponse.json();
        }

        renderFeaturedProductsGrid();
        
    } catch (error) {
        console.error('Failed to load featured products data:', error);
        showToast('加载特色产品数据失败: ' + error.message, 'error');
    }
}

// 渲染特色产品网格
function renderFeaturedProductsGrid() {
    const grid = document.getElementById('featuredPositionsGrid');
    if (!grid) return;

    const positionCards = [];
    
    for (let i = 1; i <= 6; i++) {
        const position = featuredProductsData.positions[i.toString()];
        const isEmpty = !position;
        
        positionCards.push(`
            <div class="position-card-admin ${isEmpty ? 'empty' : 'filled'}">
                <div class="position-header-admin">
                    <div class="position-number-admin">${i}</div>
                    <div class="position-status-admin ${isEmpty ? 'empty' : 'filled'}">
                        ${isEmpty ? '空位置' : '已设置'}
                    </div>
                </div>
                
                <div class="position-content-admin">
                    ${isEmpty ? renderEmptyPositionAdmin(i) : renderFilledPositionAdmin(position, i)}
                </div>
                
                <div class="position-actions-admin">
                    ${isEmpty ? 
                        `<button class="position-btn-admin primary" onclick="openProductSelectorModal(${i})">
                            ➕ 添加产品
                        </button>` :
                        `<button class="position-btn-admin secondary" onclick="openProductSelectorModal(${i})">
                            🔄 更换产品
                        </button>
                        <button class="position-btn-admin danger" onclick="removeFeaturedProduct(${position.id}, ${i})">
                            🗑️ 移除
                        </button>`
                    }
                </div>
            </div>
        `);
    }

    grid.innerHTML = positionCards.join('');
}

// 渲染空位置
function renderEmptyPositionAdmin(position) {
    return `
        <div class="position-empty-admin">
            <i class="fas fa-box-open"></i>
            <div>位置 ${position} 为空</div>
            <div style="font-size: 11px; margin-top: 5px;">点击下方按钮添加产品</div>
        </div>
    `;
}

// 渲染已填充位置
function renderFilledPositionAdmin(positionData, position) {
    const product = featuredProductsData.products.find(p => p.id === positionData.product_id);
    
    if (!product) {
        return `
            <div class="position-empty-admin">
                <i class="fas fa-exclamation-triangle" style="color: #f59e0b;"></i>
                <div style="color: #f59e0b;">产品不存在</div>
                <div style="font-size: 11px; margin-top: 5px;">产品可能已被删除</div>
            </div>
        `;
    }

    const imageUrl = product.image_url || product.images?.[0] || 'https://via.placeholder.com/300x300/f8f9fa/6c757d?text=Product';
    const fullImageUrl = imageUrl.startsWith('http') ? imageUrl : 
                         imageUrl.startsWith('/uploads') ? imageUrl : 
                         `/uploads/${imageUrl}`;

    // 获取分类名称
    const category = featuredProductsData.categories.find(c => c.id === product.category_id);
    const categoryName = category ? category.name : '未分类';

    return `
        <div class="position-product-admin">
            <img src="${fullImageUrl}" 
                 alt="${product.name}" 
                 class="position-product-image-admin"
                 onerror="this.src='https://via.placeholder.com/300x300/f8f9fa/6c757d?text=Product'">
            
            <div class="position-product-info-admin">
                <div class="position-product-name-admin" title="${product.name}">
                    ${product.name}
                </div>
                <div class="position-product-details-admin">
                    分类: ${categoryName}
                </div>
                <div class="position-product-details-admin">
                    库存: ${product.stock || '充足'}
                </div>
                <div class="position-product-price-admin">
                    ¥${parseFloat(product.price || 0).toFixed(2)}
                </div>
            </div>
        </div>
    `;
}

// 打开产品选择器模态框
function openProductSelectorModal(position) {
    // 创建一个简单的产品选择对话框
    const products = featuredProductsData.products.filter(p => p.is_active);
    
    if (products.length === 0) {
        showToast('没有可用的产品', 'warning');
        return;
    }

    let options = products.map(p => {
        const category = featuredProductsData.categories.find(c => c.id === p.category_id);
        return `${p.name} (${category?.name || '无分类'}) - ¥${parseFloat(p.price || 0).toFixed(2)}`;
    });

    const selection = prompt(`为位置 ${position} 选择产品：\n\n` + 
        options.map((opt, idx) => `${idx + 1}. ${opt}`).join('\n') + 
        '\n\n请输入产品编号 (1-' + options.length + ')：');

    if (selection) {
        const index = parseInt(selection) - 1;
        if (index >= 0 && index < products.length) {
            setFeaturedProduct(products[index].id, position);
        } else {
            showToast('无效的选择', 'error');
        }
    }
}

// 设置特色产品
async function setFeaturedProduct(productId, position) {
    try {
        // 检查位置是否已被占用
        const existingPosition = featuredProductsData.positions[position.toString()];
        
        let response;
        if (existingPosition) {
            // 更新现有位置
            response = await fetch(`/api/admin/featured-products/${existingPosition.id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${api.token}`
                },
                body: JSON.stringify({
                    product_id: productId,
                    position: position,
                    is_active: true
                })
            });
        } else {
            // 创建新的位置配置
            response = await fetch('/api/admin/featured-products/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${api.token}`
                },
                body: JSON.stringify({
                    product_id: productId,
                    position: position,
                    is_active: true
                })
            });
        }

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || `HTTP ${response.status}`);
        }

        // 重新加载数据
        await loadFeaturedProductsData();
        
        const product = featuredProductsData.products.find(p => p.id === productId);
        showToast(`产品 "${product?.name || productId}" 已设置到位置 ${position}`, 'success');

    } catch (error) {
        console.error('设置特色产品失败:', error);
        showToast('设置产品失败: ' + error.message, 'error');
    }
}

// 移除特色产品
async function removeFeaturedProduct(featuredProductId, position) {
    if (!confirm(`确定要从位置 ${position} 移除该产品吗？`)) {
        return;
    }

    try {
        const response = await fetch(`/api/admin/featured-products/${featuredProductId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${api.token}`
            }
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || `HTTP ${response.status}`);
        }

        // 重新加载数据
        await loadFeaturedProductsData();
        
        showToast('产品已从特色位置移除', 'success');

    } catch (error) {
        console.error('删除失败:', error);
        showToast('删除失败: ' + error.message, 'error');
    }
}

// 刷新特色产品数据
async function refreshFeaturedProducts() {
    showToast('正在刷新...', 'info');
    await loadFeaturedProductsData();
    showToast('数据已刷新', 'success');
}

// ==================== 关于我们管理功能 ====================

// 加载关于我们数据
async function loadAboutUsData() {
    try {
        console.log('Loading about us data...');
        
        const response = await fetch(`${api.baseURL}/about-us/admin`, {
            headers: {
                'Authorization': `Bearer ${api.token}`
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP ${response.status}`);
        }

        const data = await response.json();
        console.log('About us data loaded:', data);
        
        // 填充表单
        populateAboutUsForm(data);

    } catch (error) {
        console.error('加载关于我们数据失败:', error);
        showToast('加载数据失败: ' + error.message, 'error');
    }
}

// 填充关于我们表单
function populateAboutUsForm(data) {
    document.getElementById('about-title').value = data.title || '关于我们';
    document.getElementById('about-title-en').value = data.title_en || '';
    document.getElementById('about-content').value = data.content || '';
    document.getElementById('about-content-en').value = data.content_en || '';
    document.getElementById('about-background-image').value = data.background_image_url || '';
    document.getElementById('about-text-color').value = data.text_color || '#333333';
    document.getElementById('about-text-color-text').value = data.text_color || '#333333';
    document.getElementById('about-background-overlay').value = data.background_overlay || 'rgba(255, 255, 255, 0.8)';
}

// 保存关于我们数据
async function saveAboutUs() {
    try {
        const formData = {
            title: document.getElementById('about-title').value,
            title_en: document.getElementById('about-title-en').value,
            content: document.getElementById('about-content').value,
            content_en: document.getElementById('about-content-en').value,
            background_image_url: document.getElementById('about-background-image').value || null,
            text_color: document.getElementById('about-text-color').value,
            background_overlay: document.getElementById('about-background-overlay').value
        };

        console.log('Saving about us data:', formData);

        const response = await fetch(`${api.baseURL}/about-us/`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${api.token}`
            },
            body: JSON.stringify(formData)
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.detail || `HTTP ${response.status}`);
        }

        showToast('关于我们内容保存成功', 'success');

    } catch (error) {
        console.error('保存失败:', error);
        showToast('保存失败: ' + error.message, 'error');
    }
}

// 预览关于我们效果
function previewAboutUs() {
    const title = document.getElementById('about-title').value || '关于我们';
    const content = document.getElementById('about-content').value || '';
    const backgroundImage = document.getElementById('about-background-image').value;
    const textColor = document.getElementById('about-text-color').value;
    const backgroundOverlay = document.getElementById('about-background-overlay').value;
    
    // 更新预览内容
    document.getElementById('preview-title').textContent = title;
    document.getElementById('preview-content').innerHTML = content.replace(/\n/g, '<br>');
    
    // 更新预览样式
    const previewSection = document.querySelector('.about-preview-section');
    const previewContent = document.querySelector('.about-preview-content');
    
    if (backgroundImage) {
        previewSection.style.backgroundImage = `url(${backgroundImage})`;
        previewSection.style.backgroundSize = 'cover';
        previewSection.style.backgroundPosition = 'center';
    } else {
        previewSection.style.backgroundImage = 'none';
        previewSection.style.backgroundColor = '#f8f9fa';
    }
    
    previewSection.style.position = 'relative';
    previewSection.style.minHeight = '200px';
    previewSection.style.padding = '40px 20px';
    previewSection.style.borderRadius = '8px';
    previewSection.style.overflow = 'hidden';
    
    // 添加遮罩层
    if (backgroundOverlay && backgroundOverlay !== 'transparent') {
        previewSection.style.background = backgroundImage 
            ? `linear-gradient(${backgroundOverlay}, ${backgroundOverlay}), url(${backgroundImage})`
            : backgroundOverlay;
        previewSection.style.backgroundSize = 'cover';
        previewSection.style.backgroundPosition = 'center';
    }
    
    previewContent.style.color = textColor;
    previewContent.style.position = 'relative';
    previewContent.style.zIndex = '2';
    previewContent.style.textAlign = 'center';
    
    // 显示预览
    document.getElementById('about-us-preview').style.display = 'block';
    document.getElementById('about-us-preview').scrollIntoView({ behavior: 'smooth' });
}

// 绑定关于我们表单事件
function bindAboutUsEvents() {
    // 表单提交
    const aboutUsForm = document.getElementById('about-us-form');
    if (aboutUsForm) {
        aboutUsForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveAboutUs();
        });
    }
    
    // 颜色选择器同步
    const colorInput = document.getElementById('about-text-color');
    const colorTextInput = document.getElementById('about-text-color-text');
    
    if (colorInput && colorTextInput) {
        colorInput.addEventListener('input', function() {
            colorTextInput.value = this.value;
        });
        
        colorTextInput.addEventListener('input', function() {
            if (/^#[0-9A-Fa-f]{6}$/.test(this.value)) {
                colorInput.value = this.value;
            }
        });
    }
}
