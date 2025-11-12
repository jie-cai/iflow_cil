// 游戏配置
const EMPTY = 0;
const BLACK = 1;
const WHITE = 2;

// 游戏状态
let board = [];
let currentPlayer = BLACK;
let gameover = false;
let boardSize = 15; // 默认15x15棋盘
let gameMode = 'standard'; // standard, free, renju
let forbiddenChecks = true; // 是否启用禁手规则
let firstPlayerBlack = true; // 黑棋先手

// DOM元素
const gameBoard = document.getElementById('game-board');
const currentPlayerSpan = document.getElementById('current-player');
const gameStatus = document.getElementById('game-status');
const restartBtn = document.getElementById('restart-btn');
const settingsPanel = document.getElementById('settings-panel');
const gameInterface = document.getElementById('game-interface');
const settingsBtn = document.getElementById('settings-btn');

// 设置面板元素
const boardSizeSelect = document.getElementById('board-size');
const gameModeSelect = document.getElementById('game-mode');
const forbiddenChecksCheckbox = document.getElementById('forbidden-checks');
const firstPlayerBlackCheckbox = document.getElementById('first-player-black');
const startGameBtn = document.getElementById('start-game');

// 初始化游戏
function initGame() {
    // 获取设置
    boardSize = parseInt(boardSizeSelect.value);
    gameMode = gameModeSelect.value;
    forbiddenChecks = forbiddenChecksCheckbox.checked;
    firstPlayerBlack = firstPlayerBlackCheckbox.checked;
    
    // 初始化棋盘数组
    board = Array(boardSize).fill().map(() => Array(boardSize).fill(EMPTY));
    
    // 设置先手
    currentPlayer = firstPlayerBlack ? BLACK : WHITE;
    
    // 清空游戏状态
    gameover = false;
    currentPlayerSpan.textContent = firstPlayerBlack ? '黑棋' : '白棋';
    gameStatus.textContent = '';
    gameStatus.className = 'game-status';
    
    // 设置棋盘大小
    gameBoard.style.width = `calc(30px * ${boardSize} + 2px)`;
    gameBoard.style.height = `calc(30px * ${boardSize} + 2px)`;
    
    // 清空棋盘
    gameBoard.innerHTML = '';
    
    // 创建棋盘格子
    for (let i = 0; i < boardSize; i++) {
        for (let j = 0; j < boardSize; j++) {
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
    
    // 检查禁手规则（仅在连珠规则或标准模式下，且启用禁手检查，且是黑棋）
    if (forbiddenChecks && currentPlayer === BLACK && (gameMode === 'renju' || gameMode === 'standard')) {
        if (isForbiddenMove(row, col)) {
            showForbiddenMove(row, col);
            return;
        }
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
            if (r >= 0 && r < boardSize && c >= 0 && c < boardSize && board[r][c] === player) {
                count++;
            } else {
                break;
            }
        }
        
        // 反向检查
        for (let i = 1; i < 5; i++) {
            const r = row - dx * i;
            const c = col - dy * i;
            if (r >= 0 && r < boardSize && c >= 0 && c < boardSize && board[r][c] === player) {
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
    for (let i = 0; i < boardSize; i++) {
        for (let j = 0; j < boardSize; j++) {
            if (board[i][j] === EMPTY) {
                return false;
            }
        }
    }
    return true;
}

// 检查是否为禁手（根据游戏模式）
function isForbiddenMove(row, col) {
    // 在自由模式下不检查禁手
    if (gameMode === 'free') {
        return false;
    }
    
    // 临时放置棋子以检查禁手
    board[row][col] = BLACK;
    
    // 检查长连（超过五子）
    if (hasOverline(row, col)) {
        board[row][col] = EMPTY;
        return true;
    }
    
    // 在连珠规则下检查三三禁手和四四禁手
    if (gameMode === 'renju') {
        // 检查是否形成两个或以上的活三
        const threeCount = countLiveThrees(row, col, BLACK);
        if (threeCount >= 2) {
            board[row][col] = EMPTY;
            return true;
        }
        
        // 检查是否形成两个或以上的四
        const fourCount = countFours(row, col, BLACK);
        if (fourCount >= 2) {
            board[row][col] = EMPTY;
            return true;
        }
    }
    
    // 恢复棋盘
    board[row][col] = EMPTY;
    return false;
}

// 检查长连（超过五子）
function hasOverline(row, col) {
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
        for (let i = 1; i < 6; i++) {
            const r = row + dx * i;
            const c = col + dy * i;
            if (r >= 0 && r < boardSize && c >= 0 && c < boardSize && board[r][c] === BLACK) {
                count++;
            } else {
                break;
            }
        }
        
        // 反向检查
        for (let i = 1; i < 6; i++) {
            const r = row - dx * i;
            const c = col - dy * i;
            if (r >= 0 && r < boardSize && c >= 0 && c < boardSize && board[r][c] === BLACK) {
                count++;
            } else {
                break;
            }
        }
        
        // 如果超过五子，则为长连
        if (count > 5) {
            return true;
        }
    }
    
    return false;
}

// 计算活三的数量
function countLiveThrees(row, col, player) {
    let count = 0;
    
    // 四个方向：水平、垂直、两个对角线
    const directions = [
        [0, 1],   // 水平
        [1, 0],   // 垂直
        [1, 1],   // 主对角线
        [1, -1]   // 副对角线
    ];
    
    for (const [dx, dy] of directions) {
        // 检查是否能形成活三
        if (isLiveThree(row, col, dx, dy, player)) {
            count++;
        }
    }
    
    return count;
}

// 检查是否为活三
function isLiveThree(row, col, dx, dy, player) {
    // 计算一个方向上的连子数
    let count = 1;
    
    // 正向检查
    for (let i = 1; i < 4; i++) {
        const r = row + dx * i;
        const c = col + dy * i;
        if (r >= 0 && r < boardSize && c >= 0 && c < boardSize && board[r][c] === player) {
            count++;
        } else {
            break;
        }
    }
    
    // 反向检查
    for (let i = 1; i < 4; i++) {
        const r = row - dx * i;
        const c = col - dy * i;
        if (r >= 0 && r < boardSize && c >= 0 && c < boardSize && board[r][c] === player) {
            count++;
        } else {
            break;
        }
    }
    
    // 如果正好是三子连珠
    if (count === 3) {
        // 检查两端是否为空位
        const r1 = row + dx * 3;
        const c1 = col + dy * 3;
        const r2 = row - dx * 3;
        const c2 = col - dy * 3;
        
        const end1Empty = r1 >= 0 && r1 < boardSize && c1 >= 0 && c1 < boardSize && board[r1][c1] === EMPTY;
        const end2Empty = r2 >= 0 && r2 < boardSize && c2 >= 0 && c2 < boardSize && board[r2][c2] === EMPTY;
        
        return end1Empty && end2Empty;
    }
    
    return false;
}

// 计算四的数量
function countFours(row, col, player) {
    let count = 0;
    
    // 四个方向：水平、垂直、两个对角线
    const directions = [
        [0, 1],   // 水平
        [1, 0],   // 垂直
        [1, 1],   // 主对角线
        [1, -1]   // 副对角线
    ];
    
    for (const [dx, dy] of directions) {
        // 检查是否能形成四
        if (isFour(row, col, dx, dy, player)) {
            count++;
        }
    }
    
    return count;
}

// 检查是否为四
function isFour(row, col, dx, dy, player) {
    // 计算一个方向上的连子数
    let count = 1;
    
    // 正向检查
    for (let i = 1; i < 5; i++) {
        const r = row + dx * i;
        const c = col + dy * i;
        if (r >= 0 && r < boardSize && c >= 0 && c < boardSize && board[r][c] === player) {
            count++;
        } else {
            break;
        }
    }
    
    // 反向检查
    for (let i = 1; i < 5; i++) {
        const r = row - dx * i;
        const c = col - dy * i;
        if (r >= 0 && r < boardSize && c >= 0 && c < boardSize && board[r][c] === player) {
            count++;
        } else {
            break;
        }
    }
    
    // 如果正好是四子连珠
    return count === 4;
}

// 显示禁手提示
function showForbiddenMove(row, col) {
    const cell = document.querySelector(`.cell[data-row="${row}"][data-col="${col}"]`);
    cell.classList.add('forbidden-move');
    
    gameStatus.textContent = '禁手！黑棋不能下在此处。';
    gameStatus.classList.add('draw');
    
    // 移除提示类
    setTimeout(() => {
        cell.classList.remove('forbidden-move');
        gameStatus.textContent = '';
        gameStatus.className = 'game-status';
    }, 1000);
}

// 显示设置面板
function showSettings() {
    gameInterface.style.display = 'none';
    settingsPanel.style.display = 'block';
}

// 开始游戏
function startGame() {
    settingsPanel.style.display = 'none';
    gameInterface.style.display = 'block';
    initGame();
}

// 显示游戏模式说明
function updateModeDescription() {
    const standardDesc = document.getElementById('standard-desc');
    const freeDesc = document.getElementById('free-desc');
    const renjuDesc = document.getElementById('renju-desc');
    
    const mode = gameModeSelect.value;
    
    standardDesc.style.display = mode === 'standard' ? 'block' : 'none';
    freeDesc.style.display = mode === 'free' ? 'block' : 'none';
    renjuDesc.style.display = mode === 'renju' ? 'block' : 'none';
}

// 事件监听器
restartBtn.addEventListener('click', startGame);
settingsBtn.addEventListener('click', showSettings);
startGameBtn.addEventListener('click', startGame);

// 监听游戏模式变化
gameModeSelect.addEventListener('change', updateModeDescription);

// 页面加载完成后初始化游戏
document.addEventListener('DOMContentLoaded', function() {
    // 初始化设置面板
    settingsPanel.style.display = 'block';
    gameInterface.style.display = 'none';
    
    // 初始化模式说明
    updateModeDescription();
});