const collegeDropDown = document.getElementById("colleges");

const option = document.createElement("option");
const guessTable = document.getElementById("guess-table");
const urlOfFile = "collegelist.csv";
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


async function* makeTextFileLineIterator(fileURL) {
  const utf8Decoder = new TextDecoder("utf-8");
  let response = await fetch(fileURL);
  let file = File(fileURL)
  let reader = response.body.getReader();
  let { value: chunk, done: readerDone } = await reader.read();
  chunk = chunk ? utf8Decoder.decode(chunk, { stream: true }) : "";

  let re = /\r\n|\n|\r/gm;
  let startIndex = 0;

  for (;;) {
    let result = re.exec(chunk);
    if (!result) {
      if (readerDone) {
        break;
      }
      let remainder = chunk.substr(startIndex);
      ({ value: chunk, done: readerDone } = await reader.read());
      chunk =
        remainder + (chunk ? utf8Decoder.decode(chunk, { stream: true }) : "");
      startIndex = re.lastIndex = 0;
      continue;
    }
    yield chunk.substring(startIndex, result.index);
    startIndex = re.lastIndex;
  }
  if (startIndex < chunk.length) {
    // last line didn't end in a newline char
    yield chunk.substr(startIndex);
  }
}

for await (let line of makeTextFileLineIterator(urlOfFile)) {
  console.log(line);
}