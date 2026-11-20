import Component from '@glimmer/component';
import type SayController from '#root/core/say-controller.ts';
import EditorTabs, {
  type EditorTab,
  type TabPanelPlacement,
} from '#root/components/editor-tabs.gts';

export type SidebarPlacement = 'left' | 'right';

type SidebarSignature = {
  Args: {
    controller: SayController;
    tabs: EditorTab[];
    /** @default 'left' */
    placement?: SidebarPlacement;
  };
  Element: HTMLDivElement;
};

export default class Sidebar extends Component<SidebarSignature> {
  get placement(): SidebarPlacement {
    return this.args.placement ?? 'left';
  }

  get panelPlacement(): TabPanelPlacement {
    return this.placement === 'left' ? 'right' : 'left';
  }

  <template>
    <div class="say-sidebar say-sidebar--{{this.placement}}" ...attributes>
      <EditorTabs
        @controller={{@controller}}
        @tabs={{@tabs}}
        @panelPlacement={{this.panelPlacement}}
      />
    </div>
  </template>
}
