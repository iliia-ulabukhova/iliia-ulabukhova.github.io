let counter= 0

function allowDrop(ev) {
    ev.preventDefault()
}

function dragstart(ev) {
    if (TYPE === "IMAGE") {
        if (ev.target.children.length === 0)
            return
    } else {
        if (ev.target.tagName === undefined)
            return;
    }

    if (document.getElementById("generate").innerHTML === "Виділіть будь-ласка тільки один елемент")
        restoreAfterSelectOneItem()

    if (ev.target.getAttribute("id").includes("drop"))
        setTimeout(() => {
            ev.target.classList.add("hide")
        }, 0)

    ev.dataTransfer.setData("itemId", ev.target.id)

    if (document.getElementById("check").getAttribute("onclick") === null) {
        restoreCheckButton()
        restoreWrongAndCorrectCells()
    }
}

function dragend(event) {
    event.target.classList.remove("hide")
}

function drop(event) {
    event.stopPropagation();
    event.preventDefault();
    let target = event.target

    if (target.tagName.toLowerCase() === "img")
        target = event.target.parentElement

    const itemId = event.dataTransfer.getData("itemId")

    if (itemId === "") {
        selectOneItem()
        return;
    }

    const divWrapperFromPull = document.getElementById(itemId)
    const divWrapperToPushIntoGameBord = document.createElement('div')

    if (target.getAttribute("id") === divWrapperFromPull.getAttribute("id"))
        return

    divWrapperToPushIntoGameBord.setAttribute("class", "content-wrapper")
    divWrapperToPushIntoGameBord.setAttribute("style", divWrapperFromPull.getAttribute("style"))
    divWrapperToPushIntoGameBord.setAttribute("id", `drop${counter++}`)
    divWrapperToPushIntoGameBord.setAttribute("draggable", "true")
    divWrapperToPushIntoGameBord.setAttribute("ondragover", "allowDrop(event)")
    divWrapperToPushIntoGameBord.setAttribute("ondragstart", "dragstart(event)")
    divWrapperToPushIntoGameBord.setAttribute("ondragend", "dragend(event)")
    divWrapperToPushIntoGameBord.setAttribute("ondrop", "drop(event)")

    if (divWrapperFromPull.getAttribute("id") !== undefined &&
        divWrapperFromPull.getAttribute("id").includes("pull-bord-el")) {
        if (TYPE === "IMAGE")
            divWrapperToPushIntoGameBord.appendChild(divWrapperFromPull.children[0].cloneNode(true))
        else
            divWrapperToPushIntoGameBord.innerText = divWrapperFromPull.innerText
    } else {
        if (TYPE === "IMAGE")
            divWrapperToPushIntoGameBord.appendChild(divWrapperFromPull.children[0])
        else
            divWrapperToPushIntoGameBord.innerText = divWrapperFromPull.innerText
        const parent = divWrapperFromPull.parentElement
        parent.removeChild(divWrapperFromPull)
        parent.appendChild(emptySellGenerator())
    }

    if (target.tagName.toLowerCase() === "div") {
        const cell = target.parentElement
        cell.removeChild(target)
        cell.appendChild(divWrapperToPushIntoGameBord)
    } else target.appendChild(divWrapperToPushIntoGameBord)
}

let id
let lastLeftPosition
let lastTopPosition
let elementWidth
let elementHeight
let bodyRect

function touchstart(event) {
    let target = event.target

    if(TYPE === "IMAGE") {
        if(target.children.length === 0)
            target = target.parentElement
    }

    id = target.id

    event.preventDefault()

    if (target.getAttribute("id").includes("drop"))
        setTimeout(() => {
            target.classList.add("hide")
        }, 0)
    let element
    if(TYPE === "IMAGE") {
        element = document.createElement("img")
        element.setAttribute("id", "image-float")

        element.src = target.children[0].src
        element.width = target.children[0].width
        element.height = target.children[0].height
    } else {
        element = document.createElement("span")
        element.setAttribute("id", "image-float")
        element.style.fontSize = target.style.fontSize
        element.innerText = target.innerText
    }

    lastLeftPosition = event.touches[0].clientX
    lastTopPosition = event.touches[0].clientY

    bodyRect = document.body.getBoundingClientRect();

    if(TYPE === "IMAGE") {
        elementWidth = target.children[0].clientWidth
        elementHeight = target.children[0].clientHeight
    }
    else {
        elementWidth = target.clientWidth / 2.5
        elementHeight = target.clientHeight
    }
    element.style.position = 'absolute'
    element.style.left = event.touches[0].clientX - bodyRect.left - elementWidth / 2 + 'px'
    element.style.top = event.touches[0].clientY - bodyRect.top - elementHeight / 2 + 'px'
    element.style.opacity = "0.5"

    document.body.appendChild(element)

    if (document.getElementById("check").getAttribute("onclick") === null) {
        restoreCheckButton()
        restoreWrongAndCorrectCells()
    }
}

function touchmove(event) {
    let element = document.getElementById('image-float')
    lastLeftPosition = event.touches[0].clientX
    lastTopPosition = event.touches[0].clientY
    element.style.left = event.touches[0].clientX - bodyRect.left - elementWidth / 2 + 'px'
    element.style.top = event.touches[0].clientY - bodyRect.top - elementHeight / 2  + 'px'
}

function touchend(event) {
    let target = event.target

    if(TYPE === "IMAGE") {
        if(target.children.length === 0)
            target = target.parentElement
    }

    target.classList.remove("hide")
    document.getElementsByTagName("body")[0].removeChild(document.getElementById("image-float"))

    let dropElement = document.elementFromPoint(lastLeftPosition, lastTopPosition)

    if(TYPE === "IMAGE") {
        if(dropElement.children.length === 0 && !dropElement.id.includes("empty-cell"))
            dropElement = dropElement.parentElement
    }

    if(!dropElement.id.includes("empty-cell") && (!dropElement.id.includes("drop")
        || !dropElement.classList.contains("content-wrapper")))
        return

    if(target.id === dropElement.id)
        return;

    const divWrapperFromPull = document.getElementById(id)
    const divWrapperToPushIntoGameBord = document.createElement('div')
    divWrapperToPushIntoGameBord.ontouchstart = (ev) => touchstart(ev)
    divWrapperToPushIntoGameBord.ontouchmove = (ev) => touchmove(ev)
    divWrapperToPushIntoGameBord.ontouchend = (event) => touchend(event)
    divWrapperToPushIntoGameBord.setAttribute("class", "content-wrapper")
    divWrapperToPushIntoGameBord.setAttribute("style", divWrapperFromPull.getAttribute("style"))
    divWrapperToPushIntoGameBord.setAttribute("id", `drop${counter++}`)

    if (divWrapperFromPull.getAttribute("id") !== undefined &&
        divWrapperFromPull.getAttribute("id").includes("pull-bord-el")) {
        if (TYPE === "IMAGE")
            divWrapperToPushIntoGameBord.appendChild(divWrapperFromPull.children[0].cloneNode(true))
        else
            divWrapperToPushIntoGameBord.innerText = divWrapperFromPull.innerText
    } else {
        if (TYPE === "IMAGE")
            divWrapperToPushIntoGameBord.appendChild(divWrapperFromPull.children[0])
        else
            divWrapperToPushIntoGameBord.innerText = divWrapperFromPull.innerText
        const parent = divWrapperFromPull.parentElement
        parent.removeChild(divWrapperFromPull)
        parent.appendChild(emptySellGenerator())
    }

    if (dropElement.tagName.toLowerCase() === "div") {
        const cell = dropElement.parentElement
        cell.removeChild(dropElement)
        cell.appendChild(divWrapperToPushIntoGameBord)
    } else dropElement.appendChild(divWrapperToPushIntoGameBord)
}

function restoreWrongAndCorrectCells() {
    const game_board = document.getElementById("game-board")
    const arrayTr = game_board.children
    for (let i = 0; i < arrayTr.length; i++) {

        const arrayTd = arrayTr[i].children

        for (let j = 0; j < arrayTd.length; j++) {
            if (arrayTd[j].children[0].id.includes("game-board-base-element"))
                continue
            const divImageWrapper = arrayTd[j].children[0]
            divImageWrapper.style.background = "none"
            arrayTd[j].style.background = "none"
        }
    }
}