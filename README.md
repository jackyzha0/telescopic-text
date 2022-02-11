# 🔭 Telescopic Text

An open-source library to help with creating expandable text. 

Inspired by [StretchText](https://en.wikipedia.org/wiki/StretchText) and [TelescopicText](https://www.telescopictext.org/text/KPx0nlXlKTciC).

I've been thinking a lot about creating a browsable store of knowledge that provides something useful at all distance scales
(e.g. viewing the entire library, just a subcategory, a single file, etc.) and concepts like Telescopic Text are a first step
in creating more information scales than just a single document level.

## Usage
You can load it directly using a CDN as follows

```html
<script src="https://unpkg.com/telescopic-text/index.js"></script>
<link href="https://unpkg.com/telescopic-text/index.css" rel="stylesheet">
```

or manually include the `index.js` and `index.css` files in your project.

The package exports a function called `createTelescopicText` that returns a HTMLNode with your telescopic text inside.
Basic usage may look something like this:

```html
<div id="text-container"></div>

<script>
    const node = createTelescopicText([
        {text: "I made tea.", replacements: [
            {og: "I", new: "Yawning, I", replacements: []}
        ]}]
    ])
    const container = document.getElementById("text-container")
    container.appendChild(node)
</script>
```