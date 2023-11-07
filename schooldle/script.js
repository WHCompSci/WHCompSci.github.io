const collegeDropDown = document.getElementById("colleges");

const option = document.createElement("option");
// option.value = weightClass.weight;
// option.text = weightClass.label;
// weightSelect.appendChild(option);
// collegeDropDown.appendChild()

collegeNames = []
const $output = document.getElementById('output')
document.getElementById('file').onchange = function() {
  var file = this.files[0];

  var reader = new FileReader();
  reader.onload = function(progressEvent) {
    // Entire file
    const text = this.result;
    $output.innerText = text

    // By lines
    var lines = text.split('\n');
    for (var line = 0; line < lines.length; line++) {
      console.log(lines[line]);
      collegeNames()
    }
  };
  reader.readAsText(file);
};