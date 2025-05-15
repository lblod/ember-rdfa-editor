import type { TOC } from '@ember/component/template-only';

type Signature = {
  Element: HTMLDivElement;
  Blocks: {
    default: [];
  };
};

const ToolbarGroup: TOC<Signature> = <template>
  <div class="say-toolbar__group" ...attributes>
    {{yield}}
  </div>
</template>;

export default ToolbarGroup;
