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
interface Config {
    /**
    * Character used to separate entries on the same level. Defaults to a single space (" ")
    */
    /**
    * Character used to separate entries on the same level. Defaults to a single space (" ")
    */
    separator?: string;
    hoverable?: boolean;
}
declare const DefaultConfig: Config;
declare let _lastHoveredTime: number;
declare function _hydrate(line: Content, node: any, hoverable?: boolean): void;
declare function _createTelescopicText(content: Content[], hoverable?: boolean): HTMLDivElement;
/*****************/
/*****************/
declare function _parseMarkdown(mdContent: string): TelescopicOutput;
declare function _parseOutputIntoContent(output: TelescopicOutput, separator?: string): Content;
declare function _parseMarkdownIntoContent(mdContent: string, separator?: string): Content;
/**
 * Parses a markdown-compatible bulleted list into an HTML div that contains the telescoping text specified by the bullet list content.
 *
 * @param listContent - Content in the form of a bulleted list where items on the same level are combined using the `separator` parameter.
 * @param config - Configuration options provided to create interactive, telescopic text.
 * @returns HTML div containing the telescoping text.
 */
declare function createTelescopicTextFromBulletedList(listContent: string, { separator, hoverable }?: Config): HTMLDivElement;
