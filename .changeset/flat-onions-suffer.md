---
"@lblod/ember-rdfa-editor": minor
---

GN-4130: Remove "data-editor-highlight" styled

Removes styles that were affecting elements with the "data-editor-highlight" attribute.  
Styles are moved to [ember-rdfa-editor-lblod-plugins](https://github.com/lblod/ember-rdfa-editor-lblod-plugins) and are  
applied through the `citation-plugin`.
