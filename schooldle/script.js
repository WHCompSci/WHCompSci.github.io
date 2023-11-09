const collegeDropDown = document.getElementById("colleges");
const collegeTextInput = document.getElementById("text-input");
const guessTable = document.getElementById("guess-table");
const guessButton = document.getElementById("guess-button");
const urlOfFile = "collegelist.csv";
// option.value = weightClass.weight;
// option.text = weightClass.label;
// weightSelect.appendChild(option);
// collegeDropDown.appendChild()

const collegeData = [];
const columnNames = [
    "School",
    "State",
    "Control",
    "Total Applications",
    "Total Accepted",
    "Acceptance Rate",
    "Total Cost",
    "Total Population",
    "Male Population",
    "Female Population",
    "Male Percentage",
    "Female Percentage",
    "M/F",
];
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
                    collegeData.push(firstWord);
                    const option = document.createElement("option");
                    option.text = firstWord;
                    option.value = firstWord;
                    collegeDropDown.appendChild(option);
                }
            });
            console.log(collegeData);
        })
        .catch((error) => {
            console.error("Error:", error);
        });
});
//function to handle the college guess.
guessButton.addEventListener("click", () => {
    const selectedSchool = collegeTextInput.value;
    if (selectedSchool === "") return
    console.log("Guessing the School: \""+selectedSchool+"\"");
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
