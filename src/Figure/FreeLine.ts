import {Figure, DrawStyle, RelativePosition, DrawingEvent, DrawingEventSource} from "../types";

export default class FreeLine implements Figure{
    constructor( 
        private _style: DrawStyle,
        private _positions?: RelativePosition[],
    ){
    }

    drawing(ctx: CanvasRenderingContext2D, {onDrawing}: DrawingEventSource){
        const { color, thickness, lineCap } = this._style;

        if (color) ctx.strokeStyle = color;
        if (thickness) ctx.lineWidth = thickness;
        if (lineCap) ctx.lineCap = lineCap;

        ctx.beginPath();

        onDrawing(({canvas, relativePosition: {x, y}}) => {
            (this._positions || (this._positions = [])).push({x,y});

            if(this._positions.length === 1){
                ctx.moveTo(canvas.width * x, canvas.height * y);
            }else{
                ctx.lineTo(canvas.width * x, canvas.height * y);
                ctx.stroke();
            }
        });
    }

    render(ctx: CanvasRenderingContext2D, {width, height}: {width: number; height: number}){
        if(!this._positions) return;

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