"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTelescopicText = exports.hydrate = void 0;
// Internal recursive function to hydrate a node with a line object.
function hydrate(line, node) {
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
            hydrate(newLine, expanded);
            // append to parent
            detail.appendChild(expanded);
            node.appendChild(detail);
        }
        if (lineText) {
            const endText = document.createTextNode(lineText);
            node.appendChild(endText);
        }
    }
    else {
        // otherwise, this is a leaf node
        if (lineText.includes("@Q ")) {
            // if this is a quotation, turn it into a <blockquote> element
            const [before, quote] = lineText.split("@Q ", 2);
            const pre = document.createTextNode(before);
            node.appendChild(pre);
            const el = document.createElement("blockquote");
            el.innerText = quote;
            node.appendChild(el);
        }
        else {
            // otherwise, plain text node
            const el = document.createTextNode(lineText);
            node.appendChild(el);
        }
    }
}
exports.hydrate = hydrate;
// Default function to create a new `<div>` node containing the
// telescoping text.
function createTelescopicText(content) {
    const letter = document.createElement("div");
    letter.id = "telescope";
    content
        .forEach((line) => {
        const newNode = document.createElement("p");
        // hydrate new p tag with content
        hydrate(line, newNode);
        letter.appendChild(newNode);
    });
    return letter;
}
exports.createTelescopicText = createTelescopicText;
__exportStar(require("./parser"), exports);
