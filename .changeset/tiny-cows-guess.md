---
"@lblod/ember-rdfa-editor": major
---

When using the `setHTMLContent` method to also update the attributes of the topNode correctly. This should make `setHTMLContent` more-or-less equivalent with the `initialize` method. The main difference is that `initialize` creates a new state and `setHTMLContent` does not.
