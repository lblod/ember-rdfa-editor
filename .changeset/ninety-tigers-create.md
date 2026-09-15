---
'@lblod/ember-rdfa-editor': patch
---

link-plugin: adjustment of `DEFAULT_REGEX` to ensure that URL schemes are parsed in a case insensitive way. E.g. `HttP` is now also accepted and parsed as `http`
