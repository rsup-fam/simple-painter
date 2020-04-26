import {Figure, DrawStyle, RelativePosition, DrawingEvent, DrawingEventSource} from "../types";

export default class Rectangle implements Figure{
    constructor( 
        private _style: DrawStyle,
        private _start?: RelativePosition,
        private _end?: RelativePosition,
    ){
    }

    async drawing(ctx: CanvasRenderingContext2D, events: DrawingEventSource){
        for await(const event of events) {
            const {canvas, relativePosition} = event;
            const {width, height} = canvas;
            if(this._start){
                this._end = relativePosition;
            }else{
                this._start = this._end = relativePosition;
            }

            ctx.clearRect(0, 0, width, height);
            this.render(ctx, {width, height});
        }
    }

    render(ctx: CanvasRenderingContext2D, {width, height}: {width: number; height: number}){
        if(this._start === undefined || this._end === undefined) return;

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