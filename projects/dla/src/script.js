function generateHeightMapDLA(height, width, iterations, initialHeightMap = new Array2D(height, width)) {
    const seedRow = ~~(height / 2)
    const seedCol = ~~(width / 2)
    const heightMap = initialHeightMap
    if (height != heightMap.height || width != heightMap.width) {
        throw new Error("Invalid initial heightmap supplied. Dimensions do not match. ")
    }

    heightMap.set(seedRow, seedCol, 1)

    for (let i = 0; i < iterations; i++) {


        let [currRow, currCol] = randomPerimeterSquare()

        while (true) {


            const topNeighbor = currRow > 0 && heightMap.get(currRow - 1, currCol)
            const bottomNeighbor = currRow < height - 1 && heightMap.get(currRow + 1, currCol)
            const leftNeighbor = currCol > 0 && heightMap.get(currRow, currCol - 1)
            const rightNeighbor = currCol < width - 1 && heightMap.get(currRow, currCol + 1)


            // check if we're sticking to any neighbor.
            if (topNeighbor || bottomNeighbor || leftNeighbor || rightNeighbor) {
                heightMap.set(currRow, currCol, 1)
                // console.log(i)
                break
            }


            const dRow = 2 * Math.round(Math.random()) - 1
            const dCol = 2 * Math.round(Math.random()) - 1
            currRow += dRow
            currCol += dCol
            if (currRow < 0 || currRow >= height || currCol < 0 || currCol >= width) {
                [currRow, currCol] = randomPerimeterSquare()
            }
            // console.log([currRow, currCol])


        }


    }
    return heightMap


    function randomPerimeterSquare() {
        let currRow, currCol
        const spawnTopBot = Math.random() > .5
        if (spawnTopBot) {
            currRow = Math.round(Math.random()) * height //randomly either 0 or height
            currCol = 1 + Math.floor(Math.random() * width - 2) //random [1, width - 1)
            // we pick from [1, width - 1) so we don't double count the corners.
        }
        else {
            currRow = Math.floor(Math.random() * height) //random [0, height)
            currCol = Math.round(Math.random()) * width //randomly either 0 or width
        }
        return [currRow, currCol]
    }
}






class Array2D {
    constructor(height, width) {
        this.data = new Uint8Array(height * width)
        this.height = height
        this.width = width
    }
    get(row, col) {
        return this.data[row * this.width + col]
    }
    set(row, col, val) {
        this.data[row * this.width + col] = val
    }
    print() {
        for (let row = 0; row < this.height; row++) {
            let s = ""
            for (let col = 0; col < this.width; col++) {
                s += this.get(row, col) > 0 ? '##' : '..'
            }
            console.log(s)
        }
        console.log()
    }
    drawOnCanvas(ctx) {
        for (let row = 0; row < this.height; row++) {
            for (let col = 0; col < this.width; col++) {
                if (this.get(row, col)) {
                    drawPixel(row, col, ctx)
                }
            }

        }
    }
    


}





function detailedUpscale(initialHeightMap) {

    const seedRow = ~~(initialHeightMap.height / 2)
    const seedCol = ~~(initialHeightMap.width / 2)
    const newHeight = initialHeightMap.height * 2
    const newWidth = initialHeightMap.width * 2
    const newHeightMap = new Array2D(newHeight, newWidth)
    const visited = new Array2D(initialHeightMap.height, initialHeightMap.width)
    const queue = [[seedRow, seedCol, seedRow, seedCol]]
    while (queue.length > 0) {
        const [currRow, currCol, parentRow, parentCol] = queue.pop()
        visited.set(currRow, currCol, 1)
        newHeightMap.set(currRow * 2, currCol * 2, 1)
        newHeightMap.set(currRow + parentRow, currCol + parentCol, 1)
        if (currRow > 0 && initialHeightMap.get(currRow - 1, currCol) && !visited.get(currRow - 1, currCol)) {
            queue.push([currRow - 1, currCol, currRow, currCol])
        }
        if (currRow < initialHeightMap.height - 1 && initialHeightMap.get(currRow + 1, currCol) && !visited.get(currRow + 1, currCol)) {
            queue.push([currRow + 1, currCol, currRow, currCol])
        }
        if (currCol > 0 && initialHeightMap.get(currRow, currCol - 1) && !visited.get(currRow, currCol - 1)) {
            queue.push([currRow, currCol - 1, currRow, currCol])
        }
        if (currCol < initialHeightMap.width - 1 && initialHeightMap.get(currRow, currCol + 1) && !visited.get(currRow, currCol + 1)) {
            queue.push([currRow, currCol + 1, currRow, currCol])
        }

    }
    return newHeightMap
}


const hm = generateHeightMapDLA(128, 128, 1500)
// hm.print()
// const hm2 = detailedUpscale(hm)
// hm2.print()
// const hm3 = generateHeightMapDLA(hm2.height, hm2.width, 180, hm2)
// // const hm4 = detailedUpscale(hm2)
// hm3.print()


function drawPixel(row,col, ctx) {
    const scale = 2
    ctx.fillRect(row * scale, col * scale, scale,scale)
}

const canvas = document.getElementById("simulation-canvas");
console.log(canvas)
const ctx = canvas.getContext("2d");
hm.drawOnCanvas(ctx)
