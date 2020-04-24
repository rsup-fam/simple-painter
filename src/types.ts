export type Position = { x: number; y: number };

export interface DrawStyle {
    color?: string | CanvasGradient | CanvasPattern;
    thickness?: number;
    lineCap?: CanvasLineCap;
}

export interface Figure{
    render(ctx: CanvasRenderingContext2D, size: {width: number; height: number}): void;
}