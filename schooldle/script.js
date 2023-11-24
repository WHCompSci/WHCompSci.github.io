// Get the modal and button elements

// Function to open the modal

const modal = document.getElementById("modal");
const openModalBtn = document.getElementById("open-modal-btn");
const closeModalBtn = document.getElementById("modal-close-btn");

const infoModal = document.getElementById("info-modal");
const infoOpenModalBtn = document.getElementById("info-open-btn");
const infoCloseModalBtn = document.getElementById("info-close-btn");

const winModal = document.getElementById("win-modal");
const winCloseModalBtn = document.getElementById("win-modal-close-btn");
const numGuessesDisplay = document.getElementById("num-guesses");

const maxGuesses = 8;
const newAnswerEveryXhours = 5;
const subtitle = document.getElementById("subtitle");
const endlessModeButton = document.getElementById("endless-mode-btn");
const collegeDropDownReal = document.getElementById("guess-dropdown");
const showDropDownButton = document.getElementById("dropdown-button");
const collegeTextInput = document.getElementById("text-input");
const maxSearchResults = 1000;
const guessTable = document.getElementById("guess-table");
// const guessButton = document.getElementById("guess-button");
const urlOfFile = "data/collegedata.csv";
const urlOfAnswerFile = "data/answerkey.csv";
let collegeOfTheDay, collegeInfoOfTheDay; // define it here so we can cheat in the chrome devtools ;)
let gameMode = "normal"; // normal mode or endless mode
let guesses = [];
let answers;
const collegeData = new Map();
const noCollegesMSG = "No colleges found";

const fromProjection = new OpenLayers.Projection("EPSG:4326"); // Transform from WGS 1984
const toProjection = new OpenLayers.Projection("EPSG:900913"); // to Spherical Mercator Projection
let markers;
let markersYetToBeAdded;
let map;

function clearGuesses() {
    for (let guess = 0; guess < guesses.length; guess++) {
        guessTable.removeChild(guessTable.lastChild);
    }
    guesses = [];
}
function enterEndlessMode() {
    collegeOfTheDay =
        answers[Math.floor(Math.random() * answers.length)].trim();
    collegeInfoOfTheDay = collegeData.get(collegeOfTheDay);
    console.log(collegeOfTheDay);
    clearGuesses();
    resetMap();
    gameMode = "endless";
    subtitle.innerText = "Endless Mode";
}
function exitEndlessMode() {
    clearGuesses();
    setupGame()
    gameMode = "normal";
    subtitle.innerText = "A wordle inspired college-guessing game";
}

function openModal(modalElement) {
    modalElement.style.display = "block";
}

function closeModal(modalElement) {
    modalElement.style.display = "none";
}

function openDropdown() {
    console.log("opening dropdown");
    collegeDropDownReal.style.display = "block";
    collegeTextInput.style.borderRadius = "5px 5px 0 0";
}
function closeDropdown() {
    collegeDropDownReal.style.display = "none";
    collegeTextInput.style.borderRadius = "5px";
}

let hasTyped = false;
showDropDownButton.addEventListener("click", () =>
    collegeDropDownReal.style.display == "block"
        ? closeDropdown()
        : openDropdown()
);
collegeTextInput.addEventListener("keypress", () => {
    if (!hasTyped) {
        openDropdown();
    }
    hasTyped = true;
});
endlessModeButton.addEventListener("click", () =>
    gameMode == "normal" ? enterEndlessMode() : exitEndlessMode()
);
openModalBtn.addEventListener("click", () => openModal(modal));
closeModalBtn.addEventListener("click", () => closeModal(modal));

infoOpenModalBtn.addEventListener("click", () => openModal(infoModal));
infoCloseModalBtn.addEventListener("click", () => closeModal(infoModal));

winCloseModalBtn.addEventListener("click", () => {
    closeModal(winModal);
    if (gameMode == "endless") {
        collegeOfTheDay =
            answers[Math.floor(Math.random() * answers.length)].trim();
        collegeInfoOfTheDay = collegeData.get(collegeOfTheDay);
        console.log(collegeOfTheDay);
        clearGuesses();
        resetMap()
    }
});
function resetMap() {
    var options = {

        controls: [
          new OpenLayers.Control.Navigation(),
          new OpenLayers.Control.PanZoomBar(),
          new OpenLayers.Control.Attribution()
        ]
      };
    markersYetToBeAdded = [];
    markers = new OpenLayers.Layer.Markers("Markers");
    map = new OpenLayers.Map("map");
    var mapnik = new OpenLayers.Layer.OSM();
    var position = new OpenLayers.LonLat(-96, 39).transform(
        fromProjection,
        toProjection
    );
    var zoom = 3.5;
    map.addLayer(mapnik);
    map.addLayer(markers);

    map.setCenter(position, zoom);
}
function setupGame() {
    resetMap()
    const now = new Date();
    const fullDaysSinceEpoch = Math.floor(
        ((now / 8.64e7) * 24) / newAnswerEveryXhours
    );

    fetch(urlOfAnswerFile)
        .then((response) => response.text())
        .then((content) => {
            answers = content.split("\n").filter((x) => x.length > 1);
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
        option.appendChild(img);
        option.appendChild(text);
        option.addEventListener("click", () => {
            const currOption = document.getElementById("option" + i);
            if (currOption.lastChild.innerText == noCollegesMSG) {
                return;
            }
            collegeTextInput.value = currOption.lastChild.textContent;
            guessCollege();
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

function guessCollege() {
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
    closeDropdown();
    hasTyped = false;
    addTableRow(schoolData);
    guesses.push(selectedSchool);
    buildDropDownMenu();

    if (selectedSchool === collegeOfTheDay) {

        openModal(winModal);
        numGuessesDisplay.innerHTML =
            "You got the correct answer in <strong>" +
            guesses.length +
            "</strong> guesses.";
                    //player won
        for(let i = 0; i < markersYetToBeAdded.length; i++) {
            setTimeout(() => {
                markers.addMarker(markersYetToBeAdded[i])
            }, (i + 1) * 500)
        }
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
    var position = new OpenLayers.LonLat(params[1], params[0]).transform(
        fromProjection,
        toProjection
    );
    markersYetToBeAdded.push(new OpenLayers.Marker(position));
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
// guessButton.addEventListener("click", addSchoolGuessRow);

document.addEventListener("keydown", (ke) => {
    if (ke.key === "Enter") {
        guessCollege();
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
    // const arrowUp = "⬆️";
    // const arrowDown = "⬇️";
    // const arrowLeft = "⬅️";
    // const arrowRight = "➡️";
    // const arrowUpRight = "↗️";
    // const arrowUpLeft = "↖️";
    // const arrowDownRight = "↘️";
    // const arrowDownLeft = "↙️";
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
    collegeDropDownReal.scroll({
        top: 0,
    });
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
    for (let i = 0; i < maxSearchResults; i++) {
        collegeDropDownReal.children[i].style.display = "flex";
        if (i >= response.length) {
            collegeDropDownReal.children[i].style.display = "none";
            continue;
        }
        const text = response[i].display;
        collegeDropDownReal.children[i].lastChild.innerText = text;
        const collegeWebsite = collegeData.get(response[i].name)[6];
        const url =
            (/\.(png|svg|jpg|ico)$/i.test(collegeWebsite)
                ? ""
                : "https://logo.clearbit.com/") + collegeWebsite;
        try {
            collegeDropDownReal.children[i].firstChild.src = url;
        } catch (error) {
            collegeDropDownReal.children[i].firstChild.src = "whlogo.png";
        }
    }
    if (response.length == 0) {
        collegeDropDownReal.firstChild.style.display = "flex";
        collegeDropDownReal.firstChild.firstChild.src = "noresults.png";
        collegeDropDownReal.firstChild.lastChild.innerText = noCollegesMSG;
    }
}
