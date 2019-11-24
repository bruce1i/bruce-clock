const {ipcRenderer} = require('electron')
const ONE_SECOND = 1000
const monthList = ['Jan.', 'Feb.', 'Mar.', 'Apr.', 'May', 'Jun.', 'Jul.', 'Aug.', 'Sep.', 'Oct.', 'Nov.', 'Dec.']
const $app = document.getElementById('app')
const $time = document.getElementById('time')
const $eye = document.getElementById('eye')
let timerId

function getCurrentDateString() {
    const currDate = new Date()

    return `${monthList[currDate.getMonth()]} ${currDate.getDate()}`
}

function getCurrentTimeString() {
    const currDate = new Date()

    return `${currDate.getHours()}:${String(currDate.getMinutes()).padStart(2, '0')}`
}

function showDate() {
    clearTimeout(timerId)
    $app.classList.add('date')
    $time.innerHTML = getCurrentDateString()

    timerId = setTimeout(showTime, 3 * ONE_SECOND)
}

function showTime() {
    clearTimeout(timerId)
    $app.classList.remove('date')
    $time.innerHTML = getCurrentTimeString()

    timerId = setTimeout(showTime, 10 * ONE_SECOND)
}

function closeWin() {
    clearTimeout(timerId)
    ipcRenderer.send('close-index-win')
}

function hideWin() {
    ipcRenderer.send('hide-index-win')
}

function toggleGhostWin() {
    $app.classList.toggle('ghost')
    showTime()
}

showTime()

$app.onclick = () => {
    showDate()
}

$app.ondblclick = () => {
    toggleGhostWin()
}

$app.oncontextmenu = () => {
    closeWin()
}

$eye.onmouseenter = () => {
    hideWin()
}
