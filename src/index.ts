import { app, BrowserWindow, Menu, MenuItem, globalShortcut, shell, ipcMain as ipc } from "electron"
import defaultMenu from "electron-default-menu";

let mainWindow



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
  

const template = defaultMenu(app,shell);
const menu = Menu.buildFromTemplate(template);


const keyType = (element:string) => {
  if  (element <= '9' && element >= '0') {
    return 'Digit' + element;
  } else {
    return 'Key' + element;
  }
}


 



  console.log('List of menu shortcuts', getReservedAcceleratorShortcuts(menu));
  const reservedAcceleratorShortcuts = getReservedAcceleratorShortcuts(menu);
  const userDefinedKeySettings = reservedAcceleratorShortcuts.map((modKey) => {
    var keyCode = modKey.split('+')[ modKey.split('+').length-1];
    if (keyCode.length===1) { 
      keyCode = keyType(keyCode);
    }
    var info = {modifierByte: ((modKey.includes('Alt+')? 1:0)  + (modKey.includes('Cmd+')? 2:0)  +(modKey.includes('Ctrl+')? 2:0)  +(modKey.includes('Shift+')? 4:0)), keyboardEventCode: keyCode}
    return info; 
  });
console.log('List of modfifier keys in byte form ', userDefinedKeySettings);


Menu.setApplicationMenu(menu);



  
  mainWindow.loadFile(`index.html`)
  mainWindow.webContents.on('before-input-event', (event, input) => {
    const keyboardModifierStatusByte = process.platform === 'darwin' ? (input.alt? 1:0)  + (input.meta? 2:0) + (input.shift?4:0) : (input.alt? 1:0)  + (input.control? 2:0) + (input.shift?4:0)
    if (userDefinedKeySettings.filter((element)=> { return (element.modifierByte===keyboardModifierStatusByte && element.keyboardEventCode === input.code); } )[0]!==undefined) {
      const modifierKeyString = process.platform === 'darwin' ? (input.alt? 'Alt+':'')  + (input.meta? 'Cmd+':'') + (input.shift?'Shift':'') : (input.alt? 'Alt+':'')  + (input.control? 'Ctrl+':'') + (input.shift?'Shift+':'')
      const keyCode = input.code.includes('Key')?input.code.replace('Key',''):input.code.includes('Digit')?input.code.replace('Digit',''):input.code;
      const modifierPlusKey = modifierKeyString + keyCode;
      console.log('Event is ', event.type);
      console.log('The key combination', modifierPlusKey, 'is already registered');
    }
  }
  )
}


app.whenReady().then(createWindow);

ipc.on('RegisterGlobalShortcut', (event,args) => {
  console.log('A request for registration has been received. The keyboard shortcut', args,'is to be registered');
  let win = BrowserWindow.getFocusedWindow();
  if (win) {
  globalShortcut.register(args.split(',')[0]+args.split(',')[1], () => {win?.webContents.send('ShortcutEvent',args)});
  }
});