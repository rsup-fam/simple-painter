import {Figure} from "./types";
import PainterView from "../PainterView";
import { DrawOption, Position } from "../Painter";

export default class Rectangle implements Figure{
    constructor( 
        private _drawOption: DrawOption,
        private _start: Position,
        private _end: Position,
    ){
    }

    render(painterView: PainterView){
        painterView.drawRectangleFigure({positions: [this._start, this._end], ...this._drawOption});
    }
}