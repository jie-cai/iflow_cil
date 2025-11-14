// 获取DOM元素
const canvas = document.getElementById('parabola-canvas');
const ctx = canvas.getContext('2d');
const aValue = document.getElementById('a-value');
const bValue = document.getElementById('b-value');
const cValue = document.getElementById('c-value');
const aDisplay = document.getElementById('a-display');
const bDisplay = document.getElementById('b-display');
const cDisplay = document.getElementById('c-display');
const equation = document.getElementById('equation');

// 设置画布尺寸
const width = canvas.width;
const height = canvas.height;

// 绘制坐标系
function drawCoordinateSystem() {
    ctx.clearRect(0, 0, width, height);
    
    // 设置坐标系参数
    const originX = width / 2;
    const originY = height / 2;
    const scale = 30; // 每个单位的像素数
    
    // 绘制网格线
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 1;
    
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
    
    // 绘制坐标轴
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    
    // x轴
    ctx.beginPath();
    ctx.moveTo(0, originY);
    ctx.lineTo(width, originY);
    ctx.stroke();
    
    // x轴箭头
    ctx.beginPath();
    ctx.moveTo(width - 10, originY - 5);
    ctx.lineTo(width, originY);
    ctx.lineTo(width - 10, originY + 5);
    ctx.stroke();
    
    // y轴
    ctx.beginPath();
    ctx.moveTo(originX, 0);
    ctx.lineTo(originX, height);
    ctx.stroke();
    
    // y轴箭头
    ctx.beginPath();
    ctx.moveTo(originX - 5, 10);
    ctx.lineTo(originX, 5);
    ctx.lineTo(originX + 5, 10);
    ctx.stroke();
    
    // 标记坐标轴
    ctx.fillStyle = '#000';
    ctx.font = '12px Arial';
    ctx.textAlign = 'center';
    
    // x轴标记
    for (let i = -10; i <= 10; i++) {
        if (i === 0) continue;
        const x = originX + i * scale;
        if (x > 10 && x < width - 10) {
            ctx.fillText(i.toString(), x, originY + 15);
        }
    }
    
    // y轴标记
    for (let i = -10; i <= 10; i++) {
        if (i === 0) continue;
        const y = originY - i * scale;
        if (y > 10 && y < height - 10) {
            ctx.fillText(i.toString(), originX - 15, y + 4);
        }
    }
    
    // 原点标记
    ctx.fillText('0', originX - 10, originY + 15);
}

// 绘制抛物线
function drawParabola(a, b, c) {
    const originX = width / 2;
    const originY = height / 2;
    const scale = 30; // 每个单位的像素数
    
    ctx.beginPath();
    
    // 使用较小的步长以获得平滑曲线
    const step = 0.1;
    
    // 计算x的范围，使抛物线在画布内显示
    const xMin = -width / (2 * scale);
    const xMax = width / (2 * scale);
    
    let isFirst = true;
    for (let x = xMin; x <= xMax; x += step) {
        // 计算y值: y = ax² + bx + c
        const y = a * x * x + b * x + c;
        
        // 转换为画布坐标
        const canvasX = originX + x * scale;
        const canvasY = originY - y * scale; // y轴方向相反
        
        if (isFirst) {
            ctx.moveTo(canvasX, canvasY);
            isFirst = false;
        } else {
            ctx.lineTo(canvasX, canvasY);
        }
    }
    
    // 设置抛物线样式
    ctx.strokeStyle = '#ff0000';
    ctx.lineWidth = 2;
    ctx.stroke();
}

// 更新参数显示
function updateDisplays() {
    aDisplay.textContent = aValue.value;
    bDisplay.textContent = bValue.value;
    cDisplay.textContent = cValue.value;
    
    // 更新方程显示
    let aVal = parseFloat(aValue.value);
    let bVal = parseFloat(bValue.value);
    let cVal = parseFloat(cValue.value);
    
    // 格式化方程显示
    let eqStr = 'y = ';
    
    // 处理a值
    if (aVal === 1) {
        eqStr += 'x²';
    } else if (aVal === -1) {
        eqStr += '-x²';
    } else {
        eqStr += aVal + 'x²';
    }
    
    // 处理b值
    if (bVal > 0) {
        if (bVal === 1) {
            eqStr += ' + x';
        } else {
            eqStr += ' + ' + bVal + 'x';
        }
    } else if (bVal < 0) {
        if (bVal === -1) {
            eqStr += ' - x';
        } else {
            eqStr += ' - ' + Math.abs(bVal) + 'x';
        }
    }
    
    // 处理c值
    if (cVal > 0) {
        eqStr += ' + ' + cVal;
    } else if (cVal < 0) {
        eqStr += ' - ' + Math.abs(cVal);
    }
    
    equation.textContent = eqStr;
}

// 绘制函数
function render() {
    drawCoordinateSystem();
    drawParabola(parseFloat(aValue.value), parseFloat(bValue.value), parseFloat(cValue.value));
    updateDisplays();
}

// 事件监听器
aValue.addEventListener('input', render);
bValue.addEventListener('input', render);
cValue.addEventListener('input', render);

// 初始化
render();