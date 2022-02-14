# 🔭 Telescopic Text

An open-source library to help with creating expandable text. 

Inspired by [StretchText](https://en.wikipedia.org/wiki/StretchText) and [TelescopicText](https://www.telescopictext.org/text/KPx0nlXlKTciC).

I've been thinking a lot about creating a browsable store of knowledge that provides something useful at all distance scales
(e.g. viewing the entire library, just a subcategory, a single file, etc.) and concepts like Telescopic Text are a first step
in creating more information scales than just a single document level.

## Usage
You can load it directly using a CDN as follows

```html
<script src="https://unpkg.com/telescopic-text/lib/index.js"></script>
<link href="https://unpkg.com/telescopic-text/lib/index.css" rel="stylesheet">
```

or manually include the `lib/index.js` and `lib/index.css` files in your project.

The package exports a function called `createTelescopicText` that returns a HTMLNode with your telescopic text inside.
Basic usage may look something like this:

```html
<head>
    <script src="https://unpkg.com/telescopic-text/lib/index.js"></script>
    <link href="https://unpkg.com/telescopic-text/lib/index.css" rel="stylesheet">
</head>
<body>
<div id="text-container"></div>

<script>
    const node = createTelescopicText([
        {text: "I made tea.", replacements: [
                {og: "I", new: "Yawning, I", replacements: []}
            ]}
    ])
    const container = document.getElementById("text-container")
    container.appendChild(node)
</script>
</body>
```

You can check out a more detailed example in `example.html`

## Types
```typescript
interface Content {
  text: string          // Original string content in the line
  replacements: Line[]  // Sections of the original text to replace/expand
}

interface Line {
  og: string           // the original string to replace
  new: string          // the replacement string
  replacements: Line[] // nested replacements to apply on the resultant line afterwards
}

// Default function to create a new `<div>` node containing the
// telescoping text.
function createTelescopicText(content: Content[])
```