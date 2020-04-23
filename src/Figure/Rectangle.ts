import {Figure} from "./types";
import { DrawOption, Position } from "../Painter";

export default class Rectangle implements Figure{
    constructor( 
        private _drawOption: DrawOption,
        private _start: Position,
        private _end: Position,
    ){
    }

    render(ctx: CanvasRenderingContext2D, {width, height}: {width: number; height: number}){
        const { color, thickness, lineCap } = this._drawOption;

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