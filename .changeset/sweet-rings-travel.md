---
'@lblod/ember-rdfa-editor': minor
---

Add ability to add external (= loose) triples to a resource node

External triples are data not connected to an in-document node. They can be used
to define knowledge about URIs which are not mentioned in the document. 

It's expected this will be rather rare, but crucial for some embedded usecases.

External triples are serialized inside a new container inside the already
exising rdfa-container, annotated with the `data-external-triple-container` 
attribute, which is why I don't consider this a breaking change. 

Also adds a new transactionMonad for manipulating these:
`transformExternalTriples`, and 2 shorthand wrappers: `addExternalTriple` and
`setExternalTriples`.

It also expands the rdfa-editor sidebar tools with an external triple section.
