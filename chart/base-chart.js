
class BaseChart{

    constructor(canvas,w=500,h=400,padding=64,space=50){
        this.van = canvas.getContext('2d');
        canvas.width = w;// 设置canvas的宽度
        canvas.height = h;// 设置canvas的高度
        this.w = w;
        this.h = h;
        this.padding = padding;// 图标距离边框的内边距
        this.space = space; // 折线，散点，柱状横向每个间隔高度
        this.valueToHeight = 0;// 1 value值是多少像素
        this.pointXY = {x:w-padding, y:h-padding};// x轴终点坐标
        this.baseY = h-padding; // x 轴纵坐标的基线位置
        this.drawCoordinate();
    }

    getContext(){
        return this;
    }

    drawCoordinate(){
        this.van.beginPath();
        this.van.strokeStyle = '#dfdfdf';
        this.van.moveTo(this.padding,this.padding - this.space);
        this.van.lineTo(this.padding,this.pointXY.y);
        this.van.lineTo(this.pointXY.x,this.pointXY.y);
        this.van.stroke();
        this.van.closePath();
    }

    drawLegend(data, wKey, hKey){
        // 纵向
        let maxH = 0;
        let minH = 0;
        data.forEach(item => {
            if(item[hKey] > maxH){
                maxH = item[hKey];
            }
            if(item[hKey] < minH){
                minH = item[hKey];
            }
        });
        maxH = this.isIntTen(maxH - minH); // 计算最大高度(包含负数)
        minH = this.isIntTen(minH); // 负数所占高度
        let num = this.addOne(((this.h - this.padding * 2) / this.space).toString());// 计算有几个间隔
        num = minH < 0 ? num - 1 : num;
        let unitH = this.addOne(maxH / num); // 每个间隔数值
        unitH = this.isIntTen(unitH); // 每个间隔数值化为10的倍数
        let negative = this.addOne(minH / unitH); // 负数个数
        if(negative < 0){
            this.baseY = this.baseY - Math.abs(negative) * this.space;
        }
        this.valueToHeight = this.space / unitH;
        let countPain = 0;
        let allCount = negative < 0 ? num+negative+1 : num;
        for(let i=negative;i<=allCount;i++){
            this.van.save();
            this.van.beginPath();
            this.van.font = '16px serif';
            this.van.textAlign = 'right';
            this.van.fillText((i * unitH).toString(),this.padding - 6,(this.pointXY.y) - countPain * this.space + 8,this.padding);
            this.van.setLineDash([4]);
            this.van.lineTo(this.padding,(this.pointXY.y)-countPain*this.space);
            this.van.lineTo(this.pointXY.x,(this.pointXY.y)-countPain*this.space);
            this.van.stroke();
            this.van.closePath();
            this.van.restore();
            countPain++;
        }

        // 横向
        let unitW = this.isIntTen((this.pointXY.x - this.padding) / (data.length + 1));
        this.unitW = unitW;
        data.forEach((item, i) => {
            this.van.beginPath();
            this.van.font = '16px serif';
            this.van.fillRect(this.padding + i * unitW + unitW / 2,this.pointXY.y - 1,2,2);
            this.van.save();
            let wordW = this.van.measureText(item[wKey]).width / 2;
            this.van.translate(this.padding + i * unitW + unitW / 2 - wordW,this.pointXY.y + 18);
            if(wordW*2+16 > unitW){
                this.van.translate(wordW-unitW*0.3,0)
                this.van.rotate(Math.cos(Math.PI/4));
            }
            this.van.fillText(item[wKey],0,0);
            this.van.fill();
            this.van.restore();
            this.van.closePath();
        })
    }

    isIntTen(value){
        let maxH = value;
        if(maxH % 10 !== 0 && maxH > 0){
            maxH = maxH - (maxH % 10) + 10;
        }
        if(maxH % 10 !== 0 && maxH < 0){
            maxH = maxH - (maxH % 10) - 10;
        }
        return maxH;
    }

    addOne(value){
        let result = parseInt(value);
        if(result > 0 && result < value){
            return result + 1;
        }
        if(result < 0 && result > value){
            return result-1;
        }
        return result;
    }
}


class BrokenLine extends BaseChart{
    constructor(opt={},canvas,data=[],wKey,hKey,type){
        super(canvas,opt.w, opt.h, opt.pad, opt.space);
        super.drawLegend(data,wKey,hKey);
        this.data = data;
        this.wKey = wKey;
        this.hKey = hKey;
        this.parent = super.getContext();
        if(type === 'line'){
            this.drawLine();
        }
        if(type === 'point'){
            this.drawPoint();
        }
        if(!type){
            this.drawLine();
            this.drawPoint();
        }
    }

    drawLine(){
        this.parent.van.save();
        this.data.forEach((item,i) => {
            setTimeout(()=>{
                let x = this.padding + i * this.parent.unitW + this.parent.unitW / 2;
                let y = this.parent.baseY - item[this.hKey] * this.parent.valueToHeight;
                this.parent.van.strokeStyle = 'blue';
                this.parent.van.lineTo(x, y);
                this.parent.van.stroke();
            },i*50);
        })
        this.parent.van.restore();
    }

    drawPoint(){
        this.parent.van.save();
        this.data.forEach((item,i) => {
            setTimeout(()=>{
                let x = this.padding + i * this.parent.unitW + this.parent.unitW / 2;
                let y = this.parent.baseY - item[this.hKey] * this.parent.valueToHeight;
                this.parent.van.beginPath();
                this.parent.van.fillStyle = 'blue';
                this.parent.van.arc(x, y,2,0,Math.PI*2);
                this.parent.van.fill();
                this.parent.van.closePath();
            },i * 50)
        })
        this.parent.van.restore();
    }
}


class Histogram extends BaseChart{
    constructor(opt={},canvas,data=[],wKey,hKey){
        super(canvas,opt.w, opt.h, opt.pad, opt.space);
        super.drawLegend(data,wKey,hKey);
        this.data = data;
        this.wKey = wKey;
        this.hKey = hKey;
        this.parent = super.getContext();
        this.drawHistogram();
    }

    drawHistogram(){
        this.parent.van.save();
        this.data.forEach((item,i) => {
            let x = this.padding + i * this.parent.unitW + this.parent.unitW / 2;
            let width = this.parent.unitW / 2;
            let y = item[this.hKey] * this.parent.valueToHeight;
            let animate;
            this.drawHeight(x,width,y,i,0,animate);
        })
        this.parent.van.restore();
    }

    drawHeight(x,width,y,i,currentHeight,animate){
        currentHeight += 10;
        if(currentHeight >= y){
            window.cancelAnimationFrame(animate);
            currentHeight = y;
        }else{
            animate = window.requestAnimationFrame(()=>this.drawHeight(x,width,y,i,currentHeight))
        }
        this.parent.van.beginPath();
        this.parent.van.fillStyle = `rgb(255,${(255/this.data.length)*i},${255-(255/this.data.length)*i})`;
        this.parent.van.fillRect(x - width / 2, this.baseY,width,-currentHeight);
        this.parent.van.fill();
        this.parent.van.closePath();
    }
}




































