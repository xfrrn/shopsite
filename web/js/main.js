/**
 * 前端主要JavaScript逻辑
 */

// 全局变量
let currentPage = 1;
let currentCategory = '';
let currentSort = 'created_at';
let currentSearch = '';

// 缓存变量
let categoriesCache = null;
let categoriesCacheTime = 0;
let productsCache = null;
let productsCacheTime = 0;
const CACHE_DURATION = 5 * 60 * 1000; // 5分钟缓存

// 清除缓存函数
function clearDataCache() {
    categoriesCache = null;
    categoriesCacheTime = 0;
    productsCache = null;
    productsCacheTime = 0;
}

// 重新加载精选产品的全局函数
window.loadFeaturedProducts = function() {
    if (window.featuredProductsInstance && typeof window.featuredProductsInstance.loadFeaturedProducts === 'function') {
        return window.featuredProductsInstance.loadFeaturedProducts();
    }
};

// 暴露给全局以供其他模块调用
window.clearDataCache = clearDataCache;
window.loadCategories = loadCategories;
window.loadProducts = loadProducts;

// DOM加载完成后执行
document.addEventListener('DOMContentLoaded', function() {
    // 强制应用样式
    forceApplyStyles();
    
    // 初始化页面
    initializePage();
    
    // 绑定事件监听器
    bindEventListeners();
    
    // 加载初始数据
    loadInitialData();
});

// 强制应用样式函数
function forceApplyStyles() {
    // 确保页面装饰元素存在
    if (!document.querySelector('.page-decoration')) {
        const decoration = document.createElement('div');
        decoration.className = 'page-decoration';
        decoration.style.cssText = `
            position: fixed !important;
            top: 0 !important;
            left: 0 !important;
            right: 0 !important;
            height: 4px !important;
            background: linear-gradient(90deg, #495057, #6c757d, #adb5bd, #dee2e6, #e9ecef, #f8f9fa) !important;
            z-index: 1001 !important;
        `;
        document.body.insertBefore(decoration, document.body.firstChild);
    }
    
    // 初始化透明导航栏
    const navbar = document.querySelector('.navbar');
    if (navbar) {
        navbar.style.cssText = `
            position: fixed !important;
            top: 0 !important;
            width: 100% !important;
            z-index: 1000 !important;
            display: block !important;
            visibility: visible !important;
        `;
        console.log('透明导航栏初始化完成');
        
        // 添加滚动监听
        initNavbarScrollEffect();
    }
    
    // 初始化hero区域
    const heroSection = document.querySelector('.hero-section');
    if (heroSection) {
        // 默认在顶部时为全屏
        if (window.scrollY === 0) {
            heroSection.classList.add('fullscreen');
            document.body.classList.add('hero-fullscreen');
        }
        console.log('Hero区域初始化完成');
    }
    
    // 强制重新计算样式
    setTimeout(() => {
        const elements = document.querySelectorAll('.product-card, .category-card, .featured-product-card, .navbar, .hero-section');
        elements.forEach(el => {
            el.style.opacity = '0.99';
            setTimeout(() => {
                el.style.opacity = '';
            }, 50);
        });
        
        // 强制重新初始化轮播
        if (typeof window.initHeroCarousel === 'function') {
            window.initHeroCarousel();
        }
        
        console.log('样式强制应用完成');
    }, 500);
}

// 初始化页面
function initializePage() {
    // 移动端导航菜单切换
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    
    if (hamburger && navMenu) {
        hamburger.addEventListener('click', () => {
            navMenu.classList.toggle('active');
        });
    }
    
    // 平滑滚动到指定章节
    const navLinks = document.querySelectorAll('.nav-link[href^="#"]');
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);
            scrollToSection(targetId);
            
            // 关闭移动端菜单
            if (navMenu) navMenu.classList.remove('active');
        });
    });
}

// 绑定事件监听器
function bindEventListeners() {
    // 搜索功能
    const searchInput = document.getElementById('search-input');
    const searchBtn = document.getElementById('search-btn');
    
    if (searchInput && searchBtn) {
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                performSearch();
            }
        });
        
        searchBtn.addEventListener('click', performSearch);
    }
    
    // 筛选功能
    const categoryFilter = document.getElementById('category-filter');
    const sortFilter = document.getElementById('sort-filter');
    
    if (categoryFilter) {
        categoryFilter.addEventListener('change', (e) => {
            currentCategory = e.target.value;
            currentPage = 1;
            loadProducts();
        });
    }
    
    if (sortFilter) {
        sortFilter.addEventListener('change', (e) => {
            currentSort = e.target.value;
            currentPage = 1;
            loadProducts();
        });
    }
}

// 加载初始数据
async function loadInitialData() {
    try {
        showLoading();
        
        // 并行初始化各个组件
        await Promise.all([
            // 原有的数据加载
            loadCategories().then(() => loadCategoryFilter()),
            loadProducts(),
            // 初始化特色产品组件
            initializeFeaturedProducts()
        ]);
        
    } catch (error) {
        console.error('初始化数据加载失败:', error);
        showError('加载数据失败，请刷新页面重试');
    } finally {
        hideLoading();
    }
}

// 加载分类（带缓存）
async function loadCategories() {
    try {
        // 检查缓存
        const now = Date.now();
        if (categoriesCache && (now - categoriesCacheTime) < CACHE_DURATION) {
            renderCategories(categoriesCache);
            return categoriesCache;
        }
        
        // 获取当前语言
        const currentLang = window.i18n ? window.i18n.getCurrentLanguage() : 'zh';
        
        // 获取分类数据 - 根据语言选择API
        let response;
        if (currentLang === 'en') {
            response = await fetch(`${api.baseURL}/language/en/categories`, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        } else {
            response = await fetch(`${api.baseURL}/categories/`, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
        }
        
        if (!response.ok) {
            throw new Error('获取分类失败');
        }
        
        const responseData = await response.json();
        
        // 处理不同的响应格式
        let categories;
        if (currentLang === 'en' && responseData.success && responseData.data) {
            // 多语言API返回格式: {success: true, data: [...]}
            categories = responseData.data;
        } else {
            // 普通API返回格式: [...]
            categories = responseData;
        }
        
        // 更新缓存
        categoriesCache = categories;
        categoriesCacheTime = now;
        
        renderCategories(categories);
        return categories;
    } catch (error) {
        console.error('加载分类失败:', error);
        throw error;
    }
}

// 渲染分类
function renderCategories(categories) {
    const container = document.getElementById('categories-grid');
    if (!container) return;
    
    if (!categories || categories.length === 0) {
        const currentLang = window.i18n ? window.i18n.getCurrentLanguage() : 'zh';
        const noDataText = window.i18n ? window.i18n.getTranslation('data.no_categories') : '暂无分类数据';
        container.innerHTML = `<p class="no-data">${noDataText}</p>`;
        return;
    }
    
    // 获取当前语言
    const currentLang = window.i18n ? window.i18n.getCurrentLanguage() : 'zh';
    
    container.innerHTML = categories.map(category => {
        // 根据语言选择名称和描述
        const categoryName = currentLang === 'en' && category.name_en ? category.name_en : category.name;
        const categoryDescription = currentLang === 'en' && category.description_en ? category.description_en : (category.description || '');
        
        // 使用数据库中的icon_url，如果没有则使用默认图标
        const iconHtml = category.icon_url 
            ? `<img src="${category.icon_url}" alt="${categoryName}" style="width: 48px; height: 48px; object-fit: cover; border-radius: 8px;">`
            : `<i class="fas fa-${getCategoryIcon(category.name)}"></i>`;
            
        return `
            <div class="category-card" onclick="filterByCategory(${category.id})">
                <div class="category-icon">
                    ${iconHtml}
                </div>
                <h3>${categoryName}</h3>
                <p>${categoryDescription}</p>
            </div>
        `;
    }).join('');
}

// 获取分类图标
function getCategoryIcon(categoryName) {
    const iconMap = {
        '电子产品': 'laptop',
        '家居用品': 'home',
        '服装配饰': 'tshirt',
        '运动户外': 'running',
        '美妆护肤': 'heart',
        '食品饮料': 'apple-alt',
        '图书文具': 'book',
        '母婴用品': 'baby'
    };
    
    return iconMap[categoryName] || 'box';
}

// 加载产品
async function loadProducts() {
    try {
        // 检查缓存（注意：搜索和分类筛选时不使用缓存）
        if (!currentCategory && !currentSearch && currentPage === 1) {
            const now = Date.now();
            if (productsCache && (now - productsCacheTime) < CACHE_DURATION) {
                renderProducts(productsCache.items || productsCache);
                renderPagination(productsCache);
                return productsCache;
            }
        }
        
        const params = {
            page: currentPage,
            limit: 12,
            is_active: true
        };
        
        if (currentCategory) {
            params.category_id = currentCategory;
        }
        
        if (currentSearch) {
            params.q = currentSearch;
        }
        
        // 处理排序
        if (currentSort === 'price_asc') {
            params.sort_by = 'price';
            params.sort_order = 'asc';
        } else if (currentSort === 'price_desc') {
            params.sort_by = 'price';
            params.sort_order = 'desc';
        } else if (currentSort === 'name') {
            params.sort_by = 'name';
            params.sort_order = 'asc';
        } else {
            params.sort_by = 'created_at';
            params.sort_order = 'desc';
        }
        
        // 获取当前语言
        const currentLang = window.i18n ? window.i18n.getCurrentLanguage() : 'zh';
        
        let response;
        if (currentLang === 'en') {
            // 使用英文API
            const queryString = new URLSearchParams(params).toString();
            const apiResponse = await fetch(`${api.baseURL}/language/en/products${queryString ? '?' + queryString : ''}`, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (!apiResponse.ok) {
                throw new Error(`HTTP error! status: ${apiResponse.status}`);
            }
            
            const responseData = await apiResponse.json();
            
            // 处理多语言API响应格式: {success: true, data: [...]}
            if (responseData.success && responseData.data) {
                response = { items: responseData.data };
            } else {
                response = responseData;
            }
        } else {
            // 使用中文API
            response = await api.getProducts(params);
        }
        
        // 更新缓存（仅在默认条件下缓存）
        if (!currentCategory && !currentSearch && currentPage === 1) {
            productsCache = response;
            productsCacheTime = Date.now();
        }
        
        renderProducts(response.items || response);
        renderPagination(response);
        
    } catch (error) {
        console.error('加载产品失败:', error);
        showError('加载产品失败');
    }
}

// 渲染产品
function renderProducts(products) {
    const container = document.getElementById('products-grid');
    if (!container) return;

    if (!products || products.length === 0) {
        const currentLang = window.i18n ? window.i18n.getCurrentLanguage() : 'zh';
        const noDataText = window.i18n ? window.i18n.getTranslation('data.no_products') : '暂无产品数据';
        container.innerHTML = `<div class="no-data"><p>${noDataText}</p></div>`;
        return;
    }
    
    // 获取当前语言
    const currentLang = window.i18n ? window.i18n.getCurrentLanguage() : 'zh';
    const stockText = currentLang === 'en' ? 'Stock' : '库存';
    
    container.innerHTML = products.map(product => {
        const stockQuantity = product.stock_quantity || product.stock || 0;
        return `
            <div class="product-card" onclick="showProductDetails(${product.id})">
                <div class="product-image">
                    ${product.image_url 
                        ? `<img src="${product.image_url}" alt="${product.name}" onerror="this.style.display='none'; this.parentNode.innerHTML='<i class=&quot;fas fa-image&quot;></i>'">`
                        : '<i class="fas fa-image"></i>'
                    }
                </div>
                <div class="product-info">
                    <h3>${product.name}</h3>
                    <p>${truncateText(product.description || '', 100)}</p>
                    <div class="product-price">¥${product.price.toFixed(2)}</div>
                    <div class="product-meta">
                        <span class="brand">${product.brand || ''}</span>
                        <span class="stock-info ${stockQuantity < 10 ? 'low-stock' : ''}">
                            ${stockText}: ${stockQuantity}
                        </span>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}// 渲染分页
function renderPagination(response) {
    const container = document.getElementById('pagination');
    if (!container) return;
    
    const totalPages = response.total_pages || Math.ceil((response.total || response.length) / 12);
    
    if (totalPages <= 1) {
        container.innerHTML = '';
        return;
    }
    
    // 获取翻译文本
    const prevText = window.i18n ? window.i18n.getTranslation('pagination.previous') : '上一页';
    const nextText = window.i18n ? window.i18n.getTranslation('pagination.next') : '下一页';
    
    let paginationHTML = '';
    
    // 上一页按钮
    paginationHTML += `
        <button onclick="changePage(${currentPage - 1})" 
                ${currentPage === 1 ? 'disabled' : ''}>
            <i class="fas fa-chevron-left"></i> ${prevText}
        </button>
    `;
    
    // 页码按钮
    const startPage = Math.max(1, currentPage - 2);
    const endPage = Math.min(totalPages, currentPage + 2);
    
    if (startPage > 1) {
        paginationHTML += `<button onclick="changePage(1)">1</button>`;
        if (startPage > 2) {
            paginationHTML += `<span>...</span>`;
        }
    }
    
    for (let i = startPage; i <= endPage; i++) {
        paginationHTML += `
            <button onclick="changePage(${i})" ${i === currentPage ? 'class="active"' : ''}>
                ${i}
            </button>
        `;
    }
    
    if (endPage < totalPages) {
        if (endPage < totalPages - 1) {
            paginationHTML += `<span>...</span>`;
        }
        paginationHTML += `<button onclick="changePage(${totalPages})">${totalPages}</button>`;
    }
    
    // 下一页按钮
    paginationHTML += `
        <button onclick="changePage(${currentPage + 1})" 
                ${currentPage === totalPages ? 'disabled' : ''}>
            ${nextText} <i class="fas fa-chevron-right"></i>
        </button>
    `;
    
    container.innerHTML = paginationHTML;
}

// 加载分类筛选器（使用缓存）
async function loadCategoryFilter() {
    try {
        // 使用缓存的分类数据
        let categories = categoriesCache;
        if (!categories) {
            categories = await loadCategories(); // 这会设置缓存
        }
        
        const select = document.getElementById('category-filter');
        if (!select) return;
        
        // 获取当前语言
        const currentLang = window.i18n ? window.i18n.getCurrentLanguage() : 'zh';
        const allCategoriesText = window.i18n ? window.i18n.getTranslation('filter.all_categories') : '所有分类';
        
        select.innerHTML = `<option value="">${allCategoriesText}</option>` +
            categories.map(cat => {
                const categoryName = currentLang === 'en' && cat.name_en ? cat.name_en : cat.name;
                return `<option value="${cat.id}">${categoryName}</option>`;
            }).join('');
    } catch (error) {
        console.error('加载分类筛选器失败:', error);
    }
}

// 执行搜索
function performSearch() {
    const searchInput = document.getElementById('search-input');
    if (!searchInput) return;
    
    currentSearch = searchInput.value.trim();
    currentPage = 1;
    loadProducts();
}

// 按分类筛选
function filterByCategory(categoryId) {
    currentCategory = categoryId;
    currentPage = 1;
    
    // 更新筛选器
    const categoryFilter = document.getElementById('category-filter');
    if (categoryFilter) {
        categoryFilter.value = categoryId;
    }
    
    // 滚动到产品区域
    scrollToSection('products');
    
    // 加载产品
    loadProducts();
}

// 切换页面
function changePage(page) {
    if (page < 1) return;
    currentPage = page;
    loadProducts();
    scrollToSection('products');
}

// 显示产品详情
async function showProductDetails(productId) {
    try {
        showLoading();
        
        // 获取当前语言
        const currentLang = window.i18n ? window.i18n.getCurrentLanguage() : 'zh';
        
        let product;
        if (currentLang === 'en') {
            // 使用英文API
            const response = await fetch(`${api.baseURL}/language/en/products/${productId}`, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const responseData = await response.json();
            if (responseData.success && responseData.data) {
                product = responseData.data;
            } else {
                throw new Error('Invalid API response format');
            }
        } else {
            // 使用中文API
            product = await api.getProduct(productId);
        }
        
        renderProductModal(product);
        document.getElementById('product-modal').style.display = 'block';
    } catch (error) {
        console.error('加载产品详情失败:', error);
        showError('加载产品详情失败');
    } finally {
        hideLoading();
    }
}

// 渲染产品详情模态框
function renderProductModal(product) {
    const container = document.getElementById('product-details');
    if (!container) return;
    
    // 获取当前语言
    const currentLang = window.i18n ? window.i18n.getCurrentLanguage() : 'zh';
    
    // 根据语言设置文本
    const texts = currentLang === 'en' ? {
        unknownProduct: 'Unknown Product',
        noDescription: 'No Description',
        productSpecs: 'Product Specifications',
        brand: 'Brand',
        model: 'Model', 
        color: 'Color',
        weight: 'Weight',
        dimensions: 'Dimensions',
        material: 'Material',
        warranty: 'Warranty',
        origin: 'Origin',
        stock: 'Stock',
        months: 'months',
        pieces: 'pieces',
        kg: 'kg'
    } : {
        unknownProduct: '未知产品',
        noDescription: '暂无描述', 
        productSpecs: '产品规格',
        brand: '品牌',
        model: '型号',
        color: '颜色',
        weight: '重量',
        dimensions: '尺寸',
        material: '材质',
        warranty: '保修',
        origin: '产地',
        stock: '库存',
        months: '个月',
        pieces: '件',
        kg: 'kg'
    };
    
    const productName = product.name || texts.unknownProduct;
    const productDescription = product.description || texts.noDescription;
    
    container.innerHTML = `
        <div class="product-detail-image">
            ${product.image_url 
                ? `<img src="${product.image_url}" alt="${productName}">`
                : '<i class="fas fa-image"></i>'
            }
        </div>
        <h2 class="product-detail-title">${productName}</h2>
        <div class="product-detail-price">¥${product.price.toFixed(2)}</div>
        <div class="product-description">
            <p>${productDescription}</p>
        </div>
        
        <div class="product-specs">
            <h4>${texts.productSpecs}</h4>
            <div class="spec-grid">
                ${product.sku ? `<div class="spec-item"><span class="spec-label">SKU:</span><span class="spec-value">${product.sku}</span></div>` : ''}
                ${product.brand ? `<div class="spec-item"><span class="spec-label">${texts.brand}:</span><span class="spec-value">${product.brand}</span></div>` : ''}
                ${product.model ? `<div class="spec-item"><span class="spec-label">${texts.model}:</span><span class="spec-value">${product.model}</span></div>` : ''}
                ${product.color ? `<div class="spec-item"><span class="spec-label">${texts.color}:</span><span class="spec-value">${product.color}</span></div>` : ''}
                ${product.weight ? `<div class="spec-item"><span class="spec-label">${texts.weight}:</span><span class="spec-value">${product.weight}${texts.kg}</span></div>` : ''}
                ${product.dimensions ? `<div class="spec-item"><span class="spec-label">${texts.dimensions}:</span><span class="spec-value">${product.dimensions}</span></div>` : ''}
                ${product.material ? `<div class="spec-item"><span class="spec-label">${texts.material}:</span><span class="spec-value">${product.material}</span></div>` : ''}
                ${product.warranty_period ? `<div class="spec-item"><span class="spec-label">${texts.warranty}:</span><span class="spec-value">${product.warranty_period}${texts.months}</span></div>` : ''}
                ${product.origin_country ? `<div class="spec-item"><span class="spec-label">${texts.origin}:</span><span class="spec-value">${product.origin_country}</span></div>` : ''}
                <div class="spec-item"><span class="spec-label">${texts.stock}:</span><span class="spec-value">${product.stock_quantity || product.stock || 0}${texts.pieces}</span></div>
            </div>
        </div>
    `;
}

// 关闭模态框
function closeModal() {
    const modal = document.getElementById('product-modal');
    if (modal) {
        modal.style.display = 'none';
    }
}

// 平滑滚动到指定章节
function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
        const offsetTop = element.offsetTop - 80; // 考虑导航栏高度
        window.scrollTo({
            top: offsetTop,
            behavior: 'smooth'
        });
    }
}

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

// 显示错误消息
function showError(message) {
    // 这里可以实现一个更好的错误提示组件
    alert(message);
}

// 初始化特色产品组件
async function initializeFeaturedProducts() {
    try {
        if (window.FeaturedProducts) {
            const featuredProducts = new FeaturedProducts();
            featuredProducts.init();
            featuredProducts.setupEventListeners();
            
            // 将实例保存到全局，以便其他组件调用
            window.featuredProductsInstance = featuredProducts;
            
            console.log('特色产品组件初始化成功');
        } else {
            console.warn('FeaturedProducts 类未找到，请检查 featured-products.js 是否正确加载');
        }
    } catch (error) {
        console.error('初始化特色产品组件失败:', error);
    }
}

// 点击模态框外部关闭
window.onclick = function(event) {
    const modal = document.getElementById('product-modal');
    if (event.target === modal) {
        closeModal();
    }
}

// 返回顶部按钮功能
function initBackToTop() {
    const backToTopBtn = document.getElementById('back-to-top');
    
    if (backToTopBtn) {
        // 监听滚动事件
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) {
                backToTopBtn.classList.add('show');
            } else {
                backToTopBtn.classList.remove('show');
            }
        });
        
        // 点击返回顶部
        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
}

// 页面滚动动画增强
function initScrollAnimations() {
    // 为快速导航添加点击事件
    const quickNavItems = document.querySelectorAll('.quick-nav-item');
    quickNavItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = item.getAttribute('href').substring(1);
            scrollToSection(targetId);
        });
    });
}

// 导航栏滚动透明效果
function initNavbarScrollEffect() {
    const navbar = document.querySelector('.navbar');
    if (!navbar) return;
    
    let lastScrollY = window.scrollY;
    let ticking = false;
    
    function updateNavbar() {
        const scrollY = window.scrollY;
        const hasTopBar = document.body.classList.contains('has-top-bar');
        const topBarHidden = document.body.classList.contains('top-bar-hidden');
        
        // 轮播图全屏控制
        const heroSection = document.querySelector('.hero-section');
        if (heroSection) {
            if (scrollY === 0) {
                // 在顶部时设为全屏
                heroSection.classList.add('fullscreen');
                document.body.classList.add('hero-fullscreen');
            } else {
                // 滚动后移除全屏
                heroSection.classList.remove('fullscreen');
                document.body.classList.remove('hero-fullscreen');
            }
        }
        
        // 更新导航栏位置（优化性能，只在必要时更新）
        let navbarTop = '0px';
        if (hasTopBar && !topBarHidden) {
            navbarTop = '40px'; // 顶部信息栏高度
        }
        
        // 避免不必要的样式更新
        const currentTop = navbar.style.top;
        if (currentTop !== navbarTop) {
            navbar.style.setProperty('top', navbarTop, 'important');
        }
        
        // 根据顶部信息栏的状态调整滚动阈值
        let scrollThreshold = 1; // 极低阈值，一滚动就显示背景
        if (hasTopBar && !topBarHidden) {
            // 如果顶部信息栏显示，不显示导航栏背景
            scrollThreshold = 999999; // 设置极高值，确保不会触发
        }
        
        // 添加滚动方向判断，让动画更自然
        const scrollDirection = scrollY > lastScrollY ? 'down' : 'up';
        const scrollDelta = Math.abs(scrollY - lastScrollY);
        
        // 降低滚动距离要求，让背景变化更敏感
        if (scrollDelta > 1) {
            if (scrollY > scrollThreshold) {
                // 滚动超过阈值时显示背景
                if (!navbar.classList.contains('scrolled')) {
                    navbar.classList.add('scrolled');
                }
            } else {
                // 回到顶部时恢复透明
                if (navbar.classList.contains('scrolled')) {
                    navbar.classList.remove('scrolled');
                }
            }
        }
        
        lastScrollY = scrollY;
        ticking = false;
    }
    
    function requestTick() {
        if (!ticking) {
            requestAnimationFrame(updateNavbar);
            ticking = true;
        }
    }
    
    // 监听滚动事件
    window.addEventListener('scroll', requestTick, { passive: true });
    
    // 初始检查
    updateNavbar();
    
    console.log('导航栏滚动效果已初始化');
}

// 在初始化页面时调用
document.addEventListener('DOMContentLoaded', function() {
    // 原有的初始化代码...
    initBackToTop();
    initScrollAnimations();
});
