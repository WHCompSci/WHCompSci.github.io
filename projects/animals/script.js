class Point {
    constructor(x, y) {
        this.x = x
        this.y = y
    }
}
function add(p1, p2) {
    return new Point(p1.x + p2.x, p1.y + p2.y)
}
function subtract(p1, p2) {
    return new Point(p1.x - p2.x, p1.y - p2.y)
}

function magnitude(p) {
    return Math.sqrt(p.x * p.x + p.y * p.y)
}

function normalize(p) {
    const m = magnitude(p)
    return new Point(p.x / m, p.y / m)
}

function multiplyScalar(p, m) {
    return new Point(p.x * m, p.y * m)
}

function lerp(p1, p2, t) {
    return add(multiplyScalar(p1, 1 - t), multiplyScalar(p2, t))
}

function dot(p1, p2) {
    return p1.x * p2.x + p1.y * p2.y
}

const canvas = document.querySelector("#canvas")
const ctx = canvas.getContext("2d")
const H = window.innerHeight
const W = window.innerWidth
const C = {
    flax: "#DDD78D",
    ecru: "#DCBF85",
    rose: "#8B635C",
    walnut: "#60594D",
    gray: "#93A29B"
}

const initalBodyPosition = (bodySegments, segmentSpacing) => bodySegments.map((_, i) => { return { x: W / 2 - segmentSpacing * i, y: H / 2 } })

console.log(W / 2 - 20)
const segmentSizes = Array(20).fill(50)

const segmentSpacing = 50
const bodyPositions = initalBodyPosition(segmentSizes, segmentSpacing)
console.log(bodyPositions[2])
// console.log(bodyPositions)
let mousePos = new Point(0, 0)
document.addEventListener('mousemove', (ev) => {
    mousePos.x = ev.offsetX
    mousePos.y = ev.offsetY
})

const init = () => {
    canvas.height = H
    canvas.width = W

    window.requestAnimationFrame(update)
}


const t = 0.4
const maxAng = 0.4
const update = () => {
    ctx.clearRect(0, 0, W, H)
    ctx.fillColor = C.flax
    ctx.strokeStyle = C.ecru
    ctx.lineWidth = 4
    bodyPositions[0] = lerp(bodyPositions[0], mousePos, t)
    let prevdisplacementVector
    for (let i = 1; i < bodyPositions.length; i++) {
        //project onto previous circle
        let displacementVector = subtract(bodyPositions[i - 1], bodyPositions[i])
        const normDisplacement = normalize(displacementVector)

        const targetPos = subtract(bodyPositions[i - 1], multiplyScalar(normDisplacement, segmentSpacing))
        bodyPositions[i] = lerp(bodyPositions[i], targetPos, t)
        if (i == 1) {
            prevdisplacementVector = displacementVector
            continue
        }
        const theta = Math.acos(dot(prevdisplacementVector, displacementVector) / (magnitude(prevdisplacementVector) * magnitude(displacementVector)))
        if(theta > maxAng) {
            displacementVector = lerp(displacementVector,prevdisplacementVector, 0.2)
            const normDisplacement = normalize(displacementVector)
            const targetPos = subtract(bodyPositions[i - 1], multiplyScalar(normDisplacement, segmentSpacing))
            bodyPositions[i] = lerp(bodyPositions[i], targetPos, t)
        }

        prevdisplacementVector = displacementVector


    }

    drawAnimal(bodyPositions, segmentSizes)
    // ctx.strokeStyle = C.ecru
    // bodyPositions.forEach((p, i) => {
    //     drawCircle(p, segmentSizes[i])
    // })
    window.requestAnimationFrame(update)

}

function drawCircle(point, radius) {
    ctx.beginPath()
    ctx.arc(point.x, point.y, radius, 0, Math.PI * 2)
    ctx.fill()
    // ctx.stroke()

}

function drawSmoothLoop(points, options = {}) {
    // Default options
    const {
        strokeColor = 'black',
        strokeWidth = 2,
        fillColor = 'rgba(208, 126, 193, 0.449)',
        tension = 0.2 // Controls the smoothness of the curve
    } = options

    // Ensure we have at least 3 points
    if (points.length < 3) {
        console.error('Need at least 3 points to draw a smooth loop')
        return
    }

    // Function to calculate control points using Catmull-Rom spline
    function getControlPoints(points, tension) {
        const controlPoints = []
        const len = points.length

        for (let i = 0; i < len; i++) {
            const prev = points[(i - 1 + len) % len]
            const current = points[i]
            const next = points[(i + 1) % len]
            const nextNext = points[(i + 2) % len]

            // Calculate control points
            const dx1 = next.x - prev.x
            const dy1 = next.y - prev.y
            const dx2 = nextNext.x - current.x
            const dy2 = nextNext.y - current.y

            const c1 = {
                x: current.x + dx1 * tension,
                y: current.y + dy1 * tension
            }

            const c2 = {
                x: next.x - dx2 * tension,
                y: next.y - dy2 * tension
            }

            controlPoints.push({ c1, c2 })
        }

        return controlPoints
    }

    // Prepare the context
    ctx.beginPath()
    ctx.strokeStyle = strokeColor
    ctx.lineWidth = strokeWidth

    // Calculate control points
    const controlPoints = getControlPoints(points, tension)

    // Move to the first point
    ctx.moveTo(points[0].x, points[0].y)

    // Draw Bezier curves
    for (let i = 0; i < points.length; i++) {
        const current = points[i]
        const next = points[(i + 1) % points.length]
        const cp = controlPoints[i]

        ctx.bezierCurveTo(
            cp.c1.x, cp.c1.y,
            cp.c2.x, cp.c2.y,
            next.x, next.y
        )
    }

    // Close the path
    ctx.closePath()

    // Optional fill
    if (fillColor) {
        ctx.fillStyle = fillColor
        ctx.fill()
    }

    // Stroke the path
    ctx.stroke()
}


function drawAnimal(bodyPositions, segmentSizes) {
    const path = []
    const normDisplacements = []
    for (let i = 1; i < bodyPositions.length; i++) {
        // console.log(bodyPositions[i - 1])
        const displacementVector = subtract(bodyPositions[i - 1], bodyPositions[i])
        normDisplacements.push(displacementVector)

    }
    normDisplacements.unshift(normDisplacements[0])

    for (let i = 0; i < normDisplacements.length; i++) {
        const d = normDisplacements[i]
        const pos = bodyPositions[i]
        const rad = segmentSizes[i]
        const theta = Math.atan2(d.y, d.x)
        const alpha = theta + Math.PI / 4
        const beta = theta - Math.PI / 4
        if (i == 0) {
            path.push(new Point(pos.x + 1.4 * rad * Math.cos(theta), pos.y + 1.4 * rad * Math.sin(theta)))
            ctx.fillStyle = "black"
            const d = 0.7
            const s = 0.3
           
            drawCircle(new Point(pos.x + d * rad * Math.cos(theta + s), pos.y + d * rad * Math.sin(theta + s)), 5)
            drawCircle(new Point(pos.x + d * rad * Math.cos(theta - s), pos.y + d * rad * Math.sin(theta - s)), 5)

        }
        // drawCircle(new Point(pos.x + rad * Math.cos(theta), pos.y + rad * Math.sin(theta)), 2)
        path.push(new Point(pos.x + rad * Math.cos(alpha), pos.y + rad * Math.sin(alpha)))
        path.unshift(new Point(pos.x + rad * Math.cos(beta), pos.y + rad * Math.sin(beta)))
        if (i == normDisplacements.length - 1) {
            path.push(pos)
        }
    }
    console.log(path)
    drawSmoothLoop(path)
}

init()
