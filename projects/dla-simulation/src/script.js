let rec;
function* generateHeightMapDLA(height, width, iterations, initialHeightMap = new Array2D(height, width)) {
    const heightMap = initialHeightMap
    const seedRow = ~~(height / 2)
    const seedCol = ~~(width / 2)

    if (height != heightMap.height || width != heightMap.width) {
        throw new Error("Invalid initial heightmap supplied. Dimensions do not match. ")
    }
    // for(let rowOffset = -2; rowOffset <= 2; rowOffset++) {
    //     for (let colOffset = -80; colOffset <= 80; colOffset++) {
    //         heightMap.set(seedRow + rowOffset, seedCol + colOffset, 1)
    //         yield [seedRow + rowOffset, seedCol + colOffset, 1]
    //     }
    // }
    heightMap.set(seedRow,seedCol, 1)
    yield [seedRow , seedCol, 1]
    
    for (let i = 0; i < iterations; i++) {
        let [currRow, currCol] = randomPerimeterSquare()
        while (true) {
            const topNeighbor = currRow > 0 ? heightMap.get(currRow - 1, currCol) : 0
            const bottomNeighbor = currRow < height - 1 ? heightMap.get(currRow + 1, currCol) : 0
            const leftNeighbor = currCol > 0 ? heightMap.get(currRow, currCol - 1) : 0
            const rightNeighbor = currCol < width - 1 ? heightMap.get(currRow, currCol + 1) : 0

            const deltas = []
            if (!topNeighbor) deltas.push([-1, 0])
            if (!bottomNeighbor) deltas.push([1, 0])
            if (!leftNeighbor) deltas.push([0, -1])
            if (!rightNeighbor) deltas.push([0, 1])

            // check if we're sticking to any neighbor.
            if ((topNeighbor || bottomNeighbor || leftNeighbor || rightNeighbor) && (Math.random() < stickinessSlider.value || deltas.length == 0)) {
                const height = Math.max(Math.max(topNeighbor, bottomNeighbor), Math.max(leftNeighbor, rightNeighbor)) + 1
                heightMap.set(currRow, currCol, height)
                yield [currRow, currCol, height]
                // console.log(i)
                break
            }
            

            const [dRow, dCol] = deltas[~~(Math.random() * deltas.length)]
            currRow = mod(currRow + dRow, height)
            currCol = mod(currCol + dCol, width)
            // if (currRow < 0 || currRow >= height || currCol < 0 || currCol >= width) {
            //     // we went off the map, respawn at a new perimeter square
            //     [currRow, currCol] = randomPerimeterSquare()
            // }
        }
    }
        // return heightMap



    function mod(n, m) {
        return ((n % m) + m) % m
    }

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
        ctx.fillStyle = "black"
        for (let row = 0; row < this.height; row++) {
            for (let col = 0; col < this.width; col++) {
                if (this.get(row, col)) {
                    drawPixel(row, col, 1, ctx)
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

function drawPixel(row, col, val, ctx) {
    ctx.fillStyle = `rgba( ${val}, 36, 130, ${.7})`
    const scale = 2
    ctx.fillRect(row * scale, col * scale, scale, scale)
}


const canvas = document.getElementById("simulation-canvas")
console.log(canvas)
const ctx = canvas.getContext("2d")


let interval
const run = () => {
    const numPixelsPerFrame = 4
    
    const hm = generateHeightMapDLA(256, 256, 256 * 256 * 0.5)
    clearInterval(interval)
    startRecording()
    interval = setInterval(() => {
        const pxBuffer = []
        for(let j = 0; j < numPixelsPerFrame; j ++) {
            const i = hm.next()
            if (i.done) {
                clearInterval(interval)
                return
            }
            const [r, c, val] = i.value
            pxBuffer.push([r, c, val])
        }
        pxBuffer.forEach(([r, c, val]) => drawPixel(r, c, val, ctx))
    }, 1)
}



function saveCanvasAsImage() {
    // Get the canvas element

    // Get the data of the canvas
    const image = canvas.toDataURL('image/png')
    // Create a temporary link element and trigger the download
    const link = document.createElement('a')
    link.href = image
    link.download = 'canvas-image.png'
    link.click()

}

function startRecording() {
    let i = 0
    const chunks = [] // here we will store our recorded media chunks (Blobs)
    const stream = canvas.captureStream(10) // grab our canvas MediaStream
    rec = new MediaRecorder(stream) // init the recorder
    // every time the recorder has new data, we will store it in our array
    rec.ondataavailable = e =>  { 
        chunks.push(e.data) 
        
    }
    // only when the recorder stops, we construct a complete Blob from all the chunks
    rec.onstop = e => exportVid(new Blob(chunks, { type: 'video/webm' }))

    rec.start()
    // setTimeout(() => rec.stop(), 3000) // stop recording in 3s
}

function exportVid(blob) {
 
    // document.body.appendChild(vid)
    const a = document.getElementById('save-video-button')
    a.download = 'myvid.webm'
    a.href = URL.createObjectURL(blob)
    a.click()
    // a.textContent = 'download the video'
    // document.body.appendChild(a)
}


// Save the canvas as an image when the button is clicked
document.getElementById('save-button').addEventListener('click', () => {
    saveCanvasAsImage()
})
document.getElementById('save-video-button').addEventListener('click', () => {
    rec.stop()
})
document.getElementById('restart-button').addEventListener('click', () => {
    ctx.fillStyle = "white"
    ctx.fillRect(0, 0, 512, 512)
    console.log("restart")
    run()
})

const stickinessSlider = document.getElementById('stickiness-slider')
const stickinessIndicator = document.getElementById('stickiness-indicator')
stickinessSlider.addEventListener("change", (ev) => {
    stickinessIndicator.innerText = "Stickiness="+stickinessSlider.value
})

run()