import type { TOC } from '@ember/component/template-only';
import { hash } from '@ember/helper';
import Collapsible from './collapsible.gts';

type SidebarSignature = {
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
  <div class="say-editor-hints">
    <ul class="say-editor-hints__list">
      {{yield (hash Collapsible=Collapsible)}}
    </ul>
  </div>
</template>;

export default Sidebar;
