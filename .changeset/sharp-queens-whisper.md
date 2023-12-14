---
"@lblod/ember-rdfa-editor": minor
---

GN-4622: Introduce column resizing for tables

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
