---
"@lblod/ember-rdfa-editor": major
---

Removal of the id attribute from the block_rdfa spec. It is currently not used by the block_rdfa node and is not part of the RDFa spec.

Additionally, this solves the issue where paragraphs with an id attribute were parsed as block_rdfa.
