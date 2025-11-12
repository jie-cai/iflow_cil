// 游戏配置
const BOARD_SIZE = 15;
const EMPTY = 0;
const BLACK = 1;
const WHITE = 2;

// 游戏状态
let board = [];
let currentPlayer = BLACK;
let gameover = false;

// DOM元素
const gameBoard = document.getElementById('game-board');
const currentPlayerSpan = document.getElementById('current-player');
const gameStatus = document.getElementById('game-status');
const restartBtn = document.getElementById('restart-btn');

// 初始化游戏
function initGame() {
    // 初始化棋盘数组
    board = Array(BOARD_SIZE).fill().map(() => Array(BOARD_SIZE).fill(EMPTY));
    
    // 清空游戏状态
    currentPlayer = BLACK;
    gameover = false;
    currentPlayerSpan.textContent = '黑棋';
    gameStatus.textContent = '';
    gameStatus.className = 'game-status';
    
    // 清空棋盘
    gameBoard.innerHTML = '';
    
    // 创建棋盘格子
    for (let i = 0; i < BOARD_SIZE; i++) {
        for (let j = 0; j < BOARD_SIZE; j++) {
            const cell = document.createElement('div');
            cell.className = 'cell';
            cell.dataset.row = i;
            cell.dataset.col = j;
            // 设置格子的绝对定位
            cell.style.left = (j * 30) + 'px';
            cell.style.top = (i * 30) + 'px';
            cell.addEventListener('click', () => handleCellClick(i, j));
            gameBoard.appendChild(cell);
        }
    }
}

// 处理点击事件
function handleCellClick(row, col) {
    // 如果游戏结束或该位置已有棋子，则不处理
    if (gameover || board[row][col] !== EMPTY) {
        return;
    }
    
    // 放置棋子
    placeStone(row, col, currentPlayer);
    
    // 检查游戏是否结束
    if (checkWin(row, col)) {
        gameover = true;
        const winner = currentPlayer === BLACK ? '黑棋' : '白棋';
        gameStatus.textContent = `游戏结束，${winner}获胜！`;
        gameStatus.classList.add('winner');
        return;
    }
    
    // 检查是否平局
    if (checkDraw()) {
        gameover = true;
        gameStatus.textContent = '游戏结束，平局！';
        gameStatus.classList.add('draw');
        return;
    }
    
    // 切换玩家
    currentPlayer = currentPlayer === BLACK ? WHITE : BLACK;
    currentPlayerSpan.textContent = currentPlayer === BLACK ? '黑棋' : '白棋';
}

// 放置棋子
function placeStone(row, col, player) {
    // 更新棋盘状态
    board[row][col] = player;
    
    // 在页面上显示棋子
    const cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
    const stone = document.createElement('div');
    stone.className = `stone ${player === BLACK ? 'black-stone' : 'white-stone'}`;
    cell.appendChild(stone);
}

// 检查是否获胜
function checkWin(row, col) {
    const player = board[row][col];
    if (player === EMPTY) return false;
    
    // 四个方向：水平、垂直、两个对角线
    const directions = [
        [0, 1],   // 水平
        [1, 0],   // 垂直
        [1, 1],   // 主对角线
        [1, -1]   // 副对角线
    ];
    
    // 检查每个方向
    for (const [dx, dy] of directions) {
        let count = 1; // 包含当前棋子
        
        // 正向检查
        for (let i = 1; i < 5; i++) {
            const r = row + dx * i;
            const c = col + dy * i;
            if (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && board[r][c] === player) {
                count++;
            } else {
                break;
            }
        }
        
        // 反向检查
        for (let i = 1; i < 5; i++) {
            const r = row - dx * i;
            const c = col - dy * i;
            if (r >= 0 && r < BOARD_SIZE && c >= 0 && c < BOARD_SIZE && board[r][c] === player) {
                count++;
            } else {
                break;
            }
        }
        
        // 如果连成5子，则获胜
        if (count >= 5) {
            return true;
        }
    }
    
    return false;
}

// 检查是否平局
function checkDraw() {
    // 检查是否所有位置都被占满
    for (let i = 0; i < BOARD_SIZE; i++) {
        for (let j = 0; j < BOARD_SIZE; j++) {
            if (board[i][j] === EMPTY) {
                return false;
            }
        }
    }
    return true;
}

// 重新开始游戏
restartBtn.addEventListener('click', initGame);

// 页面加载完成后初始化游戏
document.addEventListener('DOMContentLoaded', initGame);