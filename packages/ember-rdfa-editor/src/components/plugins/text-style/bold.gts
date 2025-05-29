import { BoldIcon } from '@appuniversum/ember-appuniversum/components/icons/bold';
import Mark from '#root/components/toolbar/mark.ts';
import t from 'ember-intl/helpers/t';
import type SayController from '#root/core/say-controller.js';
import type { TOC } from '@ember/component/template-only';

type Signature = {
  Args: {
    controller: SayController;
    onActivate?: () => void;
  };
};
const BoldMark: TOC<Signature> = <template>
  <Mark
    @icon={{BoldIcon}}
    @title={{t "ember-rdfa-editor.bold"}}
    @mark="strong"
    @controller={{@controller}}
    @onActivate={{@onActivate}}
  />
</template>;

export default BoldMark;
