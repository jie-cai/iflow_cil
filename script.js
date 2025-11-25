class Gomoku {
    constructor() {
        this.boardSize = 15;
        this.cellSize = 32;
        this.board = [];
        this.currentPlayer = 'black';
        this.gameOver = false;
        this.moveHistory = [];
        this.hintPosition = null;
        this.canvas = document.getElementById('game-board');
        this.ctx = this.canvas.getContext('2d');
        
        // 新增功能
        this.gameMode = 'pvp';
        this.aiDifficulty = 'medium';
        this.firstPlayer = 'black';
        this.winMode = 'classic'; // 'classic' 或 'enhanced'
        this.scoreMode = 'none'; // 'none' 或 'chain'
        this.moveTimeLimit = 0; // 每步时间限制（秒）
        this.totalTimeLimit = 0; // 总时间限制（秒）
        this.undoLimit = 3; // 悔棋次数限制
        this.undoCount = 0; // 已使用的悔棋次数
        
        // 计分系统
        this.blackScore = 0;
        this.whiteScore = 0;
        this.playerTimes = { black: 0, white: 0 }; // 玩家用时记录
        
        // 计时器
        this.moveTimer = null;
        this.totalTimer = null;
        this.moveTimeLeft = 0;
        this.totalTimeLeft = 0;
        
        // 回放功能
        this.isReplaying = false;
        this.replayIndex = 0;
        this.originalHistory = [];
        this.replayInterval = null;
        
        this.initGameSettings();
        this.initBoard();
        this.drawBoard();
        this.bindEvents();
        this.updatePlayerInfo();
        this.updateStats();
        this.updateSettingsPanel();
        
        // 绑定快捷键
        this.bindKeyboardEvents();
    }
    
    initGameSettings() {
        // 初始化游戏设置
        const settings = [
            { id: 'board-size', handler: (e) => { this.changeBoardSize(parseInt(e.target.value)); } },
            { id: 'game-mode', handler: (e) => { this.gameMode = e.target.value; } },
            { id: 'win-mode', handler: (e) => { this.winMode = e.target.value; } },
            { id: 'score-mode', handler: (e) => { this.scoreMode = e.target.value; } },
            { id: 'ai-difficulty', handler: (e) => { this.aiDifficulty = e.target.value; } },
            { id: 'first-player', handler: (e) => {
                this.firstPlayer = e.target.value;
                if (!this.gameOver && this.moveHistory.length === 0) {
                    this.currentPlayer = e.target.value;
                    this.updatePlayerInfo();
                }
            }},
            { id: 'move-time-limit', handler: (e) => {
                this.moveTimeLimit = parseInt(e.target.value);
                this.resetMoveTimer();
            }},
            { id: 'total-time-limit', handler: (e) => {
                this.totalTimeLimit = parseInt(e.target.value);
                this.resetTotalTimer();
            }},
            { id: 'undo-limit', handler: (e) => {
                this.undoLimit = parseInt(e.target.value);
                this.undoCount = 0; // 重置悔棋计数
            }}
        ];

        for (const setting of settings) {
            const element = document.getElementById(setting.id);
            if (element) {
                element.addEventListener('change', setting.handler);
            }
        }
        
        // 按钮事件
        const buttons = [
            { id: 'restart-btn', handler: () => this.restart() },
            { id: 'undo-btn', handler: () => this.undoMove() },
            { id: 'hint-btn', handler: () => this.showHint() },
            { id: 'settings-btn', handler: () => this.toggleSettings() },
            { id: 'replay-btn', handler: () => this.startReplay() },
            { id: 'close-settings', handler: () => this.closeSettings() },
            { id: 'replay-prev', handler: () => this.replayPrev() },
            { id: 'replay-play', handler: () => this.replayPlay() },
            { id: 'replay-next', handler: () => this.replayNext() },
            { id: 'replay-exit', handler: () => this.exitReplay() }
        ];

        for (const button of buttons) {
            const element = document.getElementById(button.id);
            if (element) {
                element.addEventListener('click', button.handler.bind(this));
            }
        }
    }
    
    bindKeyboardEvents() {
        document.addEventListener('keydown', (e) => {
            if (this.isReplaying) return;
            
            switch (e.key.toLowerCase()) {
                case 'u':
                    if (!this.gameOver) this.undoMove();
                    break;
                case 'h':
                    if (!this.gameOver) this.showHint();
                    break;
                case 'r':
                    this.restart();
                    break;
                case 'escape':
                    this.closeSettings();
                    break;
            }
        });
    }
    
    changeBoardSize(size) {
        this.boardSize = size;
        this.cellSize = Math.min(480 / size, 32); // 自适应单元格大小
        this.canvas.width = this.cellSize * (size - 1) + this.cellSize;
        this.canvas.height = this.cellSize * (size - 1) + this.cellSize;
        this.restart();
        this.updateSettingsPanel();
    }
    
    initBoard() {
        this.board = [];
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
        this.blackScore = 0;
        this.whiteScore = 0;
        this.playerTimes = { black: 0, white: 0 };
        
        this.resetMoveTimer();
        this.resetTotalTimer();
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
        
        // 绘制星位点（仅限15x15棋盘）
        if (this.boardSize === 15) {
            this.drawStarPoints();
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
    
    drawStarPoints() {
        const starPoints = [
            [3, 3], [3, 11], [7, 7], [11, 3], [11, 11],
            [3, 7], [7, 3], [7, 11], [11, 7]
        ];
        
        this.ctx.fillStyle = '#000';
        for (const [x, y] of starPoints) {
            const centerX = this.cellSize/2 + x * this.cellSize;
            const centerY = this.cellSize/2 + y * this.cellSize;
            const radius = 3;
            
            this.ctx.beginPath();
            this.ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
            this.ctx.fill();
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
    }
    
    playChess(x, y) {
        if (this.board[x][y] !== null || this.gameOver) return;
        
        // 记录这一步的开始时间
        const moveStartTime = Date.now();
        
        this.board[x][y] = this.currentPlayer;
        this.moveHistory.push({
            x, 
            y, 
            player: this.currentPlayer,
            timestamp: new Date().toLocaleTimeString(),
            moveNumber: this.moveHistory.length + 1
        });
        this.hintPosition = null; // 清除提示
        
        // 计分系统
        if (this.scoreMode === 'chain') {
            this.calculateScore(x, y);
        }
        
        // 重置计时器
        this.resetMoveTimer();
        this.drawBoard();
        this.updatePlayerInfo();
        this.updateSettingsPanel();
        
        if (this.checkWin(x, y)) {
            this.gameOver = true;
            if (this.currentPlayer === 'black') {
                this.blackWins++;
            } else {
                this.whiteWins++;
            }
            this.updateStats();
            this.stopAllTimers();
            setTimeout(() => {
                alert(`恭喜！${this.currentPlayer === 'black' ? '黑棋' : '白棋'}获胜！`);
            }, 100);
            return;
        }
        
        // 检查平局
        if (this.isDraw()) {
            this.gameOver = true;
            this.stopAllTimers();
            setTimeout(() => {
                alert('平局！棋盘已满无人获胜。');
            }, 100);
            return;
        }
        
        this.currentPlayer = this.currentPlayer === 'black' ? 'white' : 'black';
        
        // 记录用时
        const moveTime = (Date.now() - moveStartTime) / 1000;
        this.playerTimes[this.currentPlayer] += moveTime;
        
        // 如果是AI模式，AI自动下棋
        if (this.gameMode === 'ai' && this.currentPlayer !== this.firstPlayer) {
            setTimeout(() => {
                this.aiMove();
            }, 500);
        }
    }
    
    calculateScore(x, y) {
        const color = this.board[x][y];
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
                    if (this.board[nx][ny] === color) {
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
                    if (this.board[nx][ny] === color) {
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
            if (count >= 4) score += 100;
            else if (count === 3 && openEnds === 2) score += 50;
            else if (count === 3 && openEnds === 1) score += 20;
            else if (count === 2 && openEnds === 2) score += 10;
            else if (count === 2 && openEnds === 1) score += 5;
            else if (count === 1 && openEnds === 2) score += 2;
        }
        
        // 添加基础分数
        score += 1;
        
        if (color === 'black') {
            this.blackScore += score;
        } else {
            this.whiteScore += score;
        }
    }
    
    isDraw() {
        for (let i = 0; i < this.boardSize; i++) {
            for (let j = 0; j < this.boardSize; j++) {
                if (this.board[i][j] === null) {
                    return false;
                }
            }
        }
        return true;
    }
    
    aiMove() {
        if (this.gameOver) return;
        
        let bestMove;
        
        // 根据难度选择AI策略
        switch (this.aiDifficulty) {
            case 'easy':
                bestMove = this.getRandomMove();
                break;
            case 'medium':
                bestMove = this.findBestMove();
                break;
            case 'hard':
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
        let bestScore = -Infinity;
        let bestMove = null;
        
        const candidateMoves = this.getCandidateMoves();
        
        for (const move of candidateMoves) {
            this.board[move.x][move.y] = this.currentPlayer;
            
            const score = this.evaluatePosition(move.x, move.y, this.currentPlayer) - 
                         this.evaluatePositionAfterOpponentMove(move.x, move.y);
            
            this.board[move.x][move.y] = null;
            
            if (score > bestScore) {
                bestScore = score;
                bestMove = move;
            }
        }
        
        return bestMove || this.findBestMove();
    }
    
    evaluatePositionAfterOpponentMove(x, y) {
        const opponent = this.currentPlayer === 'black' ? 'white' : 'black';
        this.board[x][y] = opponent;
        
        let opponentScore = this.evaluatePosition(x, y, opponent);
        
        this.board[x][y] = null;
        
        return opponentScore;
    }
    
    getCandidateMoves() {
        const candidates = new Set();
        const directions = [[-1, -1], [-1, 0], [-1, 1], [0, -1], [0, 1], [1, -1], [1, 0], [1, 1]];
        
        for (let i = 0; i < this.boardSize; i++) {
            for (let j = 0; j < this.boardSize; j++) {
                if (this.board[i][j] !== null) {
                    for (const [dx, dy] of directions) {
                        const ni = i + dx;
                        const nj = j + dy;
                        
                        if (ni >= 0 && ni < this.boardSize && nj >= 0 && nj < this.boardSize && 
                            this.board[ni][nj] === null) {
                            candidates.add(`${ni},${nj}`);
                        }
                    }
                }
            }
        }
        
        return Array.from(candidates, str => {
            const [x, y] = str.split(',').map(Number);
            return {x, y};
        });
    }
    
    checkWin(x, y) {
        const color = this.board[x][y];
        if (!color) return false;
        
        const winLength = this.winMode === 'enhanced' ? 6 : 5;
        const directions = [
            [1, 0],   // 水平
            [0, 1],   // 垂直
            [1, 1],   // 对角线
            [1, -1]   // 反对角线
        ];
        
        for (let [dx, dy] of directions) {
            let count = 1;
            
            // 正方向计数
            for (let i = 1; i < winLength; i++) {
                const nx = x + dx * i;
                const ny = y + dy * i;
                if (nx >= 0 && nx < this.boardSize && ny >= 0 && ny < this.boardSize && this.board[nx][ny] === color) {
                    count++;
                } else {
                    break;
                }
            }
            
            // 反方向计数
            for (let i = 1; i < winLength; i++) {
                const nx = x - dx * i;
                const ny = y - dy * i;
                if (nx >= 0 && nx < this.boardSize && ny >= 0 && ny < this.boardSize && this.board[nx][ny] === color) {
                    count++;
                } else {
                    break;
                }
            }
            
            if (count >= winLength) return true;
        }
        
        return false;
    }
    
    updatePlayerInfo() {
        document.getElementById('current-player').textContent = this.currentPlayer === 'black' ? '黑棋' : '白棋';
        document.getElementById('black-score').textContent = this.blackScore;
        document.getElementById('white-score').textContent = this.whiteScore;
    }
    
    updateStats() {
        document.getElementById('black-wins').textContent = this.blackWins || 0;
        document.getElementById('white-wins').textContent = this.whiteWins || 0;
    }
    
    undoMove() {
        // 检查是否可以悔棋
        if (this.moveHistory.length === 0 || this.gameOver || 
            (this.undoLimit >= 0 && this.undoCount >= this.undoLimit)) {
            return;
        }
        
        // 如果是AI模式，悔棋时需要悔两步
        if (this.gameMode === 'ai' && this.moveHistory.length >= 2) {
            const aiMove = this.moveHistory.pop();
            this.board[aiMove.x][aiMove.y] = null;
            
            const playerMove = this.moveHistory.pop();
            this.board[playerMove.x][playerMove.y] = null;
            
            // 减去得分
            if (this.scoreMode === 'chain') {
                // 重新计算得分（简化处理）
                this.recalculateScores();
            }
            
            this.currentPlayer = playerMove.player;
            this.undoCount += 2;
        } else if (this.moveHistory.length >= 1) {
            const lastMove = this.moveHistory.pop();
            this.board[lastMove.x][lastMove.y] = null;
            
            // 减去得分
            if (this.scoreMode === 'chain') {
                this.recalculateScores();
            }
            
            this.currentPlayer = lastMove.player;
            this.undoCount++;
        }
        
        this.hintPosition = null;
        this.drawBoard();
        this.updatePlayerInfo();
        this.updateSettingsPanel();
    }
    
    recalculateScores() {
        // 重新计算所有得分
        this.blackScore = 0;
        this.whiteScore = 0;
        
        for (const move of this.moveHistory) {
            const originalPlayer = this.board[move.x][move.y];
            this.board[move.x][move.y] = move.player;
            this.calculateScore(move.x, move.y);
            this.board[move.x][move.y] = originalPlayer;
        }
    }
    
    showHint() {
        if (this.gameOver || this.isReplaying) return;
        
        const bestMove = this.findBestMove();
        if (bestMove) {
            this.hintPosition = bestMove;
            this.drawBoard();
            
            setTimeout(() => {
                this.hintPosition = null;
                this.drawBoard();
            }, 3000);
        }
    }
    
    findBestMove() {
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
        const winLength = this.winMode === 'enhanced' ? 6 : 5;
        
        for (let [dx, dy] of directions) {
            let count = 1;
            let openEnds = 0;
            
            // 正方向
            for (let i = 1; i < winLength; i++) {
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
            for (let i = 1; i < winLength; i++) {
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
            if (count >= winLength) score += 10000;
            else if (count === winLength - 1 && openEnds === 2) score += 5000;
            else if (count === winLength - 1 && openEnds === 1) score += 1000;
            else if (count === winLength - 2 && openEnds === 2) score += 500;
            else if (count === winLength - 2 && openEnds === 1) score += 100;
            else if (count === 1 && openEnds === 2) score += 50;
        }
        
        // 优先考虑中心位置
        const centerDistance = Math.abs(x - (this.boardSize - 1) / 2) + Math.abs(y - (this.boardSize - 1) / 2);
        score += ((this.boardSize - 1) - centerDistance) * 10;
        
        return score;
    }
    
    // 计时器相关方法
    resetMoveTimer() {
        if (this.moveTimer) {
            clearInterval(this.moveTimer);
            this.moveTimer = null;
        }
        
        this.moveTimeLeft = this.moveTimeLimit;
        this.updateMoveTimerDisplay();
        
        if (this.moveTimeLimit > 0) {
            this.moveTimer = setInterval(() => {
                this.moveTimeLeft--;
                this.updateMoveTimerDisplay();
                
                if (this.moveTimeLeft <= 0) {
                    clearInterval(this.moveTimer);
                    this.moveTimer = null;
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
        }
    }
    
    resetTotalTimer() {
        if (this.totalTimer) {
            clearInterval(this.totalTimer);
            this.totalTimer = null;
        }
        
        this.totalTimeLeft = this.totalTimeLimit;
        this.updateTotalTimerDisplay();
        
        if (this.totalTimeLimit > 0) {
            this.totalTimer = setInterval(() => {
                this.totalTimeLeft--;
                this.updateTotalTimerDisplay();
                
                if (this.totalTimeLeft <= 0) {
                    clearInterval(this.totalTimer);
                    this.totalTimer = null;
                    if (!this.gameOver) {
                        this.gameOver = true;
                        // 根据用时决定胜负
                        const blackTime = this.playerTimes.black;
                        const whiteTime = this.playerTimes.white;
                        let winner, winnerText;
                        
                        if (blackTime < whiteTime) {
                            winner = 'black';
                            winnerText = '黑棋';
                        } else if (whiteTime < blackTime) {
                            winner = 'white';
                            winnerText = '白棋';
                        } else {
                            alert('总时间用尽，平局！');
                            return;
                        }
                        
                        alert(`总时间用尽，${winnerText}用时较少，获胜！`);
                        if (winner === 'black') {
                            this.blackWins++;
                        } else {
                            this.whiteWins++;
                        }
                        this.updateStats();
                    }
                }
            }, 1000);
        }
    }
    
    updateMoveTimerDisplay() {
        const minutes = Math.floor(this.moveTimeLeft / 60);
        const seconds = this.moveTimeLeft % 60;
        const element = document.getElementById('move-timer');
        if (element) {
            element.textContent = this.moveTimeLimit > 0 ? 
                `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}` : '00:00';
        }
    }
    
    updateTotalTimerDisplay() {
        const minutes = Math.floor(this.totalTimeLeft / 60);
        const seconds = this.totalTimeLeft % 60;
        const element = document.getElementById('total-timer');
        if (element) {
            element.textContent = this.totalTimeLimit > 0 ? 
                `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}` : '00:00';
        }
    }
    
    stopAllTimers() {
        if (this.moveTimer) {
            clearInterval(this.moveTimer);
            this.moveTimer = null;
        }
        if (this.totalTimer) {
            clearInterval(this.totalTimer);
            this.totalTimer = null;
        }
    }
    
    // 设置面板相关方法
    toggleSettings() {
        const panel = document.getElementById('settings-panel');
        if (panel.style.display === 'none' || panel.style.display === '') {
            this.updateSettingsPanel();
            panel.style.display = 'block';
        } else {
            panel.style.display = 'none';
        }
    }
    
    closeSettings() {
        const panel = document.getElementById('settings-panel');
        panel.style.display = 'none';
    }
    
    updateSettingsPanel() {
        // 更新当前游戏信息
        const boardSizeText = `${this.boardSize}x${this.boardSize}`;
        const gameModeText = this.gameMode === 'pvp' ? '玩家对战' : 'AI对战';
        const winModeText = this.winMode === 'classic' ? '经典模式（五子获胜）' : '增强模式（六子或以上）';
        const scoreModeText = this.scoreMode === 'none' ? '无计分' : '计分模式（连续多子加分）';
        
        const elements = {
            'current-board-size': boardSizeText,
            'current-game-mode': gameModeText,
            'current-win-mode': winModeText,
            'current-score-mode': scoreModeText,
            'current-move-count': this.moveHistory.length
        };
        
        for (const [id, text] of Object.entries(elements)) {
            const element = document.getElementById(id);
            if (element) {
                element.textContent = text;
            }
        }
        
        // 更新历史记录
        this.updateMoveHistory();
    }
    
    updateMoveHistory() {
        const historyElement = document.getElementById('move-history');
        if (!historyElement) return;
        
        if (this.moveHistory.length === 0) {
            historyElement.innerHTML = '<div class="no-history">暂无棋谱记录</div>';
            return;
        }
        
        let historyHtml = '';
        for (let i = 0; i < this.moveHistory.length; i++) {
            const move = this.moveHistory[i];
            const moveClass = move.player === 'black' ? 'black' : 'white';
            const playerText = move.player === 'black' ? '●' : '○';
            const coordinates = String.fromCharCode(65 + move.y) + (move.x + 1);
            
            historyHtml += `<div class="move-item ${moveClass}">${move.moveNumber}. ${playerText} ${coordinates} ${move.timestamp}</div>`;
        }
        
        historyElement.innerHTML = historyHtml;
        historyElement.scrollTop = historyElement.scrollHeight;
    }
    
    // 回放相关方法
    startReplay() {
        if (this.moveHistory.length === 0) return;
        
        this.originalHistory = this.moveHistory.map(move => ({...move}));
        this.isReplaying = true;
        this.replayIndex = 0;
        
        // 隐藏游戏控制，显示回放控制
        document.querySelector('.game-controls').style.display = 'none';
        document.querySelector('.replay-controls').style.display = 'flex';
        
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
        
        if (this.replayInterval) {
            clearInterval(this.replayInterval);
            this.replayInterval = null;
            document.getElementById('replay-play').textContent = '播放';
        } else {
            document.getElementById('replay-play').textContent = '暂停';
            this.replayInterval = setInterval(() => {
                if (this.replayIndex < this.originalHistory.length) {
                    this.replayNext();
                } else {
                    clearInterval(this.replayInterval);
                    this.replayInterval = null;
                    document.getElementById('replay-play').textContent = '播放';
                }
            }, 1000);
        }
    }
    
    updateReplayBoard() {
        this.initBoard();
        
        for (let i = 0; i < this.replayIndex; i++) {
            const move = this.originalHistory[i];
            this.board[move.x][move.y] = move.player;
        }
        
        this.drawBoard();
    }
    
    exitReplay() {
        this.isReplaying = false;
        this.replayIndex = 0;
        
        if (this.replayInterval) {
            clearInterval(this.replayInterval);
            this.replayInterval = null;
        }
        
        document.querySelector('.game-controls').style.display = 'flex';
        document.querySelector('.replay-controls').style.display = 'none';
        document.getElementById('replay-play').textContent = '播放';
        
        this.moveHistory = this.originalHistory.map(move => ({...move}));
        this.initBoard();
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
        this.stopAllTimers();
        this.drawBoard();
        this.updatePlayerInfo();
        this.updateSettingsPanel();
        
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