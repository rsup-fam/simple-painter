import {Figure, DrawStyle} from "./types";
import { Position } from "../Painter";

export default class Rectangle implements Figure{
    constructor( 
        private _style: DrawStyle,
        private _start: Position,
        private _end: Position,
    ){
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