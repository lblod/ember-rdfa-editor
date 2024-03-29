---
"@lblod/ember-rdfa-editor": minor
---

This release contains experimental support for the new `rdfaAware` system and API. 
For more information, check out [A new approach to handle RDFa in documents](https://github.com/lblod/ember-rdfa-editor/blob/9c32a9dea0da13df4092c39d9a092ba0803a3f42/README.md#experimental-a-new-approach-to-handle-rdfa-in-documents)

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
