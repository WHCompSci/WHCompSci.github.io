function Player(x,y){
    this.x = x;
    this.y = y;
    this.xspeed = 0;
    this.yspeed = 0;
    this.angle = 90;
    this.friction = .99; //friction increases as levels go up
    this.maxSpeed = 15;
    this.width = 200;
    this.height = 200; 
    this.active = true;

    this.step = function(){
        if (this.active){
            if(!leftKey && !rightKey || leftKey && rightKey )
            {
                this.xspeed *= this.friction;
            } else if (rightKey){
                this.xspeed ++;
            } else if (leftKey){
                this.xspeed --;
            }

            if(!downKey && !upKey || downKey && upKey )
            {
                this.yspeed *= this.friction;
            } else if (downKey){
                this.yspeed ++;
            } else if (upKey){
                this.yspeed --;
            }

            const magnitude = Math.sqrt(this.xspeed*this.xspeed + this.yspeed*this.yspeed);
            if(magnitude > this.maxSpeed)
            {
                const scaleF = this.maxSpeed/magnitude;
                this.xspeed *= scaleF;
                this.yspeed *= scaleF;
            } 

        
            this.x += this.xspeed;
            this.y += this.yspeed;
            //this.angle = Math.atan2(this.yspeed/this.xspeed);
            
        }

    }

    this.draw = function(){
        var img = new Image();
        img.src = "orange_penguin.png";
        ctx.drawImage(img, this.x, this.y);
        ctx.fillStyle = lol;
        ctx.fillRect(this.x,this.y,this.width,this.height);
    }

    
    
    
}