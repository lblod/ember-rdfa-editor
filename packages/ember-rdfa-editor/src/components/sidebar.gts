import type { TOC } from '@ember/component/template-only';
import Collapsible from './collapsible.gts';
import LegacySidebar from './_private/legacy-sidebar.gts';
import ModernSidebar, {
  type SidebarPlacement,
} from './_private/modern-sidebar.gts';
import type { EditorTab } from './editor-tabs.gts';
import type SayController from '#root/core/say-controller.ts';

export type { SidebarPlacement };

type SidebarSignature =
  | {
      Args: {
        useNew: true;
        controller: SayController;
        tabs: EditorTab[];
        /** @default 'left' */
        placement?: SidebarPlacement;
      };
      Blocks: {
        default?: [];
      };
      Element: HTMLDivElement;
    }
  | {
      Args: {
        useNew?: false;
        controller?: never;
        tabs?: never;
        placement?: never;
      };
      Blocks: {
        default: [
          {
            Collapsible: typeof Collapsible;
          },
        ];
      };
      Element: HTMLDivElement;
    };

const Sidebar: TOC<SidebarSignature> = <template>
  {{#if @useNew}}
    <ModernSidebar
      @controller={{@controller}}
      @tabs={{@tabs}}
      @placement={{@placement}}
      ...attributes
    />
  {{else}}
    <LegacySidebar ...attributes as |legacy|>
      {{yield legacy}}
    </LegacySidebar>
  {{/if}}
</template>;

export default Sidebar;
