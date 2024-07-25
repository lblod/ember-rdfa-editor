---
"@lblod/ember-rdfa-editor": patch
---

fix in `addPropertyToNode` function: when property is already included, do not add it a second time (this prevents duplications)
