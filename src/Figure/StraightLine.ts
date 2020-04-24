import {Figure, DrawStyle, Position, DrawingEvent} from "../types";

export default class StraightLine implements Figure{
    constructor( 
        private _style: DrawStyle,
        private _start: Position,
        private _end: Position,
    ){
    }

    updateByDrawingEvent({position}: DrawingEvent){
        this._end = position;
    }

    render(ctx: CanvasRenderingContext2D, {width, height}: {width: number; height: number}){
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