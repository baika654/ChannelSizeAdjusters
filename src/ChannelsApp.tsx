import React, {Component}  from 'react'
import styled from "styled-components"
import { ipcRenderer as ipc} from 'electron'
import ShortcutManager from './shortcut-manager'



interface State {
  eventKeyModifier:string;
  eventCode:string;
}

type BGColorIndex = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;

const backgroundColor = (colorIndex: BGColorIndex, alpha = 1.0): string => {
  const value = 5 + colorIndex * 6;
  return `rgba(${value},${value},${value},${alpha})`;
}

const keyType = (element:string) => {
  if  (element <= '9' && element >= '0') {
    return 'Digit' + element;
  } else {
    return 'Key' + element;
  }
}


const reservedKeyCombinations = ['Control+KeyG',
'Control+KeyH',
'Control+KeyI',
'Control+KeyN',
'Control+KeyP',
'Control+KeyR',
'Control+KeyT',
'Control+KeyZ',
'F4',
'Control+Shift+KeyA',
'Control+Shift+KeyC',
'Control+Shift+KeyD',
'Control+Shift+KeyE',
'Control+Shift+f4',
'Control+Shift+KeyH',
'Control+Shift+KeyL',
'Control+Shift+KeyN',
'Control+Shift+KeyO',
'Control+Shift+KeyP',
'Control+Shift+KeyR',
'Control+Shift+KeyS',
'Control+Shift+KeyV',
'Control+Shift+KeyZ'];

const OrangeLetterContainer = styled.div`
    
    width: 100%;
    color: orange;
    text-align: center;
    font-weight: 400;
    font-family: UIFontregular, sans-serif;
    font-size: 14px;
    padding: 20px 20px 20px 20px
 `;

 const GrayFont = styled.div`
    
 width: 100%;
 color: rgb(169,169,169);
 text-align: center;
 font-weight: 400;
 font-family: UIFontregular, sans-serif;
 font-size: 20px;
 padding: 25px 50px 25px 50px; 
`;

const ShortTextFont = styled.div`
    
 
 color: rgb(150,150,150);
 text-align: center;
 font-weight: 200;
 font-family: UIFontregular, sans-serif;
 font-size: 18px;
  
`;

const WidgetContainer = styled.div`
    
width: 100%;
height: 60px;
background-color: transparent;
display: flex;
align-items: center;
justify-content: space-around;
padding: 25px; 
`;

const ResetButton = styled.button`
  display: inline-block;
  background: transparent;
  height: 25px;
  color: royalblue;
  font-size: 14px;
  padding: 2px;
  border: 2px solid royalblue;
  border-radius: 4px;
`;

const UseKeyButton = styled.button`
  display: inline-block;
  background: cornflowerblue;
  height: 25px;
  color: gray;
  font-size: 14px;
  padding: 2px;
  border: 2px none blue;
  border-radius: 4px;
`;

 const StringContainer = styled.div`
    
    width: 200px;
    height: 35px;
    color: white;
    font-size: 20px;
    text-align: center;
    border-radius: 5px;
    border: 1px solid gray;
    background-color: ${backgroundColor(1)};
    
 `;

const ModalBackground = styled.div`
   height: 100%;
   width: 100%;
   background-color: rgba(0,0,0,0.7);
   position: absolute;
   top: 0;
   display: flex;
   justify-content: center;
   align-items: center;
`;

const ModalBox = styled.div`
  width: 500px;
  height: 300px;
  background-color: ${backgroundColor(6)};
  border: 1px solid black;
  border-radius: 10px;
  box-shadow: 0px 0px 10px black;
  input:focus, textarea:focus, select:focus{ outline: none;};
`;

const persistentShortCutKeys = [
  {modifierByte:2, keyboardEventCode: 'Digit1'},
  {modifierByte:2, keyboardEventCode: 'Digit2'},
  {modifierByte:2, keyboardEventCode: 'Digit3'},
  {modifierByte:2, keyboardEventCode: 'Digit4'},
  {modifierByte:2, keyboardEventCode: 'Digit5'},
  {modifierByte:2, keyboardEventCode: 'Digit6'},
  {modifierByte:2, keyboardEventCode: 'Digit7'},
  {modifierByte:2, keyboardEventCode: 'Digit8'},
  {modifierByte:2, keyboardEventCode: 'Digit9'},
  {modifierByte:2, keyboardEventCode: 'Digit0'},
  {modifierByte:1, keyboardEventCode: 'Digit1'},
  {modifierByte:1, keyboardEventCode: 'Digit2'},
  {modifierByte:1, keyboardEventCode: 'Digit3'},
  {modifierByte:1, keyboardEventCode: 'Digit4'},
  {modifierByte:1, keyboardEventCode: 'Digit5'},
  {modifierByte:1, keyboardEventCode: 'Digit6'},
  {modifierByte:1, keyboardEventCode: 'Digit7'},
  {modifierByte:1, keyboardEventCode: 'Digit8'},
  {modifierByte:1, keyboardEventCode: 'Digit9'},
  {modifierByte:1, keyboardEventCode: 'Digit0'} 
]; 

interface Props {

}

class ChannelsApp extends Component<Props, State> {
  
    state:State;
    keyInputBuffer:string ='';
    modifier:boolean = false;
    horizontalBarIndex:number=0;
    divElement:React.RefObject<HTMLDivElement>;
    shortcutManager:ShortcutManager;
    
    
    
    constructor(props: Props) {
      super(props);

      
      console.log("Constructor called");
      this.handleClick = this.handleClick.bind(this)
      this.divElement = React.createRef();
      
      let leftover:number = 0;
      
      this.state = {
        eventKeyModifier:"", 
        eventCode:""
      }
      
      /* Create ShortcutManager object. This will automatically scan in accelerator shortcuts into the object*/
      this.shortcutManager = new ShortcutManager(props);

      
      /* Register all global shortcuts */        
      persistentShortCutKeys.forEach((element) => {
        const modifierKeyString = process.platform === 'darwin' ? (element.modifierByte&1? 'Alt+':'')  + (element.modifierByte&2? 'Cmd+':'') + (element.modifierByte&4?'Shift':'') : (element.modifierByte&1? 'Alt+':'')  + (element.modifierByte&2? 'Ctrl+':'') + (element.modifierByte&4?'Shift+':'')
        const keyCode = element.keyboardEventCode.includes('Key')?element.keyboardEventCode.replace('Key',''):element.keyboardEventCode.includes('Digit')?element.keyboardEventCode.replace('Digit',''):element.keyboardEventCode; 
        console.log('Shortcut being registered is ', modifierKeyString+keyCode);
        this.shortcutManager.registerGlobalShortcut(modifierKeyString,keyCode);
      });

      /* Add an event listener to document to listen for any shortkeyEvents */
      if (this.shortcutManager) {
        document.addEventListener('build', function(event: any) {
          const keyInputInfoDetail = event.detail.keyInputInfo;  
          console.log('The following keypress has been detected : ',keyInputInfoDetail);
        });
      }

      
    }


    componentDidMount() {
      this.divElement.current?.focus();
    }

 
render() {

  const modifierKeyInput = this.state.eventKeyModifier; 
  const codeInput = this.state.eventCode; 
  const keyInputWithModifier = modifierKeyInput===''? '': modifierKeyInput+codeInput;    
    
  return (
      <div>
      <button type="button">OpenModal</button>    
      <ModalBackground >
        <ModalBox ref={this.divElement} className="ChannelApp-Top-Div" tabIndex={0} onKeyDown={this.handleClick} >
          <GrayFont>
            Press a key combination to trigger this annotation preset
          </GrayFont>
          <WidgetContainer>
            <ShortTextFont>Shortcut key:</ShortTextFont>
            <StringContainer>
              {keyInputWithModifier}
            </StringContainer>
            <ResetButton>Reset</ResetButton>
            <UseKeyButton>Use this key</UseKeyButton>
          </WidgetContainer>
          <OrangeLetterContainer>
              {reservedKeyCombinations.includes(this.keyInputBuffer)? 'That combination is being used elsewhere in Lightning (another preset annotation or accelerator shortcut)' : ''}
          </OrangeLetterContainer>
        </ModalBox>
      </ModalBackground>
      </div>
  )
}



handleClick(event: React.KeyboardEvent<HTMLDivElement>):void {
  console.log(`Key: ${event.key} with code ${event.nativeEvent.code} has been pressed`);
  const modifierKeyString = process.platform === 'darwin' ? (event.altKey? 'Alt+':'')  + (event.metaKey? 'Cmd+':'') + (event.shiftKey?'Shift':'') : (event.altKey? 'Alt+':'')  + (event.ctrlKey? 'Control+':'') + (event.shiftKey?'Shift+':'')
  let eventCode:string;
  if (event.nativeEvent.code.includes('Alt')||event.nativeEvent.code.includes('Control')||event.nativeEvent.code.includes('Shift')||event.nativeEvent.code.includes('Meta')) {
    eventCode = '';
  } else {
    eventCode = event.nativeEvent.code;
  }
  this.setState({eventKeyModifier: modifierKeyString, eventCode: eventCode});
  event.preventDefault();
}


}

export default ChannelsApp;
