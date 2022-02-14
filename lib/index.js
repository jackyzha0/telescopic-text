// Internal recursive function to hydrate a node with a line object.
export function hydrate(line, node) {
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
            hydrate(newLine, expanded);
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
// Default function to create a new `<div>` node containing the
// telescoping text.
export function createTelescopicText(content) {
    var letter = document.createElement("div");
    letter.id = "telescope";
    content
        .forEach(function (line) {
        var newNode = document.createElement("p");
        // hydrate new p tag with content
        hydrate(line, newNode);
        letter.appendChild(newNode);
    });
    return letter;
}
export * from './parser';
