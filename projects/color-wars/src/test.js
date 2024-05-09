function run_test_games(num_games) {
    let evals = EVAL_FUNCS.keys()
    let worker = new Worker('src/aiWorker.js');
    let PLAYERS = 2;
    let results = []
    for(const f1 of evals) {
        for(const f2 of evals) {
            if(f1 == f2) continue;
            
            for(let game = 0; game < num_games; game++) {
                let board = new Board()
                let curr_player = 0
                let f1_wins = 0
                let f2_wins = 0

                let curr_evals = [f1, f2]
                let turn_num = 0
                while(true) {
                    //prompt ai
                    this.worker.postMessage({
                        board: board,
                        eval_function: curr_evals[curr_player],
                        alive_players: [true, true], // TODO fix this
                        player_idx: curr_player,
                        ptc: [0, 1],
                        is_first_turn: turn_num < 2
                    });

                    //make move
                    if(move == null) {
                        break
                    }
                    curr_player = (curr_player + 1) % PLAYERS
                    turn_num++
                }
                //figure out who won.
                //first player who has a chip is the winner.

            }
        }
    }
    
}