import { Operations, find_all_equations } from "./algorithm.js"
const year_box = document.getElementById("year")
const submit_button = document.getElementById("submit-text")
const form = document.getElementById("form")
const download_link = document.getElementById("download-button")
const checkbox_container_unary = document.getElementById(
    "checkbox-container-unary",
)
const checkbox_container_binary = document.getElementById(
    "checkbox-container-binary",
)
form.addEventListener("submit", handleSubmit)
download_link.style.display = "none"
const DEFAULT_OPERATIONS = Operations()
for (const key in DEFAULT_OPERATIONS) {
    const operation = DEFAULT_OPERATIONS[key]
    console.log(operation)
    const toggle = createToggle(key, operation.web_symbol("a", "b"), operation.is_checked_by_default)
    if (operation.arity === 1) {
        checkbox_container_unary.innerHTML += (toggle)
    } else if (operation.arity === 2) {
        checkbox_container_binary.innerHTML += toggle
    }
}
year_box.defaultValue = new Date().getFullYear()

function createToggle(id, text, is_checked_by_default) {

    return `<div class="justify-left mb-4 flex w-full items-center">
        <label
            for="${id}"
            class="text-dark flex flex-row cursor-pointer select-none items-center dark:text-white"

        >
            <div class="relative">
                <input type="checkbox" id="${id}" class="peer sr-only" name="${id}" ${is_checked_by_default ? "checked" : ""}/>
                <div
                    class="box bg-zinc-700 peer-checked:bg-zinc-500 block h-8 w-14 rounded-full transition ease-in-out delay-50"
                ></div>
                <div
                    class="dot  absolute left-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-zinc-800 transition peer-checked:translate-x-full "
                ></div>
                
            </div>
            <span class="ml-4" >$$${text}$$</span>
        </label>
    </div>`
}
let w, textContent

function handleSubmit(e) {
    e.preventDefault()
    const formData = new FormData(e.target)
    const formProps = Object.fromEntries(formData)
    console.log(formProps)
    startWorker(formProps)
    

    function startWorker(myData) {
        if (typeof Worker !== "undefined") {
            if (typeof w == "undefined") {
                submit_button.innerText =
                    "Generating Responses... Estimated time: 3-5 minutes"
                download_link.style.display = "none"
                w = new Worker("src/algorithm.js", { type: "module" })
                w.postMessage(myData)
            }
            w.onmessage = function (event) {
                textContent = event.data
                console.log("done")
                w.terminate()
                w = undefined
                download_link.style.display = "inline"
                submit_button.innerText = "Generate Answers"
            }
        } else {
            document.getElementById("result").innerHTML =
                "Sorry! No Web Worker support."
        }
    }
}
download_link.onclick = downloadTextFile

function downloadTextFile() {
    if (textContent == undefined) {
        return
    }
    var blob = new Blob([textContent], { type: "text/plain" })

    // Create a temporary URL pointing to the Blob
    var url = URL.createObjectURL(blob)

    // Create a temporary anchor element
    var link = document.createElement("a")

    // Set the href attribute of the anchor element to the temporary URL
    link.href = url

    // Set the download attribute to specify the file name
    link.download = "file.txt"

    // Programmatically click the link to trigger the download
    link.click()

    // Clean up the temporary URL and anchor element
    URL.revokeObjectURL(url)
    link.remove()
}

// set the popover content element


