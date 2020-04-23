import PainterView from '../PainterView';

export interface Figure{
    render(painterView: PainterView): void;
}