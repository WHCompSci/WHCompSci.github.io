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
// document.addEventListener("keydown", (event) => {
//     if (event.key == "w") {
//         car.updatePosition({ x: 0, y: -1 })
//         car.draw()
//     }
//     if (event.key == "a") {
//         car.updatePosition({ x: -1, y: 0 })
//         car.draw()
//     }
//     if (event.key == "s") {
//         car.updatePosition({ x: 0, y: 1 })
//         car.draw()
//     }
//     if (event.key == "d") {
//         car.updatePosition({ x: 1, y: 0 })
//         car.draw()
//     }
//     if (event.key == "r") {
//         car.pos = { x: car.startPos.x, y: car.startPos.y }
//         car.velocity = { x: 0, y: 0 }
//         car.acceleration = { x: 0, y: 0 }
//         car.visitedPositions = [{ x: car.startPos.x, y: car.startPos.y }]
//         car.draw()
//     }
// }

class PriorityQueue {
    constructor() {
        this.items = []
        this.size = 0
    }
    //add an element to the queue
    enqueue(element, priority) {
        let idx = this.size * 5
        this.items[idx] = element.x
        this.items[idx + 1] = element.y
        this.items[idx + 2] = element.vx
        this.items[idx + 3] = element.vy
        this.items[idx + 4] = priority
        this.size++
    }
    //check the highest priority element (Linear Search)
    //Lower number = higher priority, so 0 is the highest priority because we dont use negative distances :)
    peek() {
        let highestPriority = Number.MAX_SAFE_INTEGER
        let highestPriorityIndex = 0
        for (let i = 1; i < this.size; i++) {
            let currentPriority = this.items[i * 5 + 4]
            if (currentPriority < highestPriority) {
                highestPriority = currentPriority
                highestPriorityIndex = i
            }
        }
        return highestPriorityIndex
    }
    //remove the highest priority element from the queue and return it
    dequeue() {
        let highestPriorityIndex = this.peek()
        let x = this.items[highestPriorityIndex * 5]
        let y = this.items[highestPriorityIndex * 5 + 1]
        let vx = this.items[highestPriorityIndex * 5 + 2]
        let vy = this.items[highestPriorityIndex * 5 + 3]
        this.items.splice(highestPriorityIndex * 5, 5)
        this.size--
        return new State(x, y, vx, vy)
    }
}

class State {
    constructor(x, y, vx, vy) {
        this.x = x
        this.y = y
        this.vx = vx
        this.vy = vy
    }
}

async function bestFirstSearchWithVelocies(
    grid,
    start,
    gridWidth,
    gridHeight,
    diffucultyLevel = 0.2
) {
    //StateMap is a map of states to their parents. Retreval is based on value equality, not reference equality.
    class StateMap {
        constructor() {
            this.map = new Map()
        }
        get(state) {
            return this.map.get(
                state.x + "," + state.y + "," + state.vx + "," + state.vy
            )
        }
        set(state, parent) {
            this.map.set(
                state.x + "," + state.y + "," + state.vx + "," + state.vy,
                parent
            )
        }
        has(state) {
            return this.map.has(
                state.x + "," + state.y + "," + state.vx + "," + state.vy
            )
        }
    }

    const goalStates = getGoalStates(grid, gridWidth, gridHeight)
    const minDistancesToGoal = findMinDistances(
        grid,
        goalStates,
        gridWidth,
        gridHeight
    )
    const minDistancesFromStart = findMinDistances(
        grid,
        [start],
        gridWidth,
        gridHeight
    )
    if (diffucultyLevel != 0) {
        for (let i = 0; i < minDistancesToGoal.length; i++) {
            //the higher the number being divided by, the less greedy the algorithm will be, but the longer it will take to run. (Higher # = More optimal path)
            minDistancesToGoal[i] = Math.floor(
                minDistancesToGoal[i] /
                    (diffucultyLevel * Math.max(gridWidth, gridHeight))
            )
          
        }
    }
    const heuristic = ({ x, y, vx, vy }) =>
        minDistancesToGoal[(y + vy) * gridWidth + (x + vx)]
    //create a map of parents
    const parents = new StateMap()
    //create a priority queue
    const queue = new PriorityQueue()
    //add the start state to the queue
    queue.enqueue(start, heuristic(start))
    parents.set(start, null)
    //while the queue is not empty

    while (queue.size > 0) {
        //get the state with the highest priority
        let current = queue.dequeue()
        await drawCurrentState(current)
        //check if we reached the goal
        if (grid.get(current.x, current.y) === MouseState.START) {
            console.log("found goal")
            return getPath(parents, current)
        }
        //for each neighbor of the current state, compute the heuristic and add it to the queue
        for (const neighbor of getNeighbors(
            current,
            grid,
            gridWidth,
            gridHeight
        )) {
            if (!parents.has(neighbor)) {
                parents.set(neighbor, current)
                queue.enqueue(neighbor, heuristic(neighbor))
            }
        }
    }
    console.log("no path found")
    console.log(parents.map)
    return null
    function getGoalStates(grid, width, height) {
        const goalStates = []
        for (let x = 0; x < width; x++) {
            for (let y = 0; y < height; y++) {
                if (grid.get(x, y) == MouseState.START) {
                    goalStates.push({ x: x, y: y })
                }
            }
        }
        return goalStates
    }
    function getPath(parents, current) {
        let path = []
        while (current != null) {
            path.push(current)
            current = parents.get(current)
        }
        return path
    }
    function getNeighbors(state, grid, width, height) {
        const accels = [
            [-1, -1],
            [-1, 0],
            [-1, 1],
            [0, -1],
            [0, 0],
            [0, 1],
            [1, -1],
            [1, 0],
            [1, 1],
        ]
        const neighbors = []
        for (const [ax, ay] of accels) {
            const vx = state.vx + ax
            const vy = state.vy + ay
            const x = state.x + vx
            const y = state.y + vy
            //continue if the state is out of bounds or is a wall
            if (
                x < 0 ||
                x >= width ||
                y < 0 ||
                y >= height ||
                grid.get(x, y) == MouseState.WALL
            ) {
                continue
            }
            neighbors.push(new State(x, y, vx, vy))
        }
        return neighbors
    }
    /**
     * Calculates the minimum distances from the given grid to the goal states.
     * Each state's neighbors are the states that are 1 step away in the 4 directions. (Not using different velocities)
     * The purpose of this function is to be a heuristic for the best first search algorithm, which will use velocities, however that
     * function has a much larger time and space complexity because it has to search the same positions multiple times
     * for different velocities.
     * @param {Array<Array<number>>} grid - The grid representing the states.
     * @param {Array<{x: number, y: number}>} seeds - The goal states.
     * @returns {Uint16Array} - The array of minimum distances.
     */
    function findMinDistances(grid, seeds, width, height) {
        //total size of minDistances is height*width*16 bits or height*width*2 bytes
        //we assume that all states are unvisited and have an infinite distance to the goal (2^16-1) not really infinite but it is enough for our purposes
        //all unvisited states have a distance of 2^16-1 or 1111111111111111 in binary which is FFFF in hex or 65535 in decimal
        let minDistances = new Uint16Array(width * height)
        minDistances.fill(0xffff)
        console.log(minDistances)
        let queue = []
        for (const seed of seeds) {
            queue.push(seed)
            minDistances[seed.y * width + seed.x] = 0
        }
        while (queue.length > 0) {
            let current = queue.shift()
            let x = current.x
            let y = current.y
            //check all 4 directions
            let directions = [
                [-1, -1],
                [-1, 0],
                [-1, 1],
                [0, -1],
                [0, 0],
                [0, 1],
                [1, -1],
                [1, 0],
                [1, 1],
            ]
            for (const direction of directions) {
                let newX = x + direction[0] * 2
                let newY = y + direction[1] * 2
                if (newX >= 0 && newX < width && newY >= 0 && newY < height) {
                    let index = newY * width + newX
                    if (
                        minDistances[index] > minDistances[y * width + x] + 1 &&
                        grid.get(newX, newY) != MouseState.WALL
                    ) {
                        queue.push({ x: newX, y: newY })
                        minDistances[index] = minDistances[y * width + x] + 1
                    }
                }
            }
        }

        return minDistances
    }
}

//when the user clicks "r", run the algorithm
document.addEventListener("keydown", async (event) => {
    if (event.key == "r") {
        console.log("running algorithm")
        let path = await bestFirstSearchWithVelocies(
            grid,
            new State(10, 10, 0, 0),
            gridSize,
            gridSize
        )
        console.log(path)
        console.log(path.length)
        //draw the path
        drawGrid()
        // context.fillStyle = "red"
        // let path2 = bfs(new State(10, 10, 0, 0))
        // console.log(path2)
        // console.log(path2.length)
        context.fillStyle = "purple"
        for (const state of path) {
            context.fillRect(
                state.x * cellSize,
                state.y * cellSize,
                cellSize,
                cellSize
            )
        }
    }
    //if (event.key == "e") {
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

async function drawCurrentState(state) {
    //draw an line at the car's current position to show its velocity
    // context.fillStyle = "red"
    // context.fillRect(state.x * cellSize, state.y * cellSize, cellSize, cellSize)
    // context.fillStyle = "blue"
    // await new Promise((resolve) => setTimeout(resolve, 0))
}

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
            if (currState.vx + accelX > 10 || currState.vy + accelY > 10)
                continue

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

            //     currState.y cellSize - slope currState.x * cellSize

            // for (let x = nextState.x; x > currState.x; x++) {

            //     const y = slope * x + yIntercept //y = mx + b

            //     const offset = {

            //         x:

            //             (lineThicknessRadius Math.sqrt(slope slope + 1)) /

            //             slope,

            //         y: lineThicknessRadius Math.sqrt(slope slope + 1),

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
            const deltaX = nextState.x - currState.x
let hitWall = false
if (deltaX == 0) {
    //if deltaX is 0, then the slope is undefined, so we have to handle this case separately
    for (let y = currState.y + 1; y <= nextState.y; y++) {
        if (grid.get(currState.x, y) == MouseState.WALL) {
            hitWall = true
            break
        }
    }
    if (!hitWall) {
        possibleNextCells.push(nextState)
    }
    continue
}

const deltaY = nextState.y - currState.y
const slope = deltaY / deltaX
const lineThicknessRadius = carSize / 2
const yIntercept =
    currState.y * cellSize - slope * currState.x * cellSize

for (let x = nextState.x; x > currState.x; x--) {
    const y = slope * x + yIntercept //y = mx + b
    const offset = {
        x:
            (lineThicknessRadius * Math.sqrt(slope * slope + 1)) /
            slope,
        y: lineThicknessRadius * Math.sqrt(slope * slope + 1),
    }

    const edge1 = { x: x + offset.x, y: y + offset.y }
    const edge2 = { x: x - offset.x, y: y - offset.y }
    const cell1 = {
        x: Math.floor(edge1.x / cellSize),
        y: Math.floor(edge1.y / cellSize),
    }
    const cell2 = {
        x: Math.floor(edge2.x / cellSize),
        y: Math.floor(edge2.y / cellSize),
    }

    if (
        grid.get(cell1.x, cell1.y) == MouseState.WALL ||
        grid.get(cell2.x, cell2.y) == MouseState.WALL
    ) {
        hitWall = true
        break
    }
}

        if(!hitWall) possibleNextCells.push(nextState)
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
        // if(queue.length >  1000) return;

        let currState = queue.shift()

        //sort the possible next states by descending distance from the current state, filtering out any states that have already been visited

        let possibleNextStates = getPossibleNextStates(currState).filter(
            (state) =>
                grid.get(state.x, state.y) !== MouseState.WALL &&
                !parents.has(cantor4(state))
        )

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
    return `${state.x},${state.y},${state.vx},${state.vy}`
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
        const z = bfs({ x: 10, y: 10, v: 0, v: 0 })

        console.log(z)

        if (z === undefined) return

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

            //draw a point at the next state
        }
    }
})

function inverseCantor4(z) {
    const l = z.split(",")
    return {
        x: parseInt(l[0]),
        y: parseInt(l[1]),
        vx: parseInt(l[2]),
        vy: parseInt(l[3]),
    }
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
