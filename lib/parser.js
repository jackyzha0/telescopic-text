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
 * Parses the input string and returns the output as a structured data format.
 *
 * @param mdContent full string of markdown content that is formatted as a unorederd bulleted list
 * @returns
 */
export function parseMarkdown(mdContent) {
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
    var _loop_1 = function (line) {
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
        _loop_1(line);
    }
    return root;
}
export function parseOutputIntoContent(output, separator) {
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
export function parseMarkdownIntoContent(mdContent, separator) {
    if (separator === void 0) { separator = " "; }
    var output = parseMarkdown(mdContent);
    return parseOutputIntoContent(output, separator);
}
