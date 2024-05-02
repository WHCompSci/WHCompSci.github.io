import { Board, score_board, any_legal_moves, log_legal_moves, is_move_legal  } from './ai.js'

const board = new Board();
const ai_worker = new Worker("./ai.js", { type: "module" })
let is_whites_turn = false;
let move_number = 0;
let last_move = null; // location of last move for drawing red dot on the screen
board.set_cell(3, 3, true);
board.set_cell(4, 4, true);
board.set_cell(3, 4, false);
board.set_cell(4, 3, false);
let legal_moves = board.find_legal_moves(is_whites_turn);
board.log_board();
log_legal_moves(legal_moves);


const coordinate_offset = 50;
const canvas = document.getElementById('board');
const status_indicator = document.getElementById('status');
const new_game_button = document.getElementById('newGame');
const undo_button = document.getElementById('undo');
const redo_button = document.getElementById('redo');

const ctx = canvas.getContext('2d');
const cell_size = Math.floor(
    Math.min(window.innerWidth, window.innerHeight) / 12
);

canvas.width = 8 * cell_size + coordinate_offset;
canvas.height = 8 * cell_size + coordinate_offset;

canvas.style.border = '0px solid #222222';
function draw_board(b, draw_legal_moves = true) {
    //draw green background #009067
    ctx.fillStyle = '#222222';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.fillStyle = '#009067';
    ctx.fillRect(coordinate_offset, coordinate_offset, canvas.width, canvas.height);
    //draw grid lines
    ctx.strokeStyle = '#222222';
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let i = 1; i <= 8; i++) {
        ctx.moveTo(i * cell_size + coordinate_offset, coordinate_offset);
        ctx.lineTo(i * cell_size + coordinate_offset, canvas.height);
        ctx.moveTo(coordinate_offset, i * cell_size + coordinate_offset);
        ctx.lineTo(canvas.width, i * cell_size + coordinate_offset);
    }
    ctx.stroke();

    //draw coordinates. A-H on top and 1-8 on the left
    //indented font style
    ctx.fillStyle = '#424544';

    ctx.font = 'bold 25px Verdana';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    for (let i = 0; i < 8; i++) {
        ctx.fillText(
            String.fromCharCode(65 + i),
            (i + 0.5) * cell_size + coordinate_offset,
            0.3 * coordinate_offset
        );
        ctx.fillText(
            i + 1,
            0.3 * coordinate_offset,
            (i + 0.5) * cell_size + coordinate_offset
        );
    }

    //draw small black circles at 4 line intersections lines (1,1), (1,6), (6,1), (6,6)
    ctx.fillStyle = '#222222';
    ctx.beginPath();
    ctx.arc(
        2 * cell_size + coordinate_offset,
        2 * cell_size + coordinate_offset,
        5,
        0,
        2 * Math.PI
    );
    ctx.fill();
    ctx.beginPath();
    ctx.arc(
        2 * cell_size + coordinate_offset,
        6 * cell_size + coordinate_offset,
        5,
        0,
        2 * Math.PI
    );
    ctx.fill();
    ctx.beginPath();
    ctx.arc(
        6 * cell_size + coordinate_offset,
        2 * cell_size + coordinate_offset,
        5,
        0,
        2 * Math.PI
    );
    ctx.fill();
    ctx.beginPath();
    ctx.arc(
        6 * cell_size + coordinate_offset,
        6 * cell_size + coordinate_offset,
        5,
        0,
        2 * Math.PI
    );
    ctx.fill();

    //draw second circle behind the chips to make them look like they are on a board and have thickness

    const drawCircle = (x, y, color) => {
        ctx.fillStyle = color;
        ctx.beginPath();
        ctx.arc(x, y, cell_size * 0.4, 0, 2 * Math.PI);
        ctx.fill();
    };
    //draw chips
    for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
            const cell = b.get_cell(x, y);
            if (cell == b.BLACK_CHIP) {
                ctx.fillStyle = '#424544';
                drawCircle(
                    (x + 0.5) * cell_size + coordinate_offset + 1,
                    (y + 0.5) * cell_size + coordinate_offset + 1,
                    '#292b2b'
                );
                drawCircle(
                    (x + 0.5) * cell_size + coordinate_offset - 1,
                    (y + 0.5) * cell_size + coordinate_offset - 1,
                    '#424544'
                );
            } else if (cell == b.WHITE_CHIP) {
                ctx.fillStyle = '#f4fdfa';
                drawCircle(
                    (x + 0.5) * cell_size + coordinate_offset + 1,
                    (y + 0.5) * cell_size + coordinate_offset + 1,
                    '#b0a7a7'
                );
                drawCircle(
                    (x + 0.5) * cell_size + coordinate_offset - 1,
                    (y + 0.5) * cell_size + coordinate_offset - 1,
                    '#f3fcf9'
                );
            }
        }
    }
    //draw last move location (small red dot)
    if (last_move) {
        const [x, y] = last_move;
        ctx.fillStyle = '#ff0000';
        ctx.beginPath();
        ctx.arc(
            (x + 0.5) * cell_size + coordinate_offset,
            (y + 0.5) * cell_size + coordinate_offset,
            4,
            0,
            2 * Math.PI
        );
        ctx.fill();
    }
    if (!draw_legal_moves) return;
    //draw legal moves (chip outlines)
    ctx.strokeStyle = '#006B49';
    ctx.lineWidth = 2;

    for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
            if (is_move_legal(x, y, legal_moves)) {
                ctx.beginPath();
                ctx.arc(
                    (x + 0.5) * cell_size + coordinate_offset,
                    (y + 0.5) * cell_size + coordinate_offset,
                    cell_size * 0.4,
                    0,
                    2 * Math.PI
                );
                ctx.stroke();
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
        (is_whites_turn ? "White's turn ⚪" : "Black's turn ⚫");
}

draw_board(board);
update_status(is_whites_turn, move_number);
let is_processing = false;
/**
 * Main game logic.
 * 
 * @param {Event} event 
 * @returns 
 */
async function handleClick(event) {

    if (is_processing) return;
    const x = Math.floor((event.offsetX - coordinate_offset) / cell_size);
    const y = Math.floor((event.offsetY - coordinate_offset) / cell_size);

    //LOGIC: When the player clicks, check if the move was legal. If it wasn't, return.
    //Check if the ai has legal moves. 
    //If it doesn't, return
    //If it does, prompt it to make a move.
    //while the player has no legal moves, 
    //prompt the ai to make a move.
    //if the ai has no legal moves,
    //then end the game.

    let player_move_is_legal = is_move_legal(x, y, legal_moves);
    let player_has_legal_moves = any_legal_moves(legal_moves);
    if (!player_move_is_legal) return;
    //play move
    board.play_move(x, y, is_whites_turn);
    last_move = [x, y];
    move_number++;
    is_whites_turn = !is_whites_turn;
    draw_board(board, false);
    console.log("drawing board")
    is_processing = true;

    ai_worker.postMessage({
        current_board: board,
        is_whites_turn: is_whites_turn,
    });
    // 3 scenarios are either one is player the turn, switching turns, or the game is going to end
    ai_worker.onmessage = (event) => {
        let data = event.data;
        console.log("received move, status:", data)
        switch (data.status_message) {
            case "playing move":
                legal_moves = board.find_legal_moves(is_whites_turn)
                board.play_move(data.ai_move[0], data.ai_move[1], is_whites_turn)
                console.log("played move")
                draw_board(board, false);
                move_number++;

                break;
                //when we are switching turns we have to always check if either player still has legal moves
                //this is to know to end the game before all the spaces on the board are filled 
            case "passing turn":
                console.log("passed turn")
                let ai_legal_moves = board.find_legal_moves(is_whites_turn);
                is_whites_turn = !is_whites_turn;
                legal_moves = board.find_legal_moves(is_whites_turn);
                draw_board(board, true)
                is_processing = false;
                //if neither the player or Ai have any legal moves then end the game 
                if(!any_legal_moves(legal_moves) && !any_legal_moves(ai_legal_moves)) {
                    handle_game_end(board)
                }
                return;

        }
    }
    
    
    
    update_status(is_whites_turn, move_number);
    return;
}

canvas.addEventListener('click', handleClick);

function handle_game_end(board) {
    draw_board(board);
    board.log_board();
    //count chips, declare winner
    let white_count = 0;
    let black_count = 0;
    for (let y = 0; y < 8; y++) {
        for (let x = 0; x < 8; x++) {
            const cell = board.get_cell(x, y);
            if (cell == board.BLACK_CHIP) black_count++;
            if (cell == board.WHITE_CHIP) white_count++;
        }
    }
    if (white_count > black_count) {
        status_indicator.textContent =
            'White wins! 🎉 (' + white_count + '-' + black_count + ')';
    } else if (black_count > white_count) {
        status_indicator.textContent =
            'Black wins! 🎉 (' + black_count + '-' + white_count + ')';
    } else {
        status_indicator.textContent = 'Draw!';
    }
}

new_game_button.addEventListener('click', () => {
    board.data.fill(0);
    board.set_cell(3, 3, true);
    board.set_cell(4, 4, true);
    board.set_cell(3, 4, false);
    board.set_cell(4, 3, false);
    is_whites_turn = false;
    move_number = 0;
    last_move = null;
    legal_moves = board.find_legal_moves(is_whites_turn);
    draw_board(board);
    update_status(is_whites_turn, move_number);
});

undo_button.addEventListener('click', () => {
    //TODO
});
redo_button.addEventListener('click', () => {
    //TODO
});


