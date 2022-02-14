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

interface Node {
  depth: number;
  telescopicOut: TelescopicOutput;
}

/**
 * Parses the input string and returns the output as a structured data format.
 *
 * @param mdContent full string of markdown content that is formatted as a unorederd bulleted list
 * @returns
 */
export function parseMarkdown(
  mdContent: string
): TelescopicOutput {
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
  const nodeStack: Node[] = [{ depth: 0, telescopicOut: root }];

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

export function parseOutputIntoContent(
  output: TelescopicOutput,
  separator: string = " "
): Content {
  const parseReplacementsFromOutput = (out: TelescopicOutput): Line[] => {
    return out.flatMap((line) => {
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
  const text = output.map((line) => line.text).join(separator);
  const replacements: Line[] = parseReplacementsFromOutput(output);

  return { text, replacements };
}

export function parseMarkdownIntoContent(
  mdContent: string,
  separator: string = " "
): Content {
  const output = parseMarkdown(mdContent);
  return parseOutputIntoContent(output, separator);
}
