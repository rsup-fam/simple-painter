import PainterView from './PainterView';
import extendDrawByMouse from './extendDrawByMouse';
import EventEmitter, { Listener } from './EventEmitter';

export type DrawThickness = number;
export type DrawType = 'freeLine' | 'straightLine' | 'rectangle' | 'ellipse';
export type DrawColor = string | CanvasGradient | CanvasPattern;
export type Position = { x: number; y: number };

export interface DrawOption {
    type?: DrawType;
    color?: DrawColor;
    thickness?: DrawThickness;
    lineCap?: CanvasLineCap;
}

export interface DrawFigure extends DrawOption {
    positions: Position[];
}

export interface PainterOptions {
    canvas: HTMLCanvasElement;
    width?: number;
    height?: number;
    drawMouse?: boolean;
    type?: DrawType;
    color?: DrawColor;
    thickness?: DrawThickness;
    lineCap?: CanvasLineCap;
}

export default class Painter {
    drawOption: DrawOption;
    
    private _canvas: HTMLCanvasElement;
    private _drawPositions: Position[];
    private _drawFigures: DrawFigure[];
    private _emitter: EventEmitter;
    private _painterView: PainterView;
    private _offExtendDrawByMouse: () => void;

    constructor({ 
        canvas, 
        width, 
        height, 
        drawMouse = true, 
        type = 'freeLine', 
        color = 'red', 
        thickness = 3, 
        lineCap = 'square'  
    }: PainterOptions) {
        this._canvas = canvas;
        this.drawOption = { type, color, thickness, lineCap };

        this._drawFigures = [];
        this._drawPositions = [];
        this._emitter = new EventEmitter();
        this._painterView = new PainterView({width, height, canvas});
        this._offExtendDrawByMouse = drawMouse ? extendDrawByMouse(this) : () => null;
    }

    get canvas(){
        return this._canvas;
    }

    on(name: 'drawStart' | 'drawing' | 'drawEnd', listener: Listener) {
        return this._emitter.on(name, listener);
    }

    setOptions(drawOption: DrawOption) {
        this.drawOption = {
            ...this.drawOption,
            ...drawOption,
        };
    }


    drawFigure(drawFigure: DrawFigure) {
        this._drawFigures.push({ ...this.drawOption, ...drawFigure });
        this._render();
    }

    clear() {
        this._drawFigures = [];
        this._painterView.clear();
    }

    destroy() {
        this._offExtendDrawByMouse();
        this._emitter.allOff();
    }

    _startLiveDraw(position: Position, event: MouseEvent | TouchEvent) {
        this._drawPositions.push(position);
        this._painterView.setDrawInfo(this.drawOption);
        this._painterView.setStartPosition(position);
        this._emitter.emit('drawStart', position, event);
    }

    _liveDrawing(position: Position, event: MouseEvent | TouchEvent) {
        if (this.drawOption.type === 'freeLine') {
            this._drawPositions.push(position);
            this._painterView.drawFreeLine(position);
        }

        if (this.drawOption.type === 'straightLine') {
            this._render();
            this._drawPositions = [this._drawPositions[0], position];
            this._painterView.drawStraightLine(this._drawPositions);
        }

        if (this.drawOption.type === 'rectangle') {
            this._render();
            this._drawPositions = [this._drawPositions[0], position];
            this._painterView.drawRectangle(this._drawPositions);
        }

        if (this.drawOption.type === 'ellipse') {
            this._render();
            this._drawPositions = [this._drawPositions[0], position];
            this._painterView.drawEllipse(this._drawPositions);
        }

        this._emitter.emit('drawing', position, event);
    }

    _endLiveDraw(event: MouseEvent | TouchEvent) {
        this._drawFigures.push({ positions: this._drawPositions, ...this.drawOption });
        this._emitter.emit('drawEnd', this._drawPositions, event);
        this._drawPositions = [];
        this._render();
    }

    _render() {
        if (!this._drawFigures.length) return;
        this._painterView.clear();

        for (const drawFigure of this._drawFigures) {
            if (drawFigure.type === 'freeLine') {
                this._painterView.drawFreeLineFigure(drawFigure);
            }

            if (drawFigure.type === 'rectangle') {
                this._painterView.drawRectangleFigure(drawFigure);
            }

            if (drawFigure.type === 'ellipse') {
                this._painterView.drawEllipseFigure(drawFigure);
            }

            if (drawFigure.type === 'straightLine') {
                this._painterView.drawStraightLineFigure(drawFigure);
            }
        }

        this._painterView.setDrawInfo(this.drawOption);
    }
}