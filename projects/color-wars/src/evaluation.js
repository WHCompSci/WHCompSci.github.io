function neighbor_evaluation(board, color) {
    // This is a very simple evaluation function.
    let score = 0;
    let others_score = 0;
    const size = board.BOARD_SIZE;
    for (let x = 0; x < size; x++) {
        for (let y = 0; y < size; y++) {
            if (board.check_color(x, y, color)) {
                const { my_color, my_dots } = board.get_tile(x, y);
                //its our color
                let found_gte_neighbor = false;
                for (const { nx, ny } of board.get_neighbors()) {
                    const { n_color, n_dots } = board.get_tile(nx, ny);
                    if (n_color === my_color) continue;
                    if (n_dots >= my_dots) {
                        found_gte_neighbor = true;
                        break;
                    }
                }
                score += found_gte_neighbor ? -1 : 1;
            }
            // } else if (!board.is_empty(x, y)) {
            //     others_score++
            // }
        }
    }
    return score;
}
function count_evaluation(board, color) {
    const size = board.BOARD_SIZE;
    let score = 0;
    for (let x = 0; x < size; x++) {
        for (let y = 0; y < size; y++) {
            const { col, dots } = board.get_tile(x, y);
            if (dots == 0) {
                continue;
            }
            if (col == color) {
                score++;
            }
            else {
                score--;
            }
        }
    }
    return score;
}





const EVAL_FUNCS = {
    "neighbor": neighbor_evaluation,
    "count": count_evaluation,

};