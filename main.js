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
            label: 'v1.0.1'
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

    tray.setToolTip('Bruce Clock')
    tray.setContextMenu(contextMenu)
    tray.on('click', onLeftClick)
}

function createIndexWin() {
    if (indexWin) {
        indexWin.showInactive()
    } else {
        const screenDisplay = screen.getPrimaryDisplay()

        indexWin = new BrowserWindow({
            width: 78,
            height: 30,
            // width: 800,
            // height: 600,
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

    ipcMain.on('hide-index-win', () => {
        indexWin.hide()

        setTimeout(() => {
            indexWin.showInactive()
        }, 5 * ONE_SECOND)
    })
}

app.on('ready', handleMainProcess)

app.on('window-all-closed', () => {
    // 如果你没有监听此事件并且所有窗口都关闭了，默认的行为是控制退出程序
})
