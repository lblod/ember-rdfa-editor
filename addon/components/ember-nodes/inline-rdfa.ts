import { action } from '@ember/object';
import Component from '@glimmer/component';
import { EmberNodeArgs } from '@lblod/ember-rdfa-editor/utils/ember-node';

interface InlineRdfaNodeAttrs {
  __tag: string;
}

export default class InlineRdfa extends Component<EmberNodeArgs> {
  get nodeAttrs(): InlineRdfaNodeAttrs {
    return this.args.node.attrs as InlineRdfaNodeAttrs;
  }

  get tag() {
    return this.nodeAttrs.__tag;
  }

  get controller() {
    return this.args.controller;
  }
}
