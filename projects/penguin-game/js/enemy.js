function Enemy(x,y,xspd,yspd)
{ 
    this.x = x;
    this.y = y;
    this.xspeed = xspd;
    this.yspeed = yspd;
    this.width = 300;
    this.height = 150; 
    this.active = true;

    this.step = function()
    {
        if (this.active)
        {
            this.x += this.xspeed; 
            this.y += this.yspeed;
        }
    }

    this.draw = function()
    {
        if(this.active)
        {
            ctx.fillStyle = "black";
            ctx.fillRect(this.x,this.y,this.width,this.height);
        }
    }
}