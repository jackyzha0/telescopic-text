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
declare const isTextMode: (e: any) => e is string | number | (() => string) | ((pos: number) => string) | ((index: number) => number) | ((...strings: string[]) => string) | ((searchString: string, position?: number) => number) | ((searchString: string, position?: number) => number) | {
    (that: string): number;
    (that: string, locales?: string | string[], options?: Intl.CollatorOptions): number;
} | {
    (regexp: string | RegExp): RegExpMatchArray;
    (matcher: {
        [Symbol.match](string: string): RegExpMatchArray;
    }): RegExpMatchArray;
} | {
    (searchValue: string | RegExp, replaceValue: string): string;
    (searchValue: string | RegExp, replacer: (substring: string, ...args: any[]) => string): string;
    (searchValue: {
        [Symbol.replace](string: string, replaceValue: string): string;
    }, replaceValue: string): string;
    (searchValue: {
        [Symbol.replace](string: string, replacer: (substring: string, ...args: any[]) => string): string;
    }, replacer: (substring: string, ...args: any[]) => string): string;
} | {
    (regexp: string | RegExp): number;
    (searcher: {
        [Symbol.search](string: string): number;
    }): number;
} | ((start?: number, end?: number) => string) | {
    (separator: string | RegExp, limit?: number): string[];
    (splitter: {
        [Symbol.split](string: string, limit?: number): string[];
    }, limit?: number): string[];
} | ((start: number, end?: number) => string) | (() => string) | ((locales?: string | string[]) => string) | (() => string) | ((locales?: string | string[]) => string) | (() => string) | ((from: number, length?: number) => string) | (() => string) | ((pos: number) => number) | ((searchString: string, position?: number) => boolean) | ((searchString: string, endPosition?: number) => boolean) | {
    (form: "NFC" | "NFD" | "NFKC" | "NFKD"): string;
    (form?: string): string;
} | ((count: number) => string) | ((searchString: string, position?: number) => boolean) | ((name: string) => string) | (() => string) | (() => string) | (() => string) | (() => string) | ((color: string) => string) | {
    (size: number): string;
    (size: string): string;
} | (() => string) | ((url: string) => string) | (() => string) | (() => string) | (() => string) | (() => string) | ((maxLength: number, fillString?: string) => string) | ((maxLength: number, fillString?: string) => string) | (() => string) | (() => string) | (() => string) | (() => string) | ((regexp: RegExp) => IterableIterator<RegExpMatchArray>) | (() => IterableIterator<string>) | ((index: number) => string);
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
