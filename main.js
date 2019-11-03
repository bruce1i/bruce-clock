const {
    app,
    BrowserWindow,
    Tray,
    Menu,
    ipcMain,
    screen
} = require('electron')
const path = require('path')

const ONE_SECOND = 1000
const LOOP_TIME = 10 * ONE_SECOND
let indexWin
let tray
let mainTimerId
let checkingTime
let hideTimerId

function createTray() {
    tray = new Tray(path.join(__dirname, '/assets/tray-icon.png'))

    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'v1.2.0'
        },
        {
            label: 'Quit',
            click: () => {
                quitApp()
            }
        }
    ])
    const onLeftClick = () => {
        showIndexWin()
    }

    tray.setToolTip('Bruce Clock')
    tray.setContextMenu(contextMenu)
    tray.on('click', onLeftClick)
}

function showIndexWin() {
    if (indexWin) {
        indexWin.showInactive()
    } else {
        const screenDisplay = screen.getPrimaryDisplay()

        indexWin = new BrowserWindow({
            // width: 800,
            // height: 600,
            width: 78,
            height: 30,
            x: screenDisplay.size.width - 78,
            y: 0,
            frame: false,
            resizable: false,
            alwaysOnTop: true,
            transparent: true,
            skipTaskbar: true,
            webPreferences: {
                nodeIntegration: true
            }
        })
        indexWin.loadFile('index.html')
        // indexWin.webContents.openDevTools() // 关闭开发者工具窗口才可以窗体透明
    }
}

function hideIndexWin() {
    clearTimeout(hideTimerId)

    if (indexWin) {
        indexWin.hide()

        hideTimerId = setTimeout(() => {
            indexWin.showInactive()
        }, 5 * ONE_SECOND)
    }
}

function closeIndexWin() {
    if (indexWin) {
        indexWin.destroy()
        indexWin = null
    }
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
