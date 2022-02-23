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

interface Config {
  /**
  * Character used to separate entries on the same level. Defaults to a single space (" ")
  */
  separator?: string;
  hoverable?: boolean;
}

const _DEFAULT_CONFIG: Config = {
  separator: " ",   // character to divide items on the same indentation level
  hoverable: false, // whether text can be expanded on hover
}

// time; recorded to prevent recursive text expansion on single hover
let _lastHoveredTime = Date.now();

// Internal recursive function to hydrate a node with a line object.
function _hydrate(line: Content, node: any, hoverable: boolean = false) {
  let lineText = line.text;

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

      // if the text is hoverable,
      if (hoverable) {
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
      summary.appendChild(document.createTextNode(replacement.og));
      detail.appendChild(summary);

      // create inner text, recursively hydrate
      const newLine = {
        text: replacement.new,
        replacements: replacement.replacements,
      };
      const expanded = document.createElement("span");
      expanded.classList.add("expanded");
      _hydrate(newLine, expanded, hoverable);

      // append to parent
      detail.appendChild(expanded);
      node.appendChild(detail);
    }
    if (lineText) {
      const endText = document.createTextNode(lineText);
      node.appendChild(endText);
    }
  } else {
    // otherwise, this is a leaf node
    if (lineText.includes("@Q ")) {
      // if this is a quotation, turn it into a <blockquote> element
      const [before, quote] = lineText.split("@Q ", 2);
      const pre = document.createTextNode(before);
      node.appendChild(pre);
      const el = document.createElement("blockquote");
      el.innerText = quote;
      node.appendChild(el);
    } else {
      // otherwise, plain text node
      const el = document.createTextNode(lineText);
      node.appendChild(el);
    }
  }
}

// Helper function to create a new `<div>` node containing the
// telescoping text.
function _createTelescopicText(content: Content[], hoverable: boolean = false) {
  const letter = document.createElement("div");
  letter.id = "telescope";
  content.forEach((line) => {
    const newNode = document.createElement("p");
    _hydrate(line, newNode, hoverable);
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
    if (currentDepth === 0) {
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
  { separator, hoverable }: Config = _DEFAULT_CONFIG,
): HTMLDivElement {
  const content = _parseMarkdownIntoContent(listContent, separator);
  return _createTelescopicText([content], hoverable);
}
