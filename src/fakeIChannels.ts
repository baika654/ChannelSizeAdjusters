import { ISubjectDescriptor } from "./dataset-interfaces";

export interface IChannels  {
    
    lanes:{
        topPixel:number; 
        height:number;
        subject: ISubjectDescriptor | undefined;
        setTopPixel(topPixel: number, channels:IChannels):void;
        setHeight(height: number, channels: IChannels):void;
        
    }[];
    
    interactive: boolean;
    isMouseDown: boolean;
    dX: number;
    dY: number;
    x: number;
    y: number;
    pX: number;
    pY: number;
  
    
  }