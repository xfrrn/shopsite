/**
 * 翻译配置文件
 * 在这里设置您的翻译API密钥和偏好设置
 */

window.TRANSLATOR_CONFIG = {
    // 翻译服务提供商
    // 可选: 'mymemory' (免费), 'google' (需要API密钥), 'baidu' (需要API密钥)
    provider: 'mymemory',
    
    // Google翻译API密钥 (如果使用Google翻译)
    googleApiKey: '',
    
    // 百度翻译API配置 (如果使用百度翻译)
    baiduConfig: {
        appid: '',
        key: ''
    },
    
    // 默认源语言
    defaultSourceLang: 'zh',
    
    // 翻译缓存过期时间 (毫秒)
    cacheExpiry: 7 * 24 * 60 * 60 * 1000, // 7天
    
    // 批量翻译延迟 (毫秒) - 避免API请求过于频繁
    batchDelay: 50, // 减少到50ms提高速度
    
    // 最大重试次数
    maxRetries: 2, // 减少重试次数
    
    // 启用调试模式
    debug: false,
    
    // 性能优化选项
    performance: {
        // 每批处理的元素数量
        batchSize: 8, // 增加批处理大小
        
        // 并发翻译请求数量
        maxConcurrentRequests: 3,
        
        // 启用预加载翻译
        enablePreload: true,
        
        // 启用文本压缩（长文本分段）
        enableTextCompression: true,
        
        // 最大文本长度（字符）
        maxTextLength: 300,
        
        // 启用动画效果
        enableAnimations: true,
        
        // 动画持续时间（毫秒）
        animationDuration: 200
    }
};
