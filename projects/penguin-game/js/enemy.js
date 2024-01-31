function Enemy(x,y,xspd,yspd)
{ 
    this.x = x;
    this.y = y;
    this.xspeed = xspd;
    this.yspeed = yspd;
    this.width = (canvas.width * (Math.random()*200)/1920);
    this.height = (canvas.height * (Math.random()*200)/1080); 
    this.active = true;
    this.numrespawns = 0;

    this.step = function()
    {
        if (this.active)
        {
            this.x += this.xspeed; 
            this.y += this.yspeed;
        }
        if (this.y > canvas.height)
        {
            this.numrespawns++;
            this.y = 0;
            this.x = Math.random()*canvas.width;
            this.width = (canvas.width * (Math.random()*200)/1920);
            this.height = (canvas.height * (Math.random()*200)/1080);
            this.yspeed = (Math.random()*10)+(1*this.numrespawns);
        }
        if (this.x > canvas.width)
        {
            this.numrespawns++;
            this.y = Math.random()*canvas.height;
            this.x = 0;
            this.width = (canvas.width * (Math.random()*200)/1920);
            this.height = (canvas.height * (Math.random()*200)/1080);
            this.xspeed = (Math.random()*10)+(1*this.numrespawns);
        }
        if (this.x < -this.width)
        {
            this.numrespawns++;
            this.y = Math.random()*canvas.height;
            this.x = canvas.width;
            this.width = (canvas.width * (Math.random()*200)/1920);
            this.height = (canvas.height * (Math.random()*200)/1080);
            this.xspeed = -((Math.random()*10)+(1*this.numrespawns));
        }

        if (this.y < -canvas.height)
        {
            this.numrespawns++;
            this.y = canvas.height;
            this.x = Math.random()*canvas.width;
            this.width = (canvas.width * (Math.random()*200)/1920);
            this.height = (canvas.height * (Math.random()*200)/1080);
            this.yspeed = -((Math.random()*10)+(1*this.numrespawns));
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