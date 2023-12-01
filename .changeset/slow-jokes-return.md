---
"@lblod/ember-rdfa-editor": patch
---

GN-4621: Add styling for selected table cell

* `.selectedCell` to style the cell that is selected. `.selectedCell` comes from the `prosemirror-tables` plugin. 
* `::selection` to hide the selection on the text inside the cell.
