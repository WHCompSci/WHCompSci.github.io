function Player(x,y){
    this.x = x;
    this.y = y;
    this.xspeed = 0;
    this.yspeed = 0;
    this.friction = 0.6; //friction increases as levels go up
    this.maxSpeed = 10;
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










            if(this.xspeed > this.maxSpeed)
            {
                this.xspeed = this.maxSpeed;
            } else if(this.xspeed < -this.maxSpeed)
            {
                this.xspeed = -this.maxSpeed;
            }

            if(this.yspeed > this.maxSpeed)
            {
                this.yspeed = this.maxSpeed;
            } else if(this.yspeed < -this.maxSpeed)
            {
                this.yspeed = -this.maxSpeed;
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