import { SuperscriptIcon } from '@appuniversum/ember-appuniversum/components/icons/superscript';
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

const SuperscriptMark: TOC<Signature> = <template>
  <Mark
    @icon={{SuperscriptIcon}}
    @title={{t "ember-rdfa-editor.superscript"}}
    @mark="superscript"
    @controller={{@controller}}
    @onActivate={{@onActivate}}
  />
</template>;

export default SuperscriptMark;
