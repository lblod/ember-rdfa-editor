---
'@lblod/ember-rdfa-editor': minor
---

Seperate rdfa-tools into seperate components:
  * `attribute-editor`
  * `debug-info`
  * `doc-imported-resource-editor`
  * `external-triple-editor`
  * `imported-resource-linker`
  * `node-controls`
  * `rdfa-visualizer`
  * `relationship-editor` (contains both the old property and backlink editors)
Each of these tools/components has one specific purpose and can be enabled/disabled seperately.
