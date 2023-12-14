import Fraction from "./fraction.js"
let I = 1
const PERF_LEVELS = {
    shallow: {
        MAX_INTERMEDIATE: 1000,
        MAX_DENOM: 1000,
    },
    medium: {
        MAX_INTERMEDIATE: 100000,
        MAX_DENOM: 100000,
    },
    deep: {
        MAX_INTERMEDIATE: Infinity,
        MAX_DENOM: Infinity,
    },
}
const FACTORIAL = new Uint32Array([
    1, 1, 2, 6, 24, 120, 720, 5040, 40320, 362880, 3628800, 39916800, 479001600,
    6227020800, 87178291200, 1307674368000, 20922789888000, 355687428096000,
    6402373705728000,
])

const PRIMES = new Uint32Array([
    2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71,
    73, 79, 83, 89, 97,
]) //used for hashing
const DOUBLE_FACTORIAL = new Uint32Array([
    1, 1, 2, 3, 8, 15, 48, 105, 384, 945, 3840, 10395, 46080, 135135, 645120,
    2027025, 10321920, 34459425, 185794560, 654729075, 3715891200, 13749310575,
    81749606400, 316234143225, 1961990553600, 7905853580625, 51011754393600,
    213458046676875, 1428329123020800, 6190283353629375,
])

const PROPS = Object.freeze({
    UNARY_INVERSE: Symbol("UNARY_INVERSE"), //f(f(x)) == x
    COMMUNITIVE: Symbol("COMMUNITIVE"), //f(a, b, c) == f(b, c, a)
    ASSOCIATIVE: Symbol("ASSOCIATIVE"), //f(f(a, b), c) == f(a, f(b, c))
})

/**
 * @param {() => string} symbol String interpolation
 * @param {() => Fraction} eval Run the operation (actual math)
 * @param {() => bool} is_defined_for Return true if the input x is a valid argument
 * @param {bool} is_checked_by_default Tells whether or not to check the operation automatically on page startup
 * @param {Array?} props Operation properties such as communitivity, associativity, etc. Used for better inference to speed up algorithm.
 * @returns {Operation} mathematical operation
 */
function operation(
    web_symbol,
    symb,
    calculate,
    is_checked_by_default,
    ...props
) {
    if (props === null) {
        props = []
    }
    return {
        arity: symb.length,
        web_symbol,
        symb: web_symbol,
        symbol: symb,
        calculate: calculate,
        is_checked_by_default: is_checked_by_default,
        props: props,
    }
}

function Operations() {
    return DEFAULT_OPERATIONS
}
export { Operations, find_all_equations }
const DEFAULT_OPERATIONS = {
    negate: operation(
        (x) => `-${x}`,
        (x) => `-(${x})`,
        (x) => x.neg(),
        true,

        PROPS.UNARY_INVERSE
    ),
    factorial: operation(
        (x) => `${x}!`,
        (x) => `(${x})!`,
        (x) =>
            x.d === 1 && x >= 0 && x <= 18 ? Fraction(FACTORIAL[x.n]) : null,
        true
    ),
    double_factorial: operation(
        (x) => `${x}!!`,
        (x) => `(${x})!!`,
        (x) =>
            x.d === 1 && x >= 0 && x <= 28
                ? Fraction(DOUBLE_FACTORIAL[x.n])
                : null,
        true
    ),
    sqrt: operation(
        (x) => `\\sqrt ${x}`,
        (x) => `root(${x})`,
        (x) => {
            if (x < 0) {
                return null
            }
            let root_numerator = Math.sqrt(x.n)
            let root_denom = Math.sqrt(x.d)
            return (root_numerator | 0) === root_numerator &&
                (root_denom | 0) === root_denom
                ? Fraction(root_numerator, root_denom)
                : null
        },
        true
    ),
    // common_log: operation(
    //     (x) => `\\log ${x}`,
    //     (x) => `log(${x})`,
    //     (x) => {
    //         if (x <= 0) {
    //             return null
    //         }
    //         let n = Math.log10(x.n) - Math.log10(x.d)
    //         return n % 1 < Number.EPSILON ? Fraction(Math.round(n)) : null
    //     },
    //     false
    // ),
    floor: operation(
        (x) => `\\lfloor ${x} \\rfloor`,
        (x) => `floor(${x})`,
        (x) => x.floor(),
        false
    ),

    ceil: operation(
        (x) => `\\lceil ${x} \\rceil`,
        (x) => `ceil(${x})`,
        (x) => x.ceil(),
        false
    ),
    sign: operation(
        (x) => `\\text{sign } ${x}`,
        (x) => `sign(${x})`,
        (x) => x == 0 ? x : Fraction(x.s),
        false,
        PROPS.RECIPRICOL
    ),
    recipricol: operation(
        (x) => `${x}^{-1}`,
        (x) => `inv(${x})`,
        (x) => (!x.equals(0) ? x.inverse() : null),
        false,
        PROPS.RECIPRICOL
    ),
    add: operation(
        (a, b) => `${a} + ${b}`,
        (a, b) => `(${a}) + (${b})`,
        (a, b) => a.add(b),
        true,
        PROPS.COMMUNITIVE,
        PROPS.ASSOCIATIVE
    ),
    subtract: operation(
        (a, b) => `${a} - ${b}`,
        (a, b) => `(${a}) - (${b})`,
        (a, b) => a.sub(b),
        true
    ),
    multiply: operation(
        (a, b) => `${a} \\times ${b}`,
        (a, b) => `(${a})*(${b})`,
        (a, b) => a.mul(b),
        true,
        PROPS.COMMUNITIVE,
        PROPS.ASSOCIATIVE
    ),
    divide: operation(
        (a, b) => `${a}\\div ${b}`,
        (a, b) => `(${a})/(${b})`,
        (a, b) => (b != 0 ? a.div(b) : null),
        true
    ),

    power: operation(
        (a, b) => `${a}^${b}`,
        (a, b) => `(${a})^(${b})`,
        (a, b) => {
            if (a.equals(1) || b.equals(0)) {
                //using 0^0 == 1
                return Fraction(1)
            }
            if (b === 1) {
                return a
            }
            if (a.equals(0) && b.s === -1) {
                return null
            }

            return a.pow(b) ?? null
        },
        true
    ),
    radical: operation(
        (a, b) => `\\sqrt[${b}]{${a}}`,
        (a, b) => `\\sqrt[${b}]{${a}}`,
        (a, b) => {
            if (b.equals(0)) {
                return a.equals(0) ? Fraction(0) : null
            }
            const inv = b.inverse()
            if (a.equals(1)) {
                return Fraction(1)
            }
            if (inv === 1) {
                return a
            }
            if (a.equals(0) && inv.s === -1) {
                return null
            }

            return a.pow(inv) ?? null
        },
        true
    ),
    // log_base: operation(
    //     (a, b) => `\\log_{\\,${a}} ${b}`,
    //     (a, b) => `log(${a}, ${b})`,
    //     (a, b) => {
    //         if (a.equals(1) || a < 0 || b <= 0) return null
    //         if (b.equals(1) || a.equals(0)) {
    //             console.log("A: "+a+" "+b)
    //             return Fraction(0)
    //         }
    //         let frac = (Math.log(b.n) - Math.log(b.d))/(Math.log(a.n) - Math.log(a.d))
    //         let frac_rounded = parseFloat(frac.toFixed(5))
    //         if (Math.abs(frac - frac_rounded) < 1e-15) {
    //             return Fraction((frac_rounded * 100000), 100000)
    //         }
    //         console.log(
    //             "B: " + a + " " + b + " " + Math.abs(frac - frac_rounded)
    //         )
    //         return null
    //     },
    //     false
    // ),
    // remainder: operation(
    //     (a, b) => `${a} \\% ${b}`,
    //     (a, b) => `(${a}) % (${b})`,
    //     (a, b) => a.mod(b),
    // ),

    //mathmatical modulo operation. (Not a % b, instead (a % b + b) % b ) *Different Behavior for negative numbers https://bigmachine.io/theory/mod-and-remainder-are-not-the-same/
    mod: operation(
        (a, b) => `${a} \\bmod{${b}}`,
        (a, b) => `mod(${a}, ${b})`,
        (a, b) => a.mod(b).add(b).mod(b),
        false
    ),
    binom: operation(
        (a, b) => `\\binom ${a}${b}`,
        (a, b) => `C(${a}, ${b})`,
        (a, b) => {
            if (b.d !== 1 || b < 0 || b > 18 || b > a) return null
            if (a == b || b == 0) return Fraction(1)
            if (a == 0) return Fraction(0)
            if (a.d === 1 && a > 0 && a <= 18) {
                return Fraction(FACTORIAL[a.n], FACTORIAL[b.n] * FACTORIAL[a.n - b.n])
            }
            let numer = a
            for(let i = 1; i < b; i++) {numer = numer.mul(a.sub(i))}
    
            return numer.mul(FACTORIAL[b.n].inverse)

             
        },
        false
    ),
}

class Queue {
    constructor(items) {
        this.items = Array.from(items)
    }

    enqueue(item) {
        this.items.push(item)
    }

    dequeue() {
        return this.items.shift()
    }

    peek() {
        return this.items[0]
    }
}

function find_all_equations(
    year,
    min_num,
    max_num,
    performance_level,
    max_equations_per_num,
    allowed_operations,
    max_unary_stack = 10,
    short_circuit = true
) {
    const start_time = new Date()
    const MAX_INTERMEDIATE = Math.max(
        PERF_LEVELS[performance_level].MAX_INTERMEDIATE,
        Math.max(Math.abs(min_num), Math.abs(max_num))
    )
    const MAX_DENOM = PERF_LEVELS[performance_level].MAX_DENOM
    //for short circuiting
    let num_undiscovered_solutions = max_num - min_num + 1

    console.log("mi=" + MAX_INTERMEDIATE)
    console.log("md=" + MAX_DENOM)
    const solutions = []
    function add_solution(solution) {
        if (
            solution.value.d != 1 ||
            solution.value.s != 1 ||
            solution.value.n > max_num ||
            solution.value.n < min_num ||
            solution.index < max_index
        ) {
            return
        }
        if (solutions[solution.value.n] === undefined) {
            solutions[solution.value.n] = []
            // if this number has not been found yet
            num_undiscovered_solutions--
            console.log(
                "discovered new solution for " +
                    solution.value.n +
                    " :: " +
                    solution.expression +
                    "  num_undiscovered_solutions=" +
                    num_undiscovered_solutions + " " + I
            )
            I++
            // once we find all the solutions, we don't need to keep searching
            if (short_circuit && num_undiscovered_solutions <= 0) {
                solutions[solution.value.n].push(solution.expression)
                console.log("Found All solutions. The last one was: " + solution.expression)
                return true
            }
        }
        
        solutions[solution.value.n].push(solution.expression)
        
    }
    const year_digits_sorted = Array.from(new Set(year)).sort()
    const [max_index, max_arr] = goedel_encode(
        new Array(year.length).fill(1),
        year,
        year_digits_sorted
    )
    for (let i = 0; i < max_arr.length; i++) {
        max_arr[i] = PRIMES[i] ** (max_arr[i] + 1)
    }
    const used_number_groups = []

    //filter out duplicate numbers
    let concatenated_nums = [
        ...all_digital_orderings(year, year_digits_sorted, max_index),
    ].filter(
        (value, index, self) =>
            index ===
            self.findIndex(
                (t) => t.expr === value.expr && t.index === value.index
            )
    )

    for (let i = 0; i < concatenated_nums.length; i++) {
        let index = concatenated_nums[i].index //int (hashed)
        let expr = concatenated_nums[i].expr //string

        if (used_number_groups[index] === undefined) {
            used_number_groups[index] = []
        }

        if (expr === ".") continue
        if (expr.endsWith(".")) {
            expr = expr.substring(0, expr.length - 1)
        }
        const fract = Fraction(expr)

        used_number_groups[index].push({
            expression: expr,
            value: fract,
            index: index,
            stacked_u_ops: 0,
        })
    }

    const operations = [[], []]
    for (const key in allowed_operations) {
        const operation = DEFAULT_OPERATIONS[key]
        if (operation == undefined) continue
        if (operations[operation.arity - 1] == undefined) {
            operations[operation.arity - 1] = []
        }
        operations[operation.arity - 1].push(operation)
    }

    for (const simple of used_number_groups[used_number_groups.length - 1]) {
        if (add_solution(simple)) return getReturnValue() //short circuit
    }
    const queue = new Queue(used_number_groups.flat())

    const similar_expressions = new Set()

    while (queue.items.length > 0) {
        if (queue.items.length % 1000 === 0) {
            console.log(queue.items.length + " items")
        }
        const curr_expression = queue.dequeue()

        //unary operations

        for (const unary_op of operations[0]) {
            //no double unary minus -(-x) = x
            if (
                unary_op.props.includes(PROPS.UNARY_INVERSE) &&
                curr_expression.expression.startsWith("-")
            ) {
                continue
            }
            if (
                unary_op.props.includes(PROPS.RECIPRICOL) &&
                curr_expression.expression.startsWith("inv")
            ) {
                continue
            }
            const value = unary_op.calculate(curr_expression.value)
            //optimizations (this cuts down the search space)
            if (
                value == null ||
                value.equals(curr_expression.value) ||
                value > MAX_INTERMEDIATE ||
                value < -MAX_INTERMEDIATE ||
                value.d > MAX_DENOM
            ) {
                continue
            }

            const expression = unary_op.symbol(curr_expression.expression)
            const index = curr_expression.index
            const hashed = hash(index, value)
            const next_expression = {
                expression: expression,
                value: value,
                index: index,
                stacked_u_ops: curr_expression.stacked_u_ops + 1,
            }
            if (add_solution(next_expression)) return getReturnValue() //short circuit

            if (
                !similar_expressions.has(hashed) &&
                curr_expression.stacked_u_ops < max_unary_stack - 1
            ) {
                used_number_groups[index].push(next_expression)
                queue.enqueue(next_expression)
                similar_expressions.add(hashed)
            }
        }
        //binary operations

        for (
            let group_idx = 0;
            group_idx < used_number_groups.length;
            group_idx++
        ) {
            const new_idx = group_idx * curr_expression.index
            const group = used_number_groups[group_idx]
            if (group === undefined) {
                continue
            }
            let do_digits_overlap = false
            for (const modulus of max_arr) {
                if (new_idx % modulus === 0) {
                    do_digits_overlap = true
                    break
                }
            }
            if (do_digits_overlap) {
                continue
            }

            for (const second_expression of group) {
                for (const binary_op of operations[1]) {
                    {
                        const value = binary_op.calculate(
                            curr_expression.value,
                            second_expression.value
                        )

                        //optimizations (this cuts down the search space)
                        if (
                            value === null ||
                            value > MAX_INTERMEDIATE ||
                            value < -MAX_INTERMEDIATE ||
                            value.d > MAX_DENOM
                        ) {
                            continue
                        }

                        const expression = binary_op.symbol(
                            curr_expression.expression,
                            second_expression.expression
                        )
                        const hashed = hash(new_idx, value)
                        const next_expression = {
                            expression: expression,
                            value: value,
                            index: new_idx,
                            stacked_u_ops: 0,
                        }
                        if (add_solution(next_expression))
                            return getReturnValue() //short circuit
                        used_number_groups[new_idx].push(next_expression)
                        if (!similar_expressions.has(hashed)) {
                            queue.enqueue(next_expression)
                            similar_expressions.add(hashed)
                        }
                    }
                }
            }
        }
    }
    function getReturnValue() {
        return prettify_solutions(
            solutions,
            max_equations_per_num,
            min_num,
            max_num,
            new Date() - start_time
        )
    }
    return getReturnValue()
}

function* all_digital_orderings(year, year_digits_sorted, max_index) {
    const arr = year + "." //decimal point
    const len = arr.length
    let data = []
    let indexes_used = []
    yield* permutations_until(0)
    function* permutations_until(index) {
        data.length = index
        let data_str = data.join("")
        if (
            indexes_used.length === len &&
            data_str.match(/^(\.|0\.|[1-9]).*$/g)
        ) {
            const idx = goedel_encode(
                [...indexes_used].slice(0, -1),
                year,
                year_digits_sorted
            )[0]
            if (idx <= max_index) {
                yield { expr: data_str, index: idx }
            }
        }

        if (index === len) {
            return
        }
        for (let i = 0; i < len; i++) {
            if (!indexes_used[i]) {
                indexes_used[i] = true
                data[index] = arr[i]
                yield* permutations_until(index + 1)
                indexes_used[i] = false
            }
        }
    }
}

function goedel_encode(used_indexes, year, sorted_year_no_duplicate) {
    let idx = 1
    let map = new Uint32Array(sorted_year_no_duplicate.length)
    for (let i = 0; i < used_indexes.length; i++) {
        const number = sorted_year_no_duplicate.indexOf(year[i])
        idx *= used_indexes[i] ? PRIMES[number] : 1
        map[number] += used_indexes[i]
    }
    return [idx, map]
}

function hash(idx, value) {
    function cantor(a, b) {
        return ((b + b + 1) * (a + b)) / 2 + b
    }
    return cantor(idx, cantor(value.n, value.d)) * value.s
}

function prettify_solutions(
    solutions,
    max_entries_per_line,
    minval,
    maxval,
    ellapsed_ms
) {
    let out = ""
    let found = 0
    const solutions_short = solutions.slice(minval, maxval + 1)
    let count = minval
    for (const solution_list of solutions_short) {
        if (solution_list === undefined) {
            out += `${count} = ???\n`
            count++
            continue
        }
        found++
        const top_entries = [...solution_list]
            .sort(
                (a, b) =>
                    a.includes(".") - b.includes(".") || a.length - b.length
            )
            .slice(0, max_entries_per_line)

        out += `${count} = ` + top_entries.join("\t\t") + "\n"
        count++
    }
    out += `\nFound ${found}/${maxval - minval + 1} solutions.`
    out += `\nEllapsed time: ${(ellapsed_ms / 1000).toFixed(1)} seconds.`
    return out
}

self.addEventListener("message", function (event) {
    // Handle the received message
    let data = event.data
    const solutions = find_all_equations(
        data.yearselect,
        parseInt(data.minselect),
        parseInt(data.maxselect),
        data.plevel,
        data.maxperline,
        data
    )
    // Perform computations using the received data

    // Send a response back to the main thread
    self.postMessage(solutions)
})
