class CyberWarGame {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.resizeCanvas();
        
        this.gameState = 'start'; // start, playing, gameOver
        this.score = 0;
        this.lives = 3;
        
        this.player = null;
        this.bullets = [];
        this.enemies = [];
        this.particles = [];
        this.powerUps = [];
        
        this.keys = {};
        this.lastTime = 0;
        this.enemySpawnTimer = 0;
        this.powerUpSpawnTimer = 0;
        
        this.init();
        this.bindEvents();
        this.gameLoop();
    }
    
    init() {
        this.player = new Player(this.canvas.width / 2, this.canvas.height - 100);
        this.updateUI();
    }
    
    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
    }
    
    bindEvents() {
        window.addEventListener('resize', () => {
            this.resizeCanvas();
        });
        
        window.addEventListener('keydown', (e) => {
            this.keys[e.key.toLowerCase()] = true;
            
            if (e.key === ' ') {
                e.preventDefault();
                if (this.gameState === 'playing') {
                    this.player.shoot(this.bullets);
                }
            }
        });
        
        window.addEventListener('keyup', (e) => {
            this.keys[e.key.toLowerCase()] = false;
        });
        
        document.getElementById('start-btn').addEventListener('click', () => {
            this.startGame();
        });
        
        document.getElementById('restart-btn').addEventListener('click', () => {
            this.restartGame();
        });
    }
    
    startGame() {
        this.gameState = 'playing';
        document.getElementById('start-screen').style.display = 'none';
        this.resetGame();
    }
    
    restartGame() {
        this.gameState = 'playing';
        document.getElementById('game-over').style.display = 'none';
        this.resetGame();
    }
    
    resetGame() {
        this.score = 0;
        this.lives = 3;
        this.bullets = [];
        this.enemies = [];
        this.particles = [];
        this.powerUps = [];
        this.player.x = this.canvas.width / 2;
        this.player.y = this.canvas.height - 100;
        this.updateUI();
    }
    
    updateUI() {
        document.getElementById('score').textContent = this.score;
        document.getElementById('lives').textContent = this.lives;
        document.getElementById('final-score').textContent = this.score;
    }
    
    gameLoop(currentTime = 0) {
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        this.update(deltaTime);
        this.render();
        
        requestAnimationFrame((time) => this.gameLoop(time));
    }
    
    update(deltaTime) {
        if (this.gameState !== 'playing') return;
        
        this.player.update(this.keys, this.canvas);
        this.updateBullets();
        this.updateEnemies(deltaTime);
        this.updateParticles(deltaTime);
        this.updatePowerUps();
        this.checkCollisions();
        this.spawnEnemies(deltaTime);
        this.spawnPowerUps(deltaTime);
    }
    
    updateBullets() {
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            bullet.update();
            
            if (bullet.y < -10 || bullet.y > this.canvas.height + 10) {
                this.bullets.splice(i, 1);
            }
        }
    }
    
    updateEnemies(deltaTime) {
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            enemy.update(deltaTime);
            
            if (enemy.y > this.canvas.height + 50) {
                this.enemies.splice(i, 1);
            }
        }
    }
    
    updateParticles(deltaTime) {
        for (let i = this.particles.length - 1; i >= 0; i--) {
            const particle = this.particles[i];
            particle.update(deltaTime);
            
            if (particle.life <= 0) {
                this.particles.splice(i, 1);
            }
        }
    }
    
    updatePowerUps() {
        for (let i = this.powerUps.length - 1; i >= 0; i--) {
            const powerUp = this.powerUps[i];
            powerUp.update();
            
            if (powerUp.y > this.canvas.height + 50) {
                this.powerUps.splice(i, 1);
            }
        }
    }
    
    spawnEnemies(deltaTime) {
        this.enemySpawnTimer += deltaTime;
        
        if (this.enemySpawnTimer > 1000) {
            this.enemySpawnTimer = 0;
            const x = Math.random() * (this.canvas.width - 40) + 20;
            this.enemies.push(new Enemy(x, -30));
        }
    }
    
    spawnPowerUps(deltaTime) {
        this.powerUpSpawnTimer += deltaTime;
        
        if (this.powerUpSpawnTimer > 15000) {
            this.powerUpSpawnTimer = 0;
            const x = Math.random() * (this.canvas.width - 30) + 15;
            this.powerUps.push(new PowerUp(x, -30));
        }
    }
    
    checkCollisions() {
        // 检查子弹击中敌机
        for (let i = this.bullets.length - 1; i >= 0; i--) {
            const bullet = this.bullets[i];
            
            for (let j = this.enemies.length - 1; j >= 0; j--) {
                const enemy = this.enemies[j];
                
                if (this.isColliding(bullet, enemy)) {
                    this.createExplosion(enemy.x, enemy.y, '#ff0080');
                    this.enemies.splice(j, 1);
                    this.bullets.splice(i, 1);
                    this.score += 100;
                    this.updateUI();
                    break;
                }
            }
        }
        
        // 检查玩家撞到敌机
        for (let i = this.enemies.length - 1; i >= 0; i--) {
            const enemy = this.enemies[i];
            
            if (this.isColliding(this.player, enemy)) {
                this.createExplosion(enemy.x, enemy.y, '#00ffff');
                this.createExplosion(this.player.x, this.player.y, '#ff0080');
                this.enemies.splice(i, 1);
                this.lives--;
                this.updateUI();
                
                if (this.lives <= 0) {
                    this.gameOver();
                }
            }
        }
        
        // 检查玩家吃到道具
        for (let i = this.powerUps.length - 1; i >= 0; i--) {
            const powerUp = this.powerUps[i];
            
            if (this.isColliding(this.player, powerUp)) {
                this.player.activatePowerUp();
                this.createExplosion(powerUp.x, powerUp.y, '#00ff00');
                this.powerUps.splice(i, 1);
            }
        }
    }
    
    isColliding(obj1, obj2) {
        const dx = obj1.x - obj2.x;
        const dy = obj1.y - obj2.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        return distance < (obj1.size + obj2.size) / 2;
    }
    
    createExplosion(x, y, color) {
        for (let i = 0; i < 20; i++) {
            this.particles.push(new Particle(x, y, color));
        }
    }
    
    gameOver() {
        this.gameState = 'gameOver';
        document.getElementById('game-over').style.display = 'block';
    }
    
    render() {
        this.ctx.fillStyle = 'rgba(10, 10, 10, 0.1)';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.player.render(this.ctx);
        this.bullets.forEach(bullet => bullet.render(this.ctx));
        this.enemies.forEach(enemy => enemy.render(this.ctx));
        this.particles.forEach(particle => particle.render(this.ctx));
        this.powerUps.forEach(powerUp => powerUp.render(this.ctx));
    }
}

class Player {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = 30;
        this.speed = 5;
        this.powerUpActive = false;
        this.powerUpTimer = 0;
    }
    
    update(keys, canvas) {
        if (keys['arrowleft'] || keys['a']) {
            this.x = Math.max(this.size / 2, this.x - this.speed);
        }
        if (keys['arrowright'] || keys['d']) {
            this.x = Math.min(canvas.width - this.size / 2, this.x + this.speed);
        }
        if (keys['arrowup'] || keys['w']) {
            this.y = Math.max(this.size / 2, this.y - this.speed);
        }
        if (keys['arrowdown'] || keys['s']) {
            this.y = Math.min(canvas.height - this.size / 2, this.y + this.speed);
        }
        
        if (this.powerUpActive) {
            this.powerUpTimer--;
            if (this.powerUpTimer <= 0) {
                this.powerUpActive = false;
            }
        }
    }
    
    shoot(bullets) {
        const fireRate = this.powerUpActive ? 5 : 10;
        
        if (Math.random() * 10 < fireRate) {
            bullets.push(new Bullet(this.x, this.y - this.size / 2, -10, '#00ffff'));
            
            if (this.powerUpActive) {
                bullets.push(new Bullet(this.x - 10, this.y - this.size / 2, -10, '#00ffff'));
                bullets.push(new Bullet(this.x + 10, this.y - this.size / 2, -10, '#00ffff'));
            }
        }
    }
    
    activatePowerUp() {
        this.powerUpActive = true;
        this.powerUpTimer = 300;
    }
    
    render(ctx) {
        ctx.save();
        
        // 玩家飞船主体
        ctx.fillStyle = this.powerUpActive ? '#00ff00' : '#00ffff';
        ctx.shadowBlur = 20;
        ctx.shadowColor = this.powerUpActive ? '#00ff00' : '#00ffff';
        
        ctx.beginPath();
        ctx.moveTo(this.x, this.y - this.size / 2);
        ctx.lineTo(this.x - this.size / 2, this.y + this.size / 2);
        ctx.lineTo(this.x, this.y + this.size / 3);
        ctx.lineTo(this.x + this.size / 2, this.y + this.size / 2);
        ctx.closePath();
        ctx.fill();
        
        // 引擎光效
        ctx.fillStyle = '#ff0080';
        ctx.shadowColor = '#ff0080';
        ctx.beginPath();
        ctx.arc(this.x - this.size / 4, this.y + this.size / 2, 3, 0, Math.PI * 2);
        ctx.arc(this.x + this.size / 4, this.y + this.size / 2, 3, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
    }
}

class Bullet {
    constructor(x, y, speed, color) {
        this.x = x;
        this.y = y;
        this.speed = speed;
        this.color = color;
        this.size = 4;
    }
    
    update() {
        this.y += this.speed;
    }
    
    render(ctx) {
        ctx.save();
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

class Enemy {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = 25;
        this.speed = 1 + Math.random() * 2;
        this.color = '#ff0080';
        this.wobble = Math.random() * Math.PI * 2;
        this.wobbleSpeed = 0.05 + Math.random() * 0.05;
    }
    
    update(deltaTime) {
        this.y += this.speed;
        this.wobble += this.wobbleSpeed;
        this.x += Math.sin(this.wobble) * 2;
    }
    
    render(ctx) {
        ctx.save();
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 15;
        ctx.shadowColor = this.color;
        
        ctx.beginPath();
        ctx.moveTo(this.x, this.y + this.size / 2);
        ctx.lineTo(this.x - this.size / 2, this.y - this.size / 2);
        ctx.lineTo(this.x, this.y);
        ctx.lineTo(this.x + this.size / 2, this.y - this.size / 2);
        ctx.closePath();
        ctx.fill();
        
        ctx.restore();
    }
}

class Particle {
    constructor(x, y, color) {
        this.x = x;
        this.y = y;
        this.vx = (Math.random() - 0.5) * 8;
        this.vy = (Math.random() - 0.5) * 8;
        this.size = Math.random() * 4 + 2;
        this.life = 1;
        this.decay = 0.02;
        this.color = color;
    }
    
    update(deltaTime) {
        this.x += this.vx;
        this.y += this.vy;
        this.vx *= 0.98;
        this.vy *= 0.98;
        this.life -= this.decay;
        this.size *= 0.98;
    }
    
    render(ctx) {
        ctx.save();
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;
        ctx.shadowBlur = 10;
        ctx.shadowColor = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

class PowerUp {
    constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = 20;
        this.speed = 2;
        this.rotation = 0;
    }
    
    update() {
        this.y += this.speed;
        this.rotation += 0.1;
    }
    
    render(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        ctx.strokeStyle = '#00ff00';
        ctx.lineWidth = 2;
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#00ff00';
        
        ctx.beginPath();
        for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            const x = Math.cos(angle) * this.size / 2;
            const y = Math.sin(angle) * this.size / 2;
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.closePath();
        ctx.stroke();
        
        ctx.restore();
    }
}

window.addEventListener('DOMContentLoaded', () => {
    new CyberWarGame();
});