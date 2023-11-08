const collegeDropDown = document.getElementById("colleges");

const option = document.createElement("option");
const guessTable = document.getElementById("guess-table");
// option.value = weightClass.weight;
// option.text = weightClass.label;
// weightSelect.appendChild(option);
// collegeDropDown.appendChild()

const collegeNames = [];
function readCollegeNames() {
  var file = this.files[0];

  var reader = new FileReader();
  reader.onload = function (progressEvent) {
    // Entire file
    const text = this.result;
    $output.innerText = text;

    // By lines
    var lines = text.split('\n');
    for (var line = 0; line < lines.length; line++) {
      console.log(lines[line]);
      collegeNames();
    }
  };
  reader.readAsText(file);
};
