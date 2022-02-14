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
/**
 * Parses the input string and returns the output as a structured data format.
 *
 * @param mdContent full string of markdown content that is formatted as a unorederd bulleted list
 * @returns
 */
export declare function parseMarkdown(mdContent: string): TelescopicOutput;
export declare function parseOutputIntoContent(output: TelescopicOutput, separator?: string): Content;
export declare function parseMarkdownIntoContent(mdContent: string, separator?: string): Content;
export {};
