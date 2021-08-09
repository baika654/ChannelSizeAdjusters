import { app, BrowserWindow, Menu, MenuItem, globalShortcut } from "electron"

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
  {modifierByte:6,keyboardEventCode:"KeyA"},
  {modifierByte:6,keyboardEventCode:"KeyC"},
  {modifierByte:6,keyboardEventCode:"KeyD"},
  {modifierByte:6,keyboardEventCode:"KeyE"},
  {modifierByte:6,keyboardEventCode:"F4"},
  {modifierByte:6,keyboardEventCode:"KeyH"},
  {modifierByte:6,keyboardEventCode:"KeyL"},
  {modifierByte:6,keyboardEventCode:"KeyN"},
  {modifierByte:6,keyboardEventCode:"KeyO"},
  {modifierByte:6,keyboardEventCode:"KeyP"},
  {modifierByte:6,keyboardEventCode:"KeyR"},
  {modifierByte:6,keyboardEventCode:"KeyS"},
  {modifierByte:6,keyboardEventCode:"KeyV"},
  {modifierByte:6,keyboardEventCode:"KeyZ"},
  {modifierByte:2,keyboardEventCode:"space"}
];

function isDevelopment():boolean {
  return (
    process.env.NODE_ENV !== 'production' && process.env.NODE_ENV !== 'test'
   );
  
}

/** This function iterates its way through a menu tree checking for any accelerator short-key conflicts before returning
 * a set of value accelerator key shortcuts. Any accelerator key shortcut conflicts are logged on the console if in developer mode.
 *  @param menu - a reference to the top level of a menu tree.
 *  @returns - an array of all accelerator keys registered to the application
 *
 */

 function getReservedAcceleratorShortcuts(menu: Menu): string[] {
  if (!menu) return [];
  const acceleratorShortcuts: Map<string, string> = new Map();

  function checkBranch(menu: Menu) {
     menu?.items.forEach((menuItem) => {
        if (menuItem.submenu) {
           checkBranch(menuItem.submenu);
        } else {
           if (!menuItem.accelerator) return;

           const existingAccelerator = acceleratorShortcuts.get(
              menuItem.accelerator.toString()
           );
           if (existingAccelerator) {
              if (isDevelopment())
                 console.log(
                    'The accelerator',
                    menuItem.accelerator,
                    'associated with label ',
                    menuItem.label,
                    ' conflicts with another label',
                    existingAccelerator
                 );
           } else {
              acceleratorShortcuts.set(
                 menuItem.accelerator.toString(),
                 menuItem.label
              );
           }
        }
     });
  }

  checkBranch(menu);

  return [...acceleratorShortcuts.keys()];
}



function createWindow() {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true, // this line is very important as it allows us to use `require` syntax in our html file.
    },
  })
  
const template = [ {label:'Help'}, {label:'File'}, {label:'Edit'}, {label: 'View'}, { label: 'Krittaphol',
submenu: [{ label: '&Wirash', accelerator: process.platform === 'darwin' ? 'Cmd+W': 'Ctrl+W' , click: () => { console.log('Wirash')}},
{ label: '&Wanpen', accelerator: process.platform === 'darwin' ? 'Cmd+W': 'Ctrl+W' , click: () => { console.log('Wanpen')}},
{ label: '&Warit', accelerator: process.platform === 'darwin' ? 'Cmd+W': 'Ctrl+W' , click: () => { console.log('Wirat')}}]},
{ label: 'RoundTree',
submenu: [{ label: '&Torvid', accelerator: process.platform === 'darwin' ? 'Cmd+T': 'Ctrl+T' , click: () => { console.log('Torvid')}},
{ label: '&Sven', accelerator: process.platform === 'darwin' ? 'Cmd+S': 'Ctrl+S' , click: () => { console.log('Sven')}},
{ label: '&Hannah', submenu: [{ label: 'Katie', accelerator: process.platform === 'darwin' ? 'Cmd+K': 'Ctrl+K' , click: () => { console.log('Katie')}},
{ label: '&Paul', accelerator: process.platform === 'darwin' ? 'Cmd+P': 'Ctrl+P' , click: () => { console.log('Paul')}},
{ label: '&Amy', accelerator: process.platform === 'darwin' ? 'Cmd+A': 'Ctrl+A' , click: () => { console.log('Amy')}}]}]
}];

const menu = Menu.buildFromTemplate (template);

menu.append(new MenuItem({
  label: 'Krittaphol',
  submenu: [{
    label: '&Woravimol', 
    accelerator: process.platform === 'darwin' ? 'Cmd+W' : 'Ctrl+W',
    click: () => { console.log('Pummy rocks!') }
  }]
}))

console.log('List of menu shortcuts', getReservedAcceleratorShortcuts(menu));
const reservedAcceleratorShortcuts = getReservedAcceleratorShortcuts(menu);
const keyboardModifierStatusByte = reservedAcceleratorShortcuts.map((modKey) =>  ((modKey.includes('Alt+')? 1:0)  + (modKey.includes('Cmd+')? 2:0)  +(modKey.includes('Ctrl+')? 2:0)  +(modKey.includes('Shift+')? 4:0)));
console.log('List of modfifier keys in byte form ', keyboardModifierStatusByte);


console.log(
  globalShortcut.isRegistered('Ctrl+W')
     ? 'The Ctrl+W button is already registered!'
     : 'The Ctrl+W button is not registered!'
);



Menu.setApplicationMenu (menu); 


  
console.log(
  globalShortcut.isRegistered('Ctrl+W')
     ? 'The Ctrl+W button is already registered!'
     : 'The Ctrl+W button is not registered!'
);  
  
  mainWindow.loadFile(`index.html`)
  mainWindow.webContents.on('before-input-event', (event, input) => {
    const keyboardModifierStatusByte = process.platform === 'darwin' ? (input.alt? 1:0)  + (input.meta? 2:0) + (input.shift?4:0) : (input.alt? 1:0)  + (input.control? 2:0) + (input.shift?4:0)
    if (userDefinedKeySettings.filter((element)=> { return (element.modifierByte===keyboardModifierStatusByte && element.keyboardEventCode === input.code); } )[0]!==undefined) {
      const modifierKeyString = process.platform === 'darwin' ? (input.alt? 'Alt+':'')  + (input.meta? 'Cmd+':'') + (input.shift?'Shift':'') : (input.alt? 'Alt+':'')  + (input.control? 'Ctrl+':'') + (input.shift?'Shift+':'')
      const keyCode = input.code.includes('Key')?input.code.replace('Key',''):input.code.includes('Digit')?input.code.replace('Digit',''):input.code;
      const modifierPlusKey = modifierKeyString + keyCode;
      console.log('The key combination', modifierPlusKey, 'is already registered');
    }
  } 
  )
}

app.whenReady().then(createWindow)