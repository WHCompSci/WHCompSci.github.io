let boundsArr = null;

function handleUpload(event) {
    const file = event.target.files[0];

    const image = new Image();
    image.onload = function () {
        // The image has been loaded and is ready to use
        console.log(image);
        const ROWS = Math.round(this.height / 12);
        console.log(ROWS)
        imagePreview.innerHTML = `<img src="${image.src}" alt="Uploaded Image">`;
        boundsArr = get_bounds_arr(image);
        let res=""
        for (let row = 0; row < ROWS; row++) {
            for (let range of boundsArr[row].includedRanges) {
                res += `(${range.start * ROWS}, ${ROWS - row}), `;
                res += `(${range.end * ROWS}, ${ROWS - row}), `;
            }
        }
    };
    image.src = URL.createObjectURL(file);
    
}

const uploadInput = document.getElementById("image-upload");
const imagePreview = document.getElementById("image-preview");
uploadInput.addEventListener("change", handleUpload);



const textInput = document.getElementById("text-input");
const pictureOutput = document.getElementById("picture-output");

function changeText() {
    const text = textInput.value;
    pictureOutput.innerHTML = formatText(text);

}
textInput.addEventListener("input", changeText);




function getTextWidth(inputText) { 
    const font = getComputedStyle(pictureOutput).font;
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
                continue;
            }
            line.push(" ");
        }

            //if we're on a line
            
        line.push('<br>')
        newText.push(...line);

    }
    console.log(newText)
    console.log(newText.join(''))
    return newText.join('');

}

const CHAR_ASPECT_RATIOS = []
function populateCharSizeArray(fontSize, lines) {
    // run when font is changed, output does not change when fontsize is changed
    for (let i = 0; i < 128; i++) {
        const currChar = String.fromCharCode(i);
        CHAR_ASPECT_RATIOS[i] = getTextWidth(currChar)/(fontSize * lines);
    }
}