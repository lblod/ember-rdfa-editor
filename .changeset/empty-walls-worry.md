---
'@lblod/ember-rdfa-editor': minor
---

Introduction of new tab-based sidebar UI.
To use the new sidebar UI, you should apply the following changes:
- You can position the `sidebar` component in either a `sidebarLeft` or `sidebarRight` named block inside the `editor-container` component.

**Changes to the `editor-container` component**
On the `editor-container` component, pass the opt-in `@useNewLayout={{true}}` argument. This ensures that the `editor-container` uses the new flex layout.

**Changes to the `sidebar` component**
Pass the opt-in `@useNew={{true}}` argument to the `sidebar` component.

When @useNew={{true}}, the `sidebar` component does not use the legacy `Collapsible` block API. Pass a `tabs` array instead.
An example of such a configuration can be found in https://github.com/lblod/ember-rdfa-editor/blob/3e01d332568a71724ee2f69dd41b6d02bf54ba06/test-app/app/config/sample-editor-tabs.ts


Additionally, the `sidebar` component also expects the following arguments:
- `controller: SayController`: will be passed to the different tabs/panels
- `placement?: SidebarPlacement`: position of the sidebar. Can be either 'left' or 'right'. Should be consistent with either the `sidebarLeft` or `sidebarRight` usage.

**The new `editor-tabs` component**
This component does the main work of rendering the tabs and active panel.
It expects the following arguments:
- `controller: SayController`
- `tabs: EditorTab[]`
- `panelPlacement: TabPanelPlacement` (`left`, `right`, or `bottom`)
  * If `left` or `right` the panel is positioned statically 
  * If `bottom` the panel is positioned absolutely (floating mode). Used when placed in the toolbar

You can use the `editor-tabs` component directly (e.g. when using it in the toolbar). See e.g. https://github.com/lblod/ember-rdfa-editor/blob/3e01d332568a71724ee2f69dd41b6d02bf54ba06/test-app/app/components/sample-toolbar-responsive.gts#L130-L136

Definition of the `EditorTab` type:
```ts
type EditorTab = {
  title: string;
  icon: AuIconSignature['Args']['icon'];
  panelContent: ComponentLike<{ Args: { controller: SayController } }>;
  badge?:
    | EditorTabBadge
    | ((controller: SayController) => EditorTabBadge | undefined);
};
```

The `modern-sidebar` page of the dummy application contains an example of a left sidebar.

All pages of the dummy application contain an example of the `editor-tabs` component positioned in the toolbar.