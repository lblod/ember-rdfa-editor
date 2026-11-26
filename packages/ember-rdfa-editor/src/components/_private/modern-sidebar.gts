import Component from '@glimmer/component';
import type SayController from '#root/core/say-controller.ts';
import EditorTabs, {
  type EditorTab,
  type TabPanelPlacement,
} from '../editor-tabs.gts';

export type SidebarPlacement = 'left' | 'right';

export type ModernSidebarSignature = {
  Args: {
    controller: SayController;
    tabs: EditorTab[];
    /** @default 'right' */
    panelPlacement?: Extract<TabPanelPlacement, 'left' | 'right'>;
  };
  Element: HTMLDivElement;
};

export default class ModernSidebar extends Component<ModernSidebarSignature> {
  get panelPlacement(): TabPanelPlacement {
    return this.args.panelPlacement ?? 'right';
  }

  <template>
    <div class="say-sidebar" ...attributes>
      <EditorTabs
        @controller={{@controller}}
        @tabs={{@tabs}}
        @panelPlacement={{this.panelPlacement}}
      />
    </div>
  </template>
}
