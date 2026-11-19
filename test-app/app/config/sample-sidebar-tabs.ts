import { PlusIcon } from '@appuniversum/ember-appuniversum/components/icons/plus';
import type { ModernSidebarTab } from '@lblod/ember-rdfa-editor';
import InsertPane from 'test-app/components/sample-ember-nodes/insert-pane';

const sampleSidebarTabs: ModernSidebarTab[] = [
  {
    id: 'insert',
    title: 'Add an element to the document',
    icon: PlusIcon,
    paneContent: InsertPane,
  },
];

export default sampleSidebarTabs;
