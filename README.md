# Dynamic HTML render and a Recursive Descendent Parser


In this work, we implement a library of Web Components similar to React.JS, which maintains its internal Virtual DOM representation, and optimized the render of the HTML page. Indeed, we implement function which modifies only the parts of the DOM element that have been changed since the previous rendering. Futhermore, we implemented a recursive descent parser that introduce the ability to express components in a style such as JSX, reading from an input stream. The programming language used in this project is JavaScript.

The grammar used in JSX is the following:


```
jsxel := < tag jsxrec | jsxval
jsxattr := [name=jsxval]* | \epsilon
jsxrec  := jsxattr> jsxel* tagClose | />
tagClose := </tag>
jsxval := " string " | { JS }
JS := JavaScript expression
tag := string
name := string
```

You may find some test for the library in Testcomponent.js, or you can find an example in [jsfiddle](https://jsfiddle.net/6nep3Lat/)

Here some references:
- [Advanced-Performance](https://facebook.github.io/react/docs/advanced-performance.html) - the algorithm used for the tree diff of the Virtual DOM.
- [Reconciliation](https://facebook.github.io/react/docs/reconciliation.html) - algorithm used to keep the real DOM update.
