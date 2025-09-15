console.log('=== 特色产品调试 ===');

// 检查依赖项
console.log('window.i18n:', !!window.i18n);
console.log('window.FeaturedProducts:', !!window.FeaturedProducts);

// 测试翻译功能
if (window.i18n) {
    console.log('当前语言:', window.i18n.getCurrentLanguage());
    console.log('featured.title (zh):', window.i18n.t('featured.title'));
    console.log('featured.subtitle (zh):', window.i18n.t('featured.subtitle'));
    
    // 切换到英文测试
    window.i18n.switchLanguage('en');
    console.log('切换后语言:', window.i18n.getCurrentLanguage());
    console.log('featured.title (en):', window.i18n.t('featured.title'));
    console.log('featured.subtitle (en):', window.i18n.t('featured.subtitle'));
    
    // 切换回中文
    window.i18n.switchLanguage('zh');
}

// 测试API
async function testFeaturedProductsAPI() {
    try {
        console.log('=== 测试中文API ===');
        const response1 = await fetch('/api/featured-products/');
        const data1 = await response1.json();
        console.log('中文API数据:', data1);
        
        console.log('=== 测试英文API ===');
        const response2 = await fetch('/api/language/en/featured-products');
        const data2 = await response2.json();
        console.log('英文API数据:', data2);
    } catch (e) {
        console.error('API测试失败:', e);
    }
}

testFeaturedProductsAPI();

// 手动初始化特色产品
setTimeout(() => {
    console.log('=== 手动初始化特色产品 ===');
    if (window.FeaturedProducts) {
        try {
            const fp = new window.FeaturedProducts();
            fp.init();
            console.log('特色产品初始化成功');
            
            // 保存到全局变量以便调试
            window.debugFeaturedProducts = fp;
        } catch (e) {
            console.error('特色产品初始化失败:', e);
        }
    } else {
        console.error('FeaturedProducts类未找到');
    }
}, 1000);