interface Line {
    og: string;
    new: string;
    replacements: Line[];
}
interface Content {
    text: string;
    replacements: Line[];
}
export declare function hydrate(line: Content, node: any): void;
export declare function createTelescopicText(content: Content[]): HTMLDivElement;
export * from './parser';
