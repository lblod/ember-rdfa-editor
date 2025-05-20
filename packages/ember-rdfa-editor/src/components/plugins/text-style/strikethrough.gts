import { StrikethroughIcon } from '@appuniversum/ember-appuniversum/components/icons/strikethrough';
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

const StrikethroughMark: TOC<Signature> = <template>
  <Mark
    @icon={{StrikethroughIcon}}
    @title={{t "ember-rdfa-editor.strikethrough"}}
    @mark="strikethrough"
    @controller={{@controller}}
    @onActivate={{@onActivate}}
  />
</template>;

export default StrikethroughMark;
