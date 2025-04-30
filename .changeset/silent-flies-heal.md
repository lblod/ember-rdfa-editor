---
'@lblod/ember-rdfa-editor': patch
---

Use `absolute` positioning instead of `fixed` positioning to position ember-velcro popups.
This ensures that these popups are still correctly positioned when the editor is used inside an embedded application in e.g. a shadow-root.
Check-out https://github.com/floating-ui/floating-ui/issues/2934 for more information about the issue with using the `fixed` strategy inside a shadow-root.
