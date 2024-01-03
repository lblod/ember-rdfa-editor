---
"@lblod/ember-rdfa-editor": patch
---

GN-4568: Fallback to "align" attribute when parsing DOM.

Editor will attempt to use the `align` attribute if the `text-align` property of `style` attribute is not present to determine the alignment when parsing DOM.
