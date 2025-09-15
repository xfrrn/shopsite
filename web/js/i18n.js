/**
 * 国际化管理器 - 简单版本，使用硬编码翻译
 */

class I18nManager {
    constructor() {
        this.currentLanguage = localStorage.getItem('language') || 'zh';
        this.translations = this.getTranslations();
        this.init();
    }

    // 硬编码的翻译数据
    getTranslations() {
        return {
            zh: {
                'nav.home': '首页',
                'nav.products': '产品',
                'nav.applications': '应用',
                'nav.about': '关于我们',
                'hero.title': '欢迎来到我们的产品展示',
                'hero.subtitle': '发现优质产品，体验卓越品质',
                'hero.button': '立即探索',
                'section.categories': '产品分类',
                'section.products': '热门产品',
                'btn.view_all_products': '查看所有产品',
                'btn.view_more': '查看更多',
                'btn.search': '搜索',
                'common.loading': '加载中...',
                'common.no_data': '暂无数据',
                'common.error': '出错了',
                'contact.service_hotline': '客服热线：',
                'contact.email': '邮箱：',
                'social.follow_us': '关注我们：',
                'featured.title': '应用分类',
                'featured.subtitle': '精选优质商品，为您推荐',
                'btn.view_details': '查看详情',
                'btn.click_view_details': '点击查看详情',
                'btn.refresh_products': '刷新产品',
                'search.placeholder': '搜索产品...',
                'site.title': '产品展示',
                'site.logo_alt': '公司标志',
                'filter.all_categories': '所有分类',
                'sort.newest': '最新',
                'sort.price_asc': '价格：低到高',
                'sort.price_desc': '价格：高到低',
                'sort.name': '名称',
                'data.no_categories': '暂无分类数据',
                'data.no_products': '暂无产品数据',
                'pagination.previous': '上一页',
                'pagination.next': '下一页',
                'page.title': '产品展示网站'
            },
            en: {
                'nav.home': 'Home',
                'nav.products': 'Products',
                'nav.applications': 'Applications',
                'nav.about': 'About Us',
                'hero.title': 'Welcome to Our Product Showcase',
                'hero.subtitle': 'Discover Quality Products, Experience Excellence',
                'hero.button': 'Explore Now',
                'section.categories': 'Product Categories',
                'section.products': 'Popular Products',
                'btn.view_all_products': 'View All Products',
                'btn.view_more': 'View More',
                'btn.search': 'Search',
                'common.loading': 'Loading...',
                'common.no_data': 'No Data',
                'common.error': 'Error',
                'contact.service_hotline': 'Service Hotline: ',
                'contact.email': 'Email: ',
                'social.follow_us': 'Follow Us: ',
                'featured.title': 'Application Categories',
                'featured.subtitle': 'Carefully Selected Quality Products for You',
                'btn.view_details': 'View Details',
                'btn.click_view_details': 'Click to View Details',
                'btn.refresh_products': 'Refresh Products',
                'search.placeholder': 'Search products...',
                'site.title': 'Product Showcase',
                'site.logo_alt': 'Company Logo',
                'page.title': 'Product Showcase Website',
                'filter.all_categories': 'All Categories',
                'sort.newest': 'Newest',
                'sort.price_asc': 'Price: Low to High',
                'sort.price_desc': 'Price: High to Low',
                'sort.name': 'Name',
                'data.no_categories': 'No categories available',
                'data.no_products': 'No products available',
                'pagination.previous': 'Previous',
                'pagination.next': 'Next'
            }
        };
    }

    // 初始化
    init() {
        this.updateLanguageButton();
        this.translatePage();
        this.bindEvents();
        this.updateHtmlLang();
    }

    // 绑定事件
    bindEvents() {
        // 语言切换按钮点击
        const languageBtn = document.getElementById('languageBtn');
        const languageDropdown = document.getElementById('languageDropdown');
        
        if (languageBtn && languageDropdown) {
            languageBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleLanguageDropdown();
            });

            // 语言选项点击
            const langOptions = languageDropdown.querySelectorAll('.lang-option');
            langOptions.forEach(option => {
                option.addEventListener('click', async (e) => {
                    e.stopPropagation();
                    const lang = option.getAttribute('data-lang');
                    await this.switchLanguage(lang);
                });
            });

            // 点击其他地方关闭下拉菜单
            document.addEventListener('click', () => {
                this.hideLanguageDropdown();
            });
        }
    }

    // 切换语言下拉菜单
    toggleLanguageDropdown() {
        const dropdown = document.getElementById('languageDropdown');
        const btn = document.getElementById('languageBtn');
        
        if (dropdown && btn) {
            const isVisible = dropdown.classList.contains('show');
            if (isVisible) {
                this.hideLanguageDropdown();
            } else {
                this.showLanguageDropdown();
            }
        }
    }

    // 显示语言下拉菜单
    showLanguageDropdown() {
        const dropdown = document.getElementById('languageDropdown');
        const btn = document.getElementById('languageBtn');
        
        if (dropdown && btn) {
            dropdown.classList.add('show');
            btn.classList.add('active');
        }
    }

    // 隐藏语言下拉菜单
    hideLanguageDropdown() {
        const dropdown = document.getElementById('languageDropdown');
        const btn = document.getElementById('languageBtn');
        
        if (dropdown && btn) {
            dropdown.classList.remove('show');
            btn.classList.remove('active');
        }
    }

    // 切换语言
    async switchLanguage(lang) {
        if (lang !== this.currentLanguage && this.translations[lang]) {
            this.currentLanguage = lang;
            localStorage.setItem('language', lang);
            
            // 清除数据缓存
            if (typeof window.clearDataCache === 'function') {
                window.clearDataCache();
            }
            
            this.updateLanguageButton();
            this.updateHtmlLang();
            this.hideLanguageDropdown();
            
            // 重新加载多语言数据
            await this.loadMultilingualData(lang);
            
            // 数据加载完成后再进行翻译
            this.translatePage();
            
            // 触发语言切换事件
            window.dispatchEvent(new CustomEvent('languageChanged', { 
                detail: { language: lang } 
            }));
            
            console.log(`语言已切换为: ${lang}`);
        }
    }

    // 加载多语言数据
    async loadMultilingualData(lang) {
        try {
            // 直接调用main.js中的函数重新加载数据
            if (typeof window.loadCategories === 'function') {
                await window.loadCategories();
            }
            
            // 重新加载分类筛选器
            if (typeof window.loadCategoryFilter === 'function') {
                await window.loadCategoryFilter();
            }
            
            if (typeof window.loadProducts === 'function') {
                await window.loadProducts();
            }
            
            // 重新加载精选产品数据
            if (typeof window.loadFeaturedProducts === 'function') {
                await window.loadFeaturedProducts();
            }
            
            // 重新加载轮播图数据
            if (typeof window.refreshHeroCarousel === 'function') {
                await window.refreshHeroCarousel();
            }
            
            // 重新加载关于我们数据
            if (window.aboutUsLoader && typeof window.aboutUsLoader.loadContent === 'function') {
                await window.aboutUsLoader.loadContent();
            }
        } catch (error) {
            console.error('加载多语言数据失败:', error);
        }
    }

    // 加载指定语言的产品数据
    async loadProductsByLanguage(lang) {
        try {
            const response = await fetch(`/api/language/${lang}/products`);
            const data = await response.json();
            
            if (data.success && data.data) {
                // 更新全局产品数据
                if (window.displayProducts) {
                    window.displayProducts(data.data);
                }
            }
        } catch (error) {
            console.error('加载产品数据失败:', error);
        }
    }

    // 加载指定语言的分类数据
    async loadCategoriesByLanguage(lang) {
        try {
            const response = await fetch(`/api/language/${lang}/categories`);
            const data = await response.json();
            
            if (data.success && data.data) {
                // 更新全局分类数据
                if (window.displayCategories) {
                    window.displayCategories(data.data);
                }
            }
        } catch (error) {
            console.error('加载分类数据失败:', error);
        }
    }

    // 加载指定语言的精选产品数据
    async loadFeaturedProductsByLanguage(lang) {
        try {
            const response = await fetch(`/api/language/${lang}/featured-products`);
            const data = await response.json();
            
            if (data.success && data.data) {
                // 更新精选产品数据
                if (window.renderFeaturedProducts) {
                    window.renderFeaturedProducts(data.data);
                }
            }
        } catch (error) {
            console.error('加载精选产品数据失败:', error);
        }
    }

    // 更新语言按钮显示
    updateLanguageButton() {
        const currentLangSpan = document.getElementById('currentLang');
        const langOptions = document.querySelectorAll('.lang-option');
        
        if (currentLangSpan) {
            currentLangSpan.textContent = this.currentLanguage === 'zh' ? '中' : 'EN';
        }

        // 更新选项状态
        langOptions.forEach(option => {
            const lang = option.getAttribute('data-lang');
            if (lang === this.currentLanguage) {
                option.classList.add('active');
            } else {
                option.classList.remove('active');
            }
        });
    }

    // 翻译页面
    translatePage() {
        const elements = document.querySelectorAll('[data-i18n]');
        
        elements.forEach(element => {
            const key = element.getAttribute('data-i18n');
            const translation = this.getTranslation(key);
            
            if (translation) {
                // 检查是否是输入框的placeholder
                if (element.tagName === 'INPUT' && element.hasAttribute('placeholder')) {
                    element.setAttribute('placeholder', translation);
                } else {
                    element.textContent = translation;
                }
            }
        });

        // 翻译具有data-i18n-placeholder属性的元素
        const placeholderElements = document.querySelectorAll('[data-i18n-placeholder]');
        placeholderElements.forEach(element => {
            const key = element.getAttribute('data-i18n-placeholder');
            const translation = this.getTranslation(key);
            
            if (translation) {
                element.setAttribute('placeholder', translation);
            }
        });

        // 翻译具有data-i18n-alt属性的元素
        const altElements = document.querySelectorAll('[data-i18n-alt]');
        altElements.forEach(element => {
            const key = element.getAttribute('data-i18n-alt');
            const translation = this.getTranslation(key);
            
            if (translation) {
                element.setAttribute('alt', translation);
            }
        });

        // 翻译页面标题
        const pageTitle = this.getTranslation('page.title');
        if (pageTitle) {
            document.title = pageTitle;
        }

        // 翻译特殊元素
        this.translateSpecialElements();
    }

    // 翻译特殊元素（需要特殊处理的元素）
    translateSpecialElements() {
        // 翻译顶部信息栏
        this.translateTopInfoBar();
        
        // 翻译动态加载的内容（如果需要的话）
        this.translateDynamicContent();
    }

    // 翻译顶部信息栏
    translateTopInfoBar() {
        const serviceText = document.querySelector('.contact-info .contact-text');
        const emailText = document.querySelectorAll('.contact-info .contact-text')[1];
        const socialText = document.querySelector('.social-text');
        
        if (serviceText) {
            serviceText.textContent = this.getTranslation('contact.service_hotline');
        }
        
        if (emailText) {
            emailText.textContent = this.getTranslation('contact.email');
        }
        
        if (socialText) {
            socialText.textContent = this.getTranslation('social.follow_us');
        }
    }

    // 翻译动态内容
    translateDynamicContent() {
        // 这里可以处理动态加载的内容翻译
        // 例如产品名称、分类名称等
        
        // 监听DOM变化，自动翻译新添加的元素
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                mutation.addedNodes.forEach((node) => {
                    if (node.nodeType === 1) { // 元素节点
                        const i18nElements = node.querySelectorAll ? node.querySelectorAll('[data-i18n]') : [];
                        i18nElements.forEach(element => {
                            const key = element.getAttribute('data-i18n');
                            const translation = this.getTranslation(key);
                            if (translation) {
                                element.textContent = translation;
                            }
                        });
                    }
                });
            });
        });

        observer.observe(document.body, {
            childList: true,
            subtree: true
        });
    }

    // 获取翻译文本
    getTranslation(key) {
        const langData = this.translations[this.currentLanguage];
        return langData ? langData[key] : key;
    }

    // 更新HTML lang属性
    updateHtmlLang() {
        document.documentElement.lang = this.currentLanguage === 'zh' ? 'zh-CN' : 'en-US';
    }

    // 获取当前语言
    getCurrentLanguage() {
        return this.currentLanguage;
    }

    // 添加翻译
    addTranslation(lang, key, value) {
        if (!this.translations[lang]) {
            this.translations[lang] = {};
        }
        this.translations[lang][key] = value;
    }

    // 批量添加翻译
    addTranslations(lang, translations) {
        if (!this.translations[lang]) {
            this.translations[lang] = {};
        }
        Object.assign(this.translations[lang], translations);
    }
}

// 全局变量
window.i18n = null;

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', function() {
    window.i18n = new I18nManager();
    console.log('🌐 国际化管理器已初始化');
});