import { DrawOption } from './Painter';
import { RelativePosition } from './types';

export default class PainterView {
    private _canvas: HTMLCanvasElement
    private _ctx: CanvasRenderingContext2D

    constructor({ canvas, width, height }: {canvas: HTMLCanvasElement; width?: number; height?: number}) {
        this._canvas = canvas;
        if (!(this._ctx = canvas.getContext('2d')!)){
            throw new Error('2d context not supported');
        }
        if (width) canvas.width = width;
        if (height) canvas.height = height;
    }
    
    clear(){
        const {width, height} = this._canvas;
        this._ctx.clearRect(0, 0, width, height);
    }
}