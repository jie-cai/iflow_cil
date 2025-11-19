class AircraftWarGame {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.gameRunning = false;
        this.gamePaused = false;
        this.score = 0;
        this.lives = 3;
        
        // 游戏对象数组
        this.player = null;
        this.bullets = [];
        this.enemies = [];
        this.enemyBullets = [];
        this.explosions = [];
        
        // 游戏循环相关
        this.lastTime = 0;
        this.enemySpawnTimer = 0;
        this.enemySpawnInterval = 2000; // 2秒生成一个敌机
        
        // 键盘输入状态
        this.keys = {};
        
        this.initializeGame();
        this.bindEvents();
    }
    
    initializeGame() {
        // 创建玩家飞机
        this.player = new PlayerAircraft(this.canvas.width / 2, this.canvas.height - 100);
        this.updateUI();
    }
    
    bindEvents() {
        // 键盘事件
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            
            // 空格键发射子弹
            if (e.code === 'Space' && this.gameRunning && !this.gamePaused) {
                e.preventDefault();
                this.playerShoot();
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
        
        // 按钮事件
        document.getElementById('startBtn').addEventListener('click', () => this.startGame());
        document.getElementById('pauseBtn').addEventListener('click', () => this.togglePause());
        document.getElementById('restartBtn').addEventListener('click', () => this.restartGame());
        document.getElementById('playAgainBtn').addEventListener('click', () => this.restartGame());
    }
    
    startGame() {
        if (!this.gameRunning) {
            this.gameRunning = true;
            this.gamePaused = false;
            this.gameLoop();
            document.getElementById('startBtn').textContent = '游戏中';
            document.getElementById('startBtn').disabled = true;
        }
    }
    
    togglePause() {
        if (this.gameRunning) {
            this.gamePaused = !this.gamePaused;
            document.getElementById('pauseBtn').textContent = this.gamePaused ? '继续' : '暂停';
            if (!this.gamePaused) {
                this.gameLoop();
            }
        }
    }
    
    restartGame() {
        this.gameRunning = false;
        this.gamePaused = false;
        this.score = 0;
        this.lives = 3;
        
        // 清空所有游戏对象
        this.bullets = [];
        this.enemies = [];
        this.enemyBullets = [];
        this.explosions = [];
        
        // 重新初始化玩家
        this.player = new PlayerAircraft(this.canvas.width / 2, this.canvas.height - 100);
        
        // 重置UI
        this.updateUI();
        document.getElementById('gameOver').classList.add('hidden');
        document.getElementById('startBtn').textContent = '开始游戏';
        document.getElementById('startBtn').disabled = false;
        document.getElementById('pauseBtn').textContent = '暂停';
        
        // 清空画布
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    gameLoop(currentTime = 0) {
        if (!this.gameRunning || this.gamePaused) return;
        
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        // 更新游戏状态
        this.update(deltaTime);
        
        // 渲染游戏画面
        this.render();
        
        // 继续游戏循环
        requestAnimationFrame((time) => this.gameLoop(time));
    }
    
    update(deltaTime) {
        // 更新玩家飞机
        this.player.update(this.keys, this.canvas);
        
        // 生成敌机
        this.enemySpawnTimer += deltaTime;
        if (this.enemySpawnTimer >= this.enemySpawnInterval) {
            this.spawnEnemy();
            this.enemySpawnTimer = 0;
            // 随着分数增加，敌机生成速度加快
            this.enemySpawnInterval = Math.max(500, 2000 - this.score * 2);
        }
        
        // 更新子弹
        this.updateBullets();
        
        // 更新敌机
        this.updateEnemies();
        
        // 更新爆炸效果
        this.updateExplosions();
        
        // 碰撞检测
        this.checkCollisions();
        
        // 敌机射击
        this.enemyShooting();
    }
    
    render() {
        // 清空画布
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制背景
        this.drawBackground();
        
        // 绘制玩家飞机
        this.player.draw(this.ctx);
        
        // 绘制子弹
        this.bullets.forEach(bullet => bullet.draw(this.ctx));
        this.enemyBullets.forEach(bullet => bullet.draw(this.ctx));
        
        // 绘制敌机
        this.enemies.forEach(enemy => enemy.draw(this.ctx));
        
        // 绘制爆炸效果
        this.explosions.forEach(explosion => explosion.draw(this.ctx));
    }
    
    drawBackground() {
        // 绘制简单的背景
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.canvas.height);
        gradient.addColorStop(0, '#87ceeb');
        gradient.addColorStop(1, '#4682b4');
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制云朵效果
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        for (let i = 0; i < 5; i++) {
            const x = (Date.now() * 0.01 * (i + 1)) % (this.canvas.width + 100) - 50;
            const y = 50 + i * 100;
            this.drawCloud(x, y);
        }
    }
    
    drawCloud(x, y) {
        this.ctx.beginPath();
        this.ctx.arc(x, y, 20, 0, Math.PI * 2);
        this.ctx.arc(x + 25, y, 25, 0, Math.PI * 2);
        this.ctx.arc(x + 50, y, 20, 0, Math.PI * 2);
        this.ctx.arc(x + 25, y - 15, 15, 0, Math.PI * 2);
        this.ctx.fill();
    }
    
    playerShoot() {
        const bullet = new Bullet(this.player.x + this.player.width / 2, this.player.y, -8, '#ffff00');
        this.bullets.push(bullet);
    }
    
    spawnEnemy() {
        const x = Math.random() * (this.canvas.width - 40);
        const enemy = new EnemyAircraft(x, -40);
        this.enemies.push(enemy);
    }
    
    updateBullets() {
        // 更新玩家子弹
        this.bullets = this.bullets.filter(bullet => {
            bullet.update();
            return bullet.y > -10;
        });
        
        // 更新敌机子弹
        this.enemyBullets = this.enemyBullets.filter(bullet => {
            bullet.update();
            return bullet.y < this.canvas.height + 10;
        });
    }
    
    updateEnemies() {
        this.enemies = this.enemies.filter(enemy => {
            enemy.update();
            return enemy.y < this.canvas.height + 40 && enemy.health > 0;
        });
    }
    
    updateExplosions() {
        this.explosions = this.explosions.filter(explosion => {
            explosion.update();
            return explosion.life > 0;
        });
    }
    
    enemyShooting() {
        this.enemies.forEach(enemy => {
            if (Math.random() < 0.002) { // 0.2% 概率射击
                const bullet = new Bullet(enemy.x + enemy.width / 2, enemy.y + enemy.height, 4, '#ff4444');
                this.enemyBullets.push(bullet);
            }
        });
    }
    
    checkCollisions() {
        // 玩家子弹击中敌机
        this.bullets.forEach((bullet, bulletIndex) => {
            this.enemies.forEach((enemy, enemyIndex) => {
                if (this.isColliding(bullet, enemy)) {
                    enemy.health--;
                    this.bullets.splice(bulletIndex, 1);
                    
                    if (enemy.health <= 0) {
                        this.score += enemy.points;
                        this.createExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
                        this.enemies.splice(enemyIndex, 1);
                    }
                }
            });
        });
        
        // 敌机子弹击中玩家
        this.enemyBullets.forEach((bullet, bulletIndex) => {
            if (this.isColliding(bullet, this.player)) {
                this.enemyBullets.splice(bulletIndex, 1);
                this.playerHit();
            }
        });
        
        // 敌机撞击玩家
        this.enemies.forEach((enemy, enemyIndex) => {
            if (this.isColliding(enemy, this.player)) {
                this.enemies.splice(enemyIndex, 1);
                this.playerHit();
                this.createExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
            }
        });
        
        this.updateUI();
    }
    
    isColliding(obj1, obj2) {
        return obj1.x < obj2.x + obj2.width &&
               obj1.x + obj1.width > obj2.x &&
               obj1.y < obj2.y + obj2.height &&
               obj1.y + obj1.height > obj2.y;
    }
    
    playerHit() {
        this.lives--;
        this.createExplosion(this.player.x + this.player.width / 2, this.player.y + this.player.height / 2);
        
        if (this.lives <= 0) {
            this.gameOver();
        }
    }
    
    createExplosion(x, y) {
        this.explosions.push(new Explosion(x, y));
    }
    
    gameOver() {
        this.gameRunning = false;
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('gameOver').classList.remove('hidden');
        document.getElementById('startBtn').textContent = '开始游戏';
        document.getElementById('startBtn').disabled = false;
    }
    
    updateUI() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('lives').textContent = this.lives;
    }
}

// 玩家飞机类
class PlayerAircraft {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 40;
        this.height = 40;
        this.speed = 5;
    }
    
    update(keys, canvas) {
        // 左右移动
        if (keys['ArrowLeft'] || keys['KeyA']) {
            this.x = Math.max(0, this.x - this.speed);
        }
        if (keys['ArrowRight'] || keys['KeyD']) {
            this.x = Math.min(canvas.width - this.width, this.x + this.speed);
        }
        
        // 上下移动
        if (keys['ArrowUp'] || keys['KeyW']) {
            this.y = Math.max(0, this.y - this.speed);
        }
        if (keys['ArrowDown'] || keys['KeyS']) {
            this.y = Math.min(canvas.height - this.height, this.y + this.speed);
        }
    }
    
    draw(ctx) {
        // 绘制玩家飞机
        ctx.fillStyle = '#4ecdc4';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // 绘制飞机细节
        ctx.fillStyle = '#45b7aa';
        ctx.fillRect(this.x + 15, this.y - 5, 10, 15);
        ctx.fillRect(this.x + 5, this.y + 10, 10, 20);
        ctx.fillRect(this.x + 25, this.y + 10, 10, 20);
    }
}

// 敌机类
class EnemyAircraft {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.width = 35;
        this.height = 35;
        this.speed = 2 + Math.random() * 2;
        this.health = 1;
        this.points = 10;
    }
    
    update() {
        this.y += this.speed;
    }
    
    draw(ctx) {
        // 绘制敌机
        ctx.fillStyle = '#ff6b6b';
        ctx.fillRect(this.x, this.y, this.width, this.height);
        
        // 绘制敌机细节
        ctx.fillStyle = '#e53935';
        ctx.fillRect(this.x + 12, this.y + this.height, 10, 10);
        ctx.fillRect(this.x + 5, this.y + 5, 8, 15);
        ctx.fillRect(this.x + 22, this.y + 5, 8, 15);
    }
}

// 子弹类
class Bullet {
    constructor(x, y, speed, color) {
        this.x = x - 2;
        this.y = y;
        this.width = 4;
        this.height = 10;
        this.speed = speed;
        this.color = color;
    }
    
    update() {
        this.y += this.speed;
    }
    
    draw(ctx) {
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }
}

// 爆炸效果类
class Explosion {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.life = 30;
        this.maxLife = 30;
        this.particles = [];
        
        // 创建爆炸粒子
        for (let i = 0; i < 8; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8,
                life: this.maxLife
            });
        }
    }
    
    update() {
        this.life--;
        this.particles.forEach(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life--;
        });
    }
    
    draw(ctx) {
        const alpha = this.life / this.maxLife;
        
        this.particles.forEach(particle => {
            const particleAlpha = particle.life / this.maxLife;
            ctx.fillStyle = `rgba(255, 167, 38, ${particleAlpha})`;
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, 3 * particleAlpha, 0, Math.PI * 2);
            ctx.fill();
        });
    }
}

// 初始化游戏
document.addEventListener('DOMContentLoaded', () => {
    new AircraftWarGame();
});