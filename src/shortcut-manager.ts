import React, {Component}  from 'react'
import styled from "styled-components"
import { ipcRenderer as ipc} from 'electron'


const keyType = (element:string) => {
  if  (element <= '9' && element >= '0') {
    return 'Digit' + element;
  } else {
    return 'Key' + element;
  }
}

export default class ShortcutManager extends Component {
  
    
    keyInputBuffer:string ='';
    modifier:boolean = false;
    globalShortcutEvents:any;
    eventKeyModifier:string='';
    eventCode:string='';
    
    
    
    
  constructor(props:any) {
    super(props); 

    /* Get all accelerator shortcuts by messaging main thread */
    let reply = ipc.sendSync('GetAllAcceleratorShortcuts');
    if (reply!=='NoMenu') {
      const reservedAcceleratorShortcuts = reply.split(',');
      const userDefinedKeySettings = reservedAcceleratorShortcuts.map((modKey:string) => {
        var keyCode = modKey.split('+')[ modKey.split('+').length-1];
      if (keyCode.length===1) { 
        keyCode = keyType(keyCode);
      }
      var info = {modifierByte: ((modKey.includes('Alt+')? 1:0)  + (modKey.includes('Cmd+')? 2:0)  +(modKey.includes('Ctrl+')? 2:0)  +(modKey.includes('Shift+')? 4:0)), keyboardEventCode: keyCode}
      return info; 
      });
      console.log('List of modfifier keys in byte form ', userDefinedKeySettings);
      } 

      /* Set up a IPC listener to check for activated global shortcuts. Passed through as an event on the document */
    
    let globalShortcutEvents = ipc.on('ShortcutEvent', (event,args) => {
      if (args.split(',').length===2) {
        const onShortcutKeyPress = new CustomEvent('build', {detail: {keyInputInfo: args}});
        document.dispatchEvent(onShortcutKeyPress);
      }
      console.log('The following shortcut',args,'has been fired');
      
    });
    }  
    
    /* This method registers a global shortcut key by messaging electron the details */ 
    registerGlobalShortcut(modifierKeyString:string, keyCode:string):void {
    ipc.send('RegisterGlobalShortcut',modifierKeyString+','+keyCode);
    }

    

}          