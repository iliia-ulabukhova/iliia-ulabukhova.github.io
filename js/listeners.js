const fullscreenButton = document.getElementById("fullscreenButton");
const labelsRadioButtons = Array.from(document.getElementById("radio-buttons-section").children)
const labelsComplexityRadioButtons = document.querySelectorAll("#complexity-level label")
const orderInput = document.getElementById("order")
const generateButton = document.getElementById("generate")
const dropDown = document.getElementById("drop-down")
const radioButtonsSection = document.getElementById("radio-buttons-section")
let lastInput

// Fullscreen logic
fullscreenButton.addEventListener("click", () => {
    if (fullscreenButton.children[0].innerHTML === "fullscreen") {
        document.documentElement.requestFullscreen()
        fullscreenButton.children[0].innerHTML = "fullscreen_exit"
        changeWidthDependFullscreenMode("on")
    } else {
        document.exitFullscreen()
        fullscreenButton.children[0].innerHTML = "fullscreen"
        changeWidthDependFullscreenMode("off")
    }
})

document.addEventListener('fullscreenchange', exitFullscreen, false)

function exitFullscreen() {
    if (document.fullscreenElement === null) {
        fullscreenButton.children[0].innerHTML = "fullscreen"
        changeWidthDependFullscreenMode("off")
    }
}

function changeWidthDependFullscreenMode(mode) {
    if (mode === "on")
        document.body.setAttribute("style", "max-width: 100%;")
    if (mode === "off")
        document.body.setAttribute("style", "max-width: 776px;")
}

// Focus and click on radio buttons
labelsRadioButtons.forEach(label => {
    label.onfocus = (event) =>
        event.target.querySelector(".inner").style.setProperty("--change-opacity", "1")
    label.onblur = (event) =>
        event.target.querySelector(".inner").style.setProperty("--change-opacity", "0")
    label.onclick = () => dropDownField(label)
})

labelsComplexityRadioButtons.forEach(label => {
    label.onfocus = (event) =>
        event.target.querySelector(".inner").style.setProperty("--change-opacity", "1")
    label.onblur = (event) =>
        event.target.querySelector(".inner").style.setProperty("--change-opacity", "0")
    label.onclick = () => { COMPLEXITY_TYPE = label.children[0].value }
})

// Drop down field
function dropDownField(label) {
    const type = label.children[0].getAttribute("value")
    if (dropDown.children.length !== 0)
        dropDown.innerHTML = ""
    switch (type) {
        case "IMAGE": {
            dropDown.setAttribute("selectedType", "IMAGE")
            Array.from(allImages).forEach(image => {
                const img = document.createElement("img")
                img.setAttribute("src", image)
                img.setAttribute("selected", "false")
                img.setAttribute("draggable", "false")
                img.onclick = () => {
                    if(generateButton.innerHTML !== "Створити")
                        changeTextInGenerateButton("Створити")

                    if (img.getAttribute("selected") === "false") {
                        img.classList.add("js-element-selected")
                        img.setAttribute("selected", "true")
                    } else {
                        img.classList.remove("js-element-selected")
                        img.setAttribute("selected", "false")
                    }
                }
                dropDown.appendChild(img)
            })
            break
        }
        case "PIXEL": {
            dropDown.setAttribute("selectedType", "PIXEL")
            Array.from(allpixels).forEach(image => {
                const pix = document.createElement("img") // <- тип елемента не змінюємо!
                pix.setAttribute("src", image)
                pix.setAttribute("selected", "false")
                pix.setAttribute("draggable", "false")
                pix.onclick = () => {
                    if (generateButton.innerHTML !== "Створити")
                        changeTextInGenerateButton("Створити")

                    if (pix.getAttribute("selected") === "false") {
                        pix.classList.add("js-element-selected")
                        pix.setAttribute("selected", "true")
                    } else {
                        pix.classList.remove("js-element-selected")
                        pix.setAttribute("selected", "false")
                    }
                }
                dropDown.appendChild(pix)
            })
            break
        }

        case "UKR_LETTERS": {
            dropDown.setAttribute("selectedType", "UKR_LETTERS")
            const input = document.createElement("input")
            input.setAttribute("type", "text")
            input.style.width = "93%"
            input.setAttribute("placeholder", "Введи українські маленькі літери через пробіл або кому.")
            dropDown.appendChild(input)
            input.addEventListener("mousedown", inputListener)
            break
        }

        case "SMILES": {
            dropDown.setAttribute("selectedType", "SMILES")
            Array.from(allsmiles).forEach(image => {
                const smi = document.createElement("img") // залишаємо тег <img>, але змінюємо назву змінної
                smi.setAttribute("src", image)
                smi.setAttribute("selected", "false")
                smi.setAttribute("draggable", "false")
                smi.onclick = () => {
                    if (generateButton.innerHTML !== "Створити")
                        changeTextInGenerateButton("Створити")

                    if (smi.getAttribute("selected") === "false") {
                        smi.classList.add("js-element-selected")
                        smi.setAttribute("selected", "true")
                    } else {
                        smi.classList.remove("js-element-selected")
                        smi.setAttribute("selected", "false")
                    }
                }
                dropDown.appendChild(smi)
            })
            break
}


        default:
            throw new Error("unknown element type")
    }

    createDropDownButton()

    inputShow()
}


function inputListener(ev) {
    if(generateButton.innerHTML !== "Створити")
        changeTextInGenerateButton("Створити")

    if (ev.target.classList.contains("wrong-input")) {
        ev.target.classList.remove("wrong-input")
        ev.target.value = lastInput
    }
}

function createDropDownButton() {
    const button = document.createElement("button")
    button.setAttribute("type", "button")
    button.setAttribute("id", "drop")
    button.classList.add("cta")
    button.classList.add("cta-icon")
    button.classList.add("cta-secondary")
    button.classList.add("drop-down-button")
    dropDown.appendChild(button)
    const i = document.createElement("i")
    i.setAttribute("aria-hidden", "true")
    i.classList.add("material-icons")
    i.innerHTML = "keyboard_double_arrow_up"
    button.appendChild(i)

    button.onclick = () => {
        if (radioButtonsSection.querySelector("#show-drop-down-button") === null) {
            const showDropDown = document.createElement("button")
            showDropDown.classList.add("cta")
            showDropDown.classList.add("cta-icon")
            showDropDown.classList.add("cta-secondary")
            showDropDown.classList.add("drop-down-button")
            showDropDown.id = "show-drop-down-button"
            radioButtonsSection.appendChild(showDropDown)
            const i = document.createElement("i")
            i.ariaHidden = "true"
            i.classList.add("material-icons")
            i.innerText = "keyboard_double_arrow_down"
            showDropDown.appendChild(i)
            showDropDown.onclick = () => inputShow()
        }

        Array.from(dropDown.children).forEach(child => child.animate([{transform: 'translateY(0%)'}, {transform: 'translateY(-200%)'}], {duration: 300}))

        setTimeout(() => dropDown.style.display = "none", 280)

        setTimeout(() => {
            radioButtonsSection.style.display = "flex"
            Array.from(radioButtonsSection.children).forEach(child => child.animate([{transform: 'translateY(200%)'}, {transform: 'translateY(0%)'}], {duration: 300}))
        }, 320)
    }
}

function inputShow() {
    Array.from(radioButtonsSection.children).forEach(child => child.animate([{transform: 'translateY(0%)'}, {transform: 'translateY(200%)'}], {duration: 300}))

    setTimeout(() => radioButtonsSection.style.display = "none", 280)

    setTimeout(() => {
        dropDown.style.display = "flex"
        Array.from(dropDown.children).forEach(child => child.animate([{transform: 'translateY(-200%)'}, {transform: 'translateY(0%)'}], {duration: 300}))
    }, 320)
}

// Change text at generate button
orderInput.onmousedown = () => {
    if (generateButton.innerHTML !== "Створити")
        changeTextInGenerateButton("Створити")
}

function changeTextInGenerateButton(text, fontSize = "0.9em") {
    if (text === "Створити") {
        generateButton.innerHTML = text
        generateButton.style.width = 350 + "px"
        generateButton.style.fontSize = "1.2em"
        generateButton.style.margin = "0 25px"
        setTimeout(() => generateButton.style.width = 156 + "px", 0)
    } else {
        generateButton.innerHTML = text
        generateButton.style.width = 156 + "px"
        generateButton.style.fontSize = fontSize
        generateButton.style.margin = "0 5px"
        setTimeout(() => generateButton.style.width = 298/*298*/ + "px", 0)
    }
}