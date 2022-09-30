import Controller from '@lblod/ember-rdfa-editor/core/controllers/controller';
import { EditorPlugin } from '@lblod/ember-rdfa-editor/core/model/editor-plugin';
import { MarkSpec } from '@lblod/ember-rdfa-editor/core/model/marks/mark';
import MarksManager from '@lblod/ember-rdfa-editor/core/model/marks/marks-manager';
import ModelRange from '@lblod/ember-rdfa-editor/core/model/model-range';
import {
  modifiesContent,
  Step,
} from '@lblod/ember-rdfa-editor/core/state/steps/step';
import Transaction from '@lblod/ember-rdfa-editor/core/state/transaction';
import Datastore from '@lblod/ember-rdfa-editor/utils/datastore/datastore';
import { ModelError } from '@lblod/ember-rdfa-editor/utils/errors';
import { TextMatch } from '@lblod/ember-rdfa-editor/utils/match-text';
import { AttributeSpec } from '@lblod/ember-rdfa-editor/utils/render-spec';
import LiveMarkRuleCommand from './commands/live-mark-rule-command';

export type LiveMarkSpec =
  | string
  | {
      name: string;
      attributesBuilder?: (textMatch: TextMatch) => AttributeSpec;
    };

export type LiveMarkRule = {
  matcher: (datastore: Datastore) => TextMatch[];
  liveSpecs: LiveMarkSpec[];
};

export default class LiveMarkSetPlugin implements EditorPlugin {
  controller!: Controller;
  rules: Set<LiveMarkRule> = new Set();

  get name(): string {
    return 'live-mark-set';
  }
  initialize(controller: Controller): Promise<void> {
    this.controller = controller;
    controller.addTransactionStepListener(this.onTransactionUpdate.bind(this));
    this.controller.perform((tr) => {
      tr.registerCommand(
        'addLiveMarkRule',
        new LiveMarkRuleCommand(this, false)
      );
      tr.registerCommand(
        'removeLiveMarkRule',
        new LiveMarkRuleCommand(this, true)
      );
    });
    return Promise.resolve();
  }

  addRule(rule: LiveMarkRule) {
    this.rules.add(rule);
  }

  removeRule(rule: LiveMarkRule) {
    this.rules.delete(rule);
  }

  onTransactionUpdate(transaction: Transaction, steps: Step[]) {
    if (modifiesContent(steps)) {
      this.updateMarks(transaction);
    }
  }

  updateMarks(transaction: Transaction) {
    const manager = transaction.getMarksManager();
    this._removeExistingMarks(transaction, manager);
    for (const rule of this.rules) {
      this._updateMarksByRule(transaction, rule);
    }
  }

  _updateMarksByRule(transaction: Transaction, rule: LiveMarkRule) {
    const newMatches = rule.matcher(transaction.getCurrentDataStore());
    for (const liveSpec of rule.liveSpecs) {
      for (const match of newMatches) {
        const range = match.range;
        let attributes: AttributeSpec = { setBy: this.controller.name };
        let markSpec: MarkSpec | null;
        if (typeof liveSpec === 'string') {
          markSpec = transaction.workingCopy.marksRegistry.lookupMark(liveSpec);
        } else {
          markSpec = transaction.workingCopy.marksRegistry.lookupMark(
            liveSpec.name
          );
          if (liveSpec.attributesBuilder) {
            attributes = liveSpec.attributesBuilder(match);
          }
        }

        if (markSpec) {
          transaction.addMark(range, markSpec, attributes);
        } else {
          throw new ModelError(`Unrecognized mark: ${liveSpec.toString()}`);
        }
      }
    }
  }

  _removeExistingMarks(transaction: Transaction, manager: MarksManager) {
    const markInstances = manager.getMarksByOwner(this.controller.name);
    for (const instance of markInstances) {
      transaction.removeMark(
        ModelRange.fromAroundNode(instance.node),
        instance.mark.spec,
        instance.mark.attributes
      );
    }
  }
}
