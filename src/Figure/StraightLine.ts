import {Figure, DrawStyle, RelativePosition, DrawingEvent, DrawingEventSource} from "../types";

export default class StraightLine implements Figure{
    constructor( 
        private _style: DrawStyle,
        private _start?: RelativePosition,
        private _end?: RelativePosition,
    ){
    }

    drawing(ctx: CanvasRenderingContext2D, {onDrawing}: DrawingEventSource){
        onDrawing(({canvas, relativePosition}) => {
            const {width, height} = canvas;
            if(this._start){
                this._end = relativePosition;
            }else{
                this._start = this._end = relativePosition;
            }
            ctx.clearRect(0, 0, width, height);
            this.render(ctx, {width, height});
        });
    }

    render(ctx: CanvasRenderingContext2D, {width, height}: {width: number; height: number}){
        if(this._start === undefined || this._end === undefined) return;

        const { color, thickness, lineCap } = this._style;

        if (color) ctx.strokeStyle = color;
        if (thickness) ctx.lineWidth = thickness;
        if (lineCap) ctx.lineCap = lineCap;

        const { x: startX, y: startY } = this._start;
        const { x, y } = this._end;

        ctx.beginPath();
        ctx.moveTo(startX * width, startY * height);
        ctx.lineTo(x * width, y * height);
        ctx.stroke();
    }
}