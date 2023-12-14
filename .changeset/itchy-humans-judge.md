---
"@lblod/ember-rdfa-editor": minor
---

GN-4612: Always clean Word specific elements on paste

Don't rely on presence of `text/rtf` data in `ClipboardEvent` to determine  
whether the paste is coming from Word, always apply the cleaning.
