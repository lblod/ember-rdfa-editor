import { ItalicIcon } from '@appuniversum/ember-appuniversum/components/icons/italic';
import Mark from '#root/components/toolbar/mark.gts';
import t from 'ember-intl/helpers/t';
import type SayController from '#root/core/say-controller.ts';
import type { TOC } from '@ember/component/template-only';

type Signature = {
  Args: {
    controller: SayController;
    onActivate?: () => void;
  };
};

const ItalicMark: TOC<Signature> = <template>
  <Mark
    @icon={{ItalicIcon}}
    @title={{t "ember-rdfa-editor.italic"}}
    @mark="em"
    @controller={{@controller}}
    @onActivate={{@onActivate}}
  />
</template>;

export default ItalicMark;
