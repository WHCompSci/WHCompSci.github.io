let boundsArr = null;

function handleUpload(event) {
    const file = event.target.files[0];

    const image = new Image();
    image.onload = function () {
        // The image has been loaded and is ready to use
        console.log(image);
        const ROWS = 100;
        console.log(ROWS)
        imagePreview.innerHTML = `<img src="${image.src}" alt="Uploaded Image">`;
        boundsArr = get_bounds_arr(image, ROWS);
        let res = ""
        for (let row = 0; row < ROWS; row++) {
            for (let range of boundsArr[row].includedRanges) {
                res += `(${range.start * ROWS}, ${ROWS - row}), `;
                res += `(${range.end * ROWS}, ${ROWS - row}), `;
            }
        }
    };
    image.src = URL.createObjectURL(file);

}
const repeatText = document.getElementById('repeat-text');

const uploadInput = document.getElementById("image-upload");
const imagePreview = document.getElementById("image-preview");
uploadInput.addEventListener("change", handleUpload);



const textInput = document.getElementById("text-input");
const pictureOutput = document.getElementById("picture-output");

function* textGenerator(text) {
    //add repeating logic
}

function changeText() {
    let text = textInput.value;
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

        let line = [];

        if (lineBoundaries.includedRanges.length === 0) {
            newText.push('\n');
            continue;
        }

        const outputWidth = pictureOutput.offsetWidth;
        let lineWidthPX = 0;
        //adding left margin
        while (lineWidthPX < outputWidth) {
            let asciiCode = text.charCodeAt(index);

            if (lineBoundaries.inBounds(lineWidthPX / outputWidth)) {
                lineWidthPX += CHAR_ASPECT_RATIOS[asciiCode] * (fontSize * lineHeight);
                line.push(text[index]);
                if (repeatText.checked) {
                    index = (index + 1) % text.length;
                }
                else {
                    index++;
                }

                continue;
            }
            lineWidthPX += CHAR_ASPECT_RATIOS[32] * (fontSize * lineHeight);
            line.push(" ");

        }

        //if we're on a line

        line.push('\n')
        newText.push(...line);

    }
    return newText.join('');

}

const CHAR_ASPECT_RATIOS = []
const fontSelector = document.getElementById("font-selection");

//fontSelector.addEventListener("change", populateCharSizeArray())


function getStyle(el, styleProp) {

    if (el.currentStyle)
        var y = el.currentStyle[styleProp];
    else if (window.getComputedStyle)
        var y = document.defaultView.getComputedStyle(el, null).getPropertyValue(styleProp);
    return y;
}

let fontSize, lineHeight;

function populateCharSizeArray() {
    console.log("populating...")
    // run when font is changed, output does not change when fontsize is changed
    fontSize = parseInt(getStyle(pictureOutput, "font-size").match(/\d+/)[0]);
    lineHeight = parseInt(getStyle(pictureOutput, "line-height").match(/\d+/)[0]);
    for (let i = 0; i < 128; i++) {
        const currChar = String.fromCharCode(i);
        const currTW = getTextWidth(currChar);
        const twoCurrTW = getTextWidth(currChar + currChar);
        console.log("cTW=" + currTW + " fs=" + fontSize + " lh=" + lineHeight)
        CHAR_ASPECT_RATIOS[i] = (twoCurrTW - currTW) / (fontSize * lineHeight);
    }
}
populateCharSizeArray()
console.log(CHAR_ASPECT_RATIOS)



console.log(repeatText.checked)


