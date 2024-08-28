# @lblod/ember-rdfa-editor

## 10.3.0

### Minor Changes

- [#1215](https://github.com/lblod/ember-rdfa-editor/pull/1215) [`310bb3a`](https://github.com/lblod/ember-rdfa-editor/commit/310bb3a6c826fcb56d1983f37ad2837e62b06ec2) Thanks [@elpoelma](https://github.com/elpoelma)! - Ensure `SaySerializer` can be used in a headless way.
  - Deprecation of passing instance of `SayEditor` to `SaySerializer` constructor and its static functions.
  - Add option to pass instance of `StateGenerator` instead of `SayEditor` to `SaySerializer` constructor and its static functions. This is the preffered way of using the serializer going forward and removes its dependency on a view.

### Patch Changes

- [#1215](https://github.com/lblod/ember-rdfa-editor/pull/1215) [`65afeb1`](https://github.com/lblod/ember-rdfa-editor/commit/65afeb14086f4c5384cb13b2512551a0d270dfb2) Thanks [@elpoelma](https://github.com/elpoelma)! - Fix issue in `addPropertyToNode` transaction-monad: ensure backlinks are added when needed

## 10.2.0

### Minor Changes

- [#1209](https://github.com/lblod/ember-rdfa-editor/pull/1209) [`fd2885b`](https://github.com/lblod/ember-rdfa-editor/commit/fd2885b7c2f972f947c59a2a2447a4ecc2332b39) Thanks [@elpoelma](https://github.com/elpoelma)! - Make `pathFromRoot` argument of `prepocessRDFa` optional

- [#1209](https://github.com/lblod/ember-rdfa-editor/pull/1209) [`2c2d92b`](https://github.com/lblod/ember-rdfa-editor/commit/2c2d92b2cf00b5d6bdf1d8321a10580a2c1b181b) Thanks [@elpoelma](https://github.com/elpoelma)! - Drop `editorView` dependency of html-input-parser

### Patch Changes

- [#1209](https://github.com/lblod/ember-rdfa-editor/pull/1209) [`b52d2bd`](https://github.com/lblod/ember-rdfa-editor/commit/b52d2bd45bf97ba6da78e7942449681ae3ece3c2) Thanks [@elpoelma](https://github.com/elpoelma)! - Adjust approach to parse tables coming from other editors

## 10.1.0

### Minor Changes

- [#1214](https://github.com/lblod/ember-rdfa-editor/pull/1214) [`96fcb5d`](https://github.com/lblod/ember-rdfa-editor/commit/96fcb5db6823780b62cf32227faaf4dd640ebb62) Thanks [@lagartoverde](https://github.com/lagartoverde)! - updateAttribute now allows a third argument to avoid adding the change to the history

## 10.0.3

### Patch Changes

- [`5d87134`](https://github.com/lblod/ember-rdfa-editor/commit/5d871341dd51606c48b8a3d24152feb33f452214) Thanks [@elpoelma](https://github.com/elpoelma)! - Addition of `vm-browserify` dependency. This dependency is required as one of the other dependencies (`parse-asn1`) now depends on `vm` (which is built in into node and requires a polyfill on the browser).
  For more information on this subject, check out https://github.com/browserify/parse-asn1/issues/46

## 10.0.2

### Patch Changes

- [#1208](https://github.com/lblod/ember-rdfa-editor/pull/1208) [`0310750`](https://github.com/lblod/ember-rdfa-editor/commit/03107503598681e5cb8fbb5c307b2a760fe63a20) Thanks [@elpoelma](https://github.com/elpoelma)! - fix in `addPropertyToNode` function: when property is already included, do not add it a second time (this prevents duplications)

## 10.0.1

### Patch Changes

- [#1207](https://github.com/lblod/ember-rdfa-editor/pull/1207) [`4edc7c6`](https://github.com/lblod/ember-rdfa-editor/commit/4edc7c65f16fd25697580c8d2f6ce94a652ecbd9) Thanks [@elpoelma](https://github.com/elpoelma)! - Remove css rule from toolbar which breaks toolbar spacing on bigger screens

## 9.14.1

### Patch Changes

- [#1207](https://github.com/lblod/ember-rdfa-editor/pull/1207) [`4edc7c6`](https://github.com/lblod/ember-rdfa-editor/commit/4edc7c65f16fd25697580c8d2f6ce94a652ecbd9) Thanks [@elpoelma](https://github.com/elpoelma)! - Remove css rule from toolbar which breaks toolbar spacing on bigger screens

## 10.0.0

### Major Changes

- [#1204](https://github.com/lblod/ember-rdfa-editor/pull/1204) [`4b89711`](https://github.com/lblod/ember-rdfa-editor/commit/4b89711d8e5000e919aa88391e5a420dfbb1e335) Thanks [@piemonkey](https://github.com/piemonkey)! - Update all dependency minor updates. Unfortunately changes some of the types from those libraries.

- [#1204](https://github.com/lblod/ember-rdfa-editor/pull/1204) [`3d2d419`](https://github.com/lblod/ember-rdfa-editor/commit/3d2d41962a3171ec3631b57fffa09d508b799d0b) Thanks [@piemonkey](https://github.com/piemonkey)! - Remove support for @appuniversum/ember-appuniversum <3.4.2

- [#1204](https://github.com/lblod/ember-rdfa-editor/pull/1204) [`a4dccbf`](https://github.com/lblod/ember-rdfa-editor/commit/a4dccbf1f4e53ff2684103205e4a8da6054e0962) Thanks [@piemonkey](https://github.com/piemonkey)! - Remove support for ember-intl <6.4

- [#1204](https://github.com/lblod/ember-rdfa-editor/pull/1204) [`baf99fb`](https://github.com/lblod/ember-rdfa-editor/commit/baf99fb80accd68101d442ac6b2dcdb479e0316b) Thanks [@piemonkey](https://github.com/piemonkey)! - Move ember-truth-helpers and ember-power-select to peer dependencies

- [#1204](https://github.com/lblod/ember-rdfa-editor/pull/1204) [`7197edd`](https://github.com/lblod/ember-rdfa-editor/commit/7197eddda0fbcc3f536150275ed52232f57e25dd) Thanks [@piemonkey](https://github.com/piemonkey)! - Drop support for ember-modifier <4.1

### Patch Changes

- [#1205](https://github.com/lblod/ember-rdfa-editor/pull/1205) [`6067c6f`](https://github.com/lblod/ember-rdfa-editor/commit/6067c6fe55b0826b2cc600d72f2b629d2dc20fb2) Thanks [@Krinkle](https://github.com/Krinkle)! - Fix formatting of test-helpers file

- [#1204](https://github.com/lblod/ember-rdfa-editor/pull/1204) [`6c72c23`](https://github.com/lblod/ember-rdfa-editor/commit/6c72c23dd46693c3131f70a1ae63761360340558) Thanks [@piemonkey](https://github.com/piemonkey)! - Update ember-template-imports to 4.1.1

## 9.14.0

### Minor Changes

- [#1201](https://github.com/lblod/ember-rdfa-editor/pull/1201) [`11b2ff0`](https://github.com/lblod/ember-rdfa-editor/commit/11b2ff07409ca566652b1db4f94e9ac112711c9b) Thanks [@lagartoverde](https://github.com/lagartoverde)! - Convert horizontal alignment menu into icons

### Patch Changes

- [#1203](https://github.com/lblod/ember-rdfa-editor/pull/1203) [`1335dcf`](https://github.com/lblod/ember-rdfa-editor/commit/1335dcfc856ac8d573912847de466304e3cb6605) Thanks [@dkozickis](https://github.com/dkozickis)! - Fix behaviour of responsive toolbar

## 9.13.0

### Minor Changes

- [#1197](https://github.com/lblod/ember-rdfa-editor/pull/1197) [`90384c3`](https://github.com/lblod/ember-rdfa-editor/commit/90384c3cef57220d52c98e7dee9ec1f6aef87cef) Thanks [@abeforgit](https://github.com/abeforgit)! - Add some transaction and rdfa utils

### Patch Changes

- [#1199](https://github.com/lblod/ember-rdfa-editor/pull/1199) [`3e69150`](https://github.com/lblod/ember-rdfa-editor/commit/3e691509a4938cc919b1eef17ecb05d679541126) Thanks [@piemonkey](https://github.com/piemonkey)! - Fix crash in sample-toolbar-responsive when controller is initially undefined

- [#1198](https://github.com/lblod/ember-rdfa-editor/pull/1198) [`3ff82d4`](https://github.com/lblod/ember-rdfa-editor/commit/3ff82d453f10f9cd9d0f750f36a0f4ecb240966c) Thanks [@piemonkey](https://github.com/piemonkey)! - Correct peer-dependency range of ember-modifier to include 4.x

## 9.12.0

### Minor Changes

- [#1195](https://github.com/lblod/ember-rdfa-editor/pull/1195) [`1b7a7fc`](https://github.com/lblod/ember-rdfa-editor/commit/1b7a7fca607c41cbbfb9477cde19c30d710be2e1) Thanks [@dkozickis](https://github.com/dkozickis)! - GN-4820: Preprocess RDFa on paste

  - Preprocess RDFa on paste
  - Expose `recreateUuidsOnPaste` plugin `key` to allow overriding the plugin

## 9.11.0

### Minor Changes

- [#1196](https://github.com/lblod/ember-rdfa-editor/pull/1196) [`f1af4a9`](https://github.com/lblod/ember-rdfa-editor/commit/f1af4a96cce38bde8f1cbcb2a49c13dc1c94551e) Thanks [@brenner-company](https://github.com/brenner-company)! - Add upper-alpha list style

## 9.10.0

### Minor Changes

- [#1192](https://github.com/lblod/ember-rdfa-editor/pull/1192) [`7066efb`](https://github.com/lblod/ember-rdfa-editor/commit/7066efb76dfdbf1f14dba7a888d07d957bf2cd9b) Thanks [@piemonkey](https://github.com/piemonkey)! - Better handle wrapping with RDFa blocks for nested node structures

- [#1192](https://github.com/lblod/ember-rdfa-editor/pull/1192) [`4ee2311`](https://github.com/lblod/ember-rdfa-editor/commit/4ee2311b8ec44ab063c43f0778453d9aedb077a3) Thanks [@piemonkey](https://github.com/piemonkey)! - Make lists no longer RDFa aware

### Patch Changes

- [#1193](https://github.com/lblod/ember-rdfa-editor/pull/1193) [`e779c40`](https://github.com/lblod/ember-rdfa-editor/commit/e779c40b8bf38b73accfff015cfe80d829b3c9dd) Thanks [@lagartoverde](https://github.com/lagartoverde)! - Move mark-highlight-manual outside of rdfa-annotations class

- [#1192](https://github.com/lblod/ember-rdfa-editor/pull/1192) [`dd462b2`](https://github.com/lblod/ember-rdfa-editor/commit/dd462b2751133359a9503b9475ab11d12f236674) Thanks [@piemonkey](https://github.com/piemonkey)! - Improve scoping of findRdfaIdsInSelection rdfa-util

## 9.9.0

### Minor Changes

- [#1191](https://github.com/lblod/ember-rdfa-editor/pull/1191) [`bb04105`](https://github.com/lblod/ember-rdfa-editor/commit/bb041057d0018723815bbaba7e2d0a7ebbbe73a5) Thanks [@abeforgit](https://github.com/abeforgit)! - Parse full doc context when parsing rdfa

### Patch Changes

- [#1190](https://github.com/lblod/ember-rdfa-editor/pull/1190) [`455c4bb`](https://github.com/lblod/ember-rdfa-editor/commit/455c4bb39820ce84593af1b6fdc20b42d226f97a) Thanks [@dkozickis](https://github.com/dkozickis)! - Apply Prettier to the codebase

- [#1191](https://github.com/lblod/ember-rdfa-editor/pull/1191) [`bb04105`](https://github.com/lblod/ember-rdfa-editor/commit/bb041057d0018723815bbaba7e2d0a7ebbbe73a5) Thanks [@abeforgit](https://github.com/abeforgit)! - Fix doc-node content container parsing

## 9.8.0

### Minor Changes

- [#1188](https://github.com/lblod/ember-rdfa-editor/pull/1188) [`1097b8b`](https://github.com/lblod/ember-rdfa-editor/commit/1097b8b2a09c9b7e34c46c9ae26c233833a25a2f) Thanks [@piemonkey](https://github.com/piemonkey)! - Add an argument passed to ember nodes to select the node within the editor, to avoid implementations having to implement this logic

### Patch Changes

- [#1188](https://github.com/lblod/ember-rdfa-editor/pull/1188) [`67f7224`](https://github.com/lblod/ember-rdfa-editor/commit/67f7224891c720868d2e8ef0e92ce46d76959257) Thanks [@piemonkey](https://github.com/piemonkey)! - Upgrade ember-focus-trap to v1.1.0 now that we no longer support Ember 3

## 9.7.1

### Patch Changes

- [#1189](https://github.com/lblod/ember-rdfa-editor/pull/1189) [`a49b707`](https://github.com/lblod/ember-rdfa-editor/commit/a49b707492d041d3685ed260d765f2e96e8e4f37) Thanks [@elpoelma](https://github.com/elpoelma)! - Fix regression in parsing logic of `extraAttributes` of `doc` node-spec.
  This regression was introduced in version [9.6.0](https://github.com/lblod/ember-rdfa-editor/releases/tag/v9.6.0).
  This fix ensures that the `extraAttributes` are now once again correctly parsed when loading a document.

## 9.7.0

### Minor Changes

- [#1184](https://github.com/lblod/ember-rdfa-editor/pull/1184) [`a9cf618`](https://github.com/lblod/ember-rdfa-editor/commit/a9cf61864749b54203f0cf70b31a352e33c4e175) Thanks [@abeforgit](https://github.com/abeforgit)! - feature: hierarchical lists

## 9.6.1

### Patch Changes

- [#1186](https://github.com/lblod/ember-rdfa-editor/pull/1186) [`ac0eac5`](https://github.com/lblod/ember-rdfa-editor/commit/ac0eac579ca9bf81e36db4716ca5c2ae81201546) Thanks [@dkozickis](https://github.com/dkozickis)! - GN-4758: Bump `@say-editor/prosemirror-tables` to fix the size of the newly created column.

## 9.6.0

### Minor Changes

- [#1151](https://github.com/lblod/ember-rdfa-editor/pull/1151) [`b76b5f7`](https://github.com/lblod/ember-rdfa-editor/commit/b76b5f744ed0681ed04626e5c0086258a70859ab) Thanks [@elpoelma](https://github.com/elpoelma)! - Add codemirror modifier with support for custom extensions

- [#1145](https://github.com/lblod/ember-rdfa-editor/pull/1145) [`207b588`](https://github.com/lblod/ember-rdfa-editor/commit/207b58892e1adbd0dc19ca0685f18af6b9c2fba9) Thanks [@elpoelma](https://github.com/elpoelma)! - Migrate to pnpm

- [#1148](https://github.com/lblod/ember-rdfa-editor/pull/1148) [`d310875`](https://github.com/lblod/ember-rdfa-editor/commit/d310875b4d17465e3ff79acafc92420c4fb95c43) Thanks [@elpoelma](https://github.com/elpoelma)! - Add option to provide `EditorRange` object to `setHtmlContent` method in order to only replace a part of the document

- [#1151](https://github.com/lblod/ember-rdfa-editor/pull/1151) [`4d0e54c`](https://github.com/lblod/ember-rdfa-editor/commit/4d0e54ca52268a6eac653f006ee9300ce97e2f56) Thanks [@elpoelma](https://github.com/elpoelma)! - Clean-up debug-tools component:

  - Usage of new `codemirror` modifier
  - Removal of `xml` support

- [#1148](https://github.com/lblod/ember-rdfa-editor/pull/1148) [`4ba9fb5`](https://github.com/lblod/ember-rdfa-editor/commit/4ba9fb5d2a8e57b4cabe94db0a05ac5f8111d513) Thanks [@elpoelma](https://github.com/elpoelma)! - Add `domParser` getter to `SayController` class.

  The `domParser` getter provides access to an instance of the `ProseMirror` parser.
  This parser allows you to parse html nodes into prosemirror nodes/fragments.

  To get more information on the `DomParser` class, visit https://prosemirror.net/docs/ref/#model.DOMParser

- [#1170](https://github.com/lblod/ember-rdfa-editor/pull/1170) [`16e083e`](https://github.com/lblod/ember-rdfa-editor/commit/16e083eb0a401c47d30581e5d701db3206b82902) Thanks [@dkozickis](https://github.com/dkozickis)! - GN-4707: Vertical alignment in table cells

- [#1051](https://github.com/lblod/ember-rdfa-editor/pull/1051) [`0e15912`](https://github.com/lblod/ember-rdfa-editor/commit/0e15912922f5bdcd6f9a46a1fc396626d38f0402) Thanks [@elpoelma](https://github.com/elpoelma)! - Add option for the document (top) node to be parsed using `parseDOM` parse-rules. When setting the content of a document, using either `setHTMLContent` or `initialize`, three options are possible:

  - The `topNode` (often `doc`) has no parse-rules: a default node of type `topNode` is created (without any attributes). The html provided to `setHTMLContent` or `intialize` is parsed as its content.
  - The `topNode` has 1 or more parse-rules: the parser searches the provided html for a node that matches a parse-rule of the `topNode`.
    - If a node is found: the node is parsed as the `topNode` and its content is parsed as the `topNode` content
    - If a node is not found: a default `topNode` node is created. The html provided to `setHTMLContent` or `intialize` is parsed as its content.

- [#1178](https://github.com/lblod/ember-rdfa-editor/pull/1178) [`20af37e`](https://github.com/lblod/ember-rdfa-editor/commit/20af37e1bfeb52ecbe32e779b29841c2a01b3d8e) Thanks [@piemonkey](https://github.com/piemonkey)! - Update to latest ember-appuniversum v3.4.0

- [`cd3d200`](https://github.com/lblod/ember-rdfa-editor/commit/cd3d200eaea700bd2c685501a692a77c28c46f73) Thanks [@elpoelma](https://github.com/elpoelma)! - This release contains experimental support for the new `rdfaAware` system and API.
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

- [#1151](https://github.com/lblod/ember-rdfa-editor/pull/1151) [`69cf55c`](https://github.com/lblod/ember-rdfa-editor/commit/69cf55c80fb4bd8da7c8161bbe3a8f368e53b519) Thanks [@elpoelma](https://github.com/elpoelma)! - Addition of a reworked html-editor modal component

- [#1151](https://github.com/lblod/ember-rdfa-editor/pull/1151) [`6971f12`](https://github.com/lblod/ember-rdfa-editor/commit/6971f12b7dad0bcc08fa0d9944b9b5ed4f31d546) Thanks [@elpoelma](https://github.com/elpoelma)! - Replace `xml-formatter` by `js-beautify`.
  Improve formatting of html in debug-tools.

- [#1166](https://github.com/lblod/ember-rdfa-editor/pull/1166) [`f918748`](https://github.com/lblod/ember-rdfa-editor/commit/f918748be0b3f4a01622379b403901024f03eeec) Thanks [@piemonkey](https://github.com/piemonkey)! - Expose helper method to export document as a HTML page

- [#1178](https://github.com/lblod/ember-rdfa-editor/pull/1178) [`14331f0`](https://github.com/lblod/ember-rdfa-editor/commit/14331f04741c2be15ba1bd3d805951f4c51eba3f) Thanks [@piemonkey](https://github.com/piemonkey)! - Update icon usage to inline SVGs instead of using svgiconset.
  If using ember-appuniversum version greater than 3.4.1, icon components are now used instead of string icon names, this uses inline SVGs that can be supported in unusual hosting environments.

- [#1051](https://github.com/lblod/ember-rdfa-editor/pull/1051) [`0e15912`](https://github.com/lblod/ember-rdfa-editor/commit/0e15912922f5bdcd6f9a46a1fc396626d38f0402) Thanks [@elpoelma](https://github.com/elpoelma)! - When using the `setHTMLContent` method to also update the attributes of the topNode correctly. This should make `setHTMLContent` more-or-less equivalent with the `initialize` method. The main difference is that `initialize` creates a new state and `setHTMLContent` does not.

### Patch Changes

- [#1182](https://github.com/lblod/ember-rdfa-editor/pull/1182) [`d939e0c`](https://github.com/lblod/ember-rdfa-editor/commit/d939e0c9d7f8070b3c6a948620d87eebca5d29a9) Thanks [@elpoelma](https://github.com/elpoelma)! - Release to npm with tag `next` if the semantic version qualifier is equal to `next`

- [#1182](https://github.com/lblod/ember-rdfa-editor/pull/1182) [`d939e0c`](https://github.com/lblod/ember-rdfa-editor/commit/d939e0c9d7f8070b3c6a948620d87eebca5d29a9) Thanks [@elpoelma](https://github.com/elpoelma)! - Do not perform a stable release when tag contains semantic version qualifier (used for prereleases)

- [#1175](https://github.com/lblod/ember-rdfa-editor/pull/1175) [`87913bc`](https://github.com/lblod/ember-rdfa-editor/commit/87913bc121a85da65c5dcd33a788271f58a93332) Thanks [@dkozickis](https://github.com/dkozickis)! - Bump `@say-editor/prosemirror-tables` to `0.2.0` to fix the behaviour
  of setting background color on table cells.

- [#1147](https://github.com/lblod/ember-rdfa-editor/pull/1147) [`43ef4ba`](https://github.com/lblod/ember-rdfa-editor/commit/43ef4ba006d18626d674a0d308579b706069d628) Thanks [@elpoelma](https://github.com/elpoelma)! - Removing top margin from `div` elements inside `li` elements

- [#1133](https://github.com/lblod/ember-rdfa-editor/pull/1133) [`57e11d6`](https://github.com/lblod/ember-rdfa-editor/commit/57e11d610e2f048c1e4acb8322cff3b0f3633c04) Thanks [@abeforgit](https://github.com/abeforgit)! - migrate off of ember-cli-typescript

- [#1183](https://github.com/lblod/ember-rdfa-editor/pull/1183) [`61a9941`](https://github.com/lblod/ember-rdfa-editor/commit/61a9941227b251d147a4f081ef7e26e99f5a76ce) Thanks [@piemonkey](https://github.com/piemonkey)! - Remove caching of SaySerializer

## 9.6.0-next.1

### Patch Changes

- [#1182](https://github.com/lblod/ember-rdfa-editor/pull/1182) [`d939e0c`](https://github.com/lblod/ember-rdfa-editor/commit/d939e0c9d7f8070b3c6a948620d87eebca5d29a9) Thanks [@elpoelma](https://github.com/elpoelma)! - Release to npm with tag `next` if the semantic version qualifier is equal to `next`

- [#1182](https://github.com/lblod/ember-rdfa-editor/pull/1182) [`d939e0c`](https://github.com/lblod/ember-rdfa-editor/commit/d939e0c9d7f8070b3c6a948620d87eebca5d29a9) Thanks [@elpoelma](https://github.com/elpoelma)! - Do not perform a stable release when tag contains semantic version qualifier (used for prereleases)

- [#1183](https://github.com/lblod/ember-rdfa-editor/pull/1183) [`61a9941`](https://github.com/lblod/ember-rdfa-editor/commit/61a9941227b251d147a4f081ef7e26e99f5a76ce) Thanks [@piemonkey](https://github.com/piemonkey)! - Remove caching of SaySerializer

## 9.6.0-next.0

### Minor Changes

- [#1151](https://github.com/lblod/ember-rdfa-editor/pull/1151) [`b76b5f7`](https://github.com/lblod/ember-rdfa-editor/commit/b76b5f744ed0681ed04626e5c0086258a70859ab) Thanks [@elpoelma](https://github.com/elpoelma)! - Add codemirror modifier with support for custom extensions

- [#1145](https://github.com/lblod/ember-rdfa-editor/pull/1145) [`207b588`](https://github.com/lblod/ember-rdfa-editor/commit/207b58892e1adbd0dc19ca0685f18af6b9c2fba9) Thanks [@elpoelma](https://github.com/elpoelma)! - Migrate to pnpm

- [#1148](https://github.com/lblod/ember-rdfa-editor/pull/1148) [`d310875`](https://github.com/lblod/ember-rdfa-editor/commit/d310875b4d17465e3ff79acafc92420c4fb95c43) Thanks [@elpoelma](https://github.com/elpoelma)! - Add option to provide `EditorRange` object to `setHtmlContent` method in order to only replace a part of the document

- [#1151](https://github.com/lblod/ember-rdfa-editor/pull/1151) [`4d0e54c`](https://github.com/lblod/ember-rdfa-editor/commit/4d0e54ca52268a6eac653f006ee9300ce97e2f56) Thanks [@elpoelma](https://github.com/elpoelma)! - Clean-up debug-tools component:

  - Usage of new `codemirror` modifier
  - Removal of `xml` support

- [#1148](https://github.com/lblod/ember-rdfa-editor/pull/1148) [`4ba9fb5`](https://github.com/lblod/ember-rdfa-editor/commit/4ba9fb5d2a8e57b4cabe94db0a05ac5f8111d513) Thanks [@elpoelma](https://github.com/elpoelma)! - Add `domParser` getter to `SayController` class.

  The `domParser` getter provides access to an instance of the `ProseMirror` parser.
  This parser allows you to parse html nodes into prosemirror nodes/fragments.

  To get more information on the `DomParser` class, visit https://prosemirror.net/docs/ref/#model.DOMParser

- [#1170](https://github.com/lblod/ember-rdfa-editor/pull/1170) [`16e083e`](https://github.com/lblod/ember-rdfa-editor/commit/16e083eb0a401c47d30581e5d701db3206b82902) Thanks [@dkozickis](https://github.com/dkozickis)! - GN-4707: Vertical alignment in table cells

- [#1051](https://github.com/lblod/ember-rdfa-editor/pull/1051) [`0e15912`](https://github.com/lblod/ember-rdfa-editor/commit/0e15912922f5bdcd6f9a46a1fc396626d38f0402) Thanks [@elpoelma](https://github.com/elpoelma)! - Add option for the document (top) node to be parsed using `parseDOM` parse-rules. When setting the content of a document, using either `setHTMLContent` or `initialize`, three options are possible:

  - The `topNode` (often `doc`) has no parse-rules: a default node of type `topNode` is created (without any attributes). The html provided to `setHTMLContent` or `intialize` is parsed as its content.
  - The `topNode` has 1 or more parse-rules: the parser searches the provided html for a node that matches a parse-rule of the `topNode`.
    - If a node is found: the node is parsed as the `topNode` and its content is parsed as the `topNode` content
    - If a node is not found: a default `topNode` node is created. The html provided to `setHTMLContent` or `intialize` is parsed as its content.

- [#1178](https://github.com/lblod/ember-rdfa-editor/pull/1178) [`20af37e`](https://github.com/lblod/ember-rdfa-editor/commit/20af37e1bfeb52ecbe32e779b29841c2a01b3d8e) Thanks [@piemonkey](https://github.com/piemonkey)! - Update to latest ember-appuniversum v3.4.0

- [`cd3d200`](https://github.com/lblod/ember-rdfa-editor/commit/cd3d200eaea700bd2c685501a692a77c28c46f73) Thanks [@elpoelma](https://github.com/elpoelma)! - This release contains experimental support for the new `rdfaAware` system and API.
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

- [#1151](https://github.com/lblod/ember-rdfa-editor/pull/1151) [`69cf55c`](https://github.com/lblod/ember-rdfa-editor/commit/69cf55c80fb4bd8da7c8161bbe3a8f368e53b519) Thanks [@elpoelma](https://github.com/elpoelma)! - Addition of a reworked html-editor modal component

- [#1151](https://github.com/lblod/ember-rdfa-editor/pull/1151) [`6971f12`](https://github.com/lblod/ember-rdfa-editor/commit/6971f12b7dad0bcc08fa0d9944b9b5ed4f31d546) Thanks [@elpoelma](https://github.com/elpoelma)! - Replace `xml-formatter` by `js-beautify`.
  Improve formatting of html in debug-tools.

- [#1166](https://github.com/lblod/ember-rdfa-editor/pull/1166) [`f918748`](https://github.com/lblod/ember-rdfa-editor/commit/f918748be0b3f4a01622379b403901024f03eeec) Thanks [@piemonkey](https://github.com/piemonkey)! - Expose helper method to export document as a HTML page

- [#1178](https://github.com/lblod/ember-rdfa-editor/pull/1178) [`14331f0`](https://github.com/lblod/ember-rdfa-editor/commit/14331f04741c2be15ba1bd3d805951f4c51eba3f) Thanks [@piemonkey](https://github.com/piemonkey)! - Update icon usage to inline SVGs instead of using svgiconset.
  If using ember-appuniversum version greater than 3.4.1, icon components are now used instead of string icon names, this uses inline SVGs that can be supported in unusual hosting environments.

- [#1051](https://github.com/lblod/ember-rdfa-editor/pull/1051) [`0e15912`](https://github.com/lblod/ember-rdfa-editor/commit/0e15912922f5bdcd6f9a46a1fc396626d38f0402) Thanks [@elpoelma](https://github.com/elpoelma)! - When using the `setHTMLContent` method to also update the attributes of the topNode correctly. This should make `setHTMLContent` more-or-less equivalent with the `initialize` method. The main difference is that `initialize` creates a new state and `setHTMLContent` does not.

### Patch Changes

- [#1175](https://github.com/lblod/ember-rdfa-editor/pull/1175) [`87913bc`](https://github.com/lblod/ember-rdfa-editor/commit/87913bc121a85da65c5dcd33a788271f58a93332) Thanks [@dkozickis](https://github.com/dkozickis)! - Bump `@say-editor/prosemirror-tables` to `0.2.0` to fix the behaviour
  of setting background color on table cells.

- [#1147](https://github.com/lblod/ember-rdfa-editor/pull/1147) [`43ef4ba`](https://github.com/lblod/ember-rdfa-editor/commit/43ef4ba006d18626d674a0d308579b706069d628) Thanks [@elpoelma](https://github.com/elpoelma)! - Removing top margin from `div` elements inside `li` elements

- [#1133](https://github.com/lblod/ember-rdfa-editor/pull/1133) [`57e11d6`](https://github.com/lblod/ember-rdfa-editor/commit/57e11d610e2f048c1e4acb8322cff3b0f3633c04) Thanks [@abeforgit](https://github.com/abeforgit)! - migrate off of ember-cli-typescript

## 9.5.1

### Patch Changes

- [#1177](https://github.com/lblod/ember-rdfa-editor/pull/1177) [`903c528`](https://github.com/lblod/ember-rdfa-editor/commit/903c52889770d5fbed3980be22ca4041a9d390e5) Thanks [@abeforgit](https://github.com/abeforgit)! - make sure to update editor ref in cached serializer

## 9.5.0

### Minor Changes

- [#1162](https://github.com/lblod/ember-rdfa-editor/pull/1162) [`32543f8`](https://github.com/lblod/ember-rdfa-editor/commit/32543f88d3da1848ed45263dd318642fd84dbcea) Thanks [@dkozickis](https://github.com/dkozickis)! - GN-4706: Table cell background

- [#1160](https://github.com/lblod/ember-rdfa-editor/pull/1160) [`99ad291`](https://github.com/lblod/ember-rdfa-editor/commit/99ad2910e8b098c256b82e2735f82a195837834b) Thanks [@elpoelma](https://github.com/elpoelma)! - Introduce option to configure alternating row background styles

- [#1160](https://github.com/lblod/ember-rdfa-editor/pull/1160) [`99ad291`](https://github.com/lblod/ember-rdfa-editor/commit/99ad2910e8b098c256b82e2735f82a195837834b) Thanks [@elpoelma](https://github.com/elpoelma)! - Add `constructInlineStyles` utility function

### Patch Changes

- [#1164](https://github.com/lblod/ember-rdfa-editor/pull/1164) [`091ce6f`](https://github.com/lblod/ember-rdfa-editor/commit/091ce6fe3aafd15cfaa6bdd83aa7d79f9ce5eb33) Thanks [@elpoelma](https://github.com/elpoelma)! - Add title attribute to heading-menu

- [#1164](https://github.com/lblod/ember-rdfa-editor/pull/1164) [`50d50f2`](https://github.com/lblod/ember-rdfa-editor/commit/50d50f25cbb2af24e79446a746aa44555ba5e845) Thanks [@elpoelma](https://github.com/elpoelma)! - Add `title` attribute to more-options toolbar button

- [#1154](https://github.com/lblod/ember-rdfa-editor/pull/1154) [`cdce71f`](https://github.com/lblod/ember-rdfa-editor/commit/cdce71ff29142b3e408da97a57d4ddebf38848b2) Thanks [@dkozickis](https://github.com/dkozickis)! - Remove prosemirror debug icon from screenshots

- [#1154](https://github.com/lblod/ember-rdfa-editor/pull/1154) [`cdce71f`](https://github.com/lblod/ember-rdfa-editor/commit/cdce71ff29142b3e408da97a57d4ddebf38848b2) Thanks [@dkozickis](https://github.com/dkozickis)! - Bump `@playwright/test` to `1.42.1` to allow for overriding styles in tests.

- [#1164](https://github.com/lblod/ember-rdfa-editor/pull/1164) [`6c11568`](https://github.com/lblod/ember-rdfa-editor/commit/6c11568a83f0e1742a6a7dead856b46eb4e34c6c) Thanks [@elpoelma](https://github.com/elpoelma)! - Improve translations of toolbar button labels/titles

- [#1164](https://github.com/lblod/ember-rdfa-editor/pull/1164) [`3e2457c`](https://github.com/lblod/ember-rdfa-editor/commit/3e2457cd70c28fb8450e3124969c6719c5356cb1) Thanks [@elpoelma](https://github.com/elpoelma)! - Add title attribute to table menu

- [#1164](https://github.com/lblod/ember-rdfa-editor/pull/1164) [`99b741b`](https://github.com/lblod/ember-rdfa-editor/commit/99b741b217df7e0489db7ab7415e19aad9808245) Thanks [@elpoelma](https://github.com/elpoelma)! - Add title attribute for rdfa-toggle

- [#1164](https://github.com/lblod/ember-rdfa-editor/pull/1164) [`88c30ab`](https://github.com/lblod/ember-rdfa-editor/commit/88c30ab7177b68095abbb473a555f52951aa9301) Thanks [@elpoelma](https://github.com/elpoelma)! - Add title attribute to formatting toggle

## 9.4.1

### Patch Changes

- [#1153](https://github.com/lblod/ember-rdfa-editor/pull/1153) [`e76e321`](https://github.com/lblod/ember-rdfa-editor/commit/e76e321763a4095b79a3a0930770cdee8a7acc2a) Thanks [@elpoelma](https://github.com/elpoelma)! - Correctly disable sidebar when `hideSidebar` property is passed, or when `aside` block is not used

## 9.4.0

### Minor Changes

- [#1149](https://github.com/lblod/ember-rdfa-editor/pull/1149) [`850abee`](https://github.com/lblod/ember-rdfa-editor/commit/850abeed8d69d5edab8ff9ac7dec2062b646ac3c) Thanks [@dkozickis](https://github.com/dkozickis)! - GN-4704: Merge/Split table cells

### Patch Changes

- [#1152](https://github.com/lblod/ember-rdfa-editor/pull/1152) [`d840802`](https://github.com/lblod/ember-rdfa-editor/commit/d840802c8b0162072d409b8feef496656fad2bca) Thanks [@dkozickis](https://github.com/dkozickis)! - Move to "@say-editor" packages for invisibles and tables plugin

## 9.3.0

### Minor Changes

- [#1144](https://github.com/lblod/ember-rdfa-editor/pull/1144) [`50ac70e`](https://github.com/lblod/ember-rdfa-editor/commit/50ac70e3bd85a9c73b5cf16d3a4bf7438db18c51) Thanks [@elpoelma](https://github.com/elpoelma)! - Add custom `floating-ui` modifier with support for virtual elements, custom middleware options and transform-positioning

- [#1142](https://github.com/lblod/ember-rdfa-editor/pull/1142) [`13f0e16`](https://github.com/lblod/ember-rdfa-editor/commit/13f0e16bd2e17ac2c245b37cecc7d14786cb048f) Thanks [@piemonkey](https://github.com/piemonkey)! - Add option for table plugin to enable developers to specify the styling of table borders, which are maintained when exporting tables, such as when copying to the clipboard.

- [#1144](https://github.com/lblod/ember-rdfa-editor/pull/1144) [`d5b46bd`](https://github.com/lblod/ember-rdfa-editor/commit/d5b46bd77c56d7d50aeefacaadc90f92eee6f6ee) Thanks [@elpoelma](https://github.com/elpoelma)! - Addition of a `table-tooltip` component which allows users to quickly access table-editing features

## 10.0.0-next.1

### Major Changes

- [#1136](https://github.com/lblod/ember-rdfa-editor/pull/1136) [`7e88d94`](https://github.com/lblod/ember-rdfa-editor/commit/7e88d94cd1495ee566b1053a0405d5bdf5d8f706) Thanks [@elpoelma](https://github.com/elpoelma)! - Replace all instances of `resource` node-attribute by `subject` node-attribute

### Minor Changes

- [#1136](https://github.com/lblod/ember-rdfa-editor/pull/1136) [`7e88d94`](https://github.com/lblod/ember-rdfa-editor/commit/7e88d94cd1495ee566b1053a0405d5bdf5d8f706) Thanks [@elpoelma](https://github.com/elpoelma)! - Simplify implementation of `getRdfaAttrs` function

### Patch Changes

- [#1124](https://github.com/lblod/ember-rdfa-editor/pull/1124) [`979719d`](https://github.com/lblod/ember-rdfa-editor/commit/979719da9fce6e08b05ae940677ce56009796559) Thanks [@elpoelma](https://github.com/elpoelma)! - Fix `looseMatches` is undefined error

- [#1133](https://github.com/lblod/ember-rdfa-editor/pull/1133) [`57e11d6`](https://github.com/lblod/ember-rdfa-editor/commit/57e11d610e2f048c1e4acb8322cff3b0f3633c04) Thanks [@abeforgit](https://github.com/abeforgit)! - migrate off of ember-cli-typescript

## 10.0.0-next.0

### Major Changes

- [#1051](https://github.com/lblod/ember-rdfa-editor/pull/1051) [`0e159129`](https://github.com/lblod/ember-rdfa-editor/commit/0e15912922f5bdcd6f9a46a1fc396626d38f0402) Thanks [@elpoelma](https://github.com/elpoelma)! - Add option for the document (top) node to be parsed using `parseDOM` parse-rules. When setting the content of a document, using either `setHTMLContent` or `initialize`, three options are possible:

  - The `topNode` (often `doc`) has no parse-rules: a default node of type `topNode` is created (without any attributes). The html provided to `setHTMLContent` or `intialize` is parsed as its content.
  - The `topNode` has 1 or more parse-rules: the parser searches the provided html for a node that matches a parse-rule of the `topNode`.
    - If a node is found: the node is parsed as the `topNode` and its content is parsed as the `topNode` content
    - If a node is not found: a default `topNode` node is created. The html provided to `setHTMLContent` or `intialize` is parsed as its content.

- [#1051](https://github.com/lblod/ember-rdfa-editor/pull/1051) [`0e159129`](https://github.com/lblod/ember-rdfa-editor/commit/0e15912922f5bdcd6f9a46a1fc396626d38f0402) Thanks [@elpoelma](https://github.com/elpoelma)! - Remove `extraAttributes` parameter/option of `doc` node-spec. The `doc` node-spec can be easily extended/overriden using spread operators/custom `node-specs`.

- [#1051](https://github.com/lblod/ember-rdfa-editor/pull/1051) [`0e159129`](https://github.com/lblod/ember-rdfa-editor/commit/0e15912922f5bdcd6f9a46a1fc396626d38f0402) Thanks [@elpoelma](https://github.com/elpoelma)! - When using the `setHTMLContent` method to also update the attributes of the topNode correctly. This should make `setHTMLContent` more-or-less equivalent with the `initialize` method. The main difference is that `initialize` creates a new state and `setHTMLContent` does not.

### Minor Changes

- [#1051](https://github.com/lblod/ember-rdfa-editor/pull/1051) [`0e159129`](https://github.com/lblod/ember-rdfa-editor/commit/0e15912922f5bdcd6f9a46a1fc396626d38f0402) Thanks [@elpoelma](https://github.com/elpoelma)! - Update rdfa components and attribute-editor to take the `topNode` node into account.

- [#1051](https://github.com/lblod/ember-rdfa-editor/pull/1051) [`0e159129`](https://github.com/lblod/ember-rdfa-editor/commit/0e15912922f5bdcd6f9a46a1fc396626d38f0402) Thanks [@elpoelma](https://github.com/elpoelma)! - Update `rdfa-commands` to take document attributes into account

- [#1051](https://github.com/lblod/ember-rdfa-editor/pull/1051) [`0e159129`](https://github.com/lblod/ember-rdfa-editor/commit/0e15912922f5bdcd6f9a46a1fc396626d38f0402) Thanks [@elpoelma](https://github.com/elpoelma)! - Addition of a `document-info` toolbar pill. It opens a modal in which it is possible to edit the attributes of the `topNode` node.

- [#1051](https://github.com/lblod/ember-rdfa-editor/pull/1051) [`0e159129`](https://github.com/lblod/ember-rdfa-editor/commit/0e15912922f5bdcd6f9a46a1fc396626d38f0402) Thanks [@elpoelma](https://github.com/elpoelma)! - Addition of a POC `document-language` pill to the editor toolbar. It opens a modal in which it is possible to select the document language.

### Patch Changes

- [#1067](https://github.com/lblod/ember-rdfa-editor/pull/1067) [`ac443a57`](https://github.com/lblod/ember-rdfa-editor/commit/ac443a57bd9fdc8f17402ad0957603424185f141) Thanks [@abeforgit](https://github.com/abeforgit)! - Improved parser based on a better definition of resource and literal nodes

## 9.2.1

### Patch Changes

- [`6454896`](https://github.com/lblod/ember-rdfa-editor/commit/64548966e378a60c861520a34679965ca32ecf09) Thanks [@elpoelma](https://github.com/elpoelma)! - Bump ip from 1.1.8 to 1.1.9

## 9.2.0

### Minor Changes

- [#1138](https://github.com/lblod/ember-rdfa-editor/pull/1138) [`674d7da`](https://github.com/lblod/ember-rdfa-editor/commit/674d7da1b6dcf2c68fb75997a1a29b6bb0d89869) Thanks [@dkozickis](https://github.com/dkozickis)! - GN-4660: Percentage resize for tables instead of absolute pixels

- [#1137](https://github.com/lblod/ember-rdfa-editor/pull/1137) [`04ca80c`](https://github.com/lblod/ember-rdfa-editor/commit/04ca80cadb009607cf84afcc472c1fc07a63763f) Thanks [@dkozickis](https://github.com/dkozickis)! - GN-4625: Introduce Playwright for E2E instead of Cypress

### Patch Changes

- [#1129](https://github.com/lblod/ember-rdfa-editor/pull/1129) [`2c96d02`](https://github.com/lblod/ember-rdfa-editor/commit/2c96d02ce3dd4a553349c07f8677ba96a6455d2f) Thanks [@dkozickis](https://github.com/dkozickis)! - GN-4190: Scroll cursor into view after toggling "show rdfa annotations"

- [#1135](https://github.com/lblod/ember-rdfa-editor/pull/1135) [`4be1940`](https://github.com/lblod/ember-rdfa-editor/commit/4be19404c35ab05242382add11fbc6ce8b49ee57) Thanks [@dkozickis](https://github.com/dkozickis)! - GN-4625: Copy lists to other editors correctly

  Adds `list-style-type` to list elements in the rendered HTML, so other editors
  can render lists with the same style as the editor.

## 9.1.0

### Minor Changes

- [#1127](https://github.com/lblod/ember-rdfa-editor/pull/1127) [`3e7b5fb`](https://github.com/lblod/ember-rdfa-editor/commit/3e7b5fb1f0cf599eb6d78f06f9ef89102d57c2ce) Thanks [@dkozickis](https://github.com/dkozickis)! - GN-4657: Serialize table column width to exported HTML

### Patch Changes

- [#1124](https://github.com/lblod/ember-rdfa-editor/pull/1124) [`979719d`](https://github.com/lblod/ember-rdfa-editor/commit/979719da9fce6e08b05ae940677ce56009796559) Thanks [@elpoelma](https://github.com/elpoelma)! - Fix `looseMatches` is undefined error

- [#1131](https://github.com/lblod/ember-rdfa-editor/pull/1131) [`07916e1`](https://github.com/lblod/ember-rdfa-editor/commit/07916e1a6961d84c836b83ebad7f3aee488d6387) Thanks [@elpoelma](https://github.com/elpoelma)! - Mark paragraphs as `defining`, as they may contain important attributes (such as alignment and indentation) that should not be lost when pasting

- [#1131](https://github.com/lblod/ember-rdfa-editor/pull/1131) [`07916e1`](https://github.com/lblod/ember-rdfa-editor/commit/07916e1a6961d84c836b83ebad7f3aee488d6387) Thanks [@elpoelma](https://github.com/elpoelma)! - Remove custom `transformPasted` hook as it conflicts with the `defining` node-spec attribute

## 9.0.2

### Patch Changes

- [#1126](https://github.com/lblod/ember-rdfa-editor/pull/1126) [`022cbff`](https://github.com/lblod/ember-rdfa-editor/commit/022cbff22913fd598aa48e5e5d29fc5bdc518677) Thanks [@elpoelma](https://github.com/elpoelma)! - Widen support for `ember-intl` to include version 5.7.2 due to outstanding issues with the 6.x releases.

  For more information, see https://github.com/ember-intl/ember-intl/issues/1826

## 9.0.1

### Patch Changes

- [#1108](https://github.com/lblod/ember-rdfa-editor/pull/1108) [`e45216a`](https://github.com/lblod/ember-rdfa-editor/commit/e45216a2db1890c864504a73b0a9b5897a0d0db6) Thanks [@elpoelma](https://github.com/elpoelma)! - Addition of a transformPasted hook to transform the slice to be pasted if necessary.
  - If the node before the current selection is not inline, the slice will be closed at the start
  - If the node after the current selection is not inline, the slice will be closed at the end

## 9.0.0

### Major Changes

- [#1121](https://github.com/lblod/ember-rdfa-editor/pull/1121) [`9f76b57`](https://github.com/lblod/ember-rdfa-editor/commit/9f76b57225b10432caadf887889a0fd8d807c8c5) Thanks [@elpoelma](https://github.com/elpoelma)! - Drop support for ember `3.28.x`.
  Stricten `ember-source` peerdependency to only support version-range `^4.12.0`

- [#1120](https://github.com/lblod/ember-rdfa-editor/pull/1120) [`0357fdf`](https://github.com/lblod/ember-rdfa-editor/commit/0357fdf1230f0e8ca961a39e9ff866b4617270ec) Thanks [@elpoelma](https://github.com/elpoelma)! - Increase `@appuniversum/ember-appuniversum` peerdependency requirement to `^2.15.0`

- [#1122](https://github.com/lblod/ember-rdfa-editor/pull/1122) [`a9da3a0`](https://github.com/lblod/ember-rdfa-editor/commit/a9da3a009b5eb0d1f8ff6fef4fe0df3d74a102c3) Thanks [@elpoelma](https://github.com/elpoelma)! - Drop support for `ember-intl` `5.x`

- [#1113](https://github.com/lblod/ember-rdfa-editor/pull/1113) [`37aa34a`](https://github.com/lblod/ember-rdfa-editor/commit/37aa34a233ce4e6e11fc58fa2cc3ee05d91d08e3) Thanks [@elpoelma](https://github.com/elpoelma)! - Removal of the id attribute from the block_rdfa spec. It is currently not used by the block_rdfa node and is not part of the RDFa spec.

  Additionally, this solves the issue where paragraphs with an id attribute were parsed as block_rdfa.

### Minor Changes

- [#1117](https://github.com/lblod/ember-rdfa-editor/pull/1117) [`4525217`](https://github.com/lblod/ember-rdfa-editor/commit/4525217f21c12072d6c822fc03110f26bc1fa5fc) Thanks [@piemonkey](https://github.com/piemonkey)! - Add helper function to help with locale selection and add translation note to readme

### Patch Changes

- [#1111](https://github.com/lblod/ember-rdfa-editor/pull/1111) [`022bad0`](https://github.com/lblod/ember-rdfa-editor/commit/022bad0bec41f494fde8ecbc099b40f02e784eae) Thanks [@redpencil-renovate-bot](https://github.com/apps/redpencil-renovate-bot)! - Bump danlynn/ember-cli from 4.8.0 to 4.12.1

- [#1112](https://github.com/lblod/ember-rdfa-editor/pull/1112) [`5fdb634`](https://github.com/lblod/ember-rdfa-editor/commit/5fdb6344613d4888381f6be0a66dcf2d74bd5aa7) Thanks [@redpencil-renovate-bot](https://github.com/apps/redpencil-renovate-bot)! - Bump @changesets/changelog-github from 0.4.8 to 0.5.0

- [#1109](https://github.com/lblod/ember-rdfa-editor/pull/1109) [`c171687`](https://github.com/lblod/ember-rdfa-editor/commit/c1716879c255ed2df48d676d1f6ed7c8ab4fa045) Thanks [@redpencil-renovate-bot](https://github.com/apps/redpencil-renovate-bot)! - Bump @types/sinon from 17.0.2 to 17.0.3

- [#1110](https://github.com/lblod/ember-rdfa-editor/pull/1110) [`b40fea9`](https://github.com/lblod/ember-rdfa-editor/commit/b40fea9261c077d0fdbee68251652deb10ae5535) Thanks [@redpencil-renovate-bot](https://github.com/apps/redpencil-renovate-bot)! - Bump eslint-plugin-prettier from 5.1.2 to 5.1.3

- [#1114](https://github.com/lblod/ember-rdfa-editor/pull/1114) [`b636d3b`](https://github.com/lblod/ember-rdfa-editor/commit/b636d3b4404823fa2e6e4b260d98f601fe50cf6e) Thanks [@redpencil-renovate-bot](https://github.com/apps/redpencil-renovate-bot)! - Bump typescript from 5.2.2 to 5.3.3

- [#1115](https://github.com/lblod/ember-rdfa-editor/pull/1115) [`82efb68`](https://github.com/lblod/ember-rdfa-editor/commit/82efb68f7402dd672bf0d865bf3c33e34d4634ff) Thanks [@redpencil-renovate-bot](https://github.com/apps/redpencil-renovate-bot)! - Bump node from 20.10.0 to v20.11.0

- [#1118](https://github.com/lblod/ember-rdfa-editor/pull/1118) [`1c24bf2`](https://github.com/lblod/ember-rdfa-editor/commit/1c24bf2520f64e76432dbba1c7e5a5a06690f930) Thanks [@redpencil-renovate-bot](https://github.com/apps/redpencil-renovate-bot)! - Bump prettier from 3.1.1 to 3.2.0

- [#1107](https://github.com/lblod/ember-rdfa-editor/pull/1107) [`7b3dd5d`](https://github.com/lblod/ember-rdfa-editor/commit/7b3dd5de56a6ce36ff1bed8fe59fdbba78b207b7) Thanks [@piemonkey](https://github.com/piemonkey)! - Do not clean <hr /> tags from pasted input

- [#1116](https://github.com/lblod/ember-rdfa-editor/pull/1116) [`3b3a154`](https://github.com/lblod/ember-rdfa-editor/commit/3b3a1545b083f8854e16e1f7d7db6f9c85043e07) Thanks [@piemonkey](https://github.com/piemonkey)! - Add capability to write end-to-end tests

## 8.3.0

### Minor Changes

- [#1098](https://github.com/lblod/ember-rdfa-editor/pull/1098) [`61bb25fde5638c481eb28a7e3ab65eb1f64464aa`](https://github.com/lblod/ember-rdfa-editor/commit/61bb25fde5638c481eb28a7e3ab65eb1f64464aa) Thanks [@piemonkey](https://github.com/piemonkey)! - If the visible text of a link is a valid url, and no href is set, set this url as the href when de-selecting the link.

- [#1098](https://github.com/lblod/ember-rdfa-editor/pull/1098) [`0176b1139336cbdcf8c0b5695d2a1ee50ff18a51`](https://github.com/lblod/ember-rdfa-editor/commit/0176b1139336cbdcf8c0b5695d2a1ee50ff18a51) Thanks [@piemonkey](https://github.com/piemonkey)! - If a valid url is selected when creating a link, this url is used for the href of the link

- [#1098](https://github.com/lblod/ember-rdfa-editor/pull/1098) [`6e4390232968b63fda72702a230a016ab37f1d78`](https://github.com/lblod/ember-rdfa-editor/commit/6e4390232968b63fda72702a230a016ab37f1d78) Thanks [@piemonkey](https://github.com/piemonkey)! - Handle use of backspace and delete keys around the edges of ember-nodes (such as links) in an intuitive way

- [#1103](https://github.com/lblod/ember-rdfa-editor/pull/1103) [`211cc6dc1e0cf8d8cbd75ee04dcf50e9b582fe5a`](https://github.com/lblod/ember-rdfa-editor/commit/211cc6dc1e0cf8d8cbd75ee04dcf50e9b582fe5a) Thanks [@dkozickis](https://github.com/dkozickis)! - GN-4660: Resize column based on sibling column width

### Patch Changes

- [#1094](https://github.com/lblod/ember-rdfa-editor/pull/1094) [`d485ae5e82b62448680d42b83de79b0a1ec621ab`](https://github.com/lblod/ember-rdfa-editor/commit/d485ae5e82b62448680d42b83de79b0a1ec621ab) Thanks [@redpencil-renovate-bot](https://github.com/apps/redpencil-renovate-bot)! - Bump @types/common-tags from 1.8.2 to 1.8.4

- [#1091](https://github.com/lblod/ember-rdfa-editor/pull/1091) [`a07049f2d3a640b006bef7068ac35cf81bdf16c9`](https://github.com/lblod/ember-rdfa-editor/commit/a07049f2d3a640b006bef7068ac35cf81bdf16c9) Thanks [@redpencil-renovate-bot](https://github.com/apps/redpencil-renovate-bot)! - Bump @glint/template from 1.2.1 to 1.2.2

- [#1097](https://github.com/lblod/ember-rdfa-editor/pull/1097) [`7c49f45577eb0acaa9f26e69acd355b91cc29f07`](https://github.com/lblod/ember-rdfa-editor/commit/7c49f45577eb0acaa9f26e69acd355b91cc29f07) Thanks [@redpencil-renovate-bot](https://github.com/apps/redpencil-renovate-bot)! - Bump @types/rsvp from 4.0.4 to 4.0.8

- [#1096](https://github.com/lblod/ember-rdfa-editor/pull/1096) [`c24f40e038cb624b2ccf845e73e845e05296ff16`](https://github.com/lblod/ember-rdfa-editor/commit/c24f40e038cb624b2ccf845e73e845e05296ff16) Thanks [@redpencil-renovate-bot](https://github.com/apps/redpencil-renovate-bot)! - Bump @types/responselike from 1.0.1 to 1.0.3

- [#1101](https://github.com/lblod/ember-rdfa-editor/pull/1101) [`caa96ac9a8cdea7ef9a0232df7165d3f4e67079c`](https://github.com/lblod/ember-rdfa-editor/commit/caa96ac9a8cdea7ef9a0232df7165d3f4e67079c) Thanks [@redpencil-renovate-bot](https://github.com/apps/redpencil-renovate-bot)! - Bump @types/sinon from 17.0.1 to 17.0.2

- [#1102](https://github.com/lblod/ember-rdfa-editor/pull/1102) [`9a7adee0a7f88e6a461bf8377d11a825b051a26e`](https://github.com/lblod/ember-rdfa-editor/commit/9a7adee0a7f88e6a461bf8377d11a825b051a26e) Thanks [@redpencil-renovate-bot](https://github.com/apps/redpencil-renovate-bot)! - Bump sass from 1.69.3 to 1.69.7

- [#1088](https://github.com/lblod/ember-rdfa-editor/pull/1088) [`74e8de8ff1f172b6c48ea7c41804fcbd3597eef8`](https://github.com/lblod/ember-rdfa-editor/commit/74e8de8ff1f172b6c48ea7c41804fcbd3597eef8) Thanks [@piemonkey](https://github.com/piemonkey)! - Allow dropbown menus to extend beyond editor container when embedded as a very small window

- [`6cc5697299eb7dbb154e6b90fc78addad50c714e`](https://github.com/lblod/ember-rdfa-editor/commit/6cc5697299eb7dbb154e6b90fc78addad50c714e) Thanks [@elpoelma](https://github.com/elpoelma)! - GN-4631: use 'tabelopties' instead of 'tabel opties' in dutch translation of table buttons

- [#1106](https://github.com/lblod/ember-rdfa-editor/pull/1106) [`66036f567658310a77740daf21ee58bb70ffba8e`](https://github.com/lblod/ember-rdfa-editor/commit/66036f567658310a77740daf21ee58bb70ffba8e) Thanks [@piemonkey](https://github.com/piemonkey)! - Add a more flexible way to programatically hide the editor sidebar

- [#1099](https://github.com/lblod/ember-rdfa-editor/pull/1099) [`69b917cace0c20af2eba74d89f8d10f47c1d8f90`](https://github.com/lblod/ember-rdfa-editor/commit/69b917cace0c20af2eba74d89f8d10f47c1d8f90) Thanks [@piemonkey](https://github.com/piemonkey)! - Update to use latest AppUniversum style api

## 8.2.0

### Minor Changes

- [#1086](https://github.com/lblod/ember-rdfa-editor/pull/1086) [`f1272d18`](https://github.com/lblod/ember-rdfa-editor/commit/f1272d18be1579726c90ef723fde36c1586dd641) Thanks [@piemonkey](https://github.com/piemonkey)! - When creating paragraph elements, do not set a style attribute if there is no style, instead of setting an empty attribute.

- [#1086](https://github.com/lblod/ember-rdfa-editor/pull/1086) [`f1272d18`](https://github.com/lblod/ember-rdfa-editor/commit/f1272d18be1579726c90ef723fde36c1586dd641) Thanks [@piemonkey](https://github.com/piemonkey)! - When creating paragraph elements, only set an indentation level data attribute if the indentation level is non-zero.

- [#1074](https://github.com/lblod/ember-rdfa-editor/pull/1074) [`994dd5df`](https://github.com/lblod/ember-rdfa-editor/commit/994dd5dff0f9d129aa8184c84b14643c77322f31) Thanks [@piemonkey](https://github.com/piemonkey)! - When adding the href for a link, automatically add `http://` or `mailto:` to the href attribute to generate a valid `<a>` tag.

- [#1075](https://github.com/lblod/ember-rdfa-editor/pull/1075) [`cfaeba10`](https://github.com/lblod/ember-rdfa-editor/commit/cfaeba106fa82e903272bf7519e572b22f41d409) Thanks [@dkozickis](https://github.com/dkozickis)! - GN-4612: Paste highlight color correctly

- [#1085](https://github.com/lblod/ember-rdfa-editor/pull/1085) [`b40e4651`](https://github.com/lblod/ember-rdfa-editor/commit/b40e46514c68cca0dc21d94a6e8ebdcf2484ddf8) Thanks [@elpoelma](https://github.com/elpoelma)! - Apply formatting to html/xml shown in codemirror debug editor

### Patch Changes

- [#1087](https://github.com/lblod/ember-rdfa-editor/pull/1087) [`ec853241`](https://github.com/lblod/ember-rdfa-editor/commit/ec853241567c7a0310d1eaaee88b877501c4c84c) Thanks [@piemonkey](https://github.com/piemonkey)! - Fix behaviour of formatting marks for some selections, such as selecting multiple table cells. Now all cells are considered rather than just the last one to be selected.

- [#1083](https://github.com/lblod/ember-rdfa-editor/pull/1083) [`051a032b`](https://github.com/lblod/ember-rdfa-editor/commit/051a032b0c5e63b97872984448f5b296a16404f2) Thanks [@elpoelma](https://github.com/elpoelma)! - Do not clean up empty elements when they have attributes

- [#1089](https://github.com/lblod/ember-rdfa-editor/pull/1089) [`0d22ff9c`](https://github.com/lblod/ember-rdfa-editor/commit/0d22ff9cfea31f8065e71bda0d179b1c1662386e) Thanks [@piemonkey](https://github.com/piemonkey)! - Maintain formatting (such as indentation) of paragraphs which include 'soft breaks' (new lines created with shift-enter) on reloading the editor

- [#1084](https://github.com/lblod/ember-rdfa-editor/pull/1084) [`0c829fe2`](https://github.com/lblod/ember-rdfa-editor/commit/0c829fe2bc438f21d48344924b11e30760babf27) Thanks [@piemonkey](https://github.com/piemonkey)! - Fix highlight and text color behaviour when multiple table cells are selected

- [#1082](https://github.com/lblod/ember-rdfa-editor/pull/1082) [`8d5759fb`](https://github.com/lblod/ember-rdfa-editor/commit/8d5759fbbc3945bdf14785db6f093cb6194f7f3f) Thanks [@dkozickis](https://github.com/dkozickis)! - GN-4568: Fallback to "align" attribute when parsing DOM.

  Editor will attempt to use the `align` attribute if the `text-align` property of `style` attribute is not present to determine the alignment when parsing DOM.

## 8.1.0

### Minor Changes

- [`834216ab`](https://github.com/lblod/ember-rdfa-editor/commit/834216abf36046797dadee909de49d986c71a405) Thanks [@abeforgit](https://github.com/abeforgit)! - support ember-intl v6.1 and up

## 8.0.2

### Patch Changes

- [#1070](https://github.com/lblod/ember-rdfa-editor/pull/1070) [`a8b79006`](https://github.com/lblod/ember-rdfa-editor/commit/a8b790065948153fb20e6afae653b8f4e05ca5a1) Thanks [@dkozickis](https://github.com/dkozickis)! - `HTMLInputParser` - Do not remove empty table cells and rows

## 8.0.1

### Patch Changes

- [#1069](https://github.com/lblod/ember-rdfa-editor/pull/1069) [`f5625c04`](https://github.com/lblod/ember-rdfa-editor/commit/f5625c040c5ee8b8de423c9f2b9ec2b9cb0b22b7) Thanks [@abeforgit](https://github.com/abeforgit)! - don't clean empty elements if they have rdfa

## 8.0.0

### Major Changes

- [#1058](https://github.com/lblod/ember-rdfa-editor/pull/1058) [`f6ff0925`](https://github.com/lblod/ember-rdfa-editor/commit/f6ff0925d2d64b9d46e04908f9a77ede18595202) Thanks [@elpoelma](https://github.com/elpoelma)! - Update logic of entering embedded-editor with arrow-keys

- [#1058](https://github.com/lblod/ember-rdfa-editor/pull/1058) [`30ff1dbc`](https://github.com/lblod/ember-rdfa-editor/commit/30ff1dbcce1524395e37996fdd3eae6710580c28) Thanks [@elpoelma](https://github.com/elpoelma)! - Introduce custom `select-node-forward` and `select-node-backward` commands with included support for atomic inline nodes. The commands are adapted from the [prosemirror-commands](https://github.com/ProseMirror/prosemirror-commands) package.

  These commands are tied to the `delete` and `backspace` keys respectively.

### Minor Changes

- [#1064](https://github.com/lblod/ember-rdfa-editor/pull/1064) [`6981d967`](https://github.com/lblod/ember-rdfa-editor/commit/6981d967367354c26ba33c851e5e6dc36b032e59) Thanks [@elpoelma](https://github.com/elpoelma)! - Add `alignment` attribute to the `heading` and `paragraph` node-specs

- [#1068](https://github.com/lblod/ember-rdfa-editor/pull/1068) [`fe867d5b`](https://github.com/lblod/ember-rdfa-editor/commit/fe867d5b67893dcd49ff5d3123c40bbb6491d8b7) Thanks [@dkozickis](https://github.com/dkozickis)! - GN-4612: Always clean Word specific elements on paste

  Don't rely on presence of `text/rtf` data in `ClipboardEvent` to determine
  whether the paste is coming from Word, always apply the cleaning.

- [#1061](https://github.com/lblod/ember-rdfa-editor/pull/1061) [`8d2b4717`](https://github.com/lblod/ember-rdfa-editor/commit/8d2b471793a83e3a474afdcf03edbb399124539c) Thanks [@dkozickis](https://github.com/dkozickis)! - GN-4622: Pasting table now applies column widths proportionally

  When pasting a table column widths of the source table are now proportionally applied to the resulting table in the editor.

- [#1060](https://github.com/lblod/ember-rdfa-editor/pull/1060) [`c2fbc40a`](https://github.com/lblod/ember-rdfa-editor/commit/c2fbc40a424c9b46a5a429c6960d179f1a37dd63) Thanks [@dkozickis](https://github.com/dkozickis)! - GN-4622: Introduce column resizing for tables

  If upgrading from previous version you have to either:

  Import `tableColumnResizingPlugin` from `@lblod/ember-rdfa-editor/plugins/table` and add it to the list of plugins
  before the `tablePlugin` (see example below)

  ```ts
  import { tableColumnResizingPlugin, tablePlugin } from "@lblod/ember-rdfa-editor/plugins/table";

  get plugins() {
    return [tableColumnResizingPlugin, tablePlugin, tableKeymap];
  }
  ```

  **OR**

  Import `tablePlugins` from `@lblod/ember-rdfa-editor/plugins/table` and spread it into plugins array instead of `tablePlugin`

  ```ts
  import { tablePlugins } from "@lblod/ember-rdfa-editor/plugins/table";

  get plugins() {
    return [...tablePlugins, tableKeymap];
  }
  ```

- [#1064](https://github.com/lblod/ember-rdfa-editor/pull/1064) [`35c4ca44`](https://github.com/lblod/ember-rdfa-editor/commit/35c4ca44d0d71a98c31ecebd9019174457970e87) Thanks [@elpoelma](https://github.com/elpoelma)! - Add shortcuts for setting the alignment of paragraphs/headers:

  - `Ctrl`+`Shift`+`L`: left align
  - `Ctrl`+`Shift`+`E`: center align
  - `Ctrl`+`Shift`+`R`: right align
  - `Ctrl`+`Shift`+`J`: justify

- [#1057](https://github.com/lblod/ember-rdfa-editor/pull/1057) [`ebd8b2eb`](https://github.com/lblod/ember-rdfa-editor/commit/ebd8b2eb6a70a010e8130a553e6bb09d55650d22) Thanks [@elpoelma](https://github.com/elpoelma)! - update formatting-toggle to use custom `au-native-toggle` component

- [#1064](https://github.com/lblod/ember-rdfa-editor/pull/1064) [`95ff9b67`](https://github.com/lblod/ember-rdfa-editor/commit/95ff9b673fa08e39b8f3cdd0090ac28a1045143d) Thanks [@elpoelma](https://github.com/elpoelma)! - Add toolbar dropdown which allows users to modify the `alignment` of their current selection

### Patch Changes

- [#1059](https://github.com/lblod/ember-rdfa-editor/pull/1059) [`ef22d026`](https://github.com/lblod/ember-rdfa-editor/commit/ef22d0261fefd28dbb086fd49990d3b8d5e46b04) Thanks [@elpoelma](https://github.com/elpoelma)! - Limit `mousedown` handling in gap-cursor plugin to main mouse-button

- [#1059](https://github.com/lblod/ember-rdfa-editor/pull/1059) [`ef22d026`](https://github.com/lblod/ember-rdfa-editor/commit/ef22d0261fefd28dbb086fd49990d3b8d5e46b04) Thanks [@elpoelma](https://github.com/elpoelma)! - Focus editor-view explicitely in `mousedown` handler of gap-cursor plugin

## 8.0.0-next.0

### Major Changes

- [#1021](https://github.com/lblod/ember-rdfa-editor/pull/1021) [`70be7734`](https://github.com/lblod/ember-rdfa-editor/commit/70be77349c45e369a57de7ab1404f947057dd6f8) Thanks [@elpoelma](https://github.com/elpoelma)! - RDFa UI/logic improvements

### Minor Changes

- [#1022](https://github.com/lblod/ember-rdfa-editor/pull/1022) [`67d5edb4`](https://github.com/lblod/ember-rdfa-editor/commit/67d5edb49f940f205dbb23b2888c525d1a01c202) Thanks [@dkozickis](https://github.com/dkozickis)! - GN-4583: Allow to remove node via button with confirmation modal

- [#1021](https://github.com/lblod/ember-rdfa-editor/pull/1021) [`9e6a5b9d`](https://github.com/lblod/ember-rdfa-editor/commit/9e6a5b9d7fb64eb6464368b8a83f6bcb8fe8c60c) Thanks [@elpoelma](https://github.com/elpoelma)! - Add RDFa blackbox tests based on test cases from the [RDFa test suite](https://www.w3.org/2006/07/SWD/RDFa/testsuite/)

### Patch Changes

- [#1021](https://github.com/lblod/ember-rdfa-editor/pull/1021) [`ca418d90`](https://github.com/lblod/ember-rdfa-editor/commit/ca418d90e398411c106d5a985140583d262ac98d) Thanks [@elpoelma](https://github.com/elpoelma)! - make relationship selection list a bit nicer to use

- [#1021](https://github.com/lblod/ember-rdfa-editor/pull/1021) [`2d9fa6cc`](https://github.com/lblod/ember-rdfa-editor/commit/2d9fa6cc5a304af2d7d64afe109275163419163a) Thanks [@elpoelma](https://github.com/elpoelma)! - allow creating rdfa nodes from scratch

- [#1021](https://github.com/lblod/ember-rdfa-editor/pull/1021) [`c0023f39`](https://github.com/lblod/ember-rdfa-editor/commit/c0023f3916c17ef7660fb8a474a3f10e397e2eca) Thanks [@elpoelma](https://github.com/elpoelma)! - also add rdfaIds to resources in relationship selector

- [#1021](https://github.com/lblod/ember-rdfa-editor/pull/1021) [`923423e5`](https://github.com/lblod/ember-rdfa-editor/commit/923423e5cc1273e12bcc17a9cad1029e7be3d044) Thanks [@elpoelma](https://github.com/elpoelma)! - improve child rdfa node detection

## 7.0.2

### Patch Changes

- [#1053](https://github.com/lblod/ember-rdfa-editor/pull/1053) [`c2e4e2a1`](https://github.com/lblod/ember-rdfa-editor/commit/c2e4e2a1e13c35ff99646f01eab0e236c68a4867) Thanks [@dkozickis](https://github.com/dkozickis)! - GN-4621: Add styling for selected table cell

  - `.selectedCell` to style the cell that is selected. `.selectedCell` comes from the `prosemirror-tables` plugin.
  - `::selection` to hide the selection on the text inside the cell.

## 7.0.1

### Patch Changes

- [#1045](https://github.com/lblod/ember-rdfa-editor/pull/1045) [`af593913`](https://github.com/lblod/ember-rdfa-editor/commit/af593913abc2be7d9386b224bd5b68469da60dbe) Thanks [@abeforgit](https://github.com/abeforgit)! - fix placeholders no longer being selectable with mouse

## 7.0.0

### Major Changes

- [`951fe78e`](https://github.com/lblod/ember-rdfa-editor/commit/951fe78ee96a07ac9d4f83c5433788d66c1499a7) Thanks [@elpoelma](https://github.com/elpoelma)! - GN-4130: Remove "data-editor-highlight" styled

  Removes styles that were affecting elements with the "data-editor-highlight" attribute.
  Styles are moved to [ember-rdfa-editor-lblod-plugins](https://github.com/lblod/ember-rdfa-editor-lblod-plugins) and are
  applied through the `citation-plugin`.

### Minor Changes

- [#1044](https://github.com/lblod/ember-rdfa-editor/pull/1044) [`0a2472c1`](https://github.com/lblod/ember-rdfa-editor/commit/0a2472c1e459091f10cb5cffdbe44e7b14bd2df3) Thanks [@elpoelma](https://github.com/elpoelma)! - Add shift+enter handler to `embeddedEditorBaseKeymap`

- [#1027](https://github.com/lblod/ember-rdfa-editor/pull/1027) [`8d310cf1`](https://github.com/lblod/ember-rdfa-editor/commit/8d310cf1a3421935a858ad8a9483c4f83c4d7f66) Thanks [@elpoelma](https://github.com/elpoelma)! - Introduction of a custom gap-cursor plugin containing several fixes compared to the original version:

  - The click handler has been replaced by a mousedown handler in order to intercept a click event earlier
  - The types of the GapCursor class have been fixed
  - Addition of a fix when resolving the position returned by view.posAtCoords.

- [#1042](https://github.com/lblod/ember-rdfa-editor/pull/1042) [`1f9dbf13`](https://github.com/lblod/ember-rdfa-editor/commit/1f9dbf1384d0a49b010877637799728cdc7bceb7) Thanks [@elpoelma](https://github.com/elpoelma)! - Introduction of `_guid` attribute on inline-rdfa markspec

- [#1040](https://github.com/lblod/ember-rdfa-editor/pull/1040) [`5ebcbedb`](https://github.com/lblod/ember-rdfa-editor/commit/5ebcbedbcbeac84697c60ee323f6542cc8870d11) Thanks [@elpoelma](https://github.com/elpoelma)! - Deprecate usage of `SetDocAttributeStep` in favour of native `DocAttrStep` or `setDocAttribute` method of the `Transform` class

- [#1042](https://github.com/lblod/ember-rdfa-editor/pull/1042) [`4d7f9acc`](https://github.com/lblod/ember-rdfa-editor/commit/4d7f9accbfa80fb6eb6445da8ea8b4fa15e8606b) Thanks [@elpoelma](https://github.com/elpoelma)! - Removal of obsolete `__tag` attribute from inline-rdfa markspec and block-rdfa nodespec

- [#1040](https://github.com/lblod/ember-rdfa-editor/pull/1040) [`56a5f4ac`](https://github.com/lblod/ember-rdfa-editor/commit/56a5f4ac04c70213e1a67fb48268116ec160cb32) Thanks [@elpoelma](https://github.com/elpoelma)! - Use native `setDocAttribute` method of the `Transform` class to update attributes of the doc node

- [#1042](https://github.com/lblod/ember-rdfa-editor/pull/1042) [`1f9dbf13`](https://github.com/lblod/ember-rdfa-editor/commit/1f9dbf1384d0a49b010877637799728cdc7bceb7) Thanks [@elpoelma](https://github.com/elpoelma)! - Removal of obsolete `__rdfaId` node and mark attribute

### Patch Changes

- [#1032](https://github.com/lblod/ember-rdfa-editor/pull/1032) [`c830cfb2`](https://github.com/lblod/ember-rdfa-editor/commit/c830cfb22490b410a049043323cd446a0e366742) Thanks [@elpoelma](https://github.com/elpoelma)! - Update `prosemirror-transform` to 1.8.0

- [#1044](https://github.com/lblod/ember-rdfa-editor/pull/1044) [`7f953ce6`](https://github.com/lblod/ember-rdfa-editor/commit/7f953ce6d2f82d1f9b72c1952d2bcb3aec80b4e3) Thanks [@elpoelma](https://github.com/elpoelma)! - Fix issue with setting keymap of embedded editor

- [#1033](https://github.com/lblod/ember-rdfa-editor/pull/1033) [`419b26aa`](https://github.com/lblod/ember-rdfa-editor/commit/419b26aaabfa8842092c1c2b55780ec968d4bdae) Thanks [@elpoelma](https://github.com/elpoelma)! - Fix issue in firefox with backspacing after inline ember-nodes

- [#1032](https://github.com/lblod/ember-rdfa-editor/pull/1032) [`1d8a1ed3`](https://github.com/lblod/ember-rdfa-editor/commit/1d8a1ed3df1a3422ac2dca8c0510ed5972bbd92a) Thanks [@elpoelma](https://github.com/elpoelma)! - Update `prosemirror-inputrules` to 1.3.0

- [#1032](https://github.com/lblod/ember-rdfa-editor/pull/1032) [`fdadd1b8`](https://github.com/lblod/ember-rdfa-editor/commit/fdadd1b827bf70b1112108efe3250c441001841a) Thanks [@elpoelma](https://github.com/elpoelma)! - Remove obsolete `prosemirror-gapcursor` package

- [#1034](https://github.com/lblod/ember-rdfa-editor/pull/1034) [`f94178f8`](https://github.com/lblod/ember-rdfa-editor/commit/f94178f8f5b0401037eb9c66ff065cb3b05ba270) Thanks [@elpoelma](https://github.com/elpoelma)! - Update firefoxCursorFix plugin to add workaround for pressing the delete-key around inline ember-nodes

- [#1034](https://github.com/lblod/ember-rdfa-editor/pull/1034) [`f94178f8`](https://github.com/lblod/ember-rdfa-editor/commit/f94178f8f5b0401037eb9c66ff065cb3b05ba270) Thanks [@elpoelma](https://github.com/elpoelma)! - Update chromeHacks plugin to add workaround for pressing the delete-key around inline ember-nodes

- [#1044](https://github.com/lblod/ember-rdfa-editor/pull/1044) [`6d75850a`](https://github.com/lblod/ember-rdfa-editor/commit/6d75850a449928b99d17dc3b22d269d89961593e) Thanks [@elpoelma](https://github.com/elpoelma)! - Only run `leave-on-enter` modifier when `Enter` has been pressed without modifier keys

- [#1032](https://github.com/lblod/ember-rdfa-editor/pull/1032) [`f31699aa`](https://github.com/lblod/ember-rdfa-editor/commit/f31699aacf91d240ff744a60d5696463ca96f15e) Thanks [@elpoelma](https://github.com/elpoelma)! - Update prosemirror-view to 1.32.4

## 7.0.0-next.3

### Patch Changes

- [#1021](https://github.com/lblod/ember-rdfa-editor/pull/1021) [`c0023f39`](https://github.com/lblod/ember-rdfa-editor/commit/c0023f3916c17ef7660fb8a474a3f10e397e2eca) Thanks [@elpoelma](https://github.com/elpoelma)! - also add rdfaIds to resources in relationship selector

## 7.0.0-next.2

### Patch Changes

- [#1021](https://github.com/lblod/ember-rdfa-editor/pull/1021) [`ca418d90`](https://github.com/lblod/ember-rdfa-editor/commit/ca418d90e398411c106d5a985140583d262ac98d) Thanks [@elpoelma](https://github.com/elpoelma)! - make relationship selection list a bit nicer to use

- [#1021](https://github.com/lblod/ember-rdfa-editor/pull/1021) [`923423e5`](https://github.com/lblod/ember-rdfa-editor/commit/923423e5cc1273e12bcc17a9cad1029e7be3d044) Thanks [@elpoelma](https://github.com/elpoelma)! - improve child rdfa node detection

## 7.0.0-next.1

### Patch Changes

- [#1021](https://github.com/lblod/ember-rdfa-editor/pull/1021) [`2d9fa6cc`](https://github.com/lblod/ember-rdfa-editor/commit/2d9fa6cc5a304af2d7d64afe109275163419163a) Thanks [@elpoelma](https://github.com/elpoelma)! - allow creating rdfa nodes from scratch

## 7.0.0-next.0

### Major Changes

- [`951fe78e`](https://github.com/lblod/ember-rdfa-editor/commit/951fe78ee96a07ac9d4f83c5433788d66c1499a7) Thanks [@elpoelma](https://github.com/elpoelma)! - GN-4130: Remove "data-editor-highlight" styled

  Removes styles that were affecting elements with the "data-editor-highlight" attribute.
  Styles are moved to [ember-rdfa-editor-lblod-plugins](https://github.com/lblod/ember-rdfa-editor-lblod-plugins) and are
  applied through the `citation-plugin`.

### Minor Changes

- [#1027](https://github.com/lblod/ember-rdfa-editor/pull/1027) [`8d310cf1`](https://github.com/lblod/ember-rdfa-editor/commit/8d310cf1a3421935a858ad8a9483c4f83c4d7f66) Thanks [@elpoelma](https://github.com/elpoelma)! - Introduction of a custom gap-cursor plugin containing several fixes compared to the original version:

  - The click handler has been replaced by a mousedown handler in order to intercept a click event earlier
  - The types of the GapCursor class have been fixed
  - Addition of a fix when resolving the position returned by view.posAtCoords.

- [#1022](https://github.com/lblod/ember-rdfa-editor/pull/1022) [`67d5edb4`](https://github.com/lblod/ember-rdfa-editor/commit/67d5edb49f940f205dbb23b2888c525d1a01c202) Thanks [@dkozickis](https://github.com/dkozickis)! - GN-4583: Allow to remove node via button with confirmation modal

- [#1021](https://github.com/lblod/ember-rdfa-editor/pull/1021) [`9e6a5b9d`](https://github.com/lblod/ember-rdfa-editor/commit/9e6a5b9d7fb64eb6464368b8a83f6bcb8fe8c60c) Thanks [@elpoelma](https://github.com/elpoelma)! - Add RDFa blackbox tests based on test cases from the [RDFa test suite](https://www.w3.org/2006/07/SWD/RDFa/testsuite/)

## 6.4.0

### Minor Changes

- [#1028](https://github.com/lblod/ember-rdfa-editor/pull/1028) [`24cdfd2f`](https://github.com/lblod/ember-rdfa-editor/commit/24cdfd2ff9a52a4606f662f3c88d13e6911c8f23) Thanks [@elpoelma](https://github.com/elpoelma)! - Include exhaustive list of allowed attributes (partly sourced from https://github.com/cure53/DOMPurify/blob/1.0.8/src/attrs.js) used by the `rdfa-input-parser` implementation. This list also includes RDFa-specific attributes, in order to ensure these are not removed.

- [#1028](https://github.com/lblod/ember-rdfa-editor/pull/1028) [`24cdfd2f`](https://github.com/lblod/ember-rdfa-editor/commit/24cdfd2ff9a52a4606f662f3c88d13e6911c8f23) Thanks [@elpoelma](https://github.com/elpoelma)! - Include exhaustive list of allowed tags (sourced from https://github.com/cure53/DOMPurify/blob/1.0.8/src/tags.js) that are allowed by `html-input-parser`

### Patch Changes

- [#1029](https://github.com/lblod/ember-rdfa-editor/pull/1029) [`982723d4`](https://github.com/lblod/ember-rdfa-editor/commit/982723d4a6db31aac005906b093afa1a563a9df0) Thanks [@elpoelma](https://github.com/elpoelma)! - Drop `ember-scenarios` woodpecker pipeline

- [#1023](https://github.com/lblod/ember-rdfa-editor/pull/1023) [`573d877e`](https://github.com/lblod/ember-rdfa-editor/commit/573d877ec861773a2eb069ff94b265ba328ce4fd) Thanks [@elpoelma](https://github.com/elpoelma)! - Hide caret when `ProseMirror-hideselection` class is applied

- [#1028](https://github.com/lblod/ember-rdfa-editor/pull/1028) [`24cdfd2f`](https://github.com/lblod/ember-rdfa-editor/commit/24cdfd2ff9a52a4606f662f3c88d13e6911c8f23) Thanks [@elpoelma](https://github.com/elpoelma)! - Removal of unused lump tags reference in the `html-input-parser` implementation

## 6.3.0

### Minor Changes

- [#995](https://github.com/lblod/ember-rdfa-editor/pull/995) [`de9bf54a`](https://github.com/lblod/ember-rdfa-editor/commit/de9bf54a15aed90155bea1aa4238c92ef2f20399) Thanks [@elpoelma](https://github.com/elpoelma)! - Display new image icon if host app has `@appuniversum/ember-appuniversum` >= 2.16.0 installed

### Patch Changes

- whater

- [#991](https://github.com/lblod/ember-rdfa-editor/pull/991) [`4a4b855f`](https://github.com/lblod/ember-rdfa-editor/commit/4a4b855f4510f8d2751e01f0aba012908fb74ef5) Thanks [@piemonkey](https://github.com/piemonkey)! - Improve types and documentation of EmberNode

- [#993](https://github.com/lblod/ember-rdfa-editor/pull/993) [`d68f84c4`](https://github.com/lblod/ember-rdfa-editor/commit/d68f84c4304a9783270b8cbf1f717e017c1e2325) Thanks [@elpoelma](https://github.com/elpoelma)! - Update @appuniversum/ember-appuniversum dev-dependency to 2.16.0

  Note: this does not mean that we only support `@appuniversum/ember-appuniversum` `2.16.0` and above. The `@appuniversum/ember-appuniversum` package will stay supported as low as version `2.4.2`.

- [#1003](https://github.com/lblod/ember-rdfa-editor/pull/1003) [`fb57c719`](https://github.com/lblod/ember-rdfa-editor/commit/fb57c7198e616990ba0d0d0fe1c2f6091327bf13) Thanks [@elpoelma](https://github.com/elpoelma)! - Remove unnecessary z-index: 1 css declaration from image resize-handles

## 6.2.0

### Minor Changes

- [#989](https://github.com/lblod/ember-rdfa-editor/pull/989) [`8ad01b11`](https://github.com/lblod/ember-rdfa-editor/commit/8ad01b1174e84780f5cbf8f530e3a4fc741bc17f) Thanks [@x-m-el](https://github.com/x-m-el)! - export a Sass mixin `say-content` that contains the style of the class `say-content`

### Patch Changes

- [#983](https://github.com/lblod/ember-rdfa-editor/pull/983) [`7e653b78`](https://github.com/lblod/ember-rdfa-editor/commit/7e653b78d356b256eb1ecc0b2ec53743abfdcacd) Thanks [@piemonkey](https://github.com/piemonkey)! - GN-4531 Fix unfocusing of nested variable nodes when clicking main editor

## 6.1.0

### Minor Changes

- [#977](https://github.com/lblod/ember-rdfa-editor/pull/977) [`fe82e3e3`](https://github.com/lblod/ember-rdfa-editor/commit/fe82e3e3ff8065b40927f34c8e42888923014644) Thanks [@elpoelma](https://github.com/elpoelma)! - Add ember-source as a peerdependency

- [#978](https://github.com/lblod/ember-rdfa-editor/pull/978) [`642e8d3c`](https://github.com/lblod/ember-rdfa-editor/commit/642e8d3cf2801ad48f27cd02b038304a8b7d859c) Thanks [@elpoelma](https://github.com/elpoelma)! - Update ember-source and related packages to 4.12

### Patch Changes

- [#976](https://github.com/lblod/ember-rdfa-editor/pull/976) [`922313d8`](https://github.com/lblod/ember-rdfa-editor/commit/922313d846b8960abb53c77ded80a5144aab2d1d) Thanks [@dkozickis](https://github.com/dkozickis)! - GN-4517: Reduce possible CSS conflicts

## 6.0.0

### Major Changes

- [#964](https://github.com/lblod/ember-rdfa-editor/pull/964) [`e2324a3e`](https://github.com/lblod/ember-rdfa-editor/commit/e2324a3e938c36b8476fc18b5b480ea675a08e6e) Thanks [@Windvis](https://github.com/Windvis)! - Add Embroider "optimized" support

  To support the strict Embroider "optimized" preset we needed to make a breaking change. The `componentPath` property for the `createEmberNodeView` util has been replaced by a new `component` property. Instead of providing the path to the component, the component class should be passed instead.

  Before:

  ```js
  createEmberNodeView({
    // ... other options
    componentPath: 'foo',
  });
  ```

  After:

  ```js
  import Foo from 'app-name/components/foo';

  createEmberNodeView({
    // ... other options
    component: Foo,
  });
  ```

### Patch Changes

- [#959](https://github.com/lblod/ember-rdfa-editor/pull/959) [`6105ec66`](https://github.com/lblod/ember-rdfa-editor/commit/6105ec66301f6cb789ceafe5a881ceb3b36732c8) Thanks [@elpoelma](https://github.com/elpoelma)! - Move changeset check to seperate CI pipeline

## 5.3.0

### Minor Changes

- [#966](https://github.com/lblod/ember-rdfa-editor/pull/966) [`6234df46`](https://github.com/lblod/ember-rdfa-editor/commit/6234df46eb25eabb144c6d6947444ceb7cf8ad1a) Thanks [@x-m-el](https://github.com/x-m-el)! - GN-4482: Color Picker UX - increase the clickable size of the color picker color-buttons

- [#954](https://github.com/lblod/ember-rdfa-editor/pull/954) [`69200fa6`](https://github.com/lblod/ember-rdfa-editor/commit/69200fa6f8397d7b69301a4c95d46e087b80d95a) Thanks [@abeforgit](https://github.com/abeforgit)! - GN-4433: Pressing `enter`-key inside a link will set the cursor behind this link

- [#963](https://github.com/lblod/ember-rdfa-editor/pull/963) [`ab16d6d3`](https://github.com/lblod/ember-rdfa-editor/commit/ab16d6d31dd8e93109deef74264d10932080a82a) Thanks [@Windvis](https://github.com/Windvis)! - Expose a Webpack config for Embroidered apps

- [#954](https://github.com/lblod/ember-rdfa-editor/pull/954) [`788af8ca`](https://github.com/lblod/ember-rdfa-editor/commit/788af8ca18b8bdc9c57cd2c4acf74c80caf84db8) Thanks [@abeforgit](https://github.com/abeforgit)! - switch to changesets for changelog management

- [#955](https://github.com/lblod/ember-rdfa-editor/pull/955) [`0f6da258`](https://github.com/lblod/ember-rdfa-editor/commit/0f6da25859f9d34be8ebce28b998f1bda192d9ad) Thanks [@elpoelma](https://github.com/elpoelma)! - GN-4479: allow for option to pass nodeviews object to embedded-editor component

- [#962](https://github.com/lblod/ember-rdfa-editor/pull/962) [`49e52fb4`](https://github.com/lblod/ember-rdfa-editor/commit/49e52fb4c7cb8696898372e0d31df88036b56f2e) Thanks [@x-m-el](https://github.com/x-m-el)! - - Fix `leave-on-enter-key` modifier to always use the correct position to leave a node from.

  - Add `leave-with-arrow-keys` modifier, which can be used to leave an node's element with the left and right arrow key.
  - Add `select-node-on-click` modifier, which can be used to select a given node when clicking the bound element.

- [#965](https://github.com/lblod/ember-rdfa-editor/pull/965) [`542ad84b`](https://github.com/lblod/ember-rdfa-editor/commit/542ad84b7a81dd66dd7700309faad71488621622) Thanks [@x-m-el](https://github.com/x-m-el)! - GN4482: Bugfix - allow toggling marks if spaces are included at the start or end of the selection

### Patch Changes

- [#960](https://github.com/lblod/ember-rdfa-editor/pull/960) [`c62f6d10`](https://github.com/lblod/ember-rdfa-editor/commit/c62f6d1064dd74e2d5539c9d12c04b1f95ff5210) Thanks [@elpoelma](https://github.com/elpoelma)! - Removal of dependabot-changelog action

- [#954](https://github.com/lblod/ember-rdfa-editor/pull/954) [`69200fa6`](https://github.com/lblod/ember-rdfa-editor/commit/69200fa6f8397d7b69301a4c95d46e087b80d95a) Thanks [@abeforgit](https://github.com/abeforgit)! - Resolve some Embroider safe issues

- [#957](https://github.com/lblod/ember-rdfa-editor/pull/957) [`2dcdd7e4`](https://github.com/lblod/ember-rdfa-editor/commit/2dcdd7e4302c38d1d2e2521194a62cb53629f3ec) Thanks [@elpoelma](https://github.com/elpoelma)! - GN-4479: fix issues with embedded editor inner dispatch

- [#961](https://github.com/lblod/ember-rdfa-editor/pull/961) [`c34477bb`](https://github.com/lblod/ember-rdfa-editor/commit/c34477bb1f1d3122be673635d34d68c21a88eae4) Thanks [@Windvis](https://github.com/Windvis)! - Replace ember-get-config

- [#958](https://github.com/lblod/ember-rdfa-editor/pull/958) [`f27f3a19`](https://github.com/lblod/ember-rdfa-editor/commit/f27f3a19e59ccbc1ae438044154f8176706606c5) Thanks [@dkozickis](https://github.com/dkozickis)! - GN-4483: Remove styling for `#ember-basic-dropdown-wormhole`

## [5.2.0] - 2023-08-29

### Changed

- remove unused dependencies

## [5.1.0] - 2023-08-25

### Fixed

- pin the focus-trap dependency to 1.0.x since 1.1.0 has a faulty peerdep spec, see [this issue](https://github.com/josemarluedke/ember-focus-trap/issues/82)

### Added

- `findNodePosDown` function in `addon/utils/position-utils` that can find a node with specific predicate in the document, searching down (=to the right) in order of the document as seen by the user
- `findNodePosUp` function in `addon/utils/position-utils` that can find a node with specific predicate in the document, searching up (=to the left) in order of the document as seen by the user

## [5.0.0] - 2023-08-22

### Changed

- All nodes with `indentationLevel` attribute can be indented, instead of only hardcoded nodes.
- Add a `setDocumentAttribute` on `SayController`
- Export `SetDocAttributeStep`
- Check if table can be inserted

### Fixed

- All Paragraphs are now part of the group `paragraphGroup`
  - A list will accept any `paragraphGroup`
- ParagraphWithConfig accepts a config option `subType` which is required.
  - For a normal paragraph this can be the empty string
  - For others, this will be added to the nodespec as `subType` and the dataset of the node in `parseDom`
- fetch dependency `lblod/prosemirror-invisibles` via https instead of ssh, as the repo is public

### Dependencies

- Bumps `@typescript-eslint/eslint-plugin` from 6.2.0 to 6.3.0
- Bumps `xml-formatter` from 3.4.1 to 3.5.0
- Bumps `eslint-config-prettier` from 8.9.0 to 9.0.0
- Bumps `release-it` from 16.1.3 to 16.1.5
- Bumps `ember-velcro` from 2.1.0 to 2.1.1
- Bumps `eslint-config-prettier` from 8.8.0 to 8.9.0
- Bumps `sass` from 1.64.1 to 1.64.2
- Bumps `prosemirror-view` from 1.31.6 to 1.31.7
- Bumps `@types/sinon` from 10.0.15 to 10.0.16
- Bumps `eslint` from 8.45.0 to 8.46.0
- Bumps `handlebars` from 4.7.7 to 4.7.8
- Bumps `prettier` from 3.0.0 to 3.0.1
- Bumps `prosemirror-transform` from 1.7.3 to 1.7.4
- Bumps `@codemirror/view` from 6.15.3 to 6.16.0

### Breaking

- remove option `allowedTypes`. Instead all nodes with attribute `indentationLevel` can be indented.

## [4.2.0] - 2023-07-29

### Dependencies

- Bumps `@typescript-eslint/parser` from 6.1.0 to 6.2.0
- Bumps `@typescript-eslint/eslint-plugin` from 6.1.0 to 6.2.0
- Bumps `eslint-plugin-deprecation` from 1.4.1 to 1.5.0

### Added

- Can specify plugins and keymap for embedded-editor.
- `ParagraphWithConfig` node that allows paragraphs with customized configuration like marks, groups and allowed content.
- Option `allowedTypes` for indentation menu to override which types can be indented.

### Changed

- The schema defined for embedded-editor was not used by prosemirror. This has been removed to avoid confusion.
- Mark buttons (bold, italic, ...) are now disabled if not allowed for the selected text.

## [4.1.0] - 2023-07-24

### Added

- Addition of an ember-application prosemirror plugin which allows for accessing the current instance of the ember application given a prosemirror state.
- Addition of a custom `SayNodeSpec` interface which adds support for a `serialize` method. This method gets called each time the custom `SaySerializer` is executed.
- Addition of a custom `SayMarkSpec` interface which adds support for a `serialize` method. This method gets called each time the custom `SaySerializer` is executed.
- Addition of the `SaySerializer` class. This is a custom `DOMSerializer` which execute the `serialize` method of node- and mark-specs if available.

### Changed

- Updated docker build to serve static files

### Dependencies

- Bumps `@codemirror/view` from 6.14.1 to 6.15.3
- Bumps `@codemirror/view` from 6.14.0 to 6.15.3
- Bumps `eslint-plugin-ember` from 11.9.0 to 11.10.0
- Bumps `@typescript-eslint/eslint-plugin` from 6.0.0 to 6.1.0
- Bumps `@typescript-eslint/eslint-plugin` from 5.61.0 to 6.1.0
- Bumps `@typescript-eslint/parser` to 6.0.0
- Bumps `semver` from 5.7.1 to 5.7.2
- Bumps `prettier` from 2.8.8 to 3.0.0
- Bumps `eslint-plugin-prettier` to 5.0.0
- Bumps `release-it` to 16.1.0
- Bumps `@release-it/keep-a-changelog` to 4.0.0
- Bumps `prosemirror-model` from 1.19.2 to 1.19.3
- Bumps `eslint` from 8.44.0 to 8.45.0
- Bumps `prosemirror-view` from 1.31.5 to 1.31.6
- Bumps `dompurify` from 3.0.4 to 3.0.5
- Bumps `@typescript-eslint/parser` from 6.0.0 to 6.1.0
- Bumps `release-it` from 16.1.2 to 16.1.3
- Bumps `release-it` from 16.1.0 to 16.1.3
- Bumps `ember-template-lint` from 5.11.0 to 5.11.1
- Bumps `sass` from 1.63.6 to 1.64.1
- Bumps `webpack` from 5.88.1 to 5.88.2

## [4.0.0] - 2023-07-05

### Added

- Addition of documentLanguage getter and setter to SayController
- Addition of a `SetDocAttribute` step, which allows updating the attribute value on the `doc` node.
- Addition of an `initialize` method to the `SayController` which allows re-initializing the editor given an html string.
- Introduction of a `docWithConfig` function. This function produces a doc node-spec based on a `DocumentConfig` object. This config may contain the default language and the allowed content of a document.

### Changed

- Improve behaviour of ember-nodes with editable content
- Update the dummy counter node to make use of new document language feature
- Woodpecker: do not run changelog-check when PR contains `dependabot` label
- Addition of a `lang` attribute to the `doc` node-spec.

### Removed

- remove unused say-editor specific svgs

### Breaking

- The default behaviour of the `stopEvent` method of ember-nodeviews has changed in order to provide an improved handling of (input) event in and around ember-nodes
- The default behaviour of the `ignoreMutation` method of ember-nodeviews has changed in order to provide better handling of mutations and selection changes in and around ember-nodes
- Updated behaviour of `htmlContent` getter and setter to take into document node and lang attribute into account. Note: this getter now also serializes the `doc` node, so the output will slightly differ in comparison to previous releases.
- The `doc` node-spec in your schema now needs a `toDOM` method as the `htmlContent` getter needs to be able to serialize it.

### Dependencies

- Bumps `@codemirror/view` from 6.13.2 to 6.14.0
- Bumps `@codemirror/view` from 6.13.1 to 6.14.0
- Bumps `@ember/render-modifiers` from 2.0.5 to 2.1.0
- Bumps `prosemirror-tables` from 1.3.3 to 1.3.4
- Bumps `@types/qunit` from 2.19.5 to 2.19.6
- Bumps `@typescript-eslint/parser` from 5.60.1 to 5.61.0
- Bumps `@typescript-eslint/parser` from 5.60.0 to 5.61.0
- Bumps `@typescript-eslint/parser` from 5.59.9 to 5.60.1
- Bumps `@embroider/test-setup` from 2.1.1 to 3.0.1
- Bumps `prosemirror-view` from 1.31.4 to 1.31.5
- Bumps `ember-template-lint` from 5.10.3 to 5.11.0
- Bumps `ember-template-lint` from 5.7.3 to 5.11.0
- Bumps `webpack` from 5.88.0 to 5.88.1
- Bumps `webpack` from 5.87.0 to 5.88.1
- Bumps `eslint-plugin-ember` from 11.8.0 to 11.9.0
- Bumps `@codemirror/lang-html` from 6.4.4 to 6.4.5
- Bumps `eslint-plugin-qunit` from 7.3.4 to 8.0.0
- Bumps `dompurify` from 3.0.3 to 3.0.4
- Bumps `@typescript-eslint/eslint-plugin` from 5.60.1 to 5.61.0
- Bumps `@typescript-eslint/eslint-plugin` from 5.59.11 to 5.61.0
- Bumps `eslint` from 8.43.0 to 8.44.0
- Bumps `sinon` from 15.1.2 to 15.2.0
- Bumps `@types/sinon` from 10.0.13 to 10.0.15

## [3.10.0] - 2023-06-22

### Fixed

- better handle weird edgecases when copying from word

### Internal

- use `github.token` for github checkout action

### Dependencies

- Bumps `prosemirror-view` from 1.31.3 to 1.31.4
- Bumps `xml-formatter` from 3.3.2 to 3.4.1
- Bumps `@types/uuid` from 9.0.1 to 9.0.2
- Bumps `ember-cli-dependency-checker` from 3.3.1 to 3.3.2
- Bumps `sass` from 1.63.5 to 1.63.6
- Bumps `sass` from 1.62.1 to 1.63.6
- Bumps `rdf-data-factory` from 1.1.1 to 1.1.2
- Bumps `eslint` from 8.42.0 to 8.43.0
- Bumps `@types/ember__string` from 3.0.10 to 3.0.11
- Bumps `prosemirror-schema-basic` from 1.2.1 to 1.2.2

### Changed

- fix woodpecker syntax
- replacement of github ensure-changelog action by changelog check in woodpecker CI
- `SayController::setHtmlContent` can now receive `shouldFocus` option which determines whether editor will be focused or not after calling `setHtmlContent`. Defaults to `true` for back compatibility.

## [3.9.0] - 2023-06-18

### Added

- add pr template
- add ability to completely override plugin array
- Addition of `getGroups` and `hasGroups` utility functions

### Dependencies

- Bumps `@codemirror/state` from 6.2.0 to 6.2.1
- Bumps `sinon` from 15.0.4 to 15.1.2
- Bumps `prettier` from 2.8.7 to 2.8.8
- Bumps `webpack` from 5.86.0 to 5.87.0
- Bumps `prosemirror-tables` from 1.3.2 to 1.3.3
- Bumps `@types/ember__error` from 4.0.2 to 4.0.3
- Bumps `@ember/test-helpers` from 2.9.3 to 2.9.4
- Bumps `@codemirror/lang-html` from 6.4.3 to 6.4.4
- Bumps `@appuniversum/ember-appuniversum` from 2.5.0 to 2.7.0

## [3.8.1] - 2023-06-13

### Dependencies

- Bumps `caniuse-lite` to 1.0.30001492
- Bumps `ember-focus-trap` from 1.0.1 to 1.0.2
- Bumps `ember-velcro` to 2.1.0
- Pin `typescript` to 5.0.x
- Bumps `prosemirror-state` from 1.4.2 to 1.4.3
- Bumps `eslint` from 8.38.0 to 8.42.0
- Bumps `release-it` from 15.10.1 to 15.11.0
- Bumps `@typescript-eslint/parser` from 5.59.2 to 5.59.9
- Bumps `eslint-plugin-ember` from 11.5.2 to 11.8.0
- Bumps `prosemirror-keymap` from 1.2.1 to 1.2.2
- Bumps `webpack` from 5.81.0 to 5.86.0
- Bumps `prosemirror-transform` from 1.7.1 to 1.7.3
- Bumps `@codemirror/view` from 6.13.0 to 6.13.1
- Bumps `@codemirror/view` from 6.10.1 to 6.13.1
- Bumps `prosemirror-inputrules` from 1.2.0 to 1.2.1
- Bumps `@types/debug` from 4.1.7 to 4.1.8
- Bumps `iter-tools` from 7.5.1 to 7.5.3
- Bumps `@typescript-eslint/eslint-plugin` from 5.59.5 to 5.59.11
- Bumps `prosemirror-commands` from 1.5.1 to 1.5.2
- Bumps `prosemirror-schema-list` from 1.2.2 to 1.3.0

## [3.8.0] - 2023-05-31

### Added

- Allow the parent component to get the innerView in Embedded Editor

### Dependencies

- Bumps `prosemirror-view` from 1.30.2 to 1.31.3
- Bumps `prosemirror-history` from 1.3.0 to 1.3.2
- Bumps `prosemirror-gapcursor` from 1.3.1 to 1.3.2
- Bumps `prosemirror-model` from 1.19.0 to 1.19.2

## [3.7.2] - 2023-05-30

### Dependencies

- Bumps `vm2` from 3.9.17 to 3.9.19
- Bumps `ember-template-lint` from 5.7.2 to 5.7.3
- Bumps `dompurify` from 3.0.1 to 3.0.3
- Bumps `socket.io-parser` from 4.2.1 to 4.2.3
- Bumps `engine.io` from 6.2.1 to 6.4.2
- Bumps `socket.io` from 4.5.4 to 4.6.1
- Bumps `prosemirror-dropcursor` from 1.8.0 to 1.8.1

### Fixed

- Annotation UX not present for some structures

## [3.7.1] - 2023-05-17

### Fixed

- Show correct import for heading node in documentation
- Whitespace is not removed in table headers
- correct woodpecker secret indentation

## [3.7.0] - 2023-05-12

### Dependencies

- Bumps `sass` from 1.62.0 to 1.62.1
- Bumps `@typescript-eslint/eslint-plugin` from 5.59.0 to 5.59.5

### Added

- Update `EmberNodeConfig` type

## [3.6.0] - 2023-05-04

### Added

- Addition of list inputrules
- Possibility to pass `ignoreMutation` to the EmberNodeSpec when creating Ember Nodes

### Fixed

- Also observe responsive toolbar children for resize
- Solve bug with cursor in front a multiple line link
- Add color mark to dummy-plugins schema
- Use `flex-start` instead of `start` as justify-content value
- Backspace into nested list

### Changed

- Ensure the list toggle button removes selected content completely out of all lists when untoggling

### Dependencies

- Bumps `@typescript-eslint/parser` from 5.58.0 to 5.59.2
- Bumps `@typescript-eslint/parser` from 5.55.0 to 5.59.2
- Bumps `linkifyjs` from 4.1.0 to 4.1.1
- Bumps `@appuniversum/ember-appuniversum` from 2.4.2 to 2.5.0
- Bumps `vm2` from 3.9.16 to 3.9.17
- Bumps `vm2` from 3.9.15 to 3.9.17
- Bumps `vm2` from 3.9.12 to 3.9.16
- Bumps `typescript` from 4.9.5 to 5.0.4
- Bumps `sinon` from 15.0.3 to 15.0.4
- Bumps `sinon` from 15.0.2 to 15.0.4
- Bumps `eslint-plugin-deprecation` from 1.3.3 to 1.4.1
- Bumps `@typescript-eslint/eslint-plugin` from 5.58.0 to 5.59.0
- Bumps `@typescript-eslint/eslint-plugin` from 5.57.1 to 5.59.0
- Bumps `eslint` from 8.36.0 to 8.38.0
- Bumps `webpack` from 5.79.0 to 5.81.0
- Bumps `webpack` from 5.76.2 to 5.81.0
- Bumps `ember-template-lint` from 5.7.1 to 5.7.2
- Bumps `eslint-config-prettier` from 8.7.0 to 8.8.0
- Bumps `@codemirror/view` from 6.9.4 to 6.10.1
- Bumps `@codemirror/view` from 6.9.3 to 6.10.1
- Bumps `sass` from 1.59.3 to 1.62.0
- Bumps `@codemirror/lang-html` from 6.4.2 to 6.4.3
- Bumps `ember-auto-import` from 2.6.1 to 2.6.3
- Bumps `release-it` from 15.9.0 to 15.10.1
- Bumps `eslint-plugin-ember` from 11.4.8 to 11.5.2
- Bumps `@types/qunit` from 2.19.4 to 2.19.5

## [3.5.0] - 2023-04-07

### Added

- Added the possibility to use Insert Card as open by default

### Fixed:

- Add unique id package missing

### Dependencies

- Bumps `prettier` from 2.8.4 to 2.8.7
- Bumps `@typescript-eslint/eslint-plugin` from 5.55.0 to 5.57.1
- Bumps `@codemirror/view` from 6.9.2 to 6.9.3

### Fixed:

- Support SVG without height/width
- Validate the URL when inserting an image

## [3.4.1] - 2023-03-27

### Dependencies

- bump prosemirror dependencies to latest

## [3.4.0] - 2023-03-23

### Added:

- Addition of a `ResponsiveToolbar` component which takes into account container and screen size.
- Addition of a color highlighting mark and toolbar menu
- Addition of a toolbar menu which allows for inserting an image given it's URL.
- Support for resizable images
- Addition of an optional stopEvent attribute which can be provided when configuring an ember-node, it can be used to override the default behaviour of the stopEvent attribute of the ember-node node-view.
- Addition of a text color mark
- Required parts of `AuPill` extracted into `Pill` component

### Fixed:

- embedded-editor: only set data-placeholder when placeholder argument is supplied
- toolbar: add missing missing toolbar divider styles
- Fix switching unordered list to ordered and applying correct styling
- ember-node: Fix cursor placement inside of `ember-node` when navigating from left
- Un-indent paragraph on backspace at the front of paragraph
- Change `EmberNode` "inline" style to be `inline-block` to avoid pushing away surrounding content
- Change `outline` for `Link` "ember-node" to have `outline-offset` `-2px` for it not to cover nearby content when focused
- fix backspacing into link nodes on firefox
- When the `prosemirror-invisibles` is enabled, an `undefined` is no longer thrown on some occasions
- More clear handling of delete at end of rdfa-block

### Changed:

- disable broken firefox cursor fix plugin
- usage of ember-velcro for toolbar-dropdown component
- remove support for base64 images
- Improve appearance of fake firefox cursor

### Dependencies

- Bumps `@codemirror/lang-html` from 6.4.1 to 6.4.2
- Bumps `@codemirror/view` from 6.9.1 to 6.9.2
- Bumps `@types/dompurify` from 2.4.0 to 3.0.0
- Bumps `@typescript-eslint/eslint-plugin` from 5.50.0 to 5.55.0
- Bumps `@typescript-eslint/parser` from 5.54.0 to 5.55.0
- Bumps `dompurify` from 3.0.0 to 3.0.1
- Bumps `ember-template-lint` from 5.7.0 to 5.7.1
- Bumps `ember-template-lint` from 5.6.0 to 5.7.1
- Bumps `ember-template-lint` from 5.3.3 to 5.7.0
- Bumps `eslint-config-prettier` from 8.6.0 to 8.7.0
- Bumps `eslint-plugin-ember` from 11.4.6 to 11.4.8
- Bumps `eslint` from 8.29.0 to 8.36.0
- Bumps `prosemirror-commands` from 1.5.0 to 1.5.1
- Bumps `prosemirror-dropcursor` from 1.7.0 to 1.7.1
- Bumps `prosemirror-view` from 1.30.1 to 1.30.2
- Bumps `release-it` from 15.8.0 to 15.9.0
- Bumps `release-it` from 15.7.0 to 15.9.0
- Bumps `sass` from 1.58.3 to 1.59.3
- Bumps `sinon` from 15.0.1 to 15.0.2
- Bumps `webpack` from 5.76.1 to 5.76.2
- Bumps `webpack` from 5.75.0 to 5.76.2
- Bumps `xml-formatter` from 3.3.0 to 3.3.2

## [3.3.0] - 2023-03-02

### Added

- Addition of a formatting toggle component which allows showing formatting marks
- Addition of linkPasteHandler plugin which detects and converts links in pasted content

### Changed

- Disable toolbar buttons when not applicable instead of hiding them
- Use the new view pasteHTML method inside the Word paste handler.
- Updated selection background-color of selections inside highlighted elements

### Dependencies

- Bumps `@embroider/test-setup` from 1.8.3 to 2.1.1
- Bumps `@typescript-eslint/parser` from 5.50.0 to 5.54.0
- Bumps `tracked-built-ins` from 3.1.0 to 3.1.1
- Bumps `ember-qunit` from 6.1.1 to 6.2.0
- Bumps `prettier` from 2.8.3 to 2.8.4
- Bumps `minimist` from 0.2.2 to 0.2.4
- Bumps `release-it` from 15.6.0 to 15.7.0
- Bumps `prosemirror-keymap` from 1.2.0 to 1.2.1
- Bumps `@codemirror/view` from 6.7.3 to 6.9.1

### Fixed

- Inherit ordered list style correctly
- Fixed white-space issue in links
- Fix issue with parsing links from pasted html

## [3.2.1] - 2023-02-28

### Fixed

- Fix `ember.js` 3.28 compatibility issue

### Dependencies

- Bumps `@codemirror/lang-xml` from 6.0.1 to 6.0.2
- Bumps `prosemirror-dropcursor` from 1.6.1 to 1.7.0

## [3.2.0] - 2023-02-27

### Added

- Addition of the paragraph/heading indentation functionality

### Fixed

- Add padding to rdfa-toggle
- Fix shrinking issue with toolbar groups
- Fix disappearing cursor problems in firefox

### Deprecated

- Usage of `Plugins::List::IndentationControls`, use `Plugins::Indentation::IndentationMenu` instead.

### Dependencies

- Bumps `@types/uuid` from 9.0.0 to 9.0.1
- Bumps `sass` from 1.58.0 to 1.58.3
- Bumps `prosemirror-schema-basic` from 1.2.0 to 1.2.1
- Bumps `ember-auto-import` from 2.6.0 to 2.6.1
- Bumps `prosemirror-view` from 1.29.2 to 1.30.1

## [3.1.0] - 2023-02-24

### Changed

- export link nodes in the plugin and deprecate the other import

### Removed

- Removed `ember-cli-app-version` package

### Dependencies

- Add `ember-cli-sass` 11.0.1 as peerdependency
- Bumps `typescript` from 4.9.3 to 4.9.5
- Bumps `@codemirror/state` from 6.1.4 to 6.2.0

## [3.0.0] - 2023-02-23

### Added

- Handle ctrl click on links
- Add ordered list feature.
  Adds the button and appropriate toggling behavior when combined with unordered lists
  Also includes some needed css fixes
- Addition of interactive link node
- Add tab key handler to indent/unindent list items
- Add eslint-plugin-deprecation package to check for use of deprecated code.
- Disable undo and redo button when there's no more steps
- Add support for ordered list styles
- Added the ability to pass optional attributes to the `toggleList` command.
- Addition of spacing between paragraphs/tables and other elements.
- Added features to add table headings

### Changed

- Increase left-padding of lists
- BREAKING: Rename Toolbar::Icon to Toolbar::Button
- remove overflow: hidden on editor container div
- Replace drone by woodpecker
- Modernize toolbar dropdown
- BREAKING: Rework how widgets are passed to the editor
- BREAKING: Rename of the editor component: `Rdfa::RdfaEditor` to `Editor`
- BREAKING: Removal of the `RdfaEditorWithDebug` component, use `DebugTools` instead.
- BREAKING: Removal of `toolbarOptions` argument of the editor component
- BREAKING: Removal of `widgets` argument of the editor component
- BREAKING: Rework how embedded views are accessed and operated on from the controller
- Allow users to set a cursor by clicking in the margin of the editor

### Fixed

- Modify the base keymaps to better support macos users
- Replace text marks in another way in attribute generation plugin to fix cursor jumping
- Keep selection on the document when toggling annotations
- Fix shrinking issues with toolbar buttons and dropdowns
- Fix sidebar area not clickable when sidebar is hidden
- Fix alignment of table buttons
- Only allow paragraphs and lists in the list items

### Removed

- BREAKING: removal of `RdfaEditorPlugin` class
- BREAKING: removal of `toggleMark` controller method, use `doCommand` in combination with the `toggleMark` or `toggleMarkAddFirst` commands instead

### Dependencies

- Bumps `@appuniversum/ember-appuniversum` from 2.2.0 to 2.4.2
- Bumps `@codemirror/lang-html` from 6.4.1 to 6.4.2
- Bumps `@codemirror/lang-xml` from 6.0.1 to 6.0.2
- Bumps `@codemirror/state` from 6.1.4 to 6.2.0
- Bumps `@codemirror/view` from 6.7.3 to 6.9.1
- Bumps `@types/uuid` from 9.0.0 to 9.0.1
- Bumps `@typescript-eslint/eslint-plugin` from 5.50.0 to 5.53.0
- Bumps `@typescript-eslint/parser` from 5.50.0 to 5.53.0
- Bumps `dompurify` from 2.4.1 to 3.0.0
- Bumps `ember-cli-app-version` from 5.0.0 to 6.0.0
- Bumps `ember-template-lint` from 5.3.3 to 5.5.1
- Bumps `eslint` from 8.29.0 to 8.34.0
- Bumps `prettier` from 2.8.3 to 2.8.4
- Bumps `prosemirror-dropcursor` from 1.6.1 to 1.7.0
- Bumps `prosemirror-keymap` from 1.2.0 to 1.2.1
- Bumps `prosemirror-schema-basic` from 1.2.0 to 1.2.1
- Bumps `prosemirror-view` from 1.29.2 to 1.30.1
- Bumps `sass` from 1.58.0 to 1.58.3
- Bumps `sinon` from 14.0.2 to 15.0.1
- Bumps `tracked-built-ins` from 3.1.0 to 3.1.1
- Bumps `typescript` from 4.9.3 to 4.9.5
- Bumps `xml-formatter` from 2.6.1 to 3.3.0

## [2.1.4] - 2023-02-23

### Fixed

- move ember-intl config in editor constructor to beforeModel hook

## [2.1.3] - 2023-02-09

### Fixed

- fix paragraph parsing rule so paragraphs are skipped when they contain block content, not inline content.

## [2.1.2] - 2023-02-07

### Fixed

- skip paragraph parsing when they contain (erroneous) block content

Some existing documents erroneously contain block elements inside `p` tags, most notably tables.
These got ignored before and parsed as flat text. Now we detect this case and skip the paragraph.

- remove lump-node css

Now that all tables are editable, we don't need this anymore.

## [2.1.1] - 2023-02-07

### Fixed

- Preserve whitespace when parsing an html document

### Added

- addition of an attribute generation plugin which auto-generates specific missing attributes.

## [2.1.0] - 2023-02-06

### Fixed

- Fix space insertion in table cells
- Fix delete and backspace selecting the whole table when inside of one

### Added

- add canSpec property to nodespecs which is checked before splitting the node with enter

### Changed

- Update and modernize README.

### Added

- A deprecation eslint rule using the eslint-plugin-deprecation package.

### Deprecated

- Usage of `ProseController.view`, use `ProseController.getView` instead.
- Usage of `ProseController.state`, use `ProseController.getState` instead.
- Usage of `ProseController.checkAndDoCommand`, use `ProseController.doCommand` instead.
- Usage of `NodeConfig`, `MarkConfig`, `PluginConfig`, `ResolvedPluginConfig` and `RdfaEditorPlugin`
- Usage of the string-based version of `toggleMark`, use the `MarkType`-based version instead.

## [2.0.1] - 2023-02-02

### Fixed

- Fix wrapping of spaces at line end

### Dependencies

- Bumps `eslint-plugin-ember` from 11.2.1 to 11.4.6
- Bumps `prosemirror-transform` from 1.7.0 to 1.7.1
- Bumps `@types/uuid` from 8.3.4 to 9.0.0
- Bumps `iter-tools` from 7.5.0 to 7.5.1

## [2.0.0] - 2023-02-01

### Added

- add a plugin to enable regeneration of UUIDs on paste #556

### Changed

- BREAKING 💥: findNodes now takes an arg object and supports an end position #564
- Upgrade ember-source to 4.8.2-lts. #568
- build(deps-dev): bump @typescript-eslint/eslint-plugin from 5.48.2 to 5.50.0 #576
- build(deps-dev): bump @typescript-eslint/parser from 5.45.1 to 5.50.0 #575
- build(deps-dev): bump sass from 1.56.1 to 1.58.0 #574
- build(deps-dev): bump qunit from 2.19.3 to 2.19.4 #573
- build(deps): bump @codemirror/view from 6.7.0 to 6.7.3 #569

### Removed

- BREAKING 💥: Drop official support for node < 18

## [1.1.0] - 2023-01-30

### Changed

- Use keep-a-changelog instead of lerna-changelog for changelog generation
- build(deps): bump prosemirror-model from 1.18.3 to 1.19.0 #558
- build(deps-dev): bump ember-template-lint from 4.18.2 to 5.3.3 #565
- build(deps): bump prosemirror-view from 1.29.2 to 1.30.0 #559

### Removed

- remove ember-cli-coverage dependency #567

### Fixed

- ensure delete and backspace behavior around tables is consistent #566
- improve performance in chrome #563

## [1.0.0] - 2023-01-26

#### :rocket: Enhancement

- [#560](https://github.com/lblod/ember-rdfa-editor/pull/560) Add redo button ([@elpoelma](https://github.com/elpoelma))

#### :house: Internal

- [#562](https://github.com/lblod/ember-rdfa-editor/pull/562) Remove ember-instance from window and pass it through for ember-nodes ([@elpoelma](https://github.com/elpoelma))

#### Committers: 1

- Elena Poelman ([@elpoelma](https://github.com/elpoelma))

## 1.0.0-beta.7 (2023-01-25)

fix(commands): focus and scrollintoview on insert-html

## 1.0.0-beta.6 (2023-01-24)

improve insert-html logic so it doesn't insert unnecessary paragraphs

## 1.0.0-beta.5 (2023-01-20)

#### :rocket: Enhancement

- [#553](https://github.com/lblod/ember-rdfa-editor/pull/553) Add functionality to support an embedded view and allow widgets to perform actions on either the outer or inner view ([@elpoelma](https://github.com/elpoelma))

#### Committers: 1

- Elena Poelman ([@elpoelma](https://github.com/elpoelma))

## 1.0.0-beta.4 (2023-01-20)

#### :rocket: Enhancement

- [#552](https://github.com/lblod/ember-rdfa-editor/pull/552) Make paragraphs not parse when they contain rdfa ([@abeforgit](https://github.com/abeforgit))

#### Committers: 1

- Arne Bertrand ([@abeforgit](https://github.com/abeforgit))

## 1.0.0-beta.3 (2023-01-19)

#### :bug: Bug Fix

- [#546](https://github.com/lblod/ember-rdfa-editor/pull/546) Set word-wrap as break-word on editor ([@elpoelma](https://github.com/elpoelma))

#### Committers: 1

- Elena Poelman ([@elpoelma](https://github.com/elpoelma))

## 1.0.0-beta.2 (2023-01-17)

#### :house: Internal

- [#540](https://github.com/lblod/ember-rdfa-editor/pull/540) update prosemirror packages to latest versions ([@elpoelma](https://github.com/elpoelma))

#### Committers: 1

- Elena Poelman ([@elpoelma](https://github.com/elpoelma))

## 1.0.0-beta.1 (2023-01-17)

#### :boom: Breaking Change

- [#538](https://github.com/lblod/ember-rdfa-editor/pull/538) Prosemirror ([@abeforgit](https://github.com/abeforgit))

#### :rocket: Enhancement

- [#538](https://github.com/lblod/ember-rdfa-editor/pull/538) Prosemirror ([@abeforgit](https://github.com/abeforgit))
- [#451](https://github.com/lblod/ember-rdfa-editor/pull/451) GN-3716 - Improve copy/paste from word ([@usrtim](https://github.com/usrtim))

#### :bug: Bug Fix

- [#499](https://github.com/lblod/ember-rdfa-editor/pull/499) fix(initialization): emit a selectionchanged after init ([@abeforgit](https://github.com/abeforgit))
- [#481](https://github.com/lblod/ember-rdfa-editor/pull/481) fix(paste): preserve list indentation when copying from word ([@abeforgit](https://github.com/abeforgit))

#### :house: Internal

- [#536](https://github.com/lblod/ember-rdfa-editor/pull/536) build(deps-dev): bump @typescript-eslint/eslint-plugin from 5.43.0 to 5.48.2 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#533](https://github.com/lblod/ember-rdfa-editor/pull/533) build(deps-dev): bump prettier from 2.7.1 to 2.8.3 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#539](https://github.com/lblod/ember-rdfa-editor/pull/539) build(deps): bump loader-utils from 1.0.4 to 2.0.4 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#525](https://github.com/lblod/ember-rdfa-editor/pull/525) build(deps-dev): bump @appuniversum/ember-appuniversum from 2.0.0 to 2.2.0 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#505](https://github.com/lblod/ember-rdfa-editor/pull/505) build(deps): bump decode-uri-component from 0.2.0 to 0.2.2 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#491](https://github.com/lblod/ember-rdfa-editor/pull/491) build(deps-dev): bump eslint-plugin-qunit from 7.3.2 to 7.3.4 ([@dependabot[bot]](https://github.com/apps/dependabot))

#### Committers: 2

- Arne Bertrand ([@abeforgit](https://github.com/abeforgit))
- [@usrtim](https://github.com/usrtim)

## v0.65.0 (2022-11-23)

#### :boom: Breaking Change

- [#468](https://github.com/lblod/ember-rdfa-editor/pull/468) Update ember-appuniversum to v2 ([@Windvis](https://github.com/Windvis))

#### :house: Internal

- [#480](https://github.com/lblod/ember-rdfa-editor/pull/480) build(deps): bump engine.io from 6.2.0 to 6.2.1 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#475](https://github.com/lblod/ember-rdfa-editor/pull/475) build(deps-dev): bump eslint from 8.27.0 to 8.28.0 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#469](https://github.com/lblod/ember-rdfa-editor/pull/469) build(deps): bump @codemirror/lang-html from 6.1.4 to 6.2.0 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#466](https://github.com/lblod/ember-rdfa-editor/pull/466) build(deps): bump @codemirror/view from 6.5.0 to 6.5.1 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#464](https://github.com/lblod/ember-rdfa-editor/pull/464) build(deps-dev): bump @appuniversum/ember-appuniversum from 1.9.0 to 1.10.0 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#457](https://github.com/lblod/ember-rdfa-editor/pull/457) build(deps-dev): bump typescript from 4.8.4 to 4.9.3 ([@dependabot[bot]](https://github.com/apps/dependabot))

#### Committers: 1

- Sam Van Campenhout ([@Windvis](https://github.com/Windvis))

## v0.64.0 (2022-11-15)

#### :boom: Breaking Change

- [#455](https://github.com/lblod/ember-rdfa-editor/pull/455) Inline components: serializable properties ([@elpoelma](https://github.com/elpoelma))

#### :rocket: Enhancement

- [#455](https://github.com/lblod/ember-rdfa-editor/pull/455) Inline components: serializable properties ([@elpoelma](https://github.com/elpoelma))

#### :house: Internal

- [#456](https://github.com/lblod/ember-rdfa-editor/pull/456) Remove unnecessary read in htmlContent method ([@elpoelma](https://github.com/elpoelma))

#### Committers: 1

- Elena Poelman ([@elpoelma](https://github.com/elpoelma))

## v0.63.8 (2022-11-15)

#### :house: Internal

- [#454](https://github.com/lblod/ember-rdfa-editor/pull/454) fix(deps): use proper versions of the @types packages ([@abeforgit](https://github.com/abeforgit))
- [#448](https://github.com/lblod/ember-rdfa-editor/pull/448) build(deps-dev): bump eslint-plugin-qunit from 7.3.1 to 7.3.2 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#450](https://github.com/lblod/ember-rdfa-editor/pull/450) build(deps-dev): bump @appuniversum/ember-appuniversum from 1.8.2 to 1.9.0 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#447](https://github.com/lblod/ember-rdfa-editor/pull/447) build(deps): bump @codemirror/view from 6.4.0 to 6.4.1 ([@dependabot[bot]](https://github.com/apps/dependabot))

#### Committers: 1

- Arne Bertrand ([@abeforgit](https://github.com/abeforgit))

## v0.63.7 (2022-11-04)

#### :bug: Bug Fix

- [#443](https://github.com/lblod/ember-rdfa-editor/pull/443) Refresh inline components after model read ([@elpoelma](https://github.com/elpoelma))

#### :house: Internal

- [#444](https://github.com/lblod/ember-rdfa-editor/pull/444) Remove unnecessary read on mouseup ([@elpoelma](https://github.com/elpoelma))
- [#442](https://github.com/lblod/ember-rdfa-editor/pull/442) build(deps-dev): bump @types/ember\_\_polyfills from 4.0.0 to 4.0.1 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#441](https://github.com/lblod/ember-rdfa-editor/pull/441) build(deps-dev): bump @types/ember\_\_engine from 4.0.2 to 4.0.3 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#440](https://github.com/lblod/ember-rdfa-editor/pull/440) build(deps-dev): bump @types/ember\_\_test-helpers from 2.8.1 to 2.8.2 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#439](https://github.com/lblod/ember-rdfa-editor/pull/439) build(deps-dev): bump @types/ember\_\_runloop from 4.0.1 to 4.0.2 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#438](https://github.com/lblod/ember-rdfa-editor/pull/438) build(deps-dev): bump @types/ember\_\_template from 4.0.0 to 4.0.1 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#433](https://github.com/lblod/ember-rdfa-editor/pull/433) build(deps-dev): bump eslint-plugin-ember from 11.1.0 to 11.2.0 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#434](https://github.com/lblod/ember-rdfa-editor/pull/434) build(deps-dev): bump @types/ember\_\_component from 4.0.10 to 4.0.11 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#435](https://github.com/lblod/ember-rdfa-editor/pull/435) build(deps-dev): bump @types/ember\_\_application from 4.0.2 to 4.0.3 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#436](https://github.com/lblod/ember-rdfa-editor/pull/436) build(deps-dev): bump @types/ember\_\_routing from 4.0.11 to 4.0.12 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#437](https://github.com/lblod/ember-rdfa-editor/pull/437) build(deps-dev): bump @types/ember\_\_controller from 4.0.2 to 4.0.3 ([@dependabot[bot]](https://github.com/apps/dependabot))

#### Committers: 1

- Elena Poelman ([@elpoelma](https://github.com/elpoelma))

## v0.63.6 (2022-10-27)

#### :house: Internal

- [#429](https://github.com/lblod/ember-rdfa-editor/pull/429) build(deps-dev): bump @types/ember\_\_utils from 4.0.1 to 4.0.2 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#428](https://github.com/lblod/ember-rdfa-editor/pull/428) build(deps-dev): bump @types/ember\_\_array from 4.0.2 to 4.0.3 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#427](https://github.com/lblod/ember-rdfa-editor/pull/427) build(deps-dev): bump @typescript-eslint/parser from 5.40.1 to 5.41.0 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#426](https://github.com/lblod/ember-rdfa-editor/pull/426) build(deps-dev): bump @types/ember-resolver from 5.0.11 to 5.0.12 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#432](https://github.com/lblod/ember-rdfa-editor/pull/432) build(deps): bump ember-cli-typescript from 5.1.1 to 5.2.1 ([@dependabot[bot]](https://github.com/apps/dependabot))

## v0.63.5 (2022-10-26)

#### :house: Internal

- [#425](https://github.com/lblod/ember-rdfa-editor/pull/425) build(deps): bump @codemirror/lang-html from 6.1.2 to 6.1.3 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#424](https://github.com/lblod/ember-rdfa-editor/pull/424) build(deps): bump @codemirror/lang-xml from 6.0.0 to 6.0.1 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#423](https://github.com/lblod/ember-rdfa-editor/pull/423) build(deps-dev): bump @typescript-eslint/eslint-plugin from 5.40.1 to 5.41.0 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#422](https://github.com/lblod/ember-rdfa-editor/pull/422) build(deps-dev): bump qunit from 2.19.2 to 2.19.3 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#421](https://github.com/lblod/ember-rdfa-editor/pull/421) build(deps-dev): bump eslint from 8.25.0 to 8.26.0 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#420](https://github.com/lblod/ember-rdfa-editor/pull/420) build(deps-dev): bump @types/ember\_\_controller from 4.0.1 to 4.0.2 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#419](https://github.com/lblod/ember-rdfa-editor/pull/419) build(deps): bump @codemirror/view from 6.3.1 to 6.4.0 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#418](https://github.com/lblod/ember-rdfa-editor/pull/418) build(deps-dev): bump eslint-plugin-ember from 11.0.6 to 11.1.0 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#417](https://github.com/lblod/ember-rdfa-editor/pull/417) build(deps-dev): bump ember-template-lint from 4.15.0 to 4.16.1 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#416](https://github.com/lblod/ember-rdfa-editor/pull/416) fix deprecations ([@usrtim](https://github.com/usrtim))
- [#413](https://github.com/lblod/ember-rdfa-editor/pull/413) build(deps-dev): bump @appuniversum/ember-appuniversum from 1.8.1 to 1.8.2 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#412](https://github.com/lblod/ember-rdfa-editor/pull/412) build(deps-dev): bump @typescript-eslint/parser from 5.40.0 to 5.40.1 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#411](https://github.com/lblod/ember-rdfa-editor/pull/411) build(deps): bump ember-auto-import from 2.4.2 to 2.4.3 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#414](https://github.com/lblod/ember-rdfa-editor/pull/414) build(deps-dev): bump @typescript-eslint/eslint-plugin from 5.40.0 to 5.40.1 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#415](https://github.com/lblod/ember-rdfa-editor/pull/415) build(deps-dev): bump qunit from 2.19.1 to 2.19.2 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#408](https://github.com/lblod/ember-rdfa-editor/pull/408) build(deps-dev): bump @typescript-eslint/eslint-plugin from 5.39.0 to 5.40.0 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#409](https://github.com/lblod/ember-rdfa-editor/pull/409) build(deps): bump @xmldom/xmldom from 0.8.2 to 0.8.3 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#407](https://github.com/lblod/ember-rdfa-editor/pull/407) build(deps-dev): bump ember-template-lint from 4.14.0 to 4.15.0 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#406](https://github.com/lblod/ember-rdfa-editor/pull/406) build(deps): bump @codemirror/view from 6.3.0 to 6.3.1 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#405](https://github.com/lblod/ember-rdfa-editor/pull/405) build(deps-dev): bump @typescript-eslint/parser from 5.39.0 to 5.40.0 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#403](https://github.com/lblod/ember-rdfa-editor/pull/403) build(deps-dev): bump eslint from 8.24.0 to 8.25.0 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#402](https://github.com/lblod/ember-rdfa-editor/pull/402) build(deps-dev): bump ember-qunit from 5.1.5 to 6.0.0 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#401](https://github.com/lblod/ember-rdfa-editor/pull/401) build(deps-dev): bump @appuniversum/ember-appuniversum from 1.8.0 to 1.8.1 ([@dependabot[bot]](https://github.com/apps/dependabot))

#### Committers: 1

- [@usrtim](https://github.com/usrtim)

## 1.0.0-alpha.14 (2023-01-17)

#### :rocket: Enhancement

- [#532](https://github.com/lblod/ember-rdfa-editor/pull/532) Addition of a menu which allows to insert headings ([@elpoelma](https://github.com/elpoelma))
- [#531](https://github.com/lblod/ember-rdfa-editor/pull/531) Support for subscript and superscript marks ([@elpoelma](https://github.com/elpoelma))
- [#530](https://github.com/lblod/ember-rdfa-editor/pull/530) feat(datastore): make datastore lazy ([@abeforgit](https://github.com/abeforgit))

#### :bug: Bug Fix

- [#537](https://github.com/lblod/ember-rdfa-editor/pull/537) Remove context from parsing rule paragraph ([@elpoelma](https://github.com/elpoelma))
- [#535](https://github.com/lblod/ember-rdfa-editor/pull/535) Add translation for 'insert' and 'show annotations' buttons. ([@elpoelma](https://github.com/elpoelma))

#### Committers: 2

- Arne Bertrand ([@abeforgit](https://github.com/abeforgit))
- Elena Poelman ([@elpoelma](https://github.com/elpoelma))

## 1.0.0-alpha.13 (2023-01-03)

#### :house: Internal

- [#521](https://github.com/lblod/ember-rdfa-editor/pull/521) Ensure placeholders are non-draggable and use placeholder-text as leafText ([@elpoelma](https://github.com/elpoelma))

#### Committers: 1

- Elena Poelman ([@elpoelma](https://github.com/elpoelma))

## 1.0.0-alpha.12 (2022-12-22)

- Datastore: fix issue with node mappings

## 1.0.0-alpha.11 (2022-12-20)

#### :rocket: Enhancement

- [#516](https://github.com/lblod/ember-rdfa-editor/pull/516) Fix table insertion menu and keymapping ([@abeforgit](https://github.com/abeforgit))

#### Committers: 1

- Arne Bertrand ([@abeforgit](https://github.com/abeforgit))

## 1.0.0-alpha.10 (2022-12-20)

fix test import

## 1.0.0-alpha.9 (2022-12-20)

#### :boom: Breaking Change

- [#515](https://github.com/lblod/ember-rdfa-editor/pull/515) fix/list behavior - rdfa as marks ([@abeforgit](https://github.com/abeforgit))

#### :rocket: Enhancement

- [#507](https://github.com/lblod/ember-rdfa-editor/pull/507) Rework placeholders ([@elpoelma](https://github.com/elpoelma))
- [#513](https://github.com/lblod/ember-rdfa-editor/pull/513) Addition of utility functions which allow for searching nodes in a specific range or with a specific condition ([@elpoelma](https://github.com/elpoelma))

#### Committers: 2

- Arne Bertrand ([@abeforgit](https://github.com/abeforgit))
- Elena Poelman ([@elpoelma](https://github.com/elpoelma))

## 1.0.0-alpha.8 (2022-12-14)

#### :boom: Breaking Change

- [#511](https://github.com/lblod/ember-rdfa-editor/pull/511) Return pos instead of resolved pos from datastore ([@elpoelma](https://github.com/elpoelma))

#### :house: Internal

- [#511](https://github.com/lblod/ember-rdfa-editor/pull/511) Return pos instead of resolved pos from datastore ([@elpoelma](https://github.com/elpoelma))

#### Committers: 1

- Elena Poelman ([@elpoelma](https://github.com/elpoelma))

## 1.0.0-alpha.7 (2022-12-14)

#### :boom: Breaking Change

- [#498](https://github.com/lblod/ember-rdfa-editor/pull/498) Utility functions to create ember-node-views and ember-node-specs ([@elpoelma](https://github.com/elpoelma))

#### :rocket: Enhancement

- [#509](https://github.com/lblod/ember-rdfa-editor/pull/509) feature(datastore): implement ds as a plugin ([@abeforgit](https://github.com/abeforgit))
- [#498](https://github.com/lblod/ember-rdfa-editor/pull/498) Utility functions to create ember-node-views and ember-node-specs ([@elpoelma](https://github.com/elpoelma))
- [#495](https://github.com/lblod/ember-rdfa-editor/pull/495) Add resolved-positions to prose-store ([@elpoelma](https://github.com/elpoelma))

#### :bug: Bug Fix

- [#508](https://github.com/lblod/ember-rdfa-editor/pull/508) bug(datastore): guarantee reference stability for datastore data ([@abeforgit](https://github.com/abeforgit))
- [#501](https://github.com/lblod/ember-rdfa-editor/pull/501) fix(npm): fix infinite loop by moving devtools to devdeps ([@abeforgit](https://github.com/abeforgit))

#### :house: Internal

- [#502](https://github.com/lblod/ember-rdfa-editor/pull/502) Cleanup unused code, tighten linting, fix linting ([@abeforgit](https://github.com/abeforgit))

#### Committers: 2

- Arne Bertrand ([@abeforgit](https://github.com/abeforgit))
- Elena Poelman ([@elpoelma](https://github.com/elpoelma))

## 1.0.0-alpha.6 (2022-12-06)

#### :boom: Breaking Change

- [#494](https://github.com/lblod/ember-rdfa-editor/pull/494) restructure plugins ([@abeforgit](https://github.com/abeforgit))

#### :rocket: Enhancement

- [#492](https://github.com/lblod/ember-rdfa-editor/pull/492) feature(dev): add devtools ([@abeforgit](https://github.com/abeforgit))

#### :house: Internal

- [#494](https://github.com/lblod/ember-rdfa-editor/pull/494) restructure plugins ([@abeforgit](https://github.com/abeforgit))

#### Committers: 1

- Arne Bertrand ([@abeforgit](https://github.com/abeforgit))

## 1.0.0-alpha.5 (2022-11-30)

- fix mark active state on buttons
- fix enter handling in lists

## 1.0.0-alpha.4 (2022-11-30)

#### :rocket: Enhancement

- [#410](https://github.com/lblod/ember-rdfa-editor/pull/410) feature/simple positions ([@abeforgit](https://github.com/abeforgit))

#### :memo: Documentation

- [#400](https://github.com/lblod/ember-rdfa-editor/pull/400) Correct the description for the text-only paste behaviour. ([@elpoelma](https://github.com/elpoelma))

#### Committers: 2

- Arne Bertrand ([@abeforgit](https://github.com/abeforgit))
- Elena Poelman ([@elpoelma](https://github.com/elpoelma))

## 1.0.0-alpha.3 (2022-10-06)

#### :boom: Breaking Change

- [#397](https://github.com/lblod/ember-rdfa-editor/pull/397) TEDI: live mark set rework ([@elpoelma](https://github.com/elpoelma))
- [#390](https://github.com/lblod/ember-rdfa-editor/pull/390) Feature: allow for plugins to reload dynamically ([@elpoelma](https://github.com/elpoelma))
- [#389](https://github.com/lblod/ember-rdfa-editor/pull/389) Enable html pasting by passing a property to the editor component ([@elpoelma](https://github.com/elpoelma))

#### :rocket: Enhancement

- [#390](https://github.com/lblod/ember-rdfa-editor/pull/390) Feature: allow for plugins to reload dynamically ([@elpoelma](https://github.com/elpoelma))
- [#358](https://github.com/lblod/ember-rdfa-editor/pull/358) Introduction of a MarksManager ([@elpoelma](https://github.com/elpoelma))

#### :bug: Bug Fix

- [#398](https://github.com/lblod/ember-rdfa-editor/pull/398) Bugfix: inline component reload ([@elpoelma](https://github.com/elpoelma))
- [#396](https://github.com/lblod/ember-rdfa-editor/pull/396) Fix issue with computing differences on transaction dispatch ([@elpoelma](https://github.com/elpoelma))
- [#389](https://github.com/lblod/ember-rdfa-editor/pull/389) Enable html pasting by passing a property to the editor component ([@elpoelma](https://github.com/elpoelma))
- [#386](https://github.com/lblod/ember-rdfa-editor/pull/386) Fix: inline component selection issues ([@elpoelma](https://github.com/elpoelma))
- [#385](https://github.com/lblod/ember-rdfa-editor/pull/385) Ensure dom nodes are correctly converted to model nodes ([@elpoelma](https://github.com/elpoelma))
- [#373](https://github.com/lblod/ember-rdfa-editor/pull/373) Fix: view to model behaviour ([@elpoelma](https://github.com/elpoelma))
- [#365](https://github.com/lblod/ember-rdfa-editor/pull/365) Fix issue with inline components not being persisted correctly across reloads ([@elpoelma](https://github.com/elpoelma))

#### :house: Internal

- [#399](https://github.com/lblod/ember-rdfa-editor/pull/399) build(typescript): enable strict type-checking ([@abeforgit](https://github.com/abeforgit))
- [#397](https://github.com/lblod/ember-rdfa-editor/pull/397) TEDI: live mark set rework ([@elpoelma](https://github.com/elpoelma))
- [#395](https://github.com/lblod/ember-rdfa-editor/pull/395) build(deps-dev): bump ember-cli from 3.28.5 to 3.28.6 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#394](https://github.com/lblod/ember-rdfa-editor/pull/394) build(deps-dev): bump @typescript-eslint/eslint-plugin from 5.38.1 to 5.39.0 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#393](https://github.com/lblod/ember-rdfa-editor/pull/393) build(deps-dev): bump release-it from 15.4.2 to 15.5.0 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#392](https://github.com/lblod/ember-rdfa-editor/pull/392) build(deps-dev): bump sinon from 14.0.0 to 14.0.1 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#391](https://github.com/lblod/ember-rdfa-editor/pull/391) build(deps-dev): bump @typescript-eslint/parser from 5.38.1 to 5.39.0 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#384](https://github.com/lblod/ember-rdfa-editor/pull/384) Chore/cleanup feature flags ([@nvdk](https://github.com/nvdk))
- [#387](https://github.com/lblod/ember-rdfa-editor/pull/387) build(deps-dev): bump @appuniversum/ember-appuniversum from 1.7.0 to 1.8.0 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#382](https://github.com/lblod/ember-rdfa-editor/pull/382) build(deps-dev): bump @types/ember\_\_routing from 4.0.10 to 4.0.11 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#383](https://github.com/lblod/ember-rdfa-editor/pull/383) build(deps-dev): bump @types/ember\_\_application from 4.0.1 to 4.0.2 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#381](https://github.com/lblod/ember-rdfa-editor/pull/381) build(deps): bump @codemirror/lang-html from 6.1.1 to 6.1.2 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#347](https://github.com/lblod/ember-rdfa-editor/pull/347) build(deps-dev): bump ember-template-lint from 3.16.0 to 4.14.0 ([@dependabot[bot]](https://github.com/apps/dependabot))

#### Committers: 3

- Arne Bertrand ([@abeforgit](https://github.com/abeforgit))
- Elena Poelman ([@elpoelma](https://github.com/elpoelma))
- Niels V ([@nvdk](https://github.com/nvdk))

## vv1.0.0-alpha.1 (2022-09-12)

#### :boom: Breaking Change

- [#310](https://github.com/lblod/ember-rdfa-editor/pull/310) Transactional Edits ([@abeforgit](https://github.com/abeforgit))

#### :rocket: Enhancement

- [#301](https://github.com/lblod/ember-rdfa-editor/pull/301) Internal/tree diffing ([@elpoelma](https://github.com/elpoelma))

#### :house: Internal

- [#306](https://github.com/lblod/ember-rdfa-editor/pull/306) Merge latest dev, Remove non-TEDI code, cleanup types&tests, rework commands ([@abeforgit](https://github.com/abeforgit))
- [#307](https://github.com/lblod/ember-rdfa-editor/pull/307) Feature/transactional api steps ([@elpoelma](https://github.com/elpoelma))
- [#302](https://github.com/lblod/ember-rdfa-editor/pull/302) Improve selection handler ([@elpoelma](https://github.com/elpoelma))

#### Committers: 2

- Arne Bertrand ([@abeforgit](https://github.com/abeforgit))
- Elena Poelman ([@elpoelma](https://github.com/elpoelma))

## 1.0.0-alpha.2 (2022-09-12)

## v1.0.0-alpha.1 (2022-09-12)

#### :boom: Breaking Change

- [#310](https://github.com/lblod/ember-rdfa-editor/pull/310) Transactional Edits ([@abeforgit](https://github.com/abeforgit))

#### :rocket: Enhancement

- [#301](https://github.com/lblod/ember-rdfa-editor/pull/301) Internal/tree diffing ([@elpoelma](https://github.com/elpoelma))

#### :house: Internal

- [#344](https://github.com/lblod/ember-rdfa-editor/pull/344) build(deps-dev): bump ember-cli-sass from 10.0.1 to 11.0.1 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#306](https://github.com/lblod/ember-rdfa-editor/pull/306) Merge latest dev, Remove non-TEDI code, cleanup types&tests, rework commands ([@abeforgit](https://github.com/abeforgit))
- [#307](https://github.com/lblod/ember-rdfa-editor/pull/307) Feature/transactional api steps ([@elpoelma](https://github.com/elpoelma))
- [#302](https://github.com/lblod/ember-rdfa-editor/pull/302) Improve selection handler ([@elpoelma](https://github.com/elpoelma))

#### Committers: 2

- Arne Bertrand ([@abeforgit](https://github.com/abeforgit))
- Elena Poelman ([@elpoelma](https://github.com/elpoelma))

## 0.65.0 (2022-11-23)

#### :boom: Breaking Change

- [#468](https://github.com/lblod/ember-rdfa-editor/pull/468) Update ember-appuniversum to v2 ([@Windvis](https://github.com/Windvis))

#### :house: Internal

- [#480](https://github.com/lblod/ember-rdfa-editor/pull/480) build(deps): bump engine.io from 6.2.0 to 6.2.1 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#475](https://github.com/lblod/ember-rdfa-editor/pull/475) build(deps-dev): bump eslint from 8.27.0 to 8.28.0 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#469](https://github.com/lblod/ember-rdfa-editor/pull/469) build(deps): bump @codemirror/lang-html from 6.1.4 to 6.2.0 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#466](https://github.com/lblod/ember-rdfa-editor/pull/466) build(deps): bump @codemirror/view from 6.5.0 to 6.5.1 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#464](https://github.com/lblod/ember-rdfa-editor/pull/464) build(deps-dev): bump @appuniversum/ember-appuniversum from 1.9.0 to 1.10.0 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#457](https://github.com/lblod/ember-rdfa-editor/pull/457) build(deps-dev): bump typescript from 4.8.4 to 4.9.3 ([@dependabot[bot]](https://github.com/apps/dependabot))

#### Committers: 1

- Sam Van Campenhout ([@Windvis](https://github.com/Windvis))

## 0.64.0 (2022-11-15)

#### :boom: Breaking Change

- [#455](https://github.com/lblod/ember-rdfa-editor/pull/455) Inline components: serializable properties ([@elpoelma](https://github.com/elpoelma))

#### :rocket: Enhancement

- [#455](https://github.com/lblod/ember-rdfa-editor/pull/455) Inline components: serializable properties ([@elpoelma](https://github.com/elpoelma))

#### :house: Internal

- [#456](https://github.com/lblod/ember-rdfa-editor/pull/456) Remove unnecessary read in htmlContent method ([@elpoelma](https://github.com/elpoelma))

#### Committers: 1

- Elena Poelman ([@elpoelma](https://github.com/elpoelma))

## 0.63.8 (2022-11-15)

#### :house: Internal

- [#454](https://github.com/lblod/ember-rdfa-editor/pull/454) fix(deps): use proper versions of the @types packages ([@abeforgit](https://github.com/abeforgit))
- [#448](https://github.com/lblod/ember-rdfa-editor/pull/448) build(deps-dev): bump eslint-plugin-qunit from 7.3.1 to 7.3.2 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#450](https://github.com/lblod/ember-rdfa-editor/pull/450) build(deps-dev): bump @appuniversum/ember-appuniversum from 1.8.2 to 1.9.0 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#447](https://github.com/lblod/ember-rdfa-editor/pull/447) build(deps): bump @codemirror/view from 6.4.0 to 6.4.1 ([@dependabot[bot]](https://github.com/apps/dependabot))

#### Committers: 1

- Arne Bertrand ([@abeforgit](https://github.com/abeforgit))

## 0.63.7 (2022-11-04)

#### :bug: Bug Fix

- [#443](https://github.com/lblod/ember-rdfa-editor/pull/443) Refresh inline components after model read ([@elpoelma](https://github.com/elpoelma))

#### :house: Internal

- [#444](https://github.com/lblod/ember-rdfa-editor/pull/444) Remove unnecessary read on mouseup ([@elpoelma](https://github.com/elpoelma))
- [#442](https://github.com/lblod/ember-rdfa-editor/pull/442) build(deps-dev): bump @types/ember\_\_polyfills from 4.0.0 to 4.0.1 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#441](https://github.com/lblod/ember-rdfa-editor/pull/441) build(deps-dev): bump @types/ember\_\_engine from 4.0.2 to 4.0.3 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#440](https://github.com/lblod/ember-rdfa-editor/pull/440) build(deps-dev): bump @types/ember\_\_test-helpers from 2.8.1 to 2.8.2 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#439](https://github.com/lblod/ember-rdfa-editor/pull/439) build(deps-dev): bump @types/ember\_\_runloop from 4.0.1 to 4.0.2 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#438](https://github.com/lblod/ember-rdfa-editor/pull/438) build(deps-dev): bump @types/ember\_\_template from 4.0.0 to 4.0.1 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#433](https://github.com/lblod/ember-rdfa-editor/pull/433) build(deps-dev): bump eslint-plugin-ember from 11.1.0 to 11.2.0 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#434](https://github.com/lblod/ember-rdfa-editor/pull/434) build(deps-dev): bump @types/ember\_\_component from 4.0.10 to 4.0.11 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#435](https://github.com/lblod/ember-rdfa-editor/pull/435) build(deps-dev): bump @types/ember\_\_application from 4.0.2 to 4.0.3 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#436](https://github.com/lblod/ember-rdfa-editor/pull/436) build(deps-dev): bump @types/ember\_\_routing from 4.0.11 to 4.0.12 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#437](https://github.com/lblod/ember-rdfa-editor/pull/437) build(deps-dev): bump @types/ember\_\_controller from 4.0.2 to 4.0.3 ([@dependabot[bot]](https://github.com/apps/dependabot))

#### Committers: 1

- Elena Poelman ([@elpoelma](https://github.com/elpoelma))

## 0.63.6 (2022-10-27)

#### :house: Internal

- [#429](https://github.com/lblod/ember-rdfa-editor/pull/429) build(deps-dev): bump @types/ember\_\_utils from 4.0.1 to 4.0.2 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#428](https://github.com/lblod/ember-rdfa-editor/pull/428) build(deps-dev): bump @types/ember\_\_array from 4.0.2 to 4.0.3 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#427](https://github.com/lblod/ember-rdfa-editor/pull/427) build(deps-dev): bump @typescript-eslint/parser from 5.40.1 to 5.41.0 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#426](https://github.com/lblod/ember-rdfa-editor/pull/426) build(deps-dev): bump @types/ember-resolver from 5.0.11 to 5.0.12 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#432](https://github.com/lblod/ember-rdfa-editor/pull/432) build(deps): bump ember-cli-typescript from 5.1.1 to 5.2.1 ([@dependabot[bot]](https://github.com/apps/dependabot))

## 0.63.5 (2022-10-26)

#### :bug: Bug Fix

- [#398](https://github.com/lblod/ember-rdfa-editor/pull/398) Bugfix: inline component reload ([@elpoelma](https://github.com/elpoelma))

#### :house: Internal

- [#425](https://github.com/lblod/ember-rdfa-editor/pull/425) build(deps): bump @codemirror/lang-html from 6.1.2 to 6.1.3 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#424](https://github.com/lblod/ember-rdfa-editor/pull/424) build(deps): bump @codemirror/lang-xml from 6.0.0 to 6.0.1 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#423](https://github.com/lblod/ember-rdfa-editor/pull/423) build(deps-dev): bump @typescript-eslint/eslint-plugin from 5.40.1 to 5.41.0 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#422](https://github.com/lblod/ember-rdfa-editor/pull/422) build(deps-dev): bump qunit from 2.19.2 to 2.19.3 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#421](https://github.com/lblod/ember-rdfa-editor/pull/421) build(deps-dev): bump eslint from 8.25.0 to 8.26.0 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#420](https://github.com/lblod/ember-rdfa-editor/pull/420) build(deps-dev): bump @types/ember\_\_controller from 4.0.1 to 4.0.2 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#419](https://github.com/lblod/ember-rdfa-editor/pull/419) build(deps): bump @codemirror/view from 6.3.1 to 6.4.0 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#418](https://github.com/lblod/ember-rdfa-editor/pull/418) build(deps-dev): bump eslint-plugin-ember from 11.0.6 to 11.1.0 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#417](https://github.com/lblod/ember-rdfa-editor/pull/417) build(deps-dev): bump ember-template-lint from 4.15.0 to 4.16.1 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#413](https://github.com/lblod/ember-rdfa-editor/pull/413) build(deps-dev): bump @appuniversum/ember-appuniversum from 1.8.1 to 1.8.2 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#412](https://github.com/lblod/ember-rdfa-editor/pull/412) build(deps-dev): bump @typescript-eslint/parser from 5.40.0 to 5.40.1 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#411](https://github.com/lblod/ember-rdfa-editor/pull/411) build(deps): bump ember-auto-import from 2.4.2 to 2.4.3 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#414](https://github.com/lblod/ember-rdfa-editor/pull/414) build(deps-dev): bump @typescript-eslint/eslint-plugin from 5.40.0 to 5.40.1 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#415](https://github.com/lblod/ember-rdfa-editor/pull/415) build(deps-dev): bump qunit from 2.19.1 to 2.19.2 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#408](https://github.com/lblod/ember-rdfa-editor/pull/408) build(deps-dev): bump @typescript-eslint/eslint-plugin from 5.39.0 to 5.40.0 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#409](https://github.com/lblod/ember-rdfa-editor/pull/409) build(deps): bump @xmldom/xmldom from 0.8.2 to 0.8.3 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#407](https://github.com/lblod/ember-rdfa-editor/pull/407) build(deps-dev): bump ember-template-lint from 4.14.0 to 4.15.0 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#406](https://github.com/lblod/ember-rdfa-editor/pull/406) build(deps): bump @codemirror/view from 6.3.0 to 6.3.1 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#405](https://github.com/lblod/ember-rdfa-editor/pull/405) build(deps-dev): bump @typescript-eslint/parser from 5.39.0 to 5.40.0 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#403](https://github.com/lblod/ember-rdfa-editor/pull/403) build(deps-dev): bump eslint from 8.24.0 to 8.25.0 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#402](https://github.com/lblod/ember-rdfa-editor/pull/402) build(deps-dev): bump ember-qunit from 5.1.5 to 6.0.0 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#401](https://github.com/lblod/ember-rdfa-editor/pull/401) build(deps-dev): bump @appuniversum/ember-appuniversum from 1.8.0 to 1.8.1 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#395](https://github.com/lblod/ember-rdfa-editor/pull/395) build(deps-dev): bump ember-cli from 3.28.5 to 3.28.6 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#394](https://github.com/lblod/ember-rdfa-editor/pull/394) build(deps-dev): bump @typescript-eslint/eslint-plugin from 5.38.1 to 5.39.0 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#393](https://github.com/lblod/ember-rdfa-editor/pull/393) build(deps-dev): bump release-it from 15.4.2 to 15.5.0 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#392](https://github.com/lblod/ember-rdfa-editor/pull/392) build(deps-dev): bump sinon from 14.0.0 to 14.0.1 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#391](https://github.com/lblod/ember-rdfa-editor/pull/391) build(deps-dev): bump @typescript-eslint/parser from 5.38.1 to 5.39.0 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#384](https://github.com/lblod/ember-rdfa-editor/pull/384) Chore/cleanup feature flags ([@nvdk](https://github.com/nvdk))
- [#387](https://github.com/lblod/ember-rdfa-editor/pull/387) build(deps-dev): bump @appuniversum/ember-appuniversum from 1.7.0 to 1.8.0 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#382](https://github.com/lblod/ember-rdfa-editor/pull/382) build(deps-dev): bump @types/ember\_\_routing from 4.0.10 to 4.0.11 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#383](https://github.com/lblod/ember-rdfa-editor/pull/383) build(deps-dev): bump @types/ember\_\_application from 4.0.1 to 4.0.2 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#381](https://github.com/lblod/ember-rdfa-editor/pull/381) build(deps): bump @codemirror/lang-html from 6.1.1 to 6.1.2 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#347](https://github.com/lblod/ember-rdfa-editor/pull/347) build(deps-dev): bump ember-template-lint from 3.16.0 to 4.14.0 ([@dependabot[bot]](https://github.com/apps/dependabot))

#### Committers: 3

- Elena Poelman ([@elpoelma](https://github.com/elpoelma))
- Niels V ([@nvdk](https://github.com/nvdk))
- [@usrtim](https://github.com/usrtim)

## 0.63.4 (2022-09-29)

#### :bug: Bug Fix

- [#376](https://github.com/lblod/ember-rdfa-editor/pull/376) fix(selection-handler): handle cases where selection is empty ([@abeforgit](https://github.com/abeforgit))

#### :house: Internal

- [#380](https://github.com/lblod/ember-rdfa-editor/pull/380) build(deps-dev): bump @types/qunit from 2.19.2 to 2.19.3 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#379](https://github.com/lblod/ember-rdfa-editor/pull/379) build(deps-dev): bump @typescript-eslint/eslint-plugin from 5.37.0 to 5.38.1 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#378](https://github.com/lblod/ember-rdfa-editor/pull/378) build(deps-dev): bump sass from 1.54.9 to 1.55.0 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#377](https://github.com/lblod/ember-rdfa-editor/pull/377) build(deps-dev): bump typescript from 4.8.3 to 4.8.4 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#375](https://github.com/lblod/ember-rdfa-editor/pull/375) build(deps): bump @codemirror/state from 6.1.1 to 6.1.2 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#374](https://github.com/lblod/ember-rdfa-editor/pull/374) build(deps): bump @codemirror/view from 6.2.5 to 6.3.0 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#371](https://github.com/lblod/ember-rdfa-editor/pull/371) build(deps-dev): bump eslint from 8.22.0 to 8.24.0 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#372](https://github.com/lblod/ember-rdfa-editor/pull/372) build(deps-dev): bump @types/ember-qunit from 5.0.1 to 5.0.2 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#370](https://github.com/lblod/ember-rdfa-editor/pull/370) build(deps): bump mout from 1.2.3 to 1.2.4 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#369](https://github.com/lblod/ember-rdfa-editor/pull/369) build(deps): bump iter-tools from 7.4.0 to 7.5.0 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#368](https://github.com/lblod/ember-rdfa-editor/pull/368) build(deps-dev): bump @typescript-eslint/parser from 5.37.0 to 5.38.1 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#367](https://github.com/lblod/ember-rdfa-editor/pull/367) build(deps): bump @codemirror/view from 6.2.3 to 6.2.5 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#366](https://github.com/lblod/ember-rdfa-editor/pull/366) build(deps-dev): bump @appuniversum/ember-appuniversum from 1.6.0 to 1.7.0 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#360](https://github.com/lblod/ember-rdfa-editor/pull/360) build(deps-dev): bump release-it from 15.4.1 to 15.4.2 ([@dependabot[bot]](https://github.com/apps/dependabot))

#### Committers: 1

- Arne Bertrand ([@abeforgit](https://github.com/abeforgit))

## 0.63.3 (2022-09-20)

#### :bug: Bug Fix

- [#363](https://github.com/lblod/ember-rdfa-editor/pull/363) Remove tracked array from inline components registry ([@elpoelma](https://github.com/elpoelma))

#### :house: Internal

- [#362](https://github.com/lblod/ember-rdfa-editor/pull/362) Implement htmlContent setter and getter on the RawEditorController ([@elpoelma](https://github.com/elpoelma))

#### Committers: 1

- Elena Poelman ([@elpoelma](https://github.com/elpoelma))

## 0.63.2 (2022-09-13)

#### :house: Internal

- [#354](https://github.com/lblod/ember-rdfa-editor/pull/354) build(deps-dev): bump @typescript-eslint/parser from 5.36.2 to 5.37.0 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#357](https://github.com/lblod/ember-rdfa-editor/pull/357) build(deps-dev): bump typescript from 4.8.2 to 4.8.3 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#356](https://github.com/lblod/ember-rdfa-editor/pull/356) build(deps-dev): bump @typescript-eslint/eslint-plugin from 5.36.2 to 5.37.0 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#353](https://github.com/lblod/ember-rdfa-editor/pull/353) build(deps): bump tracked-built-ins from 2.0.1 to 3.1.0 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#352](https://github.com/lblod/ember-rdfa-editor/pull/352) build(deps-dev): bump ember-page-title from 6.2.2 to 7.0.0 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#348](https://github.com/lblod/ember-rdfa-editor/pull/348) build(deps): bump ember-concurrency from 2.3.6 to 2.3.7 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#351](https://github.com/lblod/ember-rdfa-editor/pull/351) build(deps-dev): bump sass from 1.54.8 to 1.54.9 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#350](https://github.com/lblod/ember-rdfa-editor/pull/350) build(deps): bump @codemirror/view from ddac2d27f42839dc3d84f46ef8bc65d1a99c3140 to 6.2.3 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#349](https://github.com/lblod/ember-rdfa-editor/pull/349) build(deps): bump ember-cli-htmlbars from 6.1.0 to 6.1.1 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#344](https://github.com/lblod/ember-rdfa-editor/pull/344) build(deps-dev): bump ember-cli-sass from 10.0.1 to 11.0.1 ([@dependabot[bot]](https://github.com/apps/dependabot))

## 0.63.1 (2022-09-07)

#### :house: Internal

- [#342](https://github.com/lblod/ember-rdfa-editor/pull/342) build(deps-dev): bump eslint-plugin-ember from 10.6.1 to 11.0.6 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#340](https://github.com/lblod/ember-rdfa-editor/pull/340) Bump eslint-plugin-qunit from 7.2.0 to 7.3.1 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#339](https://github.com/lblod/ember-rdfa-editor/pull/339) Bump @types/sinon from 10.0.11 to 10.0.13 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#338](https://github.com/lblod/ember-rdfa-editor/pull/338) Bump @embroider/test-setup from 1.6.0 to 1.8.3 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#341](https://github.com/lblod/ember-rdfa-editor/pull/341) Update to new codemirror name and fix associated problems ([@abeforgit](https://github.com/abeforgit))
- [#337](https://github.com/lblod/ember-rdfa-editor/pull/337) Bump prettier from 2.6.2 to 2.7.1 ([@dependabot[bot]](https://github.com/apps/dependabot))

#### Committers: 1

- Arne Bertrand ([@abeforgit](https://github.com/abeforgit))

## 0.63.0 (2022-09-07)

#### :boom: Breaking Change

- [#319](https://github.com/lblod/ember-rdfa-editor/pull/319) Fix/ember appuniversum ([@abeforgit](https://github.com/abeforgit))

#### :house: Internal

- [#336](https://github.com/lblod/ember-rdfa-editor/pull/336) Bump parse-path, release-it and release-it-lerna-changelog ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#333](https://github.com/lblod/ember-rdfa-editor/pull/333) Bump @typescript-eslint/parser from 5.22.0 to 5.36.2 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#332](https://github.com/lblod/ember-rdfa-editor/pull/332) Bump ember-cli-typescript from 5.1.0 to 5.1.1 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#330](https://github.com/lblod/ember-rdfa-editor/pull/330) Bump @types/ember\_\_utils from 4.0.0 to 4.0.1 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#329](https://github.com/lblod/ember-rdfa-editor/pull/329) Bump @types/ember\_\_array from 4.0.1 to 4.0.2 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#326](https://github.com/lblod/ember-rdfa-editor/pull/326) Bump @types/ember\_\_engine from 4.0.0 to 4.0.2 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#328](https://github.com/lblod/ember-rdfa-editor/pull/328) Bump @types/ember from 4.0.0 to 4.0.1 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#327](https://github.com/lblod/ember-rdfa-editor/pull/327) Bump prettier from 2.6.2 to 2.7.1 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#325](https://github.com/lblod/ember-rdfa-editor/pull/325) Bump sinon from 13.0.2 to 14.0.0 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#320](https://github.com/lblod/ember-rdfa-editor/pull/320) Bump ember-cli-htmlbars from 5.7.2 to 6.1.0 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#324](https://github.com/lblod/ember-rdfa-editor/pull/324) Bump ember-cli-autoprefixer from 1.0.3 to 2.0.0 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#323](https://github.com/lblod/ember-rdfa-editor/pull/323) Bump @embroider/test-setup from 1.6.0 to 1.8.3 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#321](https://github.com/lblod/ember-rdfa-editor/pull/321) Bump @typescript-eslint/eslint-plugin from 5.22.0 to 5.36.2 ([@dependabot[bot]](https://github.com/apps/dependabot))

#### Committers: 1

- Arne Bertrand ([@abeforgit](https://github.com/abeforgit))

## 0.62.2 (2022-09-06)

#### :bug: Bug Fix

- [#318](https://github.com/lblod/ember-rdfa-editor/pull/318) Modify emit order of selectionChangedEvents and modelReadEvents ([@elpoelma](https://github.com/elpoelma))

#### :memo: Documentation

- [#315](https://github.com/lblod/ember-rdfa-editor/pull/315) RFC: Efficient datastore calculations ([@abeforgit](https://github.com/abeforgit))
- [#314](https://github.com/lblod/ember-rdfa-editor/pull/314) RFC: ModelNode rework ([@abeforgit](https://github.com/abeforgit))
- [#311](https://github.com/lblod/ember-rdfa-editor/pull/311) RFC: Transactional Edits ([@abeforgit](https://github.com/abeforgit))

#### Committers: 2

- Arne Bertrand ([@abeforgit](https://github.com/abeforgit))
- Elena Poelman ([@elpoelma](https://github.com/elpoelma))

## 0.62.1 (2022-09-05)

#### :bug: Bug Fix

- [#316](https://github.com/lblod/ember-rdfa-editor/pull/316) Fix getRdfaAttributes() behaviour ([@elpoelma](https://github.com/elpoelma))

#### Committers: 1

- Elena Poelman ([@elpoelma](https://github.com/elpoelma))

## 0.62.0 (2022-09-01)

#### :boom: Breaking Change

- [#312](https://github.com/lblod/ember-rdfa-editor/pull/312) Replace selection arg by range arg in insert-component-command ([@elpoelma](https://github.com/elpoelma))

#### :rocket: Enhancement

- [#313](https://github.com/lblod/ember-rdfa-editor/pull/313) Improved inline components management ([@elpoelma](https://github.com/elpoelma))

#### :bug: Bug Fix

- [#312](https://github.com/lblod/ember-rdfa-editor/pull/312) Replace selection arg by range arg in insert-component-command ([@elpoelma](https://github.com/elpoelma))

#### Committers: 1

- Elena Poelman ([@elpoelma](https://github.com/elpoelma))

## 0.61.1 (2022-08-12)

#### :bug: Bug Fix

- [#309](https://github.com/lblod/ember-rdfa-editor/pull/309) Remove the appuniversum SASS includePath ([@Windvis](https://github.com/Windvis))

#### Committers: 1

- Sam Van Campenhout ([@Windvis](https://github.com/Windvis))

## 0.61.0 (2022-08-12)

#### :bug: Bug Fix

- [#303](https://github.com/lblod/ember-rdfa-editor/pull/303) Reduce selectionChanged events ([@elpoelma](https://github.com/elpoelma))
- [#304](https://github.com/lblod/ember-rdfa-editor/pull/304) Fix/lump node plugin selection ([@elpoelma](https://github.com/elpoelma))

#### :house: Internal

- [#308](https://github.com/lblod/ember-rdfa-editor/pull/308) Bump used node version and builder image ([@abeforgit](https://github.com/abeforgit))
- [#305](https://github.com/lblod/ember-rdfa-editor/pull/305) Bump terser from 4.8.0 to 4.8.1 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#300](https://github.com/lblod/ember-rdfa-editor/pull/300) Replace ix by itertools ([@elpoelma](https://github.com/elpoelma))

#### Committers: 2

- Arne Bertrand ([@abeforgit](https://github.com/abeforgit))
- Elena Poelman ([@elpoelma](https://github.com/elpoelma))

## 0.61.0-0 (2022-07-15)

#### :rocket: Enhancement

- [#286](https://github.com/lblod/ember-rdfa-editor/pull/286) Vdom-based deletion ([@Asergey91](https://github.com/Asergey91))
- [#288](https://github.com/lblod/ember-rdfa-editor/pull/288) Feature/tab handler vdom ([@abeforgit](https://github.com/abeforgit))

#### Committers: 2

- Arne Bertrand ([@abeforgit](https://github.com/abeforgit))
- Sergey Andreev ([@Asergey91](https://github.com/Asergey91))

## 0.60.5 (2022-07-14)

#### :rocket: Enhancement

- [#299](https://github.com/lblod/ember-rdfa-editor/pull/299) Enabling reload of plugins ([@elpoelma](https://github.com/elpoelma))

#### :bug: Bug Fix

- [#298](https://github.com/lblod/ember-rdfa-editor/pull/298) Use GentreeWalker in make-list-command ([@elpoelma](https://github.com/elpoelma))

#### Committers: 1

- Elena Poelman ([@elpoelma](https://github.com/elpoelma))

## 0.60.4 (2022-07-13)

#### :rocket: Enhancement

- [#297](https://github.com/lblod/ember-rdfa-editor/pull/297) Allow plugins to send arguments to their components ([@abeforgit](https://github.com/abeforgit))

#### Committers: 1

- Arne Bertrand ([@abeforgit](https://github.com/abeforgit))

## 0.60.3 (2022-07-11)

#### :bug: Bug Fix

- [#294](https://github.com/lblod/ember-rdfa-editor/pull/294) when storing the previous selection, clone the anchor nodes ([@elpoelma](https://github.com/elpoelma))
- [#296](https://github.com/lblod/ember-rdfa-editor/pull/296) Remove erroneous check to avoid duplicate selectionchange events ([@abeforgit](https://github.com/abeforgit))
- [#293](https://github.com/lblod/ember-rdfa-editor/pull/293) Null check on the parent of the range in live mark set ([@elpoelma](https://github.com/elpoelma))

#### Committers: 2

- Arne Bertrand ([@abeforgit](https://github.com/abeforgit))
- Elena Poelman ([@elpoelma](https://github.com/elpoelma))

## 0.60.2 (2022-07-08)

#### :bug: Bug Fix

- [#295](https://github.com/lblod/ember-rdfa-editor/pull/295) Insert empty space when inserting an li above another one ([@elpoelma](https://github.com/elpoelma))

#### :house: Internal

- [#292](https://github.com/lblod/ember-rdfa-editor/pull/292) Bump parse-url from 6.0.0 to 6.0.2 ([@dependabot[bot]](https://github.com/apps/dependabot))

#### Committers: 1

- Elena Poelman ([@elpoelma](https://github.com/elpoelma))

## 0.60.1 (2022-07-07)

#### :rocket: Enhancement

- [#291](https://github.com/lblod/ember-rdfa-editor/pull/291) Pass options object to plugins ([@abeforgit](https://github.com/abeforgit))
- [#287](https://github.com/lblod/ember-rdfa-editor/pull/287) Article plugin styling ([@Dietr](https://github.com/Dietr))

#### :bug: Bug Fix

- [#290](https://github.com/lblod/ember-rdfa-editor/pull/290) Fix cursor behavior in empty lists ([@abeforgit](https://github.com/abeforgit))
- [#289](https://github.com/lblod/ember-rdfa-editor/pull/289) fixed issue where insert a list a the end of line caused the insertion of a newline ([@elpoelma](https://github.com/elpoelma))

#### Committers: 3

- Arne Bertrand ([@abeforgit](https://github.com/abeforgit))
- Dieter Peirs ([@Dietr](https://github.com/Dietr))
- Elena Poelman ([@elpoelma](https://github.com/elpoelma))

## 0.60.0 (2022-06-30)

#### :rocket: Enhancement

- [#284](https://github.com/lblod/ember-rdfa-editor/pull/284) Feature/inline components ([@elpoelma](https://github.com/elpoelma))
- [#271](https://github.com/lblod/ember-rdfa-editor/pull/271) Feature/better remove algo ([@Asergey91](https://github.com/Asergey91))

#### :bug: Bug Fix

- [#283](https://github.com/lblod/ember-rdfa-editor/pull/283) modified the lists sample data so it contains valid html ([@elpoelma](https://github.com/elpoelma))
- [#282](https://github.com/lblod/ember-rdfa-editor/pull/282) Fix/tree walker ([@elpoelma](https://github.com/elpoelma))
- [#281](https://github.com/lblod/ember-rdfa-editor/pull/281) fix dissappearing nodes in text writer ([@elpoelma](https://github.com/elpoelma))

#### :memo: Documentation

- [#176](https://github.com/lblod/ember-rdfa-editor/pull/176) [RFC] ember-rdfa-editor stage 1 ([@abeforgit](https://github.com/abeforgit))

#### Committers: 4

- Arne Bertrand ([@abeforgit](https://github.com/abeforgit))
- Elena Poelman ([@elpoelma](https://github.com/elpoelma))
- Sam Van Campenhout ([@Windvis](https://github.com/Windvis))
- Sergey Andreev ([@Asergey91](https://github.com/Asergey91))

## 0.59.1 (2022-06-08)

fix issues with disappearing text nodes after inserting newlines

## 0.59.0 (2022-05-27)

#### :rocket: Enhancement

- [#269](https://github.com/lblod/ember-rdfa-editor/pull/269) implemented merging of marks on adjacent text nodes ([@elpoelma](https://github.com/elpoelma))

#### :bug: Bug Fix

- [#277](https://github.com/lblod/ember-rdfa-editor/pull/277) Bug/fix copy ([@abeforgit](https://github.com/abeforgit))
- [#274](https://github.com/lblod/ember-rdfa-editor/pull/274) Bug/editor-initialization ([@abeforgit](https://github.com/abeforgit))

#### Committers: 2

- Arne Bertrand ([@abeforgit](https://github.com/abeforgit))
- Elena Poelman ([@elpoelma](https://github.com/elpoelma))

## 0.58.1 (2022-05-23)

#### :bug: Bug Fix

- [#275](https://github.com/lblod/ember-rdfa-editor/pull/275) Fix error this.app is not defined on loket ([@lagartoverde](https://github.com/lagartoverde))
- [#270](https://github.com/lblod/ember-rdfa-editor/pull/270) Make sidebar min-height same as window height ([@Dietr](https://github.com/Dietr))

#### Committers: 2

- Dieter Peirs ([@Dietr](https://github.com/Dietr))
- Oscar Rodriguez Villalobos ([@lagartoverde](https://github.com/lagartoverde))

## 0.58.0 (2022-05-16)

#### :rocket: Enhancement

- [#267](https://github.com/lblod/ember-rdfa-editor/pull/267) Addition of a loading indicator when the editor has not yet fully loaded ([@elpoelma](https://github.com/elpoelma))
- [#264](https://github.com/lblod/ember-rdfa-editor/pull/264) Ember upgrade to v3.28 and others ([@benjay10](https://github.com/benjay10))
- [#266](https://github.com/lblod/ember-rdfa-editor/pull/266) Rework styling of mark-highlight-manual and codelist highlight ([@Dietr](https://github.com/Dietr))
- [#263](https://github.com/lblod/ember-rdfa-editor/pull/263) Remove dummy Say theming ([@benjay10](https://github.com/benjay10))
- [#265](https://github.com/lblod/ember-rdfa-editor/pull/265) Successful package upgrades ([@benjay10](https://github.com/benjay10))

#### :bug: Bug Fix

- [#272](https://github.com/lblod/ember-rdfa-editor/pull/272) rework backspace rdfa plugin to avoid some ts issues ([@nvdk](https://github.com/nvdk))

#### :house: Internal

- [#268](https://github.com/lblod/ember-rdfa-editor/pull/268) Addition of the shiftedVisually method which determines a new position based on an existing position and a number of visual steps. ([@elpoelma](https://github.com/elpoelma))

#### Committers: 4

- Ben ([@benjay10](https://github.com/benjay10))
- Dieter Peirs ([@Dietr](https://github.com/Dietr))
- Elena Poelman ([@elpoelma](https://github.com/elpoelma))
- Niels V ([@nvdk](https://github.com/nvdk))

## 0.57.0 (2022-04-27)

#### :rocket: Enhancement

- [#262](https://github.com/lblod/ember-rdfa-editor/pull/262) feature/improved prefix handling ([@abeforgit](https://github.com/abeforgit))
- [#257](https://github.com/lblod/ember-rdfa-editor/pull/257) Enhancement/better handlers ([@nvdk](https://github.com/nvdk))
- [#256](https://github.com/lblod/ember-rdfa-editor/pull/256) widget redesign ([@Asergey91](https://github.com/Asergey91))

#### Committers: 3

- Arne Bertrand ([@abeforgit](https://github.com/abeforgit))
- Niels V ([@nvdk](https://github.com/nvdk))
- Sergey Andreev ([@Asergey91](https://github.com/Asergey91))

## 0.57.0-0 (2022-04-27)

#### :rocket: Enhancement

- [#262](https://github.com/lblod/ember-rdfa-editor/pull/262) feature/improved prefix handling ([@abeforgit](https://github.com/abeforgit))
- [#257](https://github.com/lblod/ember-rdfa-editor/pull/257) Enhancement/better handlers ([@nvdk](https://github.com/nvdk))
- [#256](https://github.com/lblod/ember-rdfa-editor/pull/256) widget redesign ([@Asergey91](https://github.com/Asergey91))

#### Committers: 3

- Arne Bertrand ([@abeforgit](https://github.com/abeforgit))
- Niels V ([@nvdk](https://github.com/nvdk))
- Sergey Andreev ([@Asergey91](https://github.com/Asergey91))

## 0.56.6 (2022-05-20)

fix types again

## 0.56.5 (2022-05-20)

Fix type issues preventing the build

## 0.56.4 (2022-05-20)

:bug: fix drone config

## 0.56.3 (2022-05-20)

#### :bug: Bug Fix

- [#273](https://github.com/lblod/ember-rdfa-editor/pull/273) Fix initialization issues ([@abeforgit](https://github.com/abeforgit))

#### Committers: 1

- Arne Bertrand ([@abeforgit](https://github.com/abeforgit))

## 0.56.2 (2022-04-27)

#### :bug: Bug Fix

- [#260](https://github.com/lblod/ember-rdfa-editor/pull/260) Fixed bug with making list at the end of the document ([@lagartoverde](https://github.com/lagartoverde))
- [#258](https://github.com/lblod/ember-rdfa-editor/pull/258) Fix bug that selection was wrong when creating en empty list ([@lagartoverde](https://github.com/lagartoverde))
- [#261](https://github.com/lblod/ember-rdfa-editor/pull/261) Fix textsearch on quads defined outside the root element ([@abeforgit](https://github.com/abeforgit))

#### Committers: 2

- Arne Bertrand ([@abeforgit](https://github.com/abeforgit))
- Oscar Rodriguez Villalobos ([@lagartoverde](https://github.com/lagartoverde))

## 0.56.1 (2022-04-25)

#### :bug: Bug Fix

- [#259](https://github.com/lblod/ember-rdfa-editor/pull/259) Fix collapsed selections not detecting marks correctly ([@abeforgit](https://github.com/abeforgit))

#### Committers: 1

- Arne Bertrand ([@abeforgit](https://github.com/abeforgit))

## 0.56.0 (2022-04-25)

#### :boom: Breaking Change

- [#232](https://github.com/lblod/ember-rdfa-editor/pull/232) Breaking/remove old plugin wiring ([@nvdk](https://github.com/nvdk))

#### :rocket: Enhancement

- [#249](https://github.com/lblod/ember-rdfa-editor/pull/249) Improved table insert, and column and row insert ([@benjay10](https://github.com/benjay10))

#### :bug: Bug Fix

- [#254](https://github.com/lblod/ember-rdfa-editor/pull/254) Fixed weird cases where the unindent button appeared without being available ([@lagartoverde](https://github.com/lagartoverde))
- [#255](https://github.com/lblod/ember-rdfa-editor/pull/255) improve whitespace collapsing ([@nvdk](https://github.com/nvdk))
- [#253](https://github.com/lblod/ember-rdfa-editor/pull/253) More consice removing of RDFa type ([@benjay10](https://github.com/benjay10))

#### Committers: 3

- Ben ([@benjay10](https://github.com/benjay10))
- Niels V ([@nvdk](https://github.com/nvdk))
- Oscar Rodriguez Villalobos ([@lagartoverde](https://github.com/lagartoverde))

## 0.55.2 (2022-04-08)

#### :bug: Bug Fix

- [#252](https://github.com/lblod/ember-rdfa-editor/pull/252) Fix space-eating issues ([@abeforgit](https://github.com/abeforgit))

#### Committers: 1

- Arne Bertrand ([@abeforgit](https://github.com/abeforgit))

## 0.55.1 (2022-04-07)

#### :bug: Bug fix

- [#251](https://github.com/lblod/ember-rdfa-editor/pull/251) Fix toolbar marks using wrong command arguments ([@abeforgit](https://github.com/abeforgit))

## 0.55.0 (2022-04-07)

#### :boom: Breaking Change

- [#250](https://github.com/lblod/ember-rdfa-editor/pull/250) Provide ranges per capture group ([@abeforgit](https://github.com/abeforgit))

#### :rocket: Enhancement

- [#250](https://github.com/lblod/ember-rdfa-editor/pull/250) Provide ranges per capture group ([@abeforgit](https://github.com/abeforgit))

#### Committers: 1

- Arne Bertrand ([@abeforgit](https://github.com/abeforgit))

## 0.54.0 (2022-04-05)

#### :boom: Breaking Change

- [#246](https://github.com/lblod/ember-rdfa-editor/pull/246) Implement self-updating regex-constrained sets of marks ([@abeforgit](https://github.com/abeforgit))

#### :rocket: Enhancement

- [#246](https://github.com/lblod/ember-rdfa-editor/pull/246) Implement self-updating regex-constrained sets of marks ([@abeforgit](https://github.com/abeforgit))

#### :bug: Bug Fix

- [#247](https://github.com/lblod/ember-rdfa-editor/pull/247) convert newlines to br elements when inserting text ([@nvdk](https://github.com/nvdk))

#### Committers: 2

- Arne Bertrand ([@abeforgit](https://github.com/abeforgit))
- Niels V ([@nvdk](https://github.com/nvdk))

## 0.53.0 (2022-04-05)

#### :rocket: Enhancement

- [#245](https://github.com/lblod/ember-rdfa-editor/pull/245) replace all special spaces when regular spaces when parsing html ([@nvdk](https://github.com/nvdk))

#### :house: Internal

- [#244](https://github.com/lblod/ember-rdfa-editor/pull/244) ran npm update ([@nvdk](https://github.com/nvdk))

#### Committers: 1

- Niels V ([@nvdk](https://github.com/nvdk))

## 0.52.1 (2022-04-01)

#### :bug: Bug Fix

- [#243](https://github.com/lblod/ember-rdfa-editor/pull/243) Fix object node matching ([@abeforgit](https://github.com/abeforgit))

#### Committers: 1

- Arne Bertrand ([@abeforgit](https://github.com/abeforgit))

## 0.52.0 (2022-03-30)

#### :rocket: Enhancement

- [#239](https://github.com/lblod/ember-rdfa-editor/pull/239) execute undo on VDOM ([@nvdk](https://github.com/nvdk))
- [#236](https://github.com/lblod/ember-rdfa-editor/pull/236) Implement incremental dom writing ([@abeforgit](https://github.com/abeforgit))

#### :bug: Bug Fix

- [#237](https://github.com/lblod/ember-rdfa-editor/pull/237) Fixing unindenting ([@benjay10](https://github.com/benjay10))

#### :house: Internal

- [#242](https://github.com/lblod/ember-rdfa-editor/pull/242) dev packages spring cleaning ([@nvdk](https://github.com/nvdk))
- [#240](https://github.com/lblod/ember-rdfa-editor/pull/240) add embroider test scenarios to ember try ([@nvdk](https://github.com/nvdk))
- [#241](https://github.com/lblod/ember-rdfa-editor/pull/241) bump ember-cli-app-version to 5.0.0 ([@nvdk](https://github.com/nvdk))
- [#238](https://github.com/lblod/ember-rdfa-editor/pull/238) bump ember-truth-helpers to 3.0.0 ([@nvdk](https://github.com/nvdk))
- [#230](https://github.com/lblod/ember-rdfa-editor/pull/230) Bump tar from 2.2.1 to 2.2.2 ([@dependabot[bot]](https://github.com/apps/dependabot))

#### Committers: 3

- Arne Bertrand ([@abeforgit](https://github.com/abeforgit))
- Ben ([@benjay10](https://github.com/benjay10))
- Niels V ([@nvdk](https://github.com/nvdk))

## 0.51.0 (2022-03-11)

#### :rocket: Enhancement

- [#231](https://github.com/lblod/ember-rdfa-editor/pull/231) debounce text input slightly ([@nvdk](https://github.com/nvdk))
- [#223](https://github.com/lblod/ember-rdfa-editor/pull/223) Enhancement/whitespace handling ([@nvdk](https://github.com/nvdk))

#### :bug: Bug Fix

- [#233](https://github.com/lblod/ember-rdfa-editor/pull/233) Fix bug with predicate node generation ([@abeforgit](https://github.com/abeforgit))
- [#234](https://github.com/lblod/ember-rdfa-editor/pull/234) Bug/mark attribute rendering ([@abeforgit](https://github.com/abeforgit))
- [#235](https://github.com/lblod/ember-rdfa-editor/pull/235) Fix list indentation ([@Dietr](https://github.com/Dietr))

#### :house: Internal

- [#229](https://github.com/lblod/ember-rdfa-editor/pull/229) Bump nanoid from 3.1.30 to 3.3.1 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#228](https://github.com/lblod/ember-rdfa-editor/pull/228) Bump follow-redirects from 1.14.5 to 1.14.9 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#227](https://github.com/lblod/ember-rdfa-editor/pull/227) Bump engine.io from 6.1.0 to 6.1.3 ([@dependabot[bot]](https://github.com/apps/dependabot))
- [#226](https://github.com/lblod/ember-rdfa-editor/pull/226) Bump node-fetch from 2.6.6 to 2.6.7 ([@dependabot[bot]](https://github.com/apps/dependabot))

#### Committers: 3

- Arne Bertrand ([@abeforgit](https://github.com/abeforgit))
- Dieter Peirs ([@Dietr](https://github.com/Dietr))
- Niels V ([@nvdk](https://github.com/nvdk))

## 0.50.0 (2022-02-25)

#### :rocket: Enhancement

- [#224](https://github.com/lblod/ember-rdfa-editor/pull/224) Add isEmpty utility method on resultset and term-mapping ([@abeforgit](https://github.com/abeforgit))

#### :bug: Bug Fix

- [#225](https://github.com/lblod/ember-rdfa-editor/pull/225) Make backspace handler trigger contentchanged event ([@abeforgit](https://github.com/abeforgit))

#### Committers: 1

- Arne Bertrand ([@abeforgit](https://github.com/abeforgit))

## 0.50.0-beta.10 (2022-02-25)

#### :boom: Breaking Change

- [#222](https://github.com/lblod/ember-rdfa-editor/pull/222) Provide a single stylesheet for the dummy app ([@Dietr](https://github.com/Dietr))

#### :rocket: Enhancement

- [#211](https://github.com/lblod/ember-rdfa-editor/pull/211) Improve datastore interface ([@abeforgit](https://github.com/abeforgit))

#### :house: Internal

- [#222](https://github.com/lblod/ember-rdfa-editor/pull/222) Provide a single stylesheet for the dummy app ([@Dietr](https://github.com/Dietr))

#### Committers: 2

- Arne Bertrand ([@abeforgit](https://github.com/abeforgit))
- Dieter Peirs ([@Dietr](https://github.com/Dietr))

If you bump to this release, also upgrade ember-appuniversum to 1.0.0 along with it

## 0.50.0-beta.9 (2022-02-16)

#### :boom: Breaking Change

- [#216](https://github.com/lblod/ember-rdfa-editor/pull/216) Don't export the debug component ([@abeforgit](https://github.com/abeforgit))

#### :rocket: Enhancement

- [#219](https://github.com/lblod/ember-rdfa-editor/pull/219) Implement text-matching command ([@abeforgit](https://github.com/abeforgit))
- [#214](https://github.com/lblod/ember-rdfa-editor/pull/214) Expose query utility on markset ([@abeforgit](https://github.com/abeforgit))

#### :bug: Bug Fix

- [#220](https://github.com/lblod/ember-rdfa-editor/pull/220) Fix dummy component import ([@abeforgit](https://github.com/abeforgit))
- [#216](https://github.com/lblod/ember-rdfa-editor/pull/216) Don't export the debug component ([@abeforgit](https://github.com/abeforgit))

#### :house: Internal

- [#218](https://github.com/lblod/ember-rdfa-editor/pull/218) Ember-appuniversum upgrade > 0.11.0 ([@Dietr](https://github.com/Dietr))

#### Committers: 3

- Arne Bertrand ([@abeforgit](https://github.com/abeforgit))
- Dieter Peirs ([@Dietr](https://github.com/Dietr))
- Niels V ([@nvdk](https://github.com/nvdk))

## 0.50.0-beta.8 (2022-02-11)

#### :bug: Bug Fix

- [#215](https://github.com/lblod/ember-rdfa-editor/pull/215) Dont update selection on setting marks ([@abeforgit](https://github.com/abeforgit))

#### Committers: 1

- Arne Bertrand ([@abeforgit](https://github.com/abeforgit))

## 0.50.0-beta.7 (2022-02-10)

#### :rocket: Enhancement

- [#212](https://github.com/lblod/ember-rdfa-editor/pull/212) Feature/set attribute in mutator ([@lagartoverde](https://github.com/lagartoverde))
- [#209](https://github.com/lblod/ember-rdfa-editor/pull/209) Feature: Marks and MarksRegistry ([@abeforgit](https://github.com/abeforgit))

#### :bug: Bug Fix

- [#213](https://github.com/lblod/ember-rdfa-editor/pull/213) Also recalculate datastore on model-read ([@abeforgit](https://github.com/abeforgit))

#### Committers: 2

- Arne Bertrand ([@abeforgit](https://github.com/abeforgit))
- Oscar Rodriguez Villalobos ([@lagartoverde](https://github.com/lagartoverde))

## 0.50.0-beta.6 (2022-01-27)

#### :bug: Bug Fix

- [#208](https://github.com/lblod/ember-rdfa-editor/pull/208) Needed support for @plugins on debug component ([@benjay10](https://github.com/benjay10))

#### Committers: 1

- Ben ([@benjay10](https://github.com/benjay10))

## 0.50.0-beta.5 (2022-01-26)

#### :rocket: Enhancement

- [#206](https://github.com/lblod/ember-rdfa-editor/pull/206) Feature/gn 3152 create a debug component for the rdfa editor ([@benjay10](https://github.com/benjay10))

#### :bug: Bug Fix

- [#207](https://github.com/lblod/ember-rdfa-editor/pull/207) moved hints logic to the editor component so it gets tracked ([@lagartoverde](https://github.com/lagartoverde))

#### :house: Internal

- [#200](https://github.com/lblod/ember-rdfa-editor/pull/200) bump docker ember image ([@nvdk](https://github.com/nvdk))

#### Committers: 3

- Ben ([@benjay10](https://github.com/benjay10))
- Niels V ([@nvdk](https://github.com/nvdk))
- Oscar Rodriguez Villalobos ([@lagartoverde](https://github.com/lagartoverde))

## 0.50.0-beta.4 (2022-01-19)

#### :rocket: Enhancement

- [#204](https://github.com/lblod/ember-rdfa-editor/pull/204) allow browser delete if the feature flag is enabled ([@nvdk](https://github.com/nvdk))

#### :bug: Bug Fix

- [#205](https://github.com/lblod/ember-rdfa-editor/pull/205) Fix broken datastore in prod ([@abeforgit](https://github.com/abeforgit))

#### Committers: 2

- Arne Bertrand ([@abeforgit](https://github.com/abeforgit))
- Niels V ([@nvdk](https://github.com/nvdk))

## 0.50.0-beta.3 (2022-01-18)

#### :bug: Bug Fix

- [#202](https://github.com/lblod/ember-rdfa-editor/pull/202) set field directly instead of using this.set ([@nvdk](https://github.com/nvdk))

#### :house: Internal

- [#195](https://github.com/lblod/ember-rdfa-editor/pull/195) Update eslint and various non-ember plugins to latest ([@abeforgit](https://github.com/abeforgit))

#### Committers: 2

- Arne Bertrand ([@abeforgit](https://github.com/abeforgit))
- Niels V ([@nvdk](https://github.com/nvdk))

## 0.50.0-beta.2 (2021-12-07)

#### :house: Internal

- [#198](https://github.com/lblod/ember-rdfa-editor/pull/198) Switch to using debug for logging ([@abeforgit](https://github.com/abeforgit))
- [#197](https://github.com/lblod/ember-rdfa-editor/pull/197) Bump codemirror packages to v0.19.x ([@abeforgit](https://github.com/abeforgit))
- [#194](https://github.com/lblod/ember-rdfa-editor/pull/194) Update types for ember-test-helper ([@abeforgit](https://github.com/abeforgit))
- [#193](https://github.com/lblod/ember-rdfa-editor/pull/193) Update typescript-eslint packages to v5.5.0 ([@abeforgit](https://github.com/abeforgit))
- [#192](https://github.com/lblod/ember-rdfa-editor/pull/192) Update ember to 3.24 ([@abeforgit](https://github.com/abeforgit))
- [#191](https://github.com/lblod/ember-rdfa-editor/pull/191) Update ember-try to 1.4.0 and drop support for old ember versions ([@abeforgit](https://github.com/abeforgit))

#### Committers: 1

- Arne Bertrand ([@abeforgit](https://github.com/abeforgit))

## 0.50.0-beta.1 (2021-12-03)

#### :rocket: Enhancement

- [#189](https://github.com/lblod/ember-rdfa-editor/pull/189) Expose termconverter on the datastore directly ([@abeforgit](https://github.com/abeforgit))

#### :bug: Bug Fix

- [#190](https://github.com/lblod/ember-rdfa-editor/pull/190) Fire selectionChanged event when needed ([@abeforgit](https://github.com/abeforgit))

#### :memo: Documentation

- [#188](https://github.com/lblod/ember-rdfa-editor/pull/188) Add a todo test for the limitToRange method ([@abeforgit](https://github.com/abeforgit))

#### Committers: 1

- Arne Bertrand ([@abeforgit](https://github.com/abeforgit))

## 0.50.0-beta.0 (2021-12-02)

#### :rocket: Enhancement

- [#185](https://github.com/lblod/ember-rdfa-editor/pull/185) Add the datastore api ([@abeforgit](https://github.com/abeforgit))

#### :house: Internal

- [#187](https://github.com/lblod/ember-rdfa-editor/pull/187) Add package lock ([@abeforgit](https://github.com/abeforgit))
- [#186](https://github.com/lblod/ember-rdfa-editor/pull/186) Update ember-appuniversum ([@Dietr](https://github.com/Dietr))

#### Committers: 2

- Arne Bertrand ([@abeforgit](https://github.com/abeforgit))
- Dieter Peirs ([@Dietr](https://github.com/Dietr))

## 0.49.0 (2021-11-26)

#### :rocket: Enhancement

- [#184](https://github.com/lblod/ember-rdfa-editor/pull/184) Use css variables ([@Dietr](https://github.com/Dietr))
- [#182](https://github.com/lblod/ember-rdfa-editor/pull/182) Add a more consistent and flexible treewalker ([@abeforgit](https://github.com/abeforgit))
- [#179](https://github.com/lblod/ember-rdfa-editor/pull/179) Extend and improve eventbus ([@abeforgit](https://github.com/abeforgit))

#### :bug: Bug Fix

- [#183](https://github.com/lblod/ember-rdfa-editor/pull/183) Bugfix: we should not have contenteditable tables exported outside the editor ([@Asergey91](https://github.com/Asergey91))

#### Committers: 3

- Arne Bertrand ([@abeforgit](https://github.com/abeforgit))
- Dieter Peirs ([@Dietr](https://github.com/Dietr))
- Sergey Andreev ([@Asergey91](https://github.com/Asergey91))

## 0.48.0 (2021-11-08)

#### :boom: Breaking Change

- [#159](https://github.com/lblod/ember-rdfa-editor/pull/159) faster and cleaner builds ([@nvdk](https://github.com/nvdk))

#### :rocket: Enhancement

- [#171](https://github.com/lblod/ember-rdfa-editor/pull/171) Add ember-appuniversum ([@Dietr](https://github.com/Dietr))
- [#159](https://github.com/lblod/ember-rdfa-editor/pull/159) faster and cleaner builds ([@nvdk](https://github.com/nvdk))
- [#140](https://github.com/lblod/ember-rdfa-editor/pull/140) Copy command ([@RobbeDP](https://github.com/RobbeDP))
- [#151](https://github.com/lblod/ember-rdfa-editor/pull/151) Disable dragstart ([@lagartoverde](https://github.com/lagartoverde))

#### :bug: Bug Fix

- [#178](https://github.com/lblod/ember-rdfa-editor/pull/178) Move get-config to real deps ([@abeforgit](https://github.com/abeforgit))
- [#157](https://github.com/lblod/ember-rdfa-editor/pull/157) Fix sass syntax error ([@abeforgit](https://github.com/abeforgit))
- [#150](https://github.com/lblod/ember-rdfa-editor/pull/150) Fix insert XML ([@RobbeDP](https://github.com/RobbeDP))

#### :house: Internal

- [#161](https://github.com/lblod/ember-rdfa-editor/pull/161) Feature/convert commands to mutators ([@lagartoverde](https://github.com/lagartoverde))
- [#162](https://github.com/lblod/ember-rdfa-editor/pull/162) it's recommended to use may-import-regenerator over babel polyfills ([@nvdk](https://github.com/nvdk))
- [#156](https://github.com/lblod/ember-rdfa-editor/pull/156) bump focus trap ([@nvdk](https://github.com/nvdk))
- [#152](https://github.com/lblod/ember-rdfa-editor/pull/152) moved set property command logic to the operation ([@lagartoverde](https://github.com/lagartoverde))
- [#147](https://github.com/lblod/ember-rdfa-editor/pull/147) Convert list helpers ([@RobbeDP](https://github.com/RobbeDP))

#### Committers: 5

- Arne Bertrand ([@abeforgit](https://github.com/abeforgit))
- Dieter Peirs ([@Dietr](https://github.com/Dietr))
- Niels V ([@nvdk](https://github.com/nvdk))
- Oscar Rodriguez Villalobos ([@lagartoverde](https://github.com/lagartoverde))
- Robbe De Proft ([@RobbeDP](https://github.com/RobbeDP))

## 0.47.0 (2021-08-31)

#### :rocket: Enhancement

- [#154](https://github.com/lblod/ember-rdfa-editor/pull/154) Collapse the selection upon initializing the editor ([@abeforgit](https://github.com/abeforgit))
- [#132](https://github.com/lblod/ember-rdfa-editor/pull/132) Cut command ([@RobbeDP](https://github.com/RobbeDP))

#### :bug: Bug Fix

- [#153](https://github.com/lblod/ember-rdfa-editor/pull/153) Add word break utility class ([@Dietr](https://github.com/Dietr))
- [#139](https://github.com/lblod/ember-rdfa-editor/pull/139) Refactor commands ([@RobbeDP](https://github.com/RobbeDP))
- [#134](https://github.com/lblod/ember-rdfa-editor/pull/134) Fix cursor behavior when using table dropdown menu ([@abeforgit](https://github.com/abeforgit))

#### :house: Internal

- [#141](https://github.com/lblod/ember-rdfa-editor/pull/141) Convert lump node methods to typescript ([@RobbeDP](https://github.com/RobbeDP))
- [#139](https://github.com/lblod/ember-rdfa-editor/pull/139) Refactor commands ([@RobbeDP](https://github.com/RobbeDP))
- [#138](https://github.com/lblod/ember-rdfa-editor/pull/138) Convert event handlers to typescript ([@RobbeDP](https://github.com/RobbeDP))
- [#136](https://github.com/lblod/ember-rdfa-editor/pull/136) various cleanup chores in the editor ([@nvdk](https://github.com/nvdk))
- [#137](https://github.com/lblod/ember-rdfa-editor/pull/137) Move paste handler to its own input handler ([@RobbeDP](https://github.com/RobbeDP))
- [#131](https://github.com/lblod/ember-rdfa-editor/pull/131) Refactor of table commands ([@RobbeDP](https://github.com/RobbeDP))

#### Committers: 4

- Arne Bertrand ([@abeforgit](https://github.com/abeforgit))
- Dieter Peirs ([@Dietr](https://github.com/Dietr))
- Niels V ([@nvdk](https://github.com/nvdk))
- Robbe De Proft ([@RobbeDP](https://github.com/RobbeDP))

## 0.46.2 (2021-07-16)

#### :bug: Bug Fix

- [#133](https://github.com/lblod/ember-rdfa-editor/pull/133) Make cursor move to correct position after deleting table ([@abeforgit](https://github.com/abeforgit))

#### Committers: 1

- Arne Bertrand ([@abeforgit](https://github.com/abeforgit))

## 0.46.1 (2021-07-13)

#### :bug: Bug Fix

- [#129](https://github.com/lblod/ember-rdfa-editor/pull/129) Remove table when last row or column gets removed ([@RobbeDP](https://github.com/RobbeDP))

#### :house: Internal

- [#128](https://github.com/lblod/ember-rdfa-editor/pull/128) Table column and row commands testing ([@RobbeDP](https://github.com/RobbeDP))
- [#124](https://github.com/lblod/ember-rdfa-editor/pull/124) move the dispatcher service inside the editor addon ([@nvdk](https://github.com/nvdk))

#### Committers: 2

- Niels V ([@nvdk](https://github.com/nvdk))
- Robbe De Proft ([@RobbeDP](https://github.com/RobbeDP))

## 0.46.0 (2021-07-12)

#### :rocket: Enhancement

- [#130](https://github.com/lblod/ember-rdfa-editor/pull/130) Feature/event bus ([@abeforgit](https://github.com/abeforgit))

#### :bug: Bug Fix

- [#130](https://github.com/lblod/ember-rdfa-editor/pull/130) Feature/event bus ([@abeforgit](https://github.com/abeforgit))

#### :house: Internal

- [#127](https://github.com/lblod/ember-rdfa-editor/pull/127) Changes to getFromSelection methods in ModelTable ([@RobbeDP](https://github.com/RobbeDP))
- [#126](https://github.com/lblod/ember-rdfa-editor/pull/126) Commands testing + implementation xml table reader ([@RobbeDP](https://github.com/RobbeDP))

#### Committers: 2

- Arne Bertrand ([@abeforgit](https://github.com/abeforgit))
- Robbe De Proft ([@RobbeDP](https://github.com/RobbeDP))

## 0.45.0 (2021-07-01)

## 0.45.0-0 (2021-07-01)

#### :rocket: Enhancement

- [#119](https://github.com/lblod/ember-rdfa-editor/pull/119) Feature/logging ([@abeforgit](https://github.com/abeforgit))

#### :bug: Bug Fix

- [#123](https://github.com/lblod/ember-rdfa-editor/pull/123) Bugfix/space eats chars ([@abeforgit](https://github.com/abeforgit))

#### :house: Internal

- [#125](https://github.com/lblod/ember-rdfa-editor/pull/125) Add lerna changelog config ([@abeforgit](https://github.com/abeforgit))
- [#120](https://github.com/lblod/ember-rdfa-editor/pull/120) Feature/vendor environment ([@abeforgit](https://github.com/abeforgit))
- [#122](https://github.com/lblod/ember-rdfa-editor/pull/122) Feature/custom dummy data ([@abeforgit](https://github.com/abeforgit))
- [#121](https://github.com/lblod/ember-rdfa-editor/pull/121) Feature/better command logging ([@abeforgit](https://github.com/abeforgit))
- [#118](https://github.com/lblod/ember-rdfa-editor/pull/118) Bump ember-cli-typescript to latest ([@abeforgit](https://github.com/abeforgit))

#### Committers: 1

- Arne Bertrand ([@abeforgit](https://github.com/abeforgit))

[unreleased]: https://github.com/lblod/ember-rdfa-editor/compare/v5.2.0...HEAD
[5.2.0]: https://github.com/lblod/ember-rdfa-editor/compare/v5.1.0...v5.2.0
[5.1.0]: https://github.com/lblod/ember-rdfa-editor/compare/v5.0.0...v5.1.0
[5.0.0]: https://github.com/lblod/ember-rdfa-editor/compare/v4.2.0...v5.0.0
[4.2.0]: https://github.com/lblod/ember-rdfa-editor/compare/v4.1.1...v4.2.0
[4.1.0]: https://github.com/lblod/ember-rdfa-editor/compare/v4.0.0...v4.1.0
[4.0.0]: https://github.com/lblod/ember-rdfa-editor/compare/v3.10.0...v4.0.0
[3.10.0]: https://github.com/lblod/ember-rdfa-editor/compare/v3.9.0...v3.10.0
[3.9.0]: https://github.com/lblod/ember-rdfa-editor/compare/v3.8.1...v3.9.0
[3.8.1]: https://github.com/lblod/ember-rdfa-editor/compare/v3.8.0...v3.8.1
[3.8.0]: https://github.com/lblod/ember-rdfa-editor/compare/v3.7.2...v3.8.0
[3.7.2]: https://github.com/lblod/ember-rdfa-editor/compare/v3.7.1...v3.7.2
[3.7.1]: https://github.com/lblod/ember-rdfa-editor/compare/v3.7.0...v3.7.1
[3.7.0]: https://github.com/lblod/ember-rdfa-editor/compare/v3.6.0...v3.7.0
[3.6.0]: https://github.com/lblod/ember-rdfa-editor/compare/v3.5.0...v3.6.0
[3.5.0]: https://github.com/lblod/ember-rdfa-editor/compare/v3.4.1...v3.5.0
[3.4.1]: https://github.com/lblod/ember-rdfa-editor/compare/v3.4.0...v3.4.1
[3.4.0]: https://github.com/lblod/ember-rdfa-editor/compare/v3.3.0...v3.4.0
[3.3.0]: https://github.com/lblod/ember-rdfa-editor/compare/v3.2.1...v3.3.0
[3.2.1]: https://github.com/lblod/ember-rdfa-editor/compare/v3.2.0...v3.2.1
[3.2.0]: https://github.com/lblod/ember-rdfa-editor/compare/v3.1.0...v3.2.0
[3.1.0]: https://github.com/lblod/ember-rdfa-editor/compare/v3.0.0...v3.1.0
[3.0.0]: https://github.com/lblod/ember-rdfa-editor/compare/v2.1.4...v3.0.0
[2.1.4]: https://github.com/lblod/ember-rdfa-editor/compare/v2.1.3...v2.1.4
[2.1.3]: https://github.com/lblod/ember-rdfa-editor/compare/v2.1.2...v2.1.3
[2.1.2]: https://github.com/lblod/ember-rdfa-editor/compare/v2.1.1...v2.1.2
[2.1.1]: https://github.com/lblod/ember-rdfa-editor/compare/v2.1.0...v2.1.1
[2.1.0]: https://github.com/lblod/ember-rdfa-editor/compare/v2.0.1...v2.1.0
[2.0.1]: https://github.com/lblod/ember-rdfa-editor/compare/v2.0.0...v2.0.1
[2.0.0]: https://github.com/lblod/ember-rdfa-editor/compare/v1.1.0...v2.0.0
[1.1.0]: https://github.com/lblod/ember-rdfa-editor/compare/v1.0.0...v1.1.0
