function get_bounds_arr(image) {
    // TODO probably a good idea to resize image to say 100x100px to limit computation
    const boundsArr = [];
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = image.width;
    canvas.height = image.height;
    ctx.drawImage(image, 0, 0);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const { width, height, data } = imageData;

    const alphaValues = Array.from(imageData.data).filter(
        (_, index) => (index + 1) % 4 === 0
    ); // Filter alpha values
    console.log(alphaValues)
    for (let y = 0; y < height; y++) {
        const rowBounds = { start: null, end: null };

        for (let x = 0; x < width; x++) {
            const pixelIndex = (y * width + x) * 4; // Assuming RGBA image data

            // Check if the pixel is non-transparent (adjust the condition based on your specific image format)
            const isNonTransparent = data[pixelIndex + 3] !== 0;

            if (isNonTransparent) {
                if (rowBounds.start === null) {
                    rowBounds.start = x;
                }
                rowBounds.end = x;
            }
        }

        boundsArr.push(rowBounds);
    }

    return boundsArr;
}