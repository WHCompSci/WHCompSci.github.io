const GRIDSIZE = 512
let circleRadius = 1
const canvas = document.getElementById('simulation-canvas')
canvas.width = GRIDSIZE
canvas.height = GRIDSIZE
const ctx = canvas.getContext('2d')
const baseAmp = 0.2
const freq = .06

let shift = 0

function draw() {
    ctx.fillStyle = 'white'
    // 0 1 0 -1 0 ...
    const phase = Math.sin(freq * circleRadius - shift)
    // ctx.fillRect(0, 0, GRIDSIZE, GRIDSIZE)
    const circumference = 2 * Math.PI * circleRadius
    const numCircleSamplePoints = circumference // number of points to sample on the circle to ensure that every grid cell that the circle's circumference passes through is found
    const angleIncrement = 2 * Math.PI / numCircleSamplePoints

    for (let i = 0; i < numCircleSamplePoints; i++) {
        const angle = i * angleIncrement
        const x = circleRadius * Math.cos(angle)
        const y = circleRadius * Math.sin(angle)
        const gridCenterX = Math.round(x / GRIDSIZE) * GRIDSIZE
        const gridCenterY = Math.round(y / GRIDSIZE) * GRIDSIZE
        const dx = x - gridCenterX
        const dy = y - gridCenterY
        const manhattanDistance = gridCenterX / GRIDSIZE + gridCenterY / GRIDSIZE
        const reflectionSignChange = Math.pow(-1, Math.floor(manhattanDistance)) // 1

        //get color of the grid cell
        let color = ctx.getImageData(gridCenterX + GRIDSIZE / 2, gridCenterY + GRIDSIZE / 2, 1, 1).data
        let origAmp = color[0] / 255
        let newAmp = origAmp + baseAmp * phase * reflectionSignChange
        let newColor = newAmp * 255
        ctx.fillStyle = `rgb(${newColor},${100+newColor/2},${135})`

        
       

        ctx.fillRect(dx + GRIDSIZE / 2, dy + GRIDSIZE / 2, 1, 1)
        
        

    }

}

ctx.fillStyle = 'white'

ctx.fillRect(0, 0, GRIDSIZE, GRIDSIZE)
console.log("draw")
setInterval(() => {
    

    circleRadius += 1
    draw()
    
}, 10)


function saveCanvasAsImage(canvasId) {
    // Get the canvas element
    const canvas = document.getElementById(canvasId)
    const context = canvas.getContext('2d')

   
    // Save the canvas as an image
    const image = canvas.toDataURL("image/png")

    // Create a temporary link element and trigger the download
    const link = document.createElement('a')
    link.href = image
    link.download = 'canvas-image.png'
    link.click()

}

// Save the canvas as an image when the button is clicked
document.getElementById('save-button').addEventListener('click', () => {
    saveCanvasAsImage('simulation-canvas')
})

document.getElementById('restart-button').addEventListener('click', () => {
    circleRadius = 1
    ctx.fillStyle = 'white'
    ctx.fillRect(0, 0, GRIDSIZE, GRIDSIZE)
    console.log("restart")
})