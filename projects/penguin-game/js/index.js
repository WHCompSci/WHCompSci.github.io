//starting variables
var canvas
var ctx

var upKey
var rightKey
var downKey
var leftKey
var enterKey = true

var resetCount = 0

//Create game variables
var gameLoop
var player
var score = 0;
let enemies


//runs on page load
window.onload = function () {
    canvas = document.getElementById("game-canvas")
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    ctx = canvas.getContext("2d")

    setupInputs()

    player = new Player(
        canvas.width / 2 - (canvas.width * 160) / 1920,
        canvas.height / 2 - (canvas.height * 188) / 1080,
        (canvas.width * 160) / 1920 /*-20*/,
        (canvas.height * 188) / 1080,
        canvas.width,
        canvas.height
    )
    player.setActive(false)

    enemy = new Enemy(
        Math.random() * canvas.width,
        0,
        0,
        Math.random() * 10 + 1
    )
    enemy2 = new Enemy(
        0,
        Math.random() * canvas.height,
        Math.random() * 10 + 1,
        0
    )
    enemy3 = new Enemy(
        Math.random() * canvas.width,
        canvas.height,
        0,
        -(Math.random() * 10 + 1)
    )
    enemy4 = new Enemy(
        canvas.width,
        Math.random() * canvas.height,
        -(Math.random() * 10) + 1,
        0
    )
    enemies = [enemy, enemy2, enemy3, enemy4];

    gameLoop = setInterval(step, 1000 / 30)
}

function step() {
    resetCount++
    enemy.step()
    enemy2.step()
    enemy3.step()
    enemy4.step()
    player.step()

    if (player.isAlive){
    score = enemy.numrespawns + enemy2.numrespawns +enemy3.numrespawns+enemy4.numrespawns;
    console.log(score);}



    for (const e of enemies) {
        if (isColliding(player, e)) {

            //if (e.xspeed !== 0) { player.xspeed = e.xspeed } 
            //else{player.yspeed=0}
            //if (e.yspeed !== 0) { player.yspeed = e.yspeed }
            //else{player.xspeed=0}
            player.xspeed += e.xspeed
            player.yspeed += e.yspeed
        }
        
    }
    

    if (resetCount === 20) {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
        resetCount = 0
    }
    draw()
}

function draw() {
    ctx.fillStyle = "blue"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    ctx.fillStyle = "white"
    const sideLen = canvas.height * 0.8
    const centerX = canvas.width / 2
    const centerY = canvas.height / 2

    ctx.fillRect(
        centerX - sideLen * 0.5,
        centerY - 0.5 * sideLen,
        sideLen,
        sideLen
    )

    ctx.fillStyle = "Black"
    ctx.font = "30px Arial"
    ctx.fillText("Score: "+score, 30, 30)
    
    if(!player.isAlive){ctx.font = "50px Arial"
    ctx.fillText("You Lose! press 'r' to retry", canvas.width / 2 - 300, canvas.height / 2)}

    enemy.draw()
    enemy2.draw()
    enemy3.draw()
    enemy4.draw()

    player.draw()

    if (enterKey) {
        ctx.fillStyle = "rgb(177, 216, 224)"
        ctx.fillRect(0, 0, canvas.width, canvas.height)
        ctx.fillStyle = "Black"
        ctx.font = "100px Arial"
        ctx.fillText("Penguin Game", canvas.width / 2 - 300, canvas.height / 2)
        ctx.font = "30px Arial"
        ctx.fillText(
            "By: Nick Staada                    Press enter to start",
            canvas.width / 2 - 300,
            canvas.height / 2 + 100
        )
    }

    
}

function isColliding(gameObject1, gameObject2) {
    const gameObject1top = gameObject1.y
    const gameObject1bottom = gameObject1.y + gameObject1.height
    const gameObject1left = gameObject1.x
    const gameObject1right = gameObject1.x + gameObject1.width
    const gameObject2top = gameObject2.y
    const gameObject2bottom = gameObject2.y + gameObject2.height
    const gameObject2left = gameObject2.x
    const gameObject2right = gameObject2.x + gameObject2.width
    return (
        gameObject1left < gameObject2right &&
        gameObject1right > gameObject2left &&
        gameObject1top < gameObject2bottom &&
        gameObject1bottom > gameObject2top
    )
}

function setupInputs() {
    document.addEventListener("keydown", function (event) {
        if (event.key === "w" || event.key === "ArrowUp") {
            upKey = true
        } else if (event.key === "a" || event.key === "ArrowLeft") {
            leftKey = true
        } else if (event.key === "s" || event.key === "ArrowDown") {
            downKey = true
        } else if (event.key === "d" || event.key === "ArrowRight") {
            rightKey = true
        }
        if (event.key === "Enter") {
            enterKey = false
            player.setActive(true)
        }
        if (event.key === "r") {
            location.reload();
        }
    })

    document.addEventListener("keyup", function (event) {
        if (event.key === "w" || event.key === "ArrowUp") {
            upKey = false
        } else if (event.key === "a" || event.key === "ArrowLeft") {
            leftKey = false
        } else if (event.key === "s" || event.key === "ArrowDown") {
            downKey = false
        } else if (event.key === "d" || event.key === "ArrowRight") {
            rightKey = false
        }
    })
}
