// 二次函数可视化类
class QuadraticFunction {
    constructor() {
        this.canvas = document.getElementById('function-board');
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        
        // 设置默认的二次函数参数
        this.a = 1;
        this.b = 0;
        this.c = 0;
        
        // 坐标原点在画布中心
        this.originX = this.width / 2;
        this.originY = this.height / 2;
        
        // 坐标轴缩放比例
        this.scaleX = 20; // 每个单位长度的像素
        this.scaleY = 20; // 每个单位长度的像素
        
        this.bindEvents();
        this.drawFunction();
    }
    
    bindEvents() {
        document.getElementById('draw-btn').addEventListener('click', () => {
            this.updateFunction();
        });
        
        // 也可以支持按Enter键绘制
        document.querySelectorAll('.function-form input').forEach(input => {
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.updateFunction();
                }
            });
        });
    }
    
    updateFunction() {
        // 获取输入的参数
        this.a = parseFloat(document.getElementById('a').value) || 0;
        this.b = parseFloat(document.getElementById('b').value) || 0;
        this.c = parseFloat(document.getElementById('c').value) || 0;
        
        this.drawFunction();
    }
    
    drawFunction() {
        this.ctx.clearRect(0, 0, this.width, this.height);
        
        // 绘制坐标轴
        this.drawAxes();
        
        // 绘制函数曲线
        this.drawCurve();
    }
    
    drawAxes() {
        this.ctx.save();
        
        // 设置坐标轴颜色为黑色，线宽为1磅
        this.ctx.strokeStyle = '#000';
        this.ctx.lineWidth = 1;
        
        // 绘制x轴
        this.ctx.beginPath();
        this.ctx.moveTo(0, this.originY);
        this.ctx.lineTo(this.width, this.originY);
        this.ctx.stroke();
        
        // 绘制y轴
        this.ctx.beginPath();
        this.ctx.moveTo(this.originX, 0);
        this.ctx.lineTo(this.originX, this.height);
        this.ctx.stroke();
        
        // 绘制x轴箭头
        this.ctx.beginPath();
        this.ctx.moveTo(this.width - 10, this.originY - 5);
        this.ctx.lineTo(this.width, this.originY);
        this.ctx.lineTo(this.width - 10, this.originY + 5);
        this.ctx.stroke();
        
        // 绘制y轴箭头
        this.ctx.beginPath();
        this.ctx.moveTo(this.originX - 5, 10);
        this.ctx.lineTo(this.originX, 5);
        this.ctx.lineTo(this.originX + 5, 10);
        this.ctx.stroke();
        
        // 绘制刻度和标签
        this.drawTicks();
        
        this.ctx.restore();
    }
    
    drawTicks() {
        this.ctx.save();
        
        // 设置刻度文字样式
        this.ctx.fillStyle = '#000';
        this.ctx.font = '12px Arial';
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'top';
        
        // 绘制x轴刻度
        const xTickCount = Math.floor(this.width / (2 * this.scaleX));
        for (let i = -xTickCount; i <= xTickCount; i++) {
            if (i === 0) continue; // 原点不画刻度
            
            const x = this.originX + i * this.scaleX;
            if (x > 0 && x < this.width) {
                this.ctx.beginPath();
                this.ctx.moveTo(x, this.originY - 5);
                this.ctx.lineTo(x, this.originY + 5);
                this.ctx.stroke();
                
                this.ctx.fillText(i.toString(), x, this.originY + 8);
            }
        }
        
        // 绘制y轴刻度
        const yTickCount = Math.floor(this.height / (2 * this.scaleY));
        for (let i = -yTickCount; i <= yTickCount; i++) {
            if (i === 0) continue; // 原点不画刻度
            
            const y = this.originY - i * this.scaleY;
            if (y > 0 && y < this.height) {
                this.ctx.beginPath();
                this.ctx.moveTo(this.originX - 5, y);
                this.ctx.lineTo(this.originX + 5, y);
                this.ctx.stroke();
                
                this.ctx.textAlign = 'right';
                this.ctx.textBaseline = 'middle';
                this.ctx.fillText(i.toString(), this.originX - 8, y);
                this.ctx.textAlign = 'center';
                this.ctx.textBaseline = 'top';
            }
        }
        
        // 绘制原点标签
        if (this.originX > 10 && this.originX < this.width - 10 && 
            this.originY > 10 && this.originY < this.height - 10) {
            this.ctx.textAlign = 'right';
            this.ctx.textBaseline = 'bottom';
            this.ctx.fillText('0', this.originX - 8, this.originY + 8);
        }
        
        this.ctx.restore();
    }
    
    drawCurve() {
        this.ctx.save();
        
        // 设置曲线颜色为红色，线宽为1.5磅
        this.ctx.strokeStyle = 'red';
        this.ctx.lineWidth = 1.5;
        this.ctx.beginPath();
        
        // 计算函数值并绘制曲线
        const step = 1; // 步长设置为1像素
        
        // 从画布的左边到右边绘制曲线
        for (let xPixel = 0; xPixel <= this.width; xPixel += step) {
            // 将像素坐标转换为数学坐标
            const x = (xPixel - this.originX) / this.scaleX;
            
            // 计算二次函数值: y = ax^2 + bx + c
            const y = this.a * x * x + this.b * x + this.c;
            
            // 将数学坐标转换为像素坐标
            const yPixel = this.originY - y * this.scaleY;
            
            if (xPixel === 0) {
                this.ctx.moveTo(xPixel, yPixel);
            } else {
                this.ctx.lineTo(xPixel, yPixel);
            }
        }
        
        this.ctx.stroke();
        this.ctx.restore();
    }
}

// 页面加载完成后初始化二次函数可视化
window.addEventListener('DOMContentLoaded', () => {
    new QuadraticFunction();
});