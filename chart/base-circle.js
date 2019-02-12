 class BaseCircle{
     constructor(canvas,w=500,h=500,padding=64,r){
         this.van = canvas.getContext('2d');
         canvas.width = w;// 设置canvas的宽度
         canvas.height = h;// 设置canvas的高度
         this.w = w;
         this.h = h;
         this.r = r || h > w ? (w - padding * 2) / 2 : (h - padding * 2) / 2;
         this.padding = padding;// 图标距离边框的内边距
         this.circle = {x:w / 2 - padding / 2, y: h / 2, maxR:h > w ? (w - padding * 2) / 2 : (h - padding * 2) / 2};
         this.color = new Color();
     }

     getContext(){
         return this;
     }

     drawLegend(data,wKey,hKey){
        let allLgH = 18 * data.length;
        let yOffset = this.circle.y - allLgH / 2;
        let xOffset = this.circle.x + this.padding / 2 + this.circle.maxR;
        this.van.save();
        this.van.translate(xOffset,yOffset);
        data.forEach((item, i) => {
            let color = this.color.getColor(i);
            let str = item[wKey];
            if(item[hKey] === 0){
                color = '#d4d4d4';
                str += '--> 0';
            }
            this.drawLegendCircle(i,str,color);
        });
        this.van.restore();
     }

     drawLegendCircle(i,str,color){
         this.van.beginPath();
         this.van.fillStyle = color;
         this.van.font = '12px serif';
         this.van.arc(10,i * 18,5,0,Math.PI*2);
         this.van.fillText(str,25,i * 18 + 3);
         this.van.fill();
         this.van.closePath();
     }
 }


 class Nightingale extends BaseCircle{
    constructor(opt,canvas,data,wKey,hKey, type='circle'){
        super(canvas, opt.w, opt.h, opt.padding, opt.r);
        super.drawLegend(data,wKey,hKey);
        this.parent = super.getContext();
        this.isRinglike = false;// 是否扩大内环以承载负数；只有在数据中寄存在负数又存在正数时为true。
        this.type = type;
        this.formatData = this.calculateAll(data, hKey);// 获取计算后端数据
        this.drawNightingale(data,wKey,hKey);
    }

     drawNightingale(data,wKey,hKey){
        let R = this.parent.r > this.parent.circle.maxR ? this.parent.circle.maxR : this.parent.r;

        this.formatData.forEach((item,index) => {
            if(this.isRinglike){// 正负数同时存在
                if(item[hKey] >= 0){// 第一次只绘制正数
                    this.drawSector(
                        item.maxRpersent*R,
                        item.deg,
                        this.parent.color.getColor(index),
                        item.offSetDeg,
                        item[hKey]
                    );
                }
            }else{
                this.drawSector(
                    item.maxRpersent*R,
                    item.deg,
                    this.parent.color.getColor(index),
                    item.offSetDeg,
                    item[hKey]
                );
            }
        });

         if(this.isRinglike){
             this.drawCircleClip();
             this.formatData.forEach((item,index) => {
                 if(item[hKey] <= 0){// 第二次只绘制负数
                     this.drawSector(
                         item.maxRpersent*R,
                         item.deg,
                         this.parent.color.getColor(index),
                         item.offSetDeg,
                         item[hKey],
                         true
                     );
                 }
             });
             this.parent.van.restore();
             this.drawCircleClip(true);
         }

     }

     calculateAll(data, hKey){
        let isPlus = false; // 是否有正数
        let isNegative = false; // 是否有负数
        let max = 0;
        let all = 0;
        data.forEach(item => {
            all += Math.abs(item[hKey]);
            if(Math.abs(item[hKey]) > max){
                max = Math.abs(item[hKey]);
            }
            if(item[hKey] >= 0){
                isPlus = true;
            }else{
               isNegative = true;
            }
        });
        this.isRinglike = (isPlus && isNegative);
        if(!this.isRinglike){
            this.isRinglike = this.type === 'ring';
        }
        const uintDeg = Math.PI / 180;
        let offsetDeg = 0;
         const array = JSON.parse(JSON.stringify(data));
         const evalDeg = 360 / array.length * uintDeg;
         array.map((item, index) => {
            // item.deg = evalDeg; // 角度均等方式
            item.deg = (Math.abs(item[hKey]))/ all * 360 * uintDeg;
            if(index !== 0){
                item.offSetDeg =offsetDeg;
            }else{
                item.offSetDeg = offsetDeg;
            }
            offsetDeg += item.deg;
            if(this.isRinglike){
                // 当正负数同时存在时，所占半径比,最小沾0.5
                item.maxRpersent = 0.5 + Math.abs(item[hKey]/2) / max;
            }else{
                item.maxRpersent = Math.abs(item[hKey]) / max; // 所占半径比
            }
            return item;
        });
        return array;
     }

     drawSector(raduis, deg, color, offSetDeg, value, notDrawCircle){
         const x = this.parent.circle.x;
         const y = this.parent.circle.y;

         const vr = this.isRinglike ? 10 : 0; // 虚拟半径，即每个扇形基于圆心的偏移量
         const clipR = vr > 0 ?  this.parent.r/2 : 0; // 覆盖半径的长度

         console.log(value,notDrawCircle);

         this.drawStart(x,y,vr, raduis, deg, color, offSetDeg);
         if(!notDrawCircle){
             this.drawCircle(x,y,vr,clipR);
         }
     }

     drawCircle(x, y, vr, clipR){
         // this.parent.van.save();
         this.parent.van.beginPath();
         this.parent.van.fillStyle = '#FFFFFF';
         this.parent.van.arc(x-vr,y,vr + clipR,0,Math.PI*2);
         this.parent.van.fill();
         this.parent.van.closePath();
         // this.parent.van.restore();
     }

     drawCircleClip(isPointCircle){
         const x = this.parent.circle.x;
         const y = this.parent.circle.y;

         const vr = this.isRinglike ? 10 : 0; // 虚拟半径，即每个扇形基于圆心的偏移量
         let clipR = vr > 0 ?  this.parent.r/2 : 0; // 覆盖半径的长度
         if(isPointCircle){
             clipR = 0.333 * clipR;
         }
         this.parent.van.save();
         this.parent.van.beginPath();
         this.parent.van.fillStyle = '#FFFFFF';
         this.parent.van.arc(x-vr,y,vr + clipR,0,Math.PI*2);
         this.parent.van.fill();
         this.parent.van.clip();
         this.parent.van.closePath();
         if(isPointCircle){
             (this).van.restore();
         }

     }

     drawStart(x,y,vr, raduis, deg, color, offSetDeg){
         this.parent.van.save();

         this.parent.van.translate(x-vr,y);
         this.parent.van.rotate(offSetDeg);
         this.parent.van.translate(vr,0);
         this.parent.van.beginPath();
         this.parent.van.fillStyle = color || '#000';
         this.parent.van.strokeStyle = color || '#000';
         this.parent.van.moveTo(raduis,0);
         this.parent.van.lineTo(0,0);

         this.parent.van.save();
         this.parent.van.rotate(deg);
         this.parent.van.lineTo(raduis,0);
         this.parent.van.stroke();
         this.parent.van.fill();
         this.parent.van.restore();

         this.parent.van.arc(0,0,raduis,0,deg);
         this.parent.van.fill();
         this.parent.van.closePath();

         this.parent.van.restore();
     }

 }

 class Color{
    getColor(i=0){
        const colors = [
            '#00a3ff',
            '#66c2ff',
            '#00e3cf',
            '#00cf68',
            '#5fe39a',
            '#95ed60',
            '#ffd300',
            '#f6a36a',
            '#54bc81',
            '#3f518c',
            '#839bf0',
            '#8d79da',
            '#a059ed',
            '#bd87f7',
            '#67a0f0',
            '#00cfcd',
            '#5de8e6',
            '#5252d7',
            '#5E610B',
            '#8A4B08',
            '#2A0A12'
        ];
        return colors[i%colors.length];
    }
 }






