const {
    app,
    BrowserWindow,
    ipcMain,
    screen
} = require('electron')
const tray = require('./tray')
const startup = require('./startup')

const ONE_SECOND = 1000
const LOOP_TIME = 10 * ONE_SECOND
const INDEX_WIN_WIDTH = 78
const INDEX_WIN_HEIGHT = 30
let indexWin
let mainTimerId
let checkingTime
let hideTimerId
let moveTimerId

function startupCheck() {
    startup.repairStartup()
}

function createTray() {
    tray.create()

    tray.item('startup').checked = startup.checkStartup()
    tray.item('startup').click = (item) => {
        startup.setStartup(item.checked)
    }

    tray.item('quit').click = () => {
        quitApp()
    }

    tray.on('click', () => {
        showIndexWin()
    })

    tray.refresh()
}

function showIndexWin() {
    if (indexWin) {
        indexWin.showInactive()
        indexWin.setAlwaysOnTop(true)
        indexWin.setSkipTaskbar(true)
        // indexWin.moveTop()
    } else {
        const {size} = screen.getPrimaryDisplay()
        const x = size.width - INDEX_WIN_WIDTH
        const y = 0

        indexWin = new BrowserWindow({
            // width: 800,
            // height: 600,
            width: INDEX_WIN_WIDTH,
            height: INDEX_WIN_HEIGHT,
            x: x,
            y: y,
            frame: false,
            resizable: false,
            alwaysOnTop: true,
            transparent: true,
            skipTaskbar: true,
            webPreferences: {
                nodeIntegration: true
            }
        })
        // indexWin.webContents.openDevTools() // 关闭开发者工具窗口才可以窗体透明

        indexWin.on('minimize', () => {
            /**
             * 在触发最小化事件前，会先触发move事件，清空上一次的move定时器，防止卡死进程。
             */
            clearTimeout(moveTimerId)

            setTimeout(() => {
                indexWin.show()
            }, 0)
        })

        indexWin.on("move", () => {
            restoreIndexWinToDefaultPosition()
        })

        indexWin.loadFile('src/windows/index.html')
    }
}

function hideIndexWin() {
    clearTimeout(hideTimerId)

    if (indexWin) {
        indexWin.hide()

        hideTimerId = setTimeout(() => {
            // indexWin.showInactive()
            showIndexWin()
        }, 5 * ONE_SECOND)
    }
}

function closeIndexWin() {
    if (indexWin) {
        indexWin.destroy()
        indexWin = null
    }
}

function restoreIndexWinToDefaultPosition() {
    /**
     * 当插拔外接显示器时，造成屏幕轻微闪烁，会对浮层位置产生一点点偏移；
     * 在长时间睡眠后唤醒，也会造成位置偏移；
     * 这用来修复当产生偏移时，还原默认位置。
     *
     * 注意：窗口收到最小化事件时，最先会触发move事件，所以延迟1s后进行检测，防止一直触发move事件卡死进程。
     */
    clearTimeout(moveTimerId)

    moveTimerId = setTimeout(() => {
        if (indexWin == null) return

        const [currX, currY] = indexWin.getPosition()
        const {size} = screen.getPrimaryDisplay()
        const x = size.width - INDEX_WIN_WIDTH
        const y = 0

        if (currX !== x || currY !== y) {
            indexWin.setPosition(x, y)
        }
    }, ONE_SECOND)
}

function generateCheckingTime() {
    const currDate = new Date()

    checkingTime = new Date(
        currDate.getFullYear(),
        currDate.getMonth(),
        currDate.getDate(),
        currDate.getHours(),
        currDate.getMinutes() >= 30 ? 60 : 30)
}

function startLoopingTip() {
    generateCheckingTime()

    mainTimerId = setInterval(() => {
        if (Date.now() >= checkingTime.getTime()) {
            showIndexWin()
            generateCheckingTime()
        }
    }, LOOP_TIME)
}

function handleMainProcess() {
    startupCheck()
    createTray()
    showIndexWin()
    startLoopingTip()

    ipcMain.on('close-index-win', () => {
        closeIndexWin()
    })

    ipcMain.on('hide-index-win', () => {
        hideIndexWin()
    })
}

function quitApp() {
    clearInterval(mainTimerId)
    clearTimeout(hideTimerId)
    closeIndexWin()
    app.quit()
}

app.on('ready', handleMainProcess)

app.on('window-all-closed', () => {
    // 如果你没有监听此事件并且所有窗口都关闭了，默认的行为是控制退出程序
})
