const canvas = document.getElementById("canvas")
const mousePos = { x: 0, y: 0 }
const points = []
let foundMouse = false
const gridSize = 25
const DELETE_RADIUS = 10;
canvas.width = innerWidth, canvas.height = innerHeight
window.onresize = () => {
    canvas.width = innerWidth, canvas.height = innerHeight
}
const ctx = canvas.getContext("2d")

function draw() {
    ctx.fillStyle = "#202020"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    ctx.fillStyle = "white"
    if (foundMouse) {
        drawGridGlow(mousePos)
    }
    points.forEach(point => drawPoint(point.x, point.y, 5, "#ab88ddff"))
    requestAnimationFrame(draw)
}

requestAnimationFrame(draw)

addEventListener("mousemove", (ev) => {
    mousePos.x = ev.clientX
    mousePos.y = ev.clientY
    foundMouse = true
})

function drawGridGlow(mousePos) {

    const { x: mx, y: my } = mousePos

    const radius = 60
    const falloff = 10
    const maxAlpha = .8
    const distBetweenSamples = 5 // resolution


    const grad = ctx.createRadialGradient(mx, my, 0, mx, my, radius)
    for (let r = 0; r < radius; r += distBetweenSamples) {
        const alpha = maxAlpha * Math.exp(-(falloff * r * r) / (radius * radius))
        grad.addColorStop(r / radius, `rgba(255, 255, 255, ${alpha})`)
    }

    // drawing vertical lines

    let Xvalue = Math.ceil((mx - radius) / gridSize) * gridSize;
    while (Xvalue < mx + radius) {
        const Xoffset = mx - Xvalue
        const sqrt = Math.sqrt(radius * radius - (Xoffset * Xoffset))

        drawLine(Xvalue, my - sqrt, Xvalue, my + sqrt, grad)
        Xvalue += gridSize
    }

    // drawing horizontal lines
    let Yvalue = Math.ceil((my - radius) / gridSize) * gridSize
    while (Yvalue < my + radius) {
        const Yoffset = my - Yvalue
        const sqrt = Math.sqrt(radius * radius - Yoffset * Yoffset)

        drawLine(mx - sqrt, Yvalue, mx + sqrt, Yvalue, grad)
        Yvalue += gridSize
    }

}

function distanceSquared(x1, y1, x2, y2) {
    return (x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2)
}

function lerp(x1, y1, x2, y2, t) {
    return [t * x2 + (1 - t) * x1, t * y2 + (1 - t) * y1]
}

function drawLine(x1, y1, x2, y2, color) {
    ctx.strokeStyle = color
    ctx.beginPath()
    ctx.moveTo(x1, y1)
    ctx.lineTo(x2, y2)
    ctx.stroke()
}

function drawPoint(x, y, radius, color) {
    let orig = ctx.fillStyle
    ctx.fillStyle = color
    ctx.beginPath()
    ctx.arc(x, y, radius, 0, Math.PI * 2)
    ctx.fill()
    ctx.fillStyle = orig
}
document.querySelector('canvas').addEventListener('contextmenu', e => e.preventDefault())
addEventListener("mousedown", (ev) => {
    const x = ev.clientX
    const y = ev.clientY
    if (ev.button == 0) {

        points.push({ x, y })
    }
    else if (ev.button == 2) {
        for (let i = 0; i < points.length; i++) {
            const p = points[i]
            if (distanceSquared(p.x, p.y, x, y) < DELETE_RADIUS * DELETE_RADIUS) {
                points.splice(i, 1)
                break
            }
        }
    }

})



class Value {
    constructor(data, _prev = []) {
        this.data = data
        this.grad = 0
        this._prev = new Set(_prev)
        this._backward = () => null
    }
    // adds variables of type Value
    add(other) {
        other = other instanceof Value ? other : new Value(other)
        const out = new Value(this.data + other.data, [this, other])
        out._backward = () => {
            this.grad += out.grad
            other.grad += out.grad
        }
        return out
    }

    // multiplies variables of type Value
    mult(other) {
        other = other instanceof Value ? other : new Value(other)
        const out = new Value(this.data * other.data, [this, other])
        out._backward = () => {
            this.grad += other.data * out.grad
            other.grad += this.data * out.grad
        }
        return out
    }
    // reLu function
    relu() {
        const out = new Value(this.data < 0 ? 0 : this.data, [this])
        out._backward = () => {
            this.grad += (this.data > 0 ? 1 : 0) * out.grad
        }
        return out
    }
}

class Module {
    parameters() { return [] }

    zero_grad() {
        for (const p of this.parameters()) {
            p.grad = 0
        }
    }
}

class Neuron extends Module {
    constructor(nin, nonlin = true) {
        super()
        this.weights = []
        for (let _ = 0; _ < nin; _++) {
            this.weights.push(new Value(Math.random() * 2 - 1))
        }
        this.bias = new Value(0)
        this.nonlin = nonlin
        console.log(this.weights)
    }
    // feedforward inside of the neuron
    feedforward(inputs) {
        let sum = this.bias
        for (let i = 0; i < this.weights.length; i++) {
            sum = sum.add(this.weights[i].mult(inputs[i]))
        }
        const activation = this.nonlin ? sum.relu() : sum
        return activation
    }
    // returns the parameters in the neuron class
    parameters() {
        return [...this.weights, this.bias]
    }
}

class Layer extends Module {
    constructor(nin,nout) {
        super()
        this.neurons = []
        for (let i = 0; i < nout; i++) {
            this.neurons.push(new Neuron(nin))
        }
    }
    // feedforward in layers (not inside neurons)
    feedforward(inputs) {
        const outputs = []
        for(let i = 0; i < this.neurons.length; i++) {
            outputs.push(this.neurons[i].feedforward(inputs))
        }
        return outputs
    }
    // returns parameters of layers
    parameters() {
        const params = []
        for(let i = 0; i < this.neurons.length; i++) {
            params.push(...neurons[i].parameters())
        }
        return params
    }
    
}

class NeuralNetwork extends Module {
    constructor(layerwidths, nin) {
        super()
        this.layers = [new Layer(nin, layerwidths[0])]
        for(let i = 1; i < layerwidths.length; i++) {
            this.layers.push(new Layer(layerwidths[i-1], layerwidths[i]))
        }
    }

    feedforward(inputs) {
        let output = this.layers[0].feedforward(inputs)
        for(let i = 1; i < this.layers.length; i++) {
            output = this.layers[i].feedforward(output)
        }
        return output
    }
    parameters() {
        const params = []
        for(let layer = 0; layer < this.layers.length; layer++) {
            for(let i = 0; i < this.layers[layer].neurons.length; i++) {
                params.push(...this.layers[layer].neurons.parameters())
            }
        }
        return params
    }
}

const na = new NeuralNetwork([3, 3, 1], 4)
const output = na.feedforward([3, 7, 8, 61])
console.log(output)
// console.log([a,b,c,d,e,f])

const n = new Neuron(10)

