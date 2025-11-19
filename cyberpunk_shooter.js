// 赛博朋克飞机大战游戏逻辑
class CyberPunkShooter {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        
        // 游戏状态
        this.gameRunning = false;
        this.gamePaused = false;
        this.score = 0;
        this.level = 1;
        this.lives = 3;
        
        // 玩家飞机
        this.player = {
            x: this.width / 2 - 25,
            y: this.height - 80,
            width: 50,
            height: 60,
            speed: 6,
            color: '#00ffea'
        };
        
        // 子弹数组
        this.bullets = [];
        this.bulletSpeed = 8;
        
        // 敌人数组
        this.enemies = [];
        this.enemySpeed = 1;
        this.enemySpawnRate = 60; // 每60帧生成一个敌人
        this.enemyCounter = 0;
        
        // 粒子效果
        this.particles = [];
        
        // 控制键状态
        this.keys = {};
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.startGameLoop();
    }
    
    setupEventListeners() {
        // 键盘事件 - 使用更精确的控制
        document.addEventListener('keydown', (e) => {
            if (e.key === ' ') {
                e.preventDefault();
            }
            // 防止重复按键
            if (['ArrowLeft', 'ArrowRight', 'a', 'd', ' '].includes(e.key)) {
                e.preventDefault();
            }
            this.keys[e.key] = true;
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.key] = false;
        });
        
        // 按钮事件
        document.getElementById('startBtn').addEventListener('click', () => {
            this.startGame();
        });
        
        document.getElementById('pauseBtn').addEventListener('click', () => {
            this.togglePause();
        });
        
        document.getElementById('restartBtn').addEventListener('click', () => {
            this.restartGame();
        });
    }
    
    startGame() {
        this.gameRunning = true;
        this.gamePaused = false;
        this.score = 0;
        this.level = 1;
        this.lives = 3;
        this.bullets = [];
        this.enemies = [];
        this.particles = [];
        this.updateStats();
        document.getElementById('gameOver').classList.add('hidden');
    }
    
    togglePause() {
        if (this.gameRunning) {
            this.gamePaused = !this.gamePaused;
        }
    }
    
    restartGame() {
        this.startGame();
    }
    
    shoot() {
        // 添加射击冷却，防止子弹过多
        if (!this.lastShotTime || Date.now() - this.lastShotTime > 150) { // 150ms冷却
            this.bullets.push({
                x: this.player.x + this.player.width / 2 - 2,
                y: this.player.y,
                width: 4,
                height: 15,
                color: '#ff0077'
            });
            
            // 添加射击粒子效果
            for (let i = 0; i < 5; i++) {
                this.particles.push({
                    x: this.player.x + this.player.width / 2,
                    y: this.player.y,
                    size: Math.random() * 3 + 1,
                    speedX: (Math.random() - 0.5) * 4,
                    speedY: Math.random() * 2,
                    color: '#ff0077',
                    life: 20
                });
            }
            
            this.lastShotTime = Date.now();
        }
    }
    
    spawnEnemy() {
        this.enemyCounter++;
        
        if (this.enemyCounter >= this.enemySpawnRate) {
            const size = Math.random() * 30 + 30;
            // 确保敌人不会超出画布边界
            const xPosition = Math.max(0, Math.min(this.width - size, Math.random() * this.width));
            
            this.enemies.push({
                x: xPosition,
                y: -size,
                width: size,
                height: size,
                speed: this.enemySpeed + Math.random() * 1,
                color: '#ff0077'
            });
            
            // 随着等级增加，敌人出现更频繁，但不会无限加速
            this.enemySpawnRate = Math.max(15, 60 - this.level * 3);
            this.enemyCounter = 0;
        }
    }
    
    updatePlayer() {
        if (this.keys['ArrowLeft'] || this.keys['a']) {
            this.player.x = Math.max(0, this.player.x - this.player.speed);
        }
        if (this.keys['ArrowRight'] || this.keys['d']) {
            this.player.x = Math.min(this.width - this.player.width, this.player.x + this.player.speed);
        }
    }
    
    updateBullets() {
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            this.bullets[i].y -= this.bulletSpeed;
            
            // 移除屏幕外的子弹
            if (this.bullets[i].y + this.bullets[i].height < 0) {
                this.bullets.splice(i, 1);
            }
        }
    }
    
    updateEnemies() {
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            this.enemies[i].y += this.enemies[i].speed;
            
            // 移除屏幕外的敌人
            if (this.enemies[i].y > this.height) {
                this.enemies.splice(i, 1);
                this.lives--;
                this.updateStats();
                
                if (this.lives <= 0) {
                    this.gameOver();
                }
            }
        }
    }
    
    updateParticles() {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            this.particles[i].x += this.particles[i].speedX;
            this.particles[i].y += this.particles[i].speedY;
            this.particles[i].life--;
            
            if (this.particles[i].life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }
    
    checkCollisions() {
        // 子弹与敌人碰撞检测
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            for (let j = this.enemies.length - 1; j >= 0; j--) {
                if (this.isColliding(this.bullets[i], this.enemies[j])) {
                    // 添加爆炸粒子效果
                    for (let k = 0; k < 15; k++) {
                        this.particles.push({
                            x: this.enemies[j].x + this.enemies[j].width / 2,
                            y: this.enemies[j].y + this.enemies[j].height / 2,
                            size: Math.random() * 4 + 1,
                            speedX: (Math.random() - 0.5) * 6,
                            speedY: (Math.random() - 0.5) * 6,
                            color: '#ffff00',
                            life: 30
                        });
                    }
                    
                    // 移除子弹和敌人
                    this.bullets.splice(i, 1);
                    this.enemies.splice(j, 1);
                    
                    // 增加分数
                    this.score += 10;
                    this.updateStats();
                    
                    // 检查是否升级
                    if (this.score % 100 === 0) {
                        this.levelUp();
                    }
                    break;
                }
            }
        }
        
        // 玩家与敌人碰撞检测
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            if (this.isColliding(this.player, this.enemies[i])) {
                // 添加碰撞粒子效果
                for (let k = 0; k < 20; k++) {
                    this.particles.push({
                        x: this.player.x + this.player.width / 2,
                        y: this.player.y + this.player.height / 2,
                        size: Math.random() * 4 + 2,
                        speedX: (Math.random() - 0.5) * 8,
                        speedY: (Math.random() - 0.5) * 8,
                        color: '#ff0000',
                        life: 40
                    });
                }
                
                this.enemies.splice(i, 1);
                this.lives--;
                this.updateStats();
                
                if (this.lives <= 0) {
                    this.gameOver();
                }
            }
        }
    }
    
    isColliding(obj1, obj2) {
        return obj1.x < obj2.x + obj2.width &&
               obj1.x + obj1.width > obj2.x &&
               obj1.y < obj2.y + obj2.height &&
               obj1.y + obj1.height > obj2.y;
    }
    
    levelUp() {
        this.level++;
        // 控制难度增长，避免过快
        this.enemySpeed = Math.min(5, this.enemySpeed + 0.2);
        this.updateStats();
    }
    
    updateStats() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('lives').textContent = this.lives;
        document.getElementById('level').textContent = this.level;
    }
    
    gameOver() {
        this.gameRunning = false;
        document.getElementById('finalScore').textContent = this.score;
        document.getElementById('gameOver').classList.remove('hidden');
    }
    
    drawPlayer() {
        // 绘制赛博朋克风格的玩家飞机
        this.ctx.save();
        this.ctx.translate(this.player.x + this.player.width / 2, this.player.y + this.player.height / 2);
        
        // 飞机主体
        this.ctx.fillStyle = this.player.color;
        this.ctx.beginPath();
        this.ctx.moveTo(0, -this.player.height / 2 + 10);
        this.ctx.lineTo(-this.player.width / 2 + 10, this.player.height / 2 - 10);
        this.ctx.lineTo(0, this.player.height / 2 - 20);
        this.ctx.lineTo(this.player.width / 2 - 10, this.player.height / 2 - 10);
        this.ctx.closePath();
        this.ctx.fill();
        
        // 添加霓虹光效
        this.ctx.shadowColor = this.player.color;
        this.ctx.shadowBlur = 10;
        this.ctx.strokeStyle = this.player.color;
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        
        // 飞机细节
        this.ctx.fillStyle = '#ffffff';
        this.ctx.beginPath();
        this.ctx.arc(0, -5, 5, 0, Math.PI * 2);
        this.ctx.fill();
        
        this.ctx.restore();
    }
    
    drawBullets() {
        for (const bullet of this.bullets) {
            this.ctx.fillStyle = bullet.color;
            this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
            
            // 添加光效
            this.ctx.shadowColor = bullet.color;
            this.ctx.shadowBlur = 10;
            this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
            this.ctx.shadowBlur = 0;
        }
    }
    
    drawEnemies() {
        for (const enemy of this.enemies) {
            // 绘制赛博朋克风格的敌人
            this.ctx.fillStyle = enemy.color;
            this.ctx.beginPath();
            this.ctx.arc(
                enemy.x + enemy.width / 2, 
                enemy.y + enemy.height / 2, 
                enemy.width / 2, 
                0, 
                Math.PI * 2
            );
            this.ctx.fill();
            
            // 添加霓虹光效
            this.ctx.shadowColor = enemy.color;
            this.ctx.shadowBlur = 15;
            this.ctx.strokeStyle = enemy.color;
            this.ctx.lineWidth = 3;
            this.ctx.stroke();
            this.ctx.shadowBlur = 0;
            
            // 敌人细节 - 绘制一个赛博眼
            this.ctx.fillStyle = '#ffffff';
            this.ctx.beginPath();
            this.ctx.arc(
                enemy.x + enemy.width / 2, 
                enemy.y + enemy.height / 2, 
                enemy.width / 6, 
                0, 
                Math.PI * 2
            );
            this.ctx.fill();
            
            this.ctx.fillStyle = '#000000';
            this.ctx.beginPath();
            this.ctx.arc(
                enemy.x + enemy.width / 2, 
                enemy.y + enemy.height / 2, 
                enemy.width / 12, 
                0, 
                Math.PI * 2
            );
            this.ctx.fill();
        }
    }
    
    drawParticles() {
        for (const particle of this.particles) {
            this.ctx.fillStyle = particle.color;
            this.ctx.globalAlpha = particle.life / 30;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.globalAlpha = 1;
        }
    }
    
    drawBackground() {
        // 渐变背景
        const gradient = this.ctx.createLinearGradient(0, 0, 0, this.height);
        gradient.addColorStop(0, '#0a0a0a');
        gradient.addColorStop(1, '#1a0a1e');
        
        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // 添加网格线效果
        this.ctx.strokeStyle = 'rgba(0, 255, 234, 0.1)';
        this.ctx.lineWidth = 1;
        const gridSize = 40;
        
        for (let x = 0; x < this.width; x += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(x, 0);
            this.ctx.lineTo(x, this.height);
            this.ctx.stroke();
        }
        
        for (let y = 0; y < this.height; y += gridSize) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y);
            this.ctx.lineTo(this.width, y);
            this.ctx.stroke();
        }
    }
    
    render() {
        // 清除画布
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        // 绘制背景
        this.drawBackground();
        
        // 绘制游戏元素
        this.drawParticles();
        this.drawBullets();
        this.drawEnemies();
        this.drawPlayer();
    }
    
    update() {
        if (!this.gameRunning || this.gamePaused) return;
        
        this.updatePlayer();
        this.updateBullets();
        this.updateEnemies();
        this.updateParticles();
        this.checkCollisions();
        this.spawnEnemy();
        
        // 限制游戏中的对象数量，防止性能下降
        this.limitObjects();
    }
    
    limitObjects() {
        // 限制子弹数量
        if (this.bullets.length > 100) {
            this.bullets.splice(0, this.bullets.length - 100);
        }
        
        // 限制敌人数量
        if (this.enemies.length > 50) {
            this.enemies.splice(0, this.enemies.length - 50);
        }
        
        // 限制粒子数量
        if (this.particles.length > 300) {
            this.particles.splice(0, this.particles.length - 300);
        }
    }
    
    startGameLoop() {
        const gameLoop = () => {
            this.update();
            this.render();
            
            requestAnimationFrame(gameLoop);
        };
        
        gameLoop();
    }
}

// 启动游戏
window.addEventListener('load', () => {
    new CyberPunkShooter();
});