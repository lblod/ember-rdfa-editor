---
'@lblod/ember-rdfa-editor': major
---

Recreate uuids plugin rework
Now in order to make the recreateUuids on a node you must specify a function, called recreateUriFunction in the spec, that gets your node attributes and returns
a new set of attributes with the uuids recreated, a function called `recreateUriAttribute(attrs: Attrs, uriAttributes: [string])`
is exported from the plugin file, to help recreate the old behaviour.
Also the function `recreateUri(oldUri: string)` is provided to help recreate a specific uri.