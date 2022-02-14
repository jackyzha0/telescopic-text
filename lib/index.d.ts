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
declare function _createTelescopicText(content: Content[]): HTMLDivElement;
/*****************/
/*****************/
declare function _parseMarkdown(mdContent: string): TelescopicOutput;
declare function _parseOutputIntoContent(output: TelescopicOutput, separator?: string): Content;
declare function _parseMarkdownIntoContent(mdContent: string, separator?: string): Content;
/**
 * Parses a markdown-compatible bulleted list into an HTML div that contains the telescoping text specified by the bullet list content.
 *
 * @param listContent - Content in the form of a bulleted list where items on the same level are combined using the `separator` parameter.
 * @param separator - character to divide items on the same indentation level.
 * @returns HTML div containing the telescoping text.
 */
declare function createTelescopicTextFromBulletedList(listContent: string, separator?: string): HTMLDivElement;
