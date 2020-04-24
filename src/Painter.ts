import PainterView from './PainterView';
import EventEmitter, { Listener } from './EventEmitter';
import {Figure, RelativePosition} from './types';
import FreeLine from './Figure/FreeLine';
import StraightLine from './Figure/StraightLine';
import Rectangle from './Figure/Rectangle';
import Ellipse from './Figure/Ellipse';

type EventMap<Element=HTMLElement> = Element extends Document ? DocumentEventMap : HTMLElementEventMap

export type DrawThickness = number;
export type DrawType = 'freeLine' | 'straightLine' | 'rectangle' | 'ellipse';
export type DrawColor = string | CanvasGradient | CanvasPattern;

export interface DrawOption {
    type?: DrawType;
    color?: DrawColor;
    thickness?: DrawThickness;
    lineCap?: CanvasLineCap;
}

export interface DrawFigure extends DrawOption {
    positions: RelativePosition[];
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
        let drawingFigure: Figure|null  = null;

        const startDraw = (position: RelativePosition, event: MouseEvent | TouchEvent) => {
            switch (this.drawOption.type){
            case 'freeLine': 
                drawingFigure = new FreeLine(this.drawOption, [position]);
                break;
            case 'straightLine': 
                drawingFigure = new StraightLine(this.drawOption, position, position);
                break;
            case 'rectangle': 
                drawingFigure = new Rectangle(this.drawOption, position, position);
                break;
            case 'ellipse': 
                drawingFigure = new Ellipse(this.drawOption, position, position);
                break;
            }

            this._emitter.emit('drawStart', position, event);
        };

        const drawing = (position: RelativePosition, event: MouseEvent | TouchEvent) => {
            if (!drawingFigure) return;

            this._render();
            const drawingEvent = {originalEvent: event, canvas: this._canvas, relativePosition: position};
            drawingFigure.updateByDrawingEvent(drawingEvent);
            drawingFigure.render(this._ctx, this.size);
            
            this._emitter.emit('drawing', drawingEvent);
        };

        const endDraw = (event: MouseEvent | TouchEvent) => {
            if (!drawingFigure) return;
            this.draw(drawingFigure);
            drawingFigure = null;
            this._emitter.emit('drawEnd', event);
            this._render();
        };

        const offEvents = [
            on(canvas, 'mousedown', (event) => {
                const position = normalizePosition(canvas, event);
                startDraw(position, event);
                drawing(position, event);
            }),
            on(document, 'mousemove', (event) => {
                const position = normalizePosition(canvas, event);
                drawing(position, event);
            }),
            on(document, 'mouseup', endDraw),
            on(canvas, 'touchstart', (event) => {
                const position = normalizePosition(canvas, event.touches[0]);
                startDraw(position, event);
                drawing(position, event);
            }),
            on(document, 'touchmove', (event) => {
                const position = normalizePosition(canvas, event.touches[0]);
                drawing(position, event);
            }),
            on(document, 'touchend', endDraw),
        ];
    
        this.disableMouseDrawing = () => offEvents.forEach(off => off());
    }    

    private _render() {
        if (!this._figures.length) return;
        this._painterView.clear();

        for (const figure of this._figures) {
            figure.render(this._ctx, this.size);
        }
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