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
/**
 * Modes that designate what form the input text is in and should be interpreted as.
 */
declare enum TextMode {
    Text = "text",
    /**
     * NOTE: this uses `innerHtml` under the hood, so should not be used with untrusted user input and can have
     * unexpected behavior if the HTML is not valid.
     */
    Html = "html"
}
declare function isTextMode(e: any): e is TextMode[keyof TextMode];
interface Config {
    /**
     * Character used to separate entries on the same level. Defaults to a single space (" ")
     */
    separator?: string;
    /**
     * If true, allows sections to expand automatically on mouse over rather than requiring a click. Defaults to false.
     */
    shouldExpandOnMouseOver?: boolean;
    /**
     * A mode that designates what form the input text is in and should be interpreted as. Defaults to 'text'.
     */
    textMode?: TextMode;
    /**
     * Determines the wrapper element type for HTML elements. Defaults to 'span'.
     */
    htmlContainerTag?: keyof HTMLElementTagNameMap;
    /**
     * Only valid when textMode is 'text'. Used to insert HTML element like blockquotes, line breaks, bold, and emphasis in plain text mode.
     */
    specialCharacters?: TextReplacements;
}
declare type CreateTelescopicTextConfig = Pick<Config, "shouldExpandOnMouseOver" | "textMode" | "htmlContainerTag" | "specialCharacters">;
declare let _lastHoveredTime: number;
interface TextReplacements {
    [key: string]: (lineText: string) => HTMLElement;
}
declare const DefaultReplacements: TextReplacements;
declare function _hydrate(line: Content, node: any, config?: CreateTelescopicTextConfig): void;
declare function _createTelescopicText(content: Content[], config?: CreateTelescopicTextConfig): HTMLDivElement;
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
declare function createTelescopicTextFromBulletedList(listContent: string, { separator, ...createTelescopicTextConfig }?: Config): HTMLDivElement;
