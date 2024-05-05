//COLOR WARS GAME
const canvas = document.getElementById('canvas')
const smallest_dim = Math.min(window.innerWidth, window.innerHeight)
canvas.height = Math.min(smallest_dim * 0.9, 800)
canvas.width = Math.min(smallest_dim * 0.9, 800)
const TILE_SIZE = canvas.width / 8
const BOARD_SIZE = 5 //5x5 board

const board_offset_x = (canvas.width - TILE_SIZE * BOARD_SIZE) / 2
const board_offset_y = (canvas.height - TILE_SIZE * BOARD_SIZE) / 2
const ctx = canvas.getContext('2d')



const num_players = 2
const Colors = {
    BLUE: {
        name: 'Blue',
        value: 0,
        color: '#4D96FF',
        light_color: '#b3d1ff'
    },
    RED: {
        name: 'Red',
        value: 1,
        color: '#FF6B6B',
        light_color: '#ffd1d1'
    },
    GREEN: {
        name: 'Green',
        value: 2,
        color: '#6BCB77',
        light_color: '#b7e6bd'
    },
    YELLOW: {
        name: 'Yellow',
        value: 3,
        color: '#FFD93D',
        light_color: '#ffe6b3'
    }
}
const COL_ORD = [Colors.BLUE, Colors.RED, Colors.GREEN, Colors.YELLOW]


class Board {
    //boards are stored as binary numbers. Each tile is 4 bits.
    //The first 2 bits (little endian) are the color, the last 2 bits are the number of dots

    constructor() {
        this.board = new Uint8Array(BOARD_SIZE * BOARD_SIZE * 4)
    }
    get_tile(x, y) {
        let index = (y * BOARD_SIZE + x) * 4
        return {
            color: this.board[index] & 0b11,
            dots: this.board[index] >> 2
        }
    }
    set_tile(x, y, color, dots) {
        console.assert(color < 4 && dots < 4, 'Invalid color or dots')
        let index = (y * BOARD_SIZE + x) * 4
        this.board[index] = color + (dots << 2)
    }
    check_color(x, y, color) {
        return !this.is_empty(x, y) && this.get_color(x, y) == color
    }
    clear_tile(x, y) {
        this.set_tile(x, y, 0, 0) //technically it's red with 0 dots. But it's empty
    }
    get_color(x, y) {
        return this.get_tile(x, y).color
    }
    get_dots(x, y) {
        return this.get_tile(x, y).dots
    }
    is_empty(x, y) {
        return this.get_tile(x, y).dots == 0
    }
    is_valid(x, y) {
        return x >= 0 && x < BOARD_SIZE && y >= 0 && y < BOARD_SIZE
    }
    get_neighbors(x, y) {
        let neighbors = []
        //orthogonal neighbors
        let dx = [-1, 1, 0, 0]
        let dy = [0, 0, -1, 1]
        for (let i = 0; i < 4; i++) {
            let nx = x + dx[i]
            let ny = y + dy[i]
            if (this.is_valid(nx, ny)) {
                neighbors.push({ x: nx, y: ny })
            }
        }
        return neighbors
    }
    play_move(x, y, color, is_first_turn) {
        if (!this.is_valid(x, y)) {
            return false
        }
        const is_empty = this.is_empty(x, y)
        if (is_first_turn && is_empty) {
            this.set_tile(x, y, color, 3)
            return true
        }
        if (is_empty || this.get_color(x, y) != color) {
            return false
        }
        let dots = this.get_dots(x, y)
        if (dots == 3) {
            this.set_tile(x, y, color, 0)
            let pos = new Set()
            pos.add(`${x},${y}`)
            this._handle_propagation(pos, color)
            return true
        }
        this.set_tile(x, y, color, dots + 1)
        return true
    }
    _handle_propagation(positions, color) {
        if (positions.size == 0) {
            return
        }

        //set all positions to empty
        for (let pos of positions) {
            let [x, y] = pos.split(',').map(Number)
            this.clear_tile(x, y)
        }

        //for each position, check if it has neighbors with 3 dots. If so,  add them to the list to be propagated and remove the dots.
        let new_positions = new Set()
        for (let pos of positions) {
            let [x, y] = pos.split(',').map(Number)
            let neighbors = this.get_neighbors(x, y)
            for (let neighbor of neighbors) {
                let nx = neighbor.x
                let ny = neighbor.y
                //add 1 to the dots of the neighbor for a max of 3
                let dots = this.get_dots(nx, ny)
                let original_color = this.get_color(nx, ny)
                this.set_tile(nx, ny, color, Math.min(dots + 1, 3))
                if (dots == 3) {
                    new_positions.add(`${nx},${ny}`)
                }
            }
        }

        this._handle_propagation(new_positions, color)
    }
}



function draw_board(board, turn_num) {
    //turn number
    ctx.fillStyle = '#535C91'
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    const curr_player_name = COL_ORD[turn_num % num_players].name
    ctx.fillStyle = '#f0f0f0'
    ctx.font = '30px Sans-serif'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('Turn ' + turn_num + `: ${curr_player_name}'s Turn`, canvas.width / 2, canvas.height * 0.09)

    //instead of drawing grid lines, draw white squares with rounded corners for the tiles.
    const n = 5
    const radius = 15
    const curr_color = turn_num % num_players
    const curr_light_color = COL_ORD[curr_color].light_color
    for (let x = 0; x < BOARD_SIZE; x++) {
        for (let y = 0; y < BOARD_SIZE; y++) {
            ctx.fillStyle = board.check_color(x, y, curr_color) ? curr_light_color : '#f0f0f0'

            // ctx.fillRect(x * TILE_SIZE + board_offset_x + n, y * TILE_SIZE + board_offset_y + n, TILE_SIZE - n, TILE_SIZE - n)
            roundedRect(ctx, x * TILE_SIZE + board_offset_x + n, y * TILE_SIZE + board_offset_y + n, TILE_SIZE - n, TILE_SIZE - n, radius)
        }
    }

    for (let x = 0; x < BOARD_SIZE; x++) {
        for (let y = 0; y < BOARD_SIZE; y++) {
            let color = board.get_color(x, y)
            let dots = board.get_dots(x, y)
            if (dots == 0) {
                continue
            }
            draw_peice(x, y, n, color, dots)
        }
    }
    drawButton()
}
function roundedRect(ctx, x, y, width, height, radius) {
    ctx.beginPath()
    ctx.moveTo(x + radius, y)
    ctx.lineTo(x + width - radius, y)
    ctx.arcTo(x + width, y, x + width, y + radius, radius)
    ctx.lineTo(x + width, y + height - radius)
    ctx.arcTo(x + width, y + height, x + width - radius, y + height, radius)
    ctx.lineTo(x + radius, y + height)
    ctx.arcTo(x, y + height, x, y + height - radius, radius)
    ctx.lineTo(x, y + radius)
    ctx.arcTo(x, y, x + radius, y, radius)
    ctx.closePath()
    // you can fill or stroke the rectangle as you wish, for example:
    ctx.fill()
}

function draw_peice(x, y, n, color, dots) {
    function draw_dot(x, y) {
        ctx.beginPath()
        ctx.arc(
            x * TILE_SIZE + TILE_SIZE / 2 + board_offset_x + n * 0.5,
            y * TILE_SIZE + TILE_SIZE / 2 + board_offset_y + n * 0.5,
            TILE_SIZE * 0.1,
            0,
            2 * Math.PI
        )
        ctx.fill()
    }
    ctx.fillStyle = COL_ORD[color].color
    ctx.beginPath()
    ctx.arc(
        x * TILE_SIZE + TILE_SIZE / 2 + board_offset_x + n * 0.5,
        y * TILE_SIZE + TILE_SIZE / 2 + board_offset_y + n * 0.5,
        TILE_SIZE * 0.4,
        0,
        2 * Math.PI
    )
    ctx.fill()
    ctx.fillStyle = 'white'
    if (dots == 1) {
        draw_dot(x, y)
    }
    if (dots == 2) {
        draw_dot(x - 0.2, y)
        draw_dot(x + 0.2, y)
    }
    if (dots == 3) {
        draw_dot(x, y - 0.2)
        draw_dot(x - 0.1 * Math.sqrt(3), y + 0.1)
        draw_dot(x + 0.1 * Math.sqrt(3), y + 0.1)
    }
}

let board = new Board()
let turn_num = 1
draw_board(board, turn_num)

let game_over = false
canvas.addEventListener('click', e => {
    const X = e.clientX - canvas.getBoundingClientRect().left
    const Y = e.clientY - canvas.getBoundingClientRect().top
    if (isPointInButton(X, Y)) {
        restartGame()
    }


    let rect = canvas.getBoundingClientRect()
    let x = Math.floor((e.clientX - rect.left - board_offset_x) / TILE_SIZE)
    let y = Math.floor((e.clientY - rect.top - board_offset_y) / TILE_SIZE)



    if (game_over) {
        return
    }

    const is_first_turn = turn_num <= num_players
    const color = COL_ORD[turn_num % num_players]
    try_play_move(x, y, color, is_first_turn)


})
function try_play_move(x, y, color, is_first_turn) {
    const played_move = board.play_move(x, y, color.value, is_first_turn)

    if (played_move) {
        const winner = try_end_game(board, turn_num)
        if (winner != null) {
            draw_board(board, turn_num)

            ctx.fillStyle = COL_ORD[winner].color
            ctx.font = '18px Arial'
            ctx.fillText(
                COL_ORD[winner].name + ' wins!',
                canvas.width / 2,
                canvas.height * 0.14
            )
            game_over = true
            return

        }
        turn_num++
        draw_board(board, turn_num)
    }

}


function try_end_game(board, turn_num) {
    if (turn_num <= num_players) {
        return
    }

    let color_scores = Array(num_players).fill(0)
    for (let x = 0; x < BOARD_SIZE; x++) {
        for (let y = 0; y < BOARD_SIZE; y++) {
            let color = board.get_color(x, y)
            if (!board.is_empty(x, y)) {
                color_scores[color]++
            }
        }
    }
    let num_players_left = 0
    let winner = null
    for (let i = 0; i < num_players; i++) {
        if (color_scores[i] > 0) {
            num_players_left++
            winner = i
        }
    }
    if (num_players_left == 1) {
        return winner
    }
    return null
}



function drawButton() {
    const buttonWidth = 200
    const buttonHeight = 50
    const x = canvas.width / 2 - buttonWidth / 2
    const y = canvas.height * .92 - buttonHeight / 2

    // Draw the background rectangle
    ctx.fillStyle = '#1B1A55'
    ctx.fillRect(x, y, buttonWidth, buttonHeight)

    // Draw the foreground rectangle
    ctx.fillStyle = 'white'
    ctx.fillRect(x - 5, y - 5, buttonWidth, buttonHeight)

    // Draw the text
    ctx.fillStyle = 'black'
    ctx.font = '24px Arial'
    ctx.textAlign = 'center'
    ctx.textBaseline = 'middle'
    ctx.fillText('Restart Game', x + buttonWidth / 2, y - 2 + buttonHeight / 2)
}

// Check if a point is within the button
function isPointInButton(x, y) {
    const buttonWidth = 200
    const buttonHeight = 50
    const buttonX = canvas.width / 2 - buttonWidth / 2
    const buttonY = canvas.height * .92 - buttonHeight / 2

    return (
        x >= buttonX &&
        x <= buttonX + buttonWidth &&
        y >= buttonY &&
        y <= buttonY + buttonHeight
    )
}

function restartGame() {
    // Reset the game state and redraw the board
    game_over = false
    turn_num = 1
    board = new Board()

    draw_board(board, turn_num)
}
