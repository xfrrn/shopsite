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
            const response = await fetch('/api/featured-products');
            if (response.ok) {
                this.featuredProducts = await response.json();
                this.renderFeaturedProducts();
            } else {
                console.error('加载特色产品失败:', response.status);
                this.renderEmptyState();
            }
        } catch (error) {
            console.error('加载特色产品出错:', error);
            this.renderEmptyState();
        }
    }

    /**
     * 渲染特色产品
     */
    renderFeaturedProducts() {
        const container = document.getElementById('featured-products');
        if (!container) return;

        // 如果没有特色产品，显示空状态
        if (!this.featuredProducts || this.featuredProducts.length === 0) {
            this.renderEmptyState();
            return;
        }

        // 构建特色产品HTML
        const html = `
            <section class="featured-products-section">
                <div class="container">
                    <h2 class="section-title" data-translate="featured_products">${this.getTranslation('特色产品')}</h2>
                    <div class="featured-products-grid">
                        ${this.renderProductCards()}
                    </div>
                </div>
            </section>
        `;

        container.innerHTML = html;
    }

    /**
     * 渲染产品卡片
     */
    renderProductCards() {
        let cardsHtml = '';
        
        // 生成6个位置的产品卡片
        for (let position = 1; position <= 6; position++) {
            const product = this.featuredProducts.find(p => p.position === position);
            
            if (product) {
                cardsHtml += this.renderProductCard(product);
            } else {
                cardsHtml += this.renderEmptyCard(position);
            }
        }
        
        return cardsHtml;
    }

    /**
     * 渲染单个产品卡片
     */
    renderProductCard(product) {
        const productName = this.getProductText(product, 'name');
        const productDescription = this.getProductText(product, 'description');
        const categoryName = product.category ? this.getCategoryText(product.category, 'name') : '';
        
        // 处理价格显示
        const priceDisplay = product.original_price && product.original_price > product.price ? 
            `<span class="price-original">¥${product.original_price}</span>
             <span class="price-current">¥${product.price}</span>` :
            `<span class="price-current">¥${product.price}</span>`;
        
        // 处理图片显示
        const imageUrl = product.image_url || '/web/images/default-product.jpg';
        
        return `
            <div class="featured-product-card" data-product-id="${product.id}">
                <div class="product-image">
                    <img src="${imageUrl}" alt="${productName}" onerror="this.src='/web/images/default-product.jpg'">
                    ${product.original_price && product.original_price > product.price ? 
                        `<div class="discount-badge">${Math.round((1 - product.price / product.original_price) * 100)}% OFF</div>` : 
                        ''}
                    ${product.is_featured ? '<div class="featured-badge" data-translate="featured">精选</div>' : ''}
                </div>
                <div class="product-info">
                    <h3 class="product-name" data-translate="product_name_${product.id}">${productName}</h3>
                    <p class="product-category" data-translate="category_name_${product.category_id}">${categoryName}</p>
                    <p class="product-description" data-translate="product_desc_${product.id}">${productDescription}</p>
                    <div class="product-meta">
                        <div class="product-rating">
                            ${this.renderStars(product.rating || 0)}
                            <span class="rating-text">(${product.rating || 0})</span>
                        </div>
                        <div class="product-stats">
                            <span class="sales-count" data-translate="sales_count">销量: ${product.sales_count || 0}</span>
                            <span class="view-count" data-translate="view_count">浏览: ${product.view_count || 0}</span>
                        </div>
                    </div>
                    <div class="product-price">
                        ${priceDisplay}
                    </div>
                    <div class="product-actions">
                        <button class="btn btn-primary view-details" data-product-id="${product.id}" data-translate="view_details">
                            查看详情
                        </button>
                        <button class="btn btn-secondary add-to-cart" data-product-id="${product.id}" data-translate="add_to_cart">
                            加入购物车
                        </button>
                    </div>
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
                    <h2 class="section-title" data-translate="featured_products">特色产品</h2>
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
