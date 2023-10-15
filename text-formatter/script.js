function handleUpload(event) {
    const file = event.target.files[0];

    const image = new Image();
    image.onload = function () {
        // The image has been loaded and is ready to use
        console.log(image);
        const ROWS = 20
        const COLS = 20;
        const x = get_bounds_arr(image, ROWS, COLS);
        let res=""
        console.log(x)
        for (let row = 0; row < ROWS; row++) {
            for (let range of x[row].includedRanges) {
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
