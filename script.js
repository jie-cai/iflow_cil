class Gomoku {
    constructor() {
        this.boardSize = 15;
        this.cellSize = 32;
        this.board = [];
        this.currentPlayer = 'black';
        this.gameOver = false;
        this.canvas = document.getElementById('game-board');
        this.ctx = this.canvas.getContext('2d');
        this.moveHistory = []; // 记录下棋历史，用于悔棋功能
        
        this.initBoard();
        this.drawBoard();
        this.bindEvents();
        this.updatePlayerInfo();
    }
    
    initBoard() {
        for (let i = 0; i < this.boardSize; i++) {
            this.board[i] = [];
            for (let j = 0; j < this.boardSize; j++) {
                this.board[i][j] = null;
            }
        }
    }
    
    drawBoard() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制棋盘背景
        this.ctx.fillStyle = '#dcb35c';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // 绘制网格线
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 1;
        
        for (let i = 0; i < this.boardSize; i++) {
            // 垂直线
            this.ctx.beginPath();
            this.ctx.moveTo(this.cellSize/2 + i * this.cellSize, this.cellSize/2);
            this.ctx.lineTo(this.cellSize/2 + i * this.cellSize, this.canvas.height - this.cellSize/2);
            this.ctx.stroke();
            
            // 水平线
            this.ctx.beginPath();
            this.ctx.moveTo(this.cellSize/2, this.cellSize/2 + i * this.cellSize);
            this.ctx.lineTo(this.canvas.width - this.cellSize/2, this.cellSize/2 + i * this.cellSize);
            this.ctx.stroke();
        }
        
        // 绘制已下的棋子
        for (let i = 0; i < this.boardSize; i++) {
            for (let j = 0; j < this.boardSize; j++) {
                if (this.board[i][j]) {
                    this.drawChessman(i, j, this.board[i][j]);
                }
            }
        }
    }
    
    drawChessman(x, y, color) {
        const centerX = this.cellSize/2 + x * this.cellSize;
        const centerY = this.cellSize/2 + y * this.cellSize;
        const radius = this.cellSize/2 - 2;
        
        // 绘制棋子
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        
        // 设置渐变效果
        const gradient = this.ctx.createRadialGradient(
            centerX - radius/3, centerY - radius/3, radius/8,
            centerX, centerY, radius
        );
        
        if (color === 'black') {
            gradient.addColorStop(0, '#666');
            gradient.addColorStop(1, '#000');
        } else {
            gradient.addColorStop(0, '#fff');
            gradient.addColorStop(1, '#ccc');
        }
        
        this.ctx.fillStyle = gradient;
        this.ctx.fill();
        this.ctx.strokeStyle = '#000';
        this.ctx.stroke();
    }
    
    bindEvents() {
        this.canvas.addEventListener('click', (e) => {
            if (this.gameOver) return;
            
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            const gridX = Math.round((x - this.cellSize/2) / this.cellSize);
            const gridY = Math.round((y - this.cellSize/2) / this.cellSize);
            
            if (gridX >= 0 && gridX < this.boardSize && gridY >= 0 && gridY < this.boardSize) {
                this.playChess(gridX, gridY);
            }
        });
        
        document.getElementById('restart-btn').addEventListener('click', () => {
            this.restart();
        });
        
        document.getElementById('undo-btn').addEventListener('click', () => {
            this.undo();
        });
    }
    
    playChess(x, y) {
        if (this.board[x][y] !== null) return;
        
        // 记录下棋历史
        this.moveHistory.push({x: x, y: y, player: this.currentPlayer});
        
        this.board[x][y] = this.currentPlayer;
        this.drawBoard();
        
        if (this.checkWin(x, y)) {
            this.gameOver = true;
            setTimeout(() => {
                alert(`恭喜！${this.currentPlayer === 'black' ? '黑棋' : '白棋'}获胜！`);
            }, 100);
            return;
        }
        
        this.currentPlayer = this.currentPlayer === 'black' ? 'white' : 'black';
        this.updatePlayerInfo();
    }
    
    undo() {
        // 如果游戏结束或没有下棋历史，则不能悔棋
        if (this.gameOver || this.moveHistory.length === 0) return;
        
        // 获取最后一步棋的信息
        const lastMove = this.moveHistory.pop();
        
        // 从棋盘上移除这步棋
        this.board[lastMove.x][lastMove.y] = null;
        
        // 切换当前玩家（回到上一步的玩家）
        this.currentPlayer = lastMove.player;
        
        // 重新绘制棋盘
        this.drawBoard();
        
        // 更新玩家信息显示
        this.updatePlayerInfo();
    }
    
    checkWin(x, y) {
        const directions = [
            [1, 0],   // 水平
            [0, 1],   // 垂直
            [1, 1],   // 对角线
            [1, -1]   // 反对角线
        ];
        
        const color = this.board[x][y];
        if (!color) return false;
        
        for (let [dx, dy] of directions) {
            let count = 1;
            
            // 正方向计数
            for (let i = 1; i < 5; i++) {
                const nx = x + dx * i;
                const ny = y + dy * i;
                if (nx >= 0 && nx < this.boardSize && ny >= 0 && ny < this.boardSize && this.board[nx][ny] === color) {
                    count++;
                } else {
                    break;
                }
            }
            
            // 反方向计数
            for (let i = 1; i < 5; i++) {
                const nx = x - dx * i;
                const ny = y - dy * i;
                if (nx >= 0 && nx < this.boardSize && ny >= 0 && ny < this.boardSize && this.board[nx][ny] === color) {
                    count++;
                } else {
                    break;
                }
            }
            
            if (count >= 5) return true;
        }
        
        return false;
    }
    
    updatePlayerInfo() {
        document.getElementById('current-player').textContent = this.currentPlayer === 'black' ? '黑棋' : '白棋';
    }
    
    restart() {
        this.initBoard();
        this.currentPlayer = 'black';
        this.gameOver = false;
        this.moveHistory = []; // 清空悔棋历史
        this.drawBoard();
        this.updatePlayerInfo();
    }
}

// 页面加载完成后初始化游戏
window.addEventListener('DOMContentLoaded', () => {
    new Gomoku();
});