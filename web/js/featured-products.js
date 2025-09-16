/**
 * 特色产品展示组件
 * 显示6个固定位置的特色产品
 */

class FeaturedProducts {
    constructor() {
        this.featuredProducts = [];
        this.currentLanguage = 'zh';
    }

    /**
     * 初始化特色产品组件
     */
    init() {
        this.loadFeaturedProducts();
        this.setupLanguageListener();
    }

    /**
     * 设置语言监听器
     */
    setupLanguageListener() {
        // 移除了多语言功能
    }

    /**
     * 加载特色产品数据
     */
    async loadFeaturedProducts() {
        try {
            console.log('🔄 开始加载特色产品数据...');
            
            // 获取当前语言
            const currentLang = window.i18n ? window.i18n.getCurrentLanguage() : 'zh';
            
            let response;
            if (currentLang === 'en') {
                response = await fetch('/api/language/en/featured-products');
            } else {
                response = await fetch('/api/featured-products/');
            }
            
            console.log('📡 API响应状态:', response.status);
            
            if (response.ok) {
                const responseData = await response.json();
                
                // 获取当前语言
                const currentLang = window.i18n ? window.i18n.getCurrentLanguage() : 'zh';
                
                // 处理不同的响应格式
                if (currentLang === 'en' && responseData.success && responseData.data) {
                    // 多语言API返回格式: {success: true, data: [...]}
                    this.featuredProducts = responseData.data;
                } else {
                    // 普通API返回格式: [...]
                    this.featuredProducts = responseData;
                }
                
                console.log('📦 获取到特色产品数据:', this.featuredProducts);
                console.log('📊 特色产品数量:', this.featuredProducts.length);
                
                // 检查每个位置的产品
                for (let i = 0; i < this.featuredProducts.length; i++) {
                    const item = this.featuredProducts[i];
                    console.log(`位置 ${item.position}:`, item.product ? item.product.name : '空');
                }
                
                this.renderFeaturedProducts();
            } else {
                console.error('❌ 加载特色产品失败:', response.status);
                const errorText = await response.text();
                console.error('错误详情:', errorText);
                this.renderEmptyState();
            }
        } catch (error) {
            console.error('❌ 加载特色产品出错:', error);
            this.renderEmptyState();
        }
    }

    /**
     * 渲染特色产品
     */
    renderFeaturedProducts() {
        console.log('🎨 开始渲染特色产品...');
        
        const container = document.getElementById('featured-products');
        if (!container) {
            console.error('❌ 找不到特色产品容器元素');
            return;
        }

        if (!this.featuredProducts || this.featuredProducts.length === 0) {
            console.log('📭 没有特色产品数据，显示空状态');
            this.renderEmptyState();
            return;
        }

        // 过滤出有产品的位置
        const validProducts = this.featuredProducts.filter(item => item.product !== null);
        console.log('✅ 有效的特色产品数量:', validProducts.length);

        if (validProducts.length === 0) {
            console.log('📭 没有有效的特色产品，显示空状态');
            this.renderEmptyState();
            return;
        }

        let html = `
            <section class="featured-products-section">
                <div class="container">
                    <div class="section-header">
                        <h2 class="section-title" data-i18n="featured.title">应用分类</h2>
                        <p class="section-subtitle" data-i18n="featured.subtitle">精选优质商品，为您推荐</p>
                    </div>
                    <div class="products-grid">
        `;

        validProducts.forEach((positionData, index) => {
            console.log(`🔨 渲染位置 ${positionData.position} 的产品:`, positionData.product.name);
            html += this.renderSingleProductCard(positionData.product, positionData.position);
        });

        html += `
                    </div>
                </div>
            </section>
        `;
        
        container.innerHTML = html;
        console.log('✨ 特色产品渲染完成');
    }

    /**
     * 渲染产品卡片（多个）
     */
    renderProductCards() {
        let cardsHtml = '';
        
        // 生成6个位置的产品卡片
        for (let position = 1; position <= 6; position++) {
            const positionData = this.featuredProducts.find(p => p.position === position);
            
            if (positionData && positionData.product) {
                cardsHtml += this.renderSingleProductCard(positionData.product, position);
            } else {
                cardsHtml += this.renderEmptyCard(position);
            }
        }
        
        return cardsHtml;
    }

    /**
     * 渲染单个产品卡片
     */
    renderSingleProductCard(product, position) {
        const productName = product.name || '未知产品';
        const productPrice = product.price || 0;
        const productDescription = product.description || '暂无描述';
        
        // 获取翻译文本 - 强制检查当前语言
        let btnText = '查看详情';
        let overlayText = '点击查看详情';
        
        // 直接检查URL或其他方式确定当前语言
        const urlParams = new URLSearchParams(window.location.search);
        const urlLang = urlParams.get('lang');
        let currentLang = 'zh';
        
        if (window.i18n && typeof window.i18n.getCurrentLanguage === 'function') {
            currentLang = window.i18n.getCurrentLanguage();
        }
        
        // 如果检测到英文环境，强制使用英文文本
        if (currentLang === 'en' || urlLang === 'en' || 
            document.documentElement.lang === 'en' ||
            localStorage.getItem('language') === 'en') {
            btnText = 'View Details';
            overlayText = 'Click to View Details';
        }
        
        console.log('🔧 [DEBUG] renderSingleProductCard 被调用 - 产品ID:', product.id);
        console.log('🔧 [DEBUG] window.i18n 存在:', !!window.i18n);
        
        try {
            if (window.i18n && typeof window.i18n.t === 'function') {
                const currentLang = window.i18n.getCurrentLanguage();
                console.log('🔧 [DEBUG] 当前语言:', currentLang);
                
                const originalBtnText = btnText;
                const originalOverlayText = overlayText;
                
                btnText = window.i18n.t('btn.view_details') || btnText;
                overlayText = window.i18n.t('btn.click_view_details') || overlayText;
                
                console.log('🔧 [DEBUG] 原始按钮文本:', originalBtnText);
                console.log('🔧 [DEBUG] 翻译后按钮文本:', btnText);
                console.log('🔧 [DEBUG] 原始悬停文本:', originalOverlayText);
                console.log('🔧 [DEBUG] 翻译后悬停文本:', overlayText);
                console.log('🔧 [DEBUG] 翻译是否成功:', btnText !== originalBtnText);
            } else {
                console.log('🔧 [DEBUG] i18n 不可用，使用默认文本');
            }
        } catch (e) {
            console.warn('🔧 [DEBUG] 获取按钮翻译文本失败，使用默认文本:', e);
        }
        
        // 简化图片处理 - 如果没有图片就显示文字
        const imageUrl = product.image_url;
        
        return `
            <div class="product-card animate-slide-up" 
                 onclick="showProductDetails(${product.id})" 
                 style="cursor: pointer;"
                 title="点击查看 ${productName} 详情">
                <div class="product-image">
                    ${imageUrl ? 
                        `<img src="${imageUrl}" alt="${productName}" style="width: 100%; height: 200px; object-fit: cover; border-radius: 8px;">` : 
                        `<div style="width: 100%; height: 200px; background: #f8f9fa; border-radius: 8px; display: flex; align-items: center; justify-content: center; color: #6c757d; font-size: 14px;">
                            <i class="fas fa-image" style="font-size: 24px;"></i>
                            <span style="margin-left: 8px;">暂无图片</span>
                        </div>`
                    }
                    <div class="product-overlay" style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; background: rgba(0,0,0,0); transition: all 0.3s ease; display: flex; align-items: center; justify-content: center; color: white; font-size: 14px; border-radius: 8px;">
                        <span style="opacity: 0; transition: opacity 0.3s ease;">${overlayText}</span>
                    </div>
                </div>
                <div class="product-info">
                    <h3 class="product-name">${productName}</h3>
                    <p class="product-description">${productDescription}</p>
                    <div class="product-price">${productPrice}</div>
                    <button class="product-btn modern-btn" onclick="event.stopPropagation(); showProductDetails(${product.id})">
                        <span class="btn-text">${btnText}</span>
                        <span class="btn-icon">
                            <i class="fas fa-arrow-right"></i>
                        </span>
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * 渲染空卡片
     */
    renderEmptyCard(position) {
        return `
            <div class="featured-product-card empty-card" data-position="${position}">
                <div class="empty-content">
                    <div class="empty-icon">📦</div>
                    <p class="empty-text" data-translate="no_featured_product">暂无特色产品</p>
                    <small class="position-text" data-translate="position">位置 ${position}</small>
                </div>
            </div>
        `;
    }

    /**
     * 渲染星级评分
     */
    renderStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;
        let starsHtml = '';

        // 满星
        for (let i = 0; i < fullStars; i++) {
            starsHtml += '<span class="star full">★</span>';
        }

        // 半星
        if (hasHalfStar) {
            starsHtml += '<span class="star half">★</span>';
        }

        // 空星
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
        for (let i = 0; i < emptyStars; i++) {
            starsHtml += '<span class="star empty">☆</span>';
        }

        return starsHtml;
    }

    /**
     * 渲染空状态
     */
    renderEmptyState() {
        const container = document.getElementById('featured-products');
        if (!container) return;

        container.innerHTML = `
            <section class="featured-products-section">
                <div class="container">
                    <h2 class="section-title" data-translate="featured_products">应用分类</h2>
                    <div class="empty-state">
                        <div class="empty-icon">🛍️</div>
                        <h3>暂无特色产品</h3>
                        <p>精彩产品即将推出，敬请期待！</p>
                    </div>
                </div>
            </section>
        `;
    }

    /**
     * 刷新特色产品数据
     */
    refresh() {
        this.loadFeaturedProducts();
    }

    /**
     * 设置事件监听器
     */
    setupEventListeners() {
        document.addEventListener('click', (event) => {
            const target = event.target;

            // 查看详情按钮
            if (target.classList.contains('view-details')) {
                const productId = target.getAttribute('data-product-id');
                this.viewProductDetails(productId);
            }

            // 加入购物车按钮
            if (target.classList.contains('add-to-cart')) {
                const productId = target.getAttribute('data-product-id');
                this.addToCart(productId);
            }
        });

        // 键盘事件支持
        document.addEventListener('keydown', (event) => {
            // ESC键关闭模态框
            if (event.key === 'Escape') {
                const modal = document.getElementById('product-modal');
                if (modal && modal.style.display === 'block') {
                    closeModal();
                }
            }
        });
    }

    /**
     * 查看产品详情
     */
    viewProductDetails(productId) {
        // 这里可以实现产品详情页面的跳转或模态窗口显示
        window.location.href = `/product-details.html?id=${productId}`;
    }

    /**
     * 添加到购物车
     */
    addToCart(productId) {
        // 这里可以实现添加到购物车的功能
        console.log('添加产品到购物车:', productId);
        
        // 显示添加成功提示
        this.showNotification('产品已添加到购物车', 'success');
    }

    /**
     * 显示通知
     */
    showNotification(message, type = 'info') {
        // 创建通知元素
        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        // 添加到页面
        document.body.appendChild(notification);
        
        // 自动移除
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 3000);
    }
}

// 导出类
window.FeaturedProducts = FeaturedProducts;

/**
 * 处理产品按钮点击
 */
window.handleProductClick = function(button, productId) {
    // 添加加载状态
    button.classList.add('loading');
    const icon = button.querySelector('.btn-icon i');
    const originalIcon = icon.className;
    icon.className = 'fas fa-spinner';
    
    // 立即显示产品详情，不需要延迟
    try {
        showProductDetails(productId);
        
        // 移除加载状态
        button.classList.remove('loading');
        icon.className = originalIcon;
        
        // 短暂显示成功状态
        button.classList.add('success');
        setTimeout(() => {
            button.classList.remove('success');
        }, 800);
    } catch (error) {
        // 如果出错，恢复按钮状态
        button.classList.remove('loading');
        icon.className = originalIcon;
        console.error('显示产品详情失败:', error);
    }
};
