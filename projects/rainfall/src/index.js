// board constants
const sideLen = 80
const BOARD_SIZE = 7
const tileR = sideLen * 0.4
const offSetX = window.innerWidth / 2 - BOARD_SIZE * sideLen * 0.5
const offSetY = window.innerHeight / 2 - BOARD_SIZE * sideLen * 0.5
const minX = offSetX - sideLen * 0.5
const minY = offSetY - sideLen * 0.5
const maxX = (BOARD_SIZE - 0.5) * sideLen + offSetX
const maxY = (BOARD_SIZE - 0.5) * sideLen + offSetY

let canvas
let ctx
const PLAYER_COLORS = ['orange', 'green']
const PLAYER_SCORES = [0, 0, 0]
const NUMBER_OF_PLAYERS = PLAYER_COLORS.length
let player_territory = Array.from({ length: BOARD_SIZE }, _ =>
  Array(BOARD_SIZE).fill(-1)
) //-1 means no player has claimed this territory, 0,1,2 means player 0,1,2 has claimed this territory
let tile_powers = Array.from({ length: BOARD_SIZE }, _ =>
  Array(BOARD_SIZE).fill(0)
) //0 means no power, 1,2,3 means power level 1,2,3
window.onload = () => {
  canvas = document.getElementById('game-canvas')
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  ctx = canvas.getContext('2d')
  console.log(ctx)
  const gameLoop = setInterval(update, 1000 / 30)
}

addEventListener('click', ev => {
  const x = ev.clientX
  const y = ev.clientY
  if (x < minX || y < minY || x > maxX || y > maxY) {
    return
  }
  console.log('inside')

  const gridX = Math.floor((x - minX) / sideLen)
  const gridY = Math.floor((y - minY) / sideLen)
  console.log(gridX)
  console.log(gridY)
  doTurn(gridY, gridX)
})

let turn = 0
async function doTurn (gridY, gridX) {
  let player = turn % NUMBER_OF_PLAYERS
  //if we are trying to claim a territory that has already been claimed by someone other than us, return
  if (
    player_territory[gridY][gridX] != -1 &&
    player_territory[gridY][gridX] != player
  ) {
    return
  }
  //if we are trying to claim a territory that has a power level of <= 2, claim it, incement the player score and power lvl and return
  if (tile_powers[gridY][gridX] <= 2) {
    player_territory[gridY][gridX] = player //if the territory is unclaimed or claimed by us, claim it
    PLAYER_SCORES[player]++
    tile_powers[gridY][gridX]++
    turn++

    return
  }
  //if we are trying to claim a territory that has a power level of 3, claim it, incement the player score, power lvl and spread the power to the adjacent territories, then return,

  tile_powers[gridY][gridX]++
  let draw_trigger = 0
  const queue = [[gridY, gridX, 0]]
  while (queue.length > 0) {
    let [y, x, i] = queue.shift()

    if (tile_powers[y][x] < 4) {
      player_territory[y][x] = player // claim the territory
      continue
    }
    PLAYER_SCORES[player_territory[y][x]] -= 4 //decrement the score of the player who owned the territory
player_territory[y][x] = -1 //reset the territory
tile_powers[y][x] = 0 //reset the power level
//spread the power to the adjacent territories

    if (i == draw_trigger) {
        //animate the destruction of the territory
        for(let j = 0; j < 10; j++){
            
            drawBoard(player_territory, tile_powers, [y,x], j/100)
            await delay(100)

        }
      draw_trigger++
    }



     


    if (y > 0 && (i == 0 || tile_powers[y - 1][x] > 0)) {
      tile_powers[y - 1][x]++
      queue.push([y - 1, x, i + 1])
    }
    if (y < BOARD_SIZE - 1 && (i == 0 || tile_powers[y + 1][x] > 0)) {
      tile_powers[y + 1][x]++
      queue.push([y + 1, x, i + 1])
    }
    if (x > 0 && (i == 0 || tile_powers[y][x - 1] > 0)) {
      tile_powers[y][x - 1]++
      queue.push([y, x - 1, i + 1])
    }
    if (x < BOARD_SIZE - 1 && (i == 0 || tile_powers[y][x + 1] > 0)) {
      tile_powers[y][x + 1]++
      queue.push([y, x + 1, i + 1])
    }
  }

  turn++
}
function delay (duration) {
  return new Promise(resolve => setTimeout(resolve, duration))
}

function update () {
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  drawBoard(player_territory, tile_powers)
  drawText()
}
function drawBoard (player_territory, water_levels, destroyed_tile=null, animation_progress=null) {
  ctx.fillStyle = 'black'
  ctx.fillRect(
    minX - sideLen / 4,
    minY - sideLen / 4,
    sideLen * BOARD_SIZE + sideLen / 2,
    sideLen * BOARD_SIZE + sideLen / 2
  )
  ctx.fillStyle = 'cornsilk'
  ctx.fillRect(minX, minY, sideLen * BOARD_SIZE, sideLen * BOARD_SIZE)
  ctx.fillStyle = PLAYER_COLORS[turn % NUMBER_OF_PLAYERS]

  ctx.strokeStyle = 'black'
  for (let y = 0; y < BOARD_SIZE; y++) {
    for (let x = 0; x < BOARD_SIZE; x++) {
      if (player_territory[y][x] == -1) continue
      let animation_offset_x = 0
        let animation_offset_y = 0
        if(animation_progress != null && destroyed_tile != null){
            let destroyed_tile_x = destroyed_tile[1]
            let destroyed_tile_y = destroyed_tile[0]
            //check if the tile is adjacent to the destroyed tile
            if((destroyed_tile_x == x && Math.abs(destroyed_tile_y - y) == 1) || (destroyed_tile_y == y && Math.abs(destroyed_tile_x - x) == 1)){
                //if the tile is adjacent to the destroyed tile, animate it
                animation_offset_x = (x - destroyed_tile_x) * sideLen * (animation_progress - 1)
                animation_offset_y = (y - destroyed_tile_y) * sideLen * (animation_progress - 1)
            }
        }
      drawBucket(
        x * sideLen + offSetX + animation_offset_x,
        y * sideLen + offSetY + animation_offset_y,
        PLAYER_COLORS[player_territory[y][x]],
        water_levels[y][x]
      )
    }
  }

  ctx.lineWidth = 4
  for (let x = minX; x < maxX; x += sideLen) {
    drawLine(x, minY, x, maxY)
  }
  for (let y = minY; y < maxY; y += sideLen) {
    drawLine(minX, y, maxX, y)
  }
}

function drawText () {
  ctx.fillStyle = 'black'
  ctx.font = '20px Arial'
  for (let i = 0; i < NUMBER_OF_PLAYERS; i++) {
    ctx.fillText(
      PLAYER_COLORS[i].toUpperCase() + ': ' + PLAYER_SCORES[i],
      10,
      50 + 30 * i
    )
  }

  // it is RED's turn //ex
  ctx.fillStyle = PLAYER_COLORS[turn % NUMBER_OF_PLAYERS]
  ctx.fillText(
    PLAYER_COLORS[turn % NUMBER_OF_PLAYERS] + "'s turn",
    10,
    50 + 30 * NUMBER_OF_PLAYERS
  )
}

function drawCircle (x, y, radius) {
  ctx.beginPath()
  ctx.arc(x, y, radius, 0, 2 * Math.PI, false)
  ctx.fill()
  ctx.stroke()
}
function drawBucket (x, y, color, number) {
  number = Math.min(3, number)
  //draws a bucket at x,y with color and number on it, signifying the amount of water in the bucket, the radius gets bigger as the number gets bigger. Number ranges from 0 to 3 inclusive
  ctx.fillStyle = color
  ctx.strokeStyle = 'black'
  ctx.beginPath()
  ctx.arc(x, y, 12 + 8 * number, 0, 2 * Math.PI)
  ctx.fill()
  ctx.stroke()
  ctx.fillStyle = 'black'
  ctx.lineWidth = 4
  //   ctx.font = '20px Arial'
  //   ctx.fillText(number, x - 5, y + 5)
  // instead of writing the number, draw a happy face  for 1, a neutral face for 2, and a sad face for 3
  if (number == 1) {
    ctx.beginPath()
    ctx.arc(x - 5, y - 5, 2, 0, 2 * Math.PI)
    ctx.stroke()
    ctx.beginPath()
    ctx.arc(x + 5, y - 5, 2, 0, 2 * Math.PI)
    ctx.stroke()
    ctx.beginPath()
    ctx.arc(x, y + 5, 5, 0, Math.PI)
    ctx.stroke()
  } else if (number == 2) {
    ctx.beginPath()
    ctx.arc(x - 5, y - 5, 2, 0, 2 * Math.PI)
    ctx.stroke()
    ctx.beginPath()
    ctx.arc(x + 5, y - 5, 2, 0, 2 * Math.PI)
    ctx.stroke()
    ctx.beginPath()
    //line
    ctx.moveTo(x - 5, y + 5)
    ctx.lineTo(x + 5, y + 5)
    ctx.stroke()
  } else if (number >= 3) {
    ctx.beginPath()
    ctx.arc(x - 5, y - 5, 2, 0, 2 * Math.PI)
    ctx.stroke()
    ctx.beginPath()
    ctx.arc(x + 5, y - 5, 2, 0, 2 * Math.PI)
    ctx.stroke()
    ctx.beginPath()
    ctx.arc(x, y + 6, 5, Math.PI, 2 * Math.PI)
    ctx.stroke()
  }
}

function drawLine (x1, y1, x2, y2) {
  ctx.strokeStyle = 'black'
  ctx.beginPath()
  ctx.moveTo(x1, y1)
  ctx.lineTo(x2, y2)
  ctx.stroke()
}
