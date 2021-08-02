import * as React from 'react'
import styled from 'styled-components';
import ChannelSeparatorInner from './channel-separator'


const Container = styled.div`
   position: absolute;
   width: 100%;
   height: 100%;
   overflow: hidden;
   top: 0;
   pointer-events: none;
`;


interface Props {
  model: {
    lanes:{topPixel:number; height:number;}[];
  };
  interactive: boolean;
}
  


interface listOfUsers {
   "account":string,
    "password": string
}

interface stateStruct {
  value:string;
  predictions:listOfUsers[];
  service:string;
  username:string;
  password:string;
  currentService:string;
}



class ChannelSepartors extends React.Component<Props, stateStruct> {
    
  

  constructor(props: Props) {
    super(props);
  }
  
  render() {
    const { model, interactive } = this.props;
    const renderedChannelSeparators: JSX.Element[] = [];
    const lanes = model.lanes;
    let channelKey = 0;
    console.log("Rendering. Model = ", model);

    lanes.forEach(channel => {
      if (channelKey < lanes.length - 1) {
         renderedChannelSeparators.push(
            <ChannelSeparatorInner 
              key={`${channelKey}`} 
              channel={channel} 
              editing={interactive} //AAH: interactive && mousedown
              hovering={interactive} //AAH: interactive && the y-position is over the channelSeparator area
            /> 
            
         );
         channelKey++;
      }
   });

   return <Container>
     
     {renderedChannelSeparators}</Container>;

  }

  /*componentDidMount() {
    if (this.divElement2.current) {
      console.log("Height of 2nd DIV is ", this.divElement2.current.clientHeight, " and the Width of 2nd DIV is ", this.divElement2.current.clientWidth);
    }
  }*/

}
  
export default ChannelSepartors;
  