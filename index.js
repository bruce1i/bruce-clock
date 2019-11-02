const {ipcRenderer} = require('electron')
const ONE_SECOND = 1000
const $app = document.getElementById('app')
const $time = document.getElementById('time')
const $eye = document.getElementById('eye')
let timerId

function getCurrentTimeString() {
    const currDate = new Date()

    return `${currDate.getHours()}:${String(currDate.getMinutes()).padStart(2, '0')}`
}

function showTime() {
    $time.innerHTML = getCurrentTimeString()

    timerId = setTimeout(showTime, 10 * ONE_SECOND)
}

showTime()

$app.onclick = () => {
    clearTimeout(timerId)
    ipcRenderer.send('close-index-win')
}

$eye.onmouseenter = () => {
    ipcRenderer.send('hide-index-win')
}
