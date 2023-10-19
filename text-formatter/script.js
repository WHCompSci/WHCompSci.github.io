let boundsArr = null;

function handleUpload(event) {
    const file = event.target.files[0];

    const image = new Image();
    image.onload = function () {
        // The image has been loaded and is ready to use
        console.log(image);
        const ROWS = 15;
        boundsArr = get_bounds_arr(image, ROWS);
        let res=""
        console.log(boundsArr)
        for (let row = 0; row < ROWS; row++) {
            for (let range of boundsArr[row].includedRanges) {
                res += `(${range.start * ROWS}, ${ROWS - row}), `;
                res += `(${range.end * ROWS}, ${ROWS - row}), `;
            }
        }
        console.log(res)
    };
    image.src = URL.createObjectURL(file);
    
}

const uploadInput = document.getElementById("fileInput");
uploadInput.addEventListener("change", handleUpload);



const textInput = document.getElementById("textinput");
const pictureOutput = document.getElementById("pictureoutput");

function changeText() {
    const text = textInput.value;
    pictureOutput.innerText = formatText(text);

}
textInput.addEventListener("input", changeText);

function getTextWidth(inputText) { 
    const font = document.getElementById("pictureoutput").style.font;
 
    canvas = document.createElement("canvas"); 
    context = canvas.getContext("2d"); 
    context.font = font; 
    width = context.measureText(inputText).width; 
    return Math.ceil(width);
} 


function formatText(text) {
    if (boundsArr === null) {
        return text;
    }

    //text justification algorithm
    const newText = [];
    let index = 0;
    for (let lineNum = 0; lineNum < boundsArr.length; lineNum++) {
        const lineBoundaries = boundsArr[lineNum];
        let line = []
        if(lineBoundaries.includedRanges.length === 0) {
            newText.push('\n');
            continue;
        }

        const outputWidth = pictureOutput.offsetWidth;
        console.log(outputWidth)
        //adding left margin
        while(getTextWidth(line) < outputWidth) {
            if(lineBoundaries.inBounds(getTextWidth(line) / outputWidth)) {
                line.push(text[index]);
                index ++;
                continue
            }
            line.push("_");
        }

            //if we're on a line
            
        line.push('\n')
        newText.push(...line);

    }
    console.log(newText.join(''))
    return newText.join('');

}

console.log(getTextWidth("a"))
console.log(getTextWidth("aa"))
console.log(getTextWidth("WWW"))
console.log(pictureOutput.offsetWidth)