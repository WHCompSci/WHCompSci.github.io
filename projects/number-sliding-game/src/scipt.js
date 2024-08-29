window.onload = () => {
    let canvasSizePX = Math.min(window.innerHeight, window.innerWidth) * 0.7


    function createBoard(size) {
        const board = []
        for (let y = 0; y < size; y++) {
            board.push([])
            for (let x = 0; x < size; x++) {
                board[y].push(y * size + x + 1)
            }
        }
        board[size - 1][size - 1] = ''
        return board

    }

    function drawBoard(ctx, size, canvasSizePX, board) {
        
        const tileSize = canvasSizePX / size
        for (let x = 0; x < size; x++) {
            for (let y = 0; y < size; y++) {
                

                // ctx.fillStyle = '#84bd6b' //green
                // const margin = 10
                // ctx.fillRect(x * tileSize, y * tileSize, tileSize - margin, tileSize - margin)
                // ctx.fillStyle = 'white'
                // const fontRatio = 0.5
                // const fontSize = tileSize * fontRatio
                // ctx.font = `${fontSize}px Inter`
                // //draw the number, centered. Take into account the font size and the width of the digit(s)
                // const number = board[y][x]
                // const numberWidth = ctx.measureText(number).width
                // const numberHeight = fontSize * 3 / 4
                // const numberX = x * tileSize + (tileSize - numberWidth - margin) / 2
                // const numberY = y * tileSize + (tileSize + numberHeight - margin) / 2
                // ctx.fillText(number, numberX, numberY)

                const padding = 5
                const imgX = (board[y][x] - 1) % size
                const imgY = Math.floor((board[y][x] - 1) / size)

                if (board[y][x] === '') {
                    ctx.fillStyle = '#3c3c3c'
                    ctx.fillRect(x * tileSize - padding, y * tileSize - padding, tileSize + padding * 2, tileSize + padding * 2)
                    continue
                }
                    

                
                const IS = 70
                ctx.drawImage(image, imgX * IS, imgY * IS, IS, IS, x * tileSize, y * tileSize, tileSize * 0.9, tileSize * 0.9)
            }
        }
    }

    const canvas = document.getElementById('game')
    const image = document.getElementById('img')

    canvas.width = canvasSizePX
    canvas.height = canvasSizePX
    image.width = canvasSizePX
    image.height = canvasSizePX
    console.log(canvas, image)
    const ctx = canvas.getContext('2d')
    const size = 4
    const board = createBoard(size)

    drawBoard(ctx, size, canvasSizePX, board)


    window.addEventListener("resize", () => {
        canvasSizePX = Math.min(window.innerHeight, window.innerWidth) * 0.7
        canvas.width = canvasSizePX
        canvas.height = canvasSizePX
        image.height = canvasSizePX
        image.width = canvasSizePX
        console.log(canvas, image)
        drawBoard(ctx, size, canvasSizePX, board)
    })
    document.addEventListener("click", (ev) => {
        const x = Math.floor(ev.offsetX / (canvasSizePX / size))
        const y = Math.floor(ev.offsetY / (canvasSizePX / size))
        console.log(x, y)
        if(board[y][x] === ''){
            return
        }
        if(y > 0 && board[y-1][x] === ''){
            board[y-1][x] = board[y][x]
            board[y][x] = ''
        }
        else if(y < size - 1 && board[y+1][x] === ''){
            board[y+1][x] = board[y][x]
            board[y][x] = ''
        }
        else if(x > 0 && board[y][x-1] === ''){
            board[y][x-1] = board[y][x]
            board[y][x] = ''
        }
        else if(x < size - 1 && board[y][x+1] === ''){
            board[y][x+1] = board[y][x]
            board[y][x] = ''
        }
        drawBoard(ctx, size, canvasSizePX, board)
        console.log(board)

    })
 }