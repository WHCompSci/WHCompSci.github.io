console.log("p");

document.addEventListener("keydown", function(e) {
    
    if (e.code == 'ArrowRight') vxr =  5;
    if (e.code == 'ArrowLeft') vxl =  -5;
    if (e.code == 'ArrowUp') vy =  -5;
    if (e.code == 'ArrowDown') vy =  5;
})

document.addEventListener("keyup",function(e){
    if (e.code == 'ArrowRight') vxr =  0;
    if (e.code == 'ArrowLeft') vxl =  0;
    if (e.code == 'ArrowUp') vy =  0;
    if (e.code == 'ArrowDown') vy =  0;
})