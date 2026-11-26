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
    /** @default 'left' */
    placement?: SidebarPlacement;
  };
  Element: HTMLDivElement;
};

export default class ModernSidebar extends Component<ModernSidebarSignature> {
  get placement(): SidebarPlacement {
    return this.args.placement ?? 'left';
  }

  get panelPlacement(): TabPanelPlacement {
    return this.placement === 'left' ? 'right' : 'left';
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
