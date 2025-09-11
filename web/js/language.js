/**
 * 多语言支持
 */

// 语言数据
const LANGUAGES = {
    'zh': {
        'page-title': '产品展示网站',
        'site-title': '产品展示',
        'nav-home': '首页',
        'nav-categories': '分类',
        'nav-products': '产品',
        'nav-about': '关于',
        'nav-admin': '管理',
        'hero-title': '欢迎来到我们的产品展示',
        'hero-subtitle': '发现优质产品，体验卓越品质',
        'hero-cta': '浏览产品',
        'categories-title': '产品分类',
        'products-title': '热门产品',
        'search-placeholder': '搜索产品...',
        'filter-all-categories': '所有分类',
        'sort-newest': '最新',
        'sort-price-asc': '价格：低到高',
        'sort-price-desc': '价格：高到低',
        'sort-name': '名称',
        'about-title': '关于我们',
        'about-desc-1': '我们致力于为客户提供高质量的产品和优质的服务体验。',
        'about-desc-2': '通过持续的创新和改进，我们不断满足客户的需求，创造更大的价值。',
        'footer-copyright': '© 2024 产品展示网站. 保留所有权利.',
        'loading-text': '加载中...',
        'product-detail-title': '产品详情',
        'product-price': '价格',
        'product-description': '产品描述',
        'product-category': '分类',
        'product-created': '创建时间',
        'btn-close': '关闭',
        'no-products': '暂无产品',
        'no-categories': '暂无分类',
        'error-load-products': '加载产品失败',
        'error-load-categories': '加载分类失败',
        'error-load-data': '加载数据失败，请刷新页面重试',
        'error-load-product-detail': '加载产品详情失败',
        'no-description': '暂无描述',
        'product-specs': '产品规格',
        'product-brand': '品牌',
        'product-model': '型号',
        'product-color': '颜色',
        'product-weight': '重量',
        'product-dimensions': '尺寸',
        'product-material': '材质',
        'product-warranty': '保修',
        'product-origin': '产地',
        'product-stock': '库存',
        'months': '个月',
        'pieces': '件',
        'prev-page': '上一页',
        'next-page': '下一页'
    },
    'en': {
        'page-title': 'Product Showcase Website',
        'site-title': 'Product Showcase',
        'nav-home': 'Home',
        'nav-categories': 'Categories',
        'nav-products': 'Products',
        'nav-about': 'About',
        'nav-admin': 'Admin',
        'hero-title': 'Welcome to Our Product Showcase',
        'hero-subtitle': 'Discover Quality Products, Experience Excellence',
        'hero-cta': 'Browse Products',
        'categories-title': 'Product Categories',
        'products-title': 'Featured Products',
        'search-placeholder': 'Search products...',
        'filter-all-categories': 'All Categories',
        'sort-newest': 'Latest',
        'sort-price-asc': 'Price: Low to High',
        'sort-price-desc': 'Price: High to Low',
        'sort-name': 'Name',
        'about-title': 'About Us',
        'about-desc-1': 'We are committed to providing customers with high-quality products and excellent service experience.',
        'about-desc-2': 'Through continuous innovation and improvement, we continuously meet customer needs and create greater value.',
        'footer-copyright': '© 2024 Product Showcase Website. All rights reserved.',
        'loading-text': 'Loading...',
        'product-detail-title': 'Product Details',
        'product-price': 'Price',
        'product-description': 'Description',
        'product-category': 'Category',
        'product-created': 'Created',
        'btn-close': 'Close',
        'no-products': 'No products available',
        'no-categories': 'No categories available',
        'error-load-products': 'Failed to load products',
        'error-load-categories': 'Failed to load categories',
        'error-load-data': 'Failed to load data, please refresh the page',
        'error-load-product-detail': 'Failed to load product details',
        'no-description': 'No description available',
        'product-specs': 'Product Specifications',
        'product-brand': 'Brand',
        'product-model': 'Model',
        'product-color': 'Color',
        'product-weight': 'Weight',
        'product-dimensions': 'Dimensions',
        'product-material': 'Material',
        'product-warranty': 'Warranty',
        'product-origin': 'Origin',
        'product-stock': 'Stock',
        'months': ' months',
        'pieces': ' pcs',
        'prev-page': 'Previous',
        'next-page': 'Next'
    }
};

// 当前语言
let currentLanguage = 'zh';

/**
 * 初始化语言设置
 */
function initLanguage() {
    // 从本地存储获取用户偏好语言
    const savedLanguage = localStorage.getItem('preferred-language');
    if (savedLanguage && LANGUAGES[savedLanguage]) {
        currentLanguage = savedLanguage;
    } else {
        // 检测浏览器语言
        const browserLanguage = navigator.language || navigator.userLanguage;
        if (browserLanguage.startsWith('en')) {
            currentLanguage = 'en';
        }
    }
    
    // 应用语言设置
    applyLanguage(currentLanguage);
}

/**
 * 切换语言
 */
function toggleLanguage() {
    currentLanguage = currentLanguage === 'zh' ? 'en' : 'zh';
    localStorage.setItem('preferred-language', currentLanguage);
    applyLanguage(currentLanguage);
    
    // 重新加载数据以获取对应语言的内容
    if (typeof loadCategories === 'function') {
        loadCategories();
    }
    if (typeof loadProducts === 'function') {
        loadProducts();
    }
    if (typeof loadCategoryFilter === 'function') {
        loadCategoryFilter();
    }
}

/**
 * 应用语言设置
 */
function applyLanguage(lang) {
    const langData = LANGUAGES[lang];
    if (!langData) {
        console.error('Language not found:', lang);
        return;
    }
    
    // 更新HTML lang属性
    document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
    
    // 更新页面标题
    const title = document.querySelector('title');
    if (title && langData['page-title']) {
        title.textContent = langData['page-title'];
    }
    
    // 更新所有带有data-lang-key属性的元素
    const elements = document.querySelectorAll('[data-lang-key]');
    elements.forEach(element => {
        const key = element.getAttribute('data-lang-key');
        if (langData[key]) {
            element.textContent = langData[key];
        }
    });
    
    // 更新placeholder
    const placeholderElements = document.querySelectorAll('[data-lang-placeholder]');
    placeholderElements.forEach(element => {
        const key = element.getAttribute('data-lang-placeholder');
        if (langData[key]) {
            element.placeholder = langData[key];
        }
    });
    
    // 更新语言按钮显示
    const languageBtn = document.getElementById('current-language');
    if (languageBtn) {
        languageBtn.textContent = lang === 'zh' ? '中文' : 'English';
    }
    
    // 更新语言按钮标题
    const languageBtnElement = document.getElementById('language-btn');
    if (languageBtnElement) {
        languageBtnElement.title = lang === 'zh' ? '切换到英文' : 'Switch to Chinese';
    }
}

/**
 * 获取当前语言的文本
 */
function getText(key) {
    return LANGUAGES[currentLanguage] && LANGUAGES[currentLanguage][key] 
        ? LANGUAGES[currentLanguage][key] 
        : key;
}

/**
 * 获取当前语言
 */
function getCurrentLanguage() {
    return currentLanguage;
}

/**
 * 根据当前语言获取分类/产品名称
 */
function getLocalizedName(item) {
    if (currentLanguage === 'en') {
        return item.name_en || item.name || '';
    } else {
        return item.name_zh || item.name || '';
    }
}

/**
 * 根据当前语言获取分类/产品描述
 */
function getLocalizedDescription(item) {
    if (currentLanguage === 'en') {
        return item.description_en || item.description || '';
    } else {
        return item.description_zh || item.description || '';
    }
}

// 页面加载完成后初始化语言
document.addEventListener('DOMContentLoaded', function() {
    initLanguage();
    
    // 绑定语言切换按钮
    const languageBtn = document.getElementById('language-btn');
    if (languageBtn) {
        languageBtn.addEventListener('click', toggleLanguage);
    }
});
