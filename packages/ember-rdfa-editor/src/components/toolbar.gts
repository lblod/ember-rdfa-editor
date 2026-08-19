import { hash } from '@ember/helper';
import ToolbarGroup from './toolbar/group.gts';
import ToolbarSpacer from './toolbar/spacer.gts';
import ToolbarDivider from './toolbar/divider.gts';
import type { TOC } from '@ember/component/template-only';

type Sig = {
  Blocks: {
    default: [
      {
        Group: typeof ToolbarGroup;
        Spacer: typeof ToolbarSpacer;
        Divider: typeof ToolbarDivider;
      },
    ];
  };
};
const Toolbar: TOC<Sig> = <template>
  <div class="say-toolbar">
    {{yield
      (hash Group=ToolbarGroup Spacer=ToolbarSpacer Divider=ToolbarDivider)
    }}
  </div>
</template>;

export default Toolbar;
