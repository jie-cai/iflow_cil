class Gomoku {
    constructor() {
        this.boardSize = 15;
        this.cellSize = 32;
        this.board = [];
        this.currentPlayer = 'black';
        this.gameOver = false;
        this.moveHistory = []; // 存储落子历史
        this.hintPosition = null; // 存储提示位置
        this.canvas = document.getElementById('game-board');
        this.ctx = this.canvas.getContext('2d');
        
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
        
        // 绘制提示位置
        if (this.hintPosition) {
            this.drawHint(this.hintPosition.x, this.hintPosition.y);
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
    
    drawHint(x, y) {
        const centerX = this.cellSize/2 + x * this.cellSize;
        const centerY = this.cellSize/2 + y * this.cellSize;
        const radius = this.cellSize/2 - 2;
        
        // 绘制半透明提示棋子
        this.ctx.beginPath();
        this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        
        // 设置渐变效果
        const gradient = this.ctx.createRadialGradient(
            centerX - radius/3, centerY - radius/3, radius/8,
            centerX, centerY, radius
        );
        
        if (this.currentPlayer === 'black') {
            gradient.addColorStop(0, 'rgba(102, 102, 102, 0.5)');
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0.5)');
        } else {
            gradient.addColorStop(0, 'rgba(255, 255, 255, 0.5)');
            gradient.addColorStop(1, 'rgba(204, 204, 204, 0.5)');
        }
        
        this.ctx.fillStyle = gradient;
        this.ctx.fill();
        this.ctx.strokeStyle = 'rgba(255, 0, 0, 0.8)';
        this.ctx.lineWidth = 2;
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
            this.undoMove();
        });
        
        document.getElementById('hint-btn').addEventListener('click', () => {
            this.showHint();
        });
    }
    
    playChess(x, y) {
        if (this.board[x][y] !== null) return;
        
        this.board[x][y] = this.currentPlayer;
        this.moveHistory.push({x, y, player: this.currentPlayer});
        this.hintPosition = null; // 清除提示
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
    
    undoMove() {
        if (this.moveHistory.length === 0 || this.gameOver) return;
        
        const lastMove = this.moveHistory.pop();
        this.board[lastMove.x][lastMove.y] = null;
        this.currentPlayer = lastMove.player;
        this.hintPosition = null;
        this.drawBoard();
        this.updatePlayerInfo();
    }
    
    showHint() {
        if (this.gameOver) return;
        
        // 简单的提示逻辑：找到一个可以形成连线的好位置
        const bestMove = this.findBestMove();
        if (bestMove) {
            this.hintPosition = bestMove;
            this.drawBoard();
            
            // 3秒后自动清除提示
            setTimeout(() => {
                this.hintPosition = null;
                this.drawBoard();
            }, 3000);
        }
    }
    
    findBestMove() {
        // 优先级：1.自己能赢 2.阻止对手赢 3.形成长连线 4.随机位置
        
        // 检查自己是否能赢
        for (let i = 0; i < this.boardSize; i++) {
            for (let j = 0; j < this.boardSize; j++) {
                if (this.board[i][j] === null) {
                    this.board[i][j] = this.currentPlayer;
                    if (this.checkWin(i, j)) {
                        this.board[i][j] = null;
                        return {x: i, y: j};
                    }
                    this.board[i][j] = null;
                }
            }
        }
        
        // 检查是否需要阻止对手赢
        const opponent = this.currentPlayer === 'black' ? 'white' : 'black';
        for (let i = 0; i < this.boardSize; i++) {
            for (let j = 0; j < this.boardSize; j++) {
                if (this.board[i][j] === null) {
                    this.board[i][j] = opponent;
                    if (this.checkWin(i, j)) {
                        this.board[i][j] = null;
                        return {x: i, y: j};
                    }
                    this.board[i][j] = null;
                }
            }
        }
        
        // 寻找能形成长连线的好位置
        let bestScore = -1;
        let bestMove = null;
        
        for (let i = 0; i < this.boardSize; i++) {
            for (let j = 0; j < this.boardSize; j++) {
                if (this.board[i][j] === null) {
                    const score = this.evaluatePosition(i, j, this.currentPlayer);
                    if (score > bestScore) {
                        bestScore = score;
                        bestMove = {x: i, y: j};
                    }
                }
            }
        }
        
        return bestMove;
    }
    
    evaluatePosition(x, y, player) {
        let score = 0;
        const directions = [[1, 0], [0, 1], [1, 1], [1, -1]];
        
        for (let [dx, dy] of directions) {
            let count = 1;
            let openEnds = 0;
            
            // 正方向
            for (let i = 1; i < 5; i++) {
                const nx = x + dx * i;
                const ny = y + dy * i;
                if (nx >= 0 && nx < this.boardSize && ny >= 0 && ny < this.boardSize) {
                    if (this.board[nx][ny] === player) {
                        count++;
                    } else if (this.board[nx][ny] === null) {
                        openEnds++;
                        break;
                    } else {
                        break;
                    }
                }
            }
            
            // 反方向
            for (let i = 1; i < 5; i++) {
                const nx = x - dx * i;
                const ny = y - dy * i;
                if (nx >= 0 && nx < this.boardSize && ny >= 0 && ny < this.boardSize) {
                    if (this.board[nx][ny] === player) {
                        count++;
                    } else if (this.board[nx][ny] === null) {
                        openEnds++;
                        break;
                    } else {
                        break;
                    }
                }
            }
            
            // 根据连线长度和开放端计算分数
            if (count >= 4) score += 1000;
            else if (count === 3 && openEnds === 2) score += 500;
            else if (count === 3 && openEnds === 1) score += 100;
            else if (count === 2 && openEnds === 2) score += 50;
            else if (count === 2 && openEnds === 1) score += 10;
        }
        
        // 优先考虑中心位置
        const centerDistance = Math.abs(x - 7) + Math.abs(y - 7);
        score += (14 - centerDistance);
        
        return score;
    }
    
    restart() {
        this.initBoard();
        this.currentPlayer = 'black';
        this.gameOver = false;
        this.moveHistory = [];
        this.hintPosition = null;
        this.drawBoard();
        this.updatePlayerInfo();
    }
}

// 页面加载完成后初始化游戏
// 五子棋游戏逻辑
document.addEventListener('DOMContentLoaded', function() {
    const board = document.getElementById('board');
    const currentPlayerElement = document.getElementById('current-player');
    const gameStatusElement = document.getElementById('game-status');
    const restartBtn = document.getElementById('restart-btn');
    
    const BOARD_SIZE = 15;
    let currentPlayer = 'black';
    let gameBoard = [];
    let gameOver = false;
    
    // 初始化游戏
    function initGame() {
        board.innerHTML = '';
        gameBoard = [];
        gameOver = false;
        currentPlayer = 'black';
        currentPlayerElement.textContent = '黑子';
        gameStatusElement.textContent = '';
        
        // 创建棋盘
        for (let i = 0; i < BOARD_SIZE; i++) {
            gameBoard[i] = [];
            for (let j = 0; j < BOARD_SIZE; j++) {
                gameBoard[i][j] = null;
                
                const cell = document.createElement('div');
                cell.className = 'cell';
                cell.dataset.row = i;
                cell.dataset.col = j;
                cell.addEventListener('click', handleCellClick);
                board.appendChild(cell);
            }
        }
    }
    
    // 处理单元格点击
    function handleCellClick(event) {
        if (gameOver) return;
        
        const row = parseInt(event.target.dataset.row);
        const col = parseInt(event.target.dataset.col);
        
        if (gameBoard[row][col] !== null) return;
        
        // 放置棋子
        gameBoard[row][col] = currentPlayer;
        const piece = document.createElement('div');
        piece.className = `piece ${currentPlayer}`;
        event.target.appendChild(piece);
        
        // 检查是否获胜
        if (checkWin(row, col)) {
            gameOver = true;
            gameStatusElement.textContent = `${currentPlayer === 'black' ? '黑子' : '白子'}获胜！`;
            return;
        }
        
        // 检查是否平局
        if (checkDraw()) {
            gameOver = true;
            gameStatusElement.textContent = '平局！';
            return;
        }
        
        // 切换玩家
        currentPlayer = currentPlayer === 'black' ? 'white' : 'black';
        currentPlayerElement.textContent = currentPlayer === 'black' ? '黑子' : '白子';
    }
    
    // 检查获胜条件
    function checkWin(row, col) {
        const directions = [
            [0, 1],  // 水平
            [1, 0],  // 垂直
            [1, 1],  // 对角线1
            [1, -1]  // 对角线2
        ];
        
        for (const [dx, dy] of directions) {
            let count = 1;
            
            // 正方向检查
            let r = row + dx;
            let c = col + dy;
            while (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && gameBoard[r][c] === currentPlayer) {
                count++;
                r += dx;
                c += dy;
            }
            
            // 反方向检查
            r = row - dx;
            c = col - dy;
            while (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && gameBoard[r][c] === currentPlayer) {
                count++;
                r -= dx;
                c -= dy;
            }
            
            if (count >= 5) {
                return true;
            }
        }
        
        return false;
    }
    
    // 检查平局
    function checkDraw() {
        for (let i = 0; i < BOARD_SIZE; i++) {
            for (let j = 0; j < BOARD_SIZE; j++) {
                if (gameBoard[i][j] === null) {
                    return false;
                }
            }
        }
        return true;
    }
    
    // 重新开始游戏
    restartBtn.addEventListener('click', initGame);
    
    // 初始化游戏
    initGame();
});