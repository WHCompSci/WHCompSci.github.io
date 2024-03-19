// board constants 
const sideLen = 40;
const tileR = sideLen * .4;
const offSetX = window.innerWidth / 2 - 4 * sideLen;
const offSetY = window.innerHeight / 2 - 4 * sideLen;


const minX = offSetX - sideLen * 0.5;
const minY = offSetY - sideLen * 0.5;
const maxX = 7.52 * sideLen + offSetX;
const maxY = 7.51 * sideLen + offSetY;

var canvas;
var ctx;
let board;
let legalMoves; 
console.log("runningjavcas");
window.onload = () => {
    board = Array.from({ length: 8 }, _ => Array(8).fill(0));
    legalMoves = Array.from({ length: 8 }, _ => Array(8).fill(0));
    board[3][3] = 2;
    board[3][4] = 1;
    board[4][3] = 1;
    board[4][4] = 2;
    //legal white starting moves
    legalMoves[4][5] = 1;
    legalMoves[5][4] = 1;
    legalMoves[2][3] = 1;
    legalMoves[3][2] = 1;

    legalMoves[5][3] = 2;
    legalMoves[3][5] = 2;
    legalMoves[4][2] = 2;
    legalMoves[2][4] = 2;

    
    console.log("runningjavcas");
    canvas = document.getElementById("game-canvas");
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    ctx = canvas.getContext("2d");
    console.log(ctx);
    
    console.log(board);
    const gameLoop = setInterval(update, 1000 / 30);
};

addEventListener("click", (ev) => {
    const x = ev.clientX;
    const y = ev.clientY;

    if (x < minX || y < minY || x > maxX || y > maxY) {
        return;
    }
    console.log("inside");

    const gridY = Math.floor((x - minX) / sideLen);
    const gridX = Math.floor((y - minY) / sideLen);
    console.log(gridX);
    console.log(gridY);
    //get the possible tiles to flip
    [tilesToFlip, currentColor] = getPossibleFlips(gridX, gridY); 
    
    if(tilesToFlip.length > 1) {
        for(const [cx, cy] of tilesToFlip) {
            board[cx][cy] = currentColor;
        }
        turn++;
    }
    
   
    
    
    //if we actually flipped any 
    

});
let turn = 1;
// let currentColor = 1;

let isBlack;
const dirs = [
    //starts at top left goes clockwise
    [-1, -1], [0, -1], [1, -1], [1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0]
];
// function isLegal(moveX, moveY) {
//     turn++;
//     currentColor = turn % 2 + 1
//     let oppositeColor = currentColor==1 ? 2 : 1;
    
//     console.log("CURRENTlOCATION "+moveX + ", " + moveY)
    
//     for (const [dx, dy] of dirs) {
//         //adding direction to current spot  
        
//         let changeX = moveX + dx;
//         let changeY = moveY + dy;

        

//         console.log("The direction i'm going in right now is ("+dx+", "+dy+")")
//         //check if the current x and y pos is the oppisite color, if not then continue
//         if (changeX > 7 || changeY > 7 || changeX < 0 || changeY < 0) {
//             console.log("ajacent tile is off the board")
           
//            // console.log(board)
//             continue;
//         }

//         if(board[changeX][changeY] != oppositeColor){
            
//             console.log("not oppositeColor")
//             //console.log(board)
//             continue;
//         }
//         while (true) {
//             changeX += dx;
//             changeY += dy;
//             //add current position to array
//             if (changeX > 7 || changeY > 7 || changeX < 0 || changeY < 0 || board[changeX][changeY] == 0) {
//                 console.log("Checked in a line and I went off the board or I hit an empty")
               
//                 break;
//             }
//             //check if off the board, if so break
//             //check if we hit a same color peice, if so return true
//             if (board[changeX][changeY] == currentColor) {
//                 console.log("Found my same color")
                
//                 //flip

//                 return true;
//             }

//         }
//     }
//     turn--;
//     return false;
// }
// function playingTurn(gridX, gridY) {

//     board[gridX][gridY] = currentColor;

// }
function getPossibleFlips(moveX,moveY)
{
    //create 2D array for available options 
    //create another 2D array to add all optionand then change color for this array
    let currentColor = turn % 2 + 1
    let oppositeColor = currentColor== 1 ? 2 : 1; 
    let allFlips = [[moveX, moveY]]
    if(board[moveX][moveY]==0)
    {
        for (const [dx, dy] of dirs) 
        {
            let changeX = moveX + dx;
         let changeY = moveY + dy;

         //check if the current x and y pos is the oppisite color, if not then continue
            if (changeX > 7 || changeY > 7 || changeX < 0 || changeY < 0) 
            {
            continue;
            }

            if(board[changeX][changeY] != oppositeColor)
            {
                continue;
            
            }
            const tilesToFlip = []
            tilesToFlip.push([changeX,changeY]);
            console.log("got to while loop")
            while (true) {
                changeX += dx;
                changeY += dy;
                //add current position to array
                if (changeX > 7 || changeY > 7 || changeX < 0 || changeY < 0 || board[changeX][changeY] == 0) 
                {
                    break;
                }
            //check if off the board, if so break
            //check if we hit a same color peice, if so return true
                if (board[changeX][changeY] == currentColor) {
                    console.log("Found my same color")
                    console.log("Found my same color")
                    allFlips = [...allFlips, ...tilesToFlip]
                    break;
              
            }
                console.log("flipping tile")
                tilesToFlip.push([changeX,changeY]);
            // board[changeX][changeY] = currentColor;
            // totalFlips++;     
            }
        }
    }
    

    console.log("this is the turn "+turn+" ");
    return [allFlips, currentColor]
}


function update() {

    drawBoard(board, ctx);

}

function drawBoard(board, context) {
    context.fillStyle = "brown";
    context.fillRect(minX - sideLen / 4, minY - sideLen / 4, sideLen * 8 + sideLen / 2, sideLen * 8 + sideLen / 2);
    //.ctx.fillRect(minX-(sideLen/4),minY-(sideLen/4),(sideLen*8),(sidelen*8))


    context.fillStyle = "green";
    context.fillRect(minX, minY, sideLen * 8, sideLen * 8);

    for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {

            if (board[y][x] == 0) continue;

            context.fillStyle = board[y][x] == 1 ? "cornsilk" : "black";
            drawCircle(context, x * sideLen + offSetX, y * sideLen + offSetY, tileR);

        }
    }



    for (let x = minX; x < maxX; x += sideLen) {
        drawLine(context, x, minY, x, maxY);
    }
    for (let y = minY; y < maxY; y += sideLen) {
        drawLine(context, minX, y, maxX, y);
    }


}

function drawCircle(ctx, x, y, radius) {
    ctx.beginPath();
    ctx.arc(x, y, radius, 0, 2 * Math.PI, false);
    ctx.fill();
}
function drawLine(ctx, x1, y1, x2, y2) {
    ctx.strokeStyle = 'black';
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
}
// window.onresize = () => {
//     canvas.width = window.innerWidth;
//     canvas.height = window.innerHeight;
// };