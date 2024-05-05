class Board {
    //boards are stored as binary numbers. Each tile is 4 bits.
    //The first 2 bits (little endian) are the color, the last 2 bits are the number of dots

    constructor(BOARD_SIZE = 6) {
        this.BOARD_SIZE = BOARD_SIZE
        this.board = new Uint8Array(BOARD_SIZE * BOARD_SIZE * 4)
    }
    get_tile(x, y) {
        let index = (y * this.BOARD_SIZE + x) * 4
        return {
            color: this.board[index] & 0b11,
            dots: this.board[index] >> 2
        }
    }
    set_tile(x, y, color, dots) {
        console.assert(color < 4 && dots < 4, 'Invalid color or dots')
        let index = (y * this.BOARD_SIZE + x) * 4
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
        return x >= 0 && x < this.BOARD_SIZE && y >= 0 && y < this.BOARD_SIZE
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
    get_legal_moves_not_first_turn(color) {
        let moves = []
        for (let x = 0; x < this.BOARD_SIZE; x++) {
            for (let y = 0; y < this.BOARD_SIZE; y++) {
                if (this.check_color(x, y, color)) {
                    moves.push({ x, y })
                }
            }
        }
        return moves
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
    copy() {
        let new_board = new Board(this.BOARD_SIZE)
        new_board.board = new Uint8Array(this.board)
        return new_board
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