const width = window.innerWidth
const height = window.innerHeight

let canvas = document.getElementById('game')
canvas.width = width
canvas.height = height
let ctx = canvas.getContext('2d')



function generate_map(height, width, N) {

    function gaussianRandom(mean = 0, stdev = 1) {
        const u = 1 - Math.random() // Converting [0,1) to (0,1]
        const v = Math.random()
        const z = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v)
        // Transform to the desired mean and standard deviation:
        return z * stdev + mean
    }


    //pick N random points,normally distributed around the center of the map
    let points = []

    for (let i = 0; i < N; i++) {
        let x = Math.floor(gaussianRandom(width / 2, width / 6))
        let y = Math.floor(gaussianRandom(height / 2, height / 6))
        points.push([x, y])
    }
    //for each point, calculate the minimum distance to any other point
    let points_dtc = []
    for (let [x, y] of points) {
        let dists = []
        for (let [x2, y2] of points) {
            //normalize the distance to a value between 0 and 1
            let dist = Math.sqrt((x - x2) ** 2 + (y - y2) ** 2)
            dists.push(dist)
        }
        points_dtc.push(dists)
    }

    let min_dists = []
    for (let i = 0; i < N; i++) {
        let min_dist = Infinity
        for (let j = 0; j < N; j++) {
            if (i !== j) {
                let dist = Math.sqrt((points[i][0] - points[j][0]) ** 2 + (points[i][1] - points[j][1]) ** 2)
                if (dist < min_dist) min_dist = dist
            }
        }
        min_dists.push(min_dist)
    }
    // avg min dist
    // let max_min_dist = Math.max(...min_dists) * .5
    // let inv_max_min_dist_sq = 1 / max_min_dist ** 1 / 2
    // console.log(max_min_dist, inv_max_min_dist_sq)
    // //draw metaballs for each point. First create a texture to draw the metaballs on

    // ctx.fillStyle = 'white'
    // ctx.fillRect(0, 0, width, height)
    // //draw the metaballs

    // for (let x = 0; x < width; x++) {
    //     for (let y = 0; y < height; y++) {


    //         let sum = 0
    //         for (let i = 0; i < N; i++) {
    //             let dist_sq = (x - points[i][0]) ** 2 + (y - points[i][1]) ** 2
    //             sum += 1 / dist_sq
    //         }
    //         if (sum > 0.001) {
    //             ctx.fillStyle = 'black'
    //             ctx.fillRect(x, y, 1, 1)
    //         }
    //     }
    // }
    // //draw points in blue
    // ctx.fillStyle = 'blue'
    // for (let [x, y] of points) {
    //     ctx.fillRect(x, y, 5, 5)
    // }


    const get_sum = (x, y) => {

        let sum = 0
        for (let i = 0; i < N; i++) {
            let dist_sq = (x - points[i][0]) ** 2 + (y - points[i][1]) ** 2
            sum += 1 / dist_sq
        }
        return sum
    }
    let y = height / 2
    const epsilon = 0.0001
    const r = 0.001
    while (y > height / 16) {
        const current_sum = get_sum(width / 2, y)
        if (Math.abs(current_sum - r) < epsilon) break
        // const next_sum = get_sum(width/2,y-1)
        // const grad = current_sum - next_sum
        y--
    }
    console.log(y)
    //draw red dot at (width/2,y)
    ctx.fillStyle = 'red'
    console.log(y)
    const border_points = [[width / 2, y]]
    //find all border points
    let i = 0
    //as a test, draw a tangent vector at every 5 pixels (represent as a line segment)
    // for (let x = 0; x < width; x += 5) {
    //     for (let y = 0; y < height; y += 5) {
    //         // const normal = find_normal(x, y)
    //         const tangent = find_tangent(x, y)
    //         ctx.beginPath()
    //         ctx.moveTo(x, y)
    //         ctx.lineTo(x + tangent

    //         [0] * 10, y + tangent

    //         [1] * 10)
    //         ctx.stroke()
    //     }
    // }








    function find_normal(x, y) {
        let normal = [0, 0]
        for (let n = 0; n < N; n++) {
            const px = points[n][0]
            const py = points[n][1]
            const dist = (x - px) ** 2 + (y - py) ** 2
            normal[0] += -2 * (x - px) / Math.abs(dist) ** 3
            normal[1] += -2 * (y - py) / Math.abs(dist) ** 3
        }
        const normal_length = Math.sqrt(normal[0] ** 2 + normal[1] ** 2)
        normal[0] /= normal_length
        normal[1] /= normal_length
        return normal
    }
    function find_tangent(x, y) {
        const normal = find_normal(x, y)
        return [-normal[1], normal[0]]
    }


    while (true) {
        i++
        //find gradient
        const [x, y] = border_points[border_points.length - 1]
        const current_sum = get_sum(x, y)
        const normal = find_normal(x, y)
        const tangent = find_tangent(x, y)
        const step = 10
        //runge kutta 2nd order
        const k1 = tangent
        const k2 = find_tangent(x + k1[0] * step, y + k1[1] * step)
        const new_x = x + (k1[0] + k2[0]) / 2 * step
        const new_y = y + (k1[1] + k2[1]) / 2 * step


        // let new_x = x + tangent
        // [0] * step
        // let new_y = y + tangent[1] * step
        //check if the new point is inside the map. 


        border_points.push([new_x, new_y])

        //check if the new point is close to the starting point
        if (Math.abs(new_x - border_points[0][0]) < 5 && Math.abs(new_y - border_points[0][1]) < 5 && i > 10) break
        if (i > 10000) break
    }
    //draw the border
    // ctx.strokeStyle = 'green'
    // ctx.beginPath()
    // for (let [x, y] of border_points) {
    //     ctx.lineTo(x, y)
    // }
    ctx.stroke()
    console.log("border points", border_points)
    border_points.pop()
    //recenter the green.
    //find the center of the border
    const center = border_points.reduce((acc, [x, y]) => [acc[0] + x, acc[1] + y], [0, 0]).map(x => x / border_points.length)
    console.log(center)
    for (let i = 0; i < border_points.length; i++) {
        border_points[i][0] -= (center[0] - width / 2)
        border_points[i][1] -= (center[1] - height / 2)
    }
    //pick hole location in side the green area
    //pick random point on the border then shift it to the center of the map
    function get_hole_location(border_points) {
        let hole_location
        do {
            hole_location = Object.create(border_points[Math.floor(Math.random() * border_points.length)])
            //vec to center
            let to_center = [width / 2 - hole_location[0], height / 2 - hole_location[1]]
            //normalize
            let dist = Math.sqrt(to_center[0] ** 2 + to_center[1] ** 2)
            to_center[0] /= dist
            to_center[1] /= dist
            //move the hole location to the center by a random amount
            let move = dist * (Math.random() * 0.5 + 0.25)
            hole_location[0] += to_center[0] * move
            hole_location[1] += to_center[1] * move
            //check if the hole location is inside the green

        } while (get_sum(hole_location[0], hole_location[1]) < 2 * r)
        return hole_location
    }
    return [border_points, get_hole_location(border_points)]


}

const [border, hole] = generate_map(height, width, 25)
//draw the border, filled with green

let is_dragging = false
let mouse_pos = [0, 0]


function draw_green() {
    ctx.fillStyle = 'green'
    ctx.fillRect(0, 0, width, height)
    ctx.fillStyle = 'lightgreen'
    ctx.beginPath()
    ctx.moveTo(border[0][0], border[0][1])
    for (let [x, y] of border) {
        ctx.lineTo(x, y)
    }
    ctx.lineTo(border[0][0], border[0][1])
    ctx.fill()
    //cement, beige concrete
    ctx.strokeStyle = 'beige'
    ctx.lineWidth = 8
    ctx.stroke()
    //draw hole
    ctx.fillStyle = 'black'
    ctx.beginPath()
    ctx.arc(hole[0], hole[1], 6, 0, 2 * Math.PI)
    ctx.fill()

}
function draw_ball() {
    //shadow
    ctx.fillStyle = 'rgba(0,0,0,0.5)'
    ctx.beginPath()
    ctx.arc(ball.x + 2, ball.y + 2, ball.r, 0, 2 * Math.PI)
    ctx.fill()
    //ball

    ctx.fillStyle = 'white'
    ctx.beginPath()
    ctx.arc(ball.x, ball.y, ball.r, 0, 2 * Math.PI)
    ctx.fill()
}

const ball = {
    x: width / 2,
    y: height / 2,
    r: 4,
    vx: 0,
    vy: 0
}



function draw() {
    draw_green()
    draw_aim_indicator()

    draw_ball()

}
draw()

function update(dt) {
    if(ball.vx**2+ball.vy**2<0.0001) return
    ball.x += ball.vx * dt
    ball.y += ball.vy * dt
    ball.vx *= 0.99
    ball.vy *= 0.99
    //ball rolls around the hole
    //     if (hole.intersects(this.position, this.radius + hole.radius)) {
    //     const dx = hole.position.x - this.position.x
    //     const dy = hole.position.y - this.position.y
    //     const angle = Math.atan2(dy, dx)
    //     const speed_initial = magnitude(this.velocity)
    //     this.applyForce({ x: Math.cos(angle) * 0.2, y: Math.sin(angle) * 0.2 })
    //     const speed_final = magnitude(this.velocity)
    //     const COR = 0.99
    //     //normalize velocity for conservation of energy
    //     //KEf = KEi => 0.5 * m * v^2 = 0.5 * m * v_f^2 => vf=v
    //     this.velocity = multiply(this.velocity, COR * speed_initial / speed_final)
    if (Math.sqrt((ball.x - hole[0]) ** 2 + (ball.y - hole[1]) ** 2) < 10) {
        const dx = hole[0] - ball.x
        const dy = hole[1] - ball.y
        const angle = Math.atan2(dy, dx)
        const speed_initial = Math.sqrt(ball.vx ** 2 + ball.vy ** 2)
        ball.vx += Math.cos(angle) * 0.002
        ball.vy += Math.sin(angle) * 0.002
        const speed_final = Math.sqrt(ball.vx ** 2 + ball.vy ** 2)
        const COR = 0.99
        ball.vx *= COR * speed_initial / speed_final
        ball.vy *= COR * speed_initial / speed_final
    }
    //bounce off the border of the green
    for (let i = 0; i < border.length - 1; i++) {
        const [x1, y1] = border[i]
        const [x2, y2] = border[i + 1]
        const dx = x2 - x1
        const dy = y2 - y1
        const normal = [-dy, dx]
        const normal_length = Math.sqrt(normal[0] ** 2 + normal[1] ** 2)
        normal[0] /= normal_length
        normal[1] /= normal_length
        const tangent = [-normal[1], normal[0]]
        //project the ball's velocity vector onto the tangent and normal vectors
        const v_tangent = ball.vx * tangent[0] + ball.vy * tangent[1]
        const v_normal = ball.vx * normal[0] + ball.vy * normal[1]
        //reverse the normal component
        //check if ball is colliding with either of the two  points (x1,y1) or (x2,y2)
        const dist1 = Math.sqrt((ball.x - x1) ** 2 + (ball.y - y1) ** 2)
        const dist2 = Math.sqrt((ball.x - x2) ** 2 + (ball.y - y2) ** 2)
        console.log(dist1,dist2)
        if(dist1<ball.r || dist2<ball.r){
        ball.vx = v_tangent * tangent[0] - v_normal * normal[0]
        ball.vy = v_tangent * tangent[1] - v_normal * normal[1]
        }



        
    }
}
// }

const start_time = performance.now()
let last_time = start_time
function loop(timestamp) {
    const dt = timestamp - last_time
    update(dt)
    draw()
    last_time = timestamp
    requestAnimationFrame(loop)
}

loop(start_time)

function intersects_ball(x, y) {
    return Math.sqrt((x - ball.x) ** 2 + (y - ball.y) ** 2) < ball.r
}
//click and drag to move the ball. It will move in the opposite direction of the mouse.

canvas.addEventListener('mousedown', e => {
    if (intersects_ball(e.offsetX, e.offsetY)) {
        is_dragging = true

    }
})
canvas.addEventListener('mousemove', e => {

    mouse_pos = [e.offsetX, e.offsetY]

})
canvas.addEventListener('mouseup', e => {
    if (is_dragging) {
        is_dragging = false
        ball.vx = (ball.x - mouse_pos[0]) * 0.005
        ball.vy = (ball.y - mouse_pos[1]) * 0.005

    }
})
function draw_aim_indicator() {
    if (!is_dragging) return
    //transparent line from ball to mouse
    ctx.strokeStyle = 'rgba(0,0,0,0.5)'
    ctx.lineWidth = 7
    ctx.beginPath()
    ctx.moveTo(ball.x, ball.y)
    ctx.lineTo(mouse_pos[0], mouse_pos[1])
    ctx.stroke()
}