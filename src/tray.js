const {Tray, Menu} = require('electron')
const path = require('path')
const {version, description} = require('../package')

const contextMenu = [
    {
        label: `v${version}`
    },
    {
        type: 'separator'
    },
    {
        id: 'startup',
        label: 'Run at startup',
        type: 'checkbox',
        checked: false
    },
    {
        id: 'quit',
        label: 'Quit'
    }
]

let tray

const create = () => {
    tray = new Tray(path.join(__dirname, 'assets', 'tray-icon.png'))
    tray.setToolTip(description)
    tray.setContextMenu(Menu.buildFromTemplate(contextMenu))
}

const item = (id) => {
    return contextMenu.find(item => item.id === id)
}

const refresh = () => {
    tray.setContextMenu(Menu.buildFromTemplate(contextMenu))
}

const on = (event, listener) => {
    tray.on(event, listener)
}

module.exports = {
    item,
    create,
    refresh,
    on
}
