---
"@lblod/ember-rdfa-editor": patch
---

Fix regression in parsing logic of `extraAttributes` of `doc` node-spec.
This regression was introduced in version [9.6.0](https://github.com/lblod/ember-rdfa-editor/releases/tag/v9.6.0).
This fix ensures that the `extraAttributes` are now once again correctly parsed when loading a document.
