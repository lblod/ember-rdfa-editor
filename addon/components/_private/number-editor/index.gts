import { type TemplateOnlyComponent } from '@ember/component/template-only';

interface Sig {
  Element: HTMLInputElement;
}

const NumberEditor: TemplateOnlyComponent<Sig> = <template>
  <input type='number' class='au-c-input' ...attributes />
</template>;

export default NumberEditor;
