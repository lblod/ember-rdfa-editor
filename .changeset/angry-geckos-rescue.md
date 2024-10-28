---
'@lblod/ember-rdfa-editor': patch
---

Make block-rdfa non-defining for copy operations

This means that when you copy text from inside an rdfa block, the block itself
no longer gets copied along. It just stays where it is, which is more natural
