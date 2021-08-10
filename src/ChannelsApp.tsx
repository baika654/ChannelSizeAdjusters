import * as React  from "react"
import * as ReactDOM from "react-dom"
import ChannelSepartors from "./channel-separators"
import {calculateDraggingChannelHeights} from "./make-lanes"
import styled from "styled-components"
import { observable, action } from "mobx"

export interface channelItems {
  
  topPixel: number;
  height: number;
   
};


interface State {
  model: {
    lanes:{topPixel:number; height:number;}[];
  };
  interactive: boolean;
  eventKey:string;
  eventCode:string;
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

const LargeLetterContainer = styled.div`
    
    width: 100%;
    color: red;
    font-size: 20vw;
    text-align: center;
    
 `;

 const StringContainer = styled.div`
    
    width: 20%;
    color: black;
    font-size: 1vw;
    text-align: center;
    border-radius: 16px;
    border: 1px solid black;
    
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
  background-color: white;
  border-radius: 4px;

`;

interface Props {

}

/*const state:State = {
  model:{
    lanes:[{topPixel:50, height:15}, {topPixel:100, height:15},{topPixel:150, height:15},{topPixel:200, height:15},{topPixel:250, height:15},{topPixel:300, height:15}],
  },
  interactive:true,

}*/



class ChannelsApp extends React.Component /*<Props, State>*/ {
  
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
                eventKey:"", 
                eventCode:""
              }
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

  const keyInput = 'Control'; //this.props.currentState.eventKey===' ' ? 'space' :this.props.currentState.eventKey;
    const keyCode = 'KeyD'; //this.props.currentState.eventCode;
    if (keyInput=== 'Control'||keyInput==='Alt'||keyInput==='Shift'||keyInput==='Command'||keyInput==='Meta')  {
       if (this.modifier) {
        if (!this.keyInputBuffer.includes(keyInput)) {
          const unsortedKeyInputBuffer = this.keyInputBuffer.concat('+',keyInput);
          this.keyInputBuffer = unsortedKeyInputBuffer.split('+').sort().join('+');
        }
       } else {
          this.keyInputBuffer = keyInput;
          this.modifier=true;
       }
      
    } else {
      if (this.modifier) {
        console.log(this.keyInputBuffer);
        this.keyInputBuffer = this.keyInputBuffer.concat('+',keyCode);
        this.modifier = false;
      } else {
        this.keyInputBuffer = keyCode;
      }
    }

    return (
        <div 
        
            onMouseDown={ this.mouseDownEvent } onMouseUp={ this.mouseUpEvent } onMouseMove={this.mouseMoveEvent} onDragOver={this.mouseDragEvent}>
        <button type="button">OpenModal</button>    
        
        <ChannelSepartors  {...this.state}/>
        <ModalBackground >
          <ModalBox ref={this.divElement} className="ChannelApp-Top-Div" tabIndex={0} onKeyDown={this.handleClick} >
          <LargeLetterContainer>
                {reservedKeyCombinations.includes(this.keyInputBuffer)? 'NO!!' : 'YES'}
            </LargeLetterContainer>
            <StringContainer>
                {this.keyInputBuffer}
            </StringContainer>
          </ModalBox>
        </ModalBackground>
        </div>
    )
}



handleClick(event: React.KeyboardEvent<HTMLDivElement>):void {
  console.log(`Key: ${event.key} with keycode X has been pressed`);
  this.setState({eventKey: event.key, eventCode: event.nativeEvent.code});
  event.preventDefault();
}


}

export default ChannelsApp;
