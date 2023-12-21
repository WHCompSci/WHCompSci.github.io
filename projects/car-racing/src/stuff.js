const gridHeight = 10
const gridWidth = 10

class PriorityQueue {
    constructor() {
        this.items = []
        this.size = -1
    }
    //add an element to the queue
    enqueue(element, priority) {
        size++
        let idx = this.size * 5
        this.items[idx] = element.x
        this.items[idx + 1] = element.y
        this.items[idx + 2] = element.vx
        this.items[idx + 3] = element.vy
        this.items[idx + 4] = priority
    }
    //check the highest priority element (Linear Search)
    //Lower number = higher priority, so 0 is the highest priority because we dont use negative distances :)
    peek() {
        let highestPriority = 0
        let highestPriorityIndex = -1
        for (let i = 0; i < this.size; i++) {
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
        let highestPriority = this.items[highestPriorityIndex * 5 + 4]
        this.items.splice(highestPriorityIndex * 5, 5)
        this.size--
        return highestPriority
    }
    //check if the queue is empty
    isEmpty() {
        return this.size == -1
    }
}


/**
 * Calculates the minimum distances from the given grid to the goal nodes.
 * Each node's neighbors are the nodes that are 1 step away in the 4 directions. (Not using different velocities)
 * The purpose of this function is to be a heuristic for the A* algorithm, which will use velocities, however that
 * function has a much larger time and space complexity because it has to search the same positions multiple times 
 * for different velocities.
 * @param {Array<Array<number>>} grid - The grid representing the nodes.
 * @param {Array<{x: number, y: number}>} goalNodes - The goal nodes.
 * @returns {Uint16Array} - The array of minimum distances.
 */
function findMinDistancesToGoal(grid, goalNodes) {
    let height = grid.length
    let width = grid[0].length
    //total size of minDistances is height*width*16 bits or height*width*2 bytes
    //we assume that all nodes are unvisited and have an infinite distance to the goal (2^16-1) not really infinite but it is enough for our purposes
    //all unvisited nodes have a distance of 2^16-1 or 1111111111111111 in binary which is 65535 in decimal
    let minDistances = new Uint16Array(height * width).fill(65535)
    let queue = []
    for (goal of goalNodes) {
        queue.push(goal)
        minDistances[goal.y * width + goal.x] = 0
    }
    while (queue.length > 0) {
        let current = queue.shift()
        let x = current.x
        let y = current.y
        visited[y * width + x] = 1
        //check all 4 directions
        let directions = [
            [1, 0],
            [-1, 0],
            [0, 1],
            [0, -1],
        ]
        for (const direction of directions) {
            let newX = x + direction[0]
            let newY = y + direction[1]
            if (newX >= 0 && newX < width && newY >= 0 && newY < height) {
                let index = newY * width + newX
                if (
                    minDistances[index] == 65535 &&
                    grid[newY][newX] != MouseState.WALL &&
                    minDistances[index] < minDistances[y * width + x] + 1
                ) {
                    queue.push({ x: newX, y: newY })
                    minDistances[index] = minDistances[y * width + x] + 1
                }
            }
        }
    }

    return minDistances
}




class Node {
    constructor(x, y, vx, vy) {
        this.x = x
        this.y = y
        this.vx = vx
        this.vy = vy
    }
}

//NodeMap is a map of nodes to their parents.Retrevial is based on value equality, not reference equality. 
class NodeMap {
    constructor() {
        this.map = new Map()
    }
    get(node) {
        return this.map.get(node.x + node.y * gridWidth + node.vx * gridWidth * gridHeight + node.vy * gridWidth * gridHeight)
    }
    set(node, parent) {
        this.map.set(node.x + node.y * gridWidth + node.vx * gridWidth * gridHeight + node.vy * gridWidth * gridHeight, parent)
    }
}

function getPath(parents, current) {
    let path = []
    while (current != null) {
        path.push(current)
        current = parents.get(current)
    }
    return path
}

function bestFirstSearchWithVelocies(grid, start, goalNodes) {
    const height = grid.length
    const width = grid[0].length
    const minDistances = findMinDistancesToGoal(grid, goalNodes)
    const heuristic = ({x, y, vx, vy}) => minDistances[(y + vy) * width + (x + vx)]
    //create a map of parents
    const parents = new NodeMap()
    //create a priority queue
    const queue = new PriorityQueue()
    //add the start node to the queue
    queue.enqueue(start, heuristic(start))
    parents.set(start, null)
    //while the queue is not empty
    while(!queue.isEmpty) {
        //get the node with the highest priority
        let current = queue.dequeue()
        //check if we reached the goal
        if (grid[current.y][current.x] == MouseState.GOAL) {
            console.log("found goal")
            return getPath(parents, current)
        }
        //for each neighbor of the current node, compute the heuristic and add it to the queue
        for (const neighbor of getNeighbors(current, grid, height, width)) {
            if (!parents.has(neighbor)) {
                parents.set(neighbor, current)
                queue.enqueue(neighbor, heuristic(neighbor))
            }
        }
    }
}

function getNeighbors(node, grid, height, width) {
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
        const vx = node.vx + ax
        const vy = node.vy + ay
        const x = node.x + vx
        const y = node.y + vy
        //continue if the node is out of bounds or is a wall
        if (
            x < 0 ||
            x >= width ||
            y < 0 ||
            y >= height ||
            grid[y][x] == MouseState.WALL
        ) {
            continue
        }
        neighbors.push(new Node(x, y, vx, vy))
    }
}