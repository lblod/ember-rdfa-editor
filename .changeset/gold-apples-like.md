---
'@lblod/ember-rdfa-editor': minor
---

Adjust `updateSubject` utility function:
- accept `null` as a `targetSubject` value. If `null` is passed, the node is converted to a literal node. In this case, the `keepProperties` argument is ignored (properties are always removed in case of conversion to a literal node).
- the function can now also be run on literal nodes. This always you to easily convert a literal node to a resource node with a certain subject.