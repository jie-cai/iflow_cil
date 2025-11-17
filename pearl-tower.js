document.addEventListener('DOMContentLoaded', function() {
    const animateBtn = document.querySelector('.btn-animate');
    const container = document.querySelector('.container');
    const tower = document.querySelector('.tower');
    const lights = document.querySelectorAll('.light');
    
    let isLightShowActive = false;
    
    // 灯光秀功能
    animateBtn.addEventListener('click', function() {
        if (!isLightShowActive) {
            startLightShow();
            animateBtn.textContent = '停止灯光秀';
        } else {
            stopLightShow();
            animateBtn.textContent = '观看灯光秀';
        }
        isLightShowActive = !isLightShowActive;
    });
    
    function startLightShow() {
        container.classList.add('light-show');
        
        // 创建额外的灯光效果
        createExtraLights();
        
        // 添加旋转效果
        tower.style.animation = 'rotate 10s linear infinite';
        
        // 播放音效（如果需要）
        playSoundEffect();
    }
    
    function stopLightShow() {
        container.classList.remove('light-show');
        tower.style.animation = '';
        
        // 移除额外的灯光
        removeExtraLights();
        
        // 停止音效
        stopSoundEffect();
    }
    
    function createExtraLights() {
        const ground = document.querySelector('.ground');
        
        for (let i = 0; i < 20; i++) {
            const light = document.createElement('div');
            light.className = 'extra-light';
            light.style.cssText = `
                position: absolute;
                width: 3px;
                height: 3px;
                background: #FFFF00;
                border-radius: 50%;
                bottom: ${Math.random() * 100}%;
                left: ${Math.random() * 100}%;
                animation: twinkle ${1 + Math.random() * 2}s infinite ease-in-out ${Math.random() * 2}s;
                pointer-events: none;
            `;
            ground.appendChild(light);
        }
    }
    
    function removeExtraLights() {
        const extraLights = document.querySelectorAll('.extra-light');
        extraLights.forEach(light => light.remove());
    }
    
    function playSoundEffect() {
        // 这里可以添加音效
        // const audio = new Audio('sound.mp3');
        // audio.play();
    }
    
    function stopSoundEffect() {
        // 停止音效
    }
    
    // 添加塔身微动效果
    function addTowerSubtleAnimation() {
        setInterval(() => {
            if (!isLightShowActive) {
                const randomSphere = Math.floor(Math.random() * 3) + 1;
                const sphere = document.querySelector(`.sphere${randomSphere}`);
                sphere.style.transform = 'translateX(-50%) scale(1.1)';
                setTimeout(() => {
                    sphere.style.transform = 'translateX(-50%) scale(1)';
                }, 500);
            }
        }, 3000);
    }
    
    // 添加云朵动态生成
    function generateClouds() {
        const sky = document.querySelector('.sky');
        
        setInterval(() => {
            if (document.querySelectorAll('.cloud').length < 6) {
                const cloud = document.createElement('div');
                cloud.className = 'cloud dynamic-cloud';
                cloud.style.cssText = `
                    width: ${60 + Math.random() * 60}px;
                    height: ${25 + Math.random() * 25}px;
                    top: ${Math.random() * 40}%;
                    left: -150px;
                    animation: floatCloud ${20 + Math.random() * 10}s linear;
                `;
                sky.appendChild(cloud);
                
                // 云朵飘过后移除
                setTimeout(() => {
                    cloud.remove();
                }, 30000);
            }
        }, 8000);
    }
    
    // 添加鼠标悬停效果
    function addHoverEffects() {
        const spheres = document.querySelectorAll('.tower-sphere');
        
        spheres.forEach(sphere => {
            sphere.addEventListener('mouseenter', function() {
                this.style.transform = 'translateX(-50%) scale(1.2)';
                this.style.boxShadow = '0 0 40px rgba(255, 107, 107, 0.9)';
            });
            
            sphere.addEventListener('mouseleave', function() {
                this.style.transform = 'translateX(-50%) scale(1)';
                this.style.boxShadow = '';
            });
        });
    }
    
    // 添加键盘控制
    function addKeyboardControls() {
        document.addEventListener('keydown', function(e) {
            if (e.key === ' ') {
                e.preventDefault();
                animateBtn.click();
            }
        });
    }
    
    // 添加视差滚动效果
    function addParallaxEffect() {
        window.addEventListener('scroll', function() {
            const scrolled = window.pageYOffset;
            const tower = document.querySelector('.tower-container');
            const clouds = document.querySelectorAll('.cloud');
            
            if (tower) {
                tower.style.transform = `translateX(-50%) translateY(${scrolled * 0.5}px)`;
            }
            
            clouds.forEach((cloud, index) => {
                cloud.style.transform = `translateX(${scrolled * (0.2 * (index + 1))}px)`;
            });
        });
    }
    
    // 添加额外的CSS动画
    const additionalCSS = `
        @keyframes rotate {
            from {
                transform: translateX(-50%) rotateY(0deg);
            }
            to {
                transform: translateX(-50%) rotateY(360deg);
            }
        }
        
        @keyframes floatCloud {
            from {
                left: -150px;
            }
            to {
                left: 100%;
            }
        }
        
        .dynamic-cloud {
            opacity: 0.7;
        }
    `;
    
    const styleSheet = document.createElement('style');
    styleSheet.textContent = additionalCSS;
    document.head.appendChild(styleSheet);
    
    // 初始化所有交互效果
    addTowerSubtleAnimation();
    generateClouds();
    addHoverEffects();
    addKeyboardControls();
    addParallaxEffect();
    
    // 添加加载完成动画
    setTimeout(() => {
        tower.style.opacity = '0';
        tower.style.transform = 'translateX(-50%) translateY(50px)';
        
        setTimeout(() => {
            tower.style.transition = 'all 1.5s ease-out';
            tower.style.opacity = '1';
            tower.style.transform = 'translateX(-50%) translateY(0)';
        }, 100);
    }, 500);
});