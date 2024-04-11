let bitBoard = new Uint8Array(16)
console.log(bitBoard)
function setChip(board, x, y, chip) // 0 is black, 1 is white
{
    board[y >> 3 + x]
}