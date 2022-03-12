interface Line {
  og: string; // the original string to replace
  new: string; // the replacement string
  replacements: Line[]; // nested replacements to apply on the resultant line afterwards
}

interface Content {
  text: string; // Original string content in the line
  replacements: Line[]; // Sections of the original text to replace/expand
}

interface NewContent {
  text: string;
  expansions?: NewContent[];
  separator?: string;
}

type TelescopicOutput = NewContent[];

interface TelescopeNode {
  depth: number;
  telescopicOut: TelescopicOutput;
}

/**
 * Modes that designate what form the input text is in and should be interpreted as.
 */
enum TextMode {
  Text = "text",
  /**
   * NOTE: this uses `innerHtml` under the hood, so should not be used with untrusted user input and can have
   * unexpected behavior if the HTML is not valid.
   */
  Html = "html",
}
const TextModeValues = Object.values(TextMode);

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
   *
   */
  htmlContainerTag?: keyof HTMLElementTagNameMap;
}

type CreateTelescopicTextConfig = Pick<
  Config,
  "shouldExpandOnMouseOver" | "textMode" | "htmlContainerTag"
>;

// time; recorded to prevent recursive text expansion on single hover
let _lastHoveredTime = Date.now();

// Internal recursive function to hydrate a node with a line object.
function _hydrate(
  line: Content,
  node: any,
  config: CreateTelescopicTextConfig = {}
) {
  const {
    shouldExpandOnMouseOver,
    textMode = TextMode.Text,
    htmlContainerTag = "span",
  } = config;
  let lineText = line.text;

  function createLineNode(lineText: string) {
    switch (textMode) {
      case TextMode.Text:
        // TODO: move this special character replacement functionality into a general purpose config
        // passed in at the top-level.
        if (lineText.includes("@Q ")) {
          // if this is a quotation, turn it into a <blockquote> element
          const [before, quote] = lineText.split("@Q ", 2);
          const pre = document.createTextNode(before);
          node.appendChild(pre);
          const el = document.createElement("blockquote");
          el.innerText = quote;
          return el;
        } else {
          return document.createTextNode(lineText);
        }

      case TextMode.Html:
        const newNode = document.createElement(htmlContainerTag);
        newNode.innerHTML = lineText;
        return newNode;

      default:
        throw new Error("Invalid text mode found: " + textMode);
    }
  }

  if (line.replacements.length > 0) {
    // only iterate lines if there are actually things to replace
    for (let i = 0; i < line.replacements.length; i++) {
      const replacement = line.replacements[i];

      // split single occurrence of replacement pattern
      const [before, ...afterarr] = lineText.split(replacement.og);
      const after = afterarr.join(replacement.og);

      // consume
      lineText = after;

      // add old real text
      node.appendChild(document.createTextNode(before));

      // create actual telescope
      const detail = document.createElement("span");
      detail.classList.add("details", "close");

      // add expand on click handler
      detail.addEventListener("click", () => {
        detail.classList.remove("close");
        detail.classList.add("open");
      });

      if (shouldExpandOnMouseOver) {
        // expand the text if text was not moused over immediately before
        detail.addEventListener("mouseover", () => {
          if (Date.now() - _lastHoveredTime > 10) {
            detail.classList.remove("close");
            detail.classList.add("open");
            _lastHoveredTime = Date.now();
          }
        });
      }

      const summary = document.createElement("span");
      summary.classList.add("summary");
      const newNode = createLineNode(replacement.og);
      summary.appendChild(newNode);
      detail.appendChild(summary);

      // create inner text, recursively hydrate
      const newLine = {
        text: replacement.new,
        replacements: replacement.replacements,
      };
      const expanded = document.createElement("span");
      expanded.classList.add("expanded");
      _hydrate(newLine, expanded, config);

      // append to parent
      detail.appendChild(expanded);
      node.appendChild(detail);
    }
    if (lineText) {
      const endText = createLineNode(lineText);
      node.appendChild(endText);
    }
  } else {
    // otherwise, this is a leaf node
    const newNode = createLineNode(lineText);
    node.appendChild(newNode);
  }
}

// Helper function to create a new `<div>` node containing the
// telescoping text.
function _createTelescopicText(
  content: Content[],
  config: CreateTelescopicTextConfig = {}
) {
  const letter = document.createElement("div");
  letter.id = "telescope";
  content.forEach((line) => {
    const newNode = document.createElement("p");
    _hydrate(line, newNode, config);
    letter.appendChild(newNode);
  });
  return letter;
}

/*****************/
/* PARSING LOGIC */
/*****************/

// Parses the input string and returns the output as a structured data format.
function _parseMarkdown(mdContent: string): TelescopicOutput {
  // In future we might want to support full markdown in which case..
  //   const html = marked.parse(mdContent);
  //  convert into jsdom
  //   const lines = html.split("\n");
  // Also idea for "..." or ellipsis character to repreesnt infinite expansion.

  const BulletSeparators = ["*", "-", "+"];
  const RegexEscapedBulletSeparators = ["\\*", "-", "\\+"];

  const lines = mdContent.split("\n");
  // NOTE: this should handle normalizing the depth (if its an indented list)
  const root: TelescopicOutput = [];
  const nodeStack: TelescopeNode[] = [{ depth: 0, telescopicOut: root }];

  // This is essentially a trie data structure to parse out all the bullet points
  // The algorithm works by assuming that any time you encounter a longer depth than the current one,
  // you are moving onto the next line.
  const firstNonEmptyLine = lines.find((l) => l.trim().length > 0);
  const defaultDepth =
    firstNonEmptyLine?.match(
      `^\\s*(${RegexEscapedBulletSeparators.join("|")})`
    )?.[0]?.length - 1 || 0;
  for (const line of lines) {
    const trimmedLine = line.trim();
    if (!trimmedLine.length) {
      continue;
    }

    // validate that the trimmed line starts with the bullet indicators.
    if (!BulletSeparators.some((sep) => trimmedLine.startsWith(sep))) {
      console.log(`Invalid line found! ${line}`);
      continue;
    }

    // count all spaces in front to get current depth
    const currentDepth =
      line.match(`^\\s*(${RegexEscapedBulletSeparators.join("|")})`)![0]
        .length - 1;

    // if greater depth, attach on to the last one
    // else you can pop back up to one with 1 less depth
    while (
      nodeStack.length - 1 >= 0 &&
      currentDepth <= nodeStack[nodeStack.length - 1].depth &&
      nodeStack[nodeStack.length - 1].depth > 0
    ) {
      nodeStack.pop();
    }

    const { telescopicOut, ...restLastNode } = nodeStack[nodeStack.length - 1];
    const strippedLine = trimmedLine.substring(1).replace(/^\s+/, "");
    // Add current content / node to the stack
    const currentContent: NewContent = { text: strippedLine, expansions: [] };
    if (currentDepth === defaultDepth) {
      telescopicOut.push(currentContent);
      nodeStack[nodeStack.length - 1] = {
        ...restLastNode,
        telescopicOut,
      };
    } else {
      telescopicOut[telescopicOut.length - 1].expansions!.push(currentContent);
      // add this current one as a replacement to the last upper level one.
      const newNode = {
        depth: currentDepth,
        telescopicOut: [currentContent],
      };
      nodeStack.push(newNode);
    }
  }

  return root;
}

// Ideally this would not be needed (just used to convert between data structures currently).
function _parseOutputIntoContent(
  output: TelescopicOutput,
  separator: string = " "
): Content {
  const parseReplacementsFromOutput = (out: TelescopicOutput): Line[] => {
    return out.flatMap((line: NewContent) => {
      if (!line.expansions?.length) {
        return [];
      }
      const newText = line.expansions.map((line) => line.text).join(separator);

      return [
        {
          og: line.text,
          new: newText,
          replacements: line.expansions?.length
            ? parseReplacementsFromOutput(line.expansions)
            : [],
        },
      ];
    });
  };
  const text = output.map((line: NewContent) => line.text).join(separator);
  const replacements: Line[] = parseReplacementsFromOutput(output);

  return { text, replacements };
}

// Ideally this would not be needed (just used to convert between data structures currently).
function _parseMarkdownIntoContent(
  mdContent: string,
  separator: string = " "
): Content {
  const output = _parseMarkdown(mdContent);
  return _parseOutputIntoContent(output, separator);
}

/**
 * Parses a markdown-compatible bulleted list into an HTML div that contains the telescoping text specified by the bullet list content.
 *
 * @param listContent - Content in the form of a bulleted list where items on the same level are combined using the `separator` parameter.
 * @param config - Configuration options provided to create interactive, telescopic text.
 * @returns HTML div containing the telescoping text.
 */
function createTelescopicTextFromBulletedList(
  listContent: string,
  { separator = " ", ...createTelescopicTextConfig }: Config = {}
): HTMLDivElement {
  const { textMode = TextMode.Text } = createTelescopicTextConfig;
  if (!TextModeValues.includes(textMode)) {
    throw new Error(
      `Invalid textMode provided! Please input one of ${TextModeValues.map(
        (s) => `'${s}'`
      ).join(", ")}`
    );
  }
  const content = _parseMarkdownIntoContent(listContent, separator);
  return _createTelescopicText([content], {
    textMode,
    ...createTelescopicTextConfig,
  });
}
