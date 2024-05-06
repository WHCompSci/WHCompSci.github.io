importScripts('./board.js')

let PTC = null

addEventListener('message', async event => {
    const { board, color, player_idx, ptc, is_first_turn } = event.data
    const b = Object.assign(new Board(), board)
    PTC = ptc
    // console.log("pitc", ptc)
    // console.log("PTC", PTC)
    // console.log(player_idx)
    const move = await iterative_deepening_mm_ai(b, player_idx, is_first_turn)
    postMessage(move)
})
const timer = ms => new Promise(res => setTimeout(res, ms))



function evaluate_board(board, color) {
    // This is a very simple evaluation function.
    let score = 0
    let others_score = 0
    const size = board.BOARD_SIZE
    for (let x = 0; x < size; x++) {
        for (let y = 0; y < size; y++) {
            if (board.check_color(x, y, color)) {
                const {my_color, my_dots} = board.get_tile(x,y)
                //its our color
                let found_gte_neighbor = false;
                for(const {nx, ny} of board.get_neighbors()) {  
                    const {n_color, n_dots} = board.get_tile(nx, ny)
                    if(n_color === my_color) continue
                    if(n_dots >= my_dots) {
                        found_gte_neighbor = true
                        break
                    } 
                }   
               score += found_gte_neighbor ? -1 : 1
            }
            // } else if (!board.is_empty(x, y)) {
            //     others_score++
            // }
        }
    }
    // if (others_score === 0) { // we won
    //     return Infinity
    // }
    // if(score === 0) { // we lost
    //     return -Infinity
    // }
    return score
}

async function iterative_deepening_mm_ai(board, player_idx, is_first_turn) {
    if (is_first_turn) {
        return await first_turn_move(board)
    }
    let best_move
    let best_move_from_previous_iteration
    let best_score = -Infinity
    let TIME_LIMIT = 350
    let start_time = Date.now() // if the time limit is reached, return the best move so far

    for (let depth = 1; Date.now() - start_time < TIME_LIMIT; depth++) {
        console.log('depth', depth)
        let moves = board.get_legal_moves_not_first_turn(PTC[player_idx])
        if(best_move_from_previous_iteration){
            //sort the moves so that the best move from the previous iteration is checked first
            moves.sort((a, b) => (a.x === best_move_from_previous_iteration.x && a.y === best_move_from_previous_iteration.y) ? -1 : 1)
        }
        let { move, score } = minimax(board, player_idx, moves,  depth, -Infinity, Infinity, true, start_time, TIME_LIMIT)
        console.log('score', score)
        if (score > -Infinity && Date.now() - start_time < TIME_LIMIT){
            best_move = move
            best_score = score
        }
        
        if (score === Infinity) {
            break
        }
        if(score === -Infinity){
            break
        }
        best_move_from_previous_iteration = best_move
    }
    console.log("best move", best_move)
    return best_move
}

function minimax(board, player_idx, moves, depth, alpha, beta, is_maximizing, start_time, TIME_LIMIT) {
    //mini-max with alpha beta pruning
    if (Date.now() - start_time > TIME_LIMIT) {
        return { score: evaluate_board(board, player_idx), move: null }
    }
    if (depth === 0) {
        return { score: evaluate_board(board, player_idx), move: null }
    }
    let color = PTC[player_idx]
    let best_move = null
    let best_score = is_maximizing ? -Infinity : Infinity
    for (let move of moves) {
        let new_board = board.copy()
        new_board.play_move(move.x, move.y, color, false)
        let new_moves = new_board.get_legal_moves_not_first_turn(PTC[(player_idx + 1) % PTC.length])
        

        let { score } = minimax(new_board, (player_idx + 1) % PTC.length, new_moves, depth - 1, alpha, beta, !is_maximizing, start_time, TIME_LIMIT)
        
        //ALPHA BETA PRUNING
        //when we go back up the tree, we want to maximize the score for the player, and minimize the score for the opponent. (minimax algorithm)
        // Let's call alpha the best score we have found so far for the player, and beta the best score we have found so far for the opponent.

        //if alpha is greater than or equal to beta, we can "prune" the rest of the tree, meaning we don't need to explore it 
        // because we assume that the opponent will not allow us to get a score greater than alpha.
        if (is_maximizing) {
            if (score > best_score) {
                best_score = score
                best_move = move
            }
            if(best_score > beta) {
                break
            }
            alpha = Math.max(alpha, score)
        } else {
            if (score < best_score) {
                best_score = score
                best_move = move
            }
            if(best_score < alpha) {
                break
            }
            beta = Math.min(beta, score)
        }
    }
    return { score: best_score, move: best_move }
}





async function first_turn_move(board) {
    await timer(500)
    //object assign board
    const possible_moves = []
    const size = board.BOARD_SIZE
    for (let x = 1; x < size - 1; x++) {
        for (let y = 1; y < size  - 1; y++) {
            //check if any of the neighbors have dots already, if so, do not place a dot there, 
            // as it will be captured by the opponent and you will lose the game on turn 2
            
            let neighbors = board.get_neighbors(x, y)
            let has_neighbor = false
            for (let neighbor of neighbors) {
                if (!board.is_empty(neighbor.x, neighbor.y)) {
                    has_neighbor = true
                    break
                }
            }
            if (has_neighbor) {
                continue
            }
            if (board.is_empty(x, y)) {
                possible_moves.push({ x, y })
            }

        }
    }
    return possible_moves[Math.floor(Math.random() * possible_moves.length)]
}