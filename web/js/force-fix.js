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
                position: fixed !important;
                top: 0 !important;
                width: 100% !important;
                z-index: 1000 !important;
                display: block !important;
                visibility: visible !important;
                opacity: 1 !important;
                height: 70px !important;
            `;
            // 移除任何内联的背景样式，让CSS类控制透明效果
            navbar.style.removeProperty('background');
            navbar.style.removeProperty('box-shadow');
            
            // 添加滚动监听以实现透明效果
            initNavbarTransparency();
            // 强制设置文字颜色
            setTimeout(() => forceNavbarTextColors(), 100);
            console.log('✅ 透明导航栏样式已应用');
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
                color: #495057 !important;
                text-decoration: none !important;
                font-weight: 600 !important;
                padding: 10px 20px !important;
                border-radius: 8px !important;
                transition: all 0.3s ease !important;
                text-shadow: 0 1px 2px rgba(255, 255, 255, 0.8) !important;
            `;
        });
        
        console.log(`✅ ${navLinks.length} 个导航链接样式已应用`);
        
        // 强制修复logo颜色
        const navLogo = document.querySelector('.nav-logo h2');
        if (navLogo) {
            navLogo.style.cssText = `
                color: #343a40 !important;
                font-weight: 700 !important;
                margin: 0 !important;
                text-shadow: 0 1px 2px rgba(255, 255, 255, 0.8) !important;
                transition: all 0.3s ease !important;
            `;
            console.log('✅ Logo样式已强制应用为深色');
        }
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
                background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%) !important;
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
                background: linear-gradient(90deg, #495057, #6c757d, #adb5bd, #dee2e6, #e9ecef, #f8f9fa) !important;
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
        
        // 延迟执行文字颜色强制修复
        setTimeout(() => {
            forceNavbarTextColors();
            console.log('🎨 导航栏文字颜色强制修复完成');
        }, 200);
        
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
    
    // 导航栏透明度滚动效果
    function initNavbarTransparency() {
        const navbar = document.querySelector('.navbar');
        if (!navbar) return;
        
        let ticking = false;
        
        function updateNavbar() {
            const scrollY = window.scrollY;
            
            if (scrollY > 50) {
                navbar.classList.add('scrolled');
            } else {
                navbar.classList.remove('scrolled');
            }
            
            // 强制确保文字颜色正确
            forceNavbarTextColors();
            ticking = false;
        }
        
        function onScroll() {
            if (!ticking) {
                requestAnimationFrame(updateNavbar);
                ticking = true;
            }
        }
        
        window.addEventListener('scroll', onScroll, { passive: true });
        updateNavbar(); // 初始检查
        
        console.log('🌟 导航栏透明滚动效果已启用');
    }
    
    // 强制设置导航栏文字颜色
    function forceNavbarTextColors() {
        // 强制Logo颜色
        const navLogo = document.querySelector('.nav-logo h2');
        if (navLogo) {
            navLogo.style.setProperty('color', '#343a40', 'important');
            navLogo.style.setProperty('text-shadow', '0 1px 2px rgba(255, 255, 255, 0.8)', 'important');
        }
        
        // 强制导航链接颜色
        const navLinks = document.querySelectorAll('.nav-link');
        navLinks.forEach(link => {
            link.style.setProperty('color', '#495057', 'important');
            link.style.setProperty('text-shadow', '0 1px 2px rgba(255, 255, 255, 0.8)', 'important');
        });
        
        // 强制汉堡菜单颜色
        const bars = document.querySelectorAll('.bar');
        bars.forEach(bar => {
            bar.style.setProperty('background', '#495057', 'important');
        });
        
        // 处理公司标志
        initCompanyLogo();
        
        console.log('💪 导航栏文字颜色强制设置为深色');
    }
    
    // 初始化公司标志
    function initCompanyLogo() {
        const companyLogo = document.getElementById('company-logo');
        if (companyLogo) {
            // 如果图片加载失败，显示默认标志
            companyLogo.onerror = function() {
                // 创建一个默认的SVG标志
                this.src = 'data:image/svg+xml;base64,' + btoa(`
                    <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 40 40">
                        <rect width="40" height="40" rx="8" fill="#495057"/>
                        <text x="20" y="28" font-family="Arial, sans-serif" font-size="24" font-weight="bold" text-anchor="middle" fill="white">C</text>
                    </svg>
                `);
                console.log('📷 使用默认公司标志');
            };
            
            // 强制设置样式
            companyLogo.style.setProperty('display', 'block', 'important');
            companyLogo.style.setProperty('visibility', 'visible', 'important');
            companyLogo.style.setProperty('opacity', '1', 'important');
            
            console.log('🏢 公司标志已初始化');
        }
    }
    
    // 设置定期检查，确保文字颜色不被覆盖
    setInterval(() => {
        forceNavbarTextColors();
    }, 2000); // 每2秒检查一次
    
    // 暴露到全局供调试使用
    window.forceFix = executeAllFixes;
    window.initNavbarTransparency = initNavbarTransparency;
    window.forceNavbarTextColors = forceNavbarTextColors;
    
    console.log('🎉 强制样式修复器已初始化！');
    
})();
