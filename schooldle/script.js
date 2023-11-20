// Get the modal and button elements

// Function to open the modal

const modal = document.getElementById("modal");
const openModalBtn = document.getElementById("open-modal-btn");
const closeModalBtn = document.getElementById("modal-close-btn");

const winModal = document.getElementById("win-modal");
const winCloseModalBtn = document.getElementById("win-modal-close-btn");
const numGuessesDisplay = document.getElementById("num-guesses");

const newAnswerEveryXhours = 5;
const collegeDropDownReal = document.getElementById("guess-dropdown");
const showDropDownButton = document.getElementById("dropdown-button");
const collegeTextInput = document.getElementById("text-input");
const maxSearchResults = 1000;
const guessTable = document.getElementById("guess-table");
const guessButton = document.getElementById("guess-button");
const urlOfFile = "collegedata.csv";
const urlOfAnswerFile = "answerkey.csv";
let collegeOfTheDay, collegeInfoOfTheDay; // define it here so we can cheat in the chrome devtools ;)
const getIDfromSchoolName = {};
const guesses = [];
const collegeData = new Map();


function openModal(modalElement) {
    modalElement.style.display = "block";
}

function closeModal(modalElement) {
    modalElement.style.display = "none";
}

function openDropdown() {
    console.log("opening dropdown")
    collegeDropDownReal.style.display = "block";
    collegeTextInput.style.borderRadius = "5px 5px 0 0";
}
function closeDropdown() {
    collegeDropDownReal.style.display = "none";
    collegeTextInput.style.borderRadius = "5px";
}

let hasTyped = false;
showDropDownButton.addEventListener("click", () => collegeDropDownReal.style.display == "block"? closeDropdown() : openDropdown());
collegeTextInput.addEventListener("keypress", () => {
    if (!hasTyped) {
        openDropdown();
    }
    hasTyped = true;
})
openModalBtn.addEventListener("click", () => openModal(modal));
closeModalBtn.addEventListener("click", () => closeModal(modal));

winCloseModalBtn.addEventListener("click", () => closeModal(winModal));
function setupGame() {
    const now = new Date();
    const fullDaysSinceEpoch = Math.floor(
        ((now / 8.64e7) * 24) / newAnswerEveryXhours
    );

    fetch(urlOfAnswerFile)
        .then((response) => response.text())
        .then((content) => {
            const answers = content.split("\n").filter((x) => x.length > 1);
            collegeOfTheDay =
                answers[fullDaysSinceEpoch % answers.length].trim();
            collegeInfoOfTheDay = collegeData.get(collegeOfTheDay);
            console.log(collegeOfTheDay);

        });
    for (let i = 0; i < maxSearchResults; i++) {
        const option = document.createElement("li");
        const img = document.createElement("img");
        const text = document.createElement("span");
        option.id = "option" + i;
        option.appendChild(img)
        option.appendChild(text)
        option.addEventListener("click", () => {
            const currOption = document.getElementById("option" + i);

            collegeTextInput.value = currOption.lastChild.textContent;
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
    const selectedSchool = collegeTextInput.value.split(",")[0];
    if (selectedSchool === "") return;
    if (!collegeData.has(selectedSchool)) {
        return;
    }

    collegeTextInput.value = "";
    if (guesses.length == 0) {
        guessTable.firstChild.display = "block";
    }
    const schoolData = collegeData.get(selectedSchool);

    addTableRow(schoolData);
    guesses.push(selectedSchool);
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
    for (let i = 0; i < data.length - 3; i++) {
        const elem = document.createElement("td");
        elem.innerText = data[i];
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
    const distance = (0.000621371 * measurements.s12).toFixed(1);
    distTD.innerText = distance + " mi";
    
    tableRow.appendChild(distTD);

    const directionTD = document.createElement("td");
    directionTD.innerHTML = getArrowEmoji(...params);
    directionTD.style.fontFamily = "Noto Emoji Regular";
    if (distance == 0) {
        distTD.style.backgroundColor = "var(--correct)";
        directionTD.style.backgroundColor = "var(--correct)";
    }
    tableRow.appendChild(directionTD);
    guessTable.appendChild(tableRow);
    void tableRow.offsetHeight;

    // Add class to apply animation
    tableRow.classList.add("adding-row");
}

//function to handle the college guess.
guessButton.addEventListener("click", addSchoolGuessRow);

document.addEventListener("keydown", (ke) => {
    if (ke.key === "Enter") {
        addSchoolGuessRow();
    }
});
//Function to prevent User from entering invalid college names in the text box.
// collegeTextInput.addEventListener("blur", (event) => {
//     console.log("input text");
//     const selectedSchool = event.target.value;
//     // Check if the entered value matches any of the options
//     if (!collegeData.has(selectedSchool)) {
//         // Clear the input field if the entered value is not a valid option
//         collegeTextInput.value = "";
//     }
// });

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
    const rotationIndex = Math.round(normalizedAngle / 45) % 8;
    const rot = ["➡️", "↗️", "⬆️", "↖️", "⬅️", "↙️", "⬇️", "↘️"];
    return rot[rotationIndex]; //"➡️↗️⬆️↖️⬅️↙️⬇️↘️".charAt(rotationIndex);
}

collegeTextInput.addEventListener("keyup", buildDropDownMenu);

function buildDropDownMenu() {
    let query = collegeTextInput.value.toLowerCase();
    let isquerry = true;
    if (query.length == 0) {
        isquerry = false;
        query = "a";
    }
    const response = [...collegeData.entries()]
        .map(([name, data]) => {
            return {
                name: name,
                display: name + ", " + data[1],
                searchVal: (name + ", " + data[1])
                    .toLowerCase()
                    .includes(query),
            };
        })
        .filter((x) => x.searchVal && !guesses.includes(x.name))
        .slice(0, maxSearchResults);
    console.log(response)
    for (let i = 0; i < maxSearchResults; i++) {
        collegeDropDownReal.children[i].style.display = "flex";
        if (i >= response.length) {
            collegeDropDownReal.children[i].style.display = "none";
            continue
        }
        const text = response[i].display
        collegeDropDownReal.children[i].lastChild.innerText = text;
        const url =
            "https://logo.clearbit.com/" +
            collegeData.get(response[i].name)[6] +
            "";
        try {
            collegeDropDownReal.children[i].firstChild.src = url
        }
        catch(error) {
            collegeDropDownReal.children[i].firstChild.src = "whlogo.png";
        }
        
    }
    if (response.length == 0 || !isquerry) {
        closeDropdown();
    } else {
        openDropdown();
    }
}
