const W = new Worker('src/aiWorker.js');


async function get_move(message) {
    return new Promise((resolve, reject) => {
        W.postMessage(message)
        W.onmessage = function (e) {
            resolve(e.data)
            // console.log("got move", e.data)
        }
        W.onerror = reject
    })
}

function print_board(b) {
    for(let y = 0; y < b.BOARD_SIZE; y++) {
        let row = ""
        for(let x = 0; x < b.BOARD_SIZE; x++) {
            let tile = b.get_tile(x, y)
            if(tile.dots == 0) {
                row += " "
            } else {
                row += tile.color
            }
        }
        console.log(row)
    }
}


async function run_test_games(num_games) {
    console.log(EVAL_FUNCS)
    let evals = Object.keys(EVAL_FUNCS)
    
    let PLAYERS = 2;
    let results = []
    for(const eval1 of evals) {
        for(const eval2 of evals) {
            if(eval1 == eval2) continue;
            let f1_wins = 0
            let f2_wins = 0
            for(let game = 0; game < num_games; game++) {
                // console.log("playing game", game, "eval1:", eval1, "eval2:", eval2)
                let board = new Board()
                let curr_player = 0
                

                let curr_evals = [eval1, eval2]
                let turn_num = 0
                while(true) {
                    //prompt ai
                    let msg = {
                        board: board,
                        eval_function: curr_evals[curr_player],
                        alive_players: [true, true], // TODO fix this
                        player_idx: curr_player,
                        ptc: [0, 1],
                        is_first_turn: turn_num < 2
                    }
                    console.log("turn", turn_num)
                    //make move
                    let move = await get_move(msg)
                    if(move == null) {
                        break
                    }
                    let { x, y } = move
                    board.play_move(x, y, curr_player, turn_num < 2)
                    
                    curr_player = (curr_player + 1) % PLAYERS
                    turn_num++

                   
                }
                //figure out who won.
                //first player who has a chip is the winner.
                //print board
                
                let winner = 0
                for(let x = 0; x < board.BOARD_SIZE; x++) {
                    for(let y = 0; y < board.BOARD_SIZE; y++) {
                        if(!board.is_empty(x, y)) {
                            winner = board.get_color(x, y)
                            break
                        }
                    }
                }
                if(winner == 1) {
                    f1_wins++
                } else {
                    f2_wins++
                }
                print_board(board)
            }

            results.push({
                eval1: eval1,
                eval2: eval2,
                f1_wins: f1_wins,
                f2_wins: f2_wins
            })

        }
    }
    return results
}

// run_test_games(10).then(console.log)