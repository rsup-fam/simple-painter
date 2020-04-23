import PainterView from './PainterView';
import EventEmitter, { Listener } from './EventEmitter';
import {Figure} from './Figure/types';

type EventMap<Element=HTMLElement> = Element extends Document ? DocumentEventMap : HTMLElementEventMap

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
    disableMouseDrawing = () => {}; // eslint-disable-line @typescript-eslint/no-empty-function
    
    private _canvas: HTMLCanvasElement;
    private _ctx: CanvasRenderingContext2D
    private _drawPositions: Position[];
    private _drawFigures: DrawFigure[];
    private _emitter: EventEmitter;
    private _painterView: PainterView;
    private _figures: Figure[] = []

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
        if (!(this._ctx = canvas.getContext('2d')!)){
            throw new Error('2d context not supported');
        }
        
        this.drawOption = { type, color, thickness, lineCap };

        this._drawFigures = [];
        this._drawPositions = [];
        this._emitter = new EventEmitter();
        this._painterView = new PainterView({width, height, canvas});
        
        if(drawMouse) this.enableMouseDrawing();
    }

    get canvas(){
        return this._canvas;
    }

    get size(){
        return {width:this._canvas.width, height: this._canvas.height};
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

    draw(figure: Figure){
        this._figures.push(figure);
        this._render();
    }

    clear() {
        this._drawFigures = [];
        this._painterView.clear();
    }

    destroy() {
        this.disableMouseDrawing();
        this._emitter.allOff();
    }

    enableMouseDrawing(){
        this.disableMouseDrawing();

        const {canvas} = this;
        let isDrawing = false;

        const offEvents = [
            on(canvas, 'mousedown', (event) => {
                const { clientX, clientY } = event;
                const position = normalizePosition(canvas, { clientX, clientY });
                startDraw(position, event);
                drawing(position, event);
            }),
            on(document, 'mousemove', (event) => {
                const { clientX, clientY } = event;
                const position = normalizePosition(canvas, { clientX, clientY });
                drawing(position, event);
            }),
            on(document, 'mouseup', endDraw),
    
            on(canvas, 'touchstart', (event) => {
                const { clientX, clientY } = event.touches[0];
                const position = normalizePosition(canvas, { clientX, clientY });
                startDraw(position, event);
                drawing(position, event);
            }),
            on(document, 'touchmove', (event) => {
                const { clientX, clientY } = event.touches[0];
                const position = normalizePosition(canvas, { clientX, clientY });
                drawing(position, event);
            }),
            on(document, 'touchend', endDraw),
        ];
    
        // eslint-disable-next-line @typescript-eslint/no-this-alias
        const painter = this;
        function startDraw({ x, y }: { x: number; y: number }, event: MouseEvent | TouchEvent) {
            isDrawing = true;
            painter._startLiveDraw({ x, y }, event);
        };
    
        function drawing({ x, y }: { x: number; y: number }, event: MouseEvent | TouchEvent) {
            if (!isDrawing) return;
            painter._liveDrawing({ x, y }, event);
        };
    
        function endDraw(event: MouseEvent | TouchEvent) {
            if (!isDrawing) return;
            isDrawing = false;
            painter._endLiveDraw(event);
        };
    
        this.disableMouseDrawing = () => offEvents.forEach(off => off());
    }

    private _startLiveDraw(position: Position, event: MouseEvent | TouchEvent) {
        this._drawPositions.push(position);
        this._painterView.setDrawInfo(this.drawOption);
        this._painterView.setStartPosition(position);
        this._emitter.emit('drawStart', position, event);
    }

    private _liveDrawing(position: Position, event: MouseEvent | TouchEvent) {
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

    private _endLiveDraw(event: MouseEvent | TouchEvent) {
        this._drawFigures.push({ positions: this._drawPositions, ...this.drawOption });
        this._emitter.emit('drawEnd', this._drawPositions, event);
        this._drawPositions = [];
        this._render();
    }

    private _render() {
        if (!this._figures.length) return;
        this._painterView.clear();

        for (const figure of this._figures) {
            figure.render(this._ctx, this.size);
        }

        this._painterView.setDrawInfo(this.drawOption);
    }
}

function on<E extends HTMLElement|Document, Event extends keyof EventMap<E>>(
    element: E,
    name: Event, 
    callback: (event: EventMap<E>[Event]) => void
) {
    (element as any).addEventListener(name, callback);
    return () => (element as any).removeEventListener(name, callback);
}

function normalizePosition(
    canvas: HTMLCanvasElement, 
    { clientX, clientY }: { clientX: number; clientY: number }
) {
    const { top, left, width, height } = canvas.getBoundingClientRect();
    return {
        x: Number((clientX - left) / width),
        y: Number((clientY - top) / height)
    };
}