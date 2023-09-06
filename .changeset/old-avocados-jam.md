---
'@lblod/ember-rdfa-editor': major
---

Add Embroider "optimized" support

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
