import type { TOC } from '@ember/component/template-only';
import type { SayController } from '@lblod/ember-rdfa-editor';

type Signature = {
  Args: {
    controller: SayController;
  };
};

const SampleEmberNodesEmptyPane: TOC<Signature> = <template></template>;

export default SampleEmberNodesEmptyPane;
