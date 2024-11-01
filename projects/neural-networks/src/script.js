const canvas = document.getElementById("canvas")
const mousePos = { x: 0, y: 0 }
const points = []
const [xs, ys] = randomPoints(30)

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
    // xs.forEach((x, i) => drawPoint(x, ys[i], 2, "#ab88ddff"))
    if(training) {
        const loss = train(na, xs, ys, 0.03)
        ctx.font = "20px consolas";
        ctx.fillText("Loss = "+loss.toFixed(10), 10, 50);
      
    }
        plotNetwork(na)
        drawPoints(xs, ys)

    drawPoints(xs, ys)
    plotNetwork(na)
    requestAnimationFrame(draw)
}

requestAnimationFrame(draw)

addEventListener("mousemove", (ev) => {
    mousePos.x = ev.clientX
    mousePos.y = ev.clientY
    foundMouse = true
})

function drawGridGlow(mousePos) {
    ctx.lineWidth = 2
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
        const [xNet, yNet] = toNetworkCoords(x, y)
        xs.push(xNet)
        ys.push(yNet)
    }
    else if (ev.button == 2) {
        for (let i = 0; i < points.length; i++) {
            const px = xs[i]
            const py = ys[i]
            if (distanceSquared(px, py, x, y) < DELETE_RADIUS * DELETE_RADIUS) {
                xs.splice(i, 1)
                ys.splice(i, 1)
                break
            }
        }
    }

})



class Value {
    constructor(data, children = []) {
        this.data = data
        this.grad = 0
        this.children = children
        this.backward = () => null
    }
    // adds variables of type Value
    add(other) {
        other = other instanceof Value ? other : new Value(other)
        const out = new Value(this.data + other.data, [this, other])
        out.backward = () => {
            this.grad += out.grad
            other.grad += out.grad
        }
        return out
    }

    sub(other) {
        other = other instanceof Value ? other : new Value(other)
        const out = new Value(this.data - other.data, [this, other])
        out.backward = () => {
            this.grad += out.grad
            other.grad -= out.grad
        }
        return out
    }

    // multiplies variables of type Value
    mult(other) {
        other = other instanceof Value ? other : new Value(other)
        const out = new Value(this.data * other.data, [this, other])
        out.backward = () => {
            this.grad += other.data * out.grad
            other.grad += this.data * out.grad
        }
        return out
    }
    // reLu function
    relu() {
        const out = new Value(this.data < 0 ? 0 : this.data, [this])
        out.backward = () => {
            this.grad += out.data > 0 ? out.grad : 0
        }
        return out
    }
    tanh() {
        const out = new Value(Math.tanh(this.data), [this])
        out.backward = () => {
            this.grad += (1 - out.data*out.data) * out.grad
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
    }
    // feedforward inside of the neuron
    feedforward(inputs) {
        let sum = new Value(0)
        for (let i = 0; i < this.weights.length; i++) {
            sum = sum.add(this.weights[i].mult(inputs[i]))
        }
        sum = sum.add(this.bias)
        const activation = this.nonlin ? sum.tanh() : sum
        return activation
    }
    // returns the parameters in the neuron class
    parameters() {
        return [...this.weights, this.bias]
    }
}

class Layer extends Module {
    constructor(nin, nout) {
        super()
        this.neurons = []
        for (let i = 0; i < nout; i++) {
            this.neurons.push(new Neuron(nin))
        }
    }
    // feedforward in layers (not inside neurons)
    feedforward(inputs) {
        const outputs = []
        for (let i = 0; i < this.neurons.length; i++) {
            outputs.push(this.neurons[i].feedforward(inputs))
        }
        return outputs
    }
    // returns parameters of layers
    parameters() {
        const params = []
        for (let i = 0; i < this.neurons.length; i++) {
            params.push(...this.neurons[i].parameters())
        }
        return params
    }

}

class NeuralNetwork extends Module {
    constructor(nin, layerwidths) {
        super()
        this.layers = [new Layer(nin, layerwidths[0])] // add first layer
        for (let i = 1; i < layerwidths.length; i++) {
            this.layers.push(new Layer(layerwidths[i - 1], layerwidths[i]))
        }
        this.layers[this.layers.length - 1].nonlin = false;
        console.log("Created a new NN with layers: ", this.layers)
    }

    feedforward(inputs) {
        for (let i = 0; i < this.layers.length; i++) {
            inputs = this.layers[i].feedforward(inputs)
        }
        return inputs
    }
    parameters() {
        const params = []
        for (let layer = 0; layer < this.layers.length; layer++) {
            params.push(...this.layers[layer].parameters())

        }
        return params
    }
}

function backprop(loss) {
    const topo = []
    const visited = new Set()

    function sortgraph(v) {
        if (visited.has(v)) {
            return
        }
        visited.add(v)
        for (const child of v.children) {
            sortgraph(child)
        }
        topo.push(v)
    }
    sortgraph(loss)
    loss.grad = 1
    for (const value of topo.reverse()) {
        value.backward()
    }

}

function train(net, xs, ys, learningrate) {
    let loss = new Value(0)
    for (let i = 0; i < ys.length; i++) {
        // if (Math.random() < 0.5) continue;
        const ypred = net.feedforward([xs[i]])[0]
        // console.log("ypred=", ypred)
        const yact = ys[i]
        const error = ypred.sub(yact)
        // console.log("err=", error)

        loss = loss.add(error.mult(error))
    }
    loss = loss.mult(1 / ys.length)
    console.log()
    net.zero_grad()
    backprop(loss)
    // console.log("Loss=", loss)

    for (const p of net.parameters()) {
        p.data -= learningrate * p.grad
        // console.log("changing by", p.grad)
    }
    // console.log("net=", net)
    return loss.data
}

console.log(xs, ys)

function randomPoints(n) {
    const x = []
    const y = []
    for (let i = 0; i < n; i++) {
        const v = Math.random()
        const fv = Math.sin(v * 10)  * 0.3 + Math.random() * 0.1 - v*v * 0.2 + 0.3
        x.push(v)  
        y.push(fv)
    }
    return [x, y]
}

const margin = 50;

function drawPoints(xs, ys) {
    
    for (let i = 0; i < Math.min(xs.length, ys.length); i++) {
        drawPoint(xs[i] * (canvas.width - 2 * margin) + margin, ys[i] * (canvas.height - 2 * margin) + margin, 10, "white")
    }
}

function plotNetwork(net, samplePoints = 200) {
    let lastX = 0
    let lastY = net.feedforward([0])[0].data
    ctx.strokeStyle = "#a5b0d9"
        ctx.lineWidth = 5
        ctx.beginPath()
    for (let i = 1; i < samplePoints; i++) {
        const x = i / samplePoints;
        const y = net.feedforward([x])[0].data
        ctx.strokeWidth = 10
        const [x1, y1] = toPixelCoords(x,y)
        const [x2, y2] = toPixelCoords(lastX, lastY)
        
        ctx.moveTo(x1, y1)
        ctx.lineTo(x2, y2)
        
        lastX = x
        lastY = y
    }
    ctx.stroke()

}

function toPixelCoords(x, y) {
    const margin = 10;
    x = x * (canvas.width - 2 * margin) + margin; 
    y = y * (canvas.height - 2 * margin) + margin; 
    return [x,y]
}
function toNetworkCoords(x, y) {
    x = (x - margin) / (canvas.width - 2 * margin)
    y = (y - margin) / (canvas.height - 2 * margin)
    return [x, y]

}

const na = new NeuralNetwork(1, [10, 4,1])
y = na.feedforward([1])
console.log("y=", y)

// drawPoints(xs, ys)
// plotNetwork(na)
let training = false
document.onkeydown = (ev) => {
    if(ev.key == ' ' ) {
        training = !training
    }
    if(ev.key == 'p') {
        console.log(na.parameters())
    }
}
train(na, xs, ys, 0.1)