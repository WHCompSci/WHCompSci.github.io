function Player(x,y){
    this.x = x;
    this.y = y;
    this.xspeed = 0;
    this.yspeed = 0;
    this.friction = .99; //friction increases as levels go up
    this.maxSpeed = 15;
    this.width = 40;
    this.height = 40; 
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
        }

    }

    this.draw = function(){
        ctx.fillStyle = "red";
        ctx.fillRect(this.x,this.y,this.width,this.height);

    }

    
}