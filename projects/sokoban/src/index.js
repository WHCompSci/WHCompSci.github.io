const canvas = document.getElementById('canvas')
const ctx = canvas.getContext('2d')
let totalMoves = 0
let totalResets = 0
let totalBlockPushes = 0

canvas.width = window.innerWidth
canvas.height = window.innerHeight
let currBoard,
  boxes,
  currRow = 0,
  currCol = 0,
  currLevel = 0,
  lastPosOnScreen = null
let gameMode = 'title'
let startTime = null
const levels = [
  ['____###', '____#S#', '____#.#', '#####.#', '#L.B..#', '#######'],
  ['____###', '#####S#', '#L..B.#', '#####.#', '#L..B.#', '#######'],

  ['_#####', '##L..#', '#S.B.#', '##...#', '#..B.#', '##L###', '_###__'],
  ['######', '#....#', '#.B.L#', '##.B.#', '_#SL##', '_####_'],

  ['__####', '###..#', '#.BL.#', '#..B.#', '#LS.##', '#####_'],
  ['_#####', '##L..#', '#S.#.#', '#.LB.#', '#.BB.#', '##L..#', '_#####'],
  ['_#####_', '##...##', '#.LLB.#', '#.B#..#', '#..#..#', '#SLB.##', '######_'],
  [
    '_######_',
    '##.LL.##',
    '#.BLLB.#',
    '#.B.B..#',
    '#.S#...#',
    '##a###.#',
    '_____###'
  ],
  [
    '###########',
    '#.........#',
    '#.B...B##.#',
    '#.####..#.#',
    '#....S..#.#',
    '#.B#LLL##.#',
    '#..#BLL.B.#',
    '#..#......#',
    '###########'
  ]
]

function loadBoard (index) {
  lastPosOnScreen = null
  let startRow, startCol
  const m = levels[index].map(row => row.split(''))

  const boxes = []
  for (let row = 0; row < m.length; row++) {
    for (let col = 0; col < m[0].length; col++) {
      if (m[row][col] == 'B') {
        boxes.push([row, col, false])
        m[row][col] = '.'
      } else if (m[row][col] == 'S') {
        startRow = row
        startCol = col
        m[row][col] = '.'
      }
    }
  }
  // console.log([m, boxes, startRow, startCol])
  return [m, boxes, startRow, startCol]
}
window.onresize = () => {
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight
  // drawBoard()
  if (gameMode == 'title') {
    drawTitleScreen()
  }
}

function drawBoard () {
  ctx.fillStyle = '#b46746'
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.font = canvas.width * 0.03 + 'px Madimi'
  ctx.fillStyle = 'white'
  ctx.textBaseline = 'middle'
  ctx.textAlign = 'center'
  const texts = [
    'Use WASD or Arrow Keys to push the box!',
    'The goal is to push every box into a green tile.',
    'Press space to restart levels.',
    'Good luck!',
    'This one is a bit harder...',
    'Last one! You can do it!',
    "Just kidding, there's more!",
    '😤😤😤',
    '😈😈😈'
  ]
  const bottomText = ["Controls:", "Movement - WASD or Arrow Keys", "Restart level - space"]
  ctx.fillText(
    currLevel < texts.length ? texts[currLevel] : '',
    canvas.width / 2,
    canvas.height * 0.1
  )
  for (let i = 0; i < bottomText.length; i++) {
    const line = bottomText[i]
    const h = (0.8 + (i / bottomText.length) * 0.2)
    ctx.fillText(
      line,
      canvas.width / 2,
      canvas.height * h
    )
  }

  //upper corner put level number
  ctx.fillText(
    '[Level ' + (currLevel + 1) + '/' + (levels.length - 3) + ']',
    canvas.width * 0.1,
    canvas.height * 0.1
  )
  //upper corner put timer
  if (startTime != null) {
    //we want to display the time in mm:ss format
    let seconds = Math.floor((Date.now() - startTime) / 1000)
    let minutes = Math.floor(seconds / 60)
    seconds = seconds % 60

    ctx.fillText(
      'Time: ' +
        (minutes < 10 ? '0' + minutes : minutes) +
        ':' +
        (seconds < 10 ? '0' + seconds : seconds),
      canvas.width * 0.9,
      canvas.height * 0.1
    )
  }
  // console.log("wefh")
  const tileSize =
    Math.min(
      canvas.width / currBoard[0].length,
      canvas.height / currBoard.length
    ) * 0.5
  const offsetX = canvas.width * 0.5 - tileSize * currBoard.length * 0.5
  const offsetY = canvas.height * 0.5 - tileSize * currBoard.length * 0.5
  // const offsetX = 200
  // const offsetY = 75
  for (let row = 0; row < currBoard.length; row++) {
    for (let col = 0; col < currBoard[0].length; col++) {
      if (currBoard[row][col] == '_') {
        continue
      } else if (currBoard[row][col] == '#') {
        ctx.fillStyle = '#292d2e'
      } else if (currBoard[row][col] == '.') {
        ctx.fillStyle = '#b1c3c7'
      } else if (currBoard[row][col] == 'L') {
        ctx.fillStyle = '#46b446' //green
      }

      ctx.fillRect(
        col * tileSize + offsetX,
        row * tileSize + offsetY,
        tileSize * 1.01,
        tileSize * 1.01
      )
    }
  }
  ctx.strokeWidth = 59
  ctx.lineWidth = 5
  ctx.strokeStyle = '#3d719c'
  ctx.fillStyle = 'steelblue'
  if (lastPosOnScreen == null) {
    lastPosOnScreen = [currRow, currCol]
  }

  //lerp between lastPosOnScreen and playerRow, playerCol
  lastPosOnScreen[0] = lastPosOnScreen[0] + (currRow - lastPosOnScreen[0]) * 0.1
  lastPosOnScreen[1] = lastPosOnScreen[1] + (currCol - lastPosOnScreen[1]) * 0.1

  const player = [
    lastPosOnScreen[1] * tileSize + offsetX + tileSize * 0.1,
    lastPosOnScreen[0] * tileSize + offsetY + tileSize * 0.1,
    tileSize * 0.8,
    tileSize * 0.8
  ]
  ctx.fillRect(...player)
  ctx.strokeRect(...player)
  //draw face on player square
  ctx.beginPath()
  ctx.arc(
    player[0] + player[2] * 0.2,
    player[1] + player[3] * 0.4,
    player[2] * 0.05,
    0,
    2 * Math.PI
  )
  //pen up
  ctx.moveTo(player[0] + player[2] * 0.75, player[1] + player[3] * 0.4)
  ctx.arc(
    player[0] + player[2] * 0.3 + player[2] * 0.5,
    player[1] + player[3] * 0.4,
    player[2] * 0.05,
    0,
    2 * Math.PI
  )

  //mouth
  ctx.moveTo(player[0] + player[2] * 0.1, player[1] + player[3] * 0.6)
  ctx.lineTo(player[0] + player[2] * 0.9, player[1] + player[3] * 0.6)
  ctx.stroke()
  ctx.fillStyle = '#3d719c'
  ctx.fill()
  for (const [row, col, on_storage] of boxes) {
    ctx.fillStyle = on_storage ? '#9c593d' : '#b46746'
    ctx.strokeStyle = on_storage ? '#824b33' : '#9c593d'
    // console.log("drawing box")
    const box = [
      col * tileSize + offsetX + tileSize * 0.2,
      row * tileSize + offsetY + tileSize * 0.2,
      tileSize * 0.6,
      tileSize * 0.6
    ]
    ctx.fillRect(...box)
    ctx.strokeRect(...box)
    //draw x on box, not all the way to the edge
    ctx.beginPath()
    ctx.moveTo(box[0] + box[2] * 0.2, box[1] + box[3] * 0.2)
    ctx.lineTo(box[0] + box[2] * 0.8, box[1] + box[3] * 0.8)
    ctx.moveTo(box[0] + box[2] * 0.8, box[1] + box[3] * 0.2)
    ctx.lineTo(box[0] + box[2] * 0.2, box[1] + box[3] * 0.8)
    ctx.stroke()
  }
}
document.onkeydown = ev => {
  if (gameMode == 'title') {
    startGame()
    return
  }
  if (gameMode == 'end' && ev.key == ' ') {
    currLevel = 0
    totalMoves = 0
    totalResets = 0
    totalBlockPushes = 0
    drawTitleScreen()
    return
  }

  // console.log(ev.key)
  if (ev.key == ' ') {
    const b = loadBoard(currLevel)
    currBoard = b[0]
    boxes = b[1]
    currRow = b[2]
    currCol = b[3]
    totalResets++
    // drawBoard(currBoard, boxes, currRow, currCol)
    return
  }
  let dirs

  if (
    ev.key == 'ArrowUp' ||
    ev.key == 'ArrowDown' ||
    ev.key == 'ArrowLeft' ||
    ev.key == 'ArrowRight'
  ) {
    dirs = {
      ArrowUp: [-1, 0],
      ArrowLeft: [0, -1],
      ArrowDown: [1, 0],
      ArrowRight: [0, 1]
    }
  } else if (ev.key == 'w' || ev.key == 's' || ev.key == 'a' || ev.key == 'd') {
    dirs = {
      w: [-1, 0],
      a: [0, -1],
      s: [1, 0],
      d: [0, 1]
    }
  } else {
    return
  }
  const d = dirs[ev.key]
  const nextRow = currRow + d[0]
  const nextCol = currCol + d[1]
  if (
    nextRow < 0 ||
    nextRow >= currBoard.length ||
    nextCol < 0 ||
    nextCol >= currBoard[0].length
  ) {
    return
  }

  if (currBoard[nextRow][nextCol] == '#') {
    //can't push wall
    return
  }
  totalMoves++
  for (let i = 0; i < boxes.length; i++) {
    const [brow, bcol, _] = boxes[i]
    if (nextRow == brow && nextCol == bcol) {
      const newBoxRow = nextRow + d[0]
      const newBoxCol = nextCol + d[1]
      if (
        newBoxRow < 0 ||
        newBoxRow >= currBoard.length ||
        newBoxCol < 0 ||
        newBoxCol >= currBoard[0].length
      ) {
        return
      }
      if (
        (currBoard[newBoxRow][newBoxCol] == '.' ||
          currBoard[newBoxRow][newBoxCol] == 'L') &&
        boxes.filter(x => x[0] == newBoxRow && x[1] == newBoxCol).length == 0
      ) {
        currRow = nextRow
        currCol = nextCol
        boxes[i] = [
          newBoxRow,
          newBoxCol,
          currBoard[newBoxRow][newBoxCol] == 'L'
        ]
        totalBlockPushes++

        if (checkForWin(currBoard, boxes)) {
          console.log('win lvl ' + currLevel)
          if (currLevel < levels.length - 1) {
            currLevel++
            ;[currBoard, boxes, currRow, currCol] = loadBoard(currLevel)
          } else {
            console.log('you win!')
            return drawEndScreen()
          }
        }
        // drawBoard(currBoard, boxes, currRow, currCol)
        return
      } else {
        return
      }
    }
  }
  if (
    currBoard[nextRow][nextCol] == '.' ||
    currBoard[nextRow][nextCol] == 'L'
  ) {
    currRow = nextRow
    currCol = nextCol
    // drawBoard(currBoard, boxes, currRow, currCol)
    return
  }
}

const drawEndScreen = () => {
  clearInterval(gameLoop)
  gameMode = 'end'
  // put stats on the screen, time taken, number of moves, etc
  // put a button to go back to the title screen
  ctx.fillStyle = '#b46746'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.font = canvas.width * 0.1 + 'px Madimi'
  ctx.fillStyle = 'white'
  ctx.textBaseline = 'middle'
  ctx.textAlign = 'center'
  ctx.fillText('You Win!', canvas.width / 2, canvas.height * 0.25)
  ctx.font = canvas.width * 0.03 + 'px Madimi'
  ctx.fillText(
    'Time: ' + (Date.now() - startTime) / 1000 + ' seconds',
    canvas.width / 2,
    canvas.height * 0.45
  )
  ctx.fillText('Moves: ' + totalMoves, canvas.width / 2, canvas.height * 0.55)
  ctx.fillText('Resets: ' + totalResets, canvas.width / 2, canvas.height * 0.65)
  ctx.fillText(
    'Block Pushes: ' + totalBlockPushes,
    canvas.width / 2,
    canvas.height * 0.75
  )
  ctx.fillText('Press space to restart', canvas.width / 2, canvas.height * 0.85)
}

const drawTitleScreen = () => {
  gameMode = 'title'
  canvas.width = window.innerWidth
  canvas.height = window.innerHeight

  //draw title screen
  ctx.fillStyle = '#b46746'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  ctx.font = canvas.width * 0.1 + 'px Madimi'
  ctx.fillStyle = 'white'
  ctx.textBaseline = 'middle'
  ctx.textAlign = 'center'
  ctx.fillText('Sokoban', canvas.width / 2, canvas.height * 0.3)
  ctx.font = canvas.width * 0.03 + 'px Madimi'
  ctx.fillText('Press any key to start', canvas.width / 2, canvas.height * 0.5)
  //player sprite, rotated 45 degrees and scaled to be 1/4 of the screen, on the bottom right
  ctx.strokeStyle = '#3d719c'
  ctx.lineWidth = 5
  ctx.save()
  ctx.translate(canvas.width * 0.15, canvas.height * 0.75)
  ctx.rotate(Math.PI / 6)
  const spriteScale = Math.sqrt(canvas.width) * 0.13

  ctx.scale(spriteScale, spriteScale)
  ctx.fillStyle = 'steelblue'
  ctx.fillRect(-50, -50, 100, 100)
  ctx.strokeRect(-50, -50, 100, 100)
  ctx.beginPath()
  //draw line for mouth
  ctx.moveTo(-40, 0)
  ctx.lineTo(40, 0)
  ctx.stroke()

  ctx.beginPath()
  ctx.arc(-30, -20, 5, 0, 2 * Math.PI)
  ctx.arc(30, -20, 5, 0, 2 * Math.PI)
  ctx.fillStyle = 'black'
  ctx.fill()

  ctx.restore()

  //draw boxes at different angles
  ctx.save()
  ctx.translate(canvas.width * 0.85, canvas.height * 0.75)
  ctx.rotate(-Math.PI / 6)
  ctx.scale(spriteScale, spriteScale)

  ctx.strokeStyle = '#824b33'
  ctx.fillStyle = '#9c593d'
  ctx.fillRect(-50, -50, 100, 100)
  ctx.strokeRect(-50, -50, 100, 100)
  ctx.beginPath()
  ctx.moveTo(-30, -30)
  ctx.lineTo(30, 30)
  ctx.moveTo(30, -30)
  ctx.lineTo(-30, 30)
  ctx.stroke()
  ctx.restore()
  ctx.save()

  // console.log(currBoard)
  // console.log("sr="+startRow+" sc="+startCol)
  console.log(boxes)
  //draw text on top middle of screen saying that you can press space to restart

  //This is a blocking title page that starts a timer once you press a key
}
const FONT = new FontFace('Madimi', 'url(src/Madimi_One/MadimiOne-Regular.ttf)')
FONT.load().then(font => {
  document.fonts.add(font)
  drawTitleScreen()
})
let gameLoop
function startGame () {
  ;[currBoard, boxes, currRow, currCol] = loadBoard(0)
  gameMode = 'game'
  startTime = Date.now()
  gameLoop = setInterval(drawBoard, 30 / 1000)
}

function checkForWin (board, boxes) {
  for (const box of boxes) {
    if (!box[2]) return false
  }
  return true
}

function generatePuzzle (height = 1, width = 2, numBoxes = 2) {
  //https://ianparberry.com/techreports/LARC-2011-01.pdf
  //build an empty room
  const templetes = [
    [
      [0, 0, 0, 0, 0],
      [0, 1, 1, 1, 0],
      [0, 1, 1, 1, 0],
      [0, 1, 1, 1, 0],
      [0, 0, 0, 0, 0]
    ],
    [
      [0, 0, 0, 0, 0],
      [0, 3, 1, 1, 0],
      [0, 1, 1, 1, 0],
      [0, 1, 1, 1, 0],
      [0, 0, 0, 0, 0]
    ],
    [
      [0, 0, 0, 1, 1],
      [0, 3, 3, 1, 1],
      [0, 1, 1, 1, 0],
      [0, 1, 1, 1, 0],
      [0, 0, 0, 0, 0]
    ],
    [
      [0, 0, 0, 0, 0],
      [0, 3, 3, 3, 0],
      [0, 1, 1, 1, 0],
      [0, 1, 1, 1, 0],
      [0, 0, 0, 0, 0]
    ],
    [
      [0, 0, 0, 0, 0],
      [0, 3, 3, 3, 0],
      [0, 3, 1, 1, 0],
      [0, 3, 1, 1, 0],
      [0, 0, 0, 0, 0]
    ],
    [
      [0, 0, 1, 0, 0],
      [0, 3, 1, 1, 0],
      [1, 1, 1, 1, 0],
      [0, 1, 1, 3, 0],
      [0, 0, 0, 0, 0]
    ],
    [
      [0, 0, 0, 0, 0],
      [0, 3, 1, 1, 0],
      [1, 1, 1, 1, 0],
      [0, 3, 1, 1, 0],
      [0, 0, 0, 0, 0]
    ],
    [
      [0, 0, 1, 0, 0],
      [0, 3, 1, 1, 0],
      [1, 1, 1, 1, 0],
      [0, 3, 1, 3, 0],
      [0, 0, 1, 0, 0]
    ],
    [
      [0, 0, 1, 0, 0],
      [0, 3, 1, 3, 0],
      [1, 1, 1, 1, 1],
      [0, 3, 1, 3, 0],
      [0, 0, 1, 0, 0]
    ],
    [
      [0, 0, 1, 0, 0],
      [0, 3, 1, 3, 0],
      [0, 3, 2, 1, 1],
      [0, 3, 3, 3, 0],
      [0, 0, 0, 0, 0]
    ],
    [
      [0, 0, 0, 0, 0],
      [0, 3, 3, 3, 0],
      [1, 1, 1, 1, 1],
      [0, 3, 3, 3, 0],
      [0, 0, 0, 0, 0]
    ],
    [
      [0, 0, 0, 0, 0],
      [0, 1, 1, 1, 1],
      [0, 1, 3, 1, 1],
      [0, 1, 1, 1, 0],
      [0, 0, 0, 0, 0]
    ],
    [
      [0, 0, 0, 0, 0],
      [0, 3, 3, 3, 0],
      [0, 3, 3, 3, 0],
      [0, 3, 3, 3, 0],
      [0, 0, 0, 0, 0]
    ],
    [
      [0, 0, 0, 0, 0],
      [0, 3, 3, 3, 0],
      [0, 3, 1, 1, 0],
      [1, 1, 1, 1, 0],
      [1, 1, 0, 0, 0]
    ],
    [
      [0, 1, 0, 1, 0],
      [0, 1, 1, 1, 0],
      [0, 3, 1, 3, 0],
      [0, 1, 1, 1, 0],
      [0, 1, 0, 1, 0]
    ],
    [
      [0, 0, 0, 0, 0],
      [0, 3, 3, 3, 0],
      [0, 3, 3, 3, 0],
      [0, 1, 1, 1, 0],
      [0, 1, 1, 1, 0]
    ],
    [
      [0, 0, 0, 0, 0],
      [0, 3, 3, 3, 0],
      [1, 1, 3, 1, 1],
      [0, 1, 1, 1, 0],
      [0, 1, 1, 0, 0]
    ]
  ]
  // 0 is a blank space
  // 1 is a passage
  // 2 is a passage (that only allows player to get through without block) Only exists on one templete. Checked as if a wall
  // 3 is a wall
  let board = []

  // choose N random templetes, where N := H x W
  const layout = []
  for (let row = 0; row < height; row++) {
    layout.push([])
    for (let col = 0; col < width; col++) {
      let t = templetes[Math.floor(Math.random() * templetes.length)]
      let foundValidPlacement = false
      //check the templete needs to be rotated.
      rotations: for (let r = 0; r < 4; r++) {
        //check if the templete fits based on to the left and above
        if (row > 0) {
          let aB = layout[row - 1][col] //above block
          for (let i = 0; i < 5; i++) {
            if (t[4][i] && aB[4][i] && t[4][i] != aB[4][i]) {
              t = rotate90(t)
              continue rotations
            }
          }
        }
        if (col > 0) {
          let lB = layout[row][col - 1] //left block
          for (let i = 0; i < 5; i++) {
            if (t[i][4] && lB[i][4] && t[i][4] == lB[i][4]) {
              t = rotate90(t)
              continue rotations
            }
          }
        }
        foundValidPlacement = true
        break
      }

      if (!foundValidPlacement) {
        console.log(
          'could not find valid placement for tile: [row=' +
            row +
            ', col=' +
            col +
            ']'
        ) //redo this loop iteration
        console.log(t)
        //console.log(layout[row-1][col])
        console.log(layout[row][col - 1])
        col--
        continue
        return
      } else {
        layout[row].push(t)
      }
    }
  }

  //we will trasfer the layout array of 5x5 blocks to the board array.
  //We will discard the edges of the blocks leaving a 3x3 block, then that will be directly stacked into the board array

  for (let row = 0; row < layout.length; row++) {
    board = board.concat([[], [], []])
    for (let col = 0; col < layout[0].length; col++) {
      let block = layout[row][col]
      for (let i = 1; i < 4; i++) {
        for (let j = 1; j < 4; j++) {
          board[row * 3 + i - 1][col * 3 + j - 1] = block[i][j]
        }
      }
    }
  }
  const floorTiles = []
  for (let row = 0; row < board.length; row++) {
    for (let col = 0; col < board[0].length; col++) {
      if (board[row][col] == 1 || board[row][col] == 2) {
        floorTiles.push([row, col])
      }
    }
  }
  if (!boardIsValid(board, floorTiles, numBoxes)) {
    //redo the whole thing
    console.log('board is not valid, redoing...')
    return generatePuzzle(height, width, numBoxes)
  }
  //place goals and boxes
  placeGoalsAndBoxes(board, floorTiles, numBoxes)
  console.log(board)
}

const rotate90 = matrix => {
  const rows = matrix.length
  const cols = matrix[0].length
  const result = []

  for (let j = 0; j < cols; j++) {
    const newRow = []
    for (let i = rows - 1; i >= 0; i--) {
      newRow.push(matrix[i][j])
    }
    result.push(newRow)
  }

  return result
}

function boardIsValid (board, floorTiles, numBoxes) {
  // • The level must have enough floor space for the planned
  // number of boxes, plus the player and at least one
  // empty space.
  if (floorTiles.length < numBoxes + 2) {
    return false
  }
  // The level is checked for connectivity. There should be
  // one contiguous section of floor. There is one special
  // case here. The templates that allow the player to pass
  // through, but will not allow a box to pass, are checked
  // as if there was a wall tile separating the two sides.
  // This only affects this check, and that tile is counted as
  // a floor tile in all other cases.

  let visited = new Set()
  let queue = [floorTiles[0]]
  while (queue.length > 0) {
    let [row, col] = queue.shift()
    if (visited.has([row, col].toString())) {
      continue
    }
    visited.add([row, col].toString())
    let neighbors = [
      [row - 1, col],
      [row + 1, col],
      [row, col - 1],
      [row, col + 1]
    ]
    let num_wall_neighbors = 0
    for (let [r, c] of neighbors) {
      if (r < 0 || r >= board.length || c < 0 || c >= board[0].length) {
        continue
      }
      if (board[r][c] == 1) {
        // the passage that = 2 is treated as a wall in this check
        queue.push([r, c])
        continue
      }
      if (board[r][c] == 3) {
        num_wall_neighbors++
      }
      if (num_wall_neighbors >= 3) {
        // • If the level contains any floor tiles surrounded on three
        // sides by walls, it is discarded. This is a somewhat aesthetic choice, but such tiles are either obviously dead
        // space if there is no goal there, or an easy place to get
        // boxes out of the way otherwise, so we think it improves
        // the quality of the resulting levels somewhat.
        return false
      }
    }
  }
  if (visited.size != floorTiles.length) {
    return false
  }
  // • Any level that has a 4 × 3 or 3 × 4 (or larger) section
  // of open floor is discarded. By observation, such levels
  // tend to make levels with very bushy, but not very deep
  // state spaces. This makes it very hard to generate the
  // level, but not much harder to solve it.
  for (let row = 0; row < board.length - 3; row++) {
    for (let col = 0; col < board[0].length - 3; col++) {
      let section3by4 = []
      let section4by3 = []
      for (let i = 0; i < Math.min(board.length - row - 1, 3); i++) {
        for (let j = 0; j < Math.min(board[0].length - row - 1, 3); j++) {
          if (i < 3) {
            section3by4.push(board[row + i][col + j])
          }
          if (j < 3) {
            section4by3.push(board[row + i][col + j])
          }
        }
      }
      if (section3by4.every(x => x == 1) || section4by3.every(x => x == 1)) {
        return false
      }
    }
  }
  return true
}

function placeGoalsAndBoxes (board, floorTiles, numBoxes) {
  // Goal placing is done by brute force, trying every possible
  // combination of goal positions
  //Our generator uses a timer that checks it has exceeded its
  // allotted time. If it has, it will terminate and return the best
  // result so far. To help ensure that that result is something
  // interesting, even if not the best, the positions for the goal
  // crates are checked in random order. This is done by creating
  // a shuffled list of the empty spaces on the board.
}

// generatePuzzle(2, 2, 2)
console.log('finished generating')
