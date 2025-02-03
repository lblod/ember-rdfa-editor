---
'@lblod/ember-rdfa-editor': major
---

**Adjustments to the `@editorOptions` argument of the `editor-container` component**

The following (legacy) properties are no longer supported:
- `@editorOptions.showRdfaHover`
- `@editorOptions.showRdfa`
- `@editorOptions.showRdfaHighlight`
- `@editorOptions.editRdfa`

The following `@editorOptions` properties have been added:
- `@editorOptions.showSidebarLeft` (default: `true`)
- `@editorOptions.showSidebarRight` (default: `true`)

These options replace the `@hideSidebar` argument, which is no longer supported.
