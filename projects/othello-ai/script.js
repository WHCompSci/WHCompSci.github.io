class Board {
    NONE = 0
    BLACK_CHIP = 2
    WHITE_CHIP = 3
    //locations of the different legal move checker types on the board
    //https://phwl.org/assets/papers/othello_fpt04.pdf
    legal_move_checkers = [
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
    legal_move_checker_types = [
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
    quadrant_reindexings = [
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
    get_cell(x, y) {
        return (this.data[y] >> (x << 1)) & 3
    }
    set_cell(x, y, is_white) {
        this.data[y] &= ~(3 << (x << 1))
        this.data[y] |= (is_white | 2) << (x << 1)
    }
    make_copy() {
        let b = new Board()
        b.data = new Uint16Array(this.data)
        return b
    }
    log_board() {
        let txt = ''
        for (let y = 0; y < 8; y++) {
            let row = ''
            for (let x = 0; x < 8; x++) {
                row +=
                    this.get_cell(x, y) == 0 ? '.' : this.get_cell(x, y) == 2 ? 'B' : 'W'
            }
            txt += row + '\n'
        }
        console.log(txt)
    }
    play_move(x, y, is_white, change_board = true) {
        let count = 0;
        //assume move is legal
        const my_chip = is_white ? this.WHITE_CHIP : this.BLACK_CHIP
        const enemy_chip = is_white ? this.BLACK_CHIP : this.WHITE_CHIP
        if (change_board) this.set_cell(x, y, is_white)
        const LMC_type = this.legal_move_checkers[y][x]
        const num_tiles_in_each_dir = this.legal_move_checker_types[LMC_type]
        const quadrant = (x > 3) | ((y > 3) << 1) //0: TL, 1: TR, 2: BL, 3: BR
        const reindexing = this.quadrant_reindexings[quadrant]
        for (let i = 0; i < 8; i++) {
            let num_tiles = num_tiles_in_each_dir[i]
            if (num_tiles == 0) continue

            let direction = this.directions[reindexing[i]]

            // console.log('Checking direction:', this.direction_names[reindexing[i]], 'for', num_tiles, 'terms');
            let [dx, dy] = direction

            if (this.get_cell(x + dx, y + dy) != enemy_chip) continue

            for (let j = 1; j <= num_tiles + 1; j++) {
                // console.log('Checking distance:', j)
                let cell = this.get_cell(x + j * dx, y + j * dy)
                if (cell == 0) break
                if (cell == my_chip) {
                    for (let k = 1; k <= j; k++) {
                        if (change_board) {
                            this.set_cell(x + k * dx, y + k * dy, is_white)
                        }
                        count++
                    }
                    break
                }
            }
        }
        return count;
    }
    find_legal_moves(is_white) {
        //fast check if move is legal, using https://phwl.org/assets/papers/othello_fpt04.pdf
        const my_chip = is_white ? this.WHITE_CHIP : this.BLACK_CHIP
        const enemy_chip = is_white ? this.BLACK_CHIP : this.WHITE_CHIP
        let legal_moves = new Uint8Array(8)
        for (let y = 0; y < 8; y++) {
            for (let x = 0; x < 8; x++) {
                if (this.get_cell(x, y) != 0) continue
                const LMC_type = this.legal_move_checkers[y][x]
                const num_tiles_in_each_dir = this.legal_move_checker_types[LMC_type]
                const quadrant = (x > 3) | ((y > 3) << 1) //0: TL, 1: TR, 2: BL, 3: BR
                const reindexing = this.quadrant_reindexings[quadrant]

                for (let i = 0; i < 8; i++) {
                    let num_tiles = num_tiles_in_each_dir[i]
                    if (num_tiles == 0) continue
                    let direction = this.directions[reindexing[i]]
                    let [dx, dy] = direction
                    // ugly code, but it's fast apparently
                    const is_dir_legal =
                        (num_tiles >= 1 &&
                            this.get_cell(x + dx, y + dy) == enemy_chip &&
                            this.get_cell(x + 2 * dx, y + 2 * dy) == my_chip) ||
                        (num_tiles >= 2 &&
                            this.get_cell(x + dx, y + dy) == enemy_chip &&
                            this.get_cell(x + 2 * dx, y + 2 * dy) == enemy_chip &&
                            this.get_cell(x + 3 * dx, y + 3 * dy) == my_chip) ||
                        (num_tiles >= 3 &&
                            this.get_cell(x + dx, y + dy) == enemy_chip &&
                            this.get_cell(x + 2 * dx, y + 2 * dy) == enemy_chip &&
                            this.get_cell(x + 3 * dx, y + 3 * dy) == enemy_chip &&
                            this.get_cell(x + 4 * dx, y + 4 * dy) == my_chip) ||
                        (num_tiles >= 4 &&
                            this.get_cell(x + dx, y + dy) == enemy_chip &&
                            this.get_cell(x + 2 * dx, y + 2 * dy) == enemy_chip &&
                            this.get_cell(x + 3 * dx, y + 3 * dy) == enemy_chip &&
                            this.get_cell(x + 4 * dx, y + 4 * dy) == enemy_chip &&
                            this.get_cell(x + 5 * dx, y + 5 * dy) == my_chip) ||
                        (num_tiles >= 5 &&
                            this.get_cell(x + dx, y + dy) == enemy_chip &&
                            this.get_cell(x + 2 * dx, y + 2 * dy) == enemy_chip &&
                            this.get_cell(x + 3 * dx, y + 3 * dy) == enemy_chip &&
                            this.get_cell(x + 4 * dx, y + 4 * dy) == enemy_chip &&
                            this.get_cell(x + 5 * dx, y + 5 * dy) == enemy_chip &&
                            this.get_cell(x + 6 * dx, y + 6 * dy) == my_chip) ||
                        (num_tiles >= 6 &&
                            this.get_cell(x + dx, y + dy) == enemy_chip &&
                            this.get_cell(x + 2 * dx, y + 2 * dy) == enemy_chip &&
                            this.get_cell(x + 3 * dx, y + 3 * dy) == enemy_chip &&
                            this.get_cell(x + 4 * dx, y + 4 * dy) == enemy_chip &&
                            this.get_cell(x + 5 * dx, y + 5 * dy) == enemy_chip &&
                            this.get_cell(x + 6 * dx, y + 6 * dy) == enemy_chip &&
                            this.get_cell(x + 7 * dx, y + 7 * dy) == my_chip)

                    if (is_dir_legal) {
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
let last_move = null; // location of last move for drawing red dot on the screen
board.set_cell(3, 3, true)
board.set_cell(4, 4, true)
board.set_cell(3, 4, false)
board.set_cell(4, 3, false)
let legal_moves = board.find_legal_moves(is_whites_turn)
board.log_board()
log_legal_moves(legal_moves)

function log_legal_moves(legal_moves) {
    let txt = ''
    for (let y = 0; y < 8; y++) {
        let row = ''
        for (let x = 0; x < 8; x++) {
            row += is_move_legal(x, y, legal_moves) ? 'L' : '.'
        }
        txt += row + '\n'
    }
    console.log(txt)
}
const coordinate_offset = 50
const canvas = document.getElementById('board')
const status_indicator = document.getElementById('status')
const new_game_button = document.getElementById('newGame')
const undo_button = document.getElementById('undo')
const redo_button = document.getElementById('redo')

const ctx = canvas.getContext('2d')
const cell_size = Math.floor(
    Math.min(window.innerWidth, window.innerHeight) / 12
)

canvas.width = 8 * cell_size + coordinate_offset
canvas.height = 8 * cell_size + coordinate_offset

canvas.style.border = '0px solid #222222'
function draw_board(b, draw_legal_moves = true) {
    //draw green background #009067
    ctx.fillStyle = '#222222'
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    ctx.fillStyle = '#009067'
    ctx.fillRect(coordinate_offset, coordinate_offset, canvas.width, canvas.height)
    //draw grid lines
    ctx.strokeStyle = '#222222'
    ctx.lineWidth = 1
    ctx.beginPath()
    for (let i = 1; i <= 8; i++) {
        ctx.moveTo(i * cell_size + coordinate_offset, coordinate_offset)
        ctx.lineTo(i * cell_size + coordinate_offset, canvas.height)
        ctx.moveTo(coordinate_offset, i * cell_size + coordinate_offset)
        ctx.lineTo(canvas.width, i * cell_size + coordinate_offset)
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
            (i + 0.5) * cell_size + coordinate_offset,
            0.3 * coordinate_offset
        )
        ctx.fillText(
            i + 1,
            0.3 * coordinate_offset,
            (i + 0.5) * cell_size + coordinate_offset
        )
    }

    //draw small black circles at 4 line intersections lines (1,1), (1,6), (6,1), (6,6)
    ctx.fillStyle = '#222222'
    ctx.beginPath()
    ctx.arc(
        2 * cell_size + coordinate_offset,
        2 * cell_size + coordinate_offset,
        5,
        0,
        2 * Math.PI
    )
    ctx.fill()
    ctx.beginPath()
    ctx.arc(
        2 * cell_size + coordinate_offset,
        6 * cell_size + coordinate_offset,
        5,
        0,
        2 * Math.PI
    )
    ctx.fill()
    ctx.beginPath()
    ctx.arc(
        6 * cell_size + coordinate_offset,
        2 * cell_size + coordinate_offset,
        5,
        0,
        2 * Math.PI
    )
    ctx.fill()
    ctx.beginPath()
    ctx.arc(
        6 * cell_size + coordinate_offset,
        6 * cell_size + coordinate_offset,
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
            const cell = b.get_cell(x, y)
            if (cell == b.BLACK_CHIP) {
                ctx.fillStyle = '#424544'
                drawCircle(
                    (x + 0.5) * cell_size + coordinate_offset + 1,
                    (y + 0.5) * cell_size + coordinate_offset + 1,
                    '#292b2b'
                )
                drawCircle(
                    (x + 0.5) * cell_size + coordinate_offset - 1,
                    (y + 0.5) * cell_size + coordinate_offset - 1,
                    '#424544'
                )
            } else if (cell == b.WHITE_CHIP) {
                ctx.fillStyle = '#f4fdfa'
                drawCircle(
                    (x + 0.5) * cell_size + coordinate_offset + 1,
                    (y + 0.5) * cell_size + coordinate_offset + 1,
                    '#b0a7a7'
                )
                drawCircle(
                    (x + 0.5) * cell_size + coordinate_offset - 1,
                    (y + 0.5) * cell_size + coordinate_offset - 1,
                    '#f3fcf9'
                )
            }
        }
    }
    //draw last move location (small red dot)
    if (last_move) {
        const [x, y] = last_move;
        ctx.fillStyle = '#ff0000'
        ctx.beginPath()
        ctx.arc(
            (x + 0.5) * cell_size + coordinate_offset,
            (y + 0.5) * cell_size + coordinate_offset,
            4,
            0,
            2 * Math.PI
        )
        ctx.fill()
    }
    if (!draw_legal_moves) return;
    //draw legal moves (chip outlines)
    ctx.strokeStyle = '#006B49'
    ctx.lineWidth = 2

    for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
            if (is_move_legal(x, y, legal_moves)) {
                ctx.beginPath()
                ctx.arc(
                    (x + 0.5) * cell_size + coordinate_offset,
                    (y + 0.5) * cell_size + coordinate_offset,
                    cell_size * 0.4,
                    0,
                    2 * Math.PI
                )
                ctx.stroke()
            }
        }
    }
    console.log("White score: ", score_board(board, true));
    console.log("Black score: ", score_board(board, false));
}

function update_status(is_whites_turn, move_number) {
    status_indicator.textContent =
        'Move: ' +
        (move_number + 1) +
        ' | ' +
        (is_whites_turn ? "White's turn ⚪" : "Black's turn ⚫")
}

draw_board(board)
update_status(is_whites_turn, move_number)
let is_processing = false;
/**
 * Main game logic.
 * 
 * @param {Event} event 
 * @returns 
 */
async function handleClick(event) {

    if (is_processing) return;
    const x = Math.floor((event.offsetX - coordinate_offset) / cell_size)
    const y = Math.floor((event.offsetY - coordinate_offset) / cell_size)

    //LOGIC: When the player clicks, check if the move was legal. If it wasn't, return.
    //Check if the ai has legal moves. 
    //If it doesn't, return
    //If it does, prompt it to make a move.
    //while the player has no legal moves, 
    //prompt the ai to make a move.
    //if the ai has no legal moves,
    //then end the game.

    let player_move_is_legal = is_move_legal(x, y, legal_moves)
    let player_has_legal_moves = any_legal_moves(legal_moves)
    if (!player_move_is_legal) return;
    //play move
    board.play_move(x, y, is_whites_turn)
    last_move = [x, y]
    move_number++
    is_whites_turn = !is_whites_turn
    draw_board(board, false)
    is_processing = true;

    do {
        legal_moves = board.find_legal_moves(is_whites_turn)
        if (!any_legal_moves(legal_moves)) break;
        console.log("Prompting AI")
        const [ai_move_x, ai_move_y] = await minimax_ai(board, legal_moves, is_whites_turn);
        board.play_move(ai_move_x, ai_move_y, is_whites_turn)
        last_move = [ai_move_x, ai_move_y]
        move_number++
        draw_board(board, false)
        update_status(is_whites_turn, move_number)
        player_has_legal_moves = any_legal_moves(board.find_legal_moves(!is_whites_turn))
    } while (!player_has_legal_moves)

    is_whites_turn = !is_whites_turn
    legal_moves = board.find_legal_moves(is_whites_turn)
    draw_board(board, true)
    update_status(is_whites_turn, move_number)
    if (!any_legal_moves(legal_moves)) {
        //no one has legal moves, end the game
        handle_game_end(board)
    }
    is_processing = false;
    return
}

canvas.addEventListener('click', handleClick)

function any_legal_moves(legal_moves) {
    for (const row of legal_moves) {
        if (row != 0) return true
    }
    return false
}

function handle_game_end(board) {
    draw_board(board)
    board.log_board()
    //count chips, declare winner
    let white_count = 0
    let black_count = 0
    for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
            const cell = board.get_cell(x, y)
            if (cell == board.BLACK_CHIP) black_count++
            if (cell == board.WHITE_CHIP) white_count++
        }
    }
    if (white_count > black_count) {
        status_indicator.textContent =
            'White wins! 🎉 (' + white_count + '-' + black_count + ')'
    } else if (black_count > white_count) {
        status_indicator.textContent =
            'Black wins! 🎉 (' + black_count + '-' + white_count + ')'
    } else {
        status_indicator.textContent = 'Draw!'
    }
}

new_game_button.addEventListener('click', () => {
    board.data.fill(0)
    board.set_cell(3, 3, true)
    board.set_cell(4, 4, true)
    board.set_cell(3, 4, false)
    board.set_cell(4, 3, false)
    is_whites_turn = false
    move_number = 0
    last_move = null;
    legal_moves = board.find_legal_moves(is_whites_turn)
    draw_board(board)
    update_status(is_whites_turn, move_number)
})

undo_button.addEventListener('click', () => {
    //TODO
})
redo_button.addEventListener('click', () => {
    //TODO
})


const timer = ms => new Promise(res => setTimeout(res, ms))

async function runAI(board, legal_moves, is_whites_turn) {

    await timer(300)
    //simple AI that plays the a random legal move.
    const legal_moves_array = []
    for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
            if (is_move_legal(x, y, legal_moves)) {
                legal_moves_array.push([x, y])
            }
        }
    }
    const rand_index = Math.floor(Math.random() * legal_moves_array.length)
    const [x, y] = legal_moves_array[rand_index]
    return [x, y]
}
function is_move_legal(x, y, legal_moves) {
    return legal_moves[y] & (1 << x)
}

async function runAIGreedy(board, legal_moves, is_whites_turn) {
    await timer(300)
    let move;
    let score = 0;

    for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
            if (is_move_legal(x, y, legal_moves)) {
                let tiles_flipped = board.play_move(x, y, is_whites_turn, false);
                if (tiles_flipped > score) {
                    score = tiles_flipped;
                    move = [x, y];
                }

            }
        }
    }
    return move;
}

//function is made to look one move ahead and try to make the move that is least beneficial for the opponent 
async function minimax_ai(board, legal_moves, is_whites_turn) {
    let move;
    let score = Number.POSITIVE_INFINITY;
    await timer(300);
    for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
            if (is_move_legal(x, y, legal_moves)) {
                let board_copy = board.make_copy();
                board_copy.play_move(x, y, is_whites_turn, true);
                let board_copy_legal_moves = board_copy.find_legal_moves(!is_whites_turn)
                let most_tiles_flipped = 0;
                for (let yy = 0; yy < 8; yy++) {
                    for (let xx = 0; xx < 8; xx++) {
                        console.log(xx, yy)
                        if (is_move_legal(xx, yy, board_copy_legal_moves)) {
                            let tiles_flipped = board_copy.play_move(xx, yy, !is_whites_turn, false);
                            if (tiles_flipped > most_tiles_flipped) most_tiles_flipped = tiles_flipped;
                        }
                    }
                }
                if (most_tiles_flipped < score) {
                    score = most_tiles_flipped;
                    move = [x, y]
                }

            }
        }
    }
    console.log("Playing Move:", move)
    return move;
}
function score_board(board, is_whites_turn) {
    let score = 0;
    let my_chip = is_whites_turn | 2;

    for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
            let chip = board.get_cell(x, y)
            if (my_chip == chip) score++;
        }
    }
    return score;
}

class QueueData {
    constructor(board, curr_depth, is_whites_turn, prev_move) {
        this.board = board
        this.depth = curr_depth
        this.is_whites_turn
        this.prev_move

    }
}


async function mini_max_v2(board, legal_moves, is_whites_turn, max_depth) {
    const queue = [new QueueData(board, 0, false, null)];
    while (queue.length > 0) {
        const curr = queue.pop(0);
        if (curr.depth < max_depth) {
            continue;
        }
        const curr_legal_moves = curr_board.find_legal_moves(curr.is_whites_turn);
        // if(!any_legal_moves(curr_board_legal_moves)) {
        //     continue
        // }
        for (let y = 0; y < 8; y++) {
            for (let x = 0; x < 8; x++) {
                if (is_move_legal(x, y, curr_legal_moves)) {
                    const next_board = curr.board.make_copy();
                    next_board.play_move(x, y, is_whites_turn, true);
                    queue.push(new QueueData(next_board, curr_depth + 1, !is_whites_turn, [x, y]))
                }
            }
        }
    }
}