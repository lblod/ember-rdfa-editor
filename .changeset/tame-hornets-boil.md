---
'@lblod/ember-rdfa-editor': patch
---

Improve behaviour of `wrapIncludingParents` when working with gap-cursor selections. When the selection is a gap-cursor, do not wrap around its parent, but rather simply insert a node of the given `nodeType` at that selection.
This ensures the behaviour of the command is similar as when it is dealing with a collapsed text-selection. 
