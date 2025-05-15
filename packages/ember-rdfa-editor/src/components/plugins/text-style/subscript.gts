import { SubscriptIcon } from '@appuniversum/ember-appuniversum/components/icons/subscript';
import Mark from '#root/components/toolbar/mark.gts';
import t from 'ember-intl/helpers/t';
import type SayController from '#root/core/say-controller.ts';
import type { TOC } from '@ember/component/template-only';

type Signature = {
  Args: {
    controller?: SayController;
  };
};

const Subscript: TOC<Signature> = <template>
  <Mark
    @icon={{SubscriptIcon}}
    @title={{t "ember-rdfa-editor.subscript"}}
    @mark="subscript"
    @controller={{@controller}}
  />
</template>;

export default Subscript;
