import { action } from '@ember/object';
import Component from '@glimmer/component';
import { Command, SayController, Transaction } from '@lblod/ember-rdfa-editor';
import { wrapSelection } from '@lblod/ember-rdfa-editor/commands/wrap-selection';
import { ResolvedPNode } from '@lblod/ember-rdfa-editor/plugins/datastore';
import { wrapIn } from 'prosemirror-commands';
interface Args {
  node: ResolvedPNode;
  controller: SayController;
}
interface AnnotateArgs {
  transaction?: Transaction;
}
function annotateCommand(args: AnnotateArgs): Command {
  return function (state, dispatch, view): boolean {

    const { $from, $to } = state.selection;
    if (!$from.sameParent($to)) {
      return false;
    }

    return wrapSelection(state.schema.nodes['inline_rdfa'])(state, dispatch, view);
  };
}
export default class Annotator extends Component<Args> {
  get controller(): SayController {
    return this.args.controller;
  }
  get node(): ResolvedPNode {
    return this.args.node;
  }
  get active(): boolean {
    return this.controller.checkCommand(annotateCommand({}));
  }

  @action
  annotate(): void {
    this.controller.doCommand(annotateCommand({}));
  }
}
