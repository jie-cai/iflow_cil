class EnhancedGomoku {
    constructor() {
        // 游戏状态
        this.boardSize = 15;
        this.cellSize = 32;
        this.winCount = 5; // 连子数
        this.board = [];
        this.currentPlayer = 'black';
        this.gameOver = false;
        this.gameMode = 'pvp'; // pvp: 双人对战, pve: 人机对战
        this.aiLevel = 'medium'; // easy, medium, hard
        this.moveHistory = [];
        this.hintPosition = null;
        this.gameStartTime = null;
        this.gameTimer = null;
        this.movesCount = { black: 0, white: 0 };
        
        // DOM元素
        this.canvas = document.getElementById('game-board');
        this.ctx = this.canvas.getContext('2d');
        
        // 初始化
        this.initGame();
        this.bindEvents();
    }
    
    initGame() {
        // 设置棋盘大小
        this.updateCanvasSize();
        
        // 创建棋盘
        this.initBoard();
        
        // 初始化计数器
        this.movesCount = { black: 0, white: 0 };
        
        // 重置游戏状态
        this.currentPlayer = 'black';
        this.gameOver = false;
        this.moveHistory = [];
        this.hintPosition = null;
        
        // 开始计时
        this.startTimer();
        
        // 绘制棋盘
        this.drawBoard();
        this.updatePlayerInfo();
        this.updateGameStats();
    }
    
    updateCanvasSize() {
        // 根据棋盘大小调整canvas尺寸
        const newSize = this.boardSize * this.cellSize + 20;
        this.canvas.width = newSize;
        this.canvas.height = newSize;
    }
    
    initBoard() {
        this.board = [];
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
        
        // 计算每个格子的中心位置
        const offset = (this.canvas.width - (this.boardSize - 1) * this.cellSize) / 2;
        
        // 绘制网格线
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 1;
        
        for (let i = 0; i < this.boardSize; i++) {
            // 垂直线
            this.ctx.beginPath();
            this.ctx.moveTo(offset, offset + i * this.cellSize);
            this.ctx.lineTo(offset + (this.boardSize - 1) * this.cellSize, offset + i * this.cellSize);
            this.ctx.stroke();
            
            // 水平线
            this.ctx.beginPath();
            this.ctx.moveTo(offset + i * this.cellSize, offset);
            this.ctx.lineTo(offset + i * this.cellSize, offset + (this.boardSize - 1) * this.cellSize);
            this.ctx.stroke();
        }
        
        // 绘制天元和星位 (仅在15x15和19x19棋盘上)
        if (this.boardSize === 15 || this.boardSize === 19) {
            this.drawStars(offset);
        }
        
        // 绘制提示位置
        if (this.hintPosition) {
            this.drawHint(this.hintPosition.x, this.hintPosition.y, offset);
        }
        
        // 绘制已下的棋子
        for (let i = 0; i < this.boardSize; i++) {
            for (let j = 0; j < this.boardSize; j++) {
                if (this.board[i][j]) {
                    this.drawChessman(i, j, this.board[i][j], offset);
                }
            }
        }
    }
    
    drawStars(offset) {
        // 绘制星位
        let positions = [];
        
        if (this.boardSize === 15) {
            // 15x15棋盘的星位
            positions = [
                [3, 3], [3, 7], [3, 11],
                [7, 3], [7, 7], [7, 11],
                [11, 3], [11, 7], [11, 11]
            ];
        } else if (this.boardSize === 19) {
            // 19x19棋盘的星位
            positions = [
                [3, 3], [3, 9], [3, 15],
                [9, 3], [9, 9], [9, 15],
                [15, 3], [15, 9], [15, 15]
            ];
        }
        
        this.ctx.fillStyle = '#000';
        for (let [x, y] of positions) {
            const centerX = offset + x * this.cellSize;
            const centerY = offset + y * this.cellSize;
            this.ctx.beginPath();
            this.ctx.arc(centerX, centerY, 4, 0, Math.PI * 2);
            this.ctx.fill();
        }
    }
    
    drawChessman(x, y, color, offset) {
        const centerX = offset + x * this.cellSize;
        const centerY = offset + y * this.cellSize;
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
        this.ctx.lineWidth = 1;
        this.ctx.stroke();
    }
    
    drawHint(x, y, offset) {
        const centerX = offset + x * this.cellSize;
        const centerY = offset + y * this.cellSize;
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
        // 棋盘点击事件
        this.canvas.addEventListener('click', (e) => {
            if (this.gameOver) return;
            
            const rect = this.canvas.getBoundingClientRect();
            const x = e.clientX - rect.left;
            const y = e.clientY - rect.top;
            
            // 计算偏移量
            const offset = (this.canvas.width - (this.boardSize - 1) * this.cellSize) / 2;
            
            // 计算网格坐标
            const gridX = Math.round((x - offset) / this.cellSize);
            const gridY = Math.round((y - offset) / this.cellSize);
            
            if (gridX >= 0 && gridX < this.boardSize && gridY >= 0 && gridY < this.boardSize) {
                this.playChess(gridX, gridY);
                
                // 如果是人机模式且游戏未结束，让AI下棋
                if (this.gameMode === 'pve' && !this.gameOver && this.currentPlayer === 'white') {
                    setTimeout(() => {
                        this.aiMove();
                    }, 500); // 给AI一点思考时间
                }
            }
        });
        
        // 按钮事件
        document.getElementById('restart-btn').addEventListener('click', () => {
            this.restart();
        });
        
        document.getElementById('undo-btn').addEventListener('click', () => {
            this.undoMove();
        });
        
        document.getElementById('hint-btn').addEventListener('click', () => {
            this.showHint();
        });
        
        document.getElementById('save-btn').addEventListener('click', () => {
            this.showSaveDialog();
        });
        
        document.getElementById('load-btn').addEventListener('click', () => {
            this.showLoadDialog();
        });
        
        // 游戏模式选择
        const modeRadios = document.querySelectorAll('input[name="game-mode"]');
        modeRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.gameMode = e.target.value;
                document.getElementById('ai-difficulty').style.display = 
                    this.gameMode === 'pve' ? 'block' : 'none';
            });
        });
        
        // AI难度选择
        const aiRadios = document.querySelectorAll('input[name="ai-level"]');
        aiRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.aiLevel = e.target.value;
            });
        });
        
        // 棋盘大小选择
        const sizeRadios = document.querySelectorAll('input[name="board-size"]');
        sizeRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                this.boardSize = parseInt(e.target.value);
                this.updateCanvasSize();
                this.initGame();
            });
        });
        
        // 获胜规则选择
        const ruleRadios = document.querySelectorAll('input[name="win-rule"]');
        ruleRadios.forEach(radio => {
            radio.addEventListener('change', (e) => {
                if (e.target.value === 'custom') {
                    document.getElementById('custom-rule-input').style.display = 'block';
                } else {
                    document.getElementById('custom-rule-input').style.display = 'none';
                    this.winCount = parseInt(e.target.value);
                }
            });
        });
        
        // 自定义连子数
        document.getElementById('custom-win-count').addEventListener('change', (e) => {
            const count = parseInt(e.target.value);
            if (count >= 3 && count <= 10) {
                this.winCount = count;
            } else {
                e.target.value = this.winCount;
            }
        });
        
        // 对话框事件
        document.getElementById('confirm-btn').addEventListener('click', () => {
            this.handleDialogConfirm();
        });
        
        document.getElementById('cancel-btn').addEventListener('click', () => {
            this.hideDialog();
        });
    }
    
    playChess(x, y) {
        if (this.board[x][y] !== null) return;
        
        this.board[x][y] = this.currentPlayer;
        this.moveHistory.push({x, y, player: this.currentPlayer});
        
        // 更新步数统计
        this.movesCount[this.currentPlayer]++;
        
        this.hintPosition = null; // 清除提示
        this.drawBoard();
        
        if (this.checkWin(x, y)) {
            this.gameOver = true;
            setTimeout(() => {
                alert(`恭喜！${this.currentPlayer === 'black' ? '黑棋' : '白棋'}获胜！`);
                this.stopTimer();
            }, 100);
            return;
        }
        
        this.currentPlayer = this.currentPlayer === 'black' ? 'white' : 'black';
        this.updatePlayerInfo();
        this.updateGameStats();
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
            for (let i = 1; i < this.winCount; i++) {
                const nx = x + dx * i;
                const ny = y + dy * i;
                if (nx >= 0 && nx < this.boardSize && ny >= 0 && ny < this.boardSize && this.board[nx][ny] === color) {
                    count++;
                } else {
                    break;
                }
            }
            
            // 反方向计数
            for (let i = 1; i < this.winCount; i++) {
                const nx = x - dx * i;
                const ny = y - dy * i;
                if (nx >= 0 && nx < this.boardSize && ny >= 0 && ny < this.boardSize && this.board[nx][ny] === color) {
                    count++;
                } else {
                    break;
                }
            }
            
            if (count >= this.winCount) return true;
        }
        
        return false;
    }
    
    updatePlayerInfo() {
        document.getElementById('current-player').textContent = this.currentPlayer === 'black' ? '黑棋' : '白棋';
        document.getElementById('game-status').textContent = this.gameOver ? '已结束' : '进行中';
    }
    
    updateGameStats() {
        document.getElementById('black-moves').textContent = this.movesCount.black;
        document.getElementById('white-moves').textContent = this.movesCount.white;
    }
    
    undoMove() {
        if (this.moveHistory.length === 0 || this.gameOver) return;
        
        // 在人机模式下，可能需要撤销两步（玩家和AI的棋）
        let stepsToUndo = 1;
        if (this.gameMode === 'pve') {
            stepsToUndo = 2; // 撤销玩家和AI的最后一步
        }
        
        for (let i = 0; i < stepsToUndo; i++) {
            if (this.moveHistory.length === 0) break;
            
            const lastMove = this.moveHistory.pop();
            this.board[lastMove.x][lastMove.y] = null;
            this.currentPlayer = lastMove.player;
            this.movesCount[lastMove.player]--;
        }
        
        this.hintPosition = null;
        this.gameOver = false;
        this.drawBoard();
        this.updatePlayerInfo();
        this.updateGameStats();
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
            for (let i = 1; i < this.winCount; i++) {
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
            for (let i = 1; i < this.winCount; i++) {
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
            if (count >= this.winCount - 1) score += 10000;
            else if (count === this.winCount - 2 && openEnds === 2) score += 5000;
            else if (count === this.winCount - 2 && openEnds === 1) score += 1000;
            else if (count === this.winCount - 3 && openEnds === 2) score += 500;
            else if (count === this.winCount - 3 && openEnds === 1) score += 100;
            else if (count === this.winCount - 4 && openEnds === 2) score += 50;
            else if (count === this.winCount - 4 && openEnds === 1) score += 10;
        }
        
        // 优先考虑中心位置
        const centerX = Math.floor(this.boardSize / 2);
        const centerY = Math.floor(this.boardSize / 2);
        const centerDistance = Math.abs(x - centerX) + Math.abs(y - centerY);
        score += (this.boardSize - centerDistance);
        
        return score;
    }
    
    restart() {
        this.initGame();
    }
    
    // AI移动
    aiMove() {
        if (this.gameOver || this.currentPlayer !== 'white') return;
        
        let bestMove;
        
        // 根据AI难度选择不同的策略
        switch (this.aiLevel) {
            case 'easy':
                bestMove = this.findRandomMove();
                break;
            case 'medium':
                bestMove = this.findBestMove();
                break;
            case 'hard':
                bestMove = this.findBestMoveWithLookahead();
                break;
            default:
                bestMove = this.findBestMove();
        }
        
        if (bestMove) {
            this.playChess(bestMove.x, bestMove.y);
        } else {
            // 如果没有找到好的位置，随机选择一个空位
            bestMove = this.findRandomMove();
            if (bestMove) {
                this.playChess(bestMove.x, bestMove.y);
            }
        }
    }
    
    findRandomMove() {
        const emptyPositions = [];
        for (let i = 0; i < this.boardSize; i++) {
            for (let j = 0; j < this.boardSize; j++) {
                if (this.board[i][j] === null) {
                    emptyPositions.push({x: i, y: j});
                }
            }
        }
        
        if (emptyPositions.length > 0) {
            const randomIndex = Math.floor(Math.random() * emptyPositions.length);
            return emptyPositions[randomIndex];
        }
        
        return null;
    }
    
    findBestMoveWithLookahead() {
        // 更高级的AI，带有预判能力
        let bestScore = -Infinity;
        let bestMove = null;
        
        for (let i = 0; i < this.boardSize; i++) {
            for (let j = 0; j < this.boardSize; j++) {
                if (this.board[i][j] === null) {
                    // 评估当前移动
                    this.board[i][j] = 'white';
                    const score = this.evaluatePosition(i, j, 'white');
                    
                    // 简单的预判：评估对手可能的回应
                    if (this.aiLevel === 'hard') {
                        // 找到对手最好的回应
                        let opponentBestScore = -Infinity;
                        for (let oi = 0; oi < this.boardSize; oi++) {
                            for (let oj = 0; oj < this.boardSize; oj++) {
                                if (this.board[oi][oj] === null) {
                                    this.board[oi][oj] = 'black';
                                    const opponentScore = this.evaluatePosition(oi, oj, 'black');
                                    if (opponentScore > opponentBestScore) {
                                        opponentBestScore = opponentScore;
                                    }
                                    this.board[oi][oj] = null; // 恢复
                                }
                            }
                        }
                        
                        // 从当前得分中减去对手最佳回应得分，以避免给对手留下好位置
                        const netScore = score - opponentBestScore * 0.5; // 0.5是权重
                        if (netScore > bestScore) {
                            bestScore = netScore;
                            bestMove = {x: i, y: j};
                        }
                    } else {
                        if (score > bestScore) {
                            bestScore = score;
                            bestMove = {x: i, y: j};
                        }
                    }
                    
                    this.board[i][j] = null; // 恢复
                }
            }
        }
        
        return bestMove;
    }
    
    // 棋谱保存和加载功能
    showSaveDialog() {
        document.getElementById('dialog-title').textContent = '保存棋谱';
        document.getElementById('game-name').value = '';
        document.getElementById('dialog-overlay').style.display = 'flex';
        this.currentDialogAction = 'save';
    }
    
    showLoadDialog() {
        document.getElementById('dialog-title').textContent = '加载棋谱';
        document.getElementById('game-name').value = '';
        document.getElementById('dialog-overlay').style.display = 'flex';
        this.currentDialogAction = 'load';
    }
    
    handleDialogConfirm() {
        const gameName = document.getElementById('game-name').value.trim();
        if (!gameName) {
            alert('请输入游戏名称');
            return;
        }
        
        if (this.currentDialogAction === 'save') {
            this.saveGame(gameName);
        } else if (this.currentDialogAction === 'load') {
            this.loadGame(gameName);
        }
        
        this.hideDialog();
    }
    
    hideDialog() {
        document.getElementById('dialog-overlay').style.display = 'none';
    }
    
    saveGame(gameName) {
        const gameState = {
            board: this.board,
            currentPlayer: this.currentPlayer,
            gameOver: this.gameOver,
            gameMode: this.gameMode,
            aiLevel: this.aiLevel,
            boardSize: this.boardSize,
            winCount: this.winCount,
            moveHistory: this.moveHistory,
            movesCount: this.movesCount,
            timestamp: new Date().toISOString()
        };
        
        // 存储到localStorage
        let savedGames = JSON.parse(localStorage.getItem('gomokuSavedGames') || '{}');
        savedGames[gameName] = gameState;
        localStorage.setItem('gomokuSavedGames', JSON.stringify(savedGames));
        
        alert(`棋谱 "${gameName}" 已保存！`);
    }
    
    loadGame(gameName) {
        const savedGames = JSON.parse(localStorage.getItem('gomokuSavedGames') || '{}');
        const gameState = savedGames[gameName];
        
        if (!gameState) {
            alert(`未找到棋谱 "${gameName}"`);
            return;
        }
        
        // 恢复游戏状态
        this.board = gameState.board;
        this.currentPlayer = gameState.currentPlayer;
        this.gameOver = gameState.gameOver;
        this.gameMode = gameState.gameMode;
        this.aiLevel = gameState.aiLevel;
        this.boardSize = gameState.boardSize;
        this.winCount = gameState.winCount;
        this.moveHistory = gameState.moveHistory;
        this.movesCount = gameState.movesCount;
        
        // 更新棋盘大小
        this.updateCanvasSize();
        
        // 绘制棋盘
        this.drawBoard();
        this.updatePlayerInfo();
        this.updateGameStats();
        
        // 恢复计时器
        this.startTimer();
        
        alert(`棋谱 "${gameName}" 已加载！`);
    }
    
    // 计时器功能
    startTimer() {
        // 停止之前的计时器
        this.stopTimer();
        
        // 记录开始时间
        this.gameStartTime = new Date();
        
        // 更新计时器显示
        this.gameTimer = setInterval(() => {
            if (this.gameStartTime) {
                const elapsed = Math.floor((new Date() - this.gameStartTime) / 1000);
                const minutes = Math.floor(elapsed / 60).toString().padStart(2, '0');
                const seconds = (elapsed % 60).toString().padStart(2, '0');
                document.getElementById('game-timer').textContent = `${minutes}:${seconds}`;
            }
        }, 1000);
    }
    
    stopTimer() {
        if (this.gameTimer) {
            clearInterval(this.gameTimer);
            this.gameTimer = null;
        }
    }
}

// 页面加载完成后初始化游戏
window.addEventListener('DOMContentLoaded', () => {
    new EnhancedGomoku();
});