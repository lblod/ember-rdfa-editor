import { SubscriptIcon } from '@appuniversum/ember-appuniversum/components/icons/subscript';
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

const SubscriptMark: TOC<Signature> = <template>
  <Mark
    @icon={{SubscriptIcon}}
    @title={{t "ember-rdfa-editor.subscript"}}
    @mark="subscript"
    @controller={{@controller}}
    @onActivate={{@onActivate}}
  />
</template>;

export default SubscriptMark;
