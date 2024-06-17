---
"@lblod/ember-rdfa-editor": patch
---

Define `equals` as a prototype method on RDF term instances instead of as arrow functions.

**Why is this necessary?**
Defining `equals` as a prototype method ensures that is not part of the RDF term objects themselves. This makes it easier/less error-prone to compare objects containing these terms. (e.g. the object-comparison library used by prosemirror-tools does not support function properties)

**Possible drawbacks of this approach**
This approach does have the drawback that spreading an RDF term results in losing the `equals` method.
