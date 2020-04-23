import Painter, { Position, DrawOption, DrawFigure } from './Painter';

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

    drawFreeLineFigure({ positions, ...drawOption }: DrawFigure) {
        this.setDrawInfo(drawOption);
        this.setStartPosition(positions[0]);
        
        for (const position of positions) {
            this.drawFreeLine(position);
        }
    }

    drawRectangleFigure({ positions, ...drawOption }: DrawFigure) {
        this.setDrawInfo(drawOption);
        this.drawRectangle(positions);
    }

    drawEllipseFigure({ positions, ...drawOption }: DrawFigure) {
        this.setDrawInfo(drawOption);
        this.drawEllipse(positions);
    }

    drawStraightLineFigure({ positions, ...drawOption }: DrawFigure) {
        this.setDrawInfo(drawOption);
        this.drawStraightLine(positions);
    }

    setDrawInfo(drawOption: DrawOption) {
        const ctx = this._ctx;
        const { color, thickness, lineCap } = drawOption;

        if (color) ctx.strokeStyle = color;
        if (thickness) ctx.lineWidth = thickness;
        if (lineCap) ctx.lineCap = lineCap;

        ctx.beginPath();
    }

    setStartPosition(position: Position) {
        const {width, height} = this._canvas;
        this._ctx.moveTo(width * position.x, height * position.y);
    }

    drawFreeLine(position: Position) {
        const ctx = this._ctx;
        const {width, height} = this._canvas;
        ctx.lineTo(width * position.x, height* position.y);
        ctx.stroke();
    }

    drawStraightLine(positions: Position[]) {
        const { x: startX, y: startY } = positions[0];
        const { x, y } = positions[positions.length - 1];

        const ctx = this._ctx;
        const {width, height} = this._canvas;

        ctx.beginPath();
        ctx.moveTo(startX * width, startY * height);
        ctx.lineTo(x * width, y * height);
        ctx.stroke();
    }

    drawRectangle(positions: Position[]) {
        const { x: startX, y: startY } = positions[0];
        const { x, y } = positions[positions.length - 1];
                
        const ctx = this._ctx;
        const {width, height} = this._canvas;

        ctx.strokeRect(
            startX * width, 
            startY * height, 
            (x - startX) * width, 
            (y - startY) * height
        );
    }

    drawEllipse(positions: Position[]) {
        const startPosition = positions[0];
        const position = positions[positions.length - 1];
        
        const ctx = this._ctx;
        const canvas = this._canvas;

        const startX = startPosition.x * canvas.width;
        const startY = startPosition.y * canvas.height;
        const x = position.x * canvas.width;
        const y = position.y * canvas.height;
        const width = x - startX;
        const height = y - startY;
        const kappa = (4 * (Math.sqrt(2) - 1)) / 3;
        const offsetX = (width / 2) * kappa;
        const offsetY = (height / 2) * kappa;
        const endX = startX + width;
        const endY = startY + height;
        const midX = startX + width / 2;
        const midY = startY + height / 2;

        ctx.beginPath();
        ctx.moveTo(startX, midY);
        ctx.bezierCurveTo(startX, midY - offsetY, midX - offsetX, startY, midX, startY);
        ctx.bezierCurveTo(midX + offsetX, startY, endX, midY - offsetY, endX, midY);
        ctx.bezierCurveTo(endX, midY + offsetY, midX + offsetX, endY, midX, endY);
        ctx.bezierCurveTo(midX - offsetX, endY, startX, midY + offsetY, startX, midY);
        ctx.closePath();
        ctx.stroke();
    }
}