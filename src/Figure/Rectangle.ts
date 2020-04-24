import {Figure, DrawStyle, RelativePosition, DrawingEvent} from "../types";

export default class Rectangle implements Figure{
    constructor( 
        private _style: DrawStyle,
        private _start: RelativePosition,
        private _end: RelativePosition,
    ){
    }

    updateByDrawingEvent({relativePosition}: DrawingEvent){
        this._end = relativePosition;
    }

    render(ctx: CanvasRenderingContext2D, {width, height}: {width: number; height: number}){
        const { color, thickness, lineCap } = this._style;

        if (color) ctx.strokeStyle = color;
        if (thickness) ctx.lineWidth = thickness;
        if (lineCap) ctx.lineCap = lineCap;

        const { x: startX, y: startY } = this._start;
        const { x, y } = this._end;

        ctx.strokeRect(
            startX * width, 
            startY * height, 
            (x - startX) * width, 
            (y - startY) * height
        );
    }
}