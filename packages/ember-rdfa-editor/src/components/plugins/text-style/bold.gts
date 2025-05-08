import { BoldIcon } from '@appuniversum/ember-appuniversum/components/icons/bold';
import Mark from '#root/components/toolbar/mark.gts';
import t from 'ember-intl/helpers/t';
import type SayController from '#root/core/say-controller.ts';
import type { TOC } from '@ember/component/template-only';

type Signature = {
  Args: {
    controller?: SayController;
  };
};
const Bold: TOC<Signature> = <template>
  <Mark
    @icon={{BoldIcon}}
    @title={{t "ember-rdfa-editor.bold"}}
    @mark="strong"
    @controller={{@controller}}
  />
</template>;

export default Bold;
