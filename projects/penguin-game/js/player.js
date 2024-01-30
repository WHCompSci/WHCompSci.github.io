function Player(x,y,width,height,canvaswidth,canvasheight){
    this.x = x;
    this.y = y;
    this.xspeed = 0;
    this.yspeed = 0;
    this.angle = 90;
    this.friction = .99; //friction increases as levels go up
    this.maxSpeed = 0.001*this.cheight;
    this.width = width; //160 actual penguin dimensions
    this.height = height; //188
    this.isAlive = true;
    this.active = true;

    this.cwidth = canvaswidth;
    this.cheight = canvasheight;

    this.step = function(){




        if (this.active){
            if(!leftKey && !rightKey || leftKey && rightKey )
            {
                this.xspeed *= this.friction;
            } else if (rightKey){
                this.xspeed += .001*this.cheight;
            } else if (leftKey){
                this.xspeed -= .001*this.cheight;
            }
            
            if(!downKey && !upKey || downKey && upKey )
            {
                this.yspeed *= this.friction;
            } else if (downKey){
                this.yspeed += .001*this.cheight;
            } else if (upKey){
                this.yspeed -= .001*this.cheight;
            }


            const widthScale = this.width / (this.cwidth * (160 / 1920));
            const heightScale = this.height / (this.cheight * (188 / 1080));
            this.xspeed *= widthScale;
            this.yspeed *= heightScale;

            const magnitude = Math.sqrt(this.xspeed*this.xspeed + this.yspeed*this.yspeed);
            if(magnitude > this.maxSpeed)
            {
                const scaleF = this.maxSpeed/magnitude;
                this.xspeed *= scaleF;
                this.yspeed *= scaleF;
            } 


            
            
            
            if(this.x<300 || this.x> 1460||this.y<-120|| this.y > canvas.width){
                this.isAlive = false;
            }
            this.x += this.xspeed;
            this.y += this.yspeed;
            
        }

    }

    this.draw = function(){
        var img = new Image();
        img.src = "orange_penguin (1).png";
        ctx.drawImage(img, this.x, this.y,this.width,this.height);
        ctx.fillStyle = "rgba(255, 0, 0, 0.0)";// change last param to see fallbox
        ctx.fillRect(this.x,this.y,this.width,this.height);
        console.log(this.isAlive);
        
    }


    
    
    
}