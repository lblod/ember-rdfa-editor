---
"@lblod/ember-rdfa-editor": minor
---

Overhaul in the way we handle RDFa in the editor:
This release contains a completely rework in how we handle RDFa documents and RDF data in the editor.
These features are fully opt-in and should be considered experimental.

#### Changes

Instead of using and dealing with plain RDFa attributes, this release introduces an new `rdfaAware` API:
Two types of RDFa-aware node types are introduced: `resource` nodes and `literal` nodes.

##### Resource nodes
Resource nodes as the name suggests, define a `resource` in a document. This resource is always represented by a URI.
A document may contain multiple resource nodes, which may define the same or different resources.
In equivalent RDFa, a resource node will typically be serialized to an html element with the RDFa `about` attribute.
Resource nodes may contain the following prosemirror attributes:
- `subject`: the URI of the resource
- `properties`: a list of properties defined on the subject/resource. These properties correspond with RDF triples for which the resource URI is the subject.
- `backlinks`: contains the 'inverses' of properties. Corresponds with RDF triples for which the resource URI is the object. The `subject` of these backlinks will typically also be defined in the document using a resource node.
- `__rdfaId`: a unique id representing the resource node. You can use this id to search specific nodes in a document.

##### Literal nodes
Literal nodes define a `literal` in a document. This node will typically be the target of a property defined by a resource node. The content of the `literal` is defined by the content inside a literal node.
Literal nodes may contain the following prosemirror attributes:
- `backlinks`: contains the 'inverses' of properties. Corresponds with RDF triples for which the literal is the object. The `subject` of these backlinks will typically also be defined in the document using a resource node. Literal nodes will typically only have 1 backlink.
- `__rdfaId`: a unique id representing the literal node. You can use this id to search specific nodes in a document.
Note: literal nodes do not have `subject` or `properties` attributes. Literals can not define the subject of an RDF triple.

##### Changes to existing node-specs
Most of the nodes contained in this package (`block_rdfa`, `inline_rdfa`, `heading` etc.) are now provided in two versions: an `rdfaAware` version an a non-`rdfaAware` version:
`blockRdfaWithConfig` replaces `block_rdfa`: `blockRdfaWithConfig` is a configurable node-spec which allows developers to specify whether the node-spec should work in an `rdfaAware` way or not.
Similar to `blockRdfaWithConfig`, other node-specs have also been replaced by a configurable version (check-out the `deprecations` section).
The configurable node-specs are by default non-`rdfaAware`. The static nodespecs remain included in this package for now, but have been marked as deprecated.

##### Other changes included in this release
Apart from the changes included to the node-specs and the ways we handle RDFa, this release also contains several new (experimental) tools and API to work with the new `rdfaAware` system.
Some of these tools are marked as private (such as experimental GUI tools and API) and are thus not part of the public API.
Among these, the following tools/API are included:
- A new parser/serializer system that allows to correctly parse and serialize `rdfaAware` nodes and documents
- New prosemirror commands to work with the `rdfaAware` system
- GUI tools (some of these are private API) to operate and interact with `rdfaAware` nodes and documents



#### Deprecations
- Passing the `keyMapOptions` argument to the `RdfaEditor` is deprecated. The behaviour of `selectBlockRdfaNode` is included by default. This feature will be removed in the next major release.
- The `rdfaAttrs` constant is deprecated, use the `rdfaAttrSpec` function instead
- `inline_rdfa` is deprecated, use `inlineRdfaWithConfig` instead
- `block_rdfa` is deprecated, use `blockRdfaWithConfig` instead
- `doc` is deprecated, use `docWithConfig` instead
- `invisible_rdfa` is deprecated, use `invisibleRdfaWithConfig` instead
- `repaired_block` is deprecated, use `repairedBlockWithConfig` instead
- `heading` is deprecated, use `headingWithConfig` instead
- `ordered_list` is deprecated, use `orderedListWithConfig` instead
- `bullet_list` is deprecated, use `bulletListWithConfig` instead
- `list_item` is deprecated, use `listItemWithConfig` instead
