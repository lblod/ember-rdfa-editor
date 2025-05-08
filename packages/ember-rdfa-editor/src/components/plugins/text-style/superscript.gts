import { SuperscriptIcon } from '@appuniversum/ember-appuniversum/components/icons/superscript';
import Mark from '#root/components/toolbar/mark.gts';
import t from 'ember-intl/helpers/t';
import type SayController from '#root/core/say-controller.ts';
import type { TOC } from '@ember/component/template-only';

type Signature = {
  Args: {
    controller?: SayController;
  };
};

const Superscript: TOC<Signature> = <template>
  <Mark
    @icon={{SuperscriptIcon}}
    @title={{t "ember-rdfa-editor.superscript"}}
    @mark="superscript"
    @controller={{@controller}}
  />
</template>;

export default Superscript;
