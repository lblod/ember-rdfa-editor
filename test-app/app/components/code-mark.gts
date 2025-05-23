import type { TOC } from '@ember/component/template-only';
import type { SayController } from '@lblod/ember-rdfa-editor';
import ToolbarMark from '@lblod/ember-rdfa-editor/components/toolbar/mark';
import { HtmlIcon } from '@appuniversum/ember-appuniversum/components/icons/html';

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
