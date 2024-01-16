---
"@lblod/ember-rdfa-editor": patch
---

Addition of a transformPasted hook to transform the slice to be pasted if necessary.
- If the node before the current selection is not inline, the slice will be closed at the start
- If the node after the current selection is not inline, the slice will be closed at the end

