/**
 * 网站性能测试脚本
 * 在浏览器控制台运行此脚本来测试网站性能
 */

console.log('🚀 开始性能测试...');

// 测试API响应时间
async function testAPIPerformance() {
    const tests = [
        { name: '分类API', url: '/api/categories/', expected: 'categories' },
        { name: '产品API', url: '/api/products/', expected: 'items' },
        { name: '管理员API', url: '/api/admin/me', expected: 'username' }
    ];
    
    console.log('\n📊 API性能测试:');
    console.log('─'.repeat(50));
    
    for (const test of tests) {
        const startTime = performance.now();
        try {
            const response = await fetch(test.url, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
                }
            });
            const endTime = performance.now();
            const data = await response.json();
            
            const duration = Math.round(endTime - startTime);
            const status = response.ok ? '✅' : '❌';
            const size = JSON.stringify(data).length;
            
            console.log(`${status} ${test.name}: ${duration}ms (${size} bytes)`);
            
            if (duration > 1000) {
                console.warn(`⚠️  ${test.name} 响应时间过长: ${duration}ms`);
            }
        } catch (error) {
            console.error(`❌ ${test.name} 失败:`, error.message);
        }
    }
}

// 测试页面加载性能
function testPagePerformance() {
    const navigation = performance.getEntriesByType('navigation')[0];
    const paint = performance.getEntriesByType('paint');
    
    console.log('\n🎨 页面性能指标:');
    console.log('─'.repeat(50));
    
    if (navigation) {
        console.log(`📄 DOM内容加载: ${Math.round(navigation.domContentLoadedEventEnd - navigation.domContentLoadedEventStart)}ms`);
        console.log(`🏁 页面完全加载: ${Math.round(navigation.loadEventEnd - navigation.loadEventStart)}ms`);
        console.log(`🔗 DNS查询: ${Math.round(navigation.domainLookupEnd - navigation.domainLookupStart)}ms`);
        console.log(`🤝 TCP连接: ${Math.round(navigation.connectEnd - navigation.connectStart)}ms`);
    }
    
    paint.forEach(entry => {
        console.log(`🎨 ${entry.name}: ${Math.round(entry.startTime)}ms`);
    });
}

// 测试网络资源加载
function testResourcePerformance() {
    const resources = performance.getEntriesByType('resource');
    
    console.log('\n📦 资源加载分析:');
    console.log('─'.repeat(50));
    
    const resourceStats = {};
    
    resources.forEach(resource => {
        const type = resource.name.split('.').pop() || 'other';
        if (!resourceStats[type]) {
            resourceStats[type] = { count: 0, totalDuration: 0, totalSize: 0 };
        }
        
        resourceStats[type].count++;
        resourceStats[type].totalDuration += resource.duration;
        resourceStats[type].totalSize += resource.transferSize || 0;
    });
    
    Object.entries(resourceStats).forEach(([type, stats]) => {
        const avgDuration = Math.round(stats.totalDuration / stats.count);
        const totalSize = Math.round(stats.totalSize / 1024); // KB
        console.log(`📁 ${type}: ${stats.count}个文件, 平均${avgDuration}ms, 总计${totalSize}KB`);
    });
}

// 缓存测试
function testCacheEffectiveness() {
    console.log('\n💾 缓存效果测试:');
    console.log('─'.repeat(50));
    
    // 检查本地存储
    const tokenExists = !!localStorage.getItem('admin_token');
    console.log(`🔑 用户Token缓存: ${tokenExists ? '✅ 已缓存' : '❌ 未缓存'}`);
    
    // 检查浏览器缓存
    const resources = performance.getEntriesByType('resource');
    const cachedResources = resources.filter(r => r.transferSize === 0);
    const cacheHitRate = Math.round((cachedResources.length / resources.length) * 100);
    
    console.log(`📋 资源缓存命中率: ${cacheHitRate}% (${cachedResources.length}/${resources.length})`);
    
    if (cacheHitRate < 50) {
        console.warn('⚠️  缓存命中率偏低，建议优化缓存策略');
    }
}

// 性能建议
function generatePerformanceSuggestions() {
    console.log('\n💡 性能优化建议:');
    console.log('─'.repeat(50));
    
    const suggestions = [];
    
    // 检查是否有重定向
    const navigation = performance.getEntriesByType('navigation')[0];
    if (navigation && navigation.redirectCount > 0) {
        suggestions.push('减少HTTP重定向，直接访问最终URL');
    }
    
    // 检查资源大小
    const resources = performance.getEntriesByType('resource');
    const largeResources = resources.filter(r => r.transferSize > 1024 * 1024); // 1MB
    if (largeResources.length > 0) {
        suggestions.push(`压缩大文件: ${largeResources.length}个文件超过1MB`);
    }
    
    // 检查API响应时间
    const apiRequests = resources.filter(r => r.name.includes('/api/'));
    const slowAPIs = apiRequests.filter(r => r.duration > 1000);
    if (slowAPIs.length > 0) {
        suggestions.push(`优化API性能: ${slowAPIs.length}个接口响应超过1秒`);
    }
    
    if (suggestions.length === 0) {
        console.log('🎉 性能表现良好，无需特别优化！');
    } else {
        suggestions.forEach((suggestion, index) => {
            console.log(`${index + 1}. ${suggestion}`);
        });
    }
}

// 执行所有测试
async function runPerformanceTests() {
    testPagePerformance();
    testResourcePerformance();
    testCacheEffectiveness();
    
    // API测试需要认证，仅在有token时运行
    if (localStorage.getItem('admin_token')) {
        await testAPIPerformance();
    } else {
        console.log('\n⚠️  未登录，跳过API性能测试');
    }
    
    generatePerformanceSuggestions();
    
    console.log('\n✅ 性能测试完成！');
}

// 自动运行测试
runPerformanceTests();
