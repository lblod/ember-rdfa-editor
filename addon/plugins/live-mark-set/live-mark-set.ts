import Controller from '@lblod/ember-rdfa-editor/core/controllers/controller';
import { EditorPlugin } from '@lblod/ember-rdfa-editor/core/model/editor-plugin';
import { MarkSpec } from '@lblod/ember-rdfa-editor/core/model/marks/mark';
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
  initialize(transaction: Transaction, controller: Controller): Promise<void> {
    this.controller = controller;
    transaction.addTransactionStepListener(this.onTransactionUpdate);
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

  willDestroy(transaction: Transaction): Promise<void> {
    transaction.removeTransactionStepListener(this.onTransactionUpdate);
    return Promise.resolve();
  }

  addRule(rule: LiveMarkRule) {
    this.rules.add(rule);
  }

  removeRule(rule: LiveMarkRule) {
    this.rules.delete(rule);
  }

  onTransactionUpdate = (transaction: Transaction, steps: Step[]) => {
    if (modifiesContent(steps)) {
      this.updateMarks(transaction);
    }
  };

  updateMarks(transaction: Transaction) {
    this.removeExistingMarks(transaction);
    for (const rule of this.rules) {
      this.updateMarksByRule(transaction, rule);
    }
  }

  private updateMarksByRule(transaction: Transaction, rule: LiveMarkRule) {
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

  private removeExistingMarks(transaction: Transaction) {
    const manager = transaction.getMarksManager();
    const markInstances = manager.getMarksByOwner(this.name);
    for (const instance of markInstances) {
      transaction.removeMark(
        ModelRange.fromAroundNode(instance.node),
        instance.mark.spec,
        instance.mark.attributes
      );
    }
  }
}
