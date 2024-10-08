export class Board {
    NONE = 0;
    BLACK_CHIP = 2;
    WHITE_CHIP = 3;
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
    ];
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
    ];
    quadrant_reindexings = [
        [0, 1, 2, 3, 4, 5, 6, 7], //TL
        [4, 3, 2, 1, 0, 7, 6, 5], //TR
        [0, 7, 6, 5, 4, 3, 2, 1], //BL
        [4, 5, 6, 7, 0, 1, 2, 3] //BR
    ];
    directions = [
        [1, 0], //R
        [1, 1], //BR
        [0, 1], //B
        [-1, 1], //BL
        [-1, 0], //L
        [-1, -1], //TL
        [0, -1], //T
        [1, -1] //TR
    ];
    direction_names = [
        'Right',
        'Bottom Right',
        'Bottom',
        'Bottom Left',
        'Left',
        'Top Left',
        'Top',
        'Top Right'
    ];
    constructor() {
        this.data = new Uint16Array(8);
        //8x8 board, 2 bits per cell
        //stored as is_on, is_white
    }
    // gets the exact spot on the board
    get_cell(x, y) {
        return (this.data[y] >> (x << 1)) & 3;
    }
    //used for flipping chips 
    set_cell(x, y, is_white) {
        this.data[y] &= ~(3 << (x << 1));
        this.data[y] |= (is_white | 2) << (x << 1);
    }
    make_copy() {
        let b = new Board();
        b.data = new Uint16Array(this.data);
        return b;
    }
    //prints out the board into the console 
    log_board() {
        let txt = '';
        for (let y = 0; y < 8; y++) {
            let row = '';
            for (let x = 0; x < 8; x++) {
                row +=
                    this.get_cell(x, y) == 0 ? '.' : this.get_cell(x, y) == 2 ? 'B' : 'W';
            }
            txt += row + '\n';
        }
        console.log(txt);
    }
    play_move(x, y, is_white, change_board = true) {
        let count = 0;
        //assume move is legal
        const my_chip = is_white ? this.WHITE_CHIP : this.BLACK_CHIP;
        const enemy_chip = is_white ? this.BLACK_CHIP : this.WHITE_CHIP;
        if (change_board) this.set_cell(x, y, is_white);
        const LMC_type = this.legal_move_checkers[y][x];
        const num_tiles_in_each_dir = this.legal_move_checker_types[LMC_type];
        const quadrant = (x > 3) | ((y > 3) << 1); //0: TL, 1: TR, 2: BL, 3: BR
        const reindexing = this.quadrant_reindexings[quadrant];
        for (let i = 0; i < 8; i++) {
            let num_tiles = num_tiles_in_each_dir[i];
            if (num_tiles == 0) continue;

            let direction = this.directions[reindexing[i]];

            // console.log('Checking direction:', this.direction_names[reindexing[i]], 'for', num_tiles, 'terms');
            let [dx, dy] = direction;

            if (this.get_cell(x + dx, y + dy) != enemy_chip) continue;

            for (let j = 1; j <= num_tiles + 1; j++) {
                // console.log('Checking distance:', j)
                let cell = this.get_cell(x + j * dx, y + j * dy);
                if (cell == 0) break;
                if (cell == my_chip) {
                    for (let k = 1; k <= j; k++) {
                        if (change_board) {
                            this.set_cell(x + k * dx, y + k * dy, is_white);
                        }
                        count++;
                    }
                    break;
                }
            }
        }
        return count;
    }
    //goes through the whole board and finds the legal moves for the player depending on the parameter given 
    find_legal_moves(is_white) {
        //fast check if move is legal, using https://phwl.org/assets/papers/othello_fpt04.pdf
        const my_chip = is_white ? this.WHITE_CHIP : this.BLACK_CHIP;
        const enemy_chip = is_white ? this.BLACK_CHIP : this.WHITE_CHIP;
        let legal_moves = new Uint8Array(8);
        for (let y = 0; y < 8; y++) {
            for (let x = 0; x < 8; x++) {
                if (this.get_cell(x, y) != 0) continue;
                const LMC_type = this.legal_move_checkers[y][x];
                const num_tiles_in_each_dir = this.legal_move_checker_types[LMC_type];
                const quadrant = (x > 3) | ((y > 3) << 1); //0: TL, 1: TR, 2: BL, 3: BR
                const reindexing = this.quadrant_reindexings[quadrant];

                for (let i = 0; i < 8; i++) {
                    let num_tiles = num_tiles_in_each_dir[i];
                    if (num_tiles == 0) continue;
                    let direction = this.directions[reindexing[i]];
                    let [dx, dy] = direction;
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
                            this.get_cell(x + 7 * dx, y + 7 * dy) == my_chip);

                    if (is_dir_legal) {
                        legal_moves[y] |= 1 << x;
                        break;
                    }
                }
            }
        }
        return legal_moves;
    }
}
//uses bit shifting to check through every spot in an 8 bit array(each row) 
export function is_move_legal(x, y, legal_moves) {
    return legal_moves[y] & (1 << x);
}
const timer = ms => new Promise(res => setTimeout(res, ms));
//THIS FUNCTION RUNS AN AI THAT PLAYS ITS MOVES COMPLETELY RANDOM 

// export function runAI(board, legal_moves, is_whites_turn) {
//     //simple AI that plays the a random legal move.
//     const legal_moves_array = [];
//     for (let y = 0; y < 8; y++) {
//         for (let x = 0; x < 8; x++) {
//             if (is_move_legal(x, y, legal_moves)) {
//                 legal_moves_array.push([x, y]);
//             }
//         }
//     }
//     const rand_index = Math.floor(Math.random() * legal_moves_array.length);
//     const [x, y] = legal_moves_array[rand_index];
//     return [x, y];
// }

//THIS AI EXECUTES VERY POORLY 
// THE POINT OF THIS AI IS TO TAKE AS MANY PIECES AS IT CAN DURING ITS CURRENT TURN WITHOUT LOOKING AHEAD 
// export function runAIGreedy(board, legal_moves, is_whites_turn) {
//     let move;
//     let score = 0;

//     for (let y = 0; y < 8; y++) {
//         for (let x = 0; x < 8; x++) {
//             if (is_move_legal(x, y, legal_moves)) {
//                 let tiles_flipped = board.play_move(x, y, is_whites_turn, false);
//                 if (tiles_flipped > score) {
//                     score = tiles_flipped;
//                     move = [x, y];
//                 }

//             }
//         }
//     }
//     return move;
// }
//ORIGINAL MINIMAX FUNCTION 
//THIS FUNCTION WOULD LOOK A FIXED NUMBER OF MOVES AHEAD 
// IT WAS A SETUP FOR THE MINIMAX RECURSIVE METHOD 
//function is made to look one move ahead and try to make the move that is least beneficial for the opponent 
// minimax_ai(board, legal_moves, is_whites_turn) {
//     let move;
//     let score = Number.POSITIVE_INFINITY;
//     for (let y = 0; y < 8; y++) {
//         for (let x = 0; x < 8; x++) {
//             if (is_move_legal(x, y, legal_moves)) {
//                 let board_copy = board.make_copy();
//                 board_copy.play_move(x, y, is_whites_turn, true);
//                 let board_copy_legal_moves = board_copy.find_legal_moves(!is_whites_turn);
//                 let most_tiles_flipped = 0;
//                 for (let yy = 0; yy < 8; yy++) {
//                     for (let xx = 0; xx < 8; xx++) {
//                         console.log(xx, yy);
//                         if (is_move_legal(xx, yy, board_copy_legal_moves)) {
//                             let tiles_flipped = board_copy.play_move(xx, yy, !is_whites_turn, false);
//                             if (tiles_flipped > most_tiles_flipped) most_tiles_flipped = tiles_flipped;
//                         }
//                     }
//                 }
//                 if (most_tiles_flipped < score) {
//                     score = most_tiles_flipped;
//                     move = [x, y];
//                 }

//             }
//         }
//     }
//     console.log("Playing Move:", move);
//     return move;
// }
// when looking ahead it gives a move a "score" and whichever move has the best "score" thats the one it will play 
// the score it based on how many chips the turn flips 
export function score_board(board, is_whites_turn) {
    const weights = [
        [10, -1, 1, 1, 1, 1, -1, 10],
        [-1, -1, 1, 1, 1, 1, -1, -1],
        [1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1],
        [1, 1, 1, 1, 1, 1, 1, 1],
        [-1, -1, 1, 1, 1, 1, -1, -1],
        [10, -1, 1, 1, 1, 1, -1, 10],
    ];
    let empty = 0;
    let score = 0;
    let my_chip = is_whites_turn | 2;
    for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
            let chip = board.get_cell(x, y);
            if (chip == 0) {
                empty++;
                continue;
            }
            score += (my_chip == chip ? 1 : -1) * weights[y][x];

        }
    }
    return score;
}
export function iterative_deepening_ai(board, is_whites_turn) {
    let best_move
    let best_previous
    let best_score = -Infinity;
    const TIME_LIMIT = 500
    let end_time = Date.now() + TIME_LIMIT; // if the time limit is reach 
    for (let depth = 1; Date.now() < end_time; depth++) {
        console.log("depth = ", depth)
        let moves = board.find_legal_moves(is_whites_turn)
        // log_legal_moves(moves)
        // if (best_previous) {
        //     moves.sort((alp, bet,) => (a.x === best_previous.x && a.y === best_previous.y) ? 1 : -1)
        // }
        let [move, score] = mini_max_recursive(board, depth,true, moves, -Infinity, Infinity, end_time)
        console.log("move=", move, "score=", score)
        if (Date.now() > end_time) {
            // console.log("time limit reached")
            break
        }
        if (score != null && score > -Infinity) {
            best_move = move
            best_score = score
        }
        // if (score == Infinity) {
        //     console.log("score was infinity")
        //     break;
        // }
        // if (score == -Infinity) {
        //     console.log("score was -infinity")
        //     break;
        // }
        best_previous = best_move;
    }
    console.log("returning best move", best_move)
    return best_move
}
// meant to play defensive moves
// looks through all its possible moves and evaluates whic hleast beenfits the opponents next move 
// evaulates which piece to play based on our previous score function, the number of pieces it flips 
export function mini_max_recursive(current_board, depth, is_whites_turn, curr_legal_moves, alpha, beta, end_time) {
    // current_board.log_board()

    // console.log(depth, is_whites_turn)
    if (Date.now() > end_time) {
        console.log("Time limit reached")
        return [0, null]
    }
    if (depth == 0) {
        return [0, score_board(current_board, true)]
    }
    let search_strategies = [
        [0, 8, 1],
        [8, 0, -1]
    ];
    const [ystart, yend, yinc] = search_strategies[~~(Math.random * 2)];
    const [xstart, xend, xinc] = search_strategies[~~(Math.random * 2)];
    // log_legal_moves(curr_legal_moves)
    let best_move, best_score;

    best_score = is_whites_turn ? -Infinity : Infinity;

    for (let y = ystart; y < yend; y += yinc) {
        for (let x = xstart; x < xend; x += xinc) {
            //search through all legal moves.
            if (is_move_legal(x, y, curr_legal_moves)) {
                // console.log("move was legal: ", x, y)
                const next_board = current_board.make_copy();
                next_board.play_move(x, y, is_whites_turn, true);

                let next_legal_moves = next_board.find_legal_moves(!is_whites_turn);
                // console.log("next_legal_moves", next_legal_moves)
                let [_, curr_score] = mini_max_recursive(next_board, depth - 1, !is_whites_turn, next_legal_moves, alpha, beta, end_time);
                // console.log("curr_score=", curr_score, "best_score=", best_score)

                if (is_whites_turn) {
                    if (curr_score > best_score) {
                        best_score = curr_score;
                        best_move = [x, y];
                    }
                    alpha = Math.max(alpha, curr_score);
                } else {
                    if (curr_score < best_score) {
                        best_score = curr_score;
                        best_move = [x, y];
                    }
                    beta = Math.min(beta, curr_score);
                }
                if (beta <= alpha) {
                    // console.log("pruning")
                    return [best_move, best_score]
                }
            }
        }
    }

    // console.log("Returning best move", best_move)
    return [best_move, best_score]
}



export function any_legal_moves(legal_moves) {
    for (const row of legal_moves) {
        if (row != 0) return true;
    }
    return false;
}
// uses the find legal move function and rhe is move legal function 
//according to thr spot on the board it makes a new log statement that prints the board with just dots and Ls 
// the Ls represent the legal moves on the board 
export function log_legal_moves(legal_moves) {
    let txt = '';
    for (let y = 0; y < 8; y++) {
        let row = '';
        for (let x = 0; x < 8; x++) {
            row += is_move_legal(x, y, legal_moves) ? 'L' : '.';
        }
        txt += row + '\n';
    }
    console.log(txt);
}

// export function is_move_legal(x, y, legal_moves) {
//     return legal_moves[y] & (1 << x);
// }   

self.addEventListener("message", async function (event) {
    const DEPTH = 6;
    // Handle the received message
    let data = event.data;

    let board = Object.assign(new Board(), data.current_board);
    console.log("board:", board);
    let is_whites_turn = data.is_whites_turn;
    let legal_moves = undefined;
    let move = null;
    let player_has_legal_moves = undefined;
    do {
        //is finding legal moves for AI
        legal_moves = board.find_legal_moves(is_whites_turn);
        //if the Ai has no legal moves check again for the player's legal moves 
        if (!any_legal_moves(legal_moves)) {
            player_has_legal_moves = any_legal_moves(board.find_legal_moves(!is_whites_turn));
            break;  // AI has no moves
        }

        console.log("Prompting AI");
        let move = iterative_deepening_ai(board, is_whites_turn);
        // console.log("score=", score);
        //the move it is going to play 
        // console.log("got move: ", move)
        // //what the AI's current board looks like 
        // console.log("internal board state for AI:", board.log_board())
        // //printing out all of the AI's legal moves 
        // console.log("internal legal moves for AI:", log_legal_moves(legal_moves))
        if (move == null) { // AI has no move (I shouldn't need this theres probably a bug in the minimax)
            console.log("Move was null. Legal moves are: ");
            log_legal_moves(legal_moves);
            player_has_legal_moves = any_legal_moves(board.find_legal_moves(!is_whites_turn));
            break;
        }
        await timer(100);
        console.log("AI move:", move);
        let message = {
            legal_moves: legal_moves,
            ai_move: move,
            status_message: "playing move"
        };
        //send next move
        console.log("sending move");
        board.play_move(move[0], move[1], is_whites_turn);
        self.postMessage(message);

        // board.play_move(ai_move_x, ai_move_y, is_whites_turn);
        //last_move = [ai_move_x, ai_move_y];

        // draw_board(board, false);
        // update_status(is_whites_turn, move_number);
        player_has_legal_moves = any_legal_moves(board.find_legal_moves(!is_whites_turn));
        console.log("Player has legal moves:", player_has_legal_moves);
    } while (!player_has_legal_moves); // while the player has no moves
    //run ai 


    let status = "passing turn";
    let message = {
        legal_moves: legal_moves,
        ai_move: null,
        status_message: status
    };
    // Send a response back to the main thread
    self.postMessage(message);


});
