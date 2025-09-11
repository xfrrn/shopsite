// 强制修复所有样式问题
(function() {
    'use strict';
    
    console.log('🔧 启动强制样式修复...');
    
    // 强制修复导航栏
    function forceNavbarFix() {
        console.log('🎯 修复导航栏...');
        
        const navbar = document.querySelector('.navbar');
        const navContainer = document.querySelector('.nav-container');
        const navMenu = document.querySelector('.nav-menu');
        
        if (navbar) {
            navbar.style.cssText = `
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
                position: fixed !important;
                top: 0 !important;
                width: 100% !important;
                z-index: 1000 !important;
                display: block !important;
                visibility: visible !important;
                opacity: 1 !important;
                height: 70px !important;
                box-shadow: 0 2px 10px rgba(0,0,0,0.1) !important;
            `;
            console.log('✅ 导航栏样式已应用');
        }
        
        if (navContainer) {
            navContainer.style.cssText = `
                max-width: 1200px !important;
                margin: 0 auto !important;
                padding: 0 20px !important;
                display: flex !important;
                justify-content: space-between !important;
                align-items: center !important;
                height: 70px !important;
            `;
            console.log('✅ 导航容器样式已应用');
        }
        
        if (navMenu) {
            navMenu.style.cssText = `
                display: flex !important;
                list-style: none !important;
                gap: 30px !important;
                margin: 0 !important;
                padding: 0 !important;
            `;
            console.log('✅ 导航菜单样式已应用');
        }
        
        // 修复导航链接
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.style.cssText = `
                color: white !important;
                text-decoration: none !important;
                font-weight: 500 !important;
                padding: 8px 16px !important;
                border-radius: 20px !important;
                transition: all 0.3s ease !important;
            `;
        });
        
        console.log(`✅ ${navLinks.length} 个导航链接样式已应用`);
    }
    
    // 强制修复Hero区域
    function forceHeroFix() {
        console.log('🎯 修复Hero区域...');
        
        const heroSection = document.querySelector('.hero-section');
        const heroCarousel = document.querySelector('.hero-carousel');
        const heroContent = document.querySelector('.hero-content');
        
        if (heroSection) {
            heroSection.style.cssText = `
                position: relative !important;
                height: 100vh !important;
                overflow: hidden !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
                visibility: visible !important;
                opacity: 1 !important;
            `;
            console.log('✅ Hero区域样式已应用');
        }
        
        if (heroCarousel) {
            heroCarousel.style.cssText = `
                position: absolute !important;
                top: 0 !important;
                left: 0 !important;
                width: 100% !important;
                height: 100% !important;
                z-index: 1 !important;
            `;
            console.log('✅ Hero轮播样式已应用');
        }
        
        if (heroContent) {
            heroContent.style.cssText = `
                position: relative !important;
                z-index: 2 !important;
                text-align: center !important;
                color: white !important;
                max-width: 900px !important;
                padding: 60px 40px !important;
                backdrop-filter: blur(5px) !important;
                background: rgba(255, 255, 255, 0.1) !important;
                border-radius: 30px !important;
                border: 1px solid rgba(255, 255, 255, 0.2) !important;
                visibility: visible !important;
                opacity: 1 !important;
            `;
            console.log('✅ Hero内容样式已应用');
        }
    }
    
    // 强制修复页面装饰
    function forceDecorationFix() {
        console.log('🎯 修复页面装饰...');
        
        const pageDecoration = document.querySelector('.page-decoration');
        if (pageDecoration) {
            pageDecoration.style.cssText = `
                position: fixed !important;
                top: 0 !important;
                left: 0 !important;
                right: 0 !important;
                height: 4px !important;
                background: linear-gradient(90deg, #667eea, #764ba2, #f093fb, #f5576c, #4facfe, #00f2fe) !important;
                z-index: 1001 !important;
                display: block !important;
                visibility: visible !important;
                opacity: 1 !important;
            `;
            console.log('✅ 页面装饰样式已应用');
        }
    }
    
    // 强制修复主内容区域
    function forceMainContentFix() {
        console.log('🎯 修复主内容区域...');
        
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.style.cssText = `
                margin-top: 70px !important;
                position: relative !important;
                z-index: 1 !important;
            `;
            console.log('✅ 主内容区域样式已应用');
        }
    }
    
    // 执行所有修复
    function executeAllFixes() {
        console.log('🚀 执行所有强制修复...');
        
        forceNavbarFix();
        forceHeroFix();
        forceDecorationFix();
        forceMainContentFix();
        
        console.log('✨ 所有强制修复完成！');
    }
    
    // 在不同时机执行修复
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', executeAllFixes);
    } else {
        executeAllFixes();
    }
    
    // 延迟执行确保覆盖其他样式
    setTimeout(executeAllFixes, 100);
    setTimeout(executeAllFixes, 500);
    setTimeout(executeAllFixes, 1000);
    
    // 监听样式变化，重新应用修复
    const observer = new MutationObserver(function(mutations) {
        mutations.forEach(function(mutation) {
            if (mutation.type === 'attributes' && mutation.attributeName === 'style') {
                console.log('⚠️ 检测到样式变化，重新应用修复');
                setTimeout(executeAllFixes, 10);
            }
        });
    });
    
    // 开始观察
    setTimeout(() => {
        const elements = document.querySelectorAll('.navbar, .hero-section, .page-decoration');
        elements.forEach(el => {
            if (el) {
                observer.observe(el, {
                    attributes: true,
                    attributeFilter: ['style', 'class']
                });
            }
        });
        console.log(`🔍 开始监听 ${elements.length} 个关键元素的样式变化`);
    }, 100);
    
    // 暴露到全局供调试使用
    window.forceFix = executeAllFixes;
    
    console.log('🎉 强制样式修复器已初始化！');
    
})();
