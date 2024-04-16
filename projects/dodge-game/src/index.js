var upKey
var rightKey
var downKey
var leftKey


window.onload = function ()
{
    canvas = document.getElementById("background")
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    ctx = canvas.getContext("2d")

    setupInputs()
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