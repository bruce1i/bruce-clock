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
let timerId
let checkingTime

function createTray() {
    tray = new Tray(path.join(__dirname, '/assets/tray-icon.png'))

    const contextMenu = Menu.buildFromTemplate([
        {
            label: 'v1.0.0'
        },
        {
            label: 'Quit',
            click: () => {
                indexWin = null
                clearInterval(timerId)
                app.quit()
            }
        }
    ])
    const onLeftClick = () => {
        createIndexWin()
    }

    tray.setToolTip('Bruce Time')
    tray.setContextMenu(contextMenu)
    tray.on('click', onLeftClick)
}

function createIndexWin() {
    if (indexWin) {
        indexWin.show()
    } else {
        const screenDisplay = screen.getPrimaryDisplay()

        indexWin = new BrowserWindow({
            width: 60,
            height: 30,
            x: screenDisplay.size.width - 60,
            y: 0,
            frame: false,
            resizable: false,
            alwaysOnTop: true,
            transparent: true,
            webPreferences: {
                nodeIntegration: true
            }
        })
        indexWin.loadFile('index.html')
    }
}

function destroyIndexWin() {
    indexWin.destroy()
    indexWin = null
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

    timerId = setInterval(() => {
        if (Date.now() >= checkingTime.getTime()) {
            createIndexWin()
            generateCheckingTime()
        }
    }, LOOP_TIME)
}

function handleMainProcess() {
    createTray()
    createIndexWin()
    startLoopingTip()

    ipcMain.on('close-index-win', () => {
        destroyIndexWin()
    })
}

app.on('ready', handleMainProcess)

app.on('window-all-closed', () => {
    // 如果你没有监听此事件并且所有窗口都关闭了，默认的行为是控制退出程序
})
