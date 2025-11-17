class CyberShooter {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.overlay = document.getElementById('game-overlay');
        this.startBtn = document.getElementById('start-btn');
        
        this.gameState = 'menu'; // menu, playing, paused, gameOver
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        
        this.player = null;
        this.bullets = [];
        this.enemies = [];
        this.particles = [];
        this.powerUps = [];
        
        this.keys = {};
        this.lastTime = 0;
        this.enemySpawnTimer = 0;
        this.enemySpawnInterval = 120;
        
        this.audioManager = new AudioManager();
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.createParticles();
        this.updateUI();
        this.gameLoop();
    }
    
    setupEventListeners() {
        this.startBtn.addEventListener('click', () => this.startGame());
        
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            if (e.code === 'KeyP' && this.gameState === 'playing') {
                this.togglePause();
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
        
        // 防止空格键滚动页面
        document.addEventListener('keydown', (e) => {
            if (e.code === 'Space') {
                e.preventDefault();
            }
        });
    }
    
    startGame() {
        this.gameState = 'playing';
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.bullets = [];
        this.enemies = [];
        this.particles = [];
        this.powerUps = [];
        
        this.player = new Player(this.canvas.width / 2, this.canvas.height - 100);
        this.overlay.classList.add('hidden');
        this.updateUI();
        
        // 初始化音频上下文（需要用户交互）
        if (this.audioManager.audioContext && this.audioManager.audioContext.state === 'suspended') {
            this.audioManager.audioContext.resume();
        }
    }
    
    togglePause() {
        this.gameState = this.gameState === 'playing' ? 'paused' : 'playing';
        if (this.gameState === 'paused') {
            this.showOverlay('游戏暂停', '按 P 键继续游戏');
        } else {
            this.overlay.classList.add('hidden');
        }
    }
    
    gameOver() {
        this.gameState = 'gameOver';
        this.audioManager.play('gameOver');
        this.showOverlay('游戏结束', `最终得分: ${this.score}`);
        this.startBtn.textContent = '重新开始';
    }
    
    showOverlay(title, text) {
        document.getElementById('overlay-title').textContent = title;
        document.getElementById('overlay-text').textContent = text;
        this.overlay.classList.remove('hidden');
    }
    
    updateUI() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('lives').textContent = this.lives;
        document.getElementById('level').textContent = this.level;
    }
    
    createParticles() {
        // 创建背景粒子效果
        for (let i = 0; i < 20; i++) {
            this.particles.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                vy: Math.random() * 2 + 1,
                size: Math.random() * 2 + 1,
                opacity: Math.random() * 0.5 + 0.2
            });
        }
    }
    
    update(deltaTime) {
        if (this.gameState !== 'playing') return;
        
        this.updatePlayer();
        this.updateBullets();
        this.updateEnemies();
        this.updateParticles();
        this.checkCollisions();
        this.spawnEnemies();
        this.updateLevel();
    }
    
    updatePlayer() {
        if (!this.player) return;
        
        // 移动控制
        if (this.keys['KeyA'] || this.keys['ArrowLeft']) {
            this.player.x -= this.player.speed;
        }
        if (this.keys['KeyD'] || this.keys['ArrowRight']) {
            this.player.x += this.player.speed;
        }
        if (this.keys['KeyW'] || this.keys['ArrowUp']) {
            this.player.y -= this.player.speed;
        }
        if (this.keys['KeyS'] || this.keys['ArrowDown']) {
            this.player.y += this.player.speed;
        }
        
        // 边界检查
        this.player.x = Math.max(this.player.size, Math.min(this.canvas.width - this.player.size, this.player.x));
        this.player.y = Math.max(this.player.size, Math.min(this.canvas.height - this.player.size, this.player.y));
        
        // 射击
        if (this.keys['Space']) {
            this.player.shoot(this.bullets);
        }
    }
    
    updateBullets() {
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            bullet.y -= bullet.speed;
            
            if (bullet.y < -bullet.size) {
                this.bullets.splice(i, 1);
            }
        }
    }
    
    updateEnemies() {
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            enemy.update();
            
            if (enemy.y > this.canvas.height + enemy.size) {
                this.enemies.splice(i, 1);
            }
        }
    }
    
    updateParticles() {
        // 更新背景粒子
        for (const particle of this.particles) {
            particle.y += particle.vy;
            if (particle.y > this.canvas.height) {
                particle.y = -10;
                particle.x = Math.random() * this.canvas.width;
            }
        }
    }
    
    spawnEnemies() {
        this.enemySpawnTimer++;
        if (this.enemySpawnTimer >= this.enemySpawnInterval) {
            this.enemySpawnTimer = 0;
            
            const x = Math.random() * (this.canvas.width - 60) + 30;
            const type = Math.random() < 0.7 ? 'basic' : 'fast';
            this.enemies.push(new Enemy(x, -30, type));
        }
    }
    
    checkCollisions() {
        // 子弹与敌机碰撞
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            
            for (let j = this.enemies.length - 1; j >= 0; j--) {
                const enemy = this.enemies[j];
                
                if (this.isColliding(bullet, enemy)) {
                    this.bullets.splice(i, 1);
                    this.enemies.splice(j, 1);
                    this.score += enemy.points;
                    this.createExplosion(enemy.x, enemy.y);
                    break;
                }
            }
        }
        
        // 玩家与敌机碰撞
        if (this.player) {
            for (let i = this.enemies.length - 1; i >= 0; i--) {
                const enemy = this.enemies[i];
                
                if (this.isColliding(this.player, enemy)) {
                    this.enemies.splice(i, 1);
                    this.lives--;
                    this.createExplosion(enemy.x, enemy.y);
                    
                    if (this.lives <= 0) {
                        this.gameOver();
                    }
                }
            }
        }
        
        this.updateUI();
    }
    
    isColliding(obj1, obj2) {
        const dx = obj1.x - obj2.x;
        const dy = obj1.y - obj2.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance < obj1.size + obj2.size;
    }
    
    createExplosion(x, y) {
        // 播放爆炸音效
        this.audioManager.play('explosion');
        
        // 创建爆炸效果
        for (let i = 0; i < 8; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 10,
                vy: (Math.random() - 0.5) * 10,
                size: Math.random() * 3 + 2,
                color: Math.random() < 0.5 ? '#ffff00' : '#ff6600',
                life: 30,
                maxLife: 30
            });
        }
    }
    
    updateLevel() {
        const newLevel = Math.floor(this.score / 1000) + 1;
        if (newLevel > this.level) {
            this.level = newLevel;
            this.enemySpawnInterval = Math.max(60, 120 - this.level * 10);
            this.audioManager.play('levelUp');
        }
    }
    
    render() {
        // 清空画布
        this.ctx.fillStyle = 'rgba(0, 0, 17, 0.1)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 渲染背景粒子
        this.renderParticles();
        
        // 渲染游戏对象
        if (this.player) {
            this.player.render(this.ctx);
        }
        
        this.bullets.forEach(bullet => bullet.render(this.ctx));
        this.enemies.forEach(enemy => enemy.render(this.ctx));
    }
    
    renderParticles() {
        for (const particle of this.particles) {
            if (particle.life !== undefined) {
                // 爆炸粒子
                const alpha = particle.life / particle.maxLife;
                this.ctx.save();
                this.ctx.globalAlpha = alpha;
                this.ctx.fillStyle = particle.color;
                this.ctx.beginPath();
                this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.restore();
                
                particle.x += particle.vx;
                particle.y += particle.vy;
                particle.life--;
                
                if (particle.life <= 0) {
                    const index = this.particles.indexOf(particle);
                    if (index > -1) {
                        this.particles.splice(index, 1);
                    }
                }
            } else {
                // 背景粒子
                this.ctx.save();
                this.ctx.globalAlpha = particle.opacity;
                this.ctx.fillStyle = '#00ffff';
                this.ctx.beginPath();
                this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                this.ctx.fill();
                this.ctx.restore();
            }
        }
    }
    
    gameLoop(currentTime = 0) {
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        this.update(deltaTime);
        this.render();
        
        requestAnimationFrame((time) => this.gameLoop(time));
    }
}

class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = 20;
        this.speed = 5;
        this.shootCooldown = 0;
        this.shootInterval = 10;
    }
    
    shoot(bullets) {
        if (this.shootCooldown <= 0) {
            bullets.push(new Bullet(this.x, this.y - this.size));
            this.shootCooldown = this.shootInterval;
            // 播放射击音效
            if (window.audioManager) {
                window.audioManager.play('shoot');
            }
        }
    }
    
    update() {
        if (this.shootCooldown > 0) {
            this.shootCooldown--;
        }
    }
    
    render(ctx) {
        ctx.save();
        
        // 玩家飞机主体
        ctx.fillStyle = '#00ffff';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 2;
        
        ctx.beginPath();
        ctx.moveTo(this.x, this.y - this.size);
        ctx.lineTo(this.x - this.size * 0.7, this.y + this.size);
        ctx.lineTo(this.x, this.y + this.size * 0.5);
        ctx.lineTo(this.x + this.size * 0.7, this.y + this.size);
        ctx.closePath();
        ctx.fill();
        ctx.stroke();
        
        // 发光效果
        ctx.shadowColor = '#00ffff';
        ctx.shadowBlur = 15;
        ctx.stroke();
        
        // 引擎光效
        ctx.fillStyle = '#ff00ff';
        ctx.beginPath();
        ctx.arc(this.x - this.size * 0.3, this.y + this.size * 0.7, 3, 0, Math.PI * 2);
        ctx.arc(this.x + this.size * 0.3, this.y + this.size * 0.7, 3, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
}

class Bullet {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = 4;
        this.speed = 10;
    }
    
    render(ctx) {
        ctx.save();
        
        // 子弹主体
        ctx.fillStyle = '#ffff00';
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // 发光效果
        ctx.shadowColor = '#ffff00';
        ctx.shadowBlur = 10;
        ctx.fill();
        
        ctx.restore();
    }
}

class Enemy {
    constructor(x, y, type = 'basic') {
        this.x = x;
        this.y = y;
        this.type = type;
        this.size = type === 'basic' ? 15 : 12;
        this.speed = type === 'basic' ? 2 : 4;
        this.points = type === 'basic' ? 100 : 200;
        this.health = type === 'basic' ? 1 : 2;
    }
    
    update() {
        this.y += this.speed;
        
        // 横向移动
        if (this.type === 'fast') {
            this.x += Math.sin(this.y * 0.02) * 2;
        }
    }
    
    render(ctx) {
        ctx.save();
        
        if (this.type === 'basic') {
            // 基础敌机
            ctx.fillStyle = '#ff0066';
            ctx.strokeStyle = '#ff3366';
            ctx.lineWidth = 2;
            
            ctx.beginPath();
            ctx.moveTo(this.x, this.y + this.size);
            ctx.lineTo(this.x - this.size * 0.6, this.y - this.size * 0.5);
            ctx.lineTo(this.x, this.y - this.size);
            ctx.lineTo(this.x + this.size * 0.6, this.y - this.size * 0.5);
            ctx.closePath();
            ctx.fill();
            ctx.stroke();
            
            // 发光效果
            ctx.shadowColor = '#ff0066';
            ctx.shadowBlur = 10;
            ctx.stroke();
        } else {
            // 快速敌机
            ctx.fillStyle = '#ff6600';
            ctx.strokeStyle = '#ff9900';
            ctx.lineWidth = 1;
            
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
            ctx.stroke();
            
            // 发光效果
            ctx.shadowColor = '#ff6600';
            ctx.shadowBlur = 8;
            ctx.fill();
        }
        
        ctx.restore();
    }
}

// 初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    new CyberShooter();
});