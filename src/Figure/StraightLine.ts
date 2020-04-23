import {Figure} from "./types";
import PainterView from "../PainterView";
import { DrawOption, Position } from "../Painter";

export default class StraightLine implements Figure{
    constructor( 
        private _drawOption: DrawOption,
        private _start: Position,
        private _end: Position,
    ){
    }

    render(painterView: PainterView){
        painterView.drawStraightLineFigure({positions: [this._start, this._end], ...this._drawOption});
    }
}