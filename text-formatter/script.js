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
    pictureOutput.innerHTML = formatText(text);

}
textInput.addEventListener("input", changeText);


function getFontFromComputedStyle (computedStyle) {
    let font = computedStyle.font;
    // Firefox returns the empty string for .font, so create the .font property manually
    if (font === '') {
      // Firefox uses percentages for font-stretch, but Canvas does not accept percentages
      // so convert to keywords, as listed at:
      //   https://developer.mozilla.org/en-US/docs/Web/CSS/font-stretch
      let fontStretchLookupTable = {
        '50%': 'ultra-condensed',
        '62.5%': 'extra-condensed',
        '75%': 'condensed',
        '87.5%': 'semi-condensed',
        '100%': 'normal',
        '112.5%': 'semi-expanded',
        '125%': 'expanded',
        '150%': 'extra-expanded',
        '200%': 'ultra-expanded'
      };
      // If the retrieved font-stretch percentage isn't found in the lookup table, use
      // 'normal' as a last resort.
      let fontStretch = fontStretchLookupTable.hasOwnProperty(computedStyle.fontStretch)
        ? fontStretchLookupTable[computedStyle.fontStretch]
        : 'normal';
      font = computedStyle.fontStyle
        + ' ' + computedStyle.fontVariant
        + ' ' + computedStyle.fontWeight
        + ' ' + fontStretch
        + ' ' + computedStyle.fontSize
        + '/' + computedStyle.lineHeight
        + ' ' + computedStyle.fontFamily;
    }
    return font;
  }


function getTextWidth(inputText) { 
    const output = document.getElementById("pictureoutput");
    const font = getComputedStyle(output).font;
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
            line.push("&nbsp;");
        }

            //if we're on a line
            
        line.push('<br>')
        newText.push(...line);

    }
    console.log(newText)
    console.log(newText.join(''))
    return newText.join('');

}

console.log(getTextWidth("a"))
console.log(getTextWidth("b"))
console.log(getTextWidth("W"))
console.log(getTextWidth("|"))
console.log(getTextWidth("_"))
const out = document.getElementById("pictureoutput");
console.log(pictureOutput.offsetWidth)