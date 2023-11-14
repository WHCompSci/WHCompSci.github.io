const collegeDropDown = document.getElementById("colleges");
const collegeTextInput = document.getElementById("text-input");
const guessTable = document.getElementById("guess-table");
const guessButton = document.getElementById("guess-button");
const urlOfFile = "collegelist.csv";
let collegeOfTheDay;
// option.value = weightClass.weight;
// option.text = weightClass.label;
// weightSelect.appendChild(option);
// collegeDropDown.appendChild()

const collegeData = [];
const columnNames = [
    "Name",
    "ID",
    "State",
    "Control",
    "Acceptance Rate",
    "Total Cost",
    "Total Population",
    "M/F",
];

const answers = [
    130, 512, 312, 498, 101, 397, 532, 977, 682, 324, 402, 824, 43, 261, 793,
    714, 562, 79, 855, 178, 850, 888, 550, 89, 16, 711, 119, 551, 961, 67, 594,
    514, 652, 919, 142, 423, 237, 898, 967, 191, 677, 895, 503, 244, 724, 76,
    617, 566, 839, 344, 282, 627, 635, 318, 505, 153, 211, 513, 979, 198, 351,
    933, 934, 809, 82, 920, 944, 264, 768, 115, 678, 284, 900, 466, 563, 906,
    792, 49, 819, 287, 686, 523, 796, 159, 913, 909, 721, 233, 455, 179, 813,
    100, 146, 937, 904, 905, 882, 817, 63, 184, 123, 688, 829, 239, 863, 68,
    742, 585, 30, 804, 171, 806, 263, 606, 740, 494, 381, 822, 147, 983, 578,
    745, 53,
]; //college ids are 1-indexed based on alphebetical order

function setupGame() {
    const now = new Date();
    const fullDaysSinceEpoch = Math.floor(now / 8.64e7);
    const todaysCollegeID = fullDaysSinceEpoch % answers.length;
    collegeOfTheDay = collegeData[todaysCollegeID - 1][0];
    console.log(todaysCollegeID);
    console.log(collegeOfTheDay);
}

// Wait for the DOM to load
document.addEventListener("DOMContentLoaded", () => {
    // Fetch the file
    fetch("collegedata.csv")
        .then((response) => response.text())
        .then((content) => {
            const lines = content.split("\n");
            lines.forEach((line) => {
                line = line.trim();
                const firstComma = line.indexOf(",");
                const firstWord = line.substring(0, firstComma);
                if (firstWord) {
                    collegeData.push(splitCSVLine(line));
                    const option = document.createElement("option");
                    option.text = firstWord;
                    option.value = firstWord;
                    collegeDropDown.appendChild(option);
                }
            });
            console.log(collegeData);
            setupGame();
        })
        .catch((error) => {
            console.error("Error:", error);
        });
        
});
//function to handle the college guess.
guessButton.addEventListener("click", () => {
    const selectedSchool = collegeTextInput.value;
    if (selectedSchool === "") return;
    console.log('Guessing the School: "' + selectedSchool + '"');
});
//Function to prevent User from entering invalid college names in the text box.
collegeTextInput.addEventListener("blur", (event) => {
    console.log("input text");
    const enteredValue = event.target.value;
    // Check if the entered value matches any of the options
    if (!collegeData.includes(enteredValue)) {
        // Clear the input field if the entered value is not a valid option
        collegeTextInput.value = "";
    }
});

function splitCSVLine(csvLine) {
    const res = [];
    let lastCharEnd = 0;
    let numQuotations = 0;

    for (let charIndex = 0; charIndex < csvLine.length; charIndex++) {
        const char = csvLine[charIndex];
        if (char == '"') {
            numQuotations++;
            continue;
        }
        if (char == "," && numQuotations % 2 == 0) {
            let nextVal = csvLine.substring(lastCharEnd, charIndex);
            if (nextVal.startsWith('"') && nextVal.endsWith('"')) {
                nextVal = nextVal.slice(1, -1);
            }
            res.push(nextVal);
            lastCharEnd = charIndex + 1;
        }
    }
    return res;
}

