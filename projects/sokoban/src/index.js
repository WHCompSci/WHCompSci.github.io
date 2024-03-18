const canvas = document.getElementById("canvas")
const ctx = canvas.getContext("2d")
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
let currBoard,
    boxes,
    currRow = 0,
    currCol = 0,
    currLevel = 0
const levels = [
    ["____###", "____#S#", "____#.#", "#####.#", "#L.B..#", "#######"],
    ["_#####", "##L..#", "#S.B.#", "##...#", "#..B.#", "##L###", "_###__"],
    ["######", "#....#", "#.B.L#", "##.B.#", "_#SL##", "_####_"],
    
    ["__####", 
     "###..#", 
     "#.BL.#", 
     "#..B.#", 
     "#LS.##", 
     "#####_"],

    
    ["_#####_", "##...##", "#.LLB.#", "#.B#..#", "#..#..#", "#SLB.##", "######_"],
]

function loadBoard(index) {
    let startRow, startCol
    const m = levels[index].map((row) => row.split(""))

    const boxes = []
    for (let row = 0; row < m.length; row++) {
        for (let col = 0; col < m[0].length; col++) {
            if (m[row][col] == "B") {
                boxes.push([row, col, false])
                m[row][col] = "."
            } else if (m[row][col] == "S") {
                startRow = row
                startCol = col
                m[row][col] = "."
            }
        }
    }
    // console.log([m, boxes, startRow, startCol])
    return [m, boxes, startRow, startCol]
}

function drawBoard(board, boxes, playerRow, playerCol) {
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    // console.log("wefh")
    const tileSize = 30
    const offsetX = canvas.width * .5 - (tileSize * board.length)
    const offsetY = canvas.height * .5 - (tileSize * board.length)
    // const offsetX = 200
    // const offsetY = 75
    for (let row = 0; row < board.length; row++) {
        for (let col = 0; col < board[0].length; col++) {
            if (board[row][col] == "_") {
                continue
            } else if (board[row][col] == "#") {
                ctx.fillStyle = "blue"
            } else if (board[row][col] == ".") {
                ctx.fillStyle = "beige"
            } else if (board[row][col] == "L") {
                ctx.fillStyle = "green"
            }

            ctx.fillRect(
                col * tileSize + offsetX,
                row * tileSize + offsetY,
                tileSize,
                tileSize
            )
        }
    }
    ctx.fillStyle = "red"
    ctx.fillRect(
        playerCol * tileSize + offsetX + tileSize * 0.1,
        playerRow * tileSize + offsetY + tileSize * 0.1,
        tileSize * 0.8,
        tileSize * 0.8
    )

    for (const [row, col, on_storage] of boxes) {
        ctx.fillStyle = on_storage ? "lime" : "brown"
        // console.log("drawing box")
        ctx.fillRect(
            col * tileSize + offsetX + tileSize * 0.2,
            row * tileSize + offsetY + tileSize * 0.2,
            tileSize * 0.6,
            tileSize * 0.6
        )
    }
}
document.onkeydown = (ev) => {
    // console.log(ev.key)
    if (ev.key == " ") {
        const b = loadBoard(currLevel)
        currBoard = b[0]
        boxes = b[1]
        currRow = b[2]
        currCol = b[3]
        drawBoard(currBoard, boxes, currRow, currCol)
        return
    }
    if (ev.key != "w" && ev.key != "a" && ev.key != "s" && ev.key != "d") {
        return
    }
    const dirs = {
        w: [-1, 0],
        a: [0, -1],
        s: [1, 0],
        d: [0, 1],
    }
    const d = dirs[ev.key]
    const nextRow = currRow + d[0]
    const nextCol = currCol + d[1]
    if (
        nextRow < 0 ||
        nextRow >= currBoard.length ||
        nextCol < 0 ||
        nextCol >= currBoard[0].length
    ) {
        return
    }

    if (currBoard[nextRow][nextCol] == "#") {
        //can't push wall
        return
    }
    for (let i = 0; i < boxes.length; i++) {
        const [brow, bcol, _] = boxes[i]
        if (nextRow == brow && nextCol == bcol) {
            const newBoxRow = nextRow + d[0]
            const newBoxCol = nextCol + d[1]
            if (
                newBoxRow < 0 ||
                newBoxRow >= currBoard.length ||
                newBoxCol < 0 ||
                newBoxCol >= currBoard[0].length
            ) {
                return
            }
            if (
                (currBoard[newBoxRow][newBoxCol] == "." ||
                    currBoard[newBoxRow][newBoxCol] == "L") &&
                boxes.filter((x) => x[0] == newBoxRow && x[1] == newBoxCol)
                    .length == 0
            ) {
                currRow = nextRow
                currCol = nextCol
                boxes[i] = [
                    newBoxRow,
                    newBoxCol,
                    currBoard[newBoxRow][newBoxCol] == "L",
                ]

                if (
                    checkForWin(currBoard, boxes) &&
                    currLevel < levels.length - 1
                ) {
                    currLevel++
                    ;[currBoard, boxes, currRow, currCol] = loadBoard(currLevel)
                }
                drawBoard(currBoard, boxes, currRow, currCol)
                return
            } else {
                return
            }
        }
    }
    if (
        currBoard[nextRow][nextCol] == "." ||
        currBoard[nextRow][nextCol] == "L"
    ) {
        currRow = nextRow
        currCol = nextCol
        drawBoard(currBoard, boxes, currRow, currCol)
        return
    }
}

const start = () => {
    canvas.width = window.innerWidth
    canvas.height = window.innerHeight
    ;[currBoard, boxes, currRow, currCol] = loadBoard(0)
    // console.log(currBoard)
    // console.log("sr="+startRow+" sc="+startCol)
    console.log(boxes)
    drawBoard(currBoard, boxes, currRow, currCol)
}
start()

function checkForWin(board, boxes) {
    for (const box of boxes) {
        if (!box[2]) return false
    }
    return true
}

// function generatePuzzle(height = 1, width = 2, numBoxes = 2) {
//     //https://ianparberry.com/techreports/LARC-2011-01.pdf
//     //build an empty room
//     const templetes = [
//         ["_____", "_..._", "_..._", "_..._", "_____"],

//         ["_____", "_#.._", "_..._", "_..._", "_____"],
//         ["___..", "_##..", "_..._", "_..._", "_____"],
//         ["_____", "_###_", "_..._", "_..._", "_____"],
//         ["_____", "_###_", "_#.._", "_#.._", "_____"],
//         ["__.__", "_#.._", "...._", "_..#_", "_____"],
//         ["_____", "_#.._", "...._", "_#.._", "_____"],
//         ["__.__", "_#.._", "...._", "_#.#_", "__.__"],
//         ["__.__", "_#.#_", ".....", "_#.#_", "__.__"],
//         ["__.__", "_#.#_", "_#,..", "_###_", "_____"],
//         ["_____", "_###_", ".....", "_###_", "_____"],
//         ["_____", "_....", "_.#..", "_..._", "_____"],
//         ["_____", "_###_", "_###_", "_###_", "_____"],
//         ["_____", "_###_", "_#.._", "...._", "..___"],
//         ["_._._", "_..._", "_#.#_", "_..._", "_._._"],
//         ["_____", "_###_", "_###_", "_..._", "_..._"],
//         ["_____", "_###_", "..#..", "_..._", "_..__"],
//     ]
//     // _ is a blank
//     // # is a wall
//     // . is a passage
//     // , is a passage (that only allows player to get through without block) Only exists on one templete. Checked as if a wall
//     for (let t of templetes) {
//         console.log(allSymetries(t))
//     }
//     // const board = [];
//     // while (true) {
//     //   // choose N random templetes, where N := H x W
//     //   const temps = [];
//     //   for (let n = 0; n < height * width; n++) {
//     //     temps.push(Math.floor(Math.random() * templetes.length));
//     //   }
//     // }
// }
// const allSymetries = (b) => {
//     const ident = b
//     const rot90 = r90(ident)
//     const rot180 = r90(rot90)
//     const rot270 = r90(rot180)
//     const ref_vt = re_vert(ident)
//     const ref_hz = re_horz(ident)
//     const ref_diag1 = re_vert(rot90)
//     const ref_diag2 = re_horz(rot90)

//     const r90 = (matrix) => {
//         const rows = matrix.length
//         const cols = matrix[0].length
//         const result = []

//         for (let j = 0; j < cols; j++) {
//             const newRow = []
//             for (let i = rows - 1; i >= 0; i--) {
//                 newRow.push(matrix[i][j])
//             }
//             result.push(newRow)
//         }

//         return result
//     }
//     const re_vert = (matrix) => {
//         const result = []

//         for (let i = matrix.length - 1; i >= 0; i--) {
//             result.push(matrix[i])
//         }

//         return result
//     }
//     const re_horz = (matrix) => {
//         const result = []

//         for (let i = 0; i < matrix.length; i++) {
//             const newRow = []
//             for (let j = matrix[i].length - 1; j >= 0; j--) {
//                 newRow.push(matrix[i][j])
//             }
//             result.push(newRow)
//         }

//         return result
//     }
//     const matrixEquals = (matrix1, matrix2) => {
//         if (
//             matrix1.length !== matrix2.length ||
//             matrix1[0].length !== matrix2[0].length
//         ) {
//             return false // Matrices have different dimensions
//         }

//         for (let i = 0; i < matrix1.length; i++) {
//             for (let j = 0; j < matrix1[i].length; j++) {
//                 if (matrix1[i][j] !== matrix2[i][j]) {
//                     return false // Elements at corresponding positions are not equal
//                 }
//             }
//         }

//         return true // Matrices are equal
//     }
//     const symmetries = [
//         ident,
//         rot90,
//         rot180,
//         rot270,
//         ref_vt,
//         ref_hz,
//         ref_diag1,
//         ref_diag2,
//     ]

//     // Remove duplicates
//     const uniqueSymmetries = symmetries.filter((matrix, index) => {
//         // Check if the current matrix is equal to any matrix that comes after it
//         for (let i = index + 1; i < symmetries.length; i++) {
//             if (matrixEquals(matrix, symmetries[i])) {
//                 return false // If a duplicate is found, filter it out
//             }
//         }
//         return true // Otherwise, keep the matrix
//     })

//     return uniqueSymmetries
// }
// generatePuzzle()
// console.log("finished generating")
