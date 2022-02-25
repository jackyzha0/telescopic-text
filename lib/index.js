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
var DefaultConfig = {
    separator: " ",
    shouldExpandOnMouseOver: false, // whether text can be expanded on hover
};
// time; recorded to prevent recursive text expansion on single hover
var _lastHoveredTime = Date.now();
// Internal recursive function to hydrate a node with a line object.
function _hydrate(line, node, shouldExpandOnMouseOver) {
    if (shouldExpandOnMouseOver === void 0) { shouldExpandOnMouseOver = false; }
    var lineText = line.text;
    if (line.replacements.length > 0) {
        var _loop_1 = function (i) {
            var replacement = line.replacements[i];
            // split single occurrence of replacement pattern
            var _b = lineText.split(replacement.og), before = _b[0], afterarr = _b.slice(1);
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
            // if the text is shouldExpandOnMouseOver,
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
            summary.appendChild(document.createTextNode(replacement.og));
            detail.appendChild(summary);
            // create inner text, recursively hydrate
            var newLine = {
                text: replacement.new,
                replacements: replacement.replacements,
            };
            var expanded = document.createElement("span");
            expanded.classList.add("expanded");
            _hydrate(newLine, expanded, shouldExpandOnMouseOver);
            // append to parent
            detail.appendChild(expanded);
            node.appendChild(detail);
        };
        // only iterate lines if there are actually things to replace
        for (var i = 0; i < line.replacements.length; i++) {
            _loop_1(i);
        }
        if (lineText) {
            var endText = document.createTextNode(lineText);
            node.appendChild(endText);
        }
    }
    else {
        // otherwise, this is a leaf node
        if (lineText.includes("@Q ")) {
            // if this is a quotation, turn it into a <blockquote> element
            var _a = lineText.split("@Q ", 2), before = _a[0], quote = _a[1];
            var pre = document.createTextNode(before);
            node.appendChild(pre);
            var el = document.createElement("blockquote");
            el.innerText = quote;
            node.appendChild(el);
        }
        else {
            // otherwise, plain text node
            var el = document.createTextNode(lineText);
            node.appendChild(el);
        }
    }
}
// Helper function to create a new `<div>` node containing the
// telescoping text.
function _createTelescopicText(content, shouldExpandOnMouseOver) {
    if (shouldExpandOnMouseOver === void 0) { shouldExpandOnMouseOver = false; }
    var letter = document.createElement("div");
    letter.id = "telescope";
    content.forEach(function (line) {
        var newNode = document.createElement("p");
        _hydrate(line, newNode, shouldExpandOnMouseOver);
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
    var BulletSeparators = ["*", "-", "+"];
    var RegexEscapedBulletSeparators = ["\\*", "-", "\\+"];
    var lines = mdContent.split("\n");
    // NOTE: this should handle normalizing the depth (if its an indented list)
    var root = [];
    var nodeStack = [{ depth: 0, telescopicOut: root }];
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
        var _a = nodeStack[nodeStack.length - 1], telescopicOut = _a.telescopicOut, restLastNode = __rest(_a, ["telescopicOut"]);
        var strippedLine = trimmedLine.substring(1).replace(/^\s+/, "");
        // Add current content / node to the stack
        var currentContent = { text: strippedLine, expansions: [] };
        if (currentDepth === 0) {
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
    // This is essentially a trie data structure to parse out all the bullet points
    // The algorithm works by assuming that any time you encounter a longer depth than the current one,
    // you are moving onto the next line.
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
    var _b = _a === void 0 ? DefaultConfig : _a, separator = _b.separator, shouldExpandOnMouseOver = _b.shouldExpandOnMouseOver;
    var content = _parseMarkdownIntoContent(listContent, separator);
    return _createTelescopicText([content], shouldExpandOnMouseOver);
}
//# sourceMappingURL=index.js.map