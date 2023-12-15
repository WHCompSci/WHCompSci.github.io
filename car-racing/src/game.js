// Description: This file contains the code for the game itself. It is responsible for drawing the grid, and handling user input.
// Author: Tanner Kalisher

//Fast 2D array
class Array2D {
    constructor(width, height, defaultValue) {
        this.width = width
        this.height = height
        this.array = new Uint8Array(width * height)
        if (defaultValue) {
            this.array.fill(defaultValue)
        }
    }
    get(x, y) {
        return this.array[y * this.width + x]
    }
    set(x, y, value) {
        this.array[y * this.width + x] = value
    }
}

const MouseState = Object.freeze({
    NOT_PRESSED: 0,
    WALL: 1,
    EMPTY: 2,
    START: 3,
})

const canvas = document.getElementById("canvas")
canvas.width = window.innerWidth
canvas.height = window.innerHeight
const context = canvas.getContext("2d")
let blockType = "wall"
const MAX_ACCEL = 1 //the maximum acceleration in cells per turn per turn
const cellSize = 16 // Size of each cell in pixels
const carSize = cellSize / 2 // Size of each car in pixels
const gridSize = Math.floor(canvas.width / cellSize) // Number of cells in each row and column
const grid = new Array2D(gridSize, gridSize, MouseState.EMPTY)
const penSize = 3

let mouseState = MouseState.NOT_PRESSED
document.addEventListener("contextmenu", (event) => event.preventDefault())
canvas.addEventListener("mousedown", (event) => {
    const { offsetX, offsetY } = event
    // const gridX = Math.floor(offsetX / cellSize)
    // const gridY = Math.floor(offsetY / cellSize)
    // isMousePressed = grid[gridY][gridX] ? 2 : 1

    //if the right mouse button is pressed, set isMousePressed to 1, otherwise set it to 2
    //if the blocktype is a start line, then set isMousePressed to 3

    if (event.button == 0) {
        mouseState = blockType == "start" ? MouseState.START : MouseState.WALL
    } else {
        mouseState = MouseState.EMPTY
    }
    penDown(event)
})
//enum for mouse state
//0 = not pressed, 1 = wall, 2 = empty, 3 = start

canvas.addEventListener("mouseup", () => {
    mouseState = MouseState.NOT_PRESSED
})

canvas.addEventListener("mousemove", (event) => {
    penDown(event)
})

function penDown(event) {
    if (!mouseState) return

    const { offsetX, offsetY } = event
    const gridX = Math.floor(offsetX / cellSize)
    const gridY = Math.floor(offsetY / cellSize)

    const pS = mouseState === MouseState.START ? 0 : penSize
    const Ymin = Math.max(gridY - pS, 0)
    const Ymax = Math.min(gridY + pS, gridSize)
    const Xmin = Math.max(gridX - pS, 0)
    const Xmax = Math.min(gridX + pS, gridSize)
    for (let y = Ymin; y <= Ymax; y++) {
        for (let x = Xmin; x <= Xmax; x++) {
            grid.set(x, y, mouseState)
        }
    }
    //we only have to redraw the parts of the grid that we changed
    drawGrid(Xmin, Ymin, Xmax, Ymax)
    car.draw()
}

function drawGrid(
    startX = 0,
    startY = 0,
    endX = gridSize - 1,
    endY = gridSize - 1
) {
    for (let y = startY; y <= endY; y++) {
        for (let x = startX; x <= endX; x++) {
            const currentCell = grid.get(x, y)
            const color =
                currentCell === MouseState.WALL
                    ? "grey"
                    : currentCell == MouseState.START
                    ? "green"
                    : "white"
            context.fillStyle = color
            context.fillRect(x * cellSize, y * cellSize, cellSize, cellSize)
            if (currentCell === MouseState.EMPTY) {
                context.fillStyle = "black"
                context.fillRect(x * cellSize, y * cellSize, 1, 1)
            }
        }
    }
}

//test grid creation function
console.log(grid.array)

drawGrid() // Initial drawing of the grid

//check what type of block is selected in the dropdown menu
const blockTypeSelector = document.getElementById("blockType")
blockTypeSelector.addEventListener("change", (event) => {
    blockType = event.target.value
})

//if the user presses 'g'  then print the grid to the console
document.addEventListener("keydown", (event) => {
    if (event.key == "g") {
        console.log(grid.join(", "))
    }
})

class Car {
    constructor(x, y) {
        const pos = {
            x: x * cellSize - cellSize / 4,
            y: y * cellSize - cellSize / 4,
        }
        this.pos = pos
        this.startPos = pos
        this.velocity = { x: 0, y: 0 }
        this.acceleration = { x: 0, y: 0 }
        this.width = carSize
        this.height = carSize
        this.visitedPositions = []
    }
    draw() {
        if (this.visitedPositions.length != 0) {
            //redraw the grid at the car's previous position
            const lastPos =
                this.visitedPositions[this.visitedPositions.length - 1]
            const lastCell = {
                x: Math.floor(lastPos.x / cellSize),
                y: Math.floor(lastPos.y / cellSize),
            }
            const lastCellXmin = Math.max(lastCell.x - 2, 0)
            const lastCellXmax = Math.min(lastCell.x + 2, gridSize)
            const lastCellYmin = Math.max(lastCell.y - 2, 0)
            const lastCellYmax = Math.min(lastCell.y + 2, gridSize)

            drawGrid(lastCellXmin, lastCellYmin, lastCellXmax, lastCellYmax)
            // context.fillStyle = "red"
            // context.fillRect(
            //     lastCellXmin * cellSize,
            //     lastCellYmin * cellSize,
            //     (lastCellXmax - lastCellXmin) * cellSize,
            //     (lastCellYmax - lastCellYmin) * cellSize
            // )
        }
        context.fillStyle = "blue"
        context.fillRect(this.pos.x, this.pos.y, this.width, this.height)
    }
    updatePosition(acceleration) {
        //if the new acceleration is greater than {1, 1} or less than {-1, -1}, throw an error
        if (
            acceleration.x > 1 ||
            acceleration.x < -1 ||
            acceleration.y > 1 ||
            acceleration.y < -1
        ) {
            throw "Invalid acceleration"
        }
        this.visitedPositions.push({ x: this.pos.x, y: this.pos.y })
        this.velocity.x += acceleration.x * cellSize
        this.velocity.y += acceleration.y * cellSize
        this.pos.x += this.velocity.x
        this.pos.y += this.velocity.y
    }
}
//create a car at one of the start positions
const car = new Car(5, 5)
car.draw()
// if the user clicks w the car should accelerate up
document.addEventListener("keydown", (event) => {
    if (event.key == "w") {
        car.updatePosition({ x: 0, y: -1 })
        car.draw()
    }
    if (event.key == "a") {
        car.updatePosition({ x: -1, y: 0 })
        car.draw()
    }
    if (event.key == "s") {
        car.updatePosition({ x: 0, y: 1 })
        car.draw()
    }
    if (event.key == "d") {
        car.updatePosition({ x: 1, y: 0 })
        car.draw()
    }
    if (event.key == "r") {
        car.pos = { x: car.startPos.x, y: car.startPos.y }
        car.velocity = { x: 0, y: 0 }
        car.acceleration = { x: 0, y: 0 }
        car.visitedPositions = [{ x: car.startPos.x, y: car.startPos.y }]
        car.draw()
    }
    // if (event.key == "e") {
    //     const lastPos = car.visitedPositions[car.visitedPositions.length - 1]
    //     const lastCell = {
    //         x: Math.floor(lastPos.x / cellSize),
    //         y: Math.floor(lastPos.y / cellSize),
    //     }
    //     console.log(lastCell)
    //     console.log(grid[lastCell.y][lastCell.x])
    //     if (grid[lastCell.y][lastCell.x] == 2) {
    //         grid[lastCell.y][lastCell.x] = 3
    //         car.startPos = {
    //             x: lastCell.x * cellSize,
    //             y: lastCell.y * cellSize,
    //         }
    //         car.pos = { x: lastCell.x * cellSize, y: lastCell.y * cellSize }
    //         car.velocity = { x: 0, y: 0 }
    //         car.acceleration = { x: 0, y: 0 }
    //         car.visitedPositions = [
    //             { x: lastCell.x * cellSize, y: lastCell.y * cellSize },
    //         ]
    //         drawGrid(lastCell.x, lastCell.y, lastCell.x + 1, lastCell.y + 1)
    //         car.draw()
    //     }
    // }
})

/**
 * @param {Object} currCell the car's current position in cells
 * @param {Object} vel the car's current velocity in cells per turn
 * @returns {Array} an array of possible next cells
 * @description - gets the possible next cells based on the car's current position and velocity, given that the car can accelerate anywhere from -MAX_ACCEL to MAX_ACCEL cells in both the x and y directions and cannot move through walls
 * The car's acceleration can be anywhere from -MAX_ACCEL to MAX_ACCEL cells in both the x and y directions
 **/
function getPossibleNextStates(currState) {
    const possibleNextCells = []
    for (let accelY = -MAX_ACCEL; accelY <= MAX_ACCEL; accelY++) {
        for (let accelX = -MAX_ACCEL; accelX <= MAX_ACCEL; accelX++) {
            if(currState.vx + accelX > 10 || currState.vy + accelY > 10) continue;
            const nextState = {
                x: (nextX = currState.x + currState.vx + accelX),
                y: (nextY = currState.y + currState.vy + accelY),
                vx: currState.vx + accelX,
                vy: currState.vy + accelY,
            }
            if (
                nextState.x < 0 ||
                nextState.x >= gridSize ||
                nextState.y < 0 ||
                nextState.y >= gridSize
            ) {
                continue
            }
            //project a ray from the car's current position to the potential next position to make sure there are no walls in the way
            // const deltaX = nextState.x - currState.x
            // let hitWall = false
            // if (deltaX == 0) {
            //     //if deltaX is 0, then the slope is undefined, so we have to handle this case separately
            //     for (let y = currState.y + 1; y <= nextState.y; y++) {
            //         if (grid.get(currState.x, y) == MouseState.WALL) {
            //             hitWall = true
            //             break
            //         }
            //     }
            //     if (!hitWall) {
            //         possibleNextCells.push(nextState)
            //     }
            //     continue
            // }

            // const deltaY = nextState.y - currState.y
            // const slope = deltaY / deltaX
            // const lineThicknessRadius = carSize / 2
            // const yIntercept =
            //     currState.y * cellSize - slope * currState.x * cellSize

            // for (let x = nextState.x; x > currState.x; x++) {
            //     const y = slope * x + yIntercept //y = mx + b
            //     const offset = {
            //         x:
            //             (lineThicknessRadius * Math.sqrt(slope * slope + 1)) /
            //             slope,
            //         y: lineThicknessRadius * Math.sqrt(slope * slope + 1),
            //     }

            //     const edge1 = { x: x + offset.x, y: y + offset.y }
            //     const edge2 = { x: x - offset.x, y: y - offset.y }
            //     const cell1 = {
            //         x: Math.floor(edge1.x / cellSize),
            //         y: Math.floor(edge1.y / cellSize),
            //     }
            //     const cell2 = {
            //         x: Math.floor(edge2.x / cellSize),
            //         y: Math.floor(edge2.y / cellSize),
            //     }

            //     if (
            //         grid.get(cell1.x, cell1.y) == MouseState.WALL ||
            //         grid.get(cell2.x, cell2.y) == MouseState.WALL
            //     ) {
            //         hitWall = true
            //         break
            //     }
            // }

            possibleNextCells.push(nextState)
        }
    }
    return possibleNextCells
}

//Make a graph of the grid where each node is a vector encoding a CAR's velocity and position [x, y, vx, vy] "state" and each edge represents a possible transition from one state to another. The weight of each edge is the Chebyshev distance between the two states, which means that diagonols are treated as 1 instead of sqrt(2) for simplicity)
function bfs(startCell) {
    const parents = new Map()
    const startState = { x: startCell.x, y: startCell.y, vx: 0, vy: 0 }
    const cantorStartState = cantor4(startState)
    parents.set(startState, null)
    const queue = [startState]
    console.log("I'm goona the")
    while (queue.length > 0) {
        console.log("This is the length of the Q: "+queue.length)
        // if(queue.length >  1000) return;
        let currState = queue.shift()
        //sort the possible next states by descending distance from the current state, filtering out any states that have already been visited
        let possibleNextStates = getPossibleNextStates(currState).filter((state) => grid.get(state.x, state.y) !== MouseState.WALL && !parents.has(cantor4(state)))
        for (let nextState of possibleNextStates) {
            parents.set(cantor4(nextState), cantor4(currState))
            if (grid.get(nextState.x, nextState.y) == MouseState.START) {
                console.log("completed circuit ")
                console.log(nextState)
                return getShortestPath(nextState)
            }
            queue.push(nextState)
        }
    }
    // find the shortest path from the start to the end
    function getShortestPath(endNode) {
        const path = [endNode]
        let currNode = cantor4(endNode)
        while (currNode != cantorStartState) {
            console.log(currNode)
            currNode = parents.get(currNode)
            
            path.unshift(inverseCantor4(currNode))
        }
        return path
    }
}

function cantor4(state) {
    return `${state.x} ${state.y} ${state.vx} ${state.vy}`
    // function cantor2(k1, k2) {
    //     return ((k1 + k2) * (k1 + k2 + 1)) / 2 + k2
    // }
    // return cantor2(cantor2(state.x, state.y), cantor2(state.vx, state.vy))
}

//chebyshev distance
function distance(state1, state2) {
    return Math.max(
        Math.abs(state1.x - state2.x),
        Math.abs(state1.y - state2.y),
        Math.abs(state1.vx - state2.vx),
        Math.abs(state1.vy - state2.vy)
    )
}
//when the user clicks "S" on the keyboard, run the bfs algorithm
document.addEventListener("keydown", (event) => {
    if (event.key == "s") {
        const z = bfs({ x: 5, y: 5, vx: 0, vy: 0})
        console.log(z)
        if(z === undefined) return;
        
        for (let state = 0; state < z.length - 1; state++) {
            //draw a line from the car's current position to the next position
            const currState = z[state]
            const nextState = z[state + 1]
            context.beginPath()
            context.moveTo(currState.x * cellSize, currState.y * cellSize)
            context.lineTo(nextState.x * cellSize, nextState.y * cellSize)
            context.strokeStyle = "red"
            context.lineWidth = 2
            context.stroke()
            context.fillRect(nextState.x * cellSize, nextState.y * cellSize, cellSize/2, cellSize/2)
            //draw a point at the next state

        }
        
    }
})

function inverseCantor4(z) {
    let x = z.split(" ")
    return {x: x[0], y: x[1], vx: x[2], vy: x[3]}
    // function inverseCantor2(z) {
    //     const t = Math.floor((-1 + Math.sqrt(1 + 8 * z)) / 2)
    //     const x = (t * (t + 3)) / 2 - z
    //     const y = z - (t * (t + 1)) / 2
    //     return [x, y]
    // }
    // const [x, y] = inverseCantor2(z)
    // const [a, b] = inverseCantor2(x)
    // const [c, d] = inverseCantor2(y)
    // return { x: a, y: b, vx: c, vy: d }
}

// function tuplehash(v) {
//     let x = 0x345678
//     let y
//     let len = v.length
//     let p = v
//     let mult = 0xf4243
//     while (--len >= 0) {
//         y = p++
//         x = (x ^ y) * mult
//         mult += 82520 + len + len
//     }
//     x += 97531
//     if (x === -1) x = -2
//     return x
// }
// console.log(
//     tuplehash(new Uint32Array([2567565, 665432, 15672,6,69]))

// )
