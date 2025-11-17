class CyberpunkShooter {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        
        this.gameState = 'start'; // start, playing, paused, gameOver
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
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.createPlayer();
        this.updateUI();
        this.gameLoop();
    }
    
    setupEventListeners() {
        // 键盘事件
        document.addEventListener('keydown', (e) => {
            this.keys[e.code] = true;
            if (e.code === 'Space') {
                e.preventDefault();
                if (this.gameState === 'playing') {
                    this.playerShoot();
                }
            }
        });
        
        document.addEventListener('keyup', (e) => {
            this.keys[e.code] = false;
        });
        
        // 游戏控制按钮
        document.getElementById('start-btn').addEventListener('click', () => {
            this.startGame();
        });
        
        document.getElementById('pause-btn').addEventListener('click', () => {
            this.togglePause();
        });
        
        document.getElementById('restart-btn').addEventListener('click', () => {
            this.restartGame();
        });
        
        document.getElementById('start-game-btn').addEventListener('click', () => {
            this.startGame();
        });
        
        document.getElementById('play-again-btn').addEventListener('click', () => {
            this.restartGame();
        });
    }
    
    createPlayer() {
        this.player = {
            x: this.width / 2,
            y: this.height - 80,
            width: 40,
            height: 40,
            speed: 5,
            color: '#00ffff',
            health: 100,
            maxHealth: 100,
            lastShot: 0,
            shootCooldown: 200
        };
    }
    
    startGame() {
        this.gameState = 'playing';
        document.getElementById('start-screen').classList.add('hidden');
        document.getElementById('game-over-screen').classList.add('hidden');
        this.resetGame();
    }
    
    togglePause() {
        if (this.gameState === 'playing') {
            this.gameState = 'paused';
        } else if (this.gameState === 'paused') {
            this.gameState = 'playing';
        }
    }
    
    restartGame() {
        this.resetGame();
        this.gameState = 'playing';
        document.getElementById('start-screen').classList.add('hidden');
        document.getElementById('game-over-screen').classList.add('hidden');
    }
    
    resetGame() {
        this.score = 0;
        this.lives = 3;
        this.level = 1;
        this.bullets = [];
        this.enemies = [];
        this.particles = [];
        this.powerUps = [];
        this.createPlayer();
        this.updateUI();
    }
    
    gameOver() {
        this.gameState = 'gameOver';
        document.getElementById('final-score').textContent = this.score;
        document.getElementById('game-over-screen').classList.remove('hidden');
    }
    
    updateUI() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('lives').textContent = this.lives;
        document.getElementById('level').textContent = this.level;
    }
    
    update(deltaTime) {
        if (this.gameState !== 'playing') return;
        
        this.updatePlayer(deltaTime);
        this.updateBullets(deltaTime);
        this.updateEnemies(deltaTime);
        this.updateParticles(deltaTime);
        this.updatePowerUps(deltaTime);
        this.checkCollisions();
        this.spawnEnemies(deltaTime);
    }
    
    updatePlayer(deltaTime) {
        const player = this.player;
        
        // 移动控制
        if (this.keys['ArrowLeft'] || this.keys['KeyA']) {
            player.x = Math.max(0, player.x - player.speed);
        }
        if (this.keys['ArrowRight'] || this.keys['KeyD']) {
            player.x = Math.min(this.width - player.width, player.x + player.speed);
        }
        if (this.keys['ArrowUp'] || this.keys['KeyW']) {
            player.y = Math.max(0, player.y - player.speed);
        }
        if (this.keys['ArrowDown'] || this.keys['KeyS']) {
            player.y = Math.min(this.height - player.height, player.y + player.speed);
        }
    }
    
    playerShoot() {
        const now = Date.now();
        if (now - this.player.lastShot < this.player.shootCooldown) return;
        
        this.bullets.push({
            x: this.player.x + this.player.width / 2,
            y: this.player.y,
            width: 4,
            height: 15,
            speed: 8,
            color: '#00ffff',
            damage: 25
        });
        
        this.player.lastShot = now;
        this.createMuzzleFlash(this.player.x + this.player.width / 2, this.player.y);
    }
    
    updateBullets(deltaTime) {
        this.bullets = this.bullets.filter(bullet => {
            bullet.y -= bullet.speed;
            return bullet.y > -bullet.height;
        });
    }
    
    spawnEnemies(deltaTime) {
        const spawnRate = Math.max(0.01, 0.03 - this.level * 0.002);
        
        if (Math.random() < spawnRate) {
            this.enemies.push({
                x: Math.random() * (this.width - 30),
                y: -30,
                width: 30,
                height: 30,
                speed: 1 + Math.random() * 2 + this.level * 0.3,
                color: '#ff00ff',
                health: 50 + this.level * 10,
                maxHealth: 50 + this.level * 10,
                lastShot: 0,
                shootCooldown: 1000 + Math.random() * 1000
            });
        }
    }
    
    updateEnemies(deltaTime) {
        this.enemies = this.enemies.filter(enemy => {
            enemy.y += enemy.speed;
            
            // 敌机射击
            const now = Date.now();
            if (now - enemy.lastShot > enemy.shootCooldown) {
                this.enemyShoot(enemy);
                enemy.lastShot = now;
            }
            
            return enemy.y < this.height + enemy.height;
        });
    }
    
    enemyShoot(enemy) {
        this.bullets.push({
            x: enemy.x + enemy.width / 2,
            y: enemy.y + enemy.height,
            width: 3,
            height: 10,
            speed: -4,
            color: '#ff00ff',
            damage: 20,
            isEnemyBullet: true
        });
    }
    
    updateParticles(deltaTime) {
        this.particles = this.particles.filter(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life -= deltaTime;
            particle.alpha = particle.life / particle.maxLife;
            return particle.life > 0;
        });
    }
    
    updatePowerUps(deltaTime) {
        this.powerUps = this.powerUps.filter(powerUp => {
            powerUp.y += powerUp.speed;
            return powerUp.y < this.height + powerUp.height;
        });
    }
    
    checkCollisions() {
        // 玩家子弹与敌机碰撞
        this.bullets.forEach((bullet, bulletIndex) => {
            if (bullet.isEnemyBullet) return;
            
            this.enemies.forEach((enemy, enemyIndex) => {
                if (this.isColliding(bullet, enemy)) {
                    enemy.health -= bullet.damage;
                    this.createExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
                    this.bullets.splice(bulletIndex, 1);
                    
                    if (enemy.health <= 0) {
                        this.enemies.splice(enemyIndex, 1);
                        this.score += 100 * this.level;
                        this.updateUI();
                    }
                }
            });
        });
        
        // 敌机子弹与玩家碰撞
        this.bullets.forEach((bullet, bulletIndex) => {
            if (!bullet.isEnemyBullet) return;
            
            if (this.isColliding(bullet, this.player)) {
                this.player.health -= bullet.damage;
                this.bullets.splice(bulletIndex, 1);
                this.createPlayerHitEffect();
                
                if (this.player.health <= 0) {
                    this.lives--;
                    if (this.lives <= 0) {
                        this.gameOver();
                    } else {
                        this.player.health = this.player.maxHealth;
                    }
                    this.updateUI();
                }
            }
        });
        
        // 敌机与玩家碰撞
        this.enemies.forEach((enemy, enemyIndex) => {
            if (this.isColliding(enemy, this.player)) {
                this.enemies.splice(enemyIndex, 1);
                this.lives--;
                this.createExplosion(enemy.x + enemy.width / 2, enemy.y + enemy.height / 2);
                
                if (this.lives <= 0) {
                    this.gameOver();
                }
                this.updateUI();
            }
        });
    }
    
    isColliding(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }
    
    createExplosion(x, y) {
        for (let i = 0; i < 15; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 8,
                vy: (Math.random() - 0.5) * 8,
                life: 500,
                maxLife: 500,
                alpha: 1,
                color: Math.random() > 0.5 ? '#ff00ff' : '#00ffff',
                size: Math.random() * 4 + 2
            });
        }
    }
    
    createMuzzleFlash(x, y) {
        for (let i = 0; i < 5; i++) {
            this.particles.push({
                x: x,
                y: y,
                vx: (Math.random() - 0.5) * 2,
                vy: Math.random() * -2,
                life: 100,
                maxLife: 100,
                alpha: 1,
                color: '#ffff00',
                size: Math.random() * 2 + 1
            });
        }
    }
    
    createPlayerHitEffect() {
        for (let i = 0; i < 10; i++) {
            this.particles.push({
                x: this.player.x + this.player.width / 2,
                y: this.player.y + this.player.height / 2,
                vx: (Math.random() - 0.5) * 6,
                vy: (Math.random() - 0.5) * 6,
                life: 300,
                maxLife: 300,
                alpha: 1,
                color: '#ff0000',
                size: Math.random() * 3 + 2
            });
        }
    }
    
    draw() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        if (this.gameState === 'playing' || this.gameState === 'paused') {
            this.drawPlayer();
            this.drawBullets();
            this.drawEnemies();
            this.drawParticles();
            this.drawPowerUps();
        }
    }
    
    drawPlayer() {
        const player = this.player;
        
        // 绘制玩家飞机主体
        this.ctx.fillStyle = player.color;
        this.ctx.beginPath();
        this.ctx.moveTo(player.x + player.width / 2, player.y);
        this.ctx.lineTo(player.x, player.y + player.height);
        this.ctx.lineTo(player.x + player.width / 2, player.y + player.height - 10);
        this.ctx.lineTo(player.x + player.width, player.y + player.height);
        this.ctx.closePath();
        this.ctx.fill();
        
        // 绘制发光效果
        this.ctx.shadowColor = player.color;
        this.ctx.shadowBlur = 20;
        this.ctx.fill();
        this.ctx.shadowBlur = 0;
        
        // 绘制生命值条
        const healthBarWidth = 40;
        const healthBarHeight = 4;
        const healthPercentage = player.health / player.maxHealth;
        
        this.ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
        this.ctx.fillRect(player.x, player.y - 10, healthBarWidth, healthBarHeight);
        
        this.ctx.fillStyle = '#00ff00';
        this.ctx.fillRect(player.x, player.y - 10, healthBarWidth * healthPercentage, healthBarHeight);
    }
    
    drawBullets() {
        this.bullets.forEach(bullet => {
            this.ctx.fillStyle = bullet.color;
            this.ctx.shadowColor = bullet.color;
            this.ctx.shadowBlur = 10;
            this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
            this.ctx.shadowBlur = 0;
        });
    }
    
    drawEnemies() {
        this.enemies.forEach(enemy => {
            // 绘制敌机
            this.ctx.fillStyle = enemy.color;
            this.ctx.beginPath();
            this.ctx.moveTo(enemy.x + enemy.width / 2, enemy.y + enemy.height);
            this.ctx.lineTo(enemy.x, enemy.y);
            this.ctx.lineTo(enemy.x + enemy.width / 2, enemy.y + 10);
            this.ctx.lineTo(enemy.x + enemy.width, enemy.y);
            this.ctx.closePath();
            this.ctx.fill();
            
            // 发光效果
            this.ctx.shadowColor = enemy.color;
            this.ctx.shadowBlur = 15;
            this.ctx.fill();
            this.ctx.shadowBlur = 0;
            
            // 绘制生命值条
            const healthBarWidth = 30;
            const healthBarHeight = 3;
            const healthPercentage = enemy.health / enemy.maxHealth;
            
            this.ctx.fillStyle = 'rgba(255, 0, 0, 0.5)';
            this.ctx.fillRect(enemy.x + (enemy.width - healthBarWidth) / 2, enemy.y - 8, healthBarWidth, healthBarHeight);
            
            this.ctx.fillStyle = '#ff0000';
            this.ctx.fillRect(enemy.x + (enemy.width - healthBarWidth) / 2, enemy.y - 8, healthBarWidth * healthPercentage, healthBarHeight);
        });
    }
    
    drawParticles() {
        this.particles.forEach(particle => {
            this.ctx.save();
            this.ctx.globalAlpha = particle.alpha;
            this.ctx.fillStyle = particle.color;
            this.ctx.shadowColor = particle.color;
            this.ctx.shadowBlur = 5;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.restore();
        });
    }
    
    drawPowerUps() {
        this.powerUps.forEach(powerUp => {
            this.ctx.fillStyle = powerUp.color;
            this.ctx.shadowColor = powerUp.color;
            this.ctx.shadowBlur = 10;
            this.ctx.fillRect(powerUp.x, powerUp.y, powerUp.width, powerUp.height);
            this.ctx.shadowBlur = 0;
        });
    }
    
    gameLoop(currentTime = 0) {
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        this.update(deltaTime);
        this.draw();
        
        requestAnimationFrame((time) => this.gameLoop(time));
    }
}

// 页面加载完成后初始化游戏
window.addEventListener('DOMContentLoaded', () => {
    new CyberpunkShooter();
});