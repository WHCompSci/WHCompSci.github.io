const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");
const moving_points_idx = [];
const FREQ_MULTIPLIER = 0.001;
const points = [];
const oscillators = [];
const DELETE = Symbol("delete");
const SHIFT = Symbol("shift");
const FREQUENCY = Symbol("frequency");
let mouse_down = false;
function default_path() {
    return {
        path: [],
        t_initial: null,
        t_period: null,
        bounds_x_low: Number.POSITIVE_INFINITY,
        bounds_y_low: Number.POSITIVE_INFINITY,
        bounds_x_hi: 0,
        bounds_y_hi: 0,
    };
}
let path_data = default_path();
let levels = [];
let running = true;
let selected_point_idx = null;
let selected_osc_idx = null;
let mouseX = null;
let mouseY = null;
let edit_mode = DELETE;
let clear_path_flag = false;
let curr_lvl = 0;
let t = 0;
function draw_point(point, idx) {
    ctx.lineWidth = 3;

    if (point.num_children > 0 || point.is_fixed) {
        ctx.fillStyle = "grey";
    } else {
        ctx.fillStyle = "#DD5822";
    }
    ctx.strokeStyle = idx == selected_point_idx ? "black" : ctx.fillStyle;
    let rad = idx == selected_point_idx ? 8 : 5;
    ctx.beginPath();
    ctx.arc(point.x, point.y, rad, 0, 2 * Math.PI, false);
    ctx.fill();
    ctx.stroke();
}
function get_path_from_solution(osc_list, points_list, solution_point_idx) {
    const path = [];
    let t = 0;
    for (
        let t = 0;
        t < getCombinedPeriod(solution_point_idx, osc_list, points_list);
        t++
    ) {
        for (const osc of osc_list) {
            if (osc == undefined) continue;
            update_oscillator(osc, t, points_list);
        }
        path.push({
            x: points_list[solution_point_idx].x,
            y: points_list[solution_point_idx].y,
        });
    }
}

function getPathBoundingBox(path) {
    let [xLow, yLow, xHigh, yHigh] = [
        Number.POSITIVE_INFINITY,
        Number.POSITIVE_INFINITY,
        0,
        0,
    ];
    for (const point of path) {
        if (point.x < xLow) xLow = point.x;
        if (point.x > xHigh) xHigh = point.x;
        if (point.y < yLow) yLow = point.y;
        if (point.y > yHigh) yHigh = point.y;
    }
    return [xLow, yLow, xHigh, yHigh];
}

function addLevel(
    example_solution_osc_list,
    example_solution_points_list,
    point_idx,
    maxAllowedOsc
) {
    const levelPath = get_path_from_solution(
        example_solution_osc_list,
        example_solution_points_list,
        point_idx
    );
    const [xLow, yLow, xHigh, yHigh] = getPathBoundingBox(levelPath);
    path_set = new Set();

    levels.push({
        path: levelPath,
        path_set: new Set(levelPath),
        maxAllowedOsc: maxAllowedOsc,
        xLow: xLow,
        yLow: yLow,
        xHigh: xHigh,
        yHigh: yHigh,
    });
    console.log(levels);
}
function checkForWin(level) {
    const EPSILON = 1;
    if (points[selected_point_idx].confirmed_no_win) return false;
    //first check bounding boxes.
    if (Math.abs(level.xLow - path_data.bounds_x_low) > EPSILON) return false;
    if (Math.abs(level.yLow - path_data.bounds_y_low) > EPSILON) return false;
    if (Math.abs(level.xHigh - path_data.bounds_x_hi) > EPSILON) return false;
    if (Math.abs(level.yHigh - path_data.bounds_y_hi) > EPSILON) return false;

    // if
    return true;
}

class Oscillator {
    constructor(e1_idx, e2_idx, starting_pos) {
        //swap the indicies so the order you created the oscillator doesn't matter
        const e1dist = dist({ x: 0, y: 0 }, points[e1_idx]);
        const e2dist = dist({ x: 0, y: 0 }, points[e2_idx]);
        const x = e1dist < e2dist;
        const end1_idx = x ? e1_idx : e2_idx;
        const end2_idx = x ? e2_idx : e1_idx;
        this.end1_idx = end1_idx;
        this.end2_idx = end2_idx;

        this.frequency = 1;
        console.log(this.end1_idx + " : " + this.end2_idx);
        console.log(e1dist + " " + e2dist);
        this.points_arr_idx = points.length;

        points[end1_idx].num_children++;
        points[end2_idx].num_children++;
        let end1 = points[end1_idx];
        let end2 = points[end2_idx];
        
        this.starting_pos = starting_pos;
        this.set_starting_pos(starting_pos);
        this.point = {
            x: end1.x,
            y: end1.y,
            is_fixed: false,
            num_children: 0,
            confirmed_no_win: false,
            parent_osc_idx: oscillators.length,
        };
        points.push(this.point);
        //not the necessarily individual period of this oscillator (2pi/freq)
        // but instead the period of the composite motion it proudces
        // if the ends of this oscillator are themselves oscillating,
        // then the period of the combined motion of this oscilator
        // is the LCM of the periods of the individual ocillators in the system
        // or 2pi/lcm([speeds])

        moving_points_idx.push(this.points_arr_idx);
        console.log(points[this.points_arr_idx]);
    }
    draw(idx) {
        const end1 = points[this.end1_idx];
        const end2 = points[this.end2_idx];
        if (idx == selected_osc_idx) {
            ctx.lineWidth = 6;
            ctx.strokeStyle =
                edit_mode == DELETE
                    ? "#DD5822"
                    : edit_mode == FREQUENCY
                    ? "#22A7DD"
                    : "#49DD22";
            ctx.beginPath(); // Start a new path
            ctx.moveTo(end1.x, end1.y);
            ctx.lineTo(end2.x, end2.y);
            ctx.stroke(); // Render the path
        }
        ctx.strokeStyle = ["black", "#B622DD", "violet", "#22A7DD"][
            this.starting_pos
        ];
        ctx.lineWidth = 5 - this.frequency;
        ctx.beginPath(); // Start a new path
        ctx.moveTo(end1.x, end1.y);
        ctx.lineTo(end2.x, end2.y);
        ctx.stroke(); // Render the path
    }

    set_starting_pos(starting_pos) {
        this.starting_pos = starting_pos;
        console.log("Setting starting position to: " + starting_pos);
        this.t_init = Math.PI * 0.5 * starting_pos;
    }
}

function getCombinedPeriod(point_idx, osc_list, points_list) {
    function gcd(nums) {
        function _gcd(a, b) {
            return !b ? a : _gcd(b, a % b);
        }
        if (nums.length == 1) {
            return nums[0];
        }
        let g = 1;
        for (const num of nums) g = _gcd(g, num);
        return g;
    }
    if(points_list[point_idx].parent_osc_idx == null) {
        console.log("null parent idx")
        return 0;
    }
    console.log(point_idx)
    const frequencies = new Set();
    const queue = [points_list[point_idx].parent_osc_idx];
    console.log(queue[0])
    while (queue.length > 0) {
        const curr_osc = osc_list[queue.pop()];
        frequencies.add(curr_osc.frequency);
        const end1 = points_list[curr_osc.end1_index];
        const end2 = points_list[curr_osc.end2_index];
        if (end1 != undefined && end1.parent_osc_idx != null) {
            queue.push(end1.parent_osc_idx);
        }
        if (end2 != undefined && end2.parent_osc_idx != null) {
            queue.push(end2.parent_osc_idx);
        }
    }
    //FIXME
    return (2 * Math.PI) / (FREQ_MULTIPLIER * gcd(Array.from(frequencies)));
}

function update_oscillator(osc, t, points) {
    if(osc == undefined) return;
    const end1 = points[osc.end1_idx];
    const end2 = points[osc.end2_idx];
    const speed = FREQ_MULTIPLIER * osc.frequency;
    const u = (Math.sin(t * speed + osc.t_init) + 1) * 0.5;
    //lerp
    osc.point.x = end1.x * u + end2.x * (1 - u);
    osc.point.y = end1.y * u + end2.y * (1 - u);
    points[osc.points_arr_idx] = osc.point;
}
function deleteOscillator(idx) {
    const osc = oscillators[idx];
    if (osc.point.num_children > 0) return;
    let found = false;
    points[osc.points_arr_idx] = undefined; //dont splice(idx, 1) bc we dont want to invalidate index
    for (let i = 0; i < moving_points_idx.length; i++) {
        if (found) {
            moving_points_idx[i - 1] = moving_points_idx[i];
            continue;
        }
        if (moving_points_idx[i] == idx) {
            moving_points_idx[i] = undefined;
            found = true;
        }
    }
    points[osc.end1_idx].num_children--;
    points[osc.end2_idx].num_children--;
    oscillators[idx] = undefined;
}
function mid(point1, point2) {
    return {
        x: 0.5 * (point1.x + point2.x),
        y: 0.5 * (point1.y + point2.y),
        is_fixed: false,
        num_children: 0,
        confirmed_no_win: false,
        parent_osc_idx: null,
    };
}
function dist(point1, point2) {
    return Math.sqrt(
        (point1.x - point2.x) * (point1.x - point2.x) +
            (point1.y - point2.y) * (point1.y - point2.y)
    );
}
function slope(point1, point2) {
    return (point1.y - point2.y) / (point1.x - point2.x);
}
function drawMouseLine() {
    if (
        !mouse_down ||
        selected_point_idx == null ||
        mouseX == null ||
        mouseY == null ||
        points[selected_point_idx] == undefined
    )
        return;
    ctx.strokeStyle = "black";
    ctx.beginPath();
    ctx.moveTo(mouseX, mouseY);
    ctx.lineTo(points[selected_point_idx].x, points[selected_point_idx].y);
    ctx.stroke();
}

let last_update_time;
function start() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    createGrid();
    ctx.lineWidth = 3;
    console.log(oscillators);
    last_update_time = new Date().getTime();
    //add levels
    // addLevel(
    //     JSON.parse(
    //         `[{"end1_idx":1,"end2_idx":9,"speed_multiplier":4,"points_arr_idx":24,"point":{"x":596.3125,"y":131.29005961992775,"is_fixed":false,"num_children":1},"starting_pos":0,"t_init":0},{"end1_idx":2,"end2_idx":10,"speed_multiplier":1,"points_arr_idx":25,"point":{"x":937.0625,"y":162.04545942664907,"is_fixed":false,"num_children":1},"starting_pos":0,"t_init":0},{"end1_idx":24,"end2_idx":25,"speed_multiplier":2,"points_arr_idx":26,"point":{"x":698.9735345132524,"y":140.5560351475189,"is_fixed":false,"num_children":0},"starting_pos":1,"t_init":1.5707963267948966}]`
    //     ),
    //     JSON.parse(
    //         `[{"x":255.5625,"y":85.1875,"is_fixed":true,"num_children":0},{"x":596.3125,"y":85.1875,"is_fixed":true,"num_children":1},{"x":937.0625,"y":85.1875,"is_fixed":true,"num_children":1},{"x":1277.8125,"y":85.1875,"is_fixed":true,"num_children":0},{"x":85.1875,"y":255.5625,"is_fixed":true,"num_children":0},{"x":425.9375,"y":255.5625,"is_fixed":true,"num_children":0},{"x":766.6875,"y":255.5625,"is_fixed":true,"num_children":0},{"x":1107.4375,"y":255.5625,"is_fixed":true,"num_children":0},{"x":255.5625,"y":425.9375,"is_fixed":true,"num_children":0},{"x":596.3125,"y":425.9375,"is_fixed":true,"num_children":1},{"x":937.0625,"y":425.9375,"is_fixed":true,"num_children":1},{"x":1277.8125,"y":425.9375,"is_fixed":true,"num_children":0},{"x":85.1875,"y":596.3125,"is_fixed":true,"num_children":0},{"x":425.9375,"y":596.3125,"is_fixed":true,"num_children":0},{"x":766.6875,"y":596.3125,"is_fixed":true,"num_children":0},{"x":1107.4375,"y":596.3125,"is_fixed":true,"num_children":0},{"x":255.5625,"y":766.6875,"is_fixed":true,"num_children":0},{"x":596.3125,"y":766.6875,"is_fixed":true,"num_children":0},{"x":937.0625,"y":766.6875,"is_fixed":true,"num_children":0},{"x":1277.8125,"y":766.6875,"is_fixed":true,"num_children":0},{"x":85.1875,"y":937.0625,"is_fixed":true,"num_children":0},{"x":425.9375,"y":937.0625,"is_fixed":true,"num_children":0},{"x":766.6875,"y":937.0625,"is_fixed":true,"num_children":0},{"x":1107.4375,"y":937.0625,"is_fixed":true,"num_children":0},{"x":596.3125,"y":131.29005961992775,"is_fixed":false,"num_children":1},{"x":937.0625,"y":162.04545942664907,"is_fixed":false,"num_children":1},{"x":698.9735345132524,"y":140.5560351475189,"is_fixed":false,"num_children":0}]`
    //     ),
    //     26
    // );
    update();
}
start();

function update() {
    const curr_time = new Date().getTime();
    //console.log(selected_point)
    if (running) {
        t += curr_time - last_update_time; //delta time
        if (selected_point_idx != null) {
            tracePath(selected_point_idx);
            // check for win

            // const hasWon = checkForWin(levels[curr_lvl]);
            // console.log(path_data);
            // if (hasWon) {
            //     curr_lvl++;
            //     if (curr_lvl >= levels.length) {
            //         console.log("You win!");
            //         return;
            //     }
            // }
        }
    }
    last_update_time = curr_time;

    const [closest, dist] = findClosestOsc(mouseX, mouseY);
    selected_osc_idx = closest != null && dist < 3000 ? closest : null;
    // Clear the canvas
    ctx.fillStyle = "#e4d5b7";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    //draw paths
    // drawPath(levels[curr_lvl].path, "#A6221D");
    if (selected_point_idx != null) {
        drawPath(path_data.path, "#B622DD");
    }
    //draw bg points
    // points.forEach((point, idx) => {
    //     if (!moving_points_idx.includes(idx)) {
    //         draw_point(point, idx);
    //     }
    // });

    //draw lines
    oscillators.forEach((osc, i) => {
        if (osc != undefined) {
            update_oscillator(osc, t, points);
            osc.draw(i);
        }
        
    });
    //draws points
    points.forEach((point, idx) => {
        if (point != undefined) {
            draw_point(point, idx);
        }
    });

    //draw line between selected point and mouse
    drawMouseLine();
    // Call the update function again on the next frame
    requestAnimationFrame(update);
}

function createGrid() {
    const rows = 8;
    const sideLen = canvas.width / rows;
    //no more equalateral triangles cuz I like my circles ;)
    const height = sideLen; //(sideLen / 2) * Math.sqrt(3);

    const cols = canvas.height / height;
    ctx.fillStyle = "grey";

    for (let c = 0; c < cols; c++) {
        for (let r = 0; r < rows; r++) {
            if ((r + c) % 2 == 0) continue;
            // if (r == 0 && c % 2 == 0) continue;
            //every other row, add half of a side length
            let x = r * sideLen + 0.5 * sideLen; // + ((c % 2) * sideLen) / 2;
            let y = c * height + 0.5 * height;
            points.push({
                x: x,
                y: y,
                is_fixed: true,
                num_children: 0,
                confirmed_no_win: true,
                parent_osc_idx: null,
            });
        }
    }
}

document.onkeydown = function (e) {
    if (e.key == " ") {
        console.log("Paused Simulation");
        running = !running;
    } else if (e.key == "d") {
        edit_mode = DELETE;
        console.log("mode=delete");
    } else if (e.key == "f") {
        edit_mode = FREQUENCY;
        console.log("mode=freq");
    } else if (e.key == "s") {
        edit_mode = SHIFT;
        console.log("mode=shift");
    } else if (e.key == "w") {
        console.log(JSON.stringify(oscillators));
        console.log(JSON.stringify(points));
        console.log(JSON.stringify(selected_point_idx));
    }
};
//FIXME
document.onmousedown = function (e) {
    mouse_down = true;
    let potential_end1_idx = findPressedPoint(e.clientX, e.clientY);
    if (e.button == 2 && potential_end1_idx == null) {
        selected_point_idx = null;
        return;
    }

    console.log(points[potential_end1_idx]);

    if (potential_end1_idx == null && selected_osc_idx != null) {
        //change the starting pos of the currently selected oscillator
        switch (edit_mode) {
            case DELETE:
                deleteOscillator(selected_osc_idx);
                break;
            case SHIFT:
                oscillators[selected_osc_idx].set_starting_pos(
                    (oscillators[selected_osc_idx].starting_pos + 1) % 4
                );
                break;
            case FREQUENCY:
                oscillators[selected_osc_idx].frequency =
                    1 + (oscillators[selected_osc_idx].frequency % 4);
        }
    } else {
        selected_point_idx = potential_end1_idx;
    }
    clear_path_flag = true;
};

document.onmouseup = (e) => {
    mouse_down = false;
    const potential_end2_idx = findPressedPoint(e.clientX, e.clientY);
    if (
        selected_point_idx != null &&
        potential_end2_idx != null &&
        potential_end2_idx != selected_point_idx
    ) {
        placeOscillator(selected_point_idx, potential_end2_idx);
        selected_point_idx = null;
    }
    mouseX = null;
    mouseY = null;
};

function tracePath(point_idx) {
    const currPoint = points[point_idx];
    if (currPoint == undefined) return;
    path_data.t_initial ??= t;
    path_data.t_period ??= getCombinedPeriod(point_idx, oscillators, points);
    path_data.path.push({ x: currPoint.x, y: currPoint.y });

    if (t > path_data.t_initial + path_data.t_period) {
        path_data.path.shift();
        console.log(path_data.t_period)
    }
    //extends the bounds if currPoint goes outside of the previous bounding box
    if (currPoint.x < path_data.bounds_x_low)
        path_data.bounds_x_low = currPoint.x;
    if (currPoint.y < path_data.bounds_y_low)
        path_data.bounds_y_low = currPoint.y;
    if (currPoint.x > path_data.bounds_x_hi)
        path_data.bounds_x_hi = currPoint.x;
    if (currPoint.y > path_data.bounds_y_hi)
        path_data.bounds_y_hi = currPoint.y;
    //we have to clear the path here because otherwise we get weird lines when we change speeds
    if (clear_path_flag) {
        path_data = default_path(); //clears path

        clear_path_flag = false;
    }
}
function drawPath(path, color) {
    //console.log("drawing path... "+ path.length);
    ctx.lineWidth = 10;
    ctx.strokeStyle = color;
    if (path.length == 0) return;
    ctx.beginPath();
    ctx.moveTo(path[0].x, path[0].y);
    for (const point of path) {
        ctx.lineTo(point.x, point.y);
    }
    ctx.stroke();
    ctx.lineWidth = 3;
}
document.onmousemove = (ev) => {
    // if (!mouse_down) return;
    mouseX = ev.x;
    mouseY = ev.y;
};

function findPressedPoint(x, y) {
    //linear search
    let minDist = Number.POSITIVE_INFINITY;
    let closestPointIdx = -1;
    for (let i = 0; i < points.length; i++) {
        if (points[i] == undefined) continue;
        let currDist = dist({ x: x, y: y }, points[i]);
        if (currDist < minDist) {
            minDist = currDist;
            closestPointIdx = i;
        }
    }
    if (
        minDist > 10.0 ||
        closestPointIdx == selected_point_idx ||
        closestPointIdx < 0
    ) {
        return null;
    }

    return closestPointIdx;
}

function placeOscillator(end1_idx, end2_idx) {
    let end1 = points[end1_idx];
    let end2 = points[end2_idx];
    let new_osc = new Oscillator(end1_idx, end2_idx, 0);
    oscillators.push(new_osc);
}
function findClosestOsc(x, y) {
    //linear search
    let minDist = Number.POSITIVE_INFINITY;
    let closestOscIdx = null;
    for (let i = 0; i < oscillators.length; i++) {
        const osc = oscillators[i];
        if(osc == undefined) continue;
        const x1 = points[osc.end1_idx].x;
        const y1 = points[osc.end1_idx].y;
        const x2 = points[osc.end2_idx].x;
        const y2 = points[osc.end2_idx].y;
        //check bounding box.
        if (x2 - x1 > 1 && (x < x1 || x > x2)) continue;
        if (y2 - y1 > 1 && (y < y1 || y > y2)) continue;
        //standard form of a line: ax + by - c = 0
        const a = y2 - y1;
        const b = x1 - x2;
        const c = a * x1 + b * y1;
        const dist_from_cursor = Math.abs(a * x + b * y - c);
        if (dist_from_cursor < minDist) {
            minDist = dist_from_cursor;
            closestOscIdx = i;
        }
    }
    return [closestOscIdx, minDist];
}
