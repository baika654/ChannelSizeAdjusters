import React, {Component}  from 'react'
import ReactDOM from "react-dom"
import ChannelSepartors from "./channel-separators"
import {calculateDraggingChannelHeights} from "./make-lanes"
import styled from "styled-components"
import { observable, action } from "mobx"
import { globalShortcut, app, ipcRenderer as ipc, IpcRendererEvent, IpcMainEvent } from 'electron'

export interface channelItems {
  
  topPixel: number;
  height: number;
   
};


interface State {
  model: {
    lanes:{topPixel:number; height:number;}[];
  };
  interactive: boolean;
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

/*const state:State = {
  model:{
    lanes:[{topPixel:50, height:15}, {topPixel:100, height:15},{topPixel:150, height:15},{topPixel:200, height:15},{topPixel:250, height:15},{topPixel:300, height:15}],
  },
  interactive:true,

}*/



class ChannelsApp extends Component<Props, State> {
  
    state:State;
    windowHeight:number;
    @observable
    isMouseDown:boolean;
    dX: number;
    dY: number;
    @observable
    x: number;
    @observable
    y: number;
    pX: number;
    pY: number;
    keyInputBuffer:string ='';
    modifier:boolean = false;
    horizontalBarIndex:number=0;
    divElement:React.RefObject<HTMLDivElement>;
    
    
    
    constructor(props: Props) {
      super(props);

      const numberOfChannels = 8;
      console.log("Constructor called");
      this.mouseDownEvent = this.mouseDownEvent.bind(this);
      this.mouseUpEvent = this.mouseUpEvent.bind(this);
      this.mouseMoveEvent = this.mouseMoveEvent.bind(this);
      this.mouseDragEvent = this.mouseDragEvent.bind(this);
      this.handleClick = this.handleClick.bind(this)
      this.divElement = React.createRef();
      this.windowHeight=  window.document.body.offsetHeight;
      let arrayOfChannelItems:channelItems[] = [];
      let calculatedChannelHeight:number = window.document.body.offsetHeight / numberOfChannels;
      let cumulativeChannelHeight:number = 0;
      let leftover:number = 0;
      this.isMouseDown=false;
      this.dX= 0;
      this.dY= 0;
      this.x= 0;
      this.y= 0;
      this.pX= 0;
      this.pY= 0;
      for (let x =0; x < numberOfChannels; x++) {
        const roundedChannelHeight = Math.round(calculatedChannelHeight);
        leftover += roundedChannelHeight - calculatedChannelHeight;
        cumulativeChannelHeight += roundedChannelHeight;
        if (x==(numberOfChannels-1)) {
          cumulativeChannelHeight += leftover;
        }
        let channelItem:channelItems = {topPixel:cumulativeChannelHeight, height:15};
        arrayOfChannelItems.push(channelItem);
        
      }
      this.state = {
                model:{
                  lanes:arrayOfChannelItems,
                },
                interactive:true,
                eventKeyModifier:"", 
                eventCode:""
              }
      
      /* Register all global shortcuts */        
      persistentShortCutKeys.forEach((element) => {
        const modifierKeyString = process.platform === 'darwin' ? (element.modifierByte&1? 'Alt+':'')  + (element.modifierByte&2? 'Cmd+':'') + (element.modifierByte&4?'Shift':'') : (element.modifierByte&1? 'Alt+':'')  + (element.modifierByte&2? 'Ctrl+':'') + (element.modifierByte&4?'Shift+':'')
        const keyCode = element.keyboardEventCode.includes('Key')?element.keyboardEventCode.replace('Key',''):element.keyboardEventCode.includes('Digit')?element.keyboardEventCode.replace('Digit',''):element.keyboardEventCode; 
        console.log('Shortcut being registered is ', modifierKeyString+keyCode);
        ipc.send('RegisterGlobalShortcut',modifierKeyString+','+keyCode);
      });

      /* Set up a IPC listener to check for activated global shortcuts. Feed into state if appropriate */
      const globalShortcutEvents = ipc.on('ShortcutEvent', (event,args) => {
        const keyboardInput = args.split(',');
        if (keyboardInput.length===2) {
          if (keyboardInput[1].length===1) {
            this.setState({eventKeyModifier: keyboardInput[0], eventCode: keyType(keyboardInput[1])});
          } else {
            this.setState({eventKeyModifier: keyboardInput[0], eventCode: keyboardInput[1]});
          }
        }
        console.log('The following shortcut',args,'has been fired');
      });

    }


    componentDidMount() {
    

      if (this.divElement.current) {
        console.log("Height of DIV is ", this.divElement.current.clientHeight, " and the Width of DIV is ", this.divElement.current.clientWidth);
      }
      console.log('Component did mount');
      this.divElement.current?.focus();
    }


    

@action
mouseDownEvent(e: React.MouseEvent<HTMLDivElement>):void {
  //console.log("Mouse is down ");
  /*this.setState({isMouseDown:true});
  this.setState({ x: e.clientX, y: e.clientY });
  //console.log("The Y value is ", e.clientY);*/
  this.isMouseDown = true;
  this.x = e.clientX;
  this.y = e.clientY;
  // determine index number.
  let items:channelItems[] = this.state.model.lanes;
  console.log("Active index is ",  items.reduce((iMin, item, index, arr ) => Math.abs(item.topPixel-e.clientY) < Math.abs(arr[iMin].topPixel-e.clientY)?index: iMin,0));
  this.horizontalBarIndex =  items.reduce((iMin, item, index, arr ) => Math.abs(item.topPixel-this.y) < Math.abs(arr[iMin].topPixel-this.y)?index: iMin,0);
   //console.log("Index = ", index, ", Y value = ", e.clientY, ", toppixel = ", item.topPixel, ", and toppixel+ height = ", (item.topPixel + item.height));
  

}
@action
mouseUpEvent(e: React.MouseEvent<HTMLDivElement>):void {
  //console.log("Mouse is up ");
  /*this.setState({isMouseDown:false});
  this.setState({ x: e.clientX, y: e.clientY }); */
  this.isMouseDown = false;
  this.x = e.clientX;
  this.y = e.clientY;
}
@action
mouseMoveEvent(e: React.MouseEvent<HTMLDivElement>):void {
  if (this.isMouseDown) {
    
    
    
    this.y = e.clientY;
    //this.setState({dX:dX, dY:dY, x: e.clientX, y: e.clientY });
    //console.log("Deltas are dX = ", this.dX , " and dY = ", this.dY);
    //let newTopPixel:number = this.state.model.lanes[this.horizontalBarIndex].topPixel + this.dY;
    let items:channelItems[] = this.state.model.lanes;
    let delta = this.y-items[this.horizontalBarIndex].topPixel;
    console.log("Delta is ", delta);
    let oldChannelHeights:number[] = this.calculateChannelItemHeights(items);
    let newChannelHeights:number[] = calculateDraggingChannelHeights(oldChannelHeights, this.windowHeight, delta, this.horizontalBarIndex, 200
     /* channelHeights: number[],
      totalChannelsHeight: number,
      delta: number,
      draggingChannelIndex: number,
      maxChannelHeight: number */
   );
    console.log("HorizontalBarIndex" , this.horizontalBarIndex);
    console.log("Old Channel Heights", oldChannelHeights);
    console.log("New Channel Heights", newChannelHeights);
    items = this.calculateCumulativeChannelHeights(newChannelHeights);
    
    this.setState({model:{lanes:items}});
  }
}
    
mouseDragEvent(e: React.MouseEvent<HTMLDivElement>):void {
  console.log("Mouse dragging event occurring");
}

calculateChannelItemHeights(items:channelItems[]):number[] {
  return items.map(function(item: { topPixel: number; },index: number) {
    if (index==0) return item.topPixel;
    return (item.topPixel-items[index-1].topPixel);
  });
}

calculateCumulativeChannelHeights(channelHeights:number[]):channelItems[] {
  let arrayOfChannelItems:channelItems[] = [];
  let cumulativeChannelHeight:number = 0;
  for (let x =0; x < channelHeights.length; x++) {
          if (x==0) {
            cumulativeChannelHeight = channelHeights[x];
        } else {
          cumulativeChannelHeight += channelHeights[x];
        }
        let channelItem:channelItems = {topPixel:cumulativeChannelHeight, height:15};
        arrayOfChannelItems.push(channelItem);
      }
  
  return arrayOfChannelItems;
}


render() {

  const modifierKeyInput = this.state.eventKeyModifier; // 'Control'; //this.props.currentState.eventKey===' ' ? 'space' :this.props.currentState.eventKey;
  const codeInput = this.state.eventCode; //'KeyD'; //this.props.currentState.eventCode;
  const keyInputWithModifier = modifierKeyInput===''? '': modifierKeyInput+codeInput;    
    
  return (
      <div 
      
          onMouseDown={ this.mouseDownEvent } onMouseUp={ this.mouseUpEvent } onMouseMove={this.mouseMoveEvent} onDragOver={this.mouseDragEvent}>
      <button type="button">OpenModal</button>    
      
      <ChannelSepartors  {...this.state}/>
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

/*ipc.on('ShortcutEvent', (event,args) => {
  console.log('The following shortcut',args,'has been fired');
})*/
export default ChannelsApp;
