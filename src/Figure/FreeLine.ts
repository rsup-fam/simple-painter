import {Figure, DrawStyle, Position} from "../types";

export default class FreeLine implements Figure{
    constructor( 
        private _style: DrawStyle,
        private _positions: Position[],
    ){
    }

    render(ctx: CanvasRenderingContext2D, {width, height}: {width: number; height: number}){
        const { color, thickness, lineCap } = this._style;

        if (color) ctx.strokeStyle = color;
        if (thickness) ctx.lineWidth = thickness;
        if (lineCap) ctx.lineCap = lineCap;

        ctx.beginPath();
        for (const position of this._positions) {
            ctx.lineTo(width * position.x, height* position.y);
            ctx.stroke();
        }
    }
}