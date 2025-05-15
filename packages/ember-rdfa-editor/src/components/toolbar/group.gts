import type { TemplateOnlyComponent } from '@ember/component/template-only';

interface Sig {
  Element: HTMLElement;
  Blocks: {
    default: [];
  };
}

const ToolbarGroup: TemplateOnlyComponent<Sig> = <template>
  <div class="say-toolbar__group" ...attributes>
    {{yield}}
  </div>
</template>;

export default ToolbarGroup;
