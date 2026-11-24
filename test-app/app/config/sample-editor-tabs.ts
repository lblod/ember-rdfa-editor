import { AlertTriangleIcon } from '@appuniversum/ember-appuniversum/components/icons/alert-triangle';
import { HtmlIcon } from '@appuniversum/ember-appuniversum/components/icons/html';
import { LabelIcon } from '@appuniversum/ember-appuniversum/components/icons/label';
import { PaperclipIcon } from '@appuniversum/ember-appuniversum/components/icons/paperclip';
import { PlusIcon } from '@appuniversum/ember-appuniversum/components/icons/plus';
import { SettingsIcon } from '@appuniversum/ember-appuniversum/components/icons/settings';
import type { EditorTab } from '@lblod/ember-rdfa-editor/components/editor-tabs';
import EmptyPane from 'test-app/components/sample-ember-nodes/empty-pane';
import InsertPane from 'test-app/components/sample-ember-nodes/insert-pane';
import { devToolsTab } from '@lblod/ember-rdfa-editor/plugins/dev-tools/tab';

const sampleEditorTabs: EditorTab[] = [
  {
    title: 'Add an element to the document',
    icon: PlusIcon,
    panelContent: InsertPane,
  },
  {
    title: 'Document information',
    icon: LabelIcon,
    panelContent: EmptyPane,
  },
  {
    title: 'Validation',
    icon: AlertTriangleIcon,
    panelContent: EmptyPane,
    badge: (controller) => ({
      number: controller.activeEditorState.selection.from,
      skin: 'warning',
    }),
  },
  {
    title: 'Attachments',
    icon: PaperclipIcon,
    panelContent: EmptyPane,
  },
  devToolsTab,

  {
    title: 'Editor settings',
    icon: SettingsIcon,
    panelContent: EmptyPane,
  },
];

export default sampleEditorTabs;
