function Player(x,y,width,height,canvaswidth,canvasheight){
    this.x = x;
    this.y = y;
    this.xspeed = 0;
    this.yspeed = 0;
    this.angle = 90;
    this.friction = .99; //friction increases as levels go up
    
    console.log(this.maxSpeed);
    this.width = width; //160 actual penguin dimensions
    this.height = height; //188
    this.isAlive = true;
    this.setActive = function(active) {
        this.active = active;
      };
    this.cwidth = canvaswidth;
    this.cheight = canvasheight;

    this.maxSpeed = .015*this.cheight;

    this.sideLen = this.cheight * 0.8;
    this.centerX = this.cwidth / 2;
    this.centerY = this.cheight / 2;
   
    this.step = function(){




        if (this.active){
            if(!leftKey && !rightKey || leftKey && rightKey )
            {
                this.xspeed *= this.friction;
            } else if (rightKey){
                this.xspeed += .00082*this.cheight;
            } else if (leftKey){
                this.xspeed -= .00082*this.cheight;
            }
            
            if(!downKey && !upKey || downKey && upKey )
            {
                this.yspeed *= this.friction;
            } else if (downKey){
                this.yspeed += .00082*this.cheight;
            } else if (upKey){
                this.yspeed -= .00082*this.cheight;
            }



            const magnitude = Math.sqrt(this.xspeed*this.xspeed + this.yspeed*this.yspeed);
            if(magnitude > this.maxSpeed)
            {
                const scaleF = this.maxSpeed/magnitude;
                this.xspeed *= scaleF;
                this.yspeed *= scaleF;
            } 


            
            
            
            if(this.x<(this.centerX - this.sideLen * 0.5)-this.width ||this.y< (this.centerY - 0.5 * this.sideLen)-this.height ||  this.x> (this.centerX - this.sideLen * 0.5)+this.sideLen||this.y>(this.centerY - 0.5 * this.sideLen)+this.sideLen){
                this.isAlive = false;
            }
            if (this.isAlive)
            {
                this.x += this.xspeed;
                this.y += this.yspeed;
            }
        }

    }

    this.draw = function(){
        var img = new Image();
        img.src = "orange_penguin (1).png";
        ctx.drawImage(img, this.x, this.y,this.width,this.height);
        ctx.fillStyle = "rgba(255, 0, 0, 0.0)";// change last param to see fallbox
        ctx.fillRect(this.x,this.y,this.width,this.height);
        //console.log(this.isAlive);
        
    }


    
    
    
}