// 演示文稿控制器
class PresentationController {
    constructor() {
        this.currentSlide = 0;
        this.slides = document.querySelectorAll('.slide');
        this.totalSlides = this.slides.length;
        this.progressFill = document.getElementById('progressFill');
        this.pageIndicator = document.getElementById('pageIndicator');
        this.prevBtn = document.getElementById('prevBtn');
        this.nextBtn = document.getElementById('nextBtn');
        
        this.init();
    }
    
    init() {
        // 初始化第一张幻灯片
        this.showSlide(0);
        
        // 绑定导航按钮事件
        this.prevBtn.addEventListener('click', () => this.previousSlide());
        this.nextBtn.addEventListener('click', () => this.nextSlide());
        
        // 键盘导航
        document.addEventListener('keydown', (e) => {
            switch(e.key) {
                case 'ArrowLeft':
                case 'ArrowUp':
                case 'PageUp':
                    this.previousSlide();
                    break;
                case 'ArrowRight':
                case 'ArrowDown':
                case 'PageDown':
                case ' ':
                    this.nextSlide();
                    break;
                case 'Home':
                    this.goToSlide(0);
                    break;
                case 'End':
                    this.goToSlide(this.totalSlides - 1);
                    break;
                case 'Escape':
                    this.toggleFullscreen();
                    break;
            }
        });
        
        // 触摸滑动支持
        this.addTouchSupport();
        
        // 全屏检测
        document.addEventListener('fullscreenchange', () => this.handleFullscreenChange());
        
        // 窗口大小变化时重新调整
        window.addEventListener('resize', () => this.handleResize());
        
        // 添加金属光泽动画效果
        this.addMetallicEffects();
    }
    
    showSlide(index) {
        if (index < 0 || index >= this.totalSlides) return;
        
        // 隐藏当前幻灯片
        this.slides[this.currentSlide].classList.remove('active');
        
        // 显示新幻灯片
        this.currentSlide = index;
        this.slides[this.currentSlide].classList.add('active');
        
        // 更新进度条和页码
        this.updateProgress();
        
        // 添加动画效果
        this.animateSlide();
    }
    
    nextSlide() {
        if (this.currentSlide < this.totalSlides - 1) {
            this.showSlide(this.currentSlide + 1);
        } else {
            // 到达最后一页，可以选择循环或停止
            this.showSlide(0); // 循环到第一页
        }
    }
    
    previousSlide() {
        if (this.currentSlide > 0) {
            this.showSlide(this.currentSlide - 1);
        } else {
            // 到达第一页，可以选择循环或停止
            this.showSlide(this.totalSlides - 1); // 循环到最后一页
        }
    }
    
    goToSlide(index) {
        this.showSlide(index);
    }
    
    updateProgress() {
        const progress = ((this.currentSlide + 1) / this.totalSlides) * 100;
        this.progressFill.style.width = `${progress}%`;
        this.pageIndicator.textContent = `${this.currentSlide + 1} / ${this.totalSlides}`;
    }
    
    animateSlide() {
        const currentSlideElement = this.slides[this.currentSlide];
        const elements = currentSlideElement.querySelectorAll('.metal-frame > *');
        
        // 为当前幻灯片的元素添加渐入动画
        elements.forEach((element, index) => {
            element.style.opacity = '0';
            element.style.transform = 'translateY(20px)';
            
            setTimeout(() => {
                element.style.transition = 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)';
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
            }, index * 100);
        });
    }
    
    addTouchSupport() {
        let touchStartX = 0;
        let touchEndX = 0;
        
        document.addEventListener('touchstart', (e) => {
            touchStartX = e.changedTouches[0].screenX;
        });
        
        document.addEventListener('touchend', (e) => {
            touchEndX = e.changedTouches[0].screenX;
            this.handleSwipe();
        });
        
        this.handleSwipe = () => {
            const swipeThreshold = 50;
            const diff = touchStartX - touchEndX;
            
            if (Math.abs(diff) > swipeThreshold) {
                if (diff > 0) {
                    this.nextSlide(); // 向左滑动，下一页
                } else {
                    this.previousSlide(); // 向右滑动，上一页
                }
            }
        };
    }
    
    toggleFullscreen() {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
        } else {
            document.exitFullscreen();
        }
    }
    
    handleFullscreenChange() {
        // 全屏状态改变时的处理
        if (document.fullscreenElement) {
            document.body.classList.add('fullscreen');
        } else {
            document.body.classList.remove('fullscreen');
        }
    }
    
    handleResize() {
        // 窗口大小改变时的处理
        // 可以在这里添加响应式布局调整逻辑
    }
    
    addMetallicEffects() {
        // 为金属元素添加额外的视觉效果
        const metalElements = document.querySelectorAll('.metal-frame, .metal-card, .metal-chart');
        
        metalElements.forEach(element => {
            element.addEventListener('mouseenter', () => {
                element.style.transition = 'all 0.3s ease';
                element.style.transform = 'scale(1.02)';
            });
            
            element.addEventListener('mouseleave', () => {
                element.style.transform = 'scale(1)';
            });
        });
        
        // 添加金属光泽扫过效果
        this.addShineEffect();
    }
    
    addShineEffect() {
        const metalFrames = document.querySelectorAll('.metal-frame');
        
        metalFrames.forEach(frame => {
            frame.addEventListener('mousemove', (e) => {
                const rect = frame.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;
                
                const centerX = rect.width / 2;
                const centerY = rect.height / 2;
                
                const deltaX = (x - centerX) / centerX;
                const deltaY = (y - centerY) / centerY;
                
                // 创建动态光泽效果
                frame.style.background = `
                    radial-gradient(
                        circle at ${50 + deltaX * 20}% ${50 + deltaY * 20}%,
                        rgba(255, 255, 255, 0.1) 0%,
                        transparent 50%
                    ),
                    linear-gradient(145deg, #3a3a3a, #2a2a2a)
                `;
            });
            
            frame.addEventListener('mouseleave', () => {
                frame.style.background = 'linear-gradient(145deg, #3a3a3a, #2a2a2a)';
            });
        });
    }
    
    // 添加打印支持
    printPresentation() {
        window.print();
    }
    
    // 添加导出功能
    exportToPDF() {
        // 这里可以集成第三方库来实现PDF导出
        console.log('PDF导出功能需要额外库支持');
    }
}

// 演示文稿初始化
document.addEventListener('DOMContentLoaded', () => {
    const presentation = new PresentationController();
    
    // 添加加载动画
    setTimeout(() => {
        document.body.style.opacity = '1';
    }, 100);
    
    // 预加载所有图片（如果有）
    const images = document.querySelectorAll('img');
    images.forEach(img => {
        const src = img.getAttribute('src');
        if (src) {
            const tempImg = new Image();
            tempImg.src = src;
        }
    });
    
    // 添加性能监控
    if ('performance' in window) {
        window.addEventListener('load', () => {
            const perfData = performance.getEntriesByType('navigation')[0];
            console.log('页面加载时间:', perfData.loadEventEnd - perfData.fetchStart, 'ms');
        });
    }
});

// 添加打印样式
const printStyles = `
@media print {
    body {
        background: white !important;
        color: black !important;
    }
    
    .navigation, .progress-bar {
        display: none !important;
    }
    
    .slide {
        position: relative !important;
        opacity: 1 !important;
        transform: none !important;
        page-break-after: always;
        width: 100% !important;
        height: auto !important;
        min-height: 100vh;
    }
    
    .metal-frame {
        background: white !important;
        border: 1px solid #ccc !important;
        box-shadow: none !important;
    }
    
    .title-main, .slide-title, .subtitle {
        color: black !important;
        -webkit-text-fill-color: black !important;
    }
    
    .content-text, .section-title, .toc-item, .card-content {
        color: black !important;
    }
}
`;

// 添加打印样式到页面
const styleSheet = document.createElement('style');
styleSheet.textContent = printStyles;
document.head.appendChild(styleSheet);