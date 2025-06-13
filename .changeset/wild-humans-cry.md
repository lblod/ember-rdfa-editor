---
'@lblod/ember-rdfa-editor': minor
---

Add always defined controller block param to EditorContainer to allow cutting down on boilerplate is-not-undefined checks in editor components.
This requires a SayController be passed to EditorContainer.
For backwards compatibility, the blocks that are only shown when the controller exists are named differently to the previous blocks.
