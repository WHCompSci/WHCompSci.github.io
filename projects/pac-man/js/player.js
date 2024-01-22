function Player(x,y){
    this.x = x;
    this.y = y;
    this.xspeed = 0;
    this.yspeed = 0;
    this.friction = 0.6;
    this.maxSpeed = 10;
    this.width = 50;
    this.height = 100; 
    

    this.step = function(){


    }

    this.draw = function(){
        ctx.fillStyle = "red";
        ctx.fillRect(this.x,this.y,this.width,this.height);

    }

    
}