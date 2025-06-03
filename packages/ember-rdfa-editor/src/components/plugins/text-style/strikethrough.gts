import { StrikethroughIcon } from '@appuniversum/ember-appuniversum/components/icons/strikethrough';
import Mark from '#root/components/toolbar/mark.gts';
import t from 'ember-intl/helpers/t';
import type SayController from '#root/core/say-controller.ts';
import type { TOC } from '@ember/component/template-only';

type Signature = {
  Args: {
    controller?: SayController;
  };
};

const Strikethrough: TOC<Signature> = <template>
  <Mark
    @icon={{StrikethroughIcon}}
    @title={{t "ember-rdfa-editor.strikethrough"}}
    @mark="strikethrough"
    @controller={{@controller}}
  />
</template>;

export default Strikethrough;
