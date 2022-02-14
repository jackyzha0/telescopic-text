interface Line {
    og: string;
    new: string;
    replacements: Line[];
}
interface Content {
    text: string;
    replacements: Line[];
}
interface NewContent {
    text: string;
    expansions?: NewContent[];
    separator?: string;
}
declare type TelescopicOutput = NewContent[];
interface TelescopeNode {
    depth: number;
    telescopicOut: TelescopicOutput;
}
declare function _hydrate(line: Content, node: any): void;
declare function createTelescopicText(content: Content[]): HTMLDivElement;
declare function parseMarkdown(mdContent: string): TelescopicOutput;
declare function parseOutputIntoContent(output: TelescopicOutput, separator?: string): Content;
declare function parseMarkdownIntoContent(mdContent: string, separator?: string): Content;
