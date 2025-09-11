/**
 * 自动翻译管理器
 * 支持多种翻译服务API
 */

class AutoTranslator {
    constructor() {
        this.currentLanguage = 'zh';
        this.supportedLanguages = {
            'zh': '中文',
            'en': 'English',
            'ja': '日本語',
            'ko': '한국어',
            'fr': 'Français',
            'de': 'Deutsch',
            'es': 'Español',
            'it': 'Italiano',
            'pt': 'Português',
            'ru': 'Русский',
            'ar': 'العربية',
            'hi': 'हिन्दी',
            'th': 'ไทย',
            'vi': 'Tiếng Việt'
        };
        
        // 从配置文件加载设置
        const config = window.TRANSLATOR_CONFIG || {};
        this.config = {
            provider: config.provider || 'mymemory',
            googleApiKey: config.googleApiKey || '',
            baiduConfig: config.baiduConfig || {},
            defaultSourceLang: config.defaultSourceLang || 'zh',
            cacheExpiry: config.cacheExpiry || 24 * 60 * 60 * 1000,
            batchDelay: config.batchDelay || 100,
            maxRetries: config.maxRetries || 3,
            debug: config.debug || false,
            performance: {
                batchSize: config.performance?.batchSize || 5,
                maxConcurrentRequests: config.performance?.maxConcurrentRequests || 3,
                enablePreload: config.performance?.enablePreload || true,
                enableTextCompression: config.performance?.enableTextCompression || true,
                maxTextLength: config.performance?.maxTextLength || 300,
                enableAnimations: config.performance?.enableAnimations || true,
                animationDuration: config.performance?.animationDuration || 200
            }
        };
        
        this.cache = new Map(); // 翻译缓存
        this.translating = false; // 防止重复翻译
        
        this.initLanguageSelector();
    }

    /**
     * 设置翻译服务
     * @param {string} service - 服务类型：'google', 'baidu', 'mymemory'
     * @param {string} apiKey - API密钥（如果需要）
     */
    setTranslationService(service, apiKey = null) {
        this.config.provider = service;
        if (apiKey) {
            if (service === 'google') {
                this.config.googleApiKey = apiKey;
            }
        }
    }

    /**
     * 初始化语言选择器
     */
    initLanguageSelector() {
        // 检查是否已有语言选择器
        if (document.getElementById('language-selector')) {
            return;
        }

        // 创建语言选择器
        const selector = document.createElement('div');
        selector.id = 'language-selector';
        selector.className = 'language-selector';
        selector.innerHTML = `
            <div class="language-dropdown">
                <button class="language-btn" id="language-btn">
                    <span id="current-lang-text">${this.supportedLanguages[this.currentLanguage]}</span>
                    <i class="fas fa-chevron-down"></i>
                </button>
                <div class="language-menu" id="language-menu">
                    ${Object.entries(this.supportedLanguages).map(([code, name]) => `
                        <div class="language-option ${code === this.currentLanguage ? 'active' : ''}" 
                             data-lang="${code}" onclick="translator.switchLanguage('${code}')">
                            <span class="lang-name">${name}</span>
                            <span class="lang-code">${code.toUpperCase()}</span>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;

        // 添加到页面
        document.body.appendChild(selector);

        // 绑定事件
        this.bindEvents();
        
        // 初始化当前语言
        const savedLang = localStorage.getItem('auto-translate-lang');
        if (savedLang && this.supportedLanguages[savedLang]) {
            this.switchLanguage(savedLang);
        }
    }

    /**
     * 绑定事件
     */
    bindEvents() {
        const langBtn = document.getElementById('language-btn');
        const langMenu = document.getElementById('language-menu');

        langBtn?.addEventListener('click', (e) => {
            e.stopPropagation();
            langMenu.classList.toggle('show');
        });

        document.addEventListener('click', () => {
            langMenu?.classList.remove('show');
        });
    }

    /**
     * 切换语言
     * @param {string} langCode - 语言代码
     */
    async switchLanguage(langCode) {
        if (!this.supportedLanguages[langCode]) {
            console.error('不支持的语言:', langCode);
            return;
        }

        if (this.translating) {
            console.log('翻译进行中，请稍候...');
            return;
        }

        this.translating = true;
        this.showTranslating();
        
        try {
            // 更新当前语言
            this.currentLanguage = langCode;
            localStorage.setItem('auto-translate-lang', langCode);

            // 更新UI显示
            this.updateLanguageDisplay();

            // 翻译页面内容
            await this.translatePage();

            if (this.config.debug) {
                console.log('语言切换完成:', langCode);
            }
            
        } catch (error) {
            console.error('语言切换失败:', error);
            alert('翻译失败，请稍后重试');
        } finally {
            this.translating = false;
            this.hideTranslating();
        }
    }

    /**
     * 更新语言显示
     */
    updateLanguageDisplay() {
        const currentLangText = document.getElementById('current-lang-text');
        const langMenu = document.getElementById('language-menu');
        
        if (currentLangText) {
            currentLangText.textContent = this.supportedLanguages[this.currentLanguage];
        }

        if (langMenu) {
            langMenu.querySelectorAll('.language-option').forEach(option => {
                option.classList.toggle('active', option.dataset.lang === this.currentLanguage);
            });
            langMenu.classList.remove('show');
        }
    }

    /**
     * 翻译整个页面（优化版本）
     */
    async translatePage() {
        // 如果是中文，直接恢复原文
        if (this.currentLanguage === 'zh') {
            this.restoreOriginalText();
            return;
        }

        // 收集所有需要翻译的元素
        const elementsToTranslate = this.collectTranslatableElements();
        
        if (elementsToTranslate.length === 0) {
            return;
        }

        // 批量翻译，减少DOM操作
        await this.batchTranslateElements(elementsToTranslate);
    }

    /**
     * 收集可翻译元素（优化版本）
     */
    collectTranslatableElements() {
        const selector = `
            [data-translate],
            h1:not(.no-translate):not([data-skip-translate]),
            h2:not(.no-translate):not([data-skip-translate]),
            h3:not(.no-translate):not([data-skip-translate]),
            h4:not(.no-translate):not([data-skip-translate]),
            h5:not(.no-translate):not([data-skip-translate]),
            h6:not(.no-translate):not([data-skip-translate]),
            p:not(.no-translate):not([data-skip-translate]),
            span:not(.no-translate):not([data-skip-translate]),
            button:not(.no-translate):not([data-skip-translate]),
            a:not(.no-translate):not([data-skip-translate]),
            label:not(.no-translate):not([data-skip-translate]),
            td:not(.no-translate):not([data-skip-translate]),
            th:not(.no-translate):not([data-skip-translate])
        `;
        
        const elements = document.querySelectorAll(selector);
        const validElements = [];
        
        for (const element of elements) {
            if (this.shouldSkipElement(element)) continue;
            
            const text = this.getElementText(element);
            if (!text || text.trim().length === 0 || text.trim().length > this.config.performance.maxTextLength) continue;
            
            validElements.push({ element, text });
        }
        
        return validElements;
    }

    /**
     * 批量翻译元素（性能优化）
     */
    async batchTranslateElements(elementsData) {
        const batchSize = this.config.performance.batchSize;
        const batches = [];
        
        // 将元素分批
        for (let i = 0; i < elementsData.length; i += batchSize) {
            batches.push(elementsData.slice(i, i + batchSize));
        }
        
        // 按批处理
        for (let i = 0; i < batches.length; i++) {
            const batch = batches[i];
            const promises = batch.map(({ element, text }) => 
                this.translateElementOptimized(element, text)
            );
            
            // 等待当前批次完成
            await Promise.allSettled(promises);
            
            // 添加小延迟，避免API限流
            if (i < batches.length - 1) {
                await this.sleep(this.config.batchDelay);
            }
            
            // 更新进度
            this.updateTranslationProgress(((i + 1) / batches.length) * 100);
        }
    }

    /**
     * 优化的元素翻译
     */
    async translateElementOptimized(element, originalText) {
        try {
            const cacheKey = `${originalText}-${this.currentLanguage}`;
            
            // 检查缓存
            if (this.cache.has(cacheKey)) {
                this.setElementText(element, this.cache.get(cacheKey));
                return;
            }

            // 调用翻译API with retry
            let translatedText = null;
            for (let attempt = 0; attempt < this.config.maxRetries; attempt++) {
                try {
                    translatedText = await this.translateText(originalText, this.currentLanguage);
                    break;
                } catch (error) {
                    if (attempt === this.config.maxRetries - 1) {
                        throw error;
                    }
                    await this.sleep(1000 * (attempt + 1)); // 递增延迟
                }
            }
            
            if (translatedText && translatedText !== originalText) {
                // 缓存翻译结果
                this.cache.set(cacheKey, translatedText);
                // 使用动画更新文本
                this.setElementTextWithAnimation(element, translatedText);
            }
        } catch (error) {
            if (this.config.debug) {
                console.warn('翻译元素失败:', originalText, error);
            }
        }
    }

    /**
     * 带动画的文本设置
     */
    setElementTextWithAnimation(element, newText) {
        if (!this.config.performance.enableAnimations) {
            element.textContent = newText;
            return;
        }

        const duration = this.config.performance.animationDuration;
        element.style.transition = `opacity ${duration}ms ease`;
        element.style.opacity = '0.7';
        
        setTimeout(() => {
            element.textContent = newText;
            element.style.opacity = '1';
        }, duration / 2);
    }

    /**
     * 设置元素文本
     */
    setElementText(element, text) {
        element.textContent = text;
    }

    /**
     * 恢复原始文本
     */
    restoreOriginalText() {
        const elements = document.querySelectorAll('[data-original-text]');
        elements.forEach(element => {
            this.setElementTextWithAnimation(element, element.dataset.originalText);
        });
    }

    /**
     * 睡眠函数
     */
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * 检查是否应跳过翻译的元素
     */
    shouldSkipElement(element) {
        // 跳过包含输入元素的父元素
        if (element.querySelector('input, select, textarea')) {
            return true;
        }
        
        // 跳过脚本和样式元素
        if (['SCRIPT', 'STYLE', 'NOSCRIPT'].includes(element.tagName)) {
            return true;
        }

        // 跳过包含no-translate类的元素
        if (element.classList.contains('no-translate')) {
            return true;
        }

        // 跳过数字、符号等
        const text = element.textContent.trim();
        if (/^[\d\s\-+.,%$¥€£]+$/.test(text)) {
            return true;
        }

        return false;
    }

    /**
     * 获取元素的文本内容
     */
    getElementText(element) {
        // 保存原始文本
        if (!element.dataset.originalText) {
            element.dataset.originalText = element.textContent.trim();
        }
        return element.dataset.originalText;
    }

    /**
     * 翻译单个元素
     */
    async translateElement(element, originalText) {
        try {
            const cacheKey = `${originalText}-${this.currentLanguage}`;
            
            // 检查缓存
            if (this.cache.has(cacheKey)) {
                element.textContent = this.cache.get(cacheKey);
                return;
            }

            // 调用翻译API
            const translatedText = await this.translateText(originalText, this.currentLanguage);
            
            if (translatedText && translatedText !== originalText) {
                // 缓存翻译结果
                this.cache.set(cacheKey, translatedText);
                element.textContent = translatedText;
            }
        } catch (error) {
            console.warn('翻译元素失败:', originalText, error);
        }
    }

    /**
     * 翻译文本
     * @param {string} text - 要翻译的文本
     * @param {string} targetLang - 目标语言
     */
    async translateText(text, targetLang) {
        switch (this.config.provider) {
            case 'google':
                return await this.translateWithGoogle(text, targetLang);
            case 'baidu':
                return await this.translateWithBaidu(text, targetLang);
            default:
                return await this.translateWithMyMemory(text, targetLang);
        }
    }

    /**
     * 使用MyMemory免费翻译API（优化版）
     */
    async translateWithMyMemory(text, targetLang) {
        // 添加请求缓存和去重
        const requestKey = `${text}-${targetLang}-mymemory`;
        if (this.pendingRequests && this.pendingRequests.has(requestKey)) {
            return await this.pendingRequests.get(requestKey);
        }

        if (!this.pendingRequests) {
            this.pendingRequests = new Map();
        }

        const promise = this.doTranslateWithMyMemory(text, targetLang);
        this.pendingRequests.set(requestKey, promise);
        
        try {
            const result = await promise;
            return result;
        } finally {
            this.pendingRequests.delete(requestKey);
        }
    }

    async doTranslateWithMyMemory(text, targetLang) {
        try {
            const sourceLang = this.config.defaultSourceLang;
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 10000); // 10秒超时
            
            const response = await fetch(
                `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceLang}|${targetLang}`,
                { 
                    signal: controller.signal,
                    headers: {
                        'Accept': 'application/json',
                        'User-Agent': 'Mozilla/5.0 (compatible; AutoTranslator/1.0)'
                    }
                }
            );
            
            clearTimeout(timeoutId);
            
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            
            const data = await response.json();
            
            if (data.responseStatus === 200 && data.responseData.translatedText) {
                const translated = data.responseData.translatedText;
                // 基本质量检查
                if (translated.length > 0 && translated !== 'MYMEMORY WARNING: YOU USED ALL AVAILABLE FREE TRANSLATIONS FOR TODAY.') {
                    return translated;
                }
            }
        } catch (error) {
            if (error.name === 'AbortError') {
                console.warn('MyMemory翻译请求超时');
            } else {
                console.error('MyMemory翻译失败:', error);
            }
        }
        return text;
    }

    /**
     * 使用Google翻译API (需要API密钥)
     */
    async translateWithGoogle(text, targetLang) {
        if (!this.config.googleApiKey) {
            console.warn('Google翻译需要API密钥，回退到MyMemory');
            return await this.translateWithMyMemory(text, targetLang);
        }

        try {
            const response = await fetch(`https://translation.googleapis.com/language/translate/v2?key=${this.config.googleApiKey}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    q: text,
                    source: this.config.defaultSourceLang,
                    target: targetLang,
                    format: 'text'
                })
            });

            const data = await response.json();
            if (data.data && data.data.translations && data.data.translations.length > 0) {
                return data.data.translations[0].translatedText;
            }
        } catch (error) {
            console.error('Google翻译失败:', error);
            // 回退到免费服务
            return await this.translateWithMyMemory(text, targetLang);
        }
        return text;
    }

    /**
     * 使用百度翻译API (需要API密钥)
     */
    async translateWithBaidu(text, targetLang) {
        // 百度翻译API实现
        // 需要appid和密钥，这里暂时使用MyMemory作为fallback
        return await this.translateWithMyMemory(text, targetLang);
    }

    /**
     * 显示翻译中状态（改进版）
     */
    showTranslating() {
        let overlay = document.getElementById('translating-overlay');
        if (!overlay) {
            overlay = document.createElement('div');
            overlay.id = 'translating-overlay';
            overlay.className = 'translating-overlay';
            overlay.innerHTML = `
                <div class="translating-content">
                    <div class="translation-progress">
                        <div class="loading-spinner"></div>
                        <div class="progress-ring">
                            <svg width="60" height="60">
                                <circle cx="30" cy="30" r="25" fill="none" stroke="#e0e0e0" stroke-width="4"/>
                                <circle id="progress-circle" cx="30" cy="30" r="25" fill="none" stroke="#1976d2" 
                                        stroke-width="4" stroke-linecap="round" 
                                        stroke-dasharray="157" stroke-dashoffset="157"/>
                            </svg>
                        </div>
                    </div>
                    <div class="translating-text">正在翻译中...</div>
                    <div class="translation-progress-text">准备中...</div>
                </div>
            `;
            document.body.appendChild(overlay);
        }
        
        // 添加淡入动画
        overlay.style.display = 'flex';
        overlay.style.opacity = '0';
        overlay.style.transform = 'scale(0.9)';
        
        setTimeout(() => {
            overlay.style.transition = 'all 0.3s ease';
            overlay.style.opacity = '1';
            overlay.style.transform = 'scale(1)';
        }, 10);
    }

    /**
     * 更新翻译进度
     */
    updateTranslationProgress(percentage) {
        const progressCircle = document.getElementById('progress-circle');
        const progressText = document.querySelector('.translation-progress-text');
        
        if (progressCircle) {
            const circumference = 157; // 2 * π * 25
            const offset = circumference - (percentage / 100) * circumference;
            progressCircle.style.strokeDashoffset = offset;
        }
        
        if (progressText) {
            if (percentage < 30) {
                progressText.textContent = '分析页面内容...';
            } else if (percentage < 70) {
                progressText.textContent = '正在翻译...';
            } else if (percentage < 95) {
                progressText.textContent = '应用翻译结果...';
            } else {
                progressText.textContent = '即将完成...';
            }
        }
    }

    /**
     * 隐藏翻译中状态（改进版）
     */
    hideTranslating() {
        const overlay = document.getElementById('translating-overlay');
        if (overlay) {
            overlay.style.transition = 'all 0.3s ease';
            overlay.style.opacity = '0';
            overlay.style.transform = 'scale(0.9)';
            
            setTimeout(() => {
                overlay.style.display = 'none';
            }, 300);
        }
    }

    /**
     * 重置为原始语言
     */
    resetToOriginal() {
        const elements = document.querySelectorAll('[data-original-text]');
        elements.forEach(element => {
            element.textContent = element.dataset.originalText;
        });
        
        this.currentLanguage = 'zh';
        this.updateLanguageDisplay();
        localStorage.setItem('auto-translate-lang', 'zh');
    }
}

// 全局翻译器实例
let translator;

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    translator = new AutoTranslator();
});
