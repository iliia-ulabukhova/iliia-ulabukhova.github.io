// При завантаженні сторінки формуємо порожні таблиці
window.onload = emptyTablesGenerator

// ——————————————————————————————————————————
// Глобальні змінні
let N
let lastN
let VALUES = allImages    // За замовчуванням беремо масив allImages
const width = 320         // Ширина загальної області для ігрового поля (пікселів)
const height = 260        // Висота загальної області для ігрового поля (пікселів)
const board = document.getElementById("board") // Контейнер для колонок (гратика + pull + рівняння)
let COMPLEXITY_TYPE = "MEDIUM_LEVEL"
let TYPE = "IMAGE"
let latin_square_obj
let initial_square
let emptyCellCounter = 0

// ——————————————————————————————————————————
// Функція створення порожньої структури:  
// 1) Робить обрамлення лише навколо N×N сітки,  
// 2) «1» під цим обрамленням (зсередини залишається зліва від «1»),  
// 3) «1» праворуч від обрамлення (знизу лишається пусто),  
// 4) pull-стовпчик і рівняння справа як і раніше.
function emptyTablesGenerator() {
  // 1) Стандартне значення N=5, щоб одразу було видно компоненти
  N = 5

  // 2) Якщо вже є старий вміст у контейнері #board, видаляємо його
  if (board.children.length !== 0) {
    board.innerHTML = ""
  }

  // 3) Отримуємо латинський квадрат, тільки щоб знати розмір N×N
  latin_square_obj = new Latin(Number(N))
  initial_square = latin_square_obj.square

  // 4) Створюємо flex-контейнер, що містить чотири блоки в ряд:
  //    А) leftColumn: обрамлена N×N сітка + понизу «1»-рядок,
  //    Б) onesRightColumn: стовпець «1» праворуч від цієї сітки,
  //    В) midColumn: pull-стовпчик (N×1),
  //    Г) rightColumn: рівняння (= + input) для кожного рядка
  const flexContainer = document.createElement("div")
  flexContainer.style.display = "flex"
  flexContainer.style.alignItems = "flex-start"
  flexContainer.style.gap = "20px"
  board.appendChild(flexContainer)

  // === А) Ліва колонка: обрамлена N×N «гратика» + «1»-рядок унизу ===
  const leftColumn = document.createElement("div")
  leftColumn.style.display = "flex"
  leftColumn.style.flexDirection = "column"
  leftColumn.style.alignItems = "center"
  flexContainer.appendChild(leftColumn)

  // 4.1) Контейнер, що обрамлює сітку N×N
  const gridWrapper = document.createElement("div")
  gridWrapper.style.display = "inline-block"
  gridWrapper.style.border = "1px solid #5B9BD5"
  gridWrapper.style.boxSizing = "content-box"
  leftColumn.appendChild(gridWrapper)

  // 4.2) Всередині gridWrapper — таблиця N×N без зовнішніх border’ів у td (бо обрамлення — у div)
  const innerTable = document.createElement("table")
  innerTable.setAttribute("cellspacing", "0")
  innerTable.style.borderCollapse = "collapse" // щоб не було подвійних ліній
  gridWrapper.appendChild(innerTable)

  for (let i = 0; i < initial_square.length; i++) {
    const tr = document.createElement("tr")
    innerTable.appendChild(tr)
    for (let j = 0; j < initial_square[i].length; j++) {
      const td = document.createElement("td")
      // Кожна клітинка N×N має свої розміри, але без окремого border
      td.style.width = `${width / Number(N)}px`
      td.style.height = `${height / Number(N)}px`
      td.style.border = "none"
      // Проте між осередками N×N зробимо внутрішні лінії:
      // — право (якщо j < N-1): вертикальна лінія окремо,
      // — низ  (якщо i < N-1): горизонтальна лінія окремо.
      if (j < Number(N) - 1) {
        td.style.borderRight = "1px solid #5B9BD5"
      }
      if (i < Number(N) - 1) {
        td.style.borderBottom = "1px solid #5B9BD5"
      }
      tr.appendChild(td)
      td.appendChild(emptyCellGenerator())
    }
  }

  // 4.3) Нижній «1»-рядок унизу під обрамленою сіткою:
  //      це окрема div, що лежить прямо під gridWrapper
  const bottomOnes = document.createElement("div")
  bottomOnes.style.display = "flex"
  // розмір кожної «1»-клітинки узгоджений з шириною innerTable td
  bottomOnes.style.marginTop = "-1px" // щоб «1»-рядок торкався нижньої межі обрамлення без проміжку
  for (let col = 0; col < Number(N); col++) {
    const oneCell = document.createElement("div")
    oneCell.style.width = `${width / Number(N)}px`
    oneCell.style.height = `${height / Number(N)}px`
    oneCell.style.display = "flex"
    oneCell.style.alignItems = "center"
    oneCell.style.justifyContent = "center"
    oneCell.style.fontSize = "1em"
    oneCell.innerText = " "
    bottomOnes.appendChild(oneCell)
  }
  leftColumn.appendChild(bottomOnes)

  // === Б) Стовпець «1» праворуч від обрамленої сітки ===
  const onesRightColumn = document.createElement("div")
  onesRightColumn.style.display = "flex"
  onesRightColumn.style.flexDirection = "column"
  // Має стояти на рівні самої сітки (не враховуючи нижнього «1»-рядка)
  onesRightColumn.style.marginLeft = "-1px" // щоб «1»-стовпець торкався правої межі обрамлення
  for (let row = 0; row < Number(N); row++) {
    const oneCell = document.createElement("div")
    oneCell.style.width = `${width / Number(N)}px`
    oneCell.style.height = `${height / Number(N)}px`
    oneCell.style.display = "flex"
    oneCell.style.alignItems = "center"
    oneCell.style.justifyContent = "center"
    oneCell.style.fontSize = "1em"
    oneCell.innerText = " "
    onesRightColumn.appendChild(oneCell)
  }
  flexContainer.appendChild(onesRightColumn)

  // === В) Середня колонка: pull-стовпчик N×1 (як раніше) ===
  const midColumn = document.createElement("div")
  midColumn.style.display = "flex"
  midColumn.style.flexDirection = "column"
  midColumn.style.alignItems = "center"
  flexContainer.appendChild(midColumn)

  const pullTable = document.createElement("table")
  pullTable.setAttribute("cellspacing", "0")
  pullTable.style.borderCollapse = "collapse"
  midColumn.appendChild(pullTable)

  for (let i = 0; i < Number(N); i++) {
    const tr = document.createElement("tr")
    pullTable.appendChild(tr)
    const td = document.createElement("td")
    td.style.width = `${width / Number(N)}px`
    td.style.height = `${height / Number(N)}px`
    td.style.border = "1px solid #5B9BD5"
    tr.appendChild(td)
    td.appendChild(emptyCellGenerator())
  }

  // === Г) Права колонка: рівняння (= + поле вводу) для кожного рядка ===
  const rightColumn = document.createElement("div")
  rightColumn.style.display = "flex"
  rightColumn.style.flexDirection = "column"
  rightColumn.style.alignItems = "flex-start"
  // Відстань між полями введення — 2px
  rightColumn.style.gap = "2px"
  flexContainer.appendChild(rightColumn)

  for (let i = 0; i < Number(N); i++) {
    const rowInputWrapper = document.createElement("div")
    rowInputWrapper.style.display = "flex"
    rowInputWrapper.style.alignItems = "center"
    // Відстань між знаком '=' і полем, а також між полями по вертикалі — 2px
    rowInputWrapper.style.gap = "2px"
    rowInputWrapper.style.marginBottom = "2px"

    const eqSign = document.createElement("span")
    eqSign.innerText = "="
    eqSign.style.fontSize = "1.2em"
    eqSign.style.userSelect = "none"
    rowInputWrapper.appendChild(eqSign)

    const answerField = document.createElement("input")
    answerField.setAttribute("type", "number")
    answerField.setAttribute("placeholder", "")
    // Поле має ту саму висоту, що й клітинка у сіткці
    answerField.style.width = `${width / Number(N)}px`
    answerField.style.height = `${height / Number(N)}px`
    answerField.style.fontSize = "1em"
    answerField.style.textAlign = "center"
    rowInputWrapper.appendChild(answerField)

    rightColumn.appendChild(rowInputWrapper)
  }
}

// ——————————————————————————————————————————
// Генератор випадкового числа в діапазоні [min, max)
function random(min, max) {
  return Math.floor(Math.random() * (max - min) + min)
}

// ——————————————————————————————————————————
// Основна функція "Створити": будує готовий латинський квадрат + pull + рівняння та додає «1»-ряди/стовпці
async function generate() {
  function pokeHoles(square, holes, N) {
    let pokedHoles = []
    while (pokedHoles.length < holes) {
      const val = Math.floor(Math.random() * N * N)
      const randomRowIndex = Math.floor(val / N)
      const randomColIndex = val % N
      if (!square[randomRowIndex]) continue
      if (square[randomRowIndex][randomColIndex] === 0) continue

      pokedHoles.push({
        rowIndex: randomRowIndex,
        colIndex: randomColIndex,
        val: square[randomRowIndex][randomColIndex]
      })
      square[randomRowIndex][randomColIndex] = 0
    }
    return square.map(row => row.slice())
  }

  function isOneComplexityRadioButtonsSelected() {
    let flag = false
    for (const x of labelsComplexityRadioButtons) {
      if (x.children[0].checked === true) flag = true
    }
    return flag
  }

  // 1) Зчитуємо N із поля "Порядок"
  N = orderInput.value
  if (N === "") N = 5

  if (N < 4 || N > 10 || !/^\s*\d+\s*$/ig.test(N)) {
    if (generateButton.innerHTML !== "Введіть число від 4 до 10")
      changeTextInGenerateButton("Введіть число від 4 до 10")
    if (lastN > 1 && lastN < 11) N = lastN
    return
  }
  if (N !== lastN) lastN = N

  if (generateButton.innerHTML === "Введіть число від 4 до 10")
    changeTextInGenerateButton("Створити")

  if (generateButton.innerHTML === "Виділіть будь-ласка тільки один елемент")
    restoreAfterSelectOneItem()

  // 2) Якщо dropdown вже заповнений, читаємо дані
  if (dropDown.children.length !== 0) {
    fillData()
    if (VALUES.length === 0) return
  } else {
    // Інакше — відкриваємо перший тип за замовчуванням
    dropDownField(labelsRadioButtons[0])
    await new Promise(resolve => setTimeout(resolve, 300))
  }

  // 3) Очищаємо контейнер #board, щоб намалювати нові елементи
  board.innerHTML = ""

  // 4) Переконуємось, що вибрано рівень складності
  if (!isOneComplexityRadioButtonsSelected())
    labelsComplexityRadioButtons[1].children[0].checked = true

  // 5) Генеруємо новий латинський квадрат
  latin_square_obj = new Latin(Number(N))
  initial_square = latin_square_obj.square

  // 6) Обчислюємо кількість дірок (порожніх клітин) відповідно до складності
  let min, max, coefficient, step
  switch (COMPLEXITY_TYPE) {
    case "EASY_LEVEL": {
      coefficient = 0.5 * Number(N)
      step = Math.floor(Number(N) / 3 * coefficient)
      min = Math.ceil(Number(N) / 3) + step
      max = min + step
      break
    }
    case "MEDIUM_LEVEL": {
      coefficient = 0.5 * Number(N)
      step = Math.floor(Number(N) / 3 * coefficient)
      min = Number(N) + step
      max = min + step
      break
    }
    case "HARD_LEVEL": {
      coefficient = 0.5 * Number(N)
      step = Math.floor(Number(N) / 3 * coefficient)
      min = Number(N) + Math.floor(coefficient) + step
      max = min + step
      break
    }
    default:
      throw new Error("unknown complexity level")
  }

  const holesAmount = random(min, max + 1)
  initial_square = pokeHoles(initial_square, holesAmount, Number(N))

  // ——————————————————————————————————————————
  // Тепер повторюємо структуру трьох колонок, але з уже готовими даними

  // A) Створюємо flex-контейнер
  const flexContainer = document.createElement("div")
  flexContainer.style.display = "flex"
  flexContainer.style.alignItems = "flex-start"
  flexContainer.style.gap = "20px"
  board.appendChild(flexContainer)

  // === Б) Ліва колонка: обрамлена N×N «гратика» + нижній «1»-рядок ===
  const leftColumn = document.createElement("div")
  leftColumn.style.display = "flex"
  leftColumn.style.flexDirection = "column"
  leftColumn.style.alignItems = "center"
  flexContainer.appendChild(leftColumn)

  // Б.1) Обгортка для N×N сітки з рамкою навколо неї
  const gridWrapper = document.createElement("div")
  gridWrapper.style.display = "inline-block"
  gridWrapper.style.border = "1px solid #5B9BD5"
  gridWrapper.style.boxSizing = "content-box"
  leftColumn.appendChild(gridWrapper)

  // Б.2) Усередині gridWrapper — таблиця N×N із внутрішніми лініями
  const innerTable = document.createElement("table")
  innerTable.setAttribute("cellspacing", "0")
  innerTable.style.borderCollapse = "collapse"
  gridWrapper.appendChild(innerTable)

  for (let i = 0; i < initial_square.length; i++) {
    const tr = document.createElement("tr")
    innerTable.appendChild(tr)
    for (let j = 0; j < initial_square[i].length; j++) {
      const td = document.createElement("td")
      td.style.width = `${width / Number(N)}px`
      td.style.height = `${height / Number(N)}px`
      td.style.border = "none"
      // Горизонтальні лінії між рядами (крім останнього)
      if (i < Number(N) - 1) {
        td.style.borderBottom = "1px solid #5B9BD5"
      }
      // Вертикальні лінії між стовпчиками (крім останнього)
      if (j < Number(N) - 1) {
        td.style.borderRight = "1px solid #5B9BD5"
      }
      tr.appendChild(td)

      // Додаємо порожню клітинку для drag&drop
      td.appendChild(emptyCellGenerator())
    }
  }

  // Б.3) Нижній «1»-рядок під gridWrapper, зрушений угору на 1px, щоб торкався рамки
  const bottomOnes = document.createElement("div")
  bottomOnes.style.display = "flex"
  bottomOnes.style.marginTop = "-1px"
  for (let col = 0; col < Number(N); col++) {
    const oneCell = document.createElement("div")
    oneCell.style.width = `${width / Number(N)}px`
    oneCell.style.height = `${height / Number(N)}px`
    oneCell.style.display = "flex"
    oneCell.style.alignItems = "center"
    oneCell.style.justifyContent = "center"
    oneCell.style.fontSize = "1em"
    oneCell.innerText = "1"
    bottomOnes.appendChild(oneCell)
  }
  leftColumn.appendChild(bottomOnes)

  // === В) «1»-стовпець праворуч від gridWrapper, зрушений вліво на 1px, щоб торкався рамки ===
  const onesRightColumn = document.createElement("div")
  onesRightColumn.style.display = "flex"
  onesRightColumn.style.flexDirection = "column"
  onesRightColumn.style.marginLeft = "-1px"
  for (let row = 0; row < Number(N); row++) {
    const oneCell = document.createElement("div")
    oneCell.style.width = `${width / Number(N)}px`
    oneCell.style.height = `${height / Number(N)}px`
    oneCell.style.display = "flex"
    oneCell.style.alignItems = "center"
    oneCell.style.justifyContent = "center"
    oneCell.style.fontSize = "1em"
    oneCell.innerText = "1"
    onesRightColumn.appendChild(oneCell)
  }
  flexContainer.appendChild(onesRightColumn)

  // === Г) Середня колонка: pull-стовпчик N×1 ===
  const midColumn = document.createElement("div")
  midColumn.style.display = "flex"
  midColumn.style.flexDirection = "column"
  midColumn.style.alignItems = "center"
  flexContainer.appendChild(midColumn)

  const pullTable = document.createElement("table")
  pullTable.setAttribute("cellspacing", "0")
  pullTable.style.borderCollapse = "collapse"
  midColumn.appendChild(pullTable)

  for (let i = 0; i < Number(N); i++) {
    const tr = document.createElement("tr")
    pullTable.appendChild(tr)
    const td = document.createElement("td")
    td.style.width = `${width / Number(N)}px`
    td.style.height = `${height / Number(N)}px`
    td.style.border = "1px solid #5B9BD5"
    tr.appendChild(td)
    td.appendChild(emptyCellGenerator())
  }

  // === Д) Права колонка: відображаємо рівняння (= + поле вводу) для кожного із N рядків ===
  const rightColumn = document.createElement("div")
  rightColumn.style.display = "flex"
  rightColumn.style.flexDirection = "column"
  rightColumn.style.alignItems = "flex-start"
  rightColumn.style.gap = "2px"
  flexContainer.appendChild(rightColumn)

  for (let i = 0; i < Number(N); i++) {
    const rowInputWrapper = document.createElement("div")
    rowInputWrapper.style.display = "flex"
    rowInputWrapper.style.alignItems = "center"
    rowInputWrapper.style.gap = "2px"
    rowInputWrapper.style.marginBottom = "2px"

    const eqSign = document.createElement("span")
    eqSign.innerText = "="
    eqSign.style.fontSize = "1.2em"
    eqSign.style.userSelect = "none"
    rowInputWrapper.appendChild(eqSign)

    const answerField = document.createElement("input")
    answerField.setAttribute("type", "number")
    answerField.setAttribute("placeholder", "")
    answerField.style.width = `${width / Number(N)}px`
    answerField.style.height = `${height / Number(N)}px`
    answerField.style.fontSize = "1em"
    answerField.style.textAlign = "center"
    rowInputWrapper.appendChild(answerField)

    rightColumn.appendChild(rowInputWrapper)
  }
}

// ——————————————————————————————————————————
// Генератор випадкового числа в діапазоні [min, max)
function random(min, max) {
  return Math.floor(Math.random() * (max - min) + min)
}

// ——————————————————————————————————————————
// Основна функція "Створити": будує вже заповнену латинську сітку з дірками,
// pull-стовпчик + рівняння + «1»-ряди/стовпці (без «1» в правому нижньому куті)
async function generate() {
  function pokeHoles(square, holes, N) {
    let pokedHoles = []
    while (pokedHoles.length < holes) {
      const val = Math.floor(Math.random() * N * N)
      const randomRowIndex = Math.floor(val / N)
      const randomColIndex = val % N
      if (!square[randomRowIndex]) continue
      if (square[randomRowIndex][randomColIndex] === 0) continue

      pokedHoles.push({
        rowIndex: randomRowIndex,
        colIndex: randomColIndex,
        val: square[randomRowIndex][randomColIndex]
      })
      square[randomRowIndex][randomColIndex] = 0
    }
    return square.map(row => row.slice())
  }

  function isOneComplexityRadioButtonsSelected() {
    let flag = false
    for (const x of labelsComplexityRadioButtons) {
      if (x.children[0].checked === true) flag = true
    }
    return flag
  }

  // 1) Зчитуємо N із поля "Порядок"
  N = orderInput.value
  if (N === "") N = 5

  if (N < 4 || N > 10 || !/^\s*\d+\s*$/ig.test(N)) {
    if (generateButton.innerHTML !== "Введіть число від 4 до 10")
      changeTextInGenerateButton("Введіть число від 4 до 10")
    if (lastN > 1 && lastN < 11) N = lastN
    return
  }
  if (N !== lastN) lastN = N

  if (generateButton.innerHTML === "Введіть число від 4 до 10")
    changeTextInGenerateButton("Створити")

  if (generateButton.innerHTML === "Виділіть будь-ласка тільки один елемент")
    restoreAfterSelectOneItem()

  // 2) Якщо dropdown вже заповнений, читаємо дані
  if (dropDown.children.length !== 0) {
    fillData()
    if (VALUES.length === 0) return
  } else {
    // Інакше — відкриваємо перший тип за замовчуванням
    dropDownField(labelsRadioButtons[0])
    await new Promise(resolve => setTimeout(resolve, 300))
  }

  // 3) Очищаємо контейнер #board, щоб намалювати нові елементи
  board.innerHTML = ""

  // 4) Переконуємось, що вибрано рівень складності
  if (!isOneComplexityRadioButtonsSelected())
    labelsComplexityRadioButtons[1].children[0].checked = true

  // 5) Генеруємо новий латинський квадрат
  latin_square_obj = new Latin(Number(N))
  initial_square = latin_square_obj.square

  // 6) Обчислюємо кількість дірок (порожніх клітин) відповідно до складності
  let min, max, coefficient, step
  switch (COMPLEXITY_TYPE) {
    case "EASY_LEVEL": {
      coefficient = 0.5 * Number(N)
      step = Math.floor(Number(N) / 3 * coefficient)
      min = Math.ceil(Number(N) / 3) + step
      max = min + step
      break
    }
    case "MEDIUM_LEVEL": {
      coefficient = 0.5 * Number(N)
      step = Math.floor(Number(N) / 3 * coefficient)
      min = Number(N) + step
      max = min + step
      break
    }
    case "HARD_LEVEL": {
      coefficient = 0.5 * Number(N)
      step = Math.floor(Number(N) / 3 * coefficient)
      min = Number(N) + Math.floor(coefficient) + step
      max = min + step
      break
    }
    default:
      throw new Error("unknown complexity level")
  }

  const holesAmount = random(min, max + 1)
  initial_square = pokeHoles(initial_square, holesAmount, Number(N))

  // ——————————————————————————————————————————
  // Тепер повторюємо структуру чотирьох колонок, але з уже готовими даними

  // A) Створюємо flex-контейнер
  const flexContainer = document.createElement("div")
  flexContainer.style.display = "flex"
  flexContainer.style.alignItems = "flex-start"
  flexContainer.style.gap = "20px"
  board.appendChild(flexContainer)

  // === Б) Ліва колонка: обрамлена N×N «гратика» + нижній «1»-рядок ===
  const leftColumn = document.createElement("div")
  leftColumn.style.display = "flex"
  leftColumn.style.flexDirection = "column"
  leftColumn.style.alignItems = "center"
  flexContainer.appendChild(leftColumn)

  // Б.1) Контейнер з рамкою для N×N
  const gridWrapper = document.createElement("div")
  gridWrapper.style.display = "inline-block"
  gridWrapper.style.border = "1px solid #5B9BD5"
  gridWrapper.style.boxSizing = "content-box"
  leftColumn.appendChild(gridWrapper)

  // Б.2) Усередині gridWrapper — таблиця N×N з внутрішніми лініями
  const innerTable = document.createElement("table")
  innerTable.setAttribute("cellspacing", "0")
  innerTable.style.borderCollapse = "collapse"
  gridWrapper.appendChild(innerTable)

  for (let i = 0; i < initial_square.length; i++) {
    const tr = document.createElement("tr")
    innerTable.appendChild(tr)
    for (let j = 0; j < initial_square[i].length; j++) {
      const td = document.createElement("td")
      td.style.width = `${width / Number(N)}px`
      td.style.height = `${height / Number(N)}px`
      td.style.border = "none"
      if (i < Number(N) - 1) {
        td.style.borderBottom = "1px solid #5B9BD5"
      }
      if (j < Number(N) - 1) {
        td.style.borderRight = "1px solid #5B9BD5"
      }
      tr.appendChild(td)

      // Додаємо контент (картинку/текст) або порожнє поле
      if (TYPE === "IMAGE" || TYPE === "PIXEL" || TYPE === "SMILES") {
        if (initial_square[i][j] !== 0) {
          td.style.background = "#ECECEC"
          const divImageWrapper = document.createElement("div")
          divImageWrapper.setAttribute("class", "content-wrapper")
          divImageWrapper.setAttribute("id", `game-board-base-element${i + j}`)
          divImageWrapper.style.width = `${width / Number(N)}px`
          divImageWrapper.style.height = `${height / Number(N)}px`
          divImageWrapper.style.background = "#ECECEC"
          td.appendChild(divImageWrapper)

          const smi = new Image()
          smi.setAttribute("draggable", "false")

          if (TYPE === "IMAGE")
            smi.setAttribute("src", allImages[initial_square[i][j] - 1])
          else if (TYPE === "PIXEL")
            smi.setAttribute("src", allpixels[initial_square[i][j] - 1])
          else // SMILES
            smi.setAttribute("src", allsmiles[initial_square[i][j] - 1])

          let h = smi.naturalHeight
          while (h >= height / Number(N)) h /= 2
          smi.style.width = "auto"
          smi.style.height = `${h}px`
          divImageWrapper.appendChild(smi)
        } else {
          td.appendChild(emptyCellGenerator())
        }
      } else {
        if (initial_square[i][j] !== 0) {
          td.style.background = "#ECECEC"
          const divStringWrapper = document.createElement("div")
          divStringWrapper.setAttribute("class", "content-wrapper")
          divStringWrapper.setAttribute("id", `game-board-base-element${i + j}`)
          divStringWrapper.style.width = `${width / Number(N)}px`
          divStringWrapper.style.height = `${height / Number(N)}px`
          divStringWrapper.style.background = "#ECECEC"
          divStringWrapper.setAttribute("draggable", "false")
          divStringWrapper.style.fontSize = `${200 / Number(N)}px`
          divStringWrapper.innerHTML = VALUES[initial_square[i][j] - 1]
          td.appendChild(divStringWrapper)
        } else {
          td.appendChild(emptyCellGenerator())
        }
      }
    }
  }

  // Б.3) Нижній «1»-рядок (зрушений угору на 1px, щоб торкався нижньої межі рамки)
  const bottomOnes = document.createElement("div")
  bottomOnes.style.display = "flex"
  bottomOnes.style.marginTop = "-1px"
  for (let col = 0; col < Number(N); col++) {
    const oneCell = document.createElement("div")
    oneCell.style.width = `${width / Number(N)}px`
    oneCell.style.height = `${height / Number(N)}px`
    oneCell.style.display = "flex"
    oneCell.style.alignItems = "center"
    oneCell.style.justifyContent = "center"
    oneCell.style.fontSize = "1em"
    oneCell.innerText = "1"
    bottomOnes.appendChild(oneCell)
  }
  leftColumn.appendChild(bottomOnes)

  // === В) «1»-стовпець праворуч від gridWrapper (зрушений вліво на 1px) ===
  const onesRightColumn = document.createElement("div")
  onesRightColumn.style.display = "flex"
  onesRightColumn.style.flexDirection = "column"
  onesRightColumn.style.marginLeft = "-1px"
  for (let row = 0; row < Number(N); row++) {
    const oneCell = document.createElement("div")
    oneCell.style.width = `${width / Number(N)}px`
    oneCell.style.height = `${height / Number(N)}px`
    oneCell.style.display = "flex"
    oneCell.style.alignItems = "center"
    oneCell.style.justifyContent = "center"
    oneCell.style.fontSize = "1em"
    oneCell.innerText = "1"
    onesRightColumn.appendChild(oneCell)
  }
  flexContainer.appendChild(onesRightColumn)

  // === Г) Середня колонка: pull-стовпчик N×1 ===
  const midColumn = document.createElement("div")
  midColumn.style.display = "flex"
  midColumn.style.flexDirection = "column"
  midColumn.style.alignItems = "center"
  flexContainer.appendChild(midColumn)

  const pullTable = document.createElement("table")
  pullTable.setAttribute("cellspacing", "0")
  pullTable.style.borderCollapse = "collapse"
  midColumn.appendChild(pullTable)

  for (let i = 0; i < Number(N); i++) {
    const tr = document.createElement("tr")
    pullTable.appendChild(tr)
    const td = document.createElement("td")
    td.style.width = `${width / Number(N)}px`
    td.style.height = `${height / Number(N)}px`
    td.style.border = "1px solid #5B9BD5"
    tr.appendChild(td)
    td.appendChild(emptyCellGenerator())
  }

  // === Д) Права колонка: рівняння (= + поле вводу) для кожного з N рядків ===
  const rightColumn = document.createElement("div")
  rightColumn.style.display = "flex"
  rightColumn.style.flexDirection = "column"
  rightColumn.style.alignItems = "flex-start"
  rightColumn.style.gap = "2px"
  flexContainer.appendChild(rightColumn)

  for (let i = 0; i < Number(N); i++) {
    const rowInputWrapper = document.createElement("div")
    rowInputWrapper.style.display = "flex"
    rowInputWrapper.style.alignItems = "center"
    rowInputWrapper.style.gap = "2px"
    rowInputWrapper.style.marginBottom = "2px"

    const eqSign = document.createElement("span")
    eqSign.innerText = "="
    eqSign.style.fontSize = "1.2em"
    eqSign.style.userSelect = "none"
    rowInputWrapper.appendChild(eqSign)

    const answerField = document.createElement("input")
    answerField.setAttribute("type", "number")
    answerField.setAttribute("placeholder", "")
    answerField.style.width = `${width / Number(N)}px`
    answerField.style.height = `${height / Number(N)}px`
    answerField.style.fontSize = "1em"
    answerField.style.textAlign = "center"
    rowInputWrapper.appendChild(answerField)

    rightColumn.appendChild(rowInputWrapper)
  }

  // Якщо кнопка “Перевірити” була відключена, відновлюємо її
  if (document.getElementById("check").getAttribute("onclick") === null)
    restoreCheckButton()
}

// ——————————————————————————————————————————
// Створює динамічний порожній елемент (empty cell)
function emptyCellGenerator() {
  const div = document.createElement("div")
  div.setAttribute("id", `empty-cell-${emptyCellCounter++}`)
  // Кожна «порожня» клітинка адаптується під розмір клітинки таблиці:
  div.style.width = `${width / Number(N)}px`
  div.style.height = `${height / Number(N)}px`
  div.setAttribute("ondrop", "drop(event)")
  div.setAttribute("ondragover", "allowDrop(event)")
  return div
}

// ——————————————————————————————————————————
// Відновлює кнопку "Перевірити" до початкового стану
function restoreCheckButton() {
  const checkButton = document.getElementById("check")
  checkButton.classList.add("cta-primary")
  checkButton.classList.remove("wrong")
  checkButton.classList.remove("correct")
  checkButton.setAttribute("onclick", "check()")
  checkButton.innerHTML = "Перевірити"
}

// ——————————————————————————————————————————
// Перевірка результату гри
function check() {
  const game_board = document.getElementById("game-board")
  if (game_board === null) return

  // Перевіряє унікальність у рядку
  function isUniqueInLine(arrayTd, td, index) {
    for (let i = 0; i < arrayTd.length; i++) {
      if (i === index) continue
      if (TYPE === "IMAGE" || TYPE === "PIXEL" || TYPE === "SMILES") {
        const divWrapperOne = arrayTd[i].children[0]
        const smiOne = divWrapperOne.children[0]
        const divWrapperTwo = td.children[0]
        const smiTwo = divWrapperTwo.children[0]
        if (smiOne.src === smiTwo.src) return false
      } else {
        if (arrayTd[i].innerText === td.innerText) return false
      }
    }
    return true
  }

  // Перевіряє унікальність у стовпчику
  function isUniqueInRow(arrayTr, tr, tdIndex) {
    for (let i = 0; i < arrayTr.length; i++) {
      if (arrayTr[i] === tr) continue
      const tdOne = arrayTr[i].children[tdIndex]
      const tdTwo = tr.children[tdIndex]
      // Пропускаємо ті, що мають «1» праворуч чи внизу (мають innerText === "1")
      if (tdOne.innerText === "1" || tdTwo.innerText === "1") continue
      if (TYPE === "IMAGE" || TYPE === "PIXEL" || TYPE === "SMILES") {
        const divWrapperOne = tdOne.children[0]
        const smiOne = divWrapperOne.children[0]
        const divWrapperTwo = tdTwo.children[0]
        const smiTwo = divWrapperTwo.children[0]
        if (smiOne.src === smiTwo.src) return false
      } else {
        if (tdOne.innerText === tdTwo.innerText) return false
      }
    }
    return true
  }

  // Перевірка, чи всі клітинки N×N заповнені (ігрове поле без рамок / без «1»)
  function isGameBoardFilled(game_board) {
    const arrayTr = game_board.children
    for (let i = 0; i < initial_square.length; i++) {
      const arrayTd = arrayTr[i].children
      for (let j = 0; j < initial_square.length; j++) {
        if (arrayTd[j].children[0].id.includes("empty-cell")) return false
      }
    }
    return true
  }

  const checkButton = document.getElementById("check")

  if (!isGameBoardFilled(game_board)) {
    checkButton.removeAttribute("onclick")
    checkButton.innerHTML = "Заповни усі клітинки"
    return
  }

  let flag = true
  // Перевіряємо тільки N×N клітинки (ігрове поле без «1»)
  for (let i = 0; i < initial_square.length; i++) {
    const arrayTd = game_board.children[i].children
    for (let j = 0; j < initial_square.length; j++) {
      // Пропускаємо базові клітинки (їхній div має id, що містить "game-board-base-element")
      const firstChild = arrayTd[j].children[0]
      if (firstChild && firstChild.id.includes("game-board-base-element")) continue

      if (
        isUniqueInLine(arrayTd, arrayTd[j], j) &&
        isUniqueInRow(game_board.children, game_board.children[i], j)
      ) {
        arrayTd[j].children[0].style.background = "#A3D76E"
        arrayTd[j].style.background = "#A3D76E"
      } else {
        arrayTd[j].style.background = "#CD001C"
        arrayTd[j].children[0].style.background = "#CD001C"
        checkButton.classList.add("wrong")
        checkButton.classList.remove("cta-primary")
        checkButton.removeAttribute("onclick")
        checkButton.innerHTML = "Неправильно"
        flag = false
      }
    }
  }

  if (flag) {
    checkButton.classList.add("correct")
    checkButton.classList.remove("cta-primary")
    checkButton.removeAttribute("onclick")
    checkButton.innerHTML = "Правильно"
  }
}

// ——————————————————————————————————————————
// Скидання гри до початкового стану
function retry() {
  const game_board = document.getElementById("game-board")
  if (game_board === null) return

  // Очищуємо лише N×N ігрове поле, не торкаючись «1» знизу та праворуч
  for (let i = 0; i < initial_square.length; i++) {
    const arrayTd = game_board.children[i].children
    for (let j = 0; j < initial_square.length; j++) {
      const divImageWrapper = arrayTd[j].children[0]
      if (!divImageWrapper.id.includes("game-board-base-element")) {
        arrayTd[j].replaceChild(emptyCellGenerator(), divImageWrapper)
        arrayTd[j].style.background = "white"
      }
    }
  }

  if (document.getElementById("check").getAttribute("onclick") === null)
    restoreCheckButton()
}

// ——————————————————————————————————————————
// Виділяє один елемент, вимикаючи перевірки
function selectOneItem() {
  const gameBoard = document.getElementById("game-board")
  const pullBoard = document.getElementById("table-pull")
  const checkButton = document.getElementById("check")
  const generateButton = document.getElementById("generate")
  const retryButton = document.querySelector("body footer button")

  if (gameBoard) {
    gameBoard.style.border = "3px solid red"
    Array.from(gameBoard.children).forEach(tr =>
      Array.from(tr.children).forEach(td => (td.style.border = "3px solid red"))
    )
  }

  if (pullBoard) {
    pullBoard.style.border = "3px solid red"
    Array.from(pullBoard.children).forEach(tr =>
      Array.from(tr.children).forEach(td => (td.style.border = "3px solid red"))
    )
  }

  generateButton.classList.replace("cta-primary", "cta-primary-js-one-item")
  generateButton.innerHTML = "Виділіть будь-ласка тільки один елемент"
  generateButton.style.fontSize = "0.8em"
  generateButton.style.width = "450px"

  checkButton.classList.replace("cta-primary", "cta-primary-js-one-item")
  checkButton.innerHTML = "Виділіть будь-ласка тільки один елемент"
  checkButton.removeAttribute("onclick")

  retryButton.removeAttribute("onclick")
}

// ——————————————————————————————————————————
// Відновлює після selectOneItem()
function restoreAfterSelectOneItem() {
  const gameBoard = document.getElementById("game-board")
  const pullBoard = document.getElementById("table-pull")
  const checkButton = document.getElementById("check")
  const generateButton = document.getElementById("generate")
  const retryButton = document.querySelector("body footer button")

  if (gameBoard) {
    gameBoard.style.border = "3px solid #5B9BD5"
    Array.from(gameBoard.children).forEach(tr =>
      Array.from(tr.children).forEach(td => (td.style.border = "3px solid #5B9BD5"))
    )
  }

  if (pullBoard) {
    pullBoard.style.border = "3px solid #5B9BD5"
    Array.from(pullBoard.children).forEach(tr =>
      Array.from(tr.children).forEach(td => (td.style.border = "3px solid #5B9BD5"))
    )
  }

  generateButton.classList.replace("cta-primary-js-one-item", "cta-primary")
  generateButton.innerHTML = "Створити"
  generateButton.style.fontSize = "1.2em"
  generateButton.style.width = "156px"

  checkButton.classList.replace("cta-primary-js-one-item", "cta-primary")
  checkButton.innerHTML = "Перевірити"
  checkButton.setAttribute("onclick", "check()")

  retryButton.setAttribute("onclick", "retry()")
}

// ——————————————————————————————————————————
// Зчитуємо дані з drop-down та налаштовуємо VALUES
function fillData() {
  VALUES = []
  TYPE = dropDown.getAttribute("selectedType")
  let selectedArray = []
  let isOrderSelected = false

  if (orderInput.value !== "") isOrderSelected = true

  switch (TYPE) {
    case "IMAGE": {
      Array.from(dropDown.children).forEach(el => {
        if (el.getAttribute("selected") === "true")
          selectedArray.push(el.getAttribute("src"))
      })
      break
    }
    case "PIXEL": {
      Array.from(dropDown.children).forEach(el => {
        if (el.getAttribute("selected") === "true")
          selectedArray.push(el.getAttribute("src"))
      })
      break
    }
    case "SMILES": {
      Array.from(dropDown.children).forEach(el => {
        if (el.getAttribute("selected") === "true")
          selectedArray.push(el.getAttribute("src"))
      })
      break
    }
    case "UKR_LETTERS": {
      const input = dropDown.children[0]
      selectedArray = input.value.split(/\s|,/g)
      selectedArray = selectedArray.filter(el => el !== "")
      for (let i = 0; i < selectedArray.length; i++) {
        selectedArray[i] = selectedArray[i].toLowerCase()
        if (selectedArray[i].length !== 1) {
          lettersInputError("Літера - один знак. Вводи будь-ласка по одному символу.")
          return
        }
        if (!allUkrainianLetters.includes(selectedArray[i])) {
          lettersInputError("Вводи будь-ласка тільки українські маленькі літери.")
          return
        }
        for (let j = 0; j < selectedArray.length; j++) {
          if (j === i) continue
          if (selectedArray[j] === selectedArray[i]) {
            lettersInputError("Вводи будь-ласка кожну літеру тільки один раз")
            return
          }
        }
      }
      break
    }
  }

  switch (true) {
    case selectedArray.length === 0: {
      switch (TYPE) {
        case "IMAGE": {
          VALUES = allImages
          break
        }
        case "PIXEL": {
          VALUES = allpixels
          break
        }
        case "SMILES": {
          VALUES = allsmiles
          break
        }
        case "UKR_LETTERS": {
          VALUES = allUkrainianLetters
          break
        }
      }
      break
    }
    case !isOrderSelected: {
      if (selectedArray.length === 1) {
        changeTextInGenerateButton("Оберіть щонайменше два елементи")
        return
      }
      VALUES = selectedArray
      N = selectedArray.length.toString()
      break
    }
    case selectedArray.length === Number(N) && isOrderSelected: {
      VALUES = selectedArray
      break
    }
    case selectedArray.length !== Number(N) && isOrderSelected: {
      changeTextInGenerateButton(
        "Оберіть кількість елементів відповідно до порядку квадрата",
        "0.7em"
      )
      return
    }
  }
}

// ——————————————————————————————————————————
// Обробка помилок введення літер
function lettersInputError(message) {
  const input = dropDown.children[0]
  lastInput = input.value
  input.value = message
  input.classList.add("wrong-input")
}
