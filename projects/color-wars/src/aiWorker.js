importScripts('./board.js')

addEventListener('message', async event => {
    console.log('worker received message, ', event.data)
    const { board, color, is_first_turn } = event.data
    const move = ai(board, color, is_first_turn)
    await timer(500)
    postMessage(move)
})
const timer = ms => new Promise(res => setTimeout(res, ms))
function ai(board, color, is_first_turn) {
    color = color.value
    const size = ~~((board.board.length*.25)**0.5)
    console.log('size: ', size)
    // This is where you would implement the AI logic.
    // For now, we'll just return a random move.
    const moves = []
    for (let x = 0; x < size; x++) {
        for (let y = 0; y < size; y++) {
            if(is_first_turn && (x*y) % 2 === 0) {
                //makes sure that the first move one of the center squares
                continue
            }
            if (isValidMove(board, size, x, y, color, is_first_turn)) {
                moves.push({ x, y })
            }
        }
    }
    console.log('moves: ', moves)
    return moves[Math.floor(Math.random() * moves.length)]
}





function isValidMove(board, size, x, y, color, is_first_turn) {
    let index = (y * size + x) * 4
    
    const col = board.board[index] & 0b11
    const dots = board.board[index] >> 2
    const is_empty = dots === 0
    return (is_first_turn && is_empty) || (color === col && dots > 0)

}
    

