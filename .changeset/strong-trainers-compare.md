---
'@lblod/ember-rdfa-editor': patch
---

Reduce specificity of general editor margin rule.
This fix reverts a previous breaking change wherein the specificity of the general editor margin css rule was increased from (0,1,1) to (0,2,1). This fix ensures the specificity is reverted back to (0,1,1).
