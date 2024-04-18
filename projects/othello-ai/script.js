class Board {
    NONE = 0
    BLACK_CHIP = 2
    WHITE_CHIP = 3
    //locations of the different legal move checker types on the board
    //https://phwl.org/assets/papers/othello_fpt04.pdf
    legalMoveCheckers = [
        [0, 1, 2, 3, 3, 2, 1, 0],
        [4, 5, 6, 7, 7, 6, 5, 4],
        [8, 9, 10, 11, 11, 10, 9, 8],
        [12, 13, 14, 15, 15, 14, 13, 12],
        [12, 13, 14, 15, 15, 14, 13, 12],
        [8, 9, 10, 11, 11, 10, 9, 8],
        [4, 5, 6, 7, 7, 6, 5, 4],
        [0, 1, 2, 3, 3, 2, 1, 0]
    ]
    //rows:  legal move checkers types (16 total) I added more than were in the paper because It seemed less complicated than adding more reindexings
    //columns: R BR B BL L TL T TR
    legalMoveCheckerTypes = [
        [6, 6, 6, 0, 0, 0, 0, 0],
        [5, 5, 6, 0, 0, 0, 0, 0],
        [4, 4, 6, 1, 1, 0, 0, 0],
        [3, 3, 6, 2, 2, 0, 0, 0],
        [6, 5, 5, 0, 0, 0, 0, 0],
        [5, 5, 5, 0, 0, 0, 0, 0],
        [4, 4, 5, 1, 1, 0, 0, 0],
        [3, 3, 5, 2, 2, 0, 0, 0],
        [6, 4, 4, 0, 0, 0, 1, 1],
        [5, 4, 4, 0, 0, 0, 1, 1],
        [4, 4, 4, 1, 1, 1, 1, 1],
        [3, 3, 4, 2, 2, 1, 1, 1],
        [6, 3, 3, 0, 0, 0, 2, 2],
        [5, 3, 3, 0, 0, 0, 2, 2],
        [4, 3, 3, 1, 1, 1, 2, 2]
        // [3,3,3,2,2,2,2,2]  //J //not needed as (index 15) tiles are occupied from the start of the game
    ]
    quadrantReindexings = [
        [0, 1, 2, 3, 4, 5, 6, 7], //TL
        [4, 3, 2, 1, 0, 7, 6, 5], //TR
        [0, 7, 6, 5, 4, 3, 2, 1], //BL
        [4, 5, 6, 7, 0, 1, 2, 3] //BR
    ]
    directions = [
        [1, 0], //R
        [1, 1], //BR
        [0, 1], //B
        [-1, 1], //BL
        [-1, 0], //L
        [-1, -1], //TL
        [0, -1], //T
        [1, -1] //TR
    ]
    direction_names = [
        'Right',
        'Bottom Right',
        'Bottom',
        'Bottom Left',
        'Left',
        'Top Left',
        'Top',
        'Top Right'
    ]
    constructor() {
        this.data = new Uint16Array(8)
        //8x8 board, 2 bits per cell
        //stored as is_on, is_white
    }
    getCell(x, y) {
        return (this.data[y] >> (x << 1)) & 3
    }
    setCell(x, y, is_white) {
        this.data[y] &= ~(3 << (x << 1))
        this.data[y] |= (is_white | 2) << (x << 1)
    }
    makeCopy() {
        let b = new Board()
        b.data = new Uint16Array(this.data)
        return b
    }
    logBoard() {
        let txt = ''
        for (let y = 0; y < 8; y++) {
            let row = ''
            for (let x = 0; x < 8; x++) {
                row +=
                    this.getCell(x, y) == 0 ? '.' : this.getCell(x, y) == 2 ? 'B' : 'W'
            }
            txt += row + '\n'
        }
        console.log(txt)
    }
    playMove(x, y, is_white, change_board = true) {
        let count = 0;
        //assume move is legal
        const my_chip = is_white ? this.WHITE_CHIP : this.BLACK_CHIP
        const enemy_chip = is_white ? this.BLACK_CHIP : this.WHITE_CHIP
        if (change_board) this.setCell(x, y, is_white)
        const LMCType = this.legalMoveCheckers[y][x]
        const numAndTermsInEachDirection = this.legalMoveCheckerTypes[LMCType]
        const quadrant = (x > 3) | ((y > 3) << 1) //0: TL, 1: TR, 2: BL, 3: BR
        const reindexing = this.quadrantReindexings[quadrant]
        for (let i = 0; i < 8; i++) {
            let numAndTerms = numAndTermsInEachDirection[i]
            if (numAndTerms == 0) continue

            let direction = this.directions[reindexing[i]]

            console.log('Checking direction:', this.direction_names[reindexing[i]], 'for', numAndTerms, 'terms');
            let [dx, dy] = direction

            if (this.getCell(x + dx, y + dy) != enemy_chip) continue

            for (let j = 1; j <= numAndTerms + 1; j++) {
                console.log('Checking distance:', j)
                let cell = this.getCell(x + j * dx, y + j * dy)
                if (cell == 0) break
                if (cell == my_chip) {
                    for (let k = 1; k <= j; k++) {
                        if (change_board) {
                            this.setCell(x + k * dx, y + k * dy, is_white)
                        }
                        count++
                    }
                    break
                }
            }
        }
        return count;
    }
    findLegalMoves(is_white) {
        //fast check if move is legal, using https://phwl.org/assets/papers/othello_fpt04.pdf
        const my_chip = is_white ? this.WHITE_CHIP : this.BLACK_CHIP
        const enemy_chip = is_white ? this.BLACK_CHIP : this.WHITE_CHIP
        let legal_moves = new Uint8Array(8)
        for (let y = 0; y < 8; y++) {
            for (let x = 0; x < 8; x++) {
                if (this.getCell(x, y) != 0) continue
                const LMCType = this.legalMoveCheckers[y][x]
                const numAndTermsInEachDirection = this.legalMoveCheckerTypes[LMCType]
                const quadrant = (x > 3) | ((y > 3) << 1) //0: TL, 1: TR, 2: BL, 3: BR
                const reindexing = this.quadrantReindexings[quadrant]

                for (let i = 0; i < 8; i++) {
                    let numAndTerms = numAndTermsInEachDirection[i]
                    if (numAndTerms == 0) continue
                    let direction = this.directions[reindexing[i]]
                    let [dx, dy] = direction
                    // ugly code, but it's fast apparently
                    const isDirectionLegal =
                        (numAndTerms >= 1 &&
                            this.getCell(x + dx, y + dy) == enemy_chip &&
                            this.getCell(x + 2 * dx, y + 2 * dy) == my_chip) ||
                        (numAndTerms >= 2 &&
                            this.getCell(x + dx, y + dy) == enemy_chip &&
                            this.getCell(x + 2 * dx, y + 2 * dy) == enemy_chip &&
                            this.getCell(x + 3 * dx, y + 3 * dy) == my_chip) ||
                        (numAndTerms >= 3 &&
                            this.getCell(x + dx, y + dy) == enemy_chip &&
                            this.getCell(x + 2 * dx, y + 2 * dy) == enemy_chip &&
                            this.getCell(x + 3 * dx, y + 3 * dy) == enemy_chip &&
                            this.getCell(x + 4 * dx, y + 4 * dy) == my_chip) ||
                        (numAndTerms >= 4 &&
                            this.getCell(x + dx, y + dy) == enemy_chip &&
                            this.getCell(x + 2 * dx, y + 2 * dy) == enemy_chip &&
                            this.getCell(x + 3 * dx, y + 3 * dy) == enemy_chip &&
                            this.getCell(x + 4 * dx, y + 4 * dy) == enemy_chip &&
                            this.getCell(x + 5 * dx, y + 5 * dy) == my_chip) ||
                        (numAndTerms >= 5 &&
                            this.getCell(x + dx, y + dy) == enemy_chip &&
                            this.getCell(x + 2 * dx, y + 2 * dy) == enemy_chip &&
                            this.getCell(x + 3 * dx, y + 3 * dy) == enemy_chip &&
                            this.getCell(x + 4 * dx, y + 4 * dy) == enemy_chip &&
                            this.getCell(x + 5 * dx, y + 5 * dy) == enemy_chip &&
                            this.getCell(x + 6 * dx, y + 6 * dy) == my_chip) ||
                        (numAndTerms >= 6 &&
                            this.getCell(x + dx, y + dy) == enemy_chip &&
                            this.getCell(x + 2 * dx, y + 2 * dy) == enemy_chip &&
                            this.getCell(x + 3 * dx, y + 3 * dy) == enemy_chip &&
                            this.getCell(x + 4 * dx, y + 4 * dy) == enemy_chip &&
                            this.getCell(x + 5 * dx, y + 5 * dy) == enemy_chip &&
                            this.getCell(x + 6 * dx, y + 6 * dy) == enemy_chip &&
                            this.getCell(x + 7 * dx, y + 7 * dy) == my_chip)

                    if (isDirectionLegal) {
                        legal_moves[y] |= 1 << x
                        break
                    }
                }
            }
        }
        return legal_moves
    }
}

const board = new Board()
let is_whites_turn = false
let move_number = 0
let lastMoveLocation = null;
board.setCell(3, 3, true)
board.setCell(4, 4, true)
board.setCell(3, 4, false)
board.setCell(4, 3, false)
let legal_moves = board.findLegalMoves(is_whites_turn)
board.logBoard()
logLegalMoves(legal_moves)

function logLegalMoves(legal_moves) {
    let txt = ''
    for (let y = 0; y < 8; y++) {
        let row = ''
        for (let x = 0; x < 8; x++) {
            row += isMoveLegal(x, y, legal_moves) ? 'L' : '.'
        }
        txt += row + '\n'
    }
    console.log(txt)
}
const coordinateOffset = 50
const canvas = document.getElementById('board')
const statusIndicator = document.getElementById('status')
const newGameButton = document.getElementById('newGame')
const undoButton = document.getElementById('undo')
const redoButton = document.getElementById('redo')

const ctx = canvas.getContext('2d')
const cell_size = Math.floor(
    Math.min(window.innerWidth, window.innerHeight) / 12
)

canvas.width = 8 * cell_size + coordinateOffset
canvas.height = 8 * cell_size + coordinateOffset

canvas.style.border = '0px solid #222222'
function drawBoard(b, drawLegalMoves = true) {
    //draw green background #009067
    ctx.fillStyle = '#222222'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    ctx.fillStyle = '#009067'
    ctx.fillRect(coordinateOffset, coordinateOffset, canvas.width, canvas.height)
    //draw grid lines
    ctx.strokeStyle = '#222222'
    ctx.lineWidth = 1
    ctx.beginPath()
    for (let i = 1; i <= 8; i++) {
        ctx.moveTo(i * cell_size + coordinateOffset, coordinateOffset)
        ctx.lineTo(i * cell_size + coordinateOffset, canvas.height)
        ctx.moveTo(coordinateOffset, i * cell_size + coordinateOffset)
        ctx.lineTo(canvas.width, i * cell_size + coordinateOffset)
    }
    ctx.stroke()

    //draw coordinates. A-H on top and 1-8 on the left
    //indented font style
    ctx.fillStyle = '#424544'

    ctx.font = 'bold 25px Verdana'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'

    for (let i = 0; i < 8; i++) {
        ctx.fillText(
            String.fromCharCode(65 + i),
            (i + 0.5) * cell_size + coordinateOffset,
            0.3 * coordinateOffset
        )
        ctx.fillText(
            i + 1,
            0.3 * coordinateOffset,
            (i + 0.5) * cell_size + coordinateOffset
        )
    }

    //draw small black circles at 4 line intersections lines (1,1), (1,6), (6,1), (6,6)
    ctx.fillStyle = '#222222'
    ctx.beginPath()
    ctx.arc(
        2 * cell_size + coordinateOffset,
        2 * cell_size + coordinateOffset,
        5,
        0,
        2 * Math.PI
    )
    ctx.fill()
    ctx.beginPath()
    ctx.arc(
        2 * cell_size + coordinateOffset,
        6 * cell_size + coordinateOffset,
        5,
        0,
        2 * Math.PI
    )
    ctx.fill()
    ctx.beginPath()
    ctx.arc(
        6 * cell_size + coordinateOffset,
        2 * cell_size + coordinateOffset,
        5,
        0,
        2 * Math.PI
    )
    ctx.fill()
    ctx.beginPath()
    ctx.arc(
        6 * cell_size + coordinateOffset,
        6 * cell_size + coordinateOffset,
        5,
        0,
        2 * Math.PI
    )
    ctx.fill()

    //draw second circle behind the chips to make them look like they are on a board and have thickness

    const drawCircle = (x, y, color) => {
        ctx.fillStyle = color
        ctx.beginPath()
        ctx.arc(x, y, cell_size * 0.4, 0, 2 * Math.PI)
        ctx.fill()
    }
    //draw chips
    for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
            const cell = b.getCell(x, y)
            if (cell == b.BLACK_CHIP) {
                ctx.fillStyle = '#424544'
                drawCircle(
                    (x + 0.5) * cell_size + coordinateOffset + 1,
                    (y + 0.5) * cell_size + coordinateOffset + 1,
                    '#292b2b'
                )
                drawCircle(
                    (x + 0.5) * cell_size + coordinateOffset - 1,
                    (y + 0.5) * cell_size + coordinateOffset - 1,
                    '#424544'
                )
            } else if (cell == b.WHITE_CHIP) {
                ctx.fillStyle = '#f4fdfa'
                drawCircle(
                    (x + 0.5) * cell_size + coordinateOffset + 1,
                    (y + 0.5) * cell_size + coordinateOffset + 1,
                    '#b0a7a7'
                )
                drawCircle(
                    (x + 0.5) * cell_size + coordinateOffset - 1,
                    (y + 0.5) * cell_size + coordinateOffset - 1,
                    '#f3fcf9'
                )
            }
        }
    }
    //draw last move location (small red dot)
    if (lastMoveLocation) {
        const [x, y] = lastMoveLocation;
        ctx.fillStyle = '#ff0000'
        ctx.beginPath()
        ctx.arc(
            (x + 0.5) * cell_size + coordinateOffset,
            (y + 0.5) * cell_size + coordinateOffset,
            4,
            0,
            2 * Math.PI
        )
        ctx.fill()
    }
    if (!drawLegalMoves) return;
    //draw legal moves (chip outlines)
    ctx.strokeStyle = '#006B49'
    ctx.lineWidth = 2

    for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
            if (isMoveLegal(x, y, legal_moves)) {
                ctx.beginPath()
                ctx.arc(
                    (x + 0.5) * cell_size + coordinateOffset,
                    (y + 0.5) * cell_size + coordinateOffset,
                    cell_size * 0.4,
                    0,
                    2 * Math.PI
                )
                ctx.stroke()
            }
        }
    }
}

function updateStatus(is_whites_turn, move_number) {
    statusIndicator.textContent =
        'Move: ' +
        (move_number + 1) +
        ' | ' +
        (is_whites_turn ? "White's turn ⚪" : "Black's turn ⚫")
}

drawBoard(board)
updateStatus(is_whites_turn, move_number)
let isProcessing = false;
let playerHasLegalMoves = true;
let aiHasLegalMoves = true;

/**
 * Main game logic.
 * 
 * @param {Event} event 
 * @returns 
 */
async function handleClick(event) {

    if (isProcessing) return;
    const x = Math.floor((event.offsetX - coordinateOffset) / cell_size)
    const y = Math.floor((event.offsetY - coordinateOffset) / cell_size)

    //LOGIC: When the player clicks, check if the move was legal. If it wasn't, return.
    //Check if the ai has legal moves. 
    //If it doesn't, return
    //If it does, prompt it to make a move.
    //while the player has no legal moves, 
    //prompt the ai to make a move.
    //if the ai has no legal moves,
    //then end the game.

    let playerMoveIsLegal = isMoveLegal(x, y, legal_moves)
    let playerHasLegalMoves = anyLegalMoves(legal_moves)
    if (!playerMoveIsLegal) return;
    //play move
    board.playMove(x, y, is_whites_turn)
    lastMoveLocation = [x, y]
    move_number++
    is_whites_turn = !is_whites_turn
    drawBoard(board, false)
    isProcessing = true;

    do {
        legal_moves = board.findLegalMoves(is_whites_turn)
        if (!anyLegalMoves(legal_moves)) break;
        console.log("Prompting AI")
        const [aiMoveX, aiMoveY] = await miniMaxAI(board, legal_moves, is_whites_turn);
        board.playMove(aiMoveX, aiMoveY, is_whites_turn)
        lastMoveLocation = [aiMoveX, aiMoveY]
        move_number++
        drawBoard(board, false)
        updateStatus(is_whites_turn, move_number)
        playerHasLegalMoves = anyLegalMoves(board.findLegalMoves(!is_whites_turn))
    } while (!playerHasLegalMoves)

    is_whites_turn = !is_whites_turn
    legal_moves = board.findLegalMoves(is_whites_turn)
    drawBoard(board, true)
    updateStatus(is_whites_turn, move_number)
    if (!anyLegalMoves(legal_moves)) {
        //no one has legal moves, end the game
        handleGameEnd(board)
    }
    isProcessing = false;
    return
}

canvas.addEventListener('click', handleClick)

function anyLegalMoves(legal_moves) {
    for (const row of legal_moves) {
        if (row != 0) return true
    }
    return false
}

function handleGameEnd(board) {
    drawBoard(board)
    board.logBoard()
    //count chips, declare winner
    let white_count = 0
    let black_count = 0
    for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
            const cell = board.getCell(x, y)
            if (cell == board.BLACK_CHIP) black_count++
            if (cell == board.WHITE_CHIP) white_count++
        }
    }
    if (white_count > black_count) {
        statusIndicator.textContent =
            'White wins! 🎉 (' + white_count + '-' + black_count + ')'
    } else if (black_count > white_count) {
        statusIndicator.textContent =
            'Black wins! 🎉 (' + black_count + '-' + white_count + ')'
    } else {
        statusIndicator.textContent = 'Draw!'
    }
}

newGameButton.addEventListener('click', () => {
    board.data.fill(0)
    board.setCell(3, 3, true)
    board.setCell(4, 4, true)
    board.setCell(3, 4, false)
    board.setCell(4, 3, false)
    is_whites_turn = false
    move_number = 0
    lastMoveLocation = null;
    legal_moves = board.findLegalMoves(is_whites_turn)
    drawBoard(board)
    updateStatus(is_whites_turn, move_number)
})

undoButton.addEventListener('click', () => {
    //TODO
})
redoButton.addEventListener('click', () => {
    //TODO
})


const timer = ms => new Promise(res => setTimeout(res, ms))

async function runAI(board, legal_moves, is_whites_turn) {

    await timer(300)
    //simple AI that plays the a random legal move.
    const legal_moves_array = []
    for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
            if (isMoveLegal(x, y, legal_moves)) {
                legal_moves_array.push([x, y])
            }
        }
    }
    const randomIndex = Math.floor(Math.random() * legal_moves_array.length)
    const [x, y] = legal_moves_array[randomIndex]
    return [x, y]
}
function isMoveLegal(x, y, legal_moves) {
    return legal_moves[y] & (1 << x)
}

async function runAIGreedy(board, legal_moves, is_whites_turn) {
    await timer(300)
    let move;
    let score = 0;

    for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
            if (isMoveLegal(x, y, legal_moves)) {
                let tilesFlipped = board.playMove(x, y, is_whites_turn, false);
                if (tilesFlipped > score) {
                    score = tilesFlipped;
                    move = [x, y];
                }

            }
        }
    }
    return move;
}


async function miniMaxAI(board, legal_moves, is_whites_turn) {
    let move;
    let score = Number.POSITIVE_INFINITY;
    await timer(300);
    for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
            if (isMoveLegal(x, y, legal_moves)) {
                let boardCopy = board.makeCopy();
                boardCopy.playMove(x, y, is_whites_turn, true);
                let board_copy_legal_moves = boardCopy.findLegalMoves(!is_whites_turn)
                let mostTilesFlipped = 0;
                for (let yy = 0; yy < 8; yy++) {
                    for (let xx = 0; xx < 8; xx++) {
                        console.log(xx,yy)
                        if (isMoveLegal(xx, yy, board_copy_legal_moves)) {
                            let tilesFlipped = boardCopy.playMove(xx, yy, !is_whites_turn, false);
                            if (tilesFlipped > mostTilesFlipped) mostTilesFlipped = tilesFlipped;
                        }
                    }
                }
                if (mostTilesFlipped < score) {
                    score = mostTilesFlipped;
                    move = [x, y]
                }

            }
        }
    }
    console.log("Playing Move:", move)
    return move;
}