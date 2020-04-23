export interface Figure{
    render(ctx: CanvasRenderingContext2D, size: {width: number; height: number}): void;
}