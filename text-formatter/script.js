let boundsArr = null;

function handleUpload(event) {
    const file = event.target.files[0];

    const image = new Image();
    image.onload = function () {
        // The image has been loaded and is ready to use
        console.log(image);
        const ROWS = 100;
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
    formattedWidth = Math.ceil(width) + "px"; 
 
    document.querySelector('.output').textContent 
                = formattedWidth; 
} 


function formatText(text) {
    if (boundsArr === null) {
        return text;
    }

    //text justification algorithm
    const newText = [];
    for (let lineNum = 0; lineNum < boundsArr.length; lineNum++) {
        const lineBoundaries = boundsArr[lineNum].includedRanges;
        const line = ""
        if(lineBoundaries.length === 0) {
            newText.push('\n');
            continue;
        }

        const leftMargin = currPixelRow.includedRanges[0].start
        const outputWidth = pictureOutput.style.width;
        //adding left margin
        while(getTextWidth(line) < leftMargin * outputWidth) {
            line += " ";
        }
        //adding text
        while(getTextWidth(line) < leftMargin * outputWidth) {
            line += " ";
        }




        
            //if we're on a line
            
        
        newText.push(line);

    }

    return newText.join('');

}
