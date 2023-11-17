// Get the modal and button elements


// Function to open the modal


const modal = document.getElementById("modal");
const openModalBtn = document.getElementById("open-modal-btn");
const closeModalBtn = document.getElementById("modal-close-btn");

const winModal = document.getElementById("win-modal");
const winCloseModalBtn = document.getElementById("win-modal-close-btn");
const numGuessesDisplay = document.getElementById("num-guesses");

const collegeDropDown = document.getElementById("colleges");
const collegeTextInput = document.getElementById("text-input");
const guessTable = document.getElementById("guess-table");
const guessButton = document.getElementById("guess-button");
const urlOfFile = "collegedata.csv";
let collegeOfTheDay, collegeIDOfTheDay, collegeInfoOfTheDay; // define it here so we can cheat in the chrome devtools ;)
const getIDfromSchoolName = {};
const guesses = [];
const collegeData = [];
const collegeNames = [];
const columnNames = [
    "School",
    "Region",
    "State",
    "Public/Private",
    "Acceptance Rate",
    "Total Enrollment",
    "Total Cost",
];

const answers = [
    37, 293, 162, 269, 109, 46, 78, 77, 134, 29, 117, 41, 275, 5, 128, 280, 153,
    127, 283, 248, 122, 9, 298, 193, 28, 223, 276, 129, 36, 42, 296, 201, 165,
    189, 13, 141, 12, 208, 124, 86, 51, 230, 121, 285, 186, 278, 99, 249, 179,
    105, 279, 1, 130, 148, 173, 143, 155, 218, 252, 111, 79, 239, 181, 72, 17,
    55, 20, 52, 149, 164, 40, 273, 202, 56, 272, 225, 157, 228, 49, 57, 286,
    211, 266, 195, 102, 188, 107, 140, 297, 6, 116, 175, 307, 232, 106, 227,
    284, 47, 220, 172, 244, 145, 226, 274, 60, 64, 229, 233, 183, 270, 115, 136,
    167, 177, 304, 67, 126, 309, 89, 294, 258, 96, 66, 289, 38, 159, 277, 176,
    74, 291, 217, 144, 231, 16, 214, 58, 210, 184, 250, 54, 150, 90, 125, 118,
    243, 65, 10, 192, 262, 18, 75,
]; //college ids are 0-indexed based on alphebetical order

function openModal(modalElement) {
    modalElement.style.display = "block";
}

function closeModal(modalElement) {
    modalElement.style.display = "none";

}

openModalBtn.addEventListener("click", () => openModal(modal));
closeModalBtn.addEventListener("click", () => closeModal(modal));


winCloseModalBtn.addEventListener("click", () => closeModal(winModal));

function setupGame() {
    const now = new Date();
    const fullDaysSinceEpoch = Math.floor(now / 8.64e7);
    collegeIDOfTheDay = answers[fullDaysSinceEpoch % answers.length];

    collegeInfoOfTheDay = collegeData[collegeIDOfTheDay];
    collegeOfTheDay = collegeInfoOfTheDay[0];
    console.log(collegeIDOfTheDay);
    console.log(collegeInfoOfTheDay);
}

// Wait for the DOM to load
document.addEventListener("DOMContentLoaded", () => {
    // Fetch the file
    fetch(urlOfFile)
        .then((response) => response.text())
        .then((content) => {
            const lines = content.split("\n");
            lines.forEach((line, id) => {
                line = line.trim();
                const collegeInfo = splitCSVLine(line);
                if (collegeInfo) {
                    const collegeName = collegeInfo[0];
                    collegeData.push(collegeInfo);
                    getIDfromSchoolName[collegeName] = id;
                    collegeNames.push(collegeName);
                    const option = document.createElement("option");
                    option.text = collegeName;
                    option.value = collegeName;
                    collegeDropDown.appendChild(option);
                }
            });
            console.log(getIDfromSchoolName);
            setupGame();
        })
        .catch((error) => {
            console.error("Error:", error);
        });
});

function addSchoolGuessRow() {
    const selectedSchool = collegeTextInput.value;
    if (selectedSchool === "") return;
    if (!collegeNames.includes(selectedSchool)) {
        return;
    }
    console.log('Guessing the School: "' + selectedSchool + '"');


    collegeTextInput.value = "";
    if (guesses.length == 0) {
        addTableRow(columnNames);
    }
    const selectedSchoolID = getIDfromSchoolName[selectedSchool];
    
    const schoolData = collegeData[selectedSchoolID];

    addTableRow(schoolData);
    guesses.push(selectedSchoolID);
    console.log(schoolData);

    if (selectedSchoolID === collegeIDOfTheDay) { //player won
        openModal(winModal);
        numGuessesDisplay.innerHTML = "You got the correct answer in <strong>"+guesses.length+"</strong> guesses.";

    }
}
function addTableRow(data) {
    const tableRow = document.createElement("tr");
    for (let i = 0; i < data.length; i++) {
        const elem = document.createElement("td");
        elem.innerText = data[i];
        tableRow.appendChild(elem);
    }

    guessTable.appendChild(tableRow);
}

//function to handle the college guess.
guessButton.addEventListener("click", addSchoolGuessRow);
document.addEventListener("keypress", (ke) => {
    if (ke.key === "Enter") {
        addSchoolGuessRow();
    }
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
    csvLine += ",";
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
