---
"@lblod/ember-rdfa-editor": minor
---

Introduction of a custom gap-cursor plugin containing several fixes compared to the original version:

- The click handler has been replaced by a mousedown handler in order to intercept a click event earlier
- The types of the GapCursor class have been fixed
- Addition of a fix when resolving the position returned by view.posAtCoords.
