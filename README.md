# 🔭 Telescopic Text

[![](https://img.shields.io/npm/v/telescopic-text?style=flat-square)](https://www.npmjs.com/package/telescopic-text)

An open-source library to help with creating expandable text. 

Inspired by [StretchText](https://en.wikipedia.org/wiki/StretchText) and [TelescopicText](https://www.telescopictext.org/text/KPx0nlXlKTciC).

I've been thinking a lot about creating a browsable store of knowledge that provides something useful at all distance scales
(e.g. viewing the entire library, just a subcategory, a single file, etc.) and concepts like Telescopic Text are a first step
in creating more information scales than just a single document level.

This library is meant to be the start for anyone to create telescopic text, including those who are non-technical. 

## Creating a telescopic text
To create some telescopic text, you can use your favorite note-taking app or text editor that supports bullet lists and start by writing a full sentence or two in a starting bullet:
```
* Texts are boundless shapeshifters, zealous freedom fighters, sacred holders of space
```

At any point, you can break up the full sentence into separate lines. Bullets at the same indentation level are combined into the same sentence, and any indented bullets will be used as an expansion point for the parent bullet. By default, items on the same indentation level will be combined with a space ` `, but you can pass in a custom `separator` into the parsing function.
```
* Texts
  * Clear notes
* are boundless shapeshifters,
  * are limitless shapeshifters,
* zealous freedom fighters, sacred holders of space 
```

The above example would yield the following text: "Texts are boundless shapeshifters, zealous freedom fighters, sacred holders of space" where "Texts" is expandable into "Clear notes" and "are boundless shapeshifters" is expandable into "are limitless shapeshifters".

*NOTE*: the parsing logic is robust to different indentation levels, but for most compatible experience, you should normalize the indentations so that each nested bullet is differentiated by a standard set of spaces. We also currently only support `*`, `-`, and `+` bullet indicators.

## Usage
Create some expandable text using the bullet list format shown above. You can then test out how your poem looks and feels and get a basic code snippet that recreates it using the [test bed](https://poems.verses.xyz/test)!

See the full instructions below:

You can load it directly via CDN as follows:
Put this anywhere inside the `head` of your HTML file.

```html
<head>
  ...
  <script src="https://unpkg.com/telescopic-text/lib/index.js"></script>
  <link href="https://unpkg.com/telescopic-text/lib/index.css" rel="stylesheet">
</head>
```

or if you prefer to do the manual way, you can include the `lib/index.js` and `lib/index.css` files in your project.

The package exports a function called `createTelescopicTextFromBulletedList` that parses a bulleted list and returns a HTMLNode with your telescopic text inside.

Basic usage may look something like this:
```html
<head>
    <script src="https://unpkg.com/telescopic-text/lib/index.js"></script>
    <link href="https://unpkg.com/telescopic-text/lib/index.css" rel="stylesheet">
</head>
<body>
  <div id="text-container"></div>

  <script>
      const content = `
  * I 
    * Yawning, I
  * made tea`;
      const node = createTelescopicTextFromBulletedList(content);
      const container = document.getElementById("text-container");
      container.appendChild(node);
  </script>
</body>
```

### Advanced Usage Options
For further, customization, we provide a configuration object that can be passed into the function for different behavior. 
```typescript
// The configuration for how you want telescopic text to be parsed and rendered
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
}
```

You would use this by passing a custom configuration object into the function. For example, this is how you would create telescopic text with custom HTML tags:
```javascript
const content = `
* Some <b>rich</b> text
  * with <i>nested</i> <b>rich</b> text
`
const config = { textMode: TextMode.Html };
const poemContent = createTelescopicTextFromBulletedList(content, config);
```

You can check out a more detailed example in `demo/index.html`



## Types
```typescript
// Default function to create a new `<div>` node containing the
// telescoping text from bullet points
function createTelescopicTextFromBulletedList(content: string, config?: Config)
```

## Future Work
See our issues page for all the features we're thinking about exploring. Some examples include:
- Supporting infinite expansion with `...`
- Concept of shapeshifting text in general... these are not always expansions.
