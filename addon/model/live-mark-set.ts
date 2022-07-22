import Datastore from '@lblod/ember-rdfa-editor/model/util/datastore/datastore';
import Controller from '@lblod/ember-rdfa-editor/model/controller';
import EventBus, {
  AnyEventName,
  EditorEventListener,
  ListenerConfig,
} from '@lblod/ember-rdfa-editor/utils/event-bus';
import { ModelError } from '@lblod/ember-rdfa-editor/utils/errors';
import { TextMatch } from '@lblod/ember-rdfa-editor/utils/match-text';
import { AttributeSpec } from './util/render-spec';
import Transaction from '../core/transaction';
import Operation from './operations/operation';
import MarkOperation from './operations/mark-operation';

export type LiveMarkSpec =
  | string
  | {
      name: string;
      attributesBuilder?: (textMatch: TextMatch) => AttributeSpec;
    };

export interface LiveMarkSetArgs {
  datastoreQuery: (datastore: Datastore) => TextMatch[];
  liveMarkSpecs: LiveMarkSpec[];
}

export interface TextMatchDiff {
  matchesToRemove: Set<TextMatch>;
  matchesToAdd: Set<TextMatch>;
}

export default class LiveMarkSet {
  private _controller: Controller;
  private _datastoreQuery: (datastore: Datastore) => TextMatch[];
  private _privateBus: EventBus;
  private _liveMarkSpecs: LiveMarkSpec[];
  private _activeMatches: Map<string, TextMatch>;

  constructor(
    controller: Controller,
    { datastoreQuery, liveMarkSpecs }: LiveMarkSetArgs
  ) {
    this._controller = controller;
    this._datastoreQuery = datastoreQuery;
    this._privateBus = new EventBus();
    this._controller.addTransactionListener(this.update, {
      filter: 'content-operation',
    });
    this._liveMarkSpecs = liveMarkSpecs;
    this._activeMatches = new Map<string, TextMatch>();
  }

  get controller(): Controller {
    return this._controller;
  }

  get datastoreQuery(): (datastore: Datastore) => TextMatch[] {
    return this._datastoreQuery;
  }

  get liveMarkSpecs(): LiveMarkSpec[] {
    return this._liveMarkSpecs;
  }

  private update = (transaction: Transaction, operation: Operation) => {
    const marksRegistry = transaction.workingCopy.marksRegistry;
    if (operation instanceof MarkOperation) {
      const liveMarkSpecNames = this.liveMarkSpecs.map((spec) =>
        typeof spec === 'string' ? spec : spec.name
      );
      if (liveMarkSpecNames.includes(operation.spec.name)) {
        return;
      }
    }
    console.log('LIVE MARK UPDATE');
    const { matchesToAdd, matchesToRemove } = this.calculateRanges(
      transaction.getCurrentDataStore()
    );

    for (const match of matchesToRemove) {
      // Conservative check which determines if range in its current form still exists
      // TODO: The range should ideally be mapped to a correct new range which does exist
      match.range.start.invalidateParentCache();
      match.range.end.invalidateParentCache();
      if (match.range.start.parent && match.range.end.parent) {
        for (const liveSpec of this.liveMarkSpecs) {
          let markSpec;
          if (typeof liveSpec === 'string') {
            markSpec = marksRegistry.lookupMark(liveSpec);
          } else {
            markSpec = marksRegistry.lookupMark(liveSpec.name);
          }
          if (markSpec) {
            // TODO this is a hack to workaround the current awkwardness of removing marks
            // needs a rethink
            transaction.removeMark(match.range, markSpec, {
              setBy: this.controller.name,
            });
          } else {
            throw new ModelError(`Unrecognized mark: ${liveSpec.toString()}`);
          }
        }
      }
      this._activeMatches.delete(match.range.toString());
    }
    for (const match of matchesToAdd) {
      for (const liveSpec of this.liveMarkSpecs) {
        let attributes: AttributeSpec = { setBy: this.controller.name };
        let markSpec;
        if (typeof liveSpec === 'string') {
          markSpec = marksRegistry.lookupMark(liveSpec);
        } else {
          markSpec = marksRegistry.lookupMark(liveSpec.name);
          if (liveSpec.attributesBuilder) {
            attributes = liveSpec.attributesBuilder(match);
          }
        }
        if (markSpec) {
          transaction.addMark(match.range, markSpec, attributes);
        } else {
          throw new ModelError(`Unrecognized mark: ${liveSpec.toString()}`);
        }
      }
      this._activeMatches.set(match.range.toString(), match);
    }
    // this.controller.selection.selectRange(mutator.mapRange(currentRange));
    // this.controller.write();
  };

  calculateRanges(datastore: Datastore): TextMatchDiff {
    const newMatches = this.datastoreQuery(datastore);

    return {
      matchesToAdd: new Set(newMatches),
      matchesToRemove: new Set(this._activeMatches.values()),
    };
  }

  onEvent<E extends AnyEventName>(
    eventName: E,
    callback: EditorEventListener<E>,
    config: ListenerConfig = {}
  ): void {
    return this._privateBus.on(eventName, callback, config);
  }

  offEvent<E extends AnyEventName>(
    eventName: E,
    callback: EditorEventListener<E>,
    config?: ListenerConfig
  ): void {
    this._privateBus.off(eventName, callback, config);
  }

  destroy() {
    this.controller.removeTransactionListener(this.update);
  }
}
