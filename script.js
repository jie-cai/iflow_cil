// 东方明珠塔宣传动画交互脚本
document.addEventListener('DOMContentLoaded', function() {
    // 初始化动画控制
    initAnimations();
    initInteractions();
    initScrollEffects();
});

function initAnimations() {
    // 添加动态灯光效果
    const lights = document.querySelectorAll('.light');
    lights.forEach((light, index) => {
        setInterval(() => {
            light.style.animationDelay = `${Math.random() * 3}s`;
        }, 3000 + index * 500);
    });
    
    // 添加星空背景
    createStarField();
    
    // 添加云朵动画
    createClouds();
}

function initInteractions() {
    // 添加塔体点击交互
    const tower = document.querySelector('.tower');
    if (tower) {
        tower.addEventListener('click', function() {
            this.style.animation = 'none';
            setTimeout(() => {
                this.style.animation = 'float 6s ease-in-out infinite, pulse 1s ease-out';
            }, 10);
            
            showTowerInfo();
        });
    }
    
    // 添加信息卡片悬停效果
    const infoCards = document.querySelectorAll('.info-card');
    infoCards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-10px) scale(1.05)';
            this.style.boxShadow = '0 15px 40px rgba(0, 0, 0, 0.3)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0) scale(1)';
            this.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.2)';
        });
    });
    
    // 添加夜景切换功能
    createDayNightToggle();
}

function initScrollEffects() {
    // 添加滚动视差效果
    window.addEventListener('scroll', function() {
        const scrolled = window.pageYOffset;
        const skyline = document.querySelector('.skyline');
        const tower = document.querySelector('.tower-container');
        
        if (skyline && tower) {
            skyline.style.transform = `translateY(${scrolled * 0.5}px)`;
            tower.style.transform = `translateX(-50%) translateY(${-scrolled * 0.3}px)`;
        }
    });
    
    // 添加元素进入视口动画
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
            }
        });
    }, { threshold: 0.1 });
    
    document.querySelectorAll('.info-card').forEach(card => {
        observer.observe(card);
    });
}

function createStarField() {
    const body = document.body;
    const starCount = 100;
    
    for (let i = 0; i < starCount; i++) {
        const star = document.createElement('div');
        star.className = 'star';
        star.style.position = 'fixed';
        star.style.width = Math.random() * 3 + 'px';
        star.style.height = star.style.width;
        star.style.backgroundColor = '#fff';
        star.style.borderRadius = '50%';
        star.style.top = Math.random() * 100 + '%';
        star.style.left = Math.random() * 100 + '%';
        star.style.opacity = Math.random() * 0.8 + 0.2;
        star.style.animation = `twinkle ${Math.random() * 3 + 2}s ease-in-out infinite`;
        star.style.animationDelay = Math.random() * 3 + 's';
        star.style.pointerEvents = 'none';
        star.style.zIndex = '1';
        
        body.appendChild(star);
    }
}

function createClouds() {
    const skyline = document.querySelector('.skyline');
    if (!skyline) return;
    
    for (let i = 0; i < 3; i++) {
        const cloud = document.createElement('div');
        cloud.className = 'cloud';
        cloud.style.position = 'absolute';
        cloud.style.width = Math.random() * 100 + 100 + 'px';
        cloud.style.height = Math.random() * 40 + 40 + 'px';
        cloud.style.backgroundColor = 'rgba(255, 255, 255, 0.7)';
        cloud.style.borderRadius = '50%';
        cloud.style.top = Math.random() * 200 + 'px';
        cloud.style.left = Math.random() * 100 + '%';
        cloud.style.animation = `cloudFloat ${Math.random() * 20 + 20}s linear infinite`;
        cloud.style.zIndex = '2';
        
        skyline.appendChild(cloud);
    }
    
    // 添加云朵动画样式
    const style = document.createElement('style');
    style.textContent = `
        @keyframes cloudFloat {
            from {
                transform: translateX(-200px);
            }
            to {
                transform: translateX(calc(100vw + 200px));
            }
        }
    `;
    document.head.appendChild(style);
}

function createDayNightToggle() {
    const header = document.querySelector('.header');
    if (!header) return;
    
    const toggle = document.createElement('button');
    toggle.textContent = '🌙 夜景模式';
    toggle.style.position = 'absolute';
    toggle.style.top = '20px';
    toggle.style.right = '20px';
    toggle.style.padding = '10px 15px';
    toggle.style.backgroundColor = 'rgba(255, 255, 255, 0.2)';
    toggle.style.border = '1px solid rgba(255, 255, 255, 0.3)';
    toggle.style.borderRadius = '20px';
    toggle.style.color = '#fff';
    toggle.style.cursor = 'pointer';
    toggle.style.fontSize = '14px';
    toggle.style.transition = 'all 0.3s ease';
    toggle.style.backdropFilter = 'blur(5px)';
    
    toggle.addEventListener('click', function() {
        document.body.classList.toggle('night-mode');
        if (document.body.classList.contains('night-mode')) {
            this.textContent = '☀️ 日景模式';
            document.body.style.background = 'linear-gradient(to bottom, #0c1445 0%, #183059 70%, #2c3e50 100%)';
        } else {
            this.textContent = '🌙 夜景模式';
            document.body.style.background = 'linear-gradient(to bottom, #87CEEB 0%, #FFA500 70%, #FF6347 100%)';
        }
    });
    
    header.appendChild(toggle);
}

function showTowerInfo() {
    // 创建信息弹窗
    const modal = document.createElement('div');
    modal.style.position = 'fixed';
    modal.style.top = '50%';
    modal.style.left = '50%';
    modal.style.transform = 'translate(-50%, -50%)';
    modal.style.backgroundColor = 'rgba(255, 255, 255, 0.95)';
    modal.style.padding = '30px';
    modal.style.borderRadius = '15px';
    modal.style.boxShadow = '0 10px 30px rgba(0, 0, 0, 0.3)';
    modal.style.zIndex = '1000';
    modal.style.maxWidth = '500px';
    modal.style.textAlign = 'center';
    modal.style.backdropFilter = 'blur(10px)';
    
    modal.innerHTML = `
        <h2 style="color: #333; margin-bottom: 15px;">东方明珠塔</h2>
        <p style="color: #666; line-height: 1.6; margin-bottom: 15px;">
            东方明珠广播电视塔，简称"东方明珠"，位于上海市浦东新区陆家嘴，
            始建于1991年，于1994年建成。塔高468米，是上海的标志性文化景观之一。
        </p>
        <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
            塔内有太空舱、旋转餐厅、上海城市历史发展陈列馆等景观和设施，
            是集观光、餐饮、购物、娱乐、住宿、广播电视发射等多功能于一体的综合性旅游文化景点。
        </p>
        <button id="close-modal" style="
            padding: 10px 20px;
            background: linear-gradient(45deg, #ff6b6b, #ee5a24);
            color: white;
            border: none;
            border-radius: 25px;
            cursor: pointer;
            font-size: 16px;
            transition: transform 0.3s ease;
        ">关闭</button>
    `;
    
    document.body.appendChild(modal);
    
    // 添加关闭功能
    document.getElementById('close-modal').addEventListener('click', function() {
        modal.style.animation = 'fadeOut 0.3s ease-out';
        setTimeout(() => {
            document.body.removeChild(modal);
        }, 300);
    });
    
    // 添加淡入动画
    modal.style.animation = 'fadeIn 0.3s ease-out';
    
    // 添加动画样式
    const style = document.createElement('style');
    style.textContent = `
        @keyframes fadeIn {
            from {
                opacity: 0;
                transform: translate(-50%, -50%) scale(0.9);
            }
            to {
                opacity: 1;
                transform: translate(-50%, -50%) scale(1);
            }
        }
        @keyframes fadeOut {
            from {
                opacity: 1;
                transform: translate(-50%, -50%) scale(1);
            }
            to {
                opacity: 0;
                transform: translate(-50%, -50%) scale(0.9);
            }
        }
    `;
    document.head.appendChild(style);
}

// 添加页面加载完成后的特效
window.addEventListener('load', function() {
    // 延迟显示塔体
    const tower = document.querySelector('.tower-container');
    if (tower) {
        tower.style.opacity = '0';
        tower.style.transform = 'translateX(-50%) translateY(50px)';
        setTimeout(() => {
            tower.style.transition = 'all 2s ease-out';
            tower.style.opacity = '1';
            tower.style.transform = 'translateX(-50%) translateY(0)';
        }, 500);
    }
    
    // 添加烟花效果（可选）
    setTimeout(() => {
        createFireworks();
    }, 3000);
});

function createFireworks() {
    const container = document.querySelector('.skyline');
    if (!container) return;
    
    for (let i = 0; i < 5; i++) {
        setTimeout(() => {
            const firework = document.createElement('div');
            firework.style.position = 'absolute';
            firework.style.width = '4px';
            firework.style.height = '4px';
            firework.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 50%)`;
            firework.style.borderRadius = '50%';
            firework.style.left = Math.random() * 100 + '%';
            firework.style.top = '100px';
            firework.style.boxShadow = `0 0 10px currentColor`;
            firework.style.zIndex = '10';
            
            container.appendChild(firework);
            
            // 烟花上升动画
            firework.animate([
                { transform: 'translateY(0)', opacity: 1 },
                { transform: 'translateY(-200px)', opacity: 0 }
            ], {
                duration: 1500,
                easing: 'ease-out'
            }).onfinish = () => {
                container.removeChild(firework);
                createExplosion(firework.style.left, firework.style.top);
            };
        }, i * 300);
    }
}

function createExplosion(x, y) {
    const container = document.querySelector('.skyline');
    if (!container) return;
    
    const particleCount = 20;
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.style.position = 'absolute';
        particle.style.width = '2px';
        particle.style.height = '2px';
        particle.style.backgroundColor = `hsl(${Math.random() * 360}, 100%, 50%)`;
        particle.style.borderRadius = '50%';
        particle.style.left = x;
        particle.style.top = y;
        particle.style.zIndex = '10';
        
        container.appendChild(particle);
        
        const angle = (Math.PI * 2 * i) / particleCount;
        const velocity = Math.random() * 50 + 30;
        
        particle.animate([
            { 
                transform: 'translate(0, 0) scale(1)', 
                opacity: 1 
            },
            { 
                transform: `translate(${Math.cos(angle) * velocity}px, ${Math.sin(angle) * velocity}px) scale(0)`, 
                opacity: 0 
            }
        ], {
            duration: 1000,
            easing: 'ease-out'
        }).onfinish = () => {
            container.removeChild(particle);
        };
    }
}