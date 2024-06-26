function neighbor_evaluation(board, my_col) {
    // This is a very simple evaluation function.
    let score = 0;
    let n_score = 0;
    let op_score = 0;
    const size = board.BOARD_SIZE;
    for (let x = 0; x < size; x++) {
        for (let y = 0; y < size; y++) {
            let { color, dots } = board.get_tile(x, y);
            if (dots == 0) {
                continue;
            }
            if (color == my_col) {
                score += 1;
            } else {
                op_score += 1;
                continue
            }
            // strategy: minimize the number of our peices that are outnumbered by one of the other player's pieces
            let is_outnumbering_peice = false;
            const neighbors = board.get_neighbors(x, y);
            for (let neighbor of neighbors) {
                const { color: n_color, dots: n_dots } = neighbor;
                if (n_dots == 0) {
                    continue;
                }
                if (n_color != my_col && n_dots >= dots) {
                    is_outnumbering_peice = true;
                    break;
                }
            }
            if (is_outnumbering_peice) {
                n_score += 1;
            }

        }
    }

    // console.log("score", score);

    if(op_score == 0){
        return Infinity;
    }
    if(score == 0){
        return -Infinity;
    }

    return score - n_score;
}
function count_evaluation(board, my_color) {
    const size = board.BOARD_SIZE;
    let score = 0;
    for (let x = 0; x < size; x++) {
        for (let y = 0; y < size; y++) {
            const { color, dots } = board.get_tile(x, y);
            if (dots == 0) {
                continue;
            }
            score += color == my_color ? 1 : -1;
        }
    }
    return score
}





const EVAL_FUNCS = {
    "neighbor": neighbor_evaluation,
    "count": count_evaluation,

};

