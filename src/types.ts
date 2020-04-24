export type RelativePosition = { x: number; y: number };

export interface DrawStyle {
    color?: string | CanvasGradient | CanvasPattern;
    thickness?: number;
    lineCap?: CanvasLineCap;
}

export interface DrawingEvent {
    originalEvent: MouseEvent|TouchEvent;
    canvas: HTMLCanvasElement;
    relativePosition: RelativePosition;
}

export interface Figure{
    updateByDrawingEvent(event: DrawingEvent): void;

    render(ctx: CanvasRenderingContext2D, size: {width: number; height: number}): void;
}