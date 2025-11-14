// 获取画布和上下文
const canvas = document.getElementById('parabola-canvas');
const ctx = canvas.getContext('2d');

// 获取控制元素
const paramA = document.getElementById('param-a');
const paramB = document.getElementById('param-b');
const paramC = document.getElementById('param-c');
const valueA = document.getElementById('value-a');
const valueB = document.getElementById('value-b');
const valueC = document.getElementById('value-c');
const equation = document.getElementById('equation');
const resetBtn = document.getElementById('reset-btn');
const gridToggle = document.getElementById('grid-toggle');
const mouseCoords = document.getElementById('mouse-coords');
const vertexCoords = document.getElementById('vertex-coords');
const axisInfo = document.getElementById('axis-info');

// 画布设置
const width = canvas.width;
const height = canvas.height;
const centerX = width / 2;
const centerY = height / 2;
const scale = 20; // 每单位的像素数

// 状态
let showGrid = true;
let currentA = 1;
let currentB = 0;
let currentC = 0;

// 坐标转换函数
function toCanvasX(x) {
    return centerX + x * scale;
}

function toCanvasY(y) {
    return centerY - y * scale; // y轴向上为正
}

function fromCanvasX(canvasX) {
    return (canvasX - centerX) / scale;
}

function fromCanvasY(canvasY) {
    return -(canvasY - centerY) / scale;
}

// 计算抛物线顶点
function calculateVertex(a, b, c) {
    if (a === 0) return { x: 0, y: c };
    const x = -b / (2 * a);
    const y = a * x * x + b * x + c;
    return { x, y };
}

// 计算对称轴
function calculateAxis(a, b) {
    if (a === 0) return "N/A";
    return `x = ${(-b / (2 * a)).toFixed(2)}`;
}

// 清空画布
function clearCanvas() {
    ctx.clearRect(0, 0, width, height);
}

// 绘制网格
function drawGrid() {
    if (!showGrid) return;
    
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 0.5;
    
    // 垂直线
    for (let x = 0; x <= width; x += scale) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
    }
    
    // 水平线
    for (let y = 0; y <= height; y += scale) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
    }
}

// 绘制坐标轴
function drawAxes() {
    ctx.strokeStyle = '#2d3436';
    ctx.lineWidth = 2;
    
    // x轴
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(width, centerY);
    ctx.stroke();
    
    // y轴
    ctx.beginPath();
    ctx.moveTo(centerX, 0);
    ctx.lineTo(centerX, height);
    ctx.stroke();
    
    // 绘制刻度和标签
    ctx.fillStyle = '#2d3436';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    
    // x轴刻度
    for (let i = -Math.floor(centerX / scale); i <= Math.floor(centerX / scale); i++) {
        if (i !== 0) {
            const x = toCanvasX(i);
            ctx.beginPath();
            ctx.moveTo(x, centerY - 5);
            ctx.lineTo(x, centerY + 5);
            ctx.stroke();
            ctx.fillText(i.toString(), x, centerY + 10);
        }
    }
    
    // y轴刻度
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    for (let i = -Math.floor(centerY / scale); i <= Math.floor(centerY / scale); i++) {
        if (i !== 0) {
            const y = toCanvasY(i);
            ctx.beginPath();
            ctx.moveTo(centerX - 5, y);
            ctx.lineTo(centerX + 5, y);
            ctx.stroke();
            ctx.fillText(i.toString(), centerX + 10, y);
        }
    }
    
    // 原点标签
    ctx.fillText('0', centerX + 10, centerY + 15);
}

// 绘制抛物线
function drawParabola(a, b, c) {
    ctx.strokeStyle = '#e17055';
    ctx.lineWidth = 3;
    ctx.beginPath();
    
    let firstPoint = true;
    
    // 从左边到右边绘制
    for (let canvasX = 0; canvasX <= width; canvasX++) {
        const x = fromCanvasX(canvasX);
        const y = a * x * x + b * x + c;
        const canvasY = toCanvasY(y);
        
        if (canvasY >= 0 && canvasY <= height) {
            if (firstPoint) {
                ctx.moveTo(canvasX, canvasY);
                firstPoint = false;
            } else {
                ctx.lineTo(canvasX, canvasY);
            }
        }
    }
    
    ctx.stroke();
    
    // 绘制顶点
    const vertex = calculateVertex(a, b, c);
    const vertexCanvasX = toCanvasX(vertex.x);
    const vertexCanvasY = toCanvasY(vertex.y);
    
    if (vertexCanvasX >= 0 && vertexCanvasX <= width && 
        vertexCanvasY >= 0 && vertexCanvasY <= height) {
        ctx.fillStyle = '#0984e3';
        ctx.beginPath();
        ctx.arc(vertexCanvasX, vertexCanvasY, 6, 0, 2 * Math.PI);
        ctx.fill();
        
        // 顶点标签
        ctx.fillStyle = '#0984e3';
        ctx.font = 'bold 14px Arial';
        ctx.textAlign = 'left';
        ctx.textBaseline = 'bottom';
        ctx.fillText(`顶点(${vertex.x.toFixed(2)}, ${vertex.y.toFixed(2)})`, 
                    vertexCanvasX + 10, vertexCanvasY - 10);
    }
}

// 更新方程显示
function updateEquation() {
    const a = parseFloat(paramA.value);
    const b = parseFloat(paramB.value);
    const c = parseFloat(paramC.value);
    
    let equationText = 'y = ';
    
    // 处理 a 项
    if (a !== 0) {
        if (a === 1) {
            equationText += 'x²';
        } else if (a === -1) {
            equationText += '-x²';
        } else {
            equationText += `${a}x²`;
        }
    }
    
    // 处理 b 项
    if (b !== 0) {
        if (equationText !== 'y = ') {
            equationText += b > 0 ? ' + ' : ' - ';
            equationText += Math.abs(b) === 1 ? 'x' : `${Math.abs(b)}x`;
        } else {
            equationText += b === 1 ? 'x' : `${b}x`;
        }
    }
    
    // 处理 c 项
    if (c !== 0) {
        if (equationText !== 'y = ') {
            equationText += c > 0 ? ' + ' : ' - ';
            equationText += Math.abs(c);
        } else {
            equationText += c;
        }
    }
    
    // 如果所有系数都是0
    if (equationText === 'y = ') {
        equationText += '0';
    }
    
    equation.textContent = equationText;
    
    // 更新顶点和对称轴信息
    const vertex = calculateVertex(a, b, c);
    vertexCoords.textContent = `(${vertex.x.toFixed(2)}, ${vertex.y.toFixed(2)})`;
    axisInfo.textContent = calculateAxis(a, b);
}

// 绘制整个图形
function draw() {
    clearCanvas();
    drawGrid();
    drawAxes();
    drawParabola(currentA, currentB, currentC);
}

// 更新参数值显示
function updateParameterValues() {
    valueA.textContent = paramA.value;
    valueB.textContent = paramB.value;
    valueC.textContent = paramC.value;
    
    currentA = parseFloat(paramA.value);
    currentB = parseFloat(paramB.value);
    currentC = parseFloat(paramC.value);
    
    updateEquation();
    draw();
}

// 重置参数
function resetParameters() {
    paramA.value = 1;
    paramB.value = 0;
    paramC.value = 0;
    updateParameterValues();
}

// 切换网格显示
function toggleGrid() {
    showGrid = !showGrid;
    draw();
}

// 鼠标移动事件
canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const canvasX = e.clientX - rect.left;
    const canvasY = e.clientY - rect.top;
    
    const x = fromCanvasX(canvasX);
    const y = fromCanvasY(canvasY);
    
    mouseCoords.textContent = `(${x.toFixed(2)}, ${y.toFixed(2)})`;
});

// 事件监听器
paramA.addEventListener('input', updateParameterValues);
paramB.addEventListener('input', updateParameterValues);
paramC.addEventListener('input', updateParameterValues);
resetBtn.addEventListener('click', resetParameters);
gridToggle.addEventListener('click', toggleGrid);

// 初始化
updateParameterValues();
draw();