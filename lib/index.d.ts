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
declare function hydrate(line: Content, node: any): void;
declare function createTelescopicText(content: Content[]): HTMLDivElement;
/**
 * Parses the input string and returns the output as a structured data format.
 *
 * @param mdContent full string of markdown content that is formatted as a unorederd bulleted list
 * @returns
 */
declare function parseMarkdown(mdContent: string): TelescopicOutput;
declare function parseOutputIntoContent(output: TelescopicOutput, separator?: string): Content;
declare function parseMarkdownIntoContent(mdContent: string, separator?: string): Content;
