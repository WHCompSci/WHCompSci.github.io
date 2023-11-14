const collegeDropDown = document.getElementById("colleges");
const collegeTextInput = document.getElementById("text-input");
const guessTable = document.getElementById("guess-table");
const guessButton = document.getElementById("guess-button");
const urlOfFile = "collegedata.csv";
let collegeOfTheDay; // define it here so we can cheat in the chrome devtools ;)

const collegeData = [];
const collegeNames = [];
const columnNames = [
    "Name",
    "State",
    "Control",
    "Acceptance Rate",
    "Total Cost",
    "Total Population",
    "M/F",
];

const answers = [
    129, 511, 311, 497, 100, 396, 531, 976, 681, 323, 401, 823, 42, 260, 792, 713, 561, 78, 854, 177, 849, 887, 549, 88, 15, 710, 118, 550, 960, 66, 593, 513, 651, 918, 141, 422, 236, 897, 966, 190, 676, 894, 502, 243, 723, 75, 616, 565, 838, 343, 281, 626, 634, 317, 504, 152, 210, 512, 978, 197, 350, 932, 933, 808, 81, 919, 943, 263, 767, 114, 677, 283, 899, 465, 562, 905, 791, 48, 818, 286, 685, 522, 795, 158, 912, 908, 720, 232, 454, 178, 812, 99, 145, 936, 903, 904, 881, 816, 62, 183, 122, 687, 828, 238, 862, 67, 741, 584, 29, 803, 170, 805, 262, 605, 739, 493, 380, 821, 146, 982, 577, 744, 52
]; //college ids are 0-indexed based on alphebetical order

function setupGame() {
    const now = new Date();
    const fullDaysSinceEpoch = Math.floor(now / 8.64e7);
    const todaysCollegeIndex = fullDaysSinceEpoch % answers.length;
    collegeOfTheDay = collegeData[todaysCollegeIndex][0];
    console.log(todaysCollegeIndex);
    console.log(collegeOfTheDay);
}

// Wait for the DOM to load
document.addEventListener("DOMContentLoaded", () => {
    // Fetch the file
    fetch(urlOfFile)
        .then((response) => response.text())
        .then((content) => {
            const lines = content.split("\n");
            lines.forEach((line) => {
                line = line.trim();
                const firstComma = line.indexOf(",");
                const firstWord = line.substring(0, firstComma);
                if (firstWord) {
                    collegeData.push(splitCSVLine(line));
                    collegeNames.push(firstWord);
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

function addSchoolGuessRow(selectedSchool) {
    const selectedSchoolID = collegeNames.indexOf(selectedSchool);
    const schoolData = collegeData[selectedSchoolID];
    const tableRow = document.createElement("tr");
    for(let i = 0; i < schoolData.length; i++) {
        const elem = document.createElement("td");
        elem.innerText = schoolData[i];
        tableRow.appendChild(elem);
    }
    
    guessTable.appendChild(tableRow);
    console.log(schoolData);

}


//function to handle the college guess.
guessButton.addEventListener("click", () => {
    const selectedSchool = collegeTextInput.value;
    if (selectedSchool === "") return;
    if (!collegeNames.includes(selectedSchool)) {
        return;
    }
    console.log('Guessing the School: "' + selectedSchool + '"');

    collegeTextInput.value = "";
    addSchoolGuessRow(selectedSchool);
});
//Function to prevent User from entering invalid college names in the text box.
collegeTextInput.addEventListener("blur", (event) => {
    console.log("input text");
    const selectedSchool = event.target.value;
    // Check if the entered value matches any of the options
    if (!collegeNames.includes(selectedSchool)) {
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

