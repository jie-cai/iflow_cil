// 获取画布和上下文
const canvas = document.getElementById('parabola-canvas');
const ctx = canvas.getContext('2d');

// 获取控制元素
const aSlider = document.getElementById('a-value');
const hSlider = document.getElementById('h-value');
const kSlider = document.getElementById('k-value');

const aDisplay = document.getElementById('a-display');
const hDisplay = document.getElementById('h-display');
const kDisplay = document.getElementById('k-display');

const aEquation = document.getElementById('a-equation');
const hEquation = document.getElementById('h-equation');
const kEquation = document.getElementById('k-equation');

const vertexH = document.getElementById('vertex-h');
const vertexK = document.getElementById('vertex-k');

// 初始化参数
let a = parseFloat(aSlider.value);
let h = parseFloat(hSlider.value);
let k = parseFloat(kSlider.value);

// 更新显示值
function updateDisplays() {
    aDisplay.textContent = a;
    hDisplay.textContent = h;
    kDisplay.textContent = k;
    
    aEquation.textContent = a;
    hEquation.textContent = h;
    kEquation.textContent = k;
    
    vertexH.textContent = h;
    vertexK.textContent = k;
}

// 绘制坐标系
function drawCoordinateSystem() {
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    
    // 清空画布
    ctx.clearRect(0, 0, width, height);
    
    // 绘制网格
    ctx.strokeStyle = '#ddd';
    ctx.lineWidth = 1;
    
    // 垂直网格线
    for (let x = 0; x <= width; x += 30) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
    }
    
    // 水平网格线
    for (let y = 0; y <= height; y += 30) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
    }
    
    // 绘制坐标轴
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 2;
    
    // X轴
    ctx.beginPath();
    ctx.moveTo(0, centerY);
    ctx.lineTo(width, centerY);
    ctx.stroke();
    
    // Y轴
    ctx.beginPath();
    ctx.moveTo(centerX, 0);
    ctx.lineTo(centerX, height);
    ctx.stroke();
    
    // 绘制刻度和标签
    ctx.fillStyle = '#000';
    ctx.font = '12px Arial';
    
    // X轴刻度
    for (let i = -10; i <= 10; i++) {
        if (i === 0) continue; // 跳过原点
        const x = centerX + i * 30;
        if (x > 0 && x < width) {
            ctx.beginPath();
            ctx.moveTo(x, centerY - 5);
            ctx.lineTo(x, centerY + 5);
            ctx.stroke();
            ctx.fillText(i.toString(), x - 5, centerY + 20);
        }
    }
    
    // Y轴刻度
    for (let i = -10; i <= 10; i++) {
        if (i === 0) continue; // 跳过原点
        const y = centerY - i * 30;
        if (y > 0 && y < height) {
            ctx.beginPath();
            ctx.moveTo(centerX - 5, y);
            ctx.lineTo(centerX + 5, y);
            ctx.stroke();
            ctx.fillText(i.toString(), centerX + 10, y + 5);
        }
    }
    
    // 绘制原点
    ctx.fillText('0', centerX + 10, centerY + 20);
    
    // 绘制轴标签
    ctx.fillText('X', width - 20, centerY - 10);
    ctx.fillText('Y', centerX + 10, 20);
}

// 绘制抛物线
function drawParabola() {
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    
    // 绘制抛物线
    ctx.strokeStyle = '#e74c3c';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    let firstPoint = true;
    
    // 计算抛物线点
    for (let pixelX = 0; pixelX <= width; pixelX++) {
        // 将像素坐标转换为数学坐标
        const mathX = (pixelX - centerX) / 30;
        
        // 抛物线方程: y = a(x-h)² + k
        const mathY = a * Math.pow(mathX - h, 2) + k;
        
        // 将数学坐标转换为像素坐标
        const pixelY = centerY - mathY * 30;
        
        // 绘制点
        if (firstPoint) {
            ctx.moveTo(pixelX, pixelY);
            firstPoint = false;
        } else {
            ctx.lineTo(pixelX, pixelY);
        }
    }
    
    ctx.stroke();
    
    // 绘制顶点
    const vertexX = centerX + h * 30;
    const vertexY = centerY - k * 30;
    
    ctx.fillStyle = '#3498db';
    ctx.beginPath();
    ctx.arc(vertexX, vertexY, 5, 0, Math.PI * 2);
    ctx.fill();
}

// 更新所有内容
function updateAll() {
    a = parseFloat(aSlider.value);
    h = parseFloat(hSlider.value);
    k = parseFloat(kSlider.value);
    
    updateDisplays();
    drawCoordinateSystem();
    drawParabola();
}

// 添加事件监听器
aSlider.addEventListener('input', updateAll);
hSlider.addEventListener('input', updateAll);
kSlider.addEventListener('input', updateAll);

// 初始化页面
updateAll();