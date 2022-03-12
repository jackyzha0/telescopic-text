var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
/**
 * Modes that designate what form the input text is in and should be interpreted as.
 */
var TextMode;
(function (TextMode) {
    TextMode["Text"] = "text";
    /**
     * NOTE: this uses `innerHtml` under the hood, so should not be used with untrusted user input and can have
     * unexpected behavior if the HTML is not valid.
     */
    TextMode["Html"] = "html";
})(TextMode || (TextMode = {}));
var TextModeValues = Object.values(TextMode);
// time; recorded to prevent recursive text expansion on single hover
var _lastHoveredTime = Date.now();
// Internal recursive function to hydrate a node with a line object.
function _hydrate(line, node, config) {
    if (config === void 0) { config = {}; }
    var shouldExpandOnMouseOver = config.shouldExpandOnMouseOver, _a = config.textMode, textMode = _a === void 0 ? TextMode.Text : _a, _b = config.htmlContainerTag, htmlContainerTag = _b === void 0 ? "span" : _b;
    var lineText = line.text;
    function createLineNode(lineText) {
        switch (textMode) {
            case TextMode.Text:
                // TODO: move this special character replacement functionality into a general purpose config
                // passed in at the top-level.
                if (lineText.includes("@Q ")) {
                    // if this is a quotation, turn it into a <blockquote> element
                    var _a = lineText.split("@Q ", 2), before = _a[0], quote = _a[1];
                    var pre = document.createTextNode(before);
                    node.appendChild(pre);
                    var el = document.createElement("blockquote");
                    el.innerText = quote;
                    return el;
                }
                else {
                    return document.createTextNode(lineText);
                }
            case TextMode.Html:
                var newNode = document.createElement(htmlContainerTag);
                newNode.innerHTML = lineText;
                return newNode;
            default:
                throw new Error("Invalid text mode found: " + textMode);
        }
    }
    if (line.replacements.length > 0) {
        var _loop_1 = function (i) {
            var replacement = line.replacements[i];
            // split single occurrence of replacement pattern
            var _c = lineText.split(replacement.og), before = _c[0], afterarr = _c.slice(1);
            var after = afterarr.join(replacement.og);
            // consume
            lineText = after;
            // add old real text
            node.appendChild(document.createTextNode(before));
            // create actual telescope
            var detail = document.createElement("span");
            detail.classList.add("details", "close");
            // add expand on click handler
            detail.addEventListener("click", function () {
                detail.classList.remove("close");
                detail.classList.add("open");
            });
            if (shouldExpandOnMouseOver) {
                // expand the text if text was not moused over immediately before
                detail.addEventListener("mouseover", function () {
                    if (Date.now() - _lastHoveredTime > 10) {
                        detail.classList.remove("close");
                        detail.classList.add("open");
                        _lastHoveredTime = Date.now();
                    }
                });
            }
            var summary = document.createElement("span");
            summary.classList.add("summary");
            var newNode = createLineNode(replacement.og);
            summary.appendChild(newNode);
            detail.appendChild(summary);
            // create inner text, recursively hydrate
            var newLine = {
                text: replacement.new,
                replacements: replacement.replacements,
            };
            var expanded = document.createElement("span");
            expanded.classList.add("expanded");
            _hydrate(newLine, expanded, config);
            // append to parent
            detail.appendChild(expanded);
            node.appendChild(detail);
        };
        // only iterate lines if there are actually things to replace
        for (var i = 0; i < line.replacements.length; i++) {
            _loop_1(i);
        }
        if (lineText) {
            var endText = createLineNode(lineText);
            node.appendChild(endText);
        }
    }
    else {
        // otherwise, this is a leaf node
        var newNode = createLineNode(lineText);
        node.appendChild(newNode);
    }
}
// Helper function to create a new `<div>` node containing the
// telescoping text.
function _createTelescopicText(content, config) {
    if (config === void 0) { config = {}; }
    var letter = document.createElement("div");
    letter.id = "telescope";
    content.forEach(function (line) {
        var newNode = document.createElement("p");
        _hydrate(line, newNode, config);
        letter.appendChild(newNode);
    });
    return letter;
}
/*****************/
/* PARSING LOGIC */
/*****************/
// Parses the input string and returns the output as a structured data format.
function _parseMarkdown(mdContent) {
    // In future we might want to support full markdown in which case..
    //   const html = marked.parse(mdContent);
    //  convert into jsdom
    //   const lines = html.split("\n");
    // Also idea for "..." or ellipsis character to repreesnt infinite expansion.
    var _a, _b;
    var BulletSeparators = ["*", "-", "+"];
    var RegexEscapedBulletSeparators = ["\\*", "-", "\\+"];
    var lines = mdContent.split("\n");
    // NOTE: this should handle normalizing the depth (if its an indented list)
    var root = [];
    var nodeStack = [{ depth: 0, telescopicOut: root }];
    // This is essentially a trie data structure to parse out all the bullet points
    // The algorithm works by assuming that any time you encounter a longer depth than the current one,
    // you are moving onto the next line.
    var firstNonEmptyLine = lines.find(function (l) { return l.trim().length > 0; });
    var defaultDepth = ((_b = (_a = firstNonEmptyLine === null || firstNonEmptyLine === void 0 ? void 0 : firstNonEmptyLine.match("^\\s*(".concat(RegexEscapedBulletSeparators.join("|"), ")"))) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.length) - 1 || 0;
    var _loop_2 = function (line) {
        var trimmedLine = line.trim();
        if (!trimmedLine.length) {
            return "continue";
        }
        // validate that the trimmed line starts with the bullet indicators.
        if (!BulletSeparators.some(function (sep) { return trimmedLine.startsWith(sep); })) {
            console.log("Invalid line found! ".concat(line));
            return "continue";
        }
        // count all spaces in front to get current depth
        var currentDepth = line.match("^\\s*(".concat(RegexEscapedBulletSeparators.join("|"), ")"))[0]
            .length - 1;
        // if greater depth, attach on to the last one
        // else you can pop back up to one with 1 less depth
        while (nodeStack.length - 1 >= 0 &&
            currentDepth <= nodeStack[nodeStack.length - 1].depth &&
            nodeStack[nodeStack.length - 1].depth > 0) {
            nodeStack.pop();
        }
        var _c = nodeStack[nodeStack.length - 1], telescopicOut = _c.telescopicOut, restLastNode = __rest(_c, ["telescopicOut"]);
        var strippedLine = trimmedLine.substring(1).replace(/^\s+/, "");
        // Add current content / node to the stack
        var currentContent = { text: strippedLine, expansions: [] };
        if (currentDepth === defaultDepth) {
            telescopicOut.push(currentContent);
            nodeStack[nodeStack.length - 1] = __assign(__assign({}, restLastNode), { telescopicOut: telescopicOut });
        }
        else {
            telescopicOut[telescopicOut.length - 1].expansions.push(currentContent);
            // add this current one as a replacement to the last upper level one.
            var newNode = {
                depth: currentDepth,
                telescopicOut: [currentContent],
            };
            nodeStack.push(newNode);
        }
    };
    for (var _i = 0, lines_1 = lines; _i < lines_1.length; _i++) {
        var line = lines_1[_i];
        _loop_2(line);
    }
    return root;
}
// Ideally this would not be needed (just used to convert between data structures currently).
function _parseOutputIntoContent(output, separator) {
    if (separator === void 0) { separator = " "; }
    var parseReplacementsFromOutput = function (out) {
        return out.flatMap(function (line) {
            var _a, _b;
            if (!((_a = line.expansions) === null || _a === void 0 ? void 0 : _a.length)) {
                return [];
            }
            var newText = line.expansions.map(function (line) { return line.text; }).join(separator);
            return [
                {
                    og: line.text,
                    new: newText,
                    replacements: ((_b = line.expansions) === null || _b === void 0 ? void 0 : _b.length)
                        ? parseReplacementsFromOutput(line.expansions)
                        : [],
                },
            ];
        });
    };
    var text = output.map(function (line) { return line.text; }).join(separator);
    var replacements = parseReplacementsFromOutput(output);
    return { text: text, replacements: replacements };
}
// Ideally this would not be needed (just used to convert between data structures currently).
function _parseMarkdownIntoContent(mdContent, separator) {
    if (separator === void 0) { separator = " "; }
    var output = _parseMarkdown(mdContent);
    return _parseOutputIntoContent(output, separator);
}
/**
 * Parses a markdown-compatible bulleted list into an HTML div that contains the telescoping text specified by the bullet list content.
 *
 * @param listContent - Content in the form of a bulleted list where items on the same level are combined using the `separator` parameter.
 * @param config - Configuration options provided to create interactive, telescopic text.
 * @returns HTML div containing the telescoping text.
 */
function createTelescopicTextFromBulletedList(listContent, _a) {
    if (_a === void 0) { _a = {}; }
    var _b = _a.separator, separator = _b === void 0 ? " " : _b, createTelescopicTextConfig = __rest(_a, ["separator"]);
    var _c = createTelescopicTextConfig.textMode, textMode = _c === void 0 ? TextMode.Text : _c;
    if (!TextModeValues.includes(textMode)) {
        throw new Error("Invalid textMode provided! Please input one of ".concat(TextModeValues.map(function (s) { return "'".concat(s, "'"); }).join(", ")));
    }
    var content = _parseMarkdownIntoContent(listContent, separator);
    return _createTelescopicText([content], __assign({ textMode: textMode }, createTelescopicTextConfig));
}
//# sourceMappingURL=index.js.map