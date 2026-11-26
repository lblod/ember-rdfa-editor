import type { TOC } from '@ember/component/template-only';
import LegacySidebar, {
  type LegacySidebarSignature,
} from './_private/legacy-sidebar.gts';
import ModernSidebar, {
  type ModernSidebarSignature,
  type SidebarPlacement,
} from './_private/modern-sidebar.gts';

export type { SidebarPlacement };

type SidebarArgs =
  | (ModernSidebarSignature['Args'] & { useNew: true })
  | { useNew?: false; controller?: never; tabs?: never; placement?: never };

export type SidebarSignature<A extends SidebarArgs = SidebarArgs> = {
  Args: A;
  Element: A extends { useNew: true }
    ? ModernSidebarSignature['Element']
    : LegacySidebarSignature['Element'];
  Blocks: A extends { useNew: true } ? never : LegacySidebarSignature['Blocks'];
};

const Sidebar: TOC<SidebarSignature> = <template>
  {{#if @useNew}}
    <ModernSidebar
      @controller={{@controller}}
      @tabs={{@tabs}}
      @panelPlacement={{@panelPlacement}}
      ...attributes
    />
  {{else}}
    <LegacySidebar ...attributes as |legacy|>
      {{yield legacy}}
    </LegacySidebar>
  {{/if}}
</template>;

export default Sidebar;
