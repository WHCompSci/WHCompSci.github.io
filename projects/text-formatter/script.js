let boundsArr = null;

function handleUpload(event) {
    const file = event.target.files[0];

    const image = new Image();
    image.onload = function () {
        // The image has been loaded and is ready to use
        console.log(image);
        // const ROWS = 100;
        imagePreview.innerHTML = `<img src="${image.src}" alt="Uploaded Image">`;
        boundsArr = get_bounds_arr(image, fontSize, lineHeight);
        // let res = "";
        // for (let row = 0; row < ROWS; row++) {
        //     for (let range of boundsArr[row].includedRanges) {
        //         res += `(${range.start * ROWS}, ${ROWS - row}), `;
        //         res += `(${range.end * ROWS}, ${ROWS - row}), `;
        //     }
        // }
        changeText();
    };
    image.src = URL.createObjectURL(file);
}
const repeatText = document.getElementById("repeat-text");

const uploadInput = document.getElementById("image-upload");
const imagePreview = document.getElementById("image-preview");

const textInput = document.getElementById("text-input");
const pictureOutput = document.getElementById("picture-output");

function changeText() {
    console.log("changing text!");
    let text = textInput.value.replaceAll('\n', '');
    pictureOutput.innerHTML = formatText(text);
}
uploadInput.addEventListener("change", handleUpload);
textInput.addEventListener("input", changeText);
repeatText.addEventListener("change", changeText);

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
            newText.push("\n");
            continue;
        }

        const outputWidth = pictureOutput.offsetWidth;
        let lineWidthPX = 0;
        //adding left margin
        while (lineWidthPX < outputWidth) {
            let asciiCode = text.charCodeAt(index);

            if (lineBoundaries.inBounds(lineWidthPX / outputWidth)) {
                lineWidthPX +=
                    CHAR_ASPECT_RATIOS[asciiCode] * (fontSize + lineHeight);
                line.push(text[index]);
                if (repeatText.checked) {
                    index = (index + 1) % text.length;
                } else {
                    index++;
                }

                continue;
            }
            lineWidthPX += CHAR_ASPECT_RATIOS[32] * (fontSize + lineHeight);
            line.push(" ");
        }

        //if we're on a line

        line.push("\n");
        newText.push(...line);
    }
    return newText.join("");
}

const CHAR_ASPECT_RATIOS = [];
const fontSelector = document.getElementById("font-selection");

//fontSelector.addEventListener("change", populateCharSizeArray())

function getStyle(el, styleProp) {
    if (el.currentStyle) var y = el.currentStyle[styleProp];
    else if (window.getComputedStyle)
        var y = document.defaultView
            .getComputedStyle(el, null)
            .getPropertyValue(styleProp);
    return y;
}

let fontSize, lineHeight;
updateFontRowHeightPX();
function updateFontRowHeightPX() {
    // impure function, ugly :(
    // should be called when font height or line spacing changes
        fontSize = parseInt(
            getStyle(pictureOutput, "font-size").match(/\d+/)[0]
        );
        lineHeight = parseInt(
            getStyle(pictureOutput, "line-height").match(/\d+/)[0]
        );
}


function populateCharSizeArray() {
    console.log("populating...");
    // run when font is changed, output does not change when fontsize is changed

    const font = getComputedStyle(pictureOutput).font;
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    context.font = font;

    for (let i = 0; i < 128; i++) {
        const currChar = String.fromCharCode(i);
        const currTW = context.measureText(currChar).width;
        const twoCurrTW = context.measureText(currChar+currChar).width;
        CHAR_ASPECT_RATIOS[i] = (twoCurrTW - currTW) / (fontSize + lineHeight);
    }
}
populateCharSizeArray();
