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
        
        // 新增功能
        this.gameMode = 'pvp'; // 'pvp' 或 'ai'
        this.aiDifficulty = 'medium'; // 'easy', 'medium', 'hard'
        this.firstPlayer = 'black'; // 'black' 或 'white'
        this.timeLimit = 0; // 每步时间限制（秒），0表示无限制
        this.undoLimit = 3; // 悔棋次数限制
        this.undoCount = 0; // 已使用的悔棋次数
        this.blackWins = 0; // 黑棋胜场
        this.whiteWins = 0; // 白棋胜场
        this.timer = null; // 计时器
        this.timeLeft = 0; // 剩余时间
        this.isReplaying = false; // 是否在回放模式
        this.replayIndex = 0; // 回放索引
        this.originalHistory = []; // 原始历史记录（回放用）
        
        this.initGameSettings();
        this.initBoard();
        this.drawBoard();
        this.bindEvents();
        this.updatePlayerInfo();
        this.updateStats();
    }
    
    initGameSettings() {
        // 初始化游戏设置
        document.getElementById('game-mode').addEventListener('change', (e) => {
            this.gameMode = e.target.value;
        });
        
        document.getElementById('ai-difficulty').addEventListener('change', (e) => {
            this.aiDifficulty = e.target.value;
        });
        
        document.getElementById('first-player').addEventListener('change', (e) => {
            this.firstPlayer = e.target.value;
            if (!this.gameOver && this.moveHistory.length === 0) {
                this.currentPlayer = e.target.value;
                this.updatePlayerInfo();
            }
        });
        
        document.getElementById('time-limit').addEventListener('change', (e) => {
            this.timeLimit = parseInt(e.target.value);
            this.resetTimer();
        });
        
        document.getElementById('undo-limit').addEventListener('change', (e) => {
            this.undoLimit = parseInt(e.target.value);
            this.undoCount = 0; // 重置悔棋计数
        });
        
        document.getElementById('replay-btn').addEventListener('click', () => {
            this.startReplay();
        });
        
        document.getElementById('replay-prev').addEventListener('click', () => {
            this.replayPrev();
        });
        
        document.getElementById('replay-play').addEventListener('click', () => {
            this.replayPlay();
        });
        
        document.getElementById('replay-next').addEventListener('click', () => {
            this.replayNext();
        });
        
        document.getElementById('replay-exit').addEventListener('click', () => {
            this.exitReplay();
        });
    }
    
    initBoard() {
        for (let i = 0; i < this.boardSize; i++) {
            this.board[i] = [];
            for (let j = 0; j < this.boardSize; j++) {
                this.board[i][j] = null;
            }
        }
        this.currentPlayer = this.firstPlayer;
        this.gameOver = false;
        this.moveHistory = [];
        this.undoCount = 0;
        this.hintPosition = null;
        this.resetTimer();
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
            if (this.gameOver || this.isReplaying) return;
            
            // 如果是AI模式且当前是AI回合，不允许点击
            if (this.gameMode === 'ai' && this.currentPlayer !== this.firstPlayer) {
                return;
            }
            
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
        if (this.board[x][y] !== null || this.gameOver) return;
        
        this.board[x][y] = this.currentPlayer;
        this.moveHistory.push({x, y, player: this.currentPlayer});
        this.hintPosition = null; // 清除提示
        this.resetTimer(); // 重置计时器
        this.drawBoard();
        
        if (this.checkWin(x, y)) {
            this.gameOver = true;
            if (this.currentPlayer === 'black') {
                this.blackWins++;
            } else {
                this.whiteWins++;
            }
            this.updateStats();
            setTimeout(() => {
                alert(`恭喜！${this.currentPlayer === 'black' ? '黑棋' : '白棋'}获胜！`);
            }, 100);
            return;
        }
        
        this.currentPlayer = this.currentPlayer === 'black' ? 'white' : 'black';
        this.updatePlayerInfo();
        
        // 如果是AI模式，AI自动下棋
        if (this.gameMode === 'ai' && this.currentPlayer !== this.firstPlayer) {
            setTimeout(() => {
                this.aiMove();
            }, 500); // 延迟让玩家看到对手的棋子
        }
    }
    
    aiMove() {
        if (this.gameOver) return;
        
        let bestMove;
        
        // 根据难度选择AI策略
        switch (this.aiDifficulty) {
            case 'easy':
                // 随机下棋
                bestMove = this.getRandomMove();
                break;
            case 'medium':
                // 基础策略
                bestMove = this.findBestMove();
                break;
            case 'hard':
                // 高级策略（使用更深的搜索）
                bestMove = this.findBestMoveHard();
                break;
            default:
                bestMove = this.findBestMove();
        }
        
        if (bestMove) {
            this.playChess(bestMove.x, bestMove.y);
        }
    }
    
    getRandomMove() {
        const emptyCells = [];
        for (let i = 0; i < this.boardSize; i++) {
            for (let j = 0; j < this.boardSize; j++) {
                if (this.board[i][j] === null) {
                    emptyCells.push({x: i, y: j});
                }
            }
        }
        
        if (emptyCells.length > 0) {
            const randomIndex = Math.floor(Math.random() * emptyCells.length);
            return emptyCells[randomIndex];
        }
        
        return null;
    }
    
    findBestMoveHard() {
        // 更高级的AI策略，使用更深的搜索
        let bestScore = -Infinity;
        let bestMove = null;
        
        // 找到所有可能的落子点（附近有棋子的位置）
        const candidateMoves = this.getCandidateMoves();
        
        for (const move of candidateMoves) {
            // 尝试下这一步
            this.board[move.x][move.y] = this.currentPlayer;
            
            // 评估这个位置
            const score = this.evaluatePosition(move.x, move.y, this.currentPlayer) - 
                         this.evaluatePositionAfterOpponentMove(move.x, move.y);
            
            // 撤销这一步
            this.board[move.x][move.y] = null;
            
            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
        }
        
        return bestMove || this.findBestMove();
    }
    
    evaluatePositionAfterOpponentMove(x, y) {
        // 评估对手在某个位置下棋后的威胁
        const opponent = this.currentPlayer === 'black' ? 'white' : 'black';
        this.board[x][y] = opponent;
        
        let opponentScore = this.evaluatePosition(x, y, opponent);
        
        this.board[x][y] = null;
        
        return opponentScore;
    }
    
    getCandidateMoves() {
        const candidates = [];
        const directions = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
        
        for (let i = 0; i < this.boardSize; i++) {
            for (let j = 0; j < this.boardSize; j++) {
                if (this.board[i][j] !== null) {
                    // 检查周围的空位
                    for (const [dx, dy] of directions) {
                        const ni = i + dx;
                        const nj = j + dy;
                        
                        if (ni >= 0 && ni < this.boardSize && nj >= 0 && nj < this.boardSize && 
                            this.board[ni][nj] === null) {
                            // 检查是否已经添加过
                            if (!candidates.some(move => move.x === ni && move.y === nj)) {
                                candidates.push({x: ni, y: nj});
                            }
                        }
                    }
                }
            }
        }
        
        return candidates;
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
    
    updateStats() {
        document.getElementById('black-wins').textContent = this.blackWins;
        document.getElementById('white-wins').textContent = this.whiteWins;
    }
    
    undoMove() {
        // 检查是否可以悔棋
        if (this.moveHistory.length === 0 || this.gameOver || this.undoCount >= this.undoLimit) {
            return;
        }
        
        // 如果是AI模式，悔棋时需要悔两步（玩家和AI的棋）
        if (this.gameMode === 'ai' && this.moveHistory.length >= 2) {
            // 悔AI的棋
            const aiMove = this.moveHistory.pop();
            this.board[aiMove.x][aiMove.y] = null;
            
            // 悔玩家的棋
            const playerMove = this.moveHistory.pop();
            this.board[playerMove.x][playerMove.y] = null;
            
            // 确定当前玩家（应该是下一次轮到的玩家）
            this.currentPlayer = playerMove.player;
            
            this.undoCount += 2;
        } else if (this.moveHistory.length >= 1) {
            // 普通悔棋（仅悔一步）
            const lastMove = this.moveHistory.pop();
            this.board[lastMove.x][lastMove.y] = null;
            // 确定当前玩家（应该是下一次轮到的玩家）
            this.currentPlayer = lastMove.player;
            this.undoCount++;
        }
        
        this.hintPosition = null;
        this.drawBoard();
        this.updatePlayerInfo();
    }
    
    showHint() {
        if (this.gameOver || this.isReplaying) return;
        
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
            if (count >= 4) score += 10000;
            else if (count === 3 && openEnds === 2) score += 5000;
            else if (count === 3 && openEnds === 1) score += 1000;
            else if (count === 2 && openEnds === 2) score += 500;
            else if (count === 2 && openEnds === 1) score += 100;
            else if (count === 1 && openEnds === 2) score += 50;
        }
        
        // 优先考虑中心位置
        const centerDistance = Math.abs(x - 7) + Math.abs(y - 7);
        score += (14 - centerDistance) * 10;
        
        return score;
    }
    
    resetTimer() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
        
        this.timeLeft = this.timeLimit;
        if (this.timeLimit > 0) {
            this.updateTimerDisplay();
            this.timer = setInterval(() => {
                this.timeLeft--;
                this.updateTimerDisplay();
                
                if (this.timeLeft <= 0) {
                    clearInterval(this.timer);
                    this.timer = null;
                    // 时间到了，当前玩家失败
                    if (!this.gameOver) {
                        this.gameOver = true;
                        const winner = this.currentPlayer === 'black' ? '白棋' : '黑棋';
                        alert(`${this.currentPlayer === 'black' ? '黑棋' : '白棋'}超时，${winner}获胜！`);
                        if (winner === '黑棋') {
                            this.blackWins++;
                        } else {
                            this.whiteWins++;
                        }
                        this.updateStats();
                    }
                }
            }, 1000);
        } else {
            document.getElementById('timer').textContent = '00:00';
        }
    }
    
    updateTimerDisplay() {
        const minutes = Math.floor(this.timeLeft / 60);
        const seconds = this.timeLeft % 60;
        document.getElementById('timer').textContent = 
            `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    startReplay() {
        if (this.moveHistory.length === 0) return;
        
        // 保存当前状态
        this.originalHistory = JSON.parse(JSON.stringify(this.moveHistory));
        
        // 进入回放模式
        this.isReplaying = true;
        this.replayIndex = 0;
        
        // 隐藏游戏控制按钮，显示回放控制按钮
        document.querySelector('.game-controls').style.display = 'none';
        document.querySelector('.replay-controls').style.display = 'flex';
        
        // 初始化棋盘
        this.initBoard();
        this.drawBoard();
    }
    
    replayPrev() {
        if (!this.isReplaying || this.replayIndex <= 0) return;
        
        this.replayIndex--;
        this.updateReplayBoard();
    }
    
    replayNext() {
        if (!this.isReplaying || this.replayIndex >= this.originalHistory.length) return;
        
        this.replayIndex++;
        this.updateReplayBoard();
    }
    
    replayPlay() {
        if (!this.isReplaying) return;
        
        // 播放模式：自动播放
        if (this.replayInterval) {
            // 如果已经在播放，则停止
            clearInterval(this.replayInterval);
            this.replayInterval = null;
            document.getElementById('replay-play').textContent = '播放';
        } else {
            // 开始播放
            document.getElementById('replay-play').textContent = '暂停';
            this.replayInterval = setInterval(() => {
                if (this.replayIndex < this.originalHistory.length) {
                    this.replayNext();
                } else {
                    // 播放结束，停止
                    clearInterval(this.replayInterval);
                    this.replayInterval = null;
                    document.getElementById('replay-play').textContent = '播放';
                }
            }, 1000);
        }
    }
    
    updateReplayBoard() {
        // 重新初始化棋盘
        this.initBoard();
        
        // 重放直到当前索引
        for (let i = 0; i < this.replayIndex; i++) {
            const move = this.originalHistory[i];
            this.board[move.x][move.y] = move.player;
        }
        
        this.drawBoard();
    }
    
    exitReplay() {
        // 退出回放模式
        this.isReplaying = false;
        this.replayIndex = 0;
        
        if (this.replayInterval) {
            clearInterval(this.replayInterval);
            this.replayInterval = null;
        }
        
        // 显示游戏控制按钮，隐藏回放控制按钮
        document.querySelector('.game-controls').style.display = 'flex';
        document.querySelector('.replay-controls').style.display = 'none';
        document.getElementById('replay-play').textContent = '播放';
        
        // 恢复原始游戏状态
        this.moveHistory = JSON.parse(JSON.stringify(this.originalHistory));
        this.initBoard();
        // 重新应用历史记录
        for (const move of this.moveHistory) {
            this.board[move.x][move.y] = move.player;
        }
        this.drawBoard();
        this.currentPlayer = this.moveHistory.length % 2 === 0 ? this.firstPlayer : 
                            (this.firstPlayer === 'black' ? 'white' : 'black');
        this.updatePlayerInfo();
    }
    
    restart() {
        this.initBoard();
        this.gameOver = false;
        this.undoCount = 0;
        this.resetTimer();
        this.drawBoard();
        this.updatePlayerInfo();
        
        // 如果是AI模式且AI先手，AI自动下第一棋
        if (this.gameMode === 'ai' && this.firstPlayer !== this.currentPlayer) {
            setTimeout(() => {
                this.aiMove();
            }, 500);
        }
    }
}

// 页面加载完成后初始化游戏
window.addEventListener('DOMContentLoaded', () => {
    new Gomoku();
});