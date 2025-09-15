/**
 * 背景图轮播功能
 */

class HeroCarousel {
    constructor() {
        this.slides = [];
        this.currentSlideIndex = 0;
        this.intervalId = null;
        this.slideInterval = 5000; // 5秒切换一次
        this.isTransitioning = false;
        this.init();
    }

    async init() {
        await this.loadBackgroundImages();
        this.createSlides();
        this.createIndicators();
        this.bindEvents();
        this.startAutoplay();
        this.updateContent();
    }

    async loadBackgroundImages() {
        try {
            // 获取当前语言
            const currentLang = window.i18n ? window.i18n.getCurrentLanguage() : 'zh';
            
            let response;
            if (currentLang === 'en') {
                // 使用英文API
                response = await fetch('/api/language/en/background-images', {
                    headers: {
                        'Content-Type': 'application/json'
                    }
                });
            } else {
                // 使用中文API
                response = await fetch('/api/background-images/', {
                    headers: {
                        'Accept-Language': 'zh-CN'
                    }
                });
            }

            if (response.ok) {
                const data = await response.json();
                this.slides = data.items.filter(item => item.is_active);
                console.log('背景图加载成功:', this.slides);
            } else {
                console.warn('背景图加载失败，使用默认背景');
                this.slides = [];
            }
        } catch (error) {
            console.error('加载背景图时出错:', error);
            this.slides = [];
        }
    }

    createSlides() {
        const carousel = document.getElementById('hero-carousel');
        if (!carousel) {
            console.log('轮播容器未找到');
            return;
        }

        // 清空现有内容
        carousel.innerHTML = '';

        // 如果没有背景图，创建默认背景
        if (this.slides.length === 0) {
            console.log('没有背景图，创建默认背景');
            const currentLang = window.i18n ? window.i18n.getCurrentLanguage() : 'zh';
            
            if (currentLang === 'en') {
                this.slides = [
                    {
                        id: 'default-1',
                        title: 'Welcome to Our Product Showcase',
                        subtitle: 'Discover Quality Products, Experience Excellence',
                        button_text: 'Browse Products',
                        button_link: '#products',
                        image_url: null,
                        is_active: true
                    },
                    {
                        id: 'default-2',
                        title: 'Premium Selected Products',
                        subtitle: 'Providing You with the Best Shopping Experience',
                        button_text: 'Shop Now',
                        button_link: '#products',
                        image_url: null,
                        is_active: true
                    },
                    {
                        id: 'default-3',
                        title: 'Quality Guaranteed',
                        subtitle: 'Strict Quality Control, Just for Your Satisfaction',
                        button_text: 'Learn More',
                        button_link: '#products',
                        image_url: null,
                        is_active: true
                    }
                ];
            } else {
                this.slides = [
                    {
                        id: 'default-1',
                        title: '欢迎来到我们的产品展示',
                        subtitle: '发现优质产品，体验卓越品质',
                        button_text: '浏览产品',
                        button_link: '#products',
                        image_url: null,
                        is_active: true
                    },
                    {
                        id: 'default-2',
                        title: '精选优质商品',
                        subtitle: '为您提供最好的购物体验',
                        button_text: '立即购买',
                        button_link: '#products',
                        image_url: null,
                        is_active: true
                    },
                    {
                        id: 'default-3',
                        title: '品质保证',
                        subtitle: '严格品控，只为您的满意',
                        button_text: '了解更多',
                        button_link: '#products',
                        image_url: null,
                        is_active: true
                    }
                ];
            }
        }

        console.log('创建轮播图片，共', this.slides.length, '张');

        this.slides.forEach((slide, index) => {
            const slideElement = document.createElement('div');
            slideElement.className = `hero-slide ${index === 0 ? 'active' : ''}`;
            slideElement.setAttribute('data-slide-index', index);
            
            if (slide.image_url && slide.image_url.trim()) {
                console.log('设置背景图片:', slide.image_url);
                slideElement.style.backgroundImage = `url(${slide.image_url})`;
                slideElement.style.backgroundSize = 'cover';
                slideElement.style.backgroundPosition = 'center';
                slideElement.style.backgroundRepeat = 'no-repeat';
            } else {
                // 使用CSS渐变作为默认背景
                console.log('使用默认渐变背景');
                slideElement.style.background = 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 50%, #dee2e6 100%)';
            }
            
            // 强制设置样式
            slideElement.style.position = 'absolute';
            slideElement.style.top = '0';
            slideElement.style.left = '0';
            slideElement.style.width = '100%';
            slideElement.style.height = '100%';
            slideElement.style.transition = 'opacity 1s ease-in-out';
            
            if (index === 0) {
                slideElement.style.opacity = '1';
            } else {
                slideElement.style.opacity = '0';
            }
            
            carousel.appendChild(slideElement);
            console.log('添加轮播图片', index + 1);
        });
        
        console.log('轮播图片创建完成');
    }

    createIndicators() {
        const indicatorsContainer = document.getElementById('hero-indicators');
        if (!indicatorsContainer || this.slides.length <= 1) {
            indicatorsContainer && (indicatorsContainer.style.display = 'none');
            return;
        }

        indicatorsContainer.style.display = 'flex';
        indicatorsContainer.innerHTML = '';

        this.slides.forEach((_, index) => {
            const indicator = document.createElement('div');
            indicator.className = `hero-indicator ${index === 0 ? 'active' : ''}`;
            indicator.setAttribute('data-slide-index', index);
            indicator.addEventListener('click', () => this.goToSlide(index));
            indicatorsContainer.appendChild(indicator);
        });
    }

    bindEvents() {
        const prevBtn = document.getElementById('hero-prev');
        const nextBtn = document.getElementById('hero-next');

        console.log('绑定轮播事件，幻灯片数量:', this.slides.length);
        console.log('上一张按钮:', prevBtn ? '找到' : '未找到');
        console.log('下一张按钮:', nextBtn ? '找到' : '未找到');

        if (prevBtn && this.slides.length > 1) {
            prevBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('点击上一张按钮');
                this.prevSlide();
            });
            prevBtn.style.display = 'flex';
            console.log('上一张按钮已绑定事件并显示');
        } else if (prevBtn) {
            prevBtn.style.display = 'none';
            console.log('上一张按钮已隐藏');
        }

        if (nextBtn && this.slides.length > 1) {
            nextBtn.addEventListener('click', (e) => {
                e.preventDefault();
                console.log('点击下一张按钮');
                this.nextSlide();
            });
            nextBtn.style.display = 'flex';
            console.log('下一张按钮已绑定事件并显示');
        } else if (nextBtn) {
            nextBtn.style.display = 'none';
            console.log('下一张按钮已隐藏');
        }

        // 鼠标悬停时暂停自动播放
        const heroSection = document.querySelector('.hero-section');
        if (heroSection) {
            heroSection.addEventListener('mouseenter', () => {
                console.log('鼠标进入轮播区域，暂停自动播放');
                this.stopAutoplay();
            });
            heroSection.addEventListener('mouseleave', () => {
                console.log('鼠标离开轮播区域，恢复自动播放');
                this.startAutoplay();
            });
        }

        // 键盘导航
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft') {
                console.log('键盘左箭头');
                this.prevSlide();
            } else if (e.key === 'ArrowRight') {
                console.log('键盘右箭头');
                this.nextSlide();
            }
        });
    }

    goToSlide(index) {
        if (this.isTransitioning || index === this.currentSlideIndex || index >= this.slides.length) {
            return;
        }

        this.isTransitioning = true;
        console.log(`切换到第 ${index + 1} 张幻灯片`);
        
        // 更新轮播图
        const allSlides = document.querySelectorAll('.hero-slide');
        const currentSlide = document.querySelector('.hero-slide.active');
        const nextSlide = document.querySelector(`.hero-slide[data-slide-index="${index}"]`);
        
        // 隐藏所有幻灯片
        allSlides.forEach(slide => {
            slide.classList.remove('active');
            slide.style.opacity = '0';
        });
        
        // 显示目标幻灯片
        if (nextSlide) {
            nextSlide.classList.add('active');
            nextSlide.style.opacity = '1';
        }

        // 更新指示器
        const allIndicators = document.querySelectorAll('.hero-indicator');
        const currentIndicator = document.querySelector('.hero-indicator.active');
        const nextIndicator = document.querySelector(`.hero-indicator[data-slide-index="${index}"]`);
        
        // 移除所有指示器的活动状态
        allIndicators.forEach(indicator => {
            indicator.classList.remove('active');
        });
        
        // 激活目标指示器
        if (nextIndicator) {
            nextIndicator.classList.add('active');
        }

        this.currentSlideIndex = index;
        this.updateContent();

        // 防止快速点击
        setTimeout(() => {
            this.isTransitioning = false;
        }, 1000);
    }

    nextSlide() {
        if (this.slides.length <= 1) {
            console.log('只有一张或没有幻灯片，无法切换');
            return;
        }
        const nextIndex = (this.currentSlideIndex + 1) % this.slides.length;
        console.log(`下一张: 当前 ${this.currentSlideIndex} -> 下一张 ${nextIndex}`);
        this.goToSlide(nextIndex);
    }

    prevSlide() {
        if (this.slides.length <= 1) {
            console.log('只有一张或没有幻灯片，无法切换');
            return;
        }
        const prevIndex = (this.currentSlideIndex - 1 + this.slides.length) % this.slides.length;
        console.log(`上一张: 当前 ${this.currentSlideIndex} -> 上一张 ${prevIndex}`);
        this.goToSlide(prevIndex);
    }

    updateContent() {
        if (this.slides.length === 0) {
            // 使用默认内容
            return;
        }

        const currentSlide = this.slides[this.currentSlideIndex];
        const titleElement = document.getElementById('hero-title');
        const subtitleElement = document.getElementById('hero-subtitle');
        const buttonElement = document.getElementById('hero-button');

        if (titleElement && currentSlide.title) {
            titleElement.textContent = currentSlide.title;
        }

        if (subtitleElement && currentSlide.subtitle) {
            subtitleElement.textContent = currentSlide.subtitle;
        }

        if (buttonElement && currentSlide.button_text) {
            buttonElement.textContent = currentSlide.button_text;
            if (currentSlide.button_link) {
                buttonElement.href = currentSlide.button_link;
            }
        }
    }

    startAutoplay() {
        if (this.slides.length <= 1) {
            console.log('只有一张或没有幻灯片，不启动自动播放');
            return;
        }
        
        console.log('启动自动轮播，间隔:', this.slideInterval + 'ms');
        this.stopAutoplay();
        this.intervalId = setInterval(() => {
            console.log('自动切换到下一张幻灯片');
            this.nextSlide();
        }, this.slideInterval);
    }

    stopAutoplay() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }

    async refresh() {
        this.stopAutoplay();
        await this.loadBackgroundImages();
        this.createSlides();
        this.createIndicators();
        this.updateContent();
        this.startAutoplay();
    }

    destroy() {
        this.stopAutoplay();
        const heroSection = document.querySelector('.hero-section');
        if (heroSection) {
            heroSection.removeEventListener('mouseenter', () => this.stopAutoplay());
            heroSection.removeEventListener('mouseleave', () => this.startAutoplay());
        }
    }
}

// 全局变量
let heroCarousel;

// 初始化轮播
function initHeroCarousel() {
    heroCarousel = new HeroCarousel();
}

// 刷新轮播（用于管理员修改后）
function refreshHeroCarousel() {
    if (heroCarousel) {
        heroCarousel.refresh();
    }
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', initHeroCarousel);

// 导出供其他脚本使用
if (typeof window !== 'undefined') {
    window.HeroCarousel = HeroCarousel;
    window.initHeroCarousel = initHeroCarousel;
    window.refreshHeroCarousel = refreshHeroCarousel;
}
