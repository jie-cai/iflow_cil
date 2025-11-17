class CyberShooter {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.gameRunning = false;
        this.gamePaused = false;
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        
        // 游戏对象
        this.player = null;
        this.bullets = [];
        this.enemies = [];
        this.powerUps = [];
        this.particles = [];
        
        // 游戏循环
        this.lastTime = 0;
        this.keys = {};
        
        // 敌机生成
        this.enemySpawnTimer = 0;
        this.enemySpawnInterval = 2000; // 2秒
        
        // 背景效果
        this.stars = [];
        this.gridOffset = 0;
        
        this.init();
    }
    
    init() {
        this.createStars();
        this.createPlayer();
        this.bindEvents();
        this.updateUI();
    }
    
    createStars() {
        for (let i = 0; i < 100; i++) {
            this.stars.push({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 2 + 1,
                speed: Math.random() * 2 + 1,
                color: Math.random() > 0.5 ? '#00ffff' : '#ff00ff'
            });
        }
    }
    
    createPlayer() {
        this.player = {
            x: this.canvas.width / 2,
            y: this.canvas.height - 80,
            width: 40,
            height: 40,
            speed: 5,
            weaponLevel: 1,
            invulnerable: false,
            invulnerableTime: 0,
            color: '#00ffff'
        };
    }
    
    bindEvents() {
        // 键盘事件
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            if (e.code === 'Space') {
                e.preventDefault();
                this.shoot();
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
        
        // 按钮事件
        document.getElementById('start-btn').addEventListener('click', () => {
            this.startGame();
        });
        
        document.getElementById('pause-btn').addEventListener('click', () => {
            this.togglePause();
        });
        
        document.getElementById('restart-btn').addEventListener('click', () => {
            this.restartGame();
        });
    }
    
    startGame() {
        this.gameRunning = true;
        this.gamePaused = false;
        document.getElementById('start-btn').disabled = true;
        document.getElementById('game-over').classList.add('hidden');
        this.gameLoop();
    }
    
    togglePause() {
        this.gamePaused = !this.gamePaused;
        document.getElementById('pause-btn').textContent = this.gamePaused ? '继续' : '暂停';
        if (!this.gamePaused) {
            this.gameLoop();
        }
    }
    
    restartGame() {
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.bullets = [];
        this.enemies = [];
        this.powerUps = [];
        this.particles = [];
        this.createPlayer();
        this.updateUI();
        this.startGame();
    }
    
    update(deltaTime) {
        if (!this.gameRunning || this.gamePaused) return;
        
        this.updatePlayer(deltaTime);
        this.updateBullets(deltaTime);
        this.updateEnemies(deltaTime);
        this.updatePowerUps(deltaTime);
        this.updateParticles(deltaTime);
        this.updateBackground(deltaTime);
        this.spawnEnemies(deltaTime);
        this.checkCollisions();
        this.updateGameLevel();
    }
    
    updatePlayer(deltaTime) {
        if (this.keys['KeyW'] || this.keys['ArrowUp']) {
            this.player.y = Math.max(0, this.player.y - this.player.speed);
        }
        if (this.keys['KeyS'] || this.keys['ArrowDown']) {
            this.player.y = Math.min(this.canvas.height - this.player.height, this.player.y + this.player.speed);
        }
        if (this.keys['KeyA'] || this.keys['ArrowLeft']) {
            this.player.x = Math.max(0, this.player.x - this.player.speed);
        }
        if (this.keys['KeyD'] || this.keys['ArrowRight']) {
            this.player.x = Math.min(this.canvas.width - this.player.width, this.player.x + this.player.speed);
        }
        
        // 更新无敌时间
        if (this.player.invulnerable) {
            this.player.invulnerableTime -= deltaTime;
            if (this.player.invulnerableTime <= 0) {
                this.player.invulnerable = false;
            }
        }
    }
    
    shoot() {
        if (!this.gameRunning || this.gamePaused) return;
        
        const bulletCount = this.player.weaponLevel;
        const spreadAngle = 15; // 散射角度
        
        for (let i = 0; i < bulletCount; i++) {
            let angle = 0;
            if (bulletCount > 1) {
                angle = (i - (bulletCount - 1) / 2) * spreadAngle;
            }
            
            this.bullets.push({
                x: this.player.x + this.player.width / 2,
                y: this.player.y,
                width: 4,
                height: 10,
                speed: 8,
                angle: angle,
                color: '#00ffff'
            });
        }
    }
    
    updateBullets(deltaTime) {
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            const angleRad = (bullet.angle * Math.PI) / 180;
            bullet.x += Math.sin(angleRad) * bullet.speed;
            bullet.y -= Math.cos(angleRad) * bullet.speed;
            
            // 移除超出边界的子弹
            if (bullet.y < -bullet.height || bullet.x < -bullet.width || bullet.x > this.canvas.width) {
                this.bullets.splice(i, 1);
            }
        }
    }
    
    spawnEnemies(deltaTime) {
        this.enemySpawnTimer += deltaTime;
        if (this.enemySpawnTimer >= this.enemySpawnInterval) {
            this.enemySpawnTimer = 0;
            this.createEnemy();
        }
    }
    
    createEnemy() {
        const enemy = {
            x: Math.random() * (this.canvas.width - 40),
            y: -40,
            width: 30 + Math.random() * 20,
            height: 30 + Math.random() * 20,
            speed: 1 + Math.random() * 2 + this.level * 0.5,
            hp: 1 + Math.floor(this.level / 3),
            color: `hsl(${Math.random() * 60 + 300}, 100%, 50%)`,
            shootTimer: 0,
            shootInterval: 2000 + Math.random() * 2000
        };
        
        this.enemies.push(enemy);
    }
    
    updateEnemies(deltaTime) {
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            enemy.y += enemy.speed;
            
            // 敌机射击
            enemy.shootTimer += deltaTime;
            if (enemy.shootTimer >= enemy.shootInterval) {
                enemy.shootTimer = 0;
                this.createEnemyBullet(enemy);
            }
            
            // 移除超出边界的敌机
            if (enemy.y > this.canvas.height) {
                this.enemies.splice(i, 1);
            }
        }
    }
    
    createEnemyBullet(enemy) {
        this.bullets.push({
            x: enemy.x + enemy.width / 2,
            y: enemy.y + enemy.height,
            width: 3,
            height: 8,
            speed: 4,
            angle: 0,
            color: '#ff00ff',
            isEnemy: true
        });
    }
    
    updatePowerUps(deltaTime) {
        for (let i = this.powerUps.length - 1; i >= 0; i--) {
            const powerUp = this.powerUps[i];
            powerUp.y += powerUp.speed;
            powerUp.rotation += powerUp.rotationSpeed;
            
            if (powerUp.y > this.canvas.height) {
                this.powerUps.splice(i, 1);
            }
        }
    }
    
    updateParticles(deltaTime) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life -= deltaTime;
            particle.alpha = particle.life / particle.maxLife;
            
            if (particle.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }
    
    updateBackground(deltaTime) {
        // 更新星星
        for (const star of this.stars) {
            star.y += star.speed;
            if (star.y > this.canvas.height) {
                star.y = -star.size;
                star.x = Math.random() * this.canvas.width;
            }
        }
        
        // 更新网格偏移
        this.gridOffset += 50 * deltaTime / 1000;
        if (this.gridOffset > 40) this.gridOffset = 0;
    }
    
    checkCollisions() {
        // 玩家子弹与敌机碰撞
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            if (bullet.isEnemy) continue;
            
            for (let j = this.enemies.length - 1; j >= 0; j--) {
                const enemy = this.enemies[j];
                if (this.isColliding(bullet, enemy)) {
                    this.bullets.splice(i, 1);
                    enemy.hp--;
                    
                    if (enemy.hp <= 0) {
                        this.enemies.splice(j, 1);
                        this.score += 100;
                        this.createExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
                        
                        // 概率掉落能量核心
                        if (Math.random() < 0.2) {
                            this.createPowerUp(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
                        }
                    }
                    break;
                }
            }
        }
        
        // 敌机子弹与玩家碰撞
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            if (!bullet.isEnemy) continue;
            
            if (this.isColliding(bullet, this.player) && !this.player.invulnerable) {
                this.bullets.splice(i, 1);
                this.playerHit();
            }
        }
        
        // 玩家与敌机碰撞
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            if (this.isColliding(this.player, enemy) && !this.player.invulnerable) {
                this.enemies.splice(i, 1);
                this.playerHit();
                this.createExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
            }
        }
        
        // 玩家与能量核心碰撞
        for (let i = this.powerUps.length - 1; i >= 0; i--) {
            const powerUp = this.powerUps[i];
            if (this.isColliding(this.player, powerUp)) {
                this.powerUps.splice(i, 1);
                this.player.weaponLevel = Math.min(5, this.player.weaponLevel + 1);
                this.score += 500;
                this.createCollectEffect(powerUp.x, powerUp.y);
            }
        }
    }
    
    isColliding(obj1, obj2) {
        return obj1.x < obj2.x + obj2.width &&
               obj1.x + obj1.width > obj2.x &&
               obj1.y < obj2.y + obj2.height &&
               obj1.y + obj1.height > obj2.y;
    }
    
    playerHit() {
        this.lives--;
        this.player.invulnerable = true;
        this.player.invulnerableTime = 2000; // 2秒无敌时间
        
        if (this.lives <= 0) {
            this.gameOver();
        }
    }
    
    createExplosion(x, y) {
        for (let i = 0; i < 15; i++) {
            const angle = (Math.PI * 2 * i) / 15;
            const speed = 2 + Math.random() * 3;
            
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                size: 2 + Math.random() * 3,
                color: Math.random() > 0.5 ? '#00ffff' : '#ff00ff',
                life: 1000,
                maxLife: 1000,
                alpha: 1
            });
        }
    }
    
    createPowerUp(x, y) {
        this.powerUps.push({
            x: x - 10,
            y: y - 10,
            width: 20,
            height: 20,
            speed: 2,
            rotation: 0,
            rotationSpeed: 0.1
        });
    }
    
    createCollectEffect(x, y) {
        for (let i = 0; i < 8; i++) {
            const angle = (Math.PI * 2 * i) / 8;
            this.particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * 1,
                vy: Math.sin(angle) * 1,
                size: 1,
                color: '#00ff00',
                life: 500,
                maxLife: 500,
                alpha: 1
            });
        }
    }
    
    updateGameLevel() {
        const newLevel = Math.floor(this.score / 1000) + 1;
        if (newLevel > this.level) {
            this.level = newLevel;
            this.enemySpawnInterval = Math.max(500, 2000 - (this.level - 1) * 200);
        }
    }
    
    gameOver() {
        this.gameRunning = false;
        document.getElementById('final-score').textContent = this.score;
        document.getElementById('game-over').classList.remove('hidden');
        document.getElementById('start-btn').disabled = false;
    }
    
    updateUI() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('lives').textContent = this.lives;
        document.getElementById('level').textContent = this.level;
    }
    
    render() {
        // 清空画布
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制背景
        this.drawBackground();
        
        // 绘制游戏对象
        this.drawPlayer();
        this.drawBullets();
        this.drawEnemies();
        this.drawPowerUps();
        this.drawParticles();
        
        // 更新UI
        this.updateUI();
    }
    
    drawBackground() {
        // 绘制星星
        for (const star of this.stars) {
            this.ctx.fillStyle = star.color;
            this.ctx.globalAlpha = 0.8;
            this.ctx.fillRect(star.x, star.y, star.size, star.size);
            this.ctx.globalAlpha = 1;
        }
        
        // 绘制网格
        this.ctx.strokeStyle = 'rgba(0, 255, 255, 0.1)';
        this.ctx.lineWidth = 1;
        this.ctx.globalAlpha = 0.5;
        
        for (let x = 0; x < this.canvas.width; x += 40) {
            this.ctx.beginPath();
            this.ctx.moveTo(x + this.gridOffset, 0);
            this.ctx.lineTo(x + this.gridOffset, this.canvas.height);
            this.ctx.stroke();
        }
        
        for (let y = 0; y < this.canvas.height; y += 40) {
            this.ctx.beginPath();
            this.ctx.moveTo(0, y + this.gridOffset);
            this.ctx.lineTo(this.canvas.width, y + this.gridOffset);
            this.ctx.stroke();
        }
        
        this.ctx.globalAlpha = 1;
    }
    
    drawPlayer() {
        const player = this.player;
        
        // 无敌效果闪烁
        if (this.player.invulnerable && Math.floor(Date.now() / 100) % 2) {
            return;
        }
        
        this.ctx.save();
        this.ctx.translate(player.x + player.width / 2, player.y + player.height / 2);
        
        // 绘制玩家飞机
        this.ctx.fillStyle = player.color;
        this.ctx.beginPath();
        this.ctx.moveTo(0, -player.height / 2);
        this.ctx.lineTo(-player.width / 2, player.height / 2);
        this.ctx.lineTo(0, player.height / 3);
        this.ctx.lineTo(player.width / 2, player.height / 2);
        this.ctx.closePath();
        this.ctx.fill();
        
        // 发光效果
        this.ctx.shadowColor = player.color;
        this.ctx.shadowBlur = 10;
        this.ctx.fill();
        
        this.ctx.restore();
    }
    
    drawBullets() {
        for (const bullet of this.bullets) {
            this.ctx.fillStyle = bullet.color;
            this.ctx.shadowColor = bullet.color;
            this.ctx.shadowBlur = 5;
            this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        }
        this.ctx.shadowBlur = 0;
    }
    
    drawEnemies() {
        for (const enemy of this.enemies) {
            this.ctx.fillStyle = enemy.color;
            this.ctx.shadowColor = enemy.color;
            this.ctx.shadowBlur = 8;
            
            this.ctx.save();
            this.ctx.translate(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
            
            // 绘制敌机（菱形）
            this.ctx.beginPath();
            this.ctx.moveTo(0, -enemy.height / 2);
            this.ctx.lineTo(enemy.width / 2, 0);
            this.ctx.lineTo(0, enemy.height / 2);
            this.ctx.lineTo(-enemy.width / 2, 0);
            this.ctx.closePath();
            this.ctx.fill();
            
            this.ctx.restore();
        }
        this.ctx.shadowBlur = 0;
    }
    
    drawPowerUps() {
        for (const powerUp of this.powerUps) {
            this.ctx.save();
            this.ctx.translate(powerUp.x + powerUp.width / 2, powerUp.y + powerUp.height / 2);
            this.ctx.rotate(powerUp.rotation);
            
            // 绘制能量核心
            this.ctx.fillStyle = '#00ff00';
            this.ctx.shadowColor = '#00ff00';
            this.ctx.shadowBlur = 10;
            
            this.ctx.beginPath();
            this.ctx.moveTo(0, -powerUp.height / 2);
            this.ctx.lineTo(powerUp.width / 2, 0);
            this.ctx.lineTo(0, powerUp.height / 2);
            this.ctx.lineTo(-powerUp.width / 2, 0);
            this.ctx.closePath();
            this.ctx.fill();
            
            this.ctx.restore();
        }
        this.ctx.shadowBlur = 0;
    }
    
    drawParticles() {
        for (const particle of this.particles) {
            this.ctx.fillStyle = particle.color;
            this.ctx.globalAlpha = particle.alpha;
            this.ctx.fillRect(particle.x - particle.size / 2, particle.y - particle.size / 2, particle.size, particle.size);
        }
        this.ctx.globalAlpha = 1;
    }
    
    gameLoop(currentTime = 0) {
        if (!this.gameRunning) return;
        
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        this.update(deltaTime);
        this.render();
        
        requestAnimationFrame((time) => this.gameLoop(time));
    }
}

// 页面加载完成后初始化游戏
window.addEventListener('DOMContentLoaded', () => {
    new CyberShooter();
});