import { app, BrowserWindow } from "electron"

let mainWindow

const userDefinedKeySettings = [
  {modifierByte:2,keyboardEventCode:"KeyG"},
  {modifierByte:2,keyboardEventCode:"KeyH"},
  {modifierByte:2,keyboardEventCode:"KeyI"},
  {modifierByte:2,keyboardEventCode:"KeyN"},
  {modifierByte:2,keyboardEventCode:"KeyP"},
  {modifierByte:2,keyboardEventCode:"KeyR"},
  {modifierByte:2,keyboardEventCode:"KeyT"},
  {modifierByte:2,keyboardEventCode:"KeyZ"},
  {modifierByte:0,keyboardEventCode:"F4"},
  {modifierByte:10,keyboardEventCode:"KeyA"},
  {modifierByte:10,keyboardEventCode:"KeyC"},
  {modifierByte:10,keyboardEventCode:"KeyD"},
  {modifierByte:10,keyboardEventCode:"KeyE"},
  {modifierByte:10,keyboardEventCode:"F4"},
  {modifierByte:10,keyboardEventCode:"KeyH"},
  {modifierByte:10,keyboardEventCode:"KeyL"},
  {modifierByte:10,keyboardEventCode:"KeyN"},
  {modifierByte:10,keyboardEventCode:"KeyO"},
  {modifierByte:10,keyboardEventCode:"KeyP"},
  {modifierByte:10,keyboardEventCode:"KeyR"},
  {modifierByte:10,keyboardEventCode:"KeyS"},
  {modifierByte:10,keyboardEventCode:"KeyV"},
  {modifierByte:10,keyboardEventCode:"KeyZ"},
  {modifierByte:2,keyboardEventCode:"space"},
  {modifierByte:4,keyboardEventCode:"KeyG"},
  {modifierByte:4,keyboardEventCode:"KeyH"},
  {modifierByte:4,keyboardEventCode:"KeyI"},
  {modifierByte:4,keyboardEventCode:"KeyN"},
  {modifierByte:4,keyboardEventCode:"KeyP"},
  {modifierByte:4,keyboardEventCode:"KeyR"},
  {modifierByte:4,keyboardEventCode:"KeyT"},
  {modifierByte:4,keyboardEventCode:"KeyZ"},
  {modifierByte:12,keyboardEventCode:"KeyA"},
  {modifierByte:12,keyboardEventCode:"KeyC"},
  {modifierByte:12,keyboardEventCode:"KeyD"},
  {modifierByte:12,keyboardEventCode:"KeyE"},
  {modifierByte:12,keyboardEventCode:"F4"},
  {modifierByte:12,keyboardEventCode:"KeyH"},
  {modifierByte:12,keyboardEventCode:"KeyL"},
  {modifierByte:12,keyboardEventCode:"KeyN"},
  {modifierByte:12,keyboardEventCode:"KeyO"},
  {modifierByte:12,keyboardEventCode:"KeyP"},
  {modifierByte:12,keyboardEventCode:"KeyR"},
  {modifierByte:12,keyboardEventCode:"KeyS"},
  {modifierByte:12,keyboardEventCode:"KeyV"},
  {modifierByte:12,keyboardEventCode:"KeyZ"},
  {modifierByte:4,keyboardEventCode:"space"}
];

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true, // this line is very important as it allows us to use `require` syntax in our html file.
    },
  })
  mainWindow.loadFile(`index.html`)
  mainWindow.webContents.on('before-input-event', (event, input) => {
    const keyboardModifierStatusByte = (input.alt? 1:0) + (input.control? 2:0) + (input.meta? 4:0) + (input.shift?8:0);
    if (userDefinedKeySettings.filter((element)=> { return (element.modifierByte===keyboardModifierStatusByte && element.keyboardEventCode === input.code); } )[0]!==undefined) {
      console.log('The key combination <some modifier key> and ', input.code , ' has been found');
    }
  } 
  )
}

app.whenReady().then(createWindow)