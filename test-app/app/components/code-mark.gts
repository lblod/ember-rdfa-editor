import type { TOC } from '@ember/component/template-only';
import { SayController } from '@lblod/ember-rdfa-editor';
import SC2 from '@lblod/ember-rdfa-editor/core/say-controller';
import ToolbarMark from '@lblod/ember-rdfa-editor/components/toolbar/mark';
import { HtmlIcon } from '@appuniversum/ember-appuniversum/components/icons/html';

const c1: SayController = {} as unknown as SayController;

const f = (_s: SC2) => {};

f(c1);
type Signature = {
  Args: {
    controller?: SayController;
  };
};
const CodeMark: TOC<Signature> = <template>
  <ToolbarMark
    @icon={{HtmlIcon}}
    @title="Toggle code mark"
    @mark="code"
    @controller={{@controller}}
  />
</template>;

export default CodeMark;
