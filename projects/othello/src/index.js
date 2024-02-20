var canvas
var ctx
console.log("runningjavcas")
window.onload = function () {
    console.log("runningjavcas")
    canvas = document.getElementById("game-canvas")
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    ctx = canvas.getContext("2d")
    ctx.font = "100px Arial"
    ctx.fillText("Othello Game",0,0)
}

window.onresize = function () {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
}