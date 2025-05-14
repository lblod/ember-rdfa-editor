import type { TemplateOnlyComponent } from '@ember/component/template-only';

interface Sig {
  Element: HTMLElement;
}

const ToolbarDivider: TemplateOnlyComponent<Sig> = <template>
  <div class="say-toolbar__divider" ...attributes />
</template>;

export default ToolbarDivider;
