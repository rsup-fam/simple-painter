import {Figure} from "./types";
import PainterView from "../PainterView";
import { DrawOption, Position } from "../Painter";

export default class FreeLine implements Figure{
    constructor( 
        private _drawOption: DrawOption,
        private _positions: Position[],
    ){
    }

    render(painterView: PainterView){
        painterView.drawFreeLineFigure({positions: this._positions, ...this._drawOption});
    }
}