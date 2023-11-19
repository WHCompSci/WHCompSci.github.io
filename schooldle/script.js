// Get the modal and button elements

// Function to open the modal

const modal = document.getElementById("modal");
const openModalBtn = document.getElementById("open-modal-btn");
const closeModalBtn = document.getElementById("modal-close-btn");

const winModal = document.getElementById("win-modal");
const winCloseModalBtn = document.getElementById("win-modal-close-btn");
const numGuessesDisplay = document.getElementById("num-guesses");

const collegeDropDownReal = document.getElementById("guess-dropdown");
const collegeTextInput = document.getElementById("text-input");
const maxSearchResults = 5;
const guessTable = document.getElementById("guess-table");
const guessButton = document.getElementById("guess-button");
const urlOfFile = "collegedata.csv";
const urlOfAnswerFile = "answerkey.csv";
let collegeOfTheDay, collegeInfoOfTheDay; // define it here so we can cheat in the chrome devtools ;)
const getIDfromSchoolName = {};
const guesses = [];
const collegeData = new Map();
const columnNames = [
    "School",
    "State",
    "Control",
    "Location",
    "Acceptance Rate",
    "Size",
    "Latitude",
    "Longitude",
];

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
    fetch(urlOfAnswerFile)
        .then((response) => response.text())
        .then((content) => {
            const answers = content.split("\n").filter((x) => x.length > 1);
            console.log(answers);
            collegeOfTheDay =
                answers[fullDaysSinceEpoch % answers.length].trim();
            collegeInfoOfTheDay = collegeData.get(collegeOfTheDay);
            console.log(collegeInfoOfTheDay);
        });
    for(let i = 0; i < maxSearchResults; i++){
        const option = document.createElement("li");
        option.id = "option"+i
        option.addEventListener("click", () => {
            const currOption = document.getElementById("option"+i)

            collegeTextInput.value = currOption.textContent;
        });
        option.className = "custom-select-option";

        collegeDropDownReal.appendChild(option);
    }
    buildDropDownMenu();
        
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
                const collegeInfo = splitCSVLine(line);
                if (collegeInfo) {
                    const collegeName = collegeInfo[0];
                    collegeData.set(collegeName, collegeInfo);
                }
            });
            setupGame();
        })
        .catch((error) => {
            console.error("Error:", error);
        });
});

function addSchoolGuessRow() {
    
    const selectedSchool = collegeTextInput.value;
    if (selectedSchool === "") return;
    if (!collegeData.has(selectedSchool)) {
        return;
    }
    console.log('Guessing the School: "' + selectedSchool + '"');

    collegeTextInput.value = "";
    if (guesses.length == 0) {
        guessTable.firstChild.display = "block";
    }
    const schoolData = collegeData.get(selectedSchool);

    addTableRow(schoolData);
    guesses.push(selectedSchool);
    console.log(schoolData);
    buildDropDownMenu();
    if (selectedSchool === collegeOfTheDay) {
        //player won
        openModal(winModal);
        numGuessesDisplay.innerHTML =
            "You got the correct answer in <strong>" +
            guesses.length +
            "</strong> guesses.";
    }

}
function addTableRow(data) {
    const tableRow = document.createElement("tr");
    for (let i = 0; i < data.length - 2; i++) {
        const elem = document.createElement("td");
        elem.innerText = data[i];
        console.log(data);
        console.log(collegeInfoOfTheDay + " " + collegeOfTheDay);
        if (data[i] === collegeInfoOfTheDay[i]) {
            elem.style.backgroundColor = "var(--correct)";
        }
        tableRow.appendChild(elem);
    }
    const distTD = document.createElement("td");
    const geod = geodesic.Geodesic.WGS84;
    const params = [
        parseFloat(data[data.length - 1]),
        parseFloat(data[data.length - 2]),
        parseFloat(collegeInfoOfTheDay[collegeInfoOfTheDay.length - 1]),
        parseFloat(collegeInfoOfTheDay[collegeInfoOfTheDay.length - 2]),
    ];

    const measurements = geod.Inverse(...params);
    console.log(measurements);
    const distance = (0.000621371 * measurements.s12).toFixed(1);
    distTD.innerText = distance + " mi";
    tableRow.appendChild(distTD);

    const directionTD = document.createElement("td");
    directionTD.innerHTML = getArrowEmoji(...params);
    directionTD.style.fontFamily = "Noto Emoji Regular";
    tableRow.appendChild(directionTD);
    guessTable.appendChild(tableRow);
     void tableRow.offsetHeight;

     // Add class to apply animation
     tableRow.classList.add("adding-row");

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
    if (!collegeData.has(selectedSchool)) {
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

function getArrowEmoji(lat1, lon1, lat2, lon2) {
    const arrowUp = "⬆️";
    const arrowDown = "⬇️";
    const arrowLeft = "⬅️";
    const arrowRight = "➡️";
    const arrowUpRight = "↗️";
    const arrowUpLeft = "↖️";
    const arrowDownRight = "↘️";
    const arrowDownLeft = "↙️";
    const winningSymbol = "🏆";
    // angle += 90; //little hack for now
    if (lat1 == lat2 && lon1 == lon2) {
        return winningSymbol;
    }
    const angleDeg =
        -(Math.atan2(lon2 - lon1, lat2 - lat1) * 180) / Math.PI + 90;
    const normalizedAngle = ((angleDeg % 360) + 360) % 360; //degree mod 360
    console.log(angleDeg);
    const rotationIndex = Math.round(normalizedAngle / 45) % 8;
    //console.log(normalizedAngle + " " + rotationIndex);
    const rot = ["➡️", "↗️", "⬆️", "↖️", "⬅️", "↙️", "⬇️", "↘️"];
    return rot[rotationIndex]; //"➡️↗️⬆️↖️⬅️↙️⬇️↘️".charAt(rotationIndex);
}

collegeTextInput.addEventListener("keyup", buildDropDownMenu);

function buildDropDownMenu() {
    let query = collegeTextInput.value.toLowerCase();
    if (query.length == 0) {
        query = 'a'
    }
    console.log("q " + query);
    const response = [...collegeData.keys()]
        .map((str) => {
            return {
                name: str,
                searchVal: str.toLowerCase().includes(query),
            };
        })
        .filter((x) => x.searchVal && !guesses.includes(x.name))
        .slice(0, maxSearchResults)
        .map(({ name, _ }) => name);
    console.log(response);

    for (let i = 0; i < maxSearchResults; i++) {
        collegeDropDownReal.children[i].style.display = "block";
        if (i >= response.length) {
            collegeDropDownReal.children[i].style.display = "none";
        }
        collegeDropDownReal.children[i].innerText =
            response[i];
    }
}