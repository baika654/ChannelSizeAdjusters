import * as React  from "react"
import * as ReactDOM from "react-dom"
import ChannelSepartors from "./channel-separators"

interface channelItems {
  
  topPixel: number;
  height: number;
   
};


interface State {
  model: {
    lanes:{topPixel:number; height:number;}[];
  };
  interactive: boolean;
  isMouseDown: boolean;
  dX: number;
  dY: number;
  x: number;
  y: number;
  pX: number;
  pY: number;

  
}

interface Props {

}

/*const state:State = {
  model:{
    lanes:[{topPixel:50, height:15}, {topPixel:100, height:15},{topPixel:150, height:15},{topPixel:200, height:15},{topPixel:250, height:15},{topPixel:300, height:15}],
  },
  interactive:true,

}*/



class ChannelsApp extends React.Component<Props, State> {
    
    constructor(props: Props) {
      super(props);

      this.state = {
        model:{
          lanes:[{topPixel:50, height:15}, {topPixel:100, height:15},{topPixel:150, height:15},{topPixel:200, height:15},{topPixel:250, height:15},{topPixel:300, height:15}],
        },
        interactive:true,
        isMouseDown:false,
        dX: 0,
        dY: 0,
        x: 0,
        y: 0,
        pX: 0,
        pY: 0,
      
      }

      
      this.mouseDownEvent = this.mouseDownEvent.bind(this);
      this.mouseUpEvent = this.mouseUpEvent.bind(this);
      this.mouseMoveEvent = this.mouseMoveEvent.bind(this);
    }

horizontalBarIndex:number=0;


mouseDownEvent(e: React.MouseEvent<HTMLDivElement>):void {
  console.log("Mouse is down ");
  this.setState({isMouseDown:true});
  this.setState({ x: e.clientX, y: e.clientY });
  console.log("The Y value is ", e.clientY);
  // determine index number.
  let items:channelItems[] = this.state.model.lanes;
  console.log("Active index is ",  items.reduce((iMin, item, index, arr ) => Math.abs(item.topPixel-e.clientY) < Math.abs(arr[iMin].topPixel-e.clientY)?index: iMin,0));
  this.horizontalBarIndex =  items.reduce((iMin, item, index, arr ) => Math.abs(item.topPixel-e.clientY) < Math.abs(arr[iMin].topPixel-e.clientY)?index: iMin,0);
   //console.log("Index = ", index, ", Y value = ", e.clientY, ", toppixel = ", item.topPixel, ", and toppixel+ height = ", (item.topPixel + item.height));
  

}

mouseUpEvent(e: React.MouseEvent<HTMLDivElement>):void {
  console.log("Mouse is up ");
  this.setState({isMouseDown:false});
  this.setState({ x: e.clientX, y: e.clientY });
}

mouseMoveEvent(e: React.MouseEvent<HTMLDivElement>):void {
  if (this.state.isMouseDown) {
    let dX:number = e.clientX - this.state.x;
    let dY:number = e.clientY - this.state.y;
    
    this.setState({dX:dX, dY:dY, x: e.clientX, y: e.clientY });
    console.log("Deltas are dX = ", dX , " and dY = ", dY);
    let newTopPixel:number = this.state.model.lanes[this.horizontalBarIndex].topPixel + dY;
    let items:channelItems[] = this.state.model.lanes;
    items[this.horizontalBarIndex] = {topPixel:newTopPixel, height:15};
    this.setState({model:{lanes:items}});
  }
}
    

render() {
    return (
        <div  onMouseDown={ this.mouseDownEvent } onMouseUp={ this.mouseUpEvent } onMouseMove={this.mouseMoveEvent}>
            <ChannelSepartors  {...this.state}/>
        </div>
    )
}

}

export default ChannelsApp;
