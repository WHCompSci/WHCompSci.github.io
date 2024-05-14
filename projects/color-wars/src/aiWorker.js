importScripts('./board.js')
importScripts('./evaluation.js')



let PTC = null
let my_player_idx = null
let evaluation = null

addEventListener('message', async event => {
    const { board, eval_function, alive_players, player_idx, ptc, is_first_turn } = event.data
    const b = Object.assign(new Board(), board)
    console.assert(alive_players[player_idx] === true) // we're alive!
    PTC = ptc
    my_player_idx = player_idx
    evaluation = EVAL_FUNCS[eval_function]
    // console.log("pitc", ptc)
    // console.log("PTC", PTC)
    // console.log(player_idx)
    console.log("eval=",evaluation(b, PTC[my_player_idx]));
    const move = iterative_deepening_mm_ai(b, player_idx, alive_players, is_first_turn)
    postMessage(move)
})
const timer = ms => new Promise(res => setTimeout(res, ms))


function iterative_deepening_mm_ai(board, player_idx, alive_players, is_first_turn) {
    if (is_first_turn) {
        console.log("first turn")
        return first_turn_move(board)
    }
    let best_move
    let best_move_from_previous_iteration
    let best_score = -Infinity
    let TIME_LIMIT = 250
    let start_time = Date.now() // if the time limit is reached, return the best move so far

    for (let depth = 1; Date.now() - start_time < TIME_LIMIT; depth++) {
        console.log('depth', depth)
        let moves = board.get_legal_moves_not_first_turn(PTC[player_idx])
        if(best_move_from_previous_iteration){
            //sort the moves so that the best move from the previous iteration is checked first
            moves.sort((a, b) => (a.x === best_move_from_previous_iteration.x && a.y === best_move_from_previous_iteration.y) ? -1 : 1)
        }
        let { move, score } = minimax(board, player_idx, moves, depth, alive_players, -Infinity, Infinity, start_time, TIME_LIMIT)
        console.log('score', score)
        console.log('move', move)
        if (score != null && score > -Infinity) {
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

function minimax(board, player_idx, moves, depth, alive_players, alpha, beta, start_time, TIME_LIMIT) {
    let color = PTC[player_idx]
    //mini-max with alpha beta pruning
    if (Date.now() - start_time > TIME_LIMIT) {
        return { score: null, move: null }
    }
    if (depth === 0) {
        return { score: evaluation(board, color), move: null }
    }

    
    
    
    let best_move = null
    const is_maximizing = player_idx == my_player_idx
    let best_score = is_maximizing ? -Infinity : Infinity

    // if (moves.length == 0 && is_maximizing) {
    //     return {score: -Infinity, move: null}
    // }
    //add a "NONE" move
    for (let move of moves) {
        let new_board = board.copy()
        
        new_board.play_move(move.x, move.y, color, false)
        let new_moves = new_board.get_legal_moves_not_first_turn(PTC[(player_idx + 1) % PTC.length])
        let { score } = minimax(new_board, (player_idx + 1) % PTC.length, new_moves, depth - 1, alpha, beta, start_time, TIME_LIMIT)
        
        if(score == null) {
            return { score: null, move: null }
        }
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





function first_turn_move(board) {
    // await timer(500)
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