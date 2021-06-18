import * as React from 'react';
//import { observer } from 'mobx-react';
import styled from 'styled-components';
//import { createHelpContent, withHelp } from 'libs/lc-help';
//import { IChannelView } from 'libs/lc-channels';
import {  bufferHeightInPix,  channelGapPix} from './channel-separator-constants';

interface Props {
   channel: {
       topPixel: number;
       height: number;
   };
   editing: boolean;
   hovering: boolean;
   onMouseEnter?: () => void;
   onMouseLeave?: () => void;
}

const ChannelSeparatorWrapper = styled.div`
   position: absolute;
`;

const ChannelSeparatorBar = styled.div`
   position: relative;
   height: 100%;
   width: 100%;
   cursor: row-resize;
   pointer-events: all;
   background-color: red;
`;

const HoverChannelSeparatorBar = styled(ChannelSeparatorBar)`
   background-color: green;
`;


class ChannelSeparatorInner extends React.Component<Props> {
   getEditSeparatorBar() {
      const { editing, hovering } = this.props;
      let channelSeparatorBar = null;

      if (editing) {
         channelSeparatorBar = <ChannelSeparatorBar />;
      } else if (hovering) {
         channelSeparatorBar = <HoverChannelSeparatorBar />;
      }

      return channelSeparatorBar;
   }

   render() {
      const { channel, onMouseEnter, onMouseLeave } = this.props;
      const { topPixel, height } = channel;
      const channelSeparatorBar = this.getEditSeparatorBar();

      const clickAreaTop =
         topPixel + height - bufferHeightInPix / 2 - channelGapPix;

      const style: React.CSSProperties = {
         width: '100%',
         top: `${clickAreaTop}px`,
         height: `${bufferHeightInPix}px`
      };

      return (
            <ChannelSeparatorWrapper
            style={style}
            onMouseEnter={() => onMouseEnter && onMouseEnter()}
            onMouseLeave={() => onMouseLeave && onMouseLeave()}
         >
            {channelSeparatorBar}
            
         </ChannelSeparatorWrapper>
      );
   }
}



export default ChannelSeparatorInner;
