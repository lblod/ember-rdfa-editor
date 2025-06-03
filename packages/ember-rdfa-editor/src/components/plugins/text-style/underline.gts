import { UnderlinedIcon } from '@appuniversum/ember-appuniversum/components/icons/underlined';
import Mark from '#root/components/toolbar/mark.gts';
import t from 'ember-intl/helpers/t';
import type SayController from '#root/core/say-controller.ts';
import type { TOC } from '@ember/component/template-only';

type Signature = {
  Args: {
    controller?: SayController;
  };
};

const Underline: TOC<Signature> = <template>
  <Mark
    @icon={{UnderlinedIcon}}
    @title={{t "ember-rdfa-editor.underline"}}
    @mark="underline"
    @controller={{@controller}}
  />
</template>;

export default Underline;
