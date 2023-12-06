---
"@lblod/ember-rdfa-editor": major
---

Add option for the document (top) node to be parsed using `parseDOM` parse-rules. When setting the content of a document, using either `setHTMLContent` or `initialize`, three options are possible:
  * The `topNode` (often `doc`) has no parse-rules: a default node of type `topNode` is created (without any attributes). The html provided to `setHTMLContent` or `intialize` is parsed as its content.
  * The `topNode` has 1 or more parse-rules: the parser searches the provided html for a node that matches a parse-rule of the `topNode`.
     - If a node is found: the node is parsed as the `topNode` and its content is parsed as the `topNode` content
     - If a node is not found: a default `topNode` node is created. The html provided to `setHTMLContent` or `intialize` is parsed as its content.
