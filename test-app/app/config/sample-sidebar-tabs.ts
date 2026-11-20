import { AlertTriangleIcon } from '@appuniversum/ember-appuniversum/components/icons/alert-triangle';
import { HtmlIcon } from '@appuniversum/ember-appuniversum/components/icons/html';
import { LabelIcon } from '@appuniversum/ember-appuniversum/components/icons/label';
import { PaperclipIcon } from '@appuniversum/ember-appuniversum/components/icons/paperclip';
import { PlusIcon } from '@appuniversum/ember-appuniversum/components/icons/plus';
import { SettingsIcon } from '@appuniversum/ember-appuniversum/components/icons/settings';
import type { ModernSidebarTab } from '@lblod/ember-rdfa-editor';
import EmptyPane from 'test-app/components/sample-ember-nodes/empty-pane';
import InsertPane from 'test-app/components/sample-ember-nodes/insert-pane';

const sampleSidebarTabs: ModernSidebarTab[] = [
  {
    title: 'Add an element to the document',
    icon: PlusIcon,
    paneContent: InsertPane,
  },
  {
    title: 'Document information',
    icon: LabelIcon,
    paneContent: EmptyPane,
  },
  {
    title: 'Validation',
    icon: AlertTriangleIcon,
    paneContent: EmptyPane,
    badge: (controller) => ({
      number: controller.activeEditorState.selection.from,
      skin: 'warning',
    }),
  },
  {
    title: 'Attachments',
    icon: PaperclipIcon,
    paneContent: EmptyPane,
  },
  {
    title: 'Dev tools',
    icon: HtmlIcon,
    paneContent: EmptyPane,
  },
  {
    title: 'Editor settings',
    icon: SettingsIcon,
    paneContent: EmptyPane,
  },
];

export default sampleSidebarTabs;
