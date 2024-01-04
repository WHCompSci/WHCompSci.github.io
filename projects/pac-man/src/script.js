console.log("z");
var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");

ctx.fillStyle = "red";

let x = 0;
let y = 0;

function update(){
    ctx.fillRect(x, y , 50 , 100)
    requestAnimationFrame(update)
}
update()
