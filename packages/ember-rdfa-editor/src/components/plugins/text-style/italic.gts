import { ItalicIcon } from '@appuniversum/ember-appuniversum/components/icons/italic';
import Mark from '#root/components/toolbar/mark.gts';
import t from 'ember-intl/helpers/t';
import type { TOC } from '@ember/component/template-only';
import type SayController from '#root/core/say-controller.ts';

type Signature = {
  Args: {
    controller?: SayController;
  };
};

const Italic: TOC<Signature> = <template>
  <Mark
    @icon={{ItalicIcon}}
    @title={{t "ember-rdfa-editor.italic"}}
    @mark="em"
    @controller={{@controller}}
  />
</template>;

export default Italic;
