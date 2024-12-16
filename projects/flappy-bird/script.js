const canvas = document.getElementById("game");
const birdImg = new Image()
birdImg.src = "bird.png"
const font = new FontFace("Silkscreen", "url(https://fonts.gstatic.com/s/silkscreen/v4/m8JXjfVPf62XiF7kO-i9YLNlaw.woff2)")
birdImg.onload = () => {
  font.load().then( () => drawTitlePage())
}

const ctx = canvas.getContext("2d");
canvas.height = 400;
canvas.width = 400;
const H = canvas.height;
const W = canvas.width;
const gap = 60;
const thickness = 50;
const ground = 25;
let pipes;
let pipesVx;
let bird;
let score;
let starttime;

const DEFAULT_BIRD_RADIUS = 16
let wasInGapLastUpdate 
let prevTime
function init(ev) {
  

  document.removeEventListener("click", init)
  document.removeEventListener("keypress", init)
  starttime = new Date()
  prevTime = starttime - 10
  pipes = [];
  pipesVx = -0.1;
 bird = {
  x: H / 2,
  y: W / 2,
  vx: 0,
  vy: -0.35,
  r: DEFAULT_BIRD_RADIUS
};
  score = 0;
  wasInGapLastUpdate = false;
addRandomPipe();
addRandomPipe();
  window.requestAnimationFrame(update);
}

function update() {
  const t = Date.now()
  const dt = (t - prevTime)
  console.log(dt)
  prevTime = t
  ctx.fillStyle = "#38BDF8"
  ctx.fillRect(0, 0, W, H);

  
  //moving pipes
  for (const pipe of pipes) {
    pipe.x += pipesVx * dt;

  console.log(pipes[0].x)
    drawPipe(pipe.x, pipe.y, thickness, gap);
    
  }
  //drawing score
  ctx.fillStyle = "white"
  ctx.font = "20px Silkscreen"
  ctx.fillText("Score: "+score,20,30)
  //drawing ground
  
  ctx.fillStyle = "#1E40AF";
  ctx.fillRect(0, H - ground, W, ground);

  //adding new pipes if pipe goes off screen
  if (pipes[0].x < -thickness) {
    pipes.shift();
    addRandomPipe();
  }
  const cor = 0.5
  //checking collision
  
  const {collisionType, pipeIndex} = isColliding()
  if(collisionType == "front" && !wasInGapLastUpdate) {
    endGame()
    
    return;
  }
  if (collisionType == "top") {
    bird.y = pipes[pipeIndex].y-gap+bird.r
    bird.vy = -cor*bird.vy;
  }
  if(collisionType == "bottom") {
    bird.y = pipes[pipeIndex].y+gap-bird.r
    bird.vy = -cor*bird.vy;
  }
  const isInGap = collisionType == "inGap"
  console.log(collisionType)
  if(collisionType == "none" && wasInGapLastUpdate) {
    score++
  }
  wasInGapLastUpdate = isInGap
  //creating bird
  drawBird(bird.x, bird.y, bird.r);
  bird.x += bird.vx * dt ;
  bird.y += bird.vy * dt;
  bird.vy += 0.0009 * dt;
  //adding a ground
  if (bird.y > H - ground - bird.r) {
    endGame()
    return;

  }
  if (bird.y < bird.r) {
    bird.y = bird.r;
    bird.vy = 0;
  }
  window.requestAnimationFrame(update);
}
//function to draw a bird using x, y, and radius
function drawBird(x, y, r) {
  r *= 1.1 // make bird appear bigger than hitbox
//   ctx.fillStyle = "#FBBF24";
//   ctx.beginPath();
//   ctx.arc(x, y, r, 0, 2 * Math.PI);
//   ctx.fill();
    const aspectRatio = birdImg.height / birdImg.width
    ctx.drawImage(birdImg, x-r, y-r*aspectRatio, 2*r, 2*r * aspectRatio)
}
//function to draw pipe
function drawPipe(x, y, thickness, gap) {
  ctx.fillStyle = "#15803D";
  ctx.fillRect(x, 0, thickness, y - gap);
  ctx.fillRect(x, y + gap, thickness, H - (y + gap));
}
//adding a new pipe with random gap placement and distance
function addRandomPipe() {
  const lastPipeX = pipes.length > 0 ? pipes[pipes.length - 1].x : W/2;
  const minDist = 250;
  const maxDist = 450;
  const minY = gap;
  const maxY = H - (ground + gap);

  const newPipe = {
    x: lastPipeX + Math.random() * (maxDist - minDist) + minDist,
    y: Math.random() * (maxY - minY) + minY
  };
  pipes.push(newPipe);
}
//checking if bird is colliding with pipes
function isColliding() {
  for (let i = 0; i < pipes.length; i++) {
    const pipe = pipes[i]
    const onPipe =  bird.x + bird.r > pipe.x && bird.x - bird.r < pipe.x + thickness
    if(!onPipe) continue
    const onFrontEdge = bird.x + bird.r > pipe.x && bird.x - bird.r < pipe.x
      if (bird.y - bird.r < pipe.y - gap) {
        return {collisionType: onFrontEdge ? "front" : "top", pipeIndex: i}
      }
      if (bird.y + bird.r > pipe.y + gap) {
        return {collisionType: onFrontEdge ? "front" : "bottom", pipeIndex: i}
      }
    return {collisionType: "inGap", pipeIndex: i};
    }
   
    return {collisionType: "none", pipeIndex: -1};
}

function endGame()
{
  ctx.fillStyle = "white"
  ctx.strokeStyle = 'red'
  ctx.lineWidth = 10
  ctx.fillRect(0, 0, W, H);
  ctx.strokeRect(0, 0, W, H);

  document.addEventListener("click", drawTitlePage, {once: true})
  ctx.fillStyle = "red";
  ctx.font = "30px Silkscreen"
  drawCenteredText("Game Over!", 150)
  ctx.fillStyle = "black";
  ctx.font = "20px Silkscreen"
  drawCenteredText("Click Anywhere To Restart", 200)
  drawCenteredText("Score",250) 
  ctx.font = "64px Silkscreen"
  drawCenteredText(score, 310)

  
  
}

function drawCenteredText(txt, height) {
   
  const textWidth = ctx.measureText(txt).width;
  ctx.fillText(txt, (W/2)-(textWidth/2), height);
}


function drawTitlePage()
{
  ctx.fillStyle = "#38BDF8";
  ctx.fillRect(0,0,W,H);
  ctx.fillStyle = "white";
  ctx.font = "35px Silkscreen";
  drawCenteredText("Flappy Bird", H/4);
  drawBird(W/2,H/2,DEFAULT_BIRD_RADIUS)
  ctx.fillStyle = "white";
  ctx.font = "20px Silkscreen";
  drawCenteredText("Click Anywhere to Start",3*H/4);
  ctx.fillStyle = "#1E40AF";
  ctx.fillRect(0, H - ground, W, ground);
  document.addEventListener("click", init, { once: true })
  document.addEventListener("keypress", init, {once: true})
 
}

//init();
//pressing space to jump
let keyPressed = false;
document.onkeypress = (e) => {
  if (keyPressed) return;
  //console.log(e.key);
  if (e.key == " ") {
    bird.vy = -0.35;
    keyPressed = true;
  }
};

document.addEventListener("keyup", () => {
  keyPressed = false;
});
